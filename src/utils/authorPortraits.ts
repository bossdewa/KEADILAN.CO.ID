export interface PortraitStyle {
  bgStart: string;
  bgEnd: string;
  skin: string;
  hair: string;
  attire: string;
  tieOrAccent: string;
  glasses?: boolean;
  hijab?: boolean;
  beard?: boolean;
}

const PORTRAIT_STYLES: Record<string, PortraitStyle> = {
  'Asep Maulana': {
    bgStart: '#0F2A44',
    bgEnd: '#1E4368',
    skin: '#D6A47E',
    hair: '#1F2937',
    attire: '#111827',
    tieOrAccent: '#C9A227',
    glasses: true,
    beard: true,
  },
  'Raka Pratama': {
    bgStart: '#0F4C45',
    bgEnd: '#16A085',
    skin: '#C8926B',
    hair: '#18181B',
    attire: '#1E293B',
    tieOrAccent: '#5EEAD4',
  },
  'Nadia Kusuma': {
    bgStart: '#1E3A8A',
    bgEnd: '#3730A3',
    skin: '#E2B696',
    hair: '#1C1917',
    attire: '#0F2A44',
    tieOrAccent: '#F59E0B',
    glasses: true,
  },
  'Dian Permana': {
    bgStart: '#14532D',
    bgEnd: '#166534',
    skin: '#C68B63',
    hair: '#27272A',
    attire: '#292524',
    tieOrAccent: '#16A085',
    beard: true,
  },
  'Siti Nurhaliza': {
    bgStart: '#7C2D12',
    bgEnd: '#9A3412',
    skin: '#DFB08C',
    hair: '#0F2A44',
    attire: '#1F2937',
    tieOrAccent: '#C9A227',
    hijab: true,
  },
  'Bagus Hidayat': {
    bgStart: '#27272A',
    bgEnd: '#3F3F46',
    skin: '#CE9670',
    hair: '#18181B',
    attire: '#0F2A44',
    tieOrAccent: '#16A085',
    glasses: true,
  },
  'Fajar Nugroho': {
    bgStart: '#0F766E',
    bgEnd: '#115E59',
    skin: '#D7A37C',
    hair: '#171717',
    attire: '#18181B',
    tieOrAccent: '#38BDF8',
  },
};

const DEFAULT_PORTRAIT: PortraitStyle = {
  bgStart: '#0F2A44',
  bgEnd: '#16A085',
  skin: '#D4A17A',
  hair: '#1F2937',
  attire: '#1E293B',
  tieOrAccent: '#C9A227',
};

export function getAuthorPhotoUrl(authorName: string): string {
  const style = PORTRAIT_STYLES[authorName] ?? DEFAULT_PORTRAIT;

  const hijabMarkup = style.hijab
    ? `<path d="M56 122 C56 58 144 58 144 122 L152 178 L48 178 Z" fill="${style.hair}" />
       <path d="M64 114 C64 70 136 70 136 114 L132 148 Q100 162 68 148 Z" fill="${style.hair}" opacity="0.92" />`
    : `<path d="M62 86 C62 46 138 46 138 86 C138 74 126 62 100 62 C74 62 62 74 62 86 Z" fill="${style.hair}" />`;

  const glassesMarkup = style.glasses
    ? `<g stroke="#18181B" stroke-width="2.4" fill="rgba(255,255,255,0.16)">
         <rect x="74" y="88" width="21" height="14" rx="4" />
         <rect x="105" y="88" width="21" height="14" rx="4" />
         <line x1="95" y1="95" x2="105" y2="95" />
       </g>`
    : '';

  const beardMarkup = style.beard
    ? `<path d="M77 113 Q100 132 123 113 Q120 128 100 131 Q80 128 77 113 Z" fill="${style.hair}" opacity="0.28" />`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${style.bgStart}" />
        <stop offset="100%" stop-color="${style.bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#bg)" />
    <circle cx="162" cy="40" r="54" fill="#FFFFFF" fill-opacity="0.06" />
    <circle cx="38" cy="176" r="46" fill="#C9A227" fill-opacity="0.08" />
    ${hijabMarkup}
    <!-- Neck & Shoulders -->
    <rect x="86" y="122" width="28" height="28" rx="10" fill="${style.skin}" />
    <path d="M36 200 C40 156 64 142 100 142 C136 142 160 156 164 200 Z" fill="${style.attire}" />
    <!-- Shirt Collar & Press Accent -->
    <polygon points="86,142 100,164 114,142" fill="#F8FAFC" />
    <polygon points="96,158 104,158 106,192 94,192" fill="${style.tieOrAccent}" />
    <!-- Face -->
    <ellipse cx="100" cy="94" rx="28" ry="33" fill="${style.skin}" />
    ${
      style.hijab
        ? ''
        : `<path d="M70 84 C72 58 128 58 130 84 C122 72 110 68 100 69 C90 68 78 72 70 84 Z" fill="${style.hair}" />`
    }
    <!-- Eyes & Brows -->
    <circle cx="86" cy="95" r="2.7" fill="#18181B" />
    <circle cx="114" cy="95" r="2.7" fill="#18181B" />
    <path d="M79 86 Q86 83 93 86" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M107 86 Q114 83 121 86" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round" />
    ${glassesMarkup}
    <!-- Nose & Subtle Smile -->
    <path d="M100 94 L98 104 L103 105" stroke="rgba(24,24,27,0.32)" stroke-width="1.8" fill="none" stroke-linecap="round" />
    <path d="M91 113 Q100 119 109 113" stroke="#7C2D12" stroke-width="2.2" fill="none" stroke-linecap="round" />
    ${beardMarkup}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
