/********************************************************
 *  USE-DEFAULTS REMOVAL — END-TO-END MUTATION PROBE
 *
 *  @description
 *  Issue #363 removes `useDefaults(_props)` from the 40 components that call it.
 *  The risk is silent: a prop read EAGERLY at `setup()` level — by the component
 *  itself, or TRANSITIVELY by a composable it hands `props` to — snapshots the
 *  pre-resolver value, so a theme configuring that prop stops landing.
 *  Static analysis names the candidates; only a render proves the consequence.
 *  This probe renders, so it covers direct and transitive breaks alike.
 *  For every component and every one of its declared props, it mounts twice —
 *  once with no theme, once under a theme setting that single prop to a sentinel
 *  — and records the markup whenever the two differ.
 *  A prop whose markup differs is THEME-OBSERVABLE: the probe can see it land.
 *  Running the probe before and after the removal turns each such prop into a
 *  pass/fail: same markup means the theme still lands, different means it stopped.
 *  A prop whose markup never differs is invisible to this instrument, and is
 *  counted as UNCOVERED rather than quietly reported as passing.
 *  The snapshot is written to disk so the two runs straddle the code change.
 ********************************************************/

import { describe, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '.probe')
const PHASE = process.env.ORIGAM_PROBE_PHASE ?? 'before'

const modules = import.meta.glob('../../../ds/src/components/**/Origam*.vue')

const SENTINEL_STRING = 'zprobe'

/*
 * Only the 40 `useDefaults` callers can regress: a component that never called
 * it has nothing to lose. Mounting all 217 exhausts the heap, exactly as
 * `packages/tests/bench/mount-cost.mjs` documents for the same reason.
 */
const TARGETS = new Set(`Alert App Avatar BreadcrumbItem Btn BtnGroup BtnToggle Card Checkbox Chip
Code ColorPickerField ConfirmWrapper DatePickerField ExpansionPanel Field FileField
FileFieldDragNDropItem FileFieldListItem Form Input Kbd Label ListItem Menu Messages
NumberField PasswordField Radio Select SelectionControl SliderField Snackbar Switch Table
Tab Tabs TextField TextareaField Title`.split(/\s+/).filter(Boolean))

const SHARD = process.env.ORIGAM_PROBE_SHARD ?? '1/1'
const [SHARD_I, SHARD_N] = SHARD.split('/').map(Number)

function kebab (pascal: string): string {
    return 'origam-' + pascal.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function candidateValues (def: any): unknown[] {
    const type = Array.isArray(def?.type) ? def.type[0] : def?.type
    if (type === Boolean) return [true, false]
    if (type === Number) return [42]
    if (type === String) return [SENTINEL_STRING]
    if (def === null || def === undefined) return [SENTINEL_STRING]
    return []
}

describe('useDefaults removal — theme-observability probe', () => {
    it(`records rendered markup per (component, prop) under a single-prop theme [phase=${PHASE}]`, async () => {
        const record: Record<string, string> = {}
        const uncovered: string[] = []
        const errored: string[] = []

        const entries = Object.entries(modules)
            .filter(([p]) => TARGETS.has(p.split('/').pop()!.replace(/^Origam|\.vue$/g, '')))
            .sort(([a], [b]) => a.localeCompare(b))
            .filter((_, idx) => idx % SHARD_N === (SHARD_I - 1))

        for (const [path, load] of entries) {
            const pascal = path.split('/').pop()!.replace(/^Origam|\.vue$/g, '')
            let Comp: any
            try {
                Comp = (await load() as any).default
            } catch { errored.push(`${pascal}:<import>`); continue }
            if (!Comp?.props) continue

            const name = kebab(pascal)

            let baseHtml: string | null = null
            try {
                const w = mount(Comp, { global: { plugins: [createOrigam({})] } })
                baseHtml = w.html()
                w.unmount()
            } catch { errored.push(`${pascal}:<base>`); continue }

            for (const [prop, def] of Object.entries<any>(Comp.props)) {
                let observed = false
                for (const value of candidateValues(def)) {
                    const theme: IOrigamTheme = {
                        name: 'probe', components: { [name]: { [prop]: value } }, vars: {}
                    }
                    let html: string
                    try {
                        const origam = createOrigam({ themes: [theme] })
                        origam._defaultsRef.value = origam._activeDefaultsFor('probe', undefined)
                        const w = mount(Comp, { global: { plugins: [origam] } })
                        html = w.html()
                        w.unmount()
                    } catch { continue }

                    if (html !== baseHtml) {
                        record[`${pascal}.${prop}=${String(value)}`] = html
                        observed = true
                    }
                }
                if (!observed) uncovered.push(`${pascal}.${prop}`)
            }
        }

        mkdirSync(OUT, { recursive: true })
        writeFileSync(resolve(OUT, `${PHASE}.${SHARD_I}of${SHARD_N}.json`), JSON.stringify(record, null, 0))
        console.log(`[probe:${PHASE}] theme-observable pairs: ${Object.keys(record).length}`)
        console.log(`[probe:${PHASE}] uncovered props: ${uncovered.length}`)
        console.log(`[probe:${PHASE}] errored: ${errored.length}`)

        writeFileSync(resolve(OUT, `${PHASE}.${SHARD_I}of${SHARD_N}.uncovered.json`), JSON.stringify(uncovered))
    }, 900_000)
})
