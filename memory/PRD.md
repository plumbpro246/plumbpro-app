# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field with login, notes, plumbing formulas, AI safety talks, timesheets, material lists, job bidding, calendar, OSHA, safety data sheets, calculator, total station, blueprints, plumbing code page, marketing landing page, and legal pages.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **AI**: OpenAI via Emergent LLM key (standard openai SDK + proxy base_url)
- **Payments**: Stripe (web) + Google Play Billing (Android)
- **Mobile**: Capacitor (Android & iOS) + PWA
- **Deployment**: Vercel (frontend) + Railway (backend) + MongoDB Atlas

## Subscription Pricing
- Free: $0/mo (Calculator, Formulas, Safety Talks, Calendar, Plumbing Code)
- Basic: $4.99/mo | Pro: $9.99/mo | Enterprise: $19.99/mo
- Promo: First 100 users get 3 months free, others get 7-day trial

## What's Been Implemented

### Phase 1-3 -- MVP, Enhanced Features, Mobile (Complete)
- All 15+ feature pages, JWT auth, Stripe, AI safety talks
- Offline mode, PDF export, GPS geofencing, PWA, Capacitor

### Phase 4 -- Trial & Plumbing Code (Complete)
- 7-day free trial (90 days for first 100 early bird users)
- 2015 UPC Plumbing Code (initial single-edition version)

### Phase 5 -- Google Play Billing & Pricing (Complete)
- Updated pricing ($4.99/$9.99/$19.99)
- Google Play Billing native Kotlin plugin + backend verification
- Frontend platform detection (Android -> Play Billing, Web -> Stripe)

### Phase 6 -- Landing Page & Promo (Complete)
- Marketing landing page at `/` with promo countdown
- "First 100 users get 3 months free" with live spot tracking

### Phase 7 -- Legal Pages & Deployment Guide (Complete)
- Privacy Policy page at `/privacy` (11 sections)
- Terms of Service page at `/terms` (15 sections, pricing table)
- Footer links on landing page and login page
- Vercel deployment guide created

### Phase 8 -- Multi-Edition Plumbing Code (Complete - Feb 2026)
- UPC & IPC codes with 4 editions each (2015, 2018, 2021, 2024)
- Chapter 2 Definitions for both code types
- Edition-specific content variations (DFU values, flow rates, etc.)
- Extracted data to `/app/backend/plumbing_codes.py`
- Search, accordion, quick-jump chips, quick reference footer cards
- Regression tested: 100% pass (iteration_8.json)

### Phase 9 -- Plumbing Code Bookmarks (Complete - Feb 2026)
- Bookmark any code section for quick field access
- Per-user MongoDB storage with duplicate protection (409)
- Bookmarks panel with jump-to-section and remove functionality
- Badge shows bookmark count, icons toggle filled/outline state
- Regression tested: 100% pass (iteration_9.json)

### Phase 10 -- SEO Improvements (Complete - Feb 2026)
- Meta tags: title, description, keywords, author, robots
- Open Graph tags for Facebook/social sharing
- Twitter Card tags for Twitter sharing

## Prioritized Backlog
- Apple mobile web app tags
- `sitemap.xml` with all public routes (/, /login, /privacy, /terms)
- `robots.txt` allowing public pages, blocking auth-required pages
- Dynamic page titles on Landing, Privacy, Terms pages
- Canonical URL set to `plumbpro-app.vercel.app`

### Phase 11 -- Free Tier & Feature Gating (Complete - Feb 2026)
- Free ($0) tier card on Subscription page with 4-tier pricing grid
- Feature gating: free users access only Calculator, Formulas, Safety Talks, Calendar, Plumbing Code, Dashboard, Settings
- Lock icons on sidebar for restricted pages (8 pages locked for free)
- TierGatedRoute component redirects free users to /subscription
- Registration flow redirects to /subscription instead of /dashboard
- Toast notification on locked nav click
- Regression tested: 100% pass (iteration_10.json)

### Phase 12 -- Support Page (Complete - Feb 2026)
- Support page with contact form (Category, Subject, Message)
- "Email Us Directly" card with plumbpro246@gmail.com
- Common Questions FAQ (upgrade, cancel, refund)
- Backend stores tickets in MongoDB (POST /api/support/ticket, GET /api/support/tickets)
- Updated all email references across legal pages from placeholder to plumbpro246@gmail.com
- Available to all users including free tier
- NOTE: Tickets stored in DB only — email forwarding requires SendGrid/SMTP integration

### Phase 13 -- Credit Card Required for Trial (Complete - Feb 2026)
- Trial now goes through Stripe checkout (card captured, not charged until trial ends)
- Removed old no-card trial endpoint, single "Start Free Trial" button per tier
- Early birds (first 300) get 90-day trial, others get 7-day trial
- Banner updated: "Try Any Plan FREE — Cancel Anytime!"
- Note under buttons: "Credit card required. You won't be charged until your trial ends."
- FAQ updated to reflect card-required trial flow

