import { shallowRef } from 'vue'
import { EVENT_LOG_LIMIT } from '../../consts/Commons/event-log.const'
import type { IEventLogEntry } from '../../interfaces/Scene/event-log-entry.interface'
import { formatEmitPayload } from '../../utils/Commons/event-log.util'

/*********************************************************
 * useEventLog
 *
 * @description
 * The emits the rendered instance fired, newest first, bounded by `limit`
 * (`EVENT_LOG_LIMIT`). Payloads are formatted at record time — see
 * `IEventLogEntry` for why the raw arguments are not kept.
 *
 * @description
 * The log is UI state, not scene state: it is never written into the scene,
 * so a saved scene does not carry a history of clicks.
 ********************************************************/
export function useEventLog (limit = EVENT_LOG_LIMIT) {
    const entries = shallowRef<IEventLogEntry[]>([])
    let nextId = 0

    const record = (instanceId: string, componentName: string, name: string, args: unknown[]) => {
        const entry: IEventLogEntry = {
            id: nextId++,
            instanceId,
            componentName,
            name,
            payload: formatEmitPayload(args),
            at: Date.now()
        }

        entries.value = [entry, ...entries.value].slice(0, limit)
    }

    const clear = () => {
        entries.value = []
    }

    return { entries, record, clear }
}
