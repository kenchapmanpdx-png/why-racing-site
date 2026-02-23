require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also load standard .env if present
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { formidable } = require('formidable');
const fs = require('fs');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const { ServerClient } = require('postmark');

// Chatbot model — update here when upgrading model versions
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Allowed image MIME types for uploads (no SVG — can contain embedded JS)
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) { return UUID_REGEX.test(id); }

// === Environment Validation ===
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`⚠ WARNING: Missing required environment variables: ${missingVars.join(', ')}`);
  console.warn('Server may not function correctly. Please check your environment variables.');
}

// Startup check (non-sensitive)
console.log('=== Environment Check ===');
console.log('SUPABASE_URL:', '✓ Loaded');
console.log('SUPABASE_SERVICE_KEY:', '✓ Loaded');
console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET ? '✓ Loaded' : '⚠ MISSING (admin routes disabled)');
console.log('=========================');

// Global supabase instance - initialized on demand
let _supabaseClient = null;
const supabase = new Proxy({}, {
  get: (target, prop) => {
    if (!_supabaseClient) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new Error('Supabase configuration missing in Environment Variables.');
      }
      _supabaseClient = createClient(url, key);
    }
    return _supabaseClient[prop];
  }
});

// Helper to sanitize data (convert empty strings to null for DB)
const sanitizeData = (data) => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (Array.isArray(sanitized[key])) continue;
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) continue;

    // Convert empty strings to null to avoid DB syntax errors (especially for dates/numbers)
    // but keep 'name' as an empty string if it's empty to get a cleaner constraint error
    if (sanitized[key] === '' || sanitized[key] === undefined) {
      if (key === 'name') {
        sanitized[key] = ''; // Keep as empty string, let DB/validation handle it
      } else {
        sanitized[key] = null;
      }
    }
  }
  return sanitized;
};

const app = express();
const PORT = 5000;

// === Rate Limiting ===
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 chat requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Chat rate limit reached. Please wait a moment.' }
});

app.use(express.json({ limit: '50kb' }));
app.use(express.static('.'));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/chat', chatLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const { count, error } = await supabase.from('races').select('*', { count: 'exact', head: true });
  res.json({
    status: 'ok',
    database: error ? 'error' : 'connected',
    count: count || 0,
    error: error ? error.message : null,
    env: {
      has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
});

// === Auto-Archive Past Races ===
// Automatically move races to "draft" status after their date passes
// This runs on server startup and allows races to be reused for next year
async function archivePastRaces() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Find all active races where the race_date has passed
    const { data: pastRaces, error: fetchError } = await supabase
      .from('races')
      .select('id, name, race_date')
      .eq('status', 'active')
      .lt('race_date', today);

    if (fetchError) {
      console.error('Error fetching past races:', fetchError);
      return;
    }

    if (!pastRaces || pastRaces.length === 0) {
      console.log('✓ No past races to archive');
      return;
    }

    // Update each past race to draft status
    const { error: updateError } = await supabase
      .from('races')
      .update({ status: 'draft' })
      .eq('status', 'active')
      .lt('race_date', today);

    if (updateError) {
      console.error('Error archiving past races:', updateError);
      return;
    }

    console.log(`✓ Archived ${pastRaces.length} past race(s) to draft:`);
    pastRaces.forEach(race => {
      console.log(`  - ${race.name} (${race.race_date})`);
    });
  } catch (error) {
    console.error('Error in archivePastRaces:', error);
  }
}

// Run archive check on startup only for traditional (non-serverless) deployments.
// On Vercel, use the /api/cron/archive-races endpoint instead.
if (require.main === module) {
  archivePastRaces();
}


