import { useIntersectionObserver } from '../Commons/intersectionObserver.composable'
import { useMargin } from '../Commons/margin.composable'
import { usePadding } from '../Commons/padding.composable'
import { useVModel } from '../Commons/vModel.composable'

import type { IProgressTypeProps } from '../../interfaces/Progress/progress.interface'

import { int } from '../../utils/Commons/commons.util'

import { computed, useSlots } from 'vue'

/*********************************************************
 * useProgress
 ********************************************************/
export function useProgress (props: IProgressTypeProps) {
    const progress = useVModel(props, 'modelValue')
    const slots = useSlots()
    const {isIntersecting} = useIntersectionObserver()
    const {paddingClasses, paddingStyles} = usePadding(props)
    const {marginClasses, marginStyles} = useMargin(props)

    const thickness = computed(() => {
        return Number(props.thickness)
    })
    const max = computed(() => int(props.max as string))
    const normalizedValue = computed(() => {
        return parseFloat(progress.value as string) / max.value * 100
    })
    const hasContent = computed(() => {
        return slots.default
    })

    const progressClasses = computed(() => {
        return [
            'origam-progress',
            {
                'origam-progress--indeterminate': props.indeterminate,
                'origam-progress--visible': isIntersecting.value,
                'origam-progress--active': props.active,
                'origam-progress--striped': props.striped,
                'origam-progress--absolute': props.absolute
            },
            paddingClasses.value,
            marginClasses.value
        ]
    })

    const progressStyles = computed(() => {
        return [
            paddingStyles.value,
            marginStyles.value
        ]
    })

    return {progressClasses, progressStyles, normalizedValue, thickness, max, progress, hasContent}
}
