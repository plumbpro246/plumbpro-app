# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field. The app should include main login page then multiple pages: notes page, plumbing formula page, job safety talk page that generates different safety talks daily, time sheet page, job material lists page, job bidding page, calendar page, OSHA requirements page, data safety sheet page, calculator page, total station page, blueprint page with downloadable and PDF blueprints, and a plumbing code section with the 2015 UPC plumbing code.

## User Personas
1. **Solo Plumber** - Needs quick access to formulas, safety info, and basic tracking
2. **Field Supervisor** - Needs timesheet tracking, job bidding, and team coordination
3. **Plumbing Business Owner** - Needs complete suite with bidding, materials, and business tools

## Core Requirements (Static)
- JWT-based authentication (email/password)
- Stripe subscription payments (web) + Google Play Billing (Android)
- AI-generated daily safety talks
- Mobile-responsive design for field use
- PDF blueprint upload/download
- 2015 UPC Plumbing Code reference

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI with async endpoints
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM key
- **Payments**: Stripe (web) + Google Play Billing (Android)
- **Mobile**: Capacitor for Android & iOS

## Subscription Pricing
- Basic: $4.99/mo - Solo plumbers
- Pro: $9.99/mo - Professional plumbers (most popular)
- Enterprise: $19.99/mo - Plumbing businesses
- 7-day free trial available for all tiers

## Google Play Billing
- Product IDs:
  - com.plumbpro.fieldcompanion.basic_monthly ($4.99)
  - com.plumbpro.fieldcompanion.pro_monthly ($9.99)
  - com.plumbpro.fieldcompanion.enterprise_monthly ($19.99)
- Native Kotlin plugin for Capacitor Android
- Backend purchase verification endpoint
- Server-side Google API verification ready (needs Service Account JSON)

## What's Been Implemented

### Phase 1 - MVP (Complete)
- [x] User registration with email/password
- [x] JWT-based login with token storage
- [x] Three subscription tiers with Stripe Checkout
- [x] All 15+ feature pages
- [x] AI-generated daily safety talks

### Phase 2 - Enhanced Features (Complete)
- [x] Offline Mode Support
- [x] PDF Export
- [x] Browser Notifications
- [x] Job Photos Feature
- [x] Settings Page

### Phase 3 - Mobile & Advanced (Complete)
- [x] PWA Service Worker
- [x] GPS Geofencing
- [x] Email Sharing
- [x] Capacitor Setup (Android & iOS)

### Phase 4 - Trial & Plumbing Code (Complete - March 2026)
- [x] 7-Day Free Trial
- [x] 2015 UPC Plumbing Code (11 chapters, 52 sections)
- [x] iOS Build Script

### Phase 5 - Google Play Billing (Complete - March 2026)
- [x] Updated pricing ($4.99/$9.99/$19.99)
- [x] Google Play Billing native Kotlin plugin
- [x] Backend purchase verification endpoint
- [x] Frontend platform detection (Android → Play Billing, Web → Stripe)
- [x] Product ID mapping and replay protection

## Prioritized Backlog

### P0 - Critical (Done)
- [x] All MVP features
- [x] Offline mode, PDF exports, GPS tracking
- [x] Android & iOS build setup
- [x] 7-day free trial
- [x] 2015 UPC Plumbing Code
- [x] Google Play Billing integration
- [x] Updated pricing

### P1 - High Priority (Next)
- [ ] Server-side Google Play verification (needs Service Account JSON from user)
- [ ] Create products in Google Play Console
- [ ] Generate Play Store screenshots & listing assets
- [ ] Build & submit to Google Play Store
- [ ] Build & submit to Apple App Store

### P2 - Medium Priority
- [ ] Native push notifications via Capacitor
- [ ] Team management features
- [ ] Custom branding for Enterprise
- [ ] Advanced reporting dashboard

### P3 - Nice to Have
- [ ] Voice notes recording
- [ ] Weather integration
- [ ] Supplier price lookups
- [ ] Customer portal
