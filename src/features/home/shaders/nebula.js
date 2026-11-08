// GLSL loops need a fixed length, so the number of protected text lines is capped
export const MAX_TEXT_BOXES = 8;

// An oversized triangle, (-1,-1), (3,-1), (-1,3): clipped to the canvas, it covers each pixel once
export const VERTEX_SHADER = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;       // drawing buffer size in real pixels
uniform vec2 uHeroSize;         // hero size in CSS pixels
uniform float uPixelScale;      // real pixels per CSS pixel
uniform float uTime;            // seconds; stops while paused
uniform vec2 uBloom;            // the lantern's star, 0..1 from bottom-left
uniform vec2 uCore;             // CSS px: (--core, --core-fade)
uniform vec2 uHalo;             // ellipse radii as fractions of the hero
uniform vec2 uHaze;
uniform vec2 uRead;             // the text column's reading ellipse
uniform vec2 uStarFade;         // stars fade in between these heights, as fractions from the top
uniform vec2 uPointer;          // 0..1 from bottom-left, smoothed
uniform vec2 uWind;             // recent cursor movement, fading back to zero
uniform float uPointerPresence; // 0 = cursor away, 1 = over the hero
uniform float uScroll;          // 0 at the top of the page, 1 once the hero has scrolled away
uniform float uDrift;           // how far the embers lean left as they rise
uniform float uIntro;           // 1 = paint the CSS painting's light, 0 = the sky's own light
uniform float uEmbers;          // ember visibility (0 in the still picture)
// Text boxes in CSS px: (centre x, centre y, half width, half height)
uniform vec4 uTextBoxes[${MAX_TEXT_BOXES}];

const vec3 NIGHT_950    = vec3(0.043, 0.063, 0.125); // #0b1020
const vec3 LANTERN_900  = vec3(0.114, 0.051, 0.263); // #1d0d43
const vec3 LANTERN_700  = vec3(0.224, 0.153, 0.506); // #392781
const vec3 LANTERN_500  = vec3(0.478, 0.310, 0.686); // #7a4faf
const vec3 LANTERN_300  = vec3(0.827, 0.639, 0.925); // #d3a3ec
const vec3 GOLD_400     = vec3(0.910, 0.757, 0.439); // #e8c170
const vec3 GOLD_300     = vec3(0.949, 0.827, 0.561); // #f2d38f
const vec3 PARCHMENT    = vec3(0.953, 0.918, 0.843); // #f3ead7
// The same peach as hero.css (lavender and gold mixed)
const vec3 PEACH        = vec3(0.864, 0.692, 0.706);

// Radians (about 18°): the strokes rise from the lantern towards the upper left, like the embers
const float STROKE_ANGLE = 0.31;
const int EMBER_COUNT = 26;
// Must match hero.css: light-breathe starts at 0.85
const float CSS_LIGHT_OPACITY = 0.85;

// Counter-clockwise rotation by "angle" radians
mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, s, -s, c);
}

// Repeatable pseudo-random numbers, so nothing flickers between frames. No sin() inside, so
// phones and laptops agree.
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float n) {
  return hash12(vec2(n, n * 1.731));
}

// A random vector in -1..1 for a grid corner
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

// Gradient noise: blends random slopes at the four grid corners; returns roughly -0.7 to 0.7
float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 blend = local * local * (3.0 - 2.0 * local); // smoothstep, so no hard grid edges

  float a = dot(hash22(cell + vec2(0.0, 0.0)), local - vec2(0.0, 0.0));
  float b = dot(hash22(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
  float c = dot(hash22(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
  float d = dot(hash22(cell + vec2(1.0, 1.0)), local - vec2(1.0, 1.0));

  return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
}

// fbm: layers of noise, each twice as detailed and half as strong. OCTAVE_TURN rotates each
// layer so the grids never line up into visible rows.
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

// In CSS px; 0 inside a box
float distanceToText(vec2 px) {
  float nearest = 100000.0;
  for (int i = 0; i < ${MAX_TEXT_BOXES}; i++) {
    vec4 box = uTextBoxes[i];
    vec2 outside = max(abs(px - box.xy) - box.zw, 0.0);
    nearest = min(nearest, length(outside));
  }
  return nearest;
}

float distanceToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float along = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0);
  return length(p - (a + ab * along));
}

// Source-over compositing like CSS; "layer" is premultiplied (its rgb already times its alpha)
vec3 layerOver(vec3 below, vec4 layer) {
  return layer.rgb + below * (1.0 - layer.a);
}

// One possible star per grid cell, sized in CSS px so the stars stay small on every screen
float starLayer(vec2 px, float cellSize, float chance, float sizeCss) {
  vec2 grid = px / cellSize;
  vec2 cell = floor(grid);
  float dice = hash12(cell + 11.7);
  if (dice > chance) {
    return 0.0;
  }
  vec2 spot = (hash22(cell) * 0.38 + 0.5) * cellSize;
  float d = length(px - (cell * cellSize + spot)) * uPixelScale; // distance in real pixels
  float radius = max(sizeCss * uPixelScale, 0.75);
  float brightness = 0.4 + 0.6 * hash12(cell + 3.1);
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + 1.4 * hash12(cell + 5.3)) + dice * 40.0);
  return exp(-(d * d) / (radius * radius)) * brightness * twinkle;
}

