import type OrigamTimeline from '../../components/Timeline/OrigamTimeline.vue'
import type OrigamTimelineItem from '../../components/Timeline/OrigamTimelineItem.vue'
import { TIMELINE_SIDE } from '../../enums/Timeline/timeline.enum'
import type { TDirection } from '../Commons/direction.type'

export type TOrigamTimeline = InstanceType<typeof OrigamTimeline>
export type TOrigamTimelineItem = InstanceType<typeof OrigamTimelineItem>
export type TTimelineSide = `${TIMELINE_SIDE}`

/**
 * Layout axis of `<OrigamTimeline>`. Mirrors the global `TDirection` so
 * the timeline plays nicely with the rest of the design system's
 * direction props.
 */
export type TTimelineOrientation = TDirection
