/*********************************************************
 * Self-test — `lib/marketing-token-scan.mjs` (#958)
 *
 * @description
 * ⛔ POURQUOI IL EXISTE. Un garde de référence croisée a l'air trivialement
 * juste — « ce nom est-il dans cet ensemble » — et c'est précisément pour ça
 * qu'il peut devenir MUET sans que rien ne bouge. Un détecteur muet et un
 * dépôt propre rendent le même vert. Ici le risque est concentré dans la
 * COLLECTE, pas dans le verdict : le verdict est délégué à
 * `analyseChannels`, déjà épinglé par `token-var-channels.selftest.mjs`.
 *
 * @description
 * Les quatre façons dont ce scanner peut devenir aveugle, chacune épinglée
 * ci-dessous parce que chacune s'est déjà produite dans un scanner voisin de
 * ce dépôt :
 *
 *   1. **Le découpage du SFC casse** — plus de `<style>` lu, donc plus une
 *      seule lecture vue : `PASS — 0 violation` sur un fichier truffé de
 *      canaux morts.
 *   2. **Les déclarations d'objet TS cessent d'être vues** — `themes/*.ts` et
 *      `origam-reset.generated.ts` déclarent ≈2 700 vars sous forme de clés
 *      `'--origam-x':`. Les perdre ne rend pas le garde muet, il le rend
 *      HURLANT : des centaines de fausses accusations, ce qui le fait
 *      désactiver aussi sûrement.
 *   3. **La portée globale des déclarations marketing est perdue** —
 *      `_shared.css` déclare `--origam-font-size---hero` une fois pour tout
 *      le site. Si une déclaration ne compte que dans son propre fichier,
 *      chaque page qui la lit est faussement accusée.
 *   4. **Le parcours de l'arbre attrape `node_modules` / `.nuxt`** — le garde
 *      se met à mesurer des dépendances et du code généré.
 *
 * @description
 * La section MUTATION est la partie qu'une liste de fixtures ne peut pas
 * prouver : on part d'un arbre où tout résout proprement, on renomme UNE
 * déclaration — exactement la classe de régression de #958, un séparateur de
 * bloc BEM écrit avec un tiret simple — et on exige que le verdict bascule de
 * 0 à exactement 1 violation, sur exactement ce nom. Un self-test qui ne
 * vérifie que des fixtures peut passer alors que le détecteur est inerte.
 *
 * Run: node packages/ds/scripts/guards/lib/marketing-token-scan.selftest.mjs
 ********************************************************/

import path from 'node:path'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { collectSources, splitSource, walkSources, IGNORED_DIRS } from './marketing-token-scan.mjs'
import { analyseChannels } from '../token-var-channels.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }
const ok = (msg) => console.log(`  ok    ${msg}`)

console.log('─'.repeat(70))
console.log('Self-test: marketing-token-scan (#958)')
console.log('─'.repeat(70))

/*********************************************************
 * Partie 1 — splitSource : style et script, par type de fichier
 ********************************************************/
console.log('\nsplitSource — un `.vue` est découpé par le compilateur SFC, pas par une regex :')

{
    const sfc = [
        '<script setup lang="ts">',
        'const s = { \'--origam-page---bg\': \'red\' }',
        '</script>',
        '<template><div /></template>',
        '<style scoped>',
        '.a { font-size: var(--origam-font__size---md, 1rem); }',
        '</style>'
    ].join('\n')

    const { style, script } = splitSource('/x/Comp.vue', sfc)

    if (style.includes('--origam-font__size---md') && !style.includes('--origam-page---bg')) {
        ok('le `<style>` est isolé du `<script>`')
    } else fail(`découpe du SFC — style = ${JSON.stringify(style)}`)

    if (script.includes('--origam-page---bg') && !script.includes('font-size:')) {
        ok('le `<script>` est isolé du `<style>`')
    } else fail(`découpe du SFC — script = ${JSON.stringify(script)}`)
}

