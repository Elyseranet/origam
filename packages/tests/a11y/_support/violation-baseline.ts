import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * Baseline mechanism for a11y violations — #818.
 *
 * ⛔ POURQUOI CE FICHIER EXISTE
 * Élargir `components.spec.ts` de 36 à 218 stories (#818) expose des
 * violations `serious`/`critical` qui vivaient déjà dans le paquet publié
 * mais qu'aucun test ne regardait. Deux issues symétriques et également
 * inacceptables :
 *
 *   1. Faire échouer la suite sur 218 composants d'un coup — personne ne
 *      regarde une porte rouge en permanence (root CLAUDE.md cite #771 :
 *      rouge sur 59 runs sur 59, plus jamais lue).
 *   2. Ignorer silencieusement ce qui est trouvé — exactement le défaut que
 *      #818 dénonce : une porte qui ne regarde pas est indiscernable d'une
 *      porte qui ne trouve rien.
 *
 * Le mécanisme retenu est celui déjà éprouvé par les guards DS
 * (`packages/ds/scripts/guards/lib/baseline.mjs`), transposé ici :
 *
 *   - une violation NOUVELLE (absente du baseline pour ce composant)
 *     -> ÉCHEC. Elle ne peut jamais être absorbée silencieusement par
 *     « le baseline la couvre déjà ».
 *   - une entrée du baseline devenue OBSOLÈTE (le composant ne la produit
 *     plus) -> ÉCHEC. Le stock connu ne peut donc que RÉTRÉCIR : corriger
 *     une violation et oublier de retirer sa ligne fait rougir la suite,
 *     il n'existe aucun moyen de « laisser trainer » un correctif à moitié
 *     fait.
 *   - sinon -> PASS, avec le compte de violations connues affiché pour
 *     rester visible dans le rapport CI.
 *
 * ⛔ Pour les 36 composants qui étaient déjà balayés avant #818, le
 * baseline de départ est VIDE — ils n'avaient aucune violation bloquante
 * connue (c'est cette absence de baseline qui rendait `IMPACT_FAIL_LEVEL`
 * mordant, cf. le commentaire historique dans `components.spec.ts`). Le
 * mécanisme ne les affaiblit donc pas : toute régression sur l'un des 36
 * fait toujours échouer la suite immédiatement, comme avant #818.
 *
 * Clé : `${ComponentName}::${variantLabel}` (`variantLabel` = 'default'
 * pour la Variant balayée par défaut, ou le titre de la Variant pour un
 * balayage d'intention supplémentaire). Valeur : liste triée d'identifiants
 * de règles axe-core (`color-contrast`, …) — jamais un numéro de ligne ou
 * un décompte de nœuds, qui casserait à la moindre édition sans rapport.
 *
 * Pour retirer une entrée (violation corrigée) : lancer la suite en local,
 * confirmer que le composant nommé ne produit plus la règle citée, puis
 * supprimer la ligne du JSON dans le MÊME commit que le correctif. Ne
 * JAMAIS ajouter une entrée pour faire passer la suite sans preuve — c'est
 * exactement ce que ce mécanisme existe pour empêcher côté guards DS, et la
 * même règle vaut ici.
 *
 * Pour (re)générer le baseline après un balayage complet volontaire,
 * lancer la suite avec `UPDATE_A11Y_BASELINE=1` — voir `components.spec.ts`.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
export const A11Y_BASELINE_PATH = join(HERE, '..', 'a11y-violations.baseline.json')

export type TViolationBaseline = Record<string, string[]>

export function loadViolationBaseline (path: string = A11Y_BASELINE_PATH): TViolationBaseline {
    let raw: string
    try {
        raw = readFileSync(path, 'utf8')
    } catch {
        return {}
    }
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error(`Baseline file ${path} must contain a JSON object of { key: string[] }.`)
    }
    return parsed as TViolationBaseline
}

export interface IViolationDiff {
    newViolations: string[]
    staleEntries: string[]
    knownCount: number
}

/**
 * Compares the CURRENT rule ids a component/variant produces against its
 * baselined entry. See the module doc above for the exact semantics.
 */
export function diffViolations (
    key: string,
    currentRuleIds: readonly string[],
    baseline: TViolationBaseline = loadViolationBaseline()
): IViolationDiff {
    const known = new Set(baseline[key] ?? [])
    const current = new Set(currentRuleIds)
    const newViolations = [...current].filter((id) => !known.has(id)).sort()
    const staleEntries = [...known].filter((id) => !current.has(id)).sort()
    return { newViolations, staleEntries, knownCount: current.size - newViolations.length }
}
