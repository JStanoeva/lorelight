import { FRAGMENT_SHADER, MAX_TEXT_BOXES, VERTEX_SHADER } from "../shaders/nebula.js";

// Nebulae are soft, so the sky is painted at a lower resolution and CSS stretches it up: far
// less work for the GPU, and nobody can see the difference. Screens with very dense pixels are
// capped too (a phone at 3x would otherwise paint nine times as many pixels as needed).
const MAX_PIXEL_RATIO = 1.5;
const RENDER_SCALE = 0.7;
// Phones, tablets and small windows start lower: their GPUs are usually weaker
const SMALL_SCREEN_QUERY = "(width < 48rem), (pointer: coarse)";
const SMALL_SCREEN_RENDER_SCALE = 0.5;
// If the first two seconds of motion still run slower than about 36 frames per second, the
// resolution drops once more, to 70% of what it was
const SPEED_CHECK_SECONDS = 2;
const SLOW_FRAME_SECONDS = 1 / 36;
const SLOW_DEVICE_FACTOR = 0.7;
// One slow frame (a busy page) never makes the sky jump: a frame counts as 1/20 s at most
const MAX_FRAME_SECONDS = 0.05;
// The canvas fades in over the CSS painting (2 s, nebula.css) while it still paints the CSS
// light, so the glow keeps its size; afterwards the light turns into the sky's own over three
// seconds
const INTRO_HOLD_SECONDS = 2;
const INTRO_SECONDS = 3;
// The same breakpoint as hero.css, where the light moves to the bottom-right corner
const COMPACT_QUERY = "(width < 48rem), (height <= 500px)";
// Set on the canvas's host box once the first frame is on screen: nebula.css then fades the
// canvas in and shows the star and flares above it
const READY_CLASS = "is-ready";
// The hero's small text: embers and stars fade right behind these boxes. HomeCtas is shared
// with the closing strip, so its row is found by its class instead of a data attribute.
const TEXT_SELECTOR = "[data-sky-guard], .home-ctas";
// An unused text box: far off the canvas and zero in size
const NO_BOX = [-100000, -100000, 0, 0];

