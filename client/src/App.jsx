import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Interview from './pages/Interview.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Protected({ children }) {
  const { user, checking } = useAuth()
  if (checking) return <p className="center muted">Loading...</p>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/interview/:id" element={<Protected><Interview /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
