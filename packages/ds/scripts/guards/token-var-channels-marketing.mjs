#!/usr/bin/env node
/**
 * Guard — jumeau marketing de `token-var-channels` (#958).
 *
 * Toute variable `var(--origam-…)` que le site marketing LIT doit être
 * déclarée quelque part : dans une feuille de tokens du DS
 * (`packages/ds/src/assets/css/tokens/*.css`) ou dans la couche marketing
 * elle-même (`assets/css/**.css`, `assets/scss/*.scss`, un `<style>` de
 * `.vue`, ou une clé d'objet dans `themes/*.ts`). Tout le reste est un canal
 * de thème mort.
 *
 * LE DÉFAUT QUI L'A FAIT NAÎTRE (#958)
 * -------------------------------------
 * Le marketing lisait `--origam-font-family---mono` et
 * `--origam-font-size---base` — 151 fois, dans 28 fichiers — deux noms qui
 * n'existent nulle part. La grammaire du dépôt
 * (`packages/ds/scripts/token-name.mjs`) sépare le bloc BEM par un DOUBLE
 * TIRET BAS : les vrais noms sont `--origam-font__family---mono` et
 * `--origam-font__size---{xs|sm|md|lg|…}`. Un tiret simple, propagé par
 * copier-coller, et `base` qui n'est même pas un échelon de l'échelle.
 *
 * Chaque lecture portait un repli littéral (`monospace`, `1rem`), donc rien
 * ne cassait à l'écran : le repli peignait toujours. C'est exactement ce que
 * le site est censé démontrer — qu'on thème origam par ses canaux — et
 * c'était faux à 151 endroits sans qu'aucun test, aucun lint, aucune console
 * ne le dise.
 *
 * POURQUOI UN JUMEAU ET PAS UNE EXTENSION
 * ----------------------------------------
 * ⛔ Le VERDICT n'est pas dupliqué : il est délégué à `analyseChannels`,
 * importé de `token-var-channels.mjs`. Ce qui diffère est la COLLECTE, et
 * elle diffère de trois manières qui interdisaient d'élargir simplement le
 * périmètre de l'existant — voir l'en-tête de
 * `lib/marketing-token-scan.mjs` pour le détail :
 *
 *   1. l'ensemble émetteur est DOUBLE (feuilles du DS + couche marketing,
 *      qui déclare légitimement ses propres `--origam-…`) ;
 *   2. la portée des déclarations marketing est GLOBALE (`_shared.css` à
 *      `:root:root`), là où côté DS un `--x:` dans un `<style scoped>` est un
 *      « let » CSS local au composant ;
 *   3. les consommateurs ne sont pas que des `.vue` (feuilles `.css`, `.scss`,
 *      thèmes `.ts`).
 *
 * S'y ajoute une raison de lisibilité : deux baselines séparées. La dette du
 * DS et celle du marketing n'ont ni la même cause ni le même propriétaire ;
 * les mélanger dans un fichier rendrait chaque diff illisible.
 *
 * ⛔ LA DIRECTION « DORMANT » N'EST PAS REPRISE — c'est un choix, pas un
 * oubli. « Ce token n'est lu par personne » est un défaut dans une
 * bibliothèque publiée ; côté consommateur c'est le cas normal, le site lit
 * une fraction du catalogue. Un garde qui reporterait les ~2 900 autres
 * serait du bruit, et un garde bruyant se fait désactiver.
 *
 * LES DEUX SOUS-CLASSES, ÉTIQUETÉES
 * ----------------------------------
 * `analyseChannels` distingue déjà « avec repli » (rendu correct aujourd'hui,
 * canal mort) de « sans repli » (déclaration jetée par le navigateur, rendu
 * réellement cassé). La distinction ne change pas le verdict — dans les deux
 * cas le canal ne transporte rien — mais elle change la priorité de
 * réparation, donc elle est imprimée. `--why` en donne le décompte.
 *
 * Run: `node packages/ds/scripts/guards/token-var-channels-marketing.mjs`
 *      `node packages/ds/scripts/guards/token-var-channels-marketing.mjs --why`
 *      (ou `pnpm -F origam guards:token-var-channels-marketing`)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyseChannels } from './token-var-channels.mjs'
import { collectSources, readEmittedFromSheets, readSourceTree } from './lib/marketing-token-scan.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const TOKENS_CSS_DIR = path.join(DS_ROOT, 'src/assets/css/tokens')
const MARKETING_ROOT = path.join(REPO_ROOT, 'packages/marketing')

const BASELINE_PATH = path.join(__dirname, 'baseline/token-var-channels-marketing.json')

function run () {
    const showWhy = process.argv.includes('--why')
    const updateBaseline = process.argv.includes('--update-baseline')

    const dsEmitted = readEmittedFromSheets(TOKENS_CSS_DIR)
    const sources = readSourceTree(MARKETING_ROOT, REPO_ROOT)
    const { consumerTexts, localDeclarations } = collectSources(sources)

    // L'ensemble émetteur vu par le marketing : les feuilles du DS PLUS tout
    // ce que la couche marketing déclare elle-même. Un nom déclaré côté
    // marketing est un canal vivant — ne compter que le DS produirait des
    // centaines de fausses accusations sur `_shared.css`.
    const emittedVars = new Set([ ...dsEmitted, ...localDeclarations ])

    const { deadChannels } = analyseChannels({ vueStyles: consumerTexts, emittedVars })

    if (updateBaseline) {
        writeBaseline(BASELINE_PATH, new Set(deadChannels.keys()))
        console.log(`Baseline updated: ${deadChannels.size} dead channel(s) in packages/marketing.`)
        return 0
    }

    const coverageNote = `Couverture : ${sources.size} fichier(s) source de packages/marketing scanné(s)`
        + ` (.vue/.css/.scss/.ts), dont ${consumerTexts.size} lisant au moins un var(--origam-…) ;`
        + ` ensemble émetteur = ${dsEmitted.size} du DS + ${localDeclarations.size} déclarés côté marketing.`
        + ' Direction « dormant » NON couverte, délibérément (voir l\'en-tête).'

    const exitCode = report({
        guardName: 'token-var-channels-marketing — every var(--origam-…) packages/marketing reads must be declared in a DS token sheet or in the marketing layer itself',
        baselinePath: BASELINE_PATH,
        currentIds: new Set(deadChannels.keys()),
        detailsById: deadChannels,
        coverageNote,
        fixHint: 'Soit la lecture nomme mal un token existant — corriger le nom en suivant la grammaire'
            + ' (`--origam-{bloc}__{enfant}---{propriete}`, double tiret bas pour le bloc BEM, triple'
            + ' tiret pour la propriete ; cf. packages/ds/scripts/token-name.mjs) ; soit le token est'
            + ' propre au marketing et doit etre declare dans'
            + ' packages/marketing/src/assets/css/themes/_shared.css comme ses voisins'
            + ' (--origam-font-size---hero, --origam-radius---card, …). Garder un repli dans les deux'
            + ' cas : var(--origam-font__size---lg, 1rem) est la forme que CLAUDE.md recommande.'
    })

    if (showWhy) {
        console.log('\n--why: canaux morts par sous-classe')
        let noFallback = 0
        let fallback = 0
        for (const detail of deadChannels.values()) {
            if (detail.includes('valeur invalide')) noFallback++
            else fallback++
        }
        console.log(`  sans repli (rendu reellement casse, declaration jetee) : ${noFallback}`)
        console.log(`  avec repli (canal mort, rendu OK aujourd'hui)          : ${fallback}`)
    }

    return exitCode
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    const exitCode = run()
    if (exitCode !== undefined) process.exit(exitCode)
}
