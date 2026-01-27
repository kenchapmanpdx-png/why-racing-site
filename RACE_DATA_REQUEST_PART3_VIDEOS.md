# WHY Racing - Video & Media URL Request (Part 3)

Please search YouTube and the web for promo videos and media for these WHY Racing events. We need YouTube video URLs for race highlight/promo videos.

---

## DATA FORMAT

Return data in JSON format:

```json
{
  "race_name": {
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "youtube_title": "Race Name 2025 Highlights",
    "logo_url": "https://example.com/logo.png (if found)",
    "notes": "Any relevant notes"
  }
}
```

---

## 🎬 YOUTUBE VIDEOS NEEDED (24 Races)

Search YouTube for: "[Race Name] race video", "[Race Name] highlights", "[Race Name] 2024", "[Race Name] 2025", "Why Racing [Race Name]"

### Running Events:

1. **Resolution Run** - La Center, WA (January)
   - Search: "Resolution Run La Center", "Why Racing Resolution Run"

2. **Couve Clover Run** - Vancouver, WA (March, St. Patrick's Day themed)
   - Search: "Couve Clover Run", "Couve Clover Run Vancouver"

3. **Spring Classic** - Vancouver, WA (April, 42nd Annual)
   - Search: "Spring Classic Vancouver WA", "Spring Classic Duathlon"

4. **Reflection Run** - Washougal, WA (May, Memorial Day)
   - Search: "Reflection Run Washougal", "Reflection Run Memorial Day"

5. **Girlfriends Run** - Vancouver, WA (October, Women's event)
   - Search: "Girlfriends Run Vancouver", "Girlfriends Half Marathon"

6. **Scary Run** - Washougal, WA (October, Halloween themed)
   - Search: "Scary Run Washougal", "Scary Run Halloween"

7. **Santa's Holiday Hustle** - Camas, WA (December, Christmas themed)
   - Search: "Santa's Holiday Hustle Camas", "Dirty Santa Trail Run"

### Trail Running Events:

8. **White River Snowshoe Race** - Government Camp, OR (February)
   - Search: "White River Snowshoe Race", "Mt Hood Snowshoe"

9. **Silver Falls Trail Challenge** - Sublimity, OR (February)
   - Search: "Silver Falls Trail Challenge", "Silver Falls Trail Run", "Bivouac Racing Silver Falls"

10. **Crown Stub 100** - Buxton, OR (April, 100-mile ultra)
    - Search: "Crown Stub 100", "Stub Stewart 100 mile"

11. **Stub Stewart Trail Challenge** - Buxton, OR (April)
    - Search: "Stub Stewart Trail Challenge", "Bivouac Racing Stub Stewart"

12. **Hellz Bellz Ultra** - Yacolt, WA (July, 50-mile ultra)
    - Search: "Hellz Bellz Ultra", "Yacolt Ultra", "Bells Mountain Trail"

13. **Bigfoot Fun Run** - Yacolt, WA (July 4th)
    - Search: "Bigfoot Fun Run Yacolt", "Yacolt Rendezvous"

14. **Bigfoot 5K/10K** - Skamania, WA (July)
    - Search: "Bigfoot 5K 10K Skamania"

15. **Battle to the Pacific** - Hammond, OR (November)
    - Search: "Battle to the Pacific", "Fort Stevens Trail Run", "Bivouac Racing Battle"

### Triathlon Events:

16. **PDX Triathlon Festival** - Fairview, OR (May, 43rd Annual)
    - Search: "PDX Triathlon Festival", "Blue Lake Triathlon Portland"

17. **Hagg Lake Triathlon** - Gaston, OR (June, 45th Annual)
    - Search: "Hagg Lake Triathlon", "Henry Hagg Lake Triathlon"

18. **Columbia River Triathlon** - Vancouver, WA (August)
    - Search: "Columbia River Triathlon", "Frenchman's Bar Triathlon"

19. **Girlfriends Triathlon** - Vancouver, WA (August, Women's event)
    - Search: "Girlfriends Triathlon Vancouver", "Why Racing Girlfriends Triathlon"

20. **Girlfriends All-Women's Triathlon** - Vancouver, WA (August)
    - Search: "Girlfriends All-Women's Triathlon", "Girlfriends Fitness Festival"

21. **Pacific Crest Endurance Sports Festival** - Bend, OR (June)
    - Search: "Pacific Crest Triathlon Bend", "Cascade Lakes Triathlon", "Beastman Triathlon"

### Marathons:

22. **PeaceHealth AppleTree Marathon** - Vancouver, WA (August)
    - Search: "AppleTree Marathon Vancouver", "PeaceHealth Marathon"

23. **Appletree Marathon** - Vancouver, WA (August)
    - Same as above - may be same event

24. **Pacific Coast Running Festival** - Long Beach, WA (September)
    - Search: "Pacific Coast Running Festival", "Long Beach WA Marathon", "Sand Marathon Long Beach"

---

## 🖼️ LOGO/IMAGE URLs (If Found)

While searching, if you find official race logos or images on:
- RunSignUp race pages
- Official race websites
- Facebook event pages
- Why Racing Events website

Please include those URLs as well.

---

## 📺 VIDEO SEARCH TIPS

1. **YouTube Search**: Search for the race name + year (2024, 2025)
2. **Why Racing Channel**: Check if Why Racing has a YouTube channel
3. **Local News**: Sometimes local TV stations cover these events
4. **Participant Videos**: GoPro/drone footage from runners
5. **Race Photography Companies**: They sometimes post highlight reels

---

## PRIORITY ORDER

**Highest Priority** (major events):
1. PDX Triathlon Festival (43rd Annual - likely has videos)
2. Hagg Lake Triathlon (45th Annual - likely has videos)
3. AppleTree Marathon (long-running event)
4. Couve Clover Run (popular St. Patrick's Day event)
5. Pacific Crest Endurance Sports Festival

**Medium Priority** (themed events - great for marketing):
6. Scary Run (Halloween)
7. Santa's Holiday Hustle (Christmas)
8. Girlfriends Run/Triathlon events (Women's events)

**Lower Priority** (trail events - fewer videos typically):
9. Trail running events (Crown Stub 100, Hellz Bellz, etc.)

---

## EXAMPLE RESPONSE FORMAT

```json
{
  "PDX Triathlon Festival": {
    "youtube_url": "https://www.youtube.com/watch?v=EXAMPLE123",
    "youtube_title": "PDX Triathlon Festival 2024 Highlights",
    "channel": "PDX Sports Media",
    "notes": "Official event highlight reel"
  },
  "Hagg Lake Triathlon": {
    "youtube_url": "https://www.youtube.com/watch?v=EXAMPLE456",
    "youtube_title": "Hagg Lake Triathlon 2024",
    "channel": "Oregon Tri Club",
    "notes": "45th annual event coverage"
  },
  "Scary Run": {
    "youtube_url": null,
    "notes": "No official video found, but photos available on Facebook"
  }
}
```

---

## NOTES

- Only include REAL, working YouTube URLs you can verify
- Prefer official race/organization videos over random participant footage
- If no video exists, note "No video found" so we know it was searched
- Videos from 2023, 2024, or 2025 are preferred (recent footage)

---

Thank you! Return all data in JSON format.
