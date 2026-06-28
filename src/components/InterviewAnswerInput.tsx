import { motion } from 'framer-motion'
import { SpeechTipsBanner } from './SpeechTipsBanner'
import type { useSpeechRecognition } from '../hooks/useSpeechRecognition'

export type SpeechApi = ReturnType<typeof useSpeechRecognition>

interface InterviewAnswerInputProps {
  speech: SpeechApi
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showTranscriptionTips?: boolean
}

export function InterviewAnswerInput({
  speech,
  value,
  onChange,
  disabled = false,
  showTranscriptionTips = false,
}: InterviewAnswerInputProps) {
  return (
    <div className="space-y-4">
      {showTranscriptionTips && !speech.isRecording && !speech.isTranscribing && (
        <SpeechTipsBanner />
      )}

      {speech.isRecording && <SpeechTipsBanner variant="recording" />}

      <div className="rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        <motion.button
          type="button"
          onClick={() => {
            if (speech.isRecording) {
              void speech.stopRecording().then(onChange)
              return
            }
            if (!disabled && !speech.isTranscribing) {
              void speech.startRecording(value)
            }
          }}
          disabled={disabled || !speech.isSupported || speech.isTranscribing}
          whileTap={disabled || speech.isTranscribing ? undefined : { scale: 0.98 }}
          aria-label={speech.isRecording ? 'Stop recording' : 'Record your answer'}
          aria-pressed={speech.isRecording}
          className={`flex w-full min-h-14 touch-manipulation items-center justify-center gap-3 rounded-xl px-5 py-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-16 ${
            speech.isRecording
              ? 'bg-red-600 text-white'
              : speech.isTranscribing
                ? 'bg-gray-100 text-gray-500'
                : 'bg-primary-600 text-white active:bg-primary-800'
          }`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
              speech.isRecording
                ? 'bg-red-500'
                : speech.isTranscribing
                  ? 'bg-gray-200'
                  : 'bg-primary-500'
            }`}
            aria-hidden
          >
            {speech.isRecording ? '⏹' : speech.isTranscribing ? '…' : '🎤'}
          </span>
          <span className="flex flex-col items-start text-left">
            <span>
              {speech.isTranscribing
                ? 'Transcribing your answer…'
                : speech.isRecording
                  ? `Tap to stop · ${speech.elapsedLabel}`
                  : 'Record Answer'}
            </span>
            {!speech.isRecording && !speech.isTranscribing && (
              <span className="text-xs font-normal text-primary-100">
                Speak slowly — pause between points
              </span>
            )}
            {speech.isRecording && (
              <span className="text-xs font-normal text-red-100">
                Slow and clear — tap stop when done
              </span>
            )}
          </span>
          {speech.isRecording && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            </span>
          )}
        </motion.button>
      </div>

      {!speech.isSupported && (
        <p className="text-sm text-amber-700">
          Voice recording is unavailable in this browser. Type your answer below.
        </p>
      )}

      {speech.status === 'permission-denied' && (
        <p className="text-sm text-red-600" role="alert">
          Microphone access denied. Allow the mic for this site, or type your answer.
        </p>
      )}

      {speech.error && speech.status !== 'permission-denied' && (
        <p className="text-sm text-red-600" role="alert">
          {speech.error}
        </p>
      )}

      <div>
        <label htmlFor="interview-answer" className="mb-2 block text-sm font-semibold text-gray-900">
          Or type your answer
        </label>
        <textarea
          id="interview-answer"
          value={value}
          onChange={(e) => {
            if (!speech.isBusy) onChange(e.target.value)
          }}
          readOnly={speech.isBusy}
          disabled={disabled}
          placeholder="Your transcribed or typed answer will appear here. Review and edit before submitting."
          rows={8}
          className="input-field min-h-[10rem] w-full resize-none text-base leading-relaxed disabled:opacity-60 read-only:bg-gray-50 sm:min-h-[12rem]"
          aria-label="Your answer"
        />
      </div>
    </div>
  )
}
