import { expect, test, type Page } from '@playwright/test'

/**
 * Regression spec for defect C6 (ticket #538) — WCAG 2.3.3, "Animation from
 * Interactions" — across the whole `<Origam*>` transition family.
 *
 * The family shares ONE `@media (prefers-reduced-motion: reduce)` block,
 * emitted by the `ds-reduced-motion` SCSS mixin
 * (`packages/ds/src/assets/scss/_helpers.scss`, issue #494). Nothing here
 * re-implements the query per component, and nothing goes through JS: the
 * CSS-only path is the whole mechanism, which is why this spec drives it
 * with `page.emulateMedia({ reducedMotion: 'reduce' })` rather than by
 * poking at component state.
 *
 * WHY IT IS RE-ASSERTED NOW
 * --------------------------
 * The 15 components' durations moved from CSS literals to
 * `var(--origam-transition--…---transition-duration)` (defect C2, same
 * ticket). That is exactly the kind of change that can silently outrank an
 * accessibility override: the mixin wins by `!important`, and it must keep
 * winning against the NEW token channel too — including when a theme, or a
 * per-instance inline style, sets that token to something long. The mixin's
 * own header says this is why it zeroes the PROPERTY rather than the
 * variable; this spec is the runtime proof that the reasoning holds.
 *
 * `0.01ms` (not `0`) is deliberate upstream: some `onAfterLeave` /
 * `onEnterCancelled` hooks depend on a `transitionend` actually firing,
 * which a `0ms` duration can skip in some engines. Chromium serialises that
 * duration back as `1e-05s` — measured, not guessed.
 */

const BASE = '/stories/story/components-stories-transition-'

const REDUCED_DURATION = '1e-05s'

/** Every family member that ships a `<style>` block, and one class per phase. */
const CASES: Array<{ story: string; root: string; phases: string[] }> = [
    {story: 'origamfade-story-vue', root: 'origam-transition--fade', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamslidex-story-vue', root: 'origam-transition--slide-x', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamslidey-story-vue', root: 'origam-transition--slide-y', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamscalerotate-story-vue', root: 'origam-transition--scale-rotate', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamexpandx-story-vue', root: 'origam-transition--expand-x', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamexpandy-story-vue', root: 'origam-transition--expand-y', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamsnack-story-vue', root: 'origam-transition--snack', phases: ['enter-active', 'leave-active']},
    {story: 'origamtranslatebottom-story-vue', root: 'origam-transition--translate-bottom', phases: ['enter-active', 'leave-active']},
    {story: 'origamtranslatescale-story-vue', root: 'origam-transition--transform-scale', phases: ['enter-active', 'leave-active']},
    {story: 'origamtranslatepicker-story-vue', root: 'origam-transition--translate-picker', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamreversetranslatepicker-story-vue', root: 'origam-transition--reverse-translate-picker', phases: ['enter-active', 'leave-active', 'move']},
    {story: 'origamwindowxtranslate-story-vue', root: 'origam-transition--window-x-translate', phases: ['enter-active', 'leave-active']},
    {story: 'origamwindowytranslate-story-vue', root: 'origam-transition--window-y-translate', phases: ['enter-active', 'leave-active']},
    {story: 'origamwindowxreversetranslate-story-vue', root: 'origam-transition--window-x-reverse-translate', phases: ['enter-active', 'leave-active']},
    {story: 'origamwindowyreversetranslate-story-vue', root: 'origam-transition--window-y-reverse-translate', phases: ['enter-active', 'leave-active']}
]

/** Histoire mounts the `__sandbox` iframe only once a Variant is selected. */
async function gotoStory (page: Page, story: string) {
    await page.goto(`${BASE}${story}`)
    await page.waitForLoadState('networkidle')
    await page.getByText('Default', {exact: true}).first().click()
    await page.waitForSelector('iframe[src*="__sandbox"]')
    await page.waitForTimeout(600)
}

/**
 * Builds one bare element per phase, forces a deliberately LONG duration
 * through the new token channel, and measures — all inside a single
 * `evaluate` (the `alert.spec.ts` trap). If the accessibility override no
 * longer outranks the token, the long value is what comes back.
 *
 * ⛔ This assertion is "nothing changed", which is the exact shape a
 * measurement artefact fakes: a harness that cannot actuate the property
 * passes for the wrong reason. The single-`evaluate` caveat added to the
 * CLAUDE.md on 2026-09-09 is about a DESCENDANT inheriting through `var()`;
 * here the property is set on the SAME element that is measured, and the
 * harness was proven to actuate — mutating `OrigamFade` so its
 * reduced-motion block zeroes the VARIABLE instead of the PROPERTY makes
 * this very probe return `9s`. The pass is therefore evidence, not silence.
 */
async function measureUnderReducedMotion (page: Page, root: string, phases: string[]) {
    const frame = page.frameLocator('iframe[src*="__sandbox"]')

    return await frame.locator('body').evaluate((body, args) => {
        const view = body.ownerDocument.defaultView!

        return args.phases.map(phase => {
            const el = body.ownerDocument.createElement('div')

            el.className = `${args.root}-${phase}`
            body.appendChild(el)

            const plain = view.getComputedStyle(el).transitionDuration

            el.style.setProperty(`--${args.root}-${phase}---transition-duration`, '9s')

            const themed = view.getComputedStyle(el).transitionDuration

            el.remove()

            return {phase, plain, themed}
        })
    }, {root, phases})
}

for (const testCase of CASES) {
    test(`${testCase.root} honours prefers-reduced-motion, token override included`, async ({page}) => {
        await page.emulateMedia({reducedMotion: 'reduce'})
        await gotoStory(page, testCase.story)

        const results = await measureUnderReducedMotion(page, testCase.root, testCase.phases)

        expect(results).toHaveLength(testCase.phases.length)

        for (const {phase, plain, themed} of results) {
            expect(
                plain,
                `${testCase.root}-${phase} still animates under prefers-reduced-motion`
            ).toBe(REDUCED_DURATION)

            expect(
                themed,
                `${testCase.root}-${phase}: a themed duration outranks the reduced-motion override — the a11y preference must win over every channel`
            ).toBe(REDUCED_DURATION)
        }
    })
}
