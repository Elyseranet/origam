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
            <div
                    ref="stageEl"
                    class="pg-preview__stage"
                    :class="stageClasses"
                    data-cy="playground-preview-stage"
            >
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
                                :selected-id="selectedId"
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
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
    import PlaygroundSceneNode from './PlaygroundSceneNode.vue'
    import { useT } from '../../composables/I18n/useT'
    import { SELECT_MODE_CAPTURED_EVENTS, SELECT_MODE_TRIGGER_EVENT } from '../../consts/Commons/scene.const'
    import { countInstances, instanceIdFromTarget } from '../../utils/Commons/scene-instance.util'
    import type { IPlaygroundPreviewEmits, IPlaygroundPreviewProps, IPlaygroundPreviewSlots } from '../../interfaces/Components/playground-preview.interface'

    /*********************************************************
     * Global
     ********************************************************/
    const props = withDefaults(defineProps<IPlaygroundPreviewProps>(), {
        selectMode: false
    })

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
     * Selection by click (lot E1, #1164)
     *
     * @description
     * Owner's decision (2026-10-16): selecting by click is an explicit MODE,
     * off by default, toggled from the top bar (`aria-pressed`) and left with
     * Escape. Off, the preview intercepts nothing — a Btn clicks, a Select
     * opens. On, every pointer event of `SELECT_MODE_CAPTURED_EVENTS` is
     * stopped in the CAPTURE phase on the stage, before it can reach a
     * component, and `click` selects the innermost instance under the
     * pointer. Keyboard selection stays with the scene tree, which is already
     * fully operable from the keyboard.
     *
     * @description
     * Native `addEventListener` in capture phase rather than eight
     * `@xxx.capture` template bindings: the list is DATA
     * (`SELECT_MODE_CAPTURED_EVENTS`). Attached once, it does nothing while
     * the mode is off.
     ********************************************************/
    const stageEl = ref<HTMLElement | null>(null)

    const selectedId = computed(() => props.selectedInstance?.id ?? null)

    const stageClasses = computed(() => ({ 'pg-preview__stage--select-mode': props.selectMode }))

    const interceptPointer = (event: Event) => {
        if (!props.selectMode || !stageEl.value) return

        event.preventDefault()
        event.stopPropagation()

        if (event.type !== SELECT_MODE_TRIGGER_EVENT) return

        const instanceId = instanceIdFromTarget(event.target, stageEl.value)

        if (instanceId) emits('select-instance', instanceId)
    }

    onMounted(() => {
        for (const name of SELECT_MODE_CAPTURED_EVENTS) stageEl.value?.addEventListener(name, interceptPointer, { capture: true })
    })

    onBeforeUnmount(() => {
        for (const name of SELECT_MODE_CAPTURED_EVENTS) stageEl.value?.removeEventListener(name, interceptPointer, { capture: true })
    })

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

        &__stage--select-mode {
            cursor: crosshair;

            :deep([data-instance-id]:hover:not(:has([data-instance-id]:hover))) {
                outline: var(--pg-preview__instance--hover---outline-width, 2px) dashed var(--pg-preview__instance---outline-color, currentColor);
                outline-offset: var(--pg-preview__instance---outline-offset, 2px);
            }

            :deep([data-pg-selected]) {
                outline: var(--pg-preview__instance--selected---outline-width, 2px) solid var(--pg-preview__instance---outline-color, currentColor);
                outline-offset: var(--pg-preview__instance---outline-offset, 2px);
            }
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
        --pg-preview__instance---outline-color: var(--origam-color__action--primary---bg, currentColor);
        --pg-preview__instance---outline-offset: 2px;
        --pg-preview__instance--hover---outline-width: 2px;
        --pg-preview__instance--selected---outline-width: 2px;
    }
</style>
