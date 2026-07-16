# MarcDBeats — Manual Smoke Test Checklist

A concise test you can run after storefront UI changes.

---

## Setup

Open the app in a browser. Keep DevTools **Console** visible. You should see `[MDB] app:dom-ready` on load. Any `[MDB] ❌` entries indicate a regression.

---

## 1 · Data loading & cache

| Step | Expected result |
|------|----------------|
| Open app cold (first visit / incognito) | Loading spinner appears, then beats render. Console shows `[MDB] fetch:start` → `[MDB] fetch:success` → `[MDB] cache:saved` |
| Reload the page | Console shows `[MDB] cache:hit` with `ageSecs < 600`. Beats render without a fresh fetch |
| Delete `marcdbeats_beats_cache` in Local Storage, then reload | Console shows `[MDB] cache:cold`, then fetches fresh data |
| Change cache `version` from `v1` to `v0`, then reload | Console shows `[MDB] cache:invalidated { reason: "version-mismatch" }` |

---

## 2 · Beat Store

| Step | Expected result |
|------|----------------|
| Confirm top tabs | Only **Beat Store**, **Beat Tapes**, and **Samples** appear |
| Click a beat card (not the cart button) | The beat starts playing and the mini player updates |
| Click **Add to Cart** on a beat card | Cart badge count increases immediately; button changes to added state |
| Type into search | Beat Store filters in real time as you type |
| Search for a term with no matches | Grid shows a clear no-results empty state |
| Click the clear-search button | Search resets and the full beat list returns |

---

## 3 · Beat Tapes

| Step | Expected result |
|------|----------------|
| Open **Beat Tapes** | Series are stacked vertically |
| Tap a series header | The series expands/collapses |
| Expanded series with many entries | Only an initial batch shows, with **Load more** available when needed |
| Tap a playlist/tape entry | Playlist detail opens |
| Tap a track row | The beat starts playing |
| Tap the track cart button | Universal cart badge updates immediately |

---

## 4 · Samples

| Step | Expected result |
|------|----------------|
| Open **Samples** | A clean empty state says **Samples coming soon** |

---

## 5 · Mini player + full player

| Step | Expected result |
|------|----------------|
| Mini player is visible | Like button, cart button, add-to-cart button, and volume slider are absent |
| Tap anywhere on the mini player that is not a transport control | Full player opens |
| Progress bar | Looks thicker/styled and updates while audio plays |
| Full player actions | No like button is present |
| Tap **Add to Cart** in full player | Button changes state and full player cart badge updates immediately |
| Tap **Cart** in full player | Cart modal opens |
| Full player volume slider | Volume control works there instead of the mini player |
| Swipe down or tap close | Full player closes |

---

## 6 · Cart + checkout messaging

| Step | Expected result |
|------|----------------|
| Open cart from header or full player | All cart items and prices are listed clearly |
| Remove an item | Item disappears and total updates instantly |
| Empty the cart | Empty-state messaging appears with license note |
| Open checkout preview from cart | No sign-in prompt appears |
| Checkout preview | Shows standard-license terms, pricing, and exclusive-beat contact note |
| Payment button | Shows payment is coming soon instead of opening live processing |

---

## 7 · Responsive checks

Test these viewport sizes:

- **375 × 667** (iPhone)
- **390 × 844** (modern phone)
- **360 × 780** (Android)
- **375 × 500** (very short screen)
- **768 × 1024** and **1024 × 768** (iPad portrait/landscape)
- **1280 × 800** and wider desktop

| Check | Expected result |
|-------|----------------|
| Tabs, search, and cards | No horizontal overflow |
| Beat cards | Tap targets remain comfortable on small screens |
| Mini player | Opens full player easily and controls are not clipped |
| Full player | Artwork, controls, volume slider, and actions remain visible |
| Desktop | Grid looks clean and professional with the same simplified actions |

---

## 8 · Console diagnostics to verify

After a successful pass, you should see normal lifecycle logs such as:

```text
[MDB] app:dom-ready
[MDB] fetch:start
[MDB] fetch:success
[MDB] cache:saved
[MDB] app:init-called
[MDB] audio:load
[MDB] audio:playing
[MDB] data:loaded
```

No `[MDB] ❌` errors should appear during a normal run.
