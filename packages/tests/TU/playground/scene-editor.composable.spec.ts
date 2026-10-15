// Pins the scene-editing contract of the playground (#1142, lot B) on the
// composable that owns it — `useSceneEditor`. The contract comes from
// `IPlaygroundInstance.props` (lot 1, PR #1048):
//
//   - editing a prop WRITES `instance.props[key]`;
//   - resetting DELETES the key (not `undefined`, not the default);
//   - a default is NEVER copied into `props` — a call-site prop is the
//     strongest rank of the resolution chain and would confiscate the theme
//     and the variant preset (ADR-005).
//
// The scene is a plain `ref`, exactly what the standalone host hands the
// playground. Assertions read `Object.keys(props)` / `hasOwnProperty` rather
// than `props.x === undefined`, because "key present with undefined" and "key
// absent" are precisely the two states the contract distinguishes.

import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useSceneEditor } from '../../../playground/src/composables/Commons/sceneEditor.composable'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'

const makeScene = (): IPlaygroundScene => ({
    version: 1,
    selectedInstanceId: 'btn-1',
    roots: [
        {
            id: 'btn-1',
            componentName: 'OrigamBtn',
            props: {},
            children: {
                default: [{ id: 'icon-1', componentName: 'OrigamIcon', props: { icon: 'mdi-home' } }]
            }
        }
    ]
})

const has = (record: object, key: string) => Object.prototype.hasOwnProperty.call(record, key)

describe('useSceneEditor — set / reset / default never copied (#1142)', () => {
    it('setProp writes instance.props[key] and nothing else', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'variant', 'outlined')

        expect(scene.value.roots[0].props).toEqual({ variant: 'outlined' })
        expect(Object.keys(scene.value.roots[0].props)).toEqual(['variant'])
        expect(editor.isPropSet('btn-1', 'variant')).toBe(true)
    })

    it('resetProp DELETES the key — it does not leave it as undefined', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'variant', 'outlined')
        editor.resetProp('btn-1', 'variant')

        expect(has(scene.value.roots[0].props, 'variant')).toBe(false)
        expect(Object.keys(scene.value.roots[0].props)).toEqual([])
        expect(editor.isPropSet('btn-1', 'variant')).toBe(false)
    })

    it('a fresh instance holds no key at all — nothing pre-fills a default', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        expect(editor.selectedInstance.value?.props).toEqual({})
        expect(editor.isPropSet('btn-1', 'variant')).toBe(false)
        expect(editor.isPropSet('btn-1', 'density')).toBe(false)
    })

    it('setting undefined is a reset, never a key holding undefined', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'variant', 'outlined')
        editor.setProp('btn-1', 'variant', undefined)

        expect(has(scene.value.roots[0].props, 'variant')).toBe(false)
    })

    it('reset after several edits removes only that key', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'variant', 'tonal')
        editor.setProp('btn-1', 'disabled', true)
        editor.setProp('btn-1', 'padding', 16)
        editor.resetProp('btn-1', 'disabled')

        expect(scene.value.roots[0].props).toEqual({ variant: 'tonal', padding: 16 })
    })

    it('keeps falsy values that ARE values — false, 0 and empty string are set, not reset', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'disabled', false)
        editor.setProp('btn-1', 'padding', 0)
        editor.setProp('btn-1', 'rounded', '')

        expect(scene.value.roots[0].props).toEqual({ disabled: false, padding: 0, rounded: '' })
    })

    it('writes are immutable — a new scene, instance and props object reach the host', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)
        const before = scene.value
        const beforeInstance = before.roots[0]
        const beforeProps = beforeInstance.props

        editor.setProp('btn-1', 'variant', 'outlined')

        expect(scene.value).not.toBe(before)
        expect(scene.value.roots[0]).not.toBe(beforeInstance)
        expect(scene.value.roots[0].props).not.toBe(beforeProps)
        expect(beforeProps).toEqual({})
    })

    it('resetting a key that is not set does not emit a new scene', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)
        const before = scene.value

        editor.resetProp('btn-1', 'variant')

        expect(scene.value).toBe(before)
    })

    it('edits a NESTED instance by id, leaving its parent props untouched', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('icon-1', 'size', 'large')
        editor.resetProp('icon-1', 'icon')

        expect(scene.value.roots[0].props).toEqual({})
        expect(scene.value.roots[0].children?.default[0].props).toEqual({ size: 'large' })
    })

    it('selects by selectedInstanceId, falling back to the first root', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        expect(editor.selectedInstance.value?.id).toBe('btn-1')

        scene.value = { ...scene.value, selectedInstanceId: 'icon-1' }
        expect(editor.selectedInstance.value?.id).toBe('icon-1')

        scene.value = { ...scene.value, selectedInstanceId: 'nope' }
        expect(editor.selectedInstance.value?.id).toBe('btn-1')
    })
})

describe('useSceneEditor — emit write-back (#1142)', () => {
    it('update:{key} writes back ONLY a key the user already set', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'modelValue', true)
        editor.writeBackEmit('btn-1', 'update:modelValue', [false])

        expect(scene.value.roots[0].props).toEqual({ modelValue: false })
    })

    it('update:{key} on an UNSET key adds nothing — the component stays uncontrolled', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.writeBackEmit('btn-1', 'update:modelValue', [true])
        editor.writeBackEmit('btn-1', 'update:hover', [true])

        expect(scene.value.roots[0].props).toEqual({})
    })

    it('a non-update emit never writes', () => {
        const scene = ref(makeScene())
        const editor = useSceneEditor(scene)

        editor.setProp('btn-1', 'variant', 'flat')
        editor.writeBackEmit('btn-1', 'click', [{}])
        editor.writeBackEmit('btn-1', 'group:selected', [{ value: true }])

        expect(scene.value.roots[0].props).toEqual({ variant: 'flat' })
    })
})
