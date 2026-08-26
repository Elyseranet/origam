import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { TIcon } from '../../types/Icon/icon.type'
import type { TIntent } from '../../types/Commons/intent.type'
import type {
    TTimelineOrientation,
    TTimelineSide
} from '../../types/Timeline/timeline.type'

/**
 * Shape of the context object provided by OrigamTimeline to its
 * nested OrigamTimelineItem children. Used via inject so each item
 * picks up the parent's layout direction / shared visual props
 * without having to receive them as explicit props.
 *
 * The matching injection key lives in
 * `src/consts/Timeline/timeline.const.ts` (TIMELINE_CONTEXT_KEY).
 *
 * `ITimelineItemProps` / `ITimelineItemSlots` (the actual
 * `<OrigamTimelineItem>` component surface) moved out to
 * `interfaces/Timeline/timeline-item.interface.ts` under issue #364 —
 * this file used to hold both distinct component surfaces
 * (Timeline / TimelineItem).
 */
export interface ITimelineContext {
    side: TTimelineSide
    truncateLine: boolean
    orientation: TTimelineOrientation
    color?: string
}

export interface ITimelineEntry {
    title: string
    subtitle?: string
    description?: string
    icon?: TIcon
    intent?: TIntent
}

export interface ITimelineProps extends ICommonsComponentProps, ITagProps, IColorProps, ISizeProps, IDensityProps {
    items?: ITimelineEntry[]
    /**
     * Layout direction.
     *  - `'vertical'` (default): dots stacked top→bottom, content next to each dot
     *    (`side` chooses left / right / alternating).
     *  - `'horizontal'`: dots laid out left→right inside a scroll-snapping
     *    track so the user can navigate point-to-point with a swipe / scroll.
     *    Content (title/subtitle/body) renders BELOW each dot.
     */
    orientation?: TTimelineOrientation
    side?: TTimelineSide
    truncateLine?: boolean
    ariaLabel?: string
}

/** Slot signatures for `<OrigamTimeline>`. */
export interface ITimelineSlots {
    /** Overrides the whole auto-generated `<OrigamTimelineItem>` list. */
    default?: () => any
}

/** `<OrigamTimeline>` renders a static list of `<OrigamTimelineItem>` —
 *  nothing is emitted. */
export interface ITimelineEmits {}
