import type { MaybeRef } from 'vue'
import { readonly, shallowRef, watch } from 'vue'
import { DEFAULT_DOCUMENT } from '../../consts'
import type { IStyleTagOptions } from '../../interfaces'
import { tryOnMounted, tryOnScopeDispose } from '../../utils'

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
    const load = () => {
        if (!document)
            return

        const el = (document.getElementById(id) || document.createElement('style')) as HTMLStyleElement

        if (!el.isConnected) {
            el.id = id
            if (options.media)
                el.media = options.media
            document.head.appendChild(el)
        }

        if (isLoaded.value)
            return

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
        document.head.removeChild(document.getElementById(id) as HTMLStyleElement)
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
