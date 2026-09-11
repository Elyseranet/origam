# 31 — Types du Design System Origam

## Introduction

Ce document est la référence technique exhaustive des **types TypeScript** définis dans `packages/ds/src/types/`. Chaque fichier `.type.ts` contient un ou plusieurs types (alias, unions, génériques) qui forment le contrat statique du design system.

Le répertoire est organisé en deux grands blocs :

- **`types/Commons/`** — types transversaux réutilisés par de nombreux composants et composables. Ce sont les fondations du système de typage.
- **`types/{Composant}/`** — types propres à un composant ou un sous-système. La majorité sont soit des alias `InstanceType<typeof OrigamXxx>` (exposition des refs de composant), soit des unions de string dérivées d'un enum.

La convention de nommage globale impose le préfixe **`T`** sur tous les types, les fichiers en **`kebab-case.type.ts`**, localisés dans `src/types/{Domain}/`.

---

## Types Commons (fondations transversales)

### `TIntent`

- **Fichier** : `types/Commons/intent.type.ts`
- **Définition** :
  ```ts
  export type TIntent =
    | 'neutral'
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
  ```
- **Rôle / sémantique** : Union exhaustive des intentions sémantiques. Chaque valeur correspond 1:1 à un jeu de tokens sémantiques `--origam-color__action--{intent}---*` et `--origam-color__feedback--{intent}---*` générés depuis `tokens/semantic/{light,dark}.json`. C'est le principal levier de coloration des composants interactifs.
- **Utilisé par** : `IColorProps`, composable `useColorEffect`, composable `useBackgroundColor`, `useTextColor`, `IAlertProps`, `IBtnProps`, `IChipProps`, `IBadgeProps`, `IAvatarProps`, `IEmptyStateProps`, et tout composant exposant un prop `color` / `intent`.

---

### `TSize`

- **Fichier** : `types/Commons/size.type.ts`
- **Définition** :
  ```ts
  export type TSize = `${SIZES}`
  // SIZES = { X_SMALL='x-small', SMALL='small', DEFAULT='default', LARGE='large', X_LARGE='x-large' }
  ```
  Union résolue : `'x-small' | 'small' | 'default' | 'large' | 'x-large'`
- **Rôle / sémantique** : Décrit les cinq paliers de taille normalisés du DS. Chaque valeur mappe sur une rangée de tokens de dimension (`--origam-{cmp}---height-{size}`, `--origam-{cmp}---font-size-{size}`, etc.).
- **Utilisé par** : `ISizeProps`, composable `useSize`, `IBtnProps`, `IChipProps`, `IAvatarProps`, `IIconProps`, `IProgressCircularProps`, etc.

---

### `TDensity`

- **Fichier** : `types/Commons/density.type.ts`
- **Définition** :
  ```ts
  export type TDensity = `${DENSITY}`
  // DENSITY = { DEFAULT='default', COMPACT='compact', COMFORTABLE='comfortable' }
  ```
  Union résolue : `'default' | 'compact' | 'comfortable'`
- **Rôle / sémantique** : Contrôle l'espacement intérieur des composants (padding, gap, hauteur minimale). `compact` resserre, `comfortable` aère. La valeur s'applique via la variable CSS `--origam-{cmp}---density`.
- **Utilisé par** : `IDensityProps`, composable `useDensity`, `IBtnProps`, `IChipProps`, `IListProps`, `IAvatarGroupProps`, `IBottomNavProps`, `IDataTableProps`.

---

### `TRounded`

- **Fichier** : `types/Commons/rounded.type.ts`
- **Définition** :
  ```ts
  export type TRounded = `${ROUNDED}`
  // ROUNDED = { X_SMALL='x-small', SMALL='small', DEFAULT='default', MEDIUM='medium',
  //             LARGE='large', X_LARGE='x-large', SHAPED='shaped', SHAPED_INVERT='shaped-invert' }
  ```
  Union résolue : `'x-small' | 'small' | 'default' | 'medium' | 'large' | 'x-large' | 'shaped' | 'shaped-invert'`
- **Rôle / sémantique** : Détermine le rayon de coin (`border-radius`). Chaque valeur correspond à un palier de token `radius.*` dans `tokens/primitive.json` ET génère une classe utilitaire `.origam--rounded-{value}`.
- **Utilisé par** : `IRoundedProps`, composable `useRounded`, presque tous les composants surfaciques (Btn, Card, Chip, Alert, Avatar, Badge, etc.).

---

### `TVariant` / `TVariantInput`

- **Fichier** : `types/Commons/variant.type.ts`
- **Définitions** :
  ```ts
  export type TVariant = `${VARIANT}`
  // VARIANT = { TEXT='text', FLAT='flat', ELEVATED='elevated', TONAL='tonal',
  //             OUTLINED='outlined', PLAIN='plain', GHOST='ghost' }

  export type TVariantInput = `${VARIANT_INPUT}`
  // VARIANT_INPUT = { UNDERLINED='underlined', FILLED='filled', SOLO='solo',
  //                   OUTLINED='outlined', PLAIN='plain' }
  ```
  `TVariant` résolu : `'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain' | 'ghost'`
  `TVariantInput` résolu : `'underlined' | 'filled' | 'solo' | 'outlined' | 'plain'`
- **Rôle / sémantique** : `TVariant` contrôle le rendu visuel des surfaces d'action (élévation, fond, bordure, glassmorphisme pour `ghost`). `TVariantInput` est spécifique aux champs de saisie, où les rendus divergent fondamentalement (underlined = barre inférieure, filled = fond coloré, solo = surface flottante).
- **Utilisé par** : `TVariant` → `IVariantProps`, `IBtnProps`, `ICardProps`, `IChipProps`, `IAlertProps`, `IListItemProps` ; `TVariantInput` → `IVariantInputProps`, `IFieldProps`, `ITextFieldProps`, `INumberFieldProps`, `IPasswordFieldProps`, `ISelectProps`.

---

### `TAlign`

- **Fichier** : `types/Commons/align.type.ts`
- **Définition** :
  ```ts
  export type TAlign = `${ALIGN}`
  // ALIGN = { START='start', END='end', CENTER='center', BASELINE='baseline', STRETCH='stretch' }
  ```
  Union résolue : `'start' | 'end' | 'center' | 'baseline' | 'stretch'`
- **Rôle / sémantique** : Alignement `align-items` CSS (axe transversal). Utilisé par les composants de layout (Row, Grid) et les DataTable headers.
- **Utilisé par** : `IAlignProps`, `IRowProps`, `IGridProps`, `IDataTableProps`, `IDataTableHeadersProps`.

---

### `TJustify`

- **Fichier** : `types/Commons/justify.type.ts`
- **Définition** :
  ```ts
  export type TJustify = `${JUSTIFY}`
  // JUSTIFY = { START='start', END='end', CENTER='center', SPACE_BETWEEN='space-between',
  //             SPACE_AROUND='space-around', SPACE_EVENLY='space-evenly' }
  ```
  Union résolue : `'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'`
- **Rôle / sémantique** : Alignement `justify-content` CSS (axe principal). Complète `TAlign` dans les composants de layout.
- **Utilisé par** : `IJustifyProps`, `IRowProps`, `IGridProps`, `IDataTableProps`.

---

### `TDirection`

- **Fichier** : `types/Commons/direction.type.ts`
- **Définition** :
  ```ts
  export type TDirection = `${DIRECTION}`
  // DIRECTION = { HORIZONTAL='horizontal', VERTICAL='vertical' }
  ```
  Union résolue : `'horizontal' | 'vertical'`
- **Rôle / sémantique** : Axe de disposition d'un composant. Utilisé partout où la direction peut basculer (Divider, Toolbar, Stepper, Timeline, SliderField, etc.).
- **Utilisé par** : `IDirectionProps`, `IDividerProps`, `IStepperProps`, `ITimelineProps`, `ISliderFieldProps`.

---

### `TPosition`

- **Fichier** : `types/Commons/position.type.ts`
- **Définition** :
  ```ts
  export type TPosition = `${POSITION}`
  // POSITION = { STATIC='static', RELATIVE='relative', FIXED='fixed',
  //              ABSOLUTE='absolute', STICKY='sticky' }
  ```
  Union résolue : `'static' | 'relative' | 'fixed' | 'absolute' | 'sticky'`
- **Rôle / sémantique** : Propriété CSS `position`. Exposée sur les composants de mise en page (AppBar, Toolbar, Drawer, SystemBar).
- **Utilisé par** : `IPositionProps`, composable `usePosition`.

---

### `TLocationStrategy` / `TLocationStrategyFn`

- **Fichier** : `types/Commons/location.type.ts`
- **Définitions** :
  ```ts
  export type TLocationStrategy = `${LOCATION_STRATEGIES}`
  // LOCATION_STRATEGIES = { STATIC='static', CONNECTED='connected' }

  export type TLocationStrategyFn = (
    data: ILocationStrategyData,
    props: ILocationStrategyProps,
    contentStyles: Ref<Record<string, string>>
  ) => undefined | { updateLocation: (e: Event) => void }
  ```
  `TLocationStrategy` résolu : `'static' | 'connected'`
