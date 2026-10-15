/*
 * Detecteur du garde `spec-coverage` (#824) — la moitie PURE, sans I/O.
 *
 * ─── Ce que le garde repond ──────────────────────────────────────────────
 * « Ce fichier de spec sera-t-il execute par un job de CI, oui ou non ? »
 *
 * Il ne juge PAS si une spec devrait tourner. Il exige seulement qu'une
 * spec qui ne tourne pas soit ENREGISTREE comme telle. L'etat par defaut
 * d'un fichier neuf devient « rouge tant que personne n'a tranche », au
 * lieu du silence complet qu'a subi `rating-field-a11y.spec.ts` (#810,
 * mergee dans d4de5ca8, jamais executee par la CI depuis son ajout).
 *
 * ⛔ POURQUOI CE FICHIER EST SEPARE DU GARDE
 * Les fixtures de `spec-coverage.selftest.mjs` doivent exercer la LOGIQUE
 * DE CLASSEMENT sans dependre du disque ni d'un spawn de Playwright. Meme
 * decoupage que `lib/id-reach.mjs` / `lib/id-reach.selftest.mjs` (#633) et
 * `lib/class-fallthrough.mjs` (#620).
 */

/**
 * Extrait l'ensemble des fichiers de spec d'un rapport JSON `playwright
 * test --list --reporter=json`.
 *
 * ⛔ La recursion n'est pas un exces de prudence. Playwright place `file`
 * sur la suite RACINE de chaque fichier, mais un `test.describe` imbrique
 * produit des sous-suites qui reportent le meme `file`. Une lecture a plat
 * (`json.suites.map(s => s.file)`) marche sur la forme actuelle et cesse de
 * marcher le jour ou le reporter change de forme — en rendant un ensemble
 * VIDE, donc un garde qui trouve « tout couvert ». La recursion + le
 * controle de non-vacuite en aval sont les deux moities de la meme parade.
 *
 * @param report Objet JSON deja parse.
 * @returns Set des chemins de fichiers, tels que Playwright les rapporte.
 */
export function specFilesFromListReport (report) {
    const files = new Set()
    const walk = (node) => {
        if (!node || typeof node !== 'object') return
        if (typeof node.file === 'string' && node.file) files.add(node.file)
        for (const child of node.suites ?? []) walk(child)
        for (const spec of node.specs ?? []) walk(spec)
    }
    for (const suite of report?.suites ?? []) walk(suite)
    return files
}

/**
 * Un chemin de spec est-il dans une aire de BROUILLON que Playwright ignore ?
 *
 * ⛔ Cette fonction doit dire EXACTEMENT ce que dit `scratchDirPatterns()`
 * (`packages/tests/scratch-dirs.const.ts`), sinon le garde et le runner ne
 * parlent plus du meme ensemble de fichiers :
 *   - plus STRICTE que Playwright → le garde signale comme « jamais executee »
 *     une spec que personne n'a jamais voulu executer (faux rouge, et la
 *     pression sera de la baseliner, ce qui pollue le recensement) ;
 *   - plus LACHE → une spec reelle echappe au balayage : c'est le defaut
 *     #824 lui-meme, reintroduit dans l'outil cense l'empecher.
 *
 * La regle de `scratchDirPatterns` : tout repertoire commencant par un point
 * SOUS le `testDir` (`.probe/`, `.results/`, `.report/`). Le fichier lui-meme
 * n'est pas concerne — seuls les segments de REPERTOIRE.
 *
 * @param relPath Chemin relatif au `testDir`, separateurs `/`.
 */
export function isScratchSpecPath (relPath) {
    const segments = relPath.split('/')
    // Le dernier segment est le fichier : on ne juge que les repertoires.
    return segments.slice(0, -1).some((s) => s.startsWith('.') || s === 'node_modules')
}

/**
 * Classe chaque spec du repertoire e2e.
 *
 * @param allSpecs      Noms de fichier presents sur le disque.
 * @param gatedSpecs    Noms de fichier qu'un job de CI executera reellement
 *                      (union des deux configs, mesuree par Playwright).
 * @param baseline      Set des specs deja enregistrees comme non-gardees.
 * @returns {{ungated: string[], newUngated: string[], known: string[], gated: string[]}}
 */
export function classifySpecs (allSpecs, gatedSpecs, baseline) {
    const all = [...new Set(allSpecs)].sort()
    const gated = new Set(gatedSpecs)
    const ungated = all.filter((f) => !gated.has(f))

    return {
        gated: all.filter((f) => gated.has(f)),
        ungated,
        newUngated: ungated.filter((f) => !baseline.has(f)),
        known: ungated.filter((f) => baseline.has(f))
    }
}

