#!/usr/bin/env node
/**
 * run-inert-props-audit.mjs — drives the full inert-prop sweep.
 *
 * WHY A RUNNER AND NOT ONE VITEST RUN
 * -----------------------------------
 * Probing every prop in one process means ~10 000 component mounts. jsdom
 * keeps each mounted tree (and each <style> node `useStyle` appends)
 * reachable for long enough that V8 dies with `Reached heap limit` — measured,
 * at 8 GB, twice. Sharding inside the spec does not help: same process, same
 * heap. So the shards run as SEPARATE vitest processes and their JSON
 * reports are merged here.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:inert-props
 *   pnpm -F @origam/tests audit:inert-props -- --json /tmp/report.json
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = join(HERE, '..')

/** Each shard is one vitest process. Keep them under ~12 props. */
const SHARDS = [
    ['margin', 'padding', 'rounded', 'border', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'marginBlock', 'marginInline', 'paddingTop', 'paddingRight'],
    ['paddingBottom', 'paddingLeft', 'paddingBlock', 'paddingInline', 'roundedTopLeft', 'roundedTopRight', 'roundedBottomLeft', 'roundedBottomRight', 'borderBlock', 'borderInline', 'borderColor', 'borderStyle'],
    ['borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'elevation', 'color', 'bgColor', 'density'],
    ['height', 'maxHeight', 'minHeight', 'width', 'maxWidth', 'minWidth', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
    ['top', 'bottom', 'left', 'right', 'activeClass', 'loadingText', 'tag', 'id', 'appendIcon', 'prependIcon', 'appendAvatar', 'prependAvatar']
]

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

const tmp = mkdtempSync(join(tmpdir(), 'origam-inert-'))
const rows = []

try {
    for (const [i, props] of SHARDS.entries()) {
        const report = join(tmp, `shard-${i}.json`)
        process.stdout.write(`shard ${i + 1}/${SHARDS.length} (${props.length} props) … `)
        execFileSync(
            'npx',
            ['vitest', '--run', '--config=vitest.audit.config.ts', 'audit/inert-props-sweep.spec.ts'],
            {
                cwd: PKG,
                stdio: ['ignore', 'ignore', 'inherit'],
                env: {
                    ...process.env,
                    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=8192`.trim(),
                    SWEEP_PROPS: props.join(','),
                    SWEEP_REPORT: report
                }
            }
        )
        rows.push(...JSON.parse(readFileSync(report, 'utf8')).rows)
        process.stdout.write('ok\n')
    }
} finally {
    rmSync(tmp, { recursive: true, force: true })
}

const byProp = new Map()
for (const r of rows) {
    if (!byProp.has(r.prop)) byProp.set(r.prop, { inert: [], live: [], unmountable: [], nondeterministic: [], 'not-rendered': [] })
    byProp.get(r.prop)[r.verdict].push(r.component)
}

const decided = rows.filter((r) => r.verdict === 'inert' || r.verdict === 'live')
console.log('')
console.log(`pairs probed  : ${rows.length}`)
console.log(`pairs decided : ${decided.length}  (inert ${decided.filter((r) => r.verdict === 'inert').length} / live ${decided.filter((r) => r.verdict === 'live').length})`)
console.log(`undecidable   : ${rows.length - decided.length}  (unmountable in isolation, not rendered, nondeterministic)`)
console.log('')
console.log('prop'.padEnd(22) + 'INERT'.padStart(6) + 'live'.padStart(6) + 'nondet'.padStart(8) + 'notRend'.padStart(9) + 'unmnt'.padStart(7))
const ordered = [...byProp.entries()].sort((a, b) => (a[1].live.length - b[1].live.length) || (b[1].inert.length - a[1].inert.length))
for (const [prop, v] of ordered) {
    console.log(
        prop.padEnd(22) +
        String(v.inert.length).padStart(6) +
        String(v.live.length).padStart(6) +
        String(v.nondeterministic.length).padStart(8) +
        String(v['not-rendered'].length).padStart(9) +
        String(v.unmountable.length).padStart(7)
    )
}
console.log('')
console.log('Props with ZERO live component are dead catalogue-wide:')
for (const [prop, v] of ordered) {
    if (v.live.length === 0 && v.inert.length > 0) console.log(`  ${prop.padEnd(22)} inert on ${v.inert.length} components`)
}

if (outPath) {
    writeFileSync(outPath, JSON.stringify({ rows }, null, 2))
    console.log(`\nwrote ${outPath}`)
}
