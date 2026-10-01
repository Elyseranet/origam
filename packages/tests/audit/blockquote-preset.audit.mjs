#!/usr/bin/env node
/**
 * blockquote-preset.audit.mjs — la mesure d'acceptation du lot #1015.
 *
 * CE QU'IL MESURE
 * ---------------
 * `OrigamBlockquote` rendu par Vue, sur les 8 identites x 2 modes, dans
 * ses 8 cas de `blockquote-preset/probe-cases.const.ts`. Pour CHAQUE
 * surface — la racine, `__body`, `__attribution`, le glyphe `__mark--bg`
 * — il releve les longhands de `BLOCKQUOTE_PROBE_READ_PROPERTIES`.
 *
 * Il ne porte aucun verdict : il ecrit un JSON. Le verdict est le DIFF
 * entre deux executions, avant et apres la conversion, et c'est
 * `--compare` qui le rend.
 *
 * POURQUOI IL EXISTE PLUTOT QU'UN SPEC HISTOIRE
 * ---------------------------------------------
 * Le lot #1015 a UNE exposition vivante, et elle est hors d'atteinte de
 * Histoire : `packages/marketing/src/themes/editorial.theme.ts` pose
 * `--origam-blockquote__accent---width: 3px`, lu par les presets de
 * `default` et `elegant` ET present dans le `calc()` de leur
 * `padding-inline-start`. Le bac a sable Histoire est epingle
 * `data-theme="light"` et n'enregistre que `origamTheme` : l'axe des
 * identites y est structurellement immesurable. Voir l'en-tete de
 * `blockquote-preset/main.ts`.
 *
 * Jumeau de `kbd-preset.audit.mjs` — meme forme, mêmes pieges traites.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:blockquote-preset -- --json /tmp/avant.json
 *   pnpm -F @origam/tests audit:blockquote-preset -- --compare /tmp/avant.json /tmp/apres.json
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
import { BLOCKQUOTE_PROBE_CASES, BLOCKQUOTE_PROBE_READ_PROPERTIES } from './blockquote-preset/probe-cases.const.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'blockquote-preset')
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

/*********************************************************
 * compareRuns
 *
 * @description
 * Le verdict du lot : apparie deux executions par
 * `identite|mode|cas|surface|propriete` et rend les ecarts.
 *
 * @description
 * Un appariement par CLE, jamais par position : un cas ajoute ou reordonne
 * ferait glisser deux listes l'une contre l'autre et fabriquerait des
 * ecarts sur des lignes qui n'ont pas bouge.
 ********************************************************/
function compareRuns (before, after) {
    const index = (run) => new Map(run.rows.map((r) => [`${r.identity}|${r.mode}|${r.case}|${r.surface}|${r.property}`, r.value]))

    const a = index(before)
    const b = index(after)
    const deltas = []

    for (const [key, valueBefore] of a) {
        if (!b.has(key)) {
            deltas.push({ key, before: valueBefore, after: '(cle absente apres)' })
            continue
        }
        if (b.get(key) !== valueBefore) deltas.push({ key, before: valueBefore, after: b.get(key) })
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

    const bare = deltas.filter((d) => d.key.includes('|bare-'))
    const intended = deltas.filter((d) => d.key.includes('|override-'))
    const other = deltas.filter((d) => !d.key.includes('|bare-') && !d.key.includes('|override-'))

    console.log(`lignes comparees : ${before.rows.length} avant / ${after.rows.length} apres`)
    console.log(`\nVARIANT NU — doit valoir 0 : ${bare.length} ecart(s)`)
    for (const d of bare) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)
    console.log(`\nVARIANT + PROP CONCURRENT — changement ATTENDU : ${intended.length} ecart(s)`)
    for (const d of intended) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)
    if (other.length) {
        console.log(`\nNON CLASSE — a lire a la main : ${other.length} ecart(s)`)
        for (const d of other) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)
    }

    process.exit(0)
}

/*********************************************************
 * readMatrixInPage
 *
 * @description
 * Tourne DANS la page. Pour chaque cas, releve la racine
 * `.origam-blockquote` puis ses surfaces internes.
 *
 * @description
 * ⛔ LIRE LA SEULE RACINE NE SUFFIT PAS. Les deux regles d'empilement que
 * `quoted` portait vivent sur `__body` et `__attribution` : une sonde qui
 * ne lirait que la racine declarerait « aucun changement » sur le cas dont
 * la conversion deplace precisement ces deux regles.
 *
 * @description
 * ⛔ Relit `data-theme` / `data-mode` DANS LE MEME `evaluate` que les
 * styles et rend une erreur des qu'ils divergent de ce qui a ete demande.
 * Sans ce garde, une sonde qui bascule l'axe en cours de route rend des
 * nombres bien formes qui repondent a une autre question.
 ********************************************************/
