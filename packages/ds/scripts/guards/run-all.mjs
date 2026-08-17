#!/usr/bin/env node
/**
 * Runs every architecture guard and reports a combined summary. Each guard
 * is a standalone script (`node scripts/guards/{guard}.mjs`) — this file
 * only sequences them so CI and local runs get one exit code and one
 * legible summary instead of four separate invocations.
 *
 * See packages/ds/scripts/guards/README.md for what each guard checks, how
 * to read a failure, and how to retire a baseline entry once fixed.
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GUARDS = [
    'no-declarations-in-vue.mjs',
    'no-variant-css.mjs',
    'instance-types.mjs',
    'file-naming.mjs',
    'unconsumed-props.mjs',
    'raw-props-usage.mjs'
]

let failed = 0
const started = Date.now()

for (const guard of GUARDS) {
    try {
        execFileSync('node', [path.join(__dirname, guard)], { stdio: 'inherit' })
    } catch {
        failed++
    }
}

const elapsedMs = Date.now() - started
console.log(`\n${GUARDS.length - failed}/${GUARDS.length} guards passed in ${(elapsedMs / 1000).toFixed(1)}s.`)

process.exit(failed > 0 ? 1 : 0)
