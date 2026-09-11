# Spec technique — Composables transversaux (Commons)

> Périmètre : `packages/ds/src/composables/Commons/*.composable.ts` (66 fichiers),
> `CssSupport/cssSupport.composable.ts`, `Theme/theme.composable.ts`,
> `Theme/installed-themes.composable.ts`, `Transition/transition.composable.ts`,
> `Responsive/aspect.composable.ts`.
>
> Chaque section décrit le code tel qu'il existe réellement. Aucune signature n'est
> inventée ni extrapolée.

---

## Introduction — Architecture des composables transversaux

Les composables Commons sont le cœur architectural du design system origam. Ils
forment deux niveaux :

1. **Composables primitifs** — chaque axe visuel (couleur, rayon, ombre, espacement,
   dimensions) ou comportement (hover, focus, scroll, touch) est encapsulé dans un
   composable dédié qui respecte le contrat *classes-first / styles-fallback* : quand
   la valeur passée est un token du design system, une classe utilitaire est émise
   (`origam--bg-primary`, `origam--rounded-lg`, …) ; quand c'est une valeur brute
   (hex, pixel arbitraire), le composable émet un style inline.

2. **Composables orchestrateurs** — `useStateEffect`, `useColorEffect` agrègent les
   composables primitifs pour gérer les transitions d'état (repos → hover → active →
   disabled) en une seule API.

Tous les composables s'exécutent dans `<script setup lang="ts">` (Composition API).
Aucun ne fait d'appel réseau. Aucun n'importe de `$fetch` ni de service HTTP.

---

## Famille 1 — Style visuel

### `useColor`

- **Fichier** `packages/ds/src/composables/Commons/color.composable.ts`

- **Rôle** API bas niveau pour résoudre un couple `{ background?, text? }` en classes
  utilitaires + styles inline. Gère : intents sémantiques (design tokens), gradients CSS
  (`linear-gradient(…)`), couleurs brutes (legacy hex/rgb), auto-contraste WCAG.

- **Entrées**
  | Param | Type | Description |
  |---|---|---|
  | `colors` | `ComputedRef<{ background?: TColor, text?: TColor }>` | Couple bg/fg résolu en amont |

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `colorClasses` | `ComputedRef<string[]>` | `.origam--bg-{intent}` / `.origam--color-{intent}` quand tokenisé |
  | `colorStyles` | `ComputedRef<string[]>` | Déclarations CSS inline (`background-color: …`, `color: …`) |

  Règles de résolution du background : gradient → intent → `transparent` → CSS couleur.
  Auto-contraste : si `bg` est un intent et `text` non défini, `color` est pairé
  automatiquement depuis le token `fg` de l'intent. Si `bg` et `text` sont le même
  intent (clash hue-on-hue), `color` prend le token de contraste (blanc sur surface
  saturée).

- **Dépendances** `color.util.ts` (helpers intent/gradient/parseColor), `gradient.util.ts`.

- **Consommé par** `useBothColor`, `useTextColor`, `useBackgroundColor`, `useColorEffect`.

- **Notes** SSR-safe (pas de DOM). Les gradients occupent le canal `background-image`
  ; si bg ET fg sont des gradients, le fg gagne (text gradient est prioritaire).

- **Exemple**
  ```ts
  const { colorClasses, colorStyles } = useColor(
    computed(() => ({ background: 'primary', text: undefined }))
  )
  // colorClasses.value → ['origam--bg-primary']
  // colorStyles.value  → ['background-color: var(--origam-…)', 'color: var(--origam-…)']
  ```

---

### `useBothColor`

- **Fichier** `packages/ds/src/composables/Commons/color.composable.ts`

- **Rôle** Raccourci qui fusionne `bgColor` et `color` (issus de sources séparées) dans
  un unique appel à `useColor`.

