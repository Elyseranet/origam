#!/usr/bin/env node
/**
 * btn-height.audit.mjs — la mesure d'acceptation de #1093 / #1094 / #929.
 *
 * CE QU'IL MESURE
 * ---------------
 * `OrigamBtn` rendu par Vue sur les 8 identites x 2 modes. Pour chaque cas de
 * `btn-height/probe-cases.const.ts` il releve la boite de la racine (hauteur et
 * largeur reelles), ses longhands de hauteur/padding, et la boite de
 * `__content` — dont le debordement par rapport a la racine est le symptome
 * de #1093.
 *
 * Il ne porte aucun verdict en mode `--json` : il ecrit un fichier. Le verdict
 * est le DIFF entre deux executions (`--compare avant apres`), qui separe
 *   - les cas AU REPOS, qui doivent valoir 0 px d'ecart ;
 *   - les cas `long-*`, `height-*`, `max-height-*`, `short-wrap`, ou un
 *     changement est attendu.
 *
 * POURQUOI CETTE FORME : meme raisonnement que `kbd-preset.audit.mjs` (jsdom
 * ne resout jamais `var()`, Histoire est epingle sur une identite, une page
 * statique ne monte pas Vue).
 *
 * Usage:
 *   pnpm -F @origam/tests audit:btn-height -- --json /tmp/avant.json
 *   pnpm -F @origam/tests audit:btn-height -- --compare /tmp/avant.json /tmp/apres.json
 */

import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, realpathSync, readFileSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

import { PROBE_IDENTITIES, PROBE_MODES } from './dark-contrast/probe-matrix.const.ts'
import { BTN_PROBE_CASES, BTN_PROBE_READ_PROPERTIES } from './btn-height/probe-cases.const.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'btn-height')
const DIST = join(APP, 'dist')

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.svg': 'image/svg+xml'
}

/** Un cas « au repos » est un cas croise taille x densite : sa cle contient `|`. */
const isRestCase = (key) => key.split('|').length === 4 || key.includes('|')

function compareRuns (before, after) {
    const index = (run) => new Map(run.rows.map((r) => [`${r.identity}|${r.mode}|${r.case}|${r.property}`, r.value]))
    const a = index(before)
    const b = index(after)
    const deltas = []

    for (const [key, valueBefore] of a) {
        if (!b.has(key)) {
            deltas.push({ key, before: valueBefore, after: '(cle absente apres)' })
            continue
        }
        const valueAfter = b.get(key)
        if (valueAfter !== valueBefore) deltas.push({ key, before: valueBefore, after: valueAfter })
    }
    for (const key of b.keys()) {
        if (!a.has(key)) deltas.push({ key, before: '(cle absente avant)', after: b.get(key) })
    }
    return deltas
}

const compareFlag = process.argv.indexOf('--compare')
if (compareFlag >= 0) {
    const before = JSON.parse(readFileSync(process.argv[compareFlag + 1], 'utf8'))
    const after = JSON.parse(readFileSync(process.argv[compareFlag + 2], 'utf8'))
    const deltas = compareRuns(before, after)

    // cle = identity|mode|case...|property ; le nom de cas contient lui-meme des `|`
    const caseOf = (key) => key.split('|').slice(2, -1).join('|')
    const rest = deltas.filter((d) => isRestCase(caseOf(d.key)))
    const standalone = deltas.filter((d) => !isRestCase(caseOf(d.key)))

    // Le critere du ticket : la HAUTEUR au repos. `rect-height` (boite reelle) et
    // `height` (calcule) sont les deux mesures ; les autres longhands bougent
    // legitimement (`min-height`/`height` passent de la valeur a `auto` resolu).
    const restHeight = rest.filter((d) => /\|(rect-height|rect-width|content-offset-top|content-offset-left)$/.test(d.key))
    const restOther = rest.filter((d) => !(/\|(rect-height|rect-width|content-offset-top|content-offset-left)$/.test(d.key)))

    const restCases = new Set(before.rows.filter((r) => isRestCase(r.case)).map((r) => `${r.identity}|${r.mode}|${r.case}`))
    console.log(`lignes comparees : ${before.rows.length} avant / ${after.rows.length} apres`)
    console.log(`configurations au repos mesurees : ${restCases.size} (identite x mode x forme x taille x densite)`)
    console.log(`\nAU REPOS — hauteur et largeur de la boite, doit valoir 0 : ${restHeight.length} ecart(s)`)
    for (const d of restHeight) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)
    console.log(`\nAU REPOS — autres longhands (informatif) : ${restOther.length} ecart(s)`)
    const sample = {}
    for (const d of restOther) {
        const prop = d.key.split('|').pop()
        sample[prop] ??= { n: 0, before: d.before, after: d.after }
        sample[prop].n += 1
    }
    for (const [prop, s] of Object.entries(sample)) console.log(`  ${prop} : ${s.n} ecart(s), ex. ${s.before} -> ${s.after}`)
    console.log(`\nCAS A CONTENU LONG / HAUTEUR EXPLICITE — changement attendu : ${standalone.length} ecart(s)`)
    for (const d of standalone) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)

    process.exit(restHeight.length === 0 ? 0 : 2)
}

/*********************************************************
 * readMatrixInPage
 *
 * @description
 * Tourne DANS la page. ⛔ Relit `data-theme` / `data-mode` DANS LE MEME
 * `evaluate` que les styles et rend une erreur des qu'ils divergent de ce qui
 * a ete demande (cf. CLAUDE.md, sonde contaminee).
 ********************************************************/
