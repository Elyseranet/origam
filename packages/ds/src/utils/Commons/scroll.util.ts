import type { IScrollStrategyData, IScrollStrategyProps } from '../../interfaces'

import { convertToUnit, requestNewFrame } from '../../utils'

import { EffectScope, onScopeDispose } from 'vue'

/**
 * Get scroll parent.
 *
 * @param el            …
 * @param includeHidden …
 */
export function getScrollParent (el?: HTMLElement, includeHidden = false) {
    while (el) {
        if (includeHidden ? isPotentiallyScrollable(el) : hasScrollbar(el)) return el
        el = el.parentElement!
    }

    return document.scrollingElement as HTMLElement
}

/**
 * Get scroll parents.
 *
 * @param el     …
 * @param stopAt …
 */
export function getScrollParents (el?: Element | null, stopAt?: Element | null) {
    const elements: Array<HTMLElement> = []

    if (stopAt && el && !stopAt.contains(el)) return elements

    while (el) {
        if (hasScrollbar(el)) elements.push(el as HTMLElement)
        if (el === stopAt) break
        el = el.parentElement!
    }

    return elements
}

/**
 * Has scrollbar.
 *
 * @param el …
 */
export function hasScrollbar (el?: Element | null) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false

    const style = window.getComputedStyle(el)
    return style.overflowY === 'scroll' || (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight)
}

/**
 * Is potentially scrollable.
 *
 * @param el …
 */
export function isPotentiallyScrollable (el?: Element | null) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false

    const style = window.getComputedStyle(el)
    return ['scroll', 'auto'].includes(style.overflowY)
}

/**
 * Close scroll strategy.
 *
 * @param data …
 */
export function closeScrollStrategy (data: IScrollStrategyData) {
    const onScroll = () => {
        data.isActive.value = false
    }

    bindScroll(data.targetEl.value ?? data.contentEl.value, onScroll)
}

/**
 * Block scroll strategy.
 *
 * @param data  …
 * @param props …
 */
export function blockScrollStrategy (data: IScrollStrategyData, props: IScrollStrategyProps) {
    const offsetParent = data.root.value?.offsetParent
    const scrollElements = [...new Set([
        ...getScrollParents(data.targetEl.value, props.contained ? offsetParent : undefined),
        ...getScrollParents(data.contentEl.value, props.contained ? offsetParent : undefined)
    ])].filter(el => !el.classList.contains('origam-overlay--scroll-blocked'))
    const scrollbarWidth = window.innerWidth - document.documentElement.offsetWidth

    const scrollableParent = offsetParent || document.documentElement
    if (hasScrollbar(scrollableParent)) {
        data.root.value!.classList.add('origam-overlay--scroll-blocked')
    }

    scrollElements.forEach((el) => {
        el.style.setProperty('--origam-body-scroll-x', convertToUnit(-el.scrollLeft))
        el.style.setProperty('--origam-body-scroll-y', convertToUnit(-el.scrollTop))

        if (el !== document.documentElement) {
            el.style.setProperty('--origam-scrollbar-offset', convertToUnit(scrollbarWidth))
        }

        el.classList.add('origam-overlay--scroll-blocked')
    })

    onScopeDispose(() => {
        scrollElements.forEach((el) => {
            const x = parseFloat(el.style.getPropertyValue('--origam-body-scroll-x'))
            const y = parseFloat(el.style.getPropertyValue('--origam-body-scroll-y'))

            const scrollBehavior = el.style.scrollBehavior

            el.style.scrollBehavior = 'auto'
            el.style.removeProperty('--origam-body-scroll-x')
            el.style.removeProperty('--origam-body-scroll-y')
            el.style.removeProperty('--origam-scrollbar-offset')
            el.classList.remove('origam-overlay--scroll-blocked')

            el.scrollLeft = -x
            el.scrollTop = -y

            el.style.scrollBehavior = scrollBehavior
        })
        if (hasScrollbar(scrollableParent)) {
            data.root.value!.classList.remove('origam-overlay--scroll-blocked')
        }
    })
}

/**
 * Reposition scroll strategy.
 *
 * @param data   …
 * @param _props …
 * @param scope  …
 */
export function repositionScrollStrategy (data: IScrollStrategyData, _props: IScrollStrategyProps, scope: EffectScope) {
    let slow = false
    let raf = -1
    let ric = -1

    const update = (e: Event) => {
        requestNewFrame(() => {
            const start = performance.now()
            data.updateLocation.value?.(e)
            const time = performance.now() - start
            slow = time / (1000 / 60) > 2
        })
    }

    ric = (typeof requestIdleCallback === 'undefined' ? (cb: () => number) => cb() : requestIdleCallback)(() => {
        scope.run(() => {
            bindScroll(data.targetEl.value ?? data.contentEl.value, e => {
                if (slow) {
                    // If the position calculation is slow,
                    // defer updates until scrolling is finished.
                    // Browsers usually fire one scroll event per frame so
                    // we just wait until we've got two frames without an event
                    cancelAnimationFrame(raf)
                    raf = requestAnimationFrame(() => {
                        raf = requestAnimationFrame(() => {
                            update(e)
                        })
                    })
                } else {
                    update(e)
                }
            })
        })

        return 0
    })

    onScopeDispose(() => {
        if (typeof cancelIdleCallback !== 'undefined') {
            cancelIdleCallback(ric)
        }

        cancelAnimationFrame(raf)
    })
}

/**
 * Bind scroll.
 *
 * @param el       …
 * @param onScroll …
 */
export function bindScroll (el: HTMLElement | undefined, onScroll: (e: Event) => void) {
    const scrollElements = [document, ...getScrollParents(el)]

    scrollElements.forEach(el => {
        el.addEventListener('scroll', onScroll, {passive: true})
    })

    onScopeDispose(() => {
        scrollElements.forEach(el => {
            el.removeEventListener('scroll', onScroll)
        })
    })
}
