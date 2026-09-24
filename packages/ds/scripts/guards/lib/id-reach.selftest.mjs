/**
 * Self-test for the `id-reach` half of guard 15 (`id-forwarding`).
 *
 * Same disposition as `class-fallthrough.selftest.mjs` (#620): the fixtures
 * run BEFORE the catalogue sweep, from inside the guard, so the nominal
 * state cannot be confused with a silent failure. That matters more here
 * than almost anywhere else — `baseline/id-forwarding.json` held ZERO
 * entries for months, and a zero-entry baseline plus a blind detector prints
 * exactly the same `PASS` as a healthy catalogue. #575 (an a11y gate green
 * for sixteen months while visiting 0 of 208 stories) and #567 (a self-test
 * present, never executed) are the same shape.
 *
 * Four things are pinned:
 *
 *   1. RECALL — every `MUST_FLAG` fixture genuinely drops the consumer's
 *      `id`: the prop is declared, and no channel carries its value to a
 *      rendered node.
 *   2. PRECISION — every `MUST_NOT_FLAG` fixture is a correct or
 *      out-of-scope shape. Several of these are not hypothetical: each one
 *      is a shape the detector got WRONG at some point during construction,
 *      measured against the runtime sweep, and each fix is recorded next to
 *      its fixture.
 *   3. TEXTUAL TRAPS — `props.id` written in a comment or inside a string
 *      must not credit anything. A `grep`-shaped detector passes these and
 *      would have declared `OrigamConfirmWrapper` healthy.
 *   4. MUTATION CHECK — three real components, source reproduced from the
 *      repository: `OrigamConfirmWrapper` PRE-#632 (the case that revealed
 *      the blind spot), and `OrigamInput` + `OrigamSnackbarGroup` as they
 *      stand today. A guard that does not catch the bug it was written for
 *      catches nothing.
 *
 * Run: node packages/ds/scripts/guards/lib/id-reach.selftest.mjs
 */

import { fileURLToPath } from 'node:url'

import { analyseIdReach } from './id-reach.mjs'

