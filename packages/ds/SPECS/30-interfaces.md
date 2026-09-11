# Spec technique — Interfaces (`packages/ds/src/interfaces`)

> Générée depuis le code source réel. Aucun champ inventé.
> 269 fichiers `.interface.ts` au total. Périmètre : monorepo origam, branche `feature/marketing-v5-phase1`.

---

## Principe fondateur : étendre une Commons plutôt que redéclarer

La règle cardinale du design system origam est gravée dans le `CLAUDE.md` du monorepo :

> **Avant de déclarer une nouvelle prop sur une interface composant, auditer `packages/ds/src/interfaces/Commons/*` pour une interface existante qui couvre déjà cette surface. Si elle existe, `extends` la.**

Cette règle évite deux catégories de bugs récurrents :

1. **Surfaces à moitié implémentées** — un composant déclare `height` mais ignore `width` / `maxHeight` / etc., si bien qu'un `:max-height="50vh"` passé par un consommateur est silencieusement ignoré.
2. **Dérive** — le `convertToUnit` standard de `useDimension` accepte des nombres (`→ "Npx"`), des longueurs CSS, des références de propriétés custom et des raccourcis `aspect-ratio`. Un parseur maison ratera inévitablement l'un de ces cas au fil du temps.

Tous les composants présentés dans la suite de ce document respectent ce contrat.

---

## Interfaces Commons (source de vérité des surfaces transversales)

Les 55 interfaces du dossier `Commons/` constituent la colonne vertébrale du système. Elles sont réparties en trois sous-groupes : **props visuelles**, **props comportementales**, et **contrats internes / services**.

---

### `IColorProps` et `IBgColorProps`

**Fichier** : `Commons/color.interface.ts`

**Rôle** : séparation orthogonale du canal texte/icône (`color`) et du canal surface/fond (`bgColor`). Un composant qui ne peint que du texte étend `IColorProps` uniquement ; un composant qui possède une surface étend les deux.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `color` | `TColor` | oui | Couleur foreground (texte / icône). Accepte un `TIntent`, un hex brut ou un gradient. |
| `bgColor` | `TColor` | oui | Couleur surface (background). Même union que `color`. |

**Extends** : aucun

**Types associés** : `TColor` (`packages/ds/src/types/Commons/color.type.ts`), `TIntent`

**Composables consommateurs** : `useColor`, `useBackgroundColor`, `useTextColor`, `useColorEffect`, `useStateEffect`

**Règle de composition** :
- Composants typographiques purs (Title, Label, Tooltip texte) → `extends IColorProps` seulement.
- Composants qui possèdent une surface (Btn, Card, Badge, Alert, Pagination, …) → `extends IColorProps, IBgColorProps`.
- Les overrides d'état (`hoverColor`, `activeBgColor`) sont encapsulés dans `IHoverState` / `IActiveState` (objets passés aux props `hover` / `active`), jamais comme props à plat.

---

### `IDimensionProps`

**Fichier** : `Commons/dimension.interface.ts`

**Rôle** : dimensions CSS des six axes (`height`, `width`, `min*`, `max*`). Toute déclaration inline de `height?:` ou `width?:` dans une interface composant est une violation de cette règle — elle doit `extends IDimensionProps`.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `height` | `number \| string` | oui | Hauteur (`convertToUnit` : nombre → `px`, string → verbatim). |
| `width` | `number \| string` | oui | Largeur. |
| `minHeight` | `number \| string` | oui | Hauteur minimale. |
| `minWidth` | `number \| string` | oui | Largeur minimale. |
| `maxHeight` | `number \| string` | oui | Hauteur maximale. |
| `maxWidth` | `number \| string` | oui | Largeur maximale. |

**Extends** : aucun

**Composables consommateurs** : `useDimension` → retourne `dimensionStyles: CSSProperties`

---

### `IMarginProps`

**Fichier** : `Commons/margin.interface.ts`

**Rôle** : marges externes sur les six axes logiques et physiques. Valeur `boolean` = toggle du token par défaut ; `number` → `px` via `convertToUnit` ; `string` → verbatim.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `margin` | `boolean \| number \| string` | oui | Marge sur tous les côtés. |
| `marginTop` | `boolean \| number \| string` | oui | Marge haute. |
| `marginLeft` | `boolean \| number \| string` | oui | Marge gauche. |
| `marginBottom` | `boolean \| number \| string` | oui | Marge basse. |
| `marginRight` | `boolean \| number \| string` | oui | Marge droite. |
| `marginBlock` | `boolean \| number \| string` | oui | Marge bloc (haut + bas, axe logique). |
| `marginInline` | `boolean \| number \| string` | oui | Marge inline (gauche + droite, axe logique). |

**Extends** : aucun

**Composables consommateurs** : `useMargin`

---

### `IPaddingProps`

**Fichier** : `Commons/padding.interface.ts`

**Rôle** : rembourrage interne, même grammaire que `IMarginProps`.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `padding` | `boolean \| number \| string` | oui | Padding sur tous les côtés. |
| `paddingTop` | `boolean \| number \| string` | oui | Padding haut. |
| `paddingLeft` | `boolean \| number \| string` | oui | Padding gauche. |
| `paddingBottom` | `boolean \| number \| string` | oui | Padding bas. |
| `paddingRight` | `boolean \| number \| string` | oui | Padding droit. |
| `paddingBlock` | `boolean \| number \| string` | oui | Padding bloc. |
| `paddingInline` | `boolean \| number \| string` | oui | Padding inline. |

**Extends** : aucun

**Composables consommateurs** : `usePadding`

---

### `IBorderProps`

**Fichier** : `Commons/border.interface.ts`

**Rôle** : border sur les six axes, plus couleur et style. La prop `border` accepte un booléen (toggle), un nombre (épaisseur token), une string (valeur CSS) ou un/plusieurs `TDirectionBoth` pour cibler des côtés.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `border` | `boolean \| number \| string \| TDirectionBoth \| Array<TDirectionBoth>` | oui | Border global ou directionnel. |
| `borderTop` | `boolean \| number \| string` | oui | Bordure haute uniquement. |
| `borderLeft` | `boolean \| number \| string` | oui | Bordure gauche. |
| `borderBottom` | `boolean \| number \| string` | oui | Bordure basse. |
| `borderRight` | `boolean \| number \| string` | oui | Bordure droite. |
| `borderBlock` | `boolean \| number \| string` | oui | Bordure bloc (logique). |
| `borderInline` | `boolean \| number \| string` | oui | Bordure inline (logique). |
| `borderColor` | `string` | oui | Couleur de la bordure. |
| `borderStyle` | `string` | oui | Style de la bordure (`solid`, `dashed`, …). |

**Extends** : aucun

**Types associés** : `TDirectionBoth`

**Composables consommateurs** : `useBorder`

---

### `IRoundedProps`

**Fichier** : `Commons/rounded.interface.ts`

**Rôle** : rayon des coins. Trois modes : variante nommée (token), booléen/chaîne vide (classe legacy `--rounded`), ou valeur CSS brute (inline style).

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `rounded` | `boolean \| number \| string \| TRounded \| null \| undefined` | oui | Rayon global. Token nommé → classe utility. CSS brut → `roundedStyles`. |
| `roundedTopRight` | `boolean \| number \| string` | oui | Coin haut-droit. |
| `roundedTopLeft` | `boolean \| number \| string` | oui | Coin haut-gauche. |
| `roundedBottomLeft` | `boolean \| number \| string` | oui | Coin bas-gauche. |
| `roundedBottomRight` | `boolean \| number \| string` | oui | Coin bas-droit. |

**Extends** : aucun

**Types associés** : `TRounded`

**Composables consommateurs** : `useRounded` → retourne `roundedClasses` + `roundedStyles`

---

### `IElevationProps`

**Fichier** : `Commons/elevation.interface.ts`

**Rôle** : ombre portée (`box-shadow`) via les tokens d'élévation.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `elevation` | `number \| string` | oui | Rung d'élévation (0–24 ou nom de token). |

**Extends** : aucun

**Composables consommateurs** : `useElevation`

---

### `IDensityProps`

**Fichier** : `Commons/density.interface.ts`

**Rôle** : compacité verticale du composant (espace interne réduit en mode `compact` ou `comfortable`).

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `density` | `TDensity` | oui | `'default' \| 'comfortable' \| 'compact'` |

**Extends** : aucun

**Types associés** : `TDensity`

**Composables consommateurs** : `useDensity`

---

### `ISizeProps`

**Fichier** : `Commons/size.interface.ts`

**Rôle** : taille sémantique du composant (icons, avatars, badges…) via les tokens.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `size` | `TSize \| number` | oui | Token de taille ou pixels. `TSize` = `'x-small' \| 'small' \| 'default' \| 'large' \| 'x-large'` |

**Extends** : aucun

**Types associés** : `TSize`

**Composables consommateurs** : `useSize`

---

### `ILocationProps` et `ILocationStrategyProps`

**Fichier** : `Commons/location.interface.ts`

**Rôle** : ancrage spatial d'un composant ou d'une surface flottante.

**`ILocationProps`** — champs :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `location` | `TAnchor` | oui | Ancre sémantique (`'top' \| 'bottom' \| 'start' \| 'end' \| ...`). |

**`ILocationStrategyProps` (extends `IDimensionProps`)** — champs supplémentaires :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `locationStrategy` | `TLocationStrategy \| TLocationStrategyFn` | oui | Stratégie de positionnement (connected, static, …). |
| `location` | `TAnchor` | oui | Ancre pour la stratégie. |
| `origin` | `TAnchor \| 'auto' \| 'overlap'` | oui | Point d'origine du positionneur. |
| `offset` | `number \| string \| Array<number>` | oui | Décalage depuis l'ancre. |
| `viewportMargin` | `number` | oui | Marge viewport (px) entre la surface flottante et le chrome du navigateur. Défaut `12`. |

