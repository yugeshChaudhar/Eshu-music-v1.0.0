import React from 'react';

interface EshuMusicLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const EshuMusicLogo: React.FC<EshuMusicLogoProps> = ({
  className = 'w-9 h-9',
  size,
  showText = false,
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="bg-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="50%" stopColor="#1C1438" />
            <stop offset="100%" stopColor="#081A2C" />
          </linearGradient>

          {/* Border Glow Gradient */}
          <linearGradient id="border-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8A2387" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00C9FF" stopOpacity="0.8" />
          </linearGradient>

          {/* Neon Cyan to Purple Gradient */}
          <linearGradient id="neon-cyan-purple" x1="120" y1="100" x2="380" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38E8FF" />
            <stop offset="45%" stopColor="#4FACFE" />
            <stop offset="75%" stopColor="#7F00FF" />
            <stop offset="100%" stopColor="#E100FF" />
          </linearGradient>

          {/* Gold Accent Gradient */}
          <linearGradient id="gold-grad" x1="260" y1="120" x2="400" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="60%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#FF8F00" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Card Background */}
        <rect
          x="12"
          y="12"
          width="488"
          height="488"
          rx="110"
          fill="url(#bg-grad)"
          stroke="url(#border-grad)"
          strokeWidth="6"
        />

        {/* Ambient Glow Orb */}
        <circle cx="270" cy="240" r="140" fill="#6366F1" opacity="0.15" filter="url(#soft-glow)" />
        <circle cx="340" cy="180" r="90" fill="#00F2FE" opacity="0.18" filter="url(#soft-glow)" />

        {/* Modern Stylized Musical 'E' Spine & Curves */}
        {/* Left vertical curving backbone */}
        <path
          d="M 175 130 
             C 150 170, 138 230, 138 290 
             C 138 355, 175 400, 240 400 
             C 285 400, 315 378, 335 355
             C 320 355, 290 350, 265 330
             C 225 300, 205 250, 205 190
             C 205 155, 215 135, 230 115
             C 195 110, 182 120, 175 130 Z"
          fill="url(#neon-cyan-purple)"
          opacity="0.95"
          filter="url(#glow-filter)"
        />

        {/* Letter 'E' Middle Bar Flowing into Harmonic Wave */}
        <path
          d="M 160 250 
             C 200 248, 255 248, 285 235 
             C 275 260, 230 270, 170 270 Z"
          fill="url(#neon-cyan-purple)"
        />

        {/* Futuristic Treble Clef (𝄞) Interlaced on Right */}
        {/* Top Loop */}
        <path
          d="M 320 95
             C 345 105, 360 135, 360 170
             C 360 215, 330 250, 310 280
             C 298 298, 290 320, 290 345
             C 290 380, 312 405, 340 405
             C 365 405, 385 385, 385 360
             C 385 335, 365 320, 345 320
             C 335 320, 328 325, 325 330
             C 328 315, 338 295, 355 270
             C 385 225, 400 175, 400 135
             C 400 90, 365 65, 320 95 Z"
          fill="url(#neon-cyan-purple)"
          filter="url(#glow-filter)"
        />

        {/* Treble clef golden bottom node */}
        <circle cx="340" cy="385" r="26" fill="url(#gold-grad)" filter="url(#glow-filter)" />

        {/* Floating Musical Notes (Gold & Cyan Accents) */}
        {/* Top Note 1 */}
        <path
          d="M 285 100 
             C 285 85, 295 75, 310 75
             L 310 125
             C 305 120, 295 120, 290 125
             C 280 130, 275 142, 285 150
             C 295 155, 310 148, 312 135
             L 312 85
             C 330 85, 345 95, 345 110"
          fill="url(#gold-grad)"
        />

        {/* Right Floating Note 2 */}
        <path
          d="M 390 175 
             L 420 160
             L 420 205
             C 415 200, 405 200, 398 205
             C 390 210, 388 222, 398 228
             C 408 232, 420 226, 422 215
             L 422 170
             L 392 185 Z"
          fill="url(#gold-grad)"
        />

        {/* Small Cyan Note */}
        <circle cx="260" cy="165" r="14" fill="#38E8FF" opacity="0.9" />
        <path d="M 272 165 L 272 110 C 285 110, 295 118, 295 128" stroke="#38E8FF" strokeWidth="6" strokeLinecap="round" />

        {/* Bottom typography banner inside icon badge */}
        <g opacity="0.95">
          <text
            x="256"
            y="450"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="34"
            fontWeight="900"
            letterSpacing="6"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ESHU MUSIC
          </text>
        </g>
      </svg>
    </div>
  );
};
