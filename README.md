# RadioVerse India (रेडियोवर्स इंडिया)
> **India's Radio. One Universe.**  
> *Production-Ready Live Internet Radio Discovery and Streaming Platform*

---

## 📻 Overview

**RadioVerse India** is a live internet radio streaming and discovery progressive web application (PWA) built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

It enables listeners across India and the diaspora to stream live broadcasts from national public broadcaster All India Radio (Vividh Bharati, FM Gold, FM Rainbow), private FM leaders (Radio Mirchi), regional stations (Bhojpuri, Punjabi, Tamil, Telugu, Bengali, Kannada, Marathi), devotional chants, classical ragas, and international news (BBC World Service).

---

## 🚀 Key Features

- **Singleton Streaming Engine**: Single global audio controller powered by `Zustand` and `AudioDriver`. Conditionally mounts `hls.js` for `.m3u8` live feeds (e.g. Prasar Bharati BitGravity HLS) on non-native browsers, supports native MP3/AAC, and connects with the **Media Session API**.
- **Sleep Timer (Feature A)**: Presets (5, 15, 30, 45, 60, 90 mins) + custom duration (up to 180 mins). Persists absolute Unix timestamp deadlines to `localStorage`, survives browser tab suspension, performs a smooth 10-second audio fade-out, and stops audio cleanly.
- **Smart Favorites & Local History (Feature B)**: Zero forced registration. Versioned client-side storage (`radioverse_favorites_v1` & `radioverse_history_v1`) with instant optimistic updates, in-favorites search, sorting, and duplicate prevention.
- **Station Sharing (Feature C)**: Canonical station URLs (`/stations/[stationId]`), Web Share API integration, one-click WhatsApp & Telegram sharing, clipboard fallback, and dynamic Open Graph tags.
- **Bilingual Interface (Feature D)**: 100% key-parity message catalogs in **English (`en`)** and **हिन्दी (`hi`)** with instant switching, Devanagari typography, and zero hydration mismatches.
- **Radio Health Monitor (Feature E)**: Server-side stream monitoring subsystem with full **SSRF protection** (blocks RFC 1918 private IPs, AWS metadata `169.254.169.254`, loopback `127.0.0.1`, and `[::1]`). Detects latency, HTTP response codes, and audio MIME types.
- **Installable PWA (Feature F)**: Web App Manifest, Service Worker (`public/sw.js`), 192x192 & 512x512 maskable SVG icons, and `/offline` fallback page.
- **Secure Admin Dashboard (Feature G)**: Least-privilege RBAC (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`), bcrypt password hashing, secure `HttpOnly` JWT session cookies, station CRUD, real-time stream recheck, and immutable audit logs (`AdminAuditLog`).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 + Custom Design Tokens |
| **State** | Zustand (Audio Singleton & Sleep Timer) |
| **Audio Engine** | HTMLAudioElement + Conditional Hls.js + MediaSession API |
| **Database** | Prisma ORM with SQLite (Local dev/tests) & PostgreSQL compatibility |
| **Security** | Jose (JWT), Bcryptjs, SSRF IP Validation Guard |
| **Testing** | Vitest, React Testing Library, JSDOM (29 unit & integration tests) |

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js >= 20 (Tested on Node.js v26.13)
- npm >= 10

### 2. Installation
```bash
git clone <repo-url>
cd radioverse-india
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
DATABASE_URL="file:./dev.db"
ADMIN_JWT_SECRET="radioverse-india-production-secret-token-key-2026-secure"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RADIO_BROWSER_TIMEOUT_MS=7000
HEALTH_CHECK_TIMEOUT_MS=6000
```

### 4. Database Setup & Seeding
```bash
npx prisma db push
npm run seed
```
*Seeds 11 categories, 13 verified curated stations with stream endpoints, and the default Super Admin user (`admin@radioverse.in` / `RadioVerseAdmin2026!`).*

### 5. Running the Test Suite
```bash
npm run test
```
*Executes all 29 automated tests across audio state, sleep timer, favorites, SSRF guards, auth security, and i18n key parity.*

### 6. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 7. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Administrative Console

Access the administrative interface at `/admin`.
- **Default Super Admin**: `admin@radioverse.in`
- **Default Password**: `RadioVerseAdmin2026!`
- **Capabilities**:
  - Live Stream Verification & Latency Audits
  - Add / Edit / Disable Stations (with SSRF-guarded stream URLs)
  - Batch Recheck & Diagnostic Log Inspection
  - Audit Trail Log (`/admin/audit`)

---

## 👤 Author & Credits

- **Creator & Developer**: **Chandan Raj**
- **GitHub**: [@chandan-itian](https://github.com/chandan-itian)
- **Live Project**: [DocToolz on GitHub Pages](https://chandan-itian.github.io/doctoolz/)

<div align="center">
  <sub>Made with ❤️ by <b>Chandan Raj</b></sub>
</div>

---


## ⚖️ Legal & Streaming Rights Notice
RadioVerse India indexes publicly available internet audio streams. All trademarks, service marks, station brand logos, and audio broadcasts remain the exclusive property of their respective broadcasters (Prasar Bharati, Entertainment Network India Ltd, BBC, etc.). RadioVerse India enforces strict egress and playback eligibility standards.
