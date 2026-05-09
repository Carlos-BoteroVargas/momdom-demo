# MomDom Landing Page — Context & Decisions

## Emotional Identity (Non-Negotiable)

The site must feel: **relieving, emotionally intelligent, calming, supportive, quietly powerful.**

It must NOT feel: corporate, productivity-app, or aggressive SaaS.

The experience should make someone feel:
> "finally, something that understands how my brain feels."
— not "here's another organization app."

**Relief first. Organization second.**

---

## Brand Identity

### Colors (Official — do not alter)
| Token | Hex | Use |
|---|---|---|
| `--cyan` | `#2EC4E6` | Primary brand blue. Anchors all key moments. |
| `--navy` | `#0B2A33` | Text, dark surfaces. |
| `--lavender` | `#B9A6E3` | Balloon color 1. Use as set with sage + blush. |
| `--sage` | `#9FD3B0` | Balloon color 2. |
| `--blush` | `#F2A7B5` | Balloon color 3. |
| `--warm` | `#DCE4E9` | Brand grey. Borders, dividers. |
| `--muted` | `#A4ACBC` | Brand dark grey. Supporting text. |

Balloon colors must always appear together as a set. Do not alter their hue or saturation.

### Fonts (Official)
- **Playfair Display** — headings, brand statements, elegant emphasis
- **Inter** — body copy, UI text, lists, functional information

### Visual Philosophy
Calm. Airy. Organized. Warm. Minimal visual clutter. Preserve white space intentionally.

---

## Hero Section

**Decision: Full hero section (nav + hero) sits on a `#2EC4E6` blue background.**

Rationale: recreates the "immersive blue atmosphere" of the original logo/brand feel the founder loves. Nav text and buttons flip to white within this context via `.hero-bg` CSS class.

**Decision: `logo4.png` (sticker balloons, no text) appears above the dictionary card in the right column.**

Rationale: recreates the "balloons on blue" brand moment from the original logo. Uses the transparent-background balloon asset so it floats naturally on the blue field.

The dictionary card ("MomDom. / noun / mäm·däm") is preserved — it was explicitly called out as a hero strength.

---

## Proof Strip

**Decision: Removed entirely.**

Rationale: the strip's design language (big numbers, separators, stat labels) communicates the "SaaS/growth funnel" tone the founder is moving away from. Two of its four stats ("$0 paid to acquire signups", "Trailblazer spots left") were explicitly flagged for removal, leaving the strip too thin to be useful.

---

## Balloon Ecosystem

**Decision: 6 balloons (down from 8).**

Removed: Mom Care, Homeschool, Memory/Reflection
Added: Mom's Mental Tabs (new)

| Balloon | Color | Description |
|---|---|---|
| Mom's Mental Tabs | Lavender | Reminders, notes, to-dos, mental tabs — a place to set down what you're carrying |
| Kids | Sage | Sizes, activities, routines, schedules, growth tracking |
| Health | Blush | Medications, allergies, appointments, symptoms, records |
| Meals | Lavender | Meal tracking, grocery needs, family favorites, food ideas |
| Household | Sage | Tasks, reminders, routines, household notes, daily moving pieces |
| Planning | Blush | Appointments, school events, activities, schedules, family logistics |

Colors cycle through Lavender → Sage → Blush (2 balloons each) to keep them used as a set.

Rationale: 8 balloons felt "feature-heavy" and created visual overwhelm. 6 matches MVP1 structure more cleanly and improves mobile readability.

---

## Founding Circle / Early Access

**Decision: Remove all Trailblazer/Pioneer/Founding Family tier language.**

Replace with: Founding Circle / Early Access / General Launch.

**Decision: Founding Circle = first 25 families.**

Rationale: more intentional and premium than 100 or 200–300. Easier to manage feedback from. More emotionally aligned with the brand's "built carefully" tone.

**Decision: Remove discount percentage language (40% off, 25% off, 15% off).**

Replace with access and recognition benefits. Discount framing reads as a growth/SaaS signal; recognition and exclusivity framing is more aligned with the emotional brand.

**Decision: Remove "Paid to acquire signups" and "Trailblazer" everywhere — public and admin.**

**Decision: Section background changed from dark navy to soft white with lavender/sage border accents.**

Rationale: dark navy background was too "corporate/tech" for this stage of the brand.

---

## Timeline / Roadmap Section

**Decision: Replaced entirely with a Future Vision section.**

Rationale: the roadmap's numbered steps + month-range tags read as SaaS milestone thinking. The founder explicitly wants to move away from that tone at this stage.

The Future Vision section ("Built to learn your family over time") communicates platform intelligence and long-term depth. The founder approved this section feeling slightly more tech-forward than the rest of the site — by this point brand trust has been established.

Intelligent features previewed in the vision section:
- Predictive reminders
- Household pattern recognition
- Family scheduling optimization
- Meal and grocery intelligence
- Contextual health tracking
- Cross-household coordination
- Intelligent family support systems

---

## Final CTA Section

Copy direction: bring the experience back to relief and emotional recognition before the signup form. Lead with the exhausting list of things moms track, then position MomDom as the place to finally put it down.

Anchor phrase: **"Set it down here."** (also used in hero CTA button).

---

## Admin Dashboard

Tier filters updated to match new tier names: Founding Circle / Early Access / General Launch / Community.

The admin dashboard is internal tooling — its visual style was not part of this design pass. Tier names were updated for consistency.

---

## What Was Explicitly Preserved

- The dictionary card ("MomDom. / noun / mäm·däm") — called out as a hero strength
- Playfair Display + Inter font pairing
- The `#2EC4E6` primary blue
- The "Set it down here" CTA phrase
- The "Here's How MomDom Helps" features section (copy updated, structure kept)
- The balloon interaction system (click to expand detail panel / mobile modal)
