/*********************************************************
 * signature — lecture du prototype d'un symbole exporte
 *
 * @description
 * Coeur pur du generateur de doc des composables
 * (`scripts/analysis/gen-composables-doc.mjs`), isole ici pour etre
 * testable : le generateur, lui, s'execute au chargement (il parcourt le
 * disque et ecrit les pages), donc une TU ne peut pas l'importer.
 *
 * @description
 * ⛔ Ce module fait de l'ANALYSE SYNTAXIQUE — profondeur de parentheses,
 * saut des chaines et des commentaires, arbitrage type/corps sur le dernier
 * caractere significatif. Il regresse au premier refactor, et il regresse en
 * SILENCE : la page produite reste du markdown plausible, simplement amputee.
 * C'est exactement le defaut qu'a corrige #605, et personne ne l'avait vu
 * pendant des mois. Sa TU est a
 * `packages/tests/TU/origam/gen-composables-signature.spec.ts` — elle rejoue
 * l'implementation d'avant #605 pour prouver que chaque cas la met en echec.
 ********************************************************/

/**
 * Une accolade rencontree a la profondeur 0 est-elle un TYPE, ou le CORPS ?
 *
 * ⛔ C'est la seule ambiguite reelle de la lecture d'une signature. Les deux
 * formes existent dans ce depot :
 *
 *   export function useLoader (…): { loaderClasses: … } { …corps… }
 *                                  ^ type            ^ corps
 *
 * On tranche sur le dernier caractere significatif : une accolade qui suit
 * `:` `|` `&` `=` `,` `(` `<` `[` ou `=>` est en position de TYPE ; celle qui
 * suit un identifiant ou un `>` de generique ferme le prototype et ouvre le
 * corps. Mesure : sur les 179 symboles exportes du dossier, cette regle
 * classe correctement les 179 (aucune signature desequilibree en sortie).
 */
export const isTypePosition = (prev, prev2) => prev === '' || ':|&=,(<['.includes(prev) || (prev2 === '=' && prev === '>')

/** Un caractere qui peut TERMINER un membre de type. */
const MEMBER_END = /[A-Za-z0-9_$)\]}>'"`?]/
/** Un caractere qui, en tete de ligne, CONTINUE le membre precedent. */
const CONTINUES_MEMBER = new Set([ '}', ')', ']', ',', ';', ':', '|', '&', '?', '=', '>', '.', '<' ])
/** Mots-cles qui, en tete de ligne, continuent eux aussi le membre precedent. */
const CONTINUATION_WORDS = /^(extends|implements|in|keyof|infer|is|asserts)\b/

/*********************************************************
 * restoreMemberSeparators — le retour a la ligne EST un separateur
 *
 * @description
 * ⛔ #802 — TypeScript accepte le retour a la ligne comme separateur de
 * membres dans un type objet, exactement comme `;` ou `,` :
 *
 *     export function useAccessibleCommand (options: {
 *         component: string
 *         zone: string
 *         …
 *     })
 *
 * La derniere etape de `signatureAt` ecrase tous les blancs en une espace
 * (`.replace(/\s+/g, ' ')`), ce qui est correct PARTOUT AILLEURS — et qui
 * detruit ici l'unique separateur present. La page publiait
 * `{ component: string zone: string … }` : une signature COMPLETE (le defaut
 * de #605 est bien corrige) mais qui ne compile pas si on la recopie, et que
 * rien ne signale comme fausse. Meme famille de doc mensongere que #605, une
 * etape plus loin : la lecture va jusqu'au bout, c'est la RECONSTRUCTION qui
 * perd l'information.
 *
 * @description
 * On repasse donc sur le texte AVANT ecrasement, et on materialise en `;`
 * tout retour a la ligne qui separe reellement deux membres — c'est-a-dire
 * qui n'est ni une continuation (`|`, `&`, `extends`, `=>`, un `}` fermant…)
 * ni precede d'un separateur deja ecrit. Les chaines et gabarits sont sautes :
 * le generique de `useVModel` contient `` `onUpdate:${Prop}` ``, dont un
 * retour a la ligne ne separerait aucun membre.
 *
 * @param raw  la signature lue, blancs d'origine encore presents
 * @returns la meme, separateurs de membres materialises
 ********************************************************/
export const restoreMemberSeparators = (raw) => {
    let out = ''
    let curly = 0
    let i = 0

    while (i < raw.length) {
        const c = raw[i]

        // Chaines et gabarits : recopies tels quels, jamais interpretes.
        if (c === '"' || c === "'" || c === '`') {
            const quote = c
            let j = i + 1
            while (j < raw.length && raw[j] !== quote) {
                if (raw[j] === '\\') j++
                j++
            }
            out += raw.slice(i, Math.min(j + 1, raw.length))
            i = j + 1
            continue
        }

        if (c === '{') curly++
        else if (c === '}') curly--

        if (c !== '\n' || curly <= 0) {
            out += c
            i++
            continue
        }

        // Un retour a la ligne DANS un bloc d'accolades : separateur ou pas ?
        let k = i
        while (k < raw.length && /\s/.test(raw[k])) k++
        const after = raw.slice(k)
        const before = out.replace(/\s+$/, '').slice(-1)

        const separates = MEMBER_END.test(before)
            && !CONTINUES_MEMBER.has(after[0])
            && !CONTINUATION_WORDS.test(after)
            && !after.startsWith('=>')

        out += separates ? ';\n' : '\n'
        i++
    }

    return out
}

