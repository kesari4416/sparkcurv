/**
 * Shaders for the hero network: a sphere of nodes (points), the links between
 * neighbouring nodes (line segments) and data pulses travelling along those links.
 *
 * All three share `attract()`: nodes within reach of the cursor are pulled toward it
 * and brighten. Because nodes, links and pulses run the same function, links stay
 * attached to their nodes while they move. `front` (0 = far side, 1 = facing the
 * camera) dims the back of the sphere, which is what makes it read as 3D.
 */

const shared = /* glsl */ `
uniform float uTime;
uniform float uReveal;      // 0 → 1 entrance
uniform vec3 uCursor;       // cursor projected onto the sphere, in the sphere's local space
uniform float uCursorAmt;   // 0 when the cursor is off the sphere, eased to 1 on it

// Pull a point toward the cursor and report how strongly (0..1) via glow.
vec3 attract(vec3 p, out float glow) {
  float d = distance(p, uCursor);
  glow = uCursorAmt * smoothstep(0.85, 0.0, d);
  return p + (uCursor - p) * glow * 0.16;
}

// 1 on the hemisphere facing the camera, 0 on the far side.
float facing(vec3 p) {
  return normalize(normalMatrix * p).z * 0.5 + 0.5;
}
`;

// ─── Nodes ────────────────────────────────────────────────────────────────────

export const nodeVertex = /* glsl */ `
${shared}
uniform float uPixelRatio;
attribute float aSize;
attribute float aSeed;
varying float vFront;
varying float vGlow;
varying float vTwinkle;

void main() {
  float glow;
  vec3 p = attract(position, glow);
  // Each node breathes slightly on its own phase.
  p *= 1.0 + 0.012 * sin(uTime * 0.8 + aSeed * 6.2831);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFront = facing(position);
  vGlow = glow;
  vTwinkle = 0.65 + 0.35 * sin(uTime * 1.6 + aSeed * 40.0);

  // Size attenuates with distance like a real point in space.
  // aSize is in CSS pixels at the sphere's distance (the camera sits at z = 5).
  gl_PointSize = aSize * (1.0 + glow * 1.8) * uPixelRatio * (5.0 / -mv.z) * uReveal;
  gl_Position = projectionMatrix * mv;
}
`;

export const nodeFragment = /* glsl */ `
uniform vec3 uSilver;
uniform vec3 uBlue;
varying float vFront;
varying float vGlow;
varying float vTwinkle;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float core = pow(smoothstep(0.5, 0.0, r), 1.7); // soft round dot

  // Chrome nodes; the far side and the ones near the cursor shift to electric blue.
  vec3 color = mix(uSilver, uBlue, clamp(vGlow * 1.4 + (1.0 - vFront) * 0.45, 0.0, 1.0));
  color += vGlow * 0.55 * core;

  float alpha = core * mix(0.16, 1.0, vFront) * vTwinkle;
  gl_FragColor = vec4(color, alpha);
}
`;

// ─── Links ────────────────────────────────────────────────────────────────────

export const linkVertex = /* glsl */ `
${shared}
varying float vFront;
varying float vGlow;

void main() {
  float glow;
  vec3 p = attract(position, glow);
  vFront = facing(position);
  vGlow = glow;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const linkFragment = /* glsl */ `
uniform vec3 uSilver;
uniform vec3 uBlue;
uniform float uReveal;
varying float vFront;
varying float vGlow;

void main() {
  vec3 color = mix(uSilver, uBlue, clamp(vGlow * 1.6, 0.0, 1.0));
  float alpha = (mix(0.035, 0.22, vFront) + vGlow * 0.45) * uReveal;
  gl_FragColor = vec4(color, alpha);
}
`;

// ─── Pulses ───────────────────────────────────────────────────────────────────

export const pulseVertex = /* glsl */ `
${shared}
uniform float uPixelRatio;
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aSeed;
attribute float aSpeed;
varying float vFade;
varying float vFront;

void main() {
  // Progress along the link, looping; each pulse has its own speed and phase.
  float t = fract(uTime * aSpeed + aSeed);
  float glow;
  vec3 p = attract(mix(aStart, aEnd, t), glow);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFront = facing(p);
  vFade = sin(t * 3.14159);       // fade in at the source node, out at the target
  gl_PointSize = 7.0 * uPixelRatio * (5.0 / -mv.z) * uReveal;
  gl_Position = projectionMatrix * mv;
}
`;

export const pulseFragment = /* glsl */ `
uniform vec3 uBlue;
varying float vFade;
varying float vFront;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float core = pow(smoothstep(0.5, 0.0, r), 2.2);
  // White-hot centre fading to electric blue.
  vec3 color = mix(uBlue, vec3(1.0), core * 0.7);
  gl_FragColor = vec4(color, core * vFade * mix(0.2, 1.0, vFront));
}
`;
