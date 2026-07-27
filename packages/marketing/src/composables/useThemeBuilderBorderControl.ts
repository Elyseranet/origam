import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

import {
    THEME_BUILDER_BORDER_NAMED_WIDTHS,
    THEME_BUILDER_CUSTOM_VALUE
} from '~/consts/theme-builder-controls.const'
import type { IThemeBuilderBorderSideValues } from '~/interfaces/theme-builder.interface'
import type { TThemeBuilderBorderSide } from '~/types/theme-builder-controls.type'

const parseSideWidth = (raw: unknown): number => (typeof raw === 'number' ? raw : 0)

/**
 * useThemeBuilderBorderControl — business logic for the Border composite
 * control (Contrôle 5). Drives the global width (`border`) plus the 4
 * per-side widths (`borderTop`/`Right`/`Bottom`/`Left`) behind a link/unlink
 * toggle, mirroring the 4-corner editor pattern from Rounded. Per-side and
 * per-side colour are wired live since DS issue #215 (PR #227,
 * `useBorder`'s `BORDER_POSITION_MAP`) — no more disabled zone.
 *
 * Colour (global `borderColor` + the 4 `borderXColor` props) is driven
 * directly by `ThemeBuilderBorderField` via plain `ThemeBuilderColorField`
 * instances (1 for linked, 4 for unlinked) — no dedicated state here, since
 * `useThemeBuilderColorControl` is already stateless/pure per instance and
 * needs no echo guard.
 */
export function useThemeBuilderBorderControl (
    borderValue: ComputedRef<unknown> | Ref<unknown>,
    sideWidthValues: ComputedRef<IThemeBuilderBorderSideValues> | Ref<IThemeBuilderBorderSideValues>,
    onChangeWidth: (prop: 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft', value: number | string | undefined) => void
) {
    const customWidth = ref(2)
    const widthLinked = ref(true)
    const sideWidths = ref({ top: 0, right: 0, bottom: 0, left: 0 })

    /**
     * Unlinking clears the global `border` prop (per-side wins anyway — no
     * need to keep a now-superseded global value in the export). But
     * `selectValue` — what the top-level select shows — is derived from
     * `border`, so a naive read would collapse straight back to "None" the
     * instant the user unlinks, hiding the very editor they just opened.
     * `widthLinked === false` always wins: the select shows "Other…" and
     * the per-side editor stays mounted, regardless of what `border`
     * currently resolves to.
     */
    const selectValue = computed<string>(() => {
        if (!widthLinked.value) return THEME_BUILDER_CUSTOM_VALUE
        const raw = borderValue.value
        if (raw === undefined || raw === null || raw === '' || raw === false) return 'none'
        if (typeof raw === 'string' && THEME_BUILDER_BORDER_NAMED_WIDTHS.has(raw)) return raw
        return THEME_BUILDER_CUSTOM_VALUE
    })

    const isCustom = computed(() => selectValue.value === THEME_BUILDER_CUSTOM_VALUE)

    /**
     * Guard against the composable re-inferring `widthLinked` from the echo
     * of its OWN write — the exact bug class caught in
     * `useThemeBuilderRoundedControl` (unlinking, still-uniform sides,
     * round-tripped value looked "linked" again, silently re-linking).
     * Every local mutation goes through `emitWidth`, which arms the skip
     * flag right before calling `onChangeWidth`; the very next `modelValue`
     * change (the echo of that write) is swallowed once.
     */
    let skipNextWidthEcho = false
    const emitWidth = (prop: 'border' | 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft', value: number | string | undefined): void => {
        skipNextWidthEcho = true
        onChangeWidth(prop, value)
    }

    watch(borderValue, (raw) => {
        if (typeof raw === 'number') { customWidth.value = raw; return }
        if (typeof raw === 'string' && !THEME_BUILDER_BORDER_NAMED_WIDTHS.has(raw)) {
            const m = /^(\d+(?:\.\d+)?)px$/.exec(raw.trim())
            if (m && m[1] !== undefined) customWidth.value = Number(m[1])
        }
    }, { immediate: true })

    watch(sideWidthValues, (raw) => {
        if (skipNextWidthEcho) { skipNextWidthEcho = false; return }
        const next = {
            top: parseSideWidth(raw.top),
            right: parseSideWidth(raw.right),
            bottom: parseSideWidth(raw.bottom),
            left: parseSideWidth(raw.left)
        }
        sideWidths.value = next
        // `propValue()` never returns bare `undefined` for a prop that
        // EXISTS on the component (it falls back to the parsed DS default,
        // e.g. `''` for an unset `borderTop`) — only a genuinely CUSTOMISED
        // side width is ever a number (see `setSideWidth`/`toggleWidthLinked`,
        // the only two writers). Checking `!== undefined` here would treat
        // every fresh, still-linked component as already unlinked.
        const hasAnySide = [raw.top, raw.right, raw.bottom, raw.left].some(v => typeof v === 'number')
        widthLinked.value = !hasAnySide
    }, { immediate: true, deep: true })

    /**
     * Picking ANY option from the primary select — including landing on
     * "Other…" for the first time — always (re)enters LINKED mode. Per-side
     * width is only reachable via the explicit link-toggle button inside
     * the custom editor (matching the wireframe's État B → C → D flow).
     * Without clearing the 4 side props here, a component already unlinked
     * that then picks e.g. "Thick" from the select would silently keep
     * rendering its old per-side widths — per-side always wins over global
     * per the DS precedence, so the global pick would visibly do nothing.
     */
    const selectWidth = (value: string): void => {
        widthLinked.value = true
        emitWidth('borderTop', undefined)
        emitWidth('borderRight', undefined)
        emitWidth('borderBottom', undefined)
        emitWidth('borderLeft', undefined)
        if (value === 'none') {
            emitWidth('border', undefined)
            return
        }
        if (value === THEME_BUILDER_CUSTOM_VALUE) {
            emitWidth('border', customWidth.value)
            return
        }
        emitWidth('border', value)
    }

    const setCustomWidth = (px: number): void => {
        customWidth.value = px
        emitWidth('border', px)
    }

    const SIDE_PROP: Record<TThemeBuilderBorderSide, 'borderTop' | 'borderRight' | 'borderBottom' | 'borderLeft'> = {
        top: 'borderTop',
        right: 'borderRight',
        bottom: 'borderBottom',
        left: 'borderLeft'
    }

    const setSideWidth = (side: TThemeBuilderBorderSide, px: number): void => {
        sideWidths.value = { ...sideWidths.value, [side]: px }
        emitWidth(SIDE_PROP[side], px)
    }

    const toggleWidthLinked = (): void => {
        widthLinked.value = !widthLinked.value
        if (widthLinked.value) {
            const uniform = sideWidths.value.top || customWidth.value
            customWidth.value = uniform
            emitWidth('border', uniform)
            emitWidth('borderTop', undefined)
            emitWidth('borderRight', undefined)
            emitWidth('borderBottom', undefined)
            emitWidth('borderLeft', undefined)
        } else {
            const seed = customWidth.value
            sideWidths.value = { top: seed, right: seed, bottom: seed, left: seed }
            emitWidth('borderTop', seed)
            emitWidth('borderRight', seed)
            emitWidth('borderBottom', seed)
            emitWidth('borderLeft', seed)
            emitWidth('border', undefined)
        }
    }

    return {
        selectValue, isCustom, customWidth, widthLinked, sideWidths,
        selectWidth, setCustomWidth, setSideWidth, toggleWidthLinked
    }
}
