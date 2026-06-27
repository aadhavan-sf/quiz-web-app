# Power BI Interview Quiz

Practice 100 real Power BI interview questions with instant feedback and explanations.

## Live site

https://aadhavan-sf.github.io/quiz-web-app/

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## GitHub Pages setup (one-time)

If the live site shows a 404, enable Pages in the repo:

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run the latest workflow under **Actions**, or push a new commit

The site will be available at https://aadhavan-sf.github.io/quiz-web-app/

## Swap question banks

Replace `src/data/questions.json` with any JSON array using this schema:

```json
{
  "id": 1,
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": 0,
  "explanation": "..."
}
```

Regenerate Power BI questions:

```bash
npm run generate-questions
```
