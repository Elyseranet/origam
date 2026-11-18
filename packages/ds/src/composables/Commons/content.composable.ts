import { computed } from 'vue'

import type { IContentProps } from '../../interfaces/Commons/content.interface'

import { convertToUnit } from '../../utils/Commons/commons.util'

/*********************************************************
 * useContent
 *
 * @description
 * Inline style of a `__content` wrapper from `contentDisplay` / `contentGap`.
 * `undefined` when neither is set, so the token defaults stay in charge.
 ********************************************************/
export function useContent (props: IContentProps) {
    const contentStyles = computed(() => {
        const gap = convertToUnit(props.contentGap)

        return props.contentDisplay || gap
            ? { display: props.contentDisplay, gap }
            : undefined
    })

    return { contentStyles }
}