const FULL_EVENT_DATA = `
# WHY RACING EVENTS - Complete Event Information

## COMPANY OVERVIEW

**Company Name:** WHY RACING EVENTS Inc.
**Tagline:** "What's Your WHY?"
**Address:** 210 E. Fourth St, Suite B, La Center, WA 98629
**Phone:** (360) 314-4682
**Email:** info@whyracingevents.com
**Registration Email:** registration@whyracingevents.com

**Social Media:**
- Facebook: @WhyRacingEvents
- Instagram: @why_racing_events
- Twitter: @WhyRacingEvents
- Hashtag: #WhyRacing

**Mission:** WHY RACING EVENTS Inc. offers athletes of all abilities, from the elite level to the back of the packers, the chance to successfully train for and complete various types of races including fun runs, triathlons, adventure events and more while raising awareness and funds for important community causes.

**Core Values:** Fitness, Family, and Fun

**Community Impact:** Over $3,000,000 raised for charities and community causes

**Service Area:** Pacific Northwest (Washington, Oregon)

---

## EVENT CALENDAR 2026

| Date | Event | Location |
|------|-------|----------|
| January 3, 2026 | Resolution Run 5K/10K | La Center, WA |
| February 28, 2026 | Silver Falls Trail Challenge | Sublimity, OR |
| March 22, 2026 | Couve Clover Run | Vancouver, WA |
| April 26, 2026 | Spring Classic Duathlon/Half/10K/5K | Vancouver, WA |
| May 17, 2026 | Reflection Run | Washougal, WA |
| May 31, 2026 | PDX Triathlon | Blue Lake, OR |
| June 20-21, 2026 | Hagg Lake Triathlon & Trail Festival | Gaston, OR |
| July 4, 2026 | Bigfoot 5K & 10K | Yacolt, WA |
| July 5, 2026 | Hellz Bellz Ultra | Yacolt, WA |
| August 7-8, 2026 | Columbia River Triathlon & Festival | Vancouver, WA |
| August 9, 2026 | Girlfriends Triathlon & Fitness Festival | Vancouver, WA |
| August 29-30, 2026 | Appletree Marathon/Half/5K | Vancouver, WA |
| September 26-27, 2026 | Pacific Coast Running Festival | Long Beach, WA |
| October 18, 2026 | Girlfriends Half Marathon/10K/6K | Vancouver, WA |
| TBA 2026 | Scary Run Half/10K/5K | Washougal, WA |
| December 12, 2026 | Santa's Holiday Hustle | Camas, WA |
| TBD 2027 | Pacific Crest Endurance Festival | Bend, OR |

---

## DETAILED EVENT INFORMATION

### 1. RESOLUTION RUN - 5K AND 10K

**Date:** January 3, 2026
**Location:** La Center High School, La Center, WA
**Start Time:** TBA

**Description:** The 4th Annual Resolution Run offers a 5K and 10K option. A challenging course to kick up your New Year training program, trails and pathways along a very scenic course.

**Beneficiary:** La Center High School Volleyball and Track & Field programs

**Special Features:**
- All-you-can-eat pancake and sausage breakfast ($10 donation)
- Awards ceremony for top 3 overall and age group winners
- Run course twice for the resolution challenge

---

### 2. SILVER FALLS TRAIL CHALLENGE

**Date:** February 28, 2026
**Location:** Silver Falls State Park, Sublimity, Oregon

**Description:** Run through Oregon's stunning Trail of 10 Falls. Options include quarter marathon (1 loop) or half marathon (2 loops). Run behind and pass these picturesque waterfalls.

**Distances:**
- Quarter Marathon (1 loop)
- Half Marathon (2 loops)

---

### 3. COUVE CLOVER RUN

**Date:** March 22, 2026
**Start Time:** 9:00 AM sharp (arrive by 8:30 AM)
**Location:** Vancouver Waterfront Park, 695 Waterfront Way, Vancouver, WA 98660

**Distances:**
- Lucky Leap 1 Mile Walk (NEW - untimed)
- 3 Mile Run/Walk (walk division is untimed)
- Lucky 7 Mile Run
- 10 Mile Run

**Description:** 11th Annual St. Patrick's Day themed race celebrating in festive green while running or walking along an extremely fast and scenic course through historic Officer's Row, Fort Vancouver, and the Columbia Riverfront.

**What's Included:**
- Technical runner's t-shirt
- Finisher's medal
- Swag bag
- Post-event party with food and drinks
- Prize for Most Festive Costume

**Awards:**
- Top 3 Overall Male & Female
- Master Champions
- Top 3 Age Group Winners

**Beneficiaries:**
- Foundation for Vancouver Public Schools
- Evergreen School District Foundation
- WHY Community

**Kids Pricing:** 12 and under race 5K & 1-Miler FREE

---

### 4. SPRING CLASSIC DUATHLON, HALF MARATHON, 10K & 5K

**Date:** April 26, 2026
**Location:** Vancouver Lake Regional Park, 6801 NW Lower River Rd, Vancouver, WA 98660

**Start Times:**
- 7:45 AM - Half Marathon
- 8:00 AM - 5K & 10K
- 11:00 AM - Duathlon

**Events:**
- Half Marathon
- 10K Run
- 5K Run
- Sprint Duathlon: 5K Run / 13 Mile Bike / 5K Run

**Description:** 42nd Annual Spring Classic - Dust off the cobwebs and start the multi-sport racing season! Flat and fast course along Vancouver Lake and the Columbia River.

**Beneficiary:** Ainsley's Angels of America

---

### 5. REFLECTION RUN

**Date:** May 17, 2026
**Location:** Bi-Mart Parking Lot, 3003 Addy St, Washougal, WA

**Start Times:**
- 8:45 AM - Half Marathon & 12 Mile Ruck Challenge
- 9:00 AM - 5K & 10K

**Events:**
- Half Marathon
- 12 Mile Ruck Challenge (35 lb pack minimum or 40 lb vest)
- 10K
- 5K

**Description:** 11th Annual Reflection Run honors brave men and women serving in Armed Forces and remembers those who gave the ultimate sacrifice.

**Special:** Veterans and active military race FREE (email registration@whyracingevents.com with service details)

**Beneficiary:** Northwest Battle Buddies (service dogs for veterans with PTSD)

**Kids:** 12 and under race 5K FREE with adult registration

---

### 6. PDX TRIATHLON

**Date:** May 31, 2026
**Location:** Blue Lake Regional Park

**Description:** 43rd Annual PDX Triathlon Festival - Kick off for the racing season. Choose from Super Sprint, Sprint, or Olympic distances.

**Distances:**
- Super Sprint
- Sprint
- Olympic

---

### 7. HAGG LAKE TRIATHLON & TRAIL FESTIVAL

**Date:** June 20-21, 2026
**Location:** Henry Hagg Lake, Gaston, OR

**Description:** 45th Annual - One of the oldest and most gorgeous triathlon courses in the nation.

**Events:**
- Off-Road Triathlon
- Half Marathon Trail Run
- 5K Trail Run
- Camping available (tent only, car camping, trailers, RVs)

---

### 8. BIGFOOT FUN RUN

**Date:** July 4, 2026
**Start Time:** 9:00 AM
**Location:** Yacolt Recreational Park, Yacolt, WA

**Events:**
- 5K Run/Walk
- 10K Run/Walk

**Description:** Annual Fourth of July tradition. Part of Town of Yacolt's Rendezvous Days celebration weekend.

---

### 9. HELLZ BELLZ ULTRA

**Date:** July 5, 2026
**Start Time:** 6:00 AM
**Location:** Moulton Falls, Yacolt, WA

**Description:** Challenging 52-mile ultra marathon through the beautiful trails of Moulton Falls area.

---

### 10. COLUMBIA RIVER TRIATHLON & FESTIVAL

**Date:** August 7-8, 2026
**Location:** Frenchman's Bar Park, Vancouver, WA

**Description:** 43rd Annual Columbia River Triathlon - One of the premier triathlon events in the Pacific Northwest.

**Events:**
- Sprint Triathlon
- Olympic Triathlon
- Long Course Triathlon
- Relay Teams

---

### 11. GIRLFRIENDS TRIATHLON & FITNESS FESTIVAL

**Date:** August 9, 2026
**Start Time:** 9:00 AM (all events)
**Location:** Frenchman's Bar Park, Vancouver, WA

**Description:** 30th Annual All-Women's event. Rally your girlfriends for a fun, active girls-day-out!

**Events:**
- Sprint Triathlon (½ mile swim / 11.77 mile bike / 5K run)
- Duathlon
- AquaBike
- Relay Teams
- 5K Run

---

### 12. PEACEHEALTH APPLETREE MARATHON

**Date:** August 29-30, 2026
**Location:** Fort Vancouver, Vancouver, WA

**Events:**
- Boston-Qualifying Marathon (NEW flat, fast 1-loop course)
- First Responder's Marathon Relay
- Half Marathon
- 5K

**Description:** Run Through History - Flat, fast, scenic course through Fort Vancouver, Officers Row, Army Barracks, Pearson Airport (oldest operating airport in USA), Historical Old Apple Tree, and Columbia River.

**Beneficiary:** Police Activities League (PAL) of Southwest Washington

---

### 13. PACIFIC COAST RUNNING FESTIVAL

**Date:** September 26-27, 2026
**Location:** Long Beach, WA

**Events:**
- Sand Marathon
- Half Marathon
- 10K
- 5K
- Kids ½ mile & 1 mile Dashes

**Description:** 6th Annual - Events for the whole family on the beautiful Long Beach Peninsula!

---

### 14. GIRLFRIENDS HALF MARATHON, 10K & 6K

**Date:** October 18, 2026
**Location:** Waterfront Park, Vancouver, WA

**Description:** Recruit your best girlfriends and help raise funds for Breast Cancer Treatment, Research, and a Cure.

**Events:**
- Half Marathon
- 10K
- 6K

---

### 15. SCARY RUN - HALF MARATHON, 10K & 5K

**Date:** TBA 2026
**Location:** Washougal, WA

**Start Times:**
- 15K: 8:45 AM
- 5K & 10K: 9:00 AM

**Description:** 10th Annual Halloween-themed race. Get out your costumes and be prepared to be scared by monsters, zombies, and psycho freaks!

---

### 16. SANTA'S HOLIDAY HUSTLE

**Date:** December 12, 2026
**Location:** Camas, WA

**Events:**
- Santa's Holiday Hustle 5K Run/Walk
- Dirty Santa 10K Trail Run (2nd Annual)

**Description:** 7th Annual - Celebrate the holidays in an active and festive way!

---

### 17. PACIFIC CREST ENDURANCE SPORTS FESTIVAL

**Date:** TBD 2027 (typically June)
**Location:** Riverbend Park, 799 SW Columbia St, Bend, OR 97702

**Description:** 30th Annual - The ULTIMATE RACE-CATION! Jewel of multisport events in the Northwest.

**SATURDAY Events:**
- Beastman Triathlon/Duathlon/AquaBike: 7:00 AM (800m swim / 58.70 mile bike / 13.1 mile run)
- Olympic Triathlon/Duathlon/AquaBike: 7:18 AM
- Sprint Triathlon/Duathlon/AquaBike: 7:33 AM
- Marathon: 8:00 AM
- Half Marathon: 8:00 AM
- 10K: 8:10 AM

**Prize Purse (Beastman Triathlon):**
- 1st Place: $1,000
- 2nd Place: $500
- 3rd Place: $250

---

## GENERAL REGISTRATION POLICIES

**Refunds:** Contact registration@whyracingevents.com for specific event policies

**Transfers:** Contact registration@whyracingevents.com

**Packet Pickup Authorization:** If picking up for someone else, bring signed authorization form and copy of their ID

**USAT Membership:** Required for triathlon/duathlon events. Bring membership card to packet pickup.

---

## AGE GROUP CATEGORIES

Standard age groups for most events:
- 9 and under, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80+

**Special Divisions:**
- Clydesdale: Men 220+ lbs
- Athena: Women 165+ lbs
- Friends & Family: Non-competitive, start together
- Relay Teams: Men's, Women's, Mixed

---

## EQUIPMENT RULES (TRIATHLON/DUATHLON)

**Bike:**
- Any type of bike allowed (road or mountain)
- Must have functioning brakes
- Must have end-caps on handlebars
- Helmet mandatory

**Music Devices:**
- ABSOLUTELY NO music during bike segment (immediate disqualification)
- During runs: Only one earbud allowed, keep volume low

**Wetsuits:** Optional for swim

---

## FREQUENTLY ASKED QUESTIONS

**Q: Can I register on race day?**
A: Check specific event registration details. Email registration@whyracingevents.com

**Q: Are dogs allowed?**
A: Only service dogs, must start at end of race after all other participants

**Q: Are strollers allowed?**
A: Yes for running events, must start at end of race. Not recommended for longer distances.

**Q: What if my shirt doesn't fit?**
A: Shirt swap available at events (subject to availability)

**Q: Will there be water on the course?**
A: Aid stations approximately every 2 miles for running. Carry own hydration for bike.

---

## CONTACT INFORMATION

**General Inquiries:** info@whyracingevents.com
**Registration Questions:** registration@whyracingevents.com
**Sponsorship/Partnership:** marla@whyracingevents.com
**Phone:** (360) 314-4682

**Office Address:**
WHY RACING EVENTS Inc.
210 E. Fourth St, Suite B
La Center, WA 98629

---

## MAJOR PARTNERS

- **PeaceHealth** - Exclusive Health & Wellness Partner
- **Foot Traffic** - Exclusive Specialty Running Store
- **PepsiCo/Gatorade** - Beverage Partner
- **McCord's Vancouver Toyota** - Vehicle Partner
`;

