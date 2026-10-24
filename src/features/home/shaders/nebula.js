// The two small GPU programs ("shaders") that paint the hero's living sky (NebulaCanvas).
//
// How WebGL draws it: the vertex shader places one big triangle that covers the whole canvas.
// The GPU then runs the fragment shader once for every pixel of that triangle, all at the same
// time, and the fragment shader answers one question: "what colour is this pixel right now?"
// It can't remember anything from the last frame, so every frame the whole sky is painted again
// from a few numbers ("uniforms") that nebulaRenderer.js passes in: the running time, where the
// lantern's star is, where the cursor is, how far the page has scrolled, where the text is.
// The code below is GLSL (the GPU's C-like language), kept in a JavaScript string.

// How many lines of hero text the shader keeps bright things away from (nebulaRenderer.js
// measures them). GLSL loops need a fixed length, so this is a constant.
export const MAX_TEXT_BOXES = 8;

// One triangle, bigger than the screen: (-1,-1), (3,-1), (-1,3). The part that falls outside
// the canvas is simply cut off, and the visible part covers every pixel exactly once.
export const VERTEX_SHADER = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
// Phones without high precision fall back to medium precision (the noise gets a little coarser)
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// ---------------------------------------------------------------------------------------------
// Inputs from JavaScript (set every frame in nebulaRenderer.js)
// ---------------------------------------------------------------------------------------------
uniform vec2 uResolution;       // size of the drawing buffer in real pixels
uniform vec2 uHeroSize;         // size of the hero section in CSS pixels
uniform float uPixelScale;      // real pixels per CSS pixel (lower than the screen's, see renderer)
uniform float uTime;            // seconds the sky has been running; it stops while paused
uniform vec2 uBloom;            // the lantern's star (--bloom-x / --bloom-y), 0..1 from bottom-left
uniform vec2 uCore;             // the light's hot core in CSS px: (--core, --core-fade)
uniform vec2 uHalo;             // the light's halo ellipse (--halo-size), as fractions of the hero
uniform vec2 uHaze;             // the peach haze ellipse (--haze-size)
uniform vec2 uRead;             // the scrim's reading ellipse (--read-size): the text column
uniform vec2 uStarFade;         // stars fade in between these heights (fractions from the top)
uniform vec2 uPointer;          // the cursor, 0..1 from bottom-left (smoothed)
uniform vec2 uWind;             // how the cursor moved lately (fades back to zero)
uniform float uPointerPresence; // 0 while the cursor is away, 1 while it is over the hero
uniform float uScroll;          // 0 at the top of the page, 1 once the hero has scrolled away
uniform float uDrift;           // how far the embers lean to the left while they rise
uniform float uIntro;           // 1 = paint the CSS painting's light, 0 = the sky's own light
uniform float uEmbers;          // how visible the embers are: 0 in the still picture
// Every line of small hero text as a box in CSS px: (centre x, centre y, half width, half height)
uniform vec4 uTextBoxes[${MAX_TEXT_BOXES}];

// ---------------------------------------------------------------------------------------------
// The palette: the app's theme tokens (index.css) as RGB numbers from 0 to 1
// ---------------------------------------------------------------------------------------------
const vec3 NIGHT_950    = vec3(0.043, 0.063, 0.125); // #0b1020 midnight
const vec3 LANTERN_900  = vec3(0.114, 0.051, 0.263); // #1d0d43 deepest violet
const vec3 LANTERN_700  = vec3(0.224, 0.153, 0.506); // #392781 violet
const vec3 LANTERN_500  = vec3(0.478, 0.310, 0.686); // #7a4faf lantern violet
const vec3 LANTERN_300  = vec3(0.827, 0.639, 0.925); // #d3a3ec lavender
const vec3 GOLD_400     = vec3(0.910, 0.757, 0.439); // #e8c170 gold
const vec3 GOLD_300     = vec3(0.949, 0.827, 0.561); // #f2d38f pale gold
const vec3 PARCHMENT    = vec3(0.953, 0.918, 0.843); // #f3ead7 parchment
// The same peach as hero.css: lavender and gold mixed, where the light touches the clouds
const vec3 PEACH        = vec3(0.864, 0.692, 0.706);

