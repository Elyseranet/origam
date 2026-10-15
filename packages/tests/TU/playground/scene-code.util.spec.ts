// Pins the playground lot C code generator (#1143): scene → Vue template,
// one direction only.
//
// Two kinds of assertion, on purpose:
//   1. exact strings — the layout a user sees and copies;
//   2. a ROUND TRIP through Vue's own SFC parser (`vue/compiler-sfc`), on the
//      TEST side only. The product never parses code back (decision #1048);
//      the test does, because "the escaping is right" is a claim about what
//      Vue's compiler decodes, and only Vue's compiler can answer it. A
//      string comparison alone would pin my belief about the escaping, not
//      the escaping.

import { describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'

import { generateInstanceCode, generateSceneCode } from '../../../playground/src/utils/Commons/scene-code.util'
import { TAG_CASE } from '../../../playground/src/enums/Commons/tag-case.enum'
import { SCENE_CODE_DEFAULTS } from '../../../playground/src/consts/Commons/scene-code.const'
import { SCENE_VERSION, createEmptyScene } from '../../../playground/src/consts/Commons/scene.const'
import type { IPlaygroundInstance } from '../../../playground/src/interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'
import type { TPropValue } from '../../../playground/src/types/Commons/prop-value.type'

let nextId = 0

const node = (componentName: string, props: Record<string, TPropValue> = {}, extra: Partial<IPlaygroundInstance> = {}): IPlaygroundInstance => ({
    id: `i${nextId++}`,
    componentName,
    props,
    ...extra
})

const sceneOf = (...roots: IPlaygroundInstance[]): IPlaygroundScene => ({ version: SCENE_VERSION, roots, selectedInstanceId: null })

// --- round-trip helpers (test side only) ------------------------------------

interface IParsedElement {
    tag: string
    attrs: Record<string, string | true>
    binds: Record<string, string>
    slot?: string
    children: IParsedElement[]
    text: string
}

const NODE_ELEMENT = 1
const NODE_TEXT = 2
const PROP_ATTRIBUTE = 6

const toParsed = (el: any): IParsedElement => {
    const attrs: Record<string, string | true> = {}
    const binds: Record<string, string> = {}
    let slot: string | undefined

    for (const p of el.props) {
        if (p.type === PROP_ATTRIBUTE) {
            attrs[p.name] = p.value ? p.value.content : true
        } else if (p.name === 'bind') {
            binds[p.arg.content] = p.exp.content
        } else if (p.name === 'slot') {
            slot = p.arg.isStatic ? p.arg.content : `[${p.arg.content}]`
        }
    }

    return {
        tag: el.tag,
        attrs,
        binds,
        slot,
        children: el.children.filter((c: any) => c.type === NODE_ELEMENT).map(toParsed),
        text: el.children.filter((c: any) => c.type === NODE_TEXT).map((c: any) => c.content).join('')
    }
}

/** Parse generated code with Vue's real SFC parser; throws on any syntax error. */
const parseTemplate = (code: string): IParsedElement[] => {
    const { descriptor, errors } = parse(`<template>\n${code}\n</template>`)

    expect(errors).toEqual([])

    return descriptor.template!.ast!.children.filter((c: any) => c.type === NODE_ELEMENT).map(toParsed)
}

/** Evaluate a `:prop` expression exactly as Vue would hand it to the renderer. */
 
const evaluate = (expression: string): unknown => new Function(`return (${expression})`)()

// ---------------------------------------------------------------------------

describe('generateSceneCode — scene level', () => {
    it('an empty scene yields an empty string', () => {
        expect(generateSceneCode(createEmptyScene())).toBe('')
    })

    it('several roots are emitted in render order, one after the other', () => {
        const code = generateSceneCode(sceneOf(node('OrigamBtn'), node('OrigamDivider'), node('OrigamChip')))

        expect(code).toBe('<origam-btn/>\n<origam-divider/>\n<origam-chip/>')
    })

    it('ignores the selection — it is not part of the code', () => {
        const root = node('OrigamBtn', { text: 'A' })
        const unselected = generateSceneCode(sceneOf(root))
        const selected = generateSceneCode({ ...sceneOf(root), selectedInstanceId: root.id })

        expect(selected).toBe(unselected)
    })

    it('is pure: it does not mutate the scene and repeats itself exactly', () => {
        const scene = sceneOf(node('OrigamCard', { rounded: 'lg' }, { children: { default: [node('OrigamCardText', {}, { slotContent: 'x' })] } }))
        const snapshot = JSON.stringify(scene)

        const first = generateSceneCode(scene)
        const second = generateSceneCode(scene)

        expect(second).toBe(first)
        expect(JSON.stringify(scene)).toBe(snapshot)
    })
})

describe('generateSceneCode — props', () => {
    it('empty props → bare tag, self-closing', () => {
        expect(generateInstanceCode(node('OrigamBtn'))).toBe('<origam-btn/>')
    })

    it('never emits a prop the instance did not set — undefined means "not set"', () => {
        const code = generateInstanceCode(node('OrigamBtn', { variant: undefined, text: 'Go' }))

        expect(code).toBe('<origam-btn text="Go"/>')
        expect(code).not.toContain('variant')
    })

    it('camelCase prop names become kebab-case attributes', () => {
        expect(generateInstanceCode(node('OrigamBtn', { bgColor: 'primary' }))).toBe('<origam-btn bg-color="primary"/>')
    })

    it('boolean true → bare attribute; false → :prop="false" (an explicit false is a set value)', () => {
        expect(generateInstanceCode(node('OrigamBtn', { disabled: true }))).toBe('<origam-btn disabled/>')
        expect(generateInstanceCode(node('OrigamBtn', { disabled: false }))).toBe('<origam-btn :disabled="false"/>')
    })

    it('numbers and null go through a binding', () => {
        expect(generateInstanceCode(node('OrigamRating', { length: 5 }))).toBe('<origam-rating :length="5"/>')
        expect(generateInstanceCode(node('OrigamRating', { length: -1.5 }))).toBe('<origam-rating :length="-1.5"/>')
        expect(generateInstanceCode(node('OrigamBtn', { icon: null }))).toBe('<origam-btn :icon="null"/>')
    })

    it('an empty string is a set value and is kept', () => {
        expect(generateInstanceCode(node('OrigamBtn', { text: '' }))).toBe('<origam-btn text=""/>')
    })

    it('strings with double quotes / ampersands are entity-escaped, and Vue decodes them back intact', () => {
        const text = 'He said "hi" & left — <b>not markup</b>'
        const code = generateInstanceCode(node('OrigamBtn', { text }))

        expect(code).toBe('<origam-btn text="He said &quot;hi&quot; &amp; left — <b>not markup</b>"/>')
        expect(parseTemplate(code)[0].attrs.text).toBe(text)
    })

    it('a literal entity in a string survives (the & is escaped first)', () => {
        const text = 'AT&amp;T is &quot;not&quot; decoded'
        const code = generateInstanceCode(node('OrigamBtn', { text }))

        expect(parseTemplate(code)[0].attrs.text).toBe(text)
    })

    it('objects and arrays → :prop with a JS literal, unquoted identifier keys', () => {
        const code = generateInstanceCode(node('OrigamChart', { series: [{ name: 'A', data: [1, 2, 3] }] }))

        expect(code).toBe('<origam-chart :series="[{ name: \'A\', data: [1, 2, 3] }]"/>')
    })

    it('empty object / empty array', () => {
        expect(generateInstanceCode(node('OrigamX', { a: {}, b: [] }))).toBe('<origam-x :a="{}" :b="[]"/>')
    })

    it('non-identifier object keys are quoted', () => {
        expect(generateInstanceCode(node('OrigamX', { style: { 'margin-top': '4px', '2x': 1 } })))
            .toBe('<origam-x :style="{ \'margin-top\': \'4px\', \'2x\': 1 }"/>')
    })

    it('undefined entries inside an object are dropped, like the scene contract says', () => {
        expect(generateInstanceCode(node('OrigamX', { o: { a: 1, b: undefined } }))).toBe('<origam-x :o="{ a: 1 }"/>')
    })

    it('nested JSON with every hostile character round-trips through Vue\'s parser to a deep-equal value', () => {
        const value: TPropValue = {
            quote: 'say "x"',
            apostrophe: 'it\'s',
            backslash: 'C:\\path\\to',
            newline: 'line1\nline2\r\n\tend',
            amp: 'a & b &amp; c',
            separators: 'u2028:\u2028 u2029:\u2029',
            unicode: 'é — 日本 🚀',
            nested: [[1, [2, [3]]], { deep: { deeper: [null, true, false, 0] } }],
            'odd key': 'v',
            "it's": 'key with apostrophe'
        }
        const code = generateInstanceCode(node('OrigamX', { data: value }))
        const [el] = parseTemplate(code)

        expect(evaluate(el.binds.data)).toEqual(value)
    })

    it('the TIcon nested-array shape round-trips', () => {
        const icon: TPropValue = ['M0 0h24v24H0z', ['M12 2L2 7l10 5', 0.4]]
        const [el] = parseTemplate(generateInstanceCode(node('OrigamIcon', { icon })))

        expect(evaluate(el.binds.icon)).toEqual(icon)
    })

    it('every kind of value round-trips at once through Vue\'s parser', () => {
        const props: Record<string, TPropValue> = { text: 'a "b"', disabled: true, block: false, size: 3, icon: null, items: [{ a: 1 }] }
        const [el] = parseTemplate(generateInstanceCode(node('OrigamBtn', props)))

        expect(el.attrs.text).toBe('a "b"')
        expect(el.attrs.disabled).toBe(true)
        expect(evaluate(el.binds.block)).toBe(false)
        expect(evaluate(el.binds.size)).toBe(3)
        expect(evaluate(el.binds.icon)).toBeNull()
        expect(evaluate(el.binds.items)).toEqual([{ a: 1 }])
    })
})

describe('generateSceneCode — layout of the opening tag', () => {
    it('keeps a short tag on one line', () => {
        expect(generateInstanceCode(node('OrigamBtn', { variant: 'flat', text: 'Go' }))).toBe('<origam-btn variant="flat" text="Go"/>')
    })

    it('breaks one attribute per line past printWidth', () => {
        const code = generateInstanceCode(node('OrigamBtn', { variant: 'outlined', bgColor: 'primary', prependIcon: 'mdi-check', text: 'Confirm the order' }))

        expect(code).toBe([
            '<origam-btn',
            '    variant="outlined"',
            '    bg-color="primary"',
            '    prepend-icon="mdi-check"',
            '    text="Confirm the order"',
            '/>'
        ].join('\n'))
    })

    it('never breaks a single attribute, however long', () => {
        const long = 'x'.repeat(200)

        expect(generateInstanceCode(node('OrigamBtn', { text: long }))).toBe(`<origam-btn text="${long}"/>`)
    })

    it('honours the indent / printWidth options', () => {
        const code = generateInstanceCode(node('OrigamBtn', { a: 'x', b: 'y' }), { indent: '  ', printWidth: 10 })

        expect(code).toBe('<origam-btn\n  a="x"\n  b="y"\n/>')
    })
})

describe('generateSceneCode — tag casing', () => {
    it('default is KEBAB — decided by the owner on #1143', () => {
        expect(SCENE_CODE_DEFAULTS.tagCase).toBe(TAG_CASE.KEBAB)
        expect(generateInstanceCode(node('OrigamDataTableRow'))).toBe('<origam-data-table-row/>')
    })

    it('PASCAL (internal option) emits the export name', () => {
        const code = generateInstanceCode(node('OrigamCard', {}, { children: { default: [node('OrigamCardText', {}, { slotContent: 'Hi' })] } }), { tagCase: TAG_CASE.PASCAL })

        expect(code).toBe([
            '<OrigamCard>',
            '    <template #default>',
            '        <OrigamCardText>',
            '            <template #default>',
            '                Hi',
            '            </template>',
            '        </OrigamCardText>',
            '    </template>',
            '</OrigamCard>'
        ].join('\n'))
    })
})

describe('generateSceneCode — slots (always named and wrapped, vue-conventions, #1143)', () => {
    it('slotContent alone → wrapped in <template #default>, even when it is the only slot', () => {
        const code = generateInstanceCode(node('OrigamBtn', {}, { slotContent: 'Click me' }))

        expect(code).toBe('<origam-btn>\n    <template #default>\n        Click me\n    </template>\n</origam-btn>')

        const [el] = parseTemplate(code)

        expect(el.children).toHaveLength(1)
        expect(el.children[0].tag).toBe('template')
        expect(el.children[0].slot).toBe('default')
        expect(el.children[0].text.trim()).toBe('Click me')
    })

    it('default-slot children alone → wrapped in <template #default> too', () => {
        const code = generateInstanceCode(node('OrigamCard', {}, { children: { default: [node('OrigamCardText')] } }))

        expect(code).toBe('<origam-card>\n    <template #default>\n        <origam-card-text/>\n    </template>\n</origam-card>')
        expect(parseTemplate(code)[0].children[0].slot).toBe('default')
    })

    it('multi-line slotContent is indented line by line, blank lines kept blank', () => {
        expect(generateInstanceCode(node('OrigamAlert', {}, { slotContent: 'one\n\ntwo' })))
            .toBe('<origam-alert>\n    <template #default>\n        one\n\n        two\n    </template>\n</origam-alert>')
    })

    it('slotContent is emitted verbatim (the contract allows markup)', () => {
        const [el] = parseTemplate(generateInstanceCode(node('OrigamAlert', {}, { slotContent: '<strong>Bold</strong> text' })))

        expect(el.children[0].slot).toBe('default')
        expect(el.children[0].children[0].tag).toBe('strong')
    })

    it('an empty slotContent is "no content" — self-closing, no empty template', () => {
        expect(generateInstanceCode(node('OrigamBtn', {}, { slotContent: '' }))).toBe('<origam-btn/>')
    })

    it('default and named slots → one <template> each', () => {
        const code = generateInstanceCode(node('OrigamCard', {}, {
            slotContent: 'Body',
            children: { title: [node('OrigamTitle', { tag: 'h3' }, { slotContent: 'Heading' })] }
        }))

        expect(code).toBe([
            '<origam-card>',
            '    <template #default>',
            '        Body',
            '    </template>',
            '    <template #title>',
            '        <origam-title tag="h3">',
            '            <template #default>',
            '                Heading',
            '            </template>',
            '        </origam-title>',
            '    </template>',
            '</origam-card>'
        ].join('\n'))

        const [el] = parseTemplate(code)

        expect(el.children.map(c => c.slot)).toEqual(['default', 'title'])
        expect(el.children[1].children[0].children[0].slot).toBe('default')
    })

    it('a named slot alone does not invent an empty default template', () => {
        expect(generateInstanceCode(node('OrigamCard', {}, { children: { append: [node('OrigamIcon')] } })))
            .toBe('<origam-card>\n    <template #append>\n        <origam-icon/>\n    </template>\n</origam-card>')
    })

    it('default slot is emitted first, named slots in scene order', () => {
        const code = generateInstanceCode(node('OrigamX', {}, {
            children: { zed: [node('OrigamA')], default: [node('OrigamB')], alpha: [node('OrigamC')] }
        }))
        const [el] = parseTemplate(code)

        expect(el.children.map(c => c.slot)).toEqual(['default', 'zed', 'alpha'])
    })

    it('slotContent comes before the default-slot children, inside the same template', () => {
        const code = generateInstanceCode(node('OrigamList', {}, { slotContent: 'Header', children: { default: [node('OrigamListItem')] } }))

        expect(code).toBe('<origam-list>\n    <template #default>\n        Header\n        <origam-list-item/>\n    </template>\n</origam-list>')
        expect(parseTemplate(code)[0].children).toHaveLength(1)
    })

    it('empty and absent children are alike', () => {
        expect(generateInstanceCode(node('OrigamCard', {}, { children: {} }))).toBe('<origam-card/>')
        expect(generateInstanceCode(node('OrigamCard', {}, { children: { default: [], title: [] } }))).toBe('<origam-card/>')
    })

    it('a dotted slot name (DataTable `item.<key>`) stays static and Vue keeps the dot in the arg', () => {
        const code = generateInstanceCode(node('OrigamDataTable', {}, { children: { 'item.name': [node('OrigamChip')] } }))

        expect(code).toContain('<template #item.name>')
        expect(parseTemplate(code)[0].children[0].slot).toBe('item.name')
    })

    it.each(['a b', 'say "x"', 'it\'s', 'a=b/c<d>', 'é 🚀'])('a slot name Vue cannot take statically (%s) goes through a dynamic argument that evaluates back to it', name => {
        const code = generateInstanceCode(node('OrigamX', {}, { children: { [name]: [node('OrigamY')] } }))
        const slot = parseTemplate(code)[0].children[0].slot!

        expect(slot.startsWith('[')).toBe(true)
        expect(evaluate(slot.slice(1, -1))).toBe(name)
    })
})

describe('generateSceneCode — nesting', () => {
    it('children on 3 levels are nested and indented one level per depth', () => {
        const scene = sceneOf(node('OrigamBreadcrumb', { divider: '/' }, {
            children: {
                default: [
                    node('OrigamCard', {}, {
                        children: {
                            default: [
                                node('OrigamCardHeader', {}, {
                                    children: { default: [node('OrigamTitle', { tag: 'h2' }, { slotContent: 'Deep' })] }
                                })
                            ]
                        }
                    }),
                    node('OrigamDivider')
                ]
            }
        }))

        const code = generateSceneCode(scene)

        expect(code).toBe([
            '<origam-breadcrumb divider="/">',
            '    <template #default>',
            '        <origam-card>',
            '            <template #default>',
            '                <origam-card-header>',
            '                    <template #default>',
            '                        <origam-title tag="h2">',
            '                            <template #default>',
            '                                Deep',
            '                            </template>',
            '                        </origam-title>',
            '                    </template>',
            '                </origam-card-header>',
            '            </template>',
            '        </origam-card>',
            '        <origam-divider/>',
            '    </template>',
            '</origam-breadcrumb>'
        ].join('\n'))

        const [root] = parseTemplate(code)
        const rootSlot = root.children[0]
        const card = rootSlot.children[0]
        const header = card.children[0].children[0]
        const title = header.children[0].children[0]

        expect(rootSlot.slot).toBe('default')
        expect(card.tag).toBe('origam-card')
        expect(header.tag).toBe('origam-card-header')
        expect(title.tag).toBe('origam-title')
        expect(title.children[0].text.trim()).toBe('Deep')
        expect(rootSlot.children[1].tag).toBe('origam-divider')
    })

    it('a long opening tag nested 2 levels deep breaks with its own indentation', () => {
        const code = generateSceneCode(sceneOf(node('OrigamCard', {}, {
            children: {
                default: [node('OrigamCardText', {}, {
                    children: { default: [node('OrigamBtn', { variant: 'outlined', bgColor: 'primary', text: 'A fairly long label' })] }
                })]
            }
        })))

        expect(code).toBe([
            '<origam-card>',
            '    <template #default>',
            '        <origam-card-text>',
            '            <template #default>',
            '                <origam-btn',
            '                    variant="outlined"',
            '                    bg-color="primary"',
            '                    text="A fairly long label"',
            '                />',
            '            </template>',
            '        </origam-card-text>',
            '    </template>',
            '</origam-card>'
        ].join('\n'))
    })
})
