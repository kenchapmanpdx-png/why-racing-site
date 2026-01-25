require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also load standard .env if present
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { formidable } = require('formidable');
const fs = require('fs');
const fetch = require('node-fetch');

// Debug: Log environment variables at startup
console.log('=== Environment Check ===');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Loaded' : '✗ MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Loaded' : '✗ MISSING');
console.log('ADMIN_SECRET:', process.env.ADMIN_SECRET ? '✓ Loaded' : '✗ MISSING');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Loaded' : '✗ MISSING');
console.log('=========================');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static('.'));

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

// Run archive check on startup
archivePastRaces();


const FULL_EVENT_DATA = `
# Why Racing Events - Complete Event Information

## COMPANY OVERVIEW

**Company Name:** Why Racing Events Inc.
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

**Mission:** Why Racing Events Inc. offers athletes of all abilities, from the elite level to the back of the packers, the chance to successfully train for and complete various types of races including fun runs, triathlons, adventure events and more while raising awareness and funds for important community causes.

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
Why Racing Events Inc.
210 E. Fourth St, Suite B
La Center, WA 98629

---

## MAJOR PARTNERS

- **PeaceHealth** - Exclusive Health & Wellness Partner
- **Foot Traffic** - Exclusive Specialty Running Store
- **PepsiCo/Gatorade** - Beverage Partner
- **McCord's Vancouver Toyota** - Vehicle Partner
`;

const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant for Why Racing Events, a Pacific Northwest race company that has raised over $3 million for charity. Use the following comprehensive event data to answer questions accurately and enthusiastically.

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
        model: 'claude-sonnet-4-20250514',
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
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.ADMIN_SECRET}`;
  console.log('=== Auth Check ===');
  console.log('Received:', authHeader);
  console.log('Expected:', expectedAuth);
  console.log('Match:', authHeader === expectedAuth);
  if (authHeader !== expectedAuth) {
    console.log('AUTH FAILED - returning 401');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('AUTH PASSED');
  next();
};

// 1. AI Theme Generation
app.post('/api/generate-theme', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim().length < 10) {
    return res.status(400).json({ error: 'Please provide a theme description' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('ERROR: GEMINI_API_KEY is missing from environment variables');
      throw new Error('API key configuration error');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log('Generating theme for prompt:', prompt.substring(0, 50) + '...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a web designer creating a theme for a race event page. Based on this description, generate a cohesive color scheme and style.

Description: "${prompt}"

Respond with ONLY valid JSON (no markdown, no backticks, no explanation) in this exact format:
{
  "primaryColor": "#hexcode",
  "secondaryColor": "#hexcode",
  "accentColor": "#hexcode",
  "backgroundColor": "#hexcode",
  "fontStyle": "modern|playful|bold|elegant|rugged|gothic",
  "mood": "comma, separated, keywords",
  "tagline": "A catchy tagline for this race (under 60 characters)"
}

Guidelines:
- Colors should be vibrant and work well together
- backgroundColor should be dark (for the admin theme) but could be light for actual race pages
- fontStyle should match the vibe (gothic for spooky, playful for family events, rugged for trail races, etc.)
- mood keywords help with imagery selection
- tagline should be motivating and match the theme`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256
        }
      })
    }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      console.error('Gemini returned no candidates:', JSON.stringify(data));
      throw new Error('No response from AI');
    }

    const text = data.candidates[0].content.parts[0].text;

    // Clean up response (remove any markdown backticks if present)
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

    // Parse the JSON response
    const theme = JSON.parse(cleanText);

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
      _fallback: true
    });
  }
});

