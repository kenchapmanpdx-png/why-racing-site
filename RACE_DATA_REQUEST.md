# WHY Racing - Missing Race Data Request

This document lists all the missing data needed to complete the race database for the Why Racing website. Please gather this information for each race listed below.

---

## DATA FORMAT INSTRUCTIONS

Please return the data in JSON format like this:

```json
{
  "race_name": "Resolution Run",
  "venue": "La Center High School",
  "race_time": "09:00:00",
  "registration_url": "https://runsignup.com/...",
  "terrain": "road",
  "elevation": "Flat with small hills",
  "includes": ["shirt", "medal", "timing", "food"],
  "aid_stations": "Water stations at miles 1.5 and 3",
  "parking": "Free parking at La Center High School lot",
  "packet_pickup": [
    {
      "location": "La Center High School",
      "address": "725 NE Highland Rd, La Center, WA",
      "date": "2026-01-02",
      "time": "4:00 PM - 7:00 PM"
    },
    {
      "location": "Race Day Pickup",
      "address": "725 NE Highland Rd, La Center, WA", 
      "date": "2026-01-03",
      "time": "7:30 AM - 8:45 AM"
    }
  ],
  "distances": [
    { "name": "5K", "price": 35 },
    { "name": "10K", "price": 45 }
  ]
}
```

---

## 🚨 CRITICAL - THESE 4 RACES NEED IMMEDIATE DATA

### 1. Pacific Crest Endurance Sports Festival
**Race Date:** June 15, 2027 | **Location:** Bend, OR

**MISSING:**
- [ ] Registration URL (RunSignUp, UltraSignup, or Active.com link)

---

### 2. Bigfoot 5K/10K
**Race Date:** July 11, 2026 | **Location:** Skamania, WA

**MISSING:**
- [ ] Venue name (where does the race start/finish?)
- [ ] Race start time (e.g., "09:00:00")
- [ ] Registration URL

---

### 3. Girlfriends Triathlon
**Race Date:** August 15, 2026 | **Location:** Vancouver, WA

**MISSING:**
- [ ] Venue name (where does the race start/finish?)
- [ ] Race start time (e.g., "07:00:00")
- [ ] Registration URL

---

### 4. Girlfriends Half Marathon
**Race Date:** September 26, 2026 | **Location:** Vancouver, WA

**MISSING:**
- [ ] Venue name (where does the race start/finish?)
- [ ] Race start time (e.g., "08:00:00")
- [ ] Registration URL

---

## 💰 PRICING NEEDED FOR ALL RACES

For each race below, provide the registration price for each distance:

### 1. Resolution Run (La Center, WA - Jan 3, 2026)
Distances: 5K Run/Walk, 10K Run/Walk, Virtual 5K
- [ ] 5K price: $___
- [ ] 10K price: $___
- [ ] Virtual 5K price: $___

### 2. White River Snowshoe Race (Government Camp, OR - Feb 7, 2026)
Distances: 4K Snowshoe, 8K Snowshoe
- [ ] 4K price: $___
- [ ] 8K price: $___

### 3. Silver Falls Trail Challenge (Sublimity, OR - Feb 28, 2026)
Distances: 1/4 Marathon, 1/2 Marathon, 12 Mile Ruck
- [ ] 1/4 Marathon price: $___
- [ ] 1/2 Marathon price: $___
- [ ] 12 Mile Ruck price: $___

### 4. Couve Clover Run (Vancouver, WA - Mar 22, 2026)
Distances: Lucky Leap 1 Mile, 3 Mile, Lucky 7 Mile, 10 Mile
- [ ] 1 Mile price: $___
- [ ] 3 Mile price: $___
- [ ] 7 Mile price: $___
- [ ] 10 Mile price: $___

### 5. Crown Stub 100 (Buxton, OR - Apr 4, 2026)
Distances: Crown Stub 100 (solo), Royal Ultra Relay (team)
- [ ] 100 Mile Solo price: $___
- [ ] Relay Team price: $___

### 6. Stub Stewart Trail Challenge (Buxton, OR - Apr 5, 2026)
Distances: 1/4 Marathon, 1/2 Marathon, 3/4 Marathon, Marathon
- [ ] 1/4 Marathon price: $___
- [ ] 1/2 Marathon price: $___
- [ ] 3/4 Marathon price: $___
- [ ] Marathon price: $___

