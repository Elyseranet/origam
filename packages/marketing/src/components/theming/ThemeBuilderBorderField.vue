<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useT } from '~/composables/useT'
import { useThemeBuilderBorderControl } from '~/composables/useThemeBuilderBorderControl'
import { THEME_BUILDER_BORDER_STYLE_OPTIONS, THEME_BUILDER_BORDER_WIDTH_OPTIONS, THEME_BUILDER_UNSET_VALUE } from '~/consts/theme-builder-controls.const'
import { MDI_ICONS } from 'origam/enums'
import type { TThemeBuilderBorderSide } from '~/types/theme-builder-controls.type'

/**
 * ThemeBuilderBorderField — Contrôle 5 (`border-field.html`, round 2):
 * width · style · colour, rendered as 3 fieldsets stacked inline (no popover,
 * #294). Drives the global `border` / `borderStyle` / `borderColor` props,
 * plus the 4 per-side width props (`borderTop`/`Right`/`Bottom`/`Left`) and
 * the 4 per-side colour props (`borderTopColor`/…) — live since DS issue #215
 * (PR #227, `useBorder`'s `BORDER_POSITION_MAP`). Every per-side prop is
 * `undefined` when the DS component doesn't expose it (older components
 * not yet re-synced) — that facet's link toggle is simply omitted then,
 * never shown disabled.
 */
const props = defineProps<{
    widthValue: unknown
    styleValue?: unknown
    colorValue?: unknown
    topWidthValue?: unknown
    rightWidthValue?: unknown
    bottomWidthValue?: unknown
    leftWidthValue?: unknown
    topColorValue?: unknown
    rightColorValue?: unknown
    bottomColorValue?: unknown
    leftColorValue?: unknown
    label: string
    dataCy: string
}>()

const emit = defineEmits<{
    (e: 'update:width', value: string | number | undefined): void
    (e: 'update:style', value: string | undefined): void
    (e: 'update:color', value: string | undefined): void
    (e: 'update:sideWidth', side: TThemeBuilderBorderSide, value: number | undefined): void
    (e: 'update:sideColor', side: TThemeBuilderBorderSide, value: string | undefined): void
}>()

const { t } = useT()

const widthValueRef = computed(() => props.widthValue)
const sideWidthValuesRef = computed(() => ({
    top: props.topWidthValue,
    right: props.rightWidthValue,
    bottom: props.bottomWidthValue,
    left: props.leftWidthValue
}))
const {
    selectValue, isCustom, customWidth, widthLinked, sideWidths,
    selectWidth, setCustomWidth, setSideWidth, toggleWidthLinked
} = useThemeBuilderBorderControl(
    widthValueRef,
    sideWidthValuesRef,
    (prop, value) => {
        if (prop === 'border') emit('update:width', value)
        else emit('update:sideWidth', prop.replace('border', '').toLowerCase() as TThemeBuilderBorderSide, value as number | undefined)
    }
)

const hasSideWidthSupport = computed(() =>
    props.topWidthValue !== undefined && props.rightWidthValue !== undefined
    && props.bottomWidthValue !== undefined && props.leftWidthValue !== undefined)

const hasSideColorSupport = computed(() =>
    props.topColorValue !== undefined && props.rightColorValue !== undefined
    && props.bottomColorValue !== undefined && props.leftColorValue !== undefined)

/**
 * Colour-per-side link toggle. Unlike width, unlinking here writes NOTHING
 * (colours have no "uniform seed" to distribute) — so there is no echo to
 * guard against; the watcher only needs to sync FORWARD from real prop
 * changes (switching component, import, reset), never fights a manual
 * toggle back.
 */
const colorLinked = ref(true)
watch(
    () => [props.topColorValue, props.rightColorValue, props.bottomColorValue, props.leftColorValue],
    (vals) => {
        colorLinked.value = !vals.some(v => v !== undefined && v !== null && v !== '')
    },
    { immediate: true }
)

