import { computed } from 'vue'
import type { Ref } from 'vue'
import { UPDATE_EMIT_PREFIX } from '../../consts/Commons/event-log.const'
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
    const findInstance = (instances: IPlaygroundInstance[], id: string): IPlaygroundInstance | undefined => {
        for (const instance of instances) {
            if (instance.id === id) return instance

            for (const children of Object.values(instance.children ?? {})) {
                const found = findInstance(children, id)
                if (found) return found
            }
        }

        return undefined
    }

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

    return { selectedInstance, isPropSet, setProp, resetProp, writeBackEmit }
}
