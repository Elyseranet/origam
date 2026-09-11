## Composants Layout & Structure

Ce document couvre les composants qui forment la **colonne vertébrale structurelle** d'une application ou d'une page construite avec origam. Ils se divisent en quatre familles :

1. **Conteneurs racines** (`OrigamApp`, `OrigamLayout`, `OrigamMain`) — définissent le cadre applicatif et l'algorithme de push-content qui déplace `main` quand un drawer ou un system-bar est présent.
2. **Primitives de mise en page** (`OrigamGrid` / `OrigamGridItem`, `OrigamContainer` / `OrigamRow` / `OrigamCol` / `OrigamSpacer`, `OrigamMasonry`, `OrigamResponsive`) — toutes CSS-first, aucun JS de mesure sauf `OrigamMasonry` en mode de repli.
3. **Surfaces** (`OrigamSheet`, `OrigamCard` / `OrigamCardHeader` / `OrigamCardText`, `OrigamDivider`) — fournissent l'élévation, la bordure, les coins arrondis, la densité et les états hover / active.
4. **Chrome applicatif** (`OrigamSystemBar`, `OrigamToolbar`, `OrigamAppBar`, `OrigamWatermark`, `OrigamParallax` / `OrigamParallaxLayer` / `OrigamParallaxElement`) — barres de navigation, décors visuels et effets de défilement.

`OrigamSection` est un stub WIP sans implémentation fonctionnelle.

---

### `OrigamApp`

- **Fichiers** : `packages/ds/src/components/App/OrigamApp.vue`
- **Rôle / utilité** : Point d'entrée racine d'une application origam. Il délègue immédiatement à `OrigamLayout` tout en appliquant deux couches supplémentaires : la classe `.origam-app` et les classes RTL fournies par `useRtl`. Par convention, `fullHeight: true` est la valeur par défaut (la seule prop surchargée par rapport à `ILayoutProps`), ce qui force le layout à occuper `100vw × 100vh`. Il est conçu pour être l'unique descendant de `<body>` ou du `<div id="app">` racine.

- **Entrées (props)** : Toutes les props de `ILayoutProps` (via `withDefaults(…, {fullHeight: true})`) :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `IDimensionProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`, `IBorderProps`.
  - `overlaps` — `Array<string>` — `undefined` — identifiants de layout items à "chevaucher" (ne pas décaler).
  - `fullHeight` — `boolean` — `true` — force le mode `100vw × 100vh` sur le layout interne.

- **Sorties** :
  - Pas d'emits.
  - Slot `default` — contenu de l'application (drawers, barres, `OrigamMain`…).
  - Classes émises : `.origam-app` + classes RTL (`origam-rtl` / `origam-ltr`).
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded` (tous hérités de `useStyle`).

- **Dépendances** :
  - Composant consommé : `OrigamLayout`.
  - Composables : `useProps`, `useRtl`, `useStyle`.
  - Interface : `ILayoutProps`, type `TOrigamApp`.

- **Comportement notable** :
  - Aucune logique propre — c'est un alias de `OrigamLayout` avec `fullHeight=true` et les classes RTL. La séparation entre `OrigamApp` et `OrigamLayout` permet d'utiliser `OrigamLayout` sans semantique "app" (dashboards embarqués, sous-sections en mode pleine-page).
  - Le mode `fullHeight` positionne le wrapper interne en `100vw × 100vh` — sans lui, les drawers internes ne peuvent pas calculer `height: 100%`.

- **Exemple d'usage** :
```vue
<origam-app>
  <origam-app-bar title="Mon application"/>
  <origam-main>
    <p>Contenu principal</p>
  </origam-main>
</origam-app>
```

---

### `OrigamLayout`

- **Fichiers** : `packages/ds/src/components/Layout/OrigamLayout.vue`
- **Rôle / utilité** : Conteneur racine de l'algorithme de **push-content** origam. Il orchestre la registration / déregistration des items de layout (AppBar, Drawer, SystemBar, BottomNav…) via `useCreateLayout`. Les CSS custom properties `--origam-layout---position-{left,right,top,bottom}` qu'il émet sont consommées par `OrigamMain` (et la Toolbar) pour s'auto-décaler sans aucune logique JS.

- **Entrées (props)** : `ILayoutProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `IDimensionProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`, `IBorderProps`.
  - `overlaps` — `Array<string>` — `undefined` — items à chevaucher sans décaler.
  - `fullHeight` — `boolean` — `false` — passage en `100vw × 100vh` (utilisé par `OrigamApp`).

- **Sorties** :
  - Pas d'emits.
  - Slot `default`.
  - Expose : `getLayoutItem`, `items`, `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.
  - Classes BEM : `.origam-layout`, `.origam-layout--full-height` (quand `fullHeight=true`).
  - Styles inline : les 4 CSS custom props `--origam-layout---position-*` + toutes les sorties de `useDimension`, `usePadding`, `useMargin`, `useBorder`, `useRounded`, `useElevation`, `useBothColor`.

- **Dépendances** :
  - Composables : `useCreateLayout`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin`, `useProps`, `useStyle`.
  - Interface : `ILayoutProps` (définie dans `interfaces/Commons/layout.interface.ts`).

- **Comportement notable** :
  - `position: relative` sur `.origam-layout` fait de lui le **bloc contenant** de tous les descendants `position: absolute/fixed` (drawers, scrims). Sans cela, `height: 100%` sur un drawer se résout par rapport au viewport et déborde.
  - `.origam-layout__wrapper` a `height: 100%; max-height: 100%` pour que les drawers imbriqués mesurent leur hauteur contre le wrapper, pas le viewport.
  - En mode `fullHeight`, le wrapper monte à `100vw × 100vh`.
  - Les `layoutStyles` produits par `useCreateLayout` contiennent les 4 CSS custom props de réservation d'espace. Sans elles, `OrigamMain` et la Toolbar s'afficheraient sous l'AppBar.

- **Exemple d'usage** :
```vue
<origam-layout full-height>
  <origam-system-bar/>
  <origam-app-bar title="Dashboard"/>
  <origam-main>…</origam-main>
</origam-layout>
```

---

### `OrigamMain`

- **Fichiers** : `packages/ds/src/components/Main/OrigamMain.vue`
- **Rôle / utilité** : Zone de contenu principal d'un layout origam. Il lit les CSS custom props `--origam-layout---position-{left,right,top,bottom}` et les mappe sur ses `padding-inline-start/end` / `padding-block-start/end` pour s'auto-décaler des items de layout voisins (drawer permanent, AppBar, SystemBar). Rend nativement l'élément `<main>` (défaut) pour la sémantique HTML.

- **Entrées (props)** : `IMainProps` :
  - Interfaces Commons étendues : `ITagProps`, `ICommonsComponentProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IDimensionProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`.
  - `scrollable` — `boolean` — `undefined` — active le mode scroll interne (full-size absolute + overflow-y auto sur `__scroller`).
  - `tag` — `string` — `'main'` — élément HTML de rendu.

