import { computed } from 'vue'
import type { Ref } from 'vue'
import { UPDATE_EMIT_PREFIX } from '../../consts/Commons/event-log.const'
import { collectSubtreeIds, findInstance, findParentId, instantiateSnippet } from '../../utils/Commons/scene-instance.util'
import { DEFAULT_SLOT_NAME } from '../../consts/Commons/scene-code.const'
import type { IComponentSnippet } from '../../interfaces/Catalog/component-snippet.interface'
import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * useSceneEditor
 *
 * @description
 * The one place a scene is edited. Components (inspector, prop row,
 * preview) never touch `instance.props` themselves: they report an intent
 * (`setProp`, `resetProp`, an emit) and this composable writes the scene.
 *
 * @description
 * ⛔ The contract of `IPlaygroundInstance.props`, enforced here:
 *   - editing a prop WRITES `props[key]`;
 *   - resetting DELETES the key — never writes the default, never writes
 *     `undefined` and leaves the key behind;
 *   - nothing here ever reads a `defaultValue`. A default copied into
 *     `props` becomes a call-site prop, the strongest rank of the resolution
 *     chain, and silently confiscates the theme's `components` block and the
 *     variant preset (ADR-005). The default is DISPLAYED by the prop row from
 *     the definition (source A); it is never stored.
 *
 * @description
 * Writes are IMMUTABLE: each edit builds a new scene, a new instance and a
 * new `props` record along the edited path, then assigns `scene.value`.
 * That is what makes the edit reach the host — `useVModel` (which `scene`
 * usually is) only emits `update:scene` when handed a different object, so an
 * in-place mutation would change a host's `ref` by accident and a plain
 * object host never.
 ********************************************************/
