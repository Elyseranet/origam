import type { ComponentInternalInstance, ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, getCurrentInstance, inject, onMounted, toValue } from 'vue'
import { ORIGAM_SSR_STYLES_KEY, SSR_STYLE_TAG_PREFIX } from '../../consts/Commons/ssr-style.const'
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
/*********************************************************
 * toKebabCase
 *
 * @description
 * Vue's `StyleValue` objects carry JS-side camelCase keys (`zIndex`,
 * `backgroundColor`) because that's what `element.style[key] = …` and
 * `:style="…"` bindings accept — the DOM normalises camelCase to the real
 * CSS property for you.
 *
 * @description
 * `toDeclarations` below serialises the SAME bag into literal CSS text
 * instead, which the DOM never sees and never normalises: `zIndex: 2000` is
 * not a CSS declaration, `z-index: 2000` is. A custom property
 * (`--origam-…`) is left untouched — its name is case-sensitive and is
 * never camelCase to begin with. Confirmed as a real, shipping bug while
 * investigating issue #536 (`useStack()`'s `stackStyles` feeds `{ zIndex }`
 * straight into `useStyle()`).
 ********************************************************/
function toKebabCase (key: string): string {
    return key.startsWith('--') ? key : key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function toDeclarations (value: unknown): string[] {
    if (value == null || typeof value === 'boolean' || typeof value === 'number') return []

    if (typeof value === 'string') return value.length > 0 ? [value] : []

    if (Array.isArray(value)) return value.flatMap(toDeclarations)

    if (typeof value === 'object') {
        const bag = value as Record<string, unknown>

        return Object.keys(bag)
            .filter((key) => typeof bag[key] !== 'undefined')
            .map((key) => `${toKebabCase(key)}: ${bag[key]}`)
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

const styleSlots = new WeakMap<ComponentInternalInstance, number>()

function nextStyleSlot (): number {
    const vm = getCurrentInstance()
    if (!vm) return 0

    const slot = styleSlots.get(vm) ?? 0

    styleSlots.set(vm, slot + 1)

    return slot
}

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

    // The tag id is derived from the instance's `useId()` value, which is the
    // same on the server and at hydration. `useStyleTag`'s own default is a
    // module counter, unusable here: it differs between the two sides, so the
    // client could never find the tag the server rendered.
    // An instance may call `useStyle` several times (its own, plus the
    // composables it uses): the call index keeps the tags apart, and it is
    // deterministic because setup runs the same calls in the same order on
    // both sides.
    const tagId = `${SSR_STYLE_TAG_PREFIX}${fallbackId}-${nextStyleSlot()}`

    // #1092 — `onMounted` never runs on the server, so the rule used to exist
    // only after hydration. The collector is provided by `createOrigam()` on
    // the server alone (`null` on the client, no warning thanks to the default).
    // It is handed a GETTER, read when the host collects the rules.
    inject(ORIGAM_SSR_STYLES_KEY, null)?.add(tagId, () => customCss.value)

    // On the client `load()` reuses the server's `<style id=tagId>` when it is
    // in the document (`getElementById` first), so there is never a second one.
    const {id: styleTagId, css, load, unload, isLoaded} = useStyleTag(customCss, {id: tagId})

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