function readMatrixInPage ({ expected, properties }) {
    const themeAtRead = document.documentElement.getAttribute('data-theme') ?? 'native'
    const modeAtRead = document.documentElement.getAttribute('data-mode') ?? ''

    if (themeAtRead !== expected.identity || modeAtRead !== expected.mode) {
        return { error: `CONTAMINE — demande ${expected.identity}/${expected.mode}, lu ${themeAtRead}/${modeAtRead}` }
    }

    const out = []
    const px = (n) => `${Math.round(n * 100) / 100}px`

    for (const host of Array.from(document.querySelectorAll('[data-probe-case]'))) {
        const caseKey = host.getAttribute('data-probe-case')
        const root = host.querySelector('.origam-btn')
        if (!root) return { error: `cas ${caseKey} : aucune racine .origam-btn rendue` }

        const rect = root.getBoundingClientRect()
        out.push({ case: caseKey, property: 'rect-height', value: px(rect.height) })
        out.push({ case: caseKey, property: 'rect-width', value: px(rect.width) })

        const cs = getComputedStyle(root)
        for (const property of properties) out.push({ case: caseKey, property, value: cs.getPropertyValue(property).trim() })

        const content = root.querySelector('.origam-btn__content')
        if (content) {
            const c = content.getBoundingClientRect()
            out.push({ case: caseKey, property: 'content-height', value: px(c.height) })
            out.push({ case: caseKey, property: 'content-width', value: px(c.width) })
            // Position du contenu DANS la boite : la hauteur seule ne prouve pas que le
            // contenu reste centre verticalement quand le minimum depasse le contenu.
            out.push({ case: caseKey, property: 'content-offset-top', value: px(c.top - rect.top) })
            out.push({ case: caseKey, property: 'content-offset-left', value: px(c.left - rect.left) })
            out.push({ case: caseKey, property: 'content-white-space', value: getComputedStyle(content).whiteSpace })
            // Debordement vertical / horizontal du contenu hors de la boite du bouton.
            out.push({ case: caseKey, property: 'overflow-block', value: px(Math.max(0, c.bottom - rect.bottom, rect.top - c.top)) })
            out.push({ case: caseKey, property: 'overflow-inline', value: px(Math.max(0, c.right - rect.right, rect.left - c.left)) })
        }
    }

    return { rows: out }
}

/*********************************************************
 * resolveViteBin
 *
 * @description
 * ⛔ Ne pas revenir a `npx vite` : voir `kbd-preset.audit.mjs`.
 ********************************************************/
function resolveViteBin () {
    const req = createRequire(import.meta.url)
    const pluginPkg = req.resolve('@vitejs/plugin-vue/package.json', { paths: [resolve(HERE, '..')] })
    const fromPlugin = createRequire(realpathSync(pluginPkg))
    return join(dirname(fromPlugin.resolve('vite/package.json')), 'bin', 'vite.js')
}

function buildHarness () {
    process.stdout.write('construction du harnais … ')
    execFileSync(process.execPath, [resolveViteBin(), 'build', '--config', join(APP, 'vite.config.mjs')], {
        cwd: resolve(HERE, '..'),
        stdio: ['ignore', 'ignore', 'inherit']
    })
    process.stdout.write('ok\n')
}

async function serveDist () {
    const server = createServer(async (req, res) => {
        const url = new URL(req.url, 'http://x')
        let file = join(DIST, decodeURIComponent(url.pathname))
        if (url.pathname === '/' || !existsSync(file)) file = join(DIST, 'index.html')
        try {
            const body = await readFile(file)
            res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
            res.end(body)
        } catch {
            res.writeHead(404)
            res.end()
        }
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    return { server, port: server.address().port }
}

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []

try {
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage({ viewport: { width: 1280, height: 4000 } })
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_BTN_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_BTN_PROBE_READY__ === true)
            // Une transition en cours fausse une lecture synchrone : on attend la fin des
            // `transition-duration` (0.28 s) en plus des deux frames.
            await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))
            await page.waitForTimeout(600)

            const got = await page.evaluate(readMatrixInPage, {
                expected: { identity, mode },
                properties: [...BTN_PROBE_READ_PROPERTIES]
            })

            if (got.error) throw new Error(`${identity}/${mode} — ${got.error}`)
            for (const r of got.rows) rows.push({ identity, mode, ...r })
            await page.close()
        }
    }
} finally {
    await browser.close()
    server.close()
}

const expectedRows = PROBE_IDENTITIES.length * PROBE_MODES.length * BTN_PROBE_CASES.length
if (rows.length < expectedRows) {
    console.error(`sous-collecte : ${rows.length} lignes pour ${expectedRows} attendues au minimum`)
    process.exit(1)
}

/*********************************************************
 * Controle d'actuation
 *
 * @description
 * Les hauteurs doivent differer entre tailles, et le fond entre identites :
 * sinon la sonde ne mesure pas ce qu'elle croit.
 ********************************************************/
const heights = new Set(rows.filter((r) => r.case.startsWith('label|') && r.property === 'rect-height').map((r) => r.value))
console.log(`lignes relevees : ${rows.length}`)
console.log(`actuation — hauteurs distinctes sur la forme « label » : ${heights.size}`)
if (heights.size < 4) {
    console.error('ECHEC ACTUATION — la taille/densite ne change pas la hauteur, la sonde ne mesure pas ce qu\'elle croit')
    process.exit(1)
}

if (outPath) {
    await writeFile(outPath, JSON.stringify({ rows }, null, 2), 'utf8')
    console.log(`ecrit : ${outPath}`)
}