- **Rôle / sémantique** : Stratégie de positionnement des overlays. `connected` ancre le contenu flottant à son activateur ; `static` le positionne dans le flux normal. `TLocationStrategyFn` est la signature d'une stratégie custom que le consommateur peut injecter.
- **Utilisé par** : `ILocationStrategyProps`, composable `useLocationStrategies`, `IOverlayProps`, `IMenuProps`, `ITooltipProps`, `IDialogProps`.

---

### `TScrollStrategy` / `TScrollStrategyFn`

- **Fichier** : `types/Commons/scroll.type.ts`
- **Définitions** :
  ```ts
  export type TScrollStrategy = `${SCROLL_STRATEGIES}`
  // SCROLL_STRATEGIES = { NONE='none', CLOSE='close', BLOCK='block', REPOSITION='reposition' }

  export type TScrollStrategyFn = (
    data: IScrollStrategyData,
    props: IScrollStrategyProps,
    scope: EffectScope
  ) => void
  ```
  `TScrollStrategy` résolu : `'none' | 'close' | 'block' | 'reposition'`
- **Rôle / sémantique** : Comportement de l'overlay quand la page défile. `none` = inerte ; `close` = ferme l'overlay ; `block` = bloque le scroll ; `reposition` = recalcule la position.
- **Utilisé par** : `IScrollStrategyProps`, composable `useScrollStrategies`, `IOverlayProps`, `IMenuProps`.

---

### `TColor` et types couleur

- **Fichier** : `types/Commons/color.type.ts`
- **Définitions** :
  ```ts
  export type TColor = string | IGradient | false | null | undefined
  export type TXYZ = [number, number, number]
  export type TLAB = [number, number, number]
  export type THSVA = { h: number, s: number, v: number, a?: number }
  export type TRGBA = { r: number, g: number, b: number, a?: number }
  export type THSLA = { h: number, s: number, l: number, a?: number }
  export type THex = string & { __hexBrand: never }
  export type TColorType = string | number | THSVA | TRGBA | THSLA
  export type TBgFgRole = 'default' | 'hover' | 'active' | 'disabled'
  ```
- **Rôle / sémantique** :
  - `TColor` : type de la prop `color` / `bgColor` / `textColor`. Accepte un `TIntent`, un CSS color, un gradient CSS en string, un `IGradient` structuré, ou une valeur falsy pour désactiver.
  - `THSVA`, `TRGBA`, `THSLA` : représentations internes pour les calculs couleur du `OrigamColorPicker`.
  - `THex` : branded type pour distinguer une string hexadécimale valide.
  - `TColorType` : union d'entrée du composable `useColor` — accepte string, number (packed), HSVA, RGBA, HSLA.
  - `TBgFgRole` : rôle d'interaction pour `useColorEffect` — détermine quelle dérivation de token utiliser selon l'état courant.
- **Utilisé par** : `IColorProps`, `IBgColorProps`, `ITextColorProps`, composables `useColor`, `useBackgroundColor`, `useTextColor`, `useColorEffect`, `IColorPickerProps`, `IColorPickerCanvasProps`.

---

### `TAnchor` / `TParsedAnchor` et types d'ancrage

- **Fichier** : `types/Commons/anchor.type.ts`
- **Définitions** :
  ```ts
  export type TStartEnd = `${START_END}`         // 'start' | 'end'
  export type TBlock = `${BLOCK}`                // 'top' | 'bottom'
  export type TBlockStartEnd = TBlock | TStartEnd
  export type TInline = `${INLINE}`              // 'left' | 'right'
  export type TInlineStartEnd = TInline | TStartEnd
  export type TDirectionBoth = TBlock | TInline  // 'top' | 'bottom' | 'left' | 'right'

  export type TAnchor =
    | TBlock
    | TInline
    | 'center'
    | 'center center'
    | `${TBlock} ${TInline | 'center'}`
    | `${TInline} ${TBlock | 'center'}`

  export type TParsedAnchor =
    | { side: 'center', align: 'center' }
    | { side: TBlock, align: TInline | 'center' }
    | { side: TInline, align: TBlock | 'center' }
  ```
- **Rôle / sémantique** : `TAnchor` est la valeur acceptée par le prop `anchor` des overlays positionnés. Forme canonique : une valeur de bloc (`'top'`, `'bottom'`) et une valeur inline (`'left'`, `'right'`), séparées par un espace. `TParsedAnchor` est la représentation interne après décodage par le composable.
- **Utilisé par** : `ILocationStrategyProps`, composable `parseAnchor`, `IMenuProps`, `ITooltipProps`, `IOverlayProps`.

---

### `TAxis`

- **Fichier** : `types/Commons/axis.type.ts`
- **Définition** :
  ```ts
  export type TAxis = `${AXIS}`
  // AXIS = { BOTH='both', X='x', Y='y' }
  ```
  Union résolue : `'both' | 'x' | 'y'`
- **Rôle / sémantique** : Axe de contrainte pour des composants drag-and-drop, parallaxe, ou masque de défilement.
- **Utilisé par** : `IParallaxProps`, directives drag.

---

### `TBorderStyle`

- **Fichier** : `types/Commons/border.type.ts`
- **Définition** :
  ```ts
  export type TBorderStyle = `${BORDER_STYLE}`
  // BORDER_STYLE = { NONE='none', HIDDEN='hidden', DOTTED='dotted', DASHED='dashed',
  //                  SOLID='solid', DOUBLE='double', GROOVE='groove', RIDGE='ridge',
  //                  INSET='inset', OUTSET='outset' }
  ```
  Union résolue : `'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'`
- **Rôle / sémantique** : Style CSS de bordure. Utilisé par `IBorderProps` et le composable `useBorder`.
- **Utilisé par** : `IBorderProps`, composable `useBorder`.

---

### `TCalendarStrategy`

- **Fichier** : `types/Commons/calendar.type.ts`
- **Définition** :
  ```ts
  export type TCalendarStrategy = `${CALENDAR_STRATEGY}`
  // CALENDAR_STRATEGY = { DYNAMIC='dynamic', STATIC='static' }
  ```
  Union résolue : `'dynamic' | 'static'`
- **Rôle / sémantique** : Stratégie de rendu du calendrier dans `DatePicker`. `dynamic` recalcule la position selon le viewport ; `static` reste fixe.
- **Utilisé par** : `IDatePickerProps`.

---

### `TDimensions`

- **Fichier** : `types/Commons/dimension.type.ts`
- **Définition** :
  ```ts
  export type TDimensions = `${DIMENSIONS}`
  // DIMENSIONS = { HEIGHT='height', MAX_HEIGHT='maxHeight', MAX_WIDTH='maxWidth',
  //                MIN_HEIGHT='minHeight', MIN_WIDTH='minWidth', WIDTH='width' }
  ```
  Union résolue : `'height' | 'maxHeight' | 'maxWidth' | 'minHeight' | 'minWidth' | 'width'`
- **Rôle / sémantique** : Clés des props de dimension. Sert de litéral pour itérer sur les props dans `useDimension`.
- **Utilisé par** : `IDimensionProps`, composable `useDimension`.

---

### `TBreakpoint` / `TDisplayThresholds` / `TSSROptions`

- **Fichier** : `types/Commons/display.type.ts`
- **Définitions** :
  ```ts
  export type TBreakpoint = `${BREAKPOINTS}`
  // BREAKPOINTS = { XS='xs', SM='sm', MD='md', LG='lg', XL='xl', XXL='xxl' }

  export type TDisplayThresholds = {
    [key in TBreakpoint]: number
  }

  export type TSSROptions = boolean | {
    clientWidth: number
    clientHeight?: number
  }
  ```
  `TBreakpoint` résolu : `'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`
- **Rôle / sémantique** : `TBreakpoint` énumère les 6 paliers responsive. `TDisplayThresholds` mappe chaque palier à sa largeur en pixels. `TSSROptions` configure le mode SSR du composable `useDisplay` (désactivé = `false`, activé = `true` avec clientWidth par défaut, ou objet précis).
- **Utilisé par** : composable `useDisplay`, `IDisplayProps`, `IOrigamPluginOptionsObject`.

---

### `TEventHandler`

- **Fichier** : `types/Commons/event.type.ts`
- **Définition** :
  ```ts
  export type TEventHandler = (event: Event) => any
  ```
- **Rôle / sémantique** : Signature générique de gestionnaire d'événement DOM. Alias de confort.
- **Utilisé par** : divers composables d'interaction (`useActivator`, `useScrollStrategies`).

---

### Types de filtres

- **Fichier** : `types/Commons/filters.type.ts`
- **Définitions** :
  ```ts
  export type TFilterMatch = boolean | number | [number, number] | [number, number][]
  export type TFilterFunction = (value: string, query: string, item?: IInternalItem) => TFilterMatch
  export type TFilterKeyFunctions = Record<string, TFilterFunction>
  export type TFilterKeys = string | string[]
  export type TFilterMode = `${FILTERS_MODE}`
  // FILTERS_MODE = { SOME='some', EVERY='every', UNION='union', INTERSECTION='intersection' }
  ```
  `TFilterMode` résolu : `'some' | 'every' | 'union' | 'intersection'`
