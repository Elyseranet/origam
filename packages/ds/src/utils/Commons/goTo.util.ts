import { ComponentPublicInstance } from 'vue'
import type { IGoToInstance, IGoToOptions, IGoToOptionsPatterns } from '../../interfaces'

import { clamp, consoleWarn, int, mergeDeep, refElement } from '../../utils'

/**
 * Gen defaults.
 *
 * @returns …
 */
export function genDefaults (): Partial<IGoToOptions> {
    return {
        container: undefined,
        duration: 300,
        layout: false,
        offset: 0,
        easing: 'easeInOutCubic',
        patterns: {
            linear: (t: number) => t,
            easeInQuad: (t: number) => t ** 2,
            easeOutQuad: (t: number) => t * (2 - t),
            easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t ** 2 : -1 + (4 - 2 * t) * t),
            easeInCubic: (t: number) => t ** 3,
            easeOutCubic: (t: number) => --t ** 3 + 1,
            easeInOutCubic: (t: number) => t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: (t: number) => t ** 4,
            easeOutQuart: (t: number) => 1 - --t ** 4,
            easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - 8 * --t ** 4),
            easeInQuint: (t: number) => t ** 5,
            easeOutQuint: (t: number) => 1 + --t ** 5,
            easeInOutQuint: (t: number) => t < 0.5 ? 16 * t ** 5 : 1 + 16 * --t ** 5
        }
    }
}

/**
 * Get container.
 *
 * @param el …
 */
export function getContainer (el?: ComponentPublicInstance | HTMLElement | string) {
    return getTarget(el) ?? (document.scrollingElement || document.body) as HTMLElement
}

/**
 * Get target.
 *
 * @param el …
 */
export function getTarget (el: ComponentPublicInstance | HTMLElement | string | undefined) {
    return (typeof el === 'string') ? document.querySelector<HTMLElement>(el) : refElement(el)
}

/**
 * Get location offset.
 *
 * @param target     …
 * @param horizontal …
 * @param rtl        …
 * @returns …
 */
export function getLocationOffset (target: any, horizontal?: boolean, rtl?: boolean): number {
    if (typeof target === 'number') return horizontal && rtl ? -target : target

    let el = getTarget(target)
    let totalOffset = 0
    while (el) {
        totalOffset += horizontal ? el.offsetLeft : el.offsetTop
        el = el.offsetParent as HTMLElement
    }

    return totalOffset
}

/**
 * Clamp target value to achieve a smooth scroll animation
 * when the value goes outside the scroll container size
 */
export function clampTarget (
    container: HTMLElement,
    value: number,
    horizontal: boolean
) {
    const {scrollWidth, scrollHeight} = container
    const [containerWidth, containerHeight] = container === document.scrollingElement
        ? [window.innerWidth, window.innerHeight]
        : [container.offsetWidth, container.offsetHeight]

    let min: number
    let max: number

    if (horizontal) {
        min = 0
        max = scrollWidth - containerWidth
    } else {
        min = 0
        max = scrollHeight + -containerHeight
    }

    return Math.max(Math.min(value, max), min)
}

/**
 * Scroll to.
 *
 * @param _target    …
 * @param _options   …
 * @param horizontal …
 * @param goTo       …
 */
export async function scrollTo (
    _target: ComponentPublicInstance | HTMLElement | number | string,
    _options: Partial<IGoToOptions>,
    horizontal?: boolean,
    goTo?: IGoToInstance
) {
    const rtl = goTo?.rtl.value
    const property = horizontal ? 'scrollLeft' : 'scrollTop'
    const options = mergeDeep(goTo?.options ?? genDefaults(), _options)
    const target = (typeof _target === 'number' ? _target : getTarget(_target)) ?? 0
    const container = options.container === 'parent' && target instanceof HTMLElement
        ? target.parentElement!
        : getContainer(options.container as ComponentPublicInstance | HTMLElement | string)
    const patterns = options.patterns as IGoToOptionsPatterns
    const easing = options.easing as keyof IGoToOptionsPatterns | ((t: number) => number)
    const ease = typeof easing === 'function' ? easing : patterns[easing]

    if (!ease) throw new TypeError(`Easing function "${easing}" not found.`)

    let targetLocation: number
    if (typeof target === 'number') {
        targetLocation = getLocationOffset(target, horizontal, rtl)
    } else {
        targetLocation = getLocationOffset(target, horizontal, rtl) - getLocationOffset(container, horizontal, rtl)

        if (options.layout) {
            const styles = window.getComputedStyle(target)
            const layoutOffset = styles.getPropertyValue('--origam-layout-top')

            if (layoutOffset) targetLocation -= int(layoutOffset)
        }
    }

    targetLocation += options.offset as number
    targetLocation = clampTarget(container, targetLocation, !!horizontal)

    const startLocation = container[property] ?? 0

    if (targetLocation === startLocation) return Promise.resolve(targetLocation)

    const startTime = performance.now()
    const duration = options.duration as number

    return new Promise(resolve => requestAnimationFrame(function step (currentTime: number) {
        const timeElapsed = currentTime - startTime
        const progress = timeElapsed / duration
        const location = Math.floor(
            startLocation +
            (targetLocation - startLocation) *
            ease(clamp(progress, 0, 1))
        )

        container[property] = location

        // Allow for some jitter if target time has elapsed
        if (progress >= 1 && Math.abs(location - container[property]) < 10) {
            return resolve(targetLocation)
        } else if (progress > 2) {
            // The target might not be reachable
            consoleWarn('Scroll target is not reachable')
            return resolve(container[property])
        }

        requestAnimationFrame(step)
    }))
}
