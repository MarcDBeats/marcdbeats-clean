# MarcDBeats — Manual Smoke Test Checklist

A concise, under-10-minute test you can run after any significant change to verify nothing is broken.

---

## Setup

Open the app in a browser. Open DevTools **Console** tab (⌥⌘I on Mac, F12 on Windows) and keep it visible throughout. You should see `[MDB] app:dom-ready` logged on load. Any `[MDB] ❌` lines indicate errors.

---

## 1 · Data loading & cache

| Step | Expected result |
|------|----------------|
| Open app cold (first visit / incognito) | Loading spinner appears, then beats render. Console shows `[MDB] fetch:start` → `[MDB] fetch:success` → `[MDB] cache:saved` |
| Reload the page | Console shows `[MDB] cache:hit` with `ageSecs < 600`. Beats render immediately, no spinner |
| In DevTools → Application → Local Storage, delete `marcdbeats_beats_cache`, then reload | Console shows `[MDB] cache:cold`, fetches fresh data |
| Manually edit the cache in Local Storage and change `"version":"v1"` to `"version":"v0"`, then reload | Console shows `[MDB] cache:invalidated { reason: "version-mismatch" }`, fetches fresh data |
| Manually edit the cache and set `"createdAt"` to `0`, then reload | Console shows `[MDB] cache:invalidated { reason: "expired-or-corrupt" }`, fetches fresh data |

---

## 2 · Playback controls — mini player

| Step | Expected result |
|------|----------------|
| Click any beat card | Beat loads in mini player; title + artist update |
| Click ▶ Play | Music plays; button changes to ⏸ Pause |
| Click ⏸ Pause | Music pauses; button changes to ▶ Play |
| Click ⏭ Next | Advances to next beat in queue; title updates |
| Click ⏮ Prev | Goes back to previous beat |
| Drag the progress slider | Audio seeks to the dragged position |
| Drag the volume slider | Volume changes; slider position persists on reload |
| Let a beat play to the end | Next beat starts automatically |

---

## 3 · Full player (mobile — viewport ≤ 768 px)

| Step | Expected result |
|------|----------------|
| Tap the mini player (not a button) | Full player overlay opens with artwork, title, artist |
| Full player shows correct track info | Same beat as mini player |
| ▶/⏸ button in full player | Syncs with mini player play state |
| ⏮ / ⏭ in full player | Navigates beats; both players stay in sync |
| Drag full player progress slider | Seeks audio |
| Swipe down on full player | Overlay closes |
| Tap ✕ close button | Overlay closes |

---

## 4 · Cart

| Step | Expected result |
|------|----------------|
| Click ➕ Add to Cart on a beat | Toast "Added … to cart" appears |
| Click the 🛒 Cart button in header | Cart modal opens with correct beat and `$19.99` |
| Total shown at bottom | Equals `(number of items) × $19.99` |
| Remove a beat from cart | Beat disappears; total updates |
| Add the same beat twice | Toast "Already in cart" — no duplicate |
| Empty cart, open cart modal | Shows "Your cart is empty" message |

---

## 5 · Loading & error states

| Step | Expected result |
|------|----------------|
| Open app on a slow connection (DevTools → Network → Slow 3G) | Spinner is visible while data loads |
| Disconnect network and reload | Error toast appears; spinner hides; no crash |
| Reconnect and reload | Normal load resumes |

---

## 6 · Mobile checks (narrow viewport)

Resize browser to **375 × 667** (iPhone SE) and **390 × 844** (iPhone 14).

| Check | Expected result |
|-------|----------------|
| Mini player visible and usable | Controls not clipped or overlapping |
| Beat cards list scrolls | No horizontal overflow |
| Beat Tapes / Samples tabs scroll horizontally | Horizontal scroll works, no visual jank |
| Full player fits on screen | Artwork, controls, and actions all visible without scrolling |
| Tap targets feel comfortable | Buttons easy to tap without accidentally hitting neighbors |

Resize to **375 × 500** (very short screen).

| Check | Expected result |
|-------|----------------|
| Full player opens | Artwork shrinks; controls still usable |
| No content is cut off or inaccessible | Can scroll to see all controls |

---

## 7 · Keyboard accessibility

| Key | Expected result |
|-----|----------------|
| **Tab** through the page | Focus ring (red outline) moves through all interactive elements in logical order |
| **Space** on a beat card or play button | Triggers play/pause |
| **Arrow Right / Arrow Down** | Advances to next beat |
| **Arrow Left / Arrow Up** | Goes back to previous beat |
| **b** key | Opens buy modal for current beat |
| **l** key | Toggles like on current beat |
| **c** key | Opens cart modal |
| **Tab** into progress slider → **Arrow keys** | Seeks audio in small increments |

---

## 8 · Console diagnostics to verify

After a full run, the DevTools Console should contain:

```
[MDB] app:dom-ready
[MDB] fetch:start  (or cache:hit if cached)
[MDB] fetch:success { records: N }  (or cache:hit { beats: N, ageSecs: N })
[MDB] cache:saved { beats: N }
[MDB] app:init-called
[MDB] audio:load { beat: "..." }
[MDB] audio:playing { beat: "..." }  (or audio:autoplay-blocked if browser blocks it)
[MDB] data:loaded { beats: N, playlists: N, singles: N, featured: N }
```

**No `[MDB] ❌` errors should appear** under normal conditions.

---

## Notes

- If any ❌ error appears referencing a missing element (e.g. `Required DOM element #fullPlayerPlay not found`), that element ID changed or was deleted from the HTML.
- Volume slider position should persist between page reloads (stored in `localStorage` under key `marcdbeats_volume`).
- Cache TTL is 10 minutes. After 10 minutes the cache auto-expires and fresh data is fetched.