- **Rôle / sémantique** : Contrat du système de filtre des composants de liste (`DataTable`, `Select`, `Combobox`). `TFilterMatch` peut être un booléen (match/no-match), un score de correspondance numérique (pour le highlight), ou des paires d'index `[start, end]` pour surligner les caractères correspondants. `TFilterMode` détermine si plusieurs clés filtrées sont combinées par `OR` (`some`/`union`) ou `AND` (`every`/`intersection`).
- **Utilisé par** : `IFilterableProps`, `IDataTableProps`, `ISelectProps`, composable `useFilter`.

---

### Types utilitaires forward-refs / génériques

- **Fichier** : `types/Commons/forwardRefs.type.ts`
- **Définitions** :
  ```ts
  export type TUnionToIntersection<U> = ...     // Distributive conditional transform
  export type TOmitPrefix<T, P extends string> = // Omit les clés prefixées P${string}
  export type TOmitProps<T> = // Omit les props Vue ComponentPublicInstance
  ```
- **Rôle / sémantique** : Helpers TS avancés pour la composition de props Vue et l'exposition sélective via `defineExpose`. `TUnionToIntersection` est le pattern distributif classique ; `TOmitPrefix` est utilisé pour l'API slot (supprimer les props `on*`).
- **Utilisé par** : couche d'infrastructure des composables de layout.

---

### `TKeyboardModifiers`

- **Fichier** : `types/Commons/hotkey.type.ts`
- **Définition** :
  ```ts
  export type TKeyboardModifiers = `${KEYBOARD_MODIFIERS_KEY}`
  // KEYBOARD_MODIFIERS_KEY = { CONTROL='ctrl', SHIFT='shift', ALT='alt', META='meta', COMMAND='cmd' }
  ```
  Union résolue : `'ctrl' | 'shift' | 'alt' | 'meta' | 'cmd'`
- **Rôle / sémantique** : Modificateurs clavier reconnus par `useHotkey` et les composants `CommandPalette` / `Kbd`.
- **Utilisé par** : `IHotkeyProps`, composable `useHotkey`, `ICommandPaletteItemProps`.

---

### `THoverEvent`

- **Fichier** : `types/Commons/hover.type.ts`
- **Définition** :
  ```ts
  export type THoverEvent = (MouseEvent | TouchEvent) & { [ORIGAM_HOVER_STOP_KEY]?: boolean }
  ```
- **Rôle / sémantique** : Événement hover enrichi avec une propriété de propagation stop (`[ORIGAM_HOVER_STOP_KEY]`). Permet à un composant enfant d'annuler le hover d'un parent sans `stopPropagation()`.
- **Utilisé par** : directive `v-hover`, composable `useHover`.

---

### `TObserveHandler`

- **Fichier** : `types/Commons/intersect.type.ts`
- **Définition** :
  ```ts
  export type TObserveHandler = (
    isIntersecting: boolean,
    entries: Array<IntersectionObserverEntry>,
    observer: IntersectionObserver
  ) => void
  ```
- **Rôle / sémantique** : Callback de la directive `v-intersect`. Signature normalisée au-dessus de l'`IntersectionObserver` natif.
- **Utilisé par** : directive `v-intersect`, `IIntersectProps`, `IInfiniteScrollProps`.

---

### `TLoaderKind` / `TLoaderConfig` / `TLoadingValue`

- **Fichier** : `types/Commons/loader.type.ts`
- **Définitions** :
  ```ts
  export type TLoaderKind = 'line' | 'circular' | 'skeleton'

  export type TLoaderConfig =
    | ({ type: 'line' } & Partial<IProgressLinearProps>)
    | ({ type: 'circular' } & Partial<IProgressCircularProps>)
    | ({ type: 'skeleton' } & Partial<ISkeletonProps>)

  export type TLoadingValue = boolean | number | TLoaderConfig
  ```
- **Rôle / sémantique** : Contrat du prop `loading` unifié à travers tous les composants qui supportent un état de chargement. `false`/`undefined` = pas de loading ; `true` = loading indéterminé avec le type préféré du composant ; `number` (0-100) = loading déterminé ; `TLoaderConfig` = override complet du type et des props du loader.
- **Utilisé par** : `ILoaderProps`, composable `useLoader`, `IBtnProps`, `ICardProps`, `IDataTableProps`, `IImgProps`.

---

### Types de layout interne (`TPartialKeys`, `TAppendDefault`, etc.)

- **Fichier** : `types/Commons/layout.type.ts`
- **Définitions** :
  ```ts
  export type TPartialKeys<T> = { [P in keyof T]?: unknown }
  export type TAppendDefault<T extends ComponentObjectPropsOptions, D extends TPartialKeys<T>> = { ... }
  export type TMergeDefault<T, D> = ...
  export type TInferPropType<T> = ...
  ```
- **Rôle / sémantique** : Helpers TS bas niveau pour la gestion des props Vue (inférence de type depuis les constructeurs Vue, merge des defaults). Utilisés exclusivement par l'infrastructure de `withDefaults` et les macros de composition.
- **Utilisé par** : couche d'infrastructure Vue du DS, non exposé publiquement aux consommateurs.

---

### `TMode`

- **Fichier** : `types/Commons/mode.type.ts`
- **Définition** :
  ```ts
  export type TMode = `${MODE}`
  // MODE = { HORIZONTAL='horizontal', VERTICAL='vertical', SHIFT='shift' }
  ```
  Union résolue : `'horizontal' | 'vertical' | 'shift'`

  Note : ce `TMode` est le type générique du mode de rendu de l'AppBar / Toolbar, **distinct** de `TMode` dans `theme.type.ts` (light/dark). Les deux coexistent car leurs domaines diffèrent.

- **Rôle / sémantique** : Comportement de scroll de l'AppBar. `horizontal` / `vertical` = sens de déplacement ; `shift` = décale le titre.
- **Utilisé par** : `IAppBarProps`.

---

### Types de sélection imbriquée (`TSelectStrategy`, `TOpenStrategy`, `TNestedProvide`, etc.)

- **Fichier** : `types/Commons/nested.type.ts`
- **Définitions** (résumé) :
  ```ts
  export type TSelectStrategy = `${SELECT_STRATEGY}`
  // SELECT_STRATEGY = { SINGLE_LEAF='single-leaf', LEAF='leaf', INDEPENDENT='independent',
  //                     SINGLE_INDEPENDENT='single-independent', CLASSIC='classic' }

  export type TOpenStrategy = `${OPEN_STRATEGY}`
  // OPEN_STRATEGY = { SINGLE='single', MULTIPLE='multiple', LIST='list' }

  export type TSelectStrategyFn = (data: { id, value, selected, children, parents, event? }) => Map<unknown, `${SELECTED}`>
  export type TOpenStrategyFn = (data: { id, value, opened, children, parents, event? }) => Set<unknown>
  export type TOpenSelectStrategyFn = (...) => Set<unknown> | null
  export type TStrategySelect = { select, in, out }
  export type TStrategyOpen = { open, select }
  export type TNestedProvide = { id, isGroupActivator?, root: { children, parents, opened, selected, selectedValues, register, unregister, open, select, openOnSelect } }
  ```
- **Rôle / sémantique** : Tout le contrat du système de sélection imbriquée (arbres, listes groupées, treeview). `TSelectStrategy` décrit la règle de sélection ; `TOpenStrategy` décrit quelle logique d'ouverture appliquer. `TNestedProvide` est l'objet `provide` injecté dans les arbres imbriqués. `SELECTED` = `{ ON='on', OFF='off', INDETERMINATE='indeterminate' }`.
- **Utilisé par** : composable `useNested`, `IListProps`, `ITreeviewProps`, `IExpansionPanelsProps`, `IDataTableProps`.

---

### Types de points et coordonnées

- **Fichier** : `types/Commons/point.type.ts`
- **Définitions** :
  ```ts
  export type TPoint = { x: number, y: number }
  export type TElementPoint = TPoint & As<'element'>
  export type TViewportPoint = TPoint & As<'viewport'>
  export type TOffset = TPoint & As<'offset'>
  ```
- **Rôle / sémantique** : Branded types pour distinguer les systèmes de coordonnées (élément, viewport, offset) et éviter les confusions lors des calculs de positionnement d'overlays.
- **Utilisé par** : composables `useLocationStrategies`, `useScrollStrategies`, système d'ancrage des overlays.

---

### `TRippleEvent`

- **Fichier** : `types/Commons/ripple.type.ts`
- **Définition** :
  ```ts
  export type TRippleEvent = (MouseEvent | TouchEvent | KeyboardEvent) & { [ORIGAM_RIPPLE_STOP_KEY]?: boolean }
  ```
- **Rôle / sémantique** : Événement enrichi pour la directive `v-ripple`. La propriété `ORIGAM_RIPPLE_STOP_KEY` permet aux composants enfants de stopper la propagation du ripple sans `stopPropagation()`.
- **Utilisé par** : directive `v-ripple`, composable `useRipple`.

---

### `TSortDirection`

- **Fichier** : `types/Commons/sort.type.ts`
- **Définition** :
  ```ts
  export type TSortDirection = `${SORT_DIRECTION}`
  // SORT_DIRECTION = { ASC='asc', DESC='desc' }
  ```
  Union résolue : `'asc' | 'desc'`
- **Rôle / sémantique** : Direction de tri. Utilisée dans le DataTable.
- **Utilisé par** : `IDataTableProps`, `ISortItem`, composable `useDataTableSorted`.

