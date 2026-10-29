import mongoose from 'mongoose'

// Ek question ka poora hisaab: sawal, user ka jawab, AI ka feedback
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  topic: { type: String, required: true }, // e.g. "React"
  subtopic: { type: String, required: true }, // e.g. "Hooks", "Closures"
  answer: { type: String, default: '' },
  score: { type: Number, min: 0, max: 10, default: null },
  feedback: {
    good: { type: String, default: '' },
    missing: { type: String, default: '' },
    ideal: { type: String, default: '' },
  },
})

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true }, // e.g. "React"
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    isPractice: { type: Boolean, default: false }, // weak-topic practice session
    questions: [questionSchema],
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    avgScore: { type: Number, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Session', sessionSchema)
