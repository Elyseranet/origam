import type { OrigamTimeline, OrigamTimelineItem } from '../../components'
import type { TDirection } from '../Commons/direction.type'

export type TOrigamTimeline = InstanceType<typeof OrigamTimeline>
export type TOrigamTimelineItem = InstanceType<typeof OrigamTimelineItem>
export type TTimelineSide = 'start' | 'end' | 'alternating'

/**
 * Layout axis of `<OrigamTimeline>`. Mirrors the global `TDirection` so
 * the timeline plays nicely with the rest of the design system's
 * direction props.
 */
export type TTimelineOrientation = TDirection
