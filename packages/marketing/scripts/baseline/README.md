# `seed-tokens.json` — what is in this baseline, and why

`guard-seed-tokens.mjs` has two channels. Only the second one is baselined.

- **notation** — hard, no baseline, **0 entries**. Every token the catalogue
  documents names a `--origam-…` variable one of the hand-maintained sheets
  really declares, with the value the sheet gives it.
- **retired tooling** — baselined, **230 entries**, and every one of them is a
  `kind_extra.tokens.pipelineNote` naming the Style Dictionary v4 /
  `@tokens-studio/sd-transforms` pipeline removed on 2026-08-31. One of them
  (`btn`) additionally names `packages/figma-plugin`, a directory removed with
  it.

## Why 230 entries and not zero — the field is under arbitration

`pipelineNote` is a **decision the repository owner has not yet taken**, and
#960 asks for it to be put to him rather than settled in passing. The two
options are not equivalent:

- **delete the field** from the seed and from
  `src/interfaces/components-catalog.interface.ts` — the catalogue stops
  carrying a sentence about how tokens are produced at all;
- **rewrite it truthfully** and restore the row the page used to render — the
  catalogue says "hand-maintained sheet, no build step" on every component.

Both are one commit. Neither is reversible for free, because the second one
also decides that the detail page gets a PIPELINE row back.

**The field is not rendered today.** It was masked on 2026-09-25 by an explicit
owner decision, and the commented-out block carrying that decision was removed
by `a81d2f342` ("refactoring component page", 2026-09-28) along with the rest
of the section's markup. So the 230 strings are committed data that no visitor
can read — a real defect in the archive, not a live one on the page.

That is exactly what a baseline is for: the stock is frozen and can only
shrink. Whichever option the owner picks, applying it empties this file, and
the guard goes red until the file is emptied in the same commit.

## Retiring entries

Fix the data, run the guard, delete the lines it reports as STALE — in the same
commit. Never add an id here to make the guard pass.

```sh
pnpm -F @origam/marketing guard:seed-tokens
```

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

The `name` side is already a `--origam-…` variable everywhere (0 exceptions),
so the 543 values are correctable by the same lookup this lot uses. The 336
undeclared names are a different question — dead variables, overlapping the
`token-var-channels` work — and deleting them blind would remove real
documentation of variables a component may still read with a fallback.

**It is deliberately out of this lot**, not an oversight: it is three times the
surface, it touches a second rendered section, and it collides with work in
flight.

To reprint the table, compare each `cssVars[].name` / `.defaultValue` pair
against `loadDeclared()` from `../lib/token-sheet.mjs` — the same map the
token-excerpt correction is built on.
