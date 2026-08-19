/**
 * Guard: no component calls `useDefaults()`.
 *
 * WHY
 *
 * Since ADR-005, `createOrigam()` installs a global mixin whose `beforeCreate`
 * writes resolved values straight into `instance.props` — the object the
 * compiled `<script setup>` template reads — for every prop any REGISTERED
 * theme or `<OrigamDefaultsProvider>` names. Theming arrives through that
 * mechanism for all 217 components at once, whether or not a component opts
 * into anything. `useDefaults(_props)` therefore buys nothing a component does
 * not already have.
 *
 * It is not free. Per mount it does `Object.keys(props)`, builds one
 * `computed()` closure per declared prop name, and wraps the result in a
 * `Proxy`. Measured under issue #363 with a paired interleaved protocol
 * (coin-flip order within each pair, median of the per-pair deltas, negative
 * control at +0.10 %): roughly +0.07 ms per mount on Btn, Card and Chip, on a
 * realistic base that includes the plugin a real app installs.
 *
 * The 40 calls were removed in one campaign. This guard is what stops the
 * forty-first from arriving, because nothing about re-adding one looks wrong:
 * it type-checks, every test stays green, and the component keeps working.
 * The only symptom is a mount that costs more than it needs to.
 *
 * WHAT IS STILL ALLOWED
 *
 * The `useDefaults` composable itself stays exported, and so does
 * `provideDefaults` beside it — `<OrigamDefaultsProvider>` is a public
 * component built on the latter. This guard constrains the 217 components
 * under `src/components/`, not the composable they used to call.
 *
 * DETECTION
 *
 * Delegated to `lib/setup-reads.mjs`, the AST analyser already pinned by 20
 * fixtures in `setup-reads.selftest.mjs`. Its `callsUseDefaults` flag keys off
 * the call EXPRESSION, so prose naming `useDefaults` in a comment — which
 * several components still legitimately do — is not a violation. A regex over
 * source lines would have flagged those; that mistake is what produced the
 * "45 callers" figure the issue opened with, when the real count was 40.
 * `no-usedefaults-in-components.selftest.mjs` measures that distinction
 * directly rather than asserting it.
 *
 * NO BASELINE. The catalogue is at zero and must stay there. A baseline here
 * would let the next call in silently, which is the whole failure mode this
 * guard exists to prevent — the same reasoning as `raw-props-usage`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getRealComponents, DS_ROOT } from './lib/components.mjs'
import { analyseSource } from './lib/setup-reads.mjs'

export function findViolations () {
    const violations = []
    for (const { pascalName, file } of getRealComponents()) {
        const source = readFileSync(file, 'utf8')
        if (!source.includes('useDefaults')) continue
        const { callsUseDefaults, resolvedPropsVar } = analyseSource(source, path.basename(file))
        if (!callsUseDefaults) continue
        violations.push({
            component: pascalName,
            file: path.relative(DS_ROOT, file),
            binding: resolvedPropsVar
        })
    }
    return violations
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const violations = findViolations()

    const HEADER = 'Guard: no-usedefaults-in-components — theming arrives via the resolver, not via a per-mount Proxy'
    console.log('─'.repeat(70))
    console.log(HEADER)
    console.log('─'.repeat(70))

    if (violations.length === 0) {
        console.log('PASS — 0 violation(s).')
        process.exit(0)
    }

    for (const v of violations) {
        console.log(`  ${v.file}`)
        console.log(`      const ${v.binding} = useDefaults(…)`)
    }
    console.log('')
    console.log(`FAIL — ${violations.length} component(s) call useDefaults().`)
    console.log('  Delete the call and read `props` directly. The ADR-005 resolver already')
    console.log('  merges theme and provider defaults into `instance.props`.')
    console.log('  ⚠️ Check first that no prop is read EAGERLY in the setup() body: those')
    console.log('     reads run before the resolver writes. `lib/setup-reads.mjs` lists them.')
    process.exit(1)
}
