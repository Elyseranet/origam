import { toKebabCase } from 'origam/utils'
import { DEFAULT_SLOT_NAME, JS_IDENTIFIER_REGEX, SCENE_CODE_DEFAULTS, SLOT_ARG_SAFE_CHAR_REGEX, STATIC_SLOT_NAME_REGEX } from '../../consts/Commons/scene-code.const'
import { TAG_CASE } from '../../enums/Commons/tag-case.enum'
import type { ISceneCodeOptions } from '../../interfaces/Commons/scene-code-options.interface'
import type { IPlaygroundInstance } from '../../interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../interfaces/Scene/playground-scene.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * Scene → Vue template
 *
 * @description
 * ONE direction only. The code view is rendered from the scene and is never
 * parsed back into it — decision #1048, recorded on `IComponentSnippet`. The
 * scene stays the single source of truth, so nothing in this file reads a
 * template.
 *
 * @description
 * Pure: same scene + same options → same string, no DOM, no Vue runtime, no
 * registry. That is what lets the whole surface be pinned by unit tests.
 ********************************************************/

/*********************************************************
 * Escaping
 *
 * @description
 * Vue's template parser DECODES HTML entities in every attribute value,
 * directive expressions included, before compiling them. So escaping `&`
 * and `"` as entities is what keeps a value intact inside a double-quoted
 * attribute — for a static string AND for a JS literal behind `:prop`. `&`
 * goes first, or the `&` of `&quot;` would itself be escaped.
 ********************************************************/
function escapeAttribute (value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/**
 * A single-quoted JS string literal. Single quotes because the literal lives
 * inside a double-quoted attribute; line terminators escaped because a raw
 * newline is a syntax error in a JS string.
 */
function toJsString (value: string): string {
    const body = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')

    return `'${body}'`
}

/**
 * A JS expression for any `TPropValue`. Not `JSON.stringify`: JSON quotes
 * with `"`, which would end the attribute, and quotes every key, which no
 * one writes by hand.
 */
function toJsLiteral (value: TPropValue): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return toJsString(value)
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)

    if (Array.isArray(value)) {
        return `[${value.map(toJsLiteral).join(', ')}]`
    }

    const entries = Object.entries(value).filter(([, entry]) => entry !== undefined)

    if (entries.length === 0) return '{}'

    const body = entries
        .map(([key, entry]) => `${JS_IDENTIFIER_REGEX.test(key) ? key : toJsString(key)}: ${toJsLiteral(entry)}`)
        .join(', ')

    return `{ ${body} }`
}

/*********************************************************
 * Attributes
 *
 * @description
 * Only what the instance SET is emitted — `instance.props` holds no
 * default by contract (`IPlaygroundInstance.props`), and an `undefined`
 * entry means "not set", so it is skipped too. Writing a default at the
 * call site would be the strongest rank in Vue's resolution chain and would
 * confiscate the theme / variant-preset channels, in the copied code
 * exactly as in the scene.
 ********************************************************/
function toAttribute (name: string, value: TPropValue): string | null {
    if (value === undefined) return null

    const attribute = toKebabCase(name)

    if (value === true) return attribute
    if (typeof value === 'string') return `${attribute}="${escapeAttribute(value)}"`

    return `:${attribute}="${escapeAttribute(toJsLiteral(value))}"`
}

function toTagName (componentName: string, tagCase: TAG_CASE): string {
    return tagCase === TAG_CASE.PASCAL ? componentName : toKebabCase(componentName)
}

/**
 * A dynamic `#[…]` argument lives in an attribute NAME, not a value, and an
 * attribute name cannot hold whitespace, quotes, `<`, `>`, `/` or `=` — a
 * plain `#['a b']` splits into two attributes (measured with
 * `vue/compiler-sfc`: 3 parse errors). So every code unit outside a safe set
 * is written as a `\uXXXX` escape, which the JS expression decodes back.
 */
function toSlotDirective (slotName: string): string {
    if (STATIC_SLOT_NAME_REGEX.test(slotName)) return `#${slotName}`

    let body = ''

    for (let i = 0; i < slotName.length; i++) {
        const char = slotName[i] ?? ''

        body += SLOT_ARG_SAFE_CHAR_REGEX.test(char) ? char : `\\u${slotName.charCodeAt(i).toString(16).padStart(4, '0')}`
    }

    return `#['${body}']`
}

