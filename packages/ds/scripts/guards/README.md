# Architecture guards

Eight static-analysis checks over `packages/ds/src` that turn architecture
rules already written in `CLAUDE.md` into something the CI actually enforces.
None of them existed before this branch — every rule below was previously
"ask nicely in the doc and hope," which is why the debt they describe
(40+ misplaced declarations, 63 missing instance types, 71 mis-named files
across two guards) accumulated in the first place.

**These guards do not fix anything.** They stop the four specific problems
below from getting worse. The existing debt is grandfathered in a baseline
(see below) and is somebody else's ticket to clean up.

## Run locally

```bash
pnpm -F origam guards                      # all eight
pnpm -F origam guards:declarations         # guard 1 only
pnpm -F origam guards:variant-css          # guard 2 only
pnpm -F origam guards:instance-types       # guard 3 only
pnpm -F origam guards:naming               # guard 4 only
pnpm -F origam guards:unconsumed-props     # guard 5 only
pnpm -F origam guards:emits-completeness   # guard 7 only
pnpm -F origam guards:no-usedefaults       # guard 8 only
```

No build step required — every guard parses `.vue`/`.ts`/`.scss` source
text directly. The full suite runs in under a second.

## The nine guards

| # | Script | Rule | Baseline size |
|---|---|---|---|
| 1 | `no-declarations-in-vue.mjs` | No `interface`/`type`/`enum`/exported `const` declared inside a `.vue` | 12 |
| 2 | `no-variant-css.mjs` | No DS-shipped CSS rule targets a `--variant-*` class; no `!important` inside one (ADR-005 D3) | 36 |
| 3 | `instance-types.mjs` | Every `Origam{Name}.vue` has a matching `TOrigam{Name} = InstanceType<typeof Origam{Name}>` under `src/types/` | 63 |
| 4 | `file-naming.mjs` | `enum`/`type` filenames resolve (by longest-prefix match) to a real component name | 21 |
| 5 | `unconsumed-props.mjs` | Every declared prop reaches the render or the behaviour — the project's "bug n°1", a documented prop that silently does nothing | 1663 |
| 6 | `raw-props-usage.mjs` | `_props` may only feed `useDefaults()` | 0 |
| 7 | `emits-completeness.mjs` | Every REACHABLE `update:*` — including those a relay composable emits on the component's behalf — is declared by its emits interface | 5 |
| 8 | `no-usedefaults-in-components.mjs` | No component calls `useDefaults()` — the ADR-005 resolver already merges theme and provider defaults into `instance.props` | 0 |
| 9 | `layer-folders.mjs` | Every sub-folder of the six declaration layers names a real component, or is `Commons` | 0 |

Guard 9 is folder-level where guard 4 is file-level, and the pair is
complementary: a correctly-named file inside a misspelled folder passes 4
and fails 9. It shipped with issue #368 at a baseline of zero, because that
issue removed every violation it detects — `ExpensionPanel/`,
`DefaultProvider/`, the three folder names `TextareaField` was split
across, and the `Theme/` / `Mask/` / `CssSupport/` sub-system folders.
Merging those three into `Commons/` is what let BOTH guard 4's and guard
9's exemption lists collapse to `['Commons']`.

`src/directives/` is deliberately OUT of its scope — its six sub-folders
have no homonymous component, and the maintainer explicitly declined moving
them to `Commons/`. Don't "fix" that omission; see the script header.

Guard 6 is now vacuous in practice: with guard 8 at zero, no component
declares `_props` at all, so guard 6's "only `useDefaults` may read it"
exception can never fire. It is kept because it still catches the
reintroduction of a raw `_props` binding, which is the first half of
re-adding the call guard 8 forbids.

