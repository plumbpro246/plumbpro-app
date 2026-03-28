# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field. The app should include main login page then multiple pages: notes page, plumbing formula page, job safety talk page that generates different safety talks daily, time sheet page, job material lists page, job bidding page, calendar page, OSHA requirements page, data safety sheet page, calculator page, total station page, blueprint page with downloadable and PDF blueprints, and a plumbing code section with the 2015 UPC plumbing code.

## User Personas
1. **Solo Plumber** - Needs quick access to formulas, safety info, and basic tracking
2. **Field Supervisor** - Needs timesheet tracking, job bidding, and team coordination
3. **Plumbing Business Owner** - Needs complete suite with bidding, materials, and business tools

## Core Requirements (Static)
- JWT-based authentication (email/password)
- Stripe subscription payments (3 tiers)
- AI-generated daily safety talks
- Mobile-responsive design for field use
- PDF blueprint upload/download
- 2015 UPC Plumbing Code reference

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI with async endpoints
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM key
- **Payments**: Stripe Checkout
- **Mobile**: Capacitor for Android & iOS (Play Store / App Store ready)

## What's Been Implemented

### Phase 1 - MVP (Complete)
- [x] User registration with email/password
- [x] JWT-based login with token storage
- [x] Three tiers: Basic ($9.99), Pro ($19.99), Enterprise ($29.99)
- [x] Stripe Checkout integration
- [x] All 15+ feature pages (Dashboard, Notes, Formulas, Safety Talks, etc.)
- [x] AI-generated daily safety talks

### Phase 2 - Enhanced Features (Complete)
- [x] Offline Mode Support - Data caching with localforage
- [x] PDF Export - Timesheet and Job bid exports
- [x] Browser Notifications - Calendar reminders
- [x] Job Photos Feature - Photo upload to notes
- [x] Settings Page - Notification and sync controls

### Phase 3 - Mobile & Advanced (Complete)
- [x] PWA Service Worker - Offline caching, background sync
- [x] GPS Geofencing - Auto clock-in/out at job sites
- [x] Email Sharing - Share bids directly to clients
- [x] Capacitor Setup - Android & iOS native wrapper configured
- [x] Play Store Ready - App ID, manifest, icons configured

### Phase 4 - Trial & Plumbing Code (Complete - March 2026)
- [x] 7-Day Free Trial - Backend endpoints + frontend UI for trial management
- [x] 2015 UPC Plumbing Code - 11 chapters, 52 sections, searchable reference
- [x] Quick-jump chapter navigation chips
- [x] Quick reference footer cards (Drain Slopes, DFU Values, Vent Sizes)
- [x] iOS Build Script (build-ios.sh)

## Revenue Model
- Basic: $9.99/mo - Solo plumbers
- Pro: $19.99/mo - Professional plumbers (most popular)
- Enterprise: $29.99/mo - Plumbing businesses
- 7-day free trial available for all tiers

## Prioritized Backlog

### P0 - Critical (Done)
- [x] All MVP features
- [x] Offline mode
- [x] PDF exports
- [x] GPS time tracking
- [x] Android build setup
- [x] iOS build setup
- [x] 7-day free trial
- [x] 2015 UPC Plumbing Code

### P1 - High Priority (Next)
- [ ] App Store Billing compliance (Apple/Google IAP for digital subscriptions)
- [ ] Generate Play Store screenshots
- [ ] Background location tracking (always-on GPS)
- [ ] Photo thumbnails in notes list

### P2 - Medium Priority
- [ ] Native push notifications via Capacitor
- [ ] Team management features
- [ ] Custom branding for Enterprise
- [ ] Advanced reporting dashboard
- [ ] QuickBooks integration

### P3 - Nice to Have
- [ ] Voice notes recording
- [ ] Weather integration
- [ ] Supplier price lookups
- [ ] Customer portal

## Next Tasks List
1. App Store billing compliance (IAP integration)
2. Build production APK for Play Store
3. Create store listing assets (screenshots, video)
4. Submit to Google Play Store & Apple App Store
5. Native push notifications
