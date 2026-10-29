# MockMate AI

AI mock interview coach (MERN + Gemini API). Topic chuno, AI 5 questions banata hai,
tum jawab likhte ho, AI score (0-10) aur feedback deta hai, aur kamzor topics pe
alag se practice karwata hai.

## Run kaise kare

Pehle MongoDB chalu hona chahiye (local MongoDB ya MongoDB Atlas ka URI).

**1. Server**
```bash
cd server
npm install
npm run dev        # http://localhost:5000
```
`server/.env` me ye values hain (agar nahi hai to `.env.example` copy karo):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mockmate
JWT_SECRET=koi_lamba_random_string
GEMINI_API_KEY=tumhari_key
GEMINI_MODEL=gemini-3.6-flash
```

**2. Client** (naye terminal me)
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

## Kaise kaam karta hai

1. `POST /api/sessions` -> Gemini ko prompt jaata hai, wo **JSON** me 5 questions deta hai
   (har question ka ek `subtopic` bhi, jaise "Hooks"). Sab MongoDB me save.
2. `POST /api/sessions/:id/questions/:qid/answer` -> answer Gemini ko jaata hai,
   wo JSON me `score`, `good`, `missing`, `ideal` deta hai. Save hota hai.
3. `GET /api/stats` -> MongoDB aggregation se topic-wise average aur weak areas
   (jis subtopic ka average 6 se kam hai).
4. `POST /api/sessions/practice-weak` -> sirf weak subtopics ke naye questions.

## Folder structure

```
server/src
  config/db.js          MongoDB connect
  models/               User, Session (questions session ke andar embedded)
  middleware/auth.js    JWT check
  services/gemini.js    prompts + JSON parsing + retry
  routes/               auth, sessions, stats
client/src
  pages/                Login, Home, Interview, Dashboard
  components/Navbar.jsx
  api.js, AuthContext.jsx, index.css
```

## Important

- Gemini key sirf **server** me hai (`server/.env`), browser me nahi jaati.
  `.env` ko kabhi GitHub pe push mat karna (`.gitignore` me already hai).
- Agar `gemini-3.6-flash` model tumhari key pe na chale, `GEMINI_MODEL` badal do.