Guard 5's baseline is an order of magnitude larger than the others, and
**72 % of it is one defect**: three cross-cutting `Commons` interfaces
advertise a per-side / per-corner surface no composable reads
(`marginTop`…`marginInline`, `paddingTop`…`paddingInline`, the four
`rounded{Corner}`, plus `loadingText`) — 1 195 of the 1 663 entries, across
~100 components. That is the finding, not guard noise. See
`packages/tests/TU/origam/dead-commons-props.spec.ts` for the runtime proof.
Fixing `usePadding` alone will turn ~600 entries stale at once, which is
precisely the pressure the baseline is meant to apply.

Unlike the other four, this guard's detection is cross-validated against a
runtime sweep rather than only reviewed: **precision 100 %** (0 false
positives over 1 317 flagged pairs), **recall 82.3 %**.

**Baseline audited by sampling.** 30 entries drawn at random from the 1 663
(seeded, reproducible) and checked one by one: **30 inert, 0 false
positives**. 22 already carried a runtime verdict from the sweep; the other
8 were settled individually — 4 by runtime mount (see
`packages/tests/audit/sample-verification.spec.ts`, which had to wrap
`OrigamMain` in an `OrigamLayout` to get past the layout injection), and 4
by showing the identifier occurs nowhere in `src/` outside the interface
that declares it. Observed error rate 0 %; with n=30 and 0 errors the
95 % upper bound is ≈10 % (rule of three), so the honest claim is "no
false positive found in 30", not "there are none".

⚠️ Its first baseline was 3 340 and was wrong — half of it was props
FORWARDED to a child through `filterProps(props, …)`, which the detector
mis-classified as a local read. The correction is documented in the script
header, together with why the original precision measurement failed to
catch it (the forwarding-heavy components are overlays, which render
nothing while closed and were therefore outside the measured population).

### Guard 7 — precision, and why the reachability filter is the whole point

`emits-completeness` is cross-validated against a runtime sweep, not merely
reviewed. Every one of its 5 baselined findings was mounted and made to
emit: **precision 100 % (5/5, zero false positives)**. Two of the five are
corroborated by Vue's own dev warning (`OrigamSelect`, `OrigamDrawer`); the
other three emit in total silence because they have no `defineEmits` at all
— with `emitsOptions === null`, Vue never warns, whatever the component
emits. That silent class is exactly what the guard exists to see.

**The reachability filter is what makes it usable.** A naive "does this
component call a relay with `props`?" sweep returns 20 candidates for 7 real
defects — **precision 35 %, measured**, not estimated. Requiring the write
path to actually exist (`onActive` destructured for `useActive`; the
`useVModel` ref written or `v-model`-bound) is what lifts it to 100 %.
Without that filter the guard would push authors to declare emits "just in
case", which is a **behaviour change, not neutral hygiene**: declaring an
emit a component never fires removes its handler from `$attrs` and so
changes what `inheritAttrs` puts on the root element.

Two false-positive traps were found and fixed while measuring, both worth
knowing before touching the detection logic:

- **Empty single-line interface bodies.** `export interface IXEmits extends
  IYEmits {}` has no `\n}`, so a lazy `\{([\s\S]*?)\n\}` body regex ran on
  to a LATER interface's closing brace and swallowed its declaration. Any
  component whose interface got swallowed resolved to an EMPTY declared set
  and was flagged. `OrigamColorPicker` was reported this way and is in fact
  correct — `IColorPickerEmits extends IColorModeEmits` does declare
  `update:mode`. The body is now delimited by brace counting.
- **A probe that never reaches the write path.** `OrigamDrawer` looked clean
  under a mount-and-click probe and was wrongly cleared by hand; its write
  lives in `watch(isTemporary, …)`, so only flipping `temporary` false→true
  reaches it. The guard was right and the manual sweep was wrong. Same trap
  as the empty-`OrigamForm` mount described in
  `packages/tests/TU/origam/relay-emits-declaration.spec.ts`.

Each script's file header explains its detection method, the false-positive
trap it specifically avoids, and (guards 1 and 4) the scoping decision made
to keep it reliable. Read the header before touching the detection logic —
the reasoning for what's IN and OUT of scope lives there, not here.

## The baseline mechanism — why, and how it works

