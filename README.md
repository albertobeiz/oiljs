# oiljs

Procedural portraits painted in simulated oil: a seeded drawai
character is planned into brush strokes, those strokes are executed by a
height-field paint engine, and the resulting paste is rendered as real
displaced geometry in three.js. Same seed, same painting.

```bash
npm install
python3 serve.py
```

- `index.html` — **the gallery wall**: one framed painting, lit, orbitable,
  repainted stroke by stroke in front of you.
- `gallery.html` — eight finished paintings at once, the contact sheet the
  look gets judged on.
- `paint.html` — **the bench**: target, painted colour and shaded relief side
  by side for one seed. This is where the planner and the engine get tuned.

## How it fits together

Four stages, each of which can be looked at on its own:

1. **`src/subject.js` — who is being painted.** A drawai recipe (`{seed,
   species, media, parts}`) drawn flat onto one 2D canvas, cropped to a bust.
   drawai normally gives every part its own canvas and hangs it on a bone in a
   three.js scene; parts draw in absolute character coordinates, so they can
   all go onto one shared canvas instead. `src/drawai/` is a vendored copy —
   drawai is public domain — with the two three.js-facing functions removed.
2. **`src/planner.js` — what strokes to make.** Hertzmann's layered painterly
   renderer: paint in passes of decreasing brush radius, place a stroke
   wherever the canvas so far differs from a blurred reference, and grow each
   stroke along the direction perpendicular to the image gradient. Pigment is
   mixed subtractively with [Mixbox](https://github.com/scrtwpns/mixbox), so
   blue over yellow makes green instead of grey. The finest passes are gated
   on a saliency map, so the small brushes only come out where the picture is
   busy.
3. **`src/engine.js` — what the paint does.** A 2.5D height field: every stamp
   deposits volume, presses what is underneath, and carves bristle grooves.
   Between strokes the surface settles as a Bingham plastic — paste holds its
   shape until the local slope passes a yield stress, then flows — carrying
   its pigment with it, so volume and colour stay consistent.
4. **`src/surface.js` — what you see.** The height field displaces a dense
   plane, normals come from the same field, the colour field is the albedo,
   and a clearcoat layer stands in for the oil sheen over the pigment.

The recipe is the only state, all the way through: `#<seed>` in the URL
rebuilds the exact same painting.

## Built with

| | | |
|---|---|---|
| [**three.js**](https://threejs.org) | WebGL renderer, `OrbitControls`, the displaced-plane material | MIT |
| [**Mixbox**](https://scrtwpns.com/mixbox) | pigment-based colour mixing (Kubelka–Munk), used for brush pickup in `src/planner.js` | **CC BY-NC 4.0** |
| [**drawai**](https://github.com/albertobeiz/kindergrimm) | the seeded character generator, vendored under `src/drawai/` | the Unlicense |

Everything else is hand-written ES modules with no build step: the browser
loads the source directly through an import map. `serve.py` is a ~20-line
`http.server` wrapper that sends `no-store` so edited modules always reload —
any static server works, it just has to serve `node_modules/` too.

## Licensing

**oiljs is [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) —
free to use, share and adapt, but not commercially.** See [LICENSE](LICENSE).

That is not a preference, it is inheritance. Mixbox is CC BY-NC 4.0, and
oiljs matches its most restrictive dependency. Going commercial means buying
a Mixbox licence from Secret Weapons *and* getting permission for this code —
or replacing `mixbox.lerp` in `src/planner.js` with your own subtractive
mixing, which is the only place it is used.

`src/drawai/` stays public domain (the Unlicense) under its own
[LICENSE](src/drawai/LICENSE); three.js is MIT.
