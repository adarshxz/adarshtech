import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/hooks'

/*
  A glowing morphing blob creature that follows the cursor through the banner.
  When idle it wanders on its own in smooth Lissajous curves.
  A luminous energy trail, orbiting sparkles, and ambient dust
  give the whole thing a living, breathing feel.
*/

function getDynamicPalette(t, dark, active = 0) {
  const w = t * 0.45
  if (dark) {
    // Dark mode: luminous cosmic aurora (shifting electric sapphire, violet, cyan, magenta)
    const r1 = 0.42 + 0.28 * Math.sin(w)
    const g1 = 0.48 + 0.30 * Math.sin(w + 2.094)
    const b1 = 0.90 + 0.10 * Math.sin(w + 4.188)

    const r2 = 0.72 + 0.24 * Math.sin(w + 1.2)
    const g2 = 0.32 + 0.24 * Math.sin(w + 3.3)
    const b2 = 0.92 + 0.08 * Math.sin(w + 5.4)

    const r3 = 0.20 + 0.22 * Math.sin(w + 2.5)
    const g3 = 0.82 + 0.18 * Math.sin(w + 4.6)
    const b3 = 0.86 + 0.14 * Math.sin(w + 0.7)

    const core = new THREE.Color(r1, g1, b1)
    const rim = new THREE.Color(r2, g2, b2)
    const glow = new THREE.Color(r3, g3, b3)
    core.lerp(glow, active * 0.3)

    return { core, rim, glow, trail: core.clone(), dust: new THREE.Color('#4a5075') }
  } else {
    // Light mode: translucent liquid glass / vibrant iridescent jewel on warm cream background
    // Fluid transitions between cobalt, electric violet, vibrant azure, and luminous emerald
    const r1 = 0.18 + 0.20 * Math.sin(w)
    const g1 = 0.36 + 0.26 * Math.sin(w + 2.094)
    const b1 = 0.88 + 0.12 * Math.sin(w + 4.188)

    const r2 = 0.48 + 0.26 * Math.sin(w + 1.4)
    const g2 = 0.22 + 0.22 * Math.sin(w + 3.5)
    const b2 = 0.90 + 0.10 * Math.sin(w + 5.6)

    const r3 = 0.08 + 0.16 * Math.sin(w + 2.7)
    const g3 = 0.68 + 0.26 * Math.sin(w + 4.8)
    const b3 = 0.86 + 0.14 * Math.sin(w + 0.9)

    const core = new THREE.Color(r1, g1, b1)
    const rim = new THREE.Color(r2, g2, b2)
    const glow = new THREE.Color(r3, g3, b3)
    core.lerp(glow, active * 0.25)

    return { core, rim, glow, trail: core.clone(), dust: new THREE.Color('#8896b8') }
  }
}

const pal = (dark) => getDynamicPalette(0, dark, 0)

/* ── GLSL noise ──────────────────────────────────────────────── */

const noise3D = /* glsl */ `
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec3 x) {
    vec3 p = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n+0.0), hash(n+1.0), f.x),
                   mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
               mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                   mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`

/* ── Blob shaders ────────────────────────────────────────────── */

const blobVert = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDisp;
  ${noise3D}
  void main() {
    vec3 pos = position;
    float n = fbm(pos * 1.5 + uTime * 0.35) - 0.5;
    n += 0.25 * fbm(pos * 3.0 - uTime * 0.5);
    float d = n * uMorph;
    pos += normal * d;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mv.xyz;
    vDisp = d;
    gl_Position = projectionMatrix * mv;
  }