### 7. Spring Classic (Vancouver, WA - Apr 26, 2026)
Distances: 5K, 10K, Half Marathon, Sprint Duathlon
- [ ] 5K price: $___
- [ ] 10K price: $___
- [ ] Half Marathon price: $___
- [ ] Sprint Duathlon price: $___

### 8. Reflection Run (Washougal, WA - May 17, 2026)
Distances: 5K, 10K, Half Marathon, 12 Mile Ruck Challenge
- [ ] 5K price: $___
- [ ] 10K price: $___
- [ ] Half Marathon price: $___
- [ ] 12 Mile Ruck price: $___

### 9. PDX Triathlon Festival (Fairview, OR - May 31, 2026)
Distances: 5K, Super Sprint Tri, Sprint Tri, Olympic Tri, Sprint Duathlon, Olympic Duathlon, Paddle Tri
- [ ] 5K price: $___
- [ ] Super Sprint Tri price: $___
- [ ] Sprint Tri price: $___
- [ ] Olympic Tri price: $___
- [ ] Sprint Duathlon price: $___
- [ ] Olympic Duathlon price: $___
- [ ] Paddle Tri price: $___

### 10. Hagg Lake Triathlon (Gaston, OR - Jun 20, 2026)
Distances: Sprint Tri, Olympic Tri, Off-Road Tri, Sprint/Olympic Duathlon, Sprint/Olympic Aquabike, Paddle Tri, Trail Half Marathon, Trail 5K
- [ ] Sprint Tri price: $___
- [ ] Olympic Tri price: $___
- [ ] Off-Road Tri price: $___
- [ ] Sprint Duathlon price: $___
- [ ] Olympic Duathlon price: $___
- [ ] Sprint Aquabike price: $___
- [ ] Olympic Aquabike price: $___
- [ ] Paddle Tri price: $___
- [ ] Trail Half Marathon price: $___
- [ ] Trail 5K price: $___

### 11. Bigfoot Fun Run (Yacolt, WA - Jul 4, 2026)
Distances: 5K Run/Walk, 10K Run/Walk
- [ ] 5K price: $___
- [ ] 10K price: $___

### 12. Hellz Bellz Ultra (Yacolt, WA - Jul 5, 2026)
Distances: 50 Mile Ultra, Purgatory Trail Marathon
- [ ] 50 Mile Ultra price: $___
- [ ] Marathon price: $___

### 13. Bigfoot 5K/10K (Skamania, WA - Jul 11, 2026)
Distances: 5K, 10K
- [ ] 5K price: $___
- [ ] 10K price: $___

### 14. Columbia River Triathlon (Vancouver, WA - Aug 7, 2026)
Distances: Kids Tri, Sunset 5K, Sunset 10K, Sprint Tri, Olympic Tri, Girlfriends Sprint Tri
- [ ] Kids Tri price: $___
- [ ] Sunset 5K price: $___
- [ ] Sunset 10K price: $___
- [ ] Sprint Tri price: $___
- [ ] Olympic Tri price: $___
- [ ] Girlfriends Sprint Tri price: $___

### 15. Girlfriends All-Women's Triathlon (Vancouver, WA - Aug 9, 2026)
Distances: Sprint Tri, Sprint Duathlon, Sprint Aquabike, 5K Run, Relay Teams
- [ ] Sprint Tri price: $___
- [ ] Sprint Duathlon price: $___
- [ ] Sprint Aquabike price: $___
- [ ] 5K Run price: $___
- [ ] Relay Teams price: $___

### 16. Girlfriends Triathlon (Vancouver, WA - Aug 15, 2026)
Distances: Sprint Tri, Super Sprint Tri, Relay Teams
- [ ] Sprint Tri price: $___
- [ ] Super Sprint Tri price: $___
- [ ] Relay Teams price: $___

### 17. PeaceHealth AppleTree Marathon (Vancouver, WA - Aug 30, 2026)
Distances: Boston-Qualifying Marathon, First Responder's Relay, Half Marathon, Sunset 5K
- [ ] Marathon price: $___
- [ ] Relay price: $___
- [ ] Half Marathon price: $___
- [ ] Sunset 5K price: $___

