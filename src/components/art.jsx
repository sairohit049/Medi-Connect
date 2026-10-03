import React, { useId } from "react";

/* ------------------------------------------------------------------
   Illustration kit. Everything is inline SVG, so there are no image
   files to download and nothing that can fail to load.
------------------------------------------------------------------- */

export const PALETTE = {
  ink: "#0b2b2e",
  teal: "#0d9488",
  tealDark: "#0f766e",
  tealSoft: "#d7f3ef",
  mint: "#eef5f5",
  ocean: "#2b7bbf",
  plum: "#7c5cd6",
  coral: "#e8590c",
  rose: "#d6407f",
  sun: "#f5b942",
  line: "#cfe3e1",
};

// One accent per "personality": used for doctor avatars, initials, cards
export const ACCENTS = [
  { accent: "#0d9488", bg: "#d7f3ef" },
  { accent: "#2b7bbf", bg: "#dcecfa" },
  { accent: "#7c5cd6", bg: "#e9e1fb" },
  { accent: "#e8590c", bg: "#fde5d8" },
  { accent: "#c98a06", bg: "#fcefc8" },
  { accent: "#d6407f", bg: "#fbdceb" },
];

const SKINS = ["#f6d2b0", "#e5b48a", "#c58a62", "#8d5a3b"];
const HAIRS = ["#2b2118", "#4a2f1d", "#1f2937", "#6b3f1d"];