// "life": 0 = leaving the star, 1 = gone; returns CSS px
vec2 emberPosition(float id, float seed, float life, vec2 starPx) {
  float rise = life * mix(0.38, 0.72, hash11(id * 1.9 + 3.0)) * uHeroSize.y;
  float curlAngle = life * mix(4.0, 7.0, seed) + seed * 6.283;
  vec2 curl = vec2(cos(curlAngle), sin(curlAngle) * 0.6) * (6.0 + 26.0 * life);
  vec2 start = starPx + vec2((hash11(id + 9.0) - 0.5) * 34.0, 0.0);
  return start + vec2(-rise * uDrift * mix(0.5, 1.6, seed), rise) + curl;
}

void main() {
  // uv: 0..1 from bottom-left; px: CSS pixels
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 px = uv * uHeroSize;
  float aspect = uHeroSize.x / uHeroSize.y;
  float fromTop = 1.0 - uv.y;

  // Text masks: inColumn is the broad reading ellipse (thinner clouds); nearText is 1 right
  // behind a line of text (no embers or stars there)
  float inColumn = 1.0 - smoothstep(0.45, 0.95, length((uv - vec2(0.5, 0.52)) / uRead));
  float nearText = 1.0 - smoothstep(4.0, 40.0, distanceToText(px));

  // The lantern's breathing: about once every nine seconds
  float breath = 0.86 + 0.14 * sin(uTime * 0.7);

  // Base sky: the same gradient stops as hero.css
  vec3 sky = mix(NIGHT_950, mix(NIGHT_950, LANTERN_900, 0.5), smoothstep(0.0, 0.3, fromTop));
  sky = mix(sky, LANTERN_900, smoothstep(0.3, 0.62, fromTop));
  sky = mix(sky, mix(LANTERN_900, LANTERN_700, 0.4), smoothstep(0.62, 1.0, fromTop));
  sky = mix(sky, LANTERN_700, 0.35 * ellipse(uv, vec2(0.5, 0.55), vec2(0.7, 0.55)));
  sky = mix(sky, PEACH, 0.3 * ellipse(uv, uBloom, uHaze) * breath);

  // Square units of 380-680 CSS px, so the strokes keep their shape on every screen size
  vec2 p = px / clamp(uHeroSize.x * 0.5, 380.0, 680.0);
  // Parallax: the clouds drift up a little faster than the page
  p.y -= uScroll * 0.45;

  // Clouds near the cursor are pushed the way it moved
  vec2 toCursor = (uv - uPointer) * vec2(aspect, 1.0);
  float nearCursor = exp(-dot(toCursor, toCursor) * 9.0) * uPointerPresence;
  p -= uWind * vec2(aspect, 1.0) * nearCursor * 2.6;

  // Rotate so x runs along the strokes, then squash x: the noise turns into long, thin brush
  // strokes instead of round puffs
  vec2 strokeSpace = rotate2d(STROKE_ANGLE) * p;
  vec2 s = vec2(strokeSpace.x * 0.42, strokeSpace.y) * 2.2;
  // Sliding along the strokes carries the clouds up and to the left
  s.x += uTime * 0.024;

  // Domain warping: two noise passes (q, then r) shift where the paint is read, so the shapes
  // swirl and fold like wet paint; the shifts change with time, so the marbling flows
  vec2 q = vec2(
    fbm4(s + vec2(0.0, uTime * 0.012)),
    fbm4(s + vec2(5.2, 1.3) - vec2(0.0, uTime * 0.010))
  );
  vec2 r = vec2(
    fbm4(s + 3.0 * q + vec2(1.7, 9.2) + uTime * 0.018),
    fbm4(s + 3.0 * q + vec2(8.3, 2.8) - uTime * 0.015)
  );
  float paint = fbm5(s + 2.4 * r); // roughly -0.5 .. 0.5

  // Bristle marks: fine streaks along the strokes, bent by the same warp
  float bristles = noise(vec2(s.x * 2.0, s.y * 24.0) + r * 5.0);

  // Where the clouds gather: the same composition as the CSS still
  float gatherLeft = ellipse(uv, vec2(0.16, 0.72), vec2(0.6, 0.55));
  float gatherRight = 0.85 * ellipse(uv, vec2(0.94, 0.6), vec2(0.42, 0.55));
  float gatherLight = 0.9 * ellipse(uv, uBloom, uHaze * 1.25);
  float gather = max(max(gatherLeft, gatherRight), gatherLight);
  // Gathering lowers the cloud threshold, so the edges and the light are cloudy, the middle clear
  float cloud = smoothstep(-0.12, 0.42, paint + (gather - 0.5) * 0.6);

  // A dark dust lane along the strokes behind the title adds depth and contrast
  vec2 laneSpace = rotate2d(STROKE_ANGLE) * ((uv - vec2(0.48, 0.5)) * vec2(aspect, 1.0));
  float laneAcross = laneSpace.y / 0.11; // squared by hand: pow() of a negative is undefined
  float lane = exp(-laneAcross * laneAcross) * (1.0 - smoothstep(0.3, 1.1, abs(laneSpace.x)));
  // Text protection: thinner clouds in the column, almost none right behind words
  cloud *= mix(1.0, 0.6, inColumn) * (1.0 - 0.55 * lane) * (1.0 - 0.8 * nearText);

  float haloDistance = length((uv - uBloom) / uHalo); // 1 = the edge of the halo ellipse
  float lit = exp(-haloDistance * 1.35) * breath;

  vec3 cloudColour = mix(LANTERN_700 * 0.85, LANTERN_500, smoothstep(0.0, 0.55, paint + 0.25 * length(q)));
  cloudColour = mix(cloudColour, PEACH, clamp(lit * 0.75, 0.0, 0.8));
  cloudColour *= 1.0 + bristles * 0.3;
  // Clouds far from the light stay dimmer, so they read as shapes against the night
  float cloudStrength = cloud * mix(0.62, 0.95, clamp(lit + gather * 0.5 + gatherLeft * 0.2, 0.0, 1.0));
  vec3 colour = mix(sky, cloudColour, cloudStrength);

  // Rims: a thin bright band where the paint density crosses 0.16, like a cloud's lit edge
  float rim = smoothstep(0.0, 0.07, paint - 0.16) * (1.0 - smoothstep(0.07, 0.2, paint - 0.16));
  vec3 rimColour = mix(LANTERN_300, GOLD_300, clamp(lit * 0.9, 0.0, 0.7));
  float rimStrength = 0.14 + 0.16 * gather + 0.14 * gatherLeft + 0.5 * lit;
  colour += rimColour * rim * cloud * rimStrength * (1.0 - 0.75 * inColumn) * (1.0 - nearText);

  colour = mix(colour, NIGHT_950, 0.45 * lane);

  float stars = starLayer(px, 42.0, 0.4, 0.75) + 1.4 * starLayer(px + 17.0, 140.0, 0.5, 1.2);
  float starMask = smoothstep(uStarFade.x, uStarFade.y, fromTop) * (1.0 - smoothstep(0.62, 0.9, fromTop));
  vec3 starColour = mix(PARCHMENT, LANTERN_300, step(0.6, hash12(floor(px / 140.0))));
  colour += starColour * stars * starMask * (1.0 - 0.6 * cloud) * (1.0 - 0.6 * nearText);

  vec3 unlit = colour;
  float toStar = length(px - uBloom * uHeroSize); // CSS px from the star

  // The sky's own light: halo, warm bloom and hot core
  colour = mix(colour, GOLD_400, 0.3 * (1.0 - smoothstep(0.0, 0.55, haloDistance)) * breath);
  colour = mix(colour, LANTERN_500, 0.14 * (1.0 - smoothstep(0.3, 0.8, haloDistance)));
  // Turned down next to text: on phones the star sits beside the scroll cue
  colour += GOLD_400 * exp(-toStar / (uCore.y * 0.9)) * 0.3 * breath * (1.0 - 0.6 * nearText);
  float inner = 1.0 - smoothstep(0.0, uCore.x, toStar);
  float outer = 1.0 - smoothstep(uCore.x * 0.3, uCore.y, toStar);
  colour = mix(colour, GOLD_400, 0.5 * outer * breath);
  colour = mix(colour, GOLD_300, 0.85 * inner * breath);

  // The CSS light (.hero-light) rebuilt with the same premultiplied stops, so the canvas fades in
  // over it unseen; uIntro then slides to 0
  if (uIntro > 0.0) {
    float haloStep1 = clamp(haloDistance / 0.55, 0.0, 1.0);          // gold 34% -> violet 18%
    float haloStep2 = clamp((haloDistance - 0.55) / 0.25, 0.0, 1.0); // violet 18% -> nothing
    vec4 halo = mix(vec4(GOLD_400, 1.0) * 0.34, vec4(LANTERN_500, 1.0) * 0.18, haloStep1) * (1.0 - haloStep2);
    float coreStep1 = clamp(toStar / uCore.x, 0.0, 1.0);                    // pale gold 85% -> gold 40%
    float coreStep2 = clamp((toStar - uCore.x) / (uCore.y - uCore.x), 0.0, 1.0); // gold 40% -> nothing
    vec4 core = mix(vec4(GOLD_300, 1.0) * 0.85, vec4(GOLD_400, 1.0) * 0.4, coreStep1) * (1.0 - coreStep2);
    vec4 cssLight = vec4(layerOver(halo.rgb, core), 1.0 - (1.0 - halo.a) * (1.0 - core.a)) * CSS_LIGHT_OPACITY;
    colour = mix(colour, layerOver(unlit, cssLight), uIntro);
  }

  // Embers: nothing is stored between frames; each path comes from its seed and the time, and
  // its life loops from 0 to 1, so it is reborn at the star
  vec3 embers = vec3(0.0);
  vec2 starPx = uBloom * uHeroSize;
  for (int i = 0; i < EMBER_COUNT; i++) {
    float id = float(i);
    float seed = hash11(id * 7.13 + 1.0);
    // Each ember lives about 14-30 seconds
    float speed = mix(0.033, 0.07, hash11(id * 3.7 + 2.0));
    float life = fract(uTime * speed + seed);
    vec2 position = emberPosition(id, seed, life, starPx);
    // A faint tail from where it was a moment ago, so it reads as a moving spark
    vec2 trail = emberPosition(id, seed, max(life - 0.012, 0.0), starPx);

    float dHead = length(px - position) * uPixelScale;                        // real pixels
    float dTail = distanceToSegment(px, position, trail) * uPixelScale;
    float radius = max(mix(1.3, 2.6, hash11(id + 4.0)) * (1.0 - 0.4 * life) * uPixelScale, 0.8);
    float tailRadius = radius * 0.6;
    float spark = exp(-(dHead * dHead) / (radius * radius))
      + 0.4 * exp(-(dTail * dTail) / (tailRadius * tailRadius))
      + 0.2 * exp(-dHead / (radius * 3.5)); // the soft glow around the head
    float fade = smoothstep(0.0, 0.05, life) * pow(1.0 - life, 1.3);
    float flicker = 0.7 + 0.3 * sin(uTime * (2.4 + 3.0 * seed) + seed * 40.0);
    vec3 emberColour = mix(GOLD_300, PEACH, smoothstep(0.15, 0.55, life));
    emberColour = mix(emberColour, LANTERN_300, smoothstep(0.55, 0.95, life));
    embers += emberColour * spark * fade * flicker * 1.25;
  }
  // Embers almost vanish right behind text, so words never flicker
  colour += embers * mix(1.0, 0.06, nearText) * uEmbers;

  colour = mix(colour, NIGHT_950, uScroll * 0.6);

  // Fixed grain: reads as canvas texture, not video noise, and hides colour banding
  float grain = hash12(floor(gl_FragCoord.xy)) - 0.5;
  float fibres = noise(px * vec2(0.08, 0.5)) * 0.5;
  colour += (grain * 0.035 + fibres * 0.02) * (0.5 + colour);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`;
