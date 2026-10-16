import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'

/**
 * Current `IPlaygroundScene.version`. Bumped whenever the scene shape changes
 * in a way a persisted scene cannot be read back under, so an old scene can
 * be migrated rather than silently misread.
 */
export const SCENE_VERSION = 1

/**
 * An empty scene.
 *
 * ⛔ A FACTORY, never a shared constant object. A scene is mutated in place by
 * the editor, so handing out one frozen-by-convention literal would let two
 * playground instances on the same page edit the same `roots` array — and the
 * second mount would start with the first one's content. The `withDefaults`
 * rule in this repo's CLAUDE.md makes the same point for object props, for
 * the same reason.
 */
export function createEmptyScene (): IPlaygroundScene {
    return { version: SCENE_VERSION, roots: [], selectedInstanceId: null }
}

/**
 * The props a scene-tree row reads its hint from, in order (`instanceHint`):
 * the visible text of a Btn / Tab (`text`), a ListItem / Chart (`title`), a
 * field (`label`). A row with none of them shows the component label alone.
 */
export const INSTANCE_HINT_PROP_KEYS: readonly string[] = ['text', 'title', 'label']

/*********************************************************
 * Selection by click in the preview (lot E1, #1164)
 *
 * @description
 * `PlaygroundSceneNode` stamps every rendered instance's root element with
 * `data-instance-id` (a fall-through attribute, so it lands on the
 * component's root without the component knowing). The preview resolves a
 * click to the NEAREST such ancestor — the innermost instance, so a Btn in a
 * DataTable cell selects the Btn, not the table.
 ********************************************************/
export const INSTANCE_ID_ATTRIBUTE = 'data-instance-id'

/**
 * The pointer events the preview swallows while the selection mode is on,
 * in the CAPTURE phase so they never reach the component. ⛔ `click` alone is
 * not enough: a menu or a native control reacts to `mousedown` /
 * `pointerdown` (focus, opening) before any `click` fires. Owner's decision
 * (2026-10-16): selection is an explicit mode, off by default, and while it
 * is on a click selects WITHOUT actuating the component.
 */
export const SELECT_MODE_CAPTURED_EVENTS: readonly string[] = [
    'pointerdown',
    'mousedown',
    'pointerup',
    'mouseup',
    'click',
    'dblclick',
    'auxclick',
    'contextmenu'
]

/** The event, among the captured ones, that performs the selection. */
export const SELECT_MODE_TRIGGER_EVENT = 'click'
