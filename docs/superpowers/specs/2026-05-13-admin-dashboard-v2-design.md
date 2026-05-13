# Admin Dashboard V2 — Design Spec
**Date:** 2026-05-13
**Status:** Approved

---

## Overview

Six related improvements to the MomDom admin dashboard and supporting backend:

1. One-time import script for Founding Circle emails
2. Tier and status rename (data + code)
3. New backend endpoints (status update, bulk update, delete, config, email list)
4. Admin dashboard UI: inline status dropdown, bulk status update, delete per row, Gmail links, active tier control, Resend notice

---

## 1. Data: Tier & Status Rename

### New tier values (stored in MongoDB)
| Old value | New value | Display name | Cap |
|-----------|-----------|--------------|-----|
| `trailblazer` | `founding_circle` | Founding Circle | 50 |
| `pioneer` | `early_access` | Early Access | open |
| `founding` | `general_launch` | General Launch | open |
| `community` | `general_launch` | General Launch | — |

### New status values
| Old value | New value | Display name |
|-----------|-----------|--------------|
| `pending` | `pending` | Pending |
| `invited` | `notified` | Notified |
| `onboarded` | `active` | Active |

### Active tier assignment
Tiers are no longer auto-assigned by position. The active tier for new signups is stored in a MongoDB `config` collection (`{ key: 'activeTier', value: 'founding_circle' }`). Admin changes this via the dashboard. Default if not set: `founding_circle`.

---

## 2. One-time Scripts

### `scripts/import-founding-circle.js`
- Reads email list from `scripts/founding-emails.txt` (one email per line)
- For each email: skip if already exists in `waitlist` collection; otherwise insert with:
  - `tier: 'founding_circle'`, `status: 'pending'`, `utm_source: 'direct'`
  - `createdAt: new Date('2026-02-01')`, `updatedAt: new Date('2026-02-01')`
  - `position`: sequential, starting from current max position + 1
- Prints summary: N inserted, N skipped
- Run: `node --env-file=.env scripts/import-founding-circle.js`

### `scripts/migrate-tiers.js`
- One-time migration for existing documents already in the database
- Renames tier values: `trailblazer → founding_circle`, `pioneer → early_access`, `founding → general_launch`, `community → general_launch`
- Renames status values: `invited → notified`, `onboarded → active`
- Prints counts of updated documents per field
- Run: `node --env-file=.env scripts/migrate-tiers.js`

---

## 3. Backend: New & Updated Endpoints

### Updated endpoints

**`signup.js`** — remove `TIER_RULES`; read active tier from `config` collection on each signup; fall back to `'founding_circle'` if not set.

**`stats.js`** — update all tier/status queries to new values; Founding Circle cap = 50.

**`signups.js`** — update filter param handling for new tier/status values.

### New endpoints

**`netlify/functions/update-signup.js`**
- `PATCH /api/update-signup`
- Query: `?password=XXX`
- Body: `{ email, status }`
- Updates `status` and `updatedAt` on the matching document
- Returns `{ updated: 1 }`

**`netlify/functions/bulk-update.js`**
- `POST /api/bulk-update`
- Body: `{ password, emails: [...], status }`
- Bulk-updates `status` and `updatedAt` for all matching emails
- Returns `{ updated: N }`

---

**`netlify/functions/delete-signup.js`**
- `POST /api/delete-signup`
- Body: `{ password, email }`
- Deletes the document; returns `{ deleted: 1 }`

**`netlify/functions/config.js`**
- `GET /api/config?password=XXX` — returns `{ activeTier }`
- `POST /api/config` — body: `{ password, activeTier }` — upserts config doc; returns `{ activeTier }`

**`netlify/functions/emails.js`**
- `GET /api/emails?password=XXX&tier=&status=`
- Returns all matching emails without pagination: `{ emails: ['a@b.com', ...] }`
- Used by the "Email everyone" button to build the Gmail BCC URL

---

## 4. Admin Dashboard UI (`public/index.html`)

### New header area (below KPIs)
Two side-by-side cards:

**Active Tier card:** Shows current active tier (fetched from `/api/config`). "Change tier" button reveals an inline dropdown (Founding Circle / Early Access / General Launch) + Save — POSTs to `/api/config`. Refreshes signup.js behavior immediately.

**Resend notice card** (amber/yellow): Static notice — "New signup email alerts are not yet active. Set up a Resend account and add `RESEND_API_KEY` to Netlify env vars to enable."

### Updated KPIs
- "Founding Circle spots left" = 50 − count of `founding_circle` documents
- Status counts use new values: Notified, Active

### Table columns
`checkbox | # | Email ↗ | Tier badge | Status dropdown | Source | Joined | 🗑`

**Email column:** Each email is a link — `<a href="https://mail.google.com/mail/?view=cm&to=EMAIL" target="_blank">`. Opens Gmail compose addressed to that person.

**Status column:** `<select>` with options Pending / Notified / Active. On `change`, calls `PATCH /api/update-signup` automatically. Brief "Saving…" state on the dropdown during the request.

**Delete column:** Trash icon (🗑), muted by default, red on hover. On click: `confirm("Remove EMAIL from the waitlist?")` → if confirmed, calls `DELETE /api/delete-signup` → removes the row from the DOM without a full table reload.

### Bulk action bar
Appears above the table when one or more checkboxes are checked. Contains:
- Selected count label
- "Set status to:" dropdown (Pending / Notified / Active)
- Apply button → POSTs to `/api/bulk-update` with selected emails + chosen status → refreshes table
- "✕ Clear" button to deselect all

No bulk delete in the action bar.

### Filter bar additions
- Tier filter options updated to: Founding Circle / Early Access / General Launch
- Status filter options updated to: Pending / Notified / Active
- **"✉ Email everyone ↗"** button: calls `GET /api/emails` with current filters → builds `https://mail.google.com/mail/?view=cm&bcc=email1,email2,...` → opens in new tab

### CSS additions
- Tier badge classes: `tb-founding-circle` (cyan), `tb-early-access` (lavender), `tb-general-launch` (blush)
- Status pill classes: `s-pending` (amber), `s-notified` (cyan-light), `s-active` (green)
- Checkbox column, delete button (ghost → red hover), bulk bar, active-tier card, resend-notice card

---

## 5. Files Changed

| File | Change |
|------|--------|
| `scripts/import-founding-circle.js` | New — one-time email import |
| `scripts/migrate-tiers.js` | New — one-time data migration |
| `netlify/functions/signup.js` | Update — remove TIER_RULES, read activeTier from config |
| `netlify/functions/stats.js` | Update — new tier/status names, cap=50 |
| `netlify/functions/signups.js` | Update — new filter values |
| `netlify/functions/update-signup.js` | New — single status update |
| `netlify/functions/bulk-update.js` | New — bulk status update |
| `netlify/functions/delete-signup.js` | New — delete one record |
| `netlify/functions/config.js` | New — get/set active tier |
| `netlify/functions/emails.js` | New — full email list for BCC |
| `public/index.html` | Update — all dashboard UI + JS changes |

---

## 6. Sequence: What to Run First

1. Deploy new code to Netlify (endpoints live before migration — safe, old data still queries)
2. Run `scripts/migrate-tiers.js` against production Atlas (rename existing docs)
3. Run `scripts/import-founding-circle.js` with the real email list
4. Verify in dashboard that counts and tiers look correct