---

### `TStatus` / `TStatusPosition`

- **Fichier** : `types/Commons/status.type.ts`
- **Définitions** :
  ```ts
  export type TStatus = `${STATUS}`
  // STATUS = { SUCCESS='success', INFO='info', WARNING='warning', ERROR='error' }

  export type TStatusPosition = `${STATUS_POSITION}`
  // STATUS_POSITION = { PREPEND='prepend', APPEND='append', REPLACE='replace', BOTH='both' }
  ```
  `TStatus` résolu : `'success' | 'info' | 'warning' | 'error'`
  `TStatusPosition` résolu : `'prepend' | 'append' | 'replace' | 'both'`
- **Rôle / sémantique** : `TStatus` indique l'état sémantique d'un feedback (différent de `TIntent` qui est plus large). `TStatusPosition` indique où l'icône de statut est rendue dans le Field : avant, après, à la place du label, ou les deux.
- **Utilisé par** : `IStatusProps`, `IFieldProps`, `IInputProps`, composables de validation.

---

### `TTouchWrapper` / `TTouchEvent`

- **Fichier** : `types/Commons/touch.type.ts`
- **Définitions** :
  ```ts
  export type TTouchWrapper = ITouchHandlers & ITouchData
  export type TTouchEvent = `${TOUCH_EVENTS}`
  // TOUCH_EVENTS = { TOUCH_START='touchstart', TOUCH_END='touchend', TOUCH_MOVE='touchmove' }
  ```
  `TTouchEvent` résolu : `'touchstart' | 'touchend' | 'touchmove'`
- **Rôle / sémantique** : `TTouchWrapper` est l'objet complet géré par la directive `v-touch` (handlers + données de position/vitesse). `TTouchEvent` énumère les événements natifs écoutés.
- **Utilisé par** : directive `v-touch`, composable `useTouch`, `IDrawerProps`.

---

### `TVModel`

- **Fichier** : `types/Commons/v-model.type.ts`
- **Définition** :
  ```ts
  export type TVModel<
    Props extends object & { [key in Prop as `onUpdate:${Prop}`]?: TEventProp | undefined },
    Prop extends Extract<keyof Props, string>,
    Inner = Props[Prop]
  > = Ref<TInnerVal<Inner>> & { readonly externalValue: Props[Prop] }
  ```
- **Rôle / sémantique** : Type de la valeur retournée par `useProxiedModel`. Fusionne la `Ref` interne avec l'accès à la valeur externe (prop du parent). C'est le contrat du v-model bidirectionnel du DS : chaque composant contrôlable expose ce type.
- **Utilisé par** : composable `useProxiedModel`, tous les composants à v-model (TextField, Select, Checkbox, Switch, DatePicker, etc.).

---

### `TValidateOn`

- **Fichier** : `types/Commons/validation.type.ts`
- **Définition** :
  ```ts
  export type TValidateOn = `${VALIDATE_ON}`
  // VALIDATE_ON = { BLUR='blur', INPUT='input', SUBMIT='submit',
  //                 LAZY_BLUR='lazy blur', LAZY_INPUT='lazy input', LAZY_SUBMIT='lazy submit',
  //                 BLUR_LAZY='blur lazy', INPUT_LAZY='input lazy', SUBMIT_LAZY='submit lazy',
  //                 LAZY='lazy' }
  ```
  Union résolue : `'blur' | 'input' | 'submit' | 'lazy blur' | 'lazy input' | 'lazy submit' | 'blur lazy' | 'input lazy' | 'submit lazy' | 'lazy'`
- **Rôle / sémantique** : Déclenche de la validation. `lazy` diffère la validation jusqu'à la première interaction invalide. Les formes composées (`'lazy blur'`, `'blur lazy'`) sont équivalentes pour la compatibilité.
- **Utilisé par** : `IValidationProps`, `IFormProps`, composable `useForm`, `ITextFieldProps`, `ISelectProps`.

---

### `TActivatorTarget`

- **Fichier** : `types/Commons/activator.type.ts`
- **Définition** :
  ```ts
  export type TActivatorTarget<T> = HTMLElement | undefined | (T extends any[] ? [x: number, y: number] : never)
  ```
- **Rôle / sémantique** : Type de la cible de l'activateur dans les overlays. Pour les menus contextuels déclenchés par clic droit ou position custom, la cible peut être une paire de coordonnées `[x, y]`.
- **Utilisé par** : `IActivatorProps`, composable `useActivator`, `IMenuProps`, `IContextualMenuProps`.

---

### Types utilitaires génériques Commons

- **Fichier** : `types/Commons/commons.type.ts`
- **Définitions** :
  ```ts
  export type TNotAUnion<T>           // Vérifie que T n'est pas une union (retourne unknown ou never)
  export type TEventProp<T, F>        // Type d'un prop "onXxx" (handler d'événement Vue)
  export type TInnerVal<T>            // Si T est un Array -> Readonly<T>, sinon T
  export type TSelectItemKey<T>       // Clé de sélection : boolean/null/undefined | string | number[] | function
  export type TMaybePick<T, U>        // Pick conditionnel selon la nature de T
  export type TFocusLocation          // `${FOCUS_LOCATION}` | number
                                      // FOCUS_LOCATION = { NEXT='next', PREV='prev', FIRST='first', LAST='last' }
  export type TTemplateRef            // Function ref Vue avec .value et .el
  export type TClientPosition         // `${CLIENT_POSITION}` = 'clientY' | 'clientX'
  export type TIfAny<T, Y, N>         // Guard : si T est any -> Y, sinon N
  export type TWrapInArrayResult<T>   // Normalise T en tableau (gère les tableaux existants et les non-tableaux)
  export type TValueOf<T>             // T[keyof T]
  export type TFn                     // () => void
  export type TOrigamPluginOptionsImport  // boolean | IOrigamPluginOptionsObject
  ```
- **Rôle / sémantique** : Helpers génériques transversaux. `TSelectItemKey` est notamment critique pour tous les composants de liste (DataTable, Select, Combobox) où la "clé" d'un item peut être un chemin string (dot-notation), un tableau de clés imbriquées, ou une fonction accesseur.
- **Utilisé par** : `IDataTableProps`, `ISelectProps`, `IListProps`, composable `getPropertyFromItem`, couche d'infrastructure.

---

### Types de date

- **Fichier** : `types/Commons/date.type.ts`
- **Définitions** :
  ```ts
  export type TCustomDateFormat =
    Intl.DateTimeFormatOptions
    | ((date: Date, formatString: string, locale: string) => string)
  export type TAdapter = object
  export type TInternalAdapter = object extends TAdapter ? IDateAdapter : TAdapter
  ```
- **Rôle / sémantique** : `TCustomDateFormat` est la signature du formateur de date personnalisé injecté dans le plugin. `TAdapter` / `TInternalAdapter` sont des guards de type pour le système d'adaptateur de date (Date-fns, Luxon, Day.js, natif JS).
- **Utilisé par** : `IOrigamPluginOptionsObject`, `IDatePickerProps`, composable `useDate`.

---

## Types par composant

### Catégorie : Aliases InstanceType

La majorité des fichiers composant ne contiennent qu'un alias d'instance. Ce pattern expose le type de la `ref` d'un composant pour les consommateurs TypeScript. Le tableau ci-dessous les regroupe.

