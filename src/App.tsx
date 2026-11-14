import { useState, type FormEvent } from 'react'
import './App.css'
import './difficulty.css'
import './water.css'
import './short-answer.css'

type Question = { eyebrow: string; prompt: string; detail: string; answers: string[]; correct: number; explanation: string; kind?: 'choice' | 'short'; acceptedAnswers?: string[]; sampleAnswer?: string }
type Difficulty = 'easy' | 'medium' | 'hard'

const questionsByDifficulty: Record<Difficulty, Question[]> = {
  easy: [
    { eyebrow: 'Easy · Short answer', prompt: 'Ari finishes two 300 mL bottles during the school day. How much water did Ari drink?', detail: 'Enter a short answer with the number and unit.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['600', '600 ml', '0.6 l'], sampleAnswer: '600 mL', explanation: '2 × 300 mL = 600 mL.' },
    { eyebrow: 'Easy · Activity breaks', prompt: 'During a 60-minute practice, Nia drinks 150 mL at each of 3 water breaks. How much does she drink during practice?', detail: 'Multiply the amount per break by the number of breaks.', answers: ['300 mL', '450 mL', '600 mL', '750 mL'], correct: 1, explanation: '3 × 150 mL = 450 mL. Drinking at planned breaks is more reliable than waiting until the end of activity.' },
    { eyebrow: 'Easy · Short answer', prompt: 'Sam starts a walk with 800 mL and drinks 275 mL. How much water is left?', detail: 'Enter a short answer with the number and unit.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['525', '525 ml', '0.525 l'], sampleAnswer: '525 mL', explanation: '800 − 275 = 525 mL.' },
    { eyebrow: 'Easy · Food counts too', prompt: 'Lena gets 650 mL of fluid from drinks and 150 mL from water-rich foods. What is her combined total?', detail: 'Add the fluid from drinks and food.', answers: ['700 mL', '750 mL', '800 mL', '850 mL'], correct: 2, explanation: '650 + 150 = 800 mL. Many fruits and vegetables contain water and can contribute to total fluid intake.' },
    { eyebrow: 'Easy · Smart swap', prompt: 'Jay replaces two 330 mL sugary drinks with the same amount of plain water. How much water is that altogether?', detail: 'Multiply 330 mL by two.', answers: ['330 mL', '560 mL', '660 mL', '760 mL'], correct: 2, explanation: '2 × 330 mL = 660 mL. Choosing water instead of sugary drinks adds hydration without added sugar or calories.' },
    { eyebrow: 'Easy · Team supply', prompt: 'Six teammates each bring a 500 mL bottle. How many liters of water do they bring altogether?', detail: 'Multiply first, then remember that 1,000 mL equals 1 L.', answers: ['2 L', '2.5 L', '3 L', '3.5 L'], correct: 2, explanation: '6 × 500 mL = 3,000 mL, or 3 L. Group planning helps make sure water is available during activity.' },
  ],
  medium: [
    { eyebrow: 'Medium · Hydration schedule', prompt: 'During a 75-minute practice, Imani drinks 150 mL every 15 minutes. How much does she drink over the 5 scheduled breaks?', detail: 'Find the number of listed breaks, then multiply.', answers: ['600 mL', '700 mL', '750 mL', '900 mL'], correct: 2, explanation: '5 × 150 mL = 750 mL. Water before, during, and after activity can be part of a well-planned routine.' },
    { eyebrow: 'Medium · Short answer', prompt: 'A 1.2 L bottle is ⅜ full after a hike. How much water was consumed?', detail: 'Find what remains, subtract, and enter a short answer.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['750', '750 ml', '0.75 l'], sampleAnswer: '750 mL', explanation: '⅜ of 1,200 mL is 450 mL remaining, so 750 mL was consumed.' },
    { eyebrow: 'Medium · Heat adjustment', prompt: 'For a fictional plan, Mateo packs 1.6 L for a cool day and 25% more for a hot day. How much does he pack for the hot day?', detail: 'Find 25% of 1.6 L, then add it to the original amount.', answers: ['1.8 L', '2 L', '2.2 L', '2.4 L'], correct: 1, explanation: '25% of 1.6 L is 0.4 L, so the total is 2 L. Heat and physical activity can increase water needs, but personal needs vary.' },
    { eyebrow: 'Medium · Short answer', prompt: 'Zoe drinks 350 mL before practice, 175 mL at each of 4 breaks, and 250 mL afterward. What is the total?', detail: 'Multiply the break amount, then add all three stages.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1300', '1300 ml', '1.3 l'], sampleAnswer: '1.3 L', explanation: '350 + (4 × 175) + 250 = 1,300 mL, or 1.3 L.' },
    { eyebrow: 'Medium · Total water sources', prompt: 'In a fictional daily total of 2.5 L, 20% comes from water-rich foods. How much comes from beverages?', detail: 'Beverages provide the remaining 80%.', answers: ['1.5 L', '1.8 L', '2 L', '2.3 L'], correct: 2, explanation: '80% of 2.5 L is 2 L. Total water can come from both beverages and foods such as fruits and vegetables.' },
    { eyebrow: 'Medium · Cooler planning', prompt: 'A coach has 7.5 L of water. Ten players each fill a 650 mL bottle. How much remains in the cooler?', detail: 'Find the team’s total first, then subtract it from 7.5 L.', answers: ['0.5 L', '0.75 L', '1 L', '1.25 L'], correct: 2, explanation: '10 × 650 mL = 6.5 L, leaving 1 L. Planning enough water matters more when conditions are hot or activity lasts longer.' },
  ],
  hard: [
    { eyebrow: 'Hard · Short answer', prompt: 'During a 100-minute session, Kai drinks 225 mL after every 20-minute interval. What is the total?', detail: 'Find the number of intervals, then enter a short answer.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1125', '1125 ml', '1.125 l'], sampleAnswer: '1.125 L', explanation: '100 ÷ 20 = 5 intervals, and 5 × 225 mL = 1,125 mL.' },
    { eyebrow: 'Hard · Multi-step percent', prompt: 'A 2.4 L supply is shared. Priya uses 35%, then gives ¼ of her share to a teammate. How much does Priya keep?', detail: 'Find 35% of 2.4 L, then keep three quarters of that amount.', answers: ['560 mL', '630 mL', '720 mL', '840 mL'], correct: 1, explanation: '35% of 2,400 mL is 840 mL; ¾ of 840 mL is 630 mL. Shared supplies should still be planned around each person’s needs.' },
    { eyebrow: 'Hard · Team logistics', prompt: 'Twelve athletes each take three 180 mL water breaks. If the cooler started with 8 L, how much remains?', detail: 'Find the team total, convert units, and subtract.', answers: ['1.34 L', '1.52 L', '1.7 L', '2.48 L'], correct: 1, explanation: '12 × 3 × 180 mL = 6,480 mL. From 8,000 mL, that leaves 1,520 mL, or 1.52 L.' },
    { eyebrow: 'Hard · Short answer', prompt: 'In a fictional 2.4 L total, 18% comes from water-rich foods. How much must come from beverages?', detail: 'Find the remaining 82% and enter a short answer.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1968', '1968 ml', '1.968 l'], sampleAnswer: '1.968 L', explanation: '82% of 2.4 L is 1.968 L.' },
    { eyebrow: 'Hard · Capacity check', prompt: 'A hiker carries 1.8 L and plans seven 220 mL breaks. How much water remains after the seventh break?', detail: 'Multiply the planned amount, then subtract it from 1,800 mL.', answers: ['220 mL', '240 mL', '260 mL', '280 mL'], correct: 2, explanation: '7 × 220 mL = 1,540 mL, leaving 260 mL. Checking a container’s capacity before activity helps avoid running short.' },
    { eyebrow: 'Hard · Compare conditions', prompt: 'A fictional cool-day plan uses 160 mL at each of four breaks. A hot-day plan increases that total by 25%. What is the hot-day total?', detail: 'Find the cool-day total first, then increase it by one quarter.', answers: ['720 mL', '760 mL', '800 mL', '840 mL'], correct: 2, explanation: '4 × 160 mL = 640 mL; increasing it by 25% gives 800 mL. People often need more water in heat, though no single amount fits everyone.' },
  ],
}

