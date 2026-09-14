# ADR-007 — Props directionnelles : inventaire, puis décision inversée

- **Status**: **Superseded — le retrait n'aura PAS lieu.** L'inventaire
  ci-dessous reste exact et vaut d'être lu ; sa conclusion, non.

  L'inventaire a montré que la prémisse de la décision initiale — « ces props
  ne sont jamais utilisées » — était vraie pour 16 props et **fausse pour 10** :
  les directionnelles de `border` sont implémentées, documentées et testées,
  et avaient été câblées récemment *parce que* leur inertie était traitée comme
  un bug. Les retirer aurait annulé deux corrections.

  Mis devant ce fait, l'utilisateur a **inversé sa décision**, et sa raison
  vaut d'être conservée telle quelle :

  > « Soit on retire tout et on adapte ce qui doit l'être, soit on ne vire
  > rien et on adapte aussi, mais on ne fait pas moitié — sinon pour
  > l'utilisateur c'est nul. Les props, c'est pas au petit bonheur la chance :
  > si un format existe, il existe partout. Je veux que n'importe quel
  > utilisateur, à n'importe quel niveau, puisse designer comme bon lui semble
  > facilement. Si on garde juste padding/margin/rounded, ça veut dire que
  > l'utilisateur doit connaître le format CSS pour adapter chaque côté. »

  Les 16 props inertes ont donc été **implémentées** (commit `121b5450`), sur
  la grammaire de précédence de `useBorder`, puis câblées sur les 13 composants
  qui ne les consommaient pas (`249ac7d1`). Mesure indépendante : le garde
  `unconsumed-props` est passé de 1663 à 290 entrées baselinées.

- **Ce que cet ADR garde d'utile** : la méthode d'inventaire, les pièges de
  mesure (`padding-inline` et `border-top-color` sont aussi des propriétés CSS,
  donc un grep naïf compte du SCSS — sur 53 fichiers remontés bruts, ~20
  étaient pertinents), et les deux pièges de migration documentés plus bas.
- **Deciders**: user (arnaudprioul) — décision de principe déjà prise ;
  architect (inventaire + plan)
- **Scope**: `packages/ds` (`IPaddingProps`, `IMarginProps`, `IRoundedProps`,
  `IBorderProps`), `packages/stories`, `packages/marketing`, `packages/tests`
- **Relates to**: issue #215 (per-side border), issue #216 (ordre 4-valeurs
  logique)

---

## Décision de l'utilisateur

Retirer les props directionnelles pour « limiter les props, éviter d'en avoir
50000 à gérer alors qu'elles ne sont jamais utilisées ». Rupture d'API, donc
cible **3.0.0**, pas la 2.x.

## Ce qui contredit la prémisse

La prémisse est « jamais utilisées ». Elle est **vraie pour 16 props sur 26**
et **fausse pour 10**.

Les 10 props `border` directionnelles sont **implémentées, documentées et
testées**. Ce ne sont pas des props oubliées : elles ont été câblées
délibérément pour corriger le bug inverse (« surface à moitié implémentée »,
la faute que le `CLAUDE.md` du repo interdit explicitement).

- `borderTop/Right/Bottom/Left` + les 4 `border*Color` : câblées par
  l'issue #215, avec une table de précédence en JSDoc.
- `borderBlock` / `borderInline` : **la note de cadrage les donne pour mortes
  « confirmées par un chantier antérieur ». C'était vrai en 2.14.0 ; ça ne
  l'est plus.** Elles ont été implémentées depuis, précisément parce que leur
  inertie était considérée comme un bug. Le commit ajoute
  `BORDER_LOGICAL_AXIS_MAP` dans `useBorder`, met à jour la table de
  précédence, et corrige un second oubli dans `useStateEffect` (les getters
  ne les forwardaient pas, donc les ~30 composants passant par
  `useStateEffect` les ignoraient même après le fix de `useBorder`).

Retirer ces 10 props reviendrait à annuler deux corrections de bug récentes.
**Décision demandée à l'utilisateur avant d'exécuter quoi que ce soit sur le
groupe border.**

## Inventaire — mesuré, pas présumé

26 props directionnelles. Trois méthodes indépendantes, concordantes.

### INERTE — prouvé sans effet runtime (16 props)