- **Entrées**
  | Param | Type |
  |---|---|
  | `bgColorProps` | `T \| Ref<TColor> \| ComputedRef<TColor>` |
  | `colorProps` | `T \| Ref<TColor> \| ComputedRef<TColor>` |
  | `name?` | `K` (clé dans l'objet props) |

- **Sorties** Même forme que `useColor` : `{ colorClasses, colorStyles }`.

- **Dépendances** `useColor`.

- **Consommé par** Composants qui ont `bgColor` et `color` comme props séparées mais
  veulent une résolution unifiée.

---

### `useTextColor`

- **Fichier** `packages/ds/src/composables/Commons/color.composable.ts`

- **Rôle** Variante de `useColor` pour l'axe foreground uniquement.

- **Entrées** `props: T | Ref<TColor>`, `name?: K` (clé dans l'objet props).

- **Sorties** `{ textColorClasses, textColorStyles }`.

- **Notes** Réexpose `colorClasses` / `colorStyles` sous des noms préfixés `text` pour
  éviter les collisions dans les composants qui consomment aussi `useBackgroundColor`.

---

### `useBackgroundColor`

- **Fichier** `packages/ds/src/composables/Commons/color.composable.ts`

- **Rôle** Variante de `useColor` pour l'axe background uniquement.

- **Entrées** `props: T | Ref<TColor>`, `name?: K`.

- **Sorties** `{ backgroundColorClasses, backgroundColorStyles }`.

---

### `useColorEffect`

- **Fichier** `packages/ds/src/composables/Commons/color.composable.ts`

- **Rôle** Gestion des couleurs avec transitions d'état (repos / hover / active /
  disabled). Lit les overrides `hoverColor`, `hoverBgColor`, `activeColor`,
  `activeBgColor` issus des props. Implémente la règle de darkening canonical :
  hover = -20 % (rung `bgHover`), active = -30 % (rung `bgActive`). Émet classes
  utilitaires uniquement à l'état repos ; les états transitoires passent par styles
  inline (pas de classe utilitaire pour `bgHover`).

- **Entrées**
  | Param | Type | Default |
  |---|---|---|
  | `props` | `IColorProps & IBgColorProps` | obligatoire |
  | `isHover` | `Ref<boolean> \| ComputedRef<boolean>` | `ref(false)` |
  | `isActive` | `Ref<boolean> \| ComputedRef<boolean>` | `ref(false)` |
  | `isDisabled` | `Ref<boolean> \| ComputedRef<boolean>` | `ref(false)` |

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `colorClasses` | `ComputedRef<string[]>` | Classes utilitaires (repos seulement) |
  | `colorStyles` | `ComputedRef<string[]>` | Déclarations inline état-conscientes |
  | `color` | `ComputedRef<TColor>` | Couleur fg effective après résolution d'état |
  | `bgColor` | `ComputedRef<TColor>` | Couleur bg effective après résolution d'état |

- **Dépendances** Mêmes helpers que `useColor`, `rawBgExprWithState`, `tokenStylesForIntent`.

- **Consommé par** `OrigamBtn`, `OrigamChip`, `OrigamBadge`, `OrigamAlert`, `OrigamCard`,
  et ~49 autres composants selon le commentaire inline.

- **Notes** `isDisabled` est accepté pour symétrie API mais ne swape pas les tokens
  (disabled = voile opacité, pas swap token). Règle "same-intent" : si
  `hoverBgColor === bgColor` et les deux sont un même intent, le rung `bgHover` est
  quand même appliqué (l'override est ignoré).

---

### `useBorder`

- **Fichier** `packages/ds/src/composables/Commons/border.composable.ts`

- **Rôle** Résolution de la prop `border` (booléen, nombre, string directionnel ou
  keyword width) en classes + styles.

- **Entrées** `props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>`, `name?: string` (instance courante).

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `borderClasses` | `ComputedRef<string[]>` | `${name}--border`, `${name}--border-${direction}`, `origam--border-thin/thick/none` |
  | `borderStyles` | `ComputedRef<string[]>` | Variables CSS de border (width, style, color) si valeur numérique ou shorthand |

- **Dépendances** `BORDER_REGEX`, `DIRECTION_ARRAY`, `IBorderProps`, `formatBorderStylesVar`, `convertToUnit`.

- **Consommé par** `useStateEffect`, tous composants avec prop `border` : `OrigamCard`,
  `OrigamBtn`, `OrigamField`, `OrigamDialog`, etc.

- **Notes** Classes-first : `'none'|'thin'|'thick'` → utility class. `true` → `origam--border-thin`
  (legacy). Nombres → `border-width: Npx`. Props `borderColor` / `borderStyle` additives
  uniquement sur l'overload props-objet (pas sur l'overload Ref).

- **Exemple**
  ```ts
  const { borderClasses, borderStyles } = useBorder(props)
  // border="thick" → borderClasses = ['origam-btn--border', 'origam--border-thick']
  // border={2}     → borderStyles  = ['border-width: 2px']
  ```

---

### `useRounded`

- **Fichier** `packages/ds/src/composables/Commons/rounded.composable.ts`

- **Rôle** Résolution de la prop `rounded` en classes + styles `border-radius`.

- **Entrées** `props: IRoundedProps | Ref<boolean | number | string | TRounded | null | undefined>`, `name?: string`.

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `roundedClasses` | `ComputedRef<string[]>` | Classe utility (`origam--rounded-{xs…full}`) ou composant-local |
  | `roundedStyles` | `ComputedRef<string[]>` | Déclaration `border-radius: var(--origam-radius---{rung})` ou valeur brute |

- **Dépendances** `BORDER_RADIUS_REGEX`, `PREDEFINED_ROUNDED`, `IRoundedProps`, `TRounded`, `convertToUnit`, `formatRoundedStylesVar`.

- **Consommé par** `useStateEffect`, `OrigamBtn`, `OrigamCard`, `OrigamChip`, `OrigamAvatar`, etc.

- **Notes** Deux espaces de noms : legacy `PREDEFINED_ROUNDED` (`x-small|small|default|medium|large|x-large|shaped|shaped-invert`) vs utilitaires modernes `xs|sm|md|lg|xl|none|full`. `shaped`/`shaped-invert` restent owned par les SCSS des composants (asymétrie de coins). Styles inline companion pour les utility classes afin de gagner la cascade (spécificité `#id` > scoped SCSS).

---

### `useElevation`

- **Fichier** `packages/ds/src/composables/Commons/elevation.composable.ts`

- **Rôle** Conversion de la prop `elevation` (nombre Material 0-24 ou rung origam
  `none|xs|sm|md|lg|xl|2xl|3xl`) en classe utilitaire + `box-shadow` token.

- **Entrées**
  | Param | Type | Default |
  |---|---|---|
  | `props` | `IElevationProps \| Ref<number \| string \| undefined>` | obligatoire |
  | `flat` | `Ref<boolean>` | `ref(false)` |
  | `bgColor` | `Ref<TColor>` | `ref('rgb(0,0,0)')` (deprecated, ignoré) |
  | `name` | `string` | instance courante |

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `elevationClasses` | `ComputedRef<string[]>` | `${name}--elevated` + `origam--shadow-{rung}` |
  | `elevationStyles` | `ComputedRef<string[]>` | `box-shadow: var(--origam-shadow---{rung})` |

- **Dépendances** `ORIGAM_SHADOW_RUNGS`, `UTILITY_SHADOW_RUNGS`, `IElevationProps`, `TColor`, `getCurrentInstanceName`.

- **Consommé par** `useStateEffect`, `OrigamCard`, `OrigamBadge`, `OrigamChip`, `OrigamDialog`, etc.

- **Notes** Le paramètre `bgColor` est déprécié depuis la migration tokens ; il est accepté
  pour compat mais une alerte est émise une fois. La conversion numérique Material → rung
  (`elevationToToken`) utilise des buckets larges (0→`none`, 1→`xs`, 2-3→`sm`, 4-8→`md`,
  9-16→`lg`, 17+→`xl`). `flat=true` court-circuite toute émission.

---

### `useStateEffect`

- **Fichier** `packages/ds/src/composables/Commons/stateEffect.composable.ts`

- **Rôle** Orchestrateur de tous les axes visuels avec conscience d'état. Remplace
  la chaîne `useColorEffect + useBorder + useRounded + useElevation + usePadding +
  useMargin` que chaque composant répétait. Gère 8 axes : color, bgColor, border,
  rounded, elevation, padding, margin, gap.

- **Entrées**
  | Param | Type | Default |
  |---|---|---|
  | `props` | `IColorProps & IBgColorProps & IBorderProps & IRoundedProps & IElevationProps & IPaddingProps & IMarginProps & { gap? }` | obligatoire |
  | `isHover` | `Ref<boolean> \| ComputedRef<boolean>` | `computed(() => false)` |
  | `isActive` | `Ref<boolean> \| ComputedRef<boolean>` | `computed(() => false)` |
  | `hoverState` | `ComputedRef<IHoverState \| undefined>` | `computed(() => undefined)` |
  | `activeState` | `ComputedRef<IActiveState \| undefined>` | `computed(() => undefined)` |
  | `isDisabled` | `Ref<boolean> \| ComputedRef<boolean>` | `computed(() => false)` |
  | `flat` | `Ref<boolean> \| ComputedRef<boolean>` | `computed(() => false)` |

- **Sorties** 8 scalaires réactifs + 16 classes/styles (2 par axe) :
  ```
  color, bgColor, border, rounded, elevation, padding, margin, gap
  colorClasses, colorStyles, borderClasses, borderStyles,
  roundedClasses, roundedStyles, elevationClasses, elevationStyles,
  paddingClasses, paddingStyles, marginClasses, marginStyles,
  gapClasses, gapStyles
  ```

- **Dépendances** `useBorder`, `useRounded`, `useElevation`, `usePadding`, `useMargin` + helpers color.

- **Consommé par** `OrigamBtn`, `OrigamCard`, `OrigamChip`, `OrigamField` (composants à
  états complets). Remplace `useColorEffect` dans les nouveaux composants.

- **Notes** `pickEffective<T>` : résolution par ordre actif > hover > repos. Les valeurs
  repos sont passées comme **getter** (pas valeur eager) pour rester réactives aux
  changements de props runtime. Le `border` shorthand est swappable par état ; les
  props `borderColor` / `borderStyle` sont statiques (non swappables). Pas de `useGap`
  existant : le gap émet directement un style inline `gap: Npx`.

---

## Famille 2 — Dimensions et espacements

### `useDimension`

- **Fichier** `packages/ds/src/composables/Commons/dimension.composable.ts`

- **Rôle** Convertit les 6 props de dimension (`height`, `width`, `minHeight`, `minWidth`,
  `maxHeight`, `maxWidth`) en déclarations CSS inline.

- **Entrées** `props: IDimensionProps`

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `dimensionStyles` | `ComputedRef<string[]>` | Ex : `['height: 200px', 'max-width: 50%']` |

- **Dépendances** `DIMENSIONS_ARRAY`, `IDimensionProps`, `convertToUnit`, `toKebabCase`.

- **Consommé par** Tout composant qui expose `height`/`width`/`min*`/`max*` :
  `OrigamCard`, `OrigamDialog`, `OrigamImage`, `OrigamDataTable`, etc.

- **Notes** `convertToUnit` accepte nombres (→ `Npx`), chaînes CSS (`'50%'`, `'auto'`),
  variables CSS. La dimension est émise uniquement si la prop est truthy (les `undefined`
  sont ignorés silencieusement). Crucial : les composants NE DOIVENT PAS redéclarer ces
  props inline — ils doivent `extends IDimensionProps` (règle CLAUDE.md).

---

### `useSize`

- **Fichier** `packages/ds/src/composables/Commons/size.composable.ts`

- **Rôle** Résout la prop `size` (`TSize` : `x-small|small|default|large|x-large` ou
  valeur brute) en classes + styles `width`/`height`.

- **Entrées** `props: ISizeProps`, `name?: string`.

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `sizeClasses` | `ComputedRef<string[]>` | `${name}--size-${size}` + `origam--text-{xs…xl}` (bridge) |
  | `sizeStyles` | `ComputedRef<string[]>` | `width: N` + `height: N` pour valeurs non-tokenisées |

- **Dépendances** `SIZES_ARRAY`, `ISizeProps`, `TSize`, `convertToUnit`.

- **Consommé par** `OrigamBtn`, `OrigamChip`, `OrigamAvatar`, `OrigamIcon`, etc.

- **Notes** `sizeClasses` émet aussi `origam--text-{xs…xl}` via le bridge legacy-to-utility
  (`LEGACY_SIZE_TO_UTILITY`) — utile uniquement pour les composants dont `size` implique
  aussi une échelle typographique. Les composants purement dimensionnels doivent ignorer
  `sizeClasses` et n'utiliser que `sizeStyles`.

---

### `useDensity`

- **Fichier** `packages/ds/src/composables/Commons/density.composable.ts`

- **Rôle** Résout la prop `density` (`TDensity` : valeurs de `PREDIFINED_DENSITY`) en
  classe de densité.

- **Entrées** `props: IDensityProps | Ref<number | string | undefined>`, `name?: string`.

- **Sorties** `{ densityClasses: ComputedRef<string[]> }` — ex : `['origam-btn--density-compact']`.

- **Dépendances** `PREDIFINED_DENSITY`, `IDensityProps`, `TDensity`.

- **Consommé par** `OrigamBtn`, `OrigamList`, `OrigamListItem`, `OrigamSelect`, etc.

---

### `useMargin`

- **Fichier** `packages/ds/src/composables/Commons/margin.composable.ts`

- **Rôle** Résout la prop `margin` en classe utilitaire (échelle de tokens) ou style inline.

- **Entrées** `props: IMarginProps`, `name?: string`.

- **Sorties** `{ marginClasses, marginStyles }`.

- **Dépendances** `MARGIN_REGEX`, `IMarginProps`, `convertToUnit`, `formatMarginStylesVar`.

- **Consommé par** `useStateEffect`, composants avec espacement externe configurable.

- **Notes** Pattern string opt-in : `margin="4"` → `origam--m-4` (token `--origam-space---4` = 16px).
  `margin={4}` (nombre) → `margin: 4px` (pixel brut, legacy). Utilitaires axes
  (`mx`, `mt`, etc.) non encore disponibles en Phase 1.

---

### `usePadding`

- **Fichier** `packages/ds/src/composables/Commons/padding.composable.ts`

- **Rôle** Identique à `useMargin` mais pour l'espacement interne.

- **Entrées** `props: IPaddingProps`, `name?: string`.

- **Sorties** `{ paddingClasses, paddingStyles }`.

- **Dépendances** `PADDING_REGEX`, `IPaddingProps`, `convertToUnit`, `formatPaddingStylesVar`.

- **Consommé par** `useStateEffect`, `OrigamCard`, `OrigamBtn`, `OrigamField`, etc.

- **Notes** Même distinction string vs nombre que `useMargin`. Échelle : `'0'`…`'12'`.

---

## Famille 3 — Position et layout

### `useLocation` / `useLocationStrategies`

- **Fichier** `packages/ds/src/composables/Commons/location.composable.ts`

- **Rôle**
  - `useLocation` : résout une prop `location` (`TAnchor`, ex: `'top start'`) en styles CSS
    de positionnement absolu (`top`, `left`, `transform`).
  - `useLocationStrategies` : orchestre la stratégie de positionnement d'un overlay (Tooltip,
    Menu, Dialog) — s'abonne aux resize de la fenêtre et applique la stratégie sélectionnée.

