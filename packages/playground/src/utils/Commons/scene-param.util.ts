import { PLAYGROUND_SCENE_ERROR } from '../../enums/Commons/scene-error.enum'
import { COMPONENT_PARAM, PROPS_PARAM, SCENE_PARAM, SLOT_PARAM } from '../../consts/Commons/scene-param.const'
import { SCENE_VERSION } from '../../consts/Commons/scene.const'
import { createInstanceId } from './scene-instance.util'
import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'
import type { TExternalSceneResult } from '../../types/Commons/external-scene.type'

/*********************************************************
 * Scene in a URL parameter (#1441)
 *
 * @description
 * base64url (RFC 4648 section 5, no padding) over the UTF-8 bytes of the
 * text. ⛔ `btoa(JSON.stringify(x))` alone throws on any char above U+00FF,
 * which is why the bytes go through `TextEncoder` first. Pure, no Vue, no
 * DOM: the MCP server imports these to build the URLs it opens.
 ********************************************************/
const BASE64URL = /^[A-Za-z0-9_-]*$/

export function encodeTextParam (text: string): string {
    let binary = ''

    for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte)

    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

/** Throws on anything that is not base64url over valid UTF-8. */
export function decodeTextParam (param: string): string {
    if (!BASE64URL.test(param) || param.length % 4 === 1) throw new Error('invalid base64url')

    const binary = atob(param.replaceAll('-', '+').replaceAll('_', '/'))

    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
}

export function encodeSceneParam (scene: unknown): string {
    return encodeTextParam(JSON.stringify(scene))
}

/** Throws on a corrupt parameter; returns the parsed JSON, unvalidated. */
export function decodeSceneParam<T = unknown> (param: string): T {
    return JSON.parse(decodeTextParam(param)) as T
}

/*********************************************************
 * Validation
 ********************************************************/
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

function isInstanceShape (value: unknown): value is IPlaygroundInstance {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.componentName !== 'string' || !isRecord(value.props)) return false
    if (value.slotContent !== undefined && typeof value.slotContent !== 'string') return false
    if (value.children === undefined) return true
    if (!isRecord(value.children)) return false

    return Object.values(value.children).every(list => Array.isArray(list) && list.every(isInstanceShape))
}

function firstUnknown (instances: IPlaygroundInstance[], isKnown: (name: string) => boolean): string | undefined {
    for (const instance of instances) {
        if (!isKnown(instance.componentName)) return instance.componentName

        const nested = firstUnknown(Object.values(instance.children ?? {}).flat(), isKnown)

        if (nested) return nested
    }

    return undefined
}

const fail = (code: PLAYGROUND_SCENE_ERROR, detail?: string): TExternalSceneResult => ({ status: 'error', code, detail })

/*********************************************************
 * resolveExternalScene
 *
 * @description
 * `?scene=` wins over `?component=`. `knownName` answers "is this export
 * name in the catalogue", `nameOfTag` maps `origam-btn` to `OrigamBtn`;
 * both are injected so this stays pure (the catalogue itself needs Vite's
 * `import.meta.glob`).
 ********************************************************/
export function resolveExternalScene (
    search: string | URLSearchParams,
    knownName: (name: string) => boolean,
    nameOfTag: (tag: string) => string | undefined
): TExternalSceneResult {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search
    const sceneParam = params.get(SCENE_PARAM)
    const componentParam = params.get(COMPONENT_PARAM)

    try {
        if (sceneParam !== null) {
            const raw = decodeSceneParam(sceneParam)

            if (!isRecord(raw) || !Array.isArray(raw.roots) || !raw.roots.every(isInstanceShape)) return fail(PLAYGROUND_SCENE_ERROR.INVALID_SCENE)
            if (raw.version !== SCENE_VERSION) return fail(PLAYGROUND_SCENE_ERROR.VERSION_MISMATCH, String(raw.version))

            const roots = raw.roots as IPlaygroundInstance[]
            const unknown = firstUnknown(roots, knownName)

            if (unknown) return fail(PLAYGROUND_SCENE_ERROR.UNKNOWN_COMPONENT, unknown)

            const scene: IPlaygroundScene = {
                version: SCENE_VERSION,
                roots,
                selectedInstanceId: typeof raw.selectedInstanceId === 'string' ? raw.selectedInstanceId : null
            }

            return { status: 'scene', scene }
        }

        if (componentParam !== null) {
            const name = nameOfTag(componentParam) ?? (knownName(componentParam) ? componentParam : undefined)

            if (!name) return fail(PLAYGROUND_SCENE_ERROR.UNKNOWN_COMPONENT, componentParam)

            const propsParam = params.get(PROPS_PARAM)
            const props = propsParam === null ? {} : decodeSceneParam(propsParam)

            if (!isRecord(props)) return fail(PLAYGROUND_SCENE_ERROR.INVALID_SCENE, PROPS_PARAM)

            const slotParam = params.get(SLOT_PARAM)
            const instance: IPlaygroundInstance = { id: createInstanceId(), componentName: name, props: props as IPlaygroundInstance['props'] }

            if (slotParam !== null) instance.slotContent = decodeTextParam(slotParam)

            return { status: 'scene', scene: { version: SCENE_VERSION, roots: [instance], selectedInstanceId: null } }
        }
    } catch {
        return fail(PLAYGROUND_SCENE_ERROR.DECODE_FAILED)
    }

    return { status: 'none' }
}