const widthSelectItems = computed(() =>
    THEME_BUILDER_BORDER_WIDTH_OPTIONS.map(o => ({ title: t(o.labelKey, o.labelFallback), value: o.value }))
)
const styleSelectItems = computed(() => [
    { title: t('theming.control.unset', 'none'), value: THEME_BUILDER_UNSET_VALUE },
    ...THEME_BUILDER_BORDER_STYLE_OPTIONS.map(o => ({ title: t(o.labelKey, o.labelFallback), value: o.value }))
])

/** Show "none" when the theme doesn't define `borderStyle` (empty value). */
const styleSelectValue = computed<unknown>(() =>
    props.styleValue === undefined || props.styleValue === null || props.styleValue === '' ? THEME_BUILDER_UNSET_VALUE : props.styleValue
)

const onSelectWidth = (value: unknown): void => {
    if (typeof value === 'string') selectWidth(value)
}
const onCustomWidth = (value: unknown): void => {
    if (typeof value === 'number') setCustomWidth(value)
}
const onSideWidth = (side: TThemeBuilderBorderSide, value: unknown): void => {
    if (typeof value === 'number') setSideWidth(side, value)
}
const onSelectStyle = (value: unknown): void => {
    if (value === THEME_BUILDER_UNSET_VALUE) { emit('update:style', undefined); return }
    if (typeof value === 'string') emit('update:style', value)
}
const onColorUpdate = (value: string | undefined): void => {
    emit('update:color', value)
}
const onSideColorUpdate = (side: TThemeBuilderBorderSide, value: string | undefined): void => {
    emit('update:sideColor', side, value)
}
const toggleColorLinked = (): void => {
    colorLinked.value = !colorLinked.value
}

const SIDES: Array<{ key: TThemeBuilderBorderSide; labelKey: string; labelFallback: string }> = [
    { key: 'top', labelKey: 'theming.control.border.side_top', labelFallback: 'Top (px)' },
    { key: 'right', labelKey: 'theming.control.border.side_right', labelFallback: 'Right (px)' },
    { key: 'bottom', labelKey: 'theming.control.border.side_bottom', labelFallback: 'Bottom (px)' },
    { key: 'left', labelKey: 'theming.control.border.side_left', labelFallback: 'Left (px)' }
]

const sideColorValue = (side: TThemeBuilderBorderSide): unknown => {
    if (side === 'top') return props.topColorValue
    if (side === 'right') return props.rightColorValue
    if (side === 'bottom') return props.bottomColorValue
    return props.leftColorValue
}
</script>

