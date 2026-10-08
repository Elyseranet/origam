<template>
    <aside
            class="pg-inspector"
            :aria-labelledby="definition ? 'pg-inspector-title' : undefined"
            :aria-label="definition ? undefined : noSelectionAriaLabel"
            data-cy="playground-inspector"
    >
        <template v-if="definition">
            <div class="pg-inspector__identity">
                <origam-title
                        id="pg-inspector-title"
                        tag="h2"
                >
                    <template #default>{{ definition.label }}</template>
                </origam-title>
                <p class="pg-inspector__meta">
                    <span
                            v-if="definition.category"
                            class="pg-inspector__chip"
                    >{{ definition.category }}</span>
                    <span class="pg-inspector__chip">{{ propsCountLabel }}</span>
                    <span class="pg-inspector__chip">{{ eventsCountLabel }}</span>
                </p>
            </div>

            <origam-text-field
                    v-model="query"
                    data-cy="playground-prop-search"
                    type="search"
                    :label="searchLabel"
                    :placeholder="searchPlaceholder"
            />

            <p
                    class="pg-inspector__tally"
                    aria-live="polite"
                    data-cy="playground-prop-tally"
            >
                {{ tallyLabel }}
            </p>

            <p
                    v-if="filteredGroups.length === 0"
                    class="pg-inspector__empty"
                    data-cy="playground-prop-empty"
            >
                {{ emptyLabel }}
            </p>

            <details
                    v-for="group in filteredGroups"
                    v-else
                    :key="group.id"
                    class="pg-inspector__group"
                    open
                    :data-cy="`playground-group-${group.id}`"
            >
                <summary>
                    {{ groupLabel(group.id) }}
                    <span class="pg-inspector__group-count">{{ group.totalCount }}</span>
                </summary>

                <template
                        v-for="row in group.rows"
                        :key="row.definition.name"
                >
                    <slot
                            name="prop-row"
                            :row="row"
                    >
                        <playground-prop-row
                                :row="row"
                                :values="values"
                        />
                    </slot>
                </template>
            </details>

            <slot name="inspector-panels"/>
        </template>

        <p
                v-else
                class="pg-inspector__empty"
                data-cy="playground-inspector-no-selection"
        >
            {{ noSelectionLabel }}
        </p>
    </aside>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import PlaygroundPropRow from './PlaygroundPropRow.vue'
    import { useT } from '../../composables/I18n/useT'
    import { groupAndFoldProps } from '../../utils/Commons/prop-group.util'
    import type { IInspectorGroup } from '../../interfaces/Commons/inspector-group.interface'
    import type { IPlaygroundInspectorProps, IPlaygroundInspectorSlots } from '../../interfaces/Components/playground-inspector.interface'
    import type { TPropGroupId } from '../../types/Commons/prop-group.type'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundInspectorProps>()

    defineSlots<IPlaygroundInspectorSlots>()

    const { t } = useT()

    /*********************************************************
     * Groups
     *
     * @description
     * `groupAndFoldProps` (reused, not reimplemented) does the classify +
     * fold work this read-only panel renders. Filtering by the search query
     * happens AFTER grouping so a group with zero matching rows disappears
     * instead of rendering an empty `<details>`.
     ********************************************************/
    const query = ref('')

    const groups = computed<IInspectorGroup[]>(() => (props.definition ? groupAndFoldProps(props.definition.props) : []))

    const matchesQuery = (name: string) => name.toLowerCase().includes(query.value.trim().toLowerCase())

    const filteredGroups = computed<IInspectorGroup[]>(() => {
        const needle = query.value.trim()

        if (!needle) return groups.value

        return groups.value
            .map(group => ({
                ...group,
                rows: group.rows.filter(row => matchesQuery(row.definition.name) || row.fold?.definitions.some(d => matchesQuery(d.name)))
            }))
            .filter(group => group.rows.length > 0)
    })

    const GROUP_LABEL_KEYS: Record<TPropGroupId, string> = {
        color: 'playground.group.color',
        size: 'playground.group.size',
        shape: 'playground.group.shape',
        border: 'playground.group.border',
        elevation: 'playground.group.elevation',
        dimension: 'playground.group.dimension',
        spacing: 'playground.group.spacing',
        state: 'playground.group.state',
        icon: 'playground.group.icon',
        link: 'playground.group.link',
        layout: 'playground.group.layout',
        content: 'playground.group.content',
        other: 'playground.group.other'
    }

    const groupLabel = (id: TPropGroupId) => t(GROUP_LABEL_KEYS[id], id)

    /*********************************************************
     * Labels
     ********************************************************/
    const propsCountLabel = computed(() => t('playground.inspector.props_count', '{count} props', { count: props.definition?.props.length ?? 0 }))
    const eventsCountLabel = computed(() => t('playground.inspector.events_count', '{count} emits', { count: props.definition?.events.length ?? 0 }))
    const searchLabel = computed(() => t('playground.inspector.search_label', 'Search a prop by name'))
    const searchPlaceholder = computed(() => t('playground.inspector.search_placeholder', 'Search among {count} props…', { count: props.definition?.props.length ?? 0 }))
    const emptyLabel = computed(() => t('playground.inspector.empty', 'No prop matches {query}.', { query: query.value }))
    const noSelectionLabel = computed(() => t('playground.inspector.no_selection', 'Select a component in the catalog to inspect its props.'))
    const noSelectionAriaLabel = computed(() => t('playground.inspector.aria_label_empty', 'Component props inspector — no selection'))

    const restingRows = computed(() => filteredGroups.value.reduce((sum, group) => sum + group.rows.length, 0))
    const foldedCount = computed(() => filteredGroups.value.reduce((sum, group) => sum + group.foldedCount, 0))

    const tallyLabel = computed(() => t('playground.inspector.tally', '{count} props · {groups} groups · {resting} at rest · {folded} folded', {
        count: props.definition?.props.length ?? 0,
        groups: filteredGroups.value.length,
        resting: restingRows.value,
        folded: foldedCount.value
    }))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-inspector {
        width: var(--pg-inspector---width, 352px);
        min-width: var(--pg-inspector---width, 352px);
        max-width: var(--pg-inspector---width, 352px);
        overflow-y: auto;
        padding: var(--pg-inspector---padding, 16px);
        border-inline-end: 1px solid var(--pg-inspector---border-color, #e5e5e5);
        display: flex;
        flex-direction: column;
        gap: var(--pg-inspector---gap, 12px);

        &__meta {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        &__chip {
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 999px;
            background: var(--pg-inspector__chip---background-color, #f1f1f1);
        }

        &__tally {
            font-size: 0.8em;
            opacity: 0.7;
            margin: 0;
        }

        &__group-count {
            opacity: 0.6;
            font-size: 0.8em;
        }

        &__empty {
            opacity: 0.7;
        }
    }
</style>

<style>
    :root {
        --pg-inspector---width: 352px;
        --pg-inspector---padding: 16px;
        --pg-inspector---border-color: #e5e5e5;
        --pg-inspector---gap: 12px;
        --pg-inspector__chip---background-color: #f1f1f1;
    }
</style>
