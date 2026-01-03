# Why Racing Events

## Overview
A static website for Why Racing Events - a Pacific Northwest racing events organization. The site showcases upcoming races, triathlons, and marathons with a modern, responsive design featuring a video background hero section on the homepage. All 8 individual event pages use a conversion-optimized template with social proof elements, countdown timers, testimonials, pricing tiers with scarcity messaging, trust badges, payment icons, and comprehensive FAQs.

## Project Structure
```
/
├── index.html              # Main landing page (2 upcoming events + CTA)
├── hero-video.mp4          # Background video for hero section
├── pages/
│   ├── events.html         # Full 2026 race calendar (21 events)
│   └── events/             # Individual event detail pages (conversion-optimized)
│       ├── resolution-run.html      # January 1, 2026 - New Year's Day run
│       ├── white-river-snowshoe.html # February 7, 2026 - Winter snowshoe race
│       ├── silver-falls-trail.html  # March 14, 2026 - Trail run with 10 waterfalls
│       ├── stub-stewart-trail.html  # April 18, 2026 - Forest trail challenge
│       ├── spring-classic.html      # April 25, 2026 - Road race for PRs
│       ├── reflection-run.html      # May 23, 2026 - Memorial Day tribute
│       ├── scary-run.html           # October 24, 2026 - Halloween themed
│       └── santas-holiday-hustle.html # December 5, 2026 - Holiday fun run
└── replit.md               # Project documentation
```

## Technical Details
- **Type**: Static HTML website
- **Port**: 5000 (development)
- **Server**: Python HTTP server for development
- **Deployment**: Static hosting

## Features
- Responsive design with mobile support
- Video background in hero section
- Animated ticker displaying statistics
- Main page shows 2 upcoming events with "View All 2026 Events" CTA
- Full race calendar page with 21 events organized by season
- Sticky navigation bar with black-to-red gradient on scroll
- Footer with social links

## Event Page Template (Conversion-Optimized)
Each event detail page includes:
- Hero section with event tag, date, title, location, and prominent CTA
- Real-time countdown timer for early bird pricing deadlines
- Social proof bar (live registration count, ratings, urgency messaging)
- Event description with distances and what's included
- Testimonials with photos and star ratings
- Sticky registration sidebar with:
  - Tiered pricing (Early Bird, Regular, Race Week)
  - Scarcity warnings (limited spots remaining)
  - Trust badges (Free Transfers, Secure Checkout, Instant Confirmation)
  - Payment icons (Visa, Mastercard, PayPal, Apple Pay)
- Course features/highlights section
- FAQ section with common questions
- Branded footer with navigation links

## Design Choices
- Hero tagline "What's Your Why?" at 4.1rem with line-height: 1
- "RUN. RIDE. REMEMBER." at 2rem, inline display
- Scrolled nav uses black-to-red gradient at 80% opacity
- Brand colors: Red (#E31837), Blue (#00205B)
- Fonts: Oswald (headings), Inter (body)
- Event pages use themed hero backgrounds and colors per event type

## Recent Changes (January 2026)
- Added distance filter bar to events calendar page with 8 filter options (All Events, 5K, 10K, Half Marathon, Marathon, Ultra 25K+, Trail Run, Triathlon)
- All 21 event cards tagged with accurate data-distance attributes for filtering
- JavaScript filtering hides/shows events and sections dynamically
- Mobile-responsive filter bar with sticky positioning

## Previous Changes (December 2025)
- Applied conversion-optimized template to all 8 event pages
- Added countdown timers with unique early bird deadlines per event
- Added social proof elements and testimonials
- Added sticky registration sidebar with pricing tiers and scarcity messaging
- Added trust badges and payment icons
- Added FAQ sections with event-specific questions