{
    // ⛔ Une feuille `.css` est TOUTE du style. La traiter comme du script
    // perdrait ses déclarations : `_shared.css` est le cas réel, et le
    // résultat serait des fausses accusations sur tout le site.
    const { style, script } = splitSource('/x/_shared.css', ':root:root { --origam-font-size---hero: 5.25rem; }')
    if (style.includes('--origam-font-size---hero') && script === '') {
        ok('un `.css` est intégralement du style')
    } else fail(`découpe du .css — style = ${JSON.stringify(style)}, script = ${JSON.stringify(script)}`)
}

{
    const { style, script } = splitSource('/x/glass.theme.ts', 'export const T = { vars: { \'--origam-btn---color\': \'#fff\' } }')
    if (script.includes('--origam-btn---color') && style === '') {
        ok('un `.ts` est intégralement du script')
    } else fail(`découpe du .ts — style = ${JSON.stringify(style)}, script = ${JSON.stringify(script)}`)
}

{
    // Les commentaires sont retirés du style : un nom cité dans un
    // commentaire n'est pas une lecture, et l'accuser enverrait quelqu'un
    // chasser un token que personne ne consomme.
    const { style } = splitSource('/x/a.css', '/* var(--origam-ghost---dead) */\n.a { color: red; }')
    if (!style.includes('--origam-ghost---dead')) {
        ok('un `var()` en commentaire n\'est pas une lecture')
    } else fail('les commentaires ne sont pas retirés du style')
}

/*********************************************************
 * Partie 2 — collectSources : la clé d'objet TS est une DÉCLARATION
 *
 * Le risque ici n'est pas le silence mais le bruit : `origam-reset.generated.ts`
 * déclare ≈2 700 vars de composant sous cette forme. Les perdre transforme
 * chacune en fausse accusation.
 ********************************************************/
console.log('\ncollectSources — une clé d\'objet `\'--origam-x\':` dans un `.ts` est une déclaration :')

{
    const sources = new Map([
        [ 'themes/glass.theme.ts', 'export const T = { vars: { \'--origam-color---btn-primary-bg\': \'#7c3aed\' } }' ],
        [ 'pages/a.vue', '<style>.a { background: var(--origam-color---btn-primary-bg, red); }</style>' ]
    ])

    const { consumerTexts, localDeclarations } = collectSources(sources)

    if (localDeclarations.has('--origam-color---btn-primary-bg')) {
        ok('la clé d\'objet est collectée comme déclaration')
    } else fail(`clé d'objet TS — déclarations = [${[ ...localDeclarations ].join(', ')}]`)

    const { deadChannels } = analyseChannels({ vueStyles: consumerTexts, emittedVars: localDeclarations })
    if (deadChannels.size === 0) {
        ok('la page qui la lit n\'est donc pas accusée')
    } else fail(`fausse accusation — [${[ ...deadChannels.keys() ].join(', ')}]`)

    // ⛔ Précision : la même clé SANS déclaration doit rester accusée.
    // Sinon la passe TS blanchirait n'importe quel nom simplement cité.
    const orphan = collectSources(new Map([ [ 'pages/b.vue', '<style>.a { color: var(--origam-orphan---x, red); }</style>' ] ]))
    const verdict = analyseChannels({ vueStyles: orphan.consumerTexts, emittedVars: new Set() })
    if (verdict.deadChannels.size === 1) {
        ok('un nom que rien ne déclare reste accusé')
    } else fail(`recall perdu — ${verdict.deadChannels.size} violation(s)`)
}

/*********************************************************
 * Partie 3 — la portée des déclarations marketing est GLOBALE
 *
 * ⛔ C'est LA différence avec `token-var-channels` côté DS, où un `--x:` dans
 * un `<style scoped>` est un « let » CSS local au composant. Ici
 * `_shared.css` déclare une fois pour tout le site : une déclaration vue dans
 * UN fichier doit couvrir les lectures de TOUS les autres.
 ********************************************************/
console.log('\ncollectSources — une déclaration de `_shared.css` couvre les lectures des autres fichiers :')

