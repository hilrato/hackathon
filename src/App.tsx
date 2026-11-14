import { useMemo, useState } from 'react'
import './App.css'

type Question = { eyebrow: string; prompt: string; detail: string; answers: string[]; correct: number; explanation: string }

const questions: Question[] = [
  { eyebrow: 'Warm-up · Addition', prompt: 'Maya drinks 3 cups before lunch and 4 cups after. How many cups altogether?', detail: 'Add the two parts of Maya’s day.', answers: ['6 cups', '7 cups', '8 cups', '12 cups'], correct: 1, explanation: '3 + 4 = 7 cups. Spreading drinks through the day can feel easier than having a lot at once.' },
  { eyebrow: 'Multiply it · Groups', prompt: 'A team has 6 players. Each fills a 500 mL bottle. How much water is that in total?', detail: 'Multiply, then convert 1,000 mL into 1 L.', answers: ['2 L', '2.5 L', '3 L', '3.5 L'], correct: 2, explanation: '6 × 500 mL = 3,000 mL, which is 3 L. Nice conversion!' },
  { eyebrow: 'Fraction splash', prompt: 'A 1-liter bottle is ¾ full. How many milliliters are inside?', detail: 'One liter equals 1,000 milliliters.', answers: ['250 mL', '500 mL', '750 mL', '1,250 mL'], correct: 2, explanation: '¾ of 1,000 is 750 mL. Fractions make bottle levels easy to read.' },
  { eyebrow: 'Hydration sense', prompt: 'It’s a hot day and Leo is playing outside. Which plan makes the most sense?', detail: 'Think about heat, activity, and regular breaks.', answers: ['Wait until bedtime', 'Take regular water breaks', 'Skip every break', 'Only drink soda'], correct: 1, explanation: 'Regular water breaks are a smart plan during heat and activity. Needs vary by person and conditions.' },
  { eyebrow: 'Rate challenge', prompt: 'A 900 mL bottle is shared equally among 3 friends. How much does each friend get?', detail: 'Divide the bottle into three equal shares.', answers: ['200 mL', '300 mL', '450 mL', '600 mL'], correct: 1, explanation: '900 ÷ 3 = 300 mL for each friend. Equal shares, perfectly poured.' },
  { eyebrow: 'Final pour · Percent', prompt: 'Noah drank 600 mL from a 750 mL bottle. What percent did he drink?', detail: 'Divide 600 by 750, then multiply by 100.', answers: ['60%', '75%', '80%', '90%'], correct: 2, explanation: '600 ÷ 750 = 0.8, so Noah drank 80% of the bottle.' },
]

