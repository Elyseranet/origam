<template>
    <div
            class="pg-prop"
            :class="rowClasses"
            :data-cy="`playground-prop-${row.definition.name}`"
    >
        <span class="pg-prop__head">
            <span class="pg-prop__name">{{ row.definition.name }}</span>
            <span
                    v-if="row.definition.required"
                    class="pg-prop__badge"
            >{{ requiredLabel }}</span>
            <code class="pg-prop__type">{{ typeLabel }}</code>
        </span>

        <playground-prop-control
                :definition="row.definition"
                :value="values[row.definition.name]"
                :is-set="isSet"
                @set="handleSet(row.definition.name, $event)"
                @reset="handleReset(row.definition.name)"
        />

        <details
                v-if="row.fold"
                class="pg-prop__fold"
                :data-cy="`playground-prop-fold-${row.definition.name}`"
        >
            <summary>{{ foldSummary }}</summary>
            <div
                    v-for="axis in row.fold.axes"
                    :key="axis.label"
                    class="pg-prop__axis"
            >
                <p class="pg-prop__axis-label">{{ axis.label }}</p>
                <template
                        v-for="definition in foldDefinitionsFor(axis.names)"
                        :key="definition.name"
                >
                    <playground-prop-control
                            :definition="definition"
                            :value="values[definition.name]"
                            :is-set="isNameSet(definition.name)"
                            @set="handleSet(definition.name, $event)"
                            @reset="handleReset(definition.name)"
                    />
                </template>
            </div>
        </details>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import PlaygroundPropControl from './PlaygroundPropControl.vue'
    import { useT } from '../../composables/I18n/useT'
    import type { IPropDefinition } from '../../interfaces/Catalog/prop-definition.interface'
    import type { IPlaygroundPropRowEmits, IPlaygroundPropRowProps, IPlaygroundPropRowSlots } from '../../interfaces/Components/playground-prop-row.interface'
    import type { TPropValue } from '../../types/Commons/prop-value.type'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundPropRowProps>()

    const emits = defineEmits<IPlaygroundPropRowEmits>()

    defineSlots<IPlaygroundPropRowSlots>()

    const { t } = useT()

    /*********************************************************
     * Display
     *
     * @description
     * `tsType` wins over `runtimeType` when present (a human-readable union
     * beats a constructor-name array). The value itself is no longer printed
     * here: the control shows it, and shows the default (source A) apart
     * from a value the user set.
     ********************************************************/
    const requiredLabel = computed(() => t('playground.inspector.required_badge', 'required'))
    const noValueLabel = computed(() => t('playground.prop_row.no_value', '—'))

    const typeLabel = computed(() => {
        const { tsType, runtimeType } = props.row.definition

        if (tsType) return tsType
        if (Array.isArray(runtimeType)) return runtimeType.join(' | ')
        if (runtimeType) return runtimeType

        return noValueLabel.value
    })

    const isNameSet = (name: string) => Object.prototype.hasOwnProperty.call(props.values, name)

    const isSet = computed(() => isNameSet(props.row.definition.name))

    const foldDefinitionsFor = (names: string[]): IPropDefinition[] => (props.row.fold?.definitions ?? []).filter(definition => names.includes(definition.name))

    const foldSummary = computed(() => t('playground.inspector.fold_summary', '+{count} folded', { count: props.row.fold?.definitions.length ?? 0 }))

    /*********************************************************
     * Class & Style
     ********************************************************/
    const rowClasses = computed(() => ({ 'pg-prop--set': isSet.value }))

    /*********************************************************
     * Edit intents
     *
     * @description
     * Relayed up unchanged — the row writes nothing; `useSceneEditor` does.
     ********************************************************/
    const handleSet = (name: string, value: TPropValue) => {
        emits('set-prop', name, value)
    }

    const handleReset = (name: string) => {
        emits('reset-prop', name)
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-prop {
        display: grid;
        gap: var(--pg-prop---gap, 4px);
        padding-block: var(--pg-prop---padding-block, 6px);
        padding-inline: var(--pg-prop---padding-inline, 6px);
        border-block-end: 1px solid var(--pg-prop---border-color, var(--origam-color__border---subtle));
        border-inline-start: 3px solid transparent;

        &--set {
            background: var(--pg-prop--set---background-color, var(--origam-color__surface---sunken));
            border-inline-start-color: var(--pg-prop--set---accent-color, var(--origam-color__action--primary---bg));
        }

        &__head {
            display: flex;
            align-items: baseline;
            gap: var(--pg-prop__head---gap, 8px);
        }

        &__name {
            font-weight: 600;
        }

        &__badge {
            font-size: 0.7em;
            padding: 0 4px;
            border-radius: var(--pg-prop__badge---border-radius, 4px);
            background: var(--pg-prop__badge---background-color, var(--origam-color__feedback--warning---bg));
        }

        &__type {
            margin-inline-start: auto;
            opacity: 0.6;
            font-size: 0.8em;
            overflow-wrap: anywhere;
            text-align: end;
        }

        &__axis {
            display: grid;
            gap: var(--pg-prop---gap, 4px);
        }

        &__axis-label {
            margin: 4px 0 2px;
            font-size: 0.75em;
            opacity: 0.6;
        }
    }
</style>

<style>
    :root {
        --pg-prop---gap: 4px;
        --pg-prop---padding-block: 6px;
        --pg-prop---padding-inline: 6px;
        --pg-prop__head---gap: 8px;
        --pg-prop__badge---border-radius: 4px;
    }
</style>
