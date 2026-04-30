export const DEFAULT_ETAPA_COLORS = [
  'bg-slate-400',
  'bg-blue-400',
  'bg-amber-400',
  'bg-violet-400',
  'bg-red-400',
  'bg-emerald-400',
  'bg-cyan-400',
  'bg-pink-400',
  'bg-orange-400',
  'bg-teal-400',
  'bg-indigo-400',
  'bg-rose-400',
];

export const ETAPA_COLORS_HEX: Record<string, string> = {
  'bg-slate-400': '#94a3b8',
  'bg-blue-400': '#60a5fa',
  'bg-amber-400': '#fbbf24',
  'bg-violet-400': '#a78bfa',
  'bg-red-400': '#f87171',
  'bg-emerald-400': '#34d399',
  'bg-cyan-400': '#22d3ee',
  'bg-pink-400': '#f472b6',
  'bg-orange-400': '#fb923c',
  'bg-teal-400': '#2dd4bf',
  'bg-indigo-400': '#818cf8',
  'bg-rose-400': '#fb7185',
};

export function getEtapaColorKey(color?: string | null, position?: number): string {
  if (color && ETAPA_COLORS_HEX[color]) return color;

  if (color?.startsWith('#')) {
    const matchedColor = Object.entries(ETAPA_COLORS_HEX).find(([, hex]) => hex.toLowerCase() === color.toLowerCase());
    if (matchedColor) return matchedColor[0];
  }

  if (typeof position === 'number') {
    return DEFAULT_ETAPA_COLORS[position % DEFAULT_ETAPA_COLORS.length];
  }

  return DEFAULT_ETAPA_COLORS[0];
}

export function getDefaultEtapaColorKey(position: number): string {
  return DEFAULT_ETAPA_COLORS[position % DEFAULT_ETAPA_COLORS.length];
}

export function getEtapaColorHex(color?: string | null, position?: number): string {
  if (color?.startsWith('#')) return color;
  return ETAPA_COLORS_HEX[getEtapaColorKey(color, position)];
}
