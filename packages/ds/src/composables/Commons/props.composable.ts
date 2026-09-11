import type { IFilterPropsOptions } from "../../interfaces"

import { pick } from "../../utils"

import { ExtractPropTypes } from "vue"

/*********************************************************
 * useProps
 ********************************************************/
export function useProps<T extends Record<string, any>> (props: T): IFilterPropsOptions<T> {
    const defaultExcludes = ['class', 'style', 'id']

    const filterProps = <U extends Partial<ExtractPropTypes<T>>> (
        properties: U,
        excludes: string[] = defaultExcludes
    ) => {
        const propKeys = Object.keys(props).filter(key => !excludes.includes(key)) as Extract<keyof U, string>[]
        const picked = pick(properties, propKeys) as Record<string, unknown>
        // Strip `undefined` values — when this output feeds a `v-bind`,
        // Vue 3's Boolean prop coercion turns `undefined` into `false`,
        // silently overriding the child component's `withDefaults`. By
        // dropping undefined keys we let the child's defaults stand.
        for (const key of Object.keys(picked)) {
            if (picked[key] === undefined) delete picked[key]
        }
        return picked as Partial<U>
    }

    return {filterProps, props}
}