- **Sorties** :
  - Pas d'emits.
  - Slot `default`.
  - Classes : `.origam-main`, `.origam-main--scrollable` (quand `scrollable=true`), + classes de couleur, élévation, border, rounded, padding, margin.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

- **Dépendances** :
  - Composables : `useLayout`, `useSsrBoot`, `useBothColor`, `useElevation`, `useRounded`, `useBorder`, `usePadding`, `useMargin`, `useProps`, `useStyle`.
  - Interface : `IMainProps`.

- **Comportement notable** :
  - En mode `scrollable`, le composant devient `position: absolute; inset: 0` et son enfant `.origam-main__scroller` prend `overflow-y: auto; flex: 1 1 auto`. Les CSS custom props de position du layout sont réinitialisées à `0px` dans ce scope pour éviter le double-décalage.
  - `useSsrBoot` injecte des styles de "boot" qui masquent les artefacts pendant la phase d'hydratation SSR.
  - Les tokens CSS lus : `--origam-main---flex`, `--origam-main---max-width`, `--origam-main---transition-*`, `--origam-main---display`, `--origam-main---position`, `--origam-main---width`, `--origam-main---height`.

- **Exemple d'usage** :
```vue
<origam-main scrollable>
  <long-content/>
</origam-main>
```

---

### `OrigamSection`

- **Fichiers** : `packages/ds/src/components/Section/OrigamSection.vue`
- **Rôle / utilité** : **WIP — stub non implémenté.** Le fichier ne contient qu'un `<div class="origam-section">` vide et un commentaire `// TODO - WIP`. Aucune prop, aucun emit, aucun slot, aucune logique. Ne pas utiliser en production.

---

### `OrigamSheet`

- **Fichiers** : `packages/ds/src/components/Sheet/OrigamSheet.vue`
- **Rôle / utilité** : Surface polymorphe de bas niveau, base de `OrigamDialog`, `OrigamPicker`, `OrigamColorPickerField`, etc. Il fournit toutes les axes visuels (couleur, bordure, rayon, élévation, dimensions, position, espacement) et supporte optionnellement un **geste de swipe** bottom-sheet avec snap-points (activé par `swipeable + side="bottom"`).

- **Entrées (props)** : `ISheetProps` :
  - Interfaces Commons étendues : `ITagProps`, `ICommonsComponentProps`, `IPaddingProps`, `IMarginProps`, `IColorProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IDimensionProps`, `ILocationProps`, `IPositionProps`, `IActiveProps`, `IHoverProps`.
  - `side` — `TDirectionBoth` — `undefined` — côté d'ancrage (`'bottom'` active le geste swipe).
  - `swipeable` — `boolean` — `false` — active le mode bottom-sheet draggable.
  - `snapPoints` — `ReadonlyArray<TSheetSnapPoint>` — `[{id:'closed',height:0},{id:'peek',height:'120px'},{id:'half',height:'50vh'},{id:'full',height:'90vh'}]` — points d'arrêt.
  - `defaultSnap` — `TSheetSnapId` — `'half'` — snap initial au montage.
  - `open` — `boolean` — `undefined` — v-model:open (`false` → snap `'closed'`).
  - `disabled` — `boolean` — `false` — désactive le geste.
  - `persistent` — `boolean` — `false` — empêche le swipe-down de passer `'closed'` (miroir du `persistent` de Dialog).
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Emits : `update:snap(id: TSheetSnapId)`, `update:open(value: boolean)`.
  - Slot `default`.
  - Classes : `.origam-sheet`, `.origam-sheet--swipeable`, `.origam-sheet--side-bottom`, `.origam-sheet--snap-{id}`, `.origam-sheet--dragging`, + classes couleur, élévation, position, border, rounded, padding, margin, hover, active.
  - Expose : `filterProps`, `snapTo`, `currentSnap`, `isDragging`, `css`, `id`, `load`, `unload`, `isLoaded`.
  - CSS var live : `--origam-sheet---swipe-height` (hauteur courante pendant le drag, en px).

- **Dépendances** :
  - Composables : `useActive`, `useBothColor`, `useDimension`, `useHover`, `useLocation`, `usePosition`, `useProps`, `useSheetSwipe`, `useStateEffect`, `useStyle`.
  - Types : `TSheetSnapId`, `TSheetSnapPoint`, `TDirectionBoth`.
  - Interfaces : `ISheetProps`, `ISheetEmits`.

- **Comportement notable** :
  - `useStateEffect` gère les 8 axes visuels en mode state-aware (hover + active). Les surcharges `:hover="{border:'thick'}"` et `:active="{bgColor:'success'}"` fonctionnent.
  - En mode swipeable, la hauteur effective est pilotée par `--origam-sheet---swipe-height` (JS injecte la valeur live en px pendant le drag). Hors drag, une `transition: height 200ms ease` lisse le snap. Pendant le drag, la transition est coupée (`transition: none`).
  - Le handle (`.origam-sheet__handle`) a `role="button"`, `tabindex="0"` et `aria-label="Drag handle"` pour l'accessibilité clavier.
  - La prop `persistent` : un swipe-down rapide snape sur le prochain point non-zéro plutôt que `'closed'`.

- **Exemple d'usage** :
```vue
<origam-sheet
  swipeable
  side="bottom"
  :snap-points="[{id:'closed',height:0},{id:'half',height:'50vh'},{id:'full',height:'90vh'}]"
  default-snap="half"
  v-model:open="isOpen"
  @update:snap="onSnap"
>
  <p>Contenu de la bottom-sheet</p>
</origam-sheet>
```

---

### `OrigamGrid` / `OrigamGridItem`

- **Fichiers** : `packages/ds/src/components/Grid/OrigamGrid.vue`, `packages/ds/src/components/Grid/OrigamGridItem.vue`
- **Rôle / utilité** : Enveloppe déclarative de CSS Grid. `OrigamGrid` est le conteneur ; `OrigamGridItem` positionne un enfant dans la grille. Aucune mesure JS, aucun `ResizeObserver` — CSS Grid est supporté dans tous les navigateurs evergreen depuis 2017.

#### `OrigamGrid`

