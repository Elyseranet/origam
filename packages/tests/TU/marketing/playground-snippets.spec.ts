// Pins the marketing site's playground snippets (lot E, #1145) against the
// catalogue EXTRACTED from the DS — the one the engine renders from:
//
//   1. every snippet key and every nested instance names a real component;
//   2. every prop a snippet sets is a prop that component declares (or a
//      fall-through attribute listed below) — a snippet that invents a prop
//      fails here, not silently in the browser;
//   3. the host helpers (`snippetFor`, `withVariant`) behave as the two pages
//      rely on: a sub-part opens on the family snippet that nests it, and a
//      curated variant lands on the DOCUMENTED instance.

import { beforeAll, describe, expect, it } from 'vitest'

import { CATALOG_INDEX, loadCatalogDefinitions } from '../../../playground/src/utils/Commons/catalog.util'
import { createDefaultSnippets, SNIPPET_PARENT_OF } from '../../../playground/src/consts/Commons/snippets.const'
import { attachSnippets } from '../../../playground/src/utils/Commons/scene-instance.util'
import type { IComponentDefinition } from '../../../playground/src/interfaces/Catalog/component-definition.interface'
import type { IPlaygroundInstance } from '../../../playground/src/interfaces/Scene/playground-instance.interface'

import { MARKETING_SNIPPET_PARENT_OF, PLAYGROUND_UNAVAILABLE_REASONS } from '~/consts/playground-host.const'
import { createMarketingSnippets } from '~/consts/playground-snippets.const'
import { collectComponentNames, findInstanceOf, mergeSnippetTables, snippetFor, withoutThemedProps, withVariant } from '~/utils/playground-host.util'

const translate = (_key: string, fallback?: string) => fallback ?? ''
const ATTACH = '.probe'
const SNIPPETS = createMarketingSnippets(translate, ATTACH)
const NAMES = new Set(CATALOG_INDEX.map(entry => entry.name))
/* Not props: attributes the component reads from `$attrs`, or that land on a
   native element that honours them (`<hr width>`). */
const ATTRIBUTES = new Set(['aria-label', 'OrigamDivider.width'])

const walk = (instances: IPlaygroundInstance[], visit: (instance: IPlaygroundInstance) => void) => {
    for (const instance of instances) {
        visit(instance)
        for (const children of Object.values(instance.children ?? {})) walk(children, visit)
    }
}

let byName = new Map<string, IComponentDefinition>()

beforeAll(async () => {
    const definitions = await loadCatalogDefinitions(CATALOG_INDEX.map(entry => entry.name))
    byName = new Map(definitions.map(definition => [definition.name, definition]))
})

describe('the committed catalogue', () => {
    it('carries every component of the index, with a definition each', () => {
        expect(CATALOG_INDEX.length).toBeGreaterThanOrEqual(219)
        expect(byName.size).toBe(CATALOG_INDEX.length)
    })

    it('spells every tag the way Vue hyphenates the export name', () => {
        const hyphenate = (name: string) => name.replace(/\B([A-Z])/g, '-$1').toLowerCase()
        expect(CATALOG_INDEX.filter(entry => entry.tag !== hyphenate(entry.name))).toEqual([])
        expect(CATALOG_INDEX.find(entry => entry.name === 'OrigamWindowXTranslate')?.tag).toBe('origam-window-x-translate')
    })
})

