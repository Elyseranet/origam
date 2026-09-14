import type { TValidationRule } from '../../types/Commons/validation.type'

/*********************************************************
 * collectRuleErrors — l'UNIQUE boucle d'evaluation de regles du DS
 *
 * @description
 * Parcourt `rules` dans l'ordre, applique chacune a `value`, et accumule
 * les messages d'erreur jusqu'a `maxErrors`. Retourne un tableau vide
 * quand tout passe, quand `rules` est absent, ou quand `maxErrors` vaut 0.
 *
 * @description
 * POURQUOI CETTE FONCTION EXISTE. La boucle vivait en DEUX exemplaires :
 * `useValidation.validate()` (moteur des champs de formulaire) et
 * `useInlineEdit.runRules()`, dont le commentaire avouait « mirrors the
 * evaluation logic of `useValidation` ». Les deux copies avaient DIVERGE
 * sur le cas `false` : `useValidation` le comptait comme un echec sans
 * message, `runRules` le laissait passer en silence. Consequence mesuree
 * sur `<OrigamInlineEdit>` : une regle ecrite `(v) => v.length > 3` — la
 * forme la plus naturelle qui soit — ne bloquait JAMAIS la validation,
 * ni sur `true` ni sur `false`. Le trou etait invisible parce que
 * `TInlineEditRule` interdit `false` au niveau du type : rien ne
 * ratrappait un consommateur JS, ni une regle typee `any`.
 *
 * @description
 * SEMANTIQUE RETENUE — celle de `useValidation`, qui est le sur-ensemble :
 * une regle peut etre une valeur au lieu d'une fonction (coercee en
 * `() => valeur`), `false` echoue avec le message vide, et un verdict qui
 * n'est ni booleen ni chaine est signale puis ignore. `runRules` ne
 * faisait aucun des trois.
 *
 * @description
 * ⛔ LA VALEUR EST LUE UNE SEULE FOIS, avant la boucle — alors que
 * `useValidation` relisait `validationModel.value` a CHAQUE iteration. La
 * difference n'est observable qu'avec au moins deux regles, `maxErrors`
 * superieur a 1, une regle asynchrone, et une mutation du modele pendant
 * l'attente : la regle suivante voyait alors une autre valeur que la
 * precedente. Une passe de validation juge UNE valeur ; ce resserrement
 * est deliberé.
 *
 * @description
 * Fonction pure et sans reactivite : c'est ce qui lui permet de servir
 * `useInlineEdit`, qui n'a deliberement aucun couplage au provider de
 * formulaire.
 ********************************************************/
export async function collectRuleErrors (
    rules: Array<TValidationRule> | undefined,
    value: unknown,
    maxErrors = 1
): Promise<Array<string>> {
    const errors: Array<string> = []

    if (!rules) return errors

    for (const rule of rules) {
        if (errors.length >= maxErrors) break

        const handler = typeof rule === 'function' ? rule : () => rule
        const result = await handler(value)

        if (result === true) continue

        if (result !== false && typeof result !== 'string') {

            console.warn(`${result} is not a valid value. Rule functions must return boolean true or a string.`)

            continue
        }

        errors.push(result || '')
    }

    return errors
}