- **Entrées `useLocation`** `props: ILocationProps`, `opposite?: boolean`, `offset?: (side: string) => number`.
- **Sorties `useLocation`** `{ locationStyles: ComputedRef<Record<string, string | number>> }`.

- **Entrées `useLocationStrategies`** `props: ILocationStrategyProps`, `data: ILocationStrategyData`.
- **Sorties `useLocationStrategies`** `{ contentStyles: Ref<{}>, updateLocation: Ref<((e: Event) => void) | undefined> }`.

- **Dépendances** `useToggleScope`, `IN_BROWSER`, `LOCATION_STRATEGIES`, `OPPOSITE_MAP`, `parseAnchor`.

- **Consommé par** `OrigamTooltip`, `OrigamMenu`, `OrigamDialog`, `OrigamBadge`.

- **Notes** `opposite=true` inverse le côté (pour les badges). Lors de l'activation, écoute
  `window.resize` en `passive`. SSR-safe : pas de DOM si `!IN_BROWSER`.

---

### `usePosition`

- **Fichier** `packages/ds/src/composables/Commons/position.composable.ts`

- **Rôle** Résout la prop `position` (`IPositionProps`) en classe CSS et props
  `top`/`bottom`/`left`/`right` en styles inline.

- **Entrées** `props: IPositionProps`, `name?: string`.

- **Sorties** `{ positionClasses: ComputedRef<string | undefined>, positionStyles: ComputedRef<string[]> }`.

- **Dépendances** `IPositionProps`, `getCurrentInstanceName`.

- **Consommé par** `OrigamToolbar`, `OrigamNavDrawer`, `OrigamFab`, etc.

---

### `useLayout` / `useLayoutItem` / `useCreateLayout`

- **Fichier** `packages/ds/src/composables/Commons/layout.composable.ts`

- **Rôle** Système de layout en couches. `useCreateLayout` crée le contexte provider ;
  `useLayoutItem` enregistre un item (AppBar, Drawer, BottomNav) dans le layout parent et
  calcule ses offsets/zIndex ; `useLayout` expose au contenu principal les dimensions
  réservées.

- **Entrées `useCreateLayout`** `props: { id?, overlaps?, fullHeight? }`.
- **Sorties `useCreateLayout`**
  | Nom | Description |
  |---|---|
  | `layoutClasses` | Classes CSS du root layout |
  | `layoutStyles` | Styles + CSS vars `--origam-layout---position-{top/bottom/left/right}` |
  | `getLayoutItem(id)` | Récupère l'item par id |
  | `items` | Liste reactive des items enregistrés |
  | `layoutRect` | DOMRect du layout (via ResizeObserver) |
  | `layoutRef` | Ref à passer au root element |
  | `layoutId` | ID calculé |

- **Entrées `useLayoutItem`**
  ```ts
  { id?, order: Ref<number>, position: Ref<TDirectionBoth>, layoutSize: Ref<number|string>,
    elementSize: Ref<number|string|undefined>, active: Ref<boolean|ComputedRef<boolean>>,
    disableTransitions?: Ref<boolean>, absolute: Ref<boolean|undefined> }
  ```
- **Sorties `useLayoutItem`** `{ layoutItemStyles, layoutRect, layoutItemScrimStyles, layoutId }`.

- **Dépendances** `useResizeObserver`, `ORIGAM_LAYOUT_ITEM_KEY`, `ORIGAM_LAYOUT_KEY`, `ROOT_ZINDEX`,
  `generateLayers`, `findChildrenWithProvide`, `convertToUnit`.

- **Consommé par** `OrigamLayout` (createLayout), `OrigamAppBar`, `OrigamNavigationDrawer`,
  `OrigamBottomNav`, `OrigamFooter`, `OrigamMain` (layoutItem/useLayout).

- **Notes** Fallback gracieux si pas de provider (`useLayoutItem` hors layout → `layoutItemStyles`
  vide, pas de crash). KeepAlive géré : `onDeactivated` désactive l'item. Exports CSS vars
  permettent aux enfants d'utiliser `padding-inline-start: var(--origam-layout---position-left)`.

---

### `useSticky`

- **Fichier** `packages/ds/src/composables/Commons/sticky.composable.ts`

- **Rôle** Comportement sticky avancé pour l'AppBar (panel collant qui peut se
  « coincer » en top ou bottom selon le défilement).

- **Entrées** `{ rootEl: Ref<HTMLElement>, isSticky: Ref<boolean>, layoutItemStyles: ComputedRef<CSSProperties> }` (interface `ISticky`).

- **Sorties** `{ isStuck: ShallowRef<boolean | 'top' | 'bottom'>, stickyStyles: ComputedRef<...> }`.

- **Dépendances** `ISticky`, `convertToUnit`.

- **Consommé par** `OrigamAppBar`.

- **Notes** Écoute `scroll` sur `window` en mode passif. Calcule la direction de scroll et la
  position relative au layout pour déterminer si l'élément est collé en haut (`'top'`), bas
  (`'bottom'`) ou en transition (`true`). Nettoyage via `onBeforeUnmount`.

---

## Famille 4 — État et modèle de données

### `useVModel`

- **Fichier** `packages/ds/src/composables/Commons/vModel.composable.ts`

- **Rôle** Pont v-model générique pour Vue 3. Gère le mode contrôlé (parent passe
  `v-model`) vs non contrôlé (état interne) avec normalisation camelCase/kebab-case.

- **Signature**
  ```ts
  function useVModel<Props, Prop, Inner = Props[Prop]>(
    props: Props,
    prop: Prop,
    defaultValue?: Props[Prop],
    transformIn?: (value?: Props[Prop]) => Inner,
    transformOut?: (value: Inner) => Props[Prop]
  ): TVModel<Props, Prop, Inner>
  ```

- **Sorties** Un `ComputedRef` avec setter + propriété `externalValue`.

- **Dépendances** `useToggleScope`, `TEventProp`, `TInnerVal`, `TVModel`, `getCurrentInstance`, `toKebabCase`.

- **Consommé par** Presque tous les composants interactifs : `useGroup`, `useNested`,
  `useActive`, `useFocus`, `useValidation`, `useDatePickerCalendar`, etc.

- **Notes** `isControlled` détecte la présence SIMULTANÉE de la prop ET du handler
  `onUpdate:prop`. En mode non contrôlé, synchronise l'interne via `watch`. Évite la
  mutation directe si la valeur n'a pas changé (guard `value === newValue`). `vnode.props`
  peut être `null` si aucun attribut (guard `?? {}`).

---

### `useActive`

- **Fichier** `packages/ds/src/composables/Commons/active.composable.ts`

- **Rôle** Gère l'état actif (appuyé/sélectionné) d'un composant. Supporte trois
  formes de la prop : `undefined/false` (toggle interne), `true` (forcé), `IActiveState`
  (objet config avec overrides visuels).

- **Entrées** `props: IActiveProps & Record<string, any>`, `prop?: string` (défaut `'active'`), `name?: string`.

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `isActive` | `ComputedRef<boolean>` | État effectif |
  | `activeState` | `ComputedRef<IActiveState \| undefined>` | Config objet si fournie |
  | `activeClasses` | `ComputedRef<string[]>` | `${name}--active` + `activeClass` legacy |
  | `onActive` | `() => void` | Toggle ou flip interne |

- **Dépendances** `useVModel`, `IActiveProps`, `IActiveState`.

- **Consommé par** `OrigamBadge` (via `modelValue`), `OrigamBottomNav`, `OrigamAlert`,
  composants avec état de sélection.

---

### `useHover`

- **Fichier** `packages/ds/src/composables/Commons/hover.composable.ts`

