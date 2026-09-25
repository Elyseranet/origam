/**
 * Shared analysis: a component whose ROOT VNODE can be neither ELEMENT nor
 * COMPONENT must declare `inheritAttrs: false` — otherwise Vue logs, on every
 * render, a warning that serialises the whole ancestor vnode graph.
 *
 * WHY THIS EXISTS (#916, mechanism from #853)
 * -------------------------------------------
 * `renderComponentRoot()` in `@vue/runtime-core` tries to merge fallthrough
 * attributes onto the component's root vnode:
 *
 *     if (fallthroughAttrs && inheritAttrs !== false) {
 *       if (shapeFlag & (ELEMENT | COMPONENT))  -> cloneVNode(root, attrs)
 *       else if (__DEV__ && !accessedAttrs && root.type !== Comment) -> warn
 *     }
 *
 * When the root is a FRAGMENT, a TEXT node, or a `<teleport>`, the merge is
 * impossible and dev mode warns — "Extraneous non-props attributes … because
 * component renders fragment or text or teleport root nodes". Vue treats the
 * TELEPORT shapeFlag like a fragment here, which its own message spells out.
 *
 * The cost is not the line of text. `warn()` appends a COMPONENT TRACE, and
 * the trace formats each ancestor's props — including Vue Router's
 * `<RouteProvider>`, whose `vnode` prop is the entire rendered page's reactive
 * graph. Measured at ~4.4 MB per occurrence, dominated by repeated
 * "[Circular]". #853 measured 1.1 GB of Nitro log without a database and
 * 5.5 GB with one; a later run reached 161 MB in 45 min, then
 * `JS heap out of memory` and HTTP 500 on every route. The developer sees a
 * completely broken site with no apparent link to what they were doing.
 *
 * WHY A GUARD AND NOT JUST THE TWELVE FIXES
 * ------------------------------------------
 * Nothing in the type system, the linter or the test suite expresses "your
 * template root is a fragment, therefore you owe `inheritAttrs: false`". A new
 * component that opens with `<template v-if>` / `<teleport>` / `<slot/>` starts
 * in the defective state and says nothing about it — the symptom is a log file,
 * not a failing test. #853 shipped for months before anyone traced it.
 *
 * HOW THE ROOT SHAPE IS DETERMINED
 * ---------------------------------
 * ⛔ NOT by counting the tags at depth 0 of `<template>`. That is what #916's
 * own survey did, and it over-counted by 4 of 15 (25 %): a
 * `<template v-if>` / `<template v-else>` pair reads as two nodes and renders
 * ONE, so the automatic fallthrough works and there is no defect. It also
 * MISSED two real ones.
 *
 * Instead the SFC template is handed to the real `@vue/compiler-dom`, and the
 * resulting root `codegenNode` is walked — the same structure the runtime
 * shapeFlag is derived from. A root `v-if` chain is resolved through every
 * branch, so a component is reported only when AT LEAST ONE reachable branch
 * yields a fragment / teleport / text root. Concretely, on this catalogue:
 *
 *     tag-counting at depth 0   -> 15 candidates, 4 false, 2 missed
 *     compiler codegenNode      -> 12, all 12 reproduced at runtime
 *
 * ⛔ WHAT THIS GUARD DOES NOT PROVE
 * ---------------------------------
 * Static, like every guard here. It proves the component DECLARES the option,
 * never that the attributes still reach the right element afterwards — and
 * that second half is the dangerous one. `inheritAttrs: false` without a
 * matching `v-bind="$attrs"` silently drops `class` / `style` / `id` /
 * `aria-*` / `data-cy` and every listener, which is precisely what #492
 * shipped on `OrigamThemeProvider`. Four of #916's twelve had a MIXED root
 * (one fragment branch, one single-element branch where the merge worked), so
 * on those the flag alone WAS a regression.
 *
 * The runtime verdict therefore lives in
 * `packages/tests/TU/components/Commons/inherit-attrs-fragment-roots.spec.ts`,
 * which mounts each component with an undeclared attribute and asserts both
 * halves: no warning, AND the attributes still land where they landed before.
 * Every `v-bind="$attrs"` there was verified load-bearing by removing it and
 * watching that spec go red. Do not read a green guard as "attributes are
 * fine" — it cannot see that.
 */

/*
 * Imported from the `vue/compiler-sfc` SUBPATH, not from `@vue/compiler-dom` /
 * `@vue/compiler-sfc` directly: `vue` is a declared dependency of
 * `packages/ds`, those two are only transitive. Reaching for a transitive
 * package works until pnpm's isolated layout stops hoisting it, and then the
 * guard dies with ERR_MODULE_NOT_FOUND instead of reporting. `compileTemplate`
 * returns the same transformed AST — verified: `ast.codegenNode.tag` is
 * `Symbol(Fragment)` for a two-element root and `Symbol(Teleport)` for a
 * teleport root.
 */
import { compileTemplate, parse } from 'vue/compiler-sfc'

/*
 * NodeTypes / symbols we care about, from `@vue/compiler-core`. Spelled out
 * rather than imported so the guard keeps working if the enum moves: these
 * numbers are part of the compiled AST shape, not of a public API.
 */