function readMatrixInPage ({ expected, properties }) {
    const themeAtRead = document.documentElement.getAttribute('data-theme') ?? 'native'
    const modeAtRead = document.documentElement.getAttribute('data-mode') ?? ''

    if (themeAtRead !== expected.identity || modeAtRead !== expected.mode) {
        return { error: `CONTAMINE — demande ${expected.identity}/${expected.mode}, lu ${themeAtRead}/${modeAtRead}` }
    }

    const out = []

    for (const host of Array.from(document.querySelectorAll('[data-probe-case]'))) {
        const caseKey = host.getAttribute('data-probe-case')
        const root = host.querySelector('.origam-blockquote')
        if (!root) return { error: `cas ${caseKey} : aucune racine .origam-blockquote rendue` }

        const surfaces = [['root', root]]
        for (const [name, sel] of [
            ['body', '.origam-blockquote__body'],
            ['attribution', '.origam-blockquote__attribution'],
            ['mark', '.origam-blockquote__mark--bg']
        ]) {
            const el = root.querySelector(sel)
            // Une surface ABSENTE est une mesure, pas un trou : le glyphe
            // n'existe que quand `quoteMark` est pose, et son apparition ou
            // sa disparition doit apparaitre dans le diff.
            out.push({ case: caseKey, surface: name, property: '(present)', value: el ? 'yes' : 'no' })
            if (el) surfaces.push([name, el])
        }

        for (const [surface, el] of surfaces) {
            const cs = getComputedStyle(el)
            for (const property of properties) {
                out.push({ case: caseKey, surface, property, value: cs.getPropertyValue(property).trim() })
            }
        }
    }

    return { rows: out }
}

/*********************************************************
 * resolveViteBin
 *
 * @description
 * ⛔ Ne pas revenir a `npx vite`. `vite` est un PAIR auto-installe de
 * `@vitejs/plugin-vue`, donc pnpm lie son binaire a cote du paquet qui le
 * reclame, dans le magasin virtuel — pas dans
 * `packages/tests/node_modules/.bin`. Le harnais voisin est mort en
 * `127 — vite: command not found` pour cette raison, sans que rien ne le
 * signale.
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
            const page = await browser.newPage()
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_BQ_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_BQ_PROBE_READY__ === true)
            await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))

            const got = await page.evaluate(readMatrixInPage, {
                expected: { identity, mode },
                properties: [...BLOCKQUOTE_PROBE_READ_PROPERTIES]
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

const expectedRows = PROBE_IDENTITIES.length * PROBE_MODES.length * BLOCKQUOTE_PROBE_CASES.length
if (rows.length < expectedRows) {
    console.error(`sous-collecte : ${rows.length} lignes pour ${expectedRows} attendues au minimum`)
    process.exit(1)
}

/*********************************************************
 * Controle d'actuation — OBLIGATOIRE
 *
 * @description
 * Une sonde incapable de prouver qu'elle actionne quelque chose n'est pas
 * une mesure. Ici le temoin est le MEME canal que le lot doit preserver :
 * `editorial` pose `--origam-blockquote__accent---width: 3px` la ou les 7
 * autres identites laissent le `4px` de la feuille. Si la largeur du filet
 * est IDENTIQUE sur les 16 configurations, c'est que l'identite n'a pas
 * ete appliquee — et un « rien n'a change » serait alors vrai par
 * construction, et faux en fait.
 *
 * @description
 * Le run ECHOUE aussi si `editorial` ne rend pas exactement `3px`, parce
 * que c'est la question que #1015 pose : le preset porte-t-il bien la
 * CHAINE `var(--origam-blockquote__accent---width, 4px)` plutot qu'une
 * largeur en dur ?
 ********************************************************/
const accentWidths = rows.filter((r) => r.case === 'bare-default' && r.surface === 'root'
        && r.property === 'border-inline-start-width')

const distinct = new Set(accentWidths.map((r) => r.value))
const editorial = accentWidths.filter((r) => r.identity === 'editorial').map((r) => r.value)

console.log(`lignes relevees : ${rows.length}`)
console.log(`actuation — largeurs de filet distinctes sur bare-default : ${distinct.size} / ${accentWidths.length}`)
console.log(`             editorial = ${JSON.stringify(editorial)} (attendu ["3px","3px"])`)
console.log(`             les autres = ${JSON.stringify([...new Set(accentWidths.filter((r) => r.identity !== 'editorial').map((r) => r.value))])}`)

if (distinct.size < 2) {
    console.error('ECHEC ACTUATION — l\'identite ne change rien, la sonde ne mesure pas ce qu\'elle croit')
    process.exit(1)
}

if (editorial.some((v) => v !== '3px')) {
    console.error('ECHEC CANAL — editorial ne peint plus son filet de 3px : le preset a jete le canal de theme')
    process.exit(1)
}

if (outPath) {
    await writeFile(outPath, JSON.stringify({ rows }, null, 2), 'utf8')
    console.log(`ecrit : ${outPath}`)
}
