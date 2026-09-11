import type { InjectionKey } from 'vue'
import type { ITimelineContext } from '../../interfaces'

/**
 * Injection key for the OrigamTimeline → OrigamTimelineItem context.
 *
 * The matching `ITimelineContext` interface lives in
 * `src/interfaces/Timeline/timeline.interface.ts` per the
 * "interfaces ONLY in src/interfaces/" rule.
 */
export const TIMELINE_CONTEXT_KEY: InjectionKey<ITimelineContext | null> = Symbol.for('origam:timeline')
