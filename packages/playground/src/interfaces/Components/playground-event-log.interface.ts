import type { IEventLogEntry } from '../Scene/event-log-entry.interface'

/*********************************************************
 * IPlaygroundEventLogProps
 ********************************************************/
export interface IPlaygroundEventLogProps {
    /** Newest first, as `useEventLog` keeps them. */
    entries: IEventLogEntry[]
}

/*********************************************************
 * IPlaygroundEventLogEmits
 ********************************************************/
export interface IPlaygroundEventLogEmits {
    (e: 'clear'): void
}

/*********************************************************
 * IPlaygroundEventLogSlots
 ********************************************************/
export interface IPlaygroundEventLogSlots {
    [name: string]: never
}
