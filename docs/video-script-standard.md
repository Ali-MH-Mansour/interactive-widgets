# Video scripts — one explainer video per widget, three languages (standard v0.1, 2026-10-23)

Every published widget may carry **one short explainer video per language** (`ar`, `ru`, `en`),
recorded by the User from the widget itself and uploaded to YouTube. The repo stores the **script
and the click-by-click choreography**, never the video: `widgets/<id>/video.md`. The script is
content (seam S2) — it ships to the server with `explain.js` when the site is published; the video
itself is public on YouTube by nature, so the moat is the page that pairs it with the live widget.

## Why a video next to a live widget (the expert view, short)

- A widget answers *what happens if*; a video answers *what am I looking at and why does it matter*.
  Together they cover the two kinds of learner — the one who explores first and the one who needs to
  be shown first. Neither replaces the other: the video must **end by sending the viewer to the
  controls**, not by summarising everything.
- Short. **2½–4 minutes per video.** One idea per scene, one control per scene. A learner who wants
  more reads `explain.js` below the widget; the video is the on-ramp.
- **Watch → Do.** Each scene ends with the widget in a state the viewer can reproduce in one or two
  clicks. The page lists these as chapter links; clicking one sets the widget to that state (registry
  `video.chapters[].config`), so the video and the widget stay in step.
- Record **the real widget on the real page**, not slides. The learner recognises the controls when
  they come to use them. No face camera; cursor highlighted; narration recorded afterwards.

## File shape — `widgets/<id>/video.md`

```
---
widget: of-<id>
version: 0.1            # of the script; bump when scenes change
duration_target: 3:30   # mm:ss, the same for every language
languages: [en, ru, ar]
recorded: {}            # filled by the User after upload: {en: <youtubeId>, ru: …, ar: …}
---
# <Widget title> — video script

## Setup            browser, zoom, window size, widget page + starting config, what to hide
## Shot list        ONE table for every language: scene # · time · screen (clicks, exact control names and values) · on-screen text
## Narration — EN   one row per scene, the spoken words only
## Narration — RU   same scenes, same count
## Narration — AR   same scenes, same count
## Chapters         scene → YouTube chapter title per language + the widget config that reproduces the scene
## Upload           title, description, tags per language (copy-paste), playlist, thumbnail text
```

Rules:

1. **One shot list, three narrations.** The screen actions are identical in every language; only the
   words change. The RU recording uses the widget's RU interface (`lang="ru"`), the EN and AR recordings
   use the EN interface until `ar` is implemented (`ar` is reserved in the registry).
2. **Clicks are written as a learner would read them:** control name as it appears on screen, the
   value to set, the thing to look at while it changes. `Bits b → 2` · `Mode → Asymmetric` · `drag
   Probe value x to 3.4 and hold`.
3. **Timing.** Narration is written to ~140 words per minute in EN; RU and AR run 10–20 % longer for the
   same content, so each scene's RU/AR text is trimmed to the EN scene length, not translated word for
   word. A scene is 15–45 s; nothing longer.
4. **Every scene maps to a widget state** that `getConfig()` can return, listed under `## Chapters`.
   That is what makes the page's chapter links work and what lets a scene be re-recorded alone.
5. **Numbers in the narration are the widget's numbers.** Take them from the default state and the
   explain.js computation section, so the voice and the screen agree.
6. **No file is final until recorded.** `recorded:` stays `{}` until the User uploads; the registry's
   `video` key (below) is filled then, and only then does the page show a video tab.

## Registry key (reserved now, read by the pages later)

```json
"video": {
  "en": { "youtubeId": "…", "duration": "3:31" },
  "ru": { "youtubeId": "…", "duration": "3:48" },
  "ar": { "youtubeId": "…", "duration": "3:44" },
  "chapters": [ { "t": "0:00", "title_i18n": { "en": "…", "ru": "…", "ar": "…" }, "config": { } } ]
}
```

Embedding, when the site is built: `www.youtube-nocookie.com/embed/<id>` behind a click-to-load
facade (poster image + play button) — no third-party request until the learner clicks, which the
consent banner and page speed both need; never autoplay; the video sits in a tab beside the
explanation, not above the widget.

## Recording recipe (the same for every widget)

- Window 1920×1080, browser zoom 125 %, dark theme (the page default), the widget's standalone
  `index.html` or the library page with the widget selected; close the explanation panel unless a scene
  opens it; cursor highlight on (Windows: Settings → Accessibility → Mouse pointer, or the recorder's
  own highlight); hide bookmarks bar and extensions.
- Record the screen silently following the shot list, pausing 2 s at each scene boundary. Then record
  the narration per scene reading the table, and lay it over the picture. A scene that runs long is cut,
  not sped up.
- Export 1080p30, upload per language as **separate videos** (separate titles and descriptions are
  what YouTube search indexes per language), one playlist per language. Put the chapter list in the
  description (`0:00 Title` lines) so YouTube shows chapters.