### Phase 14 -- Push Notifications & Team Management (Complete - Apr 2026)
- Web Push via VAPID keys (pywebpush backend, Push API frontend)
- Push toggle in Settings with test button, subscribes to browser push
- Team Management page: create team, invite members by email, assign roles (Foreman/Plumber)
- Team timesheets view for owners, member list with status badges
- Email invitations sent via Gmail SMTP
- Enterprise-tier feature (locked for free/basic users)
- Regression tested: 100% pass (iteration_11.json, 22/22 backend + all frontend)

### Phase 15 -- Voice Notes, Weather & Supplier Lookup (Complete - Apr 2026)
- Voice Notes: Record audio in-browser, auto-transcribe via OpenAI Whisper (Emergent LLM Key)
  - CRUD: Create (POST /api/voice-notes with multipart audio), List (GET /api/voice-notes), Delete
  - Audio playback via query-param auth (GET /api/voice-notes/{id}/audio?t=TOKEN)
  - Optional job/site name tagging, duration tracking
  - Tier-gated (paid feature)
- Weather: Real-time conditions via Open-Meteo API (no key required)
  - Auto-detect location via browser geolocation, manual search by city/zip
  - Current conditions: temp, feels-like, humidity, wind, precipitation
  - 7-day forecast cards with high/low, condition icons, precipitation
  - Plumber safety alerts: freeze (<=32F), heat (>=100F), high winds (>=40mph), rain
  - **Dashboard weather widget**: compact card with current temp, condition, humidity, wind, hi/lo, alerts strip, and "Full Forecast" link
- Supplier Lookup: Static directory of 12 major plumbing suppliers
  - Search by name or specialty (PEX, water heaters, etc.)
  - Filter by type: Wholesale, Retail/Pro, Online, Industrial

### Phase 17 -- server.py Refactoring (Complete - Apr 2026)
- Split monolithic server.py (2349 lines) into modular route structure:
  - `server.py` (60 lines) — slim FastAPI entry point
  - `routes/deps.py` (323 lines) — shared models, auth, DB, config
  - `routes/auth.py` (98 lines) — auth & promo endpoints
  - `routes/subscriptions.py` (163 lines) — Stripe, Google Play, trials
  - `routes/crud.py` (134 lines) — Notes, Timesheets, Materials, Bids, Calendar
  - `routes/reference.py` (168 lines) — Safety Talks, Formulas, OSHA, SDS, Total Station
  - `routes/files.py` (201 lines) — Blueprints, Photos, Plumbing Code, Export, Sync, Notifications
  - `routes/services.py` (285 lines) — Support, Push, Teams, Voice Notes, Weather, Suppliers
- Total: 1433 lines across 8 modules (vs 2349 in single file)
- Regression tested: 100% pass (iteration_13.json, 24/24 backend + all frontend)

  - Phone (tel: link), website link, specialty tags
  - "Find Nearby" button -> Google Maps search via geolocation
  - Free feature (no tier gate)
- All three integrated into sidebar nav and Dashboard quick access
- Regression tested: 100% pass (iteration_12.json, 17/17 backend + all frontend)

### Phase 16 -- Pipe Offset Formulas & Layout Guide (Complete - Apr 2026)
- Added **45° Pipe Offset** formula: Travel = Offset × 1.414, Set = Offset
- Added **22.5° Pipe Offset** formula: Travel = Offset × 2.613, Set = Offset × 2.414
- Backend returns `extras` with both travel and set values for offset calculations
- SVG diagrams showing offset, travel, and set dimensions for both angles
- Step-by-step layout instructions (4 steps for 45°, 5 steps for 22.5°)
- Worked examples (12" offset) with calculated values highlighted
- **45° vs 22.5° Comparison Table**: multipliers, space, flow, best uses, pro tip
- Quick Reference table updated with offset multipliers
- Tested: backend calculations verified via curl, frontend verified via screenshot

### P1 -- Next
- [ ] iOS Build & App Store Configuration (Capacitor iOS)
- [ ] Apple In-App Purchase compliance

### P2 -- Medium
- [ ] server.py refactoring (split into routes/) — now ~2300 lines
- [ ] Customer portal
- [ ] Weather caching to reduce Open-Meteo API calls
- [ ] Voice notes: GridFS/object store for large audio files (current base64 in MongoDB has 16MB limit)

### P3 -- Nice to Have
- [ ] Voice note transcription retry on failure
- [ ] Supplier directory backed by DB instead of hardcoded list
- [ ] Advanced reporting dashboard
