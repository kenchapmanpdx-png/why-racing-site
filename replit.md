# Why Racing Events Website

## Overview

This is a static website for **Why Racing Events Inc.**, a Pacific Northwest-based race event company organizing running races, triathlons, and multi-sport events. The site showcases their 2026 event calendar, provides event registration information, and includes an AI-powered chatbot for customer inquiries.

The company's tagline is "What's Your WHY?" and they focus on events for athletes of all abilities, emphasizing fitness, family, and fun. They operate approximately 20+ annual events across Washington and Oregon.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML Pages**: Pure HTML/CSS/JavaScript without a frontend framework
- **Styling**: Inline CSS within each HTML file using CSS custom properties (variables) for consistent branding
- **Typography**: Google Fonts (Inter for body text, Oswald for headings)
- **Icons**: Font Awesome 6.4.0 via CDN
- **Design Pattern**: Each event page has its own color theme defined via CSS variables (e.g., `--theme-primary`, `--theme-secondary`)

### Backend Architecture
- **Server**: Express.js (v5.2.1) running on port 5000
- **Static File Serving**: Express serves HTML files from the root directory
- **API Endpoint**: `/api/chat` - Handles chatbot conversations using embedded event data

### Page Structure
- `index.html` - Homepage
- `events.html` - Event calendar overview
- `pages/` - Subpages including:
  - `about.html` - Company information
  - `partners.html` - Sponsorship opportunities
  - `first-5k.html` - Beginner guide
  - `events/` - Individual event pages (21 events total)

### Chatbot Integration
- React-based widget embedded via CDN (React 18, Babel standalone)
- Located in `chatbot-widget.html`
- Communicates with `/api/chat` endpoint
- Event knowledge base stored as a string constant in `server.js`

### Asset Management
- `video-mapping.json` - YouTube video IDs mapped to events for embedding
- `attached_assets/` - Photo mapping documentation for event imagery
- Images referenced from `images/` directory (heroes, action shots, avatars)

## External Dependencies

### CDN Resources
- React 18 (production UMD build)
- ReactDOM 18
- Babel Standalone (for JSX transformation in browser)
- Google Fonts API
- Font Awesome 6.4.0

### NPM Dependencies
- `express` (^5.2.1) - Web server framework

### Third-Party Integrations
- **YouTube**: Video embeds for event highlight reels (IDs stored in `video-mapping.json`)
- **External Registration**: Links to external registration platform (referenced in event data)

### Contact Information
- Email: info@whyracingevents.com / registration@whyracingevents.com
- Phone: (360) 314-4682
- Address: 210 E. Fourth St, Suite B, La Center, WA 98629
- Social: Facebook, Instagram, Twitter (@WhyRacingEvents)