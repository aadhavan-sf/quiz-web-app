interface SpeechTipsBannerProps {
  variant?: 'default' | 'recording'
}

export function SpeechTipsBanner({ variant = 'default' }: SpeechTipsBannerProps) {
  if (variant === 'recording') {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-900"
        role="status"
      >
        <p className="font-semibold">Recording — speak slowly and clearly</p>
        <p className="mt-1 text-red-800">
          Talk at a steady pace, pronounce each word, and pause briefly between ideas. Fast speech
          may miss words — you can edit the text after.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm leading-relaxed text-primary-900">
      <p className="font-semibold">Tip for best transcription</p>
      <ul className="mt-1.5 list-inside list-disc space-y-1 text-primary-800">
        <li>Speak slightly slower than normal conversation</li>
        <li>Pause briefly between sentences or key points</li>
        <li>Keep the mic close and avoid background noise</li>
        <li>You can always edit the text before submitting</li>
      </ul>
    </div>
  )
}
