# ADR-001 — `useVModel` en mode contrôlé retarde la lecture d'un tick

- **Statut** : proposé, chantier ouvert (branche `chantier/ds-vmodel-controlled-lag`)
- **Date** : 2026-08-06
- **Portée** : `packages/ds/src/composables/Commons/vModel.composable.ts`, et par ricochet
  tout composant du DS qui expose un `v-model`

---

## Contexte

Un `<origam-text-field>` masqué perd ou duplique des caractères pendant une saisie
normale, dès lors que l'utilisateur **clique dans le champ** avant de taper. Mesuré
à **80 ms entre les frappes**, soit une vitesse de frappe humaine ordinaire :

| saisie | attendu | obtenu |
|---|---|---|
| `0612345678` (clic + `fill('')` + frappe) | `06 12 34 56 78` | `01 23 45 67 8` |
| `0612345678` (clic + sélection + effacement) | `06 12 34 56 78` | `00 12 34 56 78` |

Ce défaut était documenté par 18 `test.fixme` dans
`packages/tests/e2e/textfield-mask.spec.ts`, qui l'attribuaient à la saisie
synthétique de Playwright. **Cette attribution est fausse** : le défaut se
reproduit à vitesse humaine et n'a rien de synthétique.

## Chaîne causale

Traçage instrumenté sur l'élément `input`, deuxième frappe :

```
input : value="06" caret=2   ← la frappe est correcte
micro : value="06" caret=2
macro : value="0"  caret=1   ← la valeur est revenue en arrière
```

Le composant lit son modèle via `useVModel(props, 'modelValue')`. Le computer
sous-jacent :

```ts
get () { return transformIn(isControlled.value ? externalValue : internal.value) }
set (v) { internal.value = newValue; vm?.emit(`update:${prop}`, newValue) }
```

En mode **contrôlé** — le parent passe `modelValue` *et* écoute
`update:modelValue` — le getter retourne `props[prop]` et **ignore `internal`**.
D'où la séquence :

1. `handleInput` écrit `model.value = "06"` ; l'émission part vers le parent.
2. Dans le tick courant, `model.value` **relit encore `"0"`**.
3. Le `watch(modelValue)` d'`useMask` recalcule donc `masked = "0"`.
4. `displayValue` vaut `"0"` ; Vue rend `:value="0"` et écrase le caractère tapé.
5. La frappe suivante s'insère au mauvais offset — l'erreur se propage en cascade.

Sans clic préalable, l'ordonnancement diffère et la saisie passe : c'est ce qui a
maintenu le défaut invisible.

## Ce qui a déjà été corrigé (livré en 2.13.0)

Une course **distincte**, dans `handleInput` : `r.masked` était capturé dans la
closure du `nextTick`, si bien qu'un callback périmé écrasait la valeur la plus
récente. Un jeton monotone fait sortir les callbacks supplantés.

| délai entre frappes | avant | après |
|---|---|---|
| 5 ms | `(1` | `(12) 345-6789` |
| autofill (un seul événement) | `(1` | `(12) 345-6789` |

Ce correctif est nécessaire mais **pas suffisant** : il ne touche pas la cause
décrite ci-dessus.

## Options

### A — corriger `useVModel` (correction de fond)

Faire préférer au getter la valeur `internal` tant que la prop entrante ne l'a pas
rattrapée : un état local optimiste, révoqué dès que le parent confirme.

- ✅ Traite la cause pour **tous** les composants, pas seulement le champ masqué.
- ⚠️ `useVModel` irrigue quasiment tout le DS. Tout composant qui s'appuie
  aujourd'hui sur le fait qu'un parent peut **refuser** une valeur (validation,
  normalisation, clamp) changerait de comportement : la valeur refusée resterait
  affichée le temps d'un tick.
- ⚠️ Impose une revalidation complète : TU, e2e sur les 4 shards, et une revue
  ciblée des composants qui contraignent leur modèle.

### B — corriger `OrigamTextField` seul (contournement local)

Ne plus piloter `:value` depuis une source en retard pendant une saisie masquée :
laisser le DOM porter la valeur pendant la frappe, et ne resynchroniser que
lorsqu'un modèle entrant **diffère réellement** de ce que l'utilisateur a tapé.

- ✅ Périmètre restreint, livrable rapidement, risque faible.
- ⚠️ Laisse la cause en place pour les autres composants.

## Décision

**Chantier dédié, sans contrainte de délai** (arbitrage utilisateur du 2026-08-06) :
le bug est réel mais non bloquant, et la priorité va à la stabilité de la base.
Les autres livrables avancent en parallèle sur `develop`.

L'option retenue reste à trancher. Recommandation : instruire **A** ici, avec le
harnais de validation décrit ci-dessous ; **B** reste disponible comme repli si le
rayon d'impact de A s'avère trop large.

## Critères de sortie

1. Les 18 `test.fixme` de `textfield-mask.spec.ts` sont levés et verts.
2. `input.click()` puis `type('0612345678', { delay: 80 })` rend
   `06 12 34 56 78`.
3. La saisie reste correcte à 0 ms, 5 ms, 30 ms, 80 ms et 150 ms, ainsi que sur un
   autofill émis en un seul événement.
4. TU complets verts, e2e verts **en conditions CI** (Histoire statique,
   `E2E_STATIC=1` — mesurer contre `histoire dev` ne prouve rien).
5. Si l'option A est retenue : revue explicite des composants qui contraignent
   leur modèle, et un test couvrant le cas « le parent refuse la valeur ».

## Reproduction

Histoire sur `:6006`, story `TextField`, variante « Prop — mask (built-in
patterns) » :

```js
await input.click()
await input.fill('')
await input.type('0612345678', { delay: 80 })
// attendu "06 12 34 56 78", obtenu "01 23 45 67 8"
```