- **Entrées (props)** : `IGridProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IDimensionProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`, `IBorderProps`.
  - `columns` — `TGridTracks` (number | string | string[]) — `'auto'` — `grid-template-columns`. Un nombre `N` devient `repeat(N, 1fr)`.
  - `rows` — `TGridTracks` — `'auto'` — `grid-template-rows`.
  - `gap` — `TGridGapSize | string | number` — `'md'` — gap biaxial. Tokens `xs/sm/md/lg/xl` → `var(--origam-grid---gap-{token})`.
  - `columnGap` — `TGridGapSize | string | number` — `undefined` — gap inline uniquement.
  - `rowGap` — `TGridGapSize | string | number` — `undefined` — gap block uniquement.
  - `areas` — `string | string[]` — `undefined` — `grid-template-areas`. Un tableau est auto-quoté.
  - `autoFlow` — `TGridAutoFlow` — `'row'` — `grid-auto-flow`.
  - `autoColumns` — `string` — `undefined` — `grid-auto-columns`.
  - `autoRows` — `string` — `undefined` — `grid-auto-rows`.
  - `alignItems` — `TGridPlaceItems` — `'stretch'` — `align-items`.
  - `justifyItems` — `TGridPlaceItems` — `'stretch'` — `justify-items`.
  - `alignContent` — `TGridPlaceContent` — `undefined` — `align-content`.
  - `justifyContent` — `TGridPlaceContent` — `undefined` — `justify-content`.
  - `inline` — `boolean` — `false` — `display: inline-grid`.
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Pas d'emits.
  - Slot `default`.
  - Classes : `.origam-grid`, `.origam-grid--inline` + classes couleur, border, rounded, elevation, padding, margin.
  - Expose : `filterProps`, `columnsCss`, `rowsCss`, `areasCss`, `gapCss`, `columnGapCss`, `rowGapCss`.

#### `OrigamGridItem`

- **Entrées (props)** : `IGridItemProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`.
  - `column` — `IGridLineSpec | string | number` — `undefined` — `grid-column`. Objet `{start, end, span}` ou CSS string.
  - `row` — `IGridLineSpec | string | number` — `undefined` — `grid-row`.
  - `area` — `string` — `undefined` — `grid-area` (prend le dessus sur `column` + `row`).
  - `alignSelf` — `TGridPlaceSelf` — `undefined` — override par item de `align-items`.
  - `justifySelf` — `TGridPlaceSelf` — `undefined` — override par item de `justify-items`.
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Pas d'emits. Slot `default`. Classes : `.origam-grid-item`. Expose : `columnCss`, `rowCss`.

- **Dépendances** : `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin`, `useProps` (Grid). Interface `IGridProps`, `IGridItemProps`, `IGridLineSpec`. Consts : `GRID_GAP_SIZE_VAR`.

- **Comportement notable** :
  - `OrigamGridItem` applique `min-width: 0; min-height: 0` par défaut (règle CSS Grid évitant le débordement du texte dans les cellules).
  - Quand `area` est défini, `column` et `row` sont ignorés (ordre CSS).
  - `{start: 1, span: 4}` est sérialisé en `'1 / span 4'` ; `{start: 1, end: 5}` en `'1 / 5'`.

- **Exemple d'usage** :
```vue
<origam-grid :columns="12" gap="lg" :areas="['header header', 'sidebar main']">
  <origam-grid-item area="header">En-tête</origam-grid-item>
  <origam-grid-item area="sidebar">Nav</origam-grid-item>
  <origam-grid-item area="main">Contenu</origam-grid-item>
</origam-grid>
```

---

### `OrigamContainer` / `OrigamRow` / `OrigamCol` / `OrigamSpacer`

- **Fichiers** : `packages/ds/src/components/Grids/` (4 fichiers)
- **Rôle / utilité** : Système de grille 12 colonnes flexbox — l'alternative "Bootstrap-style" à `OrigamGrid`. `OrigamContainer` centre et contraint la largeur ; `OrigamRow` répartit ses enfants en flexbox ; `OrigamCol` occupe N/12 colonnes (avec breakpoints) ; `OrigamSpacer` consomme l'espace libre (`flex-grow: 1`).

#### `OrigamContainer`

- **Entrées (props)** : `IContainerProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IDimensionProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`.
  - `fluid` — `boolean` — `false` — désactive la `max-width` par breakpoint (passe à `100%`).
  - `fullscreen` — `boolean` — `undefined` — `display: flex; align-items: center; height: 100%; max-width: 100%`.
  - `tag` — `string` — `'div'`.
- Breakpoints intégrés dans le SCSS scoped : `960px → 900px`, `1280px → 1200px`, `1920px → 1800px`, `2560px → 2400px`.
- RTL via `useRtl`. Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

#### `OrigamRow`

