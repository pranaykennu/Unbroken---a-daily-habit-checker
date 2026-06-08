import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  const sizeStyle = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      style={sizeStyle}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="unbroken-app-logo"
    >
      <defs>
        {/* Soft mint drop shadow and glow */}
        <filter id="logoGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.12" />
        </filter>

        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.08" />
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.04" />
        </filter>

        {/* Dynamic rainbow gradient matching the helix stream */}
        <linearGradient id="helixGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f472b6" /> {/* Pink */}
          <stop offset="25%" stopColor="#a78bfa" /> {/* Purple */}
          <stop offset="50%" stopColor="#60a5fa" /> {/* Blue */}
          <stop offset="75%" stopColor="#fbbf24" /> {/* Yellow */}
          <stop offset="100%" stopColor="#34d399" /> {/* Mint Green */}
        </linearGradient>

        {/* Glow for the arrow tip */}
        <filter id="tipGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 -0.1" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer Squircle Container Frame */}
      <rect
        x="12"
        y="12"
        width="196"
        height="196"
        rx="52"
        fill="#FFFFFF"
        stroke="#bbf7d0"
        strokeWidth="5"
        filter="url(#cardShadow)"
      />

      {/* Grid of Background Cells (6x5 Grid) */}
      <g opacity="0.65">
        {/* Row 1 */}
        <rect x="52" y="50" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="78" y="50" width="18" height="18" rx="4" fill="#eff6ff" />
        <rect x="104" y="50" width="18" height="18" rx="4" fill="#f0fdf4" />
        <rect x="130" y="50" width="18" height="18" rx="4" fill="#f0fdf4" />
        <rect x="156" y="50" width="18" height="18" rx="4" fill="#34d399" opacity="0.15" />

        {/* Row 2 */}
        <rect x="52" y="78" width="18" height="18" rx="4" fill="#fcf7fc" />
        <rect x="78" y="78" width="18" height="18" rx="4" fill="#e0f2fe" opacity="0.6" />
        <rect x="104" y="78" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="130" y="78" width="18" height="18" rx="4" fill="#f8fafc" />
        <rect x="156" y="78" width="18" height="18" rx="4" fill="#f0edf4" />

        {/* Row 3 */}
        <rect x="52" y="106" width="18" height="18" rx="4" fill="#fdf2f8" opacity="0.5" />
        <rect x="78" y="106" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="104" y="106" width="18" height="18" rx="4" fill="#fef08a" opacity="0.2" />
        <rect x="130" y="106" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="156" y="106" width="18" height="18" rx="4" fill="#f1f5f9" />

        {/* Row 4 */}
        <rect x="52" y="134" width="18" height="18" rx="4" fill="#fce7f3" opacity="0.4" />
        <rect x="78" y="134" width="18" height="18" rx="4" fill="#fcf4fa" />
        <rect x="104" y="134" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="130" y="134" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="156" y="134" width="18" height="18" rx="4" fill="#f1f5f9" />

        {/* Row 5 */}
        <rect x="52" y="162" width="18" height="18" rx="4" fill="#fae8ff" opacity="0.4" />
        <rect x="78" y="162" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="104" y="162" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="130" y="162" width="18" height="18" rx="4" fill="#f1f5f9" />
        <rect x="156" y="162" width="18" height="18" rx="4" fill="#f1f5f9" />
      </g>

      {/* Glowing trail underlying the arrow */}
      <path
        d="M 24 162 C 34 162, 54 162, 74 148 C 94 134, 94 104, 114 90 C 134 76, 134 56, 158 50"
        stroke="url(#helixGradient)"
        strokeWidth="38"
        strokeLinecap="round"
        opacity="0.3"
        filter="blur(8px)"
      />

      {/* Main Rainbow Wavy Ribbon Block */}
      <path
        d="M 24 158 C 34 158, 56 156, 76 138 C 96 120, 94 94, 114 80 C 134 66, 134 50, 154 48"
        stroke="url(#helixGradient)"
        strokeWidth="28"
        strokeLinecap="round"
      />

      {/* Interlocking Dual Wave Lines (The 'Helix' or Unbroken chain look) */}
      <path
        d="M 24 158 C 34 158, 56 156, 76 138 C 96 120, 94 94, 114 80 C 134 66, 134 50, 154 48"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1 10"
        opacity="0.15"
      />

      {/* Beautiful Weave / Helix Strand 1 */}
      <path
        d="M 24 164 C 36 158, 56 142, 74 132 C 92 122, 98 100, 114 90 C 130 80, 138 60, 152 50"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Intertwining Strand 2 */}
      <path
        d="M 22 150 C 34 152, 54 162, 74 146 C 94 130, 92 108, 112 102 C 132 96, 134 72, 148 58"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Winding Arrowhead */}
      <path
        d="M 148 58 L 158 44 L 140 40 Z"
        fill="#34d399"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#tipGlow)"
      />

      {/* Checkboxes along the wave */}
      {/* Checkbox 1 (Pink section) */}
      <g transform="translate(48, 148)">
        <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#f472b6" strokeWidth="2" />
        <path d="M -4 0 L -1 3 L 4 -2" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Checkbox 2 (Lavender/Blue section) */}
      <g transform="translate(82, 118)">
        <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#a78bfa" strokeWidth="2" />
        <path d="M -4 0 L -1 3 L 4 -2" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Checkbox 3 (Yellow section) */}
      <g transform="translate(114, 88)">
        <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#3b82f6" strokeWidth="2" />
        <path d="M -4 0 L -1 3 L 4 -2" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Checkbox 4 (Mint section) */}
      <g transform="translate(142, 60)">
        <circle cx="0" cy="0" r="11" fill="#FFFFFF" stroke="#10b981" strokeWidth="2" />
        <path d="M -4 0 L -1 3 L 4 -2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};
