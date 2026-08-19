import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, onMounted, toValue } from 'vue'
import { escapeCssIdent } from '../../utils/Commons/dom.util'
import { getCurrentInstanceName, getUid } from '../../utils/Commons/getCurrentInstance.util'
import { useStyleTag } from './styleTag.composable'

/**
 * Flatten a Vue style bag (`StyleValue`) into a list of `prop: value`
 * declaration strings.
 *
 * Recursive, because `StyleValue` is recursive: an array may hold objects,
 * strings and further arrays at any depth. The previous single-level
 * `.map().flat()` left an object nested one array deep unexpanded, and it
 * reached the sheet as the literal `[object Object]`.
 *
 * Booleans and numbers are DROPPED, and that is the point: `StyleValue`
 * includes `false`, so `defineProps<{ style?: … | StyleValue }>` compiles to
 * a runtime prop type that contains `Boolean` — and Vue resolves an unpassed
 * prop whose declared type includes boolean to the concrete value `false`,
 * never `undefined`. Every component exposing the shared `style` prop
 * therefore fed a bare `false` into its own rule (`#id {false}`), which is
 * not a declaration: browsers discard it by error recovery and jsdom
 * discards the whole sheet with "Could not parse CSS stylesheet". Same
 * reasoning for numbers — a bare `0` is not a declaration either.
 */
function toDeclarations (value: unknown): string[] {
    if (value == null || typeof value === 'boolean' || typeof value === 'number') return []

    if (typeof value === 'string') return value.length > 0 ? [value] : []

    if (Array.isArray(value)) return value.flatMap(toDeclarations)

    if (typeof value === 'object') {
        const bag = value as Record<string, unknown>

        return Object.keys(bag)
            .filter((key) => typeof bag[key] !== 'undefined')
            .map((key) => `${key}: ${bag[key]}`)
    }

    return []
}

/**
 * Build a per-instance stylesheet out of a computed style bag and inject it
 * in `<head>`, scoped to the root element's id.
 *
 * `uniq` is the id the CALLER wants that root element to carry. Passing
 * `() => props.id` is what makes a consumer-supplied `id` win over the
 * generated one: the returned `id` is what the component binds to its root,
 * and the generated rule targets that same id — so honouring the consumer's
 * `id` never orphans the rule. Reactive (ref / getter) so that an `id` that
 * appears on a later render is picked up.
 *
 * When the caller passes nothing (or an empty value) the generated
 * `<name>-<uid>` id is used, exactly as before.
 */

/*********************************************************
 * useStyle
 *
 * @description
 * Serialises a reactive style bag into a scoped `#id { … }` rule and
 * delegates the actual `<head>` injection to `useStyleTag` rather than
 * duplicating it — this hook only owns the id resolution + style-bag
 * flattening (`toDeclarations`).
 ********************************************************/
export function useStyle (
    styles: ComputedRef,
    uniq: MaybeRefOrGetter<string | undefined> = undefined,
    name = getCurrentInstanceName()
) {
    // Resolved ONCE, in setup. `getUid()` is memoised per instance so the
    // value was already stable, but it throws without an active instance —
    // and a reactive `uniq` means this computed can now re-evaluate outside
    // a render, where `getCurrentInstance()` is null.
    const fallbackId = `${name}-${getUid()}`

    // The emptiness test is written out rather than folded into `||`: an empty
    // string must fall back too — it would otherwise produce the invalid
    // selector `# { … }` — and `??` alone would let it through. Spelling the
    // condition out says which values are rejected instead of leaving it to the
    // reader to recall what `||` treats as falsy.
    const id = computed(() => {
        const requested = toValue(uniq)

        return typeof requested === 'string' && requested.length > 0 ? requested : fallbackId
    })

    const customCss = computed(() => {
        const stylesArray = toDeclarations(styles.value)

        return `#${escapeCssIdent(id.value)} {${stylesArray.join(';')}}`
    })

    const {id: styleTagId, css, load, unload, isLoaded} = useStyleTag(customCss)

    onMounted(() => {
        load()
    })

    return {
        id,
        styleTagId,
        css,
        load,
        unload,
        isLoaded
    }
}
