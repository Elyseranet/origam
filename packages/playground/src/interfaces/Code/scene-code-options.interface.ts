import type { TAG_CASE } from '../../enums/Code/tag-case.enum'

/*********************************************************
 * ISceneCodeOptions
 *
 * @description
 * Formatting knobs of `generateSceneCode`. Every key is optional; a missing
 * one falls back to `SCENE_CODE_DEFAULTS`. None of them changes WHAT the
 * code says — only how it is spelled and laid out.
 ********************************************************/
export interface ISceneCodeOptions {
    /** Tag casing. See `TAG_CASE`. */
    tagCase?: TAG_CASE
    /** One indentation level. */
    indent?: string
    /**
     * Above this width (indentation included) an opening tag breaks into
     * one attribute per line. A tag with a single attribute never breaks.
     */
    printWidth?: number
}
