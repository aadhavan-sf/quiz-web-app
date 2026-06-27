# AI Interview Practice

A modern AI-powered interview preparation platform. Generate fresh, high-quality interview questions for any topic using AI.

## Features

- **Two practice modes:** MCQ Practice and Interview Practice
- AI-generated questions for any technical or professional topic
- **MCQ Mode:** Multiple-choice with instant feedback and explanations
- **Interview Mode:** Open-ended questions, voice recording, AI evaluation, and hiring-manager report
- Configurable question count (25–200) and difficulty (Easy, Intermediate, Advanced, Mixed)
- Dark and light mode
- Progress saved in Local Storage
- Deployable to Vercel

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Groq API (free) or OpenAI API
- **Deployment:** Vercel (serverless API + static frontend)

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

To use OpenAI instead, set `AI_PROVIDER=openai` and add `OPENAI_API_KEY`.

3. Install and run:

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Without an API key, the configure screen shows setup instructions.

## Deploy to Vercel

1. Import the repository to Vercel
2. Add `GROQ_API_KEY` (and optionally `AI_PROVIDER=groq`) in Project Settings → Environment Variables
3. Deploy

```bash
npm run deploy
```

## Project Structure

```
├── api/                  # Vercel serverless functions
├── server/               # Express API (local dev)
│   └── services/         # AI prompt engineering & generation
├── shared/               # Shared TypeScript types
└── src/                  # React frontend
    ├── components/
    ├── hooks/
    ├── pages/
    └── utils/
```

## API

`POST /api/generate-questions` — MCQ question generation

`POST /api/interview/start` — Start interview session (first question)

`POST /api/interview/evaluate` — Evaluate an interview answer

`POST /api/interview/report` — Generate final interview report
