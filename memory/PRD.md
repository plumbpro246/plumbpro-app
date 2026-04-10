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

### P1 -- Next
- [ ] iOS Build & App Store Configuration (Capacitor iOS)
- [ ] Free Trial verification end-to-end
- [ ] Apple In-App Purchase compliance

### P2 -- Medium
- [ ] Native push notifications via Capacitor
- [ ] Team management features
- [ ] Advanced reporting dashboard
- [ ] server.py refactoring (split into routes/)

### P3 -- Nice to Have
- [ ] Voice notes, weather integration, supplier lookups
- [ ] Customer portal