const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant for WHY RACING EVENTS, a Pacific Northwest race company that has raised over $3 million for charity. Use the following comprehensive event data to answer questions accurately and enthusiastically.

${FULL_EVENT_DATA}

Guidelines:
- Be warm, encouraging, and excited about racing
- Give accurate, detailed answers using the data above
- For registration questions, direct to registration@whyracingevents.com or the event page
- For sponsorship inquiries, direct to marla@whyracingevents.com
- If you don't know something specific, say so and suggest contacting info@whyracingevents.com or calling (360) 314-4682
- Encourage participation and highlight the community/charity aspects
- Keep responses helpful but concise
- Know all course records, packet pickup times, start times, and policies`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required and must not be empty' });
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      return res.status(400).json({ error: 'Each message must have a role and content string' });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Chat service is temporarily unavailable. Please contact us at info@whyracingevents.com or call (360) 314-4682' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API Error:', data);
      return res.status(502).json({ error: 'Chat service encountered an error. Please try again later.' });
    }

    if (data.error) {
      console.error('Anthropic API returned error:', data.error);
      return res.status(502).json({ error: 'Chat service encountered an error. Please try again later.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Anthropic API Error:', error);
    res.status(500).json({ error: 'Failed to connect to chat service. Please try again later.' });
  }
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

// Auth middleware for admin routes
const adminAuth = (req, res, next) => {
  if (!process.env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin access not configured on this server' });
  }
  const authHeader = req.headers.authorization;
  const expected = `Bearer ${process.env.ADMIN_SECRET}`;
  // Use timing-safe comparison to prevent timing attacks
  if (
    !authHeader ||
    authHeader.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Admin login — validates password server-side and returns the bearer token.
// The secret is never exposed in client-side source code.
app.post('/api/admin/login', (req, res) => {
  if (!process.env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin access not configured on this server' });
  }
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' });
  }
  // Timing-safe comparison
  const passwordBuf = Buffer.from(password);
  const secretBuf = Buffer.from(process.env.ADMIN_SECRET);
  if (passwordBuf.length !== secretBuf.length || !crypto.timingSafeEqual(passwordBuf, secretBuf)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  return res.status(200).json({ token: process.env.ADMIN_SECRET });
});

// 1. AI Theme Generation
app.post('/api/generate-theme', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a theme description' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: OPENAI_API_KEY is missing from environment variables');
      throw new Error('API key configuration error');
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    console.log('--- Theme Generation Start (OpenAI) ---');
    console.log('Prompt:', prompt);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are an expert web designer specializing in high-energy event branding. Respond only with valid JSON."
        }, {
          role: "user",
          content: `Generate a unique, vibrant, and cohesive visual theme for a race event based on the description below.

