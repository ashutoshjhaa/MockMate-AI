import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

const TOPICS = ['React', 'Node.js', 'JavaScript', 'MongoDB', 'DSA', 'DBMS', 'Operating Systems', 'HR']

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState('React')
  const [custom, setCustom] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [sessions, setSessions] = useState([])
  const [busy, setBusy] = useState('') // '', 'start', 'weak'
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/sessions').then(setSessions).catch(() => {})
  }, [])

  const start = async (e) => {
    e.preventDefault()
    setError('')
    setBusy('start')
    try {
      const s = await api.post('/sessions', { topic: custom.trim() || topic, difficulty })
      navigate('/interview/' + s._id)
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  const practiceWeak = async () => {
    setError('')
    setBusy('weak')
    try {
      const s = await api.post('/sessions/practice-weak')
      navigate('/interview/' + s._id)
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  return (
    <>
      <h1>Hi {user.name.split(' ')[0]}, ready to practice?</h1>
      <p className="muted">Pick a topic and you will get 5 questions. Answer in your own words, the AI will score them.</p>

      <form onSubmit={start} className="card stack">
        <div>
          <p className="label">Topic</p>
          <div className="chips">
            {TOPICS.map((t) => (
              <button
                type="button"
                key={t}
                className={'chip' + (topic === t && !custom ? ' active' : '')}
                onClick={() => {
                  setTopic(t)
                  setCustom('')
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label>
          Or type your own topic
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. Express middleware"
            maxLength={50}
          />
        </label>

        <label>
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn" disabled={!!busy}>
          {busy === 'start' ? 'Preparing your questions...' : 'Start interview'}
        </button>
      </form>

      <div className="card row-between">
        <div>
          <h3>Practice weak areas</h3>
          <p className="muted small">New questions only on the topics where your scores are low.</p>
        </div>
        <button className="btn secondary" onClick={practiceWeak} disabled={!!busy}>
          {busy === 'weak' ? 'Preparing...' : 'Practice'}
        </button>
      </div>

      <h2>Recent interviews</h2>
      {sessions.length === 0 ? (
        <p className="muted">Nothing here yet. Your first interview will show up here.</p>
      ) : (
        <ul className="list">
          {sessions.map((s) => (
            <li key={s._id}>
              <Link to={'/interview/' + s._id}>
                <span>
                  {s.topic}
                  <span className="muted small"> · {s.difficulty} · {new Date(s.createdAt).toLocaleDateString()}</span>
                </span>
                <span className="muted">
                  {s.status === 'completed' ? `${s.avgScore}/10` : 'In progress'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
