import { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/hooks'
import { useTheme } from '../lib/theme'

/*
  3D Expertise Scene — a spatial composition with a central portrait sphere,
  four floating glass domain cards, glowing connection beams, and ambient particles.
  Mouse parallax drives the entire camera rig for depth perception.
*/

/* ── Domain data ──────────────────────────────────────────────── */

const domains = [
  {
    label: 'Frontend Engineering',
    techs: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vite', 'Framer Motion'],
    color: '#60a5fa',        // dark mode blue
    emissive: '#3b82f6',
    lightColor: '#1d4ed8',   // light mode royal blue
    lightEmissive: '#2563eb',
    position: [-2.4, 1.05, -0.4],
    mobilePos: [-1.4, 1.05, -0.2],
    icon: '◆',
  },
  {
    label: 'Backend Systems',
    techs: ['Django', 'FastAPI', 'Node.js', 'PostgreSQL', 'MongoDB', 'Supabase'],
    color: '#818cf8',        // dark mode indigo
    emissive: '#6366f1',
    lightColor: '#4338ca',   // light mode indigo
    lightEmissive: '#4f46e5',
    position: [2.4, 1.05, -0.6],
    mobilePos: [1.4, 1.05, -0.3],
    icon: '▲',
  },
  {
    label: 'AI & RAG Systems',
    techs: ['LangChain', 'ChromaDB', 'Gemini API', 'RAG', 'AI agents', 'Streamlit'],
    color: '#a78bfa',        // dark mode violet
    emissive: '#8b5cf6',
    lightColor: '#6d28d9',   // light mode violet
    lightEmissive: '#7c3aed',
    position: [-2.4, -1.05, -0.2],
    mobilePos: [-1.4, -0.95, -0.2],
    icon: '●',
  },
  {
    label: 'Data Science & ML',
    techs: ['PyTorch', 'TensorFlow', 'NumPy', 'Pandas', 'Matplotlib', 'Python'],
    color: '#67e8f9',        // dark mode cyan
    emissive: '#22d3ee',
    lightColor: '#0e7490',   // light mode cyan
    lightEmissive: '#0891b2',
    position: [2.4, -1.05, -0.5],
    mobilePos: [1.4, -0.95, -0.3],
    icon: '⬡',
  },
]

/* ── GLSL helpers ─────────────────────────────────────────────── */

const noise3D = /* glsl */ `
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise3(vec3 x) {
    vec3 p = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n), hash(n+1.0), f.x),
                   mix(hash(n+57.0), hash(n+58.0), f.x), f.y),
               mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                   mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z);
  }
`

/* ── Connection beam shaders ──────────────────────────────────── */

const beamVert = /* glsl */ `
  attribute float aProgress;
  uniform float uTime;
  varying float vProgress;
  varying float vFresnel;
  ${noise3D}
  void main() {
    vProgress = aProgress;
    vec3 pos = position;
    // subtle wave along the beam
    float wave = sin(aProgress * 6.2832 * 2.0 + uTime * 3.0) * 0.02;
    pos.y += wave;
    pos.x += wave * 0.5;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    vFresnel = aProgress;
  }
`

const beamFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uDark;
  varying float vProgress;
  void main() {
    // pulse traveling along the beam
    float pulse = sin(vProgress * 12.566 - uTime * 4.0) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.08, vProgress) * smoothstep(1.0, 0.92, vProgress);
    
    if (uDark > 0.5) {
      // Dark mode: additive glowing beam
      float alpha = edge * (0.15 + pulse * 0.25) * uOpacity;
      vec3 col = uColor * (1.0 + pulse * 0.3);
      gl_FragColor = vec4(col, alpha);
    } else {
      // Light mode: clear visible connection line on light background
      float alpha = edge * (0.42 + pulse * 0.35) * uOpacity;
      gl_FragColor = vec4(uColor, alpha);
    }
  }
`

/* ── Particle field shaders ───────────────────────────────────── */

const particleVert = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPR;
  varying float vAlpha;
  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.15;
    pos.y += cos(uTime * 0.25 + aSeed * 30.0) * 0.12;
    pos.z += sin(uTime * 0.2 + aSeed * 50.0) * 0.1;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPR * (4.0 / -mv.z);
    vAlpha = 0.3 + 0.4 * sin(uTime * 0.6 + aSeed * 60.0);
  }
`

const particleFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uDark;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    float alpha = uDark > 0.5 ? soft * vAlpha * 0.45 : soft * vAlpha * 0.22;
    gl_FragColor = vec4(uColor, alpha);
  }
`

/* ── Portrait disc shaders ────────────────────────────────────── */

const portraitVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const portraitFrag = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec3 uRimColor;
  varying vec2 vUv;
  void main() {
    // distance from centre in UV space (circle is 0..1 with centre at 0.5)
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;  // 0 at centre, 1 at edge

    // hard circular clip
    if (r > 1.0) discard;

    // sample the photo — crop to a portrait-friendly square from the centre
    vec2 photoUv = vUv;
    // shift vertically to frame the face (top 15% of the image)
    photoUv.y = photoUv.y * 0.8 + 0.15;

    vec4 tex = texture2D(uTexture, photoUv);

    // edge glow
    float edge = smoothstep(0.75, 1.0, r);
    float breathe = 0.5 + 0.5 * sin(uTime * 1.2);
    vec3 glow = uRimColor * edge * (0.5 + breathe * 0.3);

    // soft anti-aliased edge
    float alpha = smoothstep(1.0, 0.97, r);

    gl_FragColor = vec4(tex.rgb + glow, alpha);
  }
`

/* ── Ring glow shaders ────────────────────────────────────────── */

const ringVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ringFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uDark;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c);
    // ring band
    float ring = smoothstep(0.48, 0.44, r) * smoothstep(0.34, 0.38, r);
    // rotating shimmer
    float angle = atan(c.y, c.x);
    float shimmer = sin(angle * 3.0 + uTime * 2.0) * 0.5 + 0.5;
    
    if (uDark > 0.5) {
      // Dark mode: shimmering additive outer glow
      float alpha = ring * (0.15 + shimmer * 0.12);
      float outerGlow = smoothstep(0.5, 0.3, r) * 0.06;
      gl_FragColor = vec4(uColor, alpha + outerGlow);
    } else {
      // Light mode: clean, crisp sapphire ring without milky additive wash
      float alpha = ring * (0.24 + shimmer * 0.14);
      gl_FragColor = vec4(uColor, alpha);
    }
  }