| Type | Composant exposé | Fichier |
|---|---|---|
| `TOrigamAlert` | `OrigamAlert` | `Alert/alert.type.ts` |
| `TOrigamAppBar` | `OrigamAppBar` | `App/app-bar.type.ts` |
| `TOrigamApp` | `OrigamApp` | `App/app.type.ts` |
| `TOrigamAvatarGroup` | `OrigamAvatarGroup` | `Avatar/avatar-group.type.ts` |
| `TOrigamAvatar` | `OrigamAvatar` | `Avatar/avatar.type.ts` |
| `TOrigamBadge` | `OrigamBadge` | `Badge/badge.type.ts` |
| `TOrigamBottomNav` | `OrigamBottomNav` | `BottomNav/bottom-nav.type.ts` |
| `TOrigamBreadcrumbDivider` | `OrigamBreadcrumbDivider` | `Breadcrumb/breadcrumb-divider.type.ts` |
| `TOrigamBreadcrumbItem` | `OrigamBreadcrumbItem` | `Breadcrumb/breadcrumb-item.type.ts` |
| `TOrigamBreadcrumb` | `OrigamBreadcrumb` | `Breadcrumb/breadcrumb.type.ts` |
| `TOrigamBtnGroup` | `OrigamBtnGroup` | `Btn/btn-group.type.ts` |
| `TOrigamBtnToggle` | `OrigamBtnToggle` | `Btn/btn-toggle.type.ts` |
| `TOrigamBtn` | `OrigamBtn` | `Btn/btn.type.ts` |
| `TOrigamCard` | `OrigamCard` | `Card/card.type.ts` |
| `TOrigamCardHeader` | `OrigamCardHeader` | `Card/card-header.type.ts` |
| `TOrigamCardText` | `OrigamCardText` | `Card/card-text.type.ts` |
| `TOrigamCarousel` | `OrigamCarousel` | `Carousel/carousel.type.ts` |
| `TOrigamCarouselItem` | `OrigamCarouselItem` | `Carousel/carousel-item.type.ts` |
| `TOrigamColorPicker` | `OrigamColorPicker` | `ColorPicker/color-picker.type.ts` |
| `TOrigamColorPickerCanvas` | `OrigamColorPickerCanvas` | `ColorPicker/color-picker-canvas.type.ts` |
| `TOrigamColorPickerEdit` | `OrigamColorPickerEdit` | `ColorPicker/color-picker-edit.type.ts` |
| `TOrigamColorPickerPreview` | `OrigamColorPickerPreview` | `ColorPicker/color-picker-preview.type.ts` |
| `TOrigamColorPickerSwatches` | `OrigamColorPickerSwatches` | `ColorPicker/color-picker-swatches.type.ts` |
| `TOrigamContainer` | `OrigamContainer` | `Grids/container.type.ts` |
| `TOrigamCol` | `OrigamCol` | `Grids/col.type.ts` |
| `TOrigamRow` | `OrigamRow` | `Grids/row.type.ts` |
| `TOrigamSpacer` | `OrigamSpacer` | `Grids/spacer.type.ts` |
| `TOrigamDataList` | `OrigamDataList` | `DataList/data-list.type.ts` |
| `TOrigamDataTable` | `OrigamDataTable` | `DataTable/data-table.type.ts` |
| `TOrigamDataTableRow` | `OrigamDataTableRow` | `DataTable/data-table-row.type.ts` |
| `TOrigamDataTableHeaders` | `OrigamDataTableHeaders` | `DataTable/data-table-headers.type.ts` |
| `TOrigamDataTableHeaderCell` | `OrigamDataTableHeaderCell` | `DataTable/data-table-header-cell.type.ts` |
| `TOrigamDataTableHeadersCell` | `OrigamDataTableHeadersCell` | `DataTable/data-table-headers-cell.type.ts` |
| `TOrigamDataTableHeadersCellMobile` | `OrigamDataTableHeadersCellMobile` | `DataTable/data-table-headers-cell-mobile.type.ts` |
| `TOrigamDataTableColumnCell` | `OrigamDataTableColumnCell` | `DataTable/data-table-column-cell.type.ts` |
| `TOrigamDataTableFooter` | `OrigamDataTableFooter` | `DataTable/data-table-footer.type.ts` |
| `TOrigamDataTableGroupHeaderRow` | `OrigamDataTableGroupHeaderRow` | `DataTable/data-table-group-header-row.type.ts` |
| `TOrigamDataTableRows` | `OrigamDataTableRows` | `DataTable/data-table-rows.type.ts` |
| `TOrigamDatePicker` | `OrigamDatePicker` | `DatePicker/date-picker.type.ts` |
| `TOrigamDatePickerControls` | `OrigamDatePickerControls` | `DatePicker/date-picker-controls.type.ts` |
| `TOrigamDialog` | `OrigamDialog` | `Dialog/dialog.type.ts` |
| `TOrigamDialogConfirmation` | `OrigamDialogConfirmation` | `Dialog/dialog-confirmation.type.ts` |
| `TOrigamDivider` | `OrigamDivider` | `Divider/divider.type.ts` |
| `TOrigamDrawer` | `OrigamDrawer` | `Drawer/drawer.type.ts` |
| `TOrigamExpansionPanel` | `OrigamExpansionPanel` | `ExpansionPanel/expansion-panel.type.ts` |
| `TOrigamExpansionPanelContent` | `OrigamExpansionPanelContent` | `ExpansionPanel/expansion-panel-content.type.ts` |
| `TOrigamExpansionPanelHeader` | `OrigamExpansionPanelHeader` | `ExpansionPanel/expansion-panel-header.type.ts` |
| `TOrigamExpansionPanels` | `OrigamExpansionPanels` | `ExpansionPanel/expansion-panels.type.ts` |
| `TOrigamField` | `OrigamField` | `Field/field.type.ts` |
| `TOrigamForm` | `OrigamForm` | `Form/form.type.ts` |
| `TOrigamIcon` | `OrigamIcon` | `Icon/icon.type.ts` |
| `TOrigamClassIcon` | `OrigamClassIcon` | `Icon/class-icon.type.ts` |
| `TOrigamComponentIcon` | `OrigamComponentIcon` | `Icon/component-icon.type.ts` |
| `TOrigamLigatureIcon` | `OrigamLigatureIcon` | `Icon/ligature-icon.type.ts` |
| `TOrigamSvgIcon` | `OrigamSvgIcon` | `Icon/svg-icon.type.ts` |
| `TOrigamImg` | `OrigamImg` | `Img/img.type.ts` |
| `TOrigamInfiniteScroll` | `OrigamInfiniteScroll` | `InfiniteScroll/infinite-scroll.type.ts` |
| `TOrigamInfiniteScrollIntersect` | `OrigamInfiniteScrollIntersect` | `InfiniteScroll/infinite-scroll-intersect.type.ts` |
| `TOrigamInput` | `OrigamInput` | `Input/input.type.ts` |
| `TOrigamKbd` | `OrigamKbd` | `Kbd/kbd.type.ts` |
| `TOrigamLabel` | `OrigamLabel` | `Label/label.type.ts` |
| `TOrigamLayout` | `OrigamLayout` | `Layout/layout.type.ts` |
| `TOrigamLazy` | `OrigamLazy` | `Lazy/lazy.type.ts` |
| `TOrigamList` | `OrigamList` | `List/list.type.ts` |
| `TOrigamListItem` | `OrigamListItem` | `List/list-item.type.ts` |
| `TOrigamLoader` | `OrigamLoader` | `Loader/loader.type.ts` |
| `TOrigamMenu` | `OrigamMenu` | `Menu/menu.type.ts` |
| `TOrigamMessages` | `OrigamMessages` | `Messages/messages.type.ts` |
| `TOrigamOverlay` | `OrigamOverlay` | `Overlay/overlay.type.ts` |
| `TOrigamOverlayScrim` | `OrigamOverlayScrim` | `Overlay/overlay-scrim.type.ts` |
| `TOrigamPagination` | `OrigamPagination` | `Pagination/pagination.type.ts` |
| `TOrigamParallax` | `OrigamParallax` | `Parallax/parallax.type.ts` |
| `TOrigamParallaxElement` | `OrigamParallaxElement` | `Parallax/parallax-element.type.ts` |
| `TOrigamPasswordField` | `OrigamPasswordField` | `PasswordField/password-field.type.ts` |
| `TOrigamPicker` | `OrigamPicker` | `Picker/picker.type.ts` |
| `TOrigamPickerTitle` | `OrigamPickerTitle` | `Picker/picker-title.type.ts` |
| `TOrigamProgress` | `OrigamProgress` | `Progress/progress.type.ts` |
| `TOrigamProgressCircular` | `OrigamProgressCircular` | `Progress/progress-circular.type.ts` |
| `TOrigamProgressLinear` | `OrigamProgressLinear` | `Progress/progress-linear.type.ts` |
| `TOrigamRatingField` | `OrigamRatingField` | `RatingField/rating-field.type.ts` |
| `TOrigamRatingFieldItem` | `OrigamRatingFieldItem` | `RatingField/rating-field-item.type.ts` |
| `TOrigamResponsive` | `OrigamResponsive` | `Responsive/responsive.type.ts` |
| `TOrigamSelect` | `OrigamSelect` | `Select/select.type.ts` |
| `TOrigamSelectionControl` | `OrigamSelectionControl` | `SelectionControl/selection-control.type.ts` |
| `TOrigamSelectionControlGroup` | `OrigamSelectionControlGroup` | `SelectionControl/selection-control-group.type.ts` |
| `TOrigamSheet` | `OrigamSheet` | `Sheet/sheet.type.ts` |
| `TOrigamSkeleton` | `OrigamSkeleton` | `Skeleton/skeleton.type.ts` |
| `TOrigamSlideGroup` | `OrigamSlideGroup` | `Slide/slide-group.type.ts` |
| `TOrigamSliderField` | `OrigamSliderField` | `SliderField/slider-field.type.ts` |
| `TOrigamSliderFieldTrack` | `OrigamSliderFieldTrack` | `SliderField/slider-field-track.type.ts` |
| `TOrigamSnackbar` | `OrigamSnackbar` | `Snackbar/snackbar.type.ts` |
| `TOrigamSnackbarGroup` | `OrigamSnackbarGroup` | `Snackbar/snackbar-group.type.ts` |
| `TOrigamStepper` | `OrigamStepper` | `Stepper/stepper.type.ts` |
| `TOrigamStepperItem` | `OrigamStepperItem` | `Stepper/stepper.type.ts` |
| `TOrigamSwitch` | `OrigamSwitch` | `Switch/switch.type.ts` |
| `TOrigamSwitchTrack` | `OrigamSwitchTrack` | `Switch/switch-track.type.ts` |
| `TOrigamSystemBar` | `OrigamSystemBar` | `SystemBar/system-bar.type.ts` |
| `TOrigamTable` | `OrigamTable` | `Table/table.type.ts` |
| `TOrigamTabs` | `OrigamTabs` | `Tabs/tabs.type.ts` |
| `TOrigamTextMask` | `OrigamTextMask` | `TextMask/text-mask.type.ts` |
| `TOrigamTimeline` | `OrigamTimeline` | `Timeline/timeline.type.ts` |
| `TOrigamTimelineItem` | `OrigamTimelineItem` | `Timeline/timeline.type.ts` |
| `TOrigamTitle` | `OrigamTitle` | `Title/title.type.ts` |
| `TOrigamToolbar` | `OrigamToolbar` | `Toolbar/toolbar.type.ts` |
| `TOrigamTooltip` | `OrigamTooltip` | `Tooltip/tooltip.type.ts` |
| `TOrigamTransition` | `OrigamTransition` | `Transition/transition.type.ts` |
| `TOrigamExpandX` | `OrigamExpandX` | `Transition/expand-x.type.ts` |
| `TOrigamFade` | `OrigamFade` | `Transition/fade.type.ts` |
| `TOrigamTreeview` | `OrigamTreeview` | `Treeview/treeview.type.ts` |
| `TOrigamTreeviewNode` | `OrigamTreeviewNode` | `Treeview/treeview.type.ts` |
| `TOrigamVirtualScroll` | `OrigamVirtualScroll` | `VirtualScroll/virtual-scroll.type.ts` |
| `TOrigamVirtualScrollItem` | `OrigamVirtualScrollItem` | `VirtualScroll/virtual-scroll-item.type.ts` |
| `TOrigamWindow` | `OrigamWindow` | `Window/window.type.ts` |
| `TOrigamWindowItem` | `OrigamWindowItem` | `Window/window-item.type.ts` |

