import * as origamComponents from './components'
import * as origamDirectives from './directives'

import { createOrigamCore } from './origam-core'

import type { IOrigamOptions } from './interfaces'
import { mergeDeep } from './utils'

import '@mdi/font/css/materialdesignicons.css'

export { activeDefaultsFor } from './origam-core'

/*********************************************************
 * createOrigam
 *
 * @description
 * Full entry: every component and directive plus the MDI stylesheet, unless
 * the consumer passes its own `components` / `directives`. The install logic
 * lives in `createOrigamCore` (origam-core.ts, #1384), which imports none of
 * them — use it directly for a tree-shakable build.
 ********************************************************/
export function createOrigam (origam: IOrigamOptions = {}) {
    const {blueprint, ...rest} = origam
    const options: IOrigamOptions = mergeDeep(blueprint, rest)

    return createOrigamCore({
        ...options,
        components: options.components ?? origamComponents,
        directives: options.directives ?? origamDirectives
    })
}