- **Rôle** Gère l'état hover d'un composant. Même philosophie tri-forme que `useActive` :
  `undefined/false` (mouseenter/leave), `true` (forcé), `IHoverState` (config d'overrides).

- **Entrées** `props: IHoverProps`, `name?: string`.

- **Sorties**
  | Nom | Type | Description |
  |---|---|---|
  | `isHover` | `ComputedRef<boolean>` | `forced \|\| isHovered` |
  | `hoverState` | `ComputedRef<IHoverState \| undefined>` | Config objet si fournie |
  | `hoverClasses` | `ComputedRef<string[]>` | `${name}--hovered` |
  | `onMouseenter` | `() => void` | À binder sur le root element |
  | `onMouseleave` | `() => void` | À binder sur le root element |

- **Dépendances** `IHoverProps`, `IHoverState`.

- **Consommé par** `OrigamBtn`, `OrigamCard`, `OrigamListItem`, composants qui passent
  `isHover` à `useStateEffect`.

---

### `useGroup` / `useGroupItem`

- **Fichier** `packages/ds/src/composables/Commons/group.composable.ts`

- **Rôle** Pattern provider/consumer pour groupes de sélection (BtnGroup, TabsGroup,
  ChipGroup, etc.). `useGroup` crée le provider avec logique de sélection multiple/exclusive
  ; `useGroupItem` enregistre un item et expose son état de sélection.

- **Entrées `useGroup`** `props: IGroupProps`, `injectKey: InjectionKey<IGroupProvide>`.
- **Sorties `useGroup`** `IGroupProvide` (fournit `register/unregister/select/step/isSelected/…`)

- **Entrées `useGroupItem`** `props: IGroupItemProps`, `injectKey`, `required?: boolean`.
- **Sorties `useGroupItem`** `IGroupItemProvide | null` :
  ```
  { id, isSelected, toggle, select, selectedClass, value, disabled, group }
  ```

- **Dépendances** `useVModel`, `IGroupItem`, `IGroupItemProps`, `IGroupItemProvide`,
  `IGroupProps`, `IGroupProvide`, `findChildrenWithProvide`, `getIds`, `getValues`, etc.

- **Consommé par** `OrigamBtnGroup`+`OrigamBtn`, `OrigamTabs`+`OrigamTab`,
  `OrigamChipGroup`+`OrigamChip`, `OrigamExpansionPanels`+`OrigamExpansionPanel`, etc.

- **Notes** Sélection multiple / exclusive pilotée par `props.multiple`. Contrainte
  mandatory : si `props.mandatory` et aucun item sélectionné, le premier non-disabled
  est auto-sélectionné. La navigation clavier (`step`) est sérialisée (ne supporte
  pas `multiple`). Les items sont insérés à l'index DOM correspondant (grâce à
  `findChildrenWithProvide`).

---

### `useNested` / `useNestedItem` / `useNestedGroupActivator`

- **Fichier** `packages/ds/src/composables/Commons/nested.composable.ts`

- **Rôle** Arbre de sélection récursif pour TreeView / List imbriquée. Gère
  l'ouverture/fermeture des groupes (via `openStrategy`) et la sélection des items
  (via `selectStrategy`).

- **Entrées `useNested`** `props: INestedProps` (contient `selectStrategy`, `openStrategy`,
  `mandatory`, `opened`, `selected`).

- **Sorties `useNested`** `nested.root` :
  ```
  { opened, selected, selectedValues, register, unregister, open, openOnSelect, select, children, parents }
  ```

- **Entrées `useNestedItem`** `id: Ref<unknown>`, `isGroup: boolean`.
- **Sorties `useNestedItem`** Item enrichi avec `isOpen`, `isSelected`, `isIndeterminate`,
  `isLeaf`, `open`, `select`, `parent`.

- **Dépendances** `useVModel`, `ORIGAM_NESTED_KEY`, `SELECT_STRATEGY`, `OPEN_STRATEGY`,
  sélect/open stratégies (classique, feuille, indépendant…).

- **Consommé par** `OrigamTreeView`, `OrigamList`, `OrigamListGroup`.

---

### `useItems`

- **Fichier** `packages/ds/src/composables/Commons/items.composable.ts`

- **Rôle** Normalise les items bruts passés via `props.items` en `IInternalListItem[]`
  et fournit `transformIn`/`transformOut` pour le v-model.

- **Entrées** `props: IItemProps & { itemType?: string }`.

- **Sorties** `{ items: ComputedRef<IInternalListItem[]>, hasNullItem, valueComparator, transformIn, transformOut }`.

- **Dépendances** `IInternalListItem`, `IItemProps`, `deepEqual`, `transformListItem`, `transformListItems`.

- **Consommé par** `OrigamSelect`, `OrigamAutocomplete`, `OrigamCombobox`, `OrigamList`.

---

### `useVariant`

- **Fichier** `packages/ds/src/composables/Commons/variant.composable.ts`

- **Rôle** Émet la classe `${name}--variant-${variant}` pour les composants multi-apparences.

- **Entrées** `props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>`, `name?: string`.

- **Sorties** `{ variantClasses: ComputedRef<string[]> }`.

- **Dépendances** `IVariantProps`, `TVariant`, `TVariantInput`.

- **Consommé par** `OrigamBtn`, `OrigamChip`, `OrigamTextField`, `OrigamSelect`, etc.

---

## Famille 5 — Overlay et portails

### `useActivator`

- **Fichier** `packages/ds/src/composables/Commons/activator.composable.ts`

- **Rôle** Coordonne l'élément déclencheur (activator) d'un overlay (Menu, Tooltip,
  Dialog). Gère click, contextmenu, mouseenter/leave, focus/blur. Intègre `useDelay`
  pour les open/close différés.

- **Entrées**
  | Param | Type |
  |---|---|
  | `props` | `IActivatorProps` |
  | `{ isActive, isTop }` | `{ isActive: Ref<boolean>, isTop: Ref<boolean> }` |

- **Sorties**
  ```
  activatorEl, activatorRef, target, targetEl, targetRef,
  activatorEvents, contentEvents, scrimEvents
  ```

- **Dépendances** `useDelay`, `IN_BROWSER`, `ORIGAM_MENU_KEY`, `activator`, `getTargetActivator`,
  `matchesSelector`, `refElement`.

- **Consommé par** `OrigamMenu`, `OrigamTooltip`, `OrigamDialog`, `OrigamContextualMenu`,
  `OrigamPopover`.

- **Notes** Supporte `openOnClick`, `openOnHover`, `openOnFocus`, `openOnContextMenu`
  (avec déduction automatique si non fourni). `target='cursor'` → position au pointeur
  (menu contextuel). Les scrim events gèrent le cas "premier enter" pour éviter que
  l'overlay se referme en entrant dedans. L'effectScope est stoppé si `activator` prop
  est falsy.

---

### `useStack`

- **Fichier** `packages/ds/src/composables/Commons/stack.composable.ts`

- **Rôle** Gestion globale de la pile d'overlays (z-index coordination). Chaque overlay
  actif s'inscrit dans `GLOBAL_STACK` ; le dernier actif est `globalTop`.

- **Entrées** `isActive: Readonly<Ref<boolean>>`, `zIndex: Readonly<Ref<string | number>>`,
  `disableGlobalStack: boolean`.

- **Sorties** `{ globalTop: Readonly<Ref<boolean>>, localTop: ComputedRef<boolean>, stackStyles: ComputedRef<{ zIndex: number }> }`.

- **Dépendances** `useToggleScope`, `GLOBAL_STACK`, `ORIGAM_STACK_KEY`, `IStackProvide`.

- **Consommé par** `OrigamDialog`, `OrigamMenu`, `OrigamTooltip`, `OrigamSnackbar`, `OrigamDrawer`.

- **Notes** `globalTop` est délayé d'un `setTimeout` pour éviter un flash (le calcul se
  fait après que le DOM s'est mis à jour). `localTop` dépend des `activeChildren` (enfants
  overlay actifs). Le z-index s'incrémente de 10 pour chaque overlay actif.

---

### `useTeleport`

- **Fichier** `packages/ds/src/composables/Commons/teleport.composable.ts`

- **Rôle** Résout la cible d'un `<Teleport>` Vue et crée/réutilise un container
  `.origam-overlay-container` dans le DOM cible.

- **Entrées** `target: Ref<boolean | string | Element>`.

- **Sorties** `{ teleportTarget: ComputedRef<HTMLElement | undefined> }`.

- **Dépendances** `IN_BROWSER`, `consoleWarn`.

- **Consommé par** Tous les composants overlay.

- **Notes** `target=true` → désactive le teleport (rendu en place). `target=false` →
  `document.body`. String → `document.querySelector`. SSR : renvoie `undefined` (pas de DOM).

---

### `useScopeId`

- **Fichier** `packages/ds/src/composables/Commons/scopeId.composable.ts`

- **Rôle** Extrait le `scopeId` du vnode courant pour le transmettre aux éléments
  téléportés (qui sortent du scope CSS Vue).

- **Entrées** Aucun.

- **Sorties** `{ scopeId: Record<string, ''> | undefined }`.

- **Consommé par** `OrigamDialog`, `OrigamMenu`, `OrigamTooltip` — bindé sur le contenu
  téléporté pour que les styles scoped continuent de s'appliquer.

---

## Famille 6 — Événements et interactions

### `useFocus`

- **Fichier** `packages/ds/src/composables/Commons/focus.composable.ts`

- **Rôle** Suivi de l'état focus via v-model `focused`.

- **Entrées** `props: IFocusProps`, `name?: string`.

- **Sorties** `{ focusClasses, isFocused, onFocus, onBlur }`.

- **Dépendances** `useVModel`, `IFocusProps`.

- **Consommé par** `OrigamTextField`, `OrigamSelect`, `OrigamTextarea`, `OrigamField`, etc.

---

### `useScroll` / `useScrollStrategies` / `useScrolling`

- **Fichier** `packages/ds/src/composables/Commons/scroll.composable.ts`

