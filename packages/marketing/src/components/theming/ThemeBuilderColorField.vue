<script setup lang="ts">
import { computed } from 'vue'

import { useT } from '~/composables/useT'
import { useThemeBuilderColorControl } from '~/composables/useThemeBuilderColorControl'
import { THEME_BUILDER_CUSTOM_VALUE, THEME_BUILDER_INTENT_OPTIONS, THEME_BUILDER_UNSET_VALUE } from '~/consts/theme-builder-controls.const'

/**
 * ThemeBuilderColorField — Contrôle 1 (`color-field.html`): named-intent
 * `<origam-select>` (last option is the "Autre…" sentinel) + a custom hex
 * picker that reveals BELOW it, inline, when "Autre…" is active. No popover
 * (#294) — same shape as `ThemeBuilderRoundedField` / `ThemeBuilderElevationField`.
 * Used for `color` / `accentColor` / `bgColor` (all folded into the
 * `color-intent` control kind, see `THEME_BUILDER_INTENT_COLOR_PROPS`) and
 * for a standalone `borderColor` when a component has no `border` control to
 * fold it into.
 */
const props = defineProps<{
    modelValue: unknown
    label: string
    dataCy: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void
}>()

const { t } = useT()

/**
 * `data-cy` lands on a plain wrapper `<div>` around `<origam-select>` /
 * `<origam-color-picker-field>` instead of directly on those DS components.
 * Root cause (verified live, #294): a component that exposes BOTH `color`
 * AND `bgColor` (or `color` + `accentColor`, e.g. Blockquote) renders TWO
 * sibling `ThemeBuilderColorField` instances — `origam-select` doesn't
 * declare its own `dataCy` prop, so `:data-cy` reaches it only as a
 * fallthrough attribute; its root render is multi-node (Vue warns
 * "Extraneous non-props attributes … could not be automatically inherited
 * because component renders fragment or text or teleport root nodes"), and
 * with 2 sibling instances of the SAME component the fallthrough value
 * observably collapses onto the LAST-rendered sibling's value for both
 * rows (label / model-value are unaffected — those are real, DECLARED
 * props). This is a DS-side (`origam-select`) issue, not something fixable
 * here — flagged to the frontend-lead. Meanwhile: a native wrapper element
 * always has a single root, so Vue applies `data-cy` on it directly and
 * correctly per-instance, sidestepping the bug for e2e test targeting.
 */
const selectDataCy = computed(() => `${props.dataCy}-select`)
const customDataCy = computed(() => `${props.dataCy}-custom`)

const modelValueRef = computed(() => props.modelValue)
const { state, selectIntent, selectCustom, selectInherit } = useThemeBuilderColorControl(
    modelValueRef,
    (value) => emit('update:modelValue', value)
)

const isCustom = computed(() => state.value.mode === 'custom')

const selectValue = computed<string | undefined>(() => {
    if (isCustom.value) return THEME_BUILDER_CUSTOM_VALUE
    if (state.value.mode === 'intent') return state.value.intent
    return THEME_BUILDER_UNSET_VALUE
})

const selectItems = computed(() => [
    { title: t('theming.control.unset', 'none'), value: THEME_BUILDER_UNSET_VALUE },
    ...THEME_BUILDER_INTENT_OPTIONS.map(o => ({ title: t(o.labelKey, o.labelFallback), value: o.value })),
    { title: t('theming.control.custom', 'Other…'), value: THEME_BUILDER_CUSTOM_VALUE }
])

const customHex = computed(() => state.value.custom ?? '#000000')

const onSelect = (value: unknown): void => {
    if (typeof value !== 'string') return
    if (value === THEME_BUILDER_UNSET_VALUE) {
        selectInherit()
        return
    }
    if (value === THEME_BUILDER_CUSTOM_VALUE) {
        selectCustom(customHex.value)
        return
    }
    selectIntent(value)
}

const onCustom = (value: unknown): void => {
    if (typeof value === 'string') selectCustom(value)
}
</script>

<template>
    <div class="tbc-color-field">
        <div
            class="tbc-color-field__select-wrap"
            :data-cy="selectDataCy"
        >
            <origam-select
                :model-value="selectValue"
                :items="selectItems"
                :label="label"
                variant="outlined"
                density="compact"
                hide-details
                class="tbc-color-field__select"
                @update:model-value="onSelect"
            />
        </div>

        <fieldset
            v-if="isCustom"
            class="tbc-color-field__fieldset tb-reveal"
        >
            <legend class="tbc-color-field__legend">{{ t('theming.control.color.custom_label', 'Custom colour') }}</legend>
            <div :data-cy="customDataCy">
                <origam-color-picker-field
                    :model-value="customHex"
                    :label="t('theming.control.color.custom_label', 'Custom colour')"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="tbc-color-field__custom"
                    @update:model-value="onCustom"
                />
            </div>
        </fieldset>
    </div>
</template>

<style scoped lang="scss">
.tbc-color-field {
    display: flex;
    flex-direction: column;
    gap: var(--origam-spacing-2, 0.5rem);
    inline-size: 100%;

    &__select-wrap {
        inline-size: 100%;
    }

    &__fieldset {
        display: flex;
        flex-direction: column;
        gap: var(--origam-spacing-2, 0.5rem);
        padding: 0;
        margin: 0;
        border: none;
    }

    &__legend {
        padding: 0;
        font-size: 0.625rem;
        font-weight: var(--origam-font-weight-bold, 700);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--origam-color-text-subtle);
    }
}
</style>
