import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'

export default function Interview() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [index, setIndex] = useState(0) // abhi kaunsa sawal dikh raha hai
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/sessions/' + id)
      .then((s) => {
        setSession(s)
        // pehla bina-jawab wala sawal, sab ho gaye to summary (index = length)
        const firstOpen = s.questions.findIndex((q) => q.score === null)
        setIndex(firstOpen === -1 ? s.questions.length : firstOpen)
      })
      .catch((err) => setError(err.message))
  }, [id])

  if (error && !session) return <p className="error">{error}</p>
  if (!session) return <p className="muted">Loading...</p>

  const total = session.questions.length
  const q = session.questions[index]

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const updated = await api.post(`/sessions/${id}/questions/${q._id}/answer`, { answer })
      setSession(updated)
      setAnswer('')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  // ---------- Summary ----------
  if (!q) {
    return (
      <>
        <h1>Interview finished</h1>
        <div className="card center">
          <p className="muted">Your average score</p>
          <p className="big">{session.avgScore}<span className="muted"> / 10</span></p>
          <p className="muted small">{session.topic} · {session.difficulty}</p>
        </div>

        <h2>Question by question</h2>
        {session.questions.map((item, i) => (
          <details key={item._id} className="card">
            <summary>
              <span>{i + 1}. {item.text}</span>
              <span className={'score ' + scoreClass(item.score)}>{item.score}/10</span>
            </summary>
            <Feedback q={item} showAnswer />
          </details>
        ))}

        <div className="row">
          <Link to="/" className="btn">New interview</Link>
          <Link to="/dashboard" className="btn secondary">See progress</Link>
        </div>
      </>
    )
  }

  // ---------- Ek sawal ----------
  const answered = q.score !== null

  return (
    <>
      <p className="muted small">
        {session.topic} · Question {index + 1} of {total}
      </p>
      <div className="progress"><div style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} /></div>

      <h2 className="question">{q.text}</h2>

      {!answered ? (
        <form onSubmit={submit} className="stack">
          <textarea
            rows={8}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer like you would say it in an interview..."
            maxLength={3000}
            disabled={busy}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy || answer.trim().length < 3}>
            {busy ? 'Checking your answer...' : 'Submit answer'}
          </button>
        </form>
      ) : (
        <>
          <div className="card">
            <p className="label">Your answer</p>
            <p className="pre">{q.answer}</p>
          </div>
          <div className="card">
            <p className={'score big-score ' + scoreClass(q.score)}>{q.score}/10</p>
            <Feedback q={q} />
          </div>
          <button className="btn" onClick={() => setIndex(index + 1)}>
            {index + 1 < total ? 'Next question' : 'Finish'}
          </button>
        </>
      )}
    </>
  )
}

function Feedback({ q, showAnswer }) {
  return (
    <div className="feedback">
      {showAnswer && q.answer && (
        <>
          <p className="label">Your answer</p>
          <p className="pre">{q.answer}</p>
        </>
      )}
      <p className="label">What went well</p>
      <p>{q.feedback.good}</p>
      <p className="label">What was missing</p>
      <p>{q.feedback.missing}</p>
      <p className="label">A good answer would be</p>
      <p>{q.feedback.ideal}</p>
    </div>
  )
}

export function scoreClass(score) {
  if (score >= 7) return 'good'
  if (score >= 5) return 'ok'
  return 'low'
}
