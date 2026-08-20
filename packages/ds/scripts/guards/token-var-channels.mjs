#!/usr/bin/env node
/**
 * Guard — every `var(--origam-…)` a component READS must correspond to a
 * variable the token pipeline actually EMITS, or to one the component
 * SYNTHESISES locally. Anything else is a dead theme channel.
 *
 * THE DEFECT THIS EXISTS FOR (#435)
 * ----------------------------------
 * A BEM child key containing a hyphen breaks the token→CSS-var naming
 * transform. `table.cell.border-color` compiles correctly to
 * `--origam-table__cell---border-color`; `table.header-cell.border-bottom-color`
 * — same JSON shape, hyphenated child key — compiles to the FLATTENED
 * `--origam-table---header-cell-border-bottom-color`. The component's SCSS
 * reads the BEM form; the pipeline emits the flat form. Nothing throws:
 * `var(--origam-table__header-cell---border-bottom-color, #ccc)` just falls
 * back to its literal, silently, forever. Measured before this guard: 67
 * candidate keys share the "hyphenated nested key" shape, 24 of them
 * resolve to a genuinely different string between "what the SCSS reads" and
 * "what the pipeline emits" — 24 dead channels, 0 of them functional.
 *
 * A second, larger instance was found writing THIS guard, not by the
 * original measurement: `packages/ds/tokens/component/empty-state.json`
 * exists, is fully authored (title/description/icon/actions, all four
 * density rungs), and produces ZERO lines in every generated stylesheet —
 * `grep -c empty-state src/assets/css/tokens/*.css` returns 0 everywhere.
 * `$themes.json` selects 105 of the 110 files physically present under
 * `tokens/component/` — `empty-state` is outside that list. Different root
 * cause (a missing source-set registration, not a naming transform bug),
 * identical externally-observable symptom: every `--origam-empty-state…`
 * read in `OrigamEmptyState.vue` that names an actual authored token
 * (`__title---font-family`, `__actions---gap`, …) is a dead channel by the
 * same test this guard runs. It renders fine today only because every one
 * of those reads carries a literal CSS fallback — see CLASSIFICATION below
 * for why that does not make it a non-issue, only a QUIETER one.
 *
 * WHY THIS WAS INVISIBLE
 * -----------------------
 * `var(--x, fallback)` never errors: an unresolved custom property in a
 * `var()` with a fallback silently uses the fallback, so the component
 * renders — just always with the hardcoded default, never with whatever a
 * theme or a token edit intended. No test in this repo exercises a
 * component through its CSS-variable channel; every existing spec drives
 * behaviour through props. A theme author changing
 * `tokens/component/table.json`'s `header-cell.border-bottom-color` and
 * seeing nothing move in the browser had no static signal telling them why.
 *
 * WHAT THIS GUARD DOES
 * ---------------------
 * For every `var(--origam-…)` read inside a `<style>` block of any `.vue`
 * under `packages/ds/src`, checks whether that exact variable name is
 * DECLARED (as a `--name: value;` left-hand side) anywhere in the generated
 * stylesheets under `packages/ds/src/assets/css/tokens/*.css`. It also
 * checks the REVERSE direction: a variable the pipeline emits that no
 * `.vue` file ever reads is dead weight in every shipped stylesheet (a
 * separate, non-blocking-by-default report — see DORMANT TOKENS below).
 *
 * CLASSIFICATION, NOT JUST A COUNT
 * ----------------------------------
 * A variable read with NO fallback (`var(--x)` alone) and never emitted
 * resolves to the CSS-wide keyword behaviour for an invalid custom
 * property — the declaration it's used in is simply dropped. That is
 * unambiguously broken.
 *
 * A variable read WITH a fallback (`var(--x, 8px)`) and never emitted is
 * NOT automatically the same defect. It renders correctly today via the
 * fallback — EmptyState is the concrete example: every one of its
 * `--origam-empty-state__*` reads falls back to a real design value
 * (`Inter, system-ui, sans-serif`, `#525252`, `40px`, …) and the component
 * looks right on screen. It may be a deliberate extension point that was
 * never meant to route through the token pipeline at all, or — as measured
 * above for this exact component — a token file that WAS authored and
 * SHOULD be wired, just isn't yet. A static pass cannot tell those two
 * apart; a human auditing the baseline can. Both sub-classes are reported,
 * labelled, under ONE violation id space (the point is "this channel does
 * not carry the token pipeline's output", full stop) so the baseline can
 * only shrink — but the printed detail line always says which sub-class it
 * is, specifically so nobody "fixes" a real extension point by force-adding
 * a token nobody asked for.
 *
 * LOCAL SYNTHESIS IS NOT A DEAD CHANNEL
 * ---------------------------------------
 * Several components declare a `--origam-{component}---resolved-*` (or
 * `--bg-base` / `--fg-base` style) custom property INSIDE THEIR OWN
 * `<style>` block, seeded from a real token read, then consume that local
 * name everywhere else in the same block (Pagination's derived hover/active
 * rungs; EmptyState's per-density "resolved" indirection layer). That local
 * name will never appear in the generated stylesheets — it isn't supposed
 * to, it's a CSS-level `let` binding, not a token. A variable name that is
 * declared as a LHS anywhere in the SAME FILE'S `<style>` content is
 * excluded from dead-channel detection entirely, scoped per-file (not
 * repo-wide) so an actually-dead cross-component reference is never masked
 * by an unrelated component's local variable of the same name.
 *
 * DORMANT TOKENS (the reverse direction, tracked separately)
 * -------------------------------------------------------------
 * A variable the pipeline emits that no `.vue` file reads anywhere is dead
 * weight shipped in every stylesheet — real, but categorically less urgent
 * than a broken channel (nothing LOOKS wrong; it is pure bytes). Reported
 * and baselined on its own, so it cannot silently grow either, without
 * gating the primary (broken-channel) exit code as hard.
 *
 * DETECTION — see lib/css-var-scan.mjs for the paren-aware var() scanner
 * (a naive regex breaks on nested `color-mix(...)` fallbacks) and its
 * rationale for the declaration/reference disambiguation rule.
 *
 * Run: `node packages/ds/scripts/guards/token-var-channels.mjs`
 *      `node packages/ds/scripts/guards/token-var-channels.mjs --why`
 *      (or `pnpm -F origam guards:token-var-channels`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSFC } from 'vue/compiler-sfc'
import { stripComments } from './lib/scss-scan.mjs'
import { findVarReads, findVarDeclarations } from './lib/css-var-scan.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const SRC_DIR = path.join(DS_ROOT, 'src')
const TOKENS_CSS_DIR = path.join(DS_ROOT, 'src/assets/css/tokens')

const DEAD_BASELINE_PATH = path.join(__dirname, 'baseline/token-var-channels.json')
const DORMANT_BASELINE_PATH = path.join(__dirname, 'baseline/token-var-channels-dormant.json')

function walkFiles (dir, predicate) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walkFiles(full, predicate))
        else if (predicate(full)) out.push(full)
    }
    return out
}

/*********************************************************
 * Pure analysis — no filesystem access, so the self-test can feed it
 * synthetic in-memory fixtures instead of real files.
 *
 * @param vueStyles    Map<relPath, styleBlockContent>  (comments already
 *                     stripped; concatenation of every `<style>` block in
 *                     that file, in source order)
 * @param emittedVars  Set<string>  every `--origam-…` declared anywhere in
 *                     the generated token stylesheets
 * @returns { deadChannels: Map<id, detail>, dormantTokens: Map<id, detail> }
 ********************************************************/
