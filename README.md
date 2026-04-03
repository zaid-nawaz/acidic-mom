#  Quinn — Structured Learning from YouTube Playlists

> Turn any YouTube playlist into a structured course with AI-generated quizzes after every lecture to reinforce what you've learned.

 **Live Demo:** [acidic-mom.vercel.app](https://acidic-mom.vercel.app)

---

##  What It Does

Most people passively watch YouTube tutorials without retaining much. Quinn fixes that by wrapping any YouTube playlist in a lightweight learning layer by tracking your progress through lectures and testing your understanding after each one using AI-generated questions.

Just paste a playlist URL and start learning. No course creation, no manual setup.

---

##  Key Features

- **Paste any YouTube playlist** to instantly create a structured course
- **AI-generated quiz after every lecture** — questions are built from the video's auto-generated captions using Gemini
- **Background question generation** — Inngest processes quiz generation asynchronously, so the UI never blocks
- **Progress tracking** — tells you how much course you have completed
- **Authentication with Clerk** — sign in, and your courses and progress are saved to your account
- **Clean, responsive UI** — built with Tailwind CSS for a distraction-free learning experience

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend / Full-stack | Next.js (TypeScript) |
| Styling | Tailwind CSS |
| Authentication | Clerk |
| Database | Neon (PostgreSQL) |
| ORM | Prisma |
| AI / Quiz generation | Gemini API (Google) |
| Caption extraction + AI backend | Python, FastAPI |
| Background jobs | Inngest |
| Frontend deployment | Vercel |
| Backend deployment | Railway |
| Local tunnel (dev) | Ngrok |

---

##  Architecture

The app is split into two services: a **Next.js frontend/API** and a **Python FastAPI backend** responsible for caption extraction and LLM communication.

```
User Browser
     │
     ▼
Next.js App (Vercel)
     │
     ├──► Clerk (Auth) ──► Webhook ──► Neon DB (save user on signup)
     │
     ├──► YouTube API (fetch playlist + video metadata)
     │
     ├──► Inngest (trigger background job while video watched)
     │         │
     │         ▼
     │    FastAPI Backend (Railway)
     │         │
     │         ├──► YouTube captions (auto-generated transcript)
     │         └──► Gemini API ──► JSON question set
     │
     └──► Neon DB via Prisma (store courses, progress, questions)
```

### How Quiz Generation Works

1. User starts watching a lecture video
2. Next.js triggers an **Inngest background job** (non-blocking)
3. Inngest calls the **FastAPI service** hosted on Railway
4. FastAPI extracts the video's auto-generated captions from YouTube
5. Captions are sent to **Gemini API** with a prompt to generate a structured question set
6. Gemini returns a **JSON array of questions**
7. Questions are saved to **Neon DB** via Prisma
8. The Next.js UI hydrates with the question set once ready

### Why Inngest?

Quiz generation (caption fetch + LLM call) can take several seconds. Running it inline would block the server and degrade UX. Inngest handles it as a background workflow — the user can keep navigating the app while questions are generated in the background.

### Why a Separate FastAPI Service?

YouTube caption extraction and the Gemini integration are handled in Python. Keeping this as a separate Railway-deployed microservice lets the Next.js app stay clean and lets the Python backend scale independently.

---

##  Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Neon database (free tier works)
- Clerk account (free tier)
- Google Gemini API key
- Inngest account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/zaid-nawaz/acidic-mom.git
cd acidic-mom
```

### 2. Set up environment variables

Create a `.env` file in the root (see `.env.example`):

```env
# Database
DATABASE_URL=your_neon_db_connection_string

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# FastAPI backend
FASTAPI_URL=http://localhost:8000

# YouTube
API_KEY=
```

### 3. Install and run the Next.js app

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Set up and run the FastAPI backend

```bash
cd genai_backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5. Run Inngest dev server

```bash
npx inngest-cli@latest dev
```

### 6. Expose local backend for Clerk webhooks (dev only)

```bash
ngrok http --url=<YOUR NGROK FORWARDING URL> 3000
```

Copy the ngrok URL and set it as your Clerk webhook endpoint in the Clerk dashboard.

---

##  Project Structure

```
acidic-mom/
├── src/
│   └── app/                        # Next.js App Router
│       ├── actions/                # Server actions
│       ├── addcourses/             # Add playlist page
│       ├── api/
│       │   ├── inngest/            # Inngest HTTP endpoint
│       │   ├── video-status/       # Video progress API
│       │   └── webhook/            # Clerk webhook handler
│       ├── courses/                # Course player + quiz UI
│       ├── layout.tsx              # Root layout
│       └── page.tsx                # Home page
├── components/                     # Reusable React components
├── genai_backend/                  # FastAPI service (Python)
├── generated/                      # Prisma generated client
├── inngest/                        # Inngest function definitions
├── lib/                            # Prisma client, utils, helpers
├── prisma/
│   └── schema.prisma               # DB schema
├── public/                         # Static assets
├── .env                            # Environment variables
├── next.config.ts
├── prisma.config.ts
├── proxy.ts
└── tsconfig.json
```

---

##  Key Technical Decisions & Learnings

- **Async quiz generation with Inngest** — prevented server blocking and gave users a smooth experience even when LLM calls took 5–10 seconds
- **Clerk webhooks to sync users** — instead of calling the DB on every auth check, a `user.created` webhook syncs the user to Neon once, cleanly separating auth state from app state
- **Gemini returning structured JSON** — prompting the LLM to return a typed JSON schema for questions made hydrating the quiz UI straightforward and reliable
- **FastAPI as a lightweight Python sidecar** — keeping caption extraction in Python (where the ecosystem is better) and wrapping it in FastAPI made the service easy to deploy on Railway and call from Next.js
