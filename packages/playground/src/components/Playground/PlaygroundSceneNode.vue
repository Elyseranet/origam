<template>
    <span
            v-if="error"
            class="pg-scene-node__error"
            role="alert"
            data-cy="playground-preview-error"
            :data-instance-id="instance.id"
    >{{ errorLabel }}</span>

    <component
            :is="resolved"
            v-else-if="resolved"
            v-bind="instance.props"
            data-cy="playground-preview-instance"
            :data-instance-id="instance.id"
            :data-pg-selected="selectedMarker"
            v-on="emitListeners"
    >
        <template
                v-for="slot in filledSlots"
                :key="slot.name"
                #[slot.name]
        >
            <template v-if="slot.text">{{ slot.text }}</template>
            <playground-scene-node
                    v-for="child in slot.children"
                    :key="child.id"
                    :instance="child"
                    :registry="registry"
                    :selected-id="selectedId"
                    @instance-emit="handleChildEmit"
            />
        </template>
    </component>
</template>

<script setup lang="ts">
    import { computed, onErrorCaptured, shallowRef, watch } from 'vue'
    import { useT } from '../../composables/I18n/useT'
    import { DEFAULT_SLOT_NAME } from '../../consts/Commons/scene-code.const'
    import type { IPlaygroundSceneNodeEmits, IPlaygroundSceneNodeProps, IPlaygroundSceneNodeSlot, IPlaygroundSceneNodeSlots } from '../../interfaces/Components/playground-scene-node.interface'
    import type { TComponentResolution } from '../../types/Commons/prop-value.type'

    /*********************************************************
     * Global
     ********************************************************/
    const props = withDefaults(defineProps<IPlaygroundSceneNodeProps>(), {
        selectedId: null
    })

    const emits = defineEmits<IPlaygroundSceneNodeEmits>()

    defineSlots<IPlaygroundSceneNodeSlots>()

    const { t } = useT()

    /*********************************************************
     * Resolution
     *
     * @description
     * Same contract as before lot D, now per node: `getComponent` is async
     * and cached by the registry, so ten `OrigamTab` children cost one load.
     ********************************************************/
    const resolved = shallowRef<TComponentResolution>(null)
    const error = shallowRef<string | null>(null)

    watch(() => props.instance.componentName, async name => {
        resolved.value = null
        error.value = null

        try {
            resolved.value = await props.registry.getComponent(name)
            if (!resolved.value) error.value = t('playground.preview.component_not_found', 'component not registered')
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : String(cause)
        }
    }, { immediate: true })

    /*********************************************************
     * Render errors
     *
     * @description
     * ⛔ A scene can hold an instance that cannot render — a sub-component
     * added outside the parent it injects (`OrigamTab` throws without
     * `OrigamTabs`), a prop value the component rejects. Without this hook
     * the error climbs to the app and blanks the WHOLE playground; with it,
     * only this node is replaced by its message, and its siblings keep
     * rendering. Editing the instance clears the error and retries.
     ********************************************************/
    onErrorCaptured(cause => {
        error.value = cause instanceof Error ? cause.message : String(cause)

        return false
    })

    watch(() => props.instance, () => {
        if (error.value && resolved.value) error.value = null
    })

    /*********************************************************
     * Emits relay
     *
     * @description
     * One listener per emit the definition declares, as in lot B — built from
     * the metadata so an undeclared native event is not reported as an emit.
     * A child node's emits are relayed unchanged: they already carry the id
     * of the instance that fired them.
     ********************************************************/
    const emitListeners = computed<Record<string, (...args: unknown[]) => void>>(() => {
        const instance = props.instance
        const events = props.registry.getComponentMetadata(instance.componentName)?.events ?? []

        return Object.fromEntries(events.map(event => [event.name, (...args: unknown[]) => emits('instance-emit', instance.id, event.name, args)]))
    })

    const handleChildEmit = (instanceId: string, name: string, args: unknown[]) => {
        emits('instance-emit', instanceId, name, args)
    }

    /*********************************************************
     * Slots
     *
     * @description
     * Only the slots that have something to render are passed — handing a
     * component an empty `default` would replace its own fallback content
     * with nothing. `slotContent` is rendered as TEXT, never as HTML: a
     * scene is serialisable and may arrive from a URL, so `v-html` here
     * would be an injection point.
     ********************************************************/
    const filledSlots = computed<IPlaygroundSceneNodeSlot[]>(() => {
        const { children = {}, slotContent = '' } = props.instance
        const names = [...new Set([...(slotContent ? [DEFAULT_SLOT_NAME] : []), ...Object.keys(children)])]

        return names
            .map(name => ({ name, text: name === DEFAULT_SLOT_NAME ? slotContent : '', children: children[name] ?? [] }))
            .filter(slot => slot.text || slot.children.length > 0)
    })

    /*********************************************************
     * Selection marker (lot E1, #1164)
     *
     * @description
     * `undefined` rather than `false` on every other node: Vue drops an
     * `undefined` attribute, so only the selected instance carries
     * `data-pg-selected` and the preview's outline rule matches one element.
     ********************************************************/
    const selectedMarker = computed(() => (props.selectedId === props.instance.id ? 'true' : undefined))

    const errorLabel = computed(() => t('playground.preview.node_error', '{name} could not render: {error}', {
        name: props.instance.componentName,
        error: error.value ?? ''
    }))

    /*********************************************************
     * Expose
     ********************************************************/
    defineExpose({})
</script>

<style lang="scss" scoped>
    .pg-scene-node__error {
        display: inline-block;
        padding: var(--pg-scene-node__error---padding, 4px 8px);
        border: 1px dashed var(--pg-scene-node__error---border-color, currentColor);
        font-size: var(--pg-scene-node__error---font-size, 0.8em);
    }
</style>

<style>
    :root {
        --pg-scene-node__error---padding: 4px 8px;
        --pg-scene-node__error---border-color: currentColor;
        --pg-scene-node__error---font-size: 0.8em;
    }
</style>