/**
 * Prefixe des chemins de spec par leur repertoire de test, pour que deux
 * `testDir` distincts ne partagent pas le meme espace de noms.
 *
 * ⛔ Les ids historiques sont relatifs a `e2e/` (« alert.spec.ts ») et la
 * baseline les stocke ainsi. Une spec d'un AUTRE testDir (`e2e-playground/`)
 * rapportee par Playwright sous son seul nom collisionnerait le jour ou un
 * fichier homonyme existe des deux cotes : l'un serait compte « garde » au
 * titre de l'autre. Le prefixe rend la collision impossible sans renommer
 * une seule entree de la baseline existante.
 *
 * @param files  Iterable de chemins relatifs au testDir.
 * @param dir    Nom du repertoire de test, relatif a `packages/tests`.
 */
export function prefixSpecPaths (files, dir) {
    return new Set([...files].map((f) => `${dir}/${f}`))
}

/**
 * Un job de CI execute-t-il reellement une config Playwright donnee ?
 *
 * Pour les deux configs historiques la reponse est portee par une variable
 * d'environnement de liste blanche, que le garde rejoue. La config playground
 * n'a pas de liste blanche : elle execute tout son `testDir`, et la seule
 * question est donc « un job la lance-t-il ? ». Le garde ne sait pas
 * executer un workflow ; il verifie le maillon textuel de bout en bout :
 * `ci.yml` appelle le script, ET le script appelle la config. Si l'un des
 * deux maillons manque, aucune spec de ce testDir ne compte comme gardee.
 *
 * ⛔ Volontairement STRICT : un faux « non garde » se voit (le garde rougit
 * et dit quoi faire) ; un faux « garde » est le silence que #824 supprime.
 *
 * @param ciYaml        Texte de `.github/workflows/ci.yml` (ou '' s'il manque).
 * @param scripts       `scripts` du `package.json` de `packages/tests`.
 * @param scriptName    Nom du script qui doit lancer la config.
 * @param configFile    Nom du fichier de config que ce script doit viser.
 */
export function isConfigWiredInCi ({ ciYaml, scripts, scriptName, configFile }) {
    const script = scripts?.[scriptName]
    if (typeof script !== 'string' || !script.includes(configFile)) return false
    const pattern = new RegExp(`run\\s+${scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w:-])`)
    return pattern.test(ciYaml ?? '')
}

/**
 * ⛔ CONTROLES DE NON-VACUITE — un balayage vide DOIT etre bloquant.
 *
 * Le piege est arrive dans ce depot : un garde livre dont la premiere
 * version annoncait `PASS` apres avoir lu ZERO fichier. Trois facons de
 * devenir aveugle ici, toutes indistinguables d'un vert legitime :
 *   - le repertoire e2e ne rend rien (mauvais chemin, worktree vide) ;
 *   - le `--list` de Playwright rend un rapport dont on n'extrait aucun
 *     fichier (forme du reporter changee) ;
 *   - la liste blanche est videe par accident — la CI n'executerait plus
 *     rien, et un garde naif verrait « 241 specs non gardees », toutes
 *     absentes de la baseline, donc rouge — c'est le bon comportement,
 *     mais il faut le DIRE autrement qu'en listant 241 lignes.
 *
 * @returns Un message d'erreur, ou null si le balayage est exploitable.
 */
export function blindnessCheck ({ allSpecs, histoireGated, marketingGated, playgroundOnDisk = [], playgroundListed = null }) {
    if (!allSpecs.length) {
        return 'ZERO fichier de spec lu sur le disque. Un balayage vide n\'est pas un succes : le garde n\'a rien mesure.'
    }
    if (!histoireGated.size) {
        return 'Playwright --list (E2E_GREEN_ONLY=1) n\'a rendu AUCUN fichier. '
            + 'Soit GREEN_SPECS est vide — la CI n\'execute alors plus une seule spec — '
            + 'soit l\'extraction du rapport JSON est cassee. Dans les deux cas le verdict ne vaut rien.'
    }
    if (!marketingGated.size) {
        return 'Playwright --list (MARKETING_GREEN_ONLY=1, config marketing) n\'a rendu AUCUN fichier. '
            + 'Meme raisonnement que ci-dessus pour le job `test-e2e-marketing`.'
    }
    if (playgroundListed && playgroundOnDisk.length && !playgroundListed.size) {
        return `${playgroundOnDisk.length} spec(s) sur le disque sous e2e-playground/, mais Playwright --list `
            + '(playwright.playground.config.ts) n\'en a rendu AUCUNE. Soit le `testDir` de la config ne pointe plus '
            + 'sur ce repertoire, soit l\'extraction est cassee. Dans les deux cas le verdict ne vaut rien.'
    }
    return null
}