Three of these four guards would fail immediately if introduced with an
empty baseline (guard 2 as well, in practice — see "what we found that
contradicted the brief" below). A guard that's red on day one gets disabled
within a week; that is the actual failure mode this mechanism exists to
prevent, not a hypothetical one.

Each guard ships `baseline/<guard>.json` — a flat, sorted JSON array of
stable violation IDs (never line numbers — a baseline keyed on a line number
breaks the moment someone edits an unrelated line above it). Every guard run
computes the CURRENT violation set and diffs it against that file:

- an ID that's **new** (not in the baseline) → the build goes **red**.
- an ID that's **stale** (in the baseline, no longer detected — i.e. someone
  fixed it) → the build **also** goes red, telling you to delete that line.
- anything else (exact match) → **green**.

This gives exactly the three properties asked for:

1. **A brand-new violation always reddens CI.** It is never silently
   absorbed by "the total count is still under some threshold" — that
   pattern (a shrinking-only *count*) would let someone fix two and
   introduce one without ever going red. This mechanism compares the
   actual *set*, not a count, so that can't happen.
2. **An already-known violation never blocks a PR that doesn't touch it.**
   Baselined debt stays baselined until someone deliberately fixes it.
3. **The known stock can only shrink.** Fixing a violation makes its ID
   disappear from the CURRENT scan, which turns the matching baseline line
   stale — CI stays red until that line is deleted. There's no way to "fix
   it and leave the baseline as-is for later."

### Retiring a baseline entry (once you've fixed the underlying violation)

1. Fix the code.
2. Run the guard locally: `pnpm -F origam guards:<name>`.
3. It fails with "STALE baseline entr(y|ies)" and prints exactly which
   line(s) to delete from `baseline/<guard>.json`.
4. Delete those lines, in the **same commit** as the fix.

### Establishing a new baseline (rare — only after a reviewed bulk change)

Every guard accepts `--update-baseline`, which overwrites its baseline file
with the exact current violation set:

```bash
node packages/ds/scripts/guards/instance-types.mjs --update-baseline
```

