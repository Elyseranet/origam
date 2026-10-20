import type { IComponentDefinition, IComponentSnippet, IPlaygroundInstance } from '@origam/playground/interfaces'

/**
 * playground-host.util.ts — pure helpers for the marketing site as a HOST of
 * `@origam/playground` (lot E, #1145). No Vue, no registry: same input, same
 * output — pinned by `packages/tests/TU/marketing/playground-host.util.spec.ts`.
 */

/** Every component name an instance tree mentions, roots and children. */
export function collectComponentNames (instances: IPlaygroundInstance[]): string[] {
    const names = new Set<string>()
    const walk = (list: IPlaygroundInstance[]) => {
        for (const instance of list) {
            names.add(instance.componentName)
            for (const children of Object.values(instance.children ?? {})) walk(children)
        }
    }
    walk(instances)
    return [...names]
}

/** First instance of `componentName` in a tree, depth-first, or `undefined`. */
export function findInstanceOf (instances: IPlaygroundInstance[], componentName: string): IPlaygroundInstance | undefined {
    for (const instance of instances) {
        if (instance.componentName === componentName) return instance
        for (const children of Object.values(instance.children ?? {})) {
            const found = findInstanceOf(children, componentName)
            if (found) return found
        }
    }
    return undefined
}

/**
 * The snippet a fiche opens with: the component's OWN default snippet when it
 * has one, else the first snippet of a family member that NESTS it (a
 * `OrigamWindowItem` fiche opens on the `OrigamWindow` snippet, whose slides
 * are window items), else `undefined`.
 *
 * ⛔ The nesting rule is what lets a sub-part render instead of printing
 * "cannot render on its own": the sub-component is shown where it lives,
 * inside its real parent — never a synthetic wrapper.
 */
export function snippetFor (componentName: string, definitions: IComponentDefinition[]): IComponentSnippet | undefined {
    const definition = definitions.find(candidate => candidate.name === componentName)
    /*
     * ⛔ A component that REQUIRES a parent (`requiresParent`, e.g. `OrigamTab`)
     * may carry a snippet that is a CHILD template — the playground's own
     * `OrigamTab` snippet is a bare tab, used by "add child". As a scene root
     * it throws (`Could not find useGroup injection`, measured), so only a
     * snippet whose root is NOT the component itself can open its fiche.
     */
    const own = definition?.requiresParent
        ? definition.snippets.find(candidate => candidate.instances.some(root => root.componentName !== componentName))
        : definition?.snippets[0]
    if (own) return own

    for (const definition of definitions) {
        const nesting = definition.snippets.find(candidate => !!findInstanceOf(candidate.instances, componentName))
        if (nesting) return nesting
    }

    return undefined
}

/**
 * Overlays a curated preview variant (`IComponentPreviewVariant`, from the DB)
 * onto the documented instance of a tree, WITHOUT mutating it: the variant's
 * props win over the snippet's, and its slot text replaces the snippet's when
 * given. Returns a new tree.
 */
export function withVariant (instances: IPlaygroundInstance[], componentName: string, props: IPlaygroundInstance['props'], slotContent?: string): IPlaygroundInstance[] {
    let applied = false
    const map = (list: IPlaygroundInstance[]): IPlaygroundInstance[] => list.map(instance => {
        if (!applied && instance.componentName === componentName) {
            applied = true
            return { ...instance, props: { ...instance.props, ...props }, ...(slotContent ? { slotContent } : {}) }
        }
        if (!instance.children) return instance
        return { ...instance, children: Object.fromEntries(Object.entries(instance.children).map(([slot, children]) => [slot, map(children)])) }
    })
    return map(instances)
}

/**
 * The tree the Theme Builder previews: on every instance of the documented
 * component, the props the THEME sets are removed (a snippet prop is a
 * call-site prop and would outrank the theme being previewed) and the
 * preview-only `extra` props are added. Returns a new tree.
 */
export function withoutThemedProps (instances: IPlaygroundInstance[], componentName: string, themedKeys: ReadonlySet<string>, extra: IPlaygroundInstance['props'] = {}): IPlaygroundInstance[] {
    return instances.map(instance => ({
        ...instance,
        props: instance.componentName === componentName
            ? { ...Object.fromEntries(Object.entries(instance.props).filter(([key]) => !themedKeys.has(key))), ...extra }
            : instance.props,
        ...(instance.children
            ? { children: Object.fromEntries(Object.entries(instance.children).map(([slot, list]) => [slot, withoutThemedProps(list, componentName, themedKeys, extra)])) }
            : {})
    }))
}

/** Merges per-component snippet tables, keeping every table's order — earlier tables first. */
export function mergeSnippetTables (...tables: Record<string, IComponentSnippet[]>[]): Record<string, IComponentSnippet[]> {
    const merged: Record<string, IComponentSnippet[]> = {}
    for (const table of tables) {
        for (const [name, snippets] of Object.entries(table)) merged[name] = [...(merged[name] ?? []), ...snippets]
    }
    return merged
}
