import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { THEME_BUILDER_COLOR_MAX_RECENT } from '~/consts/theme-builder-controls.const'
import { resolveThemeBuilderColorState } from '~/utils/theme-builder-color.util'
import type { IThemeBuilderColorState } from '~/interfaces/theme-builder.interface'

/**
 * Session-scoped "recent custom colors" list, shared across every Color
 * control instance on the page (matches the wireframe's open question —
 * "persistance par session ou globale" — resolved here as IN-MEMORY/session
 * only, reset on reload; not persisted to localStorage).
 */
const recentColors: Ref<string[]> = ref([])

function pushRecent (hex: string): void {
    const next = [hex, ...recentColors.value.filter(c => c.toLowerCase() !== hex.toLowerCase())]
    recentColors.value = next.slice(0, THEME_BUILDER_COLOR_MAX_RECENT)
}

/**
 * useThemeBuilderColorControl — business logic for the Color control
 * (Contrôle 1). Classifies the raw DS prop value into inherit/intent/custom,
 * and exposes the 3 actions the popover can trigger.
 */
export function useThemeBuilderColorControl (
    modelValue: ComputedRef<unknown> | Ref<unknown>,
    onChange: (value: string | undefined) => void
) {
    const state = computed<IThemeBuilderColorState>(() => resolveThemeBuilderColorState(modelValue.value))

    const selectIntent = (intent: string): void => {
        onChange(intent)
    }

    const selectCustom = (hex: string): void => {
        onChange(hex)
        if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) pushRecent(hex)
    }

    const selectInherit = (): void => {
        onChange(undefined)
    }

    return {
        state,
        recentColors: computed(() => recentColors.value),
        selectIntent,
        selectCustom,
        selectInherit
    }
}
