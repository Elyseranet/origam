import type { Ref } from 'vue'
import type { ILayer } from '../../interfaces'

import type { TDirectionBoth } from '../../types'

import { int } from "../../utils"

/**
 * Generate layers.
 *
 * @param layout      …
 * @param positions   …
 * @param layoutSizes …
 * @param activeItems …
 * @returns …
 */
export function generateLayers (
    layout: Array<string>,
    positions: Map<string, Ref<TDirectionBoth>>,
    layoutSizes: Map<string, Ref<number | string>>,
    activeItems: Map<string, Ref<boolean>>
): Array<{ id: string, layer: ILayer }> {
    let previousLayer: ILayer = {top: 0, left: 0, right: 0, bottom: 0}
    const layers = [{id: '', layer: {...previousLayer}}]

    for (const id of layout) {
        const position = positions.get(id)
        const amount = layoutSizes.get(id)
        const active = activeItems.get(id)
        if (!position || !amount || !active) continue

        const layer = {
            ...previousLayer,
            [position.value]: int(previousLayer[position.value]) + (active.value ? int(amount.value) : 0)
        }

        layers.push({
            id,
            layer
        })

        previousLayer = layer
    }

    return layers
}
