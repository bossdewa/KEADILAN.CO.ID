import React from 'react';
import { NewsArticle } from '../data/newsData';

interface EditorialArtworkProps {
  variant: NewsArticle['artworkVariant'];
  className?: string;
}

export const EditorialArtwork: React.FC<EditorialArtworkProps> = ({
  variant,
  className = 'w-full h-full',
}) => {
  switch (variant) {
    case 'courthouse':
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="courtBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F2A44" />
              <stop offset="55%" stopColor="#173D5E" />
              <stop offset="100%" stopColor="#125D56" />
            </linearGradient>
            <linearGradient id="courtGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6C667" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#B88E24" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#courtBg)" />
          <circle cx="640" cy="110" r="160" fill="#16A085" fillOpacity="0.16" />
          <circle cx="140" cy="420" r="180" fill="#C9A227" fillOpacity="0.08" />
          {/* Architectural Pediment & Columns */}
          <polygon points="400,88 180,185 620,185" fill="#F8FAFC" fillOpacity="0.14" stroke="#E2E8F0" strokeOpacity="0.35" strokeWidth="2" />
          <rect x="170" y="185" width="460" height="16" fill="#F8FAFC" fillOpacity="0.22" />
          {[215, 295, 375, 455, 535].map((x) => (
            <g key={x}>
              <rect x={x} y="201" width="32" height="185" fill="#F8FAFC" fillOpacity="0.16" />
              <line x1={x + 10} y1="206" x2={x + 10} y2="380" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />
              <line x1={x + 22} y1="206" x2={x + 22} y2="380" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2" />
            </g>
          ))}
          <rect x="145" y="386" width="510" height="18" fill="#F8FAFC" fillOpacity="0.22" />
          <rect x="120" y="404" width="560" height="22" fill="#F8FAFC" fillOpacity="0.14" />
          {/* Balance Scale Emblem */}
          <g transform="translate(400, 142)">
            <line x1="0" y1="-26" x2="0" y2="20" stroke="url(#courtGold)" strokeWidth="2.5" />
            <line x1="-34" y1="-10" x2="34" y2="-10" stroke="url(#courtGold)" strokeWidth="2.5" />
            <path d="M-34,-10 L-44,10 L-24,10 Z" fill="none" stroke="url(#courtGold)" strokeWidth="1.8" />
            <path d="M34,-10 L24,10 L44,10 Z" fill="none" stroke="url(#courtGold)" strokeWidth="1.8" />
          </g>
          {/* Editorial Grid Lines */}
          <line x1="48" y1="48" x2="752" y2="48" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="48" y1="452" x2="752" y2="452" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />
        </svg>
      );

    case 'harbor':
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="harborSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#132A3E" />
              <stop offset="55%" stopColor="#1E5268" />
              <stop offset="100%" stopColor="#16A085" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#harborSky)" />
          <circle cx="590" cy="145" r="76" fill="#F59E0B" fillOpacity="0.22" />
          <circle cx="590" cy="145" r="46" fill="#FBBF24" fillOpacity="0.28" />
          {/* Horizon & Cranes */}
          <path d="M0,335 Q200,320 400,338 T800,332 L800,500 L0,500 Z" fill="#0B1F30" fillOpacity="0.72" />
          <path d="M0,375 Q180,362 390,378 T800,372" fill="none" stroke="#99F6E4" strokeOpacity="0.28" strokeWidth="2" />
          <path d="M0,415 Q220,402 450,418 T800,412" fill="none" stroke="#99F6E4" strokeOpacity="0.18" strokeWidth="1.5" />
          {/* Port Cranes */}
          <g stroke="#E2E8F0" strokeOpacity="0.48" strokeWidth="3" fill="none">
            <line x1="210" y1="335" x2="210" y2="155" />
            <line x1="235" y1="335" x2="235" y2="155" />
            <line x1="175" y1="185" x2="365" y2="155" />
            <line x1="330" y1="160" x2="330" y2="255" strokeWidth="2" />
            <rect x="308" y="255" width="44" height="24" fill="#F8FAFC" fillOpacity="0.2" strokeOpacity="0.45" />
          </g>
          {/* Cargo Vessel Silhouette */}
          <polygon points="410,335 675,335 650,365 430,365" fill="#F8FAFC" fillOpacity="0.24" />
          <rect x="460" y="305" width="60" height="30" fill="#E2E8F0" fillOpacity="0.25" />
          <rect x="528" y="313" width="52" height="22" fill="#C9A227" fillOpacity="0.35" />
          <rect x="588" y="294" width="38" height="41" fill="#F8FAFC" fillOpacity="0.3" />
        </svg>
      );

    case 'capitol':
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="capBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1B2336" />
              <stop offset="50%" stopColor="#2A3A58" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#capBg)" />
          <circle cx="400" cy="240" r="210" fill="#FFFFFF" fillOpacity="0.04" />
          <circle cx="400" cy="240" r="145" stroke="#E2E8F0" strokeOpacity="0.16" strokeWidth="1.5" fill="none" />
          {/* Dome & Legislative Hall */}
          <path d="M315,220 C315,155 485,155 485,220 Z" fill="#F8FAFC" fillOpacity="0.2" />
          <rect x="394" y="128" width="12" height="34" fill="#FBBF24" fillOpacity="0.6" />
          <rect x="275" y="220" width="250" height="28" fill="#F8FAFC" fillOpacity="0.16" />
          <rect x="160" y="248" width="480" height="142" fill="#F8FAFC" fillOpacity="0.12" />
          {[195, 245, 295, 345, 435, 485, 535, 585].map((x) => (
            <rect key={x} x={x} y="274" width="22" height="56" rx="2" fill="#FFFFFF" fillOpacity="0.22" />
          ))}
          <rect x="382" y="286" width="36" height="104" fill="#C9A227" fillOpacity="0.35" />
          <line x1="90" y1="390" x2="710" y2="390" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" />
        </svg>
      );

    case 'cityscape':
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cityBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14323B" />
              <stop offset="60%" stopColor="#1D4E5F" />
              <stop offset="100%" stopColor="#0F2A44" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#cityBg)" />
          <circle cx="170" cy="130" r="95" fill="#16A085" fillOpacity="0.22" />
          {/* Urban Silhouette & Coastal Horizon */}
          <rect x="85" y="235" width="76" height="185" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="176" y="175" width="92" height="245" fill="#FFFFFF" fillOpacity="0.16" />
          <rect x="284" y="210" width="68" height="210" fill="#FFFFFF" fillOpacity="0.11" />
          <rect x="372" y="145" width="108" height="275" fill="#FFFFFF" fillOpacity="0.19" />
          <rect x="498" y="198" width="84" height="222" fill="#FFFFFF" fillOpacity="0.14" />
          <rect x="600" y="242" width="110" height="178" fill="#FFFFFF" fillOpacity="0.12" />
          {/* Light Accents */}
          {[198, 224, 248].map((x) => (
            <rect key={x} x={x} y="205" width="12" height="14" fill="#FDE68A" fillOpacity="0.45" />
          ))}
          {[394, 422, 450].map((x) => (
            <rect key={x} x={x} y="175" width="14" height="16" fill="#99F6E4" fillOpacity="0.4" />
          ))}
          <line x1="40" y1="420" x2="760" y2="420" stroke="#99F6E4" strokeOpacity="0.3" strokeWidth="2" />
        </svg>
      );

    case 'archive':
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="archBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2D221B" />
              <stop offset="55%" stopColor="#4A3628" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#archBg)" />
          <rect x="130" y="95" width="540" height="310" rx="6" fill="#FFFFFF" fillOpacity="0.08" stroke="#FDE68A" strokeOpacity="0.22" />
          {/* Editorial Dossier Layers */}
          <rect x="175" y="135" width="210" height="230" fill="#FEF3C7" fillOpacity="0.16" />
          <rect x="200" y="165" width="160" height="14" fill="#FDE68A" fillOpacity="0.45" />
          <rect x="200" y="196" width="135" height="8" fill="#FFFFFF" fillOpacity="0.3" />
          <rect x="200" y="216" width="150" height="8" fill="#FFFFFF" fillOpacity="0.25" />
          <rect x="200" y="236" width="120" height="8" fill="#FFFFFF" fillOpacity="0.25" />
          <circle cx="280" cy="305" r="32" stroke="#F59E0B" strokeOpacity="0.55" strokeWidth="3" fill="none" />
          {/* Right Ledger Lines */}
          <rect x="420" y="145" width="205" height="95" fill="#FFFFFF" fillOpacity="0.11" />
          <rect x="420" y="260" width="205" height="95" fill="#FFFFFF" fillOpacity="0.09" />
          <line x1="442" y1="175" x2="598" y2="175" stroke="#FDE68A" strokeOpacity="0.45" strokeWidth="2" />
          <line x1="442" y1="202" x2="560" y2="202" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2" />
          <line x1="442" y1="290" x2="598" y2="290" stroke="#99F6E4" strokeOpacity="0.45" strokeWidth="2" />
          <line x1="442" y1="318" x2="552" y2="318" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2" />
        </svg>
      );

    case 'press':
    default:
      return (
        <svg
          viewBox="0 0 800 500"
          className={className}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pressBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#18181B" />
              <stop offset="55%" stopColor="#27272A" />
              <stop offset="100%" stopColor="#115E59" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#pressBg)" />
          {/* Broadsheet Page Wireframe Illustration */}
          <rect x="165" y="75" width="470" height="350" fill="#FAFAFA" fillOpacity="0.1" stroke="#FFFFFF" strokeOpacity="0.2" />
          <rect x="200" y="105" width="400" height="28" fill="#16A085" fillOpacity="0.42" />
          <line x1="200" y1="152" x2="600" y2="152" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" />
          <rect x="200" y="174" width="225" height="130" fill="#FFFFFF" fillOpacity="0.16" />
          <rect x="445" y="174" width="155" height="16" fill="#FBBF24" fillOpacity="0.48" />
          <rect x="445" y="204" width="155" height="10" fill="#FFFFFF" fillOpacity="0.28" />
          <rect x="445" y="224" width="132" height="10" fill="#FFFFFF" fillOpacity="0.24" />
          <rect x="445" y="244" width="146" height="10" fill="#FFFFFF" fillOpacity="0.24" />
          <rect x="445" y="264" width="110" height="10" fill="#FFFFFF" fillOpacity="0.2" />
          <rect x="200" y="325" width="400" height="12" fill="#FFFFFF" fillOpacity="0.22" />
          <rect x="200" y="350" width="335" height="12" fill="#FFFFFF" fillOpacity="0.18" />
          <rect x="200" y="375" width="370" height="12" fill="#FFFFFF" fillOpacity="0.14" />
        </svg>
      );
  }
};