// The brush strokes lean about 18 degrees: they rise from the lantern (low right) towards the
// upper left, the same way the embers drift
const float STROKE_ANGLE = 0.31;
const int EMBER_COUNT = 26;
// The CSS light's opacity when the page opens (hero.css: light-breathe starts at 0.85)
const float CSS_LIGHT_OPACITY = 0.85;

// ---------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------

// A rotation by "angle" radians (counter-clockwise)
mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, s, -s, c);
}

// "Hash" functions turn a position into numbers that look random but are always the same for
// the same input. They are the dice of the shader: the same pixel always gets the same roll, so
// nothing flickers between frames. (No sin() inside, so phones agree with laptops.)
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float n) {
  return hash12(vec2(n, n * 1.731));
}

// A random direction (each part between -1 and 1) for a grid corner
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

// Gradient noise: smooth hills and valleys. Space is cut into a grid; every grid corner gets a
// random slope (hash22), and the pixel blends the four corners around it with a soft curve.
// The result is a gently rolling value around 0 (roughly -0.7 to 0.7).
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 blend = local * local * (3.0 - 2.0 * local); // smooth S-curve, no hard grid edges

  float a = dot(hash22(cell + vec2(0.0, 0.0)), local - vec2(0.0, 0.0));
  float b = dot(hash22(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
  float c = dot(hash22(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
  float d = dot(hash22(cell + vec2(1.0, 1.0)), local - vec2(1.0, 1.0));

  return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
}

// fbm ("fractal Brownian motion"): several layers ("octaves") of noise added together, each one
// twice as detailed and half as strong as the one before. Big soft shapes plus finer and finer
// detail, like a painter blocking in clouds and then adding smaller strokes. Each layer is also
// turned a little (OCTAVE_TURN), so the grid never lines up into visible rows.
const mat2 OCTAVE_TURN = mat2(0.80, 0.60, -0.60, 0.80);

float fbm4(vec2 p) {
  float sum = 0.0;
  float strength = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += strength * noise(p);
    p = OCTAVE_TURN * p * 2.03 + vec2(1.7, 9.2);
    strength *= 0.5;
  }
  return sum;
}

float fbm5(vec2 p) {
  float sum = 0.0;
  float strength = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += strength * noise(p);
    p = OCTAVE_TURN * p * 2.03 + vec2(1.7, 9.2);
    strength *= 0.5;
  }
  return sum;
}

// 1 in the middle of an ellipse, fading to 0 at its edge (centre and radii as fractions)
float ellipse(vec2 uv, vec2 centre, vec2 radii) {
  vec2 d = (uv - centre) / radii;
  return 1.0 - smoothstep(0.0, 1.0, length(d));
}

// How far (in CSS px) this pixel is from the nearest line of hero text; 0 inside a box
float distanceToText(vec2 px) {
  float nearest = 100000.0;
  for (int i = 0; i < ${MAX_TEXT_BOXES}; i++) {
    vec4 box = uTextBoxes[i];
    vec2 outside = max(abs(px - box.xy) - box.zw, 0.0);
    nearest = min(nearest, length(outside));
  }
  return nearest;
}

// Distance from point p to the line segment a-b (used for the embers' short light trails)
float distanceToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float along = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - (a + ab * along));
}

// Lays a see-through colour over the sky, the way the browser layers a CSS gradient over what
// is behind it. "layer" is premultiplied: its colour already multiplied by its opacity (a).
vec3 layerOver(vec3 below, vec4 layer) {
  return layer.rgb + below * (1.0 - layer.a);
}

