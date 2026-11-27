/**
 * Nav & footer — SSR reality check (audit-ssr-nav)
 *
 * The bug this guards against: the marketing site's nav and footer render
 * EMPTY in the HTML actually served by the server. No existing test ever
 * saw it, for a structural reason: `nav-link-availability.spec.ts` only
 * asserted AFTER `waitForNavReady()` (post-hydration), so a server that
 * emits zero links is invisible to it by construction.
 *
 * This spec never opens a browser page and never runs client JS. It uses
 * Playwright's `request` fixture — a plain HTTP client — so what it reads
 * is exactly the bytes the server sent: the same thing `curl` or "View
 * Source" would show, before any hydration. That is the one guarantee
 * `nav-link-availability.spec.ts` (browser-driven, post-hydration) can
 * never give, however it's rewritten.
 *
 * Baseline measured on `develop` BEFORE the fix (commit 73393b85, via
 * `pnpm -F @origam/marketing dev`): same-origin `<a href="/…">` count in
 * the raw HTML — `/` : 4, `/components` : 2, `/installation` : 3,
 * `/support` : 2. Independently re-measured for this branch — see the PR
 * description for the actual numbers captured. Every test below must FAIL
 * on that state; a test that doesn't fail red first proves nothing.
 *
 * HISTORIQUE (retiré par #1596, voir le test du pied de page plus bas) — contrat du plan du site
 * (normative, fixed 2026-08-31, revised same day
 * once `fix-nav-ssr` landed real markup — both branches target this):
 *
 *   <nav class="site-footer__sitemap" data-cy="footer-sitemap" aria-label="…">
 *     <h3>…</h3><ul><li><a href="/why-origam">…</a></li>…</ul>
 *     <h3>…</h3><ul>…</ul>
 *     <h3>…</h3><ul>…</ul>
 *   </nav>
 *
 * Exactly the 16 `NAV_SECTIONS` links, in `NAV_SECTIONS` order, 3 `<h3>`
 * (one per section), 3 `<ul>`. Links are plain `<a href>` (not
 * `<nuxt-link>` — `/docs/` and `/stories/` are static builds copied into
 * `public/`, not Nuxt routes, so a router-link would 404 client-side);
 * consequence: don't assert on a `router-link-active` class for them.
 *
 * `/theming` is NOT in the sitemap — it does not need it. Once the
 * availability-probe gating is removed, it renders unconditionally as a
 * plain SSR `<a href="/theming">` inside `.primary-nav` (it already did,
 * conditionally, before the fix — it's the one nav link that was never
 * trapped in a closed `<origam-menu>`). This spec locks that in as a
 * regression guard.
 *
 * `/stories/` and `/docs/` — SETTLED (2026-08-31): one container serves the
 * whole `origam.*` site, `/docs/` and `/stories/` are sub-paths (VitePress
 * `base: '/docs/'` / Histoire's own `base`, both built into
 * `packages/marketing/public/`, confirmed by `packages/marketing/Dockerfile`:
 * "One container = the whole origam.* site"). Their hrefs are stable and
 * asserted nommément, same as the other 14. This spec does NOT request
 * `/docs/` or `/stories/` themselves — those directories only exist after
 * `build:embeds` runs (gitignored, absent on a fresh checkout) and CI
 * already guards their presence (`test -f …/public/docs/index.html`).
 * Asserting a fetch here would redden this spec for a reason that has
 * nothing to do with what it tests: internal maillage, not embed builds.
 */

import { expect, test } from '@playwright/test'

interface IPageBaseline {
    path: string
    baselineInternalLinks: number
}

const PAGES_WITH_BASELINE: IPageBaseline[] = [
    { path: '/', baselineInternalLinks: 4 },
    { path: '/components', baselineInternalLinks: 2 },
    { path: '/installation', baselineInternalLinks: 3 },
    { path: '/support', baselineInternalLinks: 2 }
]

const THEMING_HREF = '/theming'

/**
 * Only counts `<a href="/…">` — NOT `<link href>` (stylesheets), `<img>`,
 * or anything else. `nuxt dev` injects hundreds of `<link href="/_nuxt/…">`
 * asset tags into `<head>`; a naive `href="…"` regex counts those too and
 * passes vacuously regardless of whether the nav/footer render a single
 * navigational link. Verified: without the `<a\b` anchor this function
 * returned 100+ "internal links" on the unfixed `/` page — same class of
 * bug this whole spec exists to catch.
 */
