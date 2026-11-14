import type { CSSProperties } from 'react'
import './quiz-visual.css'

type Difficulty = 'easy' | 'medium' | 'hard'
type VisualGuide = { formula: string; result: string; fill: number; pieces: string[]; caption: string }

const guides: Record<Difficulty, VisualGuide[]> = {
  easy: [
    { formula: '2 × 300 mL', result: '600 mL', fill: 60, pieces: ['300', '300'], caption: 'Two equal bottles combine into one total.' },
    { formula: '3 × 150 mL', result: '450 mL', fill: 45, pieces: ['150', '150', '150'], caption: 'Each floating drop represents one water break.' },
    { formula: '800 − 275 mL', result: '525 mL', fill: 53, pieces: ['800', '−275'], caption: 'The tank falls as water is used.' },
    { formula: '650 + 150 mL', result: '800 mL', fill: 80, pieces: ['650', '+150'], caption: 'Drinks and water-rich foods add to the total.' },
    { formula: '2 × 330 mL', result: '660 mL', fill: 66, pieces: ['330', '330'], caption: 'Two swaps create two equal portions of water.' },
    { formula: '6 × 500 mL', result: '3 L', fill: 75, pieces: ['6', '×500'], caption: 'Six bottles pour into the team supply.' },
  ],
  medium: [
    { formula: '5 × 150 mL', result: '750 mL', fill: 75, pieces: ['5 breaks', '150'], caption: 'Five timed breaks build the total.' },
    { formula: '1,200 − ⅜(1,200)', result: '750 mL', fill: 63, pieces: ['1.2 L', '⅜ left'], caption: 'The glowing section is the amount consumed.' },
    { formula: '1.6 L × 1.25', result: '2 L', fill: 80, pieces: ['1.6 L', '+25%'], caption: 'The extra quarter raises the hot-day supply.' },
    { formula: '350 + 4(175) + 250', result: '1.3 L', fill: 65, pieces: ['before', '4 breaks', 'after'], caption: 'Three stages combine into the full routine.' },
    { formula: '80% × 2.5 L', result: '2 L', fill: 80, pieces: ['80%', '2.5 L'], caption: 'The filled portion represents beverages.' },
    { formula: '7.5 − 10(0.65)', result: '1 L', fill: 13, pieces: ['7.5 L', '−6.5 L'], caption: 'Ten bottles drain the cooler to its remainder.' },
  ],
  hard: [
    { formula: '(100 ÷ 20) × 225', result: '1.125 L', fill: 75, pieces: ['5 intervals', '225'], caption: 'Time intervals turn into five equal pours.' },
    { formula: '2.4 × 35% × ¾', result: '630 mL', fill: 63, pieces: ['35%', 'keep ¾'], caption: 'Two percentage layers shrink the original supply.' },
    { formula: '8 − 12(3)(0.18)', result: '1.52 L', fill: 19, pieces: ['12 athletes', '3 breaks', '180'], caption: 'Thirty-six pours drain the team cooler.' },
    { formula: '82% × 2.4 L', result: '1.968 L', fill: 82, pieces: ['82%', '2.4 L'], caption: 'The blue volume models the beverage share.' },
    { formula: '1,800 − 7(220)', result: '260 mL', fill: 14, pieces: ['1.8 L', '7 × 220'], caption: 'Seven scheduled pours leave a small reserve.' },
    { formula: '4(160) × 1.25', result: '800 mL', fill: 80, pieces: ['640', '+25%'], caption: 'A one-quarter increase expands the cool-day total.' },
  ],
}

export function QuizVisual({ difficulty, index, urgent }: { difficulty: Difficulty; index: number; urgent: boolean }) {
  const guide = guides[difficulty][index]
  const style = { '--fill-level': `${guide.fill}%` } as CSSProperties

  return <aside className={`learning-visual ${urgent ? 'is-urgent' : ''}`} aria-label="Animated 3D water model for the current problem">
    <div className="visual-stage" aria-hidden="true">
      <div className="visual-orbit">{guide.pieces.map((piece, pieceIndex) => <span key={`${piece}-${pieceIndex}`} style={{ '--piece-index': pieceIndex } as CSSProperties}>{piece}</span>)}</div>
      <div className="visual-vessel" style={style}>
        <div className="vessel-rim"/><div className="vessel-glass"><div className="vessel-liquid"><i/><i/><i/></div><div className="vessel-shine"/></div><div className="vessel-base"/>
      </div>
      <div className="visual-shadow"/>
    </div>
  </aside>
}
