import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import type { TColor } from '../../types'
import { useColor } from './color.composable'

/*********************************************************
 * useBackgroundColor
 *
 * @description
 * Resolves the background-only colour channel from a single prop
 * source and delegates to `useColor` — kept in its own file so the
 * split by hook stays one-file-one-hook, without duplicating
 * `useColor`'s resolution logic.
 ********************************************************/
export function useBackgroundColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
) {
    const colors = computed(() => ({
        background: isRef(props) ? props.value : (name ? props[name] : null)
    }))

    const {colorClasses: backgroundColorClasses, colorStyles: backgroundColorStyles} = useColor(colors)

    return {backgroundColorClasses, backgroundColorStyles}
}
