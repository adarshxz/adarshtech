/*
  Generated cover art. The projects have no published screenshots, so each cover
  is drawn from what the project actually does (see src/data/projects.js).
*/

const rand = (() => {
  let a = 77
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0
    return a / 4294967296
  }
})()

// fixed scatter for the RAG cover, generated once
const scatter = Array.from({ length: 54 }, () => ({
  x: 250 + rand() * 210,
  y: 70 + rand() * 260,
  r: 1.4 + rand() * 1.6,
}))
const query = { x: 358, y: 196 }
const nearest = [...scatter]
  .sort((a, b) => Math.hypot(a.x - query.x, a.y - query.y) - Math.hypot(b.x - query.x, b.y - query.y))
  .slice(0, 5)

function Frame({ children, label }) {
  return (
    <svg
      className="art"
      viewBox="0 0 640 400"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="art-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="color-mix(in srgb, var(--fg) 5%, transparent)" />
        </pattern>
      </defs>
      <rect width="640" height="400" fill="var(--ink-2)" />
      <rect width="640" height="400" fill="url(#art-grid)" />
      {children}
    </svg>
  )
}

const stroke = 'color-mix(in srgb, var(--fg) 34%, transparent)'
const faint = 'color-mix(in srgb, var(--fg) 16%, transparent)'
const text = { fontFamily: 'var(--mono)', fontSize: 10, fill: 'color-mix(in srgb, var(--fg) 60%, transparent)' }

