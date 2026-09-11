// Unit tests for <OrigamTimelineItem> — contentSide / context-override logic
//
// Context: OrigamTimeline.spec.ts already covers dot intent vars, title/
// subtitle rendering and the parent's own orientation/side/truncateLine
// classes, but it never asserts the PER-ITEM class that `contentSide`
// produces when `side="alternating"`, nor the context-override precedence
// documented by the component itself:
//
//   effectiveSide       = timelineCtx?.side ?? props.side
//   effectiveOrientation = timelineCtx?.orientation ?? props.orientation
//   effectiveTruncateLine = timelineCtx?.truncateLine !== undefined
//                             ? timelineCtx.truncateLine : props.truncateLine
//
// `contentSide` derives from TIMELINE_SIDE (recently re-derived from an
// enum into TTimelineSide) via `props.index % 2 === 0 ? START : END`. A
// member-value swap (START <-> END) or an inverted parity check is
// invisible to the type-checker and would only show up as a real DOM class
// mismatch — which is what this file asserts.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamTimeline from '@origam/components/Timeline/OrigamTimeline.vue'
import OrigamTimelineItem from '@origam/components/Timeline/OrigamTimelineItem.vue'
import { TIMELINE_CONTEXT_KEY } from '@origam/consts'
import type { ITimelineContext } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const ITEMS = [
    { title: 'Step 1' },
    { title: 'Step 2' },
    { title: 'Step 3' }
]

// ---------------------------------------------------------------------------
// contentSide alternating — through the real parent (side="alternating")
// ---------------------------------------------------------------------------
describe('OrigamTimelineItem — contentSide alternating (via parent)', () => {
    it('even index (0, 2) renders side-start, odd index (1) renders side-end + content-end', () => {
        const wrapper = mount(OrigamTimeline, {
            props: { items: ITEMS, side: 'alternating' },
            global: { plugins: [createOrigam()], components: { OrigamTimelineItem } },
            attachTo: document.body
        })

        const items = wrapper.findAll('.origam-timeline-item')
        expect(items[0].classes()).toContain('origam-timeline-item--side-start')
        expect(items[0].classes()).not.toContain('origam-timeline-item--content-end')

        expect(items[1].classes()).toContain('origam-timeline-item--side-end')
        expect(items[1].classes()).toContain('origam-timeline-item--content-end')

        expect(items[2].classes()).toContain('origam-timeline-item--side-start')
        expect(items[2].classes()).not.toContain('origam-timeline-item--content-end')

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// contentSide alternating — standalone item, no injected timeline context,
// driven purely by its own `side` + `index` props
// ---------------------------------------------------------------------------
describe('OrigamTimelineItem — contentSide alternating (standalone, own props)', () => {
    const mountStandalone = (props: Record<string, any>) =>
        mount(OrigamTimelineItem, {
            props,
            global: { plugins: [createOrigam()] }
        })

    it('index=0 (even) with side="alternating" renders side-start', () => {
        const wrapper = mountStandalone({ side: 'alternating', index: 0 })
        expect(wrapper.classes()).toContain('origam-timeline-item--side-start')
        wrapper.unmount()
    })

    it('index=1 (odd) with side="alternating" renders side-end', () => {
        const wrapper = mountStandalone({ side: 'alternating', index: 1 })
        expect(wrapper.classes()).toContain('origam-timeline-item--side-end')
        wrapper.unmount()
    })

    it('side="end" (not alternating) renders side-end regardless of index parity', () => {
        const wrapper = mountStandalone({ side: 'end', index: 0 })
        expect(wrapper.classes()).toContain('origam-timeline-item--side-end')
        expect(wrapper.classes()).not.toContain('origam-timeline-item--side-start')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Context-override precedence — injected TIMELINE_CONTEXT_KEY wins over the
// item's own props whenever the context value is defined (even falsy).
// ---------------------------------------------------------------------------
describe('OrigamTimelineItem — timeline context overrides own props', () => {
    const mountWithContext = (context: ITimelineContext, props: Record<string, any> = {}) =>
        mount(OrigamTimelineItem, {
            props,
            global: {
                plugins: [createOrigam()],
                provide: { [TIMELINE_CONTEXT_KEY as unknown as string]: context }
            }
        })

    it('context side="end" overrides the item own side="start" prop', () => {
        const wrapper = mountWithContext(
            { side: 'end', truncateLine: false, orientation: 'vertical' },
            { side: 'start' }
        )
        expect(wrapper.classes()).toContain('origam-timeline-item--side-end')
        expect(wrapper.classes()).not.toContain('origam-timeline-item--side-start')
        wrapper.unmount()
    })

    it('context orientation="horizontal" overrides the item own orientation="vertical" prop', () => {
        const wrapper = mountWithContext(
            { side: 'start', truncateLine: false, orientation: 'horizontal' },
            { orientation: 'vertical' }
        )
        expect(wrapper.classes()).toContain('origam-timeline-item--orientation-horizontal')
        wrapper.unmount()
    })

    it('context truncateLine=false wins over the item own truncateLine=true prop (connector stays visible on last item)', () => {
        const wrapper = mountWithContext(
            { side: 'start', truncateLine: false, orientation: 'vertical' },
            { truncateLine: true, isLast: true }
        )
        expect(wrapper.find('.origam-timeline-item__connector').exists()).toBe(true)
        wrapper.unmount()
    })

    it('context truncateLine=true wins over the item own truncateLine=false prop (connector hidden on last item)', () => {
        const wrapper = mountWithContext(
            { side: 'start', truncateLine: true, orientation: 'vertical' },
            { truncateLine: false, isLast: true }
        )
        expect(wrapper.find('.origam-timeline-item__connector').exists()).toBe(false)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// showConnector — standalone item, own truncateLine prop only
// ---------------------------------------------------------------------------
describe('OrigamTimelineItem — showConnector (standalone, own props)', () => {
    it('shows the connector when isLast=true but truncateLine=false', () => {
        const wrapper = mount(OrigamTimelineItem, {
            props: { isLast: true, truncateLine: false },
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.find('.origam-timeline-item__connector').exists()).toBe(true)
        wrapper.unmount()
    })

    it('hides the connector only when BOTH isLast=true and truncateLine=true', () => {
        const wrapper = mount(OrigamTimelineItem, {
            props: { isLast: true, truncateLine: true },
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.find('.origam-timeline-item__connector').exists()).toBe(false)
        wrapper.unmount()
    })

    it('shows the connector when truncateLine=true but isLast=false', () => {
        const wrapper = mount(OrigamTimelineItem, {
            props: { isLast: false, truncateLine: true },
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.find('.origam-timeline-item__connector').exists()).toBe(true)
        wrapper.unmount()
    })
})
