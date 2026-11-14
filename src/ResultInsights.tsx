import './result-insights.css'

type ResultInsightsProps = {
  correctAnswers: boolean[]
  answerTimes: number[]
  points: number
  isNewBest: boolean
  onShare: () => void
  shareStatus: string
}

export function ResultInsights({ correctAnswers, answerTimes, points, isNewBest, onShare, shareStatus }: ResultInsightsProps) {
  const averageTime = answerTimes.length ? Math.round(answerTimes.reduce((total, time) => total + time, 0) / answerTimes.length) : 0
  const score = correctAnswers.filter(Boolean).length
  const finishedStrong = correctAnswers.slice(-3).every(Boolean)
  const achievements = [
    score === correctAnswers.length && { icon: '◆', title: 'Perfect Pour', detail: 'Every answer correct' },
    averageTime > 0 && averageTime <= 12 && { icon: '⚡', title: 'Quick Current', detail: `${averageTime}s average response` },
    finishedStrong && { icon: '↗', title: 'Strong Finish', detail: 'Final three answered correctly' },
    isNewBest && { icon: '★', title: 'Personal Best', detail: `${points.toLocaleString()} points` },
  ].filter(Boolean) as Array<{ icon: string; title: string; detail: string }>

  return <section className="result-insights" aria-label="Performance breakdown">
    <div className="insights-heading"><div><span>Run breakdown</span><h3>See where you made waves</h3></div><div className="average-time"><strong>{averageTime}s</strong><small>average answer</small></div></div>
    <div className="question-recap">{correctAnswers.map((correct, index) => <div key={index} className={correct ? 'recap-correct' : 'recap-wrong'}><span>{correct ? '✓' : '×'}</span><b>Q{index + 1}</b><small>{answerTimes[index] ?? 0}s</small></div>)}</div>
    {achievements.length > 0 && <div className="achievement-list">{achievements.map((achievement) => <div key={achievement.title}><span>{achievement.icon}</span><p><b>{achievement.title}</b><small>{achievement.detail}</small></p></div>)}</div>}
    <div className="share-row"><button type="button" onClick={onShare}>Challenge a friend</button><span aria-live="polite">{shareStatus || 'No account · Scores stay on this device'}</span></div>
  </section>
}
