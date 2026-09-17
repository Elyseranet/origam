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
export function blindnessCheck ({ allSpecs, histoireGated, marketingGated }) {
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
    return null
}
