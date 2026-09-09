/**
 * Selftest for `function-as-value.mjs` — precision AND recall, pinned by
 * fixtures, plus a mutation check that replays the real #401 bug verbatim.
 *
 * A detector with no negative fixtures is a detector nobody can trust: the
 * first version of this one imported `dead-handlers`' loose
 * `collectLocalCallables` and reported 30 findings on the live catalogue, all
 * 30 of them `const { hasContent } = useProgress(props)` computed refs. The
 * NEGATIVE half of this file is what caught that, and what keeps it caught.
 *
 * Run: `node packages/ds/scripts/guards/lib/function-as-value.selftest.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyseSource, collectLocalFunctionLiterals } from './function-as-value.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SCRIPT = `
    import { computed } from 'vue'
    const props = defineProps()
    const hsva = (color) => ({ h: 0 })
    const background = (color) => 'rgb(0,0,0)'
    function isActive (color) { return true }
    const { hasContent } = useProgress(props)
    const items = computed(() => [])
    const label = computed(() => 'x')
`

function sfc (templateBody, scriptBody = SCRIPT) {
    return `<template>\n${templateBody}\n</template>\n\n<script lang="ts" setup>${scriptBody}</script>\n`
}

const POSITIVE = [
    {
        name: 'interpolation — a function stringified into the DOM',
        template: '<div>{{ hsva }}</div>',
        expect: 'interpolation:hsva'
    },
    {
        name: 'v-if root — a function object is unconditionally truthy',
        template: '<div v-if="isActive">x</div>',
        expect: 'condition-root:isActive'
    },
    {
        name: 'v-if operand of &&',
        template: '<div v-if="items && background">x</div>',
        expect: 'condition-operand:background'
    },
    {
        name: 'v-show negated',
        template: '<div v-show="!isActive">x</div>',
        expect: 'condition-negated:isActive'
    },
    {
        name: 'v-if ternary condition',
        template: '<div v-if="isActive ? 1 : 0">x</div>',
        expect: 'condition-ternary:isActive'
    },
    {
        name: 'comparison operand in a v-if',
        template: '<div v-if="label === hsva">x</div>',
        expect: 'comparison-operand:hsva'
    },
    {
        name: 'argument of a value-comparison helper (the #401 shape)',
        template: '<div v-if="label && deepEqual(label, hsva)">x</div>',
        expect: 'comparison-argument:deepEqual:hsva'
    },
    {
        name: 'script body — deepEqual(value, fn) one indirection away',
        template: '<div>x</div>',
        script: `${SCRIPT}\n const same = computed(() => deepEqual(label.value, hsva))`,
        expect: 'comparison-argument:deepEqual:hsva'
    }
]

const NEGATIVE = [
    {
        name: 'already invoked in an interpolation',
        template: '<div>{{ hsva(color) }}</div>'
    },
    {
        name: 'already invoked in a v-if',
        template: '<div v-if="isActive(color)">x</div>'
    },
    {
        name: 'a computed destructured from a composable — NOT a function literal',
        template: '<div v-if="hasContent">x</div>'
    },
    {
        name: 'a computed ref used as a condition',
        template: '<div v-if="items">x</div>'
    },
    {
        name: 'v-bind of a callback prop — legitimate, out of scope',
        template: '<origam-list :item-props="background"/>'
    },
    {
        name: 'v-on handler — owned by the dead-handlers guard',
        template: '<button @click="isActive">x</button>'
    },
    {
        name: 'callback argument to a non-comparison callee',
        template: '<div>{{ list.map(background) }}</div>'
    },
    {
        name: 'a name that is not declared in this component at all',
        template: '<div v-if="somethingElse">x</div>'
    },
    {
        name: 'plain text template, no expression',
        template: '<div>hello</div>'
    },
    {
        name: 'interpolation of a plain computed',
        template: '<div>{{ label }}</div>'
    }
]

let failures = 0

const check = (label, ok, detail = '') => {
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label}${ok ? '' : ` — ${detail}`}`)
    if (!ok) failures += 1
}

console.log('\ncollectLocalFunctionLiterals:')
{
    const names = collectLocalFunctionLiterals(SCRIPT)
    check('picks up arrow / function declarations',
        names.has('hsva') && names.has('background') && names.has('isActive'),
        [...names].join(', '))
    check('does NOT pick up destructured composable returns',
        !names.has('hasContent'), [...names].join(', '))
    check('does NOT pick up computed refs',
        !names.has('items') && !names.has('label'), [...names].join(', '))
}

console.log('\nPOSITIVE (must be flagged):')
for (const c of POSITIVE) {
    const { findings } = analyseSource(sfc(c.template, c.script ?? SCRIPT))
    const ids = findings.map(f => `${f.kind}:${f.name}`)
    check(c.name, ids.includes(c.expect), `got [${ids.join(', ') || 'nothing'}], wanted ${c.expect}`)
}

console.log('\nNEGATIVE (must NOT be flagged):')
for (const c of NEGATIVE) {
    const { findings } = analyseSource(sfc(c.template))
    const ids = findings.map(f => `${f.kind}:${f.name}`)
    check(c.name, findings.length === 0, `got [${ids.join(', ')}]`)
}

console.log('\nMUTATION CHECK (the real #401 bug, replayed from git):')
{
    const fixture = path.join(__dirname, '../fixtures/color-picker-swatches-401.vue.txt')
    let source = null
    try {
        source = readFileSync(fixture, 'utf8')
    } catch {
        check('fixture readable', false, `missing ${fixture}`)
    }
    if (source) {
        const { findings } = analyseSource(source, 'OrigamColorPickerSwatches.vue')
        const ids = findings.map(f => `${f.kind}:${f.name}`)
        check('OrigamColorPickerSwatches — v-if="colorHsv && deepEqual(colorHsv, hsva)"',
            ids.includes('comparison-argument:deepEqual:hsva'),
            `got [${ids.join(', ') || 'nothing'}]`)
    }
}

console.log('\nREGRESSION (the shipped catalogue must stay clean):')
{
    const { analyseCatalogue } = await import('./function-as-value.mjs')
    const rows = analyseCatalogue()
    const total = rows.reduce((n, r) => n + r.findings.length, 0)
    check(`${rows.length} components, 0 findings`, total === 0, `${total} finding(s)`)
}

const cases = 3 + POSITIVE.length + NEGATIVE.length + 2
if (failures) {
    console.log(`\nFAIL — ${failures} of ${cases} case(s) failed.\n`)
    process.exit(1)
}
console.log(`\nPASS — ${cases} cases, precision/recall pinned AND the real #401 bug is caught.\n`)
