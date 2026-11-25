export interface ContrastPalette {
  textColor: string;
  mutedTextColor: string;
  badgeBg: string;
  badgeText: string;
  controlBg: string;
  controlBorder: string;
  borderColor: string;
  isLightBg: boolean;
  contrastRatio: number;
}

function normalizeHex(hex: string): string {
  const cleaned = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return (
      '#' +
      cleaned
        .split('')
        .map((c) => c + c)
        .join('')
    );
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return '#' + cleaned;
  }
  return '#B91C1C';
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex).slice(1);
  const num = parseInt(normalized, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const transform = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

export function getTickerContrastPalette(backgroundColor: string): ContrastPalette {
  const safeHex = normalizeHex(backgroundColor);
  const whiteContrast = getContrastRatio(safeHex, '#FFFFFF');
  const darkContrast = getContrastRatio(safeHex, '#0F172A');
  const isLightBg = darkContrast > whiteContrast;

  if (isLightBg) {
    return {
      textColor: '#0F172A',
      mutedTextColor: 'rgba(15, 23, 42, 0.72)',
      badgeBg: '#0F172A',
      badgeText: '#FFFFFF',
      controlBg: 'rgba(15, 23, 42, 0.09)',
      controlBorder: 'rgba(15, 23, 42, 0.18)',
      borderColor: 'rgba(15, 23, 42, 0.14)',
      isLightBg: true,
      contrastRatio: Number(darkContrast.toFixed(2)),
    };
  }

  return {
    textColor: '#FFFFFF',
    mutedTextColor: 'rgba(255, 255, 255, 0.78)',
    badgeBg: '#FFFFFF',
    badgeText: safeHex,
    controlBg: 'rgba(255, 255, 255, 0.14)',
    controlBorder: 'rgba(255, 255, 255, 0.26)',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    isLightBg: false,
    contrastRatio: Number(whiteContrast.toFixed(2)),
  };
}