**`ILocationStrategyData`** — données réactives injectées par le composable :

| Champ | Type | Description |
|-------|------|-------------|
| `contentEl` | `Ref<HTMLElement \| undefined>` | Référence à l'élément flottant. |
| `target` | `Ref<HTMLElement \| [x, y] \| undefined>` | Cible de l'ancrage. |
| `isActive` | `Ref<boolean>` | État ouvert/fermé. |

**Extends** : `ILocationStrategyProps extends IDimensionProps`

**Types associés** : `TAnchor`, `TLocationStrategy`, `TLocationStrategyFn`

**Composables consommateurs** : `useLocationStrategies`

---

### `IPositionProps`

**Fichier** : `Commons/position.interface.ts`

**Rôle** : positionnement CSS (`position: fixed/absolute/sticky`) + décalages.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `position` | `TPosition` | oui | `'static' \| 'relative' \| 'fixed' \| 'absolute' \| 'sticky'` |
| `top` | `number \| string` | oui | Décalage depuis le haut. |
| `bottom` | `number \| string` | oui | Décalage depuis le bas. |
| `left` | `number \| string` | oui | Décalage depuis la gauche. |
| `right` | `number \| string` | oui | Décalage depuis la droite. |

**Extends** : aucun

**Types associés** : `TPosition`

**Composables consommateurs** : `usePosition`

---

### `IVariantProps`

**Fichier** : `Commons/variant.interface.ts`

**Rôle** : variante visuelle unifiée couvrant les composants d'action (Btn, Chip) et les inputs (Field, TextField).

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `variant` | `TVariant \| TVariantInput` | oui | `'text' \| 'flat' \| 'elevated' \| 'tonal' \| 'outlined' \| 'plain'` OU `'solo' \| 'filled' \| 'underlined' \| ...` |

**Types associés** : `TVariant`, `TVariantInput`

---

### `IActivatorProps`

**Fichier** : `Commons/activator.interface.ts`

**Rôle** : surface d'ouverture des composants flottants (Menu, Tooltip, Dialog, Overlay, …). Contrôle le mode d'activation (clic, hover, focus, contextmenu) et la cible.

**Extends** : `IDelayProps`

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `target` | `'parent' \| 'cursor' \| string \| Element \| ComponentPublicInstance \| [x,y]` | oui | Cible manuelle à la place de l'activateur. |
| `activator` | `'parent' \| 'cursor' \| string \| Element \| ComponentPublicInstance` | oui | Sélecteur / référence de l'activateur. |
| `activatorProps` | `any` | oui | Props supplémentaires passées à l'activateur. |
| `openOnClick` | `boolean` | oui | Ouvre sur clic. |
| `openOnContextMenu` | `boolean` | oui | Ouvre sur clic droit. |
| `openOnHover` | `boolean` | oui | Ouvre sur survol. |
| `openOnFocus` | `boolean` | oui | Ouvre sur focus. |
| `closeOnContentClick` | `boolean` | oui | Ferme quand le contenu est cliqué. |

---

### `IHoverProps` et `IActiveProps`

**Fichiers** : `Commons/hover.interface.ts` / `Commons/active.interface.ts`

**Rôle** : props d'état hover/active à trois formes.

- `undefined` / `false` → état piloté par les événements pointer/mouse.
- `true` → état forcé ON (utile pour les stories et tests de screenshot).
- `IHoverState` / `IActiveState` (objet) → overrides visuels pendant l'état uniquement.

**`IHoverProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `hover` | `boolean \| IHoverState` | oui | Cf. ci-dessus. |

**`IActiveProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `active` | `boolean \| IActiveState` | oui | Cf. ci-dessus. |
| `activeClass` | `string` | oui | Classe CSS ajoutée quand `isActive = true`. |

**Emits compagnons** : `IHoverEmits` (`update:hover`), `IActiveEmits` (`update:active`)

**Types associés** : `IHoverState = IStateEffectConfig`, `IActiveState = IStateEffectConfig`

---

### `IStateEffectConfig`

**Fichier** : `Commons/state-effect.interface.ts`

**Rôle** : configuration des overrides visuels pendant un état (hover ou active). Chaque clé mappe vers le composable per-axe existant. `useStateEffect` swap ces inputs de façon réactive selon l'état actif.

**Champs** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `enabled` | `boolean` | oui | Force l'état ON indépendamment des événements. |
| `color` | `TColor` | oui | Override foreground pendant l'état. |
| `bgColor` | `TColor` | oui | Override background pendant l'état. |
| `border` | `IBorderProps['border']` | oui | Override border pendant l'état. |
| `rounded` | `IRoundedProps['rounded']` | oui | Override rounded pendant l'état. |
| `elevation` | `IElevationProps['elevation']` | oui | Override élévation pendant l'état. |
| `padding` | `IPaddingProps['padding']` | oui | Override padding scalaire (les axes logiques ne sont pas supportés en état). |
| `margin` | `IMarginProps['margin']` | oui | Override margin scalaire. |
| `gap` | `boolean \| number \| string` | oui | Override gap (flex/grid). |

**Types dérivés** : `IHoverState = IStateEffectConfig` / `IActiveState = IStateEffectConfig` (alias, même shape)

**Composables consommateurs** : `useStateEffect` (central), `useHover`, `useActive`

---

### `IAdjacentProps`, `IAdjacentInnerProps` et émits compagnons

**Fichier** : `Commons/adjacent.interface.ts`

