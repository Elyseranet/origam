<template>
    <header class="pg-topbar">
        <origam-btn
                v-if="showCatalog"
                data-cy="playground-catalog-open"
                variant="outlined"
                aria-haspopup="dialog"
                @click="handleOpenCatalog($event)"
        >
            <template #default>{{ catalogLabel }}</template>
        </origam-btn>

        <origam-title
                v-if="showTitle"
                tag="h1"
                class="pg-topbar__brand"
                data-cy="playground-title"
        >
            <template #default>
                {{ title }} <small>{{ subtitle }}</small>
            </template>
        </origam-title>

        <span class="pg-topbar__spacer"/>

        <slot name="toolbar"/>

        <origam-btn
                v-if="showSelectMode"
                data-cy="playground-select-mode-toggle"
                :variant="selectModeVariant"
                :aria-pressed="selectMode"
                @click="handleToggleSelectMode"
        >
            <template #default>{{ selectModeLabel }}</template>
        </origam-btn>

        <origam-btn
                data-cy="playground-inspector-toggle"
                variant="outlined"
                :aria-expanded="inspectorOpen"
                @click="handleToggleInspector"
        >
            <template #default>{{ inspectorLabel }}</template>
        </origam-btn>
    </header>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { VARIANT } from 'origam/enums'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundTopbarEmits, IPlaygroundTopbarProps, IPlaygroundTopbarSlots } from '../../interfaces/Components/playground-topbar.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = withDefaults(defineProps<IPlaygroundTopbarProps>(), {
        inspectorOpen: true,
        selectMode: false,
        showTitle: true,
        showCatalog: true,
        showSelectMode: true
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
    const selectModeLabel = computed(() => t('playground.topbar.select_mode_toggle', 'Select in preview'))

    /*********************************************************
     * Select-mode toggle
     *
     * @description
     * `aria-pressed` tells assistive technology the mode is on; the variant
     * tells the eye. Measured: with `aria-pressed` alone the pressed toggle
     * looked exactly like the Props button next to it. A DS prop, not CSS —
     * `tonal` fills the button, `outlined` (the top bar's resting variant)
     * does not.
     ********************************************************/
    const selectModeVariant = computed(() => (props.selectMode ? VARIANT.TONAL : VARIANT.OUTLINED))

    /*********************************************************
     * Events
     ********************************************************/
    const handleOpenCatalog = (event: MouseEvent) => {
        emits('open-catalog', event)
    }

    const handleToggleInspector = () => {
        emits('toggle-inspector')
    }

    /*
     * A toggle button (`aria-pressed`), not a checkbox or a switch: it turns a
     * MODE of the preview on and off, which is exactly the pattern WAI-ARIA
     * APG documents for a toggle button. Escape also leaves the mode
     * (`Playground.vue`).
     */
    const handleToggleSelectMode = () => {
        emits('toggle-select-mode')
    }

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-topbar {
        display: flex;
        flex-wrap: wrap;
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