Description: "${prompt}"

CRITICAL RULES:
1. DO NOT use generic red/blue/green unless explicitly requested.
2. Be creative with the palette (e.g., "Midnight Neon", "Desert Sunset", "Electric Forest").
3. Ensure colors are distinct from each other (no same hex codes for primary/secondary unless intentional).
4. backgroundColor should usually be very dark (#050505 to #1a1a1a) to maintain the premium dashboard aesthetic, but colors must POP against it.

Respond with ONLY valid JSON:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode",
  "accentColor": "#hexcode",
  "backgroundColor": "#hexcode",
  "fontStyle": "modern|playful|bold|elegant|rugged|gothic",
  "mood": "comma, separated, keywords",
  "tagline": "A catchy, motivating tagline (under 60 characters)"
}`
        }],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error:', response.status, errorBody);
      throw new Error(`OpenAI API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    console.log('Raw AI Response:', text);

    let theme = JSON.parse(text);

    return res.status(200).json(theme);
  } catch (error) {
    console.error('Theme generation error:', error.message);
    // Return the fallback as a successful response so the user still gets a theme
    return res.status(200).json({
      primaryColor: '#E31837',
      secondaryColor: '#0ea5e9',
      accentColor: '#22c55e',
      backgroundColor: '#0a0a0a',
      fontStyle: 'bold',
      mood: 'energetic, motivating, fun',
      tagline: 'Your next adventure starts here!',
      _fallback: true,
      _error: error.message
    });
  }
});

