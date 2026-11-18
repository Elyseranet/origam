/**
 * origam-reset-generator.const.ts — guard rails of the origam theme reset generator (scripts/generate-origam-reset.mjs).
 */

/*
 * ⛔ Refuse to write an amputated reset. The previous version of this script
 * printed `dark: 0 vars` and exited 0 — a generator that silently empties half
 * its output is indistinguishable from one that is merely up to date. Same
 * failure family as #903 (`presets:generate`, 804 lines amputated).
 * The threshold is deliberately loose: it catches "the block was not found",
 * not "a few tokens were removed".
 */
export const MIN_VARS = 500
