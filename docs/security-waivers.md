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

## GHSA-w3rx-r6r6-pgpr and GHSA-5p2g-fcmc-qvqq — `image-size`

- **Severity**: `high` (both) — denial of service
- **Granted**: 2026-08-11, by the maintainer, explicitly
- **Review**: 2026-11-11, or sooner if a patched `image-size` is published
- **Ticket**: track the publication of a fixed `image-size` upstream

### Why it is not remediable

`image-size@2.0.2` is **the latest published version, and it is itself the
vulnerable one** — the advisory lists `Patched versions: <0.0.0`, meaning no
release fixes it. Verified on 2026-08-11: `npm view image-size version` returns
`2.0.2`, and `nuxt-seo-utils@latest` still depends on `image-size@^2.0.2`.
Upgrading `@nuxtjs/seo` changes nothing.

There is no version to move to. The choice is between a documented waiver and a
permanently red gate that everyone learns to ignore — which is strictly worse,
because it hides the next real advisory.

### Dependency chain

```
@origam/marketing (private, never published)
└─ @nuxtjs/seo 5.3.10
   └─ nuxt-seo-utils 8.3.3
      └─ image-size 2.0.2
```

### Why the exposure is nil

**It never reaches a consumer.** The published `origam` package declares exactly
two runtime dependencies — `@mdi/font` and `qrcode-generator`. `image-size`
arrives only through `@origam/marketing`, which is `private: true` and is never
published. Nobody installing `origam` receives it.

**The vulnerable code is not reached even in our own build.** The single call is
`getImageDimensions()`, invoked by `generateTagsFromPageDirImages(nuxt)` — a
Nuxt module hook that runs at build time and globs the `pages/` directory. Its
globs accept only `png, jpg, jpeg, gif, ico, svg`. **ICNS, JXL and HEIF — the
exact formats of both advisories — are not in that list.** And `image-size` is
absent from `.output/server/node_modules` after a build.

**The residual path, stated rather than hidden.** `image-size` detects format by
magic bytes, not by extension. A file named `icon.png` that actually contains
ICNS data would route to the vulnerable parser. That file would have to be
committed by us, into our own repository — it is trusted input, not an attack
surface. A build-time denial of service on an asset we commit ourselves, in a
package that is never published, is not equivalent to an exploitable flaw in a
consumer's application.

### What would revoke this waiver

- A patched `image-size` is published → drop the waiver, upgrade.
- `image-size` starts being reached at **runtime** rather than build time.
- The dependency enters the published `origam` package.
- An advisory is upgraded to `critical`, or gains a network-reachable vector.