const NODE = {
    ELEMENT: 1,
    TEXT: 2,
    INTERPOLATION: 5,
    IF: 9,
    IF_BRANCH: 10,
    FOR: 11,
    TEXT_CALL: 12,
    VNODE_CALL: 13,
    JS_CALL_EXPRESSION: 14,
    JS_CONDITIONAL_EXPRESSION: 19,
    JS_CACHE_EXPRESSION: 20
}

/* A root vnode carrying one of these CANNOT receive automatic fallthrough. */
const BLOCKING = new Set(['FRAGMENT', 'TELEPORT', 'SLOT', 'TEXT', 'FOR'])

const symbolName = (value) => {
    const described = String(value)
    const match = /^Symbol\((.*)\)$/.exec(described)

    return match ? match[1] : described
}

/*
 * Resolve a codegen node to the SET of root kinds it can produce at runtime.
 * A root `v-if` chain contributes every branch, because a component is
 * defective as soon as ONE reachable branch is a fragment.
 */
export function rootKinds (node, out = new Set()) {
    if (!node) {
        out.add('NONE')

        return out
    }

    switch (node.type) {
        case NODE.VNODE_CALL: {
            const tag = node.tag

            if (typeof tag === 'symbol') {
                const name = symbolName(tag)

                // `Fragment` / `Teleport` block the merge. `Transition`,
                // `KeepAlive`, `Suspense` and friends are COMPONENTS — Vue
                // merges onto them happily and never warns.
                if (/Fragment/i.test(name)) out.add('FRAGMENT')
                else if (/Teleport/i.test(name)) out.add('TELEPORT')
                else out.add('COMPONENT')
            } else {
                out.add('ELEMENT')
            }

            return out
        }
        case NODE.JS_CALL_EXPRESSION: {
            const name = typeof node.callee === 'symbol' ? symbolName(node.callee) : String(node.callee)

            // `renderSlot()` returns a Fragment vnode, always.
            if (/renderSlot/i.test(name)) out.add('SLOT')
            // A `v-if` with no `v-else` renders a Comment when false, and Vue
            // EXCLUDES a Comment root from the warning (`root.type !== Comment`).
            else if (/createComment/i.test(name)) out.add('COMMENT')
            else if (/resolveDynamicComponent/i.test(name)) out.add('COMPONENT')
            else out.add('CALL:' + name)

            return out
        }
        case NODE.IF:
            if (node.codegenNode) return rootKinds(node.codegenNode, out)
            for (const branch of node.branches ?? []) rootKinds(branch, out)

            return out
        case NODE.IF_BRANCH:
            if (node.codegenNode) return rootKinds(node.codegenNode, out)
            for (const child of node.children ?? []) rootKinds(child.codegenNode ?? child, out)

            return out
        case NODE.JS_CONDITIONAL_EXPRESSION:
            rootKinds(node.consequent, out)
            rootKinds(node.alternate, out)

            return out
        case NODE.JS_CACHE_EXPRESSION:
            return rootKinds(node.value, out)
        case NODE.ELEMENT:
            return rootKinds(node.codegenNode, out)
        case NODE.FOR:
            // A `v-for` root is a Fragment block even for a single-item list.
            out.add('FRAGMENT')

            return out
        case NODE.TEXT:
        case NODE.INTERPOLATION:
        case NODE.TEXT_CALL:
            out.add('TEXT')

            return out
        default:
            out.add('NODE' + node.type)

            return out
    }
}

/**
 * Analyse one SFC source.
 *
 * @returns {{violates: boolean, kinds: Array<string>, blocking: Array<string>,
 *            declaresInheritAttrs: boolean, reason: string}}
 */
export function analyseSource (source, filename = 'anonymous.vue') {
    const empty = {
        violates: false,
        kinds: [],
        blocking: [],
        declaresInheritAttrs: false,
        reason: ''
    }

    let descriptor
    try {
        ({ descriptor } = parse(source, { filename }))
    } catch {
        return { ...empty, reason: 'sfc-parse-failed' }
    }

    if (!descriptor.template || !descriptor.template.content.trim()) {
        return { ...empty, reason: 'no-template' }
    }

    /*
     * `inheritAttrs` is looked for in the WHOLE source, not only inside a
     * `defineOptions({…})` call: a component may also declare it through a
     * plain `<script>` block's `export default`. Both are valid, and this
     * guard's question is only "is the option declared", not "how".
     */
    const declaresInheritAttrs = /\binheritAttrs\b/.test(source)

    let kinds
    try {
        const { ast, errors } = compileTemplate({
            source: descriptor.template.content,
            filename,
            id: filename
        })

        if (!ast || !ast.codegenNode || (errors && errors.length)) {
            return { ...empty, declaresInheritAttrs, reason: 'template-compile-failed' }
        }

        kinds = rootKinds(ast.codegenNode)
    } catch {
        // A template the compiler rejects is not this guard's business — the
        // build would fail long before anyone ran it.
        return { ...empty, declaresInheritAttrs, reason: 'template-compile-failed' }
    }

    const blocking = [...kinds].filter(kind => BLOCKING.has(kind))

    return {
        violates: blocking.length > 0 && !declaresInheritAttrs,
        kinds: [...kinds],
        blocking,
        declaresInheritAttrs,
        reason: blocking.length === 0 ? 'root-always-element-or-component' : ''
    }
}
