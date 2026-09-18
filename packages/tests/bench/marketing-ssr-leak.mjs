#!/usr/bin/env node
/*
 * #248 — SCÉNARIO DE REPRODUCTION DÉTERMINISTE de l'OOM du worker SSR de
 * `nuxt dev` (marketing), et mesure de la courbe mémoire avant / après.
 *
 * ─── Ce qu'il fait ──────────────────────────────────────────────────────────
 * Il rejoue en boucle un jeu de pages SSR contre un serveur de dev marketing
 * DÉJÀ LANCÉ, et échantillonne après chaque tour la mémoire du worker Nitro
 * lui-même — pas celle du process parent. La distinction est tout le sujet :
 * `nuxt dev` exécute le rendu SSR dans un `worker_threads.Worker`
 * (nitropack, `NodeDevWorker`), qui a sa PROPRE limite de tas. C'est lui qui
 * meurt, avec « Worker terminated due to reaching memory limit: JS heap out of
 * memory » et un 500 sur toutes les routes ensuite.
 *
 * ⛔ Le worker n'est JAMAIS relancé : `NodeDevWorker.close()` pose
 * `closed = true` et rien ne rouvre. Un seul dépassement transforme donc tout
 * le reste d'un run Playwright en échecs consécutifs — c'est ce qui a coupé le
 * balayage de #835 au test #268, laissant ~202 tests jamais exécutés.
 *
 * ─── Pourquoi une charge HTTP brute et pas Playwright ───────────────────────
 * Le défaut se déclenche au RENDU SSR, pas dans le navigateur. Une boucle
 * `fetch` le reproduit à l'identique, ~40× plus vite, sans dépendre de la
 * stabilité d'une suite e2e — et ne consomme presque pas de CPU local, ce qui
 * évite de confondre la fuite avec la charge de la machine.
 *
 * ─── Usage — l'ORDRE COMPTE ─────────────────────────────────────────────────
 * ⛔ La sonde doit exister AVANT le démarrage du serveur. Nitro scanne
 * `server/api/` au boot ; un fichier de route déposé ensuite n'est PAS
 * enregistré (mesuré : 404 pendant 60 s d'attente, worker parfaitement vivant).
 * La version précédente de ce script installait la sonde à chaud et attendait
 * un rechargement qui n'arrive jamais — elle ne pouvait donc rien mesurer.
 *
 *   # 1. déposer la sonde
 *   node packages/tests/bench/marketing-ssr-leak.mjs --install-probe
 *
 *   # 2. un serveur de dev marketing À NOUS, jamais :3000 (~150 worktrees)
 *   DATABASE_URL="postgres://…" NUXT_IGNORE_LOCK=1 \
 *     pnpm -F @origam/marketing dev --port 3141
 *
 *   # 3. la charge
 *   PORT=3141 ROUNDS=120 node packages/tests/bench/marketing-ssr-leak.mjs
 *
 *   # 4. retirer la sonde
 *   node packages/tests/bench/marketing-ssr-leak.mjs --remove-probe
 *
 * Pour rendre le témoin rapide, on RÉDUIT la limite de tas du worker plutôt que
 * de l'augmenter : `NODE_OPTIONS=--max-old-space-size=1024` sur le serveur de
 * dev. nitropack crée son worker sans `resourceLimits` (`core/index.mjs`,
 * `#initWorker`), donc le worker hérite de la limite du process. La fuite tue
 * alors le worker en ~200 rendus au lieu de ~1 100, et le correctif doit
 * survivre au MÊME seau rétréci.
 *
 * `ROUNDS` × `URLS.length` rendus au total. À la limite de tas par défaut de
 * cette machine (4 144 Mo), la pente mesurée ci-dessous place la mort du worker
 * vers 1 070 rendus — extrapolation, pas une observation directe : le témoin
 * ci-dessous a été obtenu à 1 216 Mo pour tenir en quelques minutes.
 *
 * ─── Lire le verdict ────────────────────────────────────────────────────────
 * La colonne `heapUsed` est relevée APRÈS un `gc()` forcé, donc elle mesure ce
 * qui est RETENU, pas les déchets en attente. Sans cette précaution on mesure
 * le rythme du ramasse-miettes et toute application a l'air de fuir.
 *
 *   heapUsed plat            → pas de fuite (au pire un pic transitoire)
 *   heapUsed linéaire        → fuite ; la pente donne le coût par rendu
 *
 * ─── TÉMOIN A/B mesuré le 2026-09-18 ───────────────────────────────────────
 * Même arbre, même serveur, même charge, même limite de tas RÉDUITE à 1 216 Mo.
 * SEULE variable : la présence de `server/plugins/01.vue-devtools-plugin-queue.ts`.
 * Sans ce fichier, `server/plugins/` est identique à `develop`.
 *
 *                        AVANT (= develop)        APRÈS (correctif actif)
 *   rendus                mort au tour 23 (~230)   400, worker vivant
 *   heapUsed              184,5 → 961,2 Mo         153,2 → 153,9 Mo
 *   pente                 +3,70 Mo / rendu         ~0, oscillant 147-156
 *   file devtools         = nombre de rendus       0 constant
 *   état final            500 sur TOUTES les routes, définitif
 *                                                  200 sur toutes les routes
 *
 * Le 500 porte le message exact du ticket, relevé dans le corps de la réponse
 * (et NON dans le journal du serveur, qui ne l'imprime pas) :
 *   « Worker terminated due to reaching memory limit: JS heap out of memory »
 *   at [kOnExit] (node:internal/worker:398:26)
 *
 * La colonne `fileDevtools` est le juge de paix : elle suit le nombre de rendus
 * À L'UNITÉ avant le correctif (10, 20, 30 … 220), ce qui prouve du même coup
 * que le `globalThis` du worker Nitro est bien celui que voit le rendu Vue.
 *
 * ─── Sonde mémoire ──────────────────────────────────────────────────────────
 * Le relevé passe par `/api/__mem?gc=1`, une route de DIAGNOSTIC qui n'existe
 * pas dans l'arbre : ce script l'écrit dans le paquet marketing au démarrage et
 * la retire en sortant (y compris sur Ctrl-C). Elle doit vivre dans
 * `server/api/` pour s'exécuter DANS le worker — une mesure prise ailleurs
 * décrirait le mauvais tas.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const PROBE_PATH = resolve(REPO_ROOT, 'packages/marketing/server/api/__mem.get.ts')

const PORT = process.env.PORT || '3141'
const ROUNDS = Number(process.env.ROUNDS || 25)
const BASE = `http://localhost:${PORT}`

const URLS = (process.env.URLS || [
    '/',
    '/why-origam',
    '/installation',
    '/roadmap',
    '/privacy',
    '/support',
    '/contact',
    '/components',
    '/composables',
    '/types'
].join(',')).split(',')

/*
 * La sonde s'exécute dans le worker Nitro. `gc()` y est obtenu à chaud via
 * `v8.setFlagsFromString('--expose_gc')` : on ne peut pas passer de flag Node
 * à un worker que nitropack crée lui-même, et sans GC forcé la courbe mesure
 * la paresse du ramasse-miettes plutôt que la rétention.
 */