const difficultyLabels: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const normalizeAnswer = (answer: string) => answer.toLowerCase().replace(/,/g, '').replace(/millilit(?:er|re)s?/g, 'ml').replace(/lit(?:er|re)s?/g, 'l').replace(/\s+/g, '').trim()
const answerIsCorrect = (question: Question, answer: number | string) => {
  if (question.kind !== 'short') return answer === question.correct
  const response = normalizeAnswer(String(answer))
  return question.acceptedAnswers?.some((accepted) => normalizeAnswer(accepted) === response) ?? false
}

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
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [shortResponse, setShortResponse] = useState('')
  const [submittedShortAnswer, setSubmittedShortAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Array<number | string>>([])
  const [streak, setStreak] = useState(0)
  const questions = questionsByDifficulty[difficulty]
  const score = answers.reduce<number>((total, answer, index) => total + (answerIsCorrect(questions[index], answer) ? 1 : 0), 0)
  const question = questions[current]
  const hasAnswered = selected !== null || submittedShortAnswer !== null
  const currentAnswer = question.kind === 'short' ? submittedShortAnswer : selected
  const isCorrect = currentAnswer !== null && answerIsCorrect(question, currentAnswer)
  const begin = () => { setCurrent(0); setSelected(null); setShortResponse(''); setSubmittedShortAnswer(null); setAnswers([]); setStreak(0); setScreen('quiz') }
  const choose = (index: number) => { if (selected !== null) return; setSelected(index); setAnswers((prev) => [...prev, index]); setStreak(index === question.correct ? streak + 1 : 0) }
  const submitShortAnswer = (event: FormEvent) => { event.preventDefault(); const response = shortResponse.trim(); if (!response || submittedShortAnswer !== null) return; setSubmittedShortAnswer(response); setAnswers((prev) => [...prev, response]); setStreak(answerIsCorrect(question, response) ? streak + 1 : 0) }
  const next = () => { if (current === questions.length - 1) { setScreen('results'); return }; setCurrent((value) => value + 1); setSelected(null); setShortResponse(''); setSubmittedShortAnswer(null) }

  return <main className={`app app--${screen}`}>
    <nav className="nav" aria-label="Main navigation">
      <button className="brand" onClick={() => setScreen('home')} aria-label="AquaMath home"><span className="brand-mark"><Icon name="drop" size={19} /></span><span>Aqua<span>Math</span></span></button>
      <div className="nav-right">{screen === 'quiz' && <span className="question-count">{difficultyLabels[difficulty]} · Question {current + 1} of {questions.length}</span>}<div className="nav-pill"><Icon name="sparkle" size={14}/> Learn. Solve. Sip.</div></div>
    </nav>

    {screen === 'home' && <section className="home">
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <div className="hero-copy"><div className="kicker"><span>NEW</span> Math that makes a splash</div><h1>Train your brain.<br/><em>Fuel your body.</em></h1><p className="hero-text">A quick-fire quiz where everyday math meets smarter hydration. Six questions. Zero pressure. Maximum refreshment.</p><fieldset className="difficulty-picker"><legend>Choose your difficulty</legend><div>{(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => <button key={level} type="button" className={difficulty === level ? 'active' : ''} onClick={() => setDifficulty(level)} aria-pressed={difficulty === level}>{difficultyLabels[level]}</button>)}</div></fieldset><button className="primary-button" onClick={begin}>Start {difficultyLabels[difficulty].toLowerCase()} quiz <Icon name="arrow" /></button><p className="tiny-note">No sign-up · About 3 minutes</p></div>
      <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="bottle"><div className="bottle-cap"/><div className="bottle-neck"/><div className="bottle-body"><div className="bottle-glint"/><div className="water"><span>750</span><small>mL</small></div><div className="measure m1">¾</div><div className="measure m2">½</div><div className="measure m3">¼</div></div></div><div className="float-card card-math"><span>+</span><b>3 × 250</b><small>= 750 mL</small></div><div className="float-card card-streak"><Icon name="bolt" size={18}/><b>Brain power</b><small>fully charged</small></div><span className="bubble b1"/><span className="bubble b2"/><span className="bubble b3"/></div>
      <div className="feature-strip"><div><span className="feature-icon coral"><Icon name="clock"/></span><p><b>3 minute challenge</b><small>Perfect for a quick brain break</small></p></div><div><span className="feature-icon mint"><Icon name="bolt"/></span><p><b>6 playful questions</b><small>Math, logic & hydration smarts</small></p></div><div><span className="feature-icon blue"><Icon name="drop"/></span><p><b>Instant explanations</b><small>Learn something with every answer</small></p></div></div>
    </section>}

    {screen === 'quiz' && <section className="quiz-shell">
      <div className="quiz-topline"><button className="exit-button" onClick={() => setScreen('home')}>← Exit</button><div className="streak"><Icon name="bolt" size={16}/>{streak} streak</div></div>
      <div className="progress-track"><span style={{ width: `${((current + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` }} /></div>
      <article className="quiz-card">
        <span className="quiz-eyebrow">{question.eyebrow}</span><h2>{question.prompt}</h2><p className="question-detail">{question.detail}</p>
        {question.kind === 'short' ? <form className="short-answer-form" onSubmit={submitShortAnswer}>
          <label htmlFor="short-answer">Your answer</label>
          <div className="short-answer-entry"><input id="short-answer" value={shortResponse} onChange={(event) => setShortResponse(event.target.value)} placeholder="Example: 750 mL" disabled={submittedShortAnswer !== null} autoComplete="off"/><button type="submit" disabled={!shortResponse.trim() || submittedShortAnswer !== null}>Check answer</button></div>
          {submittedShortAnswer !== null && <div className={`answer-comparison ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status"><div><small>Your answer</small><strong>{submittedShortAnswer}</strong></div><span aria-hidden="true">→</span><div><small>Correct answer</small><strong>{question.sampleAnswer}</strong></div><b>{isCorrect ? 'Correct' : 'Not quite'}</b></div>}
        </form> : <div className="answer-grid">{question.answers.map((answer, index) => { const state = selected === null ? '' : index === question.correct ? 'correct' : index === selected ? 'wrong' : 'muted'; return <button key={answer} className={`answer ${state}`} onClick={() => choose(index)} disabled={selected !== null}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{answer}{selected !== null && (index === question.correct || index === selected) && <span className="answer-status"><Icon name={index === question.correct ? 'check' : 'drop'} size={16}/></span>}</button> })}</div>}
        {hasAnswered && <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`} role="status"><span className="feedback-icon"><Icon name={isCorrect ? 'check' : 'drop'} /></span><div><b>{isCorrect ? 'You nailed it!' : 'Good try—here’s the pour.'}</b><p>{question.explanation}</p></div><button onClick={next}>{current === questions.length - 1 ? 'See results' : 'Next question'} <Icon name="arrow" size={18}/></button></div>}
      </article>
    </section>}

    {screen === 'results' && <section className="results"><div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/><div className="result-drop"><Icon name="drop" size={54}/><span>{score}/{questions.length}</span></div><span className="quiz-eyebrow">{difficultyLabels[difficulty]} quiz complete</span><h2>{score === questions.length ? 'Perfect pour!' : score >= 4 ? 'Making waves!' : 'A strong first splash!'}</h2><p>You solved <b>{score} of {questions.length}</b> challenges. Your math muscles and hydration know-how both got a workout.</p><div className="score-bar"><span style={{width: `${(score/questions.length)*100}%`}} /></div><div className="result-stats"><div><strong>{Math.round((score/questions.length)*100)}%</strong><small>accuracy</small></div><div><strong>{questions.length}</strong><small>questions</small></div><div><strong>+{score * 20}</strong><small>brain points</small></div></div><button className="primary-button" onClick={begin}><Icon name="refresh" size={19}/> Play {difficultyLabels[difficulty].toLowerCase()} again</button><button className="text-button" onClick={() => setScreen('home')}>Change difficulty</button><p className="health-note">These are math scenarios, not personal intake targets. Hydration needs vary with age, health, activity, and conditions; follow qualified medical guidance.</p></section>}
  </main>
}
export default App
