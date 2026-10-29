import { Router } from 'express'
import mongoose from 'mongoose'
import Session from '../models/Session.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const WEAK_BELOW = 6 // is score se kam average = weak area

// Sirf wo sawal jinka jawab diya ja chuka hai
function answeredQuestions(userId) {
  return [
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$questions' },
    { $match: { 'questions.score': { $ne: null } } },
  ]
}

export async function getWeakAreas(userId) {
  return Session.aggregate([
    ...answeredQuestions(userId),
    {
      $group: {
        _id: { topic: '$questions.topic', subtopic: '$questions.subtopic' },
        avg: { $avg: '$questions.score' },
        count: { $sum: 1 },
      },
    },
    { $match: { avg: { $lt: WEAK_BELOW } } },
    { $sort: { avg: 1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        topic: '$_id.topic',
        subtopic: '$_id.subtopic',
        avg: { $round: ['$avg', 1] },
        count: 1,
      },
    },
  ])
}

router.get('/', async (req, res) => {
  const [totals, byTopic, weak, completed] = await Promise.all([
    Session.aggregate([
      ...answeredQuestions(req.userId),
      { $group: { _id: null, answered: { $sum: 1 }, avg: { $avg: '$questions.score' } } },
    ]),
    Session.aggregate([
      ...answeredQuestions(req.userId),
      { $group: { _id: '$questions.topic', avg: { $avg: '$questions.score' }, count: { $sum: 1 } } },
      { $sort: { avg: -1 } },
      { $project: { _id: 0, topic: '$_id', avg: { $round: ['$avg', 1] }, count: 1 } },
    ]),
    getWeakAreas(req.userId),
    Session.find({ user: req.userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('topic avgScore createdAt'),
  ])

  res.json({
    answered: totals[0]?.answered || 0,
    avgScore: totals[0] ? Math.round(totals[0].avg * 10) / 10 : null,
    sessionsCompleted: completed.length,
    byTopic,
    weak,
    recent: completed.reverse(), // purane se naye, trend ke liye
  })
})

export default router