// 2. Races CRUD
// Get all races
app.get('/api/races', async (req, res) => {
  const { data, error } = await supabase
    .from('races')
    .select(`
      *,
      race_distances (*),
      pricing_tiers (*)
    `)
    .order('race_date', { ascending: true });

  if (error) {
    console.error('Supabase Error (GET /api/races):', error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
});

// Get single race
app.get('/api/races/:id', async (req, res) => {
  const { id } = req.params;
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
    console.error(`Supabase Error (GET /api/races/${id}):`, error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
});

// Create new race
app.post('/api/races', adminAuth, async (req, res) => {
  console.log('=== POST /api/races called ===');
  const { distances, pricing_tiers, ...raceData } = req.body;
  console.log('Race data received:', JSON.stringify(raceData, null, 2));

  // Sanitize data: convert empty strings to null for database fields
  // But preserve arrays (like includes, shirt_sizes) even if empty
  const sanitizeData = (data) => {
    const sanitized = { ...data };
    for (const key in sanitized) {
      // Skip arrays - they should be saved as-is
      if (Array.isArray(sanitized[key])) continue;
      // Convert empty strings and undefined to null
      if (sanitized[key] === '' || sanitized[key] === undefined) {
        sanitized[key] = null;
      }
    }
    return sanitized;
  };

  const cleanRaceData = sanitizeData(raceData);
  console.log('Sanitized data:', JSON.stringify(cleanRaceData, null, 2));

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

    // Insert distances and then apply pricing
    if (distances && distances.length > 0) {
      const distancesWithRaceId = distances.map((d, i) => ({
        ...d,
        race_id: race.id,
        sort_order: i
      }));
      // We need to insert and RETURN the IDs to map pricing
      const { data: newDists, error: dError } = await supabase.from('race_distances').insert(distancesWithRaceId).select();

      if (dError) {
        console.error('Supabase Error (POST /api/races - distances insert):', dError);
      } else if (req.body.pricing_config && newDists) {
        // Verify table exists first
        const { error: checkErr } = await supabase.from('pricing_tiers').select('id').limit(1);
        if (!checkErr) { // Only proceed if table exists
          await applyGlobalPricing(race.id, newDists, req.body.pricing_config, supabase);
        }
      }
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
  const { distances, pricing_tiers, pricing_config, created_at, updated_at, ...raceData } = req.body;

  // Sanitize data: convert empty strings to null
  const sanitizeData = (data) => {
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (Array.isArray(sanitized[key])) continue;
      if (sanitized[key] === '' || sanitized[key] === undefined) {
        sanitized[key] = null;
      }
    }
    return sanitized;
  };

  const cleanRaceData = sanitizeData(raceData);

  try {
    // 1. Update race basic info
    const { error: raceError } = await supabase
      .from('races')
      .update(cleanRaceData)
      .eq('id', id);

    if (raceError) {
      console.error(`Supabase Error (PUT /api/races/${id}):`, raceError);
      return res.status(500).json({ error: raceError.message });
    }

    // 2. Handle distances (Delete old and replace with new)
    if (distances) {
      // First, delete existing (cascade will kill pricing_tiers usually, but we should be careful)
      await supabase.from('race_distances').delete().eq('race_id', id);

      if (distances.length > 0) {
        const distancesWithRaceId = distances.map((d, i) => ({
          ...d,
          race_id: id,
          sort_order: i
        }));
        const { data: newDists, error: dError } = await supabase.from('race_distances').insert(distancesWithRaceId).select();

        if (dError) console.error('Dist Error:', dError);

        // 3. Handle Pricing Config
        if (!dError && pricing_config && newDists) {
          const { error: checkErr } = await supabase.from('pricing_tiers').select('id').limit(1);
          if (!checkErr) {
            await applyGlobalPricing(id, newDists, pricing_config, supabase);
          }
        }
      }
    }

    // Legacy support for direct pricing_tiers array (if sent)
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
  console.log(`DELETE request for race ID: ${id}`);

  try {
    const { error } = await supabase
      .from('races')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase Error (DELETE /api/races/${id}):`, error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Race ${id} deleted successfully`);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(`Server Internal Error (DELETE /api/races/${id}):`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

      // Determine content type - fallback if missing
      const contentType = file.mimetype || 'image/png';

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

// For local development
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Why Racing Events server running on port ${PORT}`);
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
    await supabase.from('pricing_tiers').delete().eq('race_id', raceId);
    await supabase.from('pricing_tiers').insert(tiers);
  }
}

// Export for Vercel
module.exports = app;