<template>
    <div class="tbc-border tb-reveal">
        <fieldset class="tbc-border__fieldset">
            <legend class="tbc-border__legend">{{ t('theming.control.border.width_legend', 'Border — Width') }}</legend>

            <origam-select
                :model-value="selectValue"
                :items="widthSelectItems"
                :label="t('theming.control.border.width_legend', 'Border — Width')"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`${dataCy}-width-select`"
                @update:model-value="onSelectWidth"
            />

            <template v-if="isCustom">
                <template v-if="hasSideWidthSupport">
                    <div
                        class="tbc-border__side-grid"
                        role="group"
                        :aria-label="t('theming.control.border.width_legend', 'Border — Width')"
                    >
                        <template v-if="widthLinked">
                            <origam-number-field
                                :model-value="customWidth"
                                :label="t('theming.control.border.uniform_width', 'All sides (px)')"
                                :min="0"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="tbc-border__side-uniform"
                                :data-cy="`${dataCy}-uniform-width`"
                                @update:model-value="onCustomWidth"
                            />
                        </template>
                        <template v-else>
                            <origam-number-field
                                v-for="side in SIDES"
                                :key="side.key"
                                :model-value="sideWidths[side.key]"
                                :label="t(side.labelKey, side.labelFallback)"
                                :min="0"
                                variant="outlined"
                                density="compact"
                                hide-details
                                :data-cy="`${dataCy}-side-${side.key}`"
                                @update:model-value="onSideWidth(side.key, $event)"
                            />
                        </template>
                        <origam-btn
                            :icon="widthLinked ? MDI_ICONS.LINK : MDI_ICONS.LINK_OFF"
                            :active="widthLinked"
                            variant="outlined"
                            size="x-small"
                            density="compact"
                            class="tbc-border__side-link"
                            :aria-pressed="widthLinked"
                            :aria-label="t('theming.control.border.link_sides', 'Link the 4 sides')"
                            :data-cy="`${dataCy}-width-link`"
                            @click="toggleWidthLinked"
                        />
                    </div>
                </template>
                <origam-number-field
                    v-else
                    :model-value="customWidth"
                    :label="t('theming.control.border.uniform_width', 'All sides (px)')"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-uniform-width`"
                    @update:model-value="onCustomWidth"
                />
            </template>
        </fieldset>

        <fieldset
            v-if="styleValue !== undefined"
            class="tbc-border__fieldset"
        >
            <legend class="tbc-border__legend">{{ t('theming.control.border.style_legend', 'Border — Style') }}</legend>
            <origam-select
                :model-value="styleSelectValue"
                :items="styleSelectItems"
                :label="t('theming.control.border.style_legend', 'Border — Style')"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`${dataCy}-style-select`"
                @update:model-value="onSelectStyle"
            />
        </fieldset>

        <fieldset
            v-if="colorValue !== undefined"
            class="tbc-border__fieldset"
        >
            <legend class="tbc-border__legend">{{ t('theming.control.border.color_legend', 'Border — Colour') }}</legend>

            <origam-btn
                v-if="hasSideColorSupport"
                variant="text"
                size="x-small"
                density="compact"
                :prepend-icon="colorLinked ? MDI_ICONS.LINK : MDI_ICONS.LINK_OFF"
                class="tbc-border__color-toggle"
                :aria-pressed="!colorLinked"
                :data-cy="`${dataCy}-color-toggle`"
                @click="toggleColorLinked"
            >
                {{ colorLinked
                    ? t('theming.control.border.color_per_side', 'Colour per side')
                    : t('theming.control.border.color_global', 'Single colour') }}
            </origam-btn>

            <theme-builder-color-picker
                v-if="colorLinked"
                :model-value="colorValue"
                :label="t('theming.control.border.color_legend', 'Border — Colour')"
                :data-cy="`${dataCy}-color`"
                @update:model-value="onColorUpdate"
            />

            <div
                v-else
                class="tbc-border__side-color-grid"
            >
                <div
                    v-for="side in SIDES"
                    :key="side.key"
                    class="tbc-border__side-color"
                >
                    <span class="tbc-border__side-color-label">{{ t(side.labelKey, side.labelFallback).replace(' (px)', '') }}</span>
                    <theme-builder-color-field
                        :model-value="sideColorValue(side.key)"
                        :label="t(side.labelKey, side.labelFallback).replace(' (px)', '')"
                        :data-cy="`${dataCy}-side-color-${side.key}`"
                        @update:model-value="onSideColorUpdate(side.key, $event)"
                    />
                </div>
            </div>
        </fieldset>
    </div>
</template>

<style scoped lang="scss">
.tbc-border {
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

        & + & {
            padding-block-start: var(--origam-spacing-2, 0.5rem);
            border-block-start: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        }
    }

    &__legend {
        padding: 0;
        font-size: 0.625rem;
        font-weight: var(--origam-font-weight-bold, 700);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--origam-color-text-subtle);
    }

    &__side-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--origam-spacing-2, 0.5rem);
        align-items: end;
    }

    &__side-uniform,
    &__side-link {
        grid-column: span 2;
    }

    &__side-link {
        justify-self: center;
    }

    &__color-toggle {
        align-self: flex-start;
    }

    &__side-color-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--origam-spacing-2, 0.5rem);
    }

    &__side-color {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__side-color-label {
        font-size: 0.625rem;
        color: var(--origam-color-text-subtle);
    }
}
</style>
