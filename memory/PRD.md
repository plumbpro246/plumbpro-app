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

### Authentication System
- [x] User registration with email/password
- [x] JWT-based login with token storage
- [x] Protected routes with auth context
- [x] User profile management

### Subscription System
- [x] Three tiers: Basic ($9.99), Pro ($19.99), Enterprise ($29.99)
- [x] Stripe Checkout integration
- [x] Payment status polling
- [x] User subscription state management

### Feature Pages (All 15 Pages)
- [x] Dashboard with stats and quick links
- [x] Notes - CRUD operations with tags
- [x] Plumbing Formulas - 8 formulas with calculator
- [x] Safety Talks - AI-generated daily briefings
- [x] Timesheet - Time entry with hours calculation
- [x] Materials - Job material lists with cost tracking
- [x] Job Bidding - Complete bid calculator with status tracking
- [x] Calendar - Event scheduling with types
- [x] OSHA Requirements - 8 safety categories
- [x] Safety Data Sheets - 5 common chemical references
- [x] Calculator - Full calculator with memory
- [x] Total Station - Reference guide with tabs
- [x] Blueprints - PDF upload/download/view
- [x] Subscription - Pricing page with tiers
- [x] Subscription Success - Payment confirmation

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
- [x] All 15 feature pages
- [x] Stripe payment integration
- [x] AI safety talk generation

### P1 - High Priority (Next)
- [ ] Offline mode support
- [ ] Push notifications for calendar events
- [ ] Export timesheets to PDF/CSV
- [ ] Share job bids via email

### P2 - Medium Priority
- [ ] Team management features
- [ ] Custom branding for Enterprise
- [ ] Advanced reporting dashboard
- [ ] Integration with accounting software

### P3 - Nice to Have
- [ ] Voice notes recording
- [ ] Photo attachment to notes
- [ ] GPS location tagging for jobs
- [ ] Weather integration for outdoor work

## Next Tasks List
1. Add offline data caching with service workers
2. Implement bid PDF export functionality
3. Add weekly/monthly timesheet summaries
4. Create push notification system for reminders
5. Add data export features for all modules