{
    const sources = new Map([
        [ 'assets/css/themes/_shared.css', ':root:root { --origam-font-size---hero: 5.25rem; }' ],
        [ 'components/HomeHero.vue', '<style>.h { font-size: var(--origam-font-size---hero, 5.25rem); }</style>' ],
        [ 'pages/index.vue', '<style>.t { font-size: var(--origam-font-size---hero, 5.25rem); }</style>' ]
    ])

    const { consumerTexts, localDeclarations } = collectSources(sources)
    const { deadChannels } = analyseChannels({ vueStyles: consumerTexts, emittedVars: localDeclarations })

    if (deadChannels.size === 0) {
        ok('les deux lecteurs distants sont couverts par la feuille partagée')
    } else fail(`portée globale perdue — [${[ ...deadChannels.keys() ].join(', ')}]`)
}

{
    // Un fichier qui ne lit AUCUN token ne doit pas entrer dans l'ensemble
    // des consommateurs : sinon la couverture annoncée est fausse.
    const { consumerTexts } = collectSources(new Map([
        [ 'utils/plain.ts', 'export const X = 1' ],
        [ 'pages/a.vue', '<style>.a { color: var(--origam-x---y); }</style>' ]
    ]))

    if (consumerTexts.size === 1 && consumerTexts.has('pages/a.vue')) {
        ok('un fichier sans lecture n\'est pas compté comme consommateur')
    } else fail(`consommateurs = [${[ ...consumerTexts.keys() ].join(', ')}]`)
}

/*********************************************************
 * Partie 4 — walkSources ignore les arbres générés
 ********************************************************/
console.log('\nwalkSources — `node_modules`, `.nuxt`, `.output`, `dist` sont sautés :')

