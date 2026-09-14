# Directives

Le design system expose **six** directives. Cette page les documente toutes.

> ⛔ **Corrigé le 2026-09-02.** Cette page listait **deux** directives sur six,
> pointait vers `/directives/vRipple` et `/directives/vIntersect` — un dossier
> qui **n'existe pas**, donc deux liens morts — et se terminait par
> *« Cette liste est extraite automatiquement de votre dossier
> `src/directives` »*, ce qui était faux : rien ne l'extrayait, et quatre
> directives manquaient. Le critère C7 du classeur d'inspection appelle ça une
> doc **mensongère**, par opposition à une doc absente. Le contenu ci-dessous
> est mesuré sur les fichiers de `packages/ds/src/directives/`.

## Vue d'ensemble

| Directive | Rôle | Consommateurs dans le DS |
|---|---|---|
| `v-contrast` | Force un premier-plan lisible sur le fond calculé | **30** — la plus utilisée |
| `v-intersect` | Rappel quand l'élément entre ou sort du viewport | 6 |
| `v-ripple` | Onde au point de contact | 6 |
| `v-touch` | Gestes tactiles (swipe, start/move/end) | 3 |
| `v-click-outside` | Rappel quand un clic tombe hors de l'élément | 2 |
| `v-hover` | État de survol | **0** — exportée, utilisée nulle part en interne |

## `v-contrast`

Applique une couleur de texte lisible sur le fond effectivement calculé de
l'élément. C'est le garde WCAG du DS, et de loin la directive la plus posée.

```vue
<origam-card v-contrast bg-color="warning">Texte toujours lisible</origam-card>
```

Elle reprogramme une mesure à chaque mise à jour, et **annule les minuteries en
attente** — à la fois avant d'en reprogrammer et au démontage. Sans cette
annulation, un composant qui se met à jour souvent accumulerait des rappels
exécutés ensuite sur un nœud détaché.

## `v-intersect`

```vue
<div v-intersect="onVisible">…</div>
<div v-intersect="{ handler: onVisible, options: { threshold: 0.5 } }">…</div>
```

Modificateurs : `.once` (se démonte à la première intersection), `.quiet`
(n'appelle pas au montage initial).

> ⚠️ **`options` est figé au montage.** Il est passé au constructeur de
> l'`IntersectionObserver` ; le changer exigerait de détruire et recréer
> l'observer. Le **handler**, lui, est relu à chaque intersection : l'échanger
> fonctionne.

## `v-ripple`

```vue
<button v-ripple>Cliquer</button>
<button v-ripple="{ class: 'ma-classe' }">Personnalisé</button>
```

Le démontage ne fait pas de `clearTimeout` sur la minuterie en cours, et c'est
volontaire : les trois rappels sont gardés par un `?.` sur `element._ripple`,
supprimé juste avant. Ils s'auto-neutralisent, sans exception ni travail, et la
minuterie résiduelle est bornée.

## `v-touch`

```vue
<div v-touch="{ left: onSwipeLeft, right: onSwipeRight }">…</div>
<div v-touch="{ parent: true, up: onSwipeUp }">…</div>
```

`parent: true` pose les écouteurs sur `el.parentElement`.

> ⛔ Les écouteurs sont retirés **avec les mêmes `options`** qu'à
> l'enregistrement. `removeEventListener` n'apparie que sur le triplet
> `(type, callback, capture)` : sans les options, un écouteur `capture: true`
> n'est **jamais** retiré. Aggravé par `parent`, dont le nœud survit au
> démontage de l'enfant.

## `v-click-outside`

```vue
<div v-click-outside="onClose">…</div>
<div v-click-outside="{ handler: onClose, include: () => [refEl] }">…</div>
```

`include` liste des éléments supplémentaires considérés comme « dedans ».
`closeConditional` permet de court-circuiter.

> ⚠️ Le rappel part dans un `setTimeout(…, 0)`. Un test qui assert
> **synchroniquement** après avoir dispatché le clic mesurera toujours zéro
> appel — il faut laisser tourner la boucle d'événements. Ce détail a fait
> conclure à tort, par deux fois, que les gardes internes n'étaient pas
> satisfaites.

## `v-hover`

```vue
<div v-hover="onHoverChange">…</div>
```

La seule des six sans défaut fonctionnel : nettoyage complet, hook `updated`
présent, test dédié. À noter qu'**aucun composant du DS ne l'utilise** — elle
est exportée publiquement pour les consommateurs.

## Réactivité

Les six directives relisent leur valeur liée après le montage : échanger le
handler prend effet. `v-click-outside` et `v-intersect` ne le faisaient pas
avant le 2026-09-02 — leurs closures retenaient l'objet `binding` du montage,
que Vue reconstruit à chaque mise à jour, donc la valeur y était figée pour
toujours.
