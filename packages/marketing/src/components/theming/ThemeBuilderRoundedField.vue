<script setup lang="ts">
import { computed } from 'vue'

import { useT } from '~/composables/useT'
import { useThemeBuilderRoundedControl } from '~/composables/useThemeBuilderRoundedControl'
import { THEME_BUILDER_ROUNDED_OPTIONS } from '~/consts/theme-builder-controls.const'
import { MDI_ICONS } from 'origam/enums'
import type { TThemeBuilderCorner } from '~/types/theme-builder-controls.type'

/**
 * ThemeBuilderRoundedField — Contrôle 3 (`rounded-field.html`): named-rung
 * `<origam-select>` (last option is the "Autre…" sentinel) + a 4-corner
 * editor that reveals BELOW it, inline, when "Autre…" is active. No popover
 * (#294). Both linked and unlinked modes write into the single `rounded`
 * prop — see the correction documented in `theme-builder-rounded.util.ts`
 * (the 4 discrete corner props are dead).
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

const modelValueRef = computed(() => props.modelValue)
const { selectValue, isCustom, linked, corners, selectRung, setCorner, toggleLinked } = useThemeBuilderRoundedControl(
    modelValueRef,
    (value) => emit('update:modelValue', value)
)

const selectItems = computed(() =>
    THEME_BUILDER_ROUNDED_OPTIONS.map(o => ({ title: t(o.labelKey, o.labelFallback), value: o.value }))
)

const onSelect = (value: unknown): void => {
    if (typeof value === 'string') selectRung(value)
}

const CORNERS: Array<{ key: TThemeBuilderCorner; labelKey: string; labelFallback: string }> = [
    { key: 'topLeft', labelKey: 'theming.control.rounded.corner_top_left', labelFallback: 'Top-left corner' },
    { key: 'topRight', labelKey: 'theming.control.rounded.corner_top_right', labelFallback: 'Top-right corner' },
    { key: 'bottomLeft', labelKey: 'theming.control.rounded.corner_bottom_left', labelFallback: 'Bottom-left corner' },
    { key: 'bottomRight', labelKey: 'theming.control.rounded.corner_bottom_right', labelFallback: 'Bottom-right corner' }
]

const onCorner = (corner: TThemeBuilderCorner, value: unknown): void => {
    if (typeof value === 'number') setCorner(corner, value)
}
</script>

<template>
    <div class="tbc-rounded">
        <origam-select
            :model-value="selectValue"
            :items="selectItems"
            :label="label"
            variant="outlined"
            density="compact"
            hide-details
            class="tbc-rounded__select"
            :data-cy="`${dataCy}-select`"
            @update:model-value="onSelect"
        />

        <fieldset
            v-if="isCustom"
            class="tbc-rounded__fieldset tb-reveal"
        >
            <legend class="tbc-rounded__legend">{{ t('theming.control.rounded.custom_legend', 'Custom corners') }}</legend>
            <div class="tbc-rounded__grid">
                <origam-number-field
                    v-for="corner in CORNERS"
                    :key="corner.key"
                    :model-value="corners[corner.key]"
                    :label="t(corner.labelKey, corner.labelFallback)"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="tbc-rounded__corner"
                    :data-cy="`${dataCy}-corner-${corner.key}`"
                    @update:model-value="onCorner(corner.key, $event)"
                />
                <origam-btn
                    :icon="linked ? MDI_ICONS.LINK : MDI_ICONS.LINK_OFF"
                    :active="linked"
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    class="tbc-rounded__link"
                    :aria-pressed="linked"
                    :aria-label="t('theming.control.rounded.link_corners', 'Link the 4 corners')"
                    :data-cy="`${dataCy}-link`"
                    @click="toggleLinked"
                />
            </div>
        </fieldset>
    </div>
</template>

<style scoped lang="scss">
.tbc-rounded {
    display: flex;
    flex-direction: column;
    gap: var(--origam-spacing-2, 0.5rem);
    inline-size: 100%;

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

    &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--origam-spacing-2, 0.5rem);
        align-items: end;
    }

    &__link {
        justify-self: center;
    }
}
</style>
