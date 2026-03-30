# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field with login, notes, plumbing formulas, AI safety talks, timesheets, material lists, job bidding, calendar, OSHA, safety data sheets, calculator, total station, blueprints, 2015 UPC plumbing code, marketing landing page, and legal pages.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **AI**: OpenAI via Emergent LLM key
- **Payments**: Stripe (web) + Google Play Billing (Android)
- **Mobile**: Capacitor (Android & iOS) + PWA

## Subscription Pricing
- Basic: $4.99/mo | Pro: $9.99/mo | Enterprise: $19.99/mo
- Promo: First 100 users get 3 months free, others get 7-day trial

## What's Been Implemented

### Phase 1-3 — MVP, Enhanced Features, Mobile (Complete)
- All 15+ feature pages, JWT auth, Stripe, AI safety talks
- Offline mode, PDF export, GPS geofencing, PWA, Capacitor

### Phase 4 — Trial & Plumbing Code (Complete)
- 7-day free trial (90 days for first 100 early bird users)
- 2015 UPC Plumbing Code (11 chapters, 52 sections, searchable)

### Phase 5 — Google Play Billing & Pricing (Complete)
- Updated pricing ($4.99/$9.99/$19.99)
- Google Play Billing native Kotlin plugin + backend verification
- Frontend platform detection (Android → Play Billing, Web → Stripe)

### Phase 6 — Landing Page & Promo (Complete)
- Marketing landing page at `/` with promo countdown
- "First 100 users get 3 months free" with live spot tracking
- Hero, features grid, pricing, "Built by a Plumber" story, CTAs

### Phase 7 — Legal Pages & Deployment Guide (Complete - March 2026)
- Privacy Policy page at `/privacy` (11 sections)
- Terms of Service page at `/terms` (15 sections, pricing table)
- Footer links on landing page and login page
- Vercel deployment guide created (`/app/DEPLOYMENT_GUIDE.md`)

## Prioritized Backlog

### P1 — Next
- [ ] Deploy to Vercel (free subdomain) + backend hosting (Railway/Render)
- [ ] Set up MongoDB Atlas free cluster
- [ ] Configure Stripe live keys
- [ ] Server-side Google Play verification (needs Service Account JSON)
- [ ] Create products in Google Play Console

### P2 — Medium
- [ ] Native push notifications via Capacitor
- [ ] Team management features
- [ ] Advanced reporting dashboard

### P3 — Nice to Have
- [ ] Voice notes, weather integration, supplier lookups
- [ ] Customer portal
