/**
 * Self-test for `inherit-attrs-fragment-root.mjs`.
 *
 * Four things are pinned, per the repo's convention (see
 * `class-fallthrough.selftest.mjs` / `id-forwarding.selftest.mjs`):
 *
 *   1. RECALL — every `MUST_FLAG` fixture genuinely produces a root vnode Vue
 *      cannot merge attributes onto, and declares no `inheritAttrs`.
 *   2. PRECISION — every `MUST_NOT_FLAG` fixture is correct or out of scope.
 *      ⛔ THE ONES THAT MATTER MOST are the `<template v-if>` /
 *      `<template v-else>` pairs whose every branch renders a SINGLE element.
 *      A tag-counting detector reads those as two root nodes and flags them;
 *      at runtime they render one node, the fallthrough works, and there is no
 *      defect. #916's own survey made exactly that mistake on 4 of its 15
 *      candidates — `OrigamChart`, `OrigamNumberField`, `OrigamSliderField`
 *      and `OrigamSwitch`, all four measured silent. A guard reproducing that
 *      error would send someone to "fix" four healthy components, and
 *      `inheritAttrs: false` on a single-element root SILENTLY DROPS every
 *      consumer attribute — it would manufacture the #492 defect four times.
 *   3. MUTATION CHECK — the real shapes found under #916, reproduced, each
 *      asserted to turn the detector red. A guard that misses the bug it was
 *      written for catches nothing.
 *   4. BLINDNESS CHECK — the detector must not answer "clean" when it has in
 *      fact failed to analyse. A template the compiler rejects, and a file
 *      with no template at all, are asserted to report their reason rather
 *      than a bare `violates: false`.
 *
 * Run: node packages/ds/scripts/guards/lib/inherit-attrs-fragment-root.selftest.mjs
 */

import { fileURLToPath } from 'node:url'

import { analyseSource } from './inherit-attrs-fragment-root.mjs'