- **Entrées (props)** : `IRowProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IColorProps`, `IDensityProps`, `IAlignProps`, `IJustifyProps`.
  - `direction` — `TFlexDirection` — `undefined` — `flex-direction`.
  - `gutters` — `string | number` — `undefined` — (déclaré dans l'interface mais non consumé directement par le SCSS actuel).
  - `density` — `DENSITY` — `DEFAULT` — module la marge négative (compact = -8px, comfortable = +8px).
  - Props de responsive alignment : `align`, `alignSm`, `alignMd`, `alignLg`, `alignXl`, `alignXxl` ; `justify`, `justifySm`, `justifyMd`, `justifyLg`, `justifyXl`, `justifyXxl`.
  - `tag` — `string` — `'div'`.
- Valeurs `align` : `start | end | center | baseline | stretch`. Valeurs `justify` : `start | end | center | space-between | space-around | space-evenly`.

#### `OrigamCol`

- **Entrées (props)** : `IColProps` :
  - Interfaces Commons étendues : `IColorProps`, `IBgColorProps`, `ICommonsComponentProps`, `ITagProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IAlignProps`.
  - `cols` — `TCols` (1–12 | 'auto') — `undefined` — largeur en colonnes sur tous les breakpoints.
  - `sm`, `md`, `lg`, `xl`, `xxl` — `TCols` — `undefined` — largeur par breakpoint.
  - `offset`, `offsetSm/Md/Lg/Xl/Xxl` — `Omit<TCols,'12'>` — `undefined` — décalage en colonnes.
  - `order`, `orderSm/Md/Lg/Xl/Xxl` — `number` — `undefined` — ordre flex.
  - Valeurs spéciales `order` : `'first'` (-9999) / `'last'` (9999).
  - `tag` — `string` — `'div'`.

#### `OrigamSpacer`

- **Entrées (props)** : `ISpacerProps` — seulement `ICommonsComponentProps`, `ITagProps`.
- Le SCSS émet `flex-grow: var(--origam-spacer---flex-grow)` (défaut `1`). Le composant est une aide visuelle dans une `Row` ou une `Toolbar`.

- **Dépendances partagées** : `useBorder`, `useBothColor`, `useDensity`, `useMargin`, `usePadding`, `useProps`, `useRtl` (Container), `useStyle`. Utils : `toKebabCase`.

- **Comportement notable** :
  - `OrigamRow` compense les marges des colonnes avec `margin: calc(-4px + density)`. La variable `--origam-row---density` est surpassée par les modificateurs de densité.
  - Les breakpoints de `OrigamCol` utilisent des media queries dans le SCSS scoped (pas JS). La propriété custom `--origam-col---flex-basis` est recalculée par chaque media query.
  - `OrigamCol--auto` : `flex: 0 0 auto; width: auto`.

- **Exemple d'usage** :
```vue
<origam-container>
  <origam-row align="center" justify="space-between">
    <origam-col cols="12" md="8">Contenu principal</origam-col>
    <origam-col cols="12" md="4">Sidebar</origam-col>
  </origam-row>
</origam-container>
```

---

### `OrigamMasonry`

- **Fichiers** : `packages/ds/src/components/Masonry/OrigamMasonry.vue`
- **Rôle / utilité** : Grille masonry (Pinterest-style) à colonnes variables. Deux chemins d'exécution exclusifs : **CSS-first** (`grid-template-rows: masonry` — détecté via `useCssSupport`) ou **JS bucket-fill** (`useMasonry` + `ResizeObserver`). Le choix est transparent au consommateur. CSS path requiert aussi `align === 'top'`.

- **Entrées (props)** : `IMasonryProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IDimensionProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IElevationProps`, `IBgColorProps`, `IColorProps`, `IBorderProps`.
  - `columns` — `number` — `3` — nombre de colonnes (entier ≥ 1).
  - `columnBreakpoints` — `TMasonryColumnBreakpoints` (`Record<number,number>`) — `undefined` — map `min-width(px) → colonnes`. Container-query based (pas viewport).
  - `gap` — `TGridGapSize | string | number` — `'md'` — espace entre items.
  - `animated` — `boolean` — `true` — transitions CSS sur `transform/top/left/width` (chemin JS) ou `grid-template-columns` (chemin CSS).
  - `align` — `TMasonryAlign` — `'top'` — `'top'` | `'center'`. `'center'` force le chemin JS.
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Pas d'emits.
  - Slot `default` (items masonry, texte whitespace/comments filtrés automatiquement).
  - Classes : `.origam-masonry`, `.origam-masonry--css` / `--js`, `.origam-masonry--animated` + couleur, border, rounded, elevation, padding, margin.
  - CSS vars : `--origam-masonry---resolved-gap`, `--origam-masonry---template-columns` (CSS path), `--origam-masonry---container-height` (JS path).
  - Expose : `filterProps`, `layout`, `relayout`, `useCssPath`, `gapPx`.

- **Dépendances** :
  - Composables : `useMasonry`, `useCssSupport`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin`, `useProps`.
  - Consts : `GRID_GAP_SIZE_VAR`.
  - Types : `TGridGapSize`, `TMasonryAlign`.

- **Comportement notable** :
  - `role="list"` sur le container ; `role="listitem"` sur chaque wrapper d'item (chemin JS seulement). Accessibilité des listes préservée.
  - Chemin JS : les items sont `position: absolute` ; la hauteur du container est pilotée par `--origam-masonry---container-height`. Les items sont masqués (`visibility: hidden`) avant le premier calcul de layout pour éviter le flash.
  - Le gap est résolu deux fois : une fois comme token CSS (pour le rendu), une fois en px numérique (pour l'algo de bucket-fill). La valeur px est lue via `getComputedStyle` au montage et à chaque changement de prop, ce qui honore les overrides de thème.
  - `@media (prefers-reduced-motion: reduce)` coupe toutes les transitions.
  - `columnBreakpoints` utilise un `ResizeObserver` sur le container (pas le viewport).

- **Exemple d'usage** :
```vue
<origam-masonry :columns="3" gap="lg" :column-breakpoints="{600:2, 1200:4}">
  <div v-for="item in items" :key="item.id">{{ item.content }}</div>
</origam-masonry>
```

---

### `OrigamResponsive`

- **Fichiers** : `packages/ds/src/components/Responsive/OrigamResponsive.vue`
- **Rôle / utilité** : Conteneur à ratio d'aspect fixe, base de `OrigamImg` et `OrigamVideo`. Un `__sizer` invisible applique le `padding-block-end` correspondant au ratio choisi, ce qui force la boîte parente à maintenir ses proportions en CSS pur (technique du "aspect-ratio box"). Le contenu est superposé via `margin-inline-start: -100%` sur `__content`.

- **Entrées (props)** : `IResponsiveProps` :
  - Interfaces Commons étendues : `IDimensionProps`, `ICommonsComponentProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`.
  - `aspectRatio` — `string | number` — `undefined` — ratio cible. Un nombre `16/9` ou une string `'16/9'` ou `'16:9'`. Consommé par `useAspectRatio`.
  - `contentClass` — `string` — `undefined` — classe CSS ajoutée au `__content`.
  - `inline` — `boolean` — `undefined` — bascule en `display: inline-block` (modifier `.origam-responsive--inline`).

- **Sorties** :
  - Pas d'emits.
  - Slots : `default` (contenu affiché dans `__content`), `additional` (contenu supplémentaire entre `__sizer` et `__content`, ex: `<OrigamImg>` overlay).
  - Classes : `.origam-responsive`, `.origam-responsive--inline` + rounded, border, padding, margin.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

- **Dépendances** :
  - Composables : `useAspectRatio`, `useBorder`, `useDimension`, `useMargin`, `usePadding`, `useProps`, `useRounded`, `useStyle`.

- **Comportement notable** :
  - La technique du sizer CSS ne nécessite aucun JS de mesure. `useAspectRatio` traduit le prop en `padding-block-end` en pourcentage (ex: `9/16 × 100% = 56.25%`).
  - `__content` utilise `margin-inline-start: -100%` pour se superposer au sizer, ce que la variable `--origam-responsive__sizer---padding-block-end` et la règle `~ #{$this}__content { margin-inline-start: -100% }` assurent sans JS.
  - Pas de couleur (`IColorProps` non étendu) — `OrigamResponsive` est un conteneur neutre.

- **Exemple d'usage** :
```vue
<origam-responsive aspect-ratio="16/9">
  <template #additional>
    <origam-img src="poster.jpg" cover/>
  </template>
  <div class="caption">Légende</div>
</origam-responsive>
```

---

### `OrigamCard` / `OrigamCardHeader` / `OrigamCardText`

- **Fichiers** : `packages/ds/src/components/Card/OrigamCard.vue`, `OrigamCardHeader.vue`, `OrigamCardText.vue`
- **Rôle / utilité** : Surface de contenu la plus riche du design system. `OrigamCard` orchestre header (titre, sous-titre, avatar, icône), asset image, zone de texte, footer, loader et overlay de survol. Il est optionnellement cliquable (navigation) avec ripple et états hover/active state-aware.

#### `OrigamCard`

- **Entrées (props)** : `ICardProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IBorderProps`, `IColorProps`, `IBgColorProps`, `IDensityProps`, `IDimensionProps`, `IElevationProps`, `ILoaderProps`, `ILocationProps`, `IPositionProps`, `IRoundedProps`, `IMarginProps`, `IPaddingProps`, `ILinkProps`, `IRippleProps`, `IAdjacentProps`, `IActiveProps`.
  - `disabled` — `boolean` — `undefined`.
  - `flat` — `boolean` — `undefined` — supprime l'ombre.
  - `hover` — `boolean` — `undefined` — force l'effet hover visuel permanent (hover élévation via `::before`/`::after`).
  - `image` — `string` — `undefined` — URL de l'asset image (ratio 16:9).
  - `link` — `boolean` — `undefined` — rend la card cliquable avec navigation.
  - `subtitle` — `string | number` — `undefined`.
  - `text` — `string | number` — `undefined` — texte du corps.
  - `title` — `string | number` — `undefined`.
  - `type` — `TCardType` — `undefined`.
  - `tag` — `string` — `'div'`.
  - `ripple` — `boolean` — `true`.
  - `density` — `DENSITY` — `DEFAULT`.

- **Sorties** :
  - Emits : `ICardEmits` extends `IAdjacentEmits` (click:prepend, click:append) + `IActiveEmits` + `IHoverEmits`.
  - Slots : `default`, `wrapper`, `loader`, `header`, `header.append`, `header.prepend`, `header.title`, `header.subtitle`, `header.content`, `asset`, `text`, `footer`.
  - Classes : `.origam-card`, `.origam-card--disabled`, `.origam-card--flat`, `.origam-card--hover`, `.origam-card--link`, `.origam-card--loading`, `.origam-card--rounded-shaped`, `.origam-card--rounded-shaped-invert`, `.origam-card--absolute`, `.origam-card--fixed`, densité, couleur, border, elevation, hover, active, loader, position, rounded, margin, padding.
  - Directive : `v-ripple`.

- **Dépendances** :
  - Composants consommés : `OrigamCardHeader`, `OrigamCardText`, `OrigamImg`, `OrigamProgress`, `OrigamSkeleton`.
  - Composables : `useActive`, `useAdjacent`, `useDensity`, `useDimension`, `useHover`, `useLink`, `useLoader`, `useLocation`, `usePosition`, `useProps`, `useStateEffect`, `useStyle`.
  - Directive : `vRipple`.
  - Enums : `DENSITY`, `PROGRESS_TYPE`.

- **Comportement notable** :
  - `useStateEffect` remplace l'ancien `useBothColor` pour réagir aux états hover/active. Les 8 axes visuels (couleur, bordure, rayon, élévation, padding, margin, gap, ...) sont tous state-aware.
  - Le loader est résolu via `loaderConfig.value.isActive` (pas `loaderConfig.isActive` — erreur historique documentée dans le code).
  - En mode `hover`, la card utilise `::before` / `::after` pour l'animation d'élévation au survol (transition entre deux box-shadows).
  - L'overlay `.origam-card__overlay` voit son `opacity` passer à `var(--origam-card---overlay-opacity-hover, 0.12)` sur `:hover`, `:focus-visible`, `:focus` et `--active`.
  - `tabindex="-1"` quand `disabled=true`.

#### `OrigamCardHeader`

- **Entrées (props)** : `ICardHeaderProps` :
  - Interfaces Commons étendues : `ITagProps`, `ICommonsComponentProps`, `IBorderProps`, `IRoundedProps`, `IPaddingProps`, `IMarginProps`, `IDensityProps`, `IAdjacentProps`.
  - `subtitle` — `string | number` — `undefined`.
  - `title` — `string | number` — `undefined`.
  - `tag` — `string` — `'OrigamToolbar'` (note : ce default rend le header avec le chrome d'une toolbar, qu'il neutralise via SCSS scoped).

- **Sorties** :
  - Emits : `ICardHeaderEmits` extends `IAdjacentEmits` (click:prepend, click:append).
  - Slots : `wrapper`, `prepend`, `append`, `title`, `subtitle`, `default`.
  - Layout CSS : grille 3 colonnes `"prepend content append"`.

- **Comportement notable** :
  - Le SCSS scoped force `--origam-toolbar---box-shadow: none` et `--origam-toolbar---background: transparent` pour neutraliser l'élévation et le fond du toolbar parent. `color: inherit` est appliqué via `.origam-card-header.origam-toolbar` pour hériter la couleur de la Card.

#### `OrigamCardText`

- **Entrées (props)** : `ICardTextProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IBorderProps`, `IRoundedProps`, `IPaddingProps`, `IMarginProps`.
  - `text` — `string | number` — `undefined`.
  - `tag` — `string` — `'div'`.

- **Sorties** : Slot `default` (fallback `<span>{{ text }}</span>`). Pas d'emits.

- **Exemple d'usage** :
```vue
<origam-card
  title="Titre"
  subtitle="Sous-titre"
  text="Corps de la carte."
  image="https://example.com/photo.jpg"
  hover
  :elevation="2"
  rounded="md"
>
  <template #footer>
    <origam-btn>Action</origam-btn>
  </template>
</origam-card>
```

---

### `OrigamDivider`

- **Fichiers** : `packages/ds/src/components/Divider/OrigamDivider.vue`
- **Rôle / utilité** : Séparateur horizontal ou vertical. Rend l'élément sémantique `<hr>` avec `role="separator"` et `aria-orientation` correctement calculés. Aucune logique complexe — essentiellement une fine couche de props au-dessus du CSS.

- **Entrées (props)** : `IDividerProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`, `IMarginProps`, `IDirectionProps`.
  - `direction` — `DIRECTION` — `DIRECTION.HORIZONTAL` (`'horizontal'` | `'vertical'`).
  - `inset` — `boolean` — `undefined` — ajoute une indentation (margin-inline-start 16px sur horizontal, margin-block-start 8px sur vertical).
  - `length` — `number | string` — `undefined` — longueur max (max-width ou max-height selon direction). Converti via `convertToUnit`.
  - `thickness` — `number | string` — `undefined` — épaisseur (border-top-width ou border-right-width selon direction).

- **Sorties** :
  - Pas de slots, pas d'emits.
  - Classes : `.origam-divider`, `.origam-divider--horizontal` / `--vertical`, `.origam-divider--inset` + classes couleur, margin.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

- **Dépendances** : `useBothColor`, `useMargin`, `useProps`, `useStyle`. Enum : `DIRECTION`. Util : `convertToUnit`.

- **Comportement notable** :
  - `aria-orientation` n'est émis que quand `role === 'separator'` (ou aucun role). Un consommateur peut passer `role="presentation"` via `$attrs` pour supprimer la sémantique.
  - Opacité par défaut : `0.12` (le divider est volontairement discret).
  - Un divider vertical utilise `display: inline-flex; align-self: stretch; height: auto`.

- **Exemple d'usage** :
```vue
<!-- Horizontal par défaut -->
<origam-divider/>

<!-- Vertical inset, épais 2px, longueur 80px -->
<origam-divider direction="vertical" inset :thickness="2" :length="80"/>
```

---

### `OrigamSystemBar`

- **Fichiers** : `packages/ds/src/components/SystemBar/OrigamSystemBar.vue`
- **Rôle / utilité** : Barre de statut système (type iOS / Android) placée en haut du layout. Elle se **registre automatiquement** dans l'algorithme de layout via `useLayoutItem` pour que l'AppBar et les contenus suivants se décalent vers le bas. Hauteur par défaut : 24 px (32 px en mode `window`).

- **Entrées (props)** : `ISystemBarProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IElevationProps`, `IColorProps`, `IBgColorProps`, `ILayoutItemProps`, `IRoundedProps`, `IBorderProps`, `IDimensionProps`.
  - `window` — `boolean` — `undefined` — passe la hauteur à 32 px.
  - Props de layout item (`ILayoutItemProps`) : `name`, `order`, `absolute`.
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Pas d'emits.
  - Slot `default`.
  - Classes : `.origam-system-bar`, `.origam-system-bar--window` + couleur, border, rounded, elevation.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

- **Dépendances** :
  - Composables : `useDimension`, `useBorder`, `useRounded`, `useElevation`, `useBothColor`, `useSsrBoot`, `useLayoutItem`, `useProps`, `useStyle`.
  - Interface : `ISystemBarProps`, `ILayoutItemProps`.

- **Comportement notable** :
  - Toujours `active: computed(() => true)` dans `useLayoutItem` — la system bar ne peut pas être cachée (contrairement à l'AppBar qui peut se cacher au scroll).
  - `position: shallowRef('top')` figé : toujours en haut.
  - Le fond par défaut est `var(--origam-color__neutral---700, #404040)`, la couleur `var(--origam-color__text---inverse, #FFFFFF)`, la taille de police `0.75rem`. Ces valeurs sont toutes overridables via les props `color` / `bgColor`.
  - Les icônes internes ont `opacity: 0.7` par défaut.

- **Exemple d'usage** :
```vue
<origam-layout>
  <origam-system-bar window>
    <origam-icon icon="mdi-wifi"/>
    <origam-icon icon="mdi-battery"/>
    <span>12:30</span>
  </origam-system-bar>
  <origam-app-bar title="App"/>
  <origam-main>…</origam-main>
</origam-layout>
```

---

### `OrigamToolbar`

- **Fichiers** : `packages/ds/src/components/Toolbar/OrigamToolbar.vue`
- **Rôle / utilité** : Barre horizontale générique — base de `OrigamAppBar`, footer bars, header de dialog, etc. Elle structure le contenu en 4 zones flexbox (prepend, title, content, append) et applique un **chrome visuel uniforme aux boutons imbriqués** (fond transparent, forme carrée 8px, hover/active via `color-mix`). Le title hérite de `currentColor`.

- **Entrées (props)** : `IToolbarProps` :
  - Interfaces Commons étendues : `ITagProps`, `ICommonsComponentProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IDensityProps`, `IColorProps`, `IBgColorProps`, `IPaddingProps`, `IMarginProps`, `IPositionProps`, `IDimensionProps`, `IActiveProps`, `IHoverProps`.
  - `collapse` — `boolean` — `undefined` — réduit la toolbar à 112px et cache le titre.
  - `flat` — `boolean` — `undefined` — supprime le box-shadow.
  - `floating` — `boolean` — `undefined` — `display: inline-flex`.
  - `title` — `string` — `undefined` — texte rendu via `<OrigamTitle>` dans `__title`.
  - `modelValue` — `boolean` — `true` — visibilité (v-model).
  - `tag` — `string` — `'header'`.
  - `density` — `DENSITY` — `DEFAULT`.

- **Sorties** :
  - Pas d'emits propres.
  - Slots : `default` (remplace le wrapper complet), `prepend`, `title`, `content`, `append`.
  - Classes : `.origam-toolbar`, `.origam-toolbar--collapse`, `.origam-toolbar--flat`, `.origam-toolbar--floating` + border, couleur, padding, margin, density, elevation, rounded, rtl, position.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`.

- **Dépendances** :
  - Composant consommé : `OrigamTitle`.
  - Composables : `useRtl`, `useHover`, `useActive`, `useBothColor`, `useDensity`, `useDimension`, `usePosition`, `useProps`, `useRtl`, `useStateEffect`, `useStyle`.
  - Enum : `DENSITY`.

- **Comportement notable** :
  - `padding-inline-start/end` est composé de `--origam-toolbar---padding-inline` (16px) + `--origam-layout---position-left/right` pour respecter l'espace réservé par un drawer permanent.
  - Le chrome des boutons imbriqués est défini via `:deep(.origam-btn)` avec des CSS vars exposés (`--origam-toolbar---btn-background-color`, `--origam-toolbar---btn-color`, `--origam-toolbar---btn-border-radius`). Le hover et l'actif utilisent `color-mix(in srgb, var(--btn-bg-base), black 20%/30%)` — CSS pur, pas JS.
  - `useStateEffect` est passé avec `toRef(props, 'flat')` comme argument `flat` — quand `flat=true`, l'élévation est supprimée quel que soit l'état hover/active.

- **Exemple d'usage** :
```vue
<origam-toolbar title="Mes notes" bg-color="primary" flat>
  <template #prepend>
    <origam-btn icon="mdi-menu"/>
  </template>
  <template #append>
    <origam-btn icon="mdi-dots-vertical"/>
  </template>
</origam-toolbar>
```

---

### `OrigamAppBar`

- **Fichiers** : `packages/ds/src/components/App/OrigamAppBar.vue`
- **Rôle / utilité** : Barre d'application complète, extension de `OrigamToolbar` + enregistrement comme item de layout. Gère les comportements de défilement (`scroll-behavior`) : `hide`, `inverted`, `collapse`, `elevate`, `fade-image`. Se place en haut du layout par défaut (`location='top'`).

- **Entrées (props)** : `IAppBarProps` extends `IToolbarProps`, `ILayoutItemProps`, `IScrollProps` :
  - Toutes les props de `IToolbarProps` (cf. section Toolbar).
  - Props de layout item (`ILayoutItemProps`) : `name`, `order`, `absolute`.
  - Props de scroll (`IScrollProps`) : `scrollThreshold` — `number` — `300` (px avant que le comportement s'active).
  - `scrollBehavior` — `string` — `undefined` — liste de mots-clés séparés par espaces : `'hide'`, `'inverted'`, `'collapse'`, `'elevate'`, `'fade-image'`.
  - `location` — `TBlock` — `'top'`.
  - `image` — `IImgProps` — `undefined` — image de fond rendue via `OrigamImg` dans le slot `prepend`.
  - `modelValue` — `boolean` — `true` — visibilité initiale.

- **Sorties** :
  - Emits : `IAppBarEmits` extends `ICommonsComponentEmits` (`update:modelValue`).
  - Slots : `default`, `prepend`, `append`, `content`, `img`.
  - Classes : `.origam-app-bar`, `.origam-app-bar--top` (ou autre location), + classes active.
  - Expose : forwards toutes les refs de `OrigamToolbar` via `forwardRefs`.

- **Dépendances** :
  - Composant consommé : `OrigamToolbar`, `OrigamImg`.
  - Composables : `useActive`, `useLayoutItem`, `useProps`, `useScroll`, `useSsrBoot`, `useStyle`, `useToggleScope`.
  - Utils : `forwardRefs`, `int`.
  - Types : `TOrigamToolbar`.

- **Comportement notable** :
  - Hauteur par défaut : 56px (si non overridée). Sans ce défaut, le layout réservait 0px et le drawer/main couvrait la barre.
  - `order` de layout item fallback sur `0` (pas `NaN`) pour que l'AppBar s'enregistre en premier dans la chaîne et que les drawers démarrent sous elle.
  - `isFlat` est `true` quand `flat=true` OU quand `scrollBehavior` inclut `'elevate'` et que le scroll est à 0 (ou > 0 en mode inverted).
  - `isCollapsed` drive la prop `collapse` vers `OrigamToolbar`.

- **Exemple d'usage** :
```vue
<origam-app-bar
  title="Mon App"
  scroll-behavior="elevate hide"
  :scroll-threshold="200"
  bg-color="surface"
>
  <template #append>
    <origam-btn icon="mdi-account"/>
  </template>
</origam-app-bar>
```

---

### `OrigamWatermark`

- **Fichiers** : `packages/ds/src/components/Watermark/OrigamWatermark.vue`
- **Rôle / utilité** : Surimpose un motif diagonal répétitif (texte ou image) sur son contenu. Le motif est généré comme une `data:image/svg+xml` URL par `useWatermark`, puis appliqué en `background-image: repeat` sur un `__layer` absolument positionné. L'option `antiTamper` installe un `MutationObserver` pour réinjecter le layer s'il est supprimé du DOM.

- **Entrées (props)** : `IWatermarkProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`.
  - `text` — `string` — `undefined` — texte du glyph répété.
  - `image` — `string` — `undefined` — URL d'image glyph (prioritaire sur `text`).
  - `opacity` — `number` — `0.1`.
  - `angle` — `number` — `-30` (degrés, négatif = sens anti-horaire).
  - `gap` — `number` — `120` (px entre les tuiles).
  - `fontSize` — `number` — `16` (px, ignoré si `image`).
  - `fontFamily` — `string` — `'inherit'` (ne résout pas depuis le document — SVG data-URL détaché).
  - `color` — `string` — `'currentColor'` (idem : `currentColor` ne fonctionne pas dans un SVG data-URL — passer une couleur explicite pour les surfaces non-blanches).
  - `fontWeight` — `number | string` — `400`.
  - `zIndex` — `number` — `1`.
  - `antiTamper` — `boolean` — `false`.
  - `pointerEvents` — `'none' | 'auto'` — `'none'` (contenu sous-jacent interactif par défaut).
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Pas d'emits.
  - Slot `default` (contenu enveloppé).
  - Classes : `.origam-watermark`, `.origam-watermark--anti-tamper`.
  - Le `__layer` porte `aria-hidden="true"` — le watermark est purement décoratif.
  - Expose : `patternUrl`, `rootEl`, `layerEl`.

- **Dépendances** :
  - Composable : `useWatermark`.
  - Interface : `IWatermarkProps`.

- **Comportement notable** :
  - `antiTamper` : le `MutationObserver` observe `childList` + `attributes` (style, class, data-origam-watermark) sur le root. La réinjection est deferée via `Promise.resolve()` (microtask) pour batcher les mutations rapides.
  - Le `position: relative` est appliqué en inline style sur le root (non tokenisé) pour garantir le contexte contenant du `__layer` absolu.
  - Avertissement documenté dans l'interface : `color: 'currentColor'` n'est pas résolu depuis le document dans un SVG data-URL — le consommateur doit passer une couleur explicite.

- **Exemple d'usage** :
```vue
<origam-watermark text="CONFIDENTIEL" :opacity="0.08" :angle="-25" anti-tamper>
  <my-document/>
</origam-watermark>
```

---

### `OrigamParallax` / `OrigamParallaxLayer` / `OrigamParallaxElement`

- **Fichiers** : `packages/ds/src/components/Parallax/OrigamParallax.vue`, `OrigamParallaxLayer.vue`, `OrigamParallaxElement.vue`
- **Rôle / utilité** : Système d'effets de parallaxe à deux APIs coexistantes :
  1. **API multi-couches** (`OrigamParallaxLayer`) — moderne, CSS scroll-driven si supporté (`animation-timeline: scroll()`), rAF JS sinon. Chaque layer s'enregistre auprès du parent via `provide`/`inject`.
  2. **API legacy** (`OrigamParallaxElement`) — basée sur les événements souris/scroll/orientation et `useParallaxTransform`. Maintenue pour la rétrocompatibilité v2.x.

#### `OrigamParallax` (container)

- **Entrées (props)** : `IParallaxProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IColorProps`, `IBgColorProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IDimensionProps`, `IAudioProps`.
  - `duration` — `number` — `1000` (ms).
  - `animationDuration` — `number` — `undefined` — **dépréciée**, alias de `duration`, suppression v3.0.0.
  - `easing` — `TParallaxEasing | string` — `PARALLAX_EASING.LINEAR`.
  - `perspective` — `number` — `1000` (px, CSS `perspective`).
  - `event` — `TParallaxEvent` — `PARALLAX_EVENT.MOVE`.
  - `active` — `boolean` — `true`.
  - `direction` — `TParallaxDirection` — `PARALLAX_DIRECTION.VERTICAL`.
  - `speed` — `number` — `0.5` (mode single-layer sans `OrigamParallaxLayer`).
  - `disabled` — `boolean` — `false`.
  - `threshold` — `number` — `0` (proportion visible avant activation).
  - `tag` — `string` — `'div'`.

- **Sorties** :
  - Emits : `enter`, `leave`, `scroll-progress(progress: number)`.
  - Slot `default`.
  - Classes : `.origam-parallax`, `.origam-parallax--disabled`, `.origam-parallax--reduced-motion`, `.origam-parallax--css-driven`, `.origam-parallax--{direction}` + couleur, border, rounded, elevation, padding, margin.
  - CSS var : `--origam-parallax---perspective`.
  - Expose : `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`, `progress`, `cssScrollDriven`, `reducedMotion`.

- **Provide** : deux contextes injectés :
  - `ORIGAM_PARALLAX_KEY` — `IParallaxProvide` (consommé par `OrigamParallaxElement`).
  - `ORIGAM_PARALLAX_LAYER_KEY` — `IParallaxLayerProvide` (consommé par `OrigamParallaxLayer`).

#### `OrigamParallaxLayer`

- **Entrées (props)** : `IParallaxLayerProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`.
  - `speed` — `number` — `1` (0 = fixe, 1 = neutre, >1 = premier plan, <0 = inversion).
  - `offsetX` — `number` — `0` (px).
  - `offsetY` — `number` — `0` (px).
  - `zIndex` — `number` — `undefined`.
  - `tag` — `string` — `'div'`.

- **Sorties** : slot `default`. Pas d'emits. Classes : `.origam-parallax__layer`, `--css-driven`, `--reduced-motion`. Expose : `filterProps`.

- **Comportement** : S'enregistre dans le parent via `inject(ORIGAM_PARALLAX_LAYER_KEY)` + `register(registry)` au montage. Le parent écrit `transform` **directement sur le HTMLElement** (hors réactivité Vue) pour rester dans le budget d'un rAF. En mode CSS scroll-driven (`@supports (animation-timeline: scroll())`), l'animation est `@keyframes origam-parallax-layer` avec `animation-timeline: view()`.

- **Throws** : `[Origam] OrigamParallaxLayer must be nested inside OrigamParallax` si le contexte est absent.

#### `OrigamParallaxElement` (legacy)

- **Entrées (props)** : `IParallaxElementProps` :
  - Interfaces Commons étendues : `ICommonsComponentProps`, `ITagProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, `IParallaxElementTypeProps`.
  - `type` — `TParallaxElementType` — `PARALLAX_ELEMENT_TYPE.TRANSLATE`.
  - `transformOrigin` — `TAnchor` — `'center'`.
  - `originX`, `originY` — `number` — `50` (%).
  - `strength` — `number` — `10`.
  - `axis` — `TAxis` — `undefined`.
  - `maxX`, `maxY`, `minX`, `minY` — `number` — `undefined`.
  - `cycle` — `number` — `0` (mouvement cyclique si > 0).
  - `audioIndex` — `number` — `50` (index dans les données audio si audio présent).
  - `tag` — `string` — `'div'`.

- **Sorties** : slot `default`. Pas d'emits. Classes : `.origam-parallax-element` + border, rounded, elevation, padding, margin.

- **Throws** : `[Origam] parallax-element needs to be placed inside parallax` si le contexte est absent.

- **Dépendances (Parallax)** :
  - Composables : `useAudio`, `useBothColor`, `useBorder`, `useDimension`, `useDisplay`, `useElevation`, `useMargin`, `usePadding`, `useParallaxRuntime`, `useParallaxTransform`, `useProps`, `useRounded`, `useStyle`, `useThrottleFn`.
  - Consts : `ORIGAM_PARALLAX_KEY`, `ORIGAM_PARALLAX_LAYER_KEY`.
  - Enums : `PARALLAX_DIRECTION`, `PARALLAX_EASING`, `PARALLAX_EVENT`, `PARALLAX_ELEMENT_TYPE`, `AXIS`.
  - Utils : `getCenter`, `getTargetBox`, `inViewport`, `elementMovement`, `cyclicMovement`.

- **Comportement notable** :
  - `@media (prefers-reduced-motion: reduce)` : toutes les transitions/animations sont coupées sur les layers (`.origam-parallax--disabled .origam-parallax__layer { animation: none; transition: none }`).
  - `OrigamParallaxLayer` : le `transform` initial est `translate3d(offsetX, offsetY, 0)` pour le premier paint avant que le runtime prenne le relais.
  - `useThrottleFn(fn, 100ms)` sur `handleMovement` pour limiter la fréquence des calculs en mode mouse.

- **Exemple d'usage (multi-couches)** :
```vue
<origam-parallax direction="vertical" :threshold="0.1" @scroll-progress="onProgress">
  <origam-parallax-layer :speed="0.3">
    <img src="background.jpg" style="width:100%;height:120%"/>
  </origam-parallax-layer>
  <origam-parallax-layer :speed="1">
    <div class="content">Contenu au premier plan</div>
  </origam-parallax-layer>
</origam-parallax>
```

---

## Tableau récapitulatif

| Composant | Composables clés | Interfaces clés |
|---|---|---|
| `OrigamApp` | `useRtl`, `useStyle`, `useProps` | `ILayoutProps` |
| `OrigamLayout` | `useCreateLayout`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin` | `ILayoutProps`, `ILayoutProvide` |
| `OrigamMain` | `useLayout`, `useSsrBoot`, `useBothColor`, `useElevation`, `useRounded`, `useBorder`, `usePadding`, `useMargin` | `IMainProps` |
| `OrigamSection` | — (WIP) | — |
| `OrigamSheet` | `useSheetSwipe`, `useStateEffect`, `useActive`, `useHover`, `useBothColor`, `useDimension`, `useLocation`, `usePosition` | `ISheetProps`, `ISheetEmits` |
| `OrigamGrid` | `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin` | `IGridProps`, `TGridTracks`, `TGridGapSize` |
| `OrigamGridItem` | — | `IGridItemProps`, `IGridLineSpec` |
| `OrigamContainer` | `useBorder`, `usePadding`, `useMargin`, `useRtl` | `IContainerProps` |
| `OrigamRow` | `useBothColor`, `useDensity`, `useBorder`, `usePadding`, `useMargin` | `IRowProps`, `IDensityProps`, `IAlignProps`, `IJustifyProps` |
| `OrigamCol` | `useBothColor`, `useBorder`, `usePadding`, `useMargin` | `IColProps`, `TCols` |
| `OrigamSpacer` | `useProps`, `useStyle` | `ISpacerProps` |
| `OrigamMasonry` | `useMasonry`, `useCssSupport`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin` | `IMasonryProps`, `TMasonryColumnBreakpoints` |
| `OrigamResponsive` | `useAspectRatio`, `useBorder`, `useDimension`, `usePadding`, `useMargin`, `useRounded` | `IResponsiveProps` |
| `OrigamCard` | `useStateEffect`, `useActive`, `useHover`, `useLink`, `useLoader`, `useAdjacent`, `useDensity`, `useDimension`, `useLocation`, `usePosition` | `ICardProps`, `ICardEmits` |
| `OrigamCardHeader` | `useAdjacent`, `useDensity` | `ICardHeaderProps`, `ICardHeaderEmits` |
| `OrigamCardText` | `useProps`, `useStyle` | `ICardTextProps` |
| `OrigamDivider` | `useBothColor`, `useMargin` | `IDividerProps`, `DIRECTION` |
| `OrigamSystemBar` | `useLayoutItem`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `useSsrBoot` | `ISystemBarProps`, `ILayoutItemProps` |
| `OrigamToolbar` | `useStateEffect`, `useHover`, `useActive`, `useBothColor`, `useDensity`, `useDimension`, `usePosition`, `useRtl` | `IToolbarProps` |
| `OrigamAppBar` | `useLayoutItem`, `useScroll`, `useActive`, `useSsrBoot`, `useToggleScope` | `IAppBarProps`, `ILayoutItemProps`, `IScrollProps` |
| `OrigamWatermark` | `useWatermark` | `IWatermarkProps` |
| `OrigamParallax` | `useParallaxRuntime`, `useAudio`, `useBothColor`, `useBorder`, `useRounded`, `useElevation`, `useDimension`, `usePadding`, `useMargin` | `IParallaxProps`, `IParallaxProvide`, `IParallaxLayerProvide` |
| `OrigamParallaxLayer` | `useProps` + inject `ORIGAM_PARALLAX_LAYER_KEY` | `IParallaxLayerProps`, `IParallaxLayerRegistry` |
| `OrigamParallaxElement` | `useParallaxTransform`, `useBorder`, `useRounded`, `useElevation`, `usePadding`, `useMargin` | `IParallaxElementProps` |
