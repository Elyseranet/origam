import type { Ref } from 'vue'
import { computed, isRef } from 'vue'
import type { TColor } from '../../types/Commons/color.type'
import { useColor } from './color.composable'

/*********************************************************
 * useTextColor
 *
 * @description
 * Resolves the text-only colour channel from a single prop source and
 * delegates to `useColor` — kept in its own file so the split by hook
 * stays one-file-one-hook, without duplicating `useColor`'s resolution
 * logic.
 ********************************************************/
export function useTextColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
) {
    const colors = computed(() => {
        let text: TColor = null
        if (isRef(props)) text = props.value
        else if (name) text = props[name]

        return {text}
    })

    const {colorClasses: textColorClasses, colorStyles: textColorStyles} = useColor(colors)

    return {textColorClasses, textColorStyles}
}
