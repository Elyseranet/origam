# `seed-tokens.json` — empty, and it must stay that way

`guard-seed-tokens.mjs` has two channels. Both are at **zero**, so this baseline
is an empty array and every finding is a failure.

- **notation** — hard, no baseline. Every token the catalogue documents names a
  `--origam-…` variable one of the hand-maintained sheets really declares, with
  the value the sheet gives it.
- **retired tooling** — baselined, and the baseline is **empty**. No field of
  any of the eight seed files names the Style Dictionary v4 /
  `@tokens-studio/sd-transforms` pipeline, the deleted `packages/ds/tokens/`
  sources, a removed `tokens/<layer>/<name>.json`, or `packages/figma-plugin/`.

## Why it is empty rather than holding the 129 `pipelineNote`

The first shape of this lot baselined 230 findings, all of them
`kind_extra.tokens.pipelineNote` — the field that carried *"Built with Style
Dictionary v4 + @tokens-studio/sd-transforms"* on 125 of 129 components, plus
one naming `packages/figma-plugin`. **The field has since been removed
outright**, so the baseline collapsed to nothing.

Removing it was the right call on three counts:

- **It was not content, it was dead data.** The row was masked on 2026-09-25 by
  an explicit owner decision, and the commented-out block carrying that decision
  went with the page refactor in `a81d2f342`. No visitor could read the field.
- **The legend already says it, better.** The Design-tokens section states on
  *every* component that these are hand-maintained sheets with no build step. A
  truthful `pipelineNote` would repeat that sentence 129 times.
- **The alternative added a row nobody asked for.** Restoring a PIPELINE line
  the owner had removed is not a side effect a data-correction lot gets to have.

⛔ **Do not reintroduce the field**, and do not restore the PIPELINE row in
`src/pages/components/[slug].vue`. `sync-token-excerpts.mjs` strips
`DROPPED_FIELDS` on every run, so a fixture regenerated from an older database
drops it again instead of resurrecting it.

## Adding an entry here

Don't. Fix the data instead. If a finding is genuinely not fixable in its own
lot, the entry needs a paragraph in this file saying what decides it — a bare id
in a JSON array tells the next reader nothing. A baseline diff that GROWS is a
review smell.

## The 80 excerpt lines this lot dropped, for the enrichment work

#960's re-derivation kept the 523 of 603 excerpt lines that resolve to a real
declaration and **dropped 80 that resolve to nothing**, rather than repointing
them at a neighbouring token. Ten components were left with no excerpt at all
and their `tokens` block was removed, so their Design-tokens section no longer
renders: `bracket`, `card-header`, `card-text`, `color-picker-preview`,
`color-picker-swatches`, `date-picker-controls`, `number-field`,
`theme-provider`, plus `defaults-provider` and `item-group`, which already had
an empty excerpt and were rendering a heading over an empty table.

Several of those components **do** declare tokens — `bracket` has 43 in
`light.css` — under names the old DTCG paths could not reach. Re-documenting
them is the enrichment lot, not this one. To reprint the current list:

```sh
node packages/marketing/scripts/sync-token-excerpts.mjs --check
```

## ⛔ The `cssVars` block has the SAME defect, three times larger — NOT fixed here

`kind_extra.tokens` is what #960 measured and what this lot corrects. Its
neighbour `kind_extra.cssVars` — rendered as the "CSS variables" section, one
section above Design tokens on the same page — carries the same dead notation
and nobody has counted it. Measured on `component.json` after this lot, against
the sheets:

| | |
|---|---|
| components with a `cssVars` block | **168** |
| `cssVars` lines | **1090** |
| — `defaultValue` still in DTCG braces (`{color.surface.disabled}`) | **539** |
| — `defaultValue` differing from the sheet's declared value | **543** |
| — `name` that NO sheet declares (rendered with a copy button) | **336** |
| — `name` + `defaultValue` both already correct | **211** |

**The defect next door is bigger than the one this lot fixes** — 1090 lines
against 603, on a section that sits directly above the corrected one.

The `name` side is already a `--origam-…` variable everywhere (0 exceptions),
so the 543 values are correctable by the same lookup this lot uses. The 336
undeclared names are a different question — dead variables, overlapping the
`token-var-channels` work — and deleting them blind would remove real
documentation of variables a component may still read with a fallback.

**It is deliberately out of this lot**, not an oversight: it is nearly twice the
line count, it touches a second rendered section, and it collides with work in
flight.

To reprint the table, compare each `cssVars[].name` / `.defaultValue` pair
against `loadDeclared()` from `../lib/token-sheet.mjs` — the same map the
token-excerpt correction is built on.