const PROBE_SOURCE = `// #248 — sonde de diagnostic écrite par packages/tests/bench/marketing-ssr-leak.mjs.
// Générée à la volée puis supprimée : ne pas committer, ne pas éditer.
import v8 from 'node:v8'
import vm from 'node:vm'
import { isMainThread, threadId } from 'node:worker_threads'

let gcFn

function forceGc () {
    if (!gcFn) {
        v8.setFlagsFromString('--expose_gc')
        gcFn = vm.runInNewContext('gc')
        v8.setFlagsFromString('--no-expose_gc')
    }
    // Deux passes : la première libère, la seconde ramasse ce qu'elle a délié.
    gcFn(); gcFn()
}

export default defineEventHandler((event) => {
    const query = getQuery(event)
    if (query.gc) forceGc()

    const stats = v8.getHeapStatistics()
    const usage = process.memoryUsage()

    return {
        threadId,
        isMainThread,
        heapUsedMB: +(usage.heapUsed / 1048576).toFixed(1),
        heapTotalMB: +(usage.heapTotal / 1048576).toFixed(1),
        rssMB: +(usage.rss / 1048576).toFixed(1),
        heapSizeLimitMB: +(stats.heap_size_limit / 1048576).toFixed(1),
        devtoolsQueue: Array.isArray(globalThis.__VUE_DEVTOOLS_PLUGINS__)
            ? globalThis.__VUE_DEVTOOLS_PLUGINS__.length
            : null
    }
})
`

function installProbe () {
    mkdirSync(dirname(PROBE_PATH), { recursive: true })
    writeFileSync(PROBE_PATH, PROBE_SOURCE, 'utf-8')
}

function removeProbe () {
    rmSync(PROBE_PATH, { force: true })
}

async function probe () {
    const res = await fetch(`${BASE}/api/__mem?gc=1`, { signal: AbortSignal.timeout(120_000) })
    if (!res.ok) throw new Error(`sonde HTTP ${res.status} — le worker a probablement été tué`)
    return res.json()
}

async function main () {
    if (process.argv.includes('--install-probe')) {
        installProbe()
        process.stdout.write(`sonde écrite : ${PROBE_PATH}\n`)
        process.stdout.write('DÉMARRER le serveur de dev MAINTENANT (la route est scannée au boot).\n')
        return
    }

    if (process.argv.includes('--remove-probe')) {
        removeProbe()
        process.stdout.write(`sonde retirée : ${PROBE_PATH}\n`)
        return
    }

    let first
    try {
        first = await probe()
    } catch (error) {
        console.error(`⛔ la sonde ne répond pas : ${error.message}`)
        console.error('   Déposer la sonde PUIS (re)démarrer le serveur de dev :')
        console.error('     node packages/tests/bench/marketing-ssr-leak.mjs --install-probe')
        console.error('   Nitro scanne `server/api/` au boot ; une route ajoutée à chaud reste 404.')
        process.exitCode = 1
        return
    }

    process.stdout.write(
        `worker thread=${first.threadId} isMainThread=${first.isMainThread} `
        + `limite de tas=${first.heapSizeLimitMB} Mo\n\n`
    )

    const started = Date.now()
    console.log(['tour', 'rendus', 'heapUsed', 'heapTotal', 'rss', 'fileDevtools', 'écoulé'].join('\t'))

    for (let round = 1; round <= ROUNDS; round++) {
        for (const url of URLS) {
            try {
                const res = await fetch(BASE + url, { signal: AbortSignal.timeout(300_000) })
                await res.arrayBuffer()
            } catch (error) {
                console.log(`  !! ${url} → ${error.message}`)
            }
        }

        let sample
        try {
            sample = await probe()
        } catch (error) {
            console.log(`\n⛔ tour ${round} : ${error.message}`)
            console.log('   C\'est la reproduction. Vérifier le journal du serveur de dev :')
            console.log('   « Worker terminated due to reaching memory limit: JS heap out of memory »')
            process.exitCode = 1
            return
        }

        console.log([
            round,
            round * URLS.length,
            sample.heapUsedMB,
            sample.heapTotalMB,
            sample.rssMB,
            sample.devtoolsQueue,
            `${((Date.now() - started) / 1000).toFixed(0)}s`
        ].join('\t'))
    }
}

await main()