**Rôle** : surface prepend / append externe (avant/après le composant) et interne (dans l'input chrome — icône clear, toggle mot de passe, etc.).

**`IAdjacentProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `appendAvatar` | `string` | oui | URL avatar en position append. |
| `appendIcon` | `TIcon` | oui | Icône en position append. |
| `prependAvatar` | `string` | oui | URL avatar en position prepend. |
| `prependIcon` | `TIcon` | oui | Icône en position prepend. |

**`IAdjacentInnerProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `appendInnerAvatar` | `string` | oui | Avatar interne append. |
| `appendInnerIcon` | `TIcon` | oui | Icône interne append. |
| `prependInnerAvatar` | `string` | oui | Avatar interne prepend. |
| `prependInnerIcon` | `TIcon` | oui | Icône interne prepend. |
| `clearIcon` | `TIcon` | oui | Icône du bouton clear. |
| `clearable` | `boolean` | oui | Active le bouton clear. |

**Emits** : `IAdjacentEmits` (`click:append`, `click:prepend`), `IAdjacentInnerEmits` (`click:appendInner`, `click:prependInner`, `click:clear`)

**Slots** : `IAdjacentSlots` (`prepend`, `append`), `IAdjacentInnerSlots` (`prependInner`, `appendInner`, `clear`)

---

### `IAlignProps` / `IJustifyProps`

**Fichiers** : `Commons/align.interface.ts` / `Commons/justify.interface.ts`

**Rôle** : alignement et justification responsifs sur 6 breakpoints.

**`IAlignProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `align` | `TAlign` | oui | Alignement de base. |
| `alignSm` / `alignMd` / `alignLg` / `alignXl` / `alignXxl` | `TAlign` | oui | Override par breakpoint. |

**`IJustifyProps`** : même grammaire avec préfixe `justify*`. Type `TJustify`.

---

### `IDirectionProps`

**Fichier** : `Commons/direction.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `direction` | `TDirection` | oui | `'horizontal' \| 'vertical'` |

---

### `IFocusProps` / `IValidationProps`

**Fichier** : `Commons/focus.interface.ts` / `Commons/validation.interface.ts`

**`IFocusProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `focused` | `boolean` | oui | État focus forcé. |

**`IValidationProps` (extends `IFocusProps`)** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `disabled` | `boolean` | oui | Désactive la validation et le rendu. |
| `error` | `boolean` | oui | Passe le champ en état erreur. |
| `errorMessages` | `Array<string> \| string` | oui | Messages d'erreur. |
| `maxErrors` | `number \| string` | oui | Nombre max d'erreurs affichées. |
| `name` | `string` | oui | Nom du champ (pour `IFormProvide`). |
| `label` | `string` | oui | Libellé visible. |
| `readonly` | `boolean` | oui | Lecture seule. |
| `rules` | `Array<any>` | oui | Règles de validation. |
| `modelValue` | `any` | oui | Valeur soumise à validation. |
| `validateOn` | `TValidateOn` | oui | Déclencheur de validation (`'input' \| 'blur' \| 'submit'`). |
| `validationValue` | `any` | oui | Valeur alternative pour la validation (quand différente du modelValue). |

---

### `IDelayProps`

**Fichier** : `Commons/delay.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `closeDelay` | `number \| string` | oui | Délai avant fermeture (ms). |
| `openDelay` | `number \| string` | oui | Délai avant ouverture (ms). |

---

### `ILazyProps`

**Fichier** : `Commons/lazy.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `eager` | `boolean` | oui | Charge immédiatement sans attendre l'intersection. |

---

### `IRippleProps`

**Fichier** : `Commons/ripple.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `ripple` | `boolean \| { class: string }` | oui | Active l'effet ripple sur les interactions pointer. |

Interfaces internes compagnons : `IRippleDirectiveBinding`, `IRippleOptions`, `IRippleHtmlElement`, `IRippleHtmlElementRipple`, `IRippleElement`, `IRippleElementDataset`.

---

### `IScrollProps` et `IScrollStrategyProps`

**Fichier** : `Commons/scroll.interface.ts`

**`IScrollProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `scrollBehavior` | `TScrollBehavior` | oui | Comportement de défilement (`'smooth' \| 'instant'`). |
| `scrollTarget` | `string` | oui | Sélecteur de l'élément scrollable cible. |
| `scrollThreshold` | `string \| number` | oui | Seuil de défilement en px. |

**`IScrollStrategyProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `scrollStrategy` | `TScrollStrategy \| TScrollStrategyFn` | oui | Stratégie de défilement des overlays (`'none' \| 'block' \| 'close' \| 'reposition'`). |
| `contained` | `boolean` | oui | Confine l'overlay au parent scrollable. |

---

### `ILoaderProps`

**Fichier** : `Commons/loader.interface.ts`

**Extends** : `ICommonsComponentProps`, `ITagProps`, `IColorProps`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `loading` | `TLoadingValue` | oui | `boolean \| 'indeterminate' \| number`. |
| `loadingText` | `string` | oui | Texte ARIA pendant le chargement. |

---

### `IGroupProps` / `IGroupItemProps` / `IGroupProvide` / `IGroupItemProvide`

**Fichier** : `Commons/group.interface.ts`

**`IGroupProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `disabled` | `boolean` | oui | Désactive tous les items. |
| `modelValue` | `any` | oui | Valeur sélectionnée. |
| `multiple` | `boolean` | oui | Sélection multiple. |
| `mandatory` | `boolean` | oui | Au moins un item toujours sélectionné. |
| `max` | `number` | oui | Nombre max de sélections simultanées. |
| `selectedClass` | `string` | oui | Classe CSS de l'item actif. |

**`IGroupItemProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `value` | `any` | oui | Valeur de l'item dans le groupe. |
| `disabled` | `boolean` | oui | Désactive cet item. |
| `selectedClass` | `string` | oui | Classe CSS locale quand sélectionné. |

**`IGroupProvide`** — interface du provide/inject group (expose `register`, `unregister`, `select`, `selected`, `isSelected`, `prev`, `next`, `selectedClass`, `items`, `disabled`, `getItemIndex`).

**`IGroupItemProvide`** — interface inject côté item (`id`, `isSelected`, `toggle`, `select`, `selectedClass`, `value`, `disabled`, `group`).

**Emit** : `IGroupEmits` (`group:selected`)

---

### `INestedProps`

**Fichier** : `Commons/nested.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `selectStrategy` | `TSelectStrategy \| TSelectStrategyFn` | oui | Stratégie de sélection arborescente. |
| `openStrategy` | `TOpenStrategy \| TOpenStrategyFns` | oui | Stratégie d'ouverture des noeuds. |
| `selected` | `Array<unknown>` | oui | Noeuds sélectionnés. |
| `opened` | `Array<unknown>` | oui | Noeuds ouverts. |
| `mandatory` | `boolean` | oui | Noeud racine toujours ouvert. |

---

### `IVirtualProps`

**Fichier** : `Commons/virtual.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `itemHeight` | `number \| string` | oui | Hauteur de chaque item (px ou string). |
| `height` | `number \| string` | oui | Hauteur du conteneur virtuel. |
| `scrollDuration` | `number` | oui | Durée de l'animation de scroll impératif (ms). Défaut `300`. |
| `scrollEasing` | `string` | oui | Fonction d'easing pour `scrollToIndex`. Défaut `'easeInOutCubic'`. |

---

### `ICalendarProps` et `IDay`

**Fichier** : `Commons/calendar.interface.ts`

**`ICalendarProps`** — contrat du calendrier partagé (DatePicker, Calendar) :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `allowedDates` | `Array<unknown> \| ((date) => boolean)` | oui | Dates autorisées. |
| `disabled` | `boolean` | oui | Désactive la navigation. |
| `displayValue` | `unknown` | oui | Valeur affichée (focus hovered). |
| `date` | `Array<unknown>` | oui | Dates sélectionnées. |
| `month` | `number` | non | Mois affiché (0-11). |
| `max` | `unknown` | oui | Borne max. |
| `min` | `unknown` | oui | Borne min. |
| `showAdjacentMonths` | `boolean` | oui | Affiche les jours des mois adjacents. |
| `year` | `number` | non | Année affichée. |
| `weekdays` | `Array<number>` | oui | Jours de la semaine à afficher. |
| `weeksInMonth` | `TCalendarStrategy` | oui | `'static' \| 'dynamic'`. |
| `firstDayOfWeek` | `number` | oui | Jour de début de semaine (0=dim, 1=lun). |

**`IDay`** — shape d'un jour calculé (propriétés `date`, `isoDate`, `formatted`, `year`, `month`, `isDisabled`, `isWeekStart`, `isWeekEnd`, `isToday`, `isAdjacent`, `isHidden`, `isStart`, `isSelected`, `isEnd`, `isSame`, `localized`).

---

### `IDateAdapter<T>` et `IDateOptions`

**Fichier** : `Commons/date.interface.ts`

**Rôle** : interface d'adaptateur de date (utilisée par `useDate` pour brancher n'importe quelle lib : native Date, dayjs, luxon, …). 40+ méthodes normalisées (`date`, `format`, `toJsDate`, `parseISO`, `isAfter`, `isBefore`, `addDays`, `getWeekArray`, etc.).

---

### `IDisplayInstance` / `IDisplayOptions` / `IDisplayProps` / `IDisplayPlatform`

**Fichier** : `Commons/display.interface.ts`

**`IDisplayProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `mobileBreakpoint` | `number \| TBreakpoint` | oui | Breakpoint sous lequel `mobile` est `true`. |

**`IDisplayInstance`** — objet retourné par `useDisplay` : expose tous les breakpoints (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `smAndUp`, …), `height`, `width`, `mobile`, `platform`, `thresholds`.

**`IDisplayPlatform`** — platform detection : `android`, `ios`, `chrome`, `edge`, `firefox`, `win`, `mac`, `ssr`, …

---

### `IGradient` et `IGradientStop`

**Fichier** : `Commons/gradient.interface.ts`

**Rôle** : descripteur de gradient structuré, deuxième forme acceptée par `color` / `bgColor` (en plus de la string CSS et du nom de preset).

**`IGradientStop`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `color` | `TIntent \| string` | non | Couleur du stop (intent ou CSS brut). |
| `position` | `number` | non | Position en pourcentage [0..100]. |

**`IGradient`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `type` | `'linear' \| 'radial' \| 'conic'` | oui | Type de gradient. |
| `from` | `TIntent \| string` | oui | Couleur de départ (forme courte). |
| `to` | `TIntent \| string` | oui | Couleur de fin (forme courte). |
| `via` | `TIntent \| string` | oui | Stop intermédiaire (forme courte). |
| `direction` | `number \| string` | oui | Angle en degrés ou mot-clé CSS. |
| `stops` | `IGradientStop[]` | oui | Stops complets (override la forme courte). |

---

### `IStatusProps`

**Fichier** : `Commons/status.interface.ts`

**Extends** : `IIconProps`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `status` | `TStatus` | oui | `'online' \| 'offline' \| 'busy' \| 'away' \| 'error'` |
| `statusIconPosition` | `TStatusPosition` | oui | Position de l'indicateur de statut. |

---

### `ILayoutProps` / `ILayoutItemProps` / `ILayoutProvide`

**Fichier** : `Commons/layout.interface.ts`

**`ILayoutProps` (extends `ICommonsComponentProps`, `IDimensionProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`, `IBgColorProps`, `IBorderProps`)** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `overlaps` | `Array<string>` | oui | IDs d'items qui peuvent se superposer. |
| `fullHeight` | `boolean` | oui | Prend 100% de la hauteur du layout. |

**`ILayoutItemProps`** :

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `name` | `string` | oui | Identifiant de l'item dans le layout. |
| `order` | `string \| number` | oui | Ordre d'empilement. |
| `absolute` | `boolean` | oui | Positionnement absolu (hors flux layout). |
| `location` | `TDirectionBoth` | oui | `'top' \| 'bottom' \| 'start' \| 'end'` |

**`ILayoutProvide`** — provide/inject du layout root : expose `register`, `unregister`, `mainRect`, `mainStyles`, `getLayoutItem`, `items`, `layoutRect`, `rootZIndex`, `layoutId`.

---

### `ILinkProps` / `ILink`

**Fichier** : `Commons/router.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `href` | `string` | oui | URL href directe. |
| `replace` | `boolean` | oui | `router.replace` au lieu de `push`. |
| `to` | `RouteLocationRaw` | oui | Route vue-router. |
| `exact` | `boolean` | oui | Correspondance exacte de la route. |

---

### `IFiltersProps`