export const hashOf = (text = "") => {
  let h = 0;
  for (const ch of String(text)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

export const accentFor = (name) => ACCENTS[hashOf(name) % ACCENTS.length];

/* ---------- brand mark ---------- */
export const Logo = ({ size = 36 }) => {
  const id = `logo${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d9c3" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id})`} />
      <path
        d="M19 10h10a2 2 0 0 1 2 2v7h7a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7v7a2 2 0 0 1-2 2H19a2 2 0 0 1-2-2v-7h-7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h7v-7a2 2 0 0 1 2-2z"
        fill="#fff"
      />
      <path d="M12 24h7l2.5-5 4 10 2.5-5H36" stroke="#0d9488" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ---------- doctor portrait (varies by name, so every doctor looks different) ---------- */
export const DoctorAvatar = ({ name = "", size = 56, ring = false }) => {
  const h = hashOf(name);
  const tone = ACCENTS[h % ACCENTS.length];
  const skin = SKINS[(h >>> 3) % SKINS.length];
  const hair = HAIRS[(h >>> 5) % HAIRS.length];
  const style = (h >>> 7) % 4; // 0 short, 1 long, 2 bun, 3 short grey
  const capColor = style === 3 ? "#9aa1ab" : hair;
  const uid = `dr${useId().replace(/:/g, "")}`;

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={name ? `Dr. ${name}` : "Doctor"}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <clipPath id={uid}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid})`}>
        <rect width="100" height="100" fill={tone.bg} />
        {style === 1 && <path d="M25 56 Q22 20 50 19 Q78 20 75 56 L77 86 L23 86 Z" fill={hair} />}
        <rect x="44" y="56" width="12" height="18" rx="5" fill={skin} />
        <path d="M6 100 Q8 75 38 71 L62 71 Q92 75 94 100 Z" fill="#ffffff" />
        <path d="M41 71 L50 87 L59 71 Z" fill={tone.accent} />
        <path d="M38 71 L50 89 M62 71 L50 89" stroke="#d3e4e2" strokeWidth="1.5" fill="none" />
        <path d="M39 72 Q33 91 49 95" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="95" r="3.2" fill="#94a3b8" stroke="#334155" strokeWidth="1.4" />
        <ellipse cx="50" cy="44" rx="15" ry="17" fill={skin} />
        <path d="M34 43 Q31 22 50 22 Q69 22 66 43 Q61 32 50 32 Q39 32 34 43 Z" fill={capColor} />
        {style === 2 && <circle cx="50" cy="19" r="7" fill={hair} />}
        <circle cx="44" cy="45" r="1.7" fill="#1f2937" />
        <circle cx="56" cy="45" r="1.7" fill="#1f2937" />
        <ellipse cx="40" cy="50" rx="3" ry="2" fill="#f08a7e" fillOpacity=".28" />
        <ellipse cx="60" cy="50" rx="3" ry="2" fill="#f08a7e" fillOpacity=".28" />
        <path d="M45 52 Q50 56.5 55 52" stroke="#7a3b2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );

  if (!ring) return svg;

  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: "50%",
        border: "4px solid #fff",
        boxShadow: "0 8px 18px -8px rgba(11,43,46,.5)",
        lineHeight: 0,
        background: "#fff",
      }}
    >
      {svg}
    </span>
  );
};

/* ---------- object illustrations (160 x 140 canvas) ---------- */
const Shapes = ({ kind }) => {
  switch (kind) {
    case "calendar":
      return (
        <g>
          <rect x="34" y="28" width="92" height="86" rx="12" fill="#fff" stroke={PALETTE.line} strokeWidth="2" />
          <path d="M34 40a12 12 0 0 1 12-12h68a12 12 0 0 1 12 12v12H34z" fill={PALETTE.teal} />
          <rect x="54" y="19" width="7" height="17" rx="3.5" fill={PALETTE.ink} />
          <rect x="99" y="19" width="7" height="17" rx="3.5" fill={PALETTE.ink} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`${r}${c}`}
                x={46 + c * 19}
                y={62 + r * 15}
                width="12"
                height="9"
                rx="3"
                fill={r === 1 && c === 2 ? PALETTE.coral : "#d7ebe8"}
              />
            ))
          )}
          <circle cx="118" cy="106" r="17" fill={PALETTE.sun} stroke="#fff" strokeWidth="3" />
          <path d="M110 106l6 6 11-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "records":
      return (
        <g>
          <rect x="42" y="24" width="76" height="94" rx="11" fill="#fff" stroke={PALETTE.line} strokeWidth="2" />
          <rect x="60" y="15" width="40" height="16" rx="7" fill={PALETTE.ink} />
          <rect x="54" y="46" width="52" height="7" rx="3.5" fill={PALETTE.teal} />
          <rect x="54" y="62" width="36" height="6" rx="3" fill="#d7ebe8" />
          <rect x="54" y="75" width="48" height="6" rx="3" fill="#d7ebe8" />
          <rect x="54" y="88" width="30" height="6" rx="3" fill="#d7ebe8" />
          <circle cx="116" cy="108" r="17" fill={PALETTE.coral} stroke="#fff" strokeWidth="3" />
          <path d="M116 100v16M108 108h16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "pills":
      return (
        <g>
          <g transform="rotate(-32 78 72)">
            <rect x="34" y="56" width="88" height="34" rx="17" fill="#fff" stroke={PALETTE.line} strokeWidth="2" />
            <path d="M51 56H78V90H51A17 17 0 0 1 51 56Z" fill={PALETTE.teal} />
            <rect x="46" y="62" width="22" height="5" rx="2.5" fill="#fff" fillOpacity=".35" />
          </g>
          <g transform="rotate(28 128 26)">
            <rect x="106" y="17" width="44" height="18" rx="9" fill="#fff" stroke={PALETTE.line} strokeWidth="2" />
            <path d="M115 17H128V35H115A9 9 0 0 1 115 17Z" fill={PALETTE.coral} />
          </g>
          <circle cx="42" cy="102" r="13" fill={PALETTE.sun} stroke="#fff" strokeWidth="3" />
          <path d="M34 102h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "patients":
      return (
        <g>
          <circle cx="62" cy="58" r="17" fill="#f6d2b0" />
          <path d="M28 114Q30 82 62 80Q94 82 96 114Z" fill={PALETTE.teal} />
          <circle cx="104" cy="66" r="14" fill="#c58a62" />
          <path d="M76 116Q78 90 104 88Q130 90 132 116Z" fill={PALETTE.coral} />
          <path d="M56 56q6 5 12 0" stroke="#7a3b2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M99 64q5 4 10 0" stroke="#4a2a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "bell":
      return (
        <g>
          <path d="M80 22C58 22 52 42 52 60V76L43 90H117L108 76V60C108 42 102 22 80 22Z" fill={PALETTE.teal} />
          <path d="M62 52c0-12 6-20 18-22" stroke="#fff" strokeOpacity=".4" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="80" cy="100" r="9" fill={PALETTE.sun} />
          <circle cx="108" cy="34" r="11" fill={PALETTE.coral} stroke="#fff" strokeWidth="3" />
        </g>
      );
    case "chart":
      return (
        <g>
          <rect x="30" y="24" width="100" height="92" rx="12" fill="#fff" stroke={PALETTE.line} strokeWidth="2" />
          <rect x="46" y="74" width="16" height="30" rx="4" fill={PALETTE.teal} />
          <rect x="72" y="52" width="16" height="52" rx="4" fill={PALETTE.plum} />
          <rect x="98" y="38" width="16" height="66" rx="4" fill={PALETTE.coral} />
          <path d="M40 108h80" stroke={PALETTE.line} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "search":
    default:
      return (
        <g>
          <circle cx="70" cy="60" r="30" fill="#fff" stroke={PALETTE.ink} strokeWidth="8" />
          <path d="M93 84l26 26" stroke={PALETTE.ink} strokeWidth="11" strokeLinecap="round" />
          <path d="M70 46v28M56 60h28" stroke={PALETTE.teal} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
  }
};

/* ---------- friendly illustration for "nothing here yet" screens ---------- */
export const EmptyArt = ({ kind = "search", size = 150 }) => (
  <svg width={size} height={(size * 140) / 160} viewBox="0 0 160 140" aria-hidden="true" style={{ display: "block" }}>
    <circle cx="80" cy="68" r="58" fill="#e6f3f1" />
    <circle cx="26" cy="30" r="5" fill={PALETTE.sun} fillOpacity=".8" />
    <circle cx="140" cy="100" r="4" fill={PALETTE.coral} fillOpacity=".7" />
    <path d="M136 26v10M131 31h10" stroke={PALETTE.teal} strokeWidth="2.5" strokeLinecap="round" />
    <ellipse cx="80" cy="128" rx="46" ry="6" fill="#d3e6e3" />
    <Shapes kind={kind} />
  </svg>
);

/* ---------- decorative art on the right of the dashboard banners ---------- */
export const HeroDecor = ({ kind = "calendar" }) => (
  <svg className="hero-decor" viewBox="-44 0 504 240" aria-hidden="true" preserveAspectRatio="xMaxYMid meet">
    <circle cx="340" cy="120" r="124" fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth="2" />
    <circle cx="340" cy="120" r="84" fill="#fff" fillOpacity=".08" />
    <path
      d="M0 182H150l16-42 26 90 22-64 14 16H460"
      stroke="#fff"
      strokeOpacity=".4"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M70 36v18M61 45h18" stroke="#fff" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
    <path d="M214 24v12M208 30h12" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
    <path d="M430 196v14M423 203h14" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
    <circle cx="116" cy="92" r="5" fill="#fff" fillOpacity=".3" />
    <g transform="translate(258 30) scale(1.3)">
      <Shapes kind={kind} />
    </g>
  </svg>
);

/* ---------- decorative strip at the bottom of the sidebar ---------- */
export const SidebarArt = () => (
  <svg viewBox="0 0 250 120" width="100%" aria-hidden="true" style={{ display: "block" }}>
    <path
      d="M0 78H62l10-26 16 56 14-38 8 8H250"
      stroke="#5eead4"
      strokeOpacity=".35"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M40 22v12M34 28h12" stroke="#5eead4" strokeOpacity=".3" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M196 38v12M190 44h12" stroke="#5eead4" strokeOpacity=".25" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="150" cy="24" r="4" fill="#5eead4" fillOpacity=".25" />
  </svg>
);

/* ---------- main illustration on the login / register screens ---------- */
const Capsule = ({ x, y, rot, a, b = "#fff", w = 46, h = 18 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={b} />
    <path
      d={`M${-w / 2 + h / 2} ${-h / 2}H0V${h / 2}H${-w / 2 + h / 2}A${h / 2} ${h / 2} 0 0 1 ${-w / 2 + h / 2} ${-h / 2}Z`}
      fill={a}
    />
  </g>
);

export const AuthArt = () => {
  const id = `au${useId().replace(/:/g, "")}`;
  return (
    <svg className="auth-art-svg" viewBox="0 0 560 440" aria-hidden="true">
      <defs>
        <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#02191a" floodOpacity=".35" />
        </filter>
        <clipPath id={`${id}a`}>
          <circle cx="48" cy="48" r="48" />
        </clipPath>
      </defs>

      <circle cx="300" cy="220" r="196" fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="2" />
      <circle cx="300" cy="220" r="146" fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth="2" />
      <circle cx="300" cy="220" r="96" fill="#fff" fillOpacity=".06" />

      <path
        d="M10 398H196l16-38 26 76 22-56 12 18H550"
        stroke="#fff"
        strokeOpacity=".4"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {[[70, 70], [500, 60], [520, 340], [40, 360], [300, 24]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 9}v18M${x - 9} ${y}h18`} stroke="#fff" strokeOpacity=".35" strokeWidth="3.5" strokeLinecap="round" />
      ))}
      <circle cx="470" cy="150" r="6" fill="#f5b942" />
      <circle cx="96" cy="190" r="5" fill="#fff" fillOpacity=".4" />

      {/* appointment card */}
      <g transform="translate(130 64) rotate(-3 150 95)" filter={`url(#${id}s)`}>
        <rect width="310" height="196" rx="24" fill="#fff" />
        <g transform="translate(22 20)">
          <svg width="52" height="52" viewBox="0 0 96 96">
            <g clipPath={`url(#${id}a)`}>
              <rect width="96" height="96" fill="#d7f3ef" />
              <rect x="42" y="54" width="12" height="18" rx="5" fill="#e5b48a" />
              <path d="M4 96Q8 72 36 69L60 69Q88 72 92 96Z" fill="#fff" />
              <path d="M39 69L48 84L57 69Z" fill="#0d9488" />
              <ellipse cx="48" cy="42" rx="14" ry="16" fill="#e5b48a" />
              <path d="M33 41Q30 21 48 21Q66 21 63 41Q58 31 48 31Q38 31 33 41Z" fill="#2b2118" />
              <circle cx="42" cy="43" r="1.7" fill="#1f2937" />
              <circle cx="54" cy="43" r="1.7" fill="#1f2937" />
              <path d="M43 50Q48 54.5 53 50" stroke="#7a3b2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </g>
        <rect x="88" y="28" width="132" height="12" rx="6" fill="#123b3d" />
        <rect x="88" y="48" width="86" height="9" rx="4.5" fill="#cfe3e1" />
        <rect x="238" y="30" width="50" height="22" rx="11" fill="#d7f3ef" />
        <circle cx="253" cy="41" r="4" fill="#0d9488" />
        <rect x="262" y="38" width="18" height="6" rx="3" fill="#0d9488" />

        <rect x="22" y="84" width="266" height="1.5" fill="#e5efee" />

        {[["09:30", 22, false], ["10:00", 96, true], ["10:30", 170, false]].map(([t, x, on]) => (
          <g key={t}>
            <rect x={x} y="100" width="66" height="30" rx="15" fill={on ? "#0d9488" : "#eef5f5"} />
            <text x={x + 33} y="120" textAnchor="middle" fontSize="13" fontWeight="700" fill={on ? "#fff" : "#4b6a6c"} fontFamily="system-ui, sans-serif">
              {t}
            </text>
          </g>
        ))}
        <rect x="248" y="100" width="40" height="30" rx="15" fill="#fff" stroke="#cfe3e1" strokeWidth="1.5" />
        <path d="M262 112h12M262 118h8" stroke="#8aa9ab" strokeWidth="2" strokeLinecap="round" />

        <rect x="22" y="146" width="266" height="32" rx="16" fill="#0d9488" />
        <circle cx="46" cy="162" r="9" fill="#fff" fillOpacity=".22" />
        <path d="M41.5 162l3.5 3.5 6-7" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="66" y="167" fontSize="13.5" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
          Appointment confirmed
        </text>
      </g>

      {/* prescription card */}
      <g transform="translate(318 258) rotate(4 100 55)" filter={`url(#${id}s)`}>
        <rect width="206" height="112" rx="20" fill="#fff" />
        <circle cx="38" cy="38" r="20" fill="#fde5d8" />
        <g transform="translate(38 38) rotate(-35)">
          <rect x="-13" y="-6" width="26" height="12" rx="6" fill="#fff" stroke="#f1b79c" strokeWidth="1.5" />
          <path d="M-7 -6H0V6H-7A6 6 0 0 1 -7 -6Z" fill="#e8590c" />
        </g>
        <rect x="70" y="26" width="104" height="11" rx="5.5" fill="#123b3d" />
        <rect x="70" y="45" width="70" height="8" rx="4" fill="#cfe3e1" />
        <rect x="22" y="76" width="162" height="1.5" fill="#e5efee" />
        <rect x="22" y="88" width="56" height="8" rx="4" fill="#d7f3ef" />
        <rect x="86" y="88" width="40" height="8" rx="4" fill="#fcefc8" />
      </g>

      {/* floating heart + capsules */}
      <g transform="translate(112 102)">
        <circle r="28" fill="#e8590c" stroke="#fff" strokeWidth="5" />
        <path d="M0 11C-14 2 -14 -10 -6 -11C-2 -11.5 0 -8 0 -8C0 -8 2 -11.5 6 -11C14 -10 14 2 0 11Z" fill="#fff" />
      </g>
      <Capsule x={86} y={318} rot={-30} a="#f5b942" />
      <Capsule x={470} y={236} rot={35} a="#5eead4" w={38} h={15} />
      <circle cx="436" cy="394" r="9" fill="#fff" fillOpacity=".25" />
    </svg>
  );
};

/* ---------- coloured strip at the top of a doctor card ---------- */
export const DoctorCover = ({ color }) => (
  <div
    style={{
      height: 76,
      position: "relative",
      overflow: "hidden",
      borderRadius: "14px 14px 0 0",
      background: `linear-gradient(120deg, ${color}, ${color}99)`,
    }}
  >
    <svg
      width="100%"
      height="76"
      viewBox="0 0 300 76"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      <circle cx="268" cy="54" r="30" fill="#fff" fillOpacity=".1" />
      <path
        d="M0 54H120l10-22 16 48 12-34 8 8H300"
        stroke="#fff"
        strokeOpacity=".4"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M238 14v12M232 20h12M40 16v10M35 21h10" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);