`

const blobFrag = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform vec3 uHighlight;
  uniform float uDark;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDisp;
  void main() {
    vec3 V = normalize(-vViewPos);
    float fresnel = pow(1.0 - max(dot(V, vNormal), 0.0), 2.5);
    vec3 col = mix(uCore, uRim, fresnel);
    col = mix(col, uHighlight, smoothstep(-0.05, 0.25, vDisp));
    
    if (uDark > 0.5) {
      // Dark mode: luminous energy creature
      col += uCore * 0.15;
      col += uRim * fresnel * 0.45;
      gl_FragColor = vec4(col, 0.88 + fresnel * 0.12);
    } else {
      // Light mode: translucent liquid glass with glossy specular highlights on cream paper
      vec3 lightDir = normalize(vec3(0.4, 0.7, 1.0));
      vec3 H = normalize(V + lightDir);
      float spec = pow(max(dot(vNormal, H), 0.0), 28.0);
      col += vec3(spec * 0.5);
      col += uHighlight * fresnel * 0.3;
      float alpha = mix(0.72, 0.92, fresnel);
      gl_FragColor = vec4(col, alpha);
    }
  }
`

/* ── Glow shell (rendered as backfaces behind the blob) ────── */

const glowVert = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  ${noise3D}
  varying float vFresnel;
  void main() {
    vec3 pos = position;
    float n = fbm(pos * 1.2 + uTime * 0.3) - 0.5;
    pos += normal * n * uMorph * 0.6;
    vec3 N = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec3 V = normalize(-mv.xyz);
    vFresnel = pow(1.0 - max(dot(V, N), 0.0), 2.0);
    gl_Position = projectionMatrix * mv;
  }
`

const glowFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDark;
  varying float vFresnel;
  void main() {
    // In light mode, subtle soft feathering instead of dark heavy ring
    float alpha = uDark > 0.5 ? (vFresnel * 0.38) : (vFresnel * 0.08);
    gl_FragColor = vec4(uColor, alpha);
  }
`

/* ── Trail shaders ───────────────────────────────────────────── */

const trailVert = /* glsl */ `
  attribute float aAge;
  attribute float aSize;
  uniform float uPR;
  varying float vAge;
  void main() {
    vAge = aAge;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float fade = 1.0 - aAge * aAge;
    gl_PointSize = aSize * uPR * fade * (5.0 / -mv.z);
  }
`

const trailFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDark;
  varying float vAge;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    float alpha = uDark > 0.5 ? soft * (1.0 - vAge) * 0.55 : soft * (1.0 - vAge) * 0.35;
    gl_FragColor = vec4(uColor, alpha);
  }
`

/* ── Dust shaders ────────────────────────────────────────────── */

const dustVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPR * (4.0 / -mv.z);
    vTwinkle = 0.4 + 0.6 * sin(uTime * 0.8 + aSeed * 80.0);
  }
`

const dustFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(uColor, soft * vTwinkle * uAlpha);
  }
`

/* ── Sparkle shaders ─────────────────────────────────────────── */

const sparkVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  varying float vPulse;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vPulse = 0.5 + 0.5 * sin(uTime * 3.0 + aSeed * 20.0);
    gl_PointSize = aSize * uPR * (0.6 + vPulse * 0.4) * (5.0 / -mv.z);
  }
`

const sparkFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDark;
  varying float vPulse;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float bloom = smoothstep(0.5, 0.2, d);
    float shape = core * 0.6 + bloom * 0.4;
    float alpha = uDark > 0.5 ? shape * (0.7 + vPulse * 0.3) : shape * (0.45 + vPulse * 0.25);
    gl_FragColor = vec4(uColor * (1.0 + vPulse * 0.3), alpha);
  }
