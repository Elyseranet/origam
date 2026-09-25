/*
 * Detecteur du garde 29 — theme-channel-confiscation.
 *
 * ⛔ LE MECANISME, ET POURQUOI IL EST INVISIBLE (#607, #569)
 * ---------------------------------------------------------
 * Une custom property est substituee SUR L'ELEMENT QUI LA DECLARE. Un theme
 * de marque pose la sienne sur la racine (`[data-theme="brand-x"]`) et chaque
 * composant en HERITE. Or l'heritage perd contre N'IMPORTE QUELLE declaration
 * directe sur l'element — la specificite n'a meme pas besoin d'entrer en jeu.
 *
 * Donc : des qu'un composant redeclare, dans son propre bloc, un token que les
 * feuilles declarent deja, ET que la regle qui le porte s'applique a TOUTES ses
 * instances, le canal de thème est mort. Le nom existe dans la feuille, le
 * composant le lit, `token-var-channels` est vert dans les deux sens, et le
 * reglage de l'integrateur ne bouge rien.
 *
 * DEUX FORMES, DEUX SELECTEURS
 * ----------------------------
 *   1. `<style scoped>` — `.origam-btn[data-v-hash]` (0,2,0) bat l'heritage.
 *   2. `<style>` NON scope contenant `:root` — injecte APRES les feuilles de
 *      tokens, donc a egalite de specificite (0,1,0) il gagne sur le bloc
 *      `[data-theme="brand-x"]` par l'ordre source. C'est #569, et c'est
 *      exactement l'etape 4 de la procedure de migration du CLAUDE.md :
 *      « Remove the global `<style>:root{}` block ».
 *
 * ⛔ CE QUI DISTINGUE UN DEFAUT D'UNE REGLE LEGITIME
 * --------------------------------------------------
 * Le CLAUDE.md autorise explicitement une redeclaration scopee : « Keep
 * calc-based vars that depend on instance-level state (size variant, density
 * modifier, …) inside the scoped `<style>` block. » Une regle portee par
 * `&--density-compact` ne confisque rien : la classe n'existe que si le
 * consommateur a demande cette densite, et c'est la logique PROPS-FIRST du DS.
 *
 * Le detecteur ne signale donc que l'intersection de DEUX conditions :
 *
 *   A. la regle est TOUJOURS ACTIVE — selecteur sans modificateur, OU
 *      modificateur egal a la valeur par defaut de la prop dans
 *      `withDefaults` (`&--density-default` sur un composant qui declare
 *      `density: DENSITY.DEFAULT` est pose sur CHAQUE instance) ;
 *   B. la valeur scopee resout EXACTEMENT la valeur de la feuille, chaine de
 *      `var()` deroulee. C'est ce qui rend le retrait sans effet visuel.
 *
 * La condition B est indispensable et c'est elle qui demande le resolveur :
 * les deux ecritures sont textuellement differentes dans la quasi-totalite
 * des cas (`12px` contre `var(--origam-space---3)`, `0.875rem` contre
 * `var(--origam-font__size---md)`), donc une comparaison de chaines ne voit
 * rien. Mesure a l'ecriture : sur 503 declarations scopees visant un token de
 * feuille, 85 sont des doublons purs et 3 SEULEMENT sont litteralement
 * identiques.
 *
 * ⛔ PORTEE — statique, et volontairement ignorante du runtime. Le detecteur
 * ne sait pas si la classe est reellement emise (il le DEDUIT de
 * `withDefaults`), ni ce qu'un `createOrigam()` injecte. Un verdict de rendu
 * ne s'obtient que dans un vrai navigateur : `getComputedStyle` sous jsdom ne
 * resout jamais `var()`.
 */

/* Un segment de valeur CSS, commentaires retires et espaces normalises. */
export function normalise (value) {
    return String(value)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/;$/, '')
        .trim()
}

