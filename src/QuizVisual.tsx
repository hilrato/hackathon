import './quiz-visual.css'

type QuizVisualProps = {
  timeLeft: number
  timeLimit: number
  urgent: boolean
}

// The water percentage follows the timer: full at the start and empty at zero.
export function QuizVisual({ timeLeft, timeLimit, urgent }: QuizVisualProps) {
  const waterPercent = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100))

  return <aside className={`simple-water-visual ${urgent ? 'is-urgent' : ''}`} aria-label={`Time remaining: ${timeLeft} seconds`}>
    <span>Water timer: {timeLeft}s</span>
    <div className="water-bar">
      <div style={{ width: `${waterPercent}%` }} />
    </div>
  </aside>
}