**Fichier** : `Commons/filters.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `customFilter` | `TFilterFunction` | oui | Filtre personnalisé sur les items. |
| `customKeyFilter` | `TFilterKeyFunctions` | oui | Filtres par clé. |
| `filterKeys` | `TFilterKeys` | non | Clés sur lesquelles filtrer. |
| `filterMode` | `TFilterMode` | non | `'some' \| 'every' \| 'union' \| 'intersection'` |
| `noFilter` | `boolean` | oui | Désactive le filtrage. |

---

### `ILocaleInstance` / `ILocaleOptions` / `IRtlInstance` / `IRtlProps`

**Fichier** : `Commons/locale.interface.ts`

**`ILocaleProps`** : `messages?`, `locale?`, `fallback?`, `adapter?` (ILocaleInstance). Interface du provider de locale dans le subtree.

**`ILocaleInstance`** : `name`, `messages`, `current`, `fallback`, `t()`, `n()`, `provide()`.

**`IRtlProps`** : `rtl?: boolean` — direction right-to-left.

---

### `IOrigamOptions` et `IBlueprint`

**Fichier** : `Commons/commons.interface.ts`

**`IOrigamOptions`** — options racine de `createOrigam()` :

| Champ | Type | Description |
|-------|------|-------------|
| `aliases` | `any` | Alias de composants. |
| `blueprint` | `IBlueprint` | Blueprint de configuration. |
| `components` | `any` | Composants à enregistrer. |
| `directives` | `any` | Directives à enregistrer. |
| `icons` | `TIconOptions` | Configuration des icônes. |
| `display` | `IDisplayOptions` | Options de breakpoints. |
| `ssr` | `TSSROptions` | Optimisations SSR. |
| `goTo` | `IGoToOptions` | Options scroll impératif. |
| `date` | `IDateOptions` | Adaptateur de date. |
| `locale` | `ILocaleOptions & IRtlOptions` | Options i18n + RTL. |
| `theme` | `IOrigamTheme` | Thème runtime injecté au boot. |
| `themes` | `IOrigamTheme[]` | Thèmes multiples installés ensemble. |

**`IBlueprint`** : `extends Omit<IOrigamOptions, 'blueprint'>`. Permet d'encapsuler une configuration globale réutilisable.

**`ICommonsComponentProps`** : `id?`, `class?`, `style?` — props partagées par tout composant.

**`ICommonsComponentEmits`** : `(e: 'update:modelValue', event: any): void`

**`IClickEmits`**, **`IClickCloseEmits`**, **`IClickLabelEmits`**, **`IIndeterminateEmits`**, **`ICommonsComponentSlots`** — emits et slots compagnons génériques.

**`ITagProps`** : `tag?: string` — balise HTML ou composant racine.

**`IFilterPropsOptions<T>`** — utilitaire générique pour `filterProps()` (utilisé par les composants qui délèguent des sous-ensembles de props).

**`IConfigurableDocument`** : `document?: Document` — prise en charge des environnements multi-document (iframes).

---

### `IOptions<T>`

**Fichier** : `Commons/options.interface.ts`

Générique réutilisable partout où un `label` / `value` est nécessaire (Select, RadioGroup, ChipGroup, BtnToggle…).

| Champ | Type | Opt. |
|-------|------|------|
| `label` | `string` | non |
| `value` | `T \| undefined` | non |

---

### `IBox`

**Fichier** : `Commons/box.interface.ts`

Shape géométrique interne : `x`, `y`, `width`, `height`, `top`, `bottom`, `left`, `right`.

---

### `IHotkeyOptions`

**Fichier** : `Commons/hotkey.interface.ts`

Options du composable `useHotkey` : `event?` (`keydown/keyup`), `inputs?` (active dans les inputs), `preventDefault?`, `sequenceTimeout?`.

---

### `IClickOutsideDirectiveBinding` / `IClickOutsideBindingArgs` / `IClickOutsideEmits`

**Fichier** : `Commons/clickOutside.interface.ts`

Binding de la directive `v-click-outside` (`handler`, `closeConditional?`, `include?`) + emit `click:outside`.

---

### `ITouchHandlers` / `ITouchData` / `ITouchValue` / `ITouchStoredHandlers` / `ITouchDirectiveBinding`

**Fichier** : `Commons/touch.interface.ts`

Shape des handlers `start`, `end`, `move`, `left`, `right`, `up`, `down` et des données de toucher (`touchstartX/Y`, `touchmoveX/Y`, `touchendX/Y`, `offsetX/Y`).

---

### `IIntersectDirectiveBinding` / `IIntersectHtmlElement`

**Fichier** : `Commons/intersect.interface.ts`

Binding de la directive `v-intersect` (`handler`, `options?`, modificateurs `once?` / `quiet?`).

---

### `IStyleTagOptions`

**Fichier** : `Commons/style.interface.ts`

Options de `useStyleTag` : `media?`, `immediate?`, `manual?`, `id?`, `document?`.

---

### `ISticky`

**Fichier** : `Commons/sticky.interface.ts`

Retour de `useSticky` : `rootEl`, `isSticky`, `layoutItemStyles`.

---

### `IStackProvide`

**Fichier** : `Commons/stack.interface.ts`

Provide/inject pour la gestion de z-index des overlays empilés : `activeChildren: Set<number>`.

---

### `IResizeState`

**Fichier** : `Commons/resizeObserver.interface.ts`

Retour de `useResizeObserver` : `resizeRef`, `contentRect`.

---

### `IGoToOptions` / `IGoToOptionsPatterns` / `IGoToInstance`

**Fichier** : `Commons/goTo.interface.ts`

Options du scroll impératif (`container`, `duration`, `layout`, `offset`, `easing`, `patterns`).

---

### `IAutocompleteProps`

**Fichier** : `Commons/autocomplete.interface.ts`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `autoSelectFirst` | `boolean \| string` | oui | Sélectionne le premier item correspondant automatiquement. |
| `clearOnSelect` | `boolean` | oui | Vide le champ de recherche après sélection. |
| `delimiters` | `Array<string>` | oui | Délimiteurs de tokens (Autocomplete multi). |
| `search` | `string` | oui | Valeur de recherche contrôlée. |
| `autocomplete` | `boolean` | oui | Active l'attribut HTML `autocomplete`. |

---

## Interfaces composant (synthèse par domaine)

### Interfaces emits et slots

Chaque composant shippe à minima trois interfaces : `I{Cmp}Props`, `I{Cmp}Emits`, et optionnellement `I{Cmp}Slots`. Par convention, les emits et slots sont dans le même fichier que les props.

---

### Domaine Boutons / Actions

#### `IBtnProps`

**Fichier** : `Btn/btn.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, IBorderProps, IDensityProps, IDimensionProps, IElevationProps, IRoundedProps, ITagProps, ISizeProps, ILinkProps, IRippleProps, ILoaderProps, IPositionProps, ILocationProps, IGroupItemProps, IPaddingProps, IMarginProps, IAdjacentProps, IStatusProps, IHoverProps, IVariantProps`

| Prop locale | Type | Opt. | Description |
|-------------|------|------|-------------|
| `active` | `boolean` | oui | Forçage de l'état actif. |
| `flat` | `boolean` | oui | **Déprécié** — utiliser `variant="flat"`. |
| `icon` | `boolean \| TIcon` | oui | Bouton icône (rond si `true`). |
| `block` | `boolean` | oui | Pleine largeur. |
| `slim` | `boolean` | oui | Réduction du padding horizontal. |
| `stacked` | `boolean` | oui | Icône au-dessus du texte. |
| `text` | `string` | oui | Contenu textuel. |

**Emits** : `IBtnEmits extends IAdjacentEmits, IGroupEmits`

#### `IBtnGroupProps`

**Extends** : `ITagProps, ICommonsComponentProps, IRoundedProps, IBorderProps, IDensityProps, IElevationProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps`

Prop locale : `divided?: boolean`, `items?: Array<IBtnProps>`.

#### `IBtnToggleProps`

**Extends** : `IBtnGroupProps, IGroupProps`

Aucune prop locale. **Emits** : `IBtnToggleEmits extends ICommonsComponentEmits`

---

### Domaine Cartes / Conteneurs

#### `ICardProps`

**Fichier** : `Card/card.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, IDensityProps, IDimensionProps, IElevationProps, ILoaderProps, ILocationProps, IPositionProps, IRoundedProps, IMarginProps, IPaddingProps, ILinkProps, IRippleProps, IAdjacentProps, IActiveProps`

Props locales : `disabled?`, `flat?`, `hover?: boolean`, `image?: string`, `link?: boolean`, `subtitle?`, `text?`, `title?`, `type?: TCardType`.

**Emits** : `ICardEmits extends IAdjacentEmits, IActiveEmits, IHoverEmits`

#### `ICardHeaderProps`

**Extends** : `ITagProps, ICommonsComponentProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, IAdjacentProps`

Props : `subtitle?`, `title?`. **Emits** : `ICardHeaderEmits extends IAdjacentEmits`

#### `ICardTextProps`

**Extends** : `ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps`

Prop : `text?`.

---

### Domaine Champs / Formulaires

#### `IFieldProps`

**Fichier** : `Field/field.interface.ts`

**Extends** : `ICommonsComponentProps, ILoaderProps, IColorProps, IBgColorProps, IAdjacentInnerProps, IFocusProps, IDensityProps, ILabelProps, IActiveProps, IVariantProps, IRoundedProps, IElevationProps, ISizeProps`

Props locales : `centerAffix?`, `dirty?`, `disabled?`, `error?: string | boolean`, `flat?`, `inline?`, `label?`, `prefix?`, `suffix?`, `persistentClear?`, `reverse?`, `singleLine?`, `required?`.

**Emits** : `IFieldEmits extends IFocusEmits, ICommonsComponentEmits, IAdjacentInnerEmits, IActiveEmits`

**Slots** : `IFieldSlots` expose `default`, `loader`, `label`, `floatingLabel`, `prefix`, `suffix` + `IAdjacentInnerSlots`.

**`IFieldDefaultSlotProps`** : `id`, `aria-describedby`, `isActive`, `isFocused`, `ref`, `onBlur`, `onFocus`.

#### `IInputProps`

**Fichier** : `Input/input.interface.ts`

**Extends** : `ICommonsComponentProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBgColorProps, IBorderProps, IElevationProps, IDimensionProps, IDirectionProps, IValidationProps, IAdjacentProps, ISizeProps`

Props locales : `centerAffix?`, `hideDetails?: boolean | string`, `hideSpinButtons?`, `hint?`, `persistentHint?`, `messages?: Array<string> | string`.

**Emits** : `IInputEmits extends ICommonsComponentEmits, IAdjacentEmits, IFocusEmits`

**Slots** : `IInputSlots` expose `default`, `messages`, `message`, `details` + `IAdjacentSlots`.

#### `ITextFieldProps`

**Fichier** : `TextField/text-field.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IDensityProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps`

Props locales : `autofocus?`, `counter?`, `counterValue?`, `placeholder?`, `persistentPlaceholder?`, `persistentCounter?`, `role?`, `type?: TTextFieldType`, `modelModifiers?`, `mask?: TMask`.

**Emits** : `ITextFieldEmits extends IFieldEmits, IInputEmits` + `click:control`, `mousedown:control`, `valid`, `complete`.

**Slots** : `ITextFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'>` + `counter`, `field`.

#### `ISelectProps`

**Fichier** : `Select/select.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, ITextFieldProps, IDensityProps, IAdjacentProps, IAdjacentInnerProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IItemProps, ITransitionComponentProps, IFiltersProps, ILazyProps`

