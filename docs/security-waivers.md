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

**None.** `pnpm.auditConfig.ignoreGhsas` is absent from the root `package.json`,
and `pnpm audit --prod` returns `No known vulnerabilities found` with exit code
`0` without any advisory being suppressed.

Keep it that way by preference: a waiver is the fallback for what cannot be
fixed, not a way to close a ticket.

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