`

/* ── Helpers ─────────────────────────────────────────────────── */

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── The Creature ────────────────────────────────────────────── */

const TRAIL = 45
const SPARKS = 5

function Creature({ mobile, reduced, dark }) {
  const { camera, size, invalidate } = useThree()
  const colors = useMemo(() => pal(dark), [dark])
  const additive = dark ? THREE.AdditiveBlending : THREE.NormalBlending

  /* ── Geometries ──────────────────────────────────────────── */
  const blobGeo = useMemo(() => new THREE.IcosahedronGeometry(0.9, 4), [])
  const glowGeo = useMemo(() => new THREE.IcosahedronGeometry(1.15, 3), [])

  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(TRAIL * 3)
    const age = new Float32Array(TRAIL)
    const sz = new Float32Array(TRAIL)
    const rand = rng(99)
    for (let i = 0; i < TRAIL; i++) {
      pos[i * 3] = 999 // off-screen initially
      age[i] = i / TRAIL
      sz[i] = 2.5 + rand() * 3.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aAge', new THREE.BufferAttribute(age, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    return g
  }, [])

  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(SPARKS * 3)
    const sz = new Float32Array(SPARKS)
    const sd = new Float32Array(SPARKS)
    const rand = rng(55)
    for (let i = 0; i < SPARKS; i++) {
      sz[i] = 3.0 + rand() * 2.0
      sd[i] = rand()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1))
    return g
  }, [])

  /* ── Materials ───────────────────────────────────────────── */
  const blobMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0.2 },
          uCore: { value: colors.core.clone() },
          uRim: { value: colors.rim.clone() },
          uHighlight: { value: colors.glow.clone() },
          uDark: { value: dark ? 1.0 : 0.0 },
        },
        vertexShader: blobVert,
        fragmentShader: blobFrag,
        transparent: true,
        depthWrite: true,
      }),
    [colors, dark],
  )

  const glowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: 0.2 },
          uColor: { value: colors.rim.clone().lerp(colors.glow, 0.3) },
          uDark: { value: dark ? 1.0 : 0.0 },
        },
        vertexShader: glowVert,
        fragmentShader: glowFrag,
        transparent: true,
        depthWrite: false,
        blending: additive,
        side: THREE.BackSide,
      }),
    [colors, additive, dark],
  )

  const trailMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: colors.trail.clone() },
          uDark: { value: dark ? 1.0 : 0.0 },
          uPR: { value: 1 },
        },
        vertexShader: trailVert,
        fragmentShader: trailFrag,
        transparent: true,
        depthWrite: false,
        blending: additive,
      }),
    [colors, additive, dark],
  )

  const sparkMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDark: { value: dark ? 1.0 : 0.0 },
          uPR: { value: 1 },
          uColor: { value: colors.glow.clone() },
        },
        vertexShader: sparkVert,
        fragmentShader: sparkFrag,
        transparent: true,
        depthWrite: false,
        blending: additive,
      }),
    [colors, additive, dark],
  )

  /* ── Refs ─────────────────────────────────────────────────── */
  const blobRef = useRef()
  const glowRef = useRef()

  /* ── Cleanup ─────────────────────────────────────────────── */
  useEffect(
    () => () => {
      blobGeo.dispose()
      glowGeo.dispose()
      trailGeo.dispose()
      sparkGeo.dispose()
      blobMat.dispose()
      glowMat.dispose()
      trailMat.dispose()
      sparkMat.dispose()
    },
    [blobGeo, glowGeo, trailGeo, sparkGeo, blobMat, glowMat, trailMat, sparkMat],
  )

  /* ── Pointer input ───────────────────────────────────────── */
  const input = useRef({ x: 0, y: 0, active: 0, lastMove: -1e9 })

  useEffect(() => {
    const s = input.current
    const onPointer = (e) => {
      if (e.pointerType === 'touch') return
      s.x = (e.clientX / window.innerWidth) * 2 - 1
      s.y = -((e.clientY / window.innerHeight) * 2 - 1)
      s.lastMove = performance.now()
      invalidate()
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => window.removeEventListener('pointermove', onPointer)
  }, [invalidate])

  /* ── Mutable state (no re-renders) ───────────────────────── */
  const st = useMemo(
    () => ({
      pos: new THREE.Vector3(2, 0, 0),
      prevPos: new THREE.Vector3(2, 0, 0),
      vel: new THREE.Vector3(),
      t: 0,
      v: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      hit: new THREE.Vector3(),
      trailReady: false,
    }),
    [],
  )

  /* ── Frame loop ──────────────────────────────────────────── */
  useFrame((fState, delta) => {
    const dt = reduced ? 0.016 : Math.min(delta, 0.05)
    if (!reduced) st.t += dt
    const wt = st.t
    const s = input.current
    const now = performance.now()
    const follow = reduced ? 1 : 1 - Math.exp(-dt * 3.8)

    /* ── Home position (right of centre) ── */
    const aspect = size.width / size.height
    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    const visW = visH * aspect
    const homeX = (aspect > 2.4 ? 0.2 : 0.07) * visW

    /* ── Wander path (Lissajous curves) ── */
    const wanderX = homeX + Math.sin(wt * 0.32) * 1.6 + Math.sin(wt * 0.71) * 0.5
    const wanderY = Math.cos(wt * 0.43) * 0.5 + Math.sin(wt * 0.91) * 0.2
    const wanderZ = Math.sin(wt * 0.22) * 0.3

    /* ── Cursor → world ── */
    const steering = now - s.lastMove < 2600
    s.active += ((steering ? 1 : 0) - s.active) * (reduced ? 1 : 1 - Math.exp(-dt * 2.4))

    st.v.set(s.x, s.y, 0.5).unproject(camera)
    st.dir.copy(st.v).sub(camera.position).normalize()
    const k = -camera.position.z / st.dir.z
    st.hit.copy(camera.position).addScaledVector(st.dir, k)

    /* ── Target: blend between wander and cursor ── */
    const tx = wanderX + (st.hit.x - wanderX) * s.active
    const ty = wanderY + (st.hit.y - wanderY) * s.active
    const tz = wanderZ

    /* ── Spring-follow ── */
    st.prevPos.copy(st.pos)
    st.pos.x += (tx - st.pos.x) * follow
    st.pos.y += (ty - st.pos.y) * follow
    st.pos.z += (tz - st.pos.z) * follow

    st.vel.copy(st.pos).sub(st.prevPos).divideScalar(Math.max(dt, 0.001))
    const speed = st.vel.length()

    /* ── Update blob ── */
    const blob = blobRef.current
    const glow = glowRef.current
    if (blob && glow) {
      blob.position.copy(st.pos)
      glow.position.copy(st.pos)

      if (!reduced) {
        blob.rotation.y += dt * 0.5
        blob.rotation.x += dt * 0.2
        glow.rotation.copy(blob.rotation)
      }

      // morph harder when moving fast → more agitated surface
      const morphTarget = 0.16 + Math.min(speed * 0.06, 0.28)
      blobMat.uniforms.uMorph.value += (morphTarget - blobMat.uniforms.uMorph.value) * follow
      glowMat.uniforms.uMorph.value = blobMat.uniforms.uMorph.value

      // breathing scale pulse
      const breathe = 1.0 + Math.sin(wt * 1.8) * 0.035
      const speedScale = 1 + Math.min(speed * 0.015, 0.08)
      const scaleT = breathe * speedScale
      blob.scale.setScalar(blob.scale.x + (scaleT - blob.scale.x) * follow)
      glow.scale.setScalar(blob.scale.x)

      // Dynamic color shifting in real time for both themes
      const dyn = getDynamicPalette(wt, dark, s.active)
      blobMat.uniforms.uCore.value.copy(dyn.core)
      blobMat.uniforms.uRim.value.copy(dyn.rim)
      blobMat.uniforms.uHighlight.value.copy(dyn.glow)
      blobMat.uniforms.uDark.value = dark ? 1.0 : 0.0

      glowMat.uniforms.uColor.value.copy(dyn.rim).lerp(dyn.glow, 0.25)
      glowMat.uniforms.uDark.value = dark ? 1.0 : 0.0

      trailMat.uniforms.uColor.value.copy(dyn.trail)
      trailMat.uniforms.uDark.value = dark ? 1.0 : 0.0

      sparkMat.uniforms.uColor.value.copy(dyn.glow)
      sparkMat.uniforms.uDark.value = dark ? 1.0 : 0.0

      blobMat.uniforms.uTime.value = wt
      glowMat.uniforms.uTime.value = wt
    }

    /* ── Update trail ── */
    const tPos = trailGeo.attributes.position.array
    // initialise all trail points to blob's position on first real frame
    if (!st.trailReady) {
      for (let i = 0; i < TRAIL; i++) {
        tPos[i * 3] = st.pos.x
        tPos[i * 3 + 1] = st.pos.y
        tPos[i * 3 + 2] = st.pos.z
      }
      st.trailReady = true
    }
    // shift positions right by one slot (newest at index 0)
    tPos.copyWithin(3, 0, (TRAIL - 1) * 3)
    tPos[0] = st.pos.x
    tPos[1] = st.pos.y
    tPos[2] = st.pos.z
    trailGeo.attributes.position.needsUpdate = true
    trailMat.uniforms.uPR.value = fState.viewport.dpr

    /* ── Update sparkles (orbiting dots) ── */
    const sPos = sparkGeo.attributes.position.array
    for (let i = 0; i < SPARKS; i++) {
      const angle = wt * (1.0 + i * 0.4) + i * ((Math.PI * 2) / SPARKS)
      const r = 1.15 + i * 0.1
      sPos[i * 3] = st.pos.x + r * Math.cos(angle) * 0.55
      sPos[i * 3 + 1] = st.pos.y + r * Math.sin(angle) * 0.45
      sPos[i * 3 + 2] = st.pos.z + Math.sin(angle * 0.7 + i) * 0.25
    }
    sparkGeo.attributes.position.needsUpdate = true
    sparkMat.uniforms.uTime.value = wt
    sparkMat.uniforms.uPR.value = fState.viewport.dpr
  })

  return (
    <>
      <mesh ref={blobRef} geometry={blobGeo} material={blobMat} />
      <mesh ref={glowRef} geometry={glowGeo} material={glowMat} />
      <points geometry={trailGeo} material={trailMat} frustumCulled={false} />
      <points geometry={sparkGeo} material={sparkMat} frustumCulled={false} />
    </>
  )
}

/* ── Ambient Dust ────────────────────────────────────────────── */

function Dust({ count, dark, reduced }) {
  const colors = useMemo(() => pal(dark), [dark])
  const additive = dark ? THREE.AdditiveBlending : THREE.NormalBlending

  const { geo, mat } = useMemo(() => {
    const rand = rng(777)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 22
      positions[i * 3 + 1] = (rand() - 0.5) * 4
      positions[i * 3 + 2] = (rand() - 0.5) * 4
      sizes[i] = 1.0 + rand() * 2.0
      seeds[i] = rand()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: 1 },
        uColor: { value: colors.dust },
        uAlpha: { value: dark ? 0.35 : 0.2 },
      },
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      transparent: true,
      depthWrite: false,
      blending: additive,
    })
    return { geo: g, mat: m }
  }, [count, colors, dark, additive])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((s, delta) => {
    if (!reduced) {
      mat.uniforms.uTime.value += Math.min(delta, 0.05)
      mat.uniforms.uPR.value = s.viewport.dpr
    }
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}

/* ── Export ───────────────────────────────────────────────────── */

export default function VectorField({ mobile, onReady, dark }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const dustCount = mobile ? 100 : 200

  return (
    <Canvas
      frameloop={reduced ? 'demand' : 'always'}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 8], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        onReady?.()
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Creature mobile={mobile} reduced={reduced} dark={dark} />
      <Dust count={dustCount} dark={dark} reduced={reduced} />
    </Canvas>
  )
}
