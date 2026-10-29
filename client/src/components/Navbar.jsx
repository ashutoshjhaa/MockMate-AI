import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">MockMate <span>AI</span></Link>
        {user && (
          <nav>
            <NavLink to="/" end>Practice</NavLink>
            <NavLink to="/dashboard">Progress</NavLink>
            <button className="link-btn" onClick={logout}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  )
}