Props locales : `chips?`, `closableChips?`, `hideNoData?`, `hideSelected?`, `listProps?`, `menu?`, `menuIcon?`, `menuProps?`, `chipProps?`, `multiple?`, `noDataText?`, `openOnClear?`, `autocomplete?`, `autoSelectFirst?`, `clearOnSelect?`, `divider?`, `search?`, `closeText?`, `openText?`.

**Emits** : `ISelectEmits extends ICommonsComponentEmits, IFocusEmits, IAdjacentEmits, IAdjacentInnerEmits` + `click:control`, `mousedown:control`, `update:menu`.

#### `IValidationProps`

Déjà détaillée dans Commons ci-dessus. Directement `extends IFocusProps`.

#### `IFormProvide` / `IFormProps` / `IFormSlots` / `IFormEmits`

**Fichier** : `Form/form.interface.ts`

**`IFormProvide`** : `register(item)`, `unregister(id)`, `update(id, isValid, errorMessages)`, `items?`, `isDisabled`, `isReadonly`, `isValidating?`, `isValid`, `validateOn`.

**`IFormProps`** : `disabled?`, `fastFail?`, `readonly?`, `modelValue?: boolean | null`, `validateOn?`, `rules?`, `errorMessages?`, `hint?`, `messages?`, `scrollToError?: boolean | ScrollIntoViewOptions`.

**`IFormSlots`** : `messages?`, `message?`, `actions?(submit, reset)`.

**`ISubmitEventPromise`** et **`IFormValidationResult`** — résultat de soumission.

#### `ILabelProps`

**Fichier** : `Label/label.interface.ts`

**Extends** : `ICommonsComponentProps, IMarginProps, IPaddingProps, IBorderProps, IRoundedProps, IColorProps, IBgColorProps, ITagProps`

Props : `text?`, `floating?`, `required?`, `name?`.

---

### Domaine Sélection / Contrôles

#### `ISelectionControlProps`

**Fichier** : `SelectionControl/selection-control.interface.ts`

**Extends** : `ICommonsComponentProps, Partial<Omit<ISelectionControlGroupProps, 'items'>>, IColorProps, IBgColorProps, IActiveProps, IHoverProps`

Props : `label?`, `trueValue?`, `falseValue?`, `value?`, `required?`.

#### `ICheckboxProps`

**Fichier** : `Checkbox/checkbox.interface.ts`

**Extends** : `ICommonsComponentProps, IInputProps, ICheckboxBtnProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBorderProps, IElevationProps, IActiveProps, IHoverProps`

**Emits** : `ICheckboxEmits extends ICommonsComponentEmits, IFocusEmits, ISelectionControlEmits`

#### `ISwitchProps`

**Fichier** : `Switch/switch.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IInputProps, ISelectionControlProps, ILoaderProps, IColorProps, IDensityProps, IElevationProps, IActiveProps, IHoverProps`

Props locales : `indeterminate?`, `inset?`, `flat?`.

**Emits** : `ISwitchEmits extends ICommonsComponentEmits, IFocusEmits, IIndeterminateEmits, IClickLabelEmits`

#### `IRadioProps`

**Extends** : `ICommonsComponentProps, IInputProps, IRadioBtnProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBorderProps, IElevationProps, IActiveProps, IHoverProps`

**Emits** : `IRadioEmits extends ICommonsComponentEmits, IFocusEmits, IClickLabelEmits`

#### `ISliderFieldProps`

**Fichier** : `SliderField/slider-field.interface.ts`

**Extends** : `ICommonsComponentProps, IDensityProps, IColorProps, IInputProps, IFocusProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IRippleProps, IDirectionProps`

Props locales : `disabled?`, `required?`, `label?`, `error?`, `readonly?`, `max?`, `min?`, `step?`, `trackProps?`, `reverse?`, `modelValue?`, `range?`, `showTicks?`, `ticks?`, `tickSize?`, `inset?`, `variant?: TSliderFieldVariant`, `buffered?`, `showThumbOnHoverOnly?`, `showHoverTooltip?`, `formatHoverTooltip?`, `peaks?`.

**Emits** : `ISliderFieldEmits extends ICommonsComponentEmits, IFocusEmits` + `start`, `end`.

---

### Domaine Overlays / Flottants

#### `IOverlayProps`

**Fichier** : `Overlay/overlay.interface.ts`

**Extends** : `ICommonsComponentProps, IDimensionProps, IActivatorProps, ILocationStrategyProps, IScrollStrategyProps, ILazyProps, ITransitionComponentProps, IScrimProps`

Props locales : `absolute?`, `attach?`, `closeOnBack?`, `contentClass?`, `contentProps?`, `disabled?`, `noClickAnimation?`, `modelValue?`, `zIndex?`, `disableGlobalStack?`, `persistent?`.

**Emits** : `IOverlayEmits extends ICommonsComponentEmits, IClickOutsideEmits` + `afterEnter`, `afterLeave`, `keydown`.

#### `IDialogProps`

**Extends** : `ICommonsComponentProps, IOverlayProps, ICardProps, IStatusProps`

Props : `fullscreen?`, `retainFocus?`, `scrollable?`, `size?: TSize`.

**Emits** : `IDialogEmits extends ICommonsComponentEmits, IClickOutsideEmits` + `isRead`.

#### `IMenuProps`

**Extends** : `IOverlayProps, IListProps, IListItemProps`

Prop : `id?`.

**Emits** : `IMenuEmits extends ICommonsComponentEmits` + `contextmenu`.

#### `ITooltipProps`

**Extends** : `ICommonsComponentProps, IOverlayProps, IColorProps, IBgColorProps, IDimensionProps, IActivatorProps, ILocationStrategyProps, IScrollStrategyProps, ILazyProps, ITransitionComponentProps, IScrimProps`

Props : `id?`, `text?`.

#### `ISnackbarProps`

**Extends** : `ICommonsComponentProps, ITagProps, IStatusProps, IColorProps, IBgColorProps, IOverlayProps, IPositionProps, ILocationProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, ITransitionComponentProps, IActiveProps, IHoverProps`

Props : `multiLine?`, `text?`, `timer?`, `timeout?`, `vertical?`.

#### `IDrawerProps`

**Extends** : `ITagProps, ICommonsComponentProps, IBorderProps, IElevationProps, ILayoutItemProps, IRoundedProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, ITransitionComponentProps, IScrimProps, IActiveProps, IHoverProps`

Props locales : `disableResizeWatcher?`, `disableRouteWatcher?`, `expandOnHover?`, `floating?`, `modelValue?`, `permanent?`, `rail?`, `railWidth?`, `temporary?`, `touchless?`, `width?`, `sticky?`, `push?: boolean | null`, `clipped?: boolean | null`.

**Emits** : `IDrawerEmits` → `update:rail`.

#### `ISheetProps`

**Extends** : `ITagProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IColorProps, IBorderProps, IRoundedProps, IElevationProps, IDimensionProps, ILocationProps, IPositionProps, IActiveProps, IHoverProps`

Props : `side?: TDirectionBoth`, `swipeable?`, `snapPoints?`, `defaultSnap?`, `open?`, `disabled?`, `persistent?`.

---

### Domaine Navigation

#### `ITabsProps`

**Extends** : `ICommonsComponentProps, ITagProps, IDirectionProps, IDensityProps, IRoundedProps, IColorProps, IBgColorProps, IGroupProps`

Props : `variant?: TTabVariant`, `fixed?`, `centered?`.

#### `IBottomNavProps`

**Extends** : `ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IBorderProps, IElevationProps, IMarginProps, IDimensionProps, IDensityProps, IRoundedProps, ILayoutItemProps, IGroupProps, IHoverProps, ITransitionComponentProps`

Props : `grow?`, `mode?: TMode`, `items?: Array<IBtnProps>`.

#### `IBreadcrumbProps`

**Extends** : `IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps`

Props : `activeClass?`, `disabled?`, `divider?: string | TIcon`, `items?: Array<TBreadcrumbItem>`.

#### `IPaginationProps`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, ISizeProps, IDensityProps`

Props locales notables : `start?`, `modelValue?`, `disabled?`, `length?`, `totalVisible?`, icônes (`firstIcon`, `prevIcon`, `nextIcon`, `lastIcon`), ARIA labels, `ellipsis?`, `showFirstLastPage?`, `compact?`, `withInfo?`, `total?`, `perPage?`, `infoText?`, `previousText?`, `nextText?`.

**Emits** : `IPaginationEmits extends ICommonsComponentEmits` + `first`, `prev`, `next`, `last`.

---

### Domaine Données / Listes

#### `IListProps`

**Extends** : `ITagProps, ICommonsComponentProps, IElevationProps, IBorderProps, IDensityProps, IRoundedProps, IDimensionProps, INestedProps, IItemProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps`

Props : `activeClass?`, `disabled?`, `expandIcon?`, `collapseIcon?`, `lines?: TLines`, `slim?`, `nav?`, `itemType?`.

**`IItemProps`** : `items?`, `itemTitle?`, `itemValue?`, `itemChildren?`, `itemProps?`, `returnObject?`, `valueComparator?`.

#### `IDataTableProps`

**Fichier** : `DataTable/data-table.interface.ts`

**Extends** : agrégation de ~15 interfaces (`ITableProps, IDataTableRowProps, IDataTableExpandProps, IDataTableGroupProps, IDataTableHeaderProps, IDataTableItemsProps, IDataTableSelectProps, IDataTableSortProps, IDataTableHeadersProps, IDataTablePaginationProps, IFiltersProps, IDataTableFooterProps`).

Props : `hideDefaultBody?`, `hideDefaultFooter?`, `hideDefaultHeader?`, `search?`.

**`IDataTableSlotProps<T>`** expose la surface complète (pagination, sort, selection, expand, group, items, columns, headers).

