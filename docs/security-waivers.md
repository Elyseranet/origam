# Security waivers

The pre-delivery policy requires **zero `high` or `critical` advisory** before a
feature merge or a release. A waiver suspends that rule for one specific
advisory, and only under the conditions below.

A waiver is not a way to make an alert quiet. It is a decision that the alert is
**not actionable** and that we accept a measured risk, in writing, with a date
and a way out. Anything that can be fixed is fixed instead.

## Rules

1. **Explicit approval by the maintainer.** Never granted by an agent or a
   contributor on their own initiative.
2. **Written justification**, including the dependency chain and an assessment
   of whether the vulnerable code is *reachable* in our usage.
3. **A remediation ticket**, so the waiver has an owner and an exit.
4. **A review date.** A waiver with no expiry becomes permanent by neglect.

Waivers live in `pnpm.auditConfig.ignoreGhsas` (root `package.json`). Every entry
there **must** have a matching section here — an unexplained identifier in that
list is a policy breach in itself.

---

## Active waivers

Keep this list short by preference: a waiver is the fallback for what cannot be
fixed, not a way to close a ticket.

### GHSA-86w9-cpqp-85rv (`node-forge`), GHSA-vfj7-8cjw-p6xm (`braces`), GHSA-hp3w-g68c-fv3c (`sprintf-js`)

- **Granted**: 2026-10-13, by the maintainer (Arnaud Prioul), explicitly
- **Review date**: 2026-11-13
- **Remediation ticket**: #1070 (parent audit ticket: #1065, PR #1068)
- **Why a waiver**: no patched version is published for any of the three
  (`patched_versions: <0.0.0`). Re-checked with `npm view` on 2026-10-13:
  `node-forge` 1.4.0, `braces` 3.0.3 and `sprintf-js` 1.1.3 are the latest
  releases. Removing the source was investigated and is not possible.

| advisory | severity | module | chain |
|---|---|---|---|
| GHSA-86w9-cpqp-85rv | high | `node-forge <=1.4.0` (RSA PKCS#1 v1.5 signature verification accepts extra nested DigestAlgorithm elements) | `nuxt > @nuxt/nitro-server > nitropack@2.13.4 > listhen > node-forge`. `nitropack` 2.13.4 and `listhen` 1.10.1 are the latest; `listhen` still depends on `node-forge ^1.4.0`. `nuxt` 4.6.1 / `@nuxt/cli` 4.0.1 dropped the CLI path, `nitropack` 2.x keeps its own |
| GHSA-vfj7-8cjw-p6xm | high | `braces <=3.0.3` (stack exhaustion on deeply nested brace patterns) | `@nuxtjs/i18n > @intlify/unplugin-vue-i18n > fast-glob > micromatch@4.0.8 > braces`, and `nitropack > globby > fast-glob > micromatch`. `vite-plugin-commonjs` (declared, never imported) was removed from `packages/ds` but is not the main source |
| GHSA-hp3w-g68c-fv3c | moderate | `sprintf-js <=1.1.3` | `@origam/stories > histoire > gray-matter > js-yaml@3 > argparse@1 > sprintf-js@1.0.3` |

- **Reachability** (assessment, not a proof): all three are build and dev
  tooling. After `pnpm -F @origam/marketing build`, `.output/server` contains no
  occurrence of `node-forge`, `braces` or `listhen`. Patterns and certificates
  are not supplied by end users: glob patterns come from build configuration,
  and `listhen` HTTPS is a dev-server feature. `sprintf-js` is reached only by
  the stories package (dev).
- **Exit**: drop the matching `ignoreGhsas` entry as soon as a patched version
  is published or the chain no longer resolves the module.

### Related: `patches/@nuxt__devtools@3.4.2.patch` (not a waiver)

Fixing `simple-git` (3 critical/high advisories, fixed only in `>=4`) forces
`simple-git@3` to `^4.0.2`, outside the range `@nuxt/devtools` declares
(`^3.36.0`). `simple-git` 4 has no default export, so `@nuxt/devtools` failed
at import time. The patch changes one line (`import { simpleGit as Git }`).
It is bound to the exact version 3.4.2: the next 3.x makes `pnpm install` fail
loudly. When that happens, check whether the new release already imports
`simple-git` 4 correctly; if so delete the patch, `pnpm.patchedDependencies`
and, if no longer needed, the `simple-git@3` override; otherwise regenerate the
patch with `pnpm patch @nuxt/devtools@<version>`. Tracked in #1070.

---

## Revoked

### GHSA-w3rx-r6r6-pgpr and GHSA-5p2g-fcmc-qvqq — `image-size`

- **Granted**: 2026-08-11, by the maintainer, explicitly (commit `bf05bf8ec`)
- **Revoked**: 2026-09-16, under issue #718
- **Reason for revocation**: the first listed revocation criterion fired — *"a
  patched `image-size` is published → drop the waiver, upgrade"*

The waiver rested on a fact that was exact when it was written: `image-size@2.0.2`
was the latest published version and was itself the vulnerable one, so there was
nowhere to upgrade to.

That stopped being true on **2026-09-14**, when `image-size` 2.0.3 and then 2.0.4
were published. Neither carries GitHub release notes, which is why the change was
easy to miss — the advisories' own vulnerable range is `<=2.0.2`, so any version
above it is out of scope.

The upgrade is pinned by `pnpm.overrides` (`"image-size": "^2.0.4"`).

#### The fix was verified in the code, not only in the semver range

GitHub still reports `first_patched_version: null` for both advisories, so the
range alone was not sufficient evidence. Both advisories describe an infinite
loop caused by a box offset that never advances. Comparing the published
tarballs of 2.0.2 and 2.0.4 shows the corresponding guards being added:

| file (2.0.4) | guard absent from 2.0.2 |
|---|---|
| `dist/esm/types/heif.js` | `const nextOffset = ispeBox.offset + ispeBox.size;` then `if (nextOffset <= currentOffset) throw new TypeError('Invalid HEIF')` |
| `dist/esm/types/heif.js` | `if (ispeBox.size < 20) throw new TypeError('Invalid HEIF')` |
| `dist/esm/types/jxl.js` | `if (jxlpBox.size < 12) throw new TypeError('Invalid JXL')` |
| `dist/esm/types/utils.js` | in `findBox`: `if (boxSize < BOX_HEADER_SIZE) { currentOffset += BOX_HEADER_SIZE; continue }` |

In 2.0.2 the HEIF loop ended on `currentOffset = ispeBox.offset + ispeBox.size`
with no lower bound on `size` — a zero-sized box left the offset where it was,
which is exactly the reported hang.
