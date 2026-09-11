/**
 * color.ts — hex ↔ Figma RGB/RGBA conversion helpers.
 *
 * The Figma API uses `RGB` and `RGBA` where each channel is a 0..1 float.
 * Origam design tokens store colors as `#RRGGBB`, `#RRGGBBAA`, or
 * `rgba(r, g, b, a)` CSS strings.
 *
 * This module is pure (zero Figma API calls) so it can be unit-tested with
 * Vitest outside the Figma sandbox.
 */

// ---------------------------------------------------------------------------
// Internal types mirroring the Figma API without importing plugin typings
// (this file is shared between main-thread and UI contexts).
// ---------------------------------------------------------------------------

export interface RGB {
  r: number // 0..1
  g: number // 0..1
  b: number // 0..1
}

export interface RGBA extends RGB {
  a: number // 0..1
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

/**
 * Parse a 2-char hex string and return a 0..1 float.
 * @throws if the string is not a valid 2-char hex pair.
 */
function hexByte(str: string, offset: number): number {
  const hex = str.slice(offset, offset + 2)
  const n = parseInt(hex, 16)
  if (isNaN(n)) throw new Error(`[color] invalid hex byte "${hex}" at offset ${offset}`)
  return n / 255
}

/**
 * Expand shorthand hex (`#RGB` or `#RGBA`) to `#RRGGBB` or `#RRGGBBAA`.
 */
function expandShorthand(hex: string): string {
  if (hex.length === 4) {
    // #RGB → #RRGGBB
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  if (hex.length === 5) {
    // #RGBA → #RRGGBBAA
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + hex[4] + hex[4]
  }
  return hex
}

/**
 * Normalise and validate a hex color string.
 * Accepts `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`.
 * Returns the normalised uppercase form without the `#` prefix.
 * @throws on invalid input.
 */
function normaliseHex(raw: string): { digits: string; hasAlpha: boolean } {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('#')) {
    throw new Error(`[color] expected hex string starting with "#", got "${raw}"`)
  }

  const expanded = expandShorthand(trimmed).toUpperCase()

  if (!/^#[0-9A-F]{6}([0-9A-F]{2})?$/.test(expanded)) {
    throw new Error(`[color] invalid hex color "${raw}"`)
  }

  return {
    digits: expanded.slice(1),
    hasAlpha: expanded.length === 9,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a hex color string to a Figma `RGB` (alpha discarded, defaults to 1).
 * Accepts `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`.
 * @throws on invalid input.
 */
export function hexToRgb(hex: string): RGB {
  const { digits } = normaliseHex(hex)
  return {
    r: hexByte(digits, 0),
    g: hexByte(digits, 2),
    b: hexByte(digits, 4),
  }
}

/**
 * Convert a hex color string to a Figma `RGBA`.
 * If no alpha channel is present, defaults to `a: 1`.
 * Accepts `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`.
 * @throws on invalid input.
 */
export function hexToRgba(hex: string): RGBA {
  const { digits, hasAlpha } = normaliseHex(hex)
  return {
    r: hexByte(digits, 0),
    g: hexByte(digits, 2),
    b: hexByte(digits, 4),
    a: hasAlpha ? hexByte(digits, 6) : 1,
  }
}

/**
 * Convert a Figma `RGB` (0..1 channels) to `#RRGGBB`.
 */
export function rgbToHex(rgb: RGB): string {
  const toHexByte = (n: number): string =>
    Math.round(Math.min(1, Math.max(0, n)) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()

  return `#${toHexByte(rgb.r)}${toHexByte(rgb.g)}${toHexByte(rgb.b)}`
}

/**
 * Convert a Figma `RGBA` (0..1 channels) to a hex string.
 * Returns `#RRGGBB` when `alpha === 1`, otherwise `#RRGGBBAA`.
 */
export function rgbaToHex(rgba: RGBA): string {
  const base = rgbToHex(rgba)
  if (rgba.a === 1) return base

  const alphaByte = Math.round(Math.min(1, Math.max(0, rgba.a)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return `${base}${alphaByte}`
}

/**
 * Parse a CSS color string (`#hex`, `rgb(...)`, `rgba(...)`) into an `RGBA`.
 * Used by the exporter to round-trip CSS token values.
 * @throws on unrecognised format.
 */
export function parseCssColor(input: string): RGBA {
  const trimmed = input.trim()

  // Hex shorthand / long form
  if (trimmed.startsWith('#')) {
    return hexToRgba(trimmed)
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(
    trimmed,
  )
  if (rgbaMatch) {
    const clamp = (n: number): number => Math.min(1, Math.max(0, n))
    const r = clamp(parseFloat(rgbaMatch[1]) / 255)
    const g = clamp(parseFloat(rgbaMatch[2]) / 255)
    const b = clamp(parseFloat(rgbaMatch[3]) / 255)
    const a = rgbaMatch[4] !== undefined ? clamp(parseFloat(rgbaMatch[4])) : 1

    if ([r, g, b, a].some(isNaN)) {
      throw new Error(`[color] failed to parse channel values in "${input}"`)
    }

    return { r, g, b, a }
  }

  throw new Error(`[color] unsupported CSS color format: "${input}"`)
}
