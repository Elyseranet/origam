// #505 — every OrigamChart*.vue must route --origam-chart---animation-duration
// through the shared `useChartAnimationStyle` composable, not a hand-rolled
// (and inevitably drifting) copy of the unconditional assignment. 20 files
// shared the exact same line before the fix; this spec pins the wiring so a
// future edit can't silently reintroduce the always-on inline override in
// one file while the other 19 stay fixed.

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const DS_ROOT = path.resolve(__dirname, '../../../../ds')
const CHART_DIR = path.join(DS_ROOT, 'src/components/Chart')

// Precise, explicit set — NOT every component carrying an `animationDuration`
// prop routes it through `--origam-chart---animation-duration` (e.g.
// `OrigamChartSparkline` declares the same prop default but drives its own,
// unrelated animation path). Matching on file content would silently widen
// or narrow this list; the 20 names are the ones #505 actually touched.
const chartFiles = readdirSync(CHART_DIR)
    .filter((f) => f.startsWith('OrigamChart') && f.endsWith('.vue'))
    .filter((f) => {
        const src = readFileSync(path.join(CHART_DIR, f), 'utf-8')
        return src.includes('useChartAnimationStyle')
    })

describe('OrigamChart* — #505 animation-duration wiring (20 components)', () => {
    it('found the expected 20 chart components carrying animationDuration', () => {
        expect(chartFiles.length).toBe(20)
    })

    it.each(chartFiles)('%s imports useChartAnimationStyle', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).toContain("from '../../composables/Chart/chart-animation.composable'")
    })

    it.each(chartFiles)('%s calls useChartAnimationStyle(props)', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).toContain('useChartAnimationStyle(props)')
    })

    it.each(chartFiles)('%s no longer sets the CSS var unconditionally from props.animationDuration', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).not.toMatch(/out\['--origam-chart---animation-duration'\]\s*=\s*`\$\{\s*props\.animationDuration\s*}ms`/)
    })

    it.each(chartFiles)('%s merges chartAnimationStyle.value into its root styles', (file) => {
        const src = readFileSync(path.join(CHART_DIR, file), 'utf-8')
        expect(src).toContain('Object.assign(out, chartAnimationStyle.value)')
    })
})