**Emits** : `IDataTableEmits extends ICommonsComponentEmits` + `update:page`, `update:itemsPerPage`, `update:sortBy`, `update:options`, `update:groupBy`, `update:expanded`, `update:currentItems`.

#### `ITreeviewProps`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IDensityProps`

Props : `items: ITreeviewNode[]`, `modelValue?`, `expandedValue?`, `selectMode?`, `selectableNodes?`, `showLines?`, `expandOnClick?`.

**`ITreeviewNode`** : `id`, `label`, `icon?`, `size?`, `children?`, `disabled?`, `expandable?`.

---

### Domaine Médias

#### `IAudioProps`

**Fichier** : `Audio/audio-player.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IRoundedProps, IBorderProps, IMarginProps, IPaddingProps, IElevationProps, IPositionProps, IColorProps, IBgColorProps`

Props locales : `variant?: TAudioVariant`, `coverPosition?`, `src` (requis), `tracks?`, `title?`, `artist?`, `album?`, `cover?`, `waveform?`, `waveformColor?`, `autoplay?`, `muted?`, `loop?` (déprécié), `loopMode?`, `shuffle?`, `playlist?`, `currentTrackIndex?`, `preload?`, `crossorigin?`, `controls?`, `playbackRates?`, `playbackRate?`, `allowRemotePlayback?`, `downloadable?`, `downloadFilename?`.

**Emits** : `IAudioEmits` — 17 événements (play, pause, ended, timeupdate, volumechange, loadedmetadata, error, update:playbackRate, download, waveform, previous, next, update:currentTrackIndex, update:loopMode, update:shuffle, track-change).

Interfaces compagnons : `IAudioTrack`, `IAudioSource`, `IAudioScopedSlotBindings`, `IAudioSlots`, `IAudioPlayerState extends IMediaPlayerState`, `IAudioPlayerMethods extends IMediaPlayerMethods`, `IAudioPlayerEmits extends IMediaPlayerEmits`, `IUseOrigamAudioPlayerOptions`.

#### `IVideoProps`

**Fichier** : `Video/video.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, IRoundedProps, IBorderProps, IMarginProps, IPaddingProps, IElevationProps`

Props locales : `src` (requis), `poster?`, `tracks?`, `autoplay?`, `muted?`, `loop?`, `controls?`, `playsInline?`, `preload?`, `aspectRatio?`, `crossorigin?`, `disablePictureInPicture?`, `skipSeconds?`, `showCenterControls?`, `playbackRates?`, `playbackRate?`, `inset?`, `allowRemotePlayback?`, `doubleTapToSkip?`, `downloadable?`, `downloadFilename?`.

**Emits** : `IVideoEmits extends IMediaPlayerEmits` + `enterfullscreen`, `exitfullscreen`, `enterpip`, `exitpip`, `skip`, `quality-change`, `download`.

Interfaces compagnons : `IVideoScopedSlotBindings`, `IVideoSlots`, `IVideoPlayerState extends IMediaPlayerState`, `IVideoPlayerMethods extends IMediaPlayerMethods`, `IUseVideoPlayerOptions extends Omit<IUseMediaPlayerOptions, 'mediaRef'>`.

---

### Domaine Affichage / Mise en page

#### `IGridProps`

**Fichier** : `Grid/grid.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps`

Props : `columns?`, `rows?`, `gap?`, `columnGap?`, `rowGap?`, `areas?`, `autoFlow?`, `autoColumns?`, `autoRows?`, `alignItems?`, `justifyItems?`, `alignContent?`, `justifyContent?`, `inline?`.

Type local : `TGridTracks = number | string | ReadonlyArray<string>`.

#### `IMasonryProps`

**Fichier** : `Masonry/masonry.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps`

Props : `columns?`, `columnBreakpoints?`, `gap?`, `animated?`, `align?`.

Types locaux : `TMasonryColumnBreakpoints = Record<number, number>`.

#### `IResponsiveProps`

**Fichier** : `Responsive/responsive.interface.ts`

**Extends** : `IDimensionProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps`

Props : `aspectRatio?`, `contentClass?`, `inline?`.

#### `IVirtualScrollProps`

**Extends** : `ICommonsComponentProps, IDimensionProps, IVirtualProps`

Props : `items?`, `renderless?`.

---

### Domaine Composants typographiques / inline

#### `ITitleProps`

**Extends** : `ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, IBorderProps`

Prop : `text?`.

#### `IDividerProps`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, IMarginProps, IDirectionProps`

Props : `inset?`, `length?`, `thickness?`.

#### `IBlockquoteProps`

**Fichier** : `Blockquote/blockquote.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps`

Props : `variant?: TBlockquoteVariant`, `author?`, `source?`, `cite?`, `lang?: TBlockquoteLang`, `align?: TBlockquoteAlign`, `color?: TIntent`.

**`IBlockquoteSlots`** : `default?`, `author?`, `source?`.

#### `IKbdProps`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IBorderProps, IRoundedProps`

Props : `text?`, `combination?`, `separator?`, `variant?: TKbdVariant`.

#### `ICodeProps`

**Fichier** : `Code/code.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IDimensionProps, IColorProps, IBgColorProps`

Props : `code?`, `lang?`, `lineNumbers?`, `highlightLines?`, `copyable?`, `format?`, `wrap?`, `filename?`.

Interface compagnon : `IUseCodeReturn` (surface publique du composable `useCode`).

---

### Domaine Feedback / Utilitaires

#### `IAlertProps`

**Fichier** : `Alert/alert.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IDimensionProps, IPaddingProps, IMarginProps, IDensityProps, IElevationProps, ILocationProps, IPositionProps, IRoundedProps, IStatusProps, IHoverProps, IAdjacentProps`

Props : `closable?`, `closeIcon?`, `closeLabel?`, `modelValue?`, `title?`, `text?`.

**Emits** : `IAlertEmits extends ICommonsComponentEmits, IClickCloseEmits, IHoverEmits`

#### `IBadgeProps`

**Extends** : `ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, ILocationProps, IRoundedProps, ITransitionComponentProps, IStatusProps, IHoverProps, IElevationProps`

Props : `content?`, `dot?`, `floating?`, `inline?`, `label?`, `max?`, `modelValue?`, `offsetX?`, `offsetY?`.

#### `ISkeletonProps`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps`

Props : `variant?: TSkeletonVariant`, `width?`, `height?`, `loading?`, `pulse?`.

#### `IEmptyStateProps`

**Fichier** : `EmptyState/empty-state.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps`

Props : `preset?: TEmptyStatePreset`, `title?`, `description?`, `icon?`, `iconColor?: TIntent`, `size?: TEmptyStateSize`, `align?: TEmptyStateAlign`.

**`IEmptyStateSlots`** : `default?`, `icon?`, `title?`, `description?`, `actions?`.

#### `ICounterProps`

**Extends** : `ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IColorProps, IElevationProps, IDensityProps, ITransitionComponentProps`

Props : `active?`, `disabled?`, `max?`, `value?`.

#### `IProgressProps` / `IProgressTypeProps`

**`IProgressProps`** : `extends IProgressLinearProps, IProgressCircularProps`. Prop : `type?: TProgressType`.

**`IProgressTypeProps`** : `extends ITagProps, ICommonsComponentProps, IColorProps, IPaddingProps, IMarginProps`. Props : `indeterminate?`, `modelValue?`, `thickness?`, `active?`, `absolute?`, `max?`, `striped?`.

---

### Domaine Images / Avatars

#### `IAvatarProps`

**Extends** : `ICommonsComponentProps, IDensityProps, IRoundedProps, ISizeProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps`

Props : `start?`, `end?`, `icon?: TIcon`, `image?: string | ISrcObject`, `text?`.

#### `IAvatarGroupProps`

**Extends** : `ICommonsComponentProps, IDirectionProps, IDensityProps, IRoundedProps, ISizeProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps`

Props : `items?: Array<IAvatarProps>`, `max?`, `expandOnHover?`, `expandOnClick?`.

#### `IImgProps`

**Extends** : `IColorProps, IBgColorProps, IResponsiveProps, ITransitionComponentProps, ILazyProps`

Props : `alt?`, `cover?`, `draggable?`, `gradient?`, `lazySrc?`, `options?`, `sizes?`, `src?: string | ISrcObject`, `crossorigin?`, `referrerpolicy?`, `srcset?`, `position?`.

**`ISrcObject`** : `src?`, `srcset?`, `lazySrc?`, `aspectRatio`, `alt?`.

---

### Domaine Accordéons / Hiérarchies

#### `IExpansionPanelProps`

**Fichier** : `ExpensionPanel/expansion-panel.interface.ts`

**Extends** : `ITagProps, ICommonsComponentProps, IDensityProps, IColorProps, IBgColorProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, IRoundedProps, IGroupItemProps, IExpansionPanelHeaderProps, IExpansionPanelContentProps, ILazyProps, ILoaderProps, IActiveProps, IHoverProps`

Aucune prop locale. **Emits** : `IExpansionPanelEmits extends IGroupEmits`

---

### Domaine Sélecteurs de dates / couleurs

#### `IDatePickerProps`

**Fichier** : `DatePicker/date-picker.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IPickerProps, IDatePickerControlsProps, IDatePickerMonthProps, IDatePickerMonthsProps, IDatePickerYearsProps, IDatePickerHeaderProps`

Prop : `modelValue?: string | Date | Array<string | Date>`.

**Emits** : `IDatePickerEmits extends ICommonsComponentEmits` + `update:month`, `update:year`, `update:viewMode`.

#### `IColorPickerProps`

**Fichier** : `ColorPicker/color-picker.interface.ts`

**Extends** : `ICommonsComponentProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IPickerProps, IColorProps, IColorPickerCanvasProps, IColorPickerPreviewProps, IColorPickerEditProps, IColorPickerSwatchesProps`