---

### Audio

| Type | Union résolue | Fichier |
|---|---|---|
| `TAudioControls` | `'custom' \| 'native'` | `Audio/audio-controls.type.ts` |
| `TAudioLoopMode` | `'none' \| 'all' \| 'one'` | `Audio/audio-loop-mode.type.ts` |
| `TAudioVariant` | `'expanded' \| 'compact' \| 'normal' \| 'minimal'` | `Audio/audio-variant.type.ts` |
| `TCoverPosition` | `'left' \| 'right'` | `Audio/cover-position.type.ts` |

`TAudioVariant` : `normal` et `minimal` sont des alias dépréciés de `expanded` et `compact` (même valeur runtime, conservés pour la rétrocompatibilité v0.x).

---

### Blockquote

| Type | Union résolue | Fichier |
|---|---|---|
| `TBlockquoteAlign` | `'left' \| 'center' \| 'right'` | `Blockquote/blockquote-align.type.ts` |
| `TBlockquoteLang` | `'fr' \| 'en' \| 'es' \| 'de' \| 'auto'` | `Blockquote/blockquote-lang.type.ts` |
| `TBlockquoteVariant` | `'default' \| 'elegant' \| 'quoted' \| 'minimal' \| 'pull'` | `Blockquote/blockquote-variant.type.ts` |

---

### Bracket (tournois)

| Type | Union résolue | Fichier |
|---|---|---|
| `TBracketDirection` | alias de `TDirection` = `'horizontal' \| 'vertical'` | `Bracket/bracket-direction.type.ts` |
| `TBracketMatchStatus` | `'pending' \| 'live' \| 'completed' \| 'forfeited'` | `Bracket/bracket-match-status.type.ts` |
| `TBracketRoundSide` | `'winner' \| 'loser' \| 'grand-final'` | `Bracket/bracket-round-side.type.ts` |
| `TBracketVariant` | `'single-elimination' \| 'double-elimination' \| 'round-robin'` | `Bracket/bracket-variant.type.ts` |

---

### Breadcrumb

- `TBreadcrumbItem` (dans `Breadcrumb/breadcrumb.type.ts`) :
  ```ts
  export type TBreadcrumbItem = string | Partial<IBreadcrumbItemProps> | never
  ```
  Item d'un Breadcrumb : soit une string (URL ou label), soit un objet partiel de props.

---

### Calendar

| Type | Union / définition | Fichier |
|---|---|---|
| `TCalendarTimeFormat` | `'12h' \| '24h'` | `Calendar/calendar-time-format.type.ts` |
| `TCalendarNavigate` | `'prev' \| 'next' \| 'today'` | `Calendar/calendar-time-format.type.ts` |
| `TCalendarView` | `'month' \| 'week' \| 'day' \| 'agenda'` | `Calendar/calendar-view.type.ts` |

---

### Card

- `TCardType` (dans `Card/card.type.ts`) :
  ```ts
  export type TCardType = `${CARD_TYPE}`
  // CARD_TYPE = { GRID='grid', LIST='list' }
  ```
  Union résolue : `'grid' | 'list'`. Détermine le layout de présentation des cartes dans une galerie.

---

### Chart (visualisations)

