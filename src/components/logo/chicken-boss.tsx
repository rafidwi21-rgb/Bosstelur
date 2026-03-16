"use client";

export function ChickenBossIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* === SUIT BODY === */}
      {/* Shoulders & jacket */}
      <path d="M14 48 C14 40 24 35 40 35 C56 35 66 40 66 48 L68 72 C68 76 60 78 40 78 C20 78 12 76 12 72 Z" fill="#1a1a1a" />
      {/* Jacket lapel left */}
      <path d="M28 36 L34 50 L40 44 Z" fill="#2a2a2a" />
      {/* Jacket lapel right */}
      <path d="M52 36 L46 50 L40 44 Z" fill="#2a2a2a" />
      {/* Shirt V-neck */}
      <path d="M33 36 L40 35 L47 36 L44 44 L40 40 L36 44 Z" fill="#f5f0eb" />
      {/* Tie */}
      <path d="M38.5 42 L40 37 L41.5 42 L40.5 62 L39.5 62 Z" fill="#b91c1c" />
      {/* Tie knot */}
      <path d="M38 39 Q40 37 42 39 Q41 41 40 41 Q39 41 38 39 Z" fill="#991b1b" />
      {/* Pocket square */}
      <rect x="50" y="48" width="6" height="4" rx="1" fill="#f5f0eb" opacity="0.6" />

      {/* === NECK === */}
      <ellipse cx="40" cy="34" rx="8" ry="4" fill="#fef3c7" />

      {/* === HEAD === */}
      {/* Main head shape - rounder, friendlier */}
      <ellipse cx="40" cy="20" rx="16" ry="17" fill="#fefce8" />
      {/* Cheek warmth */}
      <ellipse cx="28" cy="22" rx="4" ry="3" fill="#fef9c3" opacity="0.5" />
      <ellipse cx="52" cy="22" rx="4" ry="3" fill="#fef9c3" opacity="0.5" />

      {/* === COMB (Jengger) - bigger, bolder === */}
      <path d="M28 6 Q30 1 33 5 Q34 0 37 4 Q39 -1 41 3 Q43 -1 45 4 Q47 0 49 5 Q51 2 52 7 Q51 12 40 12 Q29 12 28 8 Z" fill="#dc2626" />
      {/* Comb highlight */}
      <path d="M32 5 Q34 2 36 5" stroke="#ef4444" strokeWidth="1" fill="none" opacity="0.5" />

      {/* === EYES - expressive === */}
      {/* Eye whites */}
      <ellipse cx="32" cy="18" rx="5" ry="5.5" fill="white" />
      <ellipse cx="48" cy="18" rx="5" ry="5.5" fill="white" />
      {/* Eye outline */}
      <ellipse cx="32" cy="18" rx="5" ry="5.5" stroke="#92400e" strokeWidth="0.5" fill="none" opacity="0.3" />
      <ellipse cx="48" cy="18" rx="5" ry="5.5" stroke="#92400e" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Pupils - looking slightly up and to the side for personality */}
      <circle cx="33.5" cy="17" r="3" fill="#1c1917" />
      <circle cx="49.5" cy="17" r="3" fill="#1c1917" />
      {/* Eye shine */}
      <circle cx="34.5" cy="15.5" r="1.2" fill="white" />
      <circle cx="50.5" cy="15.5" r="1.2" fill="white" />
      {/* Small secondary shine */}
      <circle cx="32.5" cy="18.5" r="0.6" fill="white" opacity="0.6" />
      <circle cx="48.5" cy="18.5" r="0.6" fill="white" opacity="0.6" />
      {/* Eyebrows - confident look */}
      <path d="M27 12 Q30 10 36 12" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M44 12 Q50 10 53 12" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* === BEAK - open, smiling === */}
      {/* Upper beak */}
      <path d="M35 24 Q38 22 40 22 Q42 22 45 24 L42 28 Q40 29 38 28 Z" fill="#f59e0b" />
      {/* Lower beak - open smile */}
      <path d="M36 27 Q38 24 40 24 Q42 24 44 27 L42 29 Q40 30 38 29 Z" fill="#d97706" />
      {/* Beak shine */}
      <path d="M37 24 Q39 23 41 24" stroke="#fbbf24" strokeWidth="0.5" fill="none" opacity="0.6" />

      {/* === WATTLE (Pial) === */}
      <ellipse cx="40" cy="30" rx="2.5" ry="3.5" fill="#dc2626" />
      <ellipse cx="40" cy="30" rx="1.5" ry="2.5" fill="#ef4444" opacity="0.3" />

      {/* === THUMBS UP HAND === */}
      <g>
        {/* Arm from right side of jacket */}
        <path d="M62 48 Q66 42 68 38 Q70 34 68 30" stroke="#fef3c7" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Fist */}
        <ellipse cx="68" cy="28" rx="5" ry="4.5" fill="#fef3c7" />
        {/* Fingers curled */}
        <path d="M64 30 Q63 32 64 33" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M66 31 Q65 33 66 34" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Thumb - pointing up */}
        <path d="M70 28 L71 19 Q71 16 69 16 Q67 16 67 19 L67 26" fill="#fef3c7" />
        <path d="M70 28 L71 19 Q71 16 69 16 Q67 16 67 19 L67 26" stroke="#fde68a" strokeWidth="0.5" fill="none" opacity="0.5" />
        {/* Jacket sleeve cuff */}
        <path d="M60 48 Q63 44 65 42" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* === SUBTLE DETAILS === */}
      {/* Jacket button */}
      <circle cx="40" cy="55" r="1.5" fill="#404040" />
      <circle cx="40" cy="62" r="1.5" fill="#404040" />
    </svg>
  );
}

export function ChickenBossLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <ChickenBossIcon size={size * 0.75} />
    </div>
  );
}
