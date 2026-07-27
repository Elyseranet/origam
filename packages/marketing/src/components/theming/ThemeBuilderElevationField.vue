<script setup lang="ts">
import { computed } from 'vue'

import { useT } from '~/composables/useT'
import { useThemeBuilderElevationControl } from '~/composables/useThemeBuilderElevationControl'
import { THEME_BUILDER_ELEVATION_OPTIONS } from '~/consts/theme-builder-controls.const'

/**
 * ThemeBuilderElevationField — Contrôle 4 (`elevation-field.html`): ONE
 * named shadow-rung `<origam-select>` (last option is the "Autre…" sentinel)
 * + "Autre…" reveal BELOW it, inline, with 2 sub-modes (Option A depth 0-24,
 * Option B full shadow composer). No popover, no nested select-in-select
 * (#294). Both sub-modes write straight into `elevation` — verified live
 * since PR #210 (`isCustomBoxShadow`, task #14).
 */
const props = defineProps<{
    modelValue: unknown
    label: string
    dataCy: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | undefined): void
}>()

const { t } = useT()

const modelValueRef = computed(() => props.modelValue)
const {
    selectValue, isCustom, customMode, depth, layer,
    selectRung, setDepth, setLayer, setCustomMode
} = useThemeBuilderElevationControl(modelValueRef, (value) => emit('update:modelValue', value))

const selectItems = computed(() =>
    THEME_BUILDER_ELEVATION_OPTIONS.map(o => ({ title: t(o.labelKey, o.labelFallback), value: o.value }))
)

const onSelect = (value: unknown): void => {
    if (typeof value === 'string') selectRung(value)
}

const onDepth = (value: unknown): void => {
    if (typeof value === 'number') setDepth(value)
}

const onOffsetX = (value: unknown): void => { if (typeof value === 'number') setLayer({ x: value }) }
const onOffsetY = (value: unknown): void => { if (typeof value === 'number') setLayer({ y: value }) }
const onBlur = (value: unknown): void => { if (typeof value === 'number') setLayer({ blur: value }) }
const onSpread = (value: unknown): void => { if (typeof value === 'number') setLayer({ spread: value }) }
const onColor = (value: unknown): void => { if (typeof value === 'string') setLayer({ color: value }) }
const onOpacity = (value: unknown): void => {
    if (typeof value === 'number') setLayer({ opacity: value })
}
</script>

<template>
    <div class="tbc-elevation">
        <origam-select
            :model-value="selectValue"
            :items="selectItems"
            :label="label"
            variant="outlined"
            density="compact"
            hide-details
            class="tbc-elevation__select"
            :data-cy="`${dataCy}-select`"
            @update:model-value="onSelect"
        />

        <div
            v-if="isCustom"
            class="tbc-elevation__custom tb-reveal"
        >
            <div
                class="tbc-elevation__modes"
                role="group"
                :aria-label="t('theming.control.elevation.mode_group', 'Custom shadow mode')"
            >
                <origam-btn
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    :active="customMode === 'depth'"
                    :aria-pressed="customMode === 'depth'"
                    :data-cy="`${dataCy}-mode-depth`"
                    @click="setCustomMode('depth')"
                >
                    {{ t('theming.control.elevation.mode_depth', 'Depth') }}
                </origam-btn>
                <origam-btn
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    :active="customMode === 'shadow'"
                    :aria-pressed="customMode === 'shadow'"
                    :data-cy="`${dataCy}-mode-shadow`"
                    @click="setCustomMode('shadow')"
                >
                    {{ t('theming.control.elevation.mode_shadow', 'Shadow') }}
                </origam-btn>
            </div>

            <origam-number-field
                v-if="customMode === 'depth'"
                :model-value="depth"
                :label="t('theming.control.elevation.depth_label', 'Depth (0-24)')"
                :min="0"
                :max="24"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`${dataCy}-depth`"
                @update:model-value="onDepth"
            />

            <template v-else>
                <div class="tbc-elevation__shadow-grid">
                    <origam-number-field
                        :model-value="layer.x"
                        :label="t('theming.control.elevation.offset_x', 'Offset X (px)')"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :data-cy="`${dataCy}-offset-x`"
                        @update:model-value="onOffsetX"
                    />
                    <origam-number-field
                        :model-value="layer.y"
                        :label="t('theming.control.elevation.offset_y', 'Offset Y (px)')"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :data-cy="`${dataCy}-offset-y`"
                        @update:model-value="onOffsetY"
                    />
                    <origam-number-field
                        :model-value="layer.blur"
                        :label="t('theming.control.elevation.blur', 'Blur (px)')"
                        :min="0"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :data-cy="`${dataCy}-blur`"
                        @update:model-value="onBlur"
                    />
                    <origam-number-field
                        :model-value="layer.spread"
                        :label="t('theming.control.elevation.spread', 'Spread (px)')"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :data-cy="`${dataCy}-spread`"
                        @update:model-value="onSpread"
                    />
                </div>

                <origam-color-picker-field
                    :model-value="layer.color"
                    :label="t('theming.control.elevation.shadow_color', 'Shadow colour')"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-shadow-color`"
                    @update:model-value="onColor"
                />

                <origam-slider-field
                    :model-value="layer.opacity"
                    :label="t('theming.control.elevation.opacity', 'Opacity')"
                    :min="0"
                    :max="100"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-opacity`"
                    @update:model-value="onOpacity"
                >
                    <template #append>
                        <span class="tbc-elevation__opacity-value">{{ layer.opacity }}%</span>
                    </template>
                </origam-slider-field>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tbc-elevation {
    display: flex;
    flex-direction: column;
    gap: var(--origam-spacing-2, 0.5rem);
    inline-size: 100%;

    &__custom {
        display: flex;
        flex-direction: column;
        gap: var(--origam-spacing-2, 0.5rem);
    }

    &__modes {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-spacing-2, 0.5rem);
    }

    &__shadow-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--origam-spacing-2, 0.5rem);
    }

    &__opacity-value {
        font-size: 0.6875rem;
        font-variant-numeric: tabular-nums;
        color: var(--origam-color-text-subtle);
        min-inline-size: 2.5rem;
        text-align: end;
    }
}
</style>
