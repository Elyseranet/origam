<template>
    <main
            id="playground-preview"
            class="pg-preview"
            :aria-label="ariaLabel"
            data-cy="playground-preview"
    >
        <slot
                name="preview-surround"
                :instance="instance"
        >
            <div class="pg-preview__stage">
                <p
                        v-if="!instance"
                        class="pg-preview__empty"
                        data-cy="playground-preview-empty"
                >
                    <strong>{{ emptyTitle }}</strong>
                    <span>{{ emptyBody }}</span>
                </p>

                <p
                        v-else-if="error"
                        class="pg-preview__error"
                        data-cy="playground-preview-error"
                        role="alert"
                >
                    <strong>{{ errorTitle }}</strong>
                    <span>{{ errorBody }}</span>
                </p>

                <component
                        :is="resolved"
                        v-else-if="resolved"
                        v-bind="instance.props"
                        data-cy="playground-preview-instance"
                />
            </div>
        </slot>

        <p class="pg-preview__foot">
            {{ summaryLabel }}
        </p>
    </main>
</template>

<script setup lang="ts">
    import { computed, shallowRef, watch } from 'vue'
    import { useT } from '../../composables/I18n/useT'
    import type { IPlaygroundPreviewProps, IPlaygroundPreviewSlots } from '../../interfaces/Components/playground-preview.interface'
    import type { TComponentResolution } from '../../types/Commons/prop-value.type'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundPreviewProps>()

    defineSlots<IPlaygroundPreviewSlots>()

    const { t } = useT()

    /*********************************************************
     * Resolution
     *
     * @description
     * `getComponent` is async (it may fetch a chunk) — resolved here per
     * instance change, never cached locally: the registry already caches by
     * name (`registry.composable.ts`), so a second render of the same
     * component is a cache hit, not a second network request.
     ********************************************************/
    const resolved = shallowRef<TComponentResolution>(null)
    const error = shallowRef<string | null>(null)

    watch(() => props.instance?.componentName, async name => {
        resolved.value = null
        error.value = null

        if (!name) return

        try {
            resolved.value = await props.registry.getComponent(name)
            if (!resolved.value) error.value = t('playground.preview.component_not_found', 'component not registered')
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : String(cause)
        }
    }, { immediate: true })

    /*********************************************************
     * Labels
     ********************************************************/
    const ariaLabel = computed(() => t('playground.preview.no_selection_title', 'No component selected'))
    const emptyTitle = computed(() => t('playground.preview.no_selection_title', 'No component selected'))
    const emptyBody = computed(() => t('playground.preview.no_selection_body', 'Open the catalog to pick a component to render.'))
    const errorTitle = computed(() => t('playground.preview.error_title', 'Render error'))
    const errorBody = computed(() => t('playground.preview.error_body', '{name} could not be loaded: {error}', {
        name: props.instance?.componentName ?? '',
        error: error.value ?? ''
    }))
    const summaryLabel = computed(() => (props.instance
        ? t('playground.preview.instance_summary', '{name} · 1 instance', { name: props.instance.componentName })
        : ''))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-preview {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1 1 auto;

        &__stage {
            flex: 1 1 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--pg-preview__stage---padding, 24px);
        }

        &__empty,
        &__error {
            display: flex;
            flex-direction: column;
            gap: 4px;
            text-align: center;
            opacity: 0.7;
        }

        &__foot {
            padding: 8px 16px;
            font-size: 0.8em;
            opacity: 0.6;
            border-block-start: 1px solid var(--pg-preview__foot---border-color, #e5e5e5);
            margin: 0;
            min-height: 1.2em;
        }
    }
</style>

<style>
    :root {
        --pg-preview__stage---padding: 24px;
        --pg-preview__foot---border-color: #e5e5e5;
    }
</style>
