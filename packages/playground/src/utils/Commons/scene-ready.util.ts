import { PLAYGROUND_SCENE_ERROR } from '../../enums/Commons/scene-error.enum'
import { PLAYGROUND_INSTANCE_ATTRIBUTE, READY_QUIET_MS, READY_TIMEOUT_MS } from '../../consts/Commons/scene-param.const'

/*********************************************************
 * waitForSceneReady (#1441)
 *
 * @description
 * Resolves `null` once the scene is rendered AND stable, or the
 * `PLAYGROUND_SCENE_ERROR` that stopped it. "Stable" = fonts loaded, then
 * `READY_QUIET_MS` without a child-list mutation under `root` (components
 * load lazily, each landing is a mutation). Attribute mutations are NOT
 * watched: an animated component rewrites styles forever and would never
 * settle.
 *
 * @description
 * An empty scene (`expected` = 0) is ready as soon as it is quiet. A render
 * error span (`errorSelector`) once quiet = `render_failed`. At the hard cap,
 * something rendered = ready (a never-quiet animation is not a failure),
 * nothing rendered = `render_timeout`.
 ********************************************************/
export async function waitForSceneReady (root: Element, expected: number, errorSelector: string): Promise<PLAYGROUND_SCENE_ERROR | null> {
    await document.fonts?.ready

    return new Promise(resolve => {
        const rendered = () => root.querySelectorAll(`[${PLAYGROUND_INSTANCE_ATTRIBUTE}]`).length
        let quietTimer: ReturnType<typeof setTimeout>

        const finish = (outcome: PLAYGROUND_SCENE_ERROR | null) => {
            clearTimeout(quietTimer)
            clearTimeout(capTimer)
            observer.disconnect()
            resolve(outcome)
        }

        const onQuiet = () => {
            if (root.querySelector(errorSelector)) return finish(PLAYGROUND_SCENE_ERROR.RENDER_FAILED)
            if (expected === 0 || rendered() > 0) return finish(null)
        }

        const settle = () => {
            clearTimeout(quietTimer)
            quietTimer = setTimeout(onQuiet, READY_QUIET_MS)
        }

        const observer = new MutationObserver(settle)
        const capTimer = setTimeout(() => finish(rendered() > 0 ? null : PLAYGROUND_SCENE_ERROR.RENDER_TIMEOUT), READY_TIMEOUT_MS)

        observer.observe(root, { childList: true, subtree: true })
        settle()
    })
}