function extractInternalHrefs (html: string): string[] {
    const hrefs: string[] = []
    const re = /<a\b[^>]*\bhref="(\/(?!\/)[^"]*)"[^>]*>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null) hrefs.push(m[1])
    return hrefs
}

/**
 * Extracts every `<openTag>…</closeTag>` block from raw HTML, matching by
 * a regex for the opening tag (so it can require a specific class/attribute)
 * and a literal string for the closing tag. Handles zero, one, or several
 * repeated blocks — the footer-sitemap contract doesn't pin down whether
 * the markup is one `<nav>` with several `<ul>` or several `<nav>` blocks,
 * so this stays agnostic to either shape.
 */
function extractTaggedBlocks (html: string, openTag: RegExp, closeTag: string): string[] {
    const blocks: string[] = []
    const re = new RegExp(openTag.source, 'g')
    let match: RegExpExecArray | null
    while ((match = re.exec(html)) !== null) {
        const start = match.index
        const end = html.indexOf(closeTag, start)
        if (end === -1) break
        blocks.push(html.slice(start, end + closeTag.length))
        re.lastIndex = end + closeTag.length
    }
    return blocks
}

test.describe('Nav & footer sitemap — presence in the HTML served, no JS', () => {

    for (const { path, baselineInternalLinks } of PAGES_WITH_BASELINE) {
        test(`${path} serves more internal links than the pre-fix baseline (${baselineInternalLinks})`, async ({ request }) => {
            const res = await request.get(path)
            expect(res.ok(), `GET ${path} should respond 2xx`).toBe(true)

            const html = await res.text()
            const internalHrefs = extractInternalHrefs(html)

            expect(
                internalHrefs.length,
                `${path}: expected more same-origin <a href="/…"> than the pre-fix baseline ` +
                `of ${baselineInternalLinks} in the served HTML — got ${internalHrefs.length}: ` +
                `${JSON.stringify(internalHrefs)}`
            ).toBeGreaterThan(baselineInternalLinks)
        })
    }

    // #1596 — la maquette v12 retire le plan du site en 16 liens du pied de page (decision
    // du proprietaire : le pied de page tient sur deux niveaux). Le contrat « footer-sitemap »
    // qui vivait ici est donc retire ; le pied de page serveur est verifie ci-dessous et le
    // maillage des 16 pages reste porte par les menus du header (rendus au clic, donc ABSENTS
    // du HTML serveur : perte de maillage SSR signalee dans la PR, arbitrage en attente).
    test('the two-level footer is in the HTML served, no JS, with its stable links', async ({ request }) => {
        const html = await (await request.get('/')).text()

        const nav = extractTaggedBlocks(html, /<nav\b[^>]*data-cy="footer-nav"[^>]*>/, '</nav>').join('\n')
        for (const href of ['/components', '/docs/', '/theming', '/#playground']) {
            expect(nav.includes(`href="${href}"`), `footer nav is missing <a href="${href}"> in the SSR HTML`).toBe(true)
        }

        const legal = extractTaggedBlocks(html, /<nav\b[^>]*data-cy="footer-legal"[^>]*>/, '</nav>').join('\n')
        for (const href of ['/legal', '/privacy', '/contact']) {
            expect(legal.includes(`href="${href}"`), `footer legal nav is missing <a href="${href}"> in the SSR HTML`).toBe(true)
        }
        expect(/<nav\b[^>]*data-cy="footer-legal"[^>]*aria-label="[^"]+"|<nav\b[^>]*aria-label="[^"]+"[^>]*data-cy="footer-legal"/.test(html), 'footer legal nav needs an aria-label').toBe(true)
    })

    test('/theming already renders as a real SSR <a href> and must not regress', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const navBlocks = extractTaggedBlocks(html, /<nav\b[^>]*class="[^"]*\bprimary-nav\b[^"]*"[^>]*>/, '</nav>')
        expect(navBlocks.length, 'no <nav class="primary-nav"> found in the served HTML').toBeGreaterThan(0)
        const navHtml = navBlocks.join('\n')

        expect(
            navHtml.includes(`href="${THEMING_HREF}"`),
            `primary nav is missing <a href="${THEMING_HREF}"> in the SSR HTML — this link already ` +
            `worked before the fix and must not regress`
        ).toBe(true)
    })

})