describe('marketing snippets (ex-COMPONENT_PREVIEW_ADAPTERS)', () => {
    it('keys and nests only real components', () => {
        const unknown: string[] = []
        for (const [name, snippets] of Object.entries(SNIPPETS)) {
            if (!NAMES.has(name)) unknown.push(name)
            for (const snippet of snippets) for (const used of collectComponentNames(snippet.instances)) if (!NAMES.has(used)) unknown.push(used)
        }
        expect(unknown).toEqual([])
    })

    it('sets only props the component declares', () => {
        const invented: string[] = []
        for (const snippets of Object.values(SNIPPETS)) {
            for (const snippet of snippets) {
                walk(snippet.instances, instance => {
                    const declared = new Set(byName.get(instance.componentName)?.props.map(prop => prop.name))
                    for (const key of Object.keys(instance.props)) if (!declared.has(key) && !ATTRIBUTES.has(key) && !ATTRIBUTES.has(`${instance.componentName}.${key}`)) invented.push(`${instance.componentName}.${key}`)
                })
            }
        }
        expect(invented).toEqual([])
    })

    it('opens every overlay on the attach target it is handed', () => {
        const attached: string[] = []
        for (const snippets of Object.values(SNIPPETS)) for (const snippet of snippets) walk(snippet.instances, instance => {
            if ('attach' in instance.props) attached.push(String(instance.props.attach))
        })
        expect(attached.length).toBeGreaterThan(0)
        expect(new Set(attached)).toEqual(new Set([ATTACH]))
    })

    it('lists reasons only for real components, and nothing it can render', () => {
        expect(Object.keys(PLAYGROUND_UNAVAILABLE_REASONS).filter(name => !NAMES.has(name))).toEqual([])
        expect(Object.keys(PLAYGROUND_UNAVAILABLE_REASONS).filter(name => name in SNIPPETS)).toEqual([])
    })
})

describe('host helpers', () => {
    const definitionsFor = () => attachSnippets(
        [...byName.values()],
        mergeSnippetTables(createDefaultSnippets(translate), SNIPPETS),
        { ...SNIPPET_PARENT_OF, ...MARKETING_SNIPPET_PARENT_OF }
    )

    it('a component with its own snippet opens on it — the playground one first', () => {
        const definitions = definitionsFor()
        expect(snippetFor('OrigamDataTable', definitions)?.id).toBe('data-table-actions')
        expect(snippetFor('OrigamBtnGroup', definitions)?.instances[0]?.componentName).toBe('OrigamBtnGroup')
    })

    it('a sub-part opens on the family snippet that nests it', () => {
        const definitions = definitionsFor()
        const windowItem = snippetFor('OrigamWindowItem', definitions)
        expect(windowItem?.instances[0]?.componentName).toBe('OrigamWindow')
        expect(findInstanceOf(windowItem!.instances, 'OrigamWindowItem')).toBeDefined()
        expect(snippetFor('OrigamExpansionPanel', definitions)?.instances[0]?.componentName).toBe('OrigamExpansionPanels')
    })

    it('a component nobody nests has no snippet', () => {
        expect(snippetFor('OrigamSpacer', definitionsFor())).toBeUndefined()
    })

    it('a variant lands on the documented instance, not on its parent, without mutating the tree', () => {
        const [snippet] = SNIPPETS.OrigamTab ?? []
        const before = JSON.stringify(snippet!.instances)
        const applied = withVariant(snippet!.instances, 'OrigamTab', { value: 'two' }, 'Tab two')
        expect(applied[0]?.componentName).toBe('OrigamTabs')
        expect(applied[0]?.props).toEqual({ modelValue: 'one' })
        expect(findInstanceOf(applied, 'OrigamTab')).toMatchObject({ props: { value: 'two' }, slotContent: 'Tab two' })
        expect(JSON.stringify(snippet!.instances)).toBe(before)
    })

    it('the Theme Builder strips the props the theme sets from the documented instance only', () => {
        const [snippet] = SNIPPETS.OrigamBtnToggle ?? []
        const stripped = withoutThemedProps(snippet!.instances, 'OrigamBtn', new Set(['value']), { variant: 'outlined' })
        const buttons = stripped[0]!.children!.default!
        expect(buttons.every(button => !('value' in button.props) && button.props.variant === 'outlined')).toBe(true)
        expect(snippet!.instances[0]!.children!.default![0]!.props).toEqual({ value: 'left' })
    })

    it('a component requiring a parent never opens on a bare child template', () => {
        const definitions = definitionsFor()
        expect(snippetFor('OrigamTab', definitions)?.instances[0]?.componentName).toBe('OrigamTabs')
    })
})
