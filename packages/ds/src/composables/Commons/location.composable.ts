import { computed } from 'vue'
import { OPPOSITE_MAP } from '../../consts/Commons/location.const'
import type { ILocationProps } from '../../interfaces/Commons/location.interface'
import type { TAnchor } from '../../types/Commons/anchor.type'
import { parseAnchor } from '../../utils/Commons/anchor.util'

/*********************************************************
 * useLocation
 *
 * @description
 * Resolves a `location` prop (e.g. `'top end'`) into absolute-position
 * CSS declarations, with an optional offset callback and an
 * `opposite` mode used by anchored/floating components.
 * Independent from `useLocationStrategies` — no shared state or call
 * dependency.
 ********************************************************/
export function useLocation (props: ILocationProps, opposite = false, offset?: (side: string) => number) {

    const locationStyles = computed(() => {
        if (!props.location) return {}

        const {side, align} = parseAnchor(
            props.location.split(' ').length > 1
                ? props.location
                : `${props.location} center` as TAnchor
        )

        const getOffset = (side: string) => {
            return offset
                ? offset(side)
                : 0
        }

        const styles = {} as Record<string, string | number>

        if (side !== 'center') {
            if (opposite) styles[OPPOSITE_MAP[side]] = `calc(100% - ${getOffset(side)}px)`
            else styles[side] = 0
        }
        if (align !== 'center') {
            if (opposite) styles[OPPOSITE_MAP[align]] = `calc(100% - ${getOffset(align)}px)`
            else styles[align] = 0
        } else {
            if (side === 'center') styles.top = styles.left = '50%'
            else {
                styles[({
                    top: 'left',
                    bottom: 'left',
                    left: 'top',
                    right: 'top'
                } as const)[side]] = '50%'
            }
            styles.transform = {
                top: 'translateX(-50%)',
                bottom: 'translateX(-50%)',
                left: 'translateY(-50%)',
                right: 'translateY(-50%)',
                center: 'translate(-50%, -50%)'
            }[side]
        }

        return styles
    })

    return {locationStyles}
}
