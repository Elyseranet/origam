import { DEFAULT_SLOT_NAME } from '../../consts/Commons/scene-code.const'
import { INSTANCE_ID_ATTRIBUTE } from '../../consts/Commons/scene.const'
import type { ITreeviewNode } from 'origam/interfaces'
import type { IComponentDefinition } from '../../interfaces/Catalog/component-definition.interface'
import type { IComponentSnippet } from '../../interfaces/Catalog/component-snippet.interface'
import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * Scene instances — pure helpers
 *
 * @description
 * What `useSceneEditor`, the preview and the scene tree all need to ask of an
 * instance tree, written once. No Vue, no registry: same input, same output,
 * which is what lets `TU/playground/scene-instance.util.spec.ts` pin it.
 ********************************************************/

/*********************************************************
 * Identity
 *
 * @description
 * A scene-wide unique, NON-positional id (`IPlaygroundInstance.id`).
 * `crypto.randomUUID` when the runtime has it (every browser the DS targets,
 * Node 19+); a counter-plus-time fallback otherwise, still unique within one
 * page.
 ********************************************************/
let fallbackCounter = 0

export function createInstanceId (): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()

    fallbackCounter += 1

    return `instance-${Date.now().toString(36)}-${fallbackCounter}`
}

/*********************************************************
 * Lookup
 ********************************************************/
export function findInstance (instances: IPlaygroundInstance[], id: string): IPlaygroundInstance | undefined {
    for (const instance of instances) {
        if (instance.id === id) return instance

        for (const children of Object.values(instance.children ?? {})) {
            const found = findInstance(children, id)
            if (found) return found
        }
    }

    return undefined
}

/**
 * The id of the instance whose `children` hold `id`, `null` for a root, and
 * `undefined` when `id` is not in the tree at all.
 */
export function findParentId (instances: IPlaygroundInstance[], id: string, parentId: string | null = null): string | null | undefined {
    for (const instance of instances) {
        if (instance.id === id) return parentId

        for (const children of Object.values(instance.children ?? {})) {
            const found = findParentId(children, id, instance.id)
            if (found !== undefined) return found
        }
    }

    return undefined
}

/** `id` itself and every id below it. */
export function collectSubtreeIds (instance: IPlaygroundInstance): string[] {
    return [instance.id, ...Object.values(instance.children ?? {}).flat().flatMap(collectSubtreeIds)]
}

/** Number of instances in the tree, children included. */
export function countInstances (instances: IPlaygroundInstance[]): number {
    return instances.reduce((sum, instance) => sum + collectSubtreeIds(instance).length, 0)
}

/*********************************************************
 * Cloning
 *
 * @description
 * A deep copy of an instance tree with a FRESH id on every node. Prop values
 * are deep-copied too: a snippet's `headers` array must not be shared with
 * the scene it seeded, or editing the scene would edit the snippet.
 ********************************************************/
function clonePropValue (value: TPropValue): TPropValue {
    if (Array.isArray(value)) return value.map(clonePropValue)
    if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clonePropValue(entry)]))

    return value
}

export function cloneWithFreshIds (instance: IPlaygroundInstance, createId: () => string = createInstanceId): IPlaygroundInstance {
    const clone: IPlaygroundInstance = {
        id: createId(),
        componentName: instance.componentName,
        props: Object.fromEntries(Object.entries(instance.props).map(([key, value]) => [key, clonePropValue(value)]))
    }

    if (instance.slotContent !== undefined) clone.slotContent = instance.slotContent

    if (instance.children) {
        clone.children = Object.fromEntries(Object.entries(instance.children).map(([slot, list]) => [slot, list.map(child => cloneWithFreshIds(child, createId))]))
    }

    return clone
}

/** The instances a snippet seeds, ready to enter a scene. */
export function instantiateSnippet (snippet: IComponentSnippet, createId: () => string = createInstanceId): IPlaygroundInstance[] {
    return snippet.instances.map(instance => cloneWithFreshIds(instance, createId))
}

/**
 * A new instance of `definition`: its default snippet's single root when it
 * has one (so a Btn gets its accessible name), a blank instance otherwise.
 * A default snippet seeding SEVERAL roots cannot become one child, so it
 * falls back to blank as well.
 */
