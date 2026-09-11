import type { OrigamTimeline, OrigamTimelineItem } from '../../components'

export type TOrigamTimeline = InstanceType<typeof OrigamTimeline>
export type TOrigamTimelineItem = InstanceType<typeof OrigamTimelineItem>
export type TTimelineSide = 'start' | 'end' | 'alternating'
export type TTimelineOrientation = 'vertical' | 'horizontal'
