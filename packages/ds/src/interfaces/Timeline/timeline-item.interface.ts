import type { IColorProps, ICommonsComponentProps, IDensityProps, ISizeProps } from '../../interfaces'
import type { TIcon, TIntent, TTimelineOrientation, TTimelineSide } from '../../types'

/*********************************************************
 * ITimelineItemProps / ITimelineItemSlots
 *
 * @description
 * Props/slots for `<OrigamTimelineItem>` — the only consumer. Split
 * out of `interfaces/Timeline/timeline.interface.ts` under issue
 * #364, which used to hold two distinct component surfaces
 * (Timeline / TimelineItem) in one file.
 ********************************************************/
export interface ITimelineItemProps extends ICommonsComponentProps, IColorProps, IDensityProps, ISizeProps {
    title?: string
    subtitle?: string
    /**
     * Body text rendered under the title. Falls back to the `#body` slot
     * when one is provided; when neither is set the body element is not
     * rendered at all.
     */
    description?: string
    icon?: TIcon
    intent?: TIntent
    isLast?: boolean
    truncateLine?: boolean
    side?: TTimelineSide
    /**
     * Layout direction forwarded by the parent OrigamTimeline. When unset
     * the item assumes vertical layout. Items rarely set this directly —
     * they receive it via inject from the parent.
     */
    orientation?: TTimelineOrientation
    index?: number
}

/** Slot signatures for `<OrigamTimelineItem>`. */
export interface ITimelineItemSlots {
    dot?: () => any
    /** Overrides the whole title/subtitle header + body block. */
    default?: () => any
    body?: () => any
}
