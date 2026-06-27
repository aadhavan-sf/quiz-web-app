# AI Interview Practice

A modern AI-powered interview preparation platform. Generate fresh, high-quality interview questions for any topic using AI.

## Features

- **Two practice modes:** MCQ Practice and Interview Practice
- AI-generated questions for any technical or professional topic
- **MCQ Mode:** Multiple-choice with instant feedback and explanations
- **Interview Mode:** Open-ended questions, typed answers, AI evaluation, and hiring-manager report
- Configurable question count (25–200) and difficulty (Easy, Intermediate, Advanced, Mixed)
- Dark and light mode
- Progress saved in Local Storage

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Groq API (free) or OpenAI API
- **Deployment:** [Render](https://render.com) (free tier — frontend + API in one service)

## Local Development

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add a free `GROQ_API_KEY` to `.env` (get one at [console.groq.com](https://console.groq.com) — no credit card)

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
```

3. Install and run:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Deploy to Render (free)

1. Push this repo to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**
3. Connect the `quiz-web-app` repository — Render reads `render.yaml` automatically
4. Or create a **Web Service** manually:
   - **Build command:** `npm ci --include=dev && npm run build`
   - **Start command:** `NODE_ENV=production npm start`
   - **Plan:** Free
5. Add environment variables in **Environment**:
   - `AI_PROVIDER` = `groq`
   - `GROQ_API_KEY` = your key from [console.groq.com/keys](https://console.groq.com/keys)
6. Deploy — your app URL will be like `https://quiz-web-app.onrender.com`

**Free tier note:** The service sleeps after 15 minutes of no traffic. The first visit after sleep may take 30–60 seconds to wake up.

## Optional: GitHub Pages (frontend only)

GitHub Pages cannot run the API. To use `aadhavan-sf.github.io/quiz-web-app` as a frontend mirror, set a GitHub Actions secret `RENDER_API_URL` to your Render app URL (e.g. `https://quiz-web-app.onrender.com`). The primary full-stack host should be **Render**.

## Project Structure

```
├── render.yaml           # Render deployment config
├── server/               # Express API + production static hosting
│   └── services/         # AI prompt engineering & generation
├── shared/               # Shared TypeScript types
└── src/                  # React frontend
```

## API

`GET /api/health` — Check AI configuration

`POST /api/generate-questions` — MCQ question generation

`POST /api/interview/start` — Start interview session (first question)

`POST /api/interview/evaluate` — Evaluate an interview answer

`POST /api/interview/report` — Generate final interview report