function RagArt() {
  return (
    <Frame label="Documents flowing into a vector store, with a query matching its nearest chunks to an answer">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${44 + i * 10} ${92 + i * 26})`}>
          <rect width="104" height="132" rx="4" fill="var(--ink-3)" stroke={stroke} />
          <path d="M14 26h60M14 42h76M14 58h68M14 74h74M14 90h46" stroke={faint} strokeWidth="2" />
        </g>
      ))}
      <text x="44" y="304" {...text}>pdf chunks</text>
      <path d="M174 196h58" stroke={stroke} strokeDasharray="3 4" />

      {scatter.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="color-mix(in srgb, var(--fg) 50%, transparent)" />
      ))}
      {nearest.map((p, i) => (
        <g key={i}>
          <line x1={query.x} y1={query.y} x2={p.x} y2={p.y} stroke="var(--ion)" strokeOpacity="0.7" />
          <circle cx={p.x} cy={p.y} r={p.r + 2.4} fill="var(--ion)" />
        </g>
      ))}
      <circle cx={query.x} cy={query.y} r="22" fill="none" stroke="var(--ion)" strokeOpacity="0.5" />
      <circle cx={query.x} cy={query.y} r="5" fill="none" stroke="var(--ion)" strokeWidth="1.5" />
      <text x="250" y="352" {...text}>vector store</text>

      <path d="M470 196h38" stroke={stroke} strokeDasharray="3 4" />
      <g transform="translate(512 132)">
        <rect width="92" height="128" rx="6" fill="var(--ink-3)" stroke="var(--ion)" strokeOpacity="0.6" />
        <path d="M14 28h64M14 44h56M14 60h64M14 76h40" stroke={faint} strokeWidth="2" />
        <path d="M14 98h34" stroke="var(--ion)" strokeWidth="2" />
      </g>
      <text x="512" y="282" {...text}>answer</text>
    </Frame>
  )
}

function PapersArt() {
  const rows = ['Mathematics 1', 'Engineering Physics', 'Engineering Chemistry', 'Basic Computer Engineering', 'Fundamentals of AI & ML']
  return (
    <Frame label="A subject list of previous-year question papers with mid-term and final-term tabs">
      <g transform="translate(60 52)">
        <rect width="520" height="296" rx="8" fill="var(--ink-3)" stroke={stroke} />
        <rect x="18" y="16" width="484" height="30" rx="15" fill="none" stroke={faint} />
        <circle cx="38" cy="31" r="5" fill="none" stroke={stroke} />
        <text x="54" y="35" {...text}>search subjects</text>
        {['mid-term', 'final-term'].map((t, i) => (
          <g key={t} transform={`translate(${18 + i * 96} 62)`}>
            <rect width="88" height="24" rx="12" fill={i === 0 ? 'var(--ion)' : 'none'} stroke={i === 0 ? 'var(--ion)' : stroke} />
            <text x="44" y="16" textAnchor="middle" style={{ ...text, fill: i === 0 ? 'var(--ink)' : text.fill }}>{t}</text>
          </g>
        ))}
        {rows.map((r, i) => (
          <g key={r} transform={`translate(18 ${102 + i * 36})`}>
            <rect width="484" height="30" rx="5" fill={i === 1 ? 'var(--ion-dim)' : 'color-mix(in srgb, var(--fg) 4%, transparent)'} stroke={i === 1 ? 'var(--ion)' : 'none'} strokeOpacity="0.5" />
            <rect x="10" y="6" width="14" height="18" rx="2" fill="none" stroke={i === 1 ? 'var(--ion)' : stroke} />
            <text x="36" y="19" {...text}>{r}</text>
            <text x="470" y="19" textAnchor="end" style={{ ...text, fill: i === 1 ? 'var(--ion)' : text.fill }}>PDF</text>
          </g>
        ))}
      </g>
    </Frame>
  )
}

function CommerceArt() {
  const tiles = [0, 1, 2, 3, 4, 5]
  return (
    <Frame label="A storefront grid of products beside an admin panel with an order chart">
      {tiles.map((i) => {
        const x = 44 + (i % 3) * 124
        const y = 56 + Math.floor(i / 3) * 150
        const on = i === 1
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect
              width="108"
              height="134"
              rx="5"
              fill="var(--ink-3)"
              stroke={on ? 'var(--ion)' : stroke}
              strokeOpacity={on ? 0.9 : 1}
            />
            <rect x="10" y="10" width="88" height="68" rx="3" fill="color-mix(in srgb, var(--fg) 6%, transparent)" />
            <circle cx="54" cy="44" r="16" fill="none" stroke={on ? 'var(--ion)' : faint} strokeWidth="2" />
            <path d="M12 96h58M12 110h30" stroke={faint} strokeWidth="2" />
            {on && <rect x="68" y="104" width="30" height="14" rx="7" fill="var(--ion)" />}
          </g>
        )
      })}
      <g transform="translate(436 56)">
        <rect width="164" height="284" rx="6" fill="var(--ink-3)" stroke={stroke} />
        <text x="14" y="26" {...text}>admin</text>
        {[44, 70, 38, 92, 64, 112].map((h, i) => (
          <rect
            key={i}
            x={16 + i * 23}
            y={150 - h}
            width="14"
            height={h}
            rx="2"
            fill={i === 5 ? 'var(--ion)' : 'color-mix(in srgb, var(--fg) 22%, transparent)'}
          />
        ))}
        <path d="M14 166h136" stroke={faint} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(14 ${186 + i * 30})`}>
            <rect width="136" height="20" rx="3" fill="color-mix(in srgb, var(--fg) 5%, transparent)" />
            <path d="M8 10h46M96 10h30" stroke={faint} strokeWidth="2" />
          </g>
        ))}
      </g>
    </Frame>
  )
}

