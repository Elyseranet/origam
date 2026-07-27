<script setup lang="ts">
import { computed, ref } from 'vue'

import { useT } from '~/composables/useT'
import { useThemeBuilderBoxModelControl } from '~/composables/useThemeBuilderBoxModelControl'
import { THEME_BUILDER_CUSTOM_VALUE } from '~/consts/theme-builder-controls.const'
import type { TThemeBuilderBoxModelMode } from '~/types/theme-builder-controls.type'

/**
 * ThemeBuilderBoxModelField — Contrôle 6 (`padding-margin-field.html`):
 * devtools-style box-model editor for EITHER `padding` OR `margin` (one
 * instance per axis — see `theme-builder.interface.ts` doc on `box-model`).
 * Scale chips write the utility-class string form (`padding="4"`); "Autre…"
 * reveals the linked/axis/unlinked editor — all 3 modes available for both
 * props since DS issue #216 (PR #217).
 */
const props = defineProps<{
    modelValue: unknown
    axis: 'padding' | 'margin'
    label: string
    dataCy: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void
}>()

const { t } = useT()
const open = ref(false)

const modelValueRef = computed(() => props.modelValue)
const {
    scaleOptions, scaleValue, isCustom, mode, edges,
    selectScale, setMode, setEdge
} = useThemeBuilderBoxModelControl(modelValueRef, props.axis, (value) => emit('update:modelValue', value))

const valueLabel = computed<string>(() => {
    if (scaleValue.value === 'none') return t('theming.control.box_model.inherited', 'Inherited from theme')
    if (!isCustom.value) return scaleValue.value
    if (mode.value === 'linked') return String(edges.value.top)
    if (mode.value === 'axis') return `${edges.value.top} / ${edges.value.left}`
    return `${edges.value.top} / ${edges.value.left} / ${edges.value.bottom} / ${edges.value.right}`
})

const hint = computed(() => scaleValue.value === 'none')

const onScaleChip = (value: string): void => {
    selectScale(value)
    open.value = false
}

const onCustom = (): void => {
    selectScale(THEME_BUILDER_CUSTOM_VALUE)
}

const MODES: Array<{ value: TThemeBuilderBoxModelMode; labelKey: string; labelFallback: string }> = [
    { value: 'linked', labelKey: 'theming.control.box_model.mode_linked', labelFallback: 'All linked' },
    { value: 'axis', labelKey: 'theming.control.box_model.mode_axis', labelFallback: 'Vertical / Horizontal' },
    { value: 'unlinked', labelKey: 'theming.control.box_model.mode_unlinked', labelFallback: 'No link' }
]

const EDGES: Array<{ key: 'top' | 'left' | 'bottom' | 'right'; labelKey: string; labelFallback: string }> = [
    { key: 'top', labelKey: 'theming.control.box_model.edge_top', labelFallback: 'Top (px)' },
    { key: 'left', labelKey: 'theming.control.box_model.edge_left', labelFallback: 'Left (px)' },
    { key: 'bottom', labelKey: 'theming.control.box_model.edge_bottom', labelFallback: 'Bottom (px)' },
    { key: 'right', labelKey: 'theming.control.box_model.edge_right', labelFallback: 'Right (px)' }
]

const onLinkedValue = (value: unknown): void => { if (typeof value === 'number') setEdge('top', value) }
const onVertical = (value: unknown): void => { if (typeof value === 'number') setEdge('top', value) }
const onHorizontal = (value: unknown): void => { if (typeof value === 'number') setEdge('left', value) }
const onEdge = (key: 'top' | 'left' | 'bottom' | 'right', value: unknown): void => {
    if (typeof value === 'number') setEdge(key, value)
}
</script>