/*
 * ⛔ `!important` N'EST PAS DU BRUIT DE MISE EN FORME — #902, mesure du
 * 2026-09-25, et c'est l'inverse de ce que le ticket prescrivait.
 * -------------------------------------------------------------------------
 * #902 demandait que `normalise()` retire un `!important` terminal avant
 * comparaison, pour que `0px !important` (OrigamAudio) soit reconnu egal au
 * `0px` de la feuille et donc signale comme doublon retirable. MESURE : ce
 * serait un FAUX POSITIF, et il pousserait a supprimer du code porteur.
 *
 * `--origam-btn---density` n'est pas declare qu'a la racine. `OrigamBtn.vue`
 * le repose AU NIVEAU DE L'ELEMENT dans ses modificateurs de densite :
 *
 *     &--density-comfortable { --origam-btn---density:  8px; }
 *     &--density-compact     { --origam-btn---density: -8px; }
 *
 * Or la logique PROPS-FIRST du DS (ADR-005) fait qu'un theme de marque posant
 * `'origam-btn': { density: 'comfortable' }` met cette classe sur CHAQUE
 * bouton — y compris ceux de la barre de transport audio. Sans le
 * `!important`, la declaration d'Audio et celle de Btn sont deux declarations
 * de NIVEAU ELEMENT sur le meme element : le gagnant depend de la specificite
 * et de l'ordre source, ce que l'en-tete d'OrigamAudio documente deja comme
 * fragile a travers les rechargements HMR. Le `!important` est ce qui garantit
 * la hierarchie visuelle de l'audio quel que soit le theme.
 *
 * Autrement dit : l'egalite de VALEUR avec la feuille ne prouve rien quand le
 * POIDS DE CASCADE differe. La condition B du garde — « retirer la
 * declaration ne change aucun pixel » — est indemontrable par comparaison de
 * valeurs des qu'un `!important` est en jeu, parce que la declaration ne
 * defend pas contre la racine mais contre un concurrent intermediaire.
 *
 * Une declaration `!important` est donc EXCLUE du verdict, explicitement.
 * C'est exactement le comportement actuel — aujourd'hui la comparaison de
 * chaines echoue par accident, `'0px !important' !== '0px'` — mais un accident
 * n'est pas une decision : quelqu'un « nettoiera » `normalise()` un jour. Cet
 * appel-ci, et la fixture qui l'epingle dans le self-test, transforment le
 * hasard en choix documente.
 */
export function carriesImportant (value) {
    return /!\s*important\s*$/i.test(normalise(value))
}

/*
 * Table des tokens telle que la resout le THEME CLAIR : `primitive.css` pose
 * les valeurs brutes, `light.css` les valeurs semantiques par dessus. C'est
 * l'etat par defaut d'une page, donc celui contre lequel « meme valeur » doit
 * se juger.
 */
export function buildTokenTable (sheets) {
    const table = new Map()
    for (const { source } of sheets) {
        const clean = source.replace(/\/\*[\s\S]*?\*\//g, '')
        for (const m of clean.matchAll(/(--origam-[A-Za-z0-9_-]+)\s*:\s*([^;}]+)/g)) {
            table.set(m[1], normalise(m[2]))
        }
    }
    return table
}

/*
 * Deroule les `var(--x, repli)` contre la table. Un nom absent tombe sur son
 * repli ; sans repli il devient `UNRESOLVED(...)`, ce qui exclut la
 * declaration du verdict plutot que de la comparer a l'aveugle.
 *
 * ⛔ AUCUNE REDUCTION ARITHMETIQUE DES `calc()` — #902, et c'est delibere.
 * -------------------------------------------------------------------------
 * #902 demandait de reduire les `calc()` dont les termes sont des longueurs de
 * meme unite, pour que les quatre declarations d'OrigamRow —
 * `--origam-col---padding-{block,inline}-{start,end}: calc(var(--origam-row---gutter) / 2)`
 * — soient reconnues egales au `var(--origam-space---3)` = `12px` de la
 * feuille, et donc signalees comme doublons retirables. MESURE : ce serait un
 * FAUX POSITIF quadruple, et le suivre casserait la gouttiere.
 *
 * La table des tokens est celle du theme clair PAR DEFAUT. Elle resout
 * `--origam-row---gutter` a `var(--origam-row--gutter-comfortable---gap)` =
 * `24px`, donc `calc(24px / 2)` = `12px` = la feuille. L'egalite est vraie
 * A CE SEUL ECHELON. Or OrigamRow fait precisement varier ce token :
 *
 *     @each $rung in (none, dense, default, comfortable) {
 *         &--gutter-#{$rung} { --origam-row---gutter: var(--origam-row--gutter-#{$rung}---gap); }
 *     }
 *
 * avec `none` = `var(--origam-space---0)`. Sous `gutter="none"` la declaration
 * de Row produit `0px` la ou la feuille produit `12px`, et OrigamCol consomme
 * bien ces quatre tokens (`padding-block-start: var(--origam-col---padding-block-start)`,
 * lignes 138-141). La declaration de Row n'est donc pas un DOUBLON mais une
 * relation DERIVEE — « le padding d'une colonne vaut la moitie de la
 * gouttiere de sa ligne » — et la retirer figerait les colonnes a 12px sur les
 * quatre echelons.
 *
 * La cause est structurelle et vaut au-dela de ce cas : resoudre contre la
 * table PAR DEFAUT ne permet pas de distinguer « la meme valeur » de « la meme
 * valeur tant que rien ne varie ». Reduire les `calc()` ne corrigerait pas ce
 * defaut, il le rendrait exploitable. C'est le faux negatif dont le ticket
 * avertissait lui-meme dans sa section « Attention en corrigeant » — il visait
 * juste, sur un autre mecanisme que celui qu'il soupconnait.
 */
