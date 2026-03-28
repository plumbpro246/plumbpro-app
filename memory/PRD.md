# PlumbPro Field Companion - Product Requirements Document

## Original Problem Statement
Build an app with different tier monthly costs for plumbers to use in the field. The app should include main login page then multiple pages: notes page, plumbing formula page, job safety talk page that generates different safety talks daily, time sheet page, job material lists page, job bidding page, calendar page, OSHA requirements page, data safety sheet page, calculator page, total station page, blueprint page with downloadable and PDF blueprints.

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

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI with async endpoints
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM key
- **Payments**: Stripe Checkout
- **Mobile**: Capacitor for Android (Play Store ready)

## What's Been Implemented (March 2025)

### Phase 1 - MVP (Complete)
- [x] User registration with email/password
- [x] JWT-based login with token storage
- [x] Three tiers: Basic ($9.99), Pro ($19.99), Enterprise ($29.99)
- [x] Stripe Checkout integration
- [x] All 15 feature pages (Dashboard, Notes, Formulas, Safety Talks, etc.)
- [x] AI-generated daily safety talks
- [x] PDF blueprint upload/download/view

### Phase 2 - Enhanced Features (Complete)
- [x] Offline Mode Support - Data caching with localforage
- [x] PDF Export - Timesheet and Job bid exports
- [x] Browser Notifications - Calendar reminders
- [x] Job Photos Feature - Photo upload to notes
- [x] Settings Page - Notification and sync controls

### Phase 3 - Mobile & Advanced (Complete)
- [x] **PWA Service Worker** - Offline caching, background sync
- [x] **GPS Geofencing** - Auto clock-in/out at job sites
- [x] **Email Sharing** - Share bids directly to clients
- [x] **Capacitor Setup** - Android native wrapper configured
- [x] **Play Store Ready** - App ID, manifest, icons configured

### Android Build Configuration
- App ID: `com.plumbpro.fieldcompanion`
- App Name: PlumbPro
- Web Dir: build
- Plugins: Geolocation, LocalNotifications, Share

### New Services Added (Phase 3)
- geofenceService.js - GPS tracking, auto time logging
- shareService.js - Native share and email integration
- sw.js - Service worker for PWA
- manifest.json - PWA manifest with shortcuts

## Play Store Deployment Steps
1. Run `yarn build` in frontend
2. Run `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Generate signed AAB (Build > Generate Signed Bundle)
5. Create Google Play Developer account ($25 one-time)
6. Upload AAB to Play Console
7. Complete store listing (screenshots, description)
8. Submit for review

## Prioritized Backlog

### P0 - Critical (Done)
- [x] All MVP features
- [x] Offline mode
- [x] PDF exports
- [x] GPS time tracking
- [x] Android build setup

### P1 - High Priority (Next)
- [ ] Generate Play Store screenshots
- [ ] App Store (iOS) build with Capacitor
- [ ] Background location tracking (always-on GPS)
- [ ] Photo thumbnails in notes list

### P2 - Medium Priority
- [ ] Team management features
- [ ] Custom branding for Enterprise
- [ ] Advanced reporting dashboard
- [ ] QuickBooks integration

### P3 - Nice to Have
- [ ] Voice notes recording
- [ ] Weather integration
- [ ] Supplier price lookups
- [ ] Customer portal

## Revenue Model
- Basic: $9.99/mo - Solo plumbers
- Pro: $19.99/mo - Professional plumbers (most popular)
- Enterprise: $29.99/mo - Plumbing businesses

## Next Tasks List
1. Build production APK for Play Store
2. Create store listing assets (screenshots, video)
3. Submit to Google Play Store
4. Set up iOS build with Capacitor
5. Add in-app purchase for subscriptions
