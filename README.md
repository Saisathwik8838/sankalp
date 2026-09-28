# Sankalp — Devotional Discipline Tracker

> *"A quiet lamp being lit, not a leaderboard."*  
> A private, calm, mobile-first PWA for multi-day devotional vows (Hanuman Chalisa, Japa, Diya, and Niyams), built with local-first persistence, offline capabilities, and an optional sync backend.

---

## 1. Design Source of Truth
- **Design Board**: [`Sankalp — design board.html`](./Sankalp%20—%20design%20board.html)
- **Design Notes & Token Specification**: [`docs/design-notes.md`](./docs/design-notes.md)
- **High-Res Slide Screenshots (Light & Dark)**: [`docs/screenshots/`](./docs/screenshots/)

---

## 2. Monorepo Layout
```
/
├── client/                     # Vite + React (JavaScript, no TypeScript) + Tailwind CSS PWA
│   ├── public/                 # PWA icons, manifest.json, sw.js
│   ├── src/
│   │   ├── components/         # Mobile-first components matching design board slides
│   │   │   ├── auth/           # Login, Register, Guest mode
│   │   │   ├── common/         # TabBar, ThemeToggle, Exact SVG Icons
│   │   │   ├── completion/     # Radiant Diya celebration, 1080x1350 share card
│   │   │   ├── counter/        # Minimal ring, haptics, sound, wake-lock
│   │   │   ├── insights/       # 2x2 stats grid, weekday & hour charts
│   │   │   ├── journal/        # Reflection cards, search, quiet empty state
│   │   │   ├── journey/        # 40-day visual grid, missed-day recovery sheet
│   │   │   ├── reader/         # Scripture reader with Devanagari transliteration
│   │   │   ├── settings/       # Details, Appearance, Timing, .ics reminders, Backup
│   │   │   ├── setup/          # 6-step Onboarding Setup Wizard
│   │   │   └── today/          # Today screen, ProgressRing, steppers, checks
│   │   ├── context/            # React Context + useReducer global state
│   │   ├── data/texts/         # Scripture JSON schemas
│   │   ├── lib/                # Pure logic: dates.js, sankalp.js, storage.js, calendar.js
│   │   ├── theme/              # Extracted tokens (colors, fonts, radii, spacing)
│   │   ├── App.jsx             # Main phone frame router & tablet dual-column adaptation
│   │   └── index.css           # Design tokens, CSS custom properties, utility styles
│   └── package.json
│
├── server/                     # Express.js (Node 24+, native node:sqlite, bcryptjs, JWT)
│   ├── src/
│   │   ├── db/                 # SQLite schema (users, sankalps, day_entries, settings)
│   │   ├── middleware/         # Cookie & JWT auth verification
│   │   ├── routes/             # /api/auth, /api/sync, /api/export, /api/health
│   │   ├── server.js           # Express app assembly & security middleware (helmet, cors, rate-limit)
│   │   └── server.test.js      # Backend integration tests
│   └── package.json
│
├── docs/                       # Design notes, token specifications, screenshots
└── package.json                # Root coordinator scripts (concurrently dev, tests)
```

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
From the root repository directory:
```bash
# Install all root, client, and server dependencies
npm run install:all
```

### Running Locally
To launch both client and server concurrently:
```bash
npm run dev
```
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Server (Backend API)**: [http://localhost:3001](http://localhost:3001)

You can also run them independently:
```bash
npm run dev:client  # Runs Vite client on port 5173
npm run dev:server  # Runs Express backend on port 3001
```

---

## 4. Running Automated Tests

All business logic (date arithmetic, day counting, streaks, completion criteria, missed-day recovery, and backend sync merge) is thoroughly covered by automated Vitest suites:
```bash
# Run all tests across monorepo (26 tests)
npm test

# Run client tests only (21 tests)
npm run test:client

# Run server tests only (5 tests)
npm run test:server
```

---

## 5. Deployment Notes

### Frontend (Client)
- **Build Command**: `npm run build` inside `/client` (or `npm run build` from root).
- **Output Directory**: `client/dist`.
- **Hosting**: Compatible with Netlify, Vercel, Cloudflare Pages, or GitHub Pages.
- **PWA Requirement**: Must be served over HTTPS so Service Workers, Screen Wake Lock, and Cache APIs operate without browser security restrictions.

### Backend (Server)
- **Hosting**: Render, Railway, Fly.io, DigitalOcean, or any Node.js environment.
- **Environment Variables**:
  - `PORT`: e.g. `3001` or provided by host
  - `JWT_SECRET`: A long, randomly generated secret string
  - `CLIENT_ORIGIN`: Exact URL of the frontend (e.g. `https://sankalp.app`)
  - `DATABASE_PATH`: Path to SQLite database file (e.g. `data/sankalp.db`). Ensure this is stored on a **persistent disk/volume**.
- **Database Backups**: Download copies of `data/sankalp.db` periodically or use the built-in `GET /api/export` endpoint.

---

## 6. Privacy & Offline Sanctity
- **Local-First Principle**: All practices, counts, and notes are written to the local device storage first. The app works 100% offline in Airplane mode.
- **Guest Mode by Default**: No registration required to use the full feature set.
- **Zero Surveillance**: No analytics, telemetry, ad networks, or third-party trackers are included.
