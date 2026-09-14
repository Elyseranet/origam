import { VALIDATE_ON } from '../../enums/Commons/validation.enum'

export type TValidateOn = `${VALIDATE_ON}`

/*********************************************************
 * TValidationRuleResult
 *
 * @description
 * Verdict d'une regle : `true` = la valeur passe, `false` = elle echoue
 * sans message, une chaine = elle echoue avec ce message.
 ********************************************************/
export type TValidationRuleResult = boolean | string

/*********************************************************
 * TValidationRule
 *
 * @description
 * Une regle telle que `IValidationProps.rules` l'accepte : une fonction
 * (sync ou async) qui juge la valeur, OU directement un verdict. Le
 * second cas n'est pas une commodite : `useValidation` coerce toute
 * valeur non-fonction en `() => valeur`, ce qui permet d'ecrire
 * `:rules="[serverError || true]"` sans fermeture.
 ********************************************************/
export type TValidationRule =
    | ((value: any) => TValidationRuleResult | Promise<TValidationRuleResult>)
    | TValidationRuleResult
