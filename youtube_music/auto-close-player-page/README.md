# YouTube Music: Auto-close player page (keep mini player)

> Automatically closes the full player page on [music.youtube.com](https://music.youtube.com) while preserving playback in the mini player.

A lightweight userscript that prevents the disruptive full-screen player page from opening when you click **Play** on browse pages (New Releases, albums, mixes, etc.).

---

## ✨ What it does

When you click the play button on any album, playlist, or mix page, YouTube Music normally opens the large player page. This script immediately detects that behavior and clicks the **"Close player page"** button for you — so music keeps playing in the compact mini player in the bottom-left corner.

**Result**: You get the best of both worlds — quick browsing + uninterrupted mini-player playback.

---

## 📦 Installation

### 1. Install a userscript manager

| Manager          | Browser          | Link |
|------------------|------------------|------|
| **Tampermonkey** | Chrome / Firefox / Edge | [tampermonkey.net](https://www.tampermonkey.net/) |
| **Violentmonkey**| Chrome / Firefox       | [violentmonkey.github.io](https://violentmonkey.github.io/) |
| **Greasemonkey** | Firefox                | [greasespot.net](https://www.greasespot.net/) |

### 2. Install the script

**Recommended method** (one-click):
- Copy the entire script below
- Open your userscript manager → **Create new script**
- Paste the code
- Save (`Ctrl` + `S`)

Or use the code block provided in the repository.

---

## 🚀 How to use

**Zero configuration required.**

Just visit [music.youtube.com](https://music.youtube.com) and start browsing. The script runs automatically in the background.

### Manual trigger (debugging)

If you ever want to force-close the player page manually, open the browser console (`F12`) and run:

```js
unsafeWindow.__ytMusicForceClosePlayerPage()
```

---

## 🛠 How it works (technical)

The script uses a `MutationObserver` to watch for two things:

1. The `ytmusic-player-page` custom element being added to the DOM
2. The `player-page-open` attribute being added to it

As soon as the attribute appears, it locates the close button (`button[aria-label="Close player page"]`) and clicks it.

Additional protections:
- **800ms cooldown** — prevents the script from fighting with intentional user actions (e.g. manually expanding the player)
- **SPA navigation handling** — listens for YouTube’s internal navigation events (`yt-navigate-finish`, `yt-page-data-updated`)
- **Retry logic** — if the close button isn’t rendered yet, it tries again after 120ms
- Runs at `document-start` for maximum responsiveness

---

## ⚙️ Customization

You can edit these values directly in the script:

| Variable       | Default | Description |
|----------------|---------|-------------|
| `COOLDOWN_MS`  | `800`   | Minimum milliseconds between auto-close actions |

Lower values = more aggressive closing.  
Higher values = more protection against fighting manual expand/collapse.

---

## ✅ Compatibility

- Works on **desktop** versions of Chrome, Firefox, Edge, Brave, etc.
- Compatible with current YouTube Music UI (2025–2026)
- Does **not** work on the mobile website (`m.music.youtube.com`) or native apps

---

## 🐛 Known Limitations & Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Script stops working after YouTube update | DOM structure changed | Update the script or report the issue |
| Player page occasionally stays open | Button not found in time | The script has retry logic — usually resolves itself |
| Rapid expand/collapse doesn't respond | Within the 800ms cooldown window | Wait ~1 second or manually click the close button |
| Console errors about `unsafeWindow` | Using a userscript manager that doesn't expose it | Safe to ignore — only used for manual debugging |

If the script breaks after a YouTube redesign, feel free to open an issue with the new DOM structure.