function ScoutArt() {
  const steps = ['resume parsing', 'github analysis', 'job matching']
  return (
    <Frame label="A resume flowing through parsing, GitHub analysis and job matching into an AI career coach chat">
      <g transform="translate(40 76)">
        <rect width="116" height="178" rx="5" fill="var(--bone)" fillOpacity="0.94" />
        <rect x="14" y="16" width="62" height="9" rx="2" fill="var(--ink)" />
        <g stroke="rgba(10,11,13,0.22)" strokeWidth="3">
          <path d="M14 46h88M14 60h80M14 74h88M14 88h58M14 112h88M14 126h70M14 140h84" />
        </g>
        <rect x="14" y="98" width="52" height="4" fill="var(--ion)" />
      </g>
      <text x="40" y="280" {...text}>resume</text>
      <path d="M170 165h34" stroke={stroke} strokeDasharray="3 4" />

      {steps.map((s, i) => (
        <g key={s} transform={`translate(214 ${78 + i * 66})`}>
          <rect width="176" height="52" rx="5" fill="var(--ink-3)" stroke={i === 1 ? 'var(--ion)' : stroke} strokeOpacity={i === 1 ? 0.8 : 1} />
          <circle cx="24" cy="26" r="8" fill="none" stroke={i === 1 ? 'var(--ion)' : faint} strokeWidth="2" />
          <text x="44" y="30" {...text}>{s}</text>
        </g>
      ))}
      <path d="M398 165h34" stroke={stroke} strokeDasharray="3 4" />

      <g transform="translate(440 76)">
        <rect width="164" height="196" rx="6" fill="var(--ink-3)" stroke={stroke} />
        <text x="14" y="26" {...text}>career coach</text>
        <rect x="14" y="44" width="104" height="30" rx="8" fill="color-mix(in srgb, var(--fg) 8%, transparent)" />
        <path d="M24 59h72" stroke={faint} strokeWidth="2" />
        <rect x="42" y="88" width="108" height="44" rx="8" fill="var(--ion)" fillOpacity="0.16" stroke="var(--ion)" strokeOpacity="0.6" />
        <path d="M54 104h82M54 118h54" stroke="var(--ion)" strokeWidth="2" />
        <rect x="14" y="146" width="136" height="30" rx="15" fill="none" stroke={faint} />
      </g>
    </Frame>
  )
}

