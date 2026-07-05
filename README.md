# StockBase

Full-stack inventory and IT asset management system built with React, Express, and SQLite. It tracks equipment across two sites, handles support tickets, runs preventive-maintenance checklists and security audits, and exports formatted PDF and Excel reports.

I built it from scratch for a production environment that manages more than 200 assets across 60 departments. It started as a spreadsheet and grew into a working system, driven by the day-to-day requests of the people using it.

---

## What it does

- **Equipment census** — CRUD for IT assets with 110+ fields per record: hardware specs, network config, software inventory, and custody info
- **Support tickets** — Public submission with random 6-digit folios for privacy, and time-based technician assignment
- **Preventive maintenance** — Checklists with 19 inspection points, photo evidence, and signature capture
- **Security criteria** — 22-point compliance audits per workstation
- **Dashboard** — Recharts analytics with PDF export in summary, detailed, and by-area modes
- **Reports** — Branded PDF and Excel exports with headers and structured data
- **CSV import** — Smart upsert that matches by serial number or alias plus area, and updates without overwriting existing maintenance or ticket history
- **Bulk operations** — Mass-update custody fields across a whole department
- **Role-based auth** — Admin (full CRUD), viewer (read-only), and public (ticket submission plus folio lookup)
- **Audit log** — Records every create, edit, and delete with timestamp, user, and IP
- **Auto-backup** — Daily local backups with optional network copy and 30-day rotation

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Vite 7, Recharts, SheetJS, html2pdf.js |
| Backend | Express 5, better-sqlite3, bcrypt, express-rate-limit |
| Auth | Session tokens (crypto.randomBytes), bcrypt hashes, 8hr TTL |
| Security | CORS whitelist, rate limiting, column whitelisting for SQL-injection prevention |
| Deployment | Single-server LAN (Windows/Linux), static build served by Express |

## Quick start

```bash
git clone https://github.com/JoshuaEngine7/stockbase.git
cd stockbase
npm install

# Set up environment
cp .env.example .env
# Edit .env and set ADMIN_PASS

# Seed demo data
node seed.js

# Build the frontend
npm run build

# Start the server
node server.js
# http://localhost:3000
```

For bcrypt password hashing (recommended for production):

```bash
node generate-hash.js your_password
# Copy the hash into .env as ADMIN_HASH
```

## Project structure

```
stockbase/
├── server.js          # Express API (auth, CRUD, backup, audit)
├── seed.js            # Demo data generator (60 assets, 15 tickets)
├── generate-hash.js   # bcrypt hash utility
├── .env.example       # Environment template
├── package.json
└── src/
    ├── App.jsx        # Main app (~4300 lines, single file by design)
    ├── App.css
    ├── main.jsx
    ├── index.css
    └── assets/
```

## Screenshots

Coming soon. The app runs on a local network without public access.

## A note on scope

The production system also includes a digital-twin module: an interactive SVG floor plan that shows each asset's status by physical location. It isn't in this repository. The plan mirrors the real layout of a facility, and publishing that would expose physical-security detail that doesn't belong in a public portfolio. Leaving it out was a deliberate call, not a technical gap. The rest of the system stands on its own without it.

## Why a single file?

App.jsx is around 4,300 lines in one file. That was a deliberate choice for this environment. The system runs on a LAN server where the only developer is also the only sysadmin, so one file means one place to search and one file to copy during deployment (USB to the server, restart the process). Splitting it into components is on the list, but it hasn't been necessary yet.

## Background

I built this during a systems engineering placement. It began as a spreadsheet for counting equipment and turned into a full system as the people using it kept asking for more: ticket tracking, maintenance logs, compliance checks, reporting. Each request came from a real need on the floor.

The code is pragmatic rather than academic. Some parts carry more structure than they need and others carry less. It runs in production and does the job it was built for.

## License

MIT

---

*Built by [Josué](https://github.com/JoshuaEngine7), Systems Engineering student*