export function resolveValue (value, table, depth = 0) {
    const v = normalise(value)
    if (depth > 12) return v

    let out = ''
    let i = 0
    while (i < v.length) {
        if (!v.startsWith('var(', i)) {
            out += v[i]
            i += 1
            continue
        }
        let depthParen = 0
        let j = i + 3
        for (; j < v.length; j += 1) {
            if (v[j] === '(') depthParen += 1
            else if (v[j] === ')') {
                depthParen -= 1
                if (depthParen === 0) break
            }
        }
        const inner = v.slice(i + 4, j)
        let name = inner
        let fallback = null
        let nested = 0
        for (let k = 0; k < inner.length; k += 1) {
            if (inner[k] === '(') nested += 1
            else if (inner[k] === ')') nested -= 1
            else if (inner[k] === ',' && nested === 0) {
                name = inner.slice(0, k)
                fallback = inner.slice(k + 1)
                break
            }
        }
        name = name.trim()
        if (table.has(name)) out += resolveValue(table.get(name), table, depth + 1)
        else if (fallback !== null) out += resolveValue(fallback, table, depth + 1)
        else out += `UNRESOLVED(${ name })`
        i = j + 1
    }
    return normalise(out)
}

/*
 * Valeurs par defaut litterales d'un `withDefaults`. Seules les chaines et les
 * membres d'enum sont exploitables : ce sont les seules qui produisent une
 * classe modificatrice. `ENUM.MEMBER` est resolu contre les enums du DS.
 *
 * ⛔ Le CLAUDE.md impose des LITTERAUX inlines dans `withDefaults` (le
 * compilateur SFC ne resout pas un acces de propriete) — sauf pour les enums,
 * qui restent statiquement analysables. C'est pourquoi les deux formes
 * suffisent ici.
 */
export function extractDefaults (source, enumValues) {
    const m = /withDefaults\s*\(\s*defineProps<[^>]*>\s*\(\s*\)\s*,\s*\{([\s\S]*?)\n\s*\}\s*\)/.exec(source)
    if (!m) return {}

    const out = {}
    for (const dm of m[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*(.+?),?\s*$/gm)) {
        const key = dm[1]
        const raw = dm[2].trim().replace(/,$/, '')
        const str = /^'([^']*)'$|^"([^"]*)"$/.exec(raw)
        if (str) out[key] = str[1] !== undefined ? str[1] : str[2]
        else if (/^[A-Z_]+\.[A-Z_0-9]+$/.test(raw) && enumValues.has(raw)) out[key] = enumValues.get(raw)
    }
    return out
}

export function buildEnumValues (enumFiles) {
    const values = new Map()
    for (const { source } of enumFiles) {
        for (const em of source.matchAll(/export\s+enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g)) {
            for (const mm of em[2].matchAll(/(\w+)\s*=\s*'([^']*)'/g)) {
                values.set(`${ em[1] }.${ mm[1] }`, mm[2])
            }
        }
    }
    return values
}

/*
 * Selecteurs et declarations d'un bloc `<style>`, en suivant la pile SCSS.
 * On ne cherche pas a resoudre `&` : seule la PRESENCE d'un modificateur ou
 * d'un etat compte, et `&--density-default` la porte telle quelle.
 */