export function analyseChannels ({ vueStyles, emittedVars }) {
    const deadChannels = new Map()
    const readNamesGlobal = new Set()

    for (const [relFile, content] of vueStyles) {
        const localDecls = new Set(findVarDeclarations(content).map((d) => d.name))
        const reads = findVarReads(content)

        // Per (file, varName): remember whether ANY occurrence had a
        // fallback and whether ANY occurrence had none — both matter for
        // the human-readable classification, neither changes the verdict.
        const perVar = new Map()
        for (const r of reads) {
            readNamesGlobal.add(r.name)
            if (!perVar.has(r.name)) perVar.set(r.name, { hasFallback: false, hasNoFallback: false })
            const entry = perVar.get(r.name)
            if (r.hasFallback) entry.hasFallback = true
            else entry.hasNoFallback = true
        }

        for (const [name, flags] of perVar) {
            if (emittedVars.has(name)) continue // channel carries real token output
            if (localDecls.has(name)) continue // component-local CSS "let" binding, not a token

            const id = `${relFile}::${name}`
            const label = flags.hasNoFallback
                ? (flags.hasFallback ? 'sans repli sur au moins une occurrence — rendu cassé (valeur invalide) sur ce point' : 'sans repli — rendu cassé (valeur invalide), aucun repli nulle part')
                : 'avec repli — rendu correct aujourd\'hui via le repli, mais canal thème mort (jamais alimenté par le pipeline)'
            deadChannels.set(id, `${relFile} lit \`${name}\`, jamais émis par le pipeline de tokens (${label}).`)
        }
    }

    const dormantTokens = new Map()
    for (const name of emittedVars) {
        if (!readNamesGlobal.has(name)) {
            dormantTokens.set(name, `\`${name}\` est émis par le pipeline de tokens mais n'est lu par aucun fichier .vue sous packages/ds/src.`)
        }
    }

    return { deadChannels, dormantTokens }
}

