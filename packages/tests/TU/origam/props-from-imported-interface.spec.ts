// Regression guard for a REMOVED workaround.
//
// Video / SliderField / Timeline / Treeview used to re-declare props inline
// inside `defineProps<IXxxProps & { … }>()`, with this comment:
//
//   "Belt-and-braces inline re-declaration: forces the Vue SFC compiler to
//    resolve these in the runtime props descriptor even when HMR caches the
//    interface."
//
// Measured on Vue 3.5.39 (2026-08): the compiler resolves imported interfaces
// across files perfectly well. Removing every inline re-declaration left all
// five runtime descriptors byte-identical — same keys, same types, same
// `required`, same defaults. The workaround was obsolete, so it is gone.
//
// This spec is its exit condition, kept pointing at the underlying capability
// rather than at the deleted lines: if a future toolchain change ever stops
// resolving props declared only in an imported interface, THIS fails and says
// so, instead of a component silently shipping without the prop. That is the
// failure mode the inline re-declaration was papering over.

import { describe, expect, it } from 'vitest'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import OrigamVideo from '@origam/components/Video/OrigamVideo.vue'
import OrigamTimelineItem from '@origam/components/Timeline/OrigamTimelineItem.vue'
import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import OrigamClientOnly from '@origam/components/ClientOnly/OrigamClientOnly.vue'

const propsOf = (c: any): string[] => Object.keys((c as any).props ?? {})

describe('props declared only in an imported interface reach the runtime descriptor', () => {
    it.each([
        // [component, label, props that exist ONLY in the imported interface]
        [OrigamSliderField, 'OrigamSliderField', ['inset', 'showTicks', 'ticks', 'tickSize']],
        [OrigamVideo, 'OrigamVideo', [
            'skipSeconds', 'showCenterControls', 'playbackRates',
            'playbackRate', 'inset', 'allowRemotePlayback', 'doubleTapToSkip'
        ]],
        [OrigamTimelineItem, 'OrigamTimelineItem', ['description', 'title', 'subtitle']],
        [OrigamTreeview, 'OrigamTreeview', ['ariaLabel', 'items', 'expandOnClick']],
        [OrigamClientOnly, 'OrigamClientOnly', ['placeholderTag', 'placeholderClass']]
    ])('%#. $1 exposes its interface-only props', (component, label, expected) => {
        const actual = propsOf(component)
        for (const prop of expected as string[]) {
            expect(actual, `${label} lost "${prop}" from its runtime props descriptor`).toContain(prop)
        }
    })

    // Total counts, pinned from the pre-removal measurement. A drop here means
    // props vanished wholesale rather than one at a time — the exact regression
    // that made `OrigamTimelineItem.description` disappear when its inline
    // declaration was first removed (it lived ONLY there; `ITimelineEntry`
    // declares a same-named field, which is a different interface entirely).
    //
    // 92 → 90 (SliderField) and 70 → 66 (Video): issue #501 — `IInputProps`
    // (SliderField extends it) narrowed `ITypographyProps` down to its
    // confirmed-painted subset (fontSize/fontWeight/lineHeight — dropped
    // fontFamily + letterSpacing, -2); `IVideoProps` narrowed to fontSize
    // only (dropped fontFamily/fontWeight/lineHeight/letterSpacing, -4).
    // Both were typed-but-unread on every reachable var — an intentional
    // API removal, not a regression.
    it.each([
        [OrigamSliderField, 'OrigamSliderField', 90],
        [OrigamVideo, 'OrigamVideo', 66],
        [OrigamTimelineItem, 'OrigamTimelineItem', 16],
        [OrigamTreeview, 'OrigamTreeview', 15],
        [OrigamClientOnly, 'OrigamClientOnly', 2]
    ])('%#. $1 keeps its full prop count', (component, label, count) => {
        expect(propsOf(component).length, `${label} prop count changed`).toBe(count)
    })
})
