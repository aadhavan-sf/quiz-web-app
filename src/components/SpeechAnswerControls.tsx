import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { SpeechTipsBanner } from './SpeechTipsBanner'

interface SpeechAnswerControlsProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showDebug?: boolean
  topic?: string
  onRecordingChange?: (isRecording: boolean) => void
  onBusyChange?: (isBusy: boolean) => void
}

export function SpeechAnswerControls({
  value,
  onChange,
  disabled = false,
  showDebug = false,
  topic,
  onRecordingChange,
  onBusyChange,
}: SpeechAnswerControlsProps) {
  const [debugEvents, setDebugEvents] = useState<string[]>([])

  const onDebug = useMemo(
    () =>
      showDebug
        ? (message: string) => {
            setDebugEvents((prev) => [message, ...prev].slice(0, 20))
          }
        : undefined,
    [showDebug],
  )

  const speech = useSpeechRecognition({ onDebug, topic })

  useEffect(() => {
    onRecordingChange?.(speech.isRecording)
  }, [onRecordingChange, speech.isRecording])

  useEffect(() => {
    onBusyChange?.(speech.isBusy)
  }, [onBusyChange, speech.isBusy])

  const handleToggle = async () => {
    if (speech.isRecording) {
      const finalText = await speech.stopRecording()
      onChange(finalText)
      return
    }

    if (disabled || speech.isTranscribing) return

    await speech.startRecording(value)
  }

  const buttonLabel = speech.isTranscribing
    ? 'Transcribing…'
    : speech.isRecording
      ? `Stop · ${speech.elapsedLabel}`
      : 'Record Answer'

  return (
    <div className="space-y-3">
      {!speech.isRecording && !speech.isTranscribing && <SpeechTipsBanner />}
      {speech.isRecording && <SpeechTipsBanner variant="recording" />}

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          onClick={() => void handleToggle()}
          disabled={disabled || !speech.isSupported || speech.isTranscribing}
          whileTap={disabled || speech.isTranscribing ? undefined : { scale: 0.97 }}
          aria-label={speech.isRecording ? 'Stop recording' : 'Start recording answer'}
          aria-pressed={speech.isRecording}
          className={`flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${
            speech.isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : speech.isTranscribing
                ? 'bg-gray-400 text-white'
                : 'border border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <span className="text-lg" aria-hidden>
            {speech.isRecording ? '⏹' : speech.isTranscribing ? '…' : '🎤'}
          </span>
          <span>{buttonLabel}</span>
        </motion.button>

        {speech.isRecording && (
          <span className="flex items-center gap-2 text-sm text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Speak slowly — pause between points
          </span>
        )}

        {speech.isTranscribing && (
          <span className="text-sm text-blue-600">Sending audio to Groq Whisper…</span>
        )}
      </div>

      {!speech.isSupported && (
        <p className="text-sm text-amber-700">
          Audio recording is not available in this browser. Type your answer instead.
        </p>
      )}

      {speech.status === 'permission-denied' && (
        <p className="text-sm text-red-600" role="alert">
          Microphone access was denied. Allow the mic for this site in browser settings.
        </p>
      )}

      {speech.error && speech.status !== 'permission-denied' && (
        <p className="text-sm text-red-600" role="alert">
          {speech.error}
        </p>
      )}

      <textarea
        value={value}
        onChange={(e) => {
          if (!speech.isBusy) onChange(e.target.value)
        }}
        readOnly={speech.isBusy}
        disabled={disabled}
        placeholder="Type or record your interview answer here."
        rows={10}
        className="input-field min-h-[12rem] resize-y text-base leading-relaxed disabled:opacity-60 read-only:bg-gray-50"
        aria-label="Your answer"
      />

      {showDebug && (
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 font-mono text-xs text-gray-600">
            <p>status: {speech.status}</p>
            <p>engine: server-side Groq Whisper (not browser speech API)</p>
            <p>committed value: {value || '(empty)'}</p>
          </div>
          {debugEvents.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Event log</p>
              <ul className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-gray-600">
                {debugEvents.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
