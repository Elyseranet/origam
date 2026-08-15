// Unit tests for <OrigamParallaxElement> — no prior spec existed.
//
// Context: `calculateMouseMovement()` branches on `parallax.event.value`
// (PARALLAX_EVENT: MOVE / SCROLL / ORIENTATION) and `props.axis` (AXIS: X /
// Y / BOTH) to decide which movement channel each axis prop zeroes out —
// exactly the kind of enum-driven branching the mission flags as invisible
// to the type-checker on a member swap. The SCROLL branch is also
// deliberately asymmetric (it reads the LOCAL `y` value for BOTH output
// channels, never `x`) which is easy to "fix" into something that looks
// more symmetric but changes real behaviour.
//
// Strategy: inject a fully-controlled ORIGAM_PARALLAX_KEY context (shape,
// isMoving, movement, event — all real refs) so `calculateMouseMovement`
// takes the live (non-early-return) path, then read the resulting
// `transform: translate3d(...)` inline style. With the default `type`
// (TRANSLATE) and `strength=10`, `translateMovement(x, y)` resolves to
// `translate3d(${-(x+1)}px, ${-(y+1)}px, 0)` — a zeroed channel always
// renders as exactly `-1px`, a passed-through channel renders as the
// distinctive `-(value+1)px`, which is what every assertion below keys on.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import OrigamParallaxElement from '@origam/components/Parallax/OrigamParallaxElement.vue'
import { ORIGAM_PARALLAX_KEY } from '@origam/consts'
import type { IBox, IParallaxProvide } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const SHAPE: IBox = { x: 0, y: 0, width: 200, height: 200, top: 0, bottom: 200, left: 0, right: 200 }

const makeParallaxProvide = (overrides: Partial<IParallaxProvide> = {}): IParallaxProvide => ({
    audioData: ref(null),
    eventData: ref({ x: 0, y: 0 }),
    movement: ref({ x: 2, y: 3, target: undefined }),
    isMoving: ref(true),
    event: ref('move' as any),
    duration: ref(200),
    easing: ref('ease-out'),
    shape: ref(SHAPE),
    ...overrides
})

const mountElement = (parallax: IParallaxProvide, props: Record<string, any> = {}) =>
    mount(OrigamParallaxElement, {
        props,
        global: {
            plugins: [createOrigam()],
            provide: { [ORIGAM_PARALLAX_KEY as unknown as string]: parallax }
        }
    })

const transformOf = (wrapper: ReturnType<typeof mountElement>) =>
    (wrapper.element as HTMLElement).style.transform

// ---------------------------------------------------------------------------
// event="move" (non-scroll path) — axis zeroes the OTHER channel, passes
// its own through untouched
// ---------------------------------------------------------------------------
describe('OrigamParallaxElement — calculateMouseMovement, event="move"', () => {
    // movement={x:2, y:3}, originX/Y default 50 → elementMovement gives
    // local x=(2-1)*10=10, y=(3-1)*10=20 (strength=10, non-scroll origin).

    it('no axis set: both channels pass through (X=10 -> -11px, Y=20 -> -21px)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('move' as any) }))
        expect(transformOf(wrapper)).toBe('translate3d(-11px, -21px, 0)')
        wrapper.unmount()
    })

    it('axis="x": X passes through (-11px), Y is zeroed (-1px)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('move' as any) }), { axis: 'x' })
        expect(transformOf(wrapper)).toBe('translate3d(-11px, -1px, 0)')
        wrapper.unmount()
    })

    it('axis="y": X is zeroed (-1px), Y passes through (-21px)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('move' as any) }), { axis: 'y' })
        expect(transformOf(wrapper)).toBe('translate3d(-1px, -21px, 0)')
        wrapper.unmount()
    })

    it('axis="both" behaves like no axis: both channels pass through', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('move' as any) }), { axis: 'both' })
        expect(transformOf(wrapper)).toBe('translate3d(-11px, -21px, 0)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// event="orientation" takes the SAME (non-scroll) branch as "move"
// ---------------------------------------------------------------------------
describe('OrigamParallaxElement — calculateMouseMovement, event="orientation"', () => {
    it('behaves like event="move": axis="x" passes X through, zeroes Y', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('orientation' as any) }), { axis: 'x' })
        expect(transformOf(wrapper)).toBe('translate3d(-11px, -1px, 0)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// event="scroll" — deliberately asymmetric: BOTH output channels are
// sourced from the local `y` value, never `x`. `axis` only chooses which
// OUTPUT channel receives it; unset axis behaves like axis="y".
// ---------------------------------------------------------------------------
describe('OrigamParallaxElement — calculateMouseMovement, event="scroll"', () => {
    // movement={x:2, y:3}. On scroll, originY is halved-and-negated
    // (-originY/2 = -25), so local y = (3 - (-25/50)) * 10 = (3 + 0.5) * 10 = 35.

    it('axis="x": the scroll value routes to the X channel (-36px), Y is zeroed (-1px)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('scroll' as any) }), { axis: 'x' })
        expect(transformOf(wrapper)).toBe('translate3d(-36px, -1px, 0)')
        wrapper.unmount()
    })

    it('axis="y": X is zeroed (-1px), the scroll value routes to the Y channel (-36px)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('scroll' as any) }), { axis: 'y' })
        expect(transformOf(wrapper)).toBe('translate3d(-1px, -36px, 0)')
        wrapper.unmount()
    })

    it('no axis set behaves like axis="y" (scroll value defaults to the Y channel)', () => {
        const wrapper = mountElement(makeParallaxProvide({ event: ref('scroll' as any) }))
        expect(transformOf(wrapper)).toBe('translate3d(-1px, -36px, 0)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Early-return guards — no shape / not moving -> transform stays at the
// zeroed baseline (-1px, -1px) regardless of axis/event
// ---------------------------------------------------------------------------
describe('OrigamParallaxElement — calculateMouseMovement early-return guards', () => {
    it('shape=null -> zero movement regardless of axis', () => {
        const wrapper = mountElement(makeParallaxProvide({ shape: ref(null) }), { axis: 'x' })
        expect(transformOf(wrapper)).toBe('translate3d(-1px, -1px, 0)')
        wrapper.unmount()
    })

    it('isMoving=false -> zero movement even with a valid shape', () => {
        const wrapper = mountElement(makeParallaxProvide({ isMoving: ref(false) }), { axis: 'x' })
        expect(transformOf(wrapper)).toBe('translate3d(-1px, -1px, 0)')
        wrapper.unmount()
    })
})
