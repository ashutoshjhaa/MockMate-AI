# MockMate AI

An AI mock interview coach. Pick a topic, answer five interview questions in your own words, and get a score with honest feedback. The app remembers how you do, finds the topics where you are weak, and creates new questions just for those.

**Live demo:** https://mock-mate-ai-sandy.vercel.app

> The backend runs on a free Render plan, so it sleeps when nobody uses it. The first request after a break can take 30 to 60 seconds. After that it is fast.

<!--
Add your screenshots to a "screenshots" folder, then remove this comment:

![Home page](screenshots/home.png)
![Feedback page](screenshots/feedback.png)
![Progress page](screenshots/progress.png)
-->

## Why I built this

I was getting ready for campus placements and wanted more than a chatbot. Reading questions is easy, but I never knew how good my answers were or which topics needed more work. So I built an app where the AI does real jobs (creating questions and checking answers), and the results are saved and used to guide the next practice session.

## What it does

- Sign up and log in securely
- Choose a topic (React, Node.js, JavaScript, MongoDB, DSA, DBMS, Operating Systems, HR, or your own) and a difficulty
- Gemini creates five interview questions, each tagged with a subtopic like "Hooks" or "Closures"
- You write an answer and get a score from 0 to 10, what went well, what was missing, and a model answer
- Every interview is saved, so you can open old ones and read the feedback again
- A progress page shows your average score by topic and your weakest subtopics
- A "Practice weak areas" button creates a new interview only on those weak subtopics
- Simple, calm design that works on phones and follows your system dark mode

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini API |
| Auth | JWT, bcryptjs |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## How it works

```
Browser (React on Vercel)
        |   HTTPS + JWT token
        v
Express API (Node.js on Render)  ---->  Google Gemini API
        |
        v
MongoDB Atlas
```

1. **Start an interview.** The server asks Gemini for five questions and tells it to reply in JSON. The questions are saved in a new session.
2. **Answer a question.** The server sends the question and your answer to Gemini. Gemini returns a score, feedback and an ideal answer in JSON, and the server saves them.
3. **Find weak areas.** A MongoDB aggregation pipeline groups your answers by topic and subtopic and picks the ones with an average score below 6.
4. **Practice weak areas.** The server asks Gemini for new questions only on those subtopics.

A few details I care about:

- **The API key stays on the server.** The browser never sees the Gemini key.
- **Reliable AI output.** The prompts ask for a fixed JSON shape. The server cleans the response, checks every field, limits the score to 0 to 10, and retries once if something fails.
- **Answers are treated as data.** The prompt tells the model to ignore any instructions written inside a user's answer.
- **Users only see their own data.** Every query includes the user id from the token.

## API

| Method | Path | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and get a token |
| GET | `/api/auth/me` | Get the logged-in user |
| POST | `/api/sessions` | Start a new interview |
| POST | `/api/sessions/practice-weak` | Start an interview on weak subtopics |
| GET | `/api/sessions` | List recent interviews |
| GET | `/api/sessions/:id` | Get one interview |
| POST | `/api/sessions/:id/questions/:qid/answer` | Submit an answer and get feedback |
| GET | `/api/stats` | Topic averages, weak areas, recent scores |
| GET | `/api/health` | Check that the server is running |

All routes except register, login and health need the header `Authorization: Bearer <token>`.

## Project structure

```
mockmate-ai/
├── client/                  React app
│   ├── src/
│   │   ├── pages/           Login, Home, Interview, Dashboard
│   │   ├── components/      Navbar
│   │   ├── api.js           Helper for calling the backend
│   │   ├── AuthContext.jsx  Login state
│   │   └── index.css        All styles
│   └── vercel.json          Lets Vercel handle React Router pages
└── server/                  Express API
    └── src/
        ├── config/db.js     MongoDB connection
        ├── models/          User, Session
        ├── middleware/      JWT check
        ├── services/        Gemini prompts and parsing
        └── routes/          auth, sessions, stats
```

## Run it on your computer

You need Node.js 18 or newer, a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey), and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster works well).

**1. Clone the project**

```bash
git clone https://github.com/ashutoshjhaa/MockMate-AI.git
cd MockMate-AI
```

**2. Start the server**

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in your values:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

Then run:

```bash
npm run dev
```

You should see `MongoDB connected` and the server address.

**3. Start the client** (in a new terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. When running locally, Vite sends `/api` requests to the server on port 5000, so you do not need any extra setup.

If the model name does not work with your key, change `GEMINI_MODEL` to a model you have access to.

## Deployment

The app runs on three free services.

**Database: MongoDB Atlas**

- Create a free cluster and a database user.
- In Network Access, allow `0.0.0.0/0` so Render can connect.

**Backend: Render (Web Service)**

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `CLIENT_URL` (your Vercel URL, without a slash at the end)

**Frontend: Vercel**

- Root directory: `client`
- Environment variable: `VITE_API_URL` (your Render URL, without a slash at the end)

Both Render and Vercel redeploy automatically when you push to `main`.

## Notes

- Never commit your `.env` file. It is already in `.gitignore`.
- The free Gemini plan has usage limits. If you see "The AI did not respond", wait a little and try again.

## Ideas for the future

- Rate limiting and security headers
- Automated tests for the API
- Token in an httpOnly cookie instead of localStorage
- Voice answers
- Questions based on the user's resume
- Progress charts over time

## Author

**Ashutosh Jha**
GitHub: [@ashutoshjhaa](https://github.com/ashutoshjhaa) | LinkedIn: [ashutosh-jha-9a33bb284](https://linkedin.com/in/ashutosh-jha-9a33bb284)