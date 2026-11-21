import { computed, nextTick, onScopeDispose, Ref, watch } from 'vue'
import { AXIS } from '../../enums/Commons/drag.enum'

import type { IBox } from '../../interfaces/Commons/box.interface'
import type { ILocationStrategyData, ILocationStrategyProps } from '../../interfaces/Commons/location.interface'

import { Box } from '../../classes/Commons/box.class'

import type { TAnchor, TParsedAnchor } from '../../types/Commons/anchor.type'
import type { TAxisOverflow, TOverflow, TPlacement } from '../../types/Commons/location.type'

import { flipAlign, flipCorner, flipSide, getAxis, parseAnchor } from './anchor.util'
import { nullifyTransforms } from './animation.util'
import { getOverflow, getTargetBox } from './box.util'
import { clamp, convertToUnit, destructComputed } from './commons.util'
import { consoleError } from './console.util'
import { anchorToPoint, getOffset } from './point.util'
import { getScrollParents } from './scroll.util'

/**
 * Static location strategy.
 */
export function staticLocationStrategy () {
    // Intentionally empty: the static strategy applies no positioning.
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
        const parsedOrigin = resolveOrigin(props.origin, parsedAnchor)

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

    /*********************************************************
     * Frames bornees a la duree de vie du scope (#753)
     *
     * @description
     * Trois rAF vivaient ici et aucun n'etait annule, alors que le
     * `onScopeDispose` juste en dessous existait deja (il ne coupait que
     * le `ResizeObserver`) :
     *   - le re-armement de `observe` dans `updateLocation` — c'est le
     *     site que la sonde RUNTIME a trouve en mesurant les frames
     *     encore armees apres le demontage d'`OrigamSelect`, et que le
     *     balayage STATIQUE classait « a une teardown » parce qu'il
     *     raisonne par fichier ;
     *   - les DEUX rAF imbriques du `nextTick` de fin, non listes par
     *     le ticket. Leur corps rappelle `updateLocation()`, qui lit
     *     `document.documentElement`, `window` via `getScrollParents` et
     *     re-arme le rAF ci-dessus : c'est une continuation qui
     *     DEREFERENCE des globaux, donc le profil de risque de #706, pas
     *     celui d'une ecriture de style inoffensive.
     *
     * @description
     * Un seul mecanisme couvre les deux : `disposed` neutralise toute
     * programmation ULTERIEURE (le `nextTick` peut se resoudre APRES le
     * demontage, moment ou il n'y a encore aucun handle a annuler), et
     * l'ensemble `frames` annule ce qui est deja en vol.
     ********************************************************/
    let disposed = false
    const frames = new Set<number>()

    const scheduleFrame = (cb: () => void) => {
        if (disposed || typeof requestAnimationFrame === 'undefined') return

        const id = requestAnimationFrame(() => {
            frames.delete(id)

            if (disposed) return

            cb()
        })

        frames.add(id)
    }

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
        disposed = true

        for (const id of frames) cancelAnimationFrame(id)
        frames.clear()

        observer.disconnect()
    })

    const updateLocation = () => {
        observe = false
        scheduleFrame(() => observe = true)

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

        const viewport = intersectScrollParents(scrollParents)
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

            ;[x, y] = applyEdgeOffset(x, y, _placement.anchor.side, offset.value[0])
            ;[x, y] = applyEdgeOffset(x, y, _placement.anchor.align, offset.value[1])

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
            const flip = flipPlacement(placement, overflows, flipped, checkOverflow)
            placement = flip.placement
            if (flip.reset) continue

            // shift
            x = shiftAxis(x, overflows.x)
            contentBox.x = shiftAxis(contentBox.x, overflows.x)
            y = shiftAxis(y, overflows.y)
            contentBox.y = shiftAxis(contentBox.y, overflows.y)

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
        if (disposed) return

        const result = updateLocation()

        // #1409: overflowing content should only require a single updateLocation call
        // Icky hack to make sure the content is positioned consistently
        if (!result) return
        const {available, contentBox} = result
        if (contentBox.height > available.y) {
            scheduleFrame(() => {
                updateLocation()
                scheduleFrame(() => {
                    updateLocation()
                })
            })
        }
    })

    return {updateLocation}
}

/*********************************************************
 * resolveOrigin
 *
 * @description
 * Resolve the transform origin of the connected strategy from its `origin` prop.
 ********************************************************/
function resolveOrigin (origin: ILocationStrategyProps['origin'], anchor: TParsedAnchor): TParsedAnchor {
    if (origin === 'overlap') return anchor
    if (origin === 'auto') return flipSide(anchor)

    return parseAnchor(origin as TAnchor)
}

/*********************************************************
 * intersectScrollParents
 *
 * @description
 * Intersection of the scroll parents' client boxes (the area the content may occupy).
 ********************************************************/
function intersectScrollParents (scrollParents: Array<HTMLElement>): IBox {
    return scrollParents.reduce<IBox>((box: IBox | undefined, el) => {
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
}

/*********************************************************
 * applyEdgeOffset
 *
 * @description
 * Move the point away from the anchor by `amount` along the edge it is attached to.
 ********************************************************/
function applyEdgeOffset (x: number, y: number, edge: string, amount: number): [number, number] {
    switch (edge) {
        case 'top':
            return [x, y - amount]
        case 'bottom':
            return [x, y + amount]
        case 'left':
            return [x - amount, y]
        case 'right':
            return [x + amount, y]
        default:
            return [x, y]
    }
}

/*********************************************************
 * shiftAxis
 *
 * @description
 * Pull a coordinate back inside the viewport: first the `before` overflow, then the `after` one.
 ********************************************************/
function shiftAxis (value: number, overflow: TAxisOverflow): number {
    if (overflow.before) value += overflow.before
    if (overflow.after) value -= overflow.after

    return value
}

/*********************************************************
 * flipPlacement
 *
 * @description
 * Try to flip the placement on each overflowing axis, keeping the flip when it overflows less.
 ********************************************************/
function flipPlacement (
    initial: TPlacement,
    overflows: TOverflow,
    flipped: { x: boolean, y: boolean },
    checkOverflow: (placement: TPlacement) => { overflows: TOverflow }
): { placement: TPlacement, reset: boolean } {
    let placement = initial
    let reset = false
    const axis = getAxis(placement.anchor)
    const hasOverflow = {
        x: overflows.x.before || overflows.x.after,
        y: overflows.y.before || overflows.y.after
    }

    for (const key of [AXIS.X, AXIS.Y] as const) {
        if (!hasOverflow[key] || flipped[key]) continue

        const flip = (key === AXIS.X) === (axis === AXIS.Y) ? flipAlign : flipSide
        const newPlacement = {anchor: flip({...placement.anchor}), origin: flip({...placement.origin})}
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

    return {placement, reset}
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
