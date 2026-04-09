# Masters Pick 'Em Pool

A live Masters Tournament pick 'em pool application with real-time scoring, automatic leaderboard calculations, and a full admin panel for managing entries.

## How It Works

1. **Participants submit entries** — Each entry selects 9 golfers across 3 tiers (2 from Tier 1, 3 from Tier 2, 4 from Tier 3) plus one alternate per tier.
2. **Scores update automatically** — The app fetches live scores from the [ESPN PGA Scoreboard API](https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard) every 60 seconds.
3. **Best 5 count** — Your best 5 golfers' scores (lowest combined) determine your standing.
4. **Cut matters** — At least 5 of your 9 golfers must make the cut for your entry to be eligible for payouts.
5. **Payouts are automatic** — Prize pool and payout tiers adjust dynamically based on the number of entries.

## Where Scores Come From

All golfer scores are pulled from the **ESPN PGA Tour Scoreboard API**:

```
https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard
```

The app automatically identifies the Masters tournament event from ESPN's response and parses:
- Current position and overall score
- Individual round scores
- Tournament status (pre-tournament, in progress, complete)
- Golfer status (active, cut, withdrawn)
- Current round and "thru" hole progress

Scores are cached for 60 seconds to minimize API calls. Name matching uses normalization to handle accents and special characters.

## Features

- **Dashboard** — Tournament progress, top golfers, top entries, and stats at a glance
- **Leaderboard** — Full entry rankings with expandable golfer breakdowns and payout amounts
- **Golfers Page** — All golfers with live scores, positions, tier assignments, and pick counts
- **Entry Detail** — Individual entry view showing all picks, scores, cut status, and payout
- **Rules Page** — Complete rules, payout structure, and current prize pool
- **Admin Panel** — Password-protected panel for managing entries, golfer tiers, and CSV imports
- **PWA Support** — Installable as a mobile app with offline capabilities
- **Responsive Design** — Mobile-first with bottom navigation on small screens

## Scoring & Payout Rules

| Rule | Detail |
|------|--------|
| Entry cost | $20 per entry |
| Golfers per entry | 9 (2 Tier 1 + 3 Tier 2 + 4 Tier 3) |
| Alternates | 1 per tier (auto-replaces withdrawals before tournament) |
| Scoring | Best 5 of 9 golfers, lowest combined score wins |
| Eligibility | At least 5 golfers must make the cut |

**Payout structure** (scales with number of entries):

| Entries | 1st | 2nd | 3rd | 4th |
|---------|-----|-----|-----|-----|
| ≤10 | 100% | — | — | — |
| 11–20 | 70% | 30% | — | — |
| 21–40 | 70% | 20% | 10% | — |
| 40+ | 70% | 15% | 10% | 5% |

## Tech Stack

- **Next.js 16** — App Router, API routes, server-side rendering
- **React 19** — UI components
- **TypeScript** — Type safety throughout
- **Tailwind CSS 4** — Masters-themed dark design
- **Upstash Redis** — Persistent KV storage (with in-memory fallback for development)
- **SWR** — Client-side data fetching with 60-second refresh intervals
- **Vercel** — Deployment platform
- **PWA** — Installable via `@ducanh2912/next-pwa`

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm/bun)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

The app runs at `http://localhost:3000`. Without Redis configured, it uses an in-memory store with sample data (resets on server restart).

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KV_REST_API_URL` | Upstash Redis URL (optional — falls back to in-memory) | — |
| `KV_REST_API_TOKEN` | Upstash Redis token | — |
| `ADMIN_PASSWORD` | Password for the admin panel | `admin` |
| `NEXT_PUBLIC_APP_URL` | Public URL for PWA manifest | — |

### Production Build

```bash
npm run build
npm start
```

## Admin Panel

Access at `/admin` (password-protected). Three tabs:

1. **Entries** — Add, edit, delete entries and mark as paid
2. **Golfers** — Manage tier assignments and fetch the latest ESPN field
3. **Import** — Bulk import entries via CSV

### CSV Import Format

```csv
name,t1p1,t1p2,t2p1,t2p2,t2p3,t3p1,t3p2,t3p3,t3p4,alt1,alt2,alt3,paid
John Smith,Scottie Scheffler,Rory McIlroy,Patrick Cantlay,Tommy Fleetwood,Hideki Matsuyama,Jordan Spieth,Cameron Young,Russell Henley,Tiger Woods,Xander Schauffele,Justin Thomas,Adam Scott,true
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/scores` | No | Live ESPN scores + tournament state |
| GET | `/api/entries` | No | All pool entries |
| POST | `/api/entries` | Admin | Create entry |
| PUT | `/api/entries/[id]` | Admin | Update entry |
| DELETE | `/api/entries/[id]` | Admin | Delete entry |
| POST | `/api/admin/auth` | — | Verify admin password |
| GET | `/api/admin/golfers` | Admin | Get golfer tiers |
| POST | `/api/admin/golfers` | Admin | Update golfer tiers |
| GET | `/api/admin/golfers/fetch` | Admin | Fetch ESPN field |
| POST | `/api/admin/import` | Admin | CSV bulk import |

Admin endpoints require `Authorization: Bearer {ADMIN_PASSWORD}` header.
