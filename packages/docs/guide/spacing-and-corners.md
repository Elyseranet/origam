# Espacement et coins — props directionnelles

Tout composant qui expose `padding`, `margin`, `border` ou `rounded` expose
aussi la **déclinaison par côté et par coin**. Vous n'avez jamais besoin de
connaître l'ordre des raccourcis CSS pour ajuster un seul côté : nommez-le.

```vue
<origam-card padding="16px" padding-left="32px"/>
```

## Les quatre familles

| Famille | Raccourci | Axe logique | Côté / coin **logique** | Côté / coin **physique** |
|:--|:--|:--|:--|:--|
| Padding | `padding` | `paddingBlock` `paddingInline` | `paddingInlineStart` `paddingInlineEnd` `paddingBlockStart` `paddingBlockEnd` | `paddingTop` `paddingRight` `paddingBottom` `paddingLeft` |
| Margin | `margin` | `marginBlock` `marginInline` | `marginInlineStart` `marginInlineEnd` `marginBlockStart` `marginBlockEnd` | `marginTop` `marginRight` `marginBottom` `marginLeft` |
| Border | `border` | `borderBlock` `borderInline` | `borderInlineStart` `borderInlineEnd` `borderBlockStart` `borderBlockEnd` (+ `*Color`) | `borderTop` `borderRight` `borderBottom` `borderLeft` (+ `border*Color`) |
| Rounded | `rounded` | — | `roundedStartStart` `roundedStartEnd` `roundedEndStart` `roundedEndEnd` | `roundedTopLeft` `roundedTopRight` `roundedBottomLeft` `roundedBottomRight` |

La colonne « côté logique » est arrivée avec l'issue #1013 ; les trois autres
existaient déjà. Les quatre familles ont donc désormais la **même** grille
complète — c'est la directive qui a motivé ce lot : *si un format existe, il
existe partout.*

### Physique ou logique — lequel choisir

Les deux colonnes désignent les mêmes bords en LTR. La différence apparaît en
**RTL** (et en écriture verticale) :

| | `paddingLeft="32px"` | `paddingInlineStart="32px"` |
|:--|:--|:--|
| LTR | bord gauche | bord gauche |
| RTL | bord **gauche** | bord **droit** |