// ---------------------------------------------------------------------------------------------
// Stars: one possible star per grid cell, in CSS pixels, so they stay small on every screen
// ---------------------------------------------------------------------------------------------
float starLayer(vec2 px, float cellSize, float chance, float sizeCss) {
  vec2 grid = px / cellSize;
  vec2 cell = floor(grid);
  float dice = hash12(cell + 11.7);
  if (dice > chance) {
    return 0.0; // most cells stay empty
  }
  // Where in the cell the star sits, how bright it is and how fast it twinkles
  vec2 spot = (hash22(cell) * 0.38 + 0.5) * cellSize;
  float d = length(px - (cell * cellSize + spot)) * uPixelScale; // distance in real pixels
  float radius = max(sizeCss * uPixelScale, 0.75);
  float brightness = 0.4 + 0.6 * hash12(cell + 3.1);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + 1.4 * hash12(cell + 5.3)) + dice * 40.0);
  // A soft round dot: full brightness in the middle, fading quickly with the distance
  return exp(-(d * d) / (radius * radius)) * brightness * twinkle;
}

// Where ember number "id" is at moment "life" (0 = leaving the star, 1 = gone), in CSS px
vec2 emberPosition(float id, float seed, float life, vec2 starPx) {
  float rise = life * mix(0.38, 0.72, hash11(id * 1.9 + 3.0)) * uHeroSize.y;
  // A slow curl that widens as the ember climbs
  float curlAngle = life * mix(4.0, 7.0, seed) + seed * 6.283;
  vec2 curl = vec2(cos(curlAngle), sin(curlAngle) * 0.6) * (6.0 + 26.0 * life);
  vec2 start = starPx + vec2((hash11(id + 9.0) - 0.5) * 34.0, 0.0);
  return start + vec2(-rise * uDrift * mix(0.5, 1.6, seed), rise) + curl;
}

