#!/usr/bin/env node
/**
 * kbd-preset.audit.mjs — la mesure d'acceptation du lot 2 d'ADR-005.
 *
 * CE QU'IL MESURE
 * ---------------
 * `OrigamKbd` rendu par Vue, sur les 8 identites x 2 modes, dans ses 9 cas
 * de `kbd-preset/probe-cases.const.ts`. Pour CHAQUE surface peinte — la
 * racine en forme simple, chaque `__key` en forme combinaison — il releve
 * les longhands de `KBD_PROBE_READ_PROPERTIES`.
 *
 * Il ne porte aucun verdict : il ecrit un JSON. Le verdict est le DIFF
 * entre deux executions, avant et apres la conversion, et c'est
 * `--compare` qui le rend.
 *
 * POURQUOI CETTE FORME
 * --------------------
 *   - jsdom ne resout JAMAIS `var()` (CLAUDE.md #398) et toute cette
 *     surface est pilotee par des tokens : jsdom mesurerait autre chose.
 *   - Histoire est epingle `data-theme="light"` et n'enregistre que
 *     `origamTheme` : les 7 marques y sont hors d'atteinte. Voir l'en-tete
 *     de `kbd-preset/main.ts`.
 *   - Une page statique ne monte pas Vue, donc ne resout aucun preset.
 * Le harnais possede donc son propre port EPHEMERE et epingle les axes
 * avant le parse du document.
 *
 * CONTROLE D'ACTUATION — OBLIGATOIRE
 * ----------------------------------
 * Une sonde incapable de prouver qu'elle actionne quelque chose n'est pas
 * une mesure. Le run ECHOUE si les 16 configurations rendent la meme
 * valeur de fond sur `single-filled` : cela voudrait dire que l'identite
 * n'a pas ete appliquee, et un « aucun changement » serait alors garanti
 * d'avance — exactement le faux vert qui a fait passer 16 configurations
 * du harnais voisin pour mesurees alors qu'elles etaient toutes claires.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:kbd-preset -- --json /tmp/avant.json
 *   pnpm -F @origam/tests audit:kbd-preset -- --compare /tmp/avant.json /tmp/apres.json
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
import { KBD_PROBE_CASES, KBD_PROBE_READ_PROPERTIES } from './kbd-preset/probe-cases.const.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'kbd-preset')
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

    const bare = deltas.filter((d) => !d.key.includes('|override-'))
    const intended = deltas.filter((d) => d.key.includes('|override-'))

    console.log(`lignes comparees : ${before.rows.length} avant / ${after.rows.length} apres`)
    console.log(`\nVARIANT NU — doit valoir 0 : ${bare.length} ecart(s)`)
    for (const d of bare) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)
    console.log(`\nVARIANT + PROP CONCURRENT — changement attendu : ${intended.length} ecart(s)`)
    for (const d of intended) console.log(`  ${d.key}\n      avant ${d.before}\n      apres ${d.after}`)

    process.exit(0)
}

/*********************************************************
 * readMatrixInPage
 *
 * @description
 * Tourne DANS la page. Pour chaque cas, releve la racine `.origam-kbd`
 * puis chacun de ses `.origam-kbd__key`.
 *
 * @description
 * ⛔ Relit `data-theme` / `data-mode` DANS LE MEME `evaluate` que les
 * styles et rend une erreur des qu'ils divergent de ce qui a ete demande.
 * Sans ce garde, une sonde qui bascule l'axe en cours de route rend des
 * nombres bien formes qui repondent a une autre question — le depot a deja
 * publie des rayons clair/sombre intervertis pour cette raison.
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
        const root = host.querySelector('.origam-kbd')
        if (!root) return { error: `cas ${caseKey} : aucune racine .origam-kbd rendue` }

        const surfaces = [['root', root]]
        const keys = Array.from(root.querySelectorAll('.origam-kbd__key'))
        keys.forEach((k, i) => surfaces.push([`key${i}`, k]))

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
 * `packages/tests/node_modules/.bin`, qui ne porte que `playwright` et
 * `vitest`. Le harnais voisin est mort en `127 — vite: command not found`
 * pour cette raison, sans que rien ne le signale.
 *
 * @description
 * Resoudre par le realpath du plugin rend la copie de vite contre laquelle
 * `vue()` est deja liee, quel que soit le hoisting — deux majeures de vite
 * coexistent dans ce magasin, un lookup de PATH pourrait prendre l'une ou
 * l'autre.
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
                window.__ORIGAM_KBD_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_KBD_PROBE_READY__ === true)
            await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))

            const got = await page.evaluate(readMatrixInPage, {
                expected: { identity, mode },
                properties: [...KBD_PROBE_READ_PROPERTIES]
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

const expectedRows = PROBE_IDENTITIES.length * PROBE_MODES.length * KBD_PROBE_CASES.length
if (rows.length < expectedRows) {
    console.error(`sous-collecte : ${rows.length} lignes pour ${expectedRows} attendues au minimum`)
    process.exit(1)
}

/*********************************************************
 * Controle d'actuation
 *
 * @description
 * Si les 16 configurations rendent le MEME fond sur `single-filled`, c'est
 * que l'identite n'a pas ete appliquee : toute conclusion « rien n'a
 * change » serait alors vraie par construction, et fausse en fait.
 ********************************************************/
const filledBackgrounds = new Set(
    rows.filter((r) => r.case === 'single-filled' && r.surface === 'root' && r.property === 'background-color')
        .map((r) => r.value)
)

console.log(`lignes relevees : ${rows.length}`)
console.log(`actuation — fonds distincts sur single-filled : ${filledBackgrounds.size} / 16`)

if (filledBackgrounds.size < 2) {
    console.error('ECHEC ACTUATION — l\'identite ne change rien, la sonde ne mesure pas ce qu\'elle croit')
    process.exit(1)
}

if (outPath) {
    await writeFile(outPath, JSON.stringify({ rows }, null, 2), 'utf8')
    console.log(`ecrit : ${outPath}`)
}
