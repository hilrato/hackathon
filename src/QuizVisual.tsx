https://musical-spoon-v9prjw9r73wqjq.github.dev/import './quiz-visual.css'

type Difficulty = 'easy' | 'medium' | 'hard'
type VisualGuide = { fill: number; label: string }

const guides: Record<Difficulty, VisualGuide[]> = {
  easy: [60, 45, 53, 80, 66, 75].map((fill) => ({ fill, label: `${fill}% full` })),
  medium: [75, 63, 80, 65, 80, 13].map((fill) => ({ fill, label: `${fill}% full` })),
  hard: [75, 63, 19, 82, 14, 80].map((fill) => ({ fill, label: `${fill}% full` })),
}

// A basic water bar gives a visual clue without showing the answer.
export function QuizVisual({ difficulty, index, urgent }: { difficulty: Difficulty; index: number; urgent: boolean }) {
  const guide = guides[difficulty][index]

  return <aside className={`simple-water-visual ${urgent ? 'is-urgent' : ''}`} aria-label={guide.label}>
    <span>Water level</span>
    <div className="water-bar">
      <div style={{ width: `${guide.fill}%` }} />
    </div>
  </aside>
}
