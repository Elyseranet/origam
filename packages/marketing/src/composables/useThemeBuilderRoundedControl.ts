import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

import {
    THEME_BUILDER_CUSTOM_VALUE,
    THEME_BUILDER_ROUNDED_NAMED_RUNGS
} from '~/consts/theme-builder-controls.const'
import {
    parseRoundedCorners,
    parseRoundedUniform,
    serializeRoundedCorners,
    serializeRoundedUniform
} from '~/utils/theme-builder-rounded.util'
import type { IThemeBuilderRoundedCorners } from '~/interfaces/theme-builder.interface'
import type { TThemeBuilderCorner } from '~/types/theme-builder-controls.type'

/**
 * useThemeBuilderRoundedControl — business logic for the Rounded control
 * (Contrôle 3). Drives the named-rung select + the 4-corner editor, ALWAYS
 * writing back into the single `rounded` prop (see the correction documented
 * in `theme-builder-rounded.util.ts`).
 */
export function useThemeBuilderRoundedControl (
    modelValue: ComputedRef<unknown> | Ref<unknown>,
    onChange: (value: string | undefined) => void
) {
    /** `'none'` here means `rounded={false}` on the DS prop (no boolean literal in a <select>). */
    const selectValue = computed<string>(() => {
        const raw = modelValue.value
        if (raw === false || raw === undefined || raw === null || raw === '') return 'none'
        if (typeof raw === 'string' && THEME_BUILDER_ROUNDED_NAMED_RUNGS.has(raw)) return raw
        return THEME_BUILDER_CUSTOM_VALUE
    })

    const isCustom = computed(() => selectValue.value === THEME_BUILDER_CUSTOM_VALUE)

    const linked = ref(true)
    const corners = ref<IThemeBuilderRoundedCorners>({ topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 })

    /**
     * `linked` is inferred from the round-tripped `rounded` value by checking
     * whether the 4 corners come back equal — but every write THIS composable
     * makes (`toggleLinked`, `setCorner`) flows back down through `modelValue`
     * (parent prop update → re-render), and an all-equal 4-value string looks
     * identical to a genuine "linked" state. Without a guard, unlinking while
     * the corners haven't diverged yet (`toggleLinked` → 4×8px) re-triggers
     * the watcher, sees all-equal, and silently re-links — the toggle click
     * had no visible effect. `skipNextEcho` marks the NEXT `modelValue`
     * change as self-inflicted so the watcher ignores it; only a genuinely
     * EXTERNAL change (reset, import, Tokens-tab edit) reaches the inference.
     */
    let skipNextEcho = false
    const emitChange = (value: string | undefined): void => {
        skipNextEcho = true
        onChange(value)
    }

    watch(modelValue, (raw) => {
        if (skipNextEcho) { skipNextEcho = false; return }
        if (typeof raw !== 'string') return
        const parsedCorners = parseRoundedCorners(raw)
        if (parsedCorners) {
            corners.value = parsedCorners
            const allEqual = parsedCorners.topLeft === parsedCorners.topRight
                && parsedCorners.topRight === parsedCorners.bottomLeft
                && parsedCorners.bottomLeft === parsedCorners.bottomRight
            linked.value = allEqual
            return
        }
        const uniform = parseRoundedUniform(raw)
        if (uniform !== null && !THEME_BUILDER_ROUNDED_NAMED_RUNGS.has(raw)) {
            corners.value = { topLeft: uniform, topRight: uniform, bottomLeft: uniform, bottomRight: uniform }
            linked.value = true
        }
    }, { immediate: true })

    const selectRung = (value: string): void => {
        if (value === 'none') { emitChange(undefined); return }
        if (value === THEME_BUILDER_CUSTOM_VALUE) {
            emitChange(serializeRoundedUniform(corners.value.topLeft))
            return
        }
        emitChange(value)
    }

    const setCorner = (corner: TThemeBuilderCorner, px: number): void => {
        if (linked.value) {
            corners.value = { topLeft: px, topRight: px, bottomLeft: px, bottomRight: px }
        } else {
            corners.value = { ...corners.value, [corner]: px }
        }
        emitChange(linked.value ? serializeRoundedUniform(px) : serializeRoundedCorners(corners.value))
    }

    const toggleLinked = (): void => {
        linked.value = !linked.value
        if (linked.value) {
            const uniform = corners.value.topLeft
            corners.value = { topLeft: uniform, topRight: uniform, bottomLeft: uniform, bottomRight: uniform }
            emitChange(serializeRoundedUniform(uniform))
        } else {
            emitChange(serializeRoundedCorners(corners.value))
        }
    }

    return { selectValue, isCustom, linked, corners, selectRung, setCorner, toggleLinked }
}