const wrap = (template, script) => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG — the consumer id reaches nothing
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    ['root binds no id at all — the ConfirmWrapper shape', wrap(
        `<div :class="rootClasses" :style="rootStyles"></div>`,
        `const props = defineProps<IXxxProps>()\nconst rootClasses = computed(() => [])`
    )],
    ['id read into a computed, computed never bound', wrap(
        `<div :class="rootClasses"></div>`,
        `const id = computed(() => props.id || \`origam-xxx-\${uid}\`)\nconst rootClasses = computed(() => [])`
    )],
    ['only a DERIVED id reaches the DOM — the SnackbarGroup shape', wrap(
        `<div :id="resolvedDomId"></div>`,
        `const resolvedDomId = computed(() => \`origam-xxx-\${props.id}\`)`
    )],
    ['derived id on a descendant, root bare — the exact ConfirmWrapper pre-fix shape', wrap(
        `<div :class="rootClasses">\n<origam-messages :id="messagesId" />\n</div>`,
        `const id = computed(() => props.id || \`origam-confirm-wrapper-\${uid}\`)\nconst messagesId = computed(() => \`\${id.value}-messages\`)\nconst rootClasses = computed(() => [])`
    )],
    ['filterProps EXCLUDING id, and nothing else carries it', wrap(
        `<origam-label v-bind="labelProps"></origam-label>`,
        `const labelProps = computed(() => ref.value?.filterProps(props, ['class', 'style', 'id', 'tag']))`
    )],
    ['bare filterProps(props) — the default exclusion list already drops id', wrap(
        `<origam-label v-bind="labelProps"></origam-label>`,
        `const labelProps = computed(() => ref.value?.filterProps(props))`
    )],
    ['a sibling named idAttr is not id', wrap(
        `<div :id="idAttr"></div>`,
        `const idAttr = computed(() => \`prefix-\${props.id}\`)`
    )],
    /*
     * ⛔ A SCOPED SLOT IS NOT A DOM NODE. `<slot v-bind="inputProps">`
     * publishes the id to the CONSUMER's template; it puts nothing on any
     * element of this component. Counting it made `OrigamInput` read
     * healthy while its own root carried the GENERATED id.
     */
    ['id published through <slot v-bind> while the root carries the generated id', wrap(
        `<div :id="styleId">\n<slot name="default" v-bind="inputProps" />\n</div>`,
        `const id = computed(() => props.id || \`input-\${uid}\`)\nconst inputProps = computed(() => ({ id: id.value }))\nconst {id: styleId, css} = useStyle(inputStyles)`
    )],
    /*
     * `useStyle(styles)` with ONE argument returns a generated identifier,
     * never the consumer's. Renaming the destructure avoids the collision
     * guard 15 flags — it does not make the root carry the consumer id.
     */
    ['root binds the useStyle id from a ONE-argument call', wrap(
        `<div :id="styleId"></div>`,
        `const {id: styleId, css} = useStyle(xxxStyles)`
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG — correct, or undecidable and therefore left alone
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    /*
     * ⛔ THE SHAPE 55 COMPONENTS USE. A bare `id` in the template with NO
     * setup binding of that name resolves to the PROP — Vue's compiled
     * render function falls back to props for an unqualified identifier.
     * Seeding the chain without this rule flagged 47 correct components
     * against a runtime ground truth of zero.
     */
    ['bare :id="id" with no setup binding of that name', wrap(
        `<component :is="tag" :id="id"></component>`,
        `const props = withDefaults(defineProps<ITitleProps>(), {tag: 'h2'})\nconst {id: styleId} = useStyle(titleStyles, () => props.id)`
    )],
    ['explicit :id="props.id"', wrap(
        `<div :id="props.id"></div>`,
        `const props = defineProps<IXxxProps>()`
    )],
    /*
     * The DS's ubiquitous fallback idiom. The template literal is in the
     * FALLBACK branch, not around the id — blanking template literals still
     * leaves `props.id ||`, so it is a pass-through, not a derivative.
     */
    ['local computed: props.id || generated fallback', wrap(
        `<div :id="id"></div>`,
        `const id = computed(() => props.id || \`origam-xxx-\${uid}\`)`
    )],
    ['a second hop: name = props.name || id.value', wrap(
        `<div :id="name"></div>`,
        `const id = computed(() => props.id || \`origam-scg-\${uid}\`)\nconst name = computed(() => props.name || id.value)`
    )],
    /*
     * The CORRECT `useStyle` shape post-#381: the second argument is what
     * makes the consumer id win, so the destructured name — renamed or not —
     * carries it.
     */
    ['useStyle(styles, () => props.id) destructured as {id: styleId}', wrap(
        `<div :id="styleId"></div>`,
        `const {id: styleId, css} = useStyle(xxxStyles, () => props.id)`
    )],
    ['id placed on a DESCENDANT on purpose — a field feeding <label for>', wrap(
        `<div :class="rootClasses">\n<input :id="id" />\n</div>`,
        `const id = computed(() => props.id || \`origam-input-\${uid}\`)\nconst rootClasses = computed(() => [])`
    )],
    /*
     * Measured: `OrigamChart` forwards through TWO hops of object spread and
     * only the innermost object writes `id: props.id`. One level of
     * indirection was enough to falsely flag all 21 Chart families.
     */
    ['object forwarding through one spread hop — the Chart shape', wrap(
        `<origam-chart-cartesian v-bind="cartesianProps"></origam-chart-cartesian>`,
        `const surfaceProps = computed(() => ({ id: props.id, class: props.class }))\nconst cartesianProps = computed(() => ({ ...surfaceProps.value, type: props.type }))`
    )],
    ['v-bind="props" on the root', wrap(
        `<div v-bind="props"></div>`,
        `const props = defineProps<IXxxProps>()`
    )],
    ['v-bind="$attrs"', wrap(
        `<div v-bind="$attrs"></div>`,
        `const props = defineProps<IXxxProps>()`
    )],
    ['filterProps whose exclusion list KEEPS id', wrap(
        `<origam-input v-bind="inputProps"></origam-input>`,
        `const inputProps = computed(() => ref.value?.filterProps(props, ['class', 'style']))`
    )],
    /*
     * ⛔ UNDECIDABLE, DELIBERATELY SILENT. `OrigamLayout` binds an id that
     * comes out of a composable handed the whole props object. Deciding
     * would mean following the composable — the blast radius
     * `unconsumed-props` refused for the same reason. The guard's bias: a
     * false positive blocks an innocent PR, a false negative only fails to
     * catch some debt.
     */
    ['an id whose provenance is a props-consuming composable', wrap(
        `<div :id="layoutId"></div>`,
        `const {layoutClasses, layoutId} = useCreateLayout(props)`
    )],
    /*
     * ⛔ SCOPE. A `const id` inside a handler is NOT a setup binding and must
     * not shadow the prop in the template. `OrigamMasonry` and
     * `OrigamCommandPalette` both do this; a lexical scan called both
     * defective.
     */
    ['a const id declared inside a function body does not shadow the prop', wrap(
        `<div :id="id"></div>`,
        `function schedule () {\n  const id = window.requestAnimationFrame(() => {})\n  frames.add(id)\n}`
    )],
    ['...props spread into a bound object', wrap(
        `<div v-bind="merged"></div>`,
        `const merged = computed(() => ({ ...props, extra: 1 }))`
    )]
]

// `id` NOT declared by the interface — Vue's automatic fallthrough puts the
// attribute on the root by itself. Out of scope whatever the file contains.
const NOT_DECLARED = wrap(
    `<div :class="rootClasses"></div>`,
    `const rootClasses = computed(() => [])`
)

// ⛔ NEGATIVE CONTROLS — a purely textual detector gets these wrong. They
// must be FLAGGED: the token is in the file, but nothing reads it.
const TEXTUAL_TRAPS = [
    ['props.id named only in a line comment', wrap(
        `<div :class="rootClasses"></div>`,
        `// TODO: binder :id="props.id" sur la racine\nconst rootClasses = computed(() => [])`
    )],
    ['props.id named only in a block comment', wrap(
        `<div :class="rootClasses"></div>`,
        `/* la racine devrait porter props.id */\nconst rootClasses = computed(() => [])`
    )],
    ['props.id inside a string literal', wrap(
        `<div :class="rootClasses"></div>`,
        `const hint = 'ajouter props.id ici'\nconst rootClasses = computed(() => [])`
    )]
]

// ─────────────────────────────────────────────────────────────────────────
// MUTATION CHECK — the three real components
// ─────────────────────────────────────────────────────────────────────────
const REAL_BUGS = [
    /*
     * `OrigamConfirmWrapper` before 21cb0792 (#632). The commit message says
     * it plainly: "Le garde id-forwarding ne detecte pas ce cas (racine qui
     * n'a AUCUN :id […]) — signale comme angle mort d'outil". This fixture
     * is that report turned into a failing witness.
     */
    ['OrigamConfirmWrapper (pre-#632)', wrap(
        `<div :class="confirmWrapperClasses" :style="confirmWrapperStyles">
<slot name="messages" v-bind="{hasMessages, messages, messagesId}">
<origam-messages :id="messagesId" :messages="messages" />
</slot>
</div>`,
        `const labelProps = computed(() => origamLabelRef.value?.filterProps(props, ['class', 'style', 'id', 'tag']))
const uid = getUid()
const id = computed(() => {
    return props.id || \`origam-confirm-wrapper-\${uid}\`
})
const messagesId = computed(() => {
    return \`\${id.value}-messages\`
})
const {id: styleId, css, load} = useStyle(confirmWrapperStyles)`
    )],
    /*
     * `OrigamSnackbarGroup`, as it stands on develop today. Measured by
     * mounting it with `id="origam-audit-sentinel-id"`: the only id in the
     * rendered tree is `origam-snackbar-group-origam-audit-sentinel-id`.
     * `document.getElementById('origam-audit-sentinel-id')` returns null.
     * The runtime companion scores it "descendant" (healthy) because its
     * test is `html.includes(SENTINEL)` — a SUBSTRING match, which a
     * derivative satisfies. Reported, deliberately not fixed here.
     */
    /*
     * `OrigamInput`, as it stands on develop today. Root binds
     * `:id="styleId"` from a ONE-argument `useStyle(inputStyles)`, so the
     * root wears `origam-input-v-0`; the consumer's id only ever appears
     * inside `…-messages` and in a scoped-slot payload. Measured by
     * mounting with `id="origam-audit-sentinel-id"`: rendered ids are
     * `origam-input-v-0 | origam-input-v-0 | origam-audit-sentinel-id-messages`.
     * Guard 15 stays silent because the destructure is RENAMED, a shape its
     * own header lists as "the correct pattern". Reported, not fixed here.
     *
     * ⚠️ #790 — ET C'EST CORRECT AINSI, ce n'est pas un defaut a corriger.
     * Le montage ci-dessus n'a PAS de slot `#default`. Remonte AVEC un slot,
     * comme tout champ du DS l'utilise, `slotProps.id === 'mon-champ'` et le
     * `<input>` rendu porte `id="mon-champ"` en valeur EXACTE. Le decalage
     * est voulu (#421) : la racine ne doit pas peindre la meme valeur que le
     * controle, sinon deux noeuds partagent un id et le pairage `label[for]`
     * casse. Cette fixture pin donc la FORME que le detecteur doit voir, pas
     * un bug produit.
     */
    ['OrigamInput (current develop)', wrap(
        `<div :id="styleId" :class="inputClasses">
<div :class="inputControlClasses">
<slot name="default" v-bind="inputProps" />
</div>
<origam-messages :id="messagesId" :messages="messages" />
</div>`,
        `const id = computed(() => props.id || \`input-\${uid}\`)
const messagesId = computed(() => \`\${id.value}-messages\`)
const inputProps = computed(() => {
    return { id: id.value, messagesId: messagesId.value }
})
const {id: styleId, css, load, isLoaded, unload} = useStyle(inputStyles)`
    )],
    ['OrigamSnackbarGroup (current develop)', wrap(
        `<teleport to="body">
<component :is="tag" :id="resolvedDomId" :class="stackClasses" role="region">
<transition-group :name="transitionName" tag="div">
<origam-snackbar-item v-for="item in visibleItems" :key="item.id" :message="item.message" />
</transition-group>
</component>
</teleport>`,
        `const { rawItems } = useSnackbarGroupInternal(() => props.id)
const resolvedDomId = computed(() => \`origam-snackbar-group-\${props.id}\`)`
    )]
]

/**
 * Runs every fixture. Called by the GUARD ITSELF before it sweeps the
 * catalogue, so these fixtures sit on the blocking path rather than being
 * decorative.
 */
export function runFixtures ({ silent = false } = {}) {
    const log = silent ? () => {} : (m) => console.log(m)
    let failures = 0
    const fail = (msg) => {
        failures++
        console.log(`  FAIL  ${msg}`)
    }

    log('MUST FLAG (the consumer id reaches nothing):')
    for (const [label, source] of MUST_FLAG) {
        const { violates, evidence } = analyseIdReach(source, true)
        if (!violates) fail(`${label} — expected a violation, got none (evidence: ${evidence})`)
        else log(`  ok    ${label}`)
    }

    log('\nMUST NOT FLAG (correct, or undecidable and left alone):')
    for (const [label, source] of MUST_NOT_FLAG) {
        const { violates, detail } = analyseIdReach(source, true)
        if (violates) fail(`${label} — falsely flagged (${detail})`)
        else log(`  ok    ${label}`)
    }

    log('\nOUT OF SCOPE (interface does not declare id):')
    {
        const { violates } = analyseIdReach(NOT_DECLARED, false)
        if (violates) fail('id not declared — must never be flagged')
        else log('  ok    id not declared -> silent')
    }

    log('\nNEGATIVE CONTROLS (a textual detector would get these wrong):')
    for (const [label, source] of TEXTUAL_TRAPS) {
        const { violates } = analyseIdReach(source, true)
        if (!violates) fail(`${label} — NOT flagged: the detector is reading text, not code`)
        else log(`  ok    ${label}`)
    }

    log('\nMUTATION CHECK (the three real components):')
    for (const [label, source] of REAL_BUGS) {
        const { violates } = analyseIdReach(source, true)
        if (!violates) fail(`${label} — NOT CAUGHT (the guard would have missed the real bug)`)
        else log(`  ok    ${label}`)
    }

    const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1 + TEXTUAL_TRAPS.length + REAL_BUGS.length
    return { failures, total }
}

/* CLI — ignoree lorsque le module est importe par le garde */
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    const { failures, total } = runFixtures()
    console.log('')
    if (failures) {
        console.log(`FAIL — ${failures}/${total} self-test case(s) failed.`)
        process.exit(1)
    }
    /*
     * ⚠️ « the three real bugs » se lisait ici. #790 a remonte les trois au
     * montage : une seule l'etait (OtpInputField, depuis corrigee). Les deux
     * fixtures « current develop » restantes pinnent la FORME que le
     * detecteur doit reconnaitre — pas un defaut produit. Voir l'en-tete de
     * `guards/id-forwarding.mjs` pour la mesure de chacune.
     */
    console.log(`PASS — ${total} cases: precision, recall, the textual traps, and the shapes the detector must still recognise.`)
}
