<template>
    <origam-theme-provider
            :theme="theme"
            :mode="mode"
            tag="div"
            class="pg"
            data-cy="playground-root"
            @keydown.esc="handleEscape"
    >
        <div class="pg__layout">
            <playground-topbar
                    :component-count="definitions.length"
                    :inspector-open="inspectorOpen"
                    :select-mode="selectMode"
                    :show-title="!embedded"
                    :show-catalog="!isSingleComponent"
                    :show-select-mode="hasSeveralInstances"
                    @open-catalog="handleOpenCatalog"
                    @toggle-inspector="handleToggleInspector"
                    @toggle-select-mode="handleToggleSelectMode"
            >
                <template #toolbar>
                    <slot name="toolbar"/>
                </template>
            </playground-topbar>

            <div
                    v-show="inspectorOpen"
                    data-cy="playground-inspector-slot"
            >
                <playground-scene-tree
                        v-if="!isSingleComponent"
                        :scene="scene"
                        :registry="registry"
                        :selected-id="selectedId"
                        @select="handleSelectInstance"
                        @add-child="handleAddChild"
                        @remove="handleRemoveInstance"
                />

                <playground-inspector
                        :definition="selectedDefinition"
                        :values="selectedValues"
                        @set-prop="handleSetProp"
                        @reset-prop="handleResetProp"
                >
                    <template #inspector-panels>
                        <slot name="inspector-panels"/>
                    </template>
                    <template #prop-row="scope">
                        <slot
                                name="prop-row"
                                v-bind="scope"
                        />
                    </template>
                </playground-inspector>
            </div>

            <playground-preview
                    :scene="scene"
                    :selected-instance="selectedInstance"
                    :registry="registry"
                    :select-mode="selectMode"
                    @instance-emit="handleInstanceEmit"
                    @select-instance="handlePreviewSelect"
            >
                <template #preview-surround="scope">
                    <slot
                            name="preview-surround"
                            :instance="scope.instance"
                    />
                </template>
            </playground-preview>

            <playground-dock>
                <template #code>
                    <playground-code-panel :scene="scene"/>
                </template>
                <template #snippets>
                    <playground-snippets
                            :definition="rootDefinition"
                            @load="handleLoadSnippet"
                    />
                </template>
                <template #events>
                    <playground-event-log
                            :entries="eventEntries"
                            @clear="handleClearEvents"
                    />
                </template>
            </playground-dock>

            <playground-drawer
                    v-model="drawerOpen"
                    :components="definitions"
                    :return-focus-to="catalogButtonEl"
                    @select="handleSelectComponent"
            />
        </div>
    </origam-theme-provider>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import PlaygroundCodePanel from './PlaygroundCodePanel.vue'
    import PlaygroundDock from './PlaygroundDock.vue'
    import PlaygroundDrawer from './PlaygroundDrawer.vue'
    import PlaygroundEventLog from './PlaygroundEventLog.vue'
    import PlaygroundInspector from './PlaygroundInspector.vue'
    import PlaygroundPreview from './PlaygroundPreview.vue'
    import PlaygroundSceneTree from './PlaygroundSceneTree.vue'
    import PlaygroundSnippets from './PlaygroundSnippets.vue'
    import PlaygroundTopbar from './PlaygroundTopbar.vue'
    import { useVModel } from 'origam/composables'
    import { useEventLog } from '../../composables/Commons/eventLog.composable'
    import { useSceneEditor } from '../../composables/Commons/sceneEditor.composable'
    import { SCENE_VERSION } from '../../consts/Commons/scene.const'
    import type { IPlaygroundEmits, IPlaygroundProps, IPlaygroundSlots } from '../../interfaces/Components/playground.interface'
    import { countInstances, createInstanceFor, findInstance, isSingleComponentScene } from '../../utils/Commons/scene-instance.util'
    import type { TPropValue } from '../../types/Commons/prop-value.type'

    /*********************************************************
     * Name
     *
     * @description
     * `vue/multi-word-component-names` requires a multi-word name; the
     * exported symbol stays `Playground` (`components/index.ts`), only the
     * component's own registered `name` is widened here.
     ********************************************************/
    defineOptions({ name: 'PlaygroundRoot' })

    /*********************************************************
     * Global
     *
     * @description
     * `theme` / `mode` default to `'auto'` — see `IPlaygroundProps`: the
     * playground does not know the 8 identities, it forwards whatever its
     * host hands it to `<origam-theme-provider>`, and `'auto'` there means
     * "inherit the ancestor's", never "light".
     ********************************************************/
    const props = withDefaults(defineProps<IPlaygroundProps>(), {
        theme: 'auto',
        mode: 'auto',
        embedded: false
    })

    const emits = defineEmits<IPlaygroundEmits>()

    defineSlots<IPlaygroundSlots>()

    /*********************************************************
     * Scene
     *
     * @description
     * `useVModel` reused from `origam` rather than a hand-rolled local ref +
     * watcher pair — same two-way-binding primitive every DS component uses
     * for `modelValue`.
     ********************************************************/
    const scene = useVModel(props, 'scene')

    const definitions = computed(() => props.registry.getComponents())

    /*********************************************************
     * Editing
     *
     * @description
     * Every write to the scene goes through `useSceneEditor` (set writes
     * `props[key]`, reset deletes it, no default is ever copied) and every
     * emit of the rendered instance through `useEventLog`. This file only
     * routes the children's intents to them.
     ********************************************************/
    const editor = useSceneEditor(scene)
    const eventLog = useEventLog()

    const selectedInstance = editor.selectedInstance
    const selectedValues = computed(() => selectedInstance.value?.props ?? {})
    const eventEntries = eventLog.entries

    const handleSetProp = (name: string, value: TPropValue) => {
        if (selectedInstance.value) editor.setProp(selectedInstance.value.id, name, value)
    }

    const handleResetProp = (name: string) => {
        if (selectedInstance.value) editor.resetProp(selectedInstance.value.id, name)
    }

    const handleInstanceEmit = (instanceId: string, name: string, args: unknown[]) => {
        eventLog.record(instanceId, editor.getInstance(instanceId)?.componentName ?? '', name, args)
        editor.writeBackEmit(instanceId, name, args)
    }

    const handleClearEvents = () => {
        eventLog.clear()
    }

    const selectedDefinition = computed(() => (selectedInstance.value
        ? props.registry.getComponentMetadata(selectedInstance.value.componentName)
        : undefined))

    /*********************************************************
     * Scene tree (lot D, #1144)
     *
     * @description
     * Selection, add-child and remove all go through `useSceneEditor`; the
     * tree only reports intents. `selectedId` is the RESOLVED selection —
     * `selectedInstance` falls back to the first root when the scene names
     * none, and the tree must highlight what the inspector shows.
     ********************************************************/
    const selectedId = computed(() => selectedInstance.value?.id ?? null)

    const emitSelection = () => {
        emits('select', scene.value.selectedInstanceId)
    }

    const handleSelectInstance = (instanceId: string) => {
        editor.selectInstance(instanceId)
        emitSelection()
    }

    const handleAddChild = (parentId: string, componentName: string) => {
        const definition = props.registry.getComponentMetadata(componentName)

        if (!definition) return

        editor.addChild(parentId, createInstanceFor(definition))
        emitSelection()
    }

    const handleRemoveInstance = (instanceId: string) => {
        editor.removeInstance(instanceId)
        emitSelection()
    }

    /*********************************************************
     * Snippets
     *
     * @description
     * The panel lists the snippets of the component at the ROOT of the
     * branch being edited — a snippet replaces the scene, so offering the
     * selected child's own snippets (a Tab's, under Tabs) would throw the
     * parent away. Loading goes through `useSceneEditor().loadSnippet`,
     * which re-identifies every instance.
     ********************************************************/
    const rootDefinition = computed(() => {
        const roots = scene.value.roots
        const root = roots.find(candidate => selectedId.value !== null && !!findInstance([candidate], selectedId.value)) ?? roots[0]

        return root ? props.registry.getComponentMetadata(root.componentName) : undefined
    })

    const handleLoadSnippet = (snippetId: string) => {
        const snippet = rootDefinition.value?.snippets.find(candidate => candidate.id === snippetId)

        if (!snippet) return

        editor.loadSnippet(snippet)
        emitSelection()
    }

    /*********************************************************
     * Drawer
     *
     * @description
     * Picking a component REPLACES the scene with its DEFAULT snippet — the
     * first of `definition.snippets` — or with one blank instance when it has
     * none. A DataTable picked from the catalogue therefore arrives with rows
     * and a Btn with a text (an accessible name), instead of an empty box.
     ********************************************************/
    const drawerOpen = ref(false)
    const catalogButtonEl = ref<HTMLElement | null>(null)

    const selectInstance = (componentName: string) => {
        const definition = props.registry.getComponentMetadata(componentName)

        if (!definition) return

        const [snippet] = definition.snippets

        if (snippet) {
            editor.loadSnippet(snippet)
        } else {
            const instance = createInstanceFor(definition)
            scene.value = { version: SCENE_VERSION, roots: [instance], selectedInstanceId: instance.id }
        }

        emitSelection()
    }

    const handleOpenCatalog = (event?: MouseEvent) => {
        catalogButtonEl.value = (event?.currentTarget as HTMLElement) ?? document.activeElement as HTMLElement
        drawerOpen.value = true
    }

    const handleSelectComponent = (name: string) => {
        selectInstance(name)
    }

    /*********************************************************
     * Inspector toggle
     ********************************************************/
    const inspectorOpen = ref(true)

    const handleToggleInspector = () => {
        inspectorOpen.value = !inspectorOpen.value
    }

    /*********************************************************
     * Selection mode (lot E1, #1164)
     *
     * @description
     * Owner's decision (2026-10-16): selecting by clicking the preview is a
     * MODE, off by default, so the playground stays usable to test each
     * component's own interaction. Internal state — the public API of
     * `Playground` (props / emits / slots) does not change. A selection made
     * in the preview goes through the SAME path as one made in the tree
     * (`handleSelectInstance` → `useSceneEditor().selectInstance` + `select`
     * emit), and reopens the inspector if it was hidden: selecting is asking
     * to see the props.
     *
     * @description
     * Escape leaves the mode from anywhere inside the playground. It is not
     * stopped: a host listening for Escape still receives it.
     ********************************************************/
    const selectMode = ref(false)

    const handleToggleSelectMode = () => {
        selectMode.value = !selectMode.value
    }

    const handleEscape = () => {
        selectMode.value = false
    }

    const handlePreviewSelect = (instanceId: string) => {
        inspectorOpen.value = true
        handleSelectInstance(instanceId)
    }

    /*********************************************************
     * Embedded / single-component mode (#1173)
     *
     * @description
     * Owner's decisions on the playground embedded in a host page. Derived
     * from the scene's SHAPE (`isSingleComponentScene`, `countInstances`),
     * never from a component name:
     *  - `embedded` removes the title (the host page already names it);
     *  - single-component mode (embedded + one root, no child) hides the
     *    Scene panel and the Catalog — nothing to arrange, nothing to swap;
     *  - "Select in preview" only exists with more than one instance: with
     *    one, the inspector already shows the only thing there is to select.
     *    Leaving the mode when the scene shrinks back keeps a hidden toggle
     *    from being stuck on.
     ********************************************************/
    const isSingleComponent = computed(() => isSingleComponentScene(scene.value.roots, props.embedded))
    const hasSeveralInstances = computed(() => countInstances(scene.value.roots) > 1)

    watch(hasSeveralInstances, several => {
        if (!several) selectMode.value = false
    })

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg {
        position: relative;
        isolation: isolate;
        display: block;
        container-type: inline-size;
        height: var(--pg---height, 100%);
        min-height: var(--pg---min-height, 480px);
        overflow: hidden;
        background: var(--pg---background-color, #fff);
        color: var(--pg---color, #111);
    }

    .pg__layout {
        display: grid;
        grid-template-areas: 'topbar topbar topbar' 'drawer inspector preview' 'dock dock dock';
        grid-template-columns: auto auto minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr) auto;
        height: 100%;
        min-height: inherit;

        :deep(.pg-topbar) {
            grid-area: topbar;
            min-width: 0;
        }

        :deep(.pg-drawer) {
            grid-area: drawer;
        }

        > div[data-cy='playground-inspector-slot'] {
            grid-area: inspector;
            display: flex;
            flex-direction: column;
            width: var(--pg-inspector---width, 352px);
            min-width: 0;
            min-height: 0;
            overflow: hidden;

            :deep(.pg-scene-tree) {
                flex: 0 0 auto;
            }

            :deep(.pg-inspector) {
                flex: 1 1 auto;
                min-height: 0;
            }
        }

        :deep(.pg-preview) {
            grid-area: preview;
            min-width: 0;
        }

        :deep(.pg-dock) {
            grid-area: dock;
            min-width: 0;
        }
    }

    @container (max-width: 760px) {
        .pg__layout {
            --pg-inspector---width: 100%;

            grid-template-areas: 'topbar' 'drawer' 'preview' 'inspector' 'dock';
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: auto minmax(min-content, auto) minmax(var(--pg-preview---stacked-min-height, 240px), auto) auto auto;
            overflow-y: auto;

            > div[data-cy='playground-inspector-slot'] {
                max-height: var(--pg-inspector---stacked-max-height, 28rem);
                border-block-start: 1px solid var(--pg-inspector---border-color, #e5e5e5);
            }

            :deep(.pg-inspector) {
                border-inline-end: 0;
            }

            :deep(.pg-drawer) {
                width: 100%;
                max-height: var(--pg-drawer---stacked-max-height, 20rem);
            }
        }
    }
</style>

<style>
    :root {
        --pg---height: 100%;
        --pg---min-height: 480px;
        --pg---background-color: #fff;
        --pg---color: #111;
        --pg-preview---stacked-min-height: 240px;
        --pg-inspector---stacked-max-height: 28rem;
        --pg-drawer---stacked-max-height: 20rem;
    }

    .pg[data-theme='dark'],
    .pg[data-mode='dark'] {
        --pg---background-color: #15151a;
        --pg---color: #eee;
    }

    [hidden] {
        display: none !important;
    }
</style>
