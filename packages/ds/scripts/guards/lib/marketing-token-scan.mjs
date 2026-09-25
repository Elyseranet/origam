/*********************************************************
 * Scanner — les canaux de token du site marketing (#958)
 *
 * @description
 * ⛔ POURQUOI CE FICHIER EXISTE. `token-var-channels` pose exactement la
 * bonne question — « toute variable `var(--origam-…)` lue doit être déclarée
 * quelque part » — mais il ne la pose qu'à `packages/ds/`. Le site marketing,
 * qui est le plus gros consommateur de tokens du dépôt et sa vitrine, était
 * hors de son périmètre. Mesuré le 2026-09-25 sur `develop` @ `198853216` :
 * **841 lectures mortes, 52 noms distincts**, dont 151 sur les deux seuls
 * noms que #958 avait recensés.
 *
 * @description
 * Le défaut est invisible par construction, dans les deux sous-classes :
 *   - `var(--x, 1rem)` — le repli peint, la page est belle, et le canal de
 *     thème est mort. Un thème de marque qui règle sa police ne bouge rien.
 *   - `var(--x)` sans repli — la déclaration entière est jetée par le
 *     navigateur (custom property invalide). Là le rendu EST cassé, mais
 *     silencieusement : pas d'erreur console, pas de test rouge.
 *
 * @description
 * ⛔ CE SCANNER N'EST PAS UNE COPIE DE `token-var-channels`. Le verdict est
 * délégué à son `analyseChannels` (aucun doublon de la logique de décision) ;
 * ce qui change, et qui ne pouvait pas être réutilisé, c'est la COLLECTE :
 *
 *   1. **L'ensemble émetteur est double.** Le marketing déclare légitimement
 *      ses propres noms sous le préfixe `--origam-` — `_shared.css` pose
 *      `--origam-font-size---hero`, `--origam-radius---card`, … à
 *      `:root:root`, et `themes/*.theme.ts` en pose d'autres sous forme de
 *      clés d'objet. Un nom déclaré côté marketing est un canal VIVANT ;
 *      ne compter que les feuilles du DS produirait des centaines de fausses
 *      accusations.
 *   2. **La portée des déclarations est GLOBALE, pas par fichier.** Côté DS,
 *      un `--x:` posé dans un `<style scoped>` est un « let » CSS local au
 *      composant. Côté marketing, `_shared.css` est une feuille globale que
 *      chaque page lit : la localité par fichier n'a pas de sens ici.
 *   3. **Les consommateurs ne sont pas que des `.vue`.** Les feuilles
 *      `assets/css/**.css`, le `.scss` partagé et les thèmes `.ts` lisent
 *      aussi des tokens.
 *
 * @description
 * ⛔ LA DIRECTION « DORMANT » N'EST PAS REPRISE, DÉLIBÉRÉMENT. Côté DS,
 * « ce token n'est lu par personne » est un défaut : la feuille publiée
 * transporte des octets morts. Côté marketing, un token du DS que le site
 * ne lit pas est le cas NORMAL — le site consomme une fraction du catalogue.
 * Reporter les ~2 900 autres serait du bruit pur, et un garde bruyant se
 * fait désactiver.
 ********************************************************/

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parse as parseSFC } from 'vue/compiler-sfc'
import { stripComments } from './scss-scan.mjs'
import { findVarReads, findVarDeclarations } from './css-var-scan.mjs'
import { listRepoFiles } from './git-files.mjs'

/*********************************************************
 * Répertoires qu'on ne descend jamais — CEINTURE, plus bretelles
 *
 * @description
 * ⛔ Depuis #966 ce n'est PLUS la défense principale : l'énumération passe par
 * l'index git (`listRepoFiles`), qui exclut tout artefact de build parce que
 * `.gitignore` le fait déjà. Cette liste reste comme seconde barrière — si un
 * jour un arbre généré se retrouve SUIVI par erreur, il sera encore sauté.
 *
 * @description
 * Elle est conservée aussi comme pièce à conviction : elle ne contenait pas
 * `public/`, et c'est tout le défaut de #966. Une liste de noms à sauter ne
 * peut pas contenir le nom du prochain artefact ; l'index git, lui, le sait
 * déjà. C'est la raison pour laquelle la source de vérité a changé plutôt que
 * cette liste de s'allonger.
 ********************************************************/
export const IGNORED_DIRS = new Set([ 'node_modules', '.nuxt', '.output', 'dist', '.data' ])

/** Extensions qui peuvent porter un `var(--origam-…)` ou une déclaration. */
const SCANNED_EXT = /\.(vue|css|scss|ts|mts)$/

/*********************************************************
 * Une clé d'objet TypeScript est une DÉCLARATION de token
 *
 * @description
 * Un thème marketing ne s'écrit pas en CSS mais en objet :
 *
 *     export const GLASS_THEME = {
 *         vars: { '--origam-color---btn-primary-bg': '#7c3aed' }
 *     }
 *
 * `findVarDeclarations` lit du CSS et ne voit rien ici — la syntaxe est
 * `'--x':`, pas `--x:`. Sans cette passe, `origam-reset.generated.ts` (≈2 700
 * re-déclarations de vars de composant) serait invisible et chacune de ses
 * cibles serait accusée à tort.
 ********************************************************/
