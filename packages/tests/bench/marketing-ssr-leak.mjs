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
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *   # 1. un serveur de dev marketing À NOUS, jamais :3000 (~150 worktrees)
 *   DATABASE_URL="postgres://…" NUXT_IGNORE_LOCK=1 \
 *     pnpm -F @origam/marketing dev --port 3141
 *
 *   # 2. la charge
 *   PORT=3141 ROUNDS=120 node packages/tests/bench/marketing-ssr-leak.mjs
 *
 * `ROUNDS` × `URLS.length` rendus au total. Sur `develop` d'avant le correctif,
 * ~1 100 rendus suffisaient à tuer le worker (limite de tas mesurée à 4 144 Mo).
 *
 * ─── Lire le verdict ────────────────────────────────────────────────────────
 * La colonne `heapUsed` est relevée APRÈS un `gc()` forcé, donc elle mesure ce
 * qui est RETENU, pas les déchets en attente. Sans cette précaution on mesure
 * le rythme du ramasse-miettes et toute application a l'air de fuir.
 *
 *   heapUsed plat            → pas de fuite (au pire un pic transitoire)
 *   heapUsed linéaire        → fuite ; la pente donne le coût par rendu
 *
 * Mesuré sur ce dépôt, mêmes 10 pages, 25 tours (250 rendus), machine locale :
 *
 *   avant le correctif   186,6 → 1 084,2 Mo   (+897 Mo, ~3,75 Mo / rendu)
 *   après le correctif   188,5 →   199,5 Mo   (+11 Mo, oscillant)
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
    installProbe()
    process.on('exit', removeProbe)
    for (const signal of ['SIGINT', 'SIGTERM']) {
        process.on(signal, () => { removeProbe(); process.exit(130) })
    }

    // Nitro recharge le worker quand un fichier de `server/` change : on laisse
    // ce rechargement se produire AVANT de commencer à mesurer, sinon le tour 1
    // relève un worker neuf et la pente démarre au mauvais endroit.
    process.stdout.write('sonde installée, attente du rechargement Nitro…\n')
    let first
    for (let attempt = 0; ; attempt++) {
        try { first = await probe(); break } catch (error) {
            if (attempt >= 60) throw error
            await new Promise((r) => setTimeout(r, 1000))
        }
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