`

/* ── Connection beam component ────────────────────────────────── */

function ConnectionBeam({ start, end, color, time, dark }) {
  const geo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) * 0.5,
        (start[1] + end[1]) * 0.5 + 0.3,
        (start[2] + end[2]) * 0.5 + 0.8,
      ),
      new THREE.Vector3(...end),
    )
    const pts = curve.getPoints(48)
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    const prog = new Float32Array(49)
    for (let i = 0; i < 49; i++) prog[i] = i / 48
    g.setAttribute('aProgress', new THREE.BufferAttribute(prog, 1))
    return g
  }, [start[0], start[1], start[2], end[0], end[1], end[2]])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uDark: { value: dark ? 1.0 : 0.0 },
        },
        vertexShader: beamVert,
        fragmentShader: beamFrag,
        transparent: true,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      }),
    [color, dark],
  )

  useFrame(() => {
    mat.uniforms.uTime.value = time.current
  })

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return <line geometry={geo} material={mat} />
}

/* ── Glass domain card ────────────────────────────────────────── */

function DomainCard({ domain, index, mobile, time, hoveredRef, reduced, dark }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const pos = mobile ? domain.mobilePos : domain.position

  const activeColor = dark ? domain.color : domain.lightColor
  const activeEmissive = dark ? domain.emissive : domain.lightEmissive

  useFrame(() => {
    if (!groupRef.current) return
    const t = time.current
    if (!reduced) {
      groupRef.current.position.y = pos[1] + Math.sin(t * 0.7 + index * 1.5) * 0.05
    }
    const targetZ = hovered ? pos[2] + 0.5 : pos[2]
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.1
  })

  const onPointerEnter = useCallback(() => {
    setHovered(true)
    hoveredRef.current = index
  }, [hoveredRef, index])

  const onPointerLeave = useCallback(() => {
    setHovered(false)
    if (hoveredRef.current === index) hoveredRef.current = -1
  }, [hoveredRef, index])

  return (
    <group ref={groupRef} position={pos}>
      {/* 3D Glowing node at the connection beam anchor */}
      <mesh position={[0, 0, -0.05]}>
        <octahedronGeometry args={[mobile ? 0.06 : 0.08, 0]} />
        <meshBasicMaterial
          color={activeEmissive}
          transparent
          opacity={dark ? (hovered ? 0.9 : 0.5) : (hovered ? 0.8 : 0.35)}
          wireframe
        />
      </mesh>

      {/* Futuristic Glass Card */}
      <Html
        position={[0, 0, 0]}
        center
        distanceFactor={6}
        style={{
          userSelect: 'none',
          pointerEvents: 'auto',
          width: mobile ? '135px' : '175px',
        }}
      >
        <div
          onMouseEnter={onPointerEnter}
          onMouseLeave={onPointerLeave}
          style={{
            background: dark
              ? (hovered
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(12, 16, 32, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(8, 11, 24, 0.78) 100%)')
              : (hovered
                  ? 'rgba(255, 255, 255, 0.96)'
                  : 'rgba(255, 255, 255, 0.88)'),
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: dark
              ? `1px solid ${hovered ? domain.color : `${domain.emissive}40`}`
              : `1px solid ${hovered ? activeColor : 'rgba(21, 22, 27, 0.12)'}`,
            borderRadius: '10px',
            padding: mobile ? '6px 8px' : '8px 12px',
            boxShadow: dark
              ? (hovered
                  ? `0 10px 28px -4px ${domain.emissive}55, inset 0 0 16px ${domain.emissive}22`
                  : `0 4px 18px -2px rgba(0, 0, 0, 0.6), inset 0 0 8px ${domain.emissive}12`)
              : (hovered
                  ? `0 12px 28px -4px rgba(21, 22, 27, 0.14), 0 0 0 1px ${activeColor}33, 0 0 16px ${activeEmissive}22`
                  : '0 4px 16px -2px rgba(21, 22, 27, 0.07), 0 1px 3px rgba(21, 22, 27, 0.04)'),
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {/* Header with icon and label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '5px',
            }}
          >
            <span
              style={{
                fontSize: mobile ? '8px' : '10px',
                color: activeColor,
                opacity: dark ? 0.85 : 1,
              }}
            >
              {domain.icon}
            </span>
            <div
              style={{
                fontSize: mobile ? '9px' : '11px',
                fontWeight: dark ? 600 : 650,
                color: dark ? '#ffffff' : '#131419',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textShadow: dark ? (hovered ? `0 0 10px ${domain.emissive}` : 'none') : 'none',
                transition: 'text-shadow 0.3s ease, color 0.2s ease',
              }}
            >
              {domain.label}
            </div>
          </div>

          {/* Associated technology chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.3s ease',
            }}
          >
            {(hovered ? domain.techs : domain.techs.slice(0, 3)).map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: mobile ? '7px' : '8px',
                  padding: '1.5px 5px',
                  borderRadius: '4px',
                  background: dark
                    ? (hovered ? `${domain.emissive}33` : `${domain.emissive}18`)
                    : (hovered ? `${activeEmissive}16` : 'rgba(21, 22, 27, 0.05)'),
                  border: dark
                    ? `1px solid ${hovered ? domain.emissive : `${domain.emissive}33`}`
                    : `1px solid ${hovered ? activeEmissive + '55' : 'rgba(21, 22, 27, 0.09)'}`,
                  color: dark
                    ? (hovered ? '#ffffff' : domain.color)
                    : (hovered ? activeColor : '#3b3c43'),
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ── Central portrait disc ────────────────────────────────────── */

function PortraitSphere({ mobile, time, reduced, dark }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const texture = useTexture('/images/image.webp')
  const radius = mobile ? 0.5 : 0.65

  // Flat circle facing the camera
  const geo = useMemo(() => new THREE.CircleGeometry(radius, 64), [radius])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uRimColor: { value: new THREE.Color(dark ? '#818cf8' : '#243fe0') },
        },
        vertexShader: portraitVert,
        fragmentShader: portraitFrag,
        transparent: true,
      }),
    [texture, dark],
  )

  const ringGeo = useMemo(() => new THREE.PlaneGeometry(radius * 3.2, radius * 3.2), [radius])
  const ringMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(dark ? '#6366f1' : '#243fe0') },
          uDark: { value: dark ? 1.0 : 0.0 },
        },
        vertexShader: ringVert,
        fragmentShader: ringFrag,
        transparent: true,
        depthWrite: false,
        blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
        side: THREE.DoubleSide,
      }),
    [dark],
  )

  useFrame(() => {
    const t = time.current
    mat.uniforms.uTime.value = t
    ringMat.uniforms.uTime.value = t
    if (meshRef.current && !reduced) {
      meshRef.current.position.y = Math.sin(t * 0.8) * 0.03
    }
    if (ringRef.current && !reduced) {
      ringRef.current.rotation.z = t * 0.1
    }
  })

  useEffect(() => () => {
    geo.dispose(); mat.dispose(); ringGeo.dispose(); ringMat.dispose()
  }, [geo, mat, ringGeo, ringMat])

  return (
    <group>
      <mesh ref={meshRef} geometry={geo} material={mat} />
      <mesh ref={ringRef} geometry={ringGeo} material={ringMat} position={[0, 0, -0.1]} />
    </group>
  )
}

/* ── Ambient particles ────────────────────────────────────────── */

function AmbientParticles({ count, time, reduced, dark }) {
  const { geo, mat } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1
      sizes[i] = 1.0 + Math.random() * 2.0
      seeds[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPR: { value: 1 },
        uColor: { value: new THREE.Color(dark ? '#4a5080' : '#8896b8') },
        uDark: { value: dark ? 1.0 : 0.0 },
      },
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthWrite: false,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending,
    })
    return { geo: g, mat: m }
  }, [count, dark])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame((state) => {
    if (!reduced) {
      mat.uniforms.uTime.value = time.current
      mat.uniforms.uPR.value = state.viewport.dpr
    }
  })

  return <points geometry={geo} material={mat} frustumCulled={false} />
}

/* ── Camera rig with mouse parallax ───────────────────────────── */

function CameraRig({ reduced }) {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const smoothed = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(() => {
    if (reduced) return
    const lerp = 0.03
    smoothed.current.x += (mouse.current.x - smoothed.current.x) * lerp
    smoothed.current.y += (mouse.current.y - smoothed.current.y) * lerp
    camera.position.x = smoothed.current.x * 0.4
    camera.position.y = smoothed.current.y * 0.25
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ── Scene content ────────────────────────────────────────────── */

function SceneContent({ mobile, reduced, dark }) {
  const time = useRef(0)
  const hoveredRef = useRef(-1)

  useFrame((_, delta) => {
    if (!reduced) time.current += Math.min(delta, 0.05)
  })

  const center = [0, 0, 0]

  return (
    <>
      <CameraRig reduced={reduced} />

      {/* Subtle ambient + directional lighting for MeshPhysicalMaterial */}
      <ambientLight intensity={dark ? 0.3 : 0.6} />
      <directionalLight position={[3, 3, 5]} intensity={dark ? 0.5 : 0.7} color="#c7d2fe" />
      <pointLight position={[-3, -2, 3]} intensity={dark ? 0.3 : 0.4} color={dark ? '#818cf8' : '#2563eb'} />
      <pointLight position={[2, 2, 2]} intensity={dark ? 0.2 : 0.3} color={dark ? '#67e8f9' : '#0891b2'} />

      {/* Central portrait */}
      <PortraitSphere mobile={mobile} time={time} reduced={reduced} dark={dark} />

      {/* Connection beams from center to each domain */}
      {domains.map((d, i) => {
        const pos = mobile ? d.mobilePos : d.position
        return (
          <ConnectionBeam
            key={d.label}
            start={center}
            end={pos}
            color={dark ? d.emissive : d.lightEmissive}
            time={time}
            dark={dark}
          />
        )
      })}

      {/* Floating domain cards */}
      {domains.map((d, i) => (
        <DomainCard
          key={d.label}
          domain={d}
          index={i}
          mobile={mobile}
          time={time}
          hoveredRef={hoveredRef}
          reduced={reduced}
          dark={dark}
        />
      ))}

      {/* Ambient particles */}
      <AmbientParticles count={mobile ? 60 : 120} time={time} reduced={reduced} dark={dark} />
    </>
  )
}

/* ── Exported canvas wrapper ──────────────────────────────────── */

export default function ExpertiseScene({ mobile, dark: propDark }) {
  const themeContext = useTheme()
  const dark = propDark ?? themeContext?.isDark ?? true
  const reduced = useMemo(() => prefersReducedMotion(), [])

  return (
    <Canvas
      frameloop={reduced ? 'demand' : 'always'}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = dark ? 1.2 : 1.05
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <SceneContent mobile={mobile} reduced={reduced} dark={dark} />
      </Suspense>
    </Canvas>
  )
}
