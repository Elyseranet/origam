import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { isCustomBoxShadow } from 'origam/utils'

import {
    THEME_BUILDER_CUSTOM_VALUE,
    THEME_BUILDER_ELEVATION_NAMED_RUNGS
} from '~/consts/theme-builder-controls.const'
import { createDefaultShadowLayer, serializeElevationDepth, serializeShadowLayers } from '~/utils/theme-builder-elevation.util'
import type { IThemeBuilderShadowLayer } from '~/interfaces/theme-builder.interface'
import type { TThemeBuilderElevationCustomMode } from '~/types/theme-builder-controls.type'

/**
 * useThemeBuilderElevationControl — business logic for the Elevation control
 * (Contrôle 4). Named rungs write the rung string directly; "Autre" exposes
 * Option A (depth 0-24) and Option B (full shadow composer), both writing
 * into the single `elevation` prop — verified live since PR #210.
 */
export function useThemeBuilderElevationControl (
    modelValue: ComputedRef<unknown> | Ref<unknown>,
    onChange: (value: string | number | undefined) => void
) {
    const selectValue = computed<string>(() => {
        const raw = modelValue.value
        if (raw === undefined || raw === null || raw === '') return 'none'
        if (typeof raw === 'string' && THEME_BUILDER_ELEVATION_NAMED_RUNGS.has(raw)) return raw
        return THEME_BUILDER_CUSTOM_VALUE
    })

    const isCustom = computed(() => selectValue.value === THEME_BUILDER_CUSTOM_VALUE)

    const customMode = ref<TThemeBuilderElevationCustomMode>('depth')
    const depth = ref(10)
    const layer = ref<IThemeBuilderShadowLayer>(createDefaultShadowLayer())

    const isCustomShadowValue = computed(() => typeof modelValue.value === 'string' && isCustomBoxShadow(modelValue.value))

    const selectRung = (value: string): void => {
        if (value === 'none') { onChange(undefined); return }
        if (value === THEME_BUILDER_CUSTOM_VALUE) {
            onChange(customMode.value === 'depth' ? serializeElevationDepth(depth.value) : serializeShadowLayers([layer.value]))
            return
        }
        onChange(value)
    }

    const setDepth = (value: number): void => {
        depth.value = value
        onChange(serializeElevationDepth(value))
    }

    const setLayer = (patch: Partial<IThemeBuilderShadowLayer>): void => {
        layer.value = { ...layer.value, ...patch }
        onChange(serializeShadowLayers([layer.value]))
    }

    const setCustomMode = (mode: TThemeBuilderElevationCustomMode): void => {
        customMode.value = mode
        onChange(mode === 'depth' ? serializeElevationDepth(depth.value) : serializeShadowLayers([layer.value]))
    }

    return {
        selectValue,
        isCustom,
        isCustomShadowValue,
        customMode,
        depth,
        layer,
        selectRung,
        setDepth,
        setLayer,
        setCustomMode
    }
}