| Interface | Props | Composant(s) déclarant |
|---|---|---|
| `IPaddingProps` | `paddingTop` `paddingLeft` `paddingBottom` `paddingRight` `paddingBlock` `paddingInline` | 100 (97 pour `paddingBottom`) |
| `IMarginProps` | `marginTop` `marginLeft` `marginBottom` `marginRight` `marginBlock` `marginInline` | 100 |
| `IRoundedProps` | `roundedTopRight` `roundedTopLeft` `roundedBottomLeft` `roundedBottomRight` | 102 |

`usePadding` et `useMargin` ne lisent que `props.padding` / `props.margin`.
`useRounded` ne reçoit que la valeur `rounded`. Aucun composant ne les lit
directement.

### CONSOMMÉ — le retrait casse un usage réel (10 props)

| Props | Câblage |
|---|---|
| `borderTop` `borderRight` `borderBottom` `borderLeft` | `BORDER_POSITION_MAP` → `border-{side}-{width,style,color}` |
| `borderTopColor` `borderRightColor` `borderBottomColor` `borderLeftColor` | idem, rung de précédence le plus spécifique |
| `borderBlock` `borderInline` | `BORDER_LOGICAL_AXIS_MAP` → `border-{axis}-{width,style,color}` |

### NON TRANCHÉ

Aucune. Les 26 sont classées par preuve runtime.

## Méthode et son taux d'erreur

Un `grep` naïf ne mesure **rien** ici, et c'est le piège central de ce
chantier : `padding-inline`, `border-top-color`, `margin-block` sont **aussi
des propriétés CSS**. Compter la forme kebab revient à compter les
déclarations SCSS.

Erreurs rencontrées et corrigées :

1. **Première version du script** — 35 fichiers annoncés pour `paddingInline`
   côté composants. Quasiment que du CSS en bloc `<style>`. Corrigé en
   retirant les `<style>` avant matching et en exigeant un `=` après la forme
   attribut.
2. **`packages/figma-plugin`** — 15 fichiers « touchant » les props padding.
   **Zéro pertinent** : ce sont les propriétés AutoLayout de l'API Figma
   (`frame.paddingTop`), homonymes.
3. **`virtual.composable.ts` / `OrigamVirtualScroll.vue`** — `paddingTop` y
   est un `shallowRef` d'offset de scroll virtuel, pas la prop.
4. **`OrigamPagination.vue`** — `getComputedStyle(...).marginRight`, lecture
   du DOM.
5. **`state-effect.interface.ts`** — un commentaire disant que `paddingTop`
   n'est **pas** supporté.
6. **Erreur de l'auteur de cette ADR** — ordre d'émission de
   `formatPaddingStylesVar` déduit d'une lecture tronquée, donc faux. Corrigé
   après échec du test. Les assertions d'ordre ont été rendues
   ordre-indépendantes pour ne pinner que la sémantique.

Sur 53 fichiers remontés par le balayage brut, **~20 seulement sont
pertinents**. Le reste est de l'homonymie.

Trois sources concordent sur les 16 inertes :

- lecture directe des composables ;
- preuve runtime — `packages/tests/TU/composables/Commons/directional-props-inventory.spec.ts`
  (37 tests) : deux valeurs distinctes par prop, comparaison des
  classes+styles émis ;
- le balayage préexistant du repo — `pnpm -F @origam/tests audit:inert-props`,
  qui les liste « inert on 100/102 components » et **ne liste aucune prop
  border**.

Le spec a d'ailleurs servi de détecteur de régression de la note de cadrage :
exécuté en 2.14.0, les assertions « `borderBlock` inerte » passent ; exécuté
sur la base actuelle, elles échouent avec un style réellement émis.

## Chemin de migration — vérifié

Le remplacement est la prop non directionnelle, en forme multi-valeurs. Prouvé
par test, pas supposé.

```
padding-top="8px"                        →  padding="8px 0 0 0"
padding-block="8px" padding-inline="16px" →  padding="8px 16px"
margin-top="8px"                          →  margin="8px 0 0 0"
rounded-top-left="4px"                    →  rounded="4px 0 0 0"
```

⚠️ **Deux pièges à écrire noir sur blanc dans le CHANGELOG :**