function collectDeclarations (rawBody) {
    /*
     * Les commentaires partent AVANT la marche : un `//` de plusieurs lignes
     * au-dessus d'une regle finit sinon concatene dans le selecteur, ce qui
     * rend le rapport du garde illisible (mesure : une entree de 40 lignes
     * pour `OrigamSnackbarGroup`).
     */
    const body = rawBody.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    const rows = []
    const stack = []
    let buf = ''
    for (let i = 0; i < body.length; i += 1) {
        const c = body[i]
        if (c === '{') {
            stack.push(buf.trim().replace(/\s+/g, ' '))
            buf = ''
        } else if (c === '}') {
            stack.pop()
            buf = ''
        } else if (c === ';') {
            const dm = /^(--origam-[A-Za-z0-9_-]+)\s*:\s*([\s\S]+)$/.exec(buf.trim())
            if (dm) rows.push({ selector: stack.join(' > '), token: dm[1], value: normalise(dm[2]) })
            buf = ''
        } else {
            buf += c
        }
    }
    return rows
}

/* Un selecteur qui ne s'applique que sous condition ne confisque rien. */
export function isConditional (selector) {
    const s = selector.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
    return /&--|\.origam-[a-z-]*--[a-z]|:hover|:focus|:active|:disabled|&:|\[aria-|\[disabled|\[data-/.test(s)
}

/* Modificateurs `--foo-bar` portes par le selecteur, sans les commentaires. */
function modifiersOf (selector) {
    const s = selector.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
    const mods = []
    for (const m of s.matchAll(/&--([a-z0-9-]+)|\.origam-[a-z-]*--([a-z0-9-]+)/g)) mods.push(m[1] || m[2])
    return mods
}

const kebab = (s) => s.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase()

/*
 * Le selecteur est-il pose sur CHAQUE instance ? Soit il ne porte aucune
 * condition, soit son modificateur nomme la valeur par defaut de la prop —
 * auquel cas la classe est emise meme quand le consommateur n'a rien demande.
 */
export function isAlwaysActive (selector, defaults) {
    if (!isConditional(selector)) return true
    const mods = modifiersOf(selector)
    for (const mod of mods) {
        for (const [prop, val] of Object.entries(defaults)) {
            if (mod === `${ kebab(prop) }-${ val }` || mod === val) return true
        }
    }
    return false
}

/**
 * @param {object} input
 * @param {Array<{path: string, source: string}>} input.sheets        light/dark/primitive
 * @param {Array<{path: string, source: string}>} input.components    *.vue
 * @param {Array<{path: string, source: string}>} input.enums         *.enum.ts
 * @returns {Array<{id: string, kind: string, file: string, token?: string, selector?: string, value?: string, resolved?: string}>}
 */
export function analyseSources ({ sheets, components, enums = [] }) {
    const table = buildTokenTable(sheets)
    const enumValues = buildEnumValues(enums)
    const violations = []

    for (const { path: file, source } of components) {
        const defaults = extractDefaults(source, enumValues)

        for (const m of source.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
            const scoped = /\bscoped\b/.test(m[1])
            const body = m[2]

            /*
             * #569 — un `:root` hors d'un bloc scope. Signale quelle que soit
             * la valeur : le bloc gagne sur tout thème de marque par l'ordre
             * d'injection, y compris pour les tokens qu'aucune feuille ne
             * declare (ceux-la sont meme le pire cas — inatteignables).
             */
            if (!scoped && /(^|[\s,}]):root\b/.test(body)) {
                violations.push({
                    id: `${ file }::style-root-block`,
                    kind: 'root-block',
                    file
                })
                continue
            }
            if (!scoped) continue

            for (const row of collectDeclarations(body)) {
                if (!table.has(row.token)) continue
                if (!isAlwaysActive(row.selector, defaults)) continue

                /*
                 * #902 — poids de cascade different, egalite de valeur sans
                 * valeur probante. Voir `carriesImportant` pour la mesure.
                 */
                if (carriesImportant(row.value)) continue

                const resolvedScoped = resolveValue(row.value, table)
                const resolvedSheet = resolveValue(table.get(row.token), table)
                if (resolvedScoped.includes('UNRESOLVED') || resolvedSheet.includes('UNRESOLVED')) continue
                if (resolvedScoped !== resolvedSheet) continue

                violations.push({
                    id: `${ file }::${ row.token }`,
                    kind: 'scoped-duplicate',
                    file,
                    token: row.token,
                    selector: row.selector,
                    value: row.value,
                    resolved: resolvedScoped
                })
            }
        }
    }

    /* Un meme token peut etre pose par plusieurs regles toujours actives. */
    const seen = new Set()
    return violations.filter(v => (seen.has(v.id) ? false : seen.add(v.id)))
}
