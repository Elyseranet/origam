# Composables — Form

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

1 symbole(s) exporte(s).

## `useForm`

```ts
export function useForm (props: IFormProps)
```

Etat d'un `<origam-form>` : agrege les champs qui s'y enregistrent et
expose la validation d'ensemble, `reset` et `resetValidation`.

La validite globale n'est pas calculee par le formulaire mais DELEGUEE aux
champs : `validate` appelle chacun d'eux et rassemble les erreurs. Un champ
ajoute dynamiquement participe donc sans que le formulaire ait a le
connaitre a l'avance.

`disabled` et `readonly` descendent aux champs enregistres — les poser sur
le formulaire evite de les repeter sur chaque champ.

**Source** : `packages/ds/src/composables/Form/form.composable.ts`

**Consommateurs** (3) : `components/Form/OrigamForm.vue`, `components/NumberField/OrigamNumberField.vue`, `interfaces/Form/form.interface.ts`