Prenez la forme **logique** dès que la valeur est un décalage *dans l'ordre de
lecture* — une indentation, une gouttière le long d'un filet d'accent : le
navigateur la retourne pour vous, sans CSS conditionnel. Gardez la forme
**physique** pour ce qui est réellement physique (un décalage lié à une ombre,
à un alignement sur un bord d'écran).

## Grammaire de précédence

**Le plus spécifique gagne.** La règle est identique pour les quatre
familles — c'est volontaire : une seule grammaire à retenir.

```
1. le raccourci global      padding
2. l'axe logique            paddingBlock / paddingInline
3. le côté logique          paddingInlineStart / paddingInlineEnd / paddingBlockStart / paddingBlockEnd
4. le côté physique         paddingTop / paddingRight / paddingBottom / paddingLeft
```

Chaque échelon n'écrase **que** le ou les bords qu'il vise ; le reste
continue de descendre de l'échelon inférieur.

```vue
<origam-card padding="4px" padding-block="16px" padding-top="40px"/>
```

- haut → `40px` (le côté physique gagne)
- bas → `16px` (l'axe logique gagne, rien de plus spécifique ne le vise)
- gauche et droite → `4px` (le raccourci gagne)

Pour `rounded`, il n'y a pas d'échelon d'axe — un coin appartient aux deux axes
à la fois — donc trois échelons : raccourci, coin logique, coin physique.

```vue
<origam-card rounded="lg" rounded-top-left="0px"/>
```

Seul le coin haut-gauche est mis à plat, les trois autres gardent `lg`.

::: warning Les échelons 3 et 4 sont à égalité de spécificité
`paddingInlineStart` et `paddingLeft` désignent **le même bord** en LTR : aucun
des deux n'est « plus spécifique » que l'autre. C'est donc l'ordre d'émission
qui tranche, et **c'est la forme physique qui gagne** — un choix d'uniformité
avec le seul autre arbitrage physique/logique déjà en place dans le DS (les
coins physiques battent la sortie logique du raccourci à 4 valeurs).

En pratique : **choisissez une grille et tenez-vous-y** pour un composant
donné. Écrire les deux formes pour un même bord est une erreur d'usage quel que
soit le sens de l'arbitrage — le résultat est correct mais illisible.
:::

::: tip Les coins logiques se lisent `{bloc}-{inline}`
C'est l'ordre du CSS, pas un parcours horaire : `roundedStartEnd` est le coin
*bloc-début / inline-fin*, donc **haut-droite** en LTR. Inverser les deux
moitiés arrondit silencieusement le coin opposé.
:::

::: tip Pourquoi les props par côté existent
Le raccourci à 4 valeurs du DS se distribue dans l'ordre
**Haut / Gauche / Bas / Droite**, et **non** dans l'ordre horaire du CSS
natif (`Haut / Droite / Bas / Gauche`). C'est une convention assumée du DS
(issue #216), pas un bug : les valeurs sont groupées par axe logique, ce qui
reste correct en RTL.

Les props par côté existent précisément pour que vous n'ayez pas à connaître
cette subtilité. `paddingLeft="8px"` n'a aucune ambiguïté.
:::

## Valeurs acceptées

### Padding et margin

| Vous écrivez | Résultat | Remarque |
|:--|:--|:--|
| `:padding-top="8"` | `8px` | nombre = pixels bruts |
| `padding-top="8px"` | `8px` | longueur CSS, telle quelle |
| `padding-top="1.5rem"` | `1.5rem` | toute unité CSS valide |
| `padding-top="4"` | `var(--origam-space---4)` | **échelon de l'échelle** du DS |
| `padding-top="var(--x)"` | tel quel | échappatoire |
| `padding-top="calc(1rem + 2px)"` | tel quel | échappatoire |
| `margin-top="auto"` | `auto` | mots-clés CSS |

::: warning Chaîne « 4 » ≠ nombre 4
`padding-top="4"` (chaîne) vise l'**échelle de design** et vaut
`var(--origam-space---4)`. `:padding-top="4"` (nombre) vaut `4px`. C'est le
même contrat que le raccourci `padding`, conservé pour compatibilité.

Les échelons existants sont `0 1 2 3 4 5 6 8 10 12`. Un entier hors de cette
liste (`"7"`) **n'émet rien** — le token n'existe pas.
:::

### Coins arrondis

| Vous écrivez | Résultat |
|:--|:--|
| `:rounded-top-left="8"` | `8px` |
| `rounded-top-left="8px"` | `8px` |
| `rounded-top-left="md"` | `var(--origam-radius---md, 8px)` |
| `rounded-top-left="large"` | `var(--origam-radius---xl, 16px)` |
| `rounded-top-left="var(--x)"` | tel quel |

Le vocabulaire est **exactement** celui du raccourci `rounded` : échelons
utilitaires (`none xs sm md lg xl full`) et variantes nommées
(`x-small small default medium large x-large`).

`shaped` et `shaped-invert` n'ont pas de sens sur un coin unique (ce sont des
formes asymétriques par définition) et n'émettent rien.

### Le cas `true`

Passer `true` à une prop directionnelle **n'émet rien**, et c'est
intentionnel. Sur le raccourci, `padding` à `true` active la classe héritée
`--padded` ; il n'existe pas d'équivalent par côté, et le DS n'expose aucun
token « espacement par défaut » dont on pourrait hériter. Passez une valeur.

## Bordures

`border` suit la même grammaire, avec un échelon de plus pour la couleur :

```
1. border
2. borderColor / borderStyle
3. borderBlock / borderInline
4. borderTop / borderRight / borderBottom / borderLeft
5. borderTopColor / borderRightColor / borderBottomColor / borderLeftColor
```

`borderTopColor` gagne donc sur la couleur embarquée dans `borderTop`, sur
la couleur d'axe, et sur le `borderColor` global.

```vue
<origam-card border="1px solid" border-top="3px dashed" border-top-color="primary"/>
```

Les props `border*Color` acceptent une **intention** (`primary`, `success`,
`danger`, …) et la résolvent vers le token de design correspondant. Les
dégradés ne sont pas supportés sur une couleur de bordure (le CSS natif ne
le permet pas) et sont ignorés.

## Comment c'est implémenté

Les déclarations sont empilées dans l'ordre des échelons ci-dessus au sein
d'un même bloc de style. La dernière déclaration gagne — y compris entre une
propriété logique (`padding-block`) et une propriété physique
(`padding-top`) qui visent le même bord. C'est la cascade CSS standard, pas
une résolution maison.

Les composables concernés — `usePadding`, `useMargin`, `useRounded`,
`useBorder` — portent chacun cette table de précédence en JSDoc.
