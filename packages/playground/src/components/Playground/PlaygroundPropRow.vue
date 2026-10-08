<template>
    <div
            class="pg-prop"
            :class="{ 'pg-prop--set': isSet }"
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

        <output class="pg-prop__value">{{ valueLabel }}</output>

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
                <div
                        v-for="name in axis.names"
                        :key="name"
                        class="pg-prop__axis-cell"
                >
                    <span>{{ name }}</span>
                    <output>{{ valueLabelFor(name) }}</output>
                </div>
            </div>
        </details>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundPropRowProps } from '../../interfaces/Components/playground-prop-row.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundPropRowProps>()

    const { t } = useT()

    /*********************************************************
     * Display
     *
     * @description
     * Read-only: this lot shows name, type and resolved value — no control
     * is rendered, no edit is possible. `tsType` wins over `runtimeType` when
     * present (a human-readable union beats a constructor-name array); when
     * neither resolved, falls back to the no-value label rather than `null`.
     ********************************************************/
    const requiredLabel = computed(() => t('playground.inspector.required_badge', 'required'))
    const noValueLabel = computed(() => t('playground.prop_row.no_value', '—'))
    const factoryDefaultLabel = computed(() => t('playground.prop_row.factory_default', 'generated value'))

    const typeLabel = computed(() => {
        const { tsType, runtimeType } = props.row.definition

        if (tsType) return tsType
        if (Array.isArray(runtimeType)) return runtimeType.join(' | ')
        if (runtimeType) return runtimeType

        return noValueLabel.value
    })

    const isSet = computed(() => props.row.definition.name in props.values)

    const resolvedValueFor = (name: string, definition = props.row.definition) => {
        if (name in props.values) return props.values[name]
        if (definition.hasFactoryDefault) return factoryDefaultLabel.value
        if (definition.defaultValue !== undefined) return definition.defaultValue

        return undefined
    }

    const formatValue = (value: unknown) => {
        if (value === undefined) return noValueLabel.value
        if (typeof value === 'object') return JSON.stringify(value)

        return String(value)
    }

    const valueLabel = computed(() => formatValue(resolvedValueFor(props.row.definition.name)))

    const valueLabelFor = (name: string) => {
        const definition = props.row.fold?.definitions.find(d => d.name === name)

        return formatValue(resolvedValueFor(name, definition))
    }

    const foldSummary = computed(() => t('playground.inspector.fold_summary', '+{count} folded', { count: props.row.fold?.definitions.length ?? 0 }))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-prop {
        display: grid;
        gap: var(--pg-prop---gap, 2px);
        padding-block: var(--pg-prop---padding-block, 6px);
        border-block-end: 1px solid var(--pg-prop---border-color, #eee);

        &--set {
            background: var(--pg-prop--set---background-color, rgba(0, 100, 255, 0.05));
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
            background: var(--pg-prop__badge---background-color, #fde68a);
        }

        &__type {
            margin-inline-start: auto;
            opacity: 0.6;
            font-size: 0.8em;
        }

        &__value {
            font-family: var(--pg-prop__value---font-family, monospace);
            font-size: 0.85em;
        }

        &__axis-label {
            margin: 4px 0 2px;
            font-size: 0.75em;
            opacity: 0.6;
        }

        &__axis-cell {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            font-size: 0.8em;
        }
    }
</style>

<style>
    :root {
        --pg-prop---gap: 2px;
        --pg-prop---padding-block: 6px;
        --pg-prop---border-color: #eee;
        --pg-prop--set---background-color: rgba(0, 100, 255, 0.05);
        --pg-prop__head---gap: 8px;
        --pg-prop__badge---border-radius: 4px;
        --pg-prop__badge---background-color: #fde68a;
        --pg-prop__value---font-family: monospace;
    }
</style>