// How far an element is moved by its CSS `translate` right now, in px. The text slides a little
// while it fades in (useSectionReveal), so its box is measured where it will settle, and the
// calm zones behind it never jump when the fade-in ends.
function readTranslate(element) {
  const [x, y] = getComputedStyle(element).translate.split(" ").map(parseFloat);
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

// Every line of small text as (centre x, centre y, half width, half height) in CSS px, measured
// from the hero's bottom-left corner like the shader's coordinates
function measureTextBoxes(hero) {
  const heroRect = hero.getBoundingClientRect();
  const elements = Array.from(hero.querySelectorAll(TEXT_SELECTOR)).slice(0, MAX_TEXT_BOXES);
  const boxes = [];
  for (let index = 0; index < MAX_TEXT_BOXES; index += 1) {
    const element = elements[index];
    if (!element) {
      boxes.push(...NO_BOX);
      continue;
    }
    const rect = element.getBoundingClientRect();
    // The fade-in's slide is set on the text line or on its wrapper (the buttons' row)
    const slide = readTranslate(element.closest("[data-reveal-item]") ?? element);
    boxes.push(
      rect.left - slide.x - heroRect.left + rect.width / 2,
      heroRect.bottom - (rect.bottom - slide.y) + rect.height / 2,
      rect.width / 2,
      rect.height / 2,
    );
  }
  return new Float32Array(boxes);
}

// --- Reading the hero's CSS, so the shader's light sits exactly where the CSS star is ---

function readPercent(style, name, fallback) {
  const value = parseFloat(style.getPropertyValue(name));
  return Number.isFinite(value) ? value / 100 : fallback;
}

function readPercentPair(style, name, fallback) {
  const parts = style.getPropertyValue(name).trim().split(/\s+/).map(parseFloat);
  return parts.length === 2 && parts.every(Number.isFinite) ? [parts[0] / 100, parts[1] / 100] : fallback;
}

// "2rem" or "32px" in CSS pixels
function readLength(style, name, fallback, rootFontSize) {
  const raw = style.getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return raw.endsWith("rem") ? value * rootFontSize : value;
}

function readSkyLayout(hero, rootFontSize) {
  const style = getComputedStyle(hero);
  const isCompact = window.matchMedia(COMPACT_QUERY).matches;
  return {
    // CSS measures from the top, WebGL from the bottom, so y is flipped
    bloom: [readPercent(style, "--bloom-x", 0.76), 1 - readPercent(style, "--bloom-y", 0.84)],
    core: [readLength(style, "--core", 32, rootFontSize), readLength(style, "--core-fade", 112, rootFontSize)],
    halo: readPercentPair(style, "--halo-size", [0.3, 0.26]),
    haze: readPercentPair(style, "--haze-size", [0.58, 0.46]),
    read: readPercentPair(style, "--read-size", [0.56, 0.4]),
    // On phones the text fills the width, so the embers climb almost straight up the edge
    drift: isCompact ? 0.08 : 0.42,
  };
}

// How much of the CSS light the sky still paints after `seconds` of running: 1 at first, then
// a smooth S-curve down to 0
function getIntro(seconds) {
  const progress = Math.min(Math.max((seconds - INTRO_HOLD_SECONDS) / INTRO_SECONDS, 0), 1);
  return 1 - progress * progress * (3 - 2 * progress);
}

// --- WebGL setup ---

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Only a warning: the visitor still sees the CSS painting. The log says why it failed.
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  // The shaders live on inside the linked program, so they can be flagged for deletion now
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Builds the painted sky inside `host` (an empty element inside the .hero section) and returns
// { start, stop, setIsStill, destroy }, or null when WebGL isn't available: then the CSS
// painting underneath simply stays. All the per-frame work happens here, outside React, so
// painting the sky never re-renders a component.
export function createNebulaRenderer(host) {
  const hero = host.closest(".hero");
  const canvas = document.createElement("canvas");
  canvas.className = "nebula-canvas";
  const gl = canvas.getContext("webgl", {
    alpha: false, // the sky is opaque, which is cheaper to put on screen
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!hero || !gl) {
    return null;
  }
  const program = createProgram(gl);
  if (!program) {
    // Hand the unused context back at once instead of waiting for the garbage collector
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }

  // One triangle that covers the whole canvas (see shaders/nebula.js)
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Where each uniform (the shader's inputs) lives, looked up once
  const uniformNames = [
    "uResolution", "uHeroSize", "uPixelScale", "uTime", "uBloom", "uCore", "uHalo", "uHaze",
    "uRead", "uStarFade", "uPointer", "uWind", "uPointerPresence", "uScroll", "uDrift",
    "uIntro", "uEmbers", "uTextBoxes",
  ];
  const uniforms = Object.fromEntries(
    uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]),
  );

  // Everything that changes over time lives in plain variables, not React state
  let renderScale = window.matchMedia(SMALL_SCREEN_QUERY).matches
    ? SMALL_SCREEN_RENDER_SCALE
    : RENDER_SCALE;
  // Measured by resize() below, before the first frame
  let heroWidth = 1;
  let heroHeight = 1;
  let rootFontSize = 16;
  let layout = null;
  let textBoxes = null;
  let elapsed = 0; // the sky's own clock: it only moves while the sky runs
  let scroll = 0; // how far the page is scrolled past the hero (0 to 1), read while running
  let lastFrameTime = null;
  let frameId = 0;
  let readyFrameId = 0;
  let isRunning = false;
  let isStill = false;
  let isLost = false;
  let isDestroyed = false;
  // The speed check: how many frames the first seconds of motion took
  let checkedFrames = 0;
  let checkedSeconds = 0;
  let isSpeedChecked = false;

  // The cursor: where it is aiming (target) and where the shader sees it (smoothed)
  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, presence: 0, isOver: false };
  const wind = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    const rect = hero.getBoundingClientRect();
    heroWidth = Math.max(rect.width, 1);
    heroHeight = Math.max(rect.height, 1);
    const pixelScale = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * renderScale;
    canvas.width = Math.max(1, Math.round(heroWidth * pixelScale));
    canvas.height = Math.max(1, Math.round(heroHeight * pixelScale));
    rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    layout = readSkyLayout(hero, rootFontSize);
    textBoxes = measureTextBoxes(hero);
  }

  // Paints one frame with the current values
  function draw() {
    if (isLost) {
      return;
    }
    // The still picture is the sky at the top of the page, with its own light straight away and
    // no embers (a frozen ember would show as a short dash). In motion, the embers appear as the
    // CSS light hands over.
    const intro = isStill ? 0 : getIntro(elapsed);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uHeroSize, heroWidth, heroHeight);
    gl.uniform1f(uniforms.uPixelScale, canvas.width / heroWidth);
    gl.uniform1f(uniforms.uTime, elapsed);
    gl.uniform2f(uniforms.uBloom, layout.bloom[0], layout.bloom[1]);
    gl.uniform2f(uniforms.uCore, layout.core[0], layout.core[1]);
    gl.uniform2f(uniforms.uHalo, layout.halo[0], layout.halo[1]);
    gl.uniform2f(uniforms.uHaze, layout.haze[0], layout.haze[1]);
    gl.uniform2f(uniforms.uRead, layout.read[0], layout.read[1]);
    // The same star mask as hero.css: stars appear between 4.5rem and 9rem from the top
    gl.uniform2f(uniforms.uStarFade, (4.5 * rootFontSize) / heroHeight, (9 * rootFontSize) / heroHeight);
    gl.uniform2f(uniforms.uPointer, pointer.x, pointer.y);
    gl.uniform2f(uniforms.uWind, wind.x, wind.y);
    gl.uniform1f(uniforms.uPointerPresence, pointer.presence);
    gl.uniform1f(uniforms.uScroll, isStill ? 0 : scroll);
    gl.uniform1f(uniforms.uDrift, layout.drift);
    gl.uniform1f(uniforms.uIntro, intro);
    gl.uniform1f(uniforms.uEmbers, isStill ? 0 : 1 - intro);
    gl.uniform4fv(uniforms.uTextBoxes, textBoxes);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Lowers the resolution once if the first frames are slow (a weak phone or laptop GPU)
  function checkSpeed(seconds) {
    checkedFrames += 1;
    checkedSeconds += seconds;
    if (checkedSeconds < SPEED_CHECK_SECONDS) {
      return;
    }
    isSpeedChecked = true;
    if (checkedSeconds / checkedFrames > SLOW_FRAME_SECONDS) {
      renderScale *= SLOW_DEVICE_FACTOR;
      resize();
    }
  }

  // One animation frame: move the clock on, ease the cursor values, paint, and ask the browser
  // for the next frame
  function frame(now) {
    frameId = requestAnimationFrame(frame);
    const seconds = lastFrameTime === null ? 0 : Math.min((now - lastFrameTime) / 1000, MAX_FRAME_SECONDS);
    lastFrameTime = now;
    elapsed += seconds;
    if (seconds > 0 && !isSpeedChecked) {
      checkSpeed(seconds);
    }
    // Scrolling down dims the sky. The scroll is read only here, so a stopped frame that has to
    // be painted again (after a resize) keeps the look it had when it stopped.
    scroll = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);

    // Ease the cursor values, so the wind swells and settles instead of snapping
    pointer.presence += ((pointer.isOver ? 1 : 0) - pointer.presence) * 0.04;
    pointer.x += (pointer.targetX - pointer.x) * 0.12;
    pointer.y += (pointer.targetY - pointer.y) * 0.12;
    wind.x += (wind.targetX - wind.x) * 0.08;
    wind.y += (wind.targetY - wind.y) * 0.08;
    wind.targetX *= 0.92;
    wind.targetY *= 0.92;

    draw();
  }

  function start() {
    if (isRunning || isLost) {
      return;
    }
    isRunning = true;
    lastFrameTime = null; // the first frame after a pause adds no time, so nothing jumps
    frameId = requestAnimationFrame(frame);
  }

  // Stopping keeps the last frame on the canvas
  function stop() {
    isRunning = false;
    cancelAnimationFrame(frameId);
  }

  // For reduced motion: the still picture instead of the first frame of the motion
  function setIsStill(value) {
    isStill = value;
    draw();
  }

  // Only a real mouse stirs the sky; touch scrolling shouldn't
  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") {
      return;
    }
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    if (pointer.isOver) {
      // The wind is the cursor's recent movement, capped so a fast flick stays gentle
      wind.targetX = Math.max(-0.12, Math.min(0.12, wind.targetX + (x - pointer.targetX)));
      wind.targetY = Math.max(-0.12, Math.min(0.12, wind.targetY + (y - pointer.targetY)));
    }
    pointer.targetX = x;
    pointer.targetY = y;
    pointer.isOver = true;
  }

  function handlePointerLeave() {
    pointer.isOver = false;
  }

  // If the GPU drops the context (driver reset, too many tabs), fade the canvas out: the CSS
  // painting underneath takes over
  function handleContextLost() {
    stop();
    isLost = true;
    host.classList.remove(READY_CLASS);
  }

  // Resizing a canvas clears it, so it is painted again straight away (also while stopped).
  // The text lines are watched too: when one changes size (the signed-in visitor's buttons
  // arrive, a font loads), its protected box is measured again.
  const resizeObserver = new ResizeObserver(() => {
    resize();
    draw();
  });

  host.append(canvas);
  resize();
  draw();
  // Fade in only after the first frame is on screen, so the sky never flashes
  readyFrameId = requestAnimationFrame(() => host.classList.add(READY_CLASS));
  resizeObserver.observe(hero);
  hero.querySelectorAll(TEXT_SELECTOR).forEach((element) => resizeObserver.observe(element));
  hero.addEventListener("pointermove", handlePointerMove);
  hero.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  // The web fonts can arrive after the first measurement and change the text widths
  document.fonts?.ready.then(() => {
    if (!isDestroyed) {
      textBoxes = measureTextBoxes(hero);
      draw();
    }
  });

  function destroy() {
    isDestroyed = true;
    stop();
    cancelAnimationFrame(readyFrameId);
    resizeObserver.disconnect();
    hero.removeEventListener("pointermove", handlePointerMove);
    hero.removeEventListener("pointerleave", handlePointerLeave);
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    if (!isLost) {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Hand the GPU memory back now instead of waiting for the garbage collector
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    canvas.remove();
    // React keeps the host box, so StrictMode's second mount fades its new canvas in again
    host.classList.remove(READY_CLASS);
  }

  return { start, stop, setIsStill, destroy };
}