// ---------------------------------------------------------------------------------------------
// The painting
// ---------------------------------------------------------------------------------------------
void main() {
  // Where this pixel is: uv from 0 to 1 (bottom-left is 0,0), px in CSS pixels
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 px = uv * uHeroSize;
  float aspect = uHeroSize.x / uHeroSize.y;
  float fromTop = 1.0 - uv.y;

  // Two "keep the text readable" masks:
  // - inColumn: the scrim's broad reading ellipse; clouds stay thinner and darker inside it
  // - nearText: 1 right behind a line of text, 0 a little way off; embers and stars fade there
  float inColumn = 1.0 - smoothstep(0.45, 0.95, length((uv - vec2(0.5, 0.52)) / uRead));
  float nearText = 1.0 - smoothstep(4.0, 40.0, distanceToText(px));

  // The lantern's breathing: a slow swell of the light, about once every nine seconds
  float breath = 0.86 + 0.14 * sin(uTime * 0.7);

  // ---- 1. Base sky: midnight at the top, deep violet below (the same stops as hero.css) ----
  vec3 sky = mix(NIGHT_950, mix(NIGHT_950, LANTERN_900, 0.5), smoothstep(0.0, 0.3, fromTop));
  sky = mix(sky, LANTERN_900, smoothstep(0.3, 0.62, fromTop));
  sky = mix(sky, mix(LANTERN_900, LANTERN_700, 0.4), smoothstep(0.62, 1.0, fromTop));
  // A deep violet mass behind the title gives the column depth without lighting it
  sky = mix(sky, LANTERN_700, 0.35 * ellipse(uv, vec2(0.5, 0.55), vec2(0.7, 0.55)));
  // The peach haze that the light throws around itself
  sky = mix(sky, PEACH, 0.3 * ellipse(uv, uBloom, uHaze) * breath);

  // ---- 2. Paint space: the coordinates the brush strokes are painted in ----
  // Square units (one unit is a fixed number of CSS pixels), so strokes keep their shape on
  // every screen size; a bit smaller on phones
  vec2 p = px / clamp(uHeroSize.x * 0.5, 380.0, 680.0);
  // Scrolling: the clouds drift upwards a little faster than the page
  p.y -= uScroll * 0.45;

  // The cursor's breath of wind: clouds near the cursor are pushed the way it moved, then
  // slowly settle back as the wind dies down
  vec2 toCursor = (uv - uPointer) * vec2(aspect, 1.0);
  float nearCursor = exp(-dot(toCursor, toCursor) * 9.0) * uPointerPresence;
  p -= uWind * vec2(aspect, 1.0) * nearCursor * 2.6;

  // Turn the space so that its x axis runs along the strokes, then squash x: the noise now
  // changes slowly along a stroke and quickly across it, so its shapes become long and thin,
  // like paint dragged by a brush instead of round puffs of smoke
  vec2 strokeSpace = rotate2d(STROKE_ANGLE) * p;
  vec2 s = vec2(strokeSpace.x * 0.42, strokeSpace.y) * 2.2;
  // The slow current: sliding the paint along its strokes carries the clouds up and to the left
  s.x += uTime * 0.024;

  // ---- 3. Domain warping: noise that bends noise ----
  // Instead of asking the noise "what is the value here?", we first ask two other noises "where
  // should I look instead?" (q), then do it once more with the answer (r), and only then read
  // the paint at that pushed-around place. Nearby pixels get pushed by different amounts, so
  // the shapes swirl and fold, the way wet paint gets pulled and curled by a brush. The pushes
  // change slowly with time, so the marbling flows.
  vec2 q = vec2(
    fbm4(s + vec2(0.0, uTime * 0.012)),
    fbm4(s + vec2(5.2, 1.3) - vec2(0.0, uTime * 0.010))
  );
  vec2 r = vec2(
    fbm4(s + 3.0 * q + vec2(1.7, 9.2) + uTime * 0.018),
    fbm4(s + 3.0 * q + vec2(8.3, 2.8) - uTime * 0.015)
  );
  float paint = fbm5(s + 2.4 * r); // the final paint density, roughly -0.5 .. 0.5

  // Bristle marks: very fine streaks along the strokes, bent by the same warp, like the lines a
  // dry brush leaves in thick paint
  float bristles = noise(vec2(s.x * 2.0, s.y * 24.0) + r * 5.0);

  // ---- 4. Where the clouds gather (the same composition as the CSS still) ----
  float gatherLeft = ellipse(uv, vec2(0.16, 0.72), vec2(0.6, 0.55));            // upper left
  float gatherRight = 0.85 * ellipse(uv, vec2(0.94, 0.6), vec2(0.42, 0.55));     // right
  float gatherLight = 0.9 * ellipse(uv, uBloom, uHaze * 1.25);                  // around the light
  float gather = max(max(gatherLeft, gatherRight), gatherLight);
  // Paint only counts as cloud above a threshold, and the threshold is lower where the clouds
  // gather: so the sky is cloudy at the edges and around the light, and clear in the middle
  float cloud = smoothstep(-0.12, 0.42, paint + (gather - 0.5) * 0.6);

  // A dark dust lane runs along the strokes right behind the title: depth and contrast
  vec2 laneSpace = rotate2d(STROKE_ANGLE) * ((uv - vec2(0.48, 0.5)) * vec2(aspect, 1.0));
  float laneAcross = laneSpace.y / 0.11; // (squared by hand: pow() of a negative number is undefined)
  float lane = exp(-laneAcross * laneAcross) * (1.0 - smoothstep(0.3, 1.1, abs(laneSpace.x)));
  // Text protection, part 1: inside the text column the clouds stay thinner, and right behind
  // a line of small text they almost vanish, so no bright paint ever sits behind words
  cloud *= mix(1.0, 0.6, inColumn) * (1.0 - 0.55 * lane) * (1.0 - 0.8 * nearText);

  // ---- 5. Light from the lantern ----
  // How strongly the lantern lights this spot: strong near the star, fading over the halo
  float haloDistance = length((uv - uBloom) / uHalo); // 1 = the edge of the halo ellipse
  float lit = exp(-haloDistance * 1.35) * breath;

  // ---- 6. Colour the clouds ----
  // Deep violet in the body, lantern violet where the paint is thick, then the light's warmth
  vec3 cloudColour = mix(LANTERN_700 * 0.85, LANTERN_500, smoothstep(0.0, 0.55, paint + 0.25 * length(q)));
  cloudColour = mix(cloudColour, PEACH, clamp(lit * 0.75, 0.0, 0.8));
  cloudColour *= 1.0 + bristles * 0.3; // the bristle marks lighten and darken the paint a little
  // Clouds far from the light stay dimmer, so they read as shapes against the night
  float cloudStrength = cloud * mix(0.62, 0.95, clamp(lit + gather * 0.5 + gatherLeft * 0.2, 0.0, 1.0));
  vec3 colour = mix(sky, cloudColour, cloudStrength);

  // Lavender rims: a thin bright band where the paint density crosses one level, like the
  // lit edge of a cloud; warmer and brighter on the side that faces the light
  float rim = smoothstep(0.0, 0.07, paint - 0.16) * (1.0 - smoothstep(0.07, 0.2, paint - 0.16));
  vec3 rimColour = mix(LANTERN_300, GOLD_300, clamp(lit * 0.9, 0.0, 0.7));
  // (a little extra on the upper-left cloud, so the sky has a cool, moonlit side too)
  float rimStrength = 0.14 + 0.16 * gather + 0.14 * gatherLeft + 0.5 * lit;
  colour += rimColour * rim * cloud * rimStrength * (1.0 - 0.75 * inColumn) * (1.0 - nearText);

  // The dust lane darkens whatever is behind the title
  colour = mix(colour, NIGHT_950, 0.45 * lane);

  // ---- 7. Stars, dimmed where the clouds are thick, kept out of the header strip ----
  // Two layers: many faint small stars on a fine grid, and a few brighter ones on a wide grid
  float stars = starLayer(px, 42.0, 0.4, 0.75) + 1.4 * starLayer(px + 17.0, 140.0, 0.5, 1.2);
  float starMask = smoothstep(uStarFade.x, uStarFade.y, fromTop) * (1.0 - smoothstep(0.62, 0.9, fromTop));
  vec3 starColour = mix(PARCHMENT, LANTERN_300, step(0.6, hash12(floor(px / 140.0))));
  colour += starColour * stars * starMask * (1.0 - 0.6 * cloud) * (1.0 - 0.6 * nearText);

  // ---- 8. The lantern's light ----
  vec3 unlit = colour;
  float toStar = length(px - uBloom * uHeroSize); // CSS px from the star

  // a) The sky's own light: halo, warm bloom and hot core, all breathing
  colour = mix(colour, GOLD_400, 0.3 * (1.0 - smoothstep(0.0, 0.55, haloDistance)) * breath);
  colour = mix(colour, LANTERN_500, 0.14 * (1.0 - smoothstep(0.3, 0.8, haloDistance)));
  // (the wide warm bloom is turned down next to text: on phones the star sits beside the cue)
  colour += GOLD_400 * exp(-toStar / (uCore.y * 0.9)) * 0.3 * breath * (1.0 - 0.6 * nearText);
  float inner = 1.0 - smoothstep(0.0, uCore.x, toStar);
  float outer = 1.0 - smoothstep(uCore.x * 0.3, uCore.y, toStar);
  colour = mix(colour, GOLD_400, 0.5 * outer * breath);
  colour = mix(colour, GOLD_300, 0.85 * inner * breath);

  // b) The CSS painting's light (.hero-light in hero.css), rebuilt here with the same colour
  //    stops: a halo ellipse, then a round hot core on top. The canvas fades in over the CSS
  //    painting while it shows this light, so the glow keeps its size and the swap can't be
  //    seen; then uIntro slides to 0 and the light becomes the sky's own (nebulaRenderer.js).
  //    In a gradient, colour and opacity both blend from one stop to the next (premultiplied).
  if (uIntro > 0.0) {
    float haloStep1 = clamp(haloDistance / 0.55, 0.0, 1.0);          // gold 34% -> violet 18%
    float haloStep2 = clamp((haloDistance - 0.55) / 0.25, 0.0, 1.0); // violet 18% -> nothing
    vec4 halo = mix(vec4(GOLD_400, 1.0) * 0.34, vec4(LANTERN_500, 1.0) * 0.18, haloStep1) * (1.0 - haloStep2);
    float coreStep1 = clamp(toStar / uCore.x, 0.0, 1.0);                    // pale gold 85% -> gold 40%
    float coreStep2 = clamp((toStar - uCore.x) / (uCore.y - uCore.x), 0.0, 1.0); // gold 40% -> nothing
    vec4 core = mix(vec4(GOLD_300, 1.0) * 0.85, vec4(GOLD_400, 1.0) * 0.4, coreStep1) * (1.0 - coreStep2);
    // The whole light layer, core over halo, at the opacity the CSS light starts with
    vec4 cssLight = vec4(layerOver(halo.rgb, core), 1.0 - (1.0 - halo.a) * (1.0 - core.a)) * CSS_LIGHT_OPACITY;
    colour = mix(colour, layerOver(unlit, cssLight), uIntro);
  }

  // ---- 9. Embers: sparks that rise from the star, curl up and to the left, and fade ----
  // Nothing is stored between frames: each ember's position is worked out from the time alone.
  // Every ember has its own "seed" (a fixed random number) that sets its speed, path and size,
  // and its "life" runs from 0 to 1 again and again, so it is reborn at the star each time.
  vec3 embers = vec3(0.0);
  vec2 starPx = uBloom * uHeroSize;
  for (int i = 0; i < EMBER_COUNT; i++) {
    float id = float(i);
    float seed = hash11(id * 7.13 + 1.0);
    // Each ember lives about 14-30 seconds, then a new one starts at the star (life: 0 -> 1)
    float speed = mix(0.033, 0.07, hash11(id * 3.7 + 2.0));
    float life = fract(uTime * speed + seed);
    vec2 position = emberPosition(id, seed, life, starPx);
    // Where it was a moment ago: a faint, thin tail runs from there to the bright head, so the
    // ember reads as a moving spark rather than a dot
    vec2 trail = emberPosition(id, seed, max(life - 0.012, 0.0), starPx);

    float dHead = length(px - position) * uPixelScale;                        // real pixels
    float dTail = distanceToSegment(px, position, trail) * uPixelScale;
    float radius = max(mix(1.3, 2.6, hash11(id + 4.0)) * (1.0 - 0.4 * life) * uPixelScale, 0.8);
    float tailRadius = radius * 0.6;
    float spark = exp(-(dHead * dHead) / (radius * radius))
      + 0.4 * exp(-(dTail * dTail) / (tailRadius * tailRadius))
      + 0.2 * exp(-dHead / (radius * 3.5)); // the soft glow around the head
    // Fade in quickly at the star, fade out slowly near the end of the climb, and flicker
    float fade = smoothstep(0.0, 0.05, life) * pow(1.0 - life, 1.3);
    float flicker = 0.7 + 0.3 * sin(uTime * (2.4 + 3.0 * seed) + seed * 40.0);
    // Gold when young, cooling through peach to lavender as it rises
    vec3 emberColour = mix(GOLD_300, PEACH, smoothstep(0.15, 0.55, life));
    emberColour = mix(emberColour, LANTERN_300, smoothstep(0.55, 0.95, life));
    embers += emberColour * spark * fade * flicker * 1.25;
  }
  // Text protection, part 2: right behind a line of text the embers sink to almost nothing, so
  // words never flicker
  colour += embers * mix(1.0, 0.06, nearText) * uEmbers;

  // ---- 10. Scrolling away dims the whole sky towards midnight ----
  colour = mix(colour, NIGHT_950, uScroll * 0.6);

  // ---- 11. Canvas grain: a fixed, very fine speckle, like the weave of a painted canvas ----
  // (It never moves, so it reads as texture rather than video noise, and it hides colour banding.)
  float grain = hash12(floor(gl_FragCoord.xy)) - 0.5;
  float fibres = noise(px * vec2(0.08, 0.5)) * 0.5;
  colour += (grain * 0.035 + fibres * 0.02) * (0.5 + colour);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;
