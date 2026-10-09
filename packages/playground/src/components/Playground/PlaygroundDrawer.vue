<template>
    <template v-if="isMounted">
        <origam-overlay-scrim
                data-cy="playground-drawer-scrim"
                :active="modelValue"
                :style="scrimStyles"
                @click="handleClose"
        />
        <section
                v-show="modelValue"
                ref="drawerEl"
                class="pg-drawer"
                role="dialog"
                aria-modal="true"
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
     * Containment
     *
     * @description
     * ⛔ `position: absolute` only — see the component's `<style>` block.
     * No `position: fixed` anywhere in this file. The scrim is the DS's
     * `OrigamOverlayScrim`, whose own default is `fixed`
     * (`--origam-overlay-scrim---position`); overridden here to `absolute`
     * via the token it already reads, not a hand-rolled scrim.
     ********************************************************/
    const scrimStyles = computed(() => ({ '--origam-overlay-scrim---position': 'absolute' }))

    /*********************************************************
     * Search
     ********************************************************/
    const query = ref('')

    const filtered = computed<IComponentDefinition[]>(() => {
        const needle = query.value.trim().toLowerCase()

        if (!needle) return props.components

        return props.components.filter(definition => definition.name.toLowerCase().includes(needle) || definition.label.toLowerCase().includes(needle))
    })

    /*********************************************************
     * Labels
     ********************************************************/
    const title = computed(() => t('playground.drawer.title', 'Component catalog'))
    const closeLabel = computed(() => t('playground.drawer.close', 'Close the catalog'))
    const searchLabel = computed(() => t('playground.drawer.search_label', 'Search a component by name'))
    const searchPlaceholder = computed(() => t('playground.drawer.search_placeholder', 'Search among {count} components…', { count: props.components.length }))
    const emptyMessage = computed(() => t('playground.drawer.empty', 'No component matches {query}.', { query: query.value }))

    const propsCountLabel = (definition: IComponentDefinition) => t('playground.drawer.props_count', '{count} props', { count: definition.props.length })
    const selectAriaLabel = (definition: IComponentDefinition) => t('playground.drawer.select_aria', 'Select {name}', { name: definition.label })

    /*********************************************************
     * Focus trap & Escape
     *
     * @description
     * A manual, well-understood pattern rather than a reach for a heavier
     * primitive: cycle Tab/Shift+Tab within the drawer's own focusables, and
     * Escape closes + returns focus to whatever opened it. No `position:
     * fixed`, no teleport — the drawer lives inside `.pg` (see
     * `Playground.vue`), `position: relative` + `isolation: isolate` there is
     * what keeps its z-index local to the playground.
     ********************************************************/
    const drawerEl = ref<HTMLElement | null>(null)
    const searchFieldEl = ref<{ $el?: HTMLElement } | null>(null)

    const focusables = () => {
        const root = drawerEl.value

        if (!root) return []

        return [...root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
            .filter(el => !el.hasAttribute('disabled'))
    }

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault()
            handleClose()
            return
        }

        if (event.key !== 'Tab') return

        const items = focusables()

        if (items.length === 0) return

        const first = items[0]
        const last = items[items.length - 1]

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
        }
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
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        width: var(--pg-drawer---width, min(360px, 90%));
        max-width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--pg-drawer---gap, 12px);
        padding: var(--pg-drawer---padding, 16px);
        background: var(--pg-drawer---background-color, #fff);
        border-inline-end: 1px solid var(--pg-drawer---border-color, #e5e5e5);
        overflow-y: auto;
        z-index: var(--pg-drawer---z-index, 10);

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

    @media (prefers-reduced-motion: no-preference) {
        .pg-drawer {
            transition: transform 0.18s ease;
        }
    }
</style>

<style>
    :root {
        --pg-drawer---width: min(360px, 90%);
        --pg-drawer---gap: 12px;
        --pg-drawer---padding: 16px;
        --pg-drawer---background-color: #fff;
        --pg-drawer---border-color: #e5e5e5;
        --pg-drawer---z-index: 10;
    }
</style>