{
    for (const dir of [ 'node_modules', '.nuxt', '.output', 'dist' ]) {
        if (!IGNORED_DIRS.has(dir)) fail(`${dir} n'est pas dans IGNORED_DIRS`)
    }
    if (IGNORED_DIRS.has('node_modules') && IGNORED_DIRS.has('.nuxt')) {
        ok('la liste d\'exclusion couvre les arbres générés')
    }

    /*
     * ⛔ Preuve d'EXÉCUTION, pas seulement de constante. Vérifier que
     * `IGNORED_DIRS` contient bien les quatre noms ne prouve rien : le
     * parcours pourrait avoir cessé de consulter l'ensemble. On monte donc un
     * VRAI DÉPÔT GIT sur disque et on exige que `walkSources` ramène les
     * fichiers légitimes et SEULEMENT eux.
     *
     * ⛔ POURQUOI UN DÉPÔT GIT ET PLUS UN SIMPLE RÉPERTOIRE (#966). Depuis
     * #966, l'énumération passe par `git ls-files` et non plus par
     * `readdirSync` : un arbre non versionné ne mesure donc plus rien. C'est
     * le prix — et le sens — du correctif, puisque c'est `.gitignore` qui
     * porte désormais la connaissance de « ceci est un artefact de build ».
     */
    const tmp = mkdtempSync(path.join(tmpdir(), 'origam-mts-'))
    try {
        const git = (...args) => execFileSync('git', args, { cwd: tmp, stdio: 'ignore' })
        git('init', '-q')
        git('config', 'user.email', 'selftest@origam.local')
        git('config', 'user.name', 'selftest')

        mkdirSync(path.join(tmp, 'src'), { recursive: true })
        mkdirSync(path.join(tmp, 'node_modules', 'evil'), { recursive: true })
        mkdirSync(path.join(tmp, '.nuxt'), { recursive: true })

        /*
         * ⛔ LE CAS #966 : `public/stories/` est la sortie d'un
         * `pnpm -F @origam/stories build` recopiée dans le `public/` du
         * marketing — 35 Mo, zéro fichier suivi, ignorée par
         * `packages/marketing/.gitignore:16`. Elle N'EST PAS dans
         * `IGNORED_DIRS` et ne l'a jamais été : c'est exactement pour ça que
         * la liste de noms ne pouvait pas être la défense. Ce fichier porte
         * les deux moitiés du défaut — une LECTURE (qui fabriquait une fausse
         * violation) et une DÉCLARATION (qui, entrant dans l'ensemble
         * émetteur, faisait passer de vraies entrées de baseline en
         * « STALE — already fixed »).
         */
        writeFileSync(path.join(tmp, '.gitignore'), [ 'node_modules', '.nuxt', 'public/stories', '' ].join('\n'))
        mkdirSync(path.join(tmp, 'public', 'stories', 'assets'), { recursive: true })
        writeFileSync(
            path.join(tmp, 'public', 'stories', 'assets', 'style-hash.css'),
            '.a { color: var(--origam-bundle-invented---chan); --origam-x---y: 0px; }'
        )

        writeFileSync(path.join(tmp, 'src', 'a.css'), ':root { --origam-x---y: 1px; }')
        writeFileSync(path.join(tmp, 'src', 'types.d.ts'), 'declare const x: number')
        writeFileSync(path.join(tmp, 'node_modules', 'evil', 'b.css'), ':root { --origam-evil---z: 1px; }')
        writeFileSync(path.join(tmp, '.nuxt', 'c.ts'), 'export const G = "var(--origam-generated---w)"')

        git('add', '.gitignore', 'src/a.css', 'src/types.d.ts')
        git('commit', '-qm', 'seed')

        /*
         * ⛔ Écrit APRÈS le commit et jamais `git add`é : un fichier source
         * qu'un développeur vient de créer. Il DOIT être balayé. Se limiter à
         * `--cached` introduirait ici un faux négatif neuf — le garde serait
         * vert sur du code fautif tant qu'il n'est pas indexé.
         */
        writeFileSync(path.join(tmp, 'src', 'brand-new.css'), '.b { color: var(--origam-fresh---read); }')

        const found = walkSources(tmp, tmp).map((f) => path.relative(tmp, f)).sort()
        const expected = [ path.join('src', 'a.css'), path.join('src', 'brand-new.css') ]

        if (found.join('|') === expected.join('|')) {
            ok('énumération réelle : les sources versionnées ET la source neuve non indexée sont ramenées')
        } else fail(`énumération réelle — attendu [${expected.join(', ')}], obtenu [${found.join(', ')}]`)

        if (!found.some((f) => f.startsWith('public'))) {
            ok('#966 : un artefact de build ignoré par .gitignore (`public/stories/`) est écarté, bien qu\'absent d\'IGNORED_DIRS')
        } else fail('#966 : `public/stories/` est encore balayé — l\'énumération ne passe pas par l\'index git')

        if (!found.some((f) => f.endsWith('.d.ts'))) {
            ok('les `.d.ts` restent écartés')
        } else fail('un `.d.ts` a été ramené')

        /*
         * ⛔ La conséquence VERDICT, pas seulement la liste de fichiers. Le
         * `--origam-x---y: 0px` du bundle entrait dans l'ensemble émetteur ;
         * pour prouver que l'artefact n'efface plus rien, on vérifie que sa
         * LECTURE inventée ne produit aucune violation et que son nom ne
         * figure dans aucun ensemble.
         */
        const { consumerTexts, localDeclarations } = collectSources(
            new Map(walkSources(tmp, tmp).map((f) => [ path.relative(tmp, f), readFileSync(f, 'utf8') ]))
        )
        const bundleLeaked = [ ...consumerTexts.keys() ].some((f) => f.startsWith('public'))
            || localDeclarations.has('--origam-bundle-invented---chan')

        if (!bundleLeaked) {
            ok('#966 (les deux sens) : le bundle ne fabrique plus de violation et n\'alimente plus l\'ensemble émetteur')
        } else fail('#966 : le bundle contamine encore la collecte')
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
}

/*********************************************************
 * Partie 5 — MUTATION : le scanner doit être SENSIBLE à #958
 *
 * @description
 * État de départ : une feuille marketing qui déclare le nom correct, et une
 * page qui le lit — 0 violation, le canal est vivant. La mutation renomme la
 * DÉCLARATION avec un tiret simple au lieu du double tiret bas, exactement la
 * faute de frappe de #958. La page continue de lire le nom correct ; le
 * verdict doit basculer à exactement 1 violation.
 *
 * @description
 * Puis la mutation symétrique — celle réellement observée dans le dépôt :
 * la déclaration est juste et c'est la LECTURE qui porte le tiret simple.
 * Les deux sens doivent rougir, sinon le garde ne voit que la moitié du
 * défaut qu'il existe pour attraper.
 ********************************************************/
console.log('\nMUTATION — un séparateur de bloc écrit `-` au lieu de `__` doit faire rougir :')

{
    const cleanSources = new Map([
        [ 'assets/css/themes/_shared.css', ':root { --origam-font__family---mono: \'JetBrains Mono\', monospace; }' ],
        [ 'pages/components/index.vue', '<style>code { font-family: var(--origam-font__family---mono, monospace); }</style>' ]
    ])

    const clean = collectSources(cleanSources)
    const before = analyseChannels({ vueStyles: clean.consumerTexts, emittedVars: clean.localDeclarations })

    if (before.deadChannels.size !== 0) {
        fail(`état de départ censé être propre — ${before.deadChannels.size} violation(s)`)
    } else {
        ok('avant mutation : 0 violation (le canal est vivant)')

        // Mutation A — la DÉCLARATION dérive.
        const mutatedDecl = new Map(cleanSources)
        mutatedDecl.set('assets/css/themes/_shared.css', ':root { --origam-font-family---mono: \'JetBrains Mono\', monospace; }')
        const a = collectSources(mutatedDecl)
        const afterA = analyseChannels({ vueStyles: a.consumerTexts, emittedVars: a.localDeclarations })
        const expectedA = 'pages/components/index.vue::--origam-font__family---mono'

        if (afterA.deadChannels.size === 1 && afterA.deadChannels.has(expectedA)) {
            ok('mutation A (déclaration dérivée) : exactement 1 violation, sur le nom lu')
        } else fail(`mutation A — attendu [${expectedA}], obtenu [${[ ...afterA.deadChannels.keys() ].join(', ')}]`)

        // Mutation B — la LECTURE dérive. C'est le cas réel de #958.
        const mutatedRead = new Map(cleanSources)
        mutatedRead.set('pages/components/index.vue', '<style>code { font-family: var(--origam-font-family---mono, monospace); }</style>')
        const b = collectSources(mutatedRead)
        const afterB = analyseChannels({ vueStyles: b.consumerTexts, emittedVars: b.localDeclarations })
        const expectedB = 'pages/components/index.vue::--origam-font-family---mono'

        if (afterB.deadChannels.size === 1 && afterB.deadChannels.has(expectedB)) {
            ok('mutation B (lecture dérivée — le cas réel de #958) : exactement 1 violation')
        } else fail(`mutation B — attendu [${expectedB}], obtenu [${[ ...afterB.deadChannels.keys() ].join(', ')}]`)

        // ⛔ Et la sous-classe doit être distinguée : `--origam-font-size---base`
        // porte un repli (canal mort, rendu OK) ; un même nom SANS repli est un
        // rendu réellement cassé. Le verdict est le même, l'étiquette non — et
        // c'est elle qui pilote la priorité de réparation.
        const withFallback = collectSources(new Map([ [ 'p.vue', '<style>.a { font-size: var(--origam-font-size---base, 1rem); }</style>' ] ]))
        const withoutFallback = collectSources(new Map([ [ 'q.vue', '<style>.a { font-size: var(--origam-font-size---base); }</style>' ] ]))
        const labelA = [ ...analyseChannels({ vueStyles: withFallback.consumerTexts, emittedVars: new Set() }).deadChannels.values() ][0]
        const labelB = [ ...analyseChannels({ vueStyles: withoutFallback.consumerTexts, emittedVars: new Set() }).deadChannels.values() ][0]

        if (labelA?.includes('avec repli') && labelB?.includes('valeur invalide')) {
            ok('les deux sous-classes (avec / sans repli) sont étiquetées distinctement')
        } else fail(`étiquetage des sous-classes — avec = ${labelA}, sans = ${labelB}`)
    }
}

console.log('')
if (failures) {
    console.log(`FAIL — ${failures} cas de self-test en échec.`)
    process.exit(1)
}
console.log('PASS — 4 cas de decoupage, 3 cas de collecte TS, 2 cas de portee globale, 5 cas d\'enumeration (dont 2 pour #966), 4 cas de mutation.')
