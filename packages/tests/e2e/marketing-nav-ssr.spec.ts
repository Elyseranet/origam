/**
 * Nav & footer sitemap — SSR reality check (audit-ssr-nav)
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
 * Footer sitemap contract (normative, fixed 2026-08-31, revised same day
 * once `fix-nav-ssr` landed real markup — both branches target this):
 *
 *   <nav class="site-footer__sitemap" data-cy="footer-sitemap" aria-label="…">
 *     <h3>…</h3><ul><li><a href="/why-origam">…</a></li>…</ul>
 *     <h3>…</h3><ul>…</ul>
 *     <h3>…</h3><ul>…</ul>
 *   </nav>
 *
 * Exactly the 15 `NAV_SECTIONS` links, in `NAV_SECTIONS` order, 3 `<h3>`
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
 * asserted nommément, same as the other 13. This spec does NOT request
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

// All 15 NAV_SECTIONS hrefs, in NAV_SECTIONS order (3 sections: introduction,
// getting_started, features). Confirmed stable, slash-final included for
// '/stories/' and '/docs/' — sourced from
// packages/marketing/src/consts/nav.const.ts.
const STABLE_SITEMAP_HREFS = [
    '/why-origam',
    '/roadmap',
    '/changelog',
    '/installation',
    '/wireframe',
    '/components',
    '/directives',
    '/composables',
    '/types',
    '/enums',
    '/interfaces',
    '/utils',
    '/consts',
    '/stories/',
    '/docs/'
]

// 3 sections → 3 <h3> + 3 <ul>.
const EXPECTED_SITEMAP_LINK_COUNT = STABLE_SITEMAP_HREFS.length
const EXPECTED_SITEMAP_SECTION_COUNT = 3

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

function countTag (html: string, tag: string): number {
    const re = new RegExp(`<${tag}\\b`, 'g')
    return (html.match(re) ?? []).length
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

    test('the footer sitemap (data-cy="footer-sitemap") exists in the HTML served for /', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const sitemapBlocks = extractTaggedBlocks(
            html,
            /<nav\b[^>]*data-cy="footer-sitemap"[^>]*>/,
            '</nav>'
        )

        expect(
            sitemapBlocks.length,
            'no <nav data-cy="footer-sitemap"> found in the HTML served for / (no JS)'
        ).toBeGreaterThan(0)
    })

    test('the footer sitemap carries the stable NAV_SECTIONS links, nommément, with no JS', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const sitemapBlocks = extractTaggedBlocks(
            html,
            /<nav\b[^>]*data-cy="footer-sitemap"[^>]*>/,
            '</nav>'
        )
        expect(sitemapBlocks.length, 'no <nav data-cy="footer-sitemap"> found').toBeGreaterThan(0)
        const sitemapHtml = sitemapBlocks.join('\n')

        for (const href of STABLE_SITEMAP_HREFS) {
            expect(
                sitemapHtml.includes(`href="${href}"`),
                `footer sitemap is missing <a href="${href}"> in the SSR HTML (no JS)`
            ).toBe(true)
        }
    })

    test('the footer sitemap is a real <nav> landmark with a non-empty accessible name', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const sitemapBlocks = extractTaggedBlocks(
            html,
            /<nav\b[^>]*data-cy="footer-sitemap"[^>]*>/,
            '</nav>'
        )
        expect(sitemapBlocks.length, 'no <nav data-cy="footer-sitemap"> found').toBeGreaterThan(0)

        for (const block of sitemapBlocks) {
            const openTag = block.slice(0, block.indexOf('>') + 1)
            const ariaLabelMatch = openTag.match(/aria-label="([^"]*)"/)
            expect(
                ariaLabelMatch?.[1]?.trim().length ?? 0,
                `<nav data-cy="footer-sitemap"> must carry a non-empty aria-label — got tag: ${openTag}`
            ).toBeGreaterThan(0)
        }
    })

    test('the footer sitemap has exactly 15 links and 3 sections (NAV_SECTIONS size), no JS', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const sitemapBlocks = extractTaggedBlocks(
            html,
            /<nav\b[^>]*data-cy="footer-sitemap"[^>]*>/,
            '</nav>'
        )
        expect(sitemapBlocks.length, 'no <nav data-cy="footer-sitemap"> found').toBeGreaterThan(0)
        const sitemapHtml = sitemapBlocks.join('\n')

        expect(
            countTag(sitemapHtml, 'a'),
            `footer sitemap should list exactly ${EXPECTED_SITEMAP_LINK_COUNT} links (NAV_SECTIONS size)`
        ).toBe(EXPECTED_SITEMAP_LINK_COUNT)

        expect(
            countTag(sitemapHtml, 'h3'),
            `footer sitemap should have exactly ${EXPECTED_SITEMAP_SECTION_COUNT} section headings (<h3>, one per NAV_SECTIONS section)`
        ).toBe(EXPECTED_SITEMAP_SECTION_COUNT)

        expect(
            countTag(sitemapHtml, 'ul'),
            `footer sitemap should have exactly ${EXPECTED_SITEMAP_SECTION_COUNT} lists (<ul>, one per NAV_SECTIONS section)`
        ).toBe(EXPECTED_SITEMAP_SECTION_COUNT)
    })

    test('the footer sitemap lists the stable links in NAV_SECTIONS order, no JS', async ({ request }) => {
        const res = await request.get('/')
        const html = await res.text()

        const sitemapBlocks = extractTaggedBlocks(
            html,
            /<nav\b[^>]*data-cy="footer-sitemap"[^>]*>/,
            '</nav>'
        )
        expect(sitemapBlocks.length, 'no <nav data-cy="footer-sitemap"> found').toBeGreaterThan(0)
        const sitemapHtml = sitemapBlocks.join('\n')

        const positions = STABLE_SITEMAP_HREFS.map(href => sitemapHtml.indexOf(`href="${href}"`))

        for (const [i, pos] of positions.entries()) {
            expect(pos, `sitemap is missing href="${STABLE_SITEMAP_HREFS[i]}"`).toBeGreaterThanOrEqual(0)
        }

        for (let i = 1; i < positions.length; i++) {
            expect(
                positions[i],
                `"${STABLE_SITEMAP_HREFS[i]}" should come after "${STABLE_SITEMAP_HREFS[i - 1]}" ` +
                `(NAV_SECTIONS order) — positions: ${JSON.stringify(positions)}`
            ).toBeGreaterThan(positions[i - 1])
        }
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
