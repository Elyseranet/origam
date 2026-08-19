import { ON_REGEX } from '../../consts/Commons/commons.const'
import { BUBBLING_EVENTS } from '../../consts/Input/input.const'
import { omit, pickWithRest } from '../Commons/commons.util'

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
