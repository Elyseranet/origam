import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for defect C2 (ticket #538, family-wide — see #436):
 * the 15 `<Origam*>` transition components that ship a `<style>` block
 * hardcoded their `transition-duration` / `transition-timing-function`
 * as CSS literals, so NO theme channel could reach them.
 *
 * Every other component family in the DS routes those two properties
 * through a token declared in `assets/css/tokens/light.css` (see
 * `--origam-btn---transition-duration`, `--origam-card---transition-
 * duration`, …). The transition family was the outlier: a themer wanting
 * to slow `.origam-transition--fade-enter-active` down had no variable to
 * set. Only `ExpandX` / `ExpandY` were already tokenised — measured on
 * develop before the fix: 32 red, 6 green, the 6 being exactly those two.
 *
 * WHY PLAYWRIGHT AND NOT VITEST
 * ------------------------------
 * `getComputedStyle` under jsdom NEVER resolves `var()` — it silently
 * falls back to a fabricated UA default (CLAUDE.md, #398). The whole
 * point of this spec is "does the `var()` indirection actually reach the
 * property", which only a real browser can answer.
 *
 * WHAT IT ASSERTS — VALUES, NOT MERELY "SOMETHING CHANGED"
 * ---------------------------------------------------------
 * A test that only checks "two values differ" passes on a broken token:
 * `--origam-row---density: 0` (unitless) makes `calc(-4px + 0)` invalid,
 * the browser drops the declaration, and a difference-only assertion never
 * notices. So each phase pins THREE observed values against the numbers
 * measured on develop BEFORE the refactor — duration, timing-function and
 * transition-property — and only then probes the token channel. A
 * tokenisation that silently retimes the family fails here rather than
 * shipping.
 *
 * THE PROBE
 * ---------
 * The component `<style>` blocks are NOT scoped, so once a story chunk has
 * loaded, its transition classes are global CSS inside the sandbox
 * document. For each phase we build a bare `<div>` carrying the class,
 * read the three properties, set the two tokens ON THAT ELEMENT, and
 * re-read — all inside a SINGLE `evaluate`. Splitting a DOM mutation from
 * its measurement is the `alert.spec.ts` trap (CLAUDE.md): Vue re-patches
 * the element in between and the assertion measures the wrong thing.
 *
 * Setting the custom property on the element itself rather than on
 * `:root` is deliberate: custom properties inherit and resolve on the
 * element that consumes them, so the probe never mutates shared document
 * state and cannot leak into a sibling test.
 */

const BASE = '/stories/story/components-stories-transition-'

const DURATION_PROBE = '4321ms'
const DURATION_PROBE_COMPUTED = '4.321s'
const EASING_PROBE = 'steps(7, end)'
const EASING_PROBE_COMPUTED = 'steps(7)'

/** Easings as Chromium serialises them — measured, not guessed. */
const STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'
const DECELERATE = 'cubic-bezier(0, 0, 0.2, 1)'
const ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'
const SWING = 'cubic-bezier(0.25, 0.8, 0.5, 1)'

interface IPhase {
    /** Class suffix, e.g. `enter-active`. */
    suffix: string
    /** Token infix — differs from `suffix` only for the ExpandX/Y misnomer. */
    token: string
    /** Values measured on develop before the refactor. */
    duration: string
    easing: string
    property: string
}

interface ICase {
    story: string
    root: string
    phases: IPhase[]
}

/**
 * `expand-x` / `expand-y` used to read a token named `…-enter-leave---…` on
 * their LEAVE rule — a misnomer that had already shipped. The correct
 * `…-leave-active---…` name is now THE reference and is what the token
 * stylesheets declare; the old name survives only as a read-site fallback
 * (see the `deprecated alias` block at the bottom of this file) and goes
 * away at the next major.
 */
const CASES: ICase[] = [
    {
        story: 'origamfade-story-vue',
        root: 'origam-transition--fade',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'opacity'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamslidex-story-vue',
        root: 'origam-transition--slide-x',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamslidey-story-vue',
        root: 'origam-transition--slide-y',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamscalerotate-story-vue',
        root: 'origam-transition--scale-rotate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamexpandx-story-vue',
        root: 'origam-transition--expand-x',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.5s', easing: STANDARD, property: 'width'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.5s', easing: STANDARD, property: 'width'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamexpandy-story-vue',
        root: 'origam-transition--expand-y',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.5s', easing: STANDARD, property: 'height'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.5s', easing: STANDARD, property: 'height'},
            {suffix: 'move', token: 'move', duration: '0.5s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamsnack-story-vue',
        root: 'origam-transition--snack',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.15s', easing: DECELERATE, property: 'opacity, transform'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.15s', easing: DECELERATE, property: 'opacity'}
        ]
    },
    {
        story: 'origamtranslatebottom-story-vue',
        root: 'origam-transition--translate-bottom',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.225s', easing: DECELERATE, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.125s', easing: ACCELERATE, property: 'transform, opacity'}
        ]
    },
    {
        story: 'origamtranslatescale-story-vue',
        root: 'origam-transition--transform-scale',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.225s', easing: DECELERATE, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.125s', easing: ACCELERATE, property: 'transform, opacity'}
        ]
    },
    {
        story: 'origamtranslatepicker-story-vue',
        root: 'origam-transition--translate-picker',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'move', token: 'move', duration: '0.3s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamreversetranslatepicker-story-vue',
        root: 'origam-transition--reverse-translate-picker',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: STANDARD, property: 'transform, opacity'},
            {suffix: 'move', token: 'move', duration: '0.3s', easing: STANDARD, property: 'transform'}
        ]
    },
    {
        story: 'origamwindowxtranslate-story-vue',
        root: 'origam-transition--window-x-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: SWING, property: 'all'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: SWING, property: 'all'}
        ]
    },
    {
        story: 'origamwindowytranslate-story-vue',
        root: 'origam-transition--window-y-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: SWING, property: 'all'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: SWING, property: 'all'}
        ]
    },
    {
        story: 'origamwindowxreversetranslate-story-vue',
        root: 'origam-transition--window-x-reverse-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: SWING, property: 'all'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: SWING, property: 'all'}
        ]
    },
    {
        story: 'origamwindowyreversetranslate-story-vue',
        root: 'origam-transition--window-y-reverse-translate',
        phases: [
            {suffix: 'enter-active', token: 'enter-active', duration: '0.3s', easing: SWING, property: 'all'},
            {suffix: 'leave-active', token: 'leave-active', duration: '0.3s', easing: SWING, property: 'all'}
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
 * Skipping the click made every probe below time out on
 * `frameLocator(...).locator('body')` — 38 red tests that LOOKED like the
 * assertion failing while measuring nothing at all. A red test is only
 * evidence when it is red for the reason it claims.
 */
async function gotoStory (page: Page, story: string) {
    await page.goto(`${BASE}${story}`)
    await page.waitForLoadState('networkidle')
    await page.getByText('Default', {exact: true}).first().click()
    await page.waitForSelector('iframe[src*="__sandbox"]')
    await page.waitForTimeout(600)
}

interface IProbeResult {
    duration: string
    easing: string
    property: string
    durationAfter: string
    easingAfter: string
}

/** Mutation AND measurement in one `evaluate` — see the header note. */
async function probe (
    page: Page,
    className: string,
    durationToken: string,
    easingToken: string
): Promise<IProbeResult> {
    const frame = page.frameLocator('iframe[src*="__sandbox"]')

    return await frame.locator('body').evaluate((body, args) => {
        const el = body.ownerDocument.createElement('div')

        el.className = args.className
        body.appendChild(el)

        const view = body.ownerDocument.defaultView!
        const before = view.getComputedStyle(el)
        const result = {
            duration: before.transitionDuration,
            easing: before.transitionTimingFunction,
            property: before.transitionProperty,
            durationAfter: '',
            easingAfter: ''
        }

        el.style.setProperty(args.durationToken, args.durationProbe)
        el.style.setProperty(args.easingToken, args.easingProbe)

        const after = view.getComputedStyle(el)

        result.durationAfter = after.transitionDuration
        result.easingAfter = after.transitionTimingFunction

        el.remove()

        return result
    }, {
        className,
        durationToken,
        easingToken,
        durationProbe: DURATION_PROBE,
        easingProbe: EASING_PROBE
    })
}

for (const testCase of CASES) {
    test.describe(`${testCase.root} — token channel`, () => {
        for (const phase of testCase.phases) {
            test(`${phase.suffix} is themable and keeps its historical timing`, async ({page}) => {
                await gotoStory(page, testCase.story)

                const className = `${testCase.root}-${phase.suffix}`
                const durationToken = `--${testCase.root}-${phase.token}---transition-duration`
                const easingToken = `--${testCase.root}-${phase.token}---transition-timing-function`

                const result = await probe(page, className, durationToken, easingToken)

                expect(
                    result.duration,
                    `${className} changed duration — tokenisation is a refactor, not a retiming`
                ).toBe(phase.duration)

                expect(
                    result.easing,
                    `${className} changed easing — tokenisation is a refactor, not a retiming`
                ).toBe(phase.easing)

                expect(
                    result.property,
                    `${className} changed transition-property — tokenisation is a refactor, not a rescoping`
                ).toBe(phase.property)

                expect(
                    result.durationAfter,
                    `${className} ignores ${durationToken}: the duration is a hardcoded literal, not a theme channel`
                ).toBe(DURATION_PROBE_COMPUTED)

                expect(
                    result.easingAfter,
                    `${className} ignores ${easingToken}: the easing is a hardcoded literal, not a theme channel`
                ).toBe(EASING_PROBE_COMPUTED)
            })
        }
    })
}

/**
 * Deprecated alias — `…-enter-leave---…` on ExpandX / ExpandY.
 *
 * ⛔ THE ALIAS CANNOT BE A DECLARATION. Writing
 * `--new: var(--old, <value>)` in the token sheet performs the substitution
 * AT `:root`, so a consumer who sets the old name ON AN ELEMENT — which is
 * exactly what the CLAUDE.md recommends for a one-off override — is never
 * honoured. Worse, the DS declares its tokens on `:root, [data-theme=…]`,
 * which inherits onto every element, so a `var(--old, fallback)` in a
 * declaration NEVER reaches its fallback at all.
 *
 * The alias therefore lives in the component's READS:
 *
 *     transition-duration: var(--old---transition-duration,
 *                              var(--new---transition-duration));
 *
 * and the old name is deliberately NOT declared anywhere — if it were, it
 * would always resolve and the new name would be unreachable.
 *
 * These tests are a non-regression pin, not a red-first filet: the old name
 * worked before the rename too. What they guard is that renaming the
 * reference did not silently drop the alias.
 */
test.describe('ExpandX / ExpandY — deprecated `enter-leave` alias', () => {
    for (const {story, root} of [
        {story: 'origamexpandx-story-vue', root: 'origam-transition--expand-x'},
        {story: 'origamexpandy-story-vue', root: 'origam-transition--expand-y'}
    ]) {
        test(`${root}: the old enter-leave name still drives the leave duration`, async ({page}) => {
            await gotoStory(page, story)

            const result = await probe(
                page,
                `${root}-leave-active`,
                `--${root}-enter-leave---transition-duration`,
                `--${root}-enter-leave---transition-timing-function`
            )

            expect(
                result.duration,
                'the alias must not change what renders by default'
            ).toBe('0.5s')

            expect(
                result.durationAfter,
                'a consumer still setting the old name on the element is no longer honoured'
            ).toBe(DURATION_PROBE_COMPUTED)

            expect(
                result.easingAfter,
                'a consumer still setting the old easing name on the element is no longer honoured'
            ).toBe(EASING_PROBE_COMPUTED)
        })
    }
})