export function createInstanceFor (definition: IComponentDefinition, createId: () => string = createInstanceId): IPlaygroundInstance {
    const instances = definition.snippets[0]?.instances ?? []

    const [only] = instances

    if (instances.length === 1 && only) return cloneWithFreshIds(only, createId)

    return { id: createId(), componentName: definition.name, props: {} }
}

/*********************************************************
 * Slots
 ********************************************************/
export function acceptsDefaultSlot (definition: IComponentDefinition | undefined): boolean {
    return !!definition?.slots.some(slot => slot.name === DEFAULT_SLOT_NAME)
}

/*********************************************************
 * Catalogue
 *
 * @description
 * Merges AUTHORED knowledge into extracted definitions: the snippets, and
 * `requiresParent` from a child → parent table. Returns new objects — the
 * host's seed array is never mutated. A definition that already carries
 * snippets keeps them; the authored ones are appended after.
 ********************************************************/
export function attachSnippets (definitions: IComponentDefinition[], snippets: Record<string, IComponentSnippet[]>, parentOf: Readonly<Record<string, string>> = {}): IComponentDefinition[] {
    return definitions.map(definition => ({
        ...definition,
        snippets: [...definition.snippets, ...(snippets[definition.name] ?? [])],
        requiresParent: definition.requiresParent || Object.prototype.hasOwnProperty.call(parentOf, definition.name)
    }))
}

/*********************************************************
 * Tree
 *
 * @description
 * The scene as `OrigamTreeview` nodes — `id` is the instance id, so the
 * tree's selection IS `scene.selectedInstanceId`, no mapping table. `label`
 * comes from the caller (it needs the catalogue and the translator), and the
 * slot a child sits in is handed to it, because "Btn" under a DataTable says
 * nothing about where that button renders.
 ********************************************************/
export function toTreeNodes (instances: IPlaygroundInstance[], labelOf: (instance: IPlaygroundInstance, slot: string) => string, slot: string = DEFAULT_SLOT_NAME): ITreeviewNode[] {
    return instances.map(instance => {
        const children = Object.entries(instance.children ?? {}).flatMap(([name, list]) => toTreeNodes(list, labelOf, name))
        const node: ITreeviewNode = { id: instance.id, label: labelOf(instance, slot) }

        if (children.length > 0) node.children = children

        return node
    })
}

/** Ids of the instances that have at least one child — the expandable nodes. */
export function collectParentIds (instances: IPlaygroundInstance[]): string[] {
    return instances.flatMap(instance => {
        const children = Object.values(instance.children ?? {}).flat()

        return children.length > 0 ? [instance.id, ...collectParentIds(children)] : []
    })
}

/**
 * The text a tree row shows after the component label, so three `OrigamTab`
 * rows read "Tab — Profile", "Tab — Settings"… The first non-empty string
 * among `keys`, then `slotContent`.
 */
export function instanceHint (instance: IPlaygroundInstance, keys: readonly string[]): string {
    for (const key of keys) {
        const value = instance.props[key]

        if (typeof value === 'string' && value) return value
    }

    return instance.slotContent ?? ''
}

/*********************************************************
 * Preview hit-testing (lot E1, #1164)
 *
 * @description
 * The id of the instance a DOM event landed on: the nearest ancestor of
 * `target` carrying `INSTANCE_ID_ATTRIBUTE`, provided it sits INSIDE
 * `boundary` (the preview stage). `null` for the stage's own padding, for a
 * target outside the stage, and for a non-element target. Nearest ancestor
 * = the innermost instance, so a Btn rendered in a DataTable cell wins over
 * the table that hosts it.
 ********************************************************/
export function instanceIdFromTarget (target: EventTarget | null, boundary: Element): string | null {
    if (typeof Element === 'undefined' || !(target instanceof Element)) return null

    const hit = target.closest(`[${INSTANCE_ID_ATTRIBUTE}]`)

    if (!hit || hit === boundary || !boundary.contains(hit)) return null

    return hit.getAttribute(INSTANCE_ID_ATTRIBUTE)
}
