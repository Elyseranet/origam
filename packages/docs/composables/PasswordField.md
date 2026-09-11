# Composables — PasswordField

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `computeStrength`

```ts
export function computeStrength (value: string | null | undefined): IPasswordStrength
```

Fonction PURE — pas un composable malgre son emplacement. Note un mot de
passe et retourne `{ score, level }`, ou `level` est une valeur de
`PASSWORD_STRENGTH_LEVEL`.

Le score additionne des criteres independants : longueur minimale, longueur
forte, presence de chiffres, melange de casse. Une chaine vide, `null` ou
`undefined` donnent 0 et `WEAK` — l'appelant n'a donc jamais a garder la
valeur avant d'appeler.

⛔ Ce n'est pas une mesure d'entropie et ca ne pretend pas en etre une :
c'est un indicateur d'interface, a ne pas confondre avec une politique de
securite cote serveur.

**Source** : `packages/ds/src/composables/PasswordField/passwordStrength.composable.ts`

**Consommateurs** (5) : `components/PasswordField/OrigamPasswordField.vue`, `consts/PasswordField/password-field.const.ts`, `enums/PasswordField/password-field.enum.ts`, `interfaces/PasswordField/password-strength.interface.ts`, `types/PasswordField/password-field.type.ts`

