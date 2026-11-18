// Pins how a prop editor turns input into a scene write (#1142, lot B):
//
//   1. `deriveControlKind` (the seed generator) — the ambiguous runtime type
//      `['Boolean', 'Number', 'String']` is an ABSENCE of information (PR
//      #1048) and must never become a SWITCH; a finite union (source B) is a
//      SELECT. Checked on the function AND on the committed seed itself.
//   2. `admittedCoercions` / `coerceInput` — explicit coercion: "4" stays a
//      string unless the user picks NUMBER; a refused parse writes nothing.
//   3. `usePropControl` — the editor never emits a default: unset, every
//      model reads empty and the default only appears in `defaultLabel`.

import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

import { aliasNameOf, deriveControlKind, describeTypes } from '../../../playground/scripts/lib/definition.mjs'
import { usePropControl } from '../../../playground/src/composables/Commons/propControl.composable'
import { CONTROL_KIND } from '../../../playground/src/enums/Commons/control-kind.enum'
import { METADATA_SOURCE } from '../../../playground/src/enums/Commons/metadata-source.enum'
import { PROP_COERCION } from '../../../playground/src/enums/Commons/prop-coercion.enum'
import { HOST_CATALOG_SEED } from '../../../playground/src/host/catalogSeed.const'
import type { IPropDefinition } from '../../../playground/src/interfaces/Catalog/prop-definition.interface'
import type { IPlaygroundPropControlProps } from '../../../playground/src/interfaces/Components/playground-prop-control.interface'
import { admittedCoercions, coerceInput, coercionOf, formatPropValue } from '../../../playground/src/utils/Commons/prop-control.util'

const AMBIGUOUS = ['Boolean', 'Number', 'String']

describe('deriveControlKind — the seed generator (#1142)', () => {
    it('never maps the ambiguous [Boolean, Number, String] to a SWITCH', () => {
        expect(deriveControlKind(AMBIGUOUS, undefined)).toBe('TEXT')
        expect(deriveControlKind(['Boolean', 'String'], undefined)).toBe('TEXT')
    })

    it('trusts a runtime type naming exactly ONE constructor', () => {
        expect(deriveControlKind('Boolean', undefined)).toBe('SWITCH')
        expect(deriveControlKind('Number', undefined)).toBe('NUMBER')
        expect(deriveControlKind('Array', undefined)).toBe('JSON')
        expect(deriveControlKind('Object', undefined)).toBe('JSON')
        expect(deriveControlKind('String', undefined)).toBe('TEXT')
        expect(deriveControlKind(['Boolean', null], undefined)).toBe('SWITCH')
        expect(deriveControlKind(null, undefined)).toBe('TEXT')
    })

    it('a finite union (source B) wins over any runtime type', () => {
        expect(deriveControlKind(null, ['text', 'flat'])).toBe('SELECT')
        expect(deriveControlKind(AMBIGUOUS, [false, true, 'always'])).toBe('SELECT')
        expect(deriveControlKind('String', [])).toBe('TEXT')
    })

    it('resolves an alias the printer kept by name (source B2)', () => {
        const aliases = { TAnchor: { enumerable: true, options: ['top', 'bottom'] }, TColor: { enumerable: false } }

        expect(aliasNameOf('TAnchor | undefined')).toBe('TAnchor')
        expect(aliasNameOf('All.TCommandPaletteHotkey')).toBe('TCommandPaletteHotkey')
        expect(aliasNameOf('"a" | "b" | undefined')).toBe(null)
        expect(describeTypes({ tsType: 'TAnchor | undefined', options: null }, aliases)).toMatchObject({ options: ['top', 'bottom'], source: 'ALIAS' })
        expect(describeTypes({ tsType: 'TColor', options: null }, aliases).options).toBeUndefined()
    })
})

describe('the committed host seed honours the derivation', () => {
    const allProps = HOST_CATALOG_SEED.flatMap(definition => definition.props)
    const isAmbiguous = (prop: IPropDefinition) => Array.isArray(prop.runtimeType) && AMBIGUOUS.every(name => (prop.runtimeType as string[]).includes(name))

    it('no ambiguous-typed prop is a SWITCH', () => {
        const ambiguous = allProps.filter(isAmbiguous)

        expect(ambiguous.length).toBeGreaterThan(0)
        expect(ambiguous.filter(prop => prop.control === CONTROL_KIND.SWITCH)).toEqual([])
    })

    it('every SELECT carries its members, and OrigamBtn.variant lists the 7 action variants', () => {
        expect(allProps.filter(prop => prop.control === CONTROL_KIND.SELECT && !(prop.options?.length))).toEqual([])

        const variant = HOST_CATALOG_SEED.find(d => d.name === 'OrigamBtn')?.props.find(p => p.name === 'variant')
        expect(variant?.control).toBe(CONTROL_KIND.SELECT)
        expect(variant?.options).toEqual(['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost'])
        expect(variant?.source).toBe(METADATA_SOURCE.TYPES)
    })
})

