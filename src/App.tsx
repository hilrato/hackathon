import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { QuizVisual } from './QuizVisual'
import { ResultInsights } from './ResultInsights'
import { Scratchpad } from './Scratchpad'
import './App.css'
import './difficulty.css'
import './water.css'
import './short-answer.css'
import './gameplay.css'
import './impact.css'
import './simple.css'
import './hydration-fact.css'

// A Question describes everything needed to display and grade one quiz problem.
// Multiple-choice questions use `answers` + `correct`; typed questions use `acceptedAnswers`.
type Question = { eyebrow: string; prompt: string; detail: string; answers: string[]; correct: number; explanation: string; kind?: 'choice' | 'short'; acceptedAnswers?: string[]; sampleAnswer?: string }
type Difficulty = 'easy' | 'medium' | 'hard'

// The three question banks. The adaptive system can switch banks between questions.
const questionsByDifficulty: Record<Difficulty, Question[]> = {
  easy: [
    { eyebrow: 'Easy · Short answer', prompt: 'Ari finishes two 300 mL bottles during the school day. How much water did Ari drink?', detail: 'Enter a short answer with the number and unit.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['600', '600 ml', '0.6 l'], sampleAnswer: '600 mL', explanation: '2 × 300 mL = 600 mL.' },
    { eyebrow: 'Easy · Activity breaks', prompt: 'During a 60-minute practice, Nia drinks 150 mL at each of 3 water breaks. How much does she drink during practice?', detail: 'Multiply the amount per break by the number of breaks.', answers: ['300 mL', '450 mL', '600 mL', '750 mL'], correct: 1, explanation: '3 × 150 mL = 450 mL. Drinking at planned breaks is more reliable than waiting until the end of activity.' },
    { eyebrow: 'Easy · Short answer', prompt: 'Sam starts a walk with 800 mL and drinks 275 mL. How much water is left?', detail: 'Enter a short answer with the number and unit.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['525', '525 ml', '0.525 l'], sampleAnswer: '525 mL', explanation: '800 − 275 = 525 mL.' },
    { eyebrow: 'Easy · Capybara catering', prompt: 'Lena caters a pool party for the Capybara Council. She serves 650 mL in drinks and 150 mL from water-rich fruit. What is the combined total?', detail: 'The capybaras demand accurate addition.', answers: ['700 mL', '750 mL', '800 mL', '850 mL'], correct: 2, explanation: '650 + 150 = 800 mL. Many fruits and vegetables contain water and can contribute to total fluid intake.' },
    { eyebrow: 'Easy · The soda uprising', prompt: 'Jay’s soda machine becomes self-aware, so he replaces two 330 mL sodas with water before it can unionize. How much water is that?', detail: 'Multiply 330 mL by two. Ignore the machine’s demands.', answers: ['330 mL', '560 mL', '660 mL', '760 mL'], correct: 2, explanation: '2 × 330 mL = 660 mL. Choosing water instead of sugary drinks adds hydration without added sugar or calories.' },
    { eyebrow: 'Easy · Lunar penguin league', prompt: 'Six penguins arrive for moon dodgeball, each carrying a 500 mL bottle in its tiny space backpack. How many liters do they have?', detail: 'Multiply, convert to liters, and do not question penguin aerospace.', answers: ['2 L', '2.5 L', '3 L', '3.5 L'], correct: 2, explanation: '6 × 500 mL = 3,000 mL, or 3 L. Group planning helps make sure water is available during activity.' },
  ],
  medium: [
    { eyebrow: 'Medium · Hydration schedule', prompt: 'During a 75-minute practice, Imani drinks 150 mL every 15 minutes. How much does she drink over the 5 scheduled breaks?', detail: 'Find the number of listed breaks, then multiply.', answers: ['600 mL', '700 mL', '750 mL', '900 mL'], correct: 2, explanation: '5 × 150 mL = 750 mL. Water before, during, and after activity can be part of a well-planned routine.' },
    { eyebrow: 'Medium · Short answer', prompt: 'A 1.2 L bottle is ⅜ full after a hike. How much water was consumed?', detail: 'Find what remains, subtract, and enter a short answer.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['750', '750 ml', '0.75 l'], sampleAnswer: '750 mL', explanation: '⅜ of 1,200 mL is 450 mL remaining, so 750 mL was consumed.' },
    { eyebrow: 'Medium · Heat adjustment', prompt: 'For a fictional plan, Mateo packs 1.6 L for a cool day and 25% more for a hot day. How much does he pack for the hot day?', detail: 'Find 25% of 1.6 L, then add it to the original amount.', answers: ['1.8 L', '2 L', '2.2 L', '2.4 L'], correct: 1, explanation: '25% of 1.6 L is 0.4 L, so the total is 2 L. Heat and physical activity can increase water needs, but personal needs vary.' },
    { eyebrow: 'Medium · Short answer', prompt: 'At an intergalactic pickleball final, Zoe drinks 350 mL before play, 175 mL at each of 4 breaks, and 250 mL after defeating a telepathic squid. Total?', detail: 'Multiply the break amount, then add all three stages.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1300', '1300 ml', '1.3 l'], sampleAnswer: '1.3 L', explanation: '350 + (4 × 175) + 250 = 1,300 mL, or 1.3 L.' },
    { eyebrow: 'Medium · Watermelon economics', prompt: 'A wizard declares a fictional 2.5 L daily total. Water-rich foods pay 20% of the hydration tax. How much must beverages pay?', detail: 'Beverages owe the remaining 80%. The wizard accepts liters only.', answers: ['1.5 L', '1.8 L', '2 L', '2.3 L'], correct: 2, explanation: '80% of 2.5 L is 2 L. Total water can come from both beverages and foods such as fruits and vegetables.' },
    { eyebrow: 'Medium · Raccoon coach crisis', prompt: 'A coach—definitely not three raccoons in a tracksuit—has 7.5 L. Ten players fill 650 mL bottles. How much remains?', detail: 'Find the team total, subtract, and avoid eye contact with the coach.', answers: ['0.5 L', '0.75 L', '1 L', '1.25 L'], correct: 2, explanation: '10 × 650 mL = 6.5 L, leaving 1 L. Planning enough water matters more when conditions are hot or activity lasts longer.' },
  ],
  hard: [
    { eyebrow: 'Hard · Short answer', prompt: 'During a 100-minute session, Kai drinks 225 mL after every 20-minute interval. What is the total?', detail: 'Find the number of intervals, then enter a short answer.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1125', '1125 ml', '1.125 l'], sampleAnswer: '1.125 L', explanation: '100 ÷ 20 = 5 intervals, and 5 × 225 mL = 1,125 mL.' },
    { eyebrow: 'Hard · Multi-step percent', prompt: 'A 2.4 L supply is shared. Priya uses 35%, then gives ¼ of her share to a teammate. How much does Priya keep?', detail: 'Find 35% of 2.4 L, then keep three quarters of that amount.', answers: ['560 mL', '630 mL', '720 mL', '840 mL'], correct: 1, explanation: '35% of 2,400 mL is 840 mL; ¾ of 840 mL is 630 mL. Shared supplies should still be planned around each person’s needs.' },
    { eyebrow: 'Hard · Team logistics', prompt: 'Twelve athletes each take three 180 mL water breaks. If the cooler started with 8 L, how much remains?', detail: 'Find the team total, convert units, and subtract.', answers: ['1.34 L', '1.52 L', '1.7 L', '2.48 L'], correct: 1, explanation: '12 × 3 × 180 mL = 6,480 mL. From 8,000 mL, that leaves 1,520 mL, or 1.52 L.' },
    { eyebrow: 'Hard · Short answer', prompt: 'A sentient moon-base watermelon sets a fictional 2.4 L total. It contributes 18% through fruit. How much must beverages provide?', detail: 'Find the remaining 82%. Do not anger the watermelon.', answers: [], correct: -1, kind: 'short', acceptedAnswers: ['1968', '1968 ml', '1.968 l'], sampleAnswer: '1.968 L', explanation: '82% of 2.4 L is 1.968 L.' },
    { eyebrow: 'Hard · Sasquatch audit', prompt: 'A hiker carries 1.8 L while a mathematically gifted Sasquatch audits seven 220 mL breaks. How much remains after break seven?', detail: 'Multiply, subtract, and show the Sasquatch your receipt.', answers: ['220 mL', '240 mL', '260 mL', '280 mL'], correct: 2, explanation: '7 × 220 mL = 1,540 mL, leaving 260 mL. Checking a container’s capacity before activity helps avoid running short.' },
    { eyebrow: 'Hard · Camel time paradox', prompt: 'A time-traveling camel uses 160 mL at each of four breaks, then lands in a hotter timeline requiring 25% more. What is the new total?', detail: 'Solve before the camel creates another hydration timeline.', answers: ['720 mL', '760 mL', '800 mL', '840 mL'], correct: 2, explanation: '4 × 160 mL = 640 mL; increasing it by 25% gives 800 mL. People often need more water in heat, though no single amount fits everyone.' },
  ],
}

// initializes difficulty, establishes amount of questions for each difficulty, the multiplier for points, and the order of each difficulty.
const difficultyLabels: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const questionCount = 6
const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard']
const difficultyMultiplier: Record<Difficulty, number> = { easy: 1, medium: 1.5, hard: 2 }

// Keep the learning takeaway separate from the math explanation so every answer
// is followed by one clear hydration fact, regardless of the question format.
const hydrationFactsByDifficulty: Record<Difficulty, string[]> = {
  easy: [
    'Water helps the body regulate its temperature.',
    'Regular drink breaks can make it easier to remember to hydrate during activity.',
    'Thirst is one signal the body uses to prompt fluid intake.',
    'Water-rich foods, including many fruits and vegetables, contribute to fluid intake.',
    'Plain water hydrates without adding sugar or calories.',
    'Carrying a refillable bottle can make water easier to access throughout the day.',
  ],
  medium: [
    'Drinking before, during, and after exercise can help replace fluid lost through sweat.',
    'Sweating is one way the body cools itself, and it also causes fluid loss.',
    'Hot weather and physical activity can increase fluid needs.',
    'A planned bottle or break schedule can help people remember to drink during long activities.',
    'Fluids come from both drinks and water-rich foods.',
    'Individual hydration needs vary with factors such as activity, weather, age, and health.',
  ],
  hard: [
    'Longer or more intense activity usually causes more fluid loss through sweat.',
    'Sharing a water supply still requires planning enough fluid for each person.',
    'Checking bottle and cooler capacities can help a group avoid running out of water.',
    'Many fruits contain a high percentage of water and contribute to overall fluid intake.',
    'Starting an activity with enough water is easier than finding more after the supply runs low.',
    'People often need more fluid in hot conditions, but there is no single amount for everyone.',
  ],
}

// Later and harder questions receive less time, but never fewer than 12 seconds.
const getTimeLimit = (difficulty: Difficulty, questionIndex: number) => Math.max(12, ({ easy: 35, medium: 30, hard: 26 }[difficulty]) - questionIndex * 3)

// A quick correct answer moves the player up; a wrong answer moves them down.
const adaptDifficulty = (difficulty: Difficulty, correct: boolean, fast: boolean) => {
  const currentIndex = difficultyOrder.indexOf(difficulty)
  const nextIndex = correct && fast ? Math.min(currentIndex + 1, difficultyOrder.length - 1) : !correct ? Math.max(currentIndex - 1, 0) : currentIndex
  return difficultyOrder[nextIndex]
}

// Remove differences in spacing, capitalization, and unit spelling before grading typed answers.
const normalizeAnswer = (answer: string) => answer.toLowerCase().replace(/,/g, '').replace(/millilit(?:er|re)s?/g, 'ml').replace(/lit(?:er|re)s?/g, 'l').replace(/\s+/g, '').trim()

// Grade both question formats through one function.
const answerIsCorrect = (question: Question, answer: number | string) => {
  if (question.kind !== 'short') return answer === question.correct
  const response = normalizeAnswer(String(answer))
  return question.acceptedAnswers?.some((accepted) => normalizeAnswer(accepted) === response) ?? false
}

type IconName = 'drop' | 'bolt' | 'clock' | 'arrow' | 'check' | 'refresh' | 'sparkle'

// Reusable SVG icons keep the interface consistent without an external icon package.
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
  // SCREEN STATE: controls whether React displays the home, quiz, or results screen.
  const [screen, setScreen] = useState<'home' | 'quiz' | 'results'>('home')

  // QUIZ STATE: remembers the chosen starting level, current adaptive level, and question.
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>('medium')
  const [current, setCurrent] = useState(0)

  // ANSWER STATE: stores the current response plus the complete run history.
  const [selected, setSelected] = useState<number | null>(null)
  const [shortResponse, setShortResponse] = useState('')
  const [submittedShortAnswer, setSubmittedShortAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Array<number | string>>([])
  const [playedQuestions, setPlayedQuestions] = useState<Question[]>([])

  // GAME STATE: live score, streak, countdown, response times, and personal-best data.
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [timeLeft, setTimeLeft] = useState(() => getTimeLimit('medium', 0))
  const [timedOut, setTimedOut] = useState(false)
  const [answerTimes, setAnswerTimes] = useState<number[]>([])
  const [bestPoints, setBestPoints] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  // DERIVED VALUES: calculated from state instead of being stored separately.
  const score = answers.reduce<number>((total, answer, index) => total + (playedQuestions[index] && answerIsCorrect(playedQuestions[index], answer) ? 1 : 0), 0)
  const question = questionsByDifficulty[activeDifficulty][current]
  const hydrationFact = hydrationFactsByDifficulty[activeDifficulty][current]
  const hasAnswered = selected !== null || submittedShortAnswer !== null
  const currentAnswer = question.kind === 'short' ? submittedShortAnswer : selected
  const isCorrect = currentAnswer !== null && answerIsCorrect(question, currentAnswer)
  const correctAnswers = Array.from({ length: questionCount }, (_, index) => playedQuestions[index] !== undefined && answers[index] !== undefined && answerIsCorrect(playedQuestions[index], answers[index]))
  const answeredFast = timeLeft >= Math.ceil(getTimeLimit(activeDifficulty, current) * .45)
  const nextAdaptiveDifficulty = hasAnswered ? adaptDifficulty(activeDifficulty, isCorrect, answeredFast) : activeDifficulty

  // Add speed/streak bonuses for correct answers; subtract a scaled penalty for wrong answers.
  const awardAnswer = useCallback((correct: boolean) => {
    const multiplier = difficultyMultiplier[activeDifficulty]
    if (correct) setPoints((value) => value + Math.round((100 + timeLeft * 4 + streak * 25) * multiplier))
    else setPoints((value) => Math.max(0, value - Math.round(50 * multiplier)))
    setStreak(correct ? streak + 1 : 0)
  }, [activeDifficulty, streak, timeLeft])

  // Reset every run-specific value and open the quiz screen.
  const begin = useCallback(() => {
    const savedBest = Number(localStorage.getItem(`aquamath-best-${difficulty}`) ?? 0)

    setCurrent(0)
    setActiveDifficulty(difficulty)
    setSelected(null)
    setShortResponse('')
    setSubmittedShortAnswer(null)
    setAnswers([])
    setPlayedQuestions([])
    setAnswerTimes([])
    setStreak(0)
    setPoints(0)
    setBestPoints(savedBest)
    setIsNewBest(false)
    setShareStatus('')
    setTimedOut(false)
    setTimeLeft(getTimeLimit(difficulty, 0))
    setScreen('quiz')
  }, [difficulty])

  // Record and grade a multiple-choice answer.
  const choose = useCallback((index: number) => {
    if (selected !== null) return

    const correct = index === question.correct
    const secondsUsed = getTimeLimit(activeDifficulty, current) - timeLeft

    setSelected(index)
    setAnswers((oldAnswers) => [...oldAnswers, index])
    setPlayedQuestions((oldQuestions) => [...oldQuestions, question])
    setAnswerTimes((oldTimes) => [...oldTimes, secondsUsed])
    awardAnswer(correct)
  }, [activeDifficulty, awardAnswer, current, question, selected, timeLeft])

  // Record and grade a typed short answer when its form is submitted.
  const submitShortAnswer = useCallback((event: FormEvent) => { event.preventDefault(); const response = shortResponse.trim(); if (!response || submittedShortAnswer !== null) return; const correct = answerIsCorrect(question, response); setSubmittedShortAnswer(response); setAnswers((prev) => [...prev, response]); setPlayedQuestions((previous) => [...previous, question]); setAnswerTimes((previous) => [...previous, getTimeLimit(activeDifficulty, current) - timeLeft]); awardAnswer(correct) }, [activeDifficulty, awardAnswer, current, question, shortResponse, submittedShortAnswer, timeLeft])

  // Move to the next adaptive question, or save the best score and show results.
  const next = useCallback(() => {
    const isLastQuestion = current === questionCount - 1

    if (isLastQuestion) {
      const savedBest = Number(localStorage.getItem(`aquamath-best-${difficulty}`) ?? 0)
      const newBest = points > savedBest

      if (newBest) localStorage.setItem(`aquamath-best-${difficulty}`, String(points))
      setBestPoints(Math.max(points, savedBest))
      setIsNewBest(newBest)
      setScreen('results')
      return
    }

    const nextQuestion = current + 1
    setCurrent(nextQuestion)
    setActiveDifficulty(nextAdaptiveDifficulty)
    setSelected(null)
    setShortResponse('')
    setSubmittedShortAnswer(null)
    setTimedOut(false)
    setTimeLeft(getTimeLimit(nextAdaptiveDifficulty, nextQuestion))
  }, [current, difficulty, nextAdaptiveDifficulty, points])

  // Use the device share menu when available, then fall back to copying text.
  const shareResults = async () => { const text = `I scored ${points.toLocaleString()} points on an AquaMath adaptive run (${score}/${questionCount} correct). Think you can beat my current?`; try { if (navigator.share) await navigator.share({ title: 'AquaMath challenge', text }); else { await navigator.clipboard.writeText(text); setShareStatus('Challenge copied!') } } catch (error) { if (error instanceof Error && error.name !== 'AbortError') setShareStatus('Could not share this time') } }

  // TIMER EFFECT: runs once per second. At zero it records a wrong answer automatically.
  useEffect(() => {
    if (screen !== 'quiz' || hasAnswered || timeLeft <= 0) return
    const timer = window.setTimeout(() => {
      if (timeLeft > 1) { setTimeLeft((value) => value - 1); return }
      setTimeLeft(0)
      setTimedOut(true)
      setAnswers((previous) => [...previous, '__timeout__'])
      setPlayedQuestions((previous) => [...previous, question])
      setAnswerTimes((previous) => [...previous, getTimeLimit(activeDifficulty, current)])
      setStreak(0)
      setPoints((value) => Math.max(0, value - Math.round(50 * difficultyMultiplier[activeDifficulty])))
      if (question.kind === 'short') setSubmittedShortAnswer('Time ran out!')
      else setSelected(-1)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [activeDifficulty, current, hasAnswered, question, screen, timeLeft])

  // KEYBOARD EFFECT: A-D selects answers, while Enter advances after feedback appears.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (screen !== 'quiz' || event.repeat) return
      if (hasAnswered && event.key === 'Enter') { event.preventDefault(); next(); return }
      if (hasAnswered || question.kind === 'short') return
      const answerIndex = ['a', 'b', 'c', 'd'].indexOf(event.key.toLowerCase())
      if (answerIndex >= 0 && answerIndex < question.answers.length) { event.preventDefault(); choose(answerIndex) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [choose, hasAnswered, next, question.answers.length, question.kind, screen])

  const timerWarning = screen === 'quiz' && !hasAnswered && timeLeft <= 10

  // React conditionally renders one of the three screens below from the `screen` state.
  return <main className={`app app--${screen} ${timerWarning ? 'timer-warning' : ''}`}>
    <nav className="nav" aria-label="Main navigation">
      <button className="brand" onClick={() => setScreen('home')} aria-label="AquaMath home"><span className="brand-mark"><Icon name="drop" size={19} /></span><span>Aqua<span>Math</span></span></button>
      <div className="nav-right">{screen === 'quiz' && <span className="question-count">Adaptive: {difficultyLabels[activeDifficulty]} · Question {current + 1} of {questionCount}</span>}<div className="nav-pill"><Icon name="sparkle" size={14}/> Learn. Solve. Sip.</div></div>
    </nav>

    {screen === 'home' && <section className="home">
      <div className="hero-copy"><h1>AquaMath<br/><em>Learn about proper hydration and math.</em></h1><p className="hero-text">Answer six timed word problems about water and hydration. The questions can get harder or easier depending on how you do.</p><fieldset className="difficulty-picker"><legend>Choose a starting difficulty</legend><div>{(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => <button key={level} type="button" className={difficulty === level ? 'active' : ''} onClick={() => setDifficulty(level)} aria-pressed={difficulty === level}>{difficultyLabels[level]}</button>)}</div></fieldset><button className="primary-button" onClick={begin}>Start quiz</button><p className="tiny-note">Six questions · No account needed</p></div>
      <div className="simple-bottle" aria-hidden="true"><div className="simple-bottle-cap"/><div className="simple-bottle-water"/></div>
      <section className="impact-story"><div className="impact-intro"><span>Why we made it</span><h2>Math is easier when it has a purpose.</h2><p>This quiz combines normal math practice with basic hydration information.</p></div><div className="impact-card"><b>1. Real examples</b><h3>Use math in a situation</h3><p>The questions use conversions, fractions, rates, and percentages with water.</p></div><div className="impact-card"><b>2. Changing difficulty</b><h3>The level follows your answers</h3><p>Quick correct answers raise the level. Wrong answers lower it.</p></div><div className="impact-card"><b>3. Explanations</b><h3>Check your work</h3><p>After each answer, the quiz shows the calculation and a hydration fact.</p></div></section>
    </section>}

    {screen === 'quiz' && <section className="quiz-shell">
      <div className="quiz-topline"><button className="exit-button" onClick={() => setScreen('home')}>← Exit</button><span className="keyboard-hint">A–D to answer · Enter to continue</span><div className="quiz-hud"><span className="points-pill">{points.toLocaleString()} pts</span><span className="streak"><Icon name="bolt" size={16}/>{streak} streak</span><span className={`timer-pill ${timerWarning ? 'is-low' : ''}`} role="timer" aria-live={timerWarning ? 'assertive' : 'off'}><Icon name="clock" size={15}/>{timeLeft}s</span></div></div>
      <div className="progress-track"><span style={{ width: `${((current + (hasAnswered ? 1 : 0)) / questionCount) * 100}%` }} /></div>
      <article className="quiz-card">
        <span className="quiz-eyebrow">{question.eyebrow}</span><h2>{question.prompt}</h2><p className="question-detail">{question.detail}</p><QuizVisual timeLeft={timeLeft} timeLimit={getTimeLimit(activeDifficulty, current)} urgent={timerWarning}/><Scratchpad key={`${activeDifficulty}-${current}`}/>
        {question.kind === 'short' ? <form className="short-answer-form" onSubmit={submitShortAnswer}>
          <label htmlFor="short-answer">Your answer</label>
          <div className="short-answer-entry"><input id="short-answer" value={shortResponse} onChange={(event) => setShortResponse(event.target.value)} placeholder="Example: 750 mL" disabled={submittedShortAnswer !== null} autoComplete="off"/><button type="submit" disabled={!shortResponse.trim() || submittedShortAnswer !== null}>Check answer</button></div>
          {submittedShortAnswer !== null && <div className={`answer-comparison ${isCorrect ? 'is-correct' : 'is-wrong'}`} role="status"><div><small>Your answer</small><strong>{submittedShortAnswer}</strong></div><span aria-hidden="true">→</span><div><small>Correct answer</small><strong>{question.sampleAnswer}</strong></div><b>{isCorrect ? 'Correct' : 'Not quite'}</b></div>}
        </form> : <div className="answer-grid">{question.answers.map((answer, index) => { const state = selected === null ? '' : index === question.correct ? 'correct' : index === selected ? 'wrong' : 'muted'; return <button key={answer} className={`answer ${state}`} onClick={() => choose(index)} disabled={selected !== null}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{answer}{selected !== null && (index === question.correct || index === selected) && <span className="answer-status"><Icon name={index === question.correct ? 'check' : 'drop'} size={16}/></span>}</button> })}</div>}
        {hasAnswered && <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`} role="status"><span className="feedback-icon"><Icon name={isCorrect ? 'check' : 'drop'} /></span><div className="feedback-copy"><b>{timedOut ? 'Time is up.' : isCorrect ? 'Correct!' : 'Not quite.'}</b><p>{question.explanation}</p><aside className="hydration-fact"><span className="hydration-fact-icon"><Icon name="drop" size={20}/></span><span><strong>Hydration fact</strong><span>{hydrationFact}</span></span></aside>{current < questionCount - 1 && <span className="adaptive-next">Next level: {difficultyLabels[nextAdaptiveDifficulty]}</span>}</div><button onClick={next}>{current === questionCount - 1 ? 'See results' : 'Next question'} <Icon name="arrow" size={18}/></button></div>}
      </article>
    </section>}

    {screen === 'results' && <section className="results"><div className="result-drop"><Icon name="drop" size={54}/><span>{score}/{questionCount}</span></div><span className="quiz-eyebrow">Quiz complete</span><h2>{score === questionCount ? 'Perfect score!' : score >= 4 ? 'Nice job!' : 'Keep practicing!'}</h2><p>You answered <b>{score} out of {questionCount}</b> questions correctly.</p><div className="score-bar"><span style={{width: `${(score/questionCount)*100}%`}} /></div><div className="result-stats"><div><strong>{Math.round((score/questionCount)*100)}%</strong><small>accuracy</small></div><div><strong>{questionCount}</strong><small>questions</small></div><div><strong>{points.toLocaleString()}</strong><small>{isNewBest ? 'new best' : `best ${bestPoints.toLocaleString()}`}</small></div></div><ResultInsights correctAnswers={correctAnswers} answerTimes={answerTimes} points={points} isNewBest={isNewBest} onShare={shareResults} shareStatus={shareStatus}/><button className="primary-button" onClick={begin}><Icon name="refresh" size={19}/> Play again</button><button className="text-button" onClick={() => setScreen('home')}>Change difficulty</button><p className="health-note">These are math examples, not personal water targets. Hydration needs are different for each person.</p></section>}
  </main>
}
export default App
