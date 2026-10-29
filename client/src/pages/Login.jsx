import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' ya 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="narrow">
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="muted">
        Practice interview questions, get honest feedback, and see which topics need more work.
      </p>

      <form onSubmit={submit} className="card stack">
        {mode === 'register' && (
          <label>
            Name
            <input name="name" value={form.name} onChange={change} required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={change} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={change} required minLength={6} />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <p className="muted center">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          className="link-btn"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  )
}
