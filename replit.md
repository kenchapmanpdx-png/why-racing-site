# Why Racing Events

## Overview
A static website for Why Racing Events - a Pacific Northwest racing events organization. The site showcases upcoming races, triathlons, and marathons with a modern, responsive design featuring a video background hero section on the homepage. All 8 individual event pages use a conversion-optimized template with social proof elements, countdown timers, testimonials, pricing tiers with scarcity messaging, trust badges, payment icons, and comprehensive FAQs. Each event page features unique visual theming that matches the race's personality.

## Project Structure
```
/
├── index.html              # Main landing page (2 upcoming events + CTA)
├── hero-video.mp4          # Background video for hero section (landscape)
├── galaxy-hero-bw_*.mp4    # Portrait video for mobile hero
├── pages/
│   ├── events.html         # Full 2026 race calendar (21 events)
│   └── events/             # Individual event detail pages (uniquely themed)
│       ├── resolution-run.html      # January 1, 2026 - New Year's theme (gold/midnight blue)
│       ├── white-river-snowshoe.html # February 7, 2026 - Winter theme (icy blue)
│       ├── silver-falls-trail.html  # March 14, 2026 - Nature theme (forest green/waterfall blue)
│       ├── stub-stewart-trail.html  # April 18, 2026 - Forest theme (deep green/brown)
│       ├── spring-classic.html      # April 25, 2026 - Spring theme (green/yellow)
│       ├── reflection-run.html      # May 23, 2026 - Patriotic theme (red/white/blue)
│       ├── scary-run.html           # October 24, 2026 - Halloween theme (orange/purple)
│       └── santas-holiday-hustle.html # December 5, 2026 - Christmas theme (red/green/gold)
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

## Event Page Theming
Each event page has unique visual styling matching its personality:

### Scary Run (Halloween)
- Colors: Orange (#ff6b00), Purple (#7b2d8e), Dark purple (#1a0a1f)
- Icons: 🎃 🦇 👻 🕷️ 💀
- Font: Creepster for spooky title
- Decorations: Cobwebs, floating bats/pumpkins

### Santa's Holiday Hustle (Christmas)
- Colors: Christmas red (#c41e3a), Forest green (#228b22), Gold (#ffd700)
- Icons: 🎅 🎄 🎁 ⛄ ❄️ 🔔
- Decorations: Snowflakes, festive ornaments

### White River Snowshoe (Winter)
- Colors: Icy blue (#4fc3f7), Deep blue (#0277bd), Frost white
- Icons: ❄️ 🏔️ ⛷️ 🌨️ ⛄
- Animation: Falling snowflakes effect

### Resolution Run (New Year)
- Colors: Gold (#ffd700), Champagne (#f7e7ce), Midnight blue (#191970)
- Icons: 🎆 🎉 ✨ 🥂 🌟 🎊
- Animation: Sparkle/confetti effects

### Silver Falls Trail (Nature/Waterfalls)
- Colors: Forest green (#2e7d32), Waterfall blue (#0288d1), Earth brown
- Icons: 🌲 💧 🌿 🏞️ 🍃 🌊
- Theme: Emphasizes 10 waterfalls on the course

### Stub Stewart Trail (Forest)
- Colors: Deep forest green (#1b5e20), Bark brown (#4e342e), Trail tan
- Icons: 🌲 🦌 🍂 🥾 🏕️ 🌿
- Theme: Pacific Northwest forest adventure

### Spring Classic (Spring)
- Colors: Spring green (#4caf50), Sunshine yellow (#ffc107), Sky blue
- Icons: 🌸 🌷 ☀️ 🌻 🌼 🐝
- Theme: Fresh, energetic road race for PRs

### Reflection Run (Memorial Day)
- Colors: Patriotic red (#b71c1c), Navy blue (#0d47a1), Gold accents
- Icons: 🇺🇸 ⭐ 🎖️ 🏅
- Theme: Respectful patriotic tribute

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
- Fonts: Oswald (headings), Inter (body), Creepster (Scary Run title)
- CSS animations for floating icons and decorative elements
- CSS pseudo-elements (::before/::after) for themed decorations

## Recent Changes (January 2026)
- Applied unique visual theming to all 8 event pages
- Added floating decorative emoji icons with CSS animations
- Added themed color schemes, gradients, and backgrounds per event
- Added decorative pseudo-elements for visual interest
- Added themed emojis to headers, buttons, and sections

## Previous Changes (January 2026)
- Added distance filter bar to events calendar page with 8 filter options
- All 21 event cards tagged with accurate data-distance attributes for filtering

## Previous Changes (December 2025)
- Applied conversion-optimized template to all 8 event pages
- Added countdown timers with unique early bird deadlines per event
- Added social proof elements and testimonials
- Added sticky registration sidebar with pricing tiers and scarcity messaging
- Added trust badges and payment icons
- Added FAQ sections with event-specific questions