1. **L'ordre 4-valeurs est `Haut/Gauche/Bas/Droite`**, pas l'ordre CSS
   horaire `Top/Right/Bottom/Left`. Convention DS intentionnelle (issue #216),
   groupée par axe logique pour rester RTL-safe. Un consommateur qui migre
   `paddingRight` en supposant l'ordre CSS **inverse silencieusement gauche et
   droite**. C'est l'erreur de migration la plus probable.
2. **L'unité est obligatoire** dans une chaîne multi-valeurs :
   `padding="8 16"` n'émet **rien** (`PADDING_REGEX` exige une unité).
   Écrire `padding="8px 16px"`.

Pour `rounded`, le mécanisme 4-coins est déjà utilisé en production par le
Theme Builder (`packages/marketing/src/utils/theme-builder-rounded.util.ts`),
qui documente explicitement avoir contourné les 4 props de coin mortes.

## Périmètre du retrait (16 props inertes)

| Zone | Fichiers | Nature |
|---|---|---|
| `packages/ds/src/interfaces/Commons/` | 3 | retirer 16 déclarations (`padding`, `margin`, `rounded`) |
| `packages/ds/src/composables/Commons/margin.composable.ts` | 1 | **commentaire faux** à corriger (voir plus bas) |
| `packages/ds/SPECS/` | 2 | `20-composables-commons.md`, `30-interfaces.md` |
| `packages/ds/scripts/guards/README.md` | 1 | prose d'exemple |
| `packages/stories` | 15 | contrôles exposant des props sans effet |
| `packages/marketing` | 3 | `theme-builder-groups.const.ts` (16 entrées à retirer) ; `theme-builder-rounded.util.ts` et `theme-builder.interface.ts` (prose documentant ces props comme mortes, à réécrire au passé) |
| `packages/tests` | 4 | `dead-commons-props.spec.ts`, baseline `inert-props-sweep`, `directional-props-inventory.spec.ts`, `theme-builder-rounded.util.spec.ts` |

**`packages/docs` : zéro occurrence des 16 props inertes** — rien à retirer
des tables de props. (Les props border, elles, y sont documentées.)

Aucun composant ne redéclare ces props localement : elles arrivent toutes par
héritage des interfaces `Commons`. Retirer les 16 lignes des 3 interfaces les
retire donc des ~100 composants d'un coup, sans toucher un seul `.vue`.

### Effet de bord positif

Les 16 props inertes sont passées en attribut **uniquement dans les stories**
(0 dans docs, tests, marketing). Autrement dit, les contrôles Histoire
proposent aujourd'hui à l'utilisateur des curseurs qui ne font rien. C'est
l'argument le plus fort pour le retrait, indépendamment du nombre de props.

De même, `THEME_BUILDER_GROUPS` bucketise ces 16 noms : le Theme Builder les
affiche comme éditables alors qu'elles n'ont aucun effet.

### Dette adjacente constatée (hors périmètre directionnel)

- `margin.composable.ts` (l.19-21) affirme que `marginTop`, `marginInline`
  etc. « continue to fall through to the inline style path until Phase 1.5
  lands ». **C'est faux** : aucun chemin de ce type n'existe dans le fichier.
  Ce commentaire fait croire que les props marchent. À corriger que le retrait
  soit exécuté ou non.
- `loadingText` (`ILoaderProps`) est inerte sur 14 composants. Même classe de
  défaut, non directionnel — à traiter séparément.

## Séquencement proposé

1. **Arbitrage utilisateur sur le groupe border** (bloquant). Les 16 inertes
   ne dépendent pas de cet arbitrage et peuvent partir seules.
2. Retirer les 16 déclarations des 3 interfaces `Commons`.
3. Purger les contrôles de stories (15 fichiers) et les entrées
   `THEME_BUILDER_GROUPS`.
4. Convertir `dead-commons-props.spec.ts` : ces assertions « pinnent un défaut
   connu » ; une fois les props retirées, le défaut n'existe plus, le spec
   doit être supprimé et non adapté. Rebaseliner `inert-props-sweep`.
5. Corriger le commentaire de `margin.composable.ts`.
6. CHANGELOG `BREAKING` avec les deux pièges de migration ci-dessus.

## Ce qui n'est PAS dans le périmètre

Les props de `IDimensionProps` (`minHeight`, `maxWidth`, …) ne sont **pas**
directionnelles : ce sont des contraintes de taille, toutes consommées par
`useDimension` via `DIMENSIONS_ARRAY`. Hors sujet.

## Vérifications au moment de l'inventaire

- `pnpm -F @origam/tests exec vitest run --exclude "**/inert-props-sweep.spec.ts"`
  → **4452 passés, 1 échec attendu, 77 skipped**. La référence de cadrage est
  4420/1/77 ; l'écart de 32 est exactement le nombre de tests ajoutés par
  cette ADR.
- `node packages/ds/scripts/guards/run-all.mjs` → **5/5**.
- Node 22.22.2.