type IconName = 'drop' | 'bolt' | 'clock' | 'arrow' | 'check' | 'refresh' | 'sparkle'
function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const paths = {
    drop: <path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z" />,
    bolt: <path d="m13 2-8 12h6l-1 8 9-12h-6V2Z" />,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    check: <path d="m5 12.5 4.3 4.3L19 7" />,
    refresh: <><path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .7-7.2L20 12"/></>,
    sparkle: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z"/><path d="m5 15 .7 2.3L8 18.5l-2.3 1.2L5 22l-.7-2.3L2 18.5l2.3-1.2L5 15Z"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [screen, setScreen] = useState<'home' | 'quiz' | 'results'>('home')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const score = useMemo(() => answers.reduce((total, answer, index) => total + (answer === questions[index].correct ? 1 : 0), 0), [answers])
  const question = questions[current]
  const isCorrect = selected === question.correct
  const begin = () => { setCurrent(0); setSelected(null); setAnswers([]); setStreak(0); setScreen('quiz') }
  const choose = (index: number) => { if (selected !== null) return; setSelected(index); setAnswers((prev) => [...prev, index]); setStreak(index === question.correct ? streak + 1 : 0) }
  const next = () => { if (current === questions.length - 1) { setScreen('results'); return }; setCurrent((value) => value + 1); setSelected(null) }

  return <main className={`app app--${screen}`}>
    <nav className="nav" aria-label="Main navigation">
      <button className="brand" onClick={() => setScreen('home')} aria-label="AquaMath home"><span className="brand-mark"><Icon name="drop" size={19} /></span><span>Aqua<span>Math</span></span></button>
      <div className="nav-right">{screen === 'quiz' && <span className="question-count">Question {current + 1} of {questions.length}</span>}<div className="nav-pill"><Icon name="sparkle" size={14}/> Learn. Solve. Sip.</div></div>
    </nav>

    {screen === 'home' && <section className="home">
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <div className="hero-copy"><div className="kicker"><span>NEW</span> Math that makes a splash</div><h1>Train your brain.<br/><em>Fuel your body.</em></h1><p className="hero-text">A quick-fire quiz where everyday math meets smarter hydration. Six questions. Zero pressure. Maximum refreshment.</p><button className="primary-button" onClick={begin}>Start the quiz <Icon name="arrow" /></button><p className="tiny-note">No sign-up · About 3 minutes</p></div>
      <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="bottle"><div className="bottle-cap"/><div className="bottle-neck"/><div className="bottle-body"><div className="bottle-glint"/><div className="water"><span>750</span><small>mL</small></div><div className="measure m1">¾</div><div className="measure m2">½</div><div className="measure m3">¼</div></div></div><div className="float-card card-math"><span>+</span><b>3 × 250</b><small>= 750 mL</small></div><div className="float-card card-streak"><Icon name="bolt" size={18}/><b>Brain power</b><small>fully charged</small></div><span className="bubble b1"/><span className="bubble b2"/><span className="bubble b3"/></div>
      <div className="feature-strip"><div><span className="feature-icon coral"><Icon name="clock"/></span><p><b>3 minute challenge</b><small>Perfect for a quick brain break</small></p></div><div><span className="feature-icon mint"><Icon name="bolt"/></span><p><b>6 playful questions</b><small>Math, logic & hydration smarts</small></p></div><div><span className="feature-icon blue"><Icon name="drop"/></span><p><b>Instant explanations</b><small>Learn something with every answer</small></p></div></div>
    </section>}

    {screen === 'quiz' && <section className="quiz-shell"><div className="quiz-topline"><button className="exit-button" onClick={() => setScreen('home')}>← Exit</button><div className="streak"><Icon name="bolt" size={16}/>{streak} streak</div></div><div className="progress-track"><span style={{ width: `${((current + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }} /></div><article className="quiz-card"><span className="quiz-eyebrow">{question.eyebrow}</span><h2>{question.prompt}</h2><p className="question-detail">{question.detail}</p><div className="answer-grid">{question.answers.map((answer, index) => { const state = selected === null ? '' : index === question.correct ? 'correct' : index === selected ? 'wrong' : 'muted'; return <button key={answer} className={`answer ${state}`} onClick={() => choose(index)} disabled={selected !== null}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{answer}{selected !== null && (index === question.correct || index === selected) && <span className="answer-status"><Icon name={index === question.correct ? 'check' : 'drop'} size={16}/></span>}</button> })}</div>{selected !== null && <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`} role="status"><span className="feedback-icon"><Icon name={isCorrect ? 'check' : 'drop'} /></span><div><b>{isCorrect ? 'You nailed it!' : 'Good try—here’s the pour.'}</b><p>{question.explanation}</p></div><button onClick={next}>{current === questions.length - 1 ? 'See results' : 'Next question'} <Icon name="arrow" size={18}/></button></div>}</article></section>}

    {screen === 'results' && <section className="results"><div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/><div className="result-drop"><Icon name="drop" size={54}/><span>{score}/{questions.length}</span></div><span className="quiz-eyebrow">Quiz complete</span><h2>{score === questions.length ? 'Perfect pour!' : score >= 4 ? 'Making waves!' : 'A strong first splash!'}</h2><p>You solved <b>{score} of {questions.length}</b> challenges. Your math muscles and hydration know-how both got a workout.</p><div className="score-bar"><span style={{width: `${(score/questions.length)*100}%`}} /></div><div className="result-stats"><div><strong>{Math.round((score/questions.length)*100)}%</strong><small>accuracy</small></div><div><strong>{questions.length}</strong><small>questions</small></div><div><strong>+{score * 20}</strong><small>brain points</small></div></div><button className="primary-button" onClick={begin}><Icon name="refresh" size={19}/> Play again</button><button className="text-button" onClick={() => setScreen('home')}>Back to home</button><p className="health-note">Hydration needs differ. Listen to your body and follow guidance from a qualified health professional.</p></section>}
  </main>
}
export default App
