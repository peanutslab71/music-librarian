# The Listening Rooms

A music library as seven walkable 3D period rooms — a 1930s jazz club, a 50s/60s
jukebox diner, a 70s record shop, an 80s neon arcade, a 90s bedroom, a 2000s white
gallery and a streaming-age void — built from the ID3/MP4 tags of a real iTunes
library. Albums hang in each room by the era the music was recorded; walk near a
sleeve (or the bandstand) and the actual files play. Procedurally built, animated
crowd; walk-up conversations with synthesized era voices; click any sleeve for
curator's notes and a track list.

Single self-contained HTML output (Three.js r128 embedded) — runs from `file://`,
no server.

## Files

| File | Purpose |
|---|---|
| `app.js` | The whole application: room builders, procedural characters + animation, proximity audio/setlist, chat, navigation, dormant GLTF character pipeline |
| `shell.html` | HTML/CSS shell with `<!--THREE-->`, `<!--DATA-->`, `<!--APP-->` injection markers |
| `build.py` | Build: scans the music library's tags output (`library.json`), inlines artwork as base64, Three.js, loaders and `app.js` into one HTML file |
| `notes.json` | Hand-written curator's notes keyed by album id (`artist-slug__album-slug`) |

## Building

The build expects to run next to generated data files (`library.json`,
`artwork/*.jpg`) produced by scanning a music library with `mutagen` (Python),
and a `node_modules/three@0.128.0` install for the embedded runtime. Edit the
`LIB` path at the top of `build.py` to point at the music library folder, then:

```
pip install mutagen pillow
npm install three@0.128.0
python3 build.py
```

Output: `The Listening Rooms.html` in the library folder. mp3/m4a tracks play
in place; DRM-protected `.m4p` files are shown locked.

## Notes

- The crowd/characters are fully procedural (lathe-profile bodies, per-frame
  two-bone analytic arm IK tracking prop-anchored grip targets, beat-synced
  dance/waltz choreography, blinking/breathing/finger articulation).
- A GLTF character pipeline is built in but dormant: drop rigged `.glb` files
  onto the running app (or place them in `Characters/` beside the library and
  rebuild) and clips named Idle/Walk/Dance/Sit* are auto-mapped onto the crowd.
- Album artwork embedded in built output is from the owner's personal library;
  keep built artifacts out of public distribution.
