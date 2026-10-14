import type { MaybeRef } from 'vue'
import { readonly, shallowRef, watch } from 'vue'
import { DEFAULT_DOCUMENT } from '../../consts/Commons/commons.const'
import type { IStyleTagOptions } from '../../interfaces/Commons/style.interface'
import { tryOnMounted, tryOnScopeDispose } from '../../utils/Commons/commons.util'

let _id = 0

/**
 * Inject <style> element in head.
 *
 * Overload: Omitted id
 *
 * @param css
 * @param options
 */

/*********************************************************
 * useStyleTag
 *
 * @description
 * Injects a reactive `<style>` element into `<head>`, keyed by a
 * generated or caller-supplied id, and keeps its textContent in sync
 * with the reactive `css` source. `useStyle` (own file) builds a
 * per-instance rule ON TOP of this primitive rather than duplicating
 * the head-injection logic.
 ********************************************************/
export function useStyleTag (
    css: MaybeRef<string>,
    options: IStyleTagOptions = {}
) {
    const isLoaded = shallowRef(false)

    const {
        document = DEFAULT_DOCUMENT,
        immediate = true,
        manual = false,
        id = `origam_styletag_${++_id}`
    } = options

    const cssRef = shallowRef(css)

    let stop = () => {
    }
    /*********************************************************
     * load / unload — adopt the server's tag, never share a live one (#1092)
     *
     * @description
     * `load()` first looks the tag up by `id`: on a hydrated page that is the
     * `<style>` the server rendered, and adopting it (instead of appending a
     * second one) is the point. A tag is ADOPTED once: the flag marks it as
     * owned by a live instance, so a second Vue app in the same document that
     * derives the same id (ids are unique per app, not per document) gets a tag
     * of its own instead of rewriting the first one's rule — and, on unmount,
     * of removing it from under it.
     *
     * @description
     * `unload()` removes the element this instance holds, not whatever
     * `getElementById` finds: after a `document.head` wipe (a test, a host
     * resetting the head) the lookup returns `null` and `removeChild(null)`
     * throws.
     ********************************************************/
    let tag: HTMLStyleElement | undefined

    const load = () => {
        if (!document)
            return

        if (isLoaded.value)
            return

        const existing = document.getElementById(id) as HTMLStyleElement | null
        const adoptable = existing && existing.dataset.origamStyleOwned === undefined ? existing : undefined
        const el = adoptable ?? document.createElement('style')

        if (!el.isConnected) {
            el.id = existing ? `${id}-${++_id}` : id
            if (options.media)
                el.media = options.media
            document.head.appendChild(el)
        }

        el.dataset.origamStyleOwned = ''
        tag = el

        stop = watch(
            cssRef,
            (value) => {
                el.textContent = value
            },
            {immediate: true}
        )

        isLoaded.value = true
    }

    const unload = () => {
        if (!document || !isLoaded.value)
            return
        stop()
        tag?.remove()
        tag = undefined
        isLoaded.value = false
    }

    if (immediate && !manual)
        tryOnMounted(load)

    if (!manual)
        tryOnScopeDispose(unload)

    return {
        id,
        css: cssRef,
        unload,
        load,
        isLoaded: readonly(isLoaded)
    }
}