/**
 * La signature, telle qu'elle est ecrite — jamais reconstruite.
 *
 * ⛔ La version precedente coupait au PREMIER `{` ou `=>` rencontres, sans
 * tenir compte de l'imbrication. Or les trois motifs ci-dessous placent l'un
 * ou l'autre EN PLEIN MILIEU du prototype, et produisaient 52 signatures
 * tronquees sur 179 (#605) :
 *
 *   1. parametre destructure   useSticky ({rootEl, isSticky}: ISticky)
 *                                        ^ coupe ici
 *   2. type de retour objet    useLoader (…): { loaderClasses: … }
 *                                             ^ coupe ici
 *   3. type fonction en param  useBackButton (…, cb: (n: Next) => void)
 *                                                            ^ coupe ici
 *
 * Une signature tronquee n'est pas cosmetique : le lecteur qui copie
 * `useDisplay ( props: IDisplayProps =` obtient du code qui ne compile pas,
 * et rien n'indique que la ligne est incomplete — de la doc mensongere.
 *
 * On lit donc le prototype avec un vrai suivi de profondeur `()` `[]` `{}`,
 * en sautant chaines, gabarits et commentaires (le generique de `useVModel`
 * contient un gabarit `` `onUpdate:${Prop}` `` qui porterait sinon une
 * accolade fantome). L'arret :
 *
 *   - `function` : l'accolade du corps, ou un `;` (surcharge) a la profondeur 0.
 *     On n'arrete JAMAIS sur `=>`, qui pour cette forme ne peut etre qu'un
 *     type fonction dans le retour (`(): () => void {`).
 *   - `const`    : la flêche de la fonction assignee, une fois la liste de
 *     parametres refermee — apres un eventuel type de retour objet
 *     (`useChartGauge = (o: O): { geometry: … } => {`).
 */
export const signatureAt = (source, index, kind) => {
    const n = source.length
    let i = index
    let par = 0
    let sq = 0
    let cu = 0
    // La liste de parametres de tete a-t-elle ete refermee ?
    let closedParams = false
    let prev = ''
    let prev2 = ''
    // ⛔ Les commentaires INTERNES a la liste de parametres sont retires de la
    // signature publiee : `useStateEffect` documente son parametre `flat` par
    // un bloc JSDoc entre deux virgules, qui autrement se retrouvait recopie
    // tel quel au milieu du bloc ```ts. Ils ne font pas partie du contrat de
    // type — la description, elle, est publiee juste en dessous.
    const parts = []
    let segStart = index

    const bump = (c) => {
        if (!/\s/.test(c)) {
            prev2 = prev
            prev = c
        }
    }

    while (i < n) {
        const c = source[i]
        const two = source.slice(i, i + 2)

        // ⛔ Fin d'une SURCHARGE. En TypeScript une surcharge n'a pas de corps,
        // et celles de ce depot ne portent PAS de `;` final : elles s'arretent
        // sur un retour a la ligne, suivi de la banniere de la surcharge
        // suivante. Sans cette regle, la lecture traverse le commentaire et va
        // chercher l'accolade du corps de l'implementation, bien plus bas.
        // Defaut PRE-EXISTANT, absent du ticket : `useLocale` publiait deja sa
        // banniere entiere a l'interieur de son bloc ```ts (Commons.md L1194
        // et L1217 avant correctif).
        if (closedParams && par + sq + cu === 0 && (two === '//' || two === '/*')) break
        if (closedParams && par + sq + cu === 0 && source.startsWith('export', i) && source[i - 1] === '\n') break

        // Commentaires — un `{` en commentaire ne ferme pas un prototype.
        if (two === '//' || two === '/*') {
            parts.push(source.slice(segStart, i))
            if (two === '//') {
                const nl = source.indexOf('\n', i)
                i = nl === -1 ? n : nl
            } else {
                const close = source.indexOf('*/', i + 2)
                i = close === -1 ? n : close + 2
            }
            segStart = i
            continue
        }

        // Chaines et gabarits — sautes d'un bloc, `\` echappe le caractere suivant.
        if (c === '"' || c === "'" || c === '`') {
            i++
            while (i < n && source[i] !== c) {
                if (source[i] === '\\') i++
                i++
            }
            i++
            bump(c)
            continue
        }

        const depth = par + sq + cu

        if (c === '(') par++
        else if (c === ')') {
            par--
            if (par === 0 && sq === 0 && cu === 0) closedParams = true
        } else if (c === '[') sq++
        else if (c === ']') sq--
        else if (c === '{') {
            if (depth === 0 && !isTypePosition(prev, prev2)) break
            cu++
        } else if (c === '}') cu--
        else if (two === '=>' && depth === 0 && kind === 'const' && closedParams) break
        else if (c === ';' && depth === 0) break

        bump(c)
        i++
    }

    parts.push(source.slice(segStart, i))

    // ⛔ #802 — les separateurs de membres sont materialises AVANT l'ecrasement
    // des blancs, sans quoi le retour a la ligne qui separe deux membres d'un
    // type objet disparait et la signature devient `{ a: string b: string }`.
    return restoreMemberSeparators(parts.join(' '))
        .replace(/\s+/g, ' ')
        // Une virgule restee orpheline apres le retrait d'un commentaire.
        .replace(/,\s*\)/g, ' )')
        .trim()
}
