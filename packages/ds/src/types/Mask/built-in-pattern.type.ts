import type { BUILT_IN_PATTERN } from '../../enums'

/**
 * Discriminated union of every curated mask preset shipped
 * with origam. New presets must be added to
 * `BUILT_IN_PATTERN` AND `BUILT_IN_PATTERNS` (const map).
 */
export type TBuiltInPattern = typeof BUILT_IN_PATTERN[keyof typeof BUILT_IN_PATTERN]
