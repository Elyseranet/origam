/**
 * seed-tokens-guard.const.ts — retired token names of the seed-tokens guard (scripts/guard-seed-tokens.mjs).
 */

/*********************************************************
 * RETIRED
 *
 * @description
 * The names of things that were deleted on 2026-08-31 and can therefore never
 * be true again in this repository. Each is matched case-insensitively against
 * every string the seed carries.
 *
 * @description
 * `packages/ds/tokens/` is listed as a path fragment rather than a bare
 * `tokens` so an honest mention of the surviving token SHEETS is not flagged.
 *
 * @description
 * ⛔ The DTCG sources are matched by TWO patterns, because the seed spells
 * them both ways. `GRID_GAP_SIZE_VAR` cited `tokens/component/grid.json` with
 * no `packages/ds/` prefix, so the repo-relative pattern alone did not see it;
 * it was caught only because the same sentence also said "Style Dictionary",
 * which is luck, not coverage. `tokens/<layer>/<name>.json` is the removed
 * pipeline's own layout and cannot describe anything that exists now.
 ********************************************************/
export const RETIRED = [
    { label: 'Style Dictionary', re: /style dictionary/i },
    { label: '@tokens-studio/sd-transforms', re: /tokens-studio/i },
    { label: 'packages/ds/tokens/ (removed DTCG sources)', re: /packages\/ds\/tokens\//i },
    { label: 'a removed DTCG token file (tokens/<layer>/<name>.json)', re: /\btokens\/[a-z-]+\/[a-z0-9-]+\.json/i },
    { label: 'packages/figma-plugin/ (removed)', re: /packages\/figma-plugin/i }
]
