import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const makeToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email })
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e)

router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name) return res.status(400).json({ message: 'Please enter your name' })
  if (!emailOk(email)) return res.status(400).json({ message: 'Please enter a valid email' })
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'This email is already registered' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed })
  res.status(201).json({ token: makeToken(user), user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const user = await User.findOne({ email })
  const ok = user && (await bcrypt.compare(password, user.password))
  if (!ok) return res.status(401).json({ message: 'Email or password is wrong' })

  res.json({ token: makeToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) return res.status(401).json({ message: 'User not found' })
  res.json({ user: publicUser(user) })
})

export default router