function run () {
    const showWhy = process.argv.includes('--why')
    const updateBaseline = process.argv.includes('--update-baseline')

    // ---- emitted set: every --origam-* declared in shipped token CSS ----
    const cssFiles = readdirSync(TOKENS_CSS_DIR)
        .filter((f) => f.endsWith('.css'))
        .map((f) => path.join(TOKENS_CSS_DIR, f))

    const emittedVars = new Set()
    for (const file of cssFiles) {
        const content = readFileSync(file, 'utf8')
        for (const decl of findVarDeclarations(content)) emittedVars.add(decl.name)
    }

    // ---- read set: every var(--origam-*) inside every .vue <style> block ----
    const vueFiles = walkFiles(SRC_DIR, (f) => f.endsWith('.vue') && !f.endsWith('.story.vue'))
    const vueStyles = new Map()
    for (const file of vueFiles) {
        const content = readFileSync(file, 'utf8')
        const relFile = path.relative(REPO_ROOT, file)
        let descriptor
        try {
            ;({ descriptor } = parseSFC(content, { filename: file }))
        } catch (err) {
            console.error(`Failed to parse SFC ${relFile}: ${err.message}`)
            process.exitCode = 1
            continue
        }
        if (descriptor.styles.length === 0) continue
        const merged = descriptor.styles.map((s) => stripComments(s.content)).join('\n')
        vueStyles.set(relFile, merged)
    }

    const { deadChannels, dormantTokens } = analyseChannels({ vueStyles, emittedVars })

    if (updateBaseline) {
        writeBaseline(DEAD_BASELINE_PATH, new Set(deadChannels.keys()))
        writeBaseline(DORMANT_BASELINE_PATH, new Set(dormantTokens.keys()))
        console.log(`Baseline updated: ${deadChannels.size} dead channel(s), ${dormantTokens.size} dormant token(s).`)
        return 0
    }

    const deadExit = report({
        guardName: 'token-var-channels (dead) — every var(--origam-…) a component reads must be emitted by the token pipeline, or synthesised locally',
        baselinePath: DEAD_BASELINE_PATH,
        currentIds: new Set(deadChannels.keys()),
        detailsById: deadChannels,
        fixHint: 'Either wire the missing key in packages/ds/tokens/component/{name}.json (and confirm it is listed under packages/ds/tokens/$themes.json\'s selectedTokenSets) so pnpm -F origam tokens:build emits it, or — if this is a deliberate extension point never meant to be tokenised — leave the fallback as-is and record that decision in the component\'s doc.'
    })

    const dormantExit = report({
        guardName: 'token-var-channels (dormant) — every var(--origam-…) the pipeline emits should be read by at least one component',
        baselinePath: DORMANT_BASELINE_PATH,
        currentIds: new Set(dormantTokens.keys()),
        detailsById: dormantTokens,
        fixHint: 'Either wire this token into the component\'s SCSS (var(--origam-…)), or remove the unused key from the matching packages/ds/tokens/component/*.json.'
    })

    if (showWhy) {
        console.log('\n--why: dead channels grouped by sub-class')
        let noFallback = 0
        let fallback = 0
        for (const detail of deadChannels.values()) {
            if (detail.includes('valeur invalide')) noFallback++
            else fallback++
        }
        console.log(`  sans repli (rendu cassé)      : ${noFallback}`)
        console.log(`  avec repli (canal mort, rendu OK aujourd'hui) : ${fallback}`)
    }

    return deadExit || dormantExit ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const exitCode = run()
    if (exitCode !== undefined) process.exit(exitCode)
}