<template>
    <theme-builder-control-trigger
        v-model:open="open"
        :label="label"
        :value-label="valueLabel"
        :hint="hint"
        :data-cy="dataCy"
    >
        <template v-if="!isCustom">
            <button
                type="button"
                class="tbc-box-model__none-chip"
                :class="{ 'tbc-box-model__none-chip--active': scaleValue === 'none' }"
                :data-cy="`${dataCy}-none`"
                @click="onScaleChip('none')"
            >
                {{ t('theming.control.unset', 'none') }}
            </button>

            <p class="tbc-box-model__scale-label">{{ t('theming.control.box_model.scale_label', 'Scale steps (origam-space)') }}</p>
            <div
                class="tbc-box-model__scale-grid"
                role="group"
                :aria-label="label"
            >
                <button
                    v-for="step in scaleOptions"
                    :key="step"
                    type="button"
                    class="tbc-box-model__scale-chip"
                    :class="{ 'tbc-box-model__scale-chip--active': scaleValue === step }"
                    :data-cy="`${dataCy}-scale-${step}`"
                    @click="onScaleChip(step)"
                >
                    {{ step }}
                </button>
            </div>

            <button
                type="button"
                class="tbc-box-model__custom-trigger"
                :data-cy="`${dataCy}-custom-trigger`"
                @click="onCustom"
            >
                {{ t('theming.control.box_model.other', 'Other… (box-model editor)') }}
            </button>
        </template>

        <template v-else>
            <div
                class="tbc-box-model__modes"
                role="group"
                :aria-label="t('theming.control.box_model.mode_group', 'Link mode')"
            >
                <origam-btn
                    v-for="modeOption in MODES"
                    :key="modeOption.value"
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    :active="mode === modeOption.value"
                    :aria-pressed="mode === modeOption.value"
                    :data-cy="`${dataCy}-mode-${modeOption.value}`"
                    @click="setMode(modeOption.value)"
                >
                    {{ t(modeOption.labelKey, modeOption.labelFallback) }}
                </origam-btn>
            </div>

            <origam-number-field
                v-if="mode === 'linked'"
                :model-value="edges.top"
                :label="t('theming.control.box_model.all_edges', 'All edges (px)')"
                :min="0"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`${dataCy}-linked`"
                @update:model-value="onLinkedValue"
            />

            <div
                v-else-if="mode === 'axis'"
                class="tbc-box-model__axis-grid"
            >
                <origam-number-field
                    :model-value="edges.top"
                    :label="t('theming.control.box_model.vertical', 'Vertical (top + bottom)')"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-vertical`"
                    @update:model-value="onVertical"
                />
                <origam-number-field
                    :model-value="edges.left"
                    :label="t('theming.control.box_model.horizontal', 'Horizontal (left + right)')"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-horizontal`"
                    @update:model-value="onHorizontal"
                />
            </div>

            <div
                v-else
                class="tbc-box-model__edge-grid"
            >
                <origam-number-field
                    v-for="edge in EDGES"
                    :key="edge.key"
                    :model-value="edges[edge.key]"
                    :label="t(edge.labelKey, edge.labelFallback)"
                    :min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :data-cy="`${dataCy}-edge-${edge.key}`"
                    @update:model-value="onEdge(edge.key, $event)"
                />
            </div>
        </template>
    </theme-builder-control-trigger>
</template>

<style scoped lang="scss">
.tbc-box-model {
    &__none-chip {
        align-self: flex-start;
        padding: var(--origam-spacing-1, 0.25rem) var(--origam-spacing-2, 0.5rem);
        font-size: 0.6875rem;
        background-color: var(--origam-color-surface-default);
        border: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        border-radius: var(--origam-radius-sm, 0.25rem);
        cursor: pointer;

        &:hover {
            background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));
        }

        &--active {
            border-color: var(--origam-color__action--primary---bg, #7c3aed);
            color: var(--origam-color__action--primary---bg, #7c3aed);
            font-weight: var(--origam-font-weight-bold, 700);
        }
    }

    &__scale-label {
        margin: 0;
        font-size: 0.625rem;
        font-weight: var(--origam-font-weight-bold, 700);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--origam-color-text-subtle);
    }

    &__scale-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--origam-spacing-1, 0.25rem);
    }

    &__scale-chip {
        padding: var(--origam-spacing-1, 0.25rem);
        font-size: 0.6875rem;
        text-align: center;
        background-color: var(--origam-color-surface-default);
        border: 1px solid var(--origam-color-border-subtle, var(--origam-color-border-default));
        border-radius: var(--origam-radius-sm, 0.25rem);
        cursor: pointer;

        &:hover {
            background-color: var(--origam-color-surface-subtle, var(--origam-color-surface-raised));
        }

        &--active {
            border-color: var(--origam-color__action--primary---bg, #7c3aed);
            color: var(--origam-color__action--primary---bg, #7c3aed);
            font-weight: var(--origam-font-weight-bold, 700);
        }
    }

    &__custom-trigger {
        align-self: flex-start;
        padding: 0;
        background: none;
        border: none;
        font-size: 0.6875rem;
        color: var(--origam-color__action--primary---bg, #7c3aed);
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    &__modes {
        display: flex;
        flex-wrap: wrap;
        gap: var(--origam-spacing-1, 0.25rem);
    }

    &__axis-grid,
    &__edge-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--origam-spacing-2, 0.5rem);
    }
}
</style>
