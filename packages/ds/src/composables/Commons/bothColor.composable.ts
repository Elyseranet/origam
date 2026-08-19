import type { ComputedRef, Ref } from 'vue'
import { computed, isRef } from 'vue'
import type { TColor } from '../../types'
import { useColor } from './color.composable'

/*********************************************************
 * useBothColor
 *
 * @description
 * Resolves a bg/text colour pair from two independent prop sources
 * (bgColorProps + colorProps) and delegates the actual CSS resolution
 * to `useColor` — kept in its own file so the split by hook stays
 * one-file-one-hook, without duplicating `useColor`'s resolution logic.
 ********************************************************/
export function useBothColor<T extends Record<K, TColor>, K extends string> (bgColorProps: T | Ref<TColor> | ComputedRef<TColor>, colorProps: T | Ref<TColor> | ComputedRef<TColor>, name?: K) {
    const bothColors = computed(() => {
        return {
            text: isRef(colorProps) ? colorProps.value : (name ? colorProps[name] : null),
            background: isRef(bgColorProps) ? bgColorProps.value : (name ? bgColorProps[name] : null)
        }
    })

    return useColor(bothColors)
}