describe('explicit coercion (#1142)', () => {
    it('admits only the kinds the runtime type names', () => {
        expect(admittedCoercions(AMBIGUOUS)).toEqual([PROP_COERCION.STRING, PROP_COERCION.NUMBER, PROP_COERCION.BOOLEAN])
        expect(admittedCoercions('String')).toEqual([PROP_COERCION.STRING])
        expect(admittedCoercions(['Boolean', 'Object'])).toEqual([PROP_COERCION.BOOLEAN, PROP_COERCION.JSON])
        expect(admittedCoercions(['Number', 'Function'])).toEqual([PROP_COERCION.NUMBER])
        expect(admittedCoercions('Function')).toEqual([])
        expect(admittedCoercions(null)).toEqual([PROP_COERCION.STRING, PROP_COERCION.NUMBER, PROP_COERCION.BOOLEAN, PROP_COERCION.JSON])
    })

    it('"4" stays a string unless NUMBER is chosen — no inference', () => {
        expect(coerceInput('4', PROP_COERCION.STRING)).toEqual({ ok: true, value: '4' })
        expect(coerceInput('4', PROP_COERCION.NUMBER)).toEqual({ ok: true, value: 4 })
    })

    it('refuses what does not parse under the chosen kind', () => {
        expect(coerceInput('abc', PROP_COERCION.NUMBER)).toEqual({ ok: false })
        expect(coerceInput('', PROP_COERCION.NUMBER)).toEqual({ ok: false })
        expect(coerceInput('yes', PROP_COERCION.BOOLEAN)).toEqual({ ok: false })
        expect(coerceInput('[1,', PROP_COERCION.JSON)).toEqual({ ok: false })
        expect(coerceInput(' false ', PROP_COERCION.BOOLEAN)).toEqual({ ok: true, value: false })
        expect(coerceInput('{"a":1}', PROP_COERCION.JSON)).toEqual({ ok: true, value: { a: 1 } })
    })

    it('round-trips a set value through its own kind', () => {
        for (const value of ['4', 4, true, ['a', 'b'], { a: 1 }]) {
            const kind = coercionOf(value)
            expect(coerceInput(formatPropValue(value), kind)).toEqual({ ok: true, value })
        }
    })
})

const definitionOf = (overrides: Partial<IPropDefinition>): IPropDefinition => ({
    name: 'variant',
    label: 'variant',
    tsType: null,
    runtimeType: null,
    required: false,
    hasFactoryDefault: false,
    control: CONTROL_KIND.TEXT,
    source: METADATA_SOURCE.RUNTIME,
    ...overrides
})

const LABELS = { noDefault: '—', factoryDefault: 'generated value' }

describe('usePropControl — the default is shown, never emitted (#1142)', () => {
    it('SELECT unset reads null even when the component declares a default', () => {
        const props = reactive<IPlaygroundPropControlProps>({
            definition: definitionOf({ control: CONTROL_KIND.SELECT, options: ['tonal', 'outlined', 'filled'], defaultValue: 'outlined' }),
            value: undefined,
            isSet: false
        })
        const set = vi.fn()
        const reset = vi.fn()
        const control = usePropControl(props, set, reset, LABELS)

        expect(control.selectModel.value).toBe(null)
        expect(control.defaultLabel.value).toBe('outlined')
        expect(set).not.toHaveBeenCalled()

        control.selectModel.value = 2
        expect(set).toHaveBeenCalledWith('filled')

        control.selectModel.value = null
        expect(reset).toHaveBeenCalledTimes(1)
    })

    it('SELECT keys items by index, so a `false` member is selectable', () => {
        const props = reactive<IPlaygroundPropControlProps>({
            definition: definitionOf({ control: CONTROL_KIND.SELECT, options: [false, true, 'always'] }),
            value: false,
            isSet: true
        })
        const control = usePropControl(props, vi.fn(), vi.fn(), LABELS)

        expect(control.selectItems.value).toEqual([{ title: 'false', value: 0 }, { title: 'true', value: 1 }, { title: 'always', value: 2 }])
        expect(control.selectModel.value).toBe(0)
    })

    it('NUMBER emptied is a reset, never a null write', () => {
        const props = reactive<IPlaygroundPropControlProps>({ definition: definitionOf({ control: CONTROL_KIND.NUMBER, defaultValue: 3 }), value: undefined, isSet: false })
        const set = vi.fn()
        const reset = vi.fn()
        const control = usePropControl(props, set, reset, LABELS)

        expect(control.numberModel.value).toBe(null)
        control.numberModel.value = null
        expect(set).not.toHaveBeenCalled()
        expect(reset).toHaveBeenCalledTimes(1)
    })

    it('TEXT on an ambiguous prop writes a STRING by default and refuses a bad number', async () => {
        const props = reactive<IPlaygroundPropControlProps>({ definition: definitionOf({ name: 'padding', runtimeType: AMBIGUOUS }), value: undefined, isSet: false })
        const set = vi.fn()
        const control = usePropControl(props, set, vi.fn(), LABELS)

        expect(control.hasCoercionChoice.value).toBe(true)
        control.textModel.value = '4'
        expect(set).toHaveBeenLastCalledWith('4')

        props.value = '4'
        props.isSet = true
        await nextTick()

        control.coercionModel.value = PROP_COERCION.NUMBER
        expect(set).toHaveBeenLastCalledWith(4)

        set.mockClear()
        control.textModel.value = 'abc'
        expect(set).not.toHaveBeenCalled()
        expect(control.invalid.value).toBe(true)
    })

    it('a Function-only prop is not editable', () => {
        const props = reactive<IPlaygroundPropControlProps>({ definition: definitionOf({ name: 'customFilter', runtimeType: 'Function' }), value: undefined, isSet: false })
        const control = usePropControl(props, vi.fn(), vi.fn(), LABELS)

        expect(control.isEditable.value).toBe(false)
    })

    it('reset clears the draft so the default shows again', async () => {
        const props = reactive<IPlaygroundPropControlProps>({ definition: definitionOf({ name: 'tag', runtimeType: 'String', defaultValue: 'button' }), value: 'a', isSet: true })
        const control = usePropControl(props, vi.fn(), vi.fn(), LABELS)

        expect(control.textModel.value).toBe('a')

        props.isSet = false
        props.value = undefined
        await nextTick()

        expect(control.textModel.value).toBe('')
        expect(control.defaultLabel.value).toBe('button')
    })
})
