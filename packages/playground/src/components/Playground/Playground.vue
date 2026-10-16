<template>
    <origam-theme-provider
            :theme="theme"
            :mode="mode"
            tag="div"
            class="pg"
            data-cy="playground-root"
    >
        <playground-topbar
                :component-count="definitions.length"
                :inspector-open="inspectorOpen"
                @open-catalog="handleOpenCatalog"
                @toggle-inspector="handleToggleInspector"
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
                @instance-emit="handleInstanceEmit"
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
    </origam-theme-provider>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
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
    import { createInstanceFor, findInstance } from '../../utils/Commons/scene-instance.util'
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
        mode: 'auto'
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
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg {
        position: relative;
        isolation: isolate;
        display: grid;
        grid-template-areas: 'topbar topbar' 'inspector preview' 'dock dock';
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr auto;
        height: var(--pg---height, 100%);
        min-height: var(--pg---min-height, 480px);
        overflow: hidden;
        background: var(--pg---background-color, #fff);
        color: var(--pg---color, #111);

        :deep(.pg-topbar) {
            grid-area: topbar;
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
        }
    }
</style>

<style>
    :root {
        --pg---height: 100%;
        --pg---min-height: 480px;
        --pg---background-color: #fff;
        --pg---color: #111;
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