/*********************************************************
 * Body
 *
 * @description
 * A slot's lines: `slotContent` (default slot only) first, then the child
 * instances in order. `slotContent` is emitted VERBATIM — the contract types
 * it as "plain text or markup", so escaping it would break the markup case.
 * An empty string and an absent value both mean "no content", as an empty
 * and an absent `children` both mean "no children".
 ********************************************************/
function slotBodyLines (instance: IPlaygroundInstance, slotName: string, depth: number, options: Required<ISceneCodeOptions>): string[] {
    const pad = options.indent.repeat(depth)
    const lines: string[] = []

    if (slotName === DEFAULT_SLOT_NAME && instance.slotContent) {
        for (const line of instance.slotContent.split('\n')) lines.push(line ? pad + line : '')
    }

    for (const child of instance.children?.[slotName] ?? []) {
        lines.push(...instanceLines(child, depth, options))
    }

    return lines
}

/**
 * The slots that actually have something to render, default first, named
 * slots in the order the scene lists them.
 */
function filledSlotNames (instance: IPlaygroundInstance): string[] {
    const names = [DEFAULT_SLOT_NAME, ...Object.keys(instance.children ?? {}).filter(name => name !== DEFAULT_SLOT_NAME)]

    return names.filter(name => (name === DEFAULT_SLOT_NAME && !!instance.slotContent) || (instance.children?.[name]?.length ?? 0) > 0)
}

/*********************************************************
 * Instance
 *
 * @description
 * Every filled slot is wrapped in its own `<template #name>` — the default
 * one included, even when it is the only one. That is the `vue-conventions`
 * rule ("always name slots, the default one too, and always wrap them with
 * the named template when using them"), decided for this generator on #1143.
 *
 * @description
 * An instance with nothing to render closes itself (`<origam-divider/>`),
 * the form this repo's own templates use.
 ********************************************************/
function instanceLines (instance: IPlaygroundInstance, depth: number, options: Required<ISceneCodeOptions>): string[] {
    const pad = options.indent.repeat(depth)
    const tag = toTagName(instance.componentName, options.tagCase)
    const attributes = Object.entries(instance.props)
        .map(([name, value]) => toAttribute(name, value))
        .filter((attribute): attribute is string => attribute !== null)
    const slots = filledSlotNames(instance)
    const selfClosing = slots.length === 0
    const close = selfClosing ? '/>' : '>'

    const inline = `${pad}<${[tag, ...attributes].join(' ')}${close}`
    const lines = attributes.length <= 1 || inline.length <= options.printWidth
        ? [inline]
        : [`${pad}<${tag}`, ...attributes.map(attribute => pad + options.indent + attribute), pad + close]

    if (selfClosing) return lines

    for (const slotName of slots) {
        lines.push(`${pad}${options.indent}<template ${toSlotDirective(slotName)}>`)
        lines.push(...slotBodyLines(instance, slotName, depth + 2, options))
        lines.push(`${pad}${options.indent}</template>`)
    }

    lines.push(`${pad}</${tag}>`)

    return lines
}

/*********************************************************
 * generateInstanceCode
 *
 * @description
 * The template of ONE instance and its subtree.
 ********************************************************/
export function generateInstanceCode (instance: IPlaygroundInstance, options: ISceneCodeOptions = {}): string {
    return instanceLines(instance, 0, { ...SCENE_CODE_DEFAULTS, ...options }).join('\n')
}

/*********************************************************
 * generateSceneCode
 *
 * @description
 * The template of the whole scene: every root in render order, one after
 * the other. No `<template>` wrapper — the result is pasted INTO a
 * template. An empty scene yields an empty string. The selection is not
 * part of the code.
 ********************************************************/
export function generateSceneCode (scene: IPlaygroundScene, options: ISceneCodeOptions = {}): string {
    const resolved = { ...SCENE_CODE_DEFAULTS, ...options }

    return scene.roots.map(root => instanceLines(root, 0, resolved).join('\n')).join('\n')
}
