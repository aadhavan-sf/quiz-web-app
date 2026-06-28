import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeRecording } from '../utils/api'
import { formatTime } from '../utils/quizUtils'

export type RecordingStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'unsupported'
  | 'permission-denied'

export interface UseSpeechRecognitionOptions {
  onDebug?: (message: string) => void
  /** Interview topic — improves Whisper accuracy for technical terms. */
  topic?: string
}

function pickRecorderMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }

  return null
}

function mergeTranscript(base: string, spoken: string): string {
  const left = base.trim()
  const right = spoken.trim()
  if (!left) return right
  if (!right) return left
  return `${left} ${right}`
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Could not read audio data'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read audio data'))
    reader.readAsDataURL(blob)
  })
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const onDebug = options.onDebug
  const topic = options.topic

  const log = useCallback(
    (message: string) => {
      onDebug?.(`${new Date().toLocaleTimeString()} — ${message}`)
    },
    [onDebug],
  )

  const [status, setStatus] = useState<RecordingStatus>(() => {
    if (typeof window === 'undefined') return 'unsupported'
    if (!navigator.mediaDevices?.getUserMedia || !pickRecorderMimeType()) return 'unsupported'
    return 'idle'
  })
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [recordingHint, setRecordingHint] = useState('')

  const baseTextRef = useRef('')
  const mimeTypeRef = useRef<string>('audio/webm')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const releaseStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }, [])

  const startRecording = useCallback(
    async (existingText = '') => {
      if (status === 'recording' || status === 'transcribing' || status === 'unsupported') return

      const mimeType = pickRecorderMimeType()
      if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        setError('Audio recording is not supported in this browser.')
        return
      }

      setError(null)
      baseTextRef.current = existingText.trim()
      chunksRef.current = []
      mimeTypeRef.current = mimeType

      try {
        log('requesting microphone')
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        mediaStreamRef.current = stream
        log('microphone ready')
      } catch {
        setStatus('permission-denied')
        setError('Microphone permission denied. Allow mic access for this site.')
        return
      }

      const recorderOptions: MediaRecorderOptions = { mimeType }
      if (mimeType.includes('webm') || mimeType.includes('opus')) {
        recorderOptions.audioBitsPerSecond = 128_000
      }

      const recorder = new MediaRecorder(mediaStreamRef.current!, recorderOptions)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        setError('Recording failed. Try again.')
        setStatus('idle')
        clearTimer()
        releaseStream()
      }

      recorder.start(100)
      setStatus('recording')
      setRecordingHint('Speak slowly and clearly. Pause between points.')
      startedAtRef.current = Date.now()
      setElapsedSeconds(0)
      log(`recording started (${mimeType})`)

      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000))
        }
      }, 1000)
    },
    [clearTimer, log, releaseStream, status],
  )

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const finish = (text: string) => {
        clearTimer()
        releaseStream()
        setRecordingHint('')
        setStatus('idle')
        resolve(text)
      }

      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        finish(baseTextRef.current)
        return
      }

      recorder.onstop = () => {
        void (async () => {
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
          chunksRef.current = []
          mediaRecorderRef.current = null

          log(`audio captured (${Math.round(blob.size / 1024)} KB)`)

          if (blob.size < 1000) {
            setError('Recording too short. Speak for at least one second.')
            finish(baseTextRef.current)
            return
          }

          setStatus('transcribing')
          setRecordingHint('Transcribing with Groq Whisper…')
          log('sending audio to server')

          try {
            const audioBase64 = await blobToBase64(blob)
            const { text } = await transcribeRecording(audioBase64, mimeTypeRef.current, topic)
            const finalText = mergeTranscript(baseTextRef.current, text)
            log(`transcription complete (${text.length} chars)`)
            finish(finalText)
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Transcription failed'
            setError(message)
            log(`transcription error: ${message}`)
            finish(baseTextRef.current)
          }
        })()
      }

      try {
        if (recorder.state === 'recording') {
          recorder.requestData()
        }
        recorder.stop()
      } catch {
        finish(baseTextRef.current)
      }
    })
  }, [clearTimer, log, releaseStream, topic])

  const resetRecording = useCallback(() => {
    clearTimer()
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
    releaseStream()
    chunksRef.current = []
    setElapsedSeconds(0)
    setRecordingHint('')
    setError(null)
    setStatus(pickRecorderMimeType() ? 'idle' : 'unsupported')
  }, [clearTimer, releaseStream])

  useEffect(() => {
    return () => {
      clearTimer()
      mediaRecorderRef.current?.stop()
      releaseStream()
    }
  }, [clearTimer, releaseStream])

  return {
    status,
    isRecording: status === 'recording',
    isTranscribing: status === 'transcribing',
    isBusy: status === 'recording' || status === 'transcribing',
    isSupported: status !== 'unsupported',
    sessionTranscript: '',
    interimTranscript: '',
    spokenPreview: recordingHint,
    displayTranscript: recordingHint
      ? mergeTranscript(baseTextRef.current, recordingHint)
      : baseTextRef.current,
    elapsedSeconds,
    elapsedLabel: formatTime(elapsedSeconds),
    error,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