// Get all races (Admin view - including drafts/invisible)
app.get('/api/races/all', adminAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('races')
    .select(`
      *,
      race_distances (*),
      pricing_tiers (*)
    `)
    .order('race_date', { ascending: true });

  if (error) {
    console.error('Supabase Error (GET /api/races/all):', error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
});

// Get public races (active and visible only)
app.get('/api/races', async (req, res) => {
  const { data, error } = await supabase
    .from('races')
    .select(`
      *,
      race_distances (*),
      pricing_tiers (*)
    `)
    .eq('status', 'active')
    .eq('is_visible', true)
    .order('race_date', { ascending: true });

  if (error) {
    console.error('Supabase Error (GET /api/races):', error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
});

// Get single race (basic)
app.get('/api/races/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid race ID' });

  const { data, error } = await supabase
    .from('races')
    .select(`
      *,
      race_distances (*),
      pricing_tiers (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'Race not found' });
    console.error(`Supabase Error (GET /api/races/${id}):`, error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
});

// Get FULL race details (for race detail page)
app.get('/api/races/:id/full', async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid race ID' });

  try {
    // Fetch race with all related content in parallel
    const [
      raceResult,
      contentResult,
      distancesResult,
      pricingResult,
      faqsResult,
      policiesResult,
      sponsorsResult,
      beneficiariesResult,
      packetPickupResult,
      awardCategoriesResult,
      courseRecordsResult,
      spectatorLocationsResult,
      accommodationsResult,
      restaurantsResult,
      multisportResult,
      themedContentResult,
      whatToBringResult,
      amenitiesResult,
      photosResult,
      startTimesResult
    ] = await Promise.all([
      supabase.from('races').select('*').eq('id', id).single(),
      supabase.from('race_content').select('*').eq('race_id', id).maybeSingle(),
      supabase.from('race_distances').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('pricing_tiers').select('*').eq('race_id', id),
      supabase.from('race_faqs').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('race_policies').select('*').eq('race_id', id),
      supabase.from('race_sponsors').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('race_beneficiaries').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('packet_pickup_locations').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('award_categories').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('course_records').select('*').eq('race_id', id),
      supabase.from('spectator_locations').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('race_accommodations').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('race_restaurants').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('multisport_details').select('*').eq('race_id', id).maybeSingle(),
      supabase.from('themed_event_content').select('*').eq('race_id', id).maybeSingle(),
      supabase.from('what_to_bring_items').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('course_amenities').select('*').eq('race_id', id),
      supabase.from('race_photos').select('*').eq('race_id', id).order('sort_order'),
      supabase.from('event_start_times').select('*').eq('race_id', id).order('sort_order')
    ]);

    if (raceResult.error) {
      console.error(`Supabase Error (GET /api/races/${id}/full):`, raceResult.error);
      return res.status(404).json({ error: 'Race not found' });
    }

    // Structure the response
    const fullRaceData = {
      ...raceResult.data,
      content: contentResult.data || null,
      race_distances: distancesResult.data || [],
      pricing_tiers: pricingResult.data || [],
      faqs: faqsResult.data || [],
      policies: policiesResult.data || [],
      sponsors: sponsorsResult.data || [],
      beneficiaries: beneficiariesResult.data || [],
      packet_pickup: packetPickupResult.data || [],
      award_categories: awardCategoriesResult.data || [],
      course_records: courseRecordsResult.data || [],
      spectator_locations: spectatorLocationsResult.data || [],
      accommodations: accommodationsResult.data || [],
      restaurants: restaurantsResult.data || [],
      multisport_details: multisportResult.data || null,
      themed_content: themedContentResult.data || null,
      what_to_bring: whatToBringResult.data || [],
      course_amenities: amenitiesResult.data || [],
      photos: photosResult.data || [],
      start_times: startTimesResult.data || []
    };

    return res.status(200).json(fullRaceData);
  } catch (err) {
    console.error(`Server Error (GET /api/races/${id}/full):`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new race
app.post('/api/races', adminAuth, async (req, res) => {
  console.log('=== POST /api/races called ===');
  const {
    distances,
    pricing_tiers,
    pricing_config,
    multisport_details,
    packet_pickup_locations,
    beneficiaries,
    sponsors,
    ...raceData
  } = req.body;

  const cleanRaceData = sanitizeData(raceData);

  try {
    const { data: race, error: raceError } = await supabase
      .from('races')
      .insert(cleanRaceData)
      .select()
      .single();

    if (raceError) {
      console.error('Supabase Error (POST /api/races - race insert):', raceError);
      return res.status(500).json({ error: raceError.message });
    }

    const raceId = race.id;

    // 1. Insert Distances & Pricing
    if (distances && distances.length > 0) {
      const distancesWithRaceId = distances.map((d, i) => ({
        ...d,
        race_id: raceId,
        sort_order: i
      }));
      const { data: newDists, error: dError } = await supabase.from('race_distances').insert(distancesWithRaceId).select();

      if (!dError && pricing_config && newDists) {
        await applyGlobalPricing(raceId, newDists, pricing_config, supabase);
      }
    }

    // 2. Insert Multi-sport Details
    if (multisport_details) {
      await supabase.from('multisport_details').insert({ ...multisport_details, race_id: raceId });
    }

    // 3. Insert Packet Pickup Locations
    if (packet_pickup_locations && packet_pickup_locations.length > 0) {
      await supabase.from('packet_pickup_locations').insert(
        packet_pickup_locations.map((loc, i) => ({ ...loc, race_id: raceId, sort_order: i }))
      );
    }

    // 4. Insert Beneficiaries
    if (beneficiaries && beneficiaries.length > 0) {
      await supabase.from('race_beneficiaries').insert(
        beneficiaries.map((b, i) => ({ ...b, race_id: raceId, sort_order: i }))
      );
    }

    // 5. Insert Sponsors
    if (sponsors && sponsors.length > 0) {
      await supabase.from('race_sponsors').insert(
        sponsors.map((s, i) => ({ ...s, race_id: raceId, sort_order: i }))
      );
    }

    return res.status(201).json(race);
  } catch (err) {
    console.error('Server Internal Error (POST /api/races):', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update race
app.put('/api/races/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid race ID' });
  const {
    distances,
    pricing_tiers,
    pricing_config,
    multisport_details,
    packet_pickup_locations,
    beneficiaries,
    sponsors,
    created_at,
    updated_at,
    ...raceData
  } = req.body;

  const cleanRaceData = sanitizeData(raceData);

  try {
    // 1. Update race basic info
    const { data: updatedRows, error: raceError } = await supabase
      .from('races')
      .update(cleanRaceData)
      .eq('id', id)
      .select('id');

    if (raceError) {
      console.error(`Supabase Error (PUT /api/races/${id}):`, raceError);
      return res.status(500).json({ error: raceError.message });
    }
    if (!updatedRows || updatedRows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }

    // 2. Handle distances
    if (distances) {
      await supabase.from('race_distances').delete().eq('race_id', id);
      if (distances.length > 0) {
        const distancesWithRaceId = distances.map((d, i) => ({
          ...d,
          race_id: id,
          sort_order: i
        }));
        const { data: newDists, error: dError } = await supabase.from('race_distances').insert(distancesWithRaceId).select();

        if (!dError && pricing_config && newDists) {
          await applyGlobalPricing(id, newDists, pricing_config, supabase);
        }
      }
    }

    // 3. Handle Multisport Details
    if (multisport_details) {
      await supabase.from('multisport_details').delete().eq('race_id', id);
      if (Object.values(multisport_details).some(v => v !== null && v !== '')) {
        await supabase.from('multisport_details').insert({ ...multisport_details, race_id: id });
      }
    }

    // 4. Handle Packet Pickup Locations
    if (packet_pickup_locations) {
      await supabase.from('packet_pickup_locations').delete().eq('race_id', id);
      if (packet_pickup_locations.length > 0) {
        await supabase.from('packet_pickup_locations').insert(
          packet_pickup_locations.map((loc, i) => ({ ...loc, race_id: id, sort_order: i }))
        );
      }
    }

    // 5. Handle Beneficiaries
    if (beneficiaries) {
      await supabase.from('race_beneficiaries').delete().eq('race_id', id);
      if (beneficiaries.length > 0) {
        await supabase.from('race_beneficiaries').insert(
          beneficiaries.map((b, i) => ({ ...b, race_id: id, sort_order: i }))
        );
      }
    }

    // 6. Handle Sponsors
    if (sponsors) {
      await supabase.from('race_sponsors').delete().eq('race_id', id);
      if (sponsors.length > 0) {
        await supabase.from('race_sponsors').insert(
          sponsors.map((s, i) => ({ ...s, race_id: id, sort_order: i }))
        );
      }
    }

    // Legacy support for direct pricing_tiers
    if (!pricing_config && pricing_tiers) {
      await supabase.from('pricing_tiers').delete().eq('race_id', id);
      const tiersWithRaceId = pricing_tiers.map(t => ({ ...t, race_id: id }));
      await supabase.from('pricing_tiers').insert(tiersWithRaceId);
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Server Internal Error (PUT /api/races/${id}):`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2.5 Delete Race
app.delete('/api/races/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid race ID' });
  console.log(`DELETE request for race ID: ${id}`);

  try {
    const { data: deletedRows, error } = await supabase
      .from('races')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.error(`Supabase Error (DELETE /api/races/${id}):`, error);
      return res.status(500).json({ error: error.message });
    }
    if (!deletedRows || deletedRows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }

    console.log(`Race ${id} deleted successfully`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Server Internal Error (DELETE /api/races/${id}):`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// RACE CONTENT MANAGEMENT ENDPOINTS
// =============================================

// Race Content (Core details like about, venue, travel)
app.put('/api/races/:id/content', adminAuth, async (req, res) => {
  const { id } = req.params;
  const contentData = { ...req.body, race_id: id };

  try {
    const { data, error } = await supabase
      .from('race_content')
      .upsert(contentData, { onConflict: 'race_id' })
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error saving race content:', err);
    return res.status(500).json({ error: err.message });
  }
});

// FAQs CRUD
app.post('/api/races/:id/faqs', adminAuth, async (req, res) => {
  const { id } = req.params;
  const faqData = { ...req.body, race_id: id };

  const { data, error } = await supabase.from('race_faqs').insert(faqData).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/faqs/:faqId', adminAuth, async (req, res) => {
  const { faqId } = req.params;
  const { data, error } = await supabase.from('race_faqs').update(req.body).eq('id', faqId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/faqs/:faqId', adminAuth, async (req, res) => {
  const { faqId } = req.params;
  const { error } = await supabase.from('race_faqs').delete().eq('id', faqId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Policies CRUD
app.post('/api/races/:id/policies', adminAuth, async (req, res) => {
  const { id } = req.params;
  const policyData = { ...req.body, race_id: id };

  const { data, error } = await supabase
    .from('race_policies')
    .upsert(policyData, { onConflict: 'race_id,policy_type' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/policies/:policyId', adminAuth, async (req, res) => {
  const { policyId } = req.params;
  const { error } = await supabase.from('race_policies').delete().eq('id', policyId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Sponsors CRUD
app.post('/api/races/:id/sponsors', adminAuth, async (req, res) => {
  const { id } = req.params;
  const sponsorData = { ...req.body, race_id: id };

  const { data, error } = await supabase.from('race_sponsors').insert(sponsorData).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/sponsors/:sponsorId', adminAuth, async (req, res) => {
  const { sponsorId } = req.params;
  const { data, error } = await supabase.from('race_sponsors').update(req.body).eq('id', sponsorId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/sponsors/:sponsorId', adminAuth, async (req, res) => {
  const { sponsorId } = req.params;
  const { error } = await supabase.from('race_sponsors').delete().eq('id', sponsorId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Beneficiaries CRUD
app.post('/api/races/:id/beneficiaries', adminAuth, async (req, res) => {
  const { id } = req.params;
  const beneficiaryData = { ...req.body, race_id: id };

  const { data, error } = await supabase.from('race_beneficiaries').insert(beneficiaryData).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.delete('/api/beneficiaries/:beneficiaryId', adminAuth, async (req, res) => {
  const { beneficiaryId } = req.params;
  const { error } = await supabase.from('race_beneficiaries').delete().eq('id', beneficiaryId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Packet Pickup CRUD
app.post('/api/races/:id/packet-pickup', adminAuth, async (req, res) => {
  const { id } = req.params;
  const pickupData = { ...req.body, race_id: id };

  const { data, error } = await supabase.from('packet_pickup_locations').insert(pickupData).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.delete('/api/packet-pickup/:pickupId', adminAuth, async (req, res) => {
  const { pickupId } = req.params;
  const { error } = await supabase.from('packet_pickup_locations').delete().eq('id', pickupId);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Multi-Sport Details (upsert)
app.put('/api/races/:id/multisport', adminAuth, async (req, res) => {
  const { id } = req.params;
  const multisportData = { ...req.body, race_id: id };

  const { data, error } = await supabase
    .from('multisport_details')
    .upsert(multisportData, { onConflict: 'race_id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

// Themed Event Content (upsert)
app.put('/api/races/:id/themed-content', adminAuth, async (req, res) => {
  const { id } = req.params;
  const themedData = { ...req.body, race_id: id };

  const { data, error } = await supabase
    .from('themed_event_content')
    .upsert(themedData, { onConflict: 'race_id' })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

// Seed standard content for a race (FAQs, policies, age groups)
app.post('/api/races/:id/seed-standard-content', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Standard FAQs
    const standardFaqs = [
      { question: 'Can I register on Race Day?', answer: 'Race day registration may be available if the event is not sold out.', category: 'registration', sort_order: 1 },
      { question: 'Can my friend pick up my packet?', answer: 'Yes, but they must bring a signed Authorization Form and a copy of your photo ID.', category: 'registration', sort_order: 2 },
      { question: 'Are headphones/earbuds allowed?', answer: 'We prefer athletes NOT use music devices for safety. Keep only ONE earbud in.', category: 'rules', sort_order: 3 },
      { question: 'Are dogs allowed on course?', answer: 'Only Service Dogs are allowed on course.', category: 'rules', sort_order: 4 },
      { question: 'Are strollers allowed?', answer: 'Yes, but strollers must start at the end of the race.', category: 'rules', sort_order: 5 },
      { question: 'Will you offer bag check?', answer: 'Yes! Label your bag with your name and bib number.', category: 'logistics', sort_order: 6 }
    ].map(faq => ({ ...faq, race_id: id }));

    await supabase.from('race_faqs').insert(standardFaqs);

    // Standard Policies
    const standardPolicies = [
      { policy_type: 'headphone_policy', policy_text: 'We prefer athletes NOT use music devices. One earbud only. Two earbuds = DQ.' },
      { policy_type: 'dog_policy', policy_text: 'Only Service Dogs allowed on course.' },
      { policy_type: 'stroller_policy', policy_text: 'Strollers must start at the end of the race.' },
      { policy_type: 'bag_check', policy_text: 'Free bag check available. Label with name and bib.' }
    ].map(p => ({ ...p, race_id: id }));

    await supabase.from('race_policies').upsert(standardPolicies, { onConflict: 'race_id,policy_type' });

    // Standard Age Groups
    const ageGroups = [
      '9 and under', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39',
      '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
    ].map((name, i) => ({
      race_id: id,
      category_type: 'age_group',
      category_name: name,
      awards_depth: 3,
      sort_order: i + 1
    }));

    await supabase.from('award_categories').insert(ageGroups);

    return res.status(200).json({ success: true, message: 'Standard content seeded' });
  } catch (err) {
    console.error('Error seeding standard content:', err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Standalone Section CRUD ---

// Training Clubs
app.get('/api/training-clubs', async (req, res) => {
  const { data, error } = await supabase.from('training_clubs').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.post('/api/training-clubs', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('training_clubs').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/training-clubs/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('training_clubs').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/training-clubs/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('training_clubs').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Beneficiaries (Standalone)
app.get('/api/beneficiaries', async (req, res) => {
  const { data, error } = await supabase.from('beneficiaries').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.post('/api/beneficiaries', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('beneficiaries').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/beneficiaries/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('beneficiaries').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/beneficiaries/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('beneficiaries').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Team Members
app.get('/api/team-members', async (req, res) => {
  const { data, error } = await supabase.from('team_members').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.post('/api/team-members', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('team_members').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/team-members/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('team_members').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/team-members/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// Global Sponsors (Partners Page)
app.get('/api/global-sponsors', async (req, res) => {
  const { data, error } = await supabase.from('global_sponsors').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.post('/api/global-sponsors', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('global_sponsors').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.put('/api/global-sponsors/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('global_sponsors').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
});

app.delete('/api/global-sponsors/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('global_sponsors').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

// --- End of Standalone Section CRUD ---

// 3. Image Upload
app.post('/api/races/upload', adminAuth, (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowEmptyFiles: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    console.log('Upload received - fields:', JSON.stringify(fields), 'files:', Object.keys(files));

    // Formidable v3 returns arrays for fields and files
    const getSingleValue = (obj, key) => {
      const val = obj[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };

    const file = getSingleValue(files, 'file');
    const type = getSingleValue(fields, 'type');
    const raceId = getSingleValue(fields, 'raceId');

    if (!file) {
      console.error('No file in upload. Files keys:', Object.keys(files));
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Uploading file:', file.originalFilename, 'type:', type, 'raceId:', raceId);

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      // Add random suffix to prevent any filename collisions
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safeFilename = (file.originalFilename || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${raceId}/${type}-${Date.now()}-${randomSuffix}-${safeFilename}`;

      // Validate and determine content type
      const contentType = file.mimetype || '';
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
      }

      console.log('Uploading to Supabase Storage:', fileName, 'Size:', fileBuffer.length, 'bytes', 'Type:', contentType);

      const { data, error } = await supabase.storage
        .from('race-images')
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        console.error('Supabase storage error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          fileName,
          type: file.mimetype
        });
        return res.status(500).json({
          error: 'Storage error: ' + (error.message || error.statusCode || 'Unknown error'),
          details: error
        });
      }

      const { data: urlData } = supabase.storage
        .from('race-images')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', urlData.publicUrl);

      return res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error.message, error.stack);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });
});

