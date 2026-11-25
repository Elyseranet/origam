/*********************************************************
 * #1136 — type-level test, checked by `pnpm -F origam type-check`.
 *
 * @description
 * Not shipped (`__tests__` is excluded from the build) and never run: it
 * only has to COMPILE. Both real shiki highlighters must satisfy
 * `TShikiHighlighter`; the `@ts-expect-error` is the negative control that
 * proves the type still rejects something.
 ********************************************************/
import { createHighlighter } from 'shiki'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import type { TShikiHighlighter } from '../code.type'

export async function fullBundle (): Promise<TShikiHighlighter> {
    return await createHighlighter({ themes: ['github-light'], langs: ['ts'] })
}

export async function fineGrainedCore (): Promise<TShikiHighlighter> {
    return await createHighlighterCore({
        themes: [import('shiki/themes/github-light.mjs')],
        langs: [import('shiki/langs/typescript.mjs')],
        engine: createJavaScriptRegexEngine()
    })
}

// @ts-expect-error — an object without `codeToHtml` is not a highlighter.
export const rejected: TShikiHighlighter = {}