Props : `canvasHeight?`, `canvasWidth?`, `hideCanvas?`, `hideSliders?`, `hideInputs?`, `showSwatches?`, `swatchesMaxHeight?`, `modelValue?`.

**Emits** : `IColorPickerEmits extends ICommonsComponentEmits, IColorModeEmits`

---

### Domaine Fenêtres / Carousels

#### `IWindowProps`

**Extends** : `ICommonsComponentProps, ITagProps, IDirectionProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IElevationProps`

Props : `continuous?`, `nextIcon?`, `prevIcon?`, `reverse?`, `showArrows?`, `touch?`, `modelValue?`, `disabled?`, `selectedClass?`, `mandatory?`.

**`IWindowProvide`** : `transition`, `transitionCount`, `transitionHeight`, `isReversed`, `rootRef`.

#### `ICarouselProps`

**Extends** : `IWindowProps, IColorProps, ICommonsComponentProps, ITagProps, IDimensionProps`

Props : `cycle?`, `delimiterIcon?`, `hideDelimiters?`, `hideDelimiterBackground?`, `interval?`, `progress?`, `verticalDelimiters?`.

#### `ISlideGroupProps`

**Extends** : `ICommonsComponentProps, ITagProps, IDirectionProps, IGroupProps, IPaddingProps, IMarginProps, IRoundedProps, IBorderProps, IDisplayProps`

Props : `centerActive?`, `nextIcon?`, `prevIcon?`, `showArrows?`.

---

### Domaine Stepper / Timeline

#### `IStepperProps`

**Fichier** : `Stepper/stepper.interface.ts`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IDensityProps, IDimensionProps, IElevationProps, IMarginProps, IPaddingProps, IRoundedProps, IBorderProps`

Props : `items?: IStepperItem[]`, `modelValue?`, `orientation?`, `clickable?`, `showConnectors?`.

**`IStepperItem`** : `title`, `subtitle?`, `icon?`, `status?`.

**`IStepperProvide`** : `modelValue`, `orientation`, `clickable`, `color`.

#### `ITimelineProps`

**Fichier** : `Timeline/timeline.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, ISizeProps, IDensityProps`

Props : `items?: ITimelineEntry[]`, `orientation?`, `side?`, `truncateLine?`, `ariaLabel?`.

**`ITimelineEntry`** : `title`, `subtitle?`, `description?`, `icon?`, `intent?`.

**`ITimelineContext`** (provide/inject) : `side`, `truncateLine`, `orientation`, `color?`.

---

### Domaine Outils / Utilitaires avancés

#### `IClipboardProps`

**Fichier** : `Clipboard/clipboard.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IMarginProps, IPaddingProps`

Props : `value` (requis), `feedbackDuration?`, `feedbackText?`, `successText?`, `disabled?`.

**Emits** : `IClipboardEmits` → `copy`, `error`.

**`IClipboardScopedSlotBindings`** : `copy()`, `copied`, `error`.

**`IUseClipboardOptions`** : `feedbackDuration?`.

#### `IQrCodeProps`

**Fichier** : `QrCode/qr-code.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IRoundedProps, IBorderProps, IElevationProps, ISizeProps, IPaddingProps, IMarginProps`

Props : `value` (requis), `title?`, `qrCodeProps?: IQrCodeOptions`, `errorCorrectionLevel?`, `quietZone?`, `icon?`, `image?`, `ariaLabel?`.

**`IQrCodeOptions`** : `extends IRoundedProps, IBgColorProps, IColorProps` — overrides matriciels.

**`IUseQrCodeOptions`** : options bas niveau du composable (hors DS tokens).

#### `IWatermarkProps`

**Fichier** : `Watermark/watermark.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps`

Props : `text?`, `image?`, `opacity?`, `angle?`, `gap?`, `fontSize?`, `fontFamily?`, `color?`, `fontWeight?`, `zIndex?`, `antiTamper?`, `pointerEvents?`.

**`IUseWatermarkOptions`** : mirror des props sans concerns wrapper.

#### `ICommandPaletteProps`

**Fichier** : `CommandPalette/command-palette.interface.ts`

Props : `modelValue?`, `hotkey?: TCommandPaletteHotkey | null`, `commands?`, `placeholder?`, `emptyText?`, `maxHeight?`, `width?`, `loading?`, `closeOnSelect?`, `closeOnEscape?`, `closeOnBackdrop?`.

**Emits** : `ICommandPaletteEmits` → `update:modelValue`, `select`, `query`.

**`ICommandPaletteSlots`** : `item?(props)`, `empty?()`, `footer?()`.

#### `IInlineEditProps`

**Fichier** : `InlineEdit/inline-edit.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps`

Props : `modelValue` (requis), `placeholder?`, `rules?`, `validate?`, `autoFocus?`, `selectOnFocus?`, `confirmOnBlur?`, `confirmOnEnter?`, `cancelOnEscape?`, `disabled?`, `multiline?`, `trim?`, `inputType?`, `loadingOnConfirm?`, `showActions?`.

**Emits** : `IInlineEditEmits` → `update:modelValue`, `edit`, `cancel`, `confirm`, `validate-error`.

Slots : `display?(IInlineEditDisplaySlotBindings)`, `edit?(IInlineEditEditSlotBindings)`, `actions?(IInlineEditActionsSlotBindings)`.

#### `IParallaxProps`

**Fichier** : `Parallax/parallax.interface.ts`

**Extends** : `ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IDimensionProps, IAudioProps`

Props locales : `animationDuration?` (déprécié), `easing?`, `perspective?`, `event?`, `active?`, `duration?`, `direction?`, `speed?`, `disabled?`, `threshold?`.

**`IParallaxProvide`** et **`IParallaxLayerProvide`** : provides injectés dans les `<OrigamParallaxLayer>`.

#### `IInfiniteScrollProps`

**Extends** : `ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, ITagProps, IDirectionProps`

Props : `side?`, `mode?`, `loadMoreText?`, `emptyText?`, `margin?`.

**Emits** : `IInfiniteScrollEmits` → `load(side, done)`.

---

### Domaine Thème

#### `IOrigamTheme`

**Fichier** : `Theme/origam-theme.interface.ts`

Objet runtime ingéré par `createOrigam({ themes })`.

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `name` | `string` | oui | Nom du thème (active `[data-theme="name"]`). |
| `mode` | `TMode` | oui | Mode couleur (`'light' \| 'dark'`). |
| `label` | `string` | oui | Libellé UI (switcher). |
| `description` | `string` | oui | Description UI (switcher). |
| `swatch` | `string` | oui | Background CSS pour la prévisualisation. |
| `vars` | `IThemeVars` | oui | Tokens structurés (couleurs, typographie, ombres, espacements, …). |
| `cssVars` | `TThemeVars` | oui | Escape hatch : map de `--origam-*` bruts. |
| `component` | `IDefault` | oui | Props par défaut per-composant (même shape que `OrigamDefaultsProvider`). |

Les sept groupes de `vars` : `color`, `rounded`, `border`, `typo`, `shadow`, `spacing`, `motion`.

#### `IDefaultProviderProps`

**Fichier** : `DefaultProvider/default-provider.interface.ts`

**Extends** : `ICommonsComponentProps`

| Champ | Type | Opt. | Description |
|-------|------|------|-------------|
| `defaults` | `IDefault` | oui | Map de defaults (`global` ou nom de composant). |
| `disabled` | `boolean` | oui | Passe les defaults parentes sans modification. |
| `reset` | `string \| number` | oui | Démarre un nouveau scope (n'hérite pas). |
| `root` | `string \| number` | oui | Marque ce scope comme racine. |
| `scoped` | `boolean` | oui | Alias déclaratif de `reset`. |

**`IDefault`** : `global?: Record<string, unknown>`, `[key: string]: Record<string, unknown> | undefined`.

---

### Domaine Éditeur de texte / Masque

#### `IConfirmWrapperProps`

**Extends** : `ICommonsComponentProps, IAdjacentProps, IDirectionProps, IColorProps, IDensityProps, IRoundedProps, IElevationProps, IVariantProps, IFocusProps`

Props : `modelValue?`, `confirm?`, `field?`, `defaults?`, `confirmLabel?`, `disabled?`, `readonly?`, `required?`, `error?`, `errorMessages?`, `hideDetails?`, `messages?`, `hint?`, `persistentHint?`, `centerAffix?`, `label?`.

**Emits** : `IConfirmWrapperEmits extends ICommonsComponentEmits, IAdjacentEmits, IFocusEmits` + `update:confirm`.

---

### Domaine App Shell

#### `IAppBarProps`

**Extends** : `IToolbarProps, ILayoutItemProps, IScrollProps`

Props locales : `location?: TBlock`, `image?: IImgProps`.

**Emits** : `IAppBarEmits extends ICommonsComponentEmits`

#### `IToolbarProps`

**Extends** : `ITagProps, ICommonsComponentProps, IBorderProps, IRoundedProps, IElevationProps, IDensityProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IPositionProps, IDimensionProps, IActiveProps, IHoverProps`

Props : `collapse?`, `flat?`, `floating?`, `title?`, `modelValue?`.

#### `ISystemBarProps`

**Extends** : `ICommonsComponentProps, ITagProps, IElevationProps, IColorProps, IBgColorProps, ILayoutItemProps, IRoundedProps, IBorderProps, IDimensionProps`

Prop : `window?`.

#### `IMainProps`

**Extends** : `ITagProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IDimensionProps, IElevationProps, IBgColorProps, IColorProps`

Prop : `scrollable?`.

---

### Domaine Tableaux / Bracket

#### `ITableProps` (via `DataTable`)

Interface parente de la plupart des interfaces DataTable. Étend les props communes de tableau (bordures, dimensions, couleurs, etc.) — détails dans `Table/table.interface.ts`.

#### Bracket

Famille de 7 interfaces (`IBracketProps`, `IBracketRoundProps`, `IBracketMatchProps`, `IBracketCompetitorProps`, + les variantes `-component`) pour les tableaux de tournoi. Chaque interface composant étend ses interfaces data (`IBracketRound`, `IBracketMatch`, `IBracketCompetitor`).

---

### Domaine Champs spécialisés

- **`INumberFieldProps`** (`NumberField/`) : étend TextField + props numériques (`step`, `min`, `max`, etc.)
- **`IPasswordFieldProps`** (`PasswordField/`) : étend TextField + `showPasswordIcon`, `hidePasswordIcon`
- **`ITextareaProps`** (`TextareaField/`) : étend TextField + `rows`, `autoGrow`, `noResize`
- **`IFileFieldProps`** (`FileField/`) : étend Input + `accept`, `multiple`, `showSize`, `chips`, props de dropzone
- **`IOtpInputFieldProps`** (`OtpInputField/`) : étend ICommonsComponentProps + `length`, `type`, `divider`, `placeholder`, `focusAll`
- **`IRatingFieldProps`** (`RatingField/`) : étend ICommonsComponentProps + `length`, `modelValue`, `size`, `color`, `halfIncrements`, `readonly`, `disabled`
- **`IColorPickerFieldProps`** (`ColorPickerField/`) : étend IFieldProps + `modelValue`, props IColorPickerProps

---

## Graphe d'héritage des interfaces Commons

```
ICommonsComponentProps                  (id, class, style)
ITagProps                               (tag)
IColorProps                             (color)
IBgColorProps                           (bgColor)
IDimensionProps                         (height, width, min*, max*)
IMarginProps                            (margin*)
IPaddingProps                           (padding*)
IBorderProps                            (border*, borderColor, borderStyle)
IRoundedProps                           (rounded*)
IElevationProps                         (elevation)
IDensityProps                           (density)
ISizeProps                              (size)
ILocationProps                          (location)
ILocationStrategyProps                  extends IDimensionProps
IPositionProps                          (position, top, bottom, left, right)
IVariantProps                           (variant)
IDelayProps                             (closeDelay, openDelay)
IActivatorProps                         extends IDelayProps
IFocusProps                             (focused)
IValidationProps                        extends IFocusProps
ILazyProps                              (eager)
IRippleProps                            (ripple)
IHoverProps                             (hover: boolean | IHoverState)
IActiveProps                            (active, activeClass)
IStateEffectConfig                      (enabled, color, bgColor, border, rounded, elevation, padding, margin, gap)
  └── IHoverState = IStateEffectConfig
  └── IActiveState = IStateEffectConfig