app.post('/api/beneficiaries/upload', adminAuth, (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowEmptyFiles: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const getSingleValue = (obj, key) => {
      const val = obj[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };

    const file = getSingleValue(files, 'file');
    const beneficiaryId = getSingleValue(fields, 'beneficiaryId') || 'new';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safeFilename = (file.originalFilename || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `beneficiaries/${beneficiaryId}-${Date.now()}-${randomSuffix}-${safeFilename}`;

      const contentType = file.mimetype || '';
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
      }

      const { data, error } = await supabase.storage
        .from('race-images')
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        return res.status(500).json({ error: 'Storage error: ' + error.message });
      }

      const { data: urlData } = supabase.storage
        .from('race-images')
        .getPublicUrl(fileName);

      return res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });
});

app.post('/api/team-members/upload', adminAuth, (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowEmptyFiles: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const getSingleValue = (obj, key) => {
      const val = obj[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };

    const file = getSingleValue(files, 'file');
    const memberId = getSingleValue(fields, 'memberId') || 'new';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safeFilename = (file.originalFilename || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `team-members/${memberId}-${Date.now()}-${randomSuffix}-${safeFilename}`;

      const contentType = file.mimetype || '';
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
      }

      const { data, error } = await supabase.storage
        .from('race-images') // Reusing the same public bucket
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        return res.status(500).json({ error: 'Storage error: ' + error.message });
      }

      const { data: urlData } = supabase.storage
        .from('race-images')
        .getPublicUrl(fileName);

      return res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });
});

