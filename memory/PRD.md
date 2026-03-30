# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field. The app should include main login page then multiple pages: notes page, plumbing formula page, job safety talk page that generates different safety talks daily, time sheet page, job material lists page, job bidding page, calendar page, OSHA requirements page, data safety sheet page, calculator page, total station page, blueprint page with downloadable and PDF blueprints, plumbing code section with the 2015 UPC plumbing code, and a marketing landing page.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **AI**: OpenAI via Emergent LLM key
- **Payments**: Stripe (web) + Google Play Billing (Android)
- **Mobile**: Capacitor for Android & iOS (PWA)

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

### Phase 6 — Landing Page & Promo (Complete - March 2026)
- Marketing landing page at `/` (guests see landing, logged-in → dashboard)
- "First 100 users get 3 months free" promo with live countdown
- Hero, features grid, pricing section, "Built by a Plumber" story, CTAs
- Backend promo tracking endpoint (`/api/promo/status`)
- Early bird flag on user registration

## Prioritized Backlog

### P1 — Next
- [ ] Server-side Google Play verification (needs Service Account JSON)
- [ ] Create products in Google Play Console
- [ ] Generate Play Store screenshots & listing assets
- [ ] Custom domain setup for web app
- [ ] Privacy policy & terms of service pages

### P2 — Medium
- [ ] Native push notifications via Capacitor
- [ ] Team management features
- [ ] Advanced reporting dashboard

### P3 — Nice to Have
- [ ] Voice notes, weather integration, supplier lookups
- [ ] Customer portal