- **Rôle**
  - `useScroll` : suivi de la position de scroll (`currentScroll`, `scrollRatio`,
    `isScrollingUp`, `isScrollActive`) avec threshold configurable.
  - `useScrollStrategies` : orchestre la stratégie de scroll d'un overlay (close-on-scroll,
    reposition-on-scroll…).
  - `useScrolling` : helpers clavier pour list scrollable (PageUp/Down, Home/End,
    Tab → focus textfield).

- **Entrées `useScroll`** `props: IScrollProps`, `args?: { canScroll?: Ref<boolean> }`.
- **Sorties `useScroll`**
  ```
  scrollThreshold, currentScroll, currentThreshold,
  isScrollActive, scrollRatio, isScrollingUp, savedScroll
  ```

- **Dépendances** `IN_BROWSER`, `SCROLL_STRATEGIES`, `IScrollArguments`, `clamp`, `consoleWarn`.

- **Consommé par** `OrigamAppBar` (scroll-behavior), `OrigamMenu` (close-on-scroll),
  `OrigamVirtualScroll`.

---

### `useTouch`

- **Fichier** `packages/ds/src/composables/Commons/touch.composable.ts`

- **Rôle** Gestion du glisser tactile pour `OrigamDrawer`. Détecte si le touch
  commence dans la zone de déclenchement, calcule la progression du drag et la
  vitesse finale pour décider d'ouvrir ou fermer.

- **Entrées** `{ isActive, isTemporary, width, touchless, position }` (tous `Ref`).

- **Sorties** `{ isDragging, dragProgress, dragStyles }`.

- **Dépendances** `useVelocity`, `onMounted`, `onBeforeUnmount`.

- **Consommé par** `OrigamDrawer`, `OrigamNavigationDrawer`.

---

### `useDelay`

- **Fichier** `packages/ds/src/composables/Commons/delay.composable.ts`

- **Rôle** Encapsule un mécanisme de délai annulable pour les open/close d'overlays.

- **Entrées** `props: IDelayProps` (`openDelay`, `closeDelay`), `cb?: (value: boolean) => void`.

- **Sorties** `{ clearDelay, runOpenDelay, runCloseDelay }` (les deux derniers retournent une `Promise`).

- **Dépendances** `IDelayProps`, `defer`.

- **Consommé par** `useActivator`, `OrigamTooltip`, `OrigamMenu`.

---

### `useThrottleFn`

- **Fichier** `packages/ds/src/composables/Commons/throttle.composable.ts`

- **Rôle** Throttle d'une fonction avec leading edge.

- **Signature** `function useThrottleFn<T, R>(fn: (...args: T) => R, wait: number): (...args: T) => void`

- **Consommé par** Composants avec handlers fréquents (scroll, resize, input).

---

### `useVelocity`

- **Fichier** `packages/ds/src/composables/Commons/velocity.composable.ts`

- **Rôle** Calcule la vélocité d'un touch gesture via un buffer circulaire d'échantillons.

- **Entrées** Aucun (setup interne).

- **Sorties** `{ addMovement, endTouch, getVelocity }`.

- **Dépendances** `HISTORY`, `HORIZON`, `ISample`, `CircularBuffer`, `calculateImpulseVelocity`.

- **Consommé par** `useTouch`, `OrigamDrawer`.

---

### `useEventListener`

- **Fichier** `packages/ds/src/composables/Commons/eventListener.composable.ts`

- **Rôle** Ajoute des event listeners sur un élément (ou `window`) avec nettoyage
  automatique via `onScopeDispose`.

- **Signature** Surcharge variadic : `useEventListener(events, listeners, options?)` ou
  `useEventListener(target, events, listeners, options?)`.

- **Sorties** Fonction `stop()`.

- **Dépendances** `noop`, `resolveUnref`, `tryOnScopeDispose`, `unrefElement`.

- **Consommé par** `useDragResizer`, `OrigamContextualMenu`, etc.

---

### `useResizeObserver`

- **Fichier** `packages/ds/src/composables/Commons/resizeObserver.composable.ts`

- **Rôle** Observe les redimensionnements d'un élément via `ResizeObserver`.

- **Entrées** `callback?: ResizeObserverCallback`, `box?: 'content' | 'border'` (défaut `'content'`).

- **Sorties** `{ resizeRef: Ref<HTMLElement | null>, contentRect: Readonly<Ref<DOMRectReadOnly | undefined>> }`.

- **Dépendances** `IN_BROWSER`, `IResizeState`, `refElement`.

- **Consommé par** `useCreateLayout`, `useVirtual`, `OrigamCarousel`, `OrigamDialog`, etc.

---

### `useIntersectionObserver`

- **Fichier** `packages/ds/src/composables/Commons/intersectionObserver.composable.ts`

- **Rôle** Observe si un élément entre/sort du viewport.

- **Entrées** `callback?: IntersectionObserverCallback`, `options?: IntersectionObserverInit`.

- **Sorties** `{ intersectionRef: Ref<HTMLElement | undefined>, isIntersecting: ShallowRef<boolean> }`.

- **Dépendances** `SUPPORTS_INTERSECTION`.

- **Consommé par** `OrigamImage` (lazy-load), `OrigamInfiniteScroll`.

---

### `useDragResizer`

- **Fichier** `packages/ds/src/composables/Commons/dragResizer.composable.ts`

- **Rôle** Drag-resize d'un panel sur un axe (H ou V) avec contraintes min/max.

- **Entrées** `el: HTMLElement | undefined`, `value: Ref<number>`, `min: number`, `max: number`, `axis: TAxis`.

- **Sorties** (side-effects) Attache les listeners mousedown/touchstart, mute `value`.

- **Dépendances** `useEventListener`, `AXIS`, `CLIENT_POSITION`, `TAxis`, `addWindowListener`, `clamp`, `getPosition`.

- **Consommé par** `OrigamResizablePanel`, composants de split-view.

---

### `useHotkey`

- **Fichier** `packages/ds/src/composables/Commons/hotkey.composable.ts`

- **Rôle** Enregistrement de raccourcis clavier avec support des séquences (ex : `g h`),
  des combinaisons (`ctrl+shift+k`), et exclusion des inputs focusés.

- **Entrées** `keys: MaybeRef<string | undefined>`, `callback: (e: KeyboardEvent) => void`,
  `options?: IHotkeyOptions` (`event`, `inputs`, `preventDefault`, `sequenceTimeout`).

- **Sorties** Fonction `cleanup()`.

- **Dépendances** `IN_BROWSER`, `KEYBOARD_MODIFIERS`, `IHotkeyOptions`, `TKeyboardModifiers`,
  `splitKeyCombination`, `splitKeySequence`.

- **Consommé par** `OrigamCommandPalette`, composants avec shortcuts.

- **Notes** Cross-plateforme : `cmd` → `Meta` sur Mac, `Ctrl` ailleurs.
  Les séquences ont un timeout de 1000ms par défaut. Réactif : si `keys` change,
  les listeners sont nettoyés et ré-enregistrés.

---

## Famille 7 — SSR, cycle de vie et scopes

### `useHydration`

- **Fichier** `packages/ds/src/composables/Commons/hydration.composable.ts`

- **Rôle** Détecte si le composant a été hydraté côté client. Retourne `shallowRef(true)`
  immédiatement si hors SSR.

- **Entrées** Aucun.

- **Sorties** `ShallowRef<boolean>` (true après `onMounted` si SSR, true immédiatement sinon).

- **Dépendances** `useDisplay`, `IN_BROWSER`.

- **Consommé par** Composants qui ont un rendu différent SSR vs client.

---

### `useSsrBoot`

- **Fichier** `packages/ds/src/composables/Commons/ssrBoot.composable.ts`

