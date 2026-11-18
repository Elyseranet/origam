import CATALOG_INDEX_JSON from '../../assets/catalog-index.json'
import type { ICatalogIndexEntry } from '../../interfaces/Catalog/catalog-index-entry.interface'
import type { IComponentDefinition } from '../../interfaces/Catalog/component-definition.interface'

/*********************************************************
 * Full catalogue — lazy, one chunk per component (lot E, #1145)
 *
 * @description
 * The 219 definitions `scripts/generate-catalog.mjs` writes under
 * `src/assets/catalog/`. A host shows one component (or one family) at a
 * time, so each JSON file is its own dynamic import: nothing is loaded until
 * a name is asked for, and asking twice returns the same promise (the
 * bundler caches the module).
 *
 * @description
 * ⛔ Exported from `@origam/playground/catalog`, NOT from `./utils`. This file
 * calls `import.meta.glob`, which only a Vite pipeline understands; a Node
 * script importing the `utils` barrel (marketing's `tsx` tooling does) would
 * otherwise crash on it.
 ********************************************************/
const DEFINITION_FILES = import.meta.glob<IComponentDefinition>('../../assets/catalog/*.json', { import: 'default' })

const nameOfFile = (file: string): string => file.slice(file.lastIndexOf('/') + 1, -'.json'.length)

const LOADERS = new Map(Object.entries(DEFINITION_FILES).map(([file, loader]) => [nameOfFile(file), loader]))

/** Every component the catalogue carries, by export name — synchronous, loads nothing. */
export const CATALOG_COMPONENT_NAMES: readonly string[] = [...LOADERS.keys()].sort()

/**
 * The index — name / tag / family / label of every component, eager and small
 * (one row per component), so a family can be resolved before anything loads.
 */
export const CATALOG_INDEX: readonly ICatalogIndexEntry[] = CATALOG_INDEX_JSON

/** `origam-btn` -> `OrigamBtn`, or `undefined` for a tag no component carries. */
export function catalogNameOfTag (tag: string): string | undefined {
    return CATALOG_INDEX.find(entry => entry.tag === tag)?.name
}

/** Every member of `name`'s family (itself included), or `[]` for an unknown name. */
export function catalogFamilyOf (name: string): string[] {
    const family = CATALOG_INDEX.find(entry => entry.name === name)?.family

    return family ? CATALOG_INDEX.filter(entry => entry.family === family).map(entry => entry.name) : []
}

/** One definition, or `undefined` for a name the catalogue does not carry. */
export async function loadCatalogDefinition (name: string): Promise<IComponentDefinition | undefined> {
    const loader = LOADERS.get(name)

    return loader ? loader() : undefined
}

/** Several definitions, in the order asked, unknown names dropped. */
export async function loadCatalogDefinitions (names: readonly string[]): Promise<IComponentDefinition[]> {
    const loaded = await Promise.all([...new Set(names)].map(loadCatalogDefinition))

    return loaded.filter((definition): definition is IComponentDefinition => !!definition)
}