const wrap = (template, script = '') => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG — a reachable root branch is a fragment / teleport / text
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    ['two peer elements at the root', wrap('<div class="a"/>\n<div class="b"/>')],
    ['a `<teleport>` as the single root — the OrigamCommandPalette / Drawer / SnackbarGroup shape', wrap(
        '<teleport to="body">\n<div :class="rootClasses"/>\n</teleport>'
    )],
    ['a bare `<slot/>` root — the OrigamDefaultsProvider shape', wrap('<slot name="default"/>')],
    ['`<template v-if>` slot vs `<template v-else>` slot — the OrigamClientOnly shape', wrap(
        '<template v-if="isMounted">\n<slot/>\n</template>\n<template v-else>\n<slot name="fallback"/>\n</template>'
    )],
    ['three peer `<g>` groups — the OrigamChartAxis shape', wrap(
        '<g v-if="showGrid"/>\n<g v-if="showAxis"/>\n<g v-if="secondary"/>'
    )],
    ['a `v-for` root — the OrigamDataTableHeadersCell shape', wrap(
        '<template v-for="(row, y) in headers" :key="y">\n<tr :id="y"/>\n</template>'
    )],
    ['MIXED: slot branch + element branch — the OrigamSkeleton shape', wrap(
        '<template v-if="!loading">\n<slot/>\n</template>\n<div v-else :class="c"/>'
    )],
    ['MIXED: fragment branch + element branch — the OrigamVirtualScroll shape', wrap(
        '<template v-if="renderless">\n<div class="spacer"/>\n<template v-for="i in items" :key="i"><span/></template>\n<div class="spacer"/>\n</template>\n<template v-else>\n<div :class="c"/>\n</template>'
    )],
    ['an outer `<template v-if>` wrapping a nested v-if chain — the OrigamDataTableRows loader branch', wrap(
        '<template v-if="loading">\n<template v-if="skeleton">\n<tr v-for="r in 3" :key="r"/>\n</template>\n<template v-else>\n<tr key="loading"/>\n</template>\n</template>\n<template v-else>\n<tr key="no-data"/>\n</template>'
    )],
    ['a text root', wrap('{{ label }}')],
    ['forwarding $attrs by hand does NOT excuse the missing flag — the OrigamOverlay / #853 shape', wrap(
        '<slot name="activator"/>\n<template v-if="isMounted">\n<teleport to="body">\n<div v-bind="$attrs"/>\n</teleport>\n</template>'
    )],
    ['useAttrs() does not silence Vue either — the OrigamVirtualScrollItem shape', wrap(
        '<template v-if="renderless">\n<slot name="renderless"/>\n</template>\n<template v-else>\n<div v-bind="{ ...attrs }"/>\n</template>',
        'const attrs = useAttrs()'
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG — correct, or the root is always a single element/component
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    ['a single element root', wrap('<div :class="rootClasses"/>')],
    ['a single component root', wrap('<origam-btn :variant="variant"/>')],
    ['a `<component :is>` root', wrap('<component :is="tag" :class="c"/>')],
    /*
     * ⛔ THE FOUR NEGATIVE CONTROLS THAT DEFINE THIS GUARD.
     * Each reads as 2+ nodes when you count tags at depth 0, and each renders
     * exactly ONE node. These reproduce the four false positives of #916's
     * table; all four were measured to emit zero warnings at runtime.
     */
    ['v-if / v-else, both a single element — the OrigamSwitch shape', wrap(
        '<div v-if="inset" :class="c"/>\n<div v-else :class="c"/>'
    )],
    ['v-if / v-else-if / v-else, all single elements — the OrigamChart shape', wrap(
        '<origam-chart-cartesian v-if="isCartesian"/>\n<origam-chart-polar v-else-if="isPolar"/>\n<origam-chart-radar v-else/>'
    )],
    ['v-if / v-else on the same component — the OrigamNumberField shape', wrap(
        '<origam-input v-if="stacked" :model-value="v"/>\n<origam-input v-else :model-value="v"/>'
    )],
    ['a long single-element v-if chain — the OrigamSliderField shape', wrap(
        '<origam-input v-if="a"/>\n<origam-input v-else-if="b"/>\n<origam-input v-else-if="c"/>\n<origam-input v-else/>'
    )],
    /* A `v-if` with NO `v-else` renders a Comment when false, and Vue's own
     * check excludes a Comment root (`root.type !== Comment`). */
    ['a lone v-if with no else — false branch is a Comment, which Vue excludes', wrap(
        '<div v-if="isActive" :class="c"/>'
    )],
    ['a `<transition>` root — Transition is a COMPONENT, Vue merges onto it', wrap(
        '<transition name="fade">\n<div v-if="show"/>\n</transition>'
    )],
    /* Declared -> out of scope, whatever the root shape is. */
    ['a fragment root that DOES declare the flag', wrap(
        '<div class="a"/>\n<div class="b"/>',
        'defineOptions({ inheritAttrs: false })'
    )],
    ['a teleport root that declares the flag alongside a name', wrap(
        '<teleport to="body"><div v-bind="$attrs"/></teleport>',
        'defineOptions({\n\tname: \'OrigamThing\',\n\tinheritAttrs: false\n})'
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// BLINDNESS CHECK — the detector must say WHY it found nothing
// ─────────────────────────────────────────────────────────────────────────
const MUST_REPORT_REASON = [
    ['no template block at all', '<script setup lang="ts">\nconst a = 1\n</script>\n', 'no-template'],
    ['an empty template block', wrap('   '), 'no-template'],
    ['a template the compiler rejects', wrap('<div v-for>'), 'template-compile-failed']
]

export function runFixtures ({ silent = false } = {}) {
    let failures = 0
    let total = 0
    const log = (...args) => { if (!silent) console.log(...args) }

    log('MUST FLAG — a reachable root branch blocks the attrs merge')
    for (const [label, source] of MUST_FLAG) {
        total++
        const { violates, blocking } = analyseSource(source, 'fixture.vue')
        const ok = violates === true
        if (!ok) failures++
        log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${ok ? ` [${blocking.join(',')}]` : ''}`)
    }

    log('\nMUST NOT FLAG — single-element roots, and already-declared components')
    for (const [label, source] of MUST_NOT_FLAG) {
        total++
        const { violates, kinds } = analyseSource(source, 'fixture.vue')
        const ok = violates === false
        if (!ok) failures++
        log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${ok ? '' : ` [flagged as ${kinds.join(',')}]`}`)
    }

    log('\nBLINDNESS CHECK — a non-analysis must name itself, not read as clean')
    for (const [label, source, expected] of MUST_REPORT_REASON) {
        total++
        const { violates, reason } = analyseSource(source, 'fixture.vue')
        const ok = violates === false && reason === expected
        if (!ok) failures++
        log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label} -> expected reason "${expected}", got "${reason}"`)
    }

    log(`\n${total - failures}/${total} fixtures passent.`)

    return { failures, total }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { failures } = runFixtures()
    process.exit(failures ? 1 : 0)
}
