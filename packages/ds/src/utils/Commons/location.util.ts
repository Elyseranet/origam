import { computed, nextTick, onScopeDispose, Ref, watch } from 'vue'
import { AXIS } from '../../enums'

import type { IBox, ILocationStrategyData, ILocationStrategyProps } from '../../interfaces'

import { Box } from '../../services'

import type { TAnchor } from '../../types'

import {
    anchorToPoint,
    clamp,
    consoleError,
    convertToUnit,
    destructComputed,
    flipAlign,
    flipCorner,
    flipSide,
    getAxis,
    getOffset,
    getOverflow,
    getScrollParents,
    getTargetBox,
    nullifyTransforms,
    parseAnchor
} from '../../utils'

/**
 * Static location strategy.
 */
export function staticLocationStrategy () {
    // TODO
}

/**
 * Connected location strategy.
 *
 * @param data          …
 * @param props         …
 * @param contentStyles …
 */
export function connectedLocationStrategy (data: ILocationStrategyData, props: ILocationStrategyProps, contentStyles: Ref<Record<string, string>>) {
    const activatorFixed = Array.isArray(data.target.value) || isFixedPosition(data.target.value)
    if (activatorFixed) {
        Object.assign(contentStyles.value, {
            position: 'fixed',
            top: 0,
            left: 0
        })
    }

    const {preferredAnchor, preferredOrigin} = destructComputed(() => {
        const parsedAnchor = parseAnchor(props.location as TAnchor)
        const parsedOrigin =
            props.origin === 'overlap' ? parsedAnchor
                : props.origin === 'auto' ? flipSide(parsedAnchor)
                    : parseAnchor(props.origin as TAnchor)

        // Some combinations of props may produce an invalid origin
        if (parsedAnchor.side === parsedOrigin.side && parsedAnchor.align === flipAlign(parsedOrigin).align) {
            return {
                preferredAnchor: flipCorner(parsedAnchor),
                preferredOrigin: flipCorner(parsedOrigin)
            }
        }

        return {
            preferredAnchor: parsedAnchor,
            preferredOrigin: parsedOrigin
        }
    })

    const [minWidth, minHeight, maxWidth, maxHeight] =
        (['minWidth', 'minHeight', 'maxWidth', 'maxHeight'] as const).map(key => {
            return computed(() => {
                const val = parseFloat(props[key] as string)
                return isNaN(val) ? Infinity : val
            })
        })

    const offset = computed(() => {
        if (Array.isArray(props.offset)) {
            return props.offset
        }
        if (typeof props.offset === 'string') {
            const offset = props.offset.split(' ').map(parseFloat)
            if (offset.length < 2) offset.push(0)
            return offset
        }
        return typeof props.offset === 'number' ? [props.offset, 0] : [0, 0]
    })

    let observe = false
    const observer = new ResizeObserver(() => {
        if (observe) updateLocation()
    })

    watch([data.target, data.contentEl], ([newTarget, newContentEl], [oldTarget, oldContentEl]) => {
        if (oldTarget && !Array.isArray(oldTarget)) observer.unobserve(oldTarget)
        if (newTarget && !Array.isArray(newTarget)) observer.observe(newTarget)

        if (oldContentEl) observer.unobserve(oldContentEl)
        if (newContentEl) observer.observe(newContentEl)
    }, {
        immediate: true
    })

    onScopeDispose(() => {
        observer.disconnect()
    })

    const updateLocation = () => {
        observe = false
        requestAnimationFrame(() => observe = true)

        if (!data.target.value || !data.contentEl.value) return

        const targetBox = getTargetBox(data.target.value)
        const contentBox = getIntrinsicSize(data.contentEl.value)
        const scrollParents = getScrollParents(data.contentEl.value)
        // Configurable inward-shift guard. Defaults to 12px so the floating
        // content never sits flush with a viewport edge. Components whose
        // activator legitimately spans the full viewport (e.g. an
        // `<origam-select>` filling a row) should pass `viewportMargin: 0`
        // — otherwise the strategy would shift the dropdown 12px inward,
        // breaking the visual alignment with the field's left edge.
        const viewportMargin = (props as { viewportMargin?: number }).viewportMargin ?? 12

        if (!scrollParents.length) {
            scrollParents.push(document.documentElement)
            if (!(data.contentEl.value.style.top && data.contentEl.value.style.left)) {
                contentBox.x -= parseFloat(document.documentElement.style.getPropertyValue('--origam-body-scroll-x') || '0')
                contentBox.y -= parseFloat(document.documentElement.style.getPropertyValue('--origam-body-scroll-y') || '0')
            }
        }

        const viewport = scrollParents.reduce<IBox>((box: IBox | undefined, el) => {
            const rect = el.getBoundingClientRect()
            const scrollBox = new Box({
                x: el === document.documentElement ? 0 : rect.x,
                y: el === document.documentElement ? 0 : rect.y,
                width: el.clientWidth,
                height: el.clientHeight
            })

            if (box) {
                return new Box({
                    x: Math.max(box.left, scrollBox.left),
                    y: Math.max(box.top, scrollBox.top),
                    width: Math.min(box.right, scrollBox.right) - Math.max(box.left, scrollBox.left),
                    height: Math.min(box.bottom, scrollBox.bottom) - Math.max(box.top, scrollBox.top)
                })
            }
            return scrollBox
        }, undefined!)
        viewport.x += viewportMargin
        viewport.y += viewportMargin
        viewport.width -= viewportMargin * 2
        viewport.height -= viewportMargin * 2

        let placement = {
            anchor: preferredAnchor.value,
            origin: preferredOrigin.value
        }

        const checkOverflow = (_placement: typeof placement) => {
            const box = new Box(contentBox)
            const targetPoint = anchorToPoint(_placement.anchor, targetBox)
            const contentPoint = anchorToPoint(_placement.origin, box)

            let {x, y} = getOffset(targetPoint, contentPoint)

            switch (_placement.anchor.side) {
                case 'top':
                    y -= offset.value[0]
                    break
                case 'bottom':
                    y += offset.value[0]
                    break
                case 'left':
                    x -= offset.value[0]
                    break
                case 'right':
                    x += offset.value[0]
                    break
            }

            switch (_placement.anchor.align) {
                case 'top':
                    y -= offset.value[1]
                    break
                case 'bottom':
                    y += offset.value[1]
                    break
                case 'left':
                    x -= offset.value[1]
                    break
                case 'right':
                    x += offset.value[1]
                    break
            }

            box.x += x
            box.y += y

            box.width = Math.min(box.width, maxWidth.value)
            box.height = Math.min(box.height, maxHeight.value)

            const overflows = getOverflow(box, viewport)

            return {overflows, x, y}
        }

        let x = 0
        let y = 0
        const available = {x: 0, y: 0}
        const flipped = {x: false, y: false}
        let resets = -1
        while (true) {
            if (resets++ > 10) {
                consoleError('Infinite loop detected in connectedLocationStrategy')
                break
            }

            const {x: _x, y: _y, overflows} = checkOverflow(placement)

            x += _x
            y += _y

            contentBox.x += _x
            contentBox.y += _y

            // flip
            {
                const axis = getAxis(placement.anchor)
                const hasOverflowX = overflows.x.before || overflows.x.after
                const hasOverflowY = overflows.y.before || overflows.y.after

                let reset = false
                ;[AXIS.X, AXIS.Y].forEach(key => {
                if (
                    (key === AXIS.X && hasOverflowX && !flipped.x) ||
                    (key === AXIS.Y && hasOverflowY && !flipped.y)
                ) {
                    const newPlacement = {anchor: {...placement.anchor}, origin: {...placement.origin}}
                    const flip = key === AXIS.X
                        ? axis === AXIS.Y ? flipAlign : flipSide
                        : axis === AXIS.Y ? flipSide : flipAlign
                    newPlacement.anchor = flip(newPlacement.anchor)
                    newPlacement.origin = flip(newPlacement.origin)
                    const {overflows: newOverflows} = checkOverflow(newPlacement)
                    if (
                        (newOverflows[key].before <= overflows[key].before &&
                            newOverflows[key].after <= overflows[key].after) ||
                        (newOverflows[key].before + newOverflows[key].after <
                            (overflows[key].before + overflows[key].after) / 2)
                    ) {
                        placement = newPlacement
                        reset = flipped[key] = true
                    }
                }
            })
                if (reset) continue
            }

            // shift
            if (overflows.x.before) {
                x += overflows.x.before
                contentBox.x += overflows.x.before
            }
            if (overflows.x.after) {
                x -= overflows.x.after
                contentBox.x -= overflows.x.after
            }
            if (overflows.y.before) {
                y += overflows.y.before
                contentBox.y += overflows.y.before
            }
            if (overflows.y.after) {
                y -= overflows.y.after
                contentBox.y -= overflows.y.after
            }

            // size
            {
                const overflows = getOverflow(contentBox, viewport)
                available.x = viewport.width - overflows.x.before - overflows.x.after
                available.y = viewport.height - overflows.y.before - overflows.y.after

                x += overflows.x.before
                contentBox.x += overflows.x.before
                y += overflows.y.before
                contentBox.y += overflows.y.before
            }

            break
        }

        const axis = getAxis(placement.anchor)

        Object.assign(contentStyles.value, {
            '--origam-overlay-anchor-origin': `${placement.anchor.side} ${placement.anchor.align}`,
            transformOrigin: `${placement.origin.side} ${placement.origin.align}`,
            top: convertToUnit(pixelRound(y)),
            left: convertToUnit(pixelRound(x)),
            right: undefined,
            minWidth: convertToUnit(axis === AXIS.Y ? Math.min(minWidth.value, targetBox.width) : minWidth.value),
            maxWidth: convertToUnit(pixelCeil(clamp(available.x, minWidth.value === Infinity ? 0 : minWidth.value, maxWidth.value))),
            maxHeight: convertToUnit(pixelCeil(clamp(available.y, minHeight.value === Infinity ? 0 : minHeight.value, maxHeight.value)))
        })

        return {
            available,
            contentBox
        }
    }

    watch(
        () => [
            preferredAnchor.value,
            preferredOrigin.value,
            props.offset,
            props.minWidth,
            props.minHeight,
            props.maxWidth,
            props.maxHeight
        ],
        () => updateLocation()
    )

    nextTick(() => {
        const result = updateLocation()

        // TODO: overflowing content should only require a single updateLocation call
        // Icky hack to make sure the content is positioned consistently
        if (!result) return
        const {available, contentBox} = result
        if (contentBox.height > available.y) {
            requestAnimationFrame(() => {
                updateLocation()
                requestAnimationFrame(() => {
                    updateLocation()
                })
            })
        }
    })

    return {updateLocation}
}

/** Get size of element ignoring max-width/max-height */
export function getIntrinsicSize (el: HTMLElement) {
    el.style.removeProperty('right')

    const contentBox = nullifyTransforms(el)

    contentBox.x -= parseFloat(el.style.left || '0')
    contentBox.y -= parseFloat(el.style.top || '0')

    return contentBox
}

/**
 * Pixel round.
 *
 * @param val …
 */
export function pixelRound (val: number) {
    return Math.round(val * devicePixelRatio) / devicePixelRatio
}

/**
 * Pixel ceil.
 *
 * @param val …
 */
export function pixelCeil (val: number) {
    return Math.ceil(val * devicePixelRatio) / devicePixelRatio
}

/**
 * Is fixed position.
 *
 * @param el …
 */
export function isFixedPosition (el?: HTMLElement) {
    while (el) {
        if (window.getComputedStyle(el).position === 'fixed') {
            return true
        }
        el = el.offsetParent as HTMLElement
    }
    return false
}
