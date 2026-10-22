/**
 * changelog-generator.const.ts — static rules of the CHANGELOG.md → changelog data generator (scripts/generate-changelog.mjs).
 */

/** Highlights shown per release card. The 9 curated entries use 2..6. */
export const MAX_HIGHLIGHTS = 6

/**
 * Character budget for one extracted string. The 9 curated entries measure
 * 44..128 for a highlight and 58..182 for a summary; staying close keeps the
 * card's visual rhythm. MIN_* pulls in a second sentence when the first one
 * is a stub ("Hotfix.").
 */
export const MAX_TEXT = 150

export const MIN_TEXT = 40

export const MAX_SUMMARY = 190

export const MIN_SUMMARY = 60

/**
 * Keep-a-Changelog section vocabulary → IChangelogHighlight['type'].
 * TChangelogHighlightType only has 4 members; `Removed` and `Security` are
 * folded onto the nearest one rather than inventing a type the page cannot
 * colour or icon.
 */
export const SECTION_TYPE = {
    added: 'added',
    changed: 'changed',
    fixed: 'fixed',
    deprecated: 'deprecated',
    removed: 'deprecated',
    security: 'fixed'
}

/**
 * Section families that are NOT release highlights. Matched on the part of
 * the title before any ` — `, lowercased. Exhaustive as of 2.18.0; an
 * unknown title aborts the run (see classifySection).
 */
export const SKIP_SECTIONS = [
    'internal',
    'tooling',
    'documentation',
    'known issues',
    'known limits',
    'notes for consumers',
    'outstanding',
    'deep import paths are not a supported api',
    /*
     * 2.18.0 — la note rétrospective qui recense les 9 ruptures entrées par
     * des versions mineures. C'est de la prose éditoriale, pas un fait de
     * release : les ruptures elles-mêmes remontent déjà en highlights depuis
     * leurs propres sections `### ⚠️ BREAKING` de la 2.17.0 et de la 2.18.0,
     * et les faire remonter une seconde fois par cette note les compterait
     * deux fois sur la carte de version.
     */
    '⛔ note rétrospective'
]

/** Section titles that are prose prefixes rather than a vocabulary word. */
export const SKIP_PREFIXES = ['migrating from']

/** A `### ⚠️ BREAKING — …` section. Its title is the highlight. */
export const BREAKING_RE = /^\s*(?:⚠️|:warning:)\s*BREAKING\b/i

/** `## [2.17.1] - 2026-09-14` / `## [2.12.1] — 2026-07-31` / `## [Unreleased]` */
export const VERSION_RE = /^##\s+\[([^\]]+)\]\s*(?:[-–—]\s*(\d{4}-\d{2}-\d{2}))?\s*$/
