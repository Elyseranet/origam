import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for defect C2/C6 (ticket #538, family-wide — see #436):
 * the 15 `<Origam*>` transition components that ship a `<style>` block
 * hardcoded their `transition-duration` / `transition-timing-function`
 * as CSS literals, so NO theme channel could reach them.
 *
 * Every other component family in the DS routes those two properties
 * through a `--origam-{cmp}---transition-{duration,timing-function}`
 * token declared in `assets/css/tokens/light.css` (see `--origam-btn---
 * transition-duration`, `--origam-card---transition-duration`, …). The
 * transition family was the outlier: a themer setting a duration on
 * `.origam-transition--fade-enter-active` had no variable to set.
 *
 * WHY PLAYWRIGHT AND NOT VITEST
 * ------------------------------
 * `getComputedStyle` under jsdom NEVER resolves `var()` — it silently
 * falls back to a fabricated UA default (CLAUDE.md, #398). The whole
 * point of this spec is "does the `var()` indirection actually reach the
 * property", which only a real browser can answer.
 *
 * THE PROBE
 * ---------
 * The component `<style>` blocks are NOT scoped, so once a story chunk
 * has loaded, its transition classes are global CSS inside the sandbox
 * document. For each component we:
 *   1. build a bare `<div>` carrying the `-enter-active` (resp.
 *      `-leave-active`) class,
 *   2. read `transitionDuration` — this pins the CURRENT value, so a
 *      future "tokenisation" that silently changes the rendered timing
 *      fails here rather than shipping,
 *   3. set the expected token ON THAT ELEMENT and re-read.
 *
 * Steps 2 and 3 happen inside a SINGLE `evaluate` — the `alert.spec.ts`
 * trap (CLAUDE.md): splitting a DOM mutation from its measurement lets
 * Vue re-patch the element in between, and `toHaveCSS` then polls the
 * wrong thing.
 *
 * Setting the custom property on the element itself (rather than on
 * `:root`) is deliberate: custom properties inherit and resolve on the
 * element that consumes them, so this measures the `var()` indirection
 * without mutating the shared document and leaking into sibling tests.
 */

const BASE = '/stories/story/components-stories-transition-'

const PROBE = '4321ms'
const PROBE_COMPUTED = '4.321s'

interface ICase {
    /** Story slug under `components-stories-transition-`. */
    story: string
    /** Class root, without the `-enter-active` / `-leave-active` suffix. */
    root: string
    /** Phase suffixes to probe, and the literal each renders today. */
    phases: Array<{ suffix: string; token: string; current: string }>
}

/**
 * `expand-x` / `expand-y` read a token named `…-enter-leave---…` on their
 * LEAVE rule — a misnomer that predates this spec. It is pinned here as-is
 * rather than renamed: the name has shipped, and renaming a public CSS
 * variable is a breaking change that belongs to its own decision.
 */
const CASES: ICase[] = [
    {
        story: 'origamfade-story-vue',
        root: 'origam-transition--fade',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamslidex-story-vue',
        root: 'origam-transition--slide-x',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamslidey-story-vue',
        root: 'origam-transition--slide-y',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamscalerotate-story-vue',
        root: 'origam-transition--scale-rotate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamexpandx-story-vue',
        root: 'origam-transition--expand-x',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.5s'},
            {suffix: 'leave-active', token: 'enter-leave', current: '0.5s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamexpandy-story-vue',
        root: 'origam-transition--expand-y',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.5s'},
            {suffix: 'leave-active', token: 'enter-leave', current: '0.5s'},
            {suffix: 'move', token: 'move', current: '0.5s'}
        ]
    },
    {
        story: 'origamsnack-story-vue',
        root: 'origam-transition--snack',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.15s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.15s'}
        ]
    },
    {
        story: 'origamtranslatebottom-story-vue',
        root: 'origam-transition--translate-bottom',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.225s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.125s'}
        ]
    },
    {
        story: 'origamtranslatescale-story-vue',
        root: 'origam-transition--transform-scale',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.225s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.125s'}
        ]
    },
    {
        story: 'origamtranslatepicker-story-vue',
        root: 'origam-transition--translate-picker',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.3s'}
        ]
    },
    {
        story: 'origamreversetranslatepicker-story-vue',
        root: 'origam-transition--reverse-translate-picker',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'},
            {suffix: 'move', token: 'move', current: '0.3s'}
        ]
    },
    {
        story: 'origamwindowxtranslate-story-vue',
        root: 'origam-transition--window-x-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'}
        ]
    },
    {
        story: 'origamwindowytranslate-story-vue',
        root: 'origam-transition--window-y-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'}
        ]
    },
    {
        story: 'origamwindowxreversetranslate-story-vue',
        root: 'origam-transition--window-x-reverse-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'}
        ]
    },
    {
        story: 'origamwindowyreversetranslate-story-vue',
        root: 'origam-transition--window-y-reverse-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', current: '0.3s'},
            {suffix: 'leave-active', token: 'leave-active', current: '0.3s'}
        ]
    }
]

/**
 * ⛔ The `__sandbox` iframe does NOT exist on a freshly-loaded story page —
 * Histoire mounts it only once a Variant is selected. Measured: right after
 * `waitForLoadState('networkidle')` the page has exactly ONE frame (itself);
 * after clicking a Variant title it has two, the second being
 * `/stories/__sandbox.html?storyId=…&variantId=…`.
 *
 * Skipping the click makes every probe below time out on
 * `frameLocator(...).locator('body')` — a failure that LOOKS like the
 * assertion failing (38 red tests) while measuring nothing at all. Same
 * shape as the "false red" trap in CLAUDE.md: a red test is only evidence
 * when it is red for the reason it claims.
 */
async function gotoStory (page: Page, story: string) {
    await page.goto(`${BASE}${story}`)
    await page.waitForLoadState('networkidle')
    await page.getByText('Default', {exact: true}).first().click()
    await page.waitForSelector('iframe[src*="__sandbox"]')
    await page.waitForTimeout(600)
}

/**
 * Mutation AND measurement in one `evaluate` — see the header note about
 * the `alert.spec.ts` trap.
 */
async function probeDuration (
    page: Page,
    className: string,
    tokenName: string
): Promise<{ before: string; after: string }> {
    const frame = page.frameLocator('iframe[src*="__sandbox"]')

    return await frame.locator('body').evaluate((body, {className, tokenName, probe}) => {
        const el = body.ownerDocument.createElement('div')

        el.className = className
        body.appendChild(el)

        const view = body.ownerDocument.defaultView!
        const before = view.getComputedStyle(el).transitionDuration

        el.style.setProperty(tokenName, probe)

        const after = view.getComputedStyle(el).transitionDuration

        el.remove()

        return {before, after}
    }, {className, tokenName, probe: PROBE})
}

for (const testCase of CASES) {
    test.describe(`${testCase.root} — duration token channel`, () => {
        for (const phase of testCase.phases) {
            test(`${phase.suffix} duration is themable via its token`, async ({page}) => {
                await gotoStory(page, testCase.story)

                const className = `${testCase.root}-${phase.suffix}`
                const tokenName = `--${testCase.root}-${phase.token}---transition-duration`

                const {before, after} = await probeDuration(page, className, tokenName)

                expect(
                    before,
                    `${className} must still render its historical duration — tokenisation is a refactor, not a retiming`
                ).toBe(phase.current)

                expect(
                    after,
                    `${className} ignores ${tokenName}: the duration is a hardcoded literal, not a theme channel`
                ).toBe(PROBE_COMPUTED)
            })
        }
    })
}
