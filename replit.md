# Why Racing Events

## Overview
A static website for Why Racing Events - a Pacific Northwest racing events organization. The site showcases upcoming races, triathlons, and marathons with a modern, responsive design featuring a video background hero section on the homepage. All 21 individual event pages use a conversion-optimized template with social proof elements, countdown timers, testimonials, pricing tiers with scarcity messaging, trust badges, payment icons, and comprehensive FAQs. Each event page features unique visual theming that matches the race's personality.

## Project Structure
```
/
├── index.html              # Main landing page (2 upcoming events + CTA)
├── hero-video.mp4          # Background video for hero section (landscape)
├── galaxy-hero-bw_*.mp4    # Portrait video for mobile hero
├── pages/
│   ├── events.html         # Full 2026 race calendar (21 events)
│   └── events/             # Individual event detail pages (21 uniquely themed)
│       ├── resolution-run.html          # Jan 1 - New Year (gold/midnight blue)
│       ├── white-river-snowshoe.html    # Feb 7 - Winter (icy blue)
│       ├── couve-clover-run.html        # Mar 14 - St. Patrick's (green/gold)
│       ├── silver-falls-trail.html      # Mar 14 - Nature (forest green/blue)
│       ├── crown-stub-100.html          # Apr 4-5 - Epic Ultra (purple/gold)
│       ├── stub-stewart-trail.html      # Apr 18 - Forest (deep green/brown)
│       ├── spring-classic.html          # Apr 25 - Spring (green/yellow)
│       ├── reflection-run.html          # May 23 - Patriotic (red/white/blue)
│       ├── pdx-triathlon-festival.html  # Jun 6-7 - Triathlon (blue/orange/green)
│       ├── hagg-lake-triathlon.html     # Jun 20 - Lake (lake blue/green)
│       ├── bigfoot-5k-10k.html          # Jul 11 - Bigfoot (forest brown/green)
│       ├── hellz-bellz-ultra.html       # Jul 25 - Fire (red/orange/black)
│       ├── columbia-river-tri.html      # Aug 7-8 - River (river blue/teal)
│       ├── girlfriends-triathlon.html   # Aug 15 - Women's (pink/purple)
│       ├── appletree-marathon.html      # Aug 29-30 - BQ (navy/gold)
│       ├── pacific-coast-running.html   # Sep 12 - Beach (ocean blue/sand)
│       ├── girlfriends-half.html        # Sep 26 - Women's (pink/rose)
│       ├── scary-run.html               # Oct 24 - Halloween (orange/purple)
│       ├── battle-to-pacific.html       # Nov 7 - Relay (red/blue)
│       ├── santas-holiday-hustle.html   # Dec 5 - Christmas (red/green/gold)
│       └── pacific-crest-endurance.html # Dec 12 - Mountain (gray/white/blue)
└── replit.md               # Project documentation
```

## Technical Details
- **Type**: Static HTML website
- **Port**: 5000 (development)
- **Server**: Python HTTP server for development
- **Deployment**: Static hosting

## Features
- Responsive design with mobile support
- Video background in hero section (landscape for desktop, portrait for mobile)
- Animated ticker displaying statistics
- Main page shows 2 upcoming events with "View All 2026 Events" CTA
- Full race calendar page with 21 events organized by season
- Distance filter bar with 8 filter options
- Sticky navigation bar with black-to-red gradient on scroll
- Footer with social links

## Event Page Theming (All 21 Races)
Each event page has unique visual styling matching its personality:

### January - March
- **Resolution Run** (Jan 1): Gold (#ffd700), Midnight blue (#191970) | 🎆 🎉 ✨ 🥂 🌟
- **White River Snowshoe** (Feb 7): Icy blue (#4fc3f7), Deep blue (#0277bd) | ❄️ 🏔️ ⛷️ 🌨️ ⛄
- **Couve Clover Run** (Mar 14): Irish green (#2e7d32), Gold (#ffd700) | ☘️ 🍀 🌈 🥇 💚
- **Silver Falls Trail** (Mar 14): Forest green (#2e7d32), Waterfall blue (#0288d1) | 🌲 💧 🌿 🏞️

### April - June
- **Crown Stub 100** (Apr 4-5): Royal purple (#4a148c), Gold (#ffd700) | 👑 🏔️ ⚡ 🦅 💪
- **Stub Stewart Trail** (Apr 18): Deep forest green (#1b5e20), Bark brown (#4e342e) | 🌲 🦌 🍂 🥾
- **Spring Classic** (Apr 25): Spring green (#4caf50), Sunshine yellow (#ffc107) | 🌸 🌷 ☀️ 🌻
- **Reflection Run** (May 23): Patriotic red (#b71c1c), Navy blue (#0d47a1) | 🇺🇸 ⭐ 🎖️ 🏅
- **PDX Triathlon Festival** (Jun 6-7): Swim blue (#0288d1), Bike orange (#ff6d00), Run green (#43a047) | 🏊 🚴 🏃 🏆
- **Hagg Lake Triathlon** (Jun 20): Lake blue (#1565c0), Forest green (#2e7d32) | 🏊 🌊 🚴 🌲

### July - September
- **Bigfoot 5K/10K** (Jul 11): Forest brown (#5d4037), Moss green (#558b2f) | 🦶 🌲 👣 🏔️
- **Hellz Bellz Ultra** (Jul 25): Fire red (#d32f2f), Flame orange (#ff5722), Charcoal (#212121) | 🔥 ⚡ 💀 🔔
- **Columbia River Tri** (Aug 7-8): River blue (#0277bd), Water teal (#00838f) | 🏊 🌊 🚴 🌉
- **Girlfriends Triathlon** (Aug 15): Empowerment pink (#e91e63), Purple (#9c27b0) | 💪 👯 🏊 🚴 💜
- **Appletree Marathon** (Aug 29-30): Boston blue (#0d47a1), Achievement gold (#ffc107) | 🏅 🏃 🎯 🏆 🍎
- **Pacific Coast Running** (Sep 12): Ocean blue (#0288d1), Sand tan (#d7ccc8) | 🏖️ 🌊 🐚 🌅
- **Girlfriends Half** (Sep 26): Empowerment pink (#e91e63), Rose gold (#b76e79) | 💪 👯 🏃 🌸 💜

### October - December
- **Scary Run** (Oct 24): Orange (#ff6b00), Purple (#7b2d8e), Dark purple (#1a0a1f) | 🎃 🦇 👻 🕷️ 💀
- **Battle to Pacific** (Nov 7): Adventure red (#c62828), Team blue (#1565c0) | 🏃 🚐 👥 🗺️ 🏆 🌊
- **Santa's Holiday Hustle** (Dec 5): Christmas red (#c41e3a), Forest green (#228b22), Gold (#ffd700) | 🎅 🎄 🎁 ⛄ ❄️
- **Pacific Crest Endurance** (Dec 12): Mountain gray (#455a64), Snow white (#eceff1), Ice blue (#b3e5fc) | 🏔️ ⛰️ 🥾 ❄️ 🌲

## Event Page Template Features
Each event detail page includes:
- Themed hero section with floating decorative emoji icons
- Real-time countdown timer for early bird pricing deadlines
- Social proof bar (live registration count, ratings, urgency messaging)
- Event description with distances and what's included
- Testimonials with photos and star ratings
- Sticky registration sidebar with:
  - Tiered pricing (Early Bird, Regular, Race Week)
  - Scarcity warnings (limited spots remaining)
  - Trust badges (Free Transfers, Secure Checkout, Instant Confirmation)
  - Payment icons (Visa, Mastercard, PayPal, Apple Pay)
- Course features/highlights section with themed backgrounds
- FAQ section with common questions
- Branded footer with navigation links

## Design Choices
- Hero tagline "What's Your Why?" at 4.1rem with line-height: 1
- "RUN. RIDE. REMEMBER." at 2rem, inline display
- Scrolled nav uses black-to-red gradient at 80% opacity
- Brand colors: Red (#E31837), Blue (#00205B)
- Fonts: Oswald (headings), Inter (body), Creepster (Scary Run), Pacifico (Girlfriends events)
- CSS animations for floating icons and decorative elements
- CSS pseudo-elements (::before/::after) for themed decorations

## Recent Changes (January 2026)
- Created themed pages for all 21 races in the 2026 calendar
- Added 13 new event pages with unique theming:
  - Couve Clover Run (St. Patrick's Day)
  - Crown Stub 100 (Epic Ultra)
  - PDX Triathlon Festival (Multi-sport)
  - Hagg Lake Triathlon (Lake/Nature)
  - Bigfoot 5K/10K (Forest Mystery)
  - Hellz Bellz Ultra (Fire/Extreme)
  - Columbia River Tri (River/Water)
  - Girlfriends Triathlon (Women's Empowerment)
  - Appletree Marathon (BQ Course)
  - Pacific Coast Running (Beach)
  - Girlfriends Half (Women's Empowerment)
  - Battle to Pacific (Team Relay)
  - Pacific Crest Endurance (Mountain Ultra)

## Previous Changes (January 2026)
- Applied unique visual theming to original 8 event pages
- Added floating decorative emoji icons with CSS animations
- Added themed color schemes, gradients, and backgrounds per event
- Added distance filter bar to events calendar page with 8 filter options

## Previous Changes (December 2025)
- Applied conversion-optimized template to all event pages
- Added countdown timers with unique early bird deadlines per event
- Added social proof elements and testimonials
- Added sticky registration sidebar with pricing tiers and scarcity messaging
- Added trust badges and payment icons
- Added FAQ sections with event-specific questions
