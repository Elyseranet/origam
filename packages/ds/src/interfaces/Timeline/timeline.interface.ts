import type { IColorProps, ICommonsComponentProps, IDensityProps, ISizeProps, ITagProps } from '../../interfaces'
import type { TIcon, TIntent, TTimelineOrientation } from '../../types'

/**
 * Shape of the context object provided by OrigamTimeline to its
 * nested OrigamTimelineItem children. Used via inject so each item
 * picks up the parent's layout direction / shared visual props
 * without having to receive them as explicit props.
 *
 * The matching injection key lives in
 * `src/consts/Timeline/timeline.const.ts` (TIMELINE_CONTEXT_KEY).
 */
export interface ITimelineContext {
    side: 'start' | 'end' | 'alternating'
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
    side?: 'start' | 'end' | 'alternating'
    truncateLine?: boolean
    ariaLabel?: string
}

export interface ITimelineItemProps extends ICommonsComponentProps, IColorProps, IDensityProps, ISizeProps {
    title?: string
    subtitle?: string
    icon?: TIcon
    intent?: TIntent
    isLast?: boolean
    truncateLine?: boolean
    side?: 'start' | 'end' | 'alternating'
    /**
     * Layout direction forwarded by the parent OrigamTimeline. When unset
     * the item assumes vertical layout. Items rarely set this directly —
     * they receive it via inject from the parent.
     */
    orientation?: TTimelineOrientation
    index?: number
}
