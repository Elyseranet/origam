// TEMPORARY probe — #823 / BG_FG_ROLE.DISABLED removal.
// Enumerates every declaration the four role-aware builders can emit for
// every REACHABLE (intent, role) pair, and dumps it to JSON so the before /
// after sets can be diffed byte-for-byte. Deleted before the PR lands.

import { describe, it } from 'vitest'
import { writeFileSync } from 'node:fs'

import {
    intentBgExpr,
    intentFgExpr,
    rawBgExprWithState,
    tokenStylesForIntent,
    tokenForegroundForIntent
} from '@origam/utils/Commons/color.util'
import { INTENT } from '@origam/enums/Commons/intent.enum'

const OUT = process.env.G823_OUT ?? '/tmp/g823.json'

describe('g823 probe', () => {
    it('enumerates every reachable (intent, role) declaration', () => {
        const intents = Object.values(INTENT) as string[]
        const roles = ['default', 'hover', 'active'] as const
        const out: Record<string, unknown> = {}

        for (const i of intents) {
            for (const r of roles) {
                out[`bg::${i}::${r}`] = intentBgExpr(i as never, r as never)
                out[`fg::${i}::${r}`] = intentFgExpr(i as never, r as never)
                out[`styles::${i}::${r}`] = tokenStylesForIntent(i as never, r as never)
                out[`raw::${i}::${r}`] = rawBgExprWithState('#abcdef', r as never)
                out[`rawT::${i}::${r}`] = rawBgExprWithState('transparent', r as never)
            }
            out[`tfi::${i}`] = tokenForegroundForIntent(i as never)
            out[`arity1::${i}`] = tokenStylesForIntent(i as never)
        }

        writeFileSync(OUT, JSON.stringify(out, null, 2))
        console.log(`G823 intents=${intents.join(',')} keys=${Object.keys(out).length}`)
    })
})
