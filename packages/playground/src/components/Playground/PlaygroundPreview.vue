<template>
    <section
            id="playground-preview"
            class="pg-preview"
            :aria-label="ariaLabel"
            data-cy="playground-preview"
    >
        <slot
                name="preview-surround"
                :instance="selectedInstance"
        >
            <div class="pg-preview__stage">
                <p
                        v-if="isEmpty"
                        class="pg-preview__empty"
                        data-cy="playground-preview-empty"
                >
                    <strong>{{ emptyTitle }}</strong>
                    <span>{{ emptyBody }}</span>
                </p>

                <template v-else>
                    <div
                            v-for="root in roots"
                            :key="root.id"
                            class="pg-preview__root"
                    >
                        <playground-scene-node
                                :instance="root"
                                :registry="registry"
                                @instance-emit="handleInstanceEmit"
                        />
                    </div>
                </template>
            </div>
        </slot>

        <p class="pg-preview__foot">
            {{ summaryLabel }}
        </p>
    </section>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import PlaygroundSceneNode from './PlaygroundSceneNode.vue'
    import { useT } from '../../composables/I18n/useT'
    import { countInstances } from '../../utils/Commons/scene-instance.util'
    import type { IPlaygroundPreviewEmits, IPlaygroundPreviewProps, IPlaygroundPreviewSlots } from '../../interfaces/Components/playground-preview.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = defineProps<IPlaygroundPreviewProps>()

    const emits = defineEmits<IPlaygroundPreviewEmits>()

    defineSlots<IPlaygroundPreviewSlots>()

    const { t } = useT()

    /*********************************************************
     * Scene
     *
     * @description
     * Each root sits in its own BLOCK wrapper, full stage width: a root is
     * laid out the way a page lays it out. Centering every root as a flex
     * item (lot 2) shrank it to its content, which is harmless for a Btn and
     * fatal for a Window — measured, its three slides collapsed to the width
     * of "Slide 1" with both arrows painted over the text.
     *
     * @description
     * Lot D (#1144): the preview renders EVERY root of the scene, each with
     * its subtree, through `PlaygroundSceneNode` — resolution, emit relay
     * and render-error containment live there, once per instance. Before
     * this lot it rendered only the selected instance, which is why
     * `children` existed in the model and never on screen.
     ********************************************************/
    const roots = computed(() => props.scene.roots)
    const isEmpty = computed(() => roots.value.length === 0)

    const handleInstanceEmit = (instanceId: string, name: string, args: unknown[]) => {
        emits('instance-emit', instanceId, name, args)
    }

    /*********************************************************
     * Labels
     *
     * @description
     * The root is a labelled `<section>` (a `region` landmark), not a
     * `<main>`: the playground is an EMBEDDABLE component (README), so its
     * host owns the page's `main` — the standalone host's `<main class="host">`
     * today, `packages/marketing`'s `<origam-main>` tomorrow. A `<main>` here
     * made axe-core report `landmark-no-duplicate-main` and
     * `landmark-main-is-top-level` on every scene (measured, lot D).
     ********************************************************/
    const ariaLabel = computed(() => (isEmpty.value
        ? t('playground.preview.no_selection_title', 'No component selected')
        : t('playground.preview.aria_label', 'Preview')))
    const emptyTitle = computed(() => t('playground.preview.no_selection_title', 'No component selected'))
    const emptyBody = computed(() => t('playground.preview.no_selection_body', 'Open the catalog to pick a component to render.'))
    const summaryLabel = computed(() => (isEmpty.value
        ? ''
        : t('playground.preview.scene_summary', '{roots} root(s) · {count} instance(s)', { roots: roots.value.length, count: countInstances(roots.value) })))

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
            flex-direction: column;
            justify-content: safe center;
            gap: var(--pg-preview__stage---gap, 16px);
            min-height: 0;
            overflow: auto;
            padding: var(--pg-preview__stage---padding, 24px);
        }

        &__root {
            min-width: 0;
        }

        &__empty {
            align-self: center;
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
        --pg-preview__stage---gap: 16px;
        --pg-preview__foot---border-color: #e5e5e5;
    }
</style>
