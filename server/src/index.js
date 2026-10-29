import 'dotenv/config'
import express from 'express'
import 'express-async-errors' // async route ke errors ko error handler tak pahunchata hai
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import statsRoutes from './routes/stats.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '50kb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/stats', statsRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.isAI ? 502 : 500).json({
    message: err.isAI
      ? 'The AI did not respond. Please try again in a moment.'
      : 'Something went wrong on the server.',
  })
})

const PORT = process.env.PORT || 5000
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Start nahi ho paya:', err.message)
    process.exit(1)
  })
