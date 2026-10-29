import { Router } from 'express'
import mongoose from 'mongoose'
import Session from '../models/Session.js'
import { requireAuth } from '../middleware/auth.js'
import { generateQuestions, evaluateAnswer } from '../services/gemini.js'
import { getWeakAreas } from './stats.js'

const router = Router()
router.use(requireAuth)

const DIFFICULTIES = ['easy', 'medium', 'hard']
const QUESTION_COUNT = 5

// Kisi aur ki session na dikhe, isliye har jagah user bhi match karte hain
async function findMySession(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: 'Session not found' })
    return null
  }
  const session = await Session.findOne({ _id: req.params.id, user: req.userId })
  if (!session) res.status(404).json({ message: 'Session not found' })
  return session
}

// Naya interview shuru
router.post('/', async (req, res) => {
  const topic = String(req.body.topic || '').trim().slice(0, 50)
  const difficulty = DIFFICULTIES.includes(req.body.difficulty) ? req.body.difficulty : 'medium'
  if (!topic) return res.status(400).json({ message: 'Please choose or type a topic' })

  const questions = await generateQuestions({ topic, difficulty, count: QUESTION_COUNT })
  const session = await Session.create({
    user: req.userId,
    topic,
    difficulty,
    questions: questions.map((q) => ({ ...q, topic })),
  })
  res.status(201).json(session)
})

// Kamzor topics pe practice
router.post('/practice-weak', async (req, res) => {
  const weak = await getWeakAreas(req.userId)
  if (weak.length === 0) {
    return res.status(400).json({
      message: 'No weak areas yet. Finish a few interviews first, then come back here.',
    })
  }

  // topic -> uske weak subtopics
  const groups = new Map()
  for (const w of weak) {
    if (!groups.has(w.topic)) groups.set(w.topic, [])
    groups.get(w.topic).push(w.subtopic)
  }
  const perGroup = Math.max(2, Math.ceil(QUESTION_COUNT / groups.size))

  const batches = await Promise.all(
    [...groups].map(async ([topic, subtopics]) => {
      const qs = await generateQuestions({ topic, difficulty: 'medium', count: perGroup, subtopics })
      return qs.map((q) => ({ ...q, topic }))
    })
  )
  const questions = batches.flat().slice(0, QUESTION_COUNT)

  const session = await Session.create({
    user: req.userId,
    topic: 'Weak areas practice',
    difficulty: 'medium',
    isPractice: true,
    questions,
  })
  res.status(201).json(session)
})

// Purane sessions ki list
router.get('/', async (req, res) => {
  const sessions = await Session.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('topic difficulty isPractice status avgScore createdAt questions.score')
  res.json(sessions)
})

router.get('/:id', async (req, res) => {
  const session = await findMySession(req, res)
  if (session) res.json(session)
})

// Ek sawal ka jawab do, AI evaluate karega
router.post('/:id/questions/:qid/answer', async (req, res) => {
  const session = await findMySession(req, res)
  if (!session) return

  const question = session.questions.id(req.params.qid)
  if (!question) return res.status(404).json({ message: 'Question not found' })
  if (question.score !== null) return res.status(409).json({ message: 'This question is already answered' })

  const answer = String(req.body.answer || '').trim()
  if (answer.length < 3) return res.status(400).json({ message: 'Please write your answer first' })
  if (answer.length > 3000) return res.status(400).json({ message: 'Please keep your answer under 3000 characters' })

  const result = await evaluateAnswer({
    topic: question.topic,
    difficulty: session.difficulty,
    question: question.text,
    answer,
  })

  question.answer = answer
  question.score = result.score
  question.feedback = { good: result.good, missing: result.missing, ideal: result.ideal }

  // Saare sawal ho gaye to session complete
  if (session.questions.every((q) => q.score !== null)) {
    const total = session.questions.reduce((sum, q) => sum + q.score, 0)
    session.avgScore = Math.round((total / session.questions.length) * 10) / 10
    session.status = 'completed'
  }

  await session.save()
  res.json(session)
})

export default router
