import type { IBox } from '../../interfaces/Commons/box.interface'
import { Box } from '../../classes/Commons/box.class'
import { REDUCED_MOTION_ANIMATION_DURATION, REDUCED_MOTION_QUERY } from '../../consts/Commons/commons.const'

/*********************************************************
 * prefersReducedMotion
 *
 * @description
 * Predicate that returns true when the user has explicitly requested
 * reduced motion through the OS-level accessibility setting.
 * @description
 * Shared primitive — reused by `animate()` below AND by
 * `useMediaPlayer`'s `shouldSuppressAutoplay()`
 * (`composables/Media/use-media-player.composable.ts`), which imports
 * this instead of keeping its own copy (cf. CLAUDE.md "reuse before
 * writing" rule). SSR / no-`matchMedia` environments resolve to `false`.
 ********************************************************/
export function prefersReducedMotion (): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false
    }
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * Nullify transforms.
 *
 * @param el …
 * @returns …
 */
export function nullifyTransforms (el: HTMLElement): IBox {
    const rect = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    const tx = style.transform

    if (tx) {
        let ta, sx, sy, dx, dy
        if (tx.startsWith('matrix3d(')) {
            ta = tx.slice(9, -1).split(/, /)
            sx = +ta[0]
            sy = +ta[5]
            dx = +ta[12]
            dy = +ta[13]
        } else if (tx.startsWith('matrix(')) {
            ta = tx.slice(7, -1).split(/, /)
            sx = +ta[0]
            sy = +ta[3]
            dx = +ta[4]
            dy = +ta[5]
        } else {
            return new Box(rect)
        }

        const to = style.transformOrigin
        const x = rect.x - dx - (1 - sx) * parseFloat(to)
        const y = rect.y - dy - (1 - sy) * parseFloat(to.slice(to.indexOf(' ') + 1))
        const w = sx ? rect.width / sx : el.offsetWidth + 1
        const h = sy ? rect.height / sy : el.offsetHeight + 1

        return new Box({x, y, width: w, height: h})
    } else {
        return new Box(rect)
    }
}

/**
 * Animate.
 *
 * @param el        …
 * @param keyframes …
 * @param options   …
 */
export function animate (
    el: Element,
    keyframes: Array<Keyframe> | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions
) {
    if (typeof el.animate === 'undefined') return {finished: Promise.resolve()}

    /*********************************************************
     * resolvedOptions
     *
     * @description
     * WCAG 2.3.3 (Animation from Interactions) — the CSS transition path
     * is covered by the `ds.ds-reduced-motion` SCSS mixin, but this WAAPI
     * path bypasses CSS entirely (`el.animate()`), so it must honour the
     * OS-level setting itself. Duration is shrunk to near-zero rather
     * than the call being skipped: `animation.finished` must still
     * resolve, otherwise any `done()` awaiting it never fires and the
     * transitioning element stays stuck (pointer-events/visibility left
     * mid-toggle).
     ********************************************************/
    const resolvedOptions = prefersReducedMotion()
        ? (options == null || typeof options === 'number'
            ? REDUCED_MOTION_ANIMATION_DURATION
            : {...options, duration: REDUCED_MOTION_ANIMATION_DURATION})
        : options

    let animation: Animation
    try {
        animation = el.animate(keyframes, resolvedOptions)
    } catch {
        return {finished: Promise.resolve()}
    }

    if (typeof animation.finished === 'undefined') {
        (animation as any).finished = new Promise(resolve => {
            animation.onfinish = () => {
                resolve(animation)
            }
        })
    }

    return animation
}
