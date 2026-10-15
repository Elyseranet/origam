<template>
    <div
            class="pg-control"
            :class="controlClasses"
            :data-cy="`playground-control-${definition.name}`"
            :data-set="isSet"
    >
        <origam-select
                v-if="isSelect"
                v-model="selectModel"
                :items="selectItems"
                :label="definition.name"
                :placeholder="defaultLabel"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`playground-control-input-${definition.name}`"
        />

        <origam-switch
                v-else-if="isSwitch"
                v-model="switchModel"
                :label="definition.name"
                density="compact"
                hide-details
                :data-cy="`playground-control-input-${definition.name}`"
        />

        <origam-number-field
                v-else-if="isNumber"
                v-model="numberModel"
                :label="definition.name"
                :placeholder="defaultLabel"
                variant="outlined"
                density="compact"
                hide-details
                :data-cy="`playground-control-input-${definition.name}`"
        />

        <origam-textarea-field
                v-else-if="isJson"
                v-model="textModel"
                :label="definition.name"
                :placeholder="defaultLabel"
                :error="invalid"
                :error-messages="errorMessages"
                hide-details="auto"
                variant="outlined"
                density="compact"
                rows="3"
                :data-cy="`playground-control-input-${definition.name}`"
        />

        <div
                v-else-if="isEditable"
                class="pg-control__text"
        >
            <origam-text-field
                    v-model="textModel"
                    :label="definition.name"
                    :placeholder="defaultLabel"
                    :error="invalid"
                    :error-messages="errorMessages"
                    hide-details="auto"
                    variant="outlined"
                    density="compact"
                    :data-cy="`playground-control-input-${definition.name}`"
            />
            <origam-select
                    v-if="hasCoercionChoice"
                    v-model="coercionModel"
                    :items="coercionItems"
                    :label="coercionLabel"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="pg-control__coercion"
                    :data-cy="`playground-control-coercion-${definition.name}`"
            />
        </div>

        <p
                v-else
                class="pg-control__readonly"
                :data-cy="`playground-control-readonly-${definition.name}`"
        >
            {{ readonlyLabel }}
        </p>

        <p class="pg-control__status">
            <span
                    class="pg-control__state"
                    :data-cy="`playground-control-state-${definition.name}`"
            >{{ stateLabel }}</span>
            <origam-btn
                    v-if="isSet"
                    variant="text"
                    size="small"
                    :aria-label="resetAriaLabel"
                    :data-cy="`playground-control-reset-${definition.name}`"
                    @click="handleReset"
            >
                <template #default>{{ resetLabel }}</template>
            </origam-btn>
        </p>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { usePropControl } from '../../composables/Commons/propControl.composable'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundPropControlEmits, IPlaygroundPropControlProps, IPlaygroundPropControlSlots } from '../../interfaces/Components/playground-prop-control.interface'
    import type { TPropValue } from '../../types/Commons/prop-value.type'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundPropControlProps>()

    const emits = defineEmits<IPlaygroundPropControlEmits>()

    defineSlots<IPlaygroundPropControlSlots>()

    const { t } = useT()

    /*********************************************************
     * Control
     *
     * @description
     * All decisions live in `usePropControl`; this file only binds the
     * origam field matching `definition.control`.
     ********************************************************/
    const emitSet = (value: TPropValue) => emits('set', value)
    const emitReset = () => emits('reset')

    const {
        isSelect,
        isSwitch,
        isNumber,
        isJson,
        isEditable,
        defaultLabel,
        selectItems,
        selectModel,
        switchModel,
        numberModel,
        textModel,
        coercionModel,
        coercionItems,
        hasCoercionChoice,
        invalid
    } = usePropControl(props, emitSet, emitReset, {
        noDefault: t('playground.prop_row.no_value', '—'),
        factoryDefault: t('playground.prop_row.factory_default', 'generated value')
    })

    /*********************************************************
     * Labels
     ********************************************************/
    const stateLabel = computed(() => (props.isSet
        ? t('playground.prop_control.state_set', 'set')
        : t('playground.prop_control.state_default', 'default: {value}', { value: defaultLabel.value })))
    const resetLabel = computed(() => t('playground.prop_control.reset', 'Reset'))
    const resetAriaLabel = computed(() => t('playground.prop_control.reset_aria', 'Reset {name} to its default', { name: props.definition.name }))
    const coercionLabel = computed(() => t('playground.prop_control.coercion_label', 'Write as'))
    const readonlyLabel = computed(() => t('playground.prop_control.not_editable', 'Not editable here — this prop takes a function.'))
    const errorMessages = computed(() => (invalid.value ? [t('playground.prop_control.invalid', 'Not written: this text does not parse as the chosen kind.')] : []))

    /*********************************************************
     * Class & Style
     ********************************************************/
    const controlClasses = computed(() => ({ 'pg-control--set': props.isSet }))

    /*********************************************************
     * Handlers
     ********************************************************/
    const handleReset = () => {
        emitReset()
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-control {
        display: grid;
        gap: var(--pg-control---gap, 4px);

        &__text {
            display: grid;
            grid-template-columns: 1fr var(--pg-control__coercion---width, 120px);
            gap: var(--pg-control---gap, 4px);
            align-items: start;
        }

        &__readonly {
            margin: 0;
            font-size: var(--pg-control__readonly---font-size, 0.8em);
            color: var(--pg-control__readonly---color, var(--origam-color__text---tertiary));
        }

        &__status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--pg-control---gap, 4px);
            margin: 0;
            min-height: var(--pg-control__status---min-height, 28px);
        }

        &__state {
            font-size: var(--pg-control__state---font-size, 0.75em);
            font-style: italic;
            color: var(--pg-control__state---color, var(--origam-color__text---tertiary));
        }

        &--set &__state {
            font-style: normal;
            font-weight: 600;
            color: var(--pg-control--set__state---color, var(--origam-color__text---primary));
        }
    }
</style>

<style>
    :root {
        --pg-control---gap: 4px;
        --pg-control__coercion---width: 120px;
        --pg-control__readonly---font-size: 0.8em;
        --pg-control__status---min-height: 28px;
        --pg-control__state---font-size: 0.75em;
    }
</style>