- **Rôle** Supprime les transitions CSS le temps du premier rendu client (évite les
  transitions de "bootstrap" visibles à l'hydration).

- **Entrées** Aucun.

- **Sorties** `{ ssrBootStyles: ComputedRef<{ transition: 'none !important' } | []>, isBooted: Readonly<ShallowRef<boolean>> }`.

- **Consommé par** `OrigamDialog`, `OrigamDrawer`, `OrigamSnackbar`.

- **Notes** `isBooted` passe à `true` dans `requestAnimationFrame` au prochain tick après
  `onMounted` — garantit un frame de rendu sans transition.

---

### `useLazy`

- **Fichier** `packages/ds/src/composables/Commons/lazy.composable.ts`

- **Rôle** Contrôle le montage paresseux du contenu d'un overlay ou d'un onglet inactif.

- **Entrées** `props: { eager: boolean }`, `active: Ref<boolean>`.

- **Sorties** `{ isBooted, hasContent, onAfterLeave }`.

- **Consommé par** `OrigamDialog`, `OrigamTabs`, `OrigamExpansionPanel`.

- **Notes** `hasContent = isBooted || eager || active`. Une fois booté, reste booté
  sauf si `!eager` → `onAfterLeave` remet `isBooted = false` (démont réel après fermeture).

---

### `useToggleScope`

- **Fichier** `packages/ds/src/composables/Commons/toggleScope.composable.ts`

- **Rôle** Crée/détruit un `effectScope` Vue conditionnellement selon une `WatchSource<boolean>`.

- **Signature** `function useToggleScope(source: WatchSource<boolean>, fn: (reset: () => void) => void): void`

- **Dépendances** `effectScope`, `onScopeDispose`.

- **Consommé par** `useVModel` (scope non-contrôlé), `useLocationStrategies`, `useActivator`,
  `useValidation`, `useColorEffect`.

- **Notes** Passe une fonction `reset` à `fn` permettant à la scope de se redémarrer
  (ex: quand la stratégie change). Nettoyage automatique sur `onScopeDispose`.

---

### `useRefs`

- **Fichier** `packages/ds/src/composables/Commons/refs.composable.ts`

- **Rôle** Gestion de collections de refs template (pour `v-for` + `:ref`).

- **Entrées** Aucun (générique `<T extends object>`).

- **Sorties** `{ refs: Ref<(T | undefined)[]>, updateRef(e: any, i: number): void }`.

- **Consommé par** `OrigamCarousel`, `OrigamDataTable`, `OrigamList` (tracking des rows).

- **Notes** Reset automatique du tableau à `onBeforeUpdate` pour éviter des stale refs.

---

## Famille 8 — Données : filtrage, validation, statut

### `useFilter`

- **Fichier** `packages/ds/src/composables/Commons/filters.composable.ts`

- **Rôle** Filtrage réactif d'une collection d'items selon une query et une configuration
  de filtres. Expose les matches pour le highlighting.

- **Signature**
  ```ts
  function useFilter<T extends IInternalItem>(
    props: IFiltersProps,
    items: MaybeRef<T[]>,
    query: Ref<string | undefined> | (() => string | undefined),
    options?: { transform?, customKeyFilter? }
  )
  ```

- **Sorties** `{ filteredItems, filteredMatches, getMatches }`.

- **Dépendances** `IFiltersProps`, `IInternalItem`, `TFilterKeyFunctions`, `TFilterMatch`, `filterItems`.

- **Consommé par** `OrigamAutocomplete`, `OrigamCombobox`, `OrigamSelect`.

---

### `useValidation`

- **Fichier** `packages/ds/src/composables/Commons/validation.composable.ts`

- **Rôle** Validation asynchrone d'un champ de formulaire. S'intègre avec `OrigamForm`
  via injection `ORIGAM_FORM_KEY`.

- **Entrées** `props: IValidationProps`, `name?: string`, `id?: MaybeRef<string | number>`.

- **Sorties**
  ```
  errorMessages, isDirty, isDisabled, isReadonly, isPristine,
  isValid, isValidating, reset, resetValidation, validate, validationClasses
  ```

- **Dépendances** `useVModel`, `useToggleScope`, `ORIGAM_FORM_KEY`, `IValidationProps`.

- **Consommé par** `OrigamTextField`, `OrigamSelect`, `OrigamCheckbox`, `OrigamRadio`,
  `OrigamTextarea`, `OrigamField`.

- **Notes** `validateOn` accepte `'input'`, `'blur'`, `'submit'`, `'lazy'`. L'état
  `isPristine` empêche l'affichage d'erreurs avant interaction. L'enregistrement
  auprès du form parent (`form.register`) permet à `OrigamForm.validate()` de
  déclencher la validation sur tous les champs.

---

### `useStatus`

- **Fichier** `packages/ds/src/composables/Commons/status.composable.ts`

- **Rôle** Résout la prop `status` (`'info'|'success'|'warning'|'error'`) en icônes
  contextuelles et classe. Supporte les positions PREPEND/APPEND/BOTH/REPLACE.

- **Entrées** `props: IStatusProps & IAdjacentProps`, `name?: string`.

- **Sorties** `{ icon, appendIcon, prependIcon, statusClasses }`.

- **Dépendances** `STATUS_POSITION`, `IAdjacentProps`, `IStatusProps`.

- **Consommé par** `OrigamAlert`, `OrigamTextField`, `OrigamSelect`, `OrigamField`.

---

### `useMessage`

- **Fichier** `packages/ds/src/composables/Commons/message.composable.ts`

- **Rôle** Agrège les messages à afficher sous un champ (hints, erreurs, messages custom).

- **Entrées** `props: any` (doit avoir `messages`, `errorMessages`, `hint`), `otherMessages: Ref<any[]>`.

- **Sorties** `{ hasMessages: ComputedRef<boolean>, messages: ComputedRef<any> }`.

- **Consommé par** `OrigamField`, `OrigamMessages`.

---

## Famille 9 — Locale, routage et navigation

### `createLocale` / `useLocale` / `provideLocale` / `createRtl` / `useRtl` / `provideRtl`

- **Fichier** `packages/ds/src/composables/Commons/locale.composable.ts`

- **Rôle** Système d'internationalisation basé sur vue-i18n. `createLocale` initialise
  l'adaptateur ; `useLocale` lit le contexte injecté ; `provideLocale` surcharge pour
  un sous-arbre ; les variantes RTL ajoutent la gestion de la directionnalité.

- **Sorties `useLocale`** Instance `ILocaleInstance` injectée (inclut `t()`, `locale`, `provide`).
- **Sorties `useRtl`** `{ isRtl: ComputedRef<boolean>, rtlClasses: ComputedRef<string> }`.

- **Dépendances** `vue-i18n`, `ORIGAM_LOCALE_KEY`, `LOCALE_RTL_DEFAULT`, `createVueI18nAdapter`, `mergeDeep`.

- **Consommé par** `OrigamDefaultsProvider`, tous composants qui accèdent aux traductions.

---

### `useRoute` / `useRouter` / `useLink` / `useBackButton`

- **Fichier** `packages/ds/src/composables/Commons/router.composable.ts`

- **Rôle**
  - `useRoute` : ref réactive vers la route courante (via `vm.proxy.$route`).
  - `useRouter` : accès au router via l'instance courante.
  - `useLink` : résolution d'un prop `href`/`to` en tag (`<a>` ou balise custom) + état
    actif vue-router.
  - `useBackButton` : hook pour intercepter le bouton retour navigateur.

- **Consommé par** `OrigamListItem`, `OrigamBtn`, `OrigamTab`, `OrigamBreadcrumbs`.

---

### `createGoTo` / `useGoTo`

- **Fichier** `packages/ds/src/composables/Commons/goTo.composable.ts`

- **Rôle** Scroll animé vers un target (élément, sélecteur, offset numérique).
  Supporte scrolling horizontal. Lit RTL pour inverser la direction.

- **Signature `useGoTo`** `function useGoTo(options?: Partial<IGoToOptions>): go`
  Retourne `go(target, options?)` et `go.horizontal(target, options?)`.

- **Dépendances** `useRtl`, `ORIGAM_GO_TO_KEY`, `IGoToInstance`, `IGoToOptions`, `scrollTo`, `mergeDeep`.

- **Consommé par** `useVirtual`, `OrigamGoTop`, `OrigamScrollspy`.

---

### `useSelectLink`

- **Fichier** `packages/ds/src/composables/Commons/selectLink.composable.ts`

- **Rôle** Synchronise l'état actif d'un lien vue-router avec la sélection de groupe.
  Quand le lien devient actif (navigation), il appelle `select(true)` via `nextTick`.

- **Entrées** `link: IUseLink`, `select?: (value: boolean, e?: Event) => void`.

- **Consommé par** `OrigamListItem`, `OrigamTab`.

---

## Famille 10 — Utilitaires système

### `useLoader`

- **Fichier** `packages/ds/src/composables/Commons/loader.composable.ts`

- **Rôle** Normalise la prop `loading` polymorphe (`boolean | number | TLoaderConfig`) en
  un descripteur `IResolvedLoader` précisant le rendu à monter.

- **Entrées** `props: ILoaderProps`, `defaultKind?: TLoaderKind` (défaut `'circular'`), `name?: string`.

- **Sorties** `{ loaderClasses, isLoading, loaderConfig }`.
  - `loaderConfig` contient `{ isActive, kind, modelValue, indeterminate, overrides }`.

- **Dépendances** `ILoaderProps`, `TLoaderConfig`, `TLoaderKind`.

- **Consommé par** `OrigamBtn`, `OrigamCard`, `OrigamCarousel`.

---

### `createDate` / `useDate`

- **Fichier** `packages/ds/src/composables/Commons/date.composable.ts`

- **Rôle** Factory et hook pour l'adaptateur de dates (wrapping `DateAdapter` — API
  similaire à `date-fns`). Supporte >30 locales.

- **Sorties `useDate`** Instance de `DateAdapter` avec méthodes : `getYear`, `getMonth`,
  `format`, `isSameDay`, `addDays`, etc.

- **Dépendances** `ORIGAM_DATE_OPTIONS_KEY`, `IDateOptions`, `ILocaleInstance`, `DateAdapter`, `createInstance`.

- **Consommé par** `useDatePickerCalendar`, `OrigamDatePicker`, `OrigamCalendar`.

---

### `useDatePickerCalendar`

- **Fichier** `packages/ds/src/composables/Commons/date-picker-calendar.composable.ts`

- **Rôle** Logique calendrier du datepicker : calcul des semaines, jours, état
  sélectionné/désactivé/today, gestion du mois/année affichés.

- **Entrées** `props: ICalendarProps`.

- **Sorties**
  ```
  displayValue, daysInMonth, daysInWeek, genDays, model,
  weeksInMonth, weekDays, weekNumbers
  ```

- **Dépendances** `useDate`, `useVModel`, `DateAdapter`, `getWeek`, `wrapInArray`.

- **Consommé par** `OrigamDatePickerMonth`, `OrigamCalendar`.

---

### `useDefaults` / `provideDefaults` / `createDefaults`

