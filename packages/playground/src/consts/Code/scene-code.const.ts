import { TAG_CASE } from '../../enums/Code/tag-case.enum'
import type { ISceneCodeOptions } from '../../interfaces/Code/scene-code-options.interface'

/**
 * Defaults of `generateSceneCode`.
 *
 * ⚠️ `tagCase: KEBAB` is PROVISIONAL — the arbitration between the two
 * conventions `TAG_CASE` documents is open on #1143. Changing the default is
 * this one line.
 */
export const SCENE_CODE_DEFAULTS: Required<ISceneCodeOptions> = {
    tagCase: TAG_CASE.KEBAB,
    indent: '    ',
    printWidth: 80
}

/** The slot an instance's `slotContent` and `children.default` fill. */
export const DEFAULT_SLOT_NAME = 'default'

/**
 * A slot name Vue accepts after `#` as-is. Dots are allowed on purpose: the
 * compiler folds them back into the arg for `v-slot` (vuejs/core #1241), and
 * `OrigamDataTable` names its cell slots `item.<key>`. Anything else goes
 * through a dynamic `#[…]` argument.
 */
export const STATIC_SLOT_NAME_REGEX = /^[A-Za-z_][\w.-]*$/

/** A character written as-is inside a dynamic slot argument's JS string. */
export const SLOT_ARG_SAFE_CHAR_REGEX = /^[A-Za-z0-9_$.:-]$/

/** An object key that needs no quotes in a JS object literal. */
export const JS_IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/