app.post('/api/global-sponsors/upload', adminAuth, (req, res) => {
  const form = formidable({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowEmptyFiles: false
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const getSingleValue = (obj, key) => {
      const val = obj[key];
      if (Array.isArray(val)) return val[0];
      return val;
    };

    const file = getSingleValue(files, 'file');
    const sponsorId = getSingleValue(fields, 'sponsorId') || 'new';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath);
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safeFilename = (file.originalFilename || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `sponsors/${sponsorId}-${Date.now()}-${randomSuffix}-${safeFilename}`;

      const contentType = file.mimetype || '';
      if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' });
      }

      const { data, error } = await supabase.storage
        .from('race-images')
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          upsert: true
        });

      if (error) {
        return res.status(500).json({ error: 'Storage error: ' + error.message });
      }

      const { data: urlData } = supabase.storage
        .from('race-images')
        .getPublicUrl(fileName);

      return res.status(200).json({ url: urlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
  });
});

// For local development
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WHY RACING EVENTS server running on port ${PORT}`);
  });
}

// Helper to apply global pricing config to all distances
async function applyGlobalPricing(raceId, dists, pricingConfig, supabase) {
  if (!pricingConfig || !dists || dists.length === 0) return;

  const tiers = [];

  dists.forEach(dist => {
    const basePrice = Number(dist.base_price) || 0;

    // Early Bird
    if (pricingConfig.earlyBirdDiscount && pricingConfig.earlyBirdStart) {
      const discount = Number(pricingConfig.earlyBirdDiscount) || 0;
      tiers.push({
        race_id: raceId,
        distance_id: dist.id,
        tier_name: 'Early Bird',
        price: Math.max(0, basePrice - discount),
        start_date: pricingConfig.earlyBirdStart,
        end_date: pricingConfig.earlyBirdEnd || pricingConfig.earlyBirdStart
      });

      // Standard (implied)
      if (pricingConfig.earlyBirdEnd) {
        const stdStart = new Date(pricingConfig.earlyBirdEnd);
        stdStart.setDate(stdStart.getDate() + 1);

        tiers.push({
          race_id: raceId,
          distance_id: dist.id,
          tier_name: 'Standard',
          price: basePrice,
          start_date: stdStart.toISOString().split('T')[0],
          end_date: '2099-12-31'
        });
      }
    }
  });

  if (tiers.length > 0) {
    const { error: delErr } = await supabase.from('pricing_tiers').delete().eq('race_id', raceId);
    if (delErr) throw delErr;
    const { error: insErr } = await supabase.from('pricing_tiers').insert(tiers);
    if (insErr) throw insErr;
  }
}

// ==========================================
// EMAIL SIGNUP & EXPORT SYSTEM
// ==========================================

const postmark = process.env.POSTMARK_API_TOKEN ? new ServerClient(process.env.POSTMARK_API_TOKEN) : null;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Prevent CSV injection
function sanitizeCSVCell(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed.replace(/"/g, '""');
}

// 1. Capture Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { email, firstName, lastName, source, website } = req.body;

    // Honeypot bot detection
    if (website) {
      console.log('Bot detected via honeypot');
      return res.json({ success: true });
    }

    // Validation
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Sanitize
    const cleanEmail = email.toLowerCase().trim().slice(0, 254);
    const cleanFirst = firstName?.trim().slice(0, 100) || null;
    const cleanLast = lastName?.trim().slice(0, 100) || null;
    const cleanSource = (source || 'website').slice(0, 50);

    // Upsert to Supabase
    const { error } = await supabase
      .from('email_signups')
      .upsert(
        {
          email: cleanEmail,
          first_name: cleanFirst,
          last_name: cleanLast,
          source: cleanSource,
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Signup insert error:', error);
      return res.status(500).json({ error: 'Failed to save signup' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Signup API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cron Job — Archive Past Races (runs every night at midnight UTC via Vercel cron)
app.get('/api/cron/archive-races', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await archivePastRaces();
  return res.status(200).json({ success: true });
});

// 2. Cron Job — Export & Email CSV
app.get('/api/cron/export-signups', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!postmark) {
    console.error('Postmark client not initialized (missing token)');
    return res.status(500).json({ error: 'Postmark configuration missing' });
  }

  try {
    const snapshotTime = new Date().toISOString();

    // Fetch unexported signups
    const { data: signups, error: fetchError } = await supabase
      .from('email_signups')
      .select('email, first_name, last_name, source, created_at')
      .eq('exported', false)
      .lte('created_at', snapshotTime)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch signups' });
    }

    if (!signups || signups.length === 0) {
      return res.json({ message: 'No new signups', count: 0 });
    }

    // Generate CSV
    const csvHeader = 'Email,First Name,Last Name,Source,Signed Up';
    const csvRows = signups.map((s) => {
      const createdAt = new Date(s.created_at).toLocaleDateString('en-US');
      return [
        sanitizeCSVCell(s.email),
        sanitizeCSVCell(s.first_name || ''),
        sanitizeCSVCell(s.last_name || ''),
        sanitizeCSVCell(s.source || ''),
        createdAt,
      ]
        .map((cell) => `"${cell}"`)
        .join(',');
    });
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Safety check for size
    const csvSizeBytes = Buffer.byteLength(csvContent, 'utf8');
    if (csvSizeBytes > 9 * 1024 * 1024) {
      await postmark.sendEmail({
        From: process.env.SIGNUP_EXPORT_FROM,
        To: process.env.SIGNUP_EXPORT_RECIPIENT,
        Subject: `⚠️ Signup Export Too Large — ${signups.length} signups`,
        TextBody: `The weekly signup export has ${signups.length} new signups and the CSV is too large to email. Please export manually from Supabase.`,
      });
      return res.status(400).json({ error: 'CSV too large to email', count: signups.length });
    }

    // Email CSV
    const today = new Date().toLocaleDateString('en-US');
    await postmark.sendEmail({
      From: process.env.SIGNUP_EXPORT_FROM,
      To: process.env.SIGNUP_EXPORT_RECIPIENT,
      Subject: `New Email Signups — ${today} (${signups.length} new)`,
      TextBody: `Attached is a CSV with ${signups.length} new email signup(s) since the last export.\n\nHave a great day!`,
      Attachments: [
        {
          Name: `email-signups-${new Date().toISOString().split('T')[0]}.csv`,
          Content: Buffer.from(csvContent).toString('base64'),
          ContentType: 'text/csv',
        },
      ],
    });

    // Mark as exported
    const { error: updateError } = await supabase
      .from('email_signups')
      .update({
        exported: true,
        exported_at: new Date().toISOString(),
      })
      .eq('exported', false)
      .lte('created_at', snapshotTime);

    if (updateError) console.error('Update error:', updateError);

    return res.json({ success: true, count: signups.length });
  } catch (err) {
    console.error('Export cron error:', err);
    return res.status(500).json({ error: 'Export failed' });
  }
});

// Export for Vercel
module.exports = app;
