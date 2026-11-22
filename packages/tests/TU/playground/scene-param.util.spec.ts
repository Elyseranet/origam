// Pins the external-scene helpers (#1441): the base64url round trip the MCP
// server reuses, and `resolveExternalScene`'s error codes.

import { describe, expect, it } from 'vitest'
import { PLAYGROUND_SCENE_ERROR } from '../../../playground/src/enums/Commons/scene-error.enum'
import { SCENE_VERSION } from '../../../playground/src/consts/Commons/scene.const'
import {
    decodeSceneParam,
    decodeTextParam,
    encodeSceneParam,
    encodeTextParam,
    resolveExternalScene
} from '../../../playground/src/utils/Commons/scene-param.util'

const known = (name: string) => ['OrigamBtn', 'OrigamCard'].includes(name)
const tagOf = (tag: string) => (tag === 'origam-btn' ? 'OrigamBtn' : undefined)

const scene = (overrides: Record<string, unknown> = {}) => ({
    version: SCENE_VERSION,
    roots: [{ id: 'a', componentName: 'OrigamBtn', props: { variant: 'tonal' } }],
    selectedInstanceId: null,
    ...overrides
})

describe('encodeSceneParam / decodeSceneParam', () => {
    it('round-trips a scene', () => {
        expect(decodeSceneParam(encodeSceneParam(scene()))).toEqual(scene())
    })

    it('round-trips UTF-8 beyond Latin-1 (accents, CJK, emoji)', () => {
        const text = 'Été — 日本語 🚀'

        expect(decodeTextParam(encodeTextParam(text))).toBe(text)
        expect(decodeSceneParam(encodeSceneParam({ text }))).toEqual({ text })
    })

    it('emits URL-safe output: no +, / or =', () => {
        expect(encodeTextParam('???>>>~~~ÿþ')).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it.each(['***', 'a', 'e30=', 'not base64!'])('throws on corrupt input %s', input => {
        expect(() => decodeSceneParam(input)).toThrow()
    })

    it('throws on valid base64url that is not JSON', () => {
        expect(() => decodeSceneParam(encodeTextParam('{broken'))).toThrow()
    })

    it('throws on bytes that are not valid UTF-8', () => {
        expect(() => decodeTextParam('_w')).toThrow()
    })
})

describe('resolveExternalScene', () => {
    it('is `none` without parameter', () => {
        expect(resolveExternalScene('', known, tagOf)).toEqual({ status: 'none' })
    })

    it('loads ?scene=', () => {
        const result = resolveExternalScene(`?scene=${encodeSceneParam(scene())}`, known, tagOf)

        expect(result).toEqual({ status: 'scene', scene: scene() })
    })

    it('builds a one-instance scene from ?component=&props=&slot=', () => {
        const query = `?component=origam-btn&props=${encodeSceneParam({ variant: 'outlined' })}&slot=${encodeTextParam('Héllo')}`
        const result = resolveExternalScene(query, known, tagOf)

        expect(result.status).toBe('scene')
        if (result.status !== 'scene') return

        expect(result.scene.roots).toHaveLength(1)
        expect(result.scene.roots[0]).toMatchObject({ componentName: 'OrigamBtn', props: { variant: 'outlined' }, slotContent: 'Héllo' })
        expect(result.scene.roots[0]?.id).toBeTruthy()
    })

    it.each([
        ['broken base64', '?scene=***', PLAYGROUND_SCENE_ERROR.DECODE_FAILED],
        ['broken JSON', `?scene=${encodeTextParam('{x')}`, PLAYGROUND_SCENE_ERROR.DECODE_FAILED],
        ['not a scene', `?scene=${encodeSceneParam([1])}`, PLAYGROUND_SCENE_ERROR.INVALID_SCENE],
        ['instance without props', `?scene=${encodeSceneParam(scene({ roots: [{ id: 'a', componentName: 'OrigamBtn' }] }))}`, PLAYGROUND_SCENE_ERROR.INVALID_SCENE],
        ['other version', `?scene=${encodeSceneParam(scene({ version: 999 }))}`, PLAYGROUND_SCENE_ERROR.VERSION_MISMATCH],
        ['unknown component in scene', `?scene=${encodeSceneParam(scene({ roots: [{ id: 'a', componentName: 'OrigamNope', props: {} }] }))}`, PLAYGROUND_SCENE_ERROR.UNKNOWN_COMPONENT],
        ['unknown nested component', `?scene=${encodeSceneParam(scene({ roots: [{ id: 'a', componentName: 'OrigamCard', props: {}, children: { default: [{ id: 'b', componentName: 'OrigamNope', props: {} }] } }] }))}`, PLAYGROUND_SCENE_ERROR.UNKNOWN_COMPONENT],
        ['unknown tag', '?component=origam-nope', PLAYGROUND_SCENE_ERROR.UNKNOWN_COMPONENT],
        ['props not an object', `?component=origam-btn&props=${encodeSceneParam([1])}`, PLAYGROUND_SCENE_ERROR.INVALID_SCENE],
        ['corrupt props', '?component=origam-btn&props=***', PLAYGROUND_SCENE_ERROR.DECODE_FAILED]
    ])('%s -> error code', (_label, query, code) => {
        expect(resolveExternalScene(query, known, tagOf)).toMatchObject({ status: 'error', code })
    })
})