This is **not** a way to make a failing guard pass. Using it to add a new
violation to the baseline defeats the entire point of this mechanism and
will read as exactly that in review — a baseline diff that *grows*, or that
adds an ID unrelated to a reviewed bulk change, is a red flag, not a
convenience. The legitimate use is narrow: after an intentional, reviewed
change that shifts a large number of IDs at once (e.g. a repo-wide rename
that changes hundreds of stable IDs' text without changing what they mean),
regenerating is faster and less error-prone than hand-editing hundreds of
JSON lines. The reviewer's job in that case is to confirm the *diff*
matches the described bulk change — nothing more went in with it.

**Known limitation of any baseline mechanism**: nothing stops someone from
introducing a real new violation and adding its ID to the baseline in the
same commit, defeating the guard. This is a code-review responsibility, not
something a script can close — when reviewing a PR that touches a
`baseline/*.json` file, check that every added line corresponds to a
violation that already existed before the PR (or, if the PR intentionally
adds one, that this was a discussed, explicit decision, documented in the
PR description, per `CLAUDE.md`'s exception policy).

## Reading a failure

```
──────────────────────────────────────────────────────────────────────
Guard: instance-types (every Origam*.vue must expose TOrigamXxx = InstanceType<typeof OrigamXxx>)
──────────────────────────────────────────────────────────────────────

FAIL — 1 NEW violation(s) not in the baseline:

  ✗ Foo
      Origam Foo (packages/ds/src/components/Foo/OrigamFoo.vue) has no matching `export type TOrigamFoo = InstanceType<typeof OrigamFoo>` under src/types/

Add `export type TOrigam{Name} = InstanceType<typeof Origam{Name}>` to a file under packages/ds/src/types/{Domain}/{kebab-case}.type.ts, and re-export it from types/index.ts.
──────────────────────────────────────────────────────────────────────
```

The `✗ Foo` line is the stable ID (what would need to go in the baseline —
don't add it, fix it instead). The indented line under it is the
human-readable detail. The line at the bottom is the fix hint, specific to
that guard.

## What we found that contradicted the brief

The task that produced these guards stated three of the four would fail
immediately on an empty baseline. Verifying against the actual repository
state on `develop` found a fourth: **guard 2 (no variant CSS) also fails
immediately** — 36 violations across `OrigamBtn`, `OrigamBtnGroup`,
`OrigamKbd` (ADR-005's own pilot component), `OrigamBlockquote` and
`OrigamSliderField`. ADR-005 (accepted 2026-08-12) specifies this exact
guard as part of its own D3 decision, but its migration had not landed on
`develop` at the time this branch was cut — only the ADR document had. All
36 are grandfathered the same way as the other three guards' debt.

Guard 4's real count also differs from the number quoted in the brief (71).
Comparing every `enum`/`type` filename against the real component list by
longest-prefix match — not by "does the name contain a hyphen," which is
what produced the original 166-then-71 estimate — finds **21** genuine
violations (14 `types/`, 7 `enums/`), all falling into two patterns: a
domain folder whose name doesn't match any component at all (`Mask/` — the
real component is `TextMask`, not `Mask`; `Theme/` — the real component is
`ThemeProvider`), or a file describing a sub-concept one segment removed
from its component's actual name (`Textarea/textarea-mode.*` when the
component is `TextareaField`, not `Textarea`). See the "Theme/ ambiguity"
note in `file-naming.mjs`'s violation list — those four files
(`theme.type.ts`, `installed-theme.type.ts`, `semantic-tree.type.ts`,
`token-tree.type.ts`) describe the theming *system*, not the
`OrigamThemeProvider` *component*; whether they deserve a `Commons`-style
exemption instead of being counted as violations is an open architecture
question this guard surfaces but does not decide — that call belongs to
whoever owns the theming system's file layout, not to a lint script.

## What we could NOT build reliably (and didn't ship)

**Guard 1's original scope included banning any `const` declared in a
`.vue`.** A first, literal implementation (any top-level
`SCREAMING_SNAKE_CASE` `const`) flagged **152** additional candidates
beyond the 12 interface/type violations. A manual sample of those 152
found 0 exported and all of them private, single-use rendering constants
local to one component's own layout math (`SVG_WIDTH`, `PADDING`,
`TICK_SIZE` inside `Chart` subcomponents) — not the shared "business
constant" the `src/consts/*.const.ts` rule exists to centralise. Nothing in
static analysis can reliably tell "this constant conceptually belongs in a
shared file" apart from "this is fine to keep local to the one component
that uses it" — that distinction depends on whether the value is meant to
be reused elsewhere, which is a semantic judgment, not a syntactic one.
Shipping the naive version would have reproduced the exact failure mode
this whole effort exists to avoid (a guard disabled within a week for
crying wolf), so **the `const` check was narrowed to `export const
SCREAMING_SNAKE_CASE` only** — the one const-in-a-`.vue` shape that is
unambiguous (nothing should ever import a value FROM a `.vue` file instead
of from `src/consts/`). Currently 0 files match that narrower shape, so
guard 1's baseline covers only the 12 interface/type declarations. Private,
non-exported `SCREAMING_SNAKE_CASE` locals inside a component are
knowingly NOT covered by this guard. If the maintainer wants that surface
covered, it needs a different signal than casing + scope (e.g. "is this
value referenced from more than one component" — that requires cross-file
analysis this guard doesn't attempt) rather than a heuristic that would
flag 152 legitimate local constants to catch a handful of real ones.

## CI cost

Added as its own job, `architecture-guards`, in `.github/workflows/ci.yml`
(parallel to `lint`, no shared dependency). Measured on this repo: **~0.9s**
for all five guards combined (see `run-all.mjs`'s own timing line), plus the
job's fixed `actions/checkout` + `pnpm install --frozen-lockfile` overhead
already paid by every other job in the pipeline. No `tokens:build` or other
prerequisite — the guards never touch generated token types, so this job
has no `needs:` and runs independently of the `tokens` job.
