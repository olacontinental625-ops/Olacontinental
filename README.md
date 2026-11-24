# Ola Continental Properties & Associates

Full-stack real estate, civil engineering, and AI consultation web application built with React, Vite, Tailwind CSS, Express, Google Gemini AI, and Cloud Firestore.

## Requirements

- **Node.js `>= 22.12.0`** (required by Vite 8 and native TypeScript server execution `node server.ts`)
- **Gemini API Key** (`GEMINI_API_KEY`) for **Ask Ola AI** live responses

## Environment Variables

Configure these in your hosting environment (or local `.env`, see `.env.example`):

- `GEMINI_API_KEY` — Google Gemini API key (required for Ola AI Assistant)
- `PORT` — Server port (defaults to `3000`, automatically injected by most hosts)
- `ADMIN_PASSCODE` — Optional override for the Owner Admin Portal passcode
- `SESSION_SECRET` — Optional persistent HMAC signing secret for Admin & Customer sessions

## Local Development

```bash
npm install
npm run dev
```

## Production Build & Start (Full-Stack Hosting)

Deploy this repository on any Node.js `>=22.12` platform (Google Cloud Run, Render, Railway, Fly.io, or a Node VPS). Static-only hosts such as GitHub Pages do **not** run the Express backend (`server.ts`) required for `/api/chat` (Ask Ola AI) and `/api/admin/*`.

```bash
npm install
npm run build
NODE_ENV=production npm start
```

## Firebase Authentication Note

When hosting on a new custom domain or cloud URL, add that domain to **Firebase Console → Authentication → Settings → Authorized domains** so Owner Google Sign-In (`olacontinental625@gmail.com`) works on the deployed URL.
