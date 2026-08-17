/**
 * Guard: `_props` feeds `useDefaults()` and nothing else.
 *
 * The convention, stated by the repo owner during the 2026-08 review:
 *
 *     "on n'est pas censé utiliser `_props` — il n'y a que `useDefaults` qui
 *      l'utilise. Le reste doit utiliser `props`, donc après le passage
 *      dans `useDefaults`."
 *
 * WHY IT MATTERS, and why the reason is NOT the one you would guess.
 *
 * `_props` is the raw object `withDefaults(defineProps<T>(), {…})` returns.
 * `props` is what `useDefaults(_props)` returns — the same surface, merged
 * with the theme's `components` block and with any `<OrigamDefaultsProvider>`
 * in scope.
 *
 * Since ADR-005 both objects usually agree: the theme-props resolver patches
 * the accessor directly onto `instance.props`, which is what `_props` points
 * at. So reading `_props.x` is *usually* harmless — and that is exactly the
 * trap. It works until someone adds a defaults path the resolver does not
 * intercept, and then a single stray `_props.x` diverges silently from every
 * other read of the same prop. No error, no warning, no red test: the
 * component simply renders one value while asserting another.
 *
 * A real instance of this was found on 2026-08-17: `OrigamAlert` read
 * `_props.status` in a computed while its template read the resolved value,
 * guarded by a ten-line comment explaining the divergence. The comment had
 * become false — the divergence was no longer possible — but the pattern it
 * documented was the one this guard now forbids outright.
 *
 * WHAT IS ALLOWED
 *
 *   const _props = withDefaults(defineProps<IXxxProps>(), { … })   // declaration
 *   const props  = useDefaults(_props)                             // the ONE consumer
 *
 * Anything else that mentions `_props` is a violation, including the
 * seemingly innocent `const props = _props` — which announces the convention
 * without applying it. `OrigamKbd` shipped that alias and therefore never
 * merged theme defaults at all.
 *
 * NO BASELINE. The catalogue is at zero violations and must stay there; a
 * baseline here would let the next one in silently, which is the failure mode
 * this whole guard family exists to prevent.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents, DS_ROOT as LIB_DS_ROOT } from './lib/components.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = LIB_DS_ROOT

/** The declaration site. */
const DECLARATION = /const\s+_props\s*=\s*withDefaults\s*\(/
/** The single legitimate consumer. */
const LEGITIMATE_CONSUMER = /useDefaults\s*\(\s*_props\s*\)/

const violations = []

for (const { file } of getRealComponents()) {
    const source = readFileSync(file, 'utf8')
    if (!source.includes('_props')) continue

    const relative = path.relative(DS_ROOT, file)

    source.split('\n').forEach((line, index) => {
        if (!line.includes('_props')) return

        // Comments may name `_props` freely — they explain, they do not read.
        const trimmed = line.trim()
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return

        if (DECLARATION.test(line) || LEGITIMATE_CONSUMER.test(line)) return

        violations.push({ file: relative, line: index + 1, source: trimmed })
    })
}

const HEADER = 'Guard: raw-props-usage — `_props` may only feed useDefaults()'
console.log('─'.repeat(70))
console.log(HEADER)
console.log('─'.repeat(70))

if (violations.length === 0) {
    console.log('PASS — 0 violation(s).')
    process.exit(0)
}

for (const violation of violations) {
    console.log(`  ${violation.file}:${violation.line}`)
    console.log(`      ${violation.source}`)
}
console.log('')
console.log(`FAIL — ${violations.length} raw \`_props\` read(s) outside useDefaults().`)
console.log('  Read `props` instead — the value AFTER theme and provider defaults.')
process.exit(1)
