/**
 * token-excerpts.const.ts — static values of the token excerpt sync (scripts/sync-token-excerpts.mjs).
 */

/*********************************************************
 * NO_TOKEN_SHEET
 *
 * @description
 * Replaces the one `sourceFile` sentinel that still spells out a path under
 * `packages/ds/tokens/` — a directory removed with the pipeline. Guard 10
 * lets it through because it contains a parenthesis and so fails its
 * path-shaped test, which is why it survived the earlier passes.
 *
 * @description
 * The sentinel's job is to tell the page there is nothing to link to. It does
 * that job without naming a directory that no longer exists.
 ********************************************************/
export const NO_TOKEN_SHEET = '(no dedicated token sheet)'

/*********************************************************
 * DROPPED_FIELDS
 *
 * @description
 * Keys stripped from every `tokens` block because nothing true is left for
 * them to say. `pipelineNote` described the Style Dictionary v4 /
 * Tokens Studio build on 125 of 129 components; that pipeline was deleted on
 * 2026-08-31, its render was masked by the owner on 2026-09-25, and the markup
 * went with the page refactor in `a81d2f342`.
 *
 * @description
 * Removed rather than rewritten, decided under #960: the section's legend
 * already tells every visitor these are hand-maintained sheets with no build
 * step, so a per-component note would repeat it 129 times, and restoring a row
 * the owner had removed is not this lot's call.
 *
 * @description
 * Stripping here rather than in a one-off edit is what keeps it gone — this
 * script runs in `docs-fixtures.yml`, so a fixture regenerated from an older
 * database drops the field again instead of resurrecting it.
 ********************************************************/
export const DROPPED_FIELDS = ['pipelineNote']