const TS_DECLARATION = /['"`](--origam-[A-Za-z0-9_-]+)['"`]\s*:/g

/*********************************************************
 * walkSources — énumère les fichiers scannables d'un arbre, PAR L'INDEX GIT
 *
 * @description
 * ⛔ CE N'EST PLUS UN PARCOURS DE DISQUE (#966). L'ancienne version descendait
 * `readdirSync` en sautant `IGNORED_DIRS`, et balayait donc
 * `packages/marketing/public/stories/` — 35 Mo de bundle Histoire, zéro
 * fichier suivi. Voir `lib/git-files.mjs` pour la mesure complète et pourquoi
 * l'artefact fabriquait des violations *et* en effaçait.
 *
 * @param root      racine absolue à énumérer
 * @param repoRoot  racine du dépôt git (défaut : `root`, pour un arbre autonome)
 * @returns string[] chemins absolus, triés
 ********************************************************/
export function walkSources (root, repoRoot = root) {
    return listRepoFiles(root, repoRoot)
        .filter((full) => SCANNED_EXT.test(full) && !full.endsWith('.d.ts'))
        .filter((full) => !path.relative(repoRoot, full).split(path.sep).some((seg) => IGNORED_DIRS.has(seg)))
}

/*********************************************************
 * splitSource — sépare le texte « style » du texte « script »
 *
 * @description
 * La distinction compte : seul le texte de style peut porter une
 * déclaration CSS (`--x: v;`), tandis que les deux peuvent porter une
 * lecture `var(--x)`. Un `.vue` est découpé par le compilateur SFC plutôt
 * que par une expression régulière — un `</style>` dans une chaîne de
 * caractères a déjà cassé ce genre de découpe ailleurs.
 *
 * @param filePath  chemin absolu (son extension décide du traitement)
 * @param raw       contenu brut
 * @returns { style, script } deux textes, éventuellement vides
 ********************************************************/
export function splitSource (filePath, raw) {
    if (filePath.endsWith('.vue')) {
        const { descriptor } = parseSFC(raw, { filename: filePath })
        return {
            style: descriptor.styles.map((s) => stripComments(s.content)).join('\n'),
            script: [ descriptor.script, descriptor.scriptSetup ].filter(Boolean).map((s) => s.content).join('\n')
        }
    }

    if (filePath.endsWith('.css') || filePath.endsWith('.scss')) {
        return { style: stripComments(raw), script: '' }
    }

    return { style: '', script: raw }
}

/*********************************************************
 * collectSources — la passe de collecte, sans système de fichiers
 *
 * @description
 * Pure : elle prend une `Map<relPath, raw>` et rend les deux ensembles dont
 * `analyseChannels` a besoin. C'est ce qui permet au self-test de la nourrir
 * avec des sources synthétiques plutôt qu'avec le vrai arbre — un self-test
 * qui dépend de l'état réel du dépôt mesure le dépôt, pas le détecteur.
 *
 * @param sources  Map<relPath, rawContent>
 * @returns { consumerTexts: Map<relPath, text>, localDeclarations: Set<string> }
 *          `consumerTexts` agrège style + script par fichier : c'est ce que
 *          `analyseChannels` balaie pour la direction « canal mort ».
 ********************************************************/
export function collectSources (sources) {
    const consumerTexts = new Map()
    const localDeclarations = new Set()

    for (const [ relPath, raw ] of sources) {
        const { style, script } = splitSource(relPath, raw)

        for (const decl of findVarDeclarations(style)) localDeclarations.add(decl.name)
        for (const match of script.matchAll(TS_DECLARATION)) localDeclarations.add(match[1])

        const merged = `${style}\n${script}`
        if (findVarReads(merged).length) consumerTexts.set(relPath, merged)
    }

    return { consumerTexts, localDeclarations }
}

/*********************************************************
 * readEmittedFromSheets — l'ensemble émetteur du DS
 *
 * @param tokensDir  `packages/ds/src/assets/css/tokens`
 * @returns Set<string> tout `--origam-…` déclaré dans les feuilles publiées
 ********************************************************/
export function readEmittedFromSheets (tokensDir) {
    const emitted = new Set()

    for (const file of readdirSync(tokensDir).filter((f) => f.endsWith('.css'))) {
        const content = readFileSync(path.join(tokensDir, file), 'utf8')
        for (const decl of findVarDeclarations(content)) emitted.add(decl.name)
    }

    return emitted
}

/*********************************************************
 * readSourceTree — lit un arbre en `Map<relPath, raw>`
 *
 * @param root     racine absolue à scanner
 * @param relRoot  racine servant à calculer les chemins relatifs affichés
 * @returns Map<relPath, rawContent>
 ********************************************************/
export function readSourceTree (root, relRoot) {
    const sources = new Map()

    // `relRoot` est la racine du dépôt : c'est elle qui sert de cwd à git.
    for (const file of walkSources(root, relRoot)) {
        sources.set(path.relative(relRoot, file), readFileSync(file, 'utf8'))
    }

    return sources
}
