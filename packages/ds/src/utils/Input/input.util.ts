import { BUBBLING_EVENTS, ON_REGEX } from '../../consts'
import { omit, pickWithRest } from '../../utils'

/**
 * Filter attributes that should be applied to
 * the root element of an input component. Remaining
 * attributes should be passed to the <input> element inside.
 */
export function filterInputAttrs (attrs: Record<string, unknown>) {
    const [events, props] = pickWithRest(attrs, [ON_REGEX])
    const inputEvents = omit(events, BUBBLING_EVENTS)
    const [rootAttrs, inputAttrs] = pickWithRest(props, ['class', 'style', 'id', /^data-/])
    Object.assign(rootAttrs, events)
    Object.assign(inputAttrs, inputEvents)
    return [rootAttrs, inputAttrs]
}
