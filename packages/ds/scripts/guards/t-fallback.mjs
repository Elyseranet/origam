/*********************************************************
 * Guard: t-fallback
 *
 * @description
 * `t(key, ...params)` passes every argument after the key as an
 * INTERPOLATION PARAMETER. It is not a fallback, and there is no fallback
 * overload. `t('origam.code.copy', 'Copy')` hands 'Copy' to the formatter
 * as `{0}`; the message carries no `{0}`, so it is dropped on the floor.
 * Nothing warns, and the author believes a safety net exists.
 * @description
 * 47 calls across 12 files did exactly this (issue #502). They were
 * harmless only by luck — every key still resolved. The day one is renamed,
 * `t()` returns the key and the raw `origam.code.copy` lands in the UI, at
 * precisely the spot the author thought was protected.
 * @description
 * ⛔ This guard resolves the MESSAGE before judging. A literal second
 * argument is legitimate whenever the message interpolates, and 11 calls in
 * this repo rely on that (`"Maximum {0} characters"`, `"QR code for
 * {value}"`…). Flagging on the argument's shape alone would condemn them
 * all — which is why the detector is pinned by precision fixtures in
 * packages/tests/TU/origam/t-fallback-scan.spec.ts.
 *
 * Usage: node packages/ds/scripts/guards/t-fallback.mjs
 ********************************************************/

import { scanTFallbacks } from './lib/t-fallback-scan.mjs'

const offenders = scanTFallbacks()
const line = '─'.repeat(74)

console.log(line)
console.log("Guard: t-fallback (le 2e argument de t() n'est PAS un repli)")
console.log(line)

if (!offenders.length) {
    console.log('PASS — 0 argument inerte passe a t().')
    console.log(line)
    process.exit(0)
}

console.log(`\nFAIL — ${offenders.length} appel(s) passent un litteral qui ne sera jamais lu :\n`)

for (const { file, key, literal, reason } of offenders) {
    console.log(`  ✗ ${file}`)
    console.log(`      t('${key}', '${literal}')   → ${reason}`)
}

console.log("\nLe 2e argument est un PARAMETRE d'interpolation, pas un repli :")
console.log("  t('origam.code.copy', 'Copy')  →  t('origam.code.copy')")
console.log('\nSi une interpolation etait bien voulue, le message doit porter un')
console.log("jeton ({0} ou {nom}) — ajoutez-le dans en.json plutot que l'argument.")
console.log(line)
process.exit(1)
