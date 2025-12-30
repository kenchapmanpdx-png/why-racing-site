# Why Racing Events

## Overview
A static website for Why Racing Events - a Pacific Northwest racing events organization. The site showcases upcoming races, triathlons, and marathons with a modern, responsive design featuring a video background hero section.

## Project Structure
```
/
├── index.html              # Main landing page (2 upcoming events + CTA)
├── hero-video.mp4          # Background video for hero section
├── pages/
│   ├── events.html         # Full 2026 race calendar (21 events)
│   └── events/             # Individual event detail pages
│       ├── resolution-run.html
│       ├── white-river-snowshoe.html
│       ├── scary-run.html
│       └── ... (more event pages)
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
- Individual event detail pages with registration info
- Sticky navigation bar with black-to-red gradient on scroll
- Footer with social links

## Design Choices
- Hero tagline "What's Your Why?" at 4.1rem with line-height: 1
- "RUN. RIDE. REMEMBER." at 2rem, inline display
- Scrolled nav uses black-to-red gradient at 80% opacity
- Brand colors: Red (#E31837), Blue (#00205B)
- Fonts: Oswald (headings), Inter (body)
