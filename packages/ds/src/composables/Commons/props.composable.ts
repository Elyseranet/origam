import type { IFilterPropsOptions } from '../../interfaces/Commons/commons.interface'

import { pick } from '../../utils/Commons/commons.util'

import { ExtractPropTypes } from "vue"

/*********************************************************
 * useProps
 *
 * ## The template-ref forwarding pattern, and its one-tick delta
 *
 * 39 components (68 call sites, re-derive with
 *     grep -rlE "Ref\.value\??\.filterProps" packages/ds/src/components/
 * ) forward their resolved props to an INTERNAL ROOT component through that
 * child's own exposed `filterProps`, reached via a TEMPLATE REF:
 *
 *     const childRef = ref<TOrigamChild>()
 *     const childProps = computed(() => childRef.value?.filterProps(props, […]))
 *
 * A template ref is `undefined` during the first render — it is assigned while
 * that very render is being patched. So render 1 binds NOTHING and the child
 * paints with its OWN resolved value; assigning the ref invalidates the
 * computed, and render 2 delivers the parent's. Before ADR-005's theme-props
 * resolver landed, the parent's value often never arrived at all, so the
 * mismatch was PERMANENT and read as an ordinary bug; the resolver turned it
 * into a one-tick transient.
 *
 * ## Measured: the transient is real, and it is NOT observable
 *
 * The delta is real. Reading `wrapper.html()` synchronously after `mount()`
 * and again after `nextTick()` differs on 13 of the 16 sampled mountable
 * components (Switch, TextField, Checkbox, Radio, Select, NumberField,
 * PasswordField, RatingField, TextareaField, FileField, Carousel, ColorPicker,
 * DatePicker; Btn, Field and SliderField are stable). On OrigamSwitch the
 * difference is one class: `origam-input--density-default` (the child's own
 * themed value) becomes `origam-input--density-compact` (the parent's).
 *
 * It is nevertheless invisible, because Vue flushes the invalidated re-render
 * on a MICROTASK, and the browser paints only at the end of a task — after the
 * microtask checkpoint. Measured in Chromium against the built Histoire with a
 * per-animation-frame sampler (rAF callbacks run immediately before that
 * frame's paint, so the sample sequence IS the sequence a user could see):
 * 10 cold loads × 40 frames = 400 painted frames of the OrigamSwitch root,
 * sampling both the density class and `offsetHeight` (density moves geometry).
 * Every one of the 400: `compact@76`. Zero frames carried the stale value, and
 * the height never jumped.
 *
 * ⛔ So do NOT refactor these 68 sites to avoid the template ref on
 * "flash" grounds — there is no flash to fix, and the change would touch 39
 * components at once. If you have a DIFFERENT reason to move off template refs
 * (SSR, or a `watch`/`computed` in a consumer observing the intermediate
 * value, which IS reachable unlike the paint), state that reason: it is not
 * this one.
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