IAdjacentProps                          (appendAvatar, appendIcon, prependAvatar, prependIcon)
IAdjacentInnerProps                     (appendInnerAvatar, appendInnerIcon, prependInner*, clearIcon, clearable)
IGroupProps                             (disabled, modelValue, multiple, mandatory, max, selectedClass)
IGroupItemProps                         (value, disabled, selectedClass)
INestedProps                            (selectStrategy, openStrategy, selected, opened, mandatory)
IVirtualProps                           (itemHeight, height, scrollDuration, scrollEasing)
IAlignProps                             (align, align{Sm/Md/Lg/Xl/Xxl})
IJustifyProps                           (justify, justify{Sm/Md/Lg/Xl/Xxl})
IDirectionProps                         (direction)
IScrollProps                            (scrollBehavior, scrollTarget, scrollThreshold)
IScrollStrategyProps                    (scrollStrategy, contained)
IFiltersProps                           (customFilter, customKeyFilter, filterKeys, filterMode, noFilter)
ILoaderProps                            extends ICommonsComponentProps, ITagProps, IColorProps
ILinkProps                              (href, replace, to, exact)
ILayoutItemProps                        extends ICommonsComponentProps (name, order, absolute, location)
ILayoutProps                            extends ICommonsComponentProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps
IStatusProps                            extends IIconProps (status, statusIconPosition)
IDisplayProps                           (mobileBreakpoint)
```

---

## Tableau récapitulatif : interfaces Commons → composants consommateurs directs

| Interface Commons | Composants qui l'étendent (liste partielle) |
|-------------------|----------------------------------------------|
| `IColorProps` | Alert, Avatar, AvatarGroup, Badge, BottomNav, Breadcrumb, Btn, Card, Chip, ChipGroup, Counter, DataTable, DatePicker, Divider, Drawer, ExpansionPanel, Field, Icon, Img, InfiniteScroll, Label, List, Main, Masonry, Pagination, Parallax, Progress, QrCode, Select, Skeleton, Snackbar, Stepper, SystemBar, Tabs, Timeline, Title, Toolbar, Tooltip, Treeview, Video, … |
| `IBgColorProps` | Alert, AvatarGroup, Badge, BottomNav, Btn, Card, ChipGroup, ColorPicker, DataTable, Drawer, Grid, Img, InfiniteScroll, Masonry, QrCode, Skeleton, Snackbar, Stepper, Treeview, Video, … |
| `IDimensionProps` | AppBar, Card, Carousel, Code, DataTable, Dialog, Field (via LoaderProps), Grid, Img (via ResponsiveProps), InfiniteScroll, LayoutItemProps, LocationStrategyProps, Masonry, Overlay, Progress, SystemBar, VirtualScroll, … |
| `IMarginProps` | Alert, Audio, Avatar, AvatarGroup, Badge, BottomNav, Breadcrumb, Btn, Card, CardHeader, CardText, Chip, ChipGroup, Clipboard, Code, ColorPicker, Counter, DatePicker, Field (via LoaderProps), Grid, Icon, Input, Label, List, Main, Masonry, Parallax, Progress, QrCode, Select, SliderField, Snackbar, Stepper, SystemBar, Title, Toolbar, Video, Watermark, … |
| `IPaddingProps` | (idem IMarginProps — les deux vont presque toujours de pair) |
| `IBorderProps` | Alert, Audio, Avatar, AvatarGroup, Badge, Btn, Card, CardHeader, CardText, Chip, Clipboard, Code, ColorPicker, Counter, DatePicker, Drawer, ExpansionPanel, Grid, Input, Masonry, Parallax, QrCode, Select, Sheet, SliderField, Snackbar, Stepper, Toolbar, Video, Window, … |
| `IRoundedProps` | Alert, Audio, Avatar, AvatarGroup, Badge, Btn, Card, CardHeader, CardText, Chip, Clipboard, Code, ColorPicker, Counter, DatePicker, Drawer, ExpansionPanel, Grid, Icon, Kbd, Label, Masonry, Overlay, Parallax, QrCode, Select, Sheet, Skeleton, Snackbar, Stepper, Toolbar, Video, Window, … |
| `IElevationProps` | Alert, Audio, Avatar, AvatarGroup, Badge, BottomNav, Breadcrumb, Btn, Card, Chip, Code, ColorPicker, Counter, DataTable, DatePicker, Dialog, Drawer, ExpansionPanel, Grid, Icon, Input, List, Masonry, Overlay, Parallax, QrCode, Select, Sheet, Skeleton, Snackbar, Stepper, SystemBar, Toolbar, … |
| `IDensityProps` | Alert, AppBar (via Toolbar), Avatar, AvatarGroup, BottomNav, Breadcrumb, Btn, Card, Chip, Checkbox, Counter, DataTable, ExpansionPanel, Field, Input, List, Pagination, Radio, Select, SliderField, Switch, Tabs, Timeline, Toolbar, Treeview, … |
| `ISizeProps` | Avatar, AvatarGroup, Chip, Icon, Kbd, Pagination, QrCode, RatingField, Skeleton, Stepper, Timeline, Treeview, … |
| `ILocationProps` | Alert, Badge, Snackbar, Sheet, … |
| `IPositionProps` | Alert, Audio, Btn, Card, Sheet, Snackbar, Toolbar, … |
| `IVariantProps` | Btn, ConfirmWrapper, Field, Select, Tabs, TextField, … |
| `IHoverProps` | Alert, Audio, Avatar, AvatarGroup, Badge, BottomNav, Card, Chip, Drawer, ExpansionPanel, Snackbar, Switch, Toolbar, … |
| `IActiveProps` | Avatar, AvatarGroup, Btn, Card, Checkbox, Chip, Drawer, ExpansionPanel, Radio, Sheet, Snackbar, Switch, Toolbar, … |
| `IAdjacentProps` | Alert, Btn, Card, CardHeader, Chip, ConfirmWrapper, Input, Select, … |
| `IAdjacentInnerProps` | Field, Select, … |
| `IGroupProps` | BtnToggle, ChipGroup, Tabs, Window, … |
| `IGroupItemProps` | Btn, Chip, ExpansionPanel, … |
| `INestedProps` | List, … |
| `IVirtualProps` | VirtualScroll, … |
| `ILazyProps` | Lazy, Overlay, Dialog, Menu, Tooltip, ExpansionPanel, Select, … |
| `IScrollStrategyProps` | Overlay, Dialog, Menu, Tooltip, … |
| `IFiltersProps` | DataTable, Select, … |
| `IActivatorProps` | Menu, Tooltip, Overlay, … |
| `ILinkProps` | Btn, Card, Chip, … |
| `ILoaderProps` | Btn (via ILoaderProps dans IBtnProps), Card, ExpansionPanel, … |
| `IValidationProps` | Input, … et tous les champs descendants |
| `ILayoutItemProps` | AppBar, BottomNav, Drawer, SystemBar, … |
| `IStatusProps` | Alert, Badge, Dialog, Snackbar, … |
| `IDirectionProps` | AvatarGroup, ConfirmWrapper, Divider, InfiniteScroll, SliderField, SlideGroup, Tabs, … |

---

*Ce document a été généré à partir du code source réel de `packages/ds/src/interfaces/`. Toute interface non présente dans ce périmètre (utilitaires Nuxt, Media, Chart détaillé, Picker sub-interfaces, etc.) suit les mêmes conventions de composition — `extends` d'une ou plusieurs Commons + props locales spécifiques au composant.*