function HealthArt() {
  const states = ['home care', 'doctor visit', 'emergency']
  return (
    <Frame label="Spoken symptoms triaged into home care, doctor visit or emergency, with a facility map and medicine adherence">
      <g transform="translate(40 60)">
        <rect width="150" height="64" rx="10" fill="color-mix(in srgb, var(--fg) 8%, transparent)" stroke={stroke} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x={16 + i * 11} y={32 - [6, 12, 8, 16, 10, 18, 7, 13, 6][i] / 2} width="4" height={[6, 12, 8, 16, 10, 18, 7, 13, 6][i]} rx="2" fill="color-mix(in srgb, var(--fg) 55%, transparent)" />
        ))}
        <text x="0" y="86" {...text}>symptoms, 30+ languages</text>
      </g>

      <path d="M120 190v30" stroke={stroke} strokeDasharray="3 4" />
      <g transform="translate(40 232)">
        {states.map((s, i) => (
          <g key={s} transform={`translate(${i * 0} ${i * 42})`}>
            <rect width="150" height="32" rx="16" fill={i === 1 ? 'var(--ion)' : 'none'} stroke={i === 1 ? 'var(--ion)' : stroke} />
            <text x="75" y="20" textAnchor="middle" style={{ ...text, fill: i === 1 ? 'var(--ink)' : text.fill }}>{s}</text>
          </g>
        ))}
      </g>

      <g transform="translate(236 60)">
        <rect width="236" height="250" rx="6" fill="var(--ink-3)" stroke={stroke} />
        <path d="M0 62h236M0 124h236M0 186h236M59 0v250M118 0v250M177 0v250" stroke={faint} />
        <path d="M18 220C70 170 100 190 140 120S200 70 222 36" fill="none" stroke={stroke} strokeWidth="3" />
        {[[70, 168], [168, 92], [190, 196], [48, 82]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="color-mix(in srgb, var(--fg) 55%, transparent)" />
        ))}
        <g transform="translate(118 112)">
          <path d="M0 -20c-11 0-18 8-18 17 0 12 18 28 18 28s18-16 18-28c0-9-7-17-18-17z" fill="var(--ion)" />
          <circle cx="0" cy="-3" r="6" fill="var(--ink)" />
        </g>
        <text x="14" y="236" {...text}>nearby facilities</text>
      </g>

      <g transform="translate(494 60)">
        <rect width="110" height="250" rx="6" fill="var(--ink-3)" stroke={stroke} />
        <text x="14" y="26" {...text}>medicines</text>
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(14 ${54 + r * 62})`}>
            <path d="M0 0h54" stroke={faint} strokeWidth="2" />
            {[0, 1, 2, 3, 4].map((c) => (
              <circle key={c} cx={6 + c * 18} cy="26" r="6" fill={c < 4 - r ? 'var(--ion)' : 'none'} stroke={c < 4 - r ? 'var(--ion)' : faint} />
            ))}
          </g>
        ))}
        <text x="14" y="236" {...text}>adherence</text>
      </g>
    </Frame>
  )
}

function InvoiceArt() {
  const lineItems = [
    { desc: 'Cloud API Compute', amt: '$120.00' },
    { desc: 'Vector Storage Cluster', amt: '$48.50' },
    { desc: 'Document OCR Parser', amt: '$85.00' },
  ]
  return (
    <Frame label="An invoice document being scanned and extracted into structured JSON key-value data">
      {/* Invoice Document on left */}
      <g transform="translate(48 52)">
        <rect width="240" height="296" rx="6" fill="var(--ink-3)" stroke={stroke} />
        {/* Invoice Header */}
        <text x="20" y="32" {...text} style={{ ...text, fontSize: 12, fill: 'var(--fg)', fontWeight: 600 }}>INVOICE</text>
        <rect x="180" y="20" width="40" height="14" rx="3" fill="var(--ion-dim)" stroke="var(--ion)" strokeOpacity="0.7" />
        <text x="200" y="31" textAnchor="middle" style={{ ...text, fontSize: 8, fill: 'var(--ion)' }}>#0482</text>
        
        {/* Vendor & Bill To */}
        <path d="M20 54h60M20 66h90M20 78h45" stroke={faint} strokeWidth="2" />
        <path d="M140 54h70M140 66h50" stroke={faint} strokeWidth="2" />

        {/* Divider */}
        <line x1="20" y1="96" x2="220" y2="96" stroke={stroke} strokeDasharray="3 3" />

        {/* Table Rows */}
        <text x="20" y="116" {...text}>ITEM</text>
        <text x="220" y="116" textAnchor="end" {...text}>TOTAL</text>
        {lineItems.map((item, i) => (
          <g key={i} transform={`translate(20 ${126 + i * 36})`}>
            <rect width="200" height="26" rx="4" fill="color-mix(in srgb, var(--fg) 4%, transparent)" />
            <text x="10" y="17" {...text}>{item.desc}</text>
            <text x="190" y="17" textAnchor="end" style={{ ...text, fill: 'var(--fg)' }}>{item.amt}</text>
          </g>
        ))}

        {/* Total block */}
        <line x1="20" y1="246" x2="220" y2="246" stroke={stroke} />
        <rect x="130" y="254" width="90" height="24" rx="4" fill="var(--ion-dim)" stroke="var(--ion)" />
        <text x="140" y="270" style={{ ...text, fill: 'var(--ion)', fontWeight: 600 }}>$253.50</text>
      </g>

      {/* Optical processing beam / parser flow in center */}
      <g transform="translate(300 180)">
        <path d="M0 20h44" stroke="var(--ion)" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="44,16 52,20 44,24" fill="var(--ion)" />
        <circle cx="22" cy="20" r="14" fill="var(--ink-2)" stroke="var(--ion)" strokeOpacity="0.8" />
        <text x="22" y="24" textAnchor="middle" style={{ ...text, fontSize: 9, fill: 'var(--ion)', fontWeight: 700 }}>AI</text>
      </g>

      {/* Extracted Structured Metadata on right */}
      <g transform="translate(360 52)">
        <rect width="232" height="296" rx="8" fill="var(--ink-3)" stroke="var(--ion)" strokeOpacity="0.6" />
        <text x="18" y="28" {...text} style={{ ...text, fill: 'var(--ion)', fontWeight: 600 }}>EXTRACTED METADATA</text>

        {/* Key-Value fields */}
        {[
          { k: 'vendor', v: 'Acme Cloud Corp' },
          { k: 'invoice_id', v: 'INV-2026-0482' },
          { k: 'date', v: '2026-03-15' },
          { k: 'tax_amount', v: '$18.50' },
          { k: 'total_due', v: '$253.50' },
        ].map((field, idx) => (
          <g key={idx} transform={`translate(18 ${44 + idx * 48})`}>
            <text x="0" y="12" {...text} style={{ ...text, fontSize: 9, fill: 'color-mix(in srgb, var(--fg) 50%, transparent)' }}>{field.k}</text>
            <rect y="18" width="196" height="24" rx="4" fill="color-mix(in srgb, var(--fg) 5%, transparent)" stroke={stroke} />
            <text x="10" y="34" style={{ ...text, fontSize: 10, fill: field.k === 'total_due' ? 'var(--ion)' : 'var(--fg)' }}>{field.v}</text>
          </g>
        ))}
      </g>
    </Frame>
  )
}

function EtaArt() {
  const waypoints = [
    { x: 90, y: 280, label: 'ORIGIN' },
    { x: 210, y: 220, label: 'WP-1' },
    { x: 330, y: 250, label: 'WP-2' },
    { x: 440, y: 140, label: 'WP-3' },
    { x: 550, y: 90, label: 'DEST' },
  ]

  return (
    <Frame label="Real-time map simulation showing vehicle transit route, waypoints, and ETA calculation HUD">
      {/* Background road network lines */}
      <path d="M40 180h560M80 60v280M260 60v280M440 60v280M40 310h560" stroke={faint} strokeWidth="1" strokeDasharray="6 6" />

      {/* Route pulse/glow underlay */}
      <path
        d="M90 280 C 150 280, 160 220, 210 220 C 270 220, 280 250, 330 250 C 390 250, 390 140, 440 140 C 490 140, 500 90, 550 90"
        fill="none"
        stroke="var(--ion)"
        strokeWidth="10"
        strokeOpacity="0.18"
        strokeLinecap="round"
      />

      {/* Main route path curve */}
      <path
        d="M90 280 C 150 280, 160 220, 210 220 C 270 220, 280 250, 330 250 C 390 250, 390 140, 440 140 C 490 140, 500 90, 550 90"
        fill="none"
        stroke="var(--ion)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Waypoints */}
      {waypoints.map((wp, i) => (
        <g key={i} transform={`translate(${wp.x} ${wp.y})`}>
          <circle r={i === 0 || i === waypoints.length - 1 ? 9 : 6} fill="var(--ink-2)" stroke="var(--ion)" strokeWidth="2.5" />
          <circle r={i === 0 || i === waypoints.length - 1 ? 4 : 2} fill="var(--ion)" />
          <text y={i % 2 === 0 ? 24 : -14} textAnchor="middle" {...text} style={{ ...text, fontSize: 9, fill: 'var(--fg)', fontWeight: 600 }}>
            {wp.label}
          </text>
        </g>
      ))}

      {/* Vehicle position beacon along the path */}
      <g transform="translate(330 250)">
        <circle r="18" fill="none" stroke="var(--ion)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        <circle r="28" fill="var(--ion)" opacity="0.08" />
        <circle r="5" fill="var(--ion)" />
      </g>

      {/* Top HUD: ETA Telemetry Card */}
      <g transform="translate(60 36)">
        <rect width="520" height="42" rx="8" fill="var(--ink-3)" stroke="var(--ion)" strokeOpacity="0.5" />
        <g transform="translate(24 26)">
          <text x="0" y="0" {...text} style={{ ...text, fontSize: 8 }}>STATUS</text>
          <text x="56" y="0" style={{ ...text, fontSize: 10, fill: 'var(--ion)', fontWeight: 700 }}>ACTIVE ROUTE</text>
          
          <text x="170" y="0" {...text} style={{ ...text, fontSize: 8 }}>ESTIMATED TIME</text>
          <text x="270" y="0" style={{ ...text, fontSize: 11, fill: 'var(--fg)', fontWeight: 700 }}>14m 32s</text>
          
          <text x="350" y="0" {...text} style={{ ...text, fontSize: 8 }}>REMAINING</text>
          <text x="420" y="0" style={{ ...text, fontSize: 11, fill: 'var(--fg)', fontWeight: 700 }}>6.8 km</text>
        </g>
      </g>

      {/* Bottom Floating Stats Pill */}
      <g transform="translate(210 324)">
        <rect width="220" height="34" rx="17" fill="var(--ink-3)" stroke={stroke} />
        <circle cx="20" cy="17" r="4" fill="var(--ion)" />
        <text x="32" y="21" {...text} style={{ ...text, fontSize: 9, fill: 'var(--fg)' }}>AVG SPEED: 48 km/h</text>
        <line x1="140" y1="8" x2="140" y2="26" stroke={faint} />
        <text x="154" y="21" {...text} style={{ ...text, fontSize: 9, fill: 'var(--ion)', fontWeight: 600 }}>OPTIMAL</text>
      </g>
    </Frame>
  )
}

function KisanArt() {
  return (
    <Frame label="Crop disease scanner with computer vision leaf diagnostic bounding box and health advisory card">
      {/* Plant scan viewfinder on left */}
      <g transform="translate(48 52)">
        <rect width="256" height="296" rx="8" fill="var(--ink-3)" stroke={stroke} />
        {/* Leaf stylized silhouette */}
        <path
          d="M128 260 C70 210, 50 140, 128 50 C206 140, 186 210, 128 260 Z"
          fill="color-mix(in srgb, var(--ion) 12%, transparent)"
          stroke="var(--ion)"
          strokeWidth="2"
        />
        <path d="M128 60 v190" stroke="var(--ion)" strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M128 100 Q150 120 170 130M128 140 Q160 160 180 175M128 180 Q150 195 165 205" stroke="var(--ion)" strokeOpacity="0.3" strokeWidth="1" />
        <path d="M128 100 Q106 120 86 130M128 140 Q96 160 76 175M128 180 Q106 195 91 205" stroke="var(--ion)" strokeOpacity="0.3" strokeWidth="1" />

        {/* Diagnostic Bounding Reticle */}
        <g transform="translate(100 115)">
          <rect width="70" height="70" rx="4" fill="none" stroke="var(--ion)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M-4 0h8M0 -4v8M74 0h-8M70 -4v8M-4 70h8M0 74v-8M74 70h-8M70 74v-8" stroke="var(--ion)" strokeWidth="2" />
          <circle cx="35" cy="35" r="18" fill="var(--ion)" fillOpacity="0.15" />
          <rect x="-10" y="-18" width="90" height="15" rx="3" fill="var(--ion)" />
          <text x="35" y="-7" textAnchor="middle" style={{ ...text, fontSize: 8, fill: 'var(--ink-2)', fontWeight: 700 }}>98.6% DETECTED</text>
        </g>

        <text x="18" y="28" {...text}>CV SCANNER</text>
        <circle cx="236" cy="24" r="4" fill="var(--ion)" />
      </g>

      {/* Center scan beam arrow */}
      <g transform="translate(310 190)">
        <path d="M0 10h40" stroke="var(--ion)" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="40,6 48,10 40,14" fill="var(--ion)" />
      </g>

      {/* Advisory & Soil Telemetry Card on right */}
      <g transform="translate(360 52)">
        <rect width="232" height="296" rx="8" fill="var(--ink-3)" stroke="var(--ion)" strokeOpacity="0.5" />
        <text x="18" y="28" {...text} style={{ ...text, fill: 'var(--ion)', fontWeight: 600 }}>CROP HEALTH REPORT</text>

        {/* Diagnosis Status */}
        <g transform="translate(18 42)">
          <rect width="196" height="48" rx="6" fill="color-mix(in srgb, var(--fg) 5%, transparent)" stroke={stroke} />
          <text x="12" y="20" {...text} style={{ ...text, fontSize: 8 }}>DIAGNOSIS</text>
          <text x="12" y="38" style={{ ...text, fontSize: 11, fill: 'var(--fg)', fontWeight: 700 }}>Early Leaf Blight</text>
          <rect x="136" y="14" width="48" height="20" rx="10" fill="var(--ion-dim)" stroke="var(--ion)" />
          <text x="160" y="28" textAnchor="middle" style={{ ...text, fontSize: 8, fill: 'var(--ion)', fontWeight: 700 }}>ACTION</text>
        </g>

        {/* Treatment Recommendation */}
        <g transform="translate(18 100)">
          <text x="0" y="12" {...text} style={{ ...text, fontSize: 8 }}>TREATMENT PROTOCOL</text>
          <rect y="18" width="196" height="52" rx="6" fill="color-mix(in srgb, var(--fg) 4%, transparent)" stroke={stroke} />
          <text x="10" y="36" style={{ ...text, fontSize: 9, fill: 'var(--fg)' }}>Copper Oxychloride 50 WP</text>
          <text x="10" y="54" style={{ ...text, fontSize: 8, fill: 'color-mix(in srgb, var(--fg) 60%, transparent)' }}>Dosage: 2.5g / Litre</text>
        </g>

        {/* Soil & Sensor Telemetry Grid */}
        <g transform="translate(18 184)">
          <text x="0" y="10" {...text} style={{ ...text, fontSize: 8 }}>SOIL & FIELD SENSORS</text>
          {[
            { l: 'MOISTURE', v: '64%' },
            { l: 'pH LEVEL', v: '6.8' },
            { l: 'NITROGEN', v: 'OPTIMAL' },
            { l: 'HUMIDITY', v: '72%' },
          ].map((s, idx) => (
            <g key={idx} transform={`translate(${(idx % 2) * 102} ${20 + Math.floor(idx / 2) * 36})`}>
              <rect width="94" height="28" rx="4" fill="color-mix(in srgb, var(--fg) 5%, transparent)" stroke={stroke} />
              <text x="8" y="12" style={{ ...text, fontSize: 7 }}>{s.l}</text>
              <text x="8" y="23" style={{ ...text, fontSize: 9, fill: 'var(--fg)', fontWeight: 600 }}>{s.v}</text>
            </g>
          ))}
        </g>
      </g>
    </Frame>
  )
}

function AttendxArt() {
  const students = [
    { name: 'Adarsh S.', status: 'P', time: '09:02 AM' },
    { name: 'Priya K.', status: 'P', time: '09:04 AM' },
    { name: 'Rohan V.', status: 'P', time: '09:07 AM' },
    { name: 'Neha M.', status: 'A', time: 'ABSENT' },
  ]

  return (
    <Frame label="Smart automated attendance management system dashboard with check-in roster and compliance metrics">
      {/* Attendance Roster Grid on left */}
      <g transform="translate(48 52)">
        <rect width="300" height="296" rx="8" fill="var(--ink-3)" stroke={stroke} />
        <text x="20" y="28" {...text} style={{ ...text, fontSize: 11, fill: 'var(--fg)', fontWeight: 600 }}>LIVE CHECK-IN ROSTER</text>
        <circle cx="276" cy="24" r="4" fill="var(--ion)" />
        <line x1="20" y1="42" x2="280" y2="42" stroke={stroke} />

        {/* Student Check-in rows */}
        {students.map((st, i) => (
          <g key={i} transform={`translate(20 ${54 + i * 46})`}>
            <rect width="260" height="36" rx="6" fill="color-mix(in srgb, var(--fg) 4%, transparent)" stroke={st.status === 'P' ? stroke : 'var(--ion)'} strokeOpacity={st.status === 'P' ? 1 : 0.6} />
            <circle cx="20" cy="18" r="10" fill="color-mix(in srgb, var(--fg) 8%, transparent)" />
            <text x="20" y="22" textAnchor="middle" style={{ ...text, fontSize: 8, fill: 'var(--fg)', fontWeight: 600 }}>{st.name[0]}</text>
            <text x="40" y="22" style={{ ...text, fontSize: 10, fill: 'var(--fg)', fontWeight: 500 }}>{st.name}</text>
            <text x="180" y="22" style={{ ...text, fontSize: 9, fill: 'color-mix(in srgb, var(--fg) 50%, transparent)' }}>{st.time}</text>
            <rect x="234" y="9" width="18" height="18" rx="4" fill={st.status === 'P' ? 'var(--ion-dim)' : 'color-mix(in srgb, var(--fg) 10%, transparent)'} stroke={st.status === 'P' ? 'var(--ion)' : stroke} />
            <text x="243" y="22" textAnchor="middle" style={{ ...text, fontSize: 9, fill: st.status === 'P' ? 'var(--ion)' : 'var(--fg)', fontWeight: 700 }}>{st.status}</text>
          </g>
        ))}

        {/* Verification Footer Banner */}
        <g transform="translate(20 248)">
          <rect width="260" height="30" rx="5" fill="var(--ion-dim)" stroke="var(--ion)" strokeOpacity="0.5" />
          <circle cx="16" cy="15" r="4" fill="var(--ion)" />
          <text x="28" y="19" style={{ ...text, fontSize: 9, fill: 'var(--ion)', fontWeight: 600 }}>SESSION ACTIVE • QR / BIOMETRIC SYNCED</text>
        </g>
      </g>

      {/* Analytics Card on right */}
      <g transform="translate(368 52)">
        <rect width="224" height="296" rx="8" fill="var(--ink-3)" stroke="var(--ion)" strokeOpacity="0.5" />
        <text x="18" y="28" {...text} style={{ ...text, fill: 'var(--ion)', fontWeight: 600 }}>ATTENDANCE STATS</text>

        {/* Big Percentage Card */}
        <g transform="translate(18 42)">
          <rect width="188" height="72" rx="6" fill="color-mix(in srgb, var(--fg) 5%, transparent)" stroke={stroke} />
          <text x="14" y="24" {...text} style={{ ...text, fontSize: 8 }}>MONTHLY COMPLIANCE</text>
          <text x="14" y="56" style={{ ...text, fontSize: 26, fill: 'var(--fg)', fontWeight: 700 }}>94.2%</text>
          <circle cx="152" cy="36" r="20" fill="none" stroke={faint} strokeWidth="4" />
          <circle cx="152" cy="36" r="20" fill="none" stroke="var(--ion)" strokeWidth="4" strokeDasharray="100 25" />
        </g>

        {/* Breakdown bars */}
        <g transform="translate(18 132)">
          <text x="0" y="10" {...text} style={{ ...text, fontSize: 8 }}>SESSION SUMMARY</text>
          {[
            { l: 'Present', count: '48 Students', pct: 88, fill: 'var(--ion)' },
            { l: 'Late Check-in', count: '3 Students', pct: 24, fill: 'color-mix(in srgb, var(--fg) 40%, transparent)' },
            { l: 'Unexcused Absent', count: '2 Students', pct: 14, fill: 'color-mix(in srgb, var(--fg) 20%, transparent)' },
          ].map((bar, idx) => (
            <g key={idx} transform={`translate(0 ${22 + idx * 42})`}>
              <text x="0" y="10" style={{ ...text, fontSize: 9, fill: 'var(--fg)' }}>{bar.l}</text>
              <text x="188" y="10" textAnchor="end" style={{ ...text, fontSize: 8 }}>{bar.count}</text>
              <rect y="16" width="188" height="8" rx="4" fill="color-mix(in srgb, var(--fg) 8%, transparent)" />
              <rect y="16" width={bar.pct * 1.88} height="8" rx="4" fill={bar.fill} />
            </g>
          ))}
        </g>
      </g>
    </Frame>
  )
}

const arts = {
  scoutai: ScoutArt,
  healthbuddy: HealthArt,
  'docai-invoice-extractor': InvoiceArt,
  'eta-simulation': EtaArt,
  'kisanshield-ai': KisanArt,
  attendx: AttendxArt,
  'cdgi-bot': RagArt,
  'ecommerce-platform': CommerceArt,
  rapidpapers: PapersArt,
}

export default function ProjectArt({ id, title }) {
  const Art = arts[id]
  if (Art) return <Art />
  return (
    <Frame label={`${title} cover`}>
      <text x="44" y="356" style={{ ...text, fontSize: 14 }}>{title}</text>
    </Frame>
  )
}
