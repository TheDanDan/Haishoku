import { THEMESHEX } from './themes'

export type PalettePreset = {
  id: string
  name: string
  note: string
  colors: string[]
}

export const PALETTES: PalettePreset[] = [
  { id: 'catMocha', name: 'Mocha', note: 'Soft / nocturnal', colors: THEMESHEX.catMocha },
  { id: 'catLatte', name: 'Latte', note: 'Bright / playful', colors: THEMESHEX.catLatte },
  { id: 'gruvBox', name: 'Gruvbox', note: 'Earthy / analog', colors: THEMESHEX.gruvBox },
  { id: 'nord', name: 'Nord', note: 'Arctic / muted', colors: ['#2e3440', '#3b4252', '#434c5e', '#4c566a', '#d8dee9', '#e5e9f0', '#eceff4', '#8fbcbb', '#88c0d0', '#81a1c1', '#5e81ac', '#bf616a', '#d08770', '#ebcb8b', '#a3be8c', '#b48ead'] },
  { id: 'solarized', name: 'Solarized', note: 'Warm / balanced', colors: ['#002b36', '#073642', '#586e75', '#657b83', '#839496', '#93a1a1', '#eee8d5', '#fdf6e3', '#b58900', '#cb4b16', '#dc322f', '#d33682', '#6c71c4', '#268bd2', '#2aa198', '#859900'] },
  { id: 'rosePine', name: 'Rosé Pine', note: 'Floral / dusky', colors: ['#191724', '#1f1d2e', '#26233a', '#403d52', '#6e6a86', '#908caa', '#e0def4', '#ebbcba', '#f6c177', '#eb6f92', '#c4a7e7', '#9ccfd8', '#31748f', '#f2e9e1'] },
  { id: 'everforest', name: 'Everforest', note: 'Forest / quiet', colors: ['#232a2e', '#2d353b', '#343f44', '#3d484d', '#7a8478', '#859289', '#9da9a0', '#d3c6aa', '#e67e80', '#e69875', '#dbbc7f', '#a7c080', '#83c092', '#7fbbb3', '#7fbbb3', '#d699b6'] },
  { id: 'sunset', name: 'Afterglow', note: 'Sunset / vivid', colors: ['#171a2b', '#28213c', '#3e2948', '#5c3454', '#87485c', '#b05b5c', '#d8795d', '#eea363', '#f4cc83', '#f3e6bc', '#a4b6b3', '#6f9ca9', '#536d95', '#b77d9e'] },
]

export type CustomPalette = { name: string; colors: string[] }
export const DEFAULT_CUSTOM: CustomPalette = {
  name: 'My palette',
  colors: ['#18211d', '#506f55', '#98b58c', '#e0d6bd', '#d58b68', '#8d514e'],
}

export function readCustomPalette(): CustomPalette {
  try {
    const saved = JSON.parse(localStorage.getItem('haishoku-custom-palette') ?? 'null')
    if (
      saved && typeof saved.name === 'string' &&
      Array.isArray(saved.colors) && saved.colors.length >= 2 && saved.colors.length <= 16 &&
      saved.colors.every((color: unknown) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))
    ) return { name: saved.name.slice(0, 28), colors: saved.colors }
  } catch { /* Use the built-in starting palette. */ }
  return DEFAULT_CUSTOM
}

export function readSelectedPalette(): string {
  try {
    const saved = localStorage.getItem('haishoku-selected-palette')
    if (saved && (saved === 'custom' || PALETTES.some(palette => palette.id === saved))) return saved
  } catch { /* Storage may be disabled. */ }
  return 'catMocha'
}