| Type | Union résolue | Fichier |
|---|---|---|
| `TChartType` | `'line' \| 'area' \| 'bar' \| 'column' \| 'pie' \| 'donut' \| 'scatter' \| 'radar' \| 'spline' \| 'stepped-line' \| 'gauge' \| 'pyramid' \| 'funnel' \| 'honeycomb' \| 'treemap' \| 'sankey' \| 'word-cloud' \| 'heatmap' \| 'sunburst' \| 'box-plot' \| 'pictorial' \| 'candlestick' \| 'streamgraph' \| 'variwide' \| 'polar-bar' \| 'bullet' \| 'pareto' \| 'map' \| 'sparkline'` | `Chart/chart-type.type.ts` |
| `TChartCartesianKind` | `'line' \| 'area' \| 'bar' \| 'column' \| 'scatter' \| 'spline' \| 'stepped-line'` | `Chart/chart-cartesian-kind.type.ts` |
| `TChartPolarKind` | `'pie' \| 'donut'` | `Chart/chart-polar-kind.type.ts` |
| `TChartItem` | `string \| number \| { value: number }` | `Chart/chart-item.type.ts` |
| `TChartStacking` | `'normal' \| 'percent'` | `Chart/chart-stacking.type.ts` |
| `TChartSmoothing` | `'none' \| 'curve' \| 'monotone'` | `Chart/chart-smoothing.type.ts` |
| `TChartLegendPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `Chart/chart-legend-position.type.ts` |
| `TChartSparklineKind` | `'line' \| 'area' \| 'column' \| 'bar'` | `Chart/chart-sparkline-kind.type.ts` |
| `TChartBulletOrientation` | `'horizontal' \| 'vertical'` | `Chart/chart-bullet-orientation.type.ts` |
| `TChartHoneycombColorMode` | `'categorical' \| 'heatmap'` | `Chart/chart-honeycomb-color-mode.type.ts` |
| `TChartHoneycombOrientation` | `'pointy-top' \| 'flat-top'` | `Chart/chart-honeycomb-orientation.type.ts` |
| `TChartMapMode` | `'choropleth' \| 'flight-routes'` | `Chart/chart-map-mode.type.ts` |
| `TChartPictorialDirection` | `'vertical' \| 'horizontal'` | `Chart/chart-pictorial-direction.type.ts` |
| `TChartPictorialMode` | `'stack' \| 'fill'` | `Chart/chart-pictorial-mode.type.ts` |
| `TChartPyramidKind` | `'pyramid' \| 'funnel'` | `Chart/chart-pyramid-kind.type.ts` |
| `TChartTreemapAlgorithm` | `'squarified' \| 'slice-dice'` | `Chart/chart-treemap-algorithm.type.ts` |
| `TChartStreamgraphOffset` | `'wiggle' \| 'silhouette' \| 'expand' \| 'zero'` | `Chart/chart-streamgraph-offset.type.ts` |
| `TChartWordCloudRotation` | `'none' \| 'random' \| 'orthogonal'` | `Chart/chart-word-cloud-rotation.type.ts` |

---

### Code

| Type | Union résolue | Fichier |
|---|---|---|
| `TCodeLang` | `'plaintext' \| 'vue' \| 'ts' \| 'js' \| 'tsx' \| 'jsx' \| 'scss' \| 'css' \| 'json' \| 'bash' \| 'html' \| 'xml' \| 'yaml' \| 'md'` | `Code/code-lang.type.ts` |
| `TCodeTheme` | `'auto' \| 'light' \| 'dark'` | `Code/code-theme.type.ts` |

---

### ColorPicker

- `TColorModes` (dans `ColorPicker/color-picker.type.ts`) :
  ```ts
  export type TColorModes = `${COLOR_MODES_NAMES}`
  // COLOR_MODES_NAMES = { RGB='rgb', RGBA='rgba', HSL='hsl', HSLA='hsla', HEX='hex', HEXA='hexa' }
  ```
  Union résolue : `'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hex' | 'hexa'`

---

### CommandPalette

- `TCommandPaletteHotkeyCombination` (dans `CommandPalette/command-palette-hotkey.type.ts`) :
  ```ts
  export type TCommandPaletteHotkeyCombination = ReadonlyArray<string>
  ```
  Tableau readonly de tokens de touches (ex. `['meta', 'k']`).

---

### DataTable

| Type | Définition / Union | Fichier |
|---|---|---|
| `TDataTableSelectStrategy` | `'single' \| 'page' \| 'all'` | `DataTable/data-table.type.ts` |
| `TDataTableCompareFunction<T>` | `(a: T, b: T) => number \| null` | `DataTable/data-table.type.ts` |
| `TDataTableHeaderCell` | `Record<string, any> \| ((data: ...) => Record<string, any>)` | `DataTable/data-table.type.ts` |
| `TDataTableRow<T>` | `Record<string, any> \| ((data: ...) => Record<string, any>)` | `DataTable/data-table.type.ts` |
| `TDataTableCell<T>` | `Record<string, any> \| ((data: ...) => Record<string, any>)` | `DataTable/data-table.type.ts` |

---

### DatePicker

- `TDateMode` (dans `DatePicker/date-picker.type.ts`) :
  ```ts
  export type TDateMode = `${DATE_MODE}`
  // DATE_MODE = { MONTH='month', MONTHS='months', YEARS='years' }
  ```
  Union résolue : `'month' | 'months' | 'years'`. Détermine quelle vue du picker est active.

---

### EmptyState

| Type | Union résolue | Fichier |
|---|---|---|
| `TEmptyStateAlign` | `'center' \| 'left'` | `EmptyState/empty-state-align.type.ts` |
| `TEmptyStatePreset` | `'no-data' \| 'no-results' \| 'error' \| 'offline' \| 'locked'` | `EmptyState/empty-state-preset.type.ts` |
| `TEmptyStateSize` | `'sm' \| 'md' \| 'lg'` | `EmptyState/empty-state-size.type.ts` |

---

### Grid / Grids

| Type | Union / définition | Fichier |
|---|---|---|
| `TGridPlaceItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | `Grid/grid-align.type.ts` |
| `TGridPlaceContent` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `Grid/grid-align.type.ts` |
| `TGridPlaceSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | `Grid/grid-align.type.ts` |
| `TGridGapSize` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `Grid/grid-align.type.ts` |
| `TGridAutoFlow` | `'row' \| 'column' \| 'row dense' \| 'column dense'` | `Grid/grid-flow.type.ts` |
| `TCols` | `` `${COLS}` \| true \| 'auto' `` soit `'1'...'12' \| true \| 'auto'` | `Grids/col.type.ts` |
| `TFlexDirection` | `'row' \| 'column' \| 'column-reverse' \| 'row-reverse'` | `Grids/row.type.ts` |

---

### Icon

- `TIcon` (dans `Icon/icon.type.ts`) :
  ```ts
  export type TIcon =
    | string
    | Array<(string | [path: string, opacity: number])>
    | Component
  ```
  Valeur acceptée par le prop `icon`. Peut être un nom d'icône string, un tableau de paths SVG avec opacité, ou un composant Vue.

- `TIconOptions` : configuration du plugin d'icônes (`defaultSet`, `aliases`, `sets`).
- `TIconInstance` : forme résolue en runtime (`component + icon`).
- `TIconComponent` : alias `Component<IIconProps>`.

---

### Img

| Type | Union résolue | Fichier |
|---|---|---|
| `TCrossOrigin` | `'anonymous' \| 'use-credentials' \| ''` | `Img/img.type.ts` |
| `TReferrerPolicy` | `'no-referrer' \| 'no-referrer-when-downgrade' \| 'origin' \| 'origin-when-cross-origin' \| 'same-origin' \| 'strict-origin' \| 'strict-origin-when-cross-origin' \| 'unsafe-url'` | `Img/img.type.ts` |
| `TImgState` | `'idle' \| 'loading' \| 'loaded' \| 'error'` | `Img/img.type.ts` |

---

### InfiniteScroll

| Type | Union résolue | Fichier |
|---|---|---|
| `TInfiniteScrollSide` | `'start' \| 'end' \| 'both'` | `InfiniteScroll/infinite-scroll.type.ts` |
| `TInfiniteScrollMode` | `'intersect' \| 'manual'` | `InfiniteScroll/infinite-scroll.type.ts` |
| `TInfiniteScrollStatus` | `'ok' \| 'empty' \| 'loading' \| 'error'` | `InfiniteScroll/infinite-scroll.type.ts` |

---

### InlineEdit

- `TInlineEditInputType` : `'text' | 'number' | 'email' | 'tel'`

---

### Kbd

- `TKbdVariant` (dans `Kbd/kbd.type.ts`) : `'filled' | 'outlined' | 'tonal'`

---

### List

| Type | Union / définition | Fichier |
|---|---|---|
| `TLines` | `'one' \| 'two' \| 'three'` | `List/list.type.ts` |
| `TListItemType` | `'item' \| 'subheader' \| 'divider'` | `List/list-item.type.ts` |
| `TListItemSlot` | `{ isActive, isSelected, isIndeterminate, select }` | `List/list-item.type.ts` |

---

### Mask

| Type | Définition | Fichier |
|---|---|---|
| `TBuiltInPattern` | `typeof BUILT_IN_PATTERN[keyof typeof BUILT_IN_PATTERN]` = `'phone:fr' \| 'phone:us' \| 'phone:international' \| 'iban' \| 'siret' \| 'creditcard' \| 'date:iso' \| 'date:fr' \| 'date:us' \| 'time' \| 'time:12h' \| 'postcode:fr' \| 'postcode:us'` | `Mask/built-in-pattern.type.ts` |
| `TMask` | `TBuiltInPattern \| string \| IMaskOptions \| null` | `Mask/mask.type.ts` |
| `TMaskTokenKind` | `'digit' \| 'letter' \| 'any' \| 'literal'` | `Mask/mask.type.ts` |
| `TPatternValidatorName` | `typeof PATTERN_VALIDATOR[keyof typeof PATTERN_VALIDATOR]` = `'luhn' \| 'iban' \| 'date:iso' \| 'date:fr' \| 'date:us'` | `Mask/pattern-validator.type.ts` |
| `TPatternValidatorFn` | `(unmasked: string) => boolean` | `Mask/pattern-validator.type.ts` |
| `TPatternValidator` | `TPatternValidatorName \| TPatternValidatorFn` | `Mask/pattern-validator.type.ts` |

Note : `BUILT_IN_PATTERN` et `PATTERN_VALIDATOR` sont des `const` (non des `enum`), ce qui explique le pattern `typeof X[keyof typeof X]` pour extraire l'union des valeurs.

---

### Masonry

- `TMasonryAlign` : `'top' | 'center'`

---

### Media

| Type | Union résolue | Fichier |
|---|---|---|
| `TMediaScrubberOrientation` | `'horizontal' \| 'vertical'` | `Media/media-scrubber-orientation.type.ts` |
| `TQualityOption` | `{ quality: string, label: string, src?: string, type?: string }` | `Media/quality-option.type.ts` |

---

### NumberFormat

| Type | Union / définition | Fichier |
|---|---|---|
| `TNumberFormatFormat` | `'decimal' \| 'currency' \| 'percent' \| 'unit' \| 'compact' \| 'scientific' \| 'engineering'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatCurrencyDisplay` | `'symbol' \| 'narrowSymbol' \| 'code' \| 'name'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatUnitDisplay` | `'short' \| 'long' \| 'narrow'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatCompactDisplay` | `'short' \| 'long'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatNotation` | `'standard' \| 'compact' \| 'scientific' \| 'engineering'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatSignDisplay` | `'auto' \| 'always' \| 'except-zero' \| 'negative' \| 'never'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatUseGrouping` | `boolean \| 'always' \| 'auto' \| 'min2'` | `NumberFormat/number-format-format.type.ts` |
| `TNumberFormatLocale` | `string \| string[]` | `NumberFormat/number-format-format.type.ts` |

---

### OtpInputField

- `TOtpInputFieldType` : `'text' | 'number' | 'password'`

---

### Parallax

| Type | Union résolue | Fichier |
|---|---|---|
| `TParallaxDirection` | `'vertical' \| 'horizontal' \| 'both'` | `Parallax/parallax-direction.type.ts` |
| `TParallaxEasing` | `'linear' \| 'ease-out' \| 'spring'` | `Parallax/parallax-easing.type.ts` |
| `TParallaxElementType` | `'scale' \| 'scaleX' \| 'scaleY' \| 'translate' \| 'rotate' \| 'depth' \| 'depth_inv' \| 'custom'` | `Parallax/parallax-element.type.ts` |
| `TParallaxEvent` | `'move' \| 'scroll' \| 'orientation'` | `Parallax/parallax.type.ts` |

---

### PasswordField

| Type | Union / définition | Fichier |
|---|---|---|
| `TPasswordStrengthLevel` | `'weak' \| 'fair' \| 'good' \| 'strong'` | `PasswordField/password-strength.type.ts` |
| `TPasswordStrengthScore` | `0 \| 1 \| 2 \| 3 \| 4` | `PasswordField/password-strength.type.ts` |

`TPasswordStrengthLevel` double comme modificateur CSS (`origam-password-field__strength-segment--{level}`) et comme clé de token.

---

### Progress

- `TProgressType` : `'circular' | 'linear'`

---

### QrCode

- `TQrCodeErrorCorrectionLevel` : `'L' | 'M' | 'Q' | 'H'` (niveaux ISO/IEC 18004 Reed-Solomon, de ~7% a ~30% de redondance).

---

### Sheet

| Type | Définition | Fichier |
|---|---|---|
| `TSheetSnapId` | `'closed' \| 'peek' \| 'half' \| 'full' \| (string & {})` | `Sheet/sheet-snap-point.type.ts` |
| `TSheetSnapPoint` | `{ id: TSheetSnapId, height: number \| string }` | `Sheet/sheet-snap-point.type.ts` |

`TSheetSnapId` utilise le pattern `| (string & {})` pour accepter des identifiants custom tout en conservant l'autocomplétion sur les valeurs connues.

---

### Skeleton

- `TSkeletonVariant` : `'text' | 'rectangular' | 'circular' | 'card' | 'list-item'`

---

### SliderField

| Type | Union / définition | Fichier |
|---|---|---|
| `TSliderFieldVariant` | `'field' \| 'timer' \| 'audio'` | `SliderField/slider-field-variant.type.ts` |
| `TAlways` | `boolean \| 'always'` | `SliderField/slider-field.type.ts` |
| `TSliderData` | `{ value: number }` | `SliderField/slider-field.type.ts` |
| `TTick` | `{ value: number, position: number, label?: string }` | `SliderField/slider-field.type.ts` |

---

### Snackbar

| Type | Union résolue | Fichier |
|---|---|---|
| `TSnackbarGroupDirection` | `'top-down' \| 'bottom-up'` | `Snackbar/snackbar-group-direction.type.ts` |
| `TSnackbarGroupLocation` | `'top-left' \| 'top-right' \| 'top-center' \| 'bottom-left' \| 'bottom-right' \| 'bottom-center' \| 'top' \| 'bottom'` | `Snackbar/snackbar-group-location.type.ts` |

---

### Stepper

| Type | Union résolue | Fichier |
|---|---|---|
| `TStepperOrientation` | `'horizontal' \| 'vertical'` | `Stepper/stepper.type.ts` |
| `TStepperItemStatus` | `'pending' \| 'active' \| 'done' \| 'error'` | `Stepper/stepper.type.ts` |

---

### Tabs

- `TTabVariant` : `'default' | 'pills' | 'underline'`

---

### Textarea / TextareaField

| Type | Union résolue | Fichier |
|---|---|---|
| `TTextareaMode` | `'plain' \| 'rich'` | `Textarea/textarea-mode.type.ts` |
| `TTextareaOutput` | `'html' \| 'markdown'` | `Textarea/textarea-output.type.ts` |
| `TTextareaToolbarCommand` | `'bold' \| 'italic' \| 'underline' \| 'link' \| 'list-bullet' \| 'list-ordered' \| 'heading-1' \| 'heading-2' \| 'heading-3' \| 'heading' \| 'code-inline' \| 'clear-format'` | `Textarea/textarea-toolbar-command.type.ts` |
| `TTextareaToolbarPosition` | `'top' \| 'bottom' \| 'floating'` | `Textarea/textarea-toolbar-position.type.ts` |

---

### TextMask

- `TTextMaskAnimation` : `'pan' | 'rotate' | 'pulse' | 'zoom'`

---

### Theme

| Type | Définition | Fichier |
|---|---|---|
| `TTheme` | `'auto' \| 'light' \| 'dark' \| (string & {})` | `Theme/theme.type.ts` |
| `TThemeResolved` | `Exclude<TTheme, 'auto'>` = `'light' \| 'dark' \| (string & {})` | `Theme/theme.type.ts` |
| `TMode` | `'auto' \| 'light' \| 'dark'` | `Theme/theme.type.ts` |
| `TModeResolved` | `Exclude<TMode, 'auto'>` = `'light' \| 'dark'` | `Theme/theme.type.ts` |
| `TInstalledTheme` | `{ name: string, modes: TModeResolved[], label: string, description?: string, swatch?: string }` | `Theme/installed-theme.type.ts` |
| `TInstalledThemes` | `TInstalledTheme[]` | `Theme/installed-theme.type.ts` |
| `TSemanticLeaf` | `string \| number` | `Theme/semantic-tree.type.ts` |
| `TThemeVars` | `Record<string, string \| number>` | `Theme/token-tree.type.ts` |

Note : `TInstalledTheme` est nommé avec le mot-clé `interface` dans le code source (`export interface TInstalledTheme`) mais suit la convention `T` du projet (décision délibérée, pas un `I` car ce n'est pas une interface de props).

---

### Timeline

| Type | Union résolue | Fichier |
|---|---|---|
| `TTimelineSide` | `'start' \| 'end' \| 'alternating'` | `Timeline/timeline.type.ts` |
| `TTimelineOrientation` | `'vertical' \| 'horizontal'` | `Timeline/timeline.type.ts` |

---

### Toolbar

- `TScrollBehavior` : `'hide' | 'inverted' | 'collapse' | 'elevate'`

---

### Transition

| Type | Union / définition | Fichier |
|---|---|---|
| `TTransitionMode` | `'in-out' \| 'out-in' \| 'default'` | `Transition/transition.type.ts` |
| `TTransitionProps` | `TransitionProps & { component?: Component }` | `Transition/transition.type.ts` |

Les autres fichiers `Transition/` (expand-x, expand-y, fade, scale-rotate, slide-x, slide-y, snack, translate-bottom, translate-scale, window-x-translate, etc.) ne contiennent que des aliases `InstanceType`.

---

### Treeview

| Type | Union résolue | Fichier |
|---|---|---|
| `TTreeviewSelectMode` | `'single' \| 'multiple' \| 'none'` | `Treeview/treeview.type.ts` |
| `TTreeviewSelectableNodes` | `'leaf' \| 'all'` | `Treeview/treeview.type.ts` |

---

### Video

| Type | Union résolue | Fichier |
|---|---|---|
| `TVideoControls` | `'custom' \| 'native' \| 'none'` | `Video/video-controls.type.ts` |
| `TVideoTrackKind` | `'captions' \| 'subtitles' \| 'descriptions' \| 'chapters'` | `Video/video-track-kind.type.ts` |

---

### `TTokenName`

- **Fichier** : `types/tokens.type.ts`
- **Définition** : union auto-générée de toutes les variables CSS `--origam-*` déclarées dans les tokens du DS. Contient 2909 lignes de code source. Produit par `pnpm -F origam tokens:build`.
- **Rôle / sémantique** : Permet un typage strict des overrides de tokens CSS au niveau du composant. Les IDE proposent ainsi l'autocomplétion sur tous les tokens publics.
- **Utilisé par** : API d'override CSS, consumers qui veulent un typage fort sur les variables CSS.

---

## Tableau récapitulatif — Types Commons et leurs consommateurs

| Type Commons | Composable principal | Interfaces | Composants / Domaines |
|---|---|---|---|
| `TIntent` | `useColorEffect`, `useBackgroundColor` | `IColorProps` | Btn, Chip, Alert, Badge, Avatar, EmptyState |
| `TSize` | `useSize` | `ISizeProps` | Btn, Chip, Avatar, Icon, Progress, Badge |
| `TDensity` | `useDensity` | `IDensityProps` | Btn, Chip, List, BottomNav, DataTable, AvatarGroup |
| `TRounded` | `useRounded` | `IRoundedProps` | Btn, Card, Chip, Alert, Avatar, Badge, Field, Sheet, Tooltip |
| `TVariant` | `useVariant` | `IVariantProps` | Btn, Card, Chip, Alert, ListItem |
| `TVariantInput` | — | `IVariantInputProps` | TextField, NumberField, PasswordField, Select |
| `TAlign` | — | `IAlignProps` | Row, Grid, DataTable headers |
| `TJustify` | — | `IJustifyProps` | Row, Grid, DataTable |
| `TDirection` | — | `IDirectionProps` | Divider, Stepper, Timeline, SliderField, Toolbar |
| `TPosition` | `usePosition` | `IPositionProps` | AppBar, Toolbar, Drawer, SystemBar |
| `TLocationStrategy` | `useLocationStrategies` | `ILocationStrategyProps` | Overlay, Menu, Tooltip, Dialog |
| `TScrollStrategy` | `useScrollStrategies` | `IScrollStrategyProps` | Overlay, Menu |
| `TColor` | `useColor`, `useColorEffect` | `IColorProps` | Tous composants colorisables |
| `TBreakpoint` | `useDisplay` | `IDisplayProps` | Grids (Col, Row), Responsive |
| `TLoadingValue` | `useLoader` | `ILoaderProps` | Btn, Card, DataTable, Img |
| `TVModel` | `useProxiedModel` | — | Tous composants a v-model |
| `TValidateOn` | `useForm` | `IValidationProps` | Form, TextField, Select, Checkbox |
| `TSelectStrategy` | `useNested` | — | List, Treeview, ExpansionPanels, DataTable |
| `TOpenStrategy` | `useNested` | — | List, Treeview, ExpansionPanels |
| `TSortDirection` | `useDataTableSorted` | `ISortItem` | DataTable |
| `TStatus` | — | `IStatusProps` | Field, Input |
| `TBorderStyle` | `useBorder` | `IBorderProps` | Tous composants avec bordure |
| `TAnchor` | `parseAnchor` | `ILocationStrategyProps` | Menu, Tooltip, Overlay |
| `TKeyboardModifiers` | `useHotkey` | `IHotkeyProps` | CommandPalette, Kbd |
| `TFilterMode` | `useFilter` | `IFilterableProps` | DataTable, Select |
