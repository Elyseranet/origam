import type { TEventHandler } from '../../types'
import { isOn } from '../../utils'

/**
 * Get prefixed event handlers.
 *
 * @param attrs   …
 * @param suffix  …
 * @param getData …
 * @returns …
 */
export function getPrefixedEventHandlers<T extends `:${string}`> (
    attrs: Record<string, any>,
    suffix: T,
    getData: TEventHandler
): Record<`${string}${T}`, TEventHandler> {
    return Object.keys(attrs)
        .filter(key => isOn(key) && key.endsWith(suffix))
        .reduce((acc: any, key) => {
            acc[key.slice(0, -suffix.length)] = (event: Event) => attrs[key](event, getData(event))
            return acc
        }, {} as Record<`${string}${T}`, TEventHandler>)
}
