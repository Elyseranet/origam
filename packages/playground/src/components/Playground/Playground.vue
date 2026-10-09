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
            <playground-inspector
                    :definition="selectedDefinition"
                    :values="selectedInstance?.props ?? {}"
            >
                <template #inspector-panels>
                    <slot name="inspector-panels"/>
                </template>
                <template #prop-row="scope">
                    <slot
                            name="prop-row"
                            :row="scope.row"
                    />
                </template>
            </playground-inspector>
        </div>

        <playground-preview
                :instance="selectedInstance"
                :registry="registry"
        >
            <template #preview-surround="scope">
                <slot
                        name="preview-surround"
                        :instance="scope.instance"
                />
            </template>
        </playground-preview>

        <playground-dock/>

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
    import PlaygroundDock from './PlaygroundDock.vue'
    import PlaygroundDrawer from './PlaygroundDrawer.vue'
    import PlaygroundInspector from './PlaygroundInspector.vue'
    import PlaygroundPreview from './PlaygroundPreview.vue'
    import PlaygroundTopbar from './PlaygroundTopbar.vue'
    import { useVModel } from 'origam/composables'
    import { SCENE_VERSION } from '../../consts/Commons/scene.const'
    import type { IPlaygroundEmits, IPlaygroundProps, IPlaygroundSlots } from '../../interfaces/Components/playground.interface'
    import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'

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

    const selectedInstance = computed<IPlaygroundInstance | undefined>(() => scene.value.roots[0])

    const selectedDefinition = computed(() => (selectedInstance.value
        ? props.registry.getComponentMetadata(selectedInstance.value.componentName)
        : undefined))

    /*********************************************************
     * Drawer
     *
     * @description
     * Selecting a component REPLACES the scene's single root — lot 2 only
     * ever renders one instance (`scene.roots[0]`); the nested model
     * (`children`) already exists in the type from lot 1, unused until a
     * later lot adds the scene tree UI.
     ********************************************************/
    const drawerOpen = ref(false)
    const catalogButtonEl = ref<HTMLElement | null>(null)

    const selectInstance = (componentName: string) => {
        const instance: IPlaygroundInstance = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${componentName}-${Date.now()}`,
            componentName,
            props: {}
        }

        scene.value = { version: SCENE_VERSION, roots: [instance], selectedInstanceId: instance.id }
        emits('select', instance.id)
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
            min-width: 0;
            overflow: hidden;
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
