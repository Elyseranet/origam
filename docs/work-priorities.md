# Work priorities and versioning

The order in which work is picked up, and how a release number is chosen. Set by
the maintainer; this file exists so the rule outlives any single conversation.

## Order of work

**1. Fixes.** A bug in production costs a user something right now. Nothing
outranks it.

**2. Refactoring.** Not a nicety, and not "later" — *a refactor is a bug seen
from the developer's side*. Badly placed code does not break at runtime; it
breaks the next person who has to find something in it. Someone hunting a cause
through misfiled interfaces, duplicated enums or a component that declares its
own types spends hours where they should have spent minutes.

That cost is invisible on a dashboard, which is exactly why it gets postponed —
and why it is ranked second here rather than last.

**3. Features**, simplest first. A small feature shipped is worth more than a
large one in progress, and the simple ones surface the constraints the complex
ones will hit.

## Choosing the version

| Increment | When |
|---|---|
| **Major** (`1.x.x`) | A large feature that changes what the user does, or a breaking change |
| **Minor** (`x.1.x`) | A medium feature, limited impact on existing usage |
| **Patch** (`x.x.1`) | A bug fix |

A dependency upgrade is not automatically a patch. Moving a test runner across
major versions is a *medium feature* — it changes how the project is built and
verified, even though no user-facing behaviour moves. Judge by the size of the
change and its impact, not by the file it touches.

## Why this is written down

Three defects found on 2026-08-13 had the same shape: the rule existed, nothing
enforced it, and it decayed.

- Variant CSS drifted until a DS component was working around the DS's own
  stylesheet (`OrigamPagination` forcing `variant: flat` to escape a
  `!important`).
- The marketing build broke for days while CI stayed green, because no job
  built it.
- Six e2e tests were marked `fixme` for months against two successive diagnoses,
  both wrong, because nothing checked the test harness itself.

A convention that does not fail a build is an optional convention. Where a rule
here can be checked mechanically, it should be — see
`packages/ds/scripts/guards/` for the architecture guards that now do exactly
that, and `docs/security-waivers.md` for how a deliberate exception is recorded
rather than left implicit.

This document is the ordering rule. It is not enforceable by a script — but it
is at least written where the next person will find it.
