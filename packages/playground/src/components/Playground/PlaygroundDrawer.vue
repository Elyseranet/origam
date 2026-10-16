<template>
    <template v-if="isMounted">
        <section
                v-show="modelValue"
                ref="drawerEl"
                class="pg-drawer"
                :aria-label="title"
                data-cy="playground-drawer"
                @keydown="handleKeydown"
        >
            <header class="pg-drawer__head">
                <origam-title tag="h2">
                    <template #default>{{ title }}</template>
                </origam-title>
                <origam-btn
                        data-cy="playground-drawer-close"
                        variant="plain"
                        size="large"
                        :aria-label="closeLabel"
                        @click="handleClose"
                >
                    <template #default>×</template>
                </origam-btn>
            </header>

            <origam-text-field
                    ref="searchFieldEl"
                    v-model="query"
                    data-cy="playground-drawer-search"
                    type="search"
                    :label="searchLabel"
                    :placeholder="searchPlaceholder"
            />

            <p
                    v-if="filtered.length === 0"
                    class="pg-drawer__empty"
                    data-cy="playground-drawer-empty"
            >
                {{ emptyMessage }}
            </p>

            <origam-list
                    v-else
                    class="pg-drawer__list"
                    :aria-label="title"
            >
                <origam-list-item
                        v-for="definition in filtered"
                        :key="definition.name"
                        :value="definition.name"
                        :title="definition.label"
                        :subtitle="propsCountLabel(definition)"
                        :data-cy="`playground-drawer-item-${definition.name}`"
                        :aria-label="selectAriaLabel(definition)"
                        @click="handleSelect(definition.name)"
                />
            </origam-list>
        </section>
    </template>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import { useHydration } from 'origam/composables'
    import { useT } from '../../composables/I18n/useT'
    import type { IComponentDefinition } from '../../interfaces/Catalog/component-definition.interface'
    import type { IPlaygroundDrawerEmits, IPlaygroundDrawerProps } from '../../interfaces/Components/playground-drawer.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundDrawerProps>()

    const emits = defineEmits<IPlaygroundDrawerEmits>()

    const { t } = useT()

    /*********************************************************
     * Hydration
     *
     * @description
     * The focus trap / Escape wiring below touches `document` and real DOM
     * focus — client-only by construction. `useHydration()` (reused from
     * `origam`, not re-implemented) gates the whole section so SSR never
     * renders it and hydration never mismatches.
     ********************************************************/
    const isMounted = useHydration()

    /*********************************************************
     * Layout (#1173)
     *
     * @description
     * Owner's decision: the catalog PUSHES the content instead of covering
     * it, so the preview stays centred in what is left. The drawer is
     * therefore an in-flow column of `Playground`'s grid (`grid-area:
     * drawer`), not an absolutely positioned overlay — and, being no longer
     * modal, it carries no scrim, no `aria-modal` and no focus trap: the rest
     * of the playground stays reachable while it is open. Escape still
     * closes it and returns focus to the button that opened it.
     ********************************************************/

    /*********************************************************
     * Search
     ********************************************************/
    const query = ref('')

    /*
     * ⛔ A component that `requiresParent` is not offered as a ROOT: it throws
     * or renders nothing on its own (`IComponentDefinition.requiresParent`).
     * It stays in the catalogue — the inspector needs its definition — and is
     * reached as a child, from the scene tree's "Add child" on its parent.
     */
    const rootable = computed<IComponentDefinition[]>(() => props.components.filter(definition => !definition.requiresParent))

    const filtered = computed<IComponentDefinition[]>(() => {
        const needle = query.value.trim().toLowerCase()

        if (!needle) return rootable.value

        return rootable.value.filter(definition => definition.name.toLowerCase().includes(needle) || definition.label.toLowerCase().includes(needle))
    })

    /*********************************************************
     * Labels
     ********************************************************/
    const title = computed(() => t('playground.drawer.title', 'Component catalog'))
    const closeLabel = computed(() => t('playground.drawer.close', 'Close the catalog'))
    const searchLabel = computed(() => t('playground.drawer.search_label', 'Search a component by name'))
    const searchPlaceholder = computed(() => t('playground.drawer.search_placeholder', 'Search among {count} components…', { count: rootable.value.length }))
    const emptyMessage = computed(() => t('playground.drawer.empty', 'No component matches {query}.', { query: query.value }))

    const propsCountLabel = (definition: IComponentDefinition) => t('playground.drawer.props_count', '{count} props', { count: definition.props.length })
    const selectAriaLabel = (definition: IComponentDefinition) => t('playground.drawer.select_aria', 'Select {name}', { name: definition.label })

    /*********************************************************
     * Escape
     ********************************************************/
    const drawerEl = ref<HTMLElement | null>(null)
    const searchFieldEl = ref<{ $el?: HTMLElement } | null>(null)

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return

        event.preventDefault()
        event.stopPropagation()
        handleClose()
    }

    watch(() => props.modelValue, async open => {
        if (!open) return

        await nextTick()
        const field = searchFieldEl.value?.$el?.querySelector<HTMLInputElement>('input')

        field?.focus()
    })

    /*********************************************************
     * Events
     ********************************************************/
    const handleClose = () => {
        emits('update:modelValue', false)
        props.returnFocusTo?.focus()
    }

    const handleSelect = (name: string) => {
        emits('select', name)
        handleClose()
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-drawer {
        width: var(--pg-drawer---width, min(320px, 100%));
        max-width: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: var(--pg-drawer---gap, 12px);
        padding: var(--pg-drawer---padding, 16px);
        background: var(--pg-drawer---background-color, #fff);
        border-inline-end: 1px solid var(--pg-drawer---border-color, #e5e5e5);
        overflow-y: auto;

        &__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &__empty {
            margin: 0;
        }

        &__list {
            flex: 1 1 auto;
            overflow-y: auto;
        }
    }

</style>

<style>
    :root {
        --pg-drawer---width: min(320px, 100%);
        --pg-drawer---gap: 12px;
        --pg-drawer---padding: 16px;
        --pg-drawer---background-color: #fff;
        --pg-drawer---border-color: #e5e5e5;
    }
</style>
