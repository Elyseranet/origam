import type { ITransitionRecorderWindow } from './transition-recorder.interface'

/**
 * Accumulating recorder for Vue transition classes — the antidote to
 * `waitForTimeout(N)` before an animation assertion (#750).
 *
 * WHY THIS EXISTS
 * ---------------
 * Vue's `<Transition>` classes (`{name}-enter-from`, `-enter-active`,
 * `-enter-to`, and the leave triplet) are applied on enter and removed on
 * `transitionend`. They are therefore observable only DURING the animation,
 * whose duration comes from a token
 * (`--origam-transition--{name}-enter-active---transition-duration`). Reading
 * `el.classList` once, N milliseconds after the trigger, is a race in both
 * directions:
 *
 *   - too early — the animated element is not in the DOM yet;
 *   - too late  — every transition class has already been removed, and the
 *                 test reports "the component uses no transition".
 *
 * Neither failure says anything about the component. Raising N does not fix
 * it, it only moves the race (and, measured in this repo, moves the failures
 * onto a different spec — see the CLAUDE.md note on textarea-richtext →
 * carousel).
 *
 * WHAT IT DOES INSTEAD
 * --------------------
 * Installed via `page.addInitScript()` — which runs in EVERY frame, including
 * Histoire's `__sandbox` iframe, before any page script — it keeps a
 * de-duplicated log of every `origam-transition--*` class the matching
 * elements ever carry. The spec then waits on that log becoming non-empty (a
 * state), and asserts on its content. The verdict is identical whether the
 * animation lasted 1 ms or 1 s.
 *
 * `addInitScript` is also the only injection point that behaves inside the
 * sandbox iframe: post-render mutations there are not recalculated (documented
 * at length in the root CLAUDE.md, "Third qualification, measured 2026-09-09").
 *
 * READING IT BACK
 * ---------------
 * `frameLocator(...).locator('body').evaluate()` runs in the IFRAME's realm,
 * so `window` there is the sandbox window this script wrote to:
 *
 * ```ts
 * const recorded = () => sandbox.locator('body').evaluate(
 *     () => (window as unknown as ITransitionRecorderWindow).__origamOverlayTransitionClasses ?? null
 * )
 * ```
 *
 * A `null` result means the init script never ran — assert on that before
 * trusting an empty log, otherwise a broken injection reads as a green test.
 *
 * Scoped to `.origam-overlay__content` (the element every teleported floating
 * surface animates: Select, Menu, Tooltip, Dialog, …). Widen the selector here
 * if another spec needs a different animated root.
 */
export const recordOverlayTransitionClasses = (): void => {
    const SELECTOR = '.origam-overlay__content'
    const PREFIX = 'origam-transition--'

    const log: string[] = []

    ;(window as unknown as ITransitionRecorderWindow).__origamOverlayTransitionClasses = log

    const push = (el: Element): void => {
        for (const cls of Array.from(el.classList)) {
            if (cls.startsWith(PREFIX) && !log.includes(cls)) { log.push(cls) }
        }
    }

    const scan = (node: Node): void => {
        if (!(node instanceof Element)) { return }

        if (node.matches(SELECTOR)) { push(node) }

        for (const el of Array.from(node.querySelectorAll(SELECTOR))) { push(el) }
    }

    new MutationObserver((records) => {
        for (const record of records) {
            // `attributes` — the enter/leave classes Vue adds and removes on an
            // element that is already mounted.
            if (record.type === 'attributes') {
                if (record.target instanceof Element && record.target.matches(SELECTOR)) {
                    push(record.target)
                }

                continue
            }

            // `childList` — Vue sets `-enter-from` / `-enter-active` in the
            // `beforeEnter` hook, which can run BEFORE the element is inserted.
            // That first state is therefore never an attribute mutation inside
            // the observed tree; it arrives with the insertion itself.
            for (const added of Array.from(record.addedNodes)) { scan(added) }
        }
    }).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class']
    })
}
