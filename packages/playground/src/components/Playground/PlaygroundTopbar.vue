<template>
    <header class="pg-topbar">
        <origam-btn
                data-cy="playground-catalog-open"
                variant="outlined"
                size="large"
                aria-haspopup="dialog"
                @click="handleOpenCatalog($event)"
        >
            <template #default>{{ catalogLabel }}</template>
        </origam-btn>

        <origam-title
                tag="h1"
                class="pg-topbar__brand"
        >
            <template #default>
                {{ title }} <small>{{ subtitle }}</small>
            </template>
        </origam-title>

        <span class="pg-topbar__spacer"/>

        <slot name="toolbar"/>

        <origam-btn
                data-cy="playground-inspector-toggle"
                variant="outlined"
                size="large"
                :aria-expanded="inspectorOpen"
                @click="handleToggleInspector"
        >
            <template #default>{{ inspectorLabel }}</template>
        </origam-btn>
    </header>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundTopbarEmits, IPlaygroundTopbarProps, IPlaygroundTopbarSlots } from '../../interfaces/Components/playground-topbar.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = withDefaults(defineProps<IPlaygroundTopbarProps>(), {
        inspectorOpen: true
    })

    const emits = defineEmits<IPlaygroundTopbarEmits>()

    defineSlots<IPlaygroundTopbarSlots>()

    const { t } = useT()

    /*********************************************************
     * Labels
     *
     * @description
     * Zero hardcoded strings — every label goes through `t()`, keys added to
     * `assets/locales/en.json` in the same commit.
     ********************************************************/
    const catalogLabel = computed(() => t('playground.topbar.catalog_button', 'Catalog'))
    const title = computed(() => t('playground.topbar.title', 'Playground'))
    const subtitle = computed(() => t('playground.topbar.subtitle', 'origam · {count} components', { count: props.componentCount }))
    const inspectorLabel = computed(() => t('playground.topbar.inspector_toggle', 'Props'))

    /*********************************************************
     * Events
     ********************************************************/
    const handleOpenCatalog = (event: MouseEvent) => {
        emits('open-catalog', event)
    }

    const handleToggleInspector = () => {
        emits('toggle-inspector')
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-topbar {
        display: flex;
        align-items: center;
        gap: var(--pg-topbar---gap, 12px);
        padding: var(--pg-topbar---padding, 8px 16px);
        border-bottom: 1px solid var(--pg-topbar---border-color, #e5e5e5);
        min-height: var(--pg-topbar---min-height, 56px);

        &__brand {
            font-size: var(--pg-topbar__brand---font-size, 1rem);
            margin: 0;

            small {
                font-weight: 400;
                opacity: 0.7;
                margin-inline-start: 0.5em;
            }
        }

        &__spacer {
            flex: 1 1 auto;
        }
    }
</style>

<style>
    :root {
        --pg-topbar---gap: 12px;
        --pg-topbar---padding: 8px 16px;
        --pg-topbar---border-color: #e5e5e5;
        --pg-topbar---min-height: 56px;
        --pg-topbar__brand---font-size: 1rem;
    }
</style>