- **Fichier** `packages/ds/src/composables/Commons/defaults.composable.ts`

- **Rôle** Système de defaults injectables par le parent (`OrigamDefaultsProvider`).
  Les consommateurs appellent `useDefaults(props)` et reçoivent un Proxy qui résout
  chaque prop dans l'ordre : valeur passée explicitement > defaults composant-spécifiques >
  defaults globaux > `withDefaults()`.

- **Entrées `useDefaults`** `props: T`, `name?: string`.
- **Sorties `useDefaults`** `T` (Proxy réactif).

- **Dépendances** `ORIGAM_DEFAULTS_KEY`, `IDefault`, `mergeDeep`.

- **Consommé par** Tout composant qui veut exposer ses props aux defaults (pattern opt-in).

---

### `useDisplay` / `createDisplay`

- **Fichier** `packages/ds/src/composables/Commons/display.composable.ts`

- **Rôle** Breakpoints réactifs (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) + détection
  mobile. S'abonne au resize de la fenêtre.

- **Entrées `useDisplay`** `props?: IDisplayProps` (surcharge du breakpoint mobile), `name?: string`.

- **Sorties** Toutes les flags breakpoints + `mobile`, `width`, `height`, `platform`, `displayClasses`.

- **Dépendances** `IN_BROWSER`, `ORIGAM_DISPLAY_KEY`, `IDisplayInstance`, `IDisplayOptions`,
  `parseDisplayOptions`, `getPlatform`, `getClientWidth`, `getClientHeight`.

- **Consommé par** `useHydration`, `useVirtual`, `OrigamCarousel`, `OrigamResponsive`, `OrigamGrid`.

---

### `useStyleTag` / `useStyle`

- **Fichier** `packages/ds/src/composables/Commons/style.composable.ts`

- **Rôle**
  - `useStyleTag` : injecte/supprime un `<style>` dans le `<head>` avec un id unique.
  - `useStyle` : wrapper de `useStyleTag` pour émettre les styles d'un composant
    (tableaux de déclarations → règle CSS `#id { … }`).

- **Entrées `useStyleTag`** `css: MaybeRef<string>`, `options?: IStyleTagOptions`.
- **Entrées `useStyle`** `styles: ComputedRef`, `uniq?: any`, `name?: string`.
- **Sorties** `{ id, css, load, unload, isLoaded }`.

- **Consommé par** Composants qui émettent des styles dynamiques par instance (scoped
  via l'id unique généré).

---

### `useProps`

- **Fichier** `packages/ds/src/composables/Commons/props.composable.ts`

- **Rôle** Fournit `filterProps` — utilitaire pour ne passer à un composant enfant que
  les props qu'il déclare (évite les warnings Vue d'attributs inconnus).

- **Entrées** `props: T`.
- **Sorties** `{ filterProps, props }` (type `IFilterPropsOptions<T>`).

- **Dépendances** `IFilterPropsOptions`, `pick`.

- **Notes** Les clés `undefined` sont supprimées du résultat pour ne pas écraser les
  `withDefaults()` de l'enfant.

---

### `useAdjacent` / `useAdjacentInner`

- **Fichier** `packages/ds/src/composables/Commons/adjacent.composable.ts`

- **Rôle** Détection de la présence des slots et props prepend/append (icône, avatar)
  pour conditionner le rendu des zones adjacentes d'un composant.

- **Entrées `useAdjacent`** `props: IAdjacentProps`, `prependIcon?: Ref|ComputedRef`, `appendIcon?: Ref|ComputedRef`.
- **Sorties `useAdjacent`** `{ hasPrependMedia, hasPrepend, hasAppendMedia, hasAppend, onClickPrepend, onClickAppend }`.

- **Consommé par** `OrigamListItem`, `OrigamCard`, `OrigamAlert`, `OrigamTextField`.

---

### `useVirtual`

- **Fichier** `packages/ds/src/composables/Commons/virtual.composable.ts`

- **Rôle** Virtualisation de liste (rendu des seules lignes visibles dans le viewport +
  buffer). Calcule les offsets, gère le scroll physique et le scroll programmatique
  (via `useGoTo`). Adaptatif : ajuste les tailles après le premier rendu.

- **Entrées** `props: IVirtualProps`, `items: Ref<readonly T[]>`.

- **Sorties**
  ```
  containerRef, markerRef, computedItems, paddingTop, paddingBottom,
  scrollToIndex, handleScroll, handleScrollend, handleItemResize
  ```

- **Dépendances** `useDisplay`, `useGoTo`, `useResizeObserver`, `binaryClosest`, `clamp`, `debounce`, `int`.

- **Consommé par** `OrigamVirtualScroll`, `OrigamList` (mode virtualisé), `OrigamSelect` (dropdown).

---

### `useAudio`

- **Fichier** `packages/ds/src/composables/Commons/audio.composable.ts`

- **Rôle** Intégration Web Audio API pour l'analyse de fréquences (waveform visualizer).

- **Entrées** `props: IUseAudioProps` (contient `audio`, `playAudio`).

- **Sorties** `{ audioData, analyser, audioRef, wasPlayed, isPlaying, onPlay, onStop }`.

- **Consommé par** `OrigamAudioPlayer`.

---

## Famille 11 — CSS Support, Thème, Transition, Responsive

### `useCssSupport` / `useCssSupportClient`

- **Fichier** `packages/ds/src/composables/CssSupport/cssSupport.composable.ts`

- **Rôle** Couche unique de feature-detection CSS. Expose un map réactif de flags
  booléens (dérivé de `FEATURE_QUERIES`). Jamais de `CSS.supports()` direct dans les
  composants.

- **Sorties `useCssSupport`**
  | Nom | Type | Description |
  |---|---|---|
  | `css` | `Readonly<Ref<TCssSupportMap>>` | Map réactif des features |
  | `supports(query)` | `(string) => boolean` | Free-form query, mis en cache |
  | `supportsAny(…)` | `(...string[]) => boolean` | Au moins une supportée |
  | `supportsAll(…)` | `(...string[]) => boolean` | Toutes supportées |
  | `has(feature)` | `(TCssFeatureName) => ComputedRef<boolean>` | Flag réactif nommé |

- **`useCssSupportClient(feature, options?)`** Version hydration-safe : retourne `Ref<boolean>`
  qui démarre à `defaultValue` et se met à jour dans `onMounted`.

- **Dépendances** `FEATURE_QUERIES` (const dans `CssSupport/css-support.const.ts`).

- **Consommé par** Composants qui choisissent CSS moderne vs fallback JS.

- **Notes** Le cache est module-level (singleton). `_resetCssSupportCache()` pour tests uniquement.
  SSR : tous les flags à `false` (JS fallback). Hydration : un seul `detectAll()` au premier
  appel browser.

---

### `useTheme`

- **Fichier** `packages/ds/src/composables/Theme/theme.composable.ts`

- **Rôle** Gestion des deux axes de theming :
  - **Brand** (`data-theme`) : `'auto' | 'light' | 'dark' | string` (ex : `'origam'`, `'brand-x'`).
  - **Mode** (`data-mode`) : `'auto' | 'light' | 'dark'`.
  Persistence `localStorage`, écoute `prefers-color-scheme`, application aux attributs `<html>`.

- **Sorties**
  | Nom | Description |
  |---|---|
  | `theme` | `Readonly<Ref<TTheme>>` — valeur brute brand |
  | `resolved` | `Readonly<Ref<TThemeResolved>>` — brand résolu après `auto` |
  | `setTheme(t)` | Impératif setter brand |
  | `toggle()` | Flip light ↔ dark (brand) |
  | `mode` | `Readonly<Ref<TMode>>` — valeur brute mode |
  | `resolvedMode` | `Readonly<Ref<TModeResolved>>` — mode résolu |
  | `setMode(m)` | Impératif setter mode |
  | `toggleMode()` | Flip light ↔ dark (mode) |

- **Fonctions utilitaires** `applyThemeSync`, `applyModeSync`, `readPersistedTheme`,
  `readPersistedMode` (pour plugins Nuxt no-flash).

- **Dépendances** `ORIGAM_MODE_ATTR`, `ORIGAM_THEME_ATTR`, `ORIGAM_THEME_STORAGE_KEY`,
  `ORIGAM_MODE_STORAGE_KEY`, `TMode`, `TModeResolved`, `TTheme`, `TThemeResolved`.

- **Consommé par** `OrigamThemeProvider`, `OrigamThemeSwitcher`, plugins Nuxt, marketing.

- **Notes** Singletons module-level (`_theme`, `_mode`, `_systemPrefersDark`) — tous les
  appels à `useTheme()` partagent les mêmes refs. `ensureSystemPreference` est lifecycle-
  indépendant (safe en plugin). `data-mode` est toujours concret (jamais `'auto'`), la
  matrice de tokens n'a pas de fallback mode-less.

---

### `useInstalledThemes`

- **Fichier** `packages/ds/src/composables/Theme/installed-themes.composable.ts`

- **Rôle** Lit la liste statique des thèmes installés via `createOrigam({ themes })`.

- **Entrées** Aucun.

- **Sorties** `TInstalledThemes` (tableau de `{ name, modes }`).

- **Dépendances** `ORIGAM_THEMES_KEY`, `TInstalledThemes`.

- **Consommé par** `OrigamThemeSwitcher`, pages de démo.