export function useSceneEditor (scene: Ref<IPlaygroundScene>) {
    const mapInstance = (instances: IPlaygroundInstance[], id: string, update: (instance: IPlaygroundInstance) => IPlaygroundInstance): IPlaygroundInstance[] => instances.map(instance => {
        if (instance.id === id) return update(instance)
        if (!instance.children) return instance

        const children = Object.fromEntries(Object.entries(instance.children).map(([slot, list]) => [slot, mapInstance(list, id, update)]))

        return { ...instance, children }
    })

    const updateInstance = (id: string, update: (instance: IPlaygroundInstance) => IPlaygroundInstance) => {
        scene.value = { ...scene.value, roots: mapInstance(scene.value.roots, id, update) }
    }

    /*********************************************************
     * Selection
     *
     * @description
     * The instance named by `selectedInstanceId`, wherever it sits in the
     * tree; the first root when the id names nothing (a scene handed over
     * without a selection still shows something to edit).
     ********************************************************/
    const selectedInstance = computed<IPlaygroundInstance | undefined>(() => {
        const { roots, selectedInstanceId } = scene.value

        return (selectedInstanceId ? findInstance(roots, selectedInstanceId) : undefined) ?? roots[0]
    })

    /*********************************************************
     * Props
     ********************************************************/
    const isPropSet = (instanceId: string, key: string): boolean => {
        const instance = findInstance(scene.value.roots, instanceId)

        return !!instance && Object.prototype.hasOwnProperty.call(instance.props, key)
    }

    const resetProp = (instanceId: string, key: string) => {
        if (!isPropSet(instanceId, key)) return

        updateInstance(instanceId, instance => {
            const props = { ...instance.props }
            delete props[key]

            return { ...instance, props }
        })
    }

    /**
     * `undefined` is not a value a scene stores: Vue treats an explicit
     * `undefined` as "not passed", so keeping the key would show the row as
     * set while the component renders its default. It is a reset.
     */
    const setProp = (instanceId: string, key: string, value: TPropValue) => {
        if (value === undefined) {
            resetProp(instanceId, key)
            return
        }

        updateInstance(instanceId, instance => {
            const props = { ...instance.props }
            props[key] = value

            return { ...instance, props }
        })
    }

    /*********************************************************
     * Emit write-back
     *
     * @description
     * `update:{key}` from the rendered instance writes `{key}` back — but
     * ONLY when `{key}` is already set. A prop the user set makes the
     * component CONTROLLED (`useVModel`: the prop + its `onUpdate:` listener
     * are both present), so without the write-back a set `modelValue` would
     * freeze the Switch it was set on. A prop the user did not set stays
     * unset: the component is uncontrolled and owns its state, and adding the
     * key would turn an emit into a call-site prop nobody asked for.
     ********************************************************/
    const writeBackEmit = (instanceId: string, name: string, args: unknown[]) => {
        if (!name.startsWith(UPDATE_EMIT_PREFIX)) return

        const key = name.slice(UPDATE_EMIT_PREFIX.length)

        if (!isPropSet(instanceId, key)) return

        setProp(instanceId, key, args[0] as TPropValue)
    }

    /*********************************************************
     * Tree (lot D, #1144)
     *
     * @description
     * Selection, adding and removing a child, loading a snippet. Same rules
     * as the prop writes above: immutable along the edited path, and every
     * instance keeps the id it was born with — an add or a remove never
     * renumbers a sibling, so a selection or a log line naming an id keeps
     * naming the same component.
     ********************************************************/
    const selectInstance = (id: string | null) => {
        if (id !== null && !findInstance(scene.value.roots, id)) return
        if (scene.value.selectedInstanceId === id) return

        scene.value = { ...scene.value, selectedInstanceId: id }
    }

    /**
     * Appends `child` to `slot` of `parentId` and selects it — adding is
     * almost always followed by editing what was added. A `parentId` that
     * names nothing is a no-op rather than a silent new root.
     */
    const addChild = (parentId: string, child: IPlaygroundInstance, slot: string = DEFAULT_SLOT_NAME) => {
        if (!findInstance(scene.value.roots, parentId)) return

        const roots = mapInstance(scene.value.roots, parentId, instance => {
            const children = { ...(instance.children ?? {}) }
            children[slot] = [...(children[slot] ?? []), child]

            return { ...instance, children }
        })

        scene.value = { ...scene.value, roots, selectedInstanceId: child.id }
    }

    const removeFrom = (instances: IPlaygroundInstance[], id: string): IPlaygroundInstance[] => instances
        .filter(instance => instance.id !== id)
        .map(instance => {
            if (!instance.children) return instance

            const children = Object.fromEntries(Object.entries(instance.children).map(([slot, list]) => [slot, removeFrom(list, id)]))

            return { ...instance, children }
        })

    /**
     * Removes `id` and its whole subtree. When the selection was inside that
     * subtree it moves to the removed instance's parent — or to no selection
     * for a root, which `selectedInstance` resolves to the first root left.
     */
    const removeInstance = (id: string) => {
        const target = findInstance(scene.value.roots, id)

        if (!target) return

        const parentId = findParentId(scene.value.roots, id) ?? null
        const { selectedInstanceId } = scene.value
        const selectionRemoved = selectedInstanceId !== null && collectSubtreeIds(target).includes(selectedInstanceId)

        scene.value = {
            ...scene.value,
            roots: removeFrom(scene.value.roots, id),
            selectedInstanceId: selectionRemoved ? parentId : selectedInstanceId
        }
    }

    /**
     * REPLACES the scene's roots with the snippet's instances, freshly
     * identified (`instantiate`), and selects the first one. The scene
     * version is kept: loading a snippet changes the content, not the schema.
     */
    const loadSnippet = (snippet: IComponentSnippet, instantiate: (snippet: IComponentSnippet) => IPlaygroundInstance[] = instantiateSnippet) => {
        const roots = instantiate(snippet)

        scene.value = { ...scene.value, roots, selectedInstanceId: roots[0]?.id ?? null }
    }

    const getInstance = (id: string) => findInstance(scene.value.roots, id)

    return { selectedInstance, isPropSet, setProp, resetProp, writeBackEmit, selectInstance, addChild, removeInstance, loadSnippet, getInstance }
}