### 18. Girlfriends Half Marathon (Vancouver, WA - Sep 26, 2026)
Distances: Half Marathon, 10K, 5K
- [ ] Half Marathon price: $___
- [ ] 10K price: $___
- [ ] 5K price: $___

### 19. Pacific Coast Running Festival (Long Beach, WA - Sep 26, 2026)
Distances: Sand Marathon, Sunset Sand 5K, Half Marathon, 10K, 5K, Tour de Pacific Bike, Kids 1 Mile, Kids 1/2 Mile
- [ ] Sand Marathon price: $___
- [ ] Sunset Sand 5K price: $___
- [ ] Half Marathon price: $___
- [ ] 10K price: $___
- [ ] 5K price: $___
- [ ] Tour de Pacific Bike price: $___
- [ ] Kids 1 Mile price: $___
- [ ] Kids 1/2 Mile price: $___

### 20. Girlfriends Run (Vancouver, WA - Oct 18, 2026)
Distances: Half Marathon, 10K, 6K
- [ ] Half Marathon price: $___
- [ ] 10K price: $___
- [ ] 6K price: $___

### 21. Scary Run (Washougal, WA - Oct 25, 2026)
Distances: 5K, 10K, 15K
- [ ] 5K price: $___
- [ ] 10K price: $___
- [ ] 15K price: $___

### 22. Battle to the Pacific (Hammond, OR - Nov 15, 2026)
Distances: 1/2 Marathon, 1/4 Marathon, 5K, 12 Mile Ruck Challenge
- [ ] 1/2 Marathon price: $___
- [ ] 1/4 Marathon price: $___
- [ ] 5K price: $___
- [ ] 12 Mile Ruck price: $___

### 23. Santa's Holiday Hustle (Camas, WA - Dec 12, 2026)
Distances: 5K Run/Walk, Virtual 5K, Dirty Santa 10K Trail
- [ ] 5K price: $___
- [ ] Virtual 5K price: $___
- [ ] Dirty Santa 10K price: $___

### 24. Pacific Crest Endurance Sports Festival (Bend, OR - Jun 15, 2027)
Distances: Beastman Tri, Olympic Tri, Sprint Tri, Marathon, Half Marathon, 10K, 5K, Kids Splash Pedal n' Dash
- [ ] Beastman Tri price: $___
- [ ] Olympic Tri price: $___
- [ ] Sprint Tri price: $___
- [ ] Marathon price: $___
- [ ] Half Marathon price: $___
- [ ] 10K price: $___
- [ ] 5K price: $___
- [ ] Kids price: $___

---

## 📍 RACE DETAILS NEEDED FOR ALL RACES

For each of the 25 races, please provide (where applicable):

### Race Logistics:
- [ ] Terrain type: "road", "trail", "mixed", "snow", or "sand"
- [ ] Elevation profile: e.g., "Flat", "Rolling hills", "1,500ft elevation gain"
- [ ] Aid station locations: e.g., "Water stations at miles 2, 4, and 6"
- [ ] Parking information: Where to park, cost, shuttles if any

### What's Included (check all that apply for each race):
- [ ] shirt (tech/cotton)
- [ ] medal (finisher medal)
- [ ] timing (chip timing)
- [ ] food (post-race food)
- [ ] beer (21+ post-race)
- [ ] photos (free race photos)

### Packet Pickup Locations:
For each race, provide:
- Location name
- Address
- Date
- Hours (start time - end time)
- Is this race-day pickup? (yes/no)

---

## 🖼️ MEDIA ASSETS (If Available)

For each race, if you can find:
- [ ] Race logo image URL
- [ ] Promo/highlight video URL (YouTube)
- [ ] Past race photos

---

## 📋 SUMMARY CHECKLIST

**Critical (4 items):**
- [ ] Pacific Crest Endurance: Registration URL
- [ ] Bigfoot 5K/10K: Venue, time, registration URL
- [ ] Girlfriends Triathlon: Venue, time, registration URL
- [ ] Girlfriends Half Marathon: Venue, time, registration URL

**Pricing (24 races):**
- [ ] All races except Appletree Marathon need pricing

**Race Details (25 races):**
- [ ] Terrain type for each
- [ ] Elevation for each
- [ ] What's included for each
- [ ] Aid station info (especially for longer races)
- [ ] Parking info for each
- [ ] Packet pickup locations for each

---

Please return the data in JSON format organized by race name. Thank you!