---

### `useTransition` / `useCssTransition` / `useWindowTransition`

- **Fichier** `packages/ds/src/composables/Transition/transition.composable.ts`

- **Rôle**
  - `useTransition` : base — résout `disabled` + `name` en `transitionName`.
  - `useCssTransition` : ajoute la gestion de `leaveAbsolute` (position absolute pendant
    le leave pour éviter les reflows), `hideOnLeave`, `origin`, et supporte `<TransitionGroup>`.
  - `useWindowTransition` : variante pour les transitions de contenu (Window, Dialog) —
    coordonne `transitionCount` et `transitionHeight` avec le contexte `OrigamWindow`.

- **Entrées** `props: ITransitionProps` (tous trois).

- **Sorties `useCssTransition`** `{ tag, name, isDisabled, transitionProps }`.
- **Sorties `useWindowTransition`** Idem + gestion de hauteur animée.

- **Consommé par** `OrigamTransition`, `OrigamDialog`, `OrigamExpansionPanel`, `OrigamTabs`.

---

### `useAspectRatio`

- **Fichier** `packages/ds/src/composables/Responsive/aspect.composable.ts`

- **Rôle** Calcule `padding-block-end` à partir d'un ratio (`"16/9"`, `"4/3"`, nombre…)
  pour maintenir un aspect ratio via la technique padding-bottom.

- **Entrées** `props: { aspectRatio?: string | number }`.

- **Sorties** `{ aspectStyles: ComputedRef<string[]> }`.

- **Consommé par** `OrigamImage`, `OrigamVideo`, `OrigamResponsive`.

- **Notes** Utilise `eval()` pour évaluer `"16/9"` → `1.777`. SSR-safe (renvoie `[]` si
  pas de ratio ni de `window`).

---

## Tableau récapitulatif — Composable → Consommateurs principaux

| Composable | Consommateurs principaux vérifiés |
|---|---|
| `useColor` | `useBothColor`, `useTextColor`, `useBackgroundColor`, `useColorEffect` |
| `useColorEffect` | `OrigamBtn`, `OrigamChip`, `OrigamBadge`, `OrigamAlert`, `OrigamCard` (~49) |
| `useBorder` | `useStateEffect`, `OrigamBtn`, `OrigamCard`, `OrigamField`, `OrigamDialog` |
| `useRounded` | `useStateEffect`, `OrigamBtn`, `OrigamCard`, `OrigamChip`, `OrigamAvatar` |
| `useElevation` | `useStateEffect`, `OrigamCard`, `OrigamBadge`, `OrigamChip`, `OrigamDialog` |
| `useStateEffect` | `OrigamBtn`, `OrigamCard`, `OrigamChip`, `OrigamField` |
| `useDimension` | `OrigamCard`, `OrigamDialog`, `OrigamImage`, `OrigamDataTable` |
| `useSize` | `OrigamBtn`, `OrigamChip`, `OrigamAvatar`, `OrigamIcon` |
| `useDensity` | `OrigamBtn`, `OrigamList`, `OrigamListItem`, `OrigamSelect` |
| `useMargin` | `useStateEffect`, composants avec `margin` prop |
| `usePadding` | `useStateEffect`, `OrigamCard`, `OrigamBtn`, `OrigamField` |
| `useLocation` | `OrigamTooltip`, `OrigamMenu`, `OrigamDialog`, `OrigamBadge` |
| `useLocationStrategies` | `OrigamMenu`, `OrigamTooltip`, overlays positionnés |
| `usePosition` | `OrigamToolbar`, `OrigamNavDrawer`, `OrigamFab` |
| `useLayout` | `OrigamMain`, `OrigamFooter`, `OrigamLayout` |
| `useLayoutItem` | `OrigamAppBar`, `OrigamNavigationDrawer`, `OrigamBottomNav` |
| `useCreateLayout` | `OrigamLayout` |
| `useSticky` | `OrigamAppBar` |
| `useVModel` | `useGroup`, `useNested`, `useActive`, `useFocus`, `useValidation` |
| `useActive` | `OrigamBadge`, `OrigamBottomNav`, `OrigamAlert` |
| `useHover` | `OrigamBtn`, `OrigamCard`, `OrigamListItem` |
| `useGroup` / `useGroupItem` | `OrigamBtnGroup`, `OrigamTabs`, `OrigamChipGroup`, `OrigamExpansionPanels` |
| `useNested` | `OrigamTreeView`, `OrigamList`, `OrigamListGroup` |
| `useItems` | `OrigamSelect`, `OrigamAutocomplete`, `OrigamCombobox`, `OrigamList` |
| `useVariant` | `OrigamBtn`, `OrigamChip`, `OrigamTextField`, `OrigamSelect` |
| `useActivator` | `OrigamMenu`, `OrigamTooltip`, `OrigamDialog`, `OrigamContextualMenu` |
| `useStack` | `OrigamDialog`, `OrigamMenu`, `OrigamTooltip`, `OrigamSnackbar` |
| `useTeleport` | Tous composants overlay |
| `useScopeId` | `OrigamDialog`, `OrigamMenu`, `OrigamTooltip` |
| `useFocus` | `OrigamTextField`, `OrigamSelect`, `OrigamTextarea`, `OrigamField` |
| `useScroll` | `OrigamAppBar`, `OrigamMenu`, `OrigamVirtualScroll` |
| `useScrollStrategies` | `OrigamMenu`, `OrigamTooltip` |
| `useScrolling` | `OrigamSelect`, `OrigamAutocomplete` |
| `useTouch` | `OrigamDrawer`, `OrigamNavigationDrawer` |
| `useDelay` | `useActivator`, `OrigamTooltip`, `OrigamMenu` |
| `useThrottleFn` | Handlers scroll/resize/input |
| `useVelocity` | `useTouch`, `OrigamDrawer` |
| `useEventListener` | `useDragResizer`, `OrigamContextualMenu` |
| `useResizeObserver` | `useCreateLayout`, `useVirtual`, `OrigamCarousel`, `OrigamDialog` |
| `useIntersectionObserver` | `OrigamImage` (lazy-load), `OrigamInfiniteScroll` |
| `useDragResizer` | `OrigamResizablePanel` |
| `useHotkey` | `OrigamCommandPalette` |
| `useHydration` | Composants avec rendu différent SSR/client |
| `useSsrBoot` | `OrigamDialog`, `OrigamDrawer`, `OrigamSnackbar` |
| `useLazy` | `OrigamDialog`, `OrigamTabs`, `OrigamExpansionPanel` |
| `useToggleScope` | `useVModel`, `useLocationStrategies`, `useActivator`, `useValidation` |
| `useRefs` | `OrigamCarousel`, `OrigamDataTable`, `OrigamList` |
| `useFilter` | `OrigamAutocomplete`, `OrigamCombobox`, `OrigamSelect` |
| `useValidation` | `OrigamTextField`, `OrigamSelect`, `OrigamCheckbox`, `OrigamRadio` |
| `useStatus` | `OrigamAlert`, `OrigamTextField`, `OrigamSelect`, `OrigamField` |
| `useMessage` | `OrigamField`, `OrigamMessages` |
| `createLocale` / `useLocale` | `OrigamDefaultsProvider`, composants i18n |
| `useRtl` | `OrigamDefaultsProvider`, composants directionnels |
| `useRoute` / `useRouter` / `useLink` | `OrigamListItem`, `OrigamBtn`, `OrigamTab`, `OrigamBreadcrumbs` |
| `useBackButton` | `OrigamDialog`, `OrigamDrawer` |
| `createGoTo` / `useGoTo` | `useVirtual`, `OrigamGoTop`, `OrigamScrollspy` |
| `useSelectLink` | `OrigamListItem`, `OrigamTab` |
| `useLoader` | `OrigamBtn`, `OrigamCard`, `OrigamCarousel` |
| `createDate` / `useDate` | `useDatePickerCalendar`, `OrigamDatePicker`, `OrigamCalendar` |
| `useDatePickerCalendar` | `OrigamDatePickerMonth`, `OrigamCalendar` |
| `useDefaults` / `provideDefaults` | `OrigamDefaultsProvider`, composants opt-in |
| `useDisplay` / `createDisplay` | `useHydration`, `useVirtual`, `OrigamCarousel`, `OrigamGrid` |
| `useStyleTag` / `useStyle` | Composants à styles dynamiques par instance |
| `useProps` | Transmission sélective de props entre composants parent/enfant |
| `useAdjacent` / `useAdjacentInner` | `OrigamListItem`, `OrigamCard`, `OrigamAlert`, `OrigamTextField` |
| `useVirtual` | `OrigamVirtualScroll`, `OrigamList` (mode virtualisé), `OrigamSelect` |
| `useAudio` | `OrigamAudioPlayer` |
| `useCssSupport` / `useCssSupportClient` | Composants CSS-first avec fallback JS |
| `useTheme` | `OrigamThemeProvider`, `OrigamThemeSwitcher`, plugins Nuxt |
| `useInstalledThemes` | `OrigamThemeSwitcher`, pages de démo |
| `useTransition` / `useCssTransition` / `useWindowTransition` | `OrigamTransition`, `OrigamDialog`, `OrigamExpansionPanel` |
| `useAspectRatio` | `OrigamImage`, `OrigamVideo`, `OrigamResponsive` |
