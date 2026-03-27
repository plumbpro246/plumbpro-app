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
- [x] **Offline Mode Support** - Data caching with localforage, sync queue for offline changes
- [x] **PDF Export** - Timesheet export with date range, Job bid estimates as professional PDFs
- [x] **Browser Notifications** - Calendar reminder notifications, Safety talk daily reminders
- [x] **Job Photos Feature** - Photo upload to notes, Photo management component
- [x] **Settings Page** - Notification preferences, Offline sync controls, Account info

### New Backend Endpoints Added
- POST /api/photos - Upload photos with linking
- GET /api/photos - List photos with filtering
- GET /api/photos/{id} - Get photo with data
- DELETE /api/photos/{id} - Delete photo
- GET/PUT /api/notifications/settings - Notification preferences
- GET /api/notifications/upcoming - Upcoming events for notifications
- GET /api/export/timesheets - Timesheet data for PDF
- GET /api/export/bids/{id} - Bid data for PDF
- GET /api/sync/data - All user data for offline cache
- POST /api/sync/pending - Sync offline changes

### New Frontend Services
- offlineService.js - LocalForage caching, sync queue management
- notificationService.js - Browser notifications, scheduler
- pdfExportService.js - jsPDF generation for timesheets and bids

### Design System
- [x] Rugged Industrial theme
- [x] Barlow Condensed + Manrope fonts
- [x] Deep Royal Blue (#003366) primary
- [x] Safety Orange (#FF5F00) accent
- [x] Mobile-first responsive design
- [x] Touch-friendly 48px targets

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Core authentication
- [x] All 15+ feature pages
- [x] Stripe payment integration
- [x] AI safety talk generation
- [x] Offline mode support
- [x] PDF export functionality
- [x] Job photos feature

### P1 - High Priority (Next)
- [ ] Service worker for true offline PWA
- [ ] Photo thumbnails in notes list
- [ ] Material list photo attachments
- [ ] Share job bids via email directly

### P2 - Medium Priority
- [ ] Team management features
- [ ] Custom branding for Enterprise
- [ ] Advanced reporting dashboard
- [ ] Integration with accounting software

### P3 - Nice to Have
- [ ] Voice notes recording
- [ ] GPS location tagging for jobs
- [ ] Weather integration for outdoor work
- [ ] Time tracking with GPS geofence

## Next Tasks List
1. Convert to PWA with service worker
2. Add photo thumbnails to notes list view
3. Implement email sharing for bids
4. Add material list photo attachments
5. Create weekly summary reports
