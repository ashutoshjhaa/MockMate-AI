import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/stats').then(setStats).catch((err) => setError(err.message))
  }, [])

  const practiceWeak = async () => {
    setBusy(true)
    setError('')
    try {
      const s = await api.post('/sessions/practice-weak')
      navigate('/interview/' + s._id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (error && !stats) return <p className="error">{error}</p>
  if (!stats) return <p className="muted">Loading...</p>

  if (stats.answered === 0) {
    return (
      <>
        <h1>Your progress</h1>
        <p className="muted">Answer a few questions and your scores will show up here.</p>
      </>
    )
  }

  return (
    <>
      <h1>Your progress</h1>

      <div className="stats">
        <div className="card center">
          <p className="big">{stats.avgScore}</p>
          <p className="muted small">Average score</p>
        </div>
        <div className="card center">
          <p className="big">{stats.answered}</p>
          <p className="muted small">Questions answered</p>
        </div>
        <div className="card center">
          <p className="big">{stats.sessionsCompleted}</p>
          <p className="muted small">Interviews done</p>
        </div>
      </div>

      <h2>Score by topic</h2>
      <div className="card stack">
        {stats.byTopic.map((t) => (
          <Bar key={t.topic} label={t.topic} value={t.avg} note={`${t.count} answered`} />
        ))}
      </div>

      <h2>Needs more practice</h2>
      {stats.weak.length === 0 ? (
        <p className="muted">Nothing is below 6/10 right now. Nice.</p>
      ) : (
        <div className="card stack">
          {stats.weak.map((w) => (
            <Bar key={w.topic + w.subtopic} label={`${w.subtopic} (${w.topic})`} value={w.avg} weak />
          ))}
          {error && <p className="error">{error}</p>}
          <button className="btn" onClick={practiceWeak} disabled={busy}>
            {busy ? 'Preparing...' : 'Practice these topics'}
          </button>
        </div>
      )}

      {stats.recent.length > 1 && (
        <>
          <h2>Recent interviews</h2>
          <div className="card stack">
            {stats.recent.map((s) => (
              <Bar key={s._id} label={`${s.topic} · ${new Date(s.createdAt).toLocaleDateString()}`} value={s.avgScore} />
            ))}
          </div>
        </>
      )}
    </>
  )
}

function Bar({ label, value, note, weak }) {
  return (
    <div>
      <div className="row-between small">
        <span>{label}</span>
        <span className="muted">{value}/10{note ? ` · ${note}` : ''}</span>
      </div>
      <div className="bar"><div className={weak ? 'weak' : ''} style={{ width: `${value * 10}%` }} /></div>
    </div>
  )
}
