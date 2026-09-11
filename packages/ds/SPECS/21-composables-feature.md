# Spec technique — Composables métier (feature-specific)

> Document généré à partir de la lecture directe du code source.
> Périmètre : domaines Audio, Calendar, Chart, Clipboard, Code, CommandPalette, DataTable,
> Form, Icon, InlineEdit, List, Mask, Masonry, Media, NumberField, NumberFormat,
> Parallax, PasswordField, Progress, QrCode, Sheet, SliderField, Snackbar, Textarea, Video, Watermark.

---

## Composables métier

Les composables regroupés ici encapsulent la logique propre à une fonctionnalité spécifique du design system. Ils ne font pas partie des Commons (taille, couleur, espacement, bordure…) ni de CssSupport, Theme ou Transition — qui sont documentés dans des specs séparées. Chaque composable suit le principe headless : pas de rendu, pas de DOM direct sauf lorsque l'API native l'exige, retour d'état réactif et de méthodes impératives consommés par le composant hôte.

---

## Audio

### `useAudioPlayer`

**Fichier** : `packages/ds/src/composables/Audio/use-audio-player.composable.ts`

**Rôle / utilité** : Wrapper typé de `useMediaPlayer` dédié aux éléments `HTMLAudioElement`. Il n'ajoute aucune logique propre à ce stade — sa valeur est double : fournir un `audioRef` typé `Ref<HTMLAudioElement | null>` (au lieu de l'ancêtre générique `HTMLMediaElement`) et constituer un point d'extension stable pour les futures fonctionnalités audio-spécifiques (AnalyserNode Web Audio, AudioWorklet, etc.).

**Entrées (signature)** :
```ts
useAudioPlayer(options?: IUseOrigamAudioPlayerOptions): {
  audioRef: Ref<HTMLAudioElement | null>
  state: IAudioPlayerState
  methods: IAudioPlayerMethods
}
```
`IUseOrigamAudioPlayerOptions` porte les mêmes champs que `IUseMediaPlayerOptions` (via délégation) : `audioRef?`, `autoplay?`, `muted?`, `loop?`, `preload?`.

**Sorties (return)** :
- `audioRef` — ref sur l'élément `<audio>`, injectée depuis `options.audioRef` ou créée en interne.
- `state` — objet réactif hérité de `useMediaPlayer` : `playing`, `paused`, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `ready`, `loading`, `error`, `playbackRate`, `remoteAvailable`, `remoteState`.
- `methods` — méthodes héritées : `play`, `pause`, `toggle`, `seek`, `setVolume`, `toggleMute`, `load`, `skipBackward`, `skipForward`, `setPlaybackRate`, `requestRemotePlayback`, `stopRemotePlayback`.

**Dépendances (liens)** :
- `useMediaPlayer` (`../Media/use-media-player.composable`) — délègue la totalité de la logique.
- Types : `IAudioPlayerMethods`, `IAudioPlayerState`, `IUseOrigamAudioPlayerOptions` depuis `../../interfaces`.

**Consommé par** : `OrigamAudio.vue`.

**Notes** : SSR-safe par héritage (voir `useMediaPlayer`). Aucune logique propre à supprimer en cas de migration — le wrapper est intentionnellement thin.

---

### `useWaveform`

**Fichier** : `packages/ds/src/composables/Audio/use-waveform.composable.ts`

**Rôle / utilité** : Décode un fichier audio via `OfflineAudioContext.decodeAudioData`, rééchantillonne le canal 0 en `bins` pics (valeur absolue max par bucket), normalise à `[0, 1]` et expose le tableau réactif. Recalcul automatique à chaque changement de l'URL source. SSR-safe : toutes les accès à `window` / `AudioContext` sont gardés.

**Entrées (signature)** :
```ts
useWaveform(
  srcRef: Ref<string | undefined | null>,
  options?: IUseWaveformOptions
): {
  peaks: Ref<Array<number>>
  isComputing: Ref<boolean>
  error: Ref<Error | null>
  compute: () => Promise<void>
}
```
`IUseWaveformOptions` : `bins?` (défaut `WAVEFORM_DEFAULT_BINS = 200`), `crossOrigin?` (`'anonymous' | 'use-credentials'`).

**Sorties (return)** :
- `peaks` — tableau normalisé de `bins` valeurs `[0, 1]`.
- `isComputing` — `true` pendant le fetch + décodage.
- `error` — erreur capturée (HTTP non-2xx, `OfflineAudioContext` absent, décodage échoué). Ne remonte jamais via `throw`.
- `compute()` — recalcul impératif (utile après un rechargement manuel ou une mutation du src sans changement de ref).

**Dépendances (liens)** :
- Constante `WAVEFORM_DEFAULT_BINS` depuis `../../consts/Audio/audio.const`.
- Type `IUseWaveformOptions` depuis `../../interfaces`.
- Fonction interne `decodeWithFallback` — polyfill de la signature callback de `decodeAudioData` (Safari < 14.1).

**Consommé par** : `OrigamAudio.vue` (via `useAudioPlayer` qui expose le même `audioRef`, `useWaveform` est appelé séparément avec la même URL).

**Notes** :
- Utilise `cache: 'force-cache'` sur le fetch pour partager l'entrée réseau avec le cache média du navigateur.
- Ne calcule pas le RMS — utilise le max absolu par bucket pour un rendu plus percutant.
- Watcher `{ immediate: true }` sur `srcRef` : le premier calcul démarre dès le montage.

**Exemple d'usage** :
```ts
const src = ref('/track.mp3')
const { peaks, isComputing, error } = useWaveform(src, { bins: 200 })
```

---

## Calendar

### `useCalendar`

**Fichier** : `packages/ds/src/composables/Calendar/calendar.composable.ts`

**Rôle / utilité** : Moteur de calendrier stateless. Fourni les computed reactifs (`visibleDateRange`, `expandedEvents`) et les méthodes pures (`navigate`, `buildMonthGrid`, `buildWeekGrid`, `buildDayGrid`, `buildAgenda`, `eventsOnDay`, `positionEvent`) pour les quatre vues : `month`, `week`, `day`, `agenda`. Délègue la navigation et le changement de vue via des callbacks optionnels pour rester compatible avec un state externe (props, Pinia).

**Entrées (signature)** :
```ts
useCalendar(
  options: IUseCalendarOptions,
  setView?: (view: TCalendarView) => void,
  setCurrentDate?: (date: Date) => void
)
```
`IUseCalendarOptions` contient des thunks `() => T` pour : `view()`, `currentDate()`, `firstDayOfWeek()`, `events()`, `dayStartHour()`, `dayEndHour()`, `slotDuration()`, `minDate?()`, `maxDate?()`.

**Sorties (return)** :
```ts
{
  visibleDateRange: ComputedRef<{ start: Date, end: Date }>
  expandedEvents: ComputedRef<Array<IEvent>>
  navigate: (direction: TCalendarNavigate) => void          // 'prev' | 'next' | 'today'
  setView: (view: TCalendarView) => void
  buildMonthGrid: (date: Date) => Array<Array<Date>>         // 6x7 matrix
  buildWeekGrid: (date: Date) => Array<Array<ICalendarTimeSlot>>
  buildDayGrid: (date: Date) => Array<ICalendarTimeSlot>
  buildAgenda: (range?) => Array<ICalendarAgendaEntry>
  eventsOnDay: (day: Date) => Array<IEvent>
  positionEvent: (event, dayStart, pxPerMin) => { top, height } | null
  helpers: { isSameDay, isSameMonth, startOfDay, startOfMonth, endOfMonth, addDays, addMonths, addWeeks, diffMinutes, toDate }
}
```

**Dépendances (liens)** :
- Utilitaires `date.util` : `addDays`, `addMonths`, `addWeeks`, `buildMonthMatrix`, `diffMinutes`, `endOfMonth`, `endOfWeekFixed`, `isAfter`, `isBefore`, `isSameDay`, `isSameMonth`, `startOfDay`, `startOfMonth`, `startOfWeekFixed`, `toDate` depuis `../../utils/Calendar/date.util`.
- Utilitaire RRULE : `expandRecurrence` depuis `../../utils/Calendar/rrule.util`.
- Types : `TCalendarNavigate`, `TCalendarView` depuis `../../types`.
- Interfaces : `IEvent`, `IUseCalendarOptions` depuis `../../interfaces`.
- Interfaces internes définies dans le même fichier : `ICalendarTimeSlot`, `ICalendarAgendaEntry`.

**Consommé par** : `OrigamCalendar.vue`.

**Notes** :
- Entièrement stateless du point de vue du composable — aucun `ref` interne, tous les états viennent des thunks.
- `expandedEvents` applique le filtre RRULE sur la `visibleDateRange` courante.
- La grille mensuelle rend toujours 6x7 = 42 cellules pour stabiliser la hauteur entre les mois courts.
- `positionEvent` exprime `top` et `height` en unités de `pxPerMin` — le SFC les multiplie par la hauteur de slot CSS pour rester responsive sans `ResizeObserver`.

---

## Chart

### `useChart`

**Fichier** : `packages/ds/src/composables/Chart/chart.composable.ts`

**Rôle / utilité** : Moteur de rendu SVG générique pour tous les types cartésiens et polaires. Produit via des `ComputedRef` l'ensemble des descripteurs nécessaires au rendu : `viewBox`, `scales`, `ticks`, `secondaryTicks`, `paths`, `legend`, ainsi que l'état hover interactif. Supporte les types : `line`, `area`, `spline`, `stepped-line`, `column`, `bar`, `scatter`, `radar`, `pie`, `donut`. Gère l'empilement (`normal`, `percent`), l'axe Y secondaire, le zoom côté externalisation.

**Entrées (signature)** :
```ts
useChart(options: IUseChartOptions)
```
`IUseChartOptions` contient des thunks pour : `width()`, `height()`, `padding()`, `type()`, `series()`, `categories()`, `stacked()`, `stacking?()`, `yMin()`, `yMax()`, `smoothing()`, `colorScheme()`, `donutHoleSize()`, `hiddenLabels?()`, `secondaryYAxis?()`.

**Sorties (return)** :
```ts
{
  viewBox: ComputedRef<string>
  scales: ComputedRef<IChartScales>          // { x(value, dataIndex?, catCount?) -> px, y(value) -> px }
  ticks: ComputedRef<{ x: IChartTick[], y: IChartTick[] }>
  secondaryTicks: ComputedRef<IChartTick[]>
  paths: ComputedRef<IChartPath[]>           // descripteurs path/rect/circle/polygon par serie
  legend: ComputedRef<IChartLegendItem[]>
  hover: Ref<IChartPoint | null>
  onPointHover: (point: IChartPoint | null) => void
  plot: ComputedRef<{ x0, y0, x1, y1, cx, cy }>
  yRange: ComputedRef<{ min, max }>
  secondaryYRange: ComputedRef<{ min, max }>
  slotCount: ComputedRef<number>
  colorFor: (series, index) => string
  effectiveType: (series) => TChartType
  effectiveStacking: ComputedRef<TChartStacking>
  percentValues: ComputedRef<Map<number, number[]>>
}
```

**Dépendances (liens)** :
- Utilitaires path : `arcPath`, `areaPath`, `linePath`, `monotonePath`, `pathLength`, `steppedPathLength`, `polarToCartesian`, `polygonPath`, `smoothPath`, `steppedPath` depuis `../../utils/Chart/path.util`.
- Utilitaires couleur : `intentBgExpr`, `isIntent` depuis `../../utils/Commons/color.util`.
- Constante `CHART_Y_TICK_COUNT` depuis `../../consts/Chart/chart.const`.
- Enum `CHART_STACKING` depuis `../../enums`.
- Fonctions helper exportées du même fichier : `computePlotBandGeometry`, `computePlotLineGeometry`, `computeAnnotationGeometry`.
- Types : `TChartStacking`, `TChartType`, `TIntent` depuis `../../types`.
- Interfaces : `IChartAnnotation`, `IChartAnnotationGeo`, `IChartLegendItem`, `IChartPath`, `IChartPlotBand`, `IChartPlotLine`, `IChartPoint`, `IChartScales`, `IChartSeries`, `IChartTick`, `IUseChartOptions` depuis `../../interfaces`.

**Consommé par** : `OrigamChart.vue`, `OrigamChartCartesian.vue`, `OrigamChartPolar.vue`, `OrigamChartHoneycomb.vue`, `OrigamChartBoxPlot.vue`, `OrigamChartLegend.vue`, `OrigamChartAxis.vue`, `OrigamChartPyramid.vue`, `OrigamChartWordCloud.vue`, `OrigamChartRadar.vue`, `OrigamChartGauge.vue`.

**Notes** :
- Algorithm `niceStep` : arrondi D3-style des ticks Y (power-of-10 normed).
- Mode `percent` : range Y fixé à `[0, 100]`, les offsets et valeurs rendus sont en points de pourcentage.
- Pie/donut multi-series : anneaux concentriques, couleur partagée par catégorie entre les anneaux.
- Scatter : axe X local par span de données (pas la grille catégorielle).
- `resolveColor` : filtre CSS brut -> passe-through ; `TIntent` -> `intentBgExpr()` ; inconnu -> `currentColor`.

---

### `useChartGauge`

**Fichier** : `packages/ds/src/composables/Chart/chart-gauge.composable.ts`

**Rôle / utilité** : Moteur géométrique pour la jauge solide (style speedomètre). Calcule les chemins SVG de la piste vide (`trackPath`) et de la valeur remplie (`valuePath`) via `arcPath`, ainsi que les coordonnées du pivot pour l'affichage du label central.

**Entrées (signature)** :
```ts
useChartGauge(options: IUseChartGaugeOptions): {
  geometry: ComputedRef<IChartGaugeGeometry>
}
```
`IUseChartGaugeOptions` : thunks `width()`, `height()`, `padding()`, `min()`, `max()`, `value()`, `thickness?()` (défaut 18 px), `startAngle?()` (défaut `-3pi/4`), `endAngle?()` (défaut `3pi/4`).

**Sorties (return)** :
- `geometry` : `IChartGaugeGeometry` — `trackPath`, `valuePath`, `valueAngle`, `startAngle`, `endAngle`, `outerRadius`, `innerRadius`, `centerX`, `centerY`, `ratio`, `clampedValue`.

**Dépendances (liens)** :
- `arcPath` depuis `../../utils/Chart/path.util`.
- Interfaces : `IChartGaugeGeometry`, `IUseChartGaugeOptions` depuis `../../interfaces`.

**Consommé par** : `OrigamChartGauge.vue`.

**Notes** : Valeur normalisée en `[0, 1]` avant de calculer le sweep partiel. `valuePath` est vide (`''`) quand `ratio <= 1e-6` pour éviter un `M0,0` dégénéré.

---

### `useChartZoom`

**Fichier** : `packages/ds/src/composables/Chart/chart-zoom.composable.ts`

**Rôle / utilité** : Gère l'état de zoom / pan interactif sur un graphique cartésien. La fenêtre de zoom est exprimée en indices de catégories entiers `[zoomStart, zoomEnd]`. Invariants maintenus : `0 <= zoomStart < zoomEnd <= dataLength - 1` et `zoomEnd - zoomStart >= MIN_VISIBLE_CATEGORIES - 1`.

**Entrées (signature)** :
```ts
useChartZoom(options: { dataLength: () => number })
```

**Sorties (return)** :
```ts
{
  zoomStart: Ref<number>
  zoomEnd: ComputedRef<number>        // effectiveEnd (clampé à dataLength-1)
  zoomEndRaw: Ref<number>             // valeur brute (peut être Infinity pour "pas de zoom")
  isDragging: Ref<boolean>
  dragStartPx: Ref<number | null>
  dragEndPx: Ref<number | null>
  isZoomed: ComputedRef<boolean>
  zoomTo: (start, end) => void
  zoomReset: () => void
  zoomBy: (deltaFraction, anchorFraction) => void
  panBy: (deltaCategories) => void
  pxToCategoryIndex: (svgX, plotX0, plotX1) => number
  categoryIndexToPx: (categoryIndex, plotX0, plotX1) => number
  WHEEL_ZOOM_STEP: number             // 0.15
}
```

**Dépendances (liens)** : Aucune dépendance externe — pure logique mathématique.

**Consommé par** : `OrigamChartCartesian.vue`.

**Notes** :
- `zoomReset()` remet `zoomEnd` à `Infinity` (sentinelle = pas de zoom).
- `zoomBy` est utilisé pour le scroll-wheel ; `anchorFraction` ancre le zoom sur la position de la souris (0 = gauche, 1 = droite).
- `pxToCategoryIndex` / `categoryIndexToPx` convertissent entre l'espace SVG et l'espace catégorie.

---

## Clipboard

### `useClipboard`

**Fichier** : `packages/ds/src/composables/Clipboard/clipboard.composable.ts`

**Rôle / utilité** : Écriture dans le presse-papiers. Utilise `navigator.clipboard.writeText` quand disponible, puis tombe en fallback sur `textarea` + `document.execCommand('copy')` pour Safari pré-permissions et les WebViews non-HTTPS. Expose un flag `copied` qui se réinitialise automatiquement après `feedbackDuration`.

**Entrées (signature)** :
```ts
useClipboard(options?: IUseClipboardOptions): {
  copy: (text: string) => Promise<boolean>
  copied: Ref<boolean>
  error: Ref<Error | null>
  isSupported: Ref<boolean>
}
```
`IUseClipboardOptions` : `feedbackDuration?` (défaut `CLIPBOARD_DEFAULT_FEEDBACK_DURATION_MS`).

**Sorties (return)** :
- `copy(text)` — écrit `text`, retourne `true` / `false`. Ne throw jamais.
- `copied` — `true` pendant `feedbackDuration` ms après une copie réussie.
- `error` — erreur capturée lors de l'écriture (`null` en l'absence d'erreur).
- `isSupported` — `true` si `navigator.clipboard.writeText` existe.

**Dépendances (liens)** :
- Constante `CLIPBOARD_DEFAULT_FEEDBACK_DURATION_MS` depuis `../../consts/Clipboard/clipboard.const`.
- Interface `IUseClipboardOptions` depuis `../../interfaces`.
- `getCurrentScope`, `onScopeDispose` pour nettoyer le timer de reset.

**Consommé par** : `OrigamClipboard.vue`, `OrigamCode.vue`.

**Notes** : Le timer de reset est nettoyé via `onScopeDispose` si le composable est appelé dans un scope Vue (évite les fuites mémoire). Si `copy()` est appelé plusieurs fois avant l'expiration du timer précédent, le timer est remis à zéro (`clearTimer`).

---

## Code

### `useCode`

**Fichier** : `packages/ds/src/composables/Code/code.composable.ts`

**Rôle / utilité** : Singleton de coloration syntaxique basé sur `shiki`. Charge dynamiquement le module (`import()` lazy) au premier appel à `highlight()`, expose un cache LRU (`CODE_CACHE_MAX_ENTRIES`) par clé `(lang, code)`, et génère du HTML dual-couleur (CSS vars `--shiki-light` / `--shiki-dark`) pour le switching de thème côté CSS sans re-tokenisation.

**Entrées (signature)** :
```ts
useCode(): IUseCodeReturn
```

**Sorties (`IUseCodeReturn`)** :
```ts
{
  highlight: (code: string, lang: TCodeLang) => Promise<string>
  prime: () => Promise<void>    // précharge le highlighter en arrière-plan
  isReady: () => boolean
  resetCacheForTesting: () => void
}
```

**Dépendances (liens)** :
- Constantes : `CODE_CACHE_MAX_ENTRIES`, `CODE_DARK_THEME`, `CODE_LIGHT_THEME`, `SUPPORTED_LANGS` depuis `../../consts/Code/code.const`.
- Enum : `CODE_LANG` depuis `../../enums`.
- Type : `TCodeLang` depuis `../../types`.
- Interface : `IUseCodeReturn` depuis `../../interfaces`.
- Dépendance runtime : `shiki` (import dynamique, hors bundle initial).

**Consommé par** : `OrigamCode.vue`.

**Notes** :
- Singleton module-scope — tous les appelants partagent le même `_highlighterPromise`.
- Le commentaire `/* @vite-ignore */` est obligatoire pour éviter que Rollup ne suive le graphe de dépendances dans le loader WASM de shiki lors des builds VitePress.
- `resetCodeHighlighterForTesting()` (exportée séparément) réinitialise le singleton pour les specs Vitest.
- Langues non supportées -> fallback `plaintext` avec avertissement console (une fois par langue inconnue via `_unsupportedLangWarned`).

---

## CommandPalette

### `useCommand`

**Fichier** : `packages/ds/src/composables/CommandPalette/command.composable.ts`

**Rôle / utilité** : Registre singleton de commandes pour la palette de commandes globale. Utilise un état module-scope (`REGISTRY`) plutôt que `provide/inject` car les commandes peuvent être enregistrées depuis n'importe où (features, plugins, services) sans couplage à l'arbre Vue. La déduplication est assurée par `id` à l'écriture (upsert).

**Entrées (signature)** :
```ts
useCommand(): IUseCommandReturn
```

**Sorties (`IUseCommandReturn`)** :
```ts
{
  register: (cmd: ICommand) => () => void    // retourne un cleanup
  unregister: (id: string) => void
  commands: ComputedRef<ReadonlyArray<ICommand>>
  open: () => void
  close: () => void
  isOpen: Ref<boolean>
}
```

**Dépendances (liens)** :
- `tryOnScopeDispose` depuis `../../utils`.
- Interface `ICommand` depuis `../../interfaces`.

**Consommé par** : `OrigamCommandPalette.vue`.

**Notes** :
- `register()` appelle `tryOnScopeDispose(dispose)` — le cleanup est automatique quand le composable est instancié dans un scope Vue (composant, scope personnalisé). En dehors d'un scope, `tryOnScopeDispose` est silencieusement ignoré.
- `resetCommandRegistryForTesting()` (export séparé) vide le registre entre les specs Vitest.

---

## DataTable

Le domaine DataTable suit le pattern **provide/inject** : un composant racine (`OrigamDataTable`) fournit les contextes via `provideXxx`, et les composants enfants les consomment via `useXxx`. Chaque sous-domaine (expansion, groupement, tri, sélection, pagination, headers) a son propre token de clé d'injection.

### `useCell`

**Fichier** : `packages/ds/src/composables/DataTable/cell.composable.ts`

**Rôle / utilité** : Calcule le padding d'une cellule de données en fonction de sa clé spéciale (`data-table-select`, `data-table-expand`) ou de sa configuration `column.padding`.

**Entrées** : `column: IInternalDataTableHeader`.
**Sorties** : `{ getPadding: (column) => string | undefined }`.

**Consommé par** : `OrigamDataTableRow.vue`, `OrigamDataTableRows.vue`.

---

### `provideExpanded` / `useExpanded`

**Fichier** : `packages/ds/src/composables/DataTable/expand.composable.ts`

**Rôle / utilité** : Gestion de l'état d'expansion des lignes. `provideExpanded` crée et fournit l'état via `ORIGAM_DATA_TABLE_EXPAND_KEY`. `useExpanded` le consomme ; throw si le provide est absent.

**Entrées de `provideExpanded`** : `props: IDataTableExpandProps` (contient `expanded`, `expandOnClick`).
**Sorties** : `IDataTableProvideExpanded` — `{ expand, expanded, expandOnClick, isExpanded, toggleExpand }`.

**Dépendances** : `useVModel` (Commons), constante `ORIGAM_DATA_TABLE_EXPAND_KEY`, interfaces `IDataTableExpandProps`, `IDataTableItem`, `IDataTableProvideExpanded`.

**Consommé par** : `OrigamDataTable.vue` (provide), `OrigamDataTableRow.vue` (use).

---

### `createGroupBy` / `provideGroupBy` / `useGroupedItems` / `useGroupBy`

**Fichier** : `packages/ds/src/composables/DataTable/group.composable.ts`

**Rôle / utilité** : Gestion du regroupement de lignes. `createGroupBy` crée le `groupBy` réactif depuis les props. `provideGroupBy` fournit l'état de regroupement + l'état d'ouverture des groupes (`opened: Ref<Set<string>>`). `useGroupedItems` produit `flatItems` en aplatissant la hiérarchie selon les groupes ouverts. `useGroupBy` consomme le contexte.

**Entrées de `provideGroupBy`** : `{ groupBy: Ref<IDataTableSortItem[]>, sortBy: Ref<IDataTableSortItem[]> }`.
**Sorties** : `IDataTableProvideGroup` — `{ sortByWithGroups, toggleGroup, opened, groupBy, extractRows, isGroupOpen }`.

**Dépendances** : `useVModel` (Commons), `groupItems`, `flattenItems` (utils), constante `ORIGAM_DATA_TABLE_GROUP_KEY`.

**Consommé par** : `OrigamDataTable.vue` (provide), `OrigamDataTableGroupHeaderRow.vue` (use).

---

### `createHeaders` / `useHeaders` / `useHeadersCell`

**Fichier** : `packages/ds/src/composables/DataTable/headers.composable.ts`

**Rôle / utilité** : Conversion des headers déclaratifs en structure interne `IInternalDataTableHeader`, injection des colonnes spéciales (group, select, expand) selon les options, parsing multi-niveaux (headers hiérarchiques), extraction des fonctions de tri/filtre par colonne. `useHeadersCell` calcule l'icône de tri courante.

**Entrées de `createHeaders`** : `props: IDataTableHeaderProps`, `options?` (`groupBy?`, `showSelect?`, `showExpand?`).
**Sorties** : `{ headers, columns, sortFunctions, sortRawFunctions, filterFunctions }`.

**Dépendances** : `useSort` (DataTable), `ORIGAM_DATA_TABLE_HEADERS_KEY`, enum `SORT_DIRECTION`, utilitaires `convertToInternalHeaders`, `extractKeys`, `getHeaderDepth`, `parseFixedColumns`, `parseHeaderItems`.

**Consommé par** : `OrigamDataTable.vue` (provide), `OrigamDataTableHeaders.vue`, `OrigamDataTableHeaderCell.vue` (use).

---

### `useDataTableItems`

**Fichier** : `packages/ds/src/composables/DataTable/items.composable.ts`

**Rôle / utilité** : Transforme les items bruts en items internes (`IInternalDataTableHeader`-aware) via `transformDataTableItems`.

**Entrées** : `props: IDataTableItemsProps`, `columns: Ref<IInternalDataTableHeader[]>`.
**Sorties** : `{ items: ComputedRef<...> }`.

**Consommé par** : `OrigamDataTable.vue`.

---

### `useOptions`

**Fichier** : `packages/ds/src/composables/DataTable/options.composable.ts`

**Rôle / utilité** : Aggrège `page`, `itemsPerPage`, `sortBy`, `groupBy`, `search` en un objet `options` et émet `update:options` via `getCurrentInstance` lorsque l'une des valeurs change. Réinitialise la page à 1 quand `search` change.

**Entrées** : `{ page, itemsPerPage, sortBy, groupBy, search }` — tous des `Ref`.
**Sorties** : aucun retour (side-effect only via emit).

**Consommé par** : `OrigamDataTable.vue`.

---

### `createPagination` / `providePagination` / `usePagination` / `usePaginatedItems`

**Fichier** : `packages/ds/src/composables/DataTable/pagination.composable.ts`

**Rôle / utilité** : Gestion de la pagination. `createPagination` initialise les refs depuis les props. `providePagination` calcule `startIndex`, `stopIndex`, `pageCount` et expose `nextPage`, `prevPage`, `setPage`, `setItemsPerPage`. `usePaginatedItems` découpe le tableau d'items selon la page courante. Auto-correction de page si `page > pageCount` (via `watchEffect`).

**Sorties de `providePagination`** : `IDataTableProvidePagination` — `{ page, itemsPerPage, startIndex, stopIndex, pageCount, itemsLength, nextPage, prevPage, setPage, setItemsPerPage }`.

**Dépendances** : `useVModel` (Commons), `clamp`, `getCurrentInstance` (utils), constante `ORIGAM_DATA_TABLE_PAGINATION_KEY`.

**Consommé par** : `OrigamDataTable.vue`.

---

### `provideSelection` / `useSelection`

**Fichier** : `packages/ds/src/composables/DataTable/select.composable.ts`

**Rôle / utilité** : Gestion de la sélection de lignes. Supporte trois stratégies via l'enum `DATATABLE_SELECT_STRATEGY` : `SINGLE`, `PAGE`, `ALL` (ou objet personnalisé). Expose `select`, `toggleSelect`, `selectAll`, `isSelected`, `isSomeSelected`, `someSelected`, `allSelected`, `showSelectAll`.

**Dépendances** : `useVModel`, stratégies `allSelectStrategy`, `pageSelectStrategy`, `singleSelectStrategy` depuis `../../consts`, `DATATABLE_SELECT_STRATEGY`, `deepEqual`, `wrapInArray`.

**Consommé par** : `OrigamDataTable.vue` (provide), `OrigamDataTableRow.vue`, `OrigamDataTableHeaders.vue` (use).

---

### `createSort` / `provideSort` / `useSort` / `useSortedItems`

**Fichier** : `packages/ds/src/composables/DataTable/sort.composable.ts`

**Rôle / utilité** : Gestion du tri. `createSort` initialise `sortBy`, `mustSort`, `multiSort`. `provideSort` expose `toggleSort` (cycle ASC -> DESC -> rien, sauf si `mustSort`) et `isSorted`. `useSortedItems` produit `sortedItems` via `sortItems` (util).

**Dépendances** : `useVModel`, constante `ORIGAM_DATA_TABLE_SORT_KEY`, enum `SORT_DIRECTION`, `sortItems` (utils), type `TDataTableCompareFunction`.

**Consommé par** : `OrigamDataTable.vue`, `OrigamDataTableHeaders.vue`, `OrigamDataTableHeaderCell.vue`.

---

## Form

### `useForm`

**Fichier** : `packages/ds/src/composables/Form/form.composable.ts`

**Rôle / utilité** : Orchestrateur du formulaire. Maintient un registre de champs (`items: IFormField[]`), agrège leur état de validation (valid/invalid/null), expose `validate()`, `reset()`, `resetValidation()`. Provide le contexte `ORIGAM_FORM_KEY` consommé par chaque champ pour s'enregistrer, se désenregistrer et notifier ses mises à jour.

**Entrées** : `props: IFormProps` (contient `modelValue`, `disabled`, `readonly`, `fastFail`, `validateOn`).
**Sorties** :
```ts
{
  errors: Ref<IValidationFieldResult[]>
  isDisabled: ComputedRef<boolean>
  isReadonly: ComputedRef<boolean>
  isValidating: ShallowRef<boolean>
  isValid: Ref<boolean | null>
  items: Ref<IFormField[]>
  validate: () => Promise<{ valid: boolean, errors: IValidationFieldResult[] }>
  reset: () => void
  resetValidation: () => void
}
```

**Dépendances** : `useVModel`, constante `ORIGAM_FORM_KEY`, interfaces `IFormField`, `IFormProps`, `IValidationFieldResult`, `consoleWarn` (utils).

**Consommé par** : `OrigamForm.vue`, `OrigamNumberField.vue` (consomme le contexte injecté).

**Notes** : Le watcher sur `items` (deep, flush `'post'`) dérive automatiquement la valeur du modèle : `false` si au moins un champ est invalide, `true` si tous sont valides, `null` sinon. L'option `fastFail` interrompt la boucle de validation à la première erreur.

---

## Icon

### `useIcon` / `createIcons`

**Fichier** : `packages/ds/src/composables/Icon/icon.composable.ts`

**Rôle / utilité** : Résolution d'une valeur `TIcon` (string alias `$xxx`, path SVG brut, array `[path, ...]`, composant Vue) vers un `TIconInstance` (`{ component, icon? }`). `createIcons` crée la configuration d'icônes fusionnée (default set MDI + custom).

**Entrées de `useIcon`** : `props: Ref<TIcon | undefined>`.
**Sorties** : `{ iconData: ComputedRef<TIconInstance> }`.

**Dépendances** :
- Composants `OrigamComponentIcon`, `OrigamSvgIcon`.
- Constantes : `DEFAULT_SETS`, `MDI`, `MDI_ALIASES`, `ORIGAM_ICONS_KEY`.
- Types : `TIcon`, `TIconInstance`, `TIconOptions`.
- `mergeDeep` (utils).
- `inject` Vue pour récupérer le contexte d'icônes.

**Consommé par** : `OrigamIcon.vue`.

**Notes** : Détection du path SVG brut par regex `/^[MmLlHhVvCcSsQqTtAaZz][\s\d,.-]/` — ces strings sont routées vers `OrigamSvgIcon`. Les aliases `$xxx` sont résolus depuis `icons.aliases`. `throw` si l'alias est introuvable après résolution.

---

## InlineEdit

### `useInlineEdit`

**Fichier** : `packages/ds/src/composables/InlineEdit/inline-edit.composable.ts`

**Rôle / utilité** : Machine à états headless pour l'édition en place. Quatre états : IDLE / EDITING / VALIDATING / ERROR. Supporte la validation asynchrone (via `validate` callback ou tableau de `rules`), le trim configurable, l'annulation de validations obsolètes (token de version), et les callbacks `onConfirm`, `onCancel`, `onError`.

**Entrées** :
```ts
useInlineEdit(
  modelValue: Ref<string | number> | ComputedRef<string | number>,
  options?: IUseInlineEditOptions
)
```
`IUseInlineEditOptions` : `trim?` (défaut `true`), `validate?`, `rules?`, `onConfirm?`, `onCancel?`, `onError?`.

**Sorties** :
```ts
{
  isEditing: Ref<boolean>
  draft: Ref<string>
  error: Ref<string | null>
  isPending: Ref<boolean>
  normalisedDraft: ComputedRef<string>
  isDraftEmpty: ComputedRef<boolean>
  edit: () => void
  confirm: () => Promise<boolean>
  cancel: () => void
  setValue: (next: string) => void
}
```

**Dépendances** : Interfaces `IUseInlineEditOptions`, `TInlineEditRule`, `TInlineEditValidator` depuis `../../interfaces`.

**Consommé par** : `OrigamInlineEdit.vue`.

**Notes** :
- `confirm()` évalue `rules` d'abord (séquentiellement, stop au premier échec), puis `validate` si toutes les rules passent.
- Annulation de Promise obsolète via `validationToken` — compare le token capturé à la valeur courante au moment de la résolution.
- L'erreur est effacée dès que l'utilisateur tape (`setValue()`).

---

## List

### `useCreateList` / `useList`

**Fichier** : `packages/ds/src/composables/List/list.composable.ts`

**Rôle / utilité** : Contexte de communication entre `OrigamList` et ses enfants pour savoir si un ou plusieurs `ListItem` ont un slot prepend ou append actif (permettant l'alignement des items sans slot). `useCreateList` fournit le contexte en lisant aussi le contexte parent (listes imbriquées). `useList` consomme le contexte sans throw si absent (retourne `null`).

**Dépendances** : Constante `ORIGAM_LIST_KEY`.

**Consommé par** : `OrigamList.vue`, `OrigamListItem.vue`, `OrigamListGroup.vue`, `OrigamListChildren.vue`.

---

## Mask

### `useMask`

**Fichier** : `packages/ds/src/composables/Mask/mask.composable.ts`

**Rôle / utilité** : Moteur de masque de saisie réactif. Maintient `masked` (valeur formatée), `unmasked` (valeur brute), `complete` (masque entièrement rempli) et `isValid` (selon la config de validation). Recalcul automatique quand `modelValue` ou `mask` changent.

**Entrées** :
```ts
useMask(
  modelValue: MaybeRef<string | null | undefined>,
  mask: MaybeRef<TMask | undefined>
): IUseMaskReturn
```

**Sorties (`IUseMaskReturn`)** :
```ts
{
  masked: Ref<string>
  unmasked: Ref<string>
  isValid: Ref<boolean>
  complete: Ref<boolean>
  setRaw: (raw: string) => string    // recalcule imperativement + retourne unmasked
  config: Ref<IResolvedMaskConfig | null>
}
```

**Dépendances** :
- Utilitaires : `applyMask`, `resolveMaskConfig`, `validatePattern` depuis `../../utils`.
- Interfaces : `IMaskOptions`, `IResolvedMaskConfig` depuis `../../interfaces`.
- Type : `TMask` depuis `../../types`.

**Consommé par** : `OrigamTextField.vue` (via son SFC).

**Notes** : Sans masque actif (`config === null`), `masked === unmasked === source` et `complete = false`. `isValid` tient compte de `required` : un champ vide non-required est valide, un champ non-complet avec required est invalide.

---

## Masonry

### `useMasonry`

**Fichier** : `packages/ds/src/composables/Masonry/masonry.composable.ts`

**Rôle / utilité** : Implémentation JS du layout masonry (bucket-fill) pour les navigateurs ne supportant pas `grid-template-rows: masonry`. Maintient un `ResizeObserver` sur le conteneur et chaque item, recalcule le layout à chaque mutation. Expose `layout` réactif avec les positions absolues de chaque item.

**Entrées** :
```ts
useMasonry(options: IUseMasonryOptions): {
  containerRef: Ref<HTMLElement | null>
  setItem: (index: number, el: HTMLElement | null) => void
  layout: Ref<IMasonryLayoutResult>
  relayout: () => void
}
```
`IUseMasonryOptions` : `columnsRef`, `gapRef`, `breakpointsRef?`, `alignRef?` (`'top' | 'center'`).

**Fonctions utilitaires exportées** :
- `pickColumnsForWidth(width, breakpoints, defaultColumns)` — résolution du nombre de colonnes selon breakpoints (plus grande clé <= largeur).
- `bucketFill(heights, containerWidth, gap, columns, align)` — algorithme pur de placement.

**Dépendances** : Types `TMasonryAlign`, `TMasonryColumnBreakpoints`. Interfaces internes dans le même fichier : `IMasonryItemRect`, `IMasonryLayoutResult`, `IUseMasonryOptions`.

**Consommé par** : `OrigamMasonry.vue`.

**Notes** :
- `ResizeObserver` coalesce via `requestAnimationFrame` pour éviter les rafales.
- Observation du `containerRef` via un watcher (pas `onMounted`) car la ref est assignée par le composant hôte après que le composable soit instancié.
- `bucketFill` : ties en hauteur -> colonne la plus à gauche (opérateur `>` strict).
- Alignement `center` : shift par colonne de `(maxHeight - colHeight) / 2`.

---

## Media

### `useMediaPlayer`

**Fichier** : `packages/ds/src/composables/Media/use-media-player.composable.ts`

**Rôle / utilité** : Couche de base headless pour `HTMLVideoElement` et `HTMLAudioElement`. Bind les événements natifs (`play`, `pause`, `ended`, `timeupdate`, `progress`, `volumechange`, `loadedmetadata`, `loadstart`, `canplay`, `waiting`, `error`, `ratechange`) et les Remote Playback API events. Expose l'état réactif complet et des méthodes impératives.

**Entrées** : `options?: IUseMediaPlayerOptions` — `mediaRef?`, `autoplay?`, `muted?`, `loop?`, `preload?`.

**Sorties** :
```ts
{
  mediaRef: Ref<HTMLMediaElement | null>
  state: IMediaPlayerState      // playing, paused, currentTime, duration, buffered,
                                 // volume, muted, ready, loading, error, playbackRate,
                                 // remoteAvailable, remoteState
  methods: IMediaPlayerMethods  // play, pause, toggle, seek, setVolume, toggleMute,
                                 // load, skipBackward, skipForward, setPlaybackRate,
                                 // requestRemotePlayback, stopRemotePlayback
}
```

**Dépendances** : Constante `MEDIA_DEFAULT_VOLUME`, interfaces `IMediaPlayerMethods`, `IMediaPlayerState`, `IUseMediaPlayerOptions`.

**Consommé par (indirect)** : `useVideoPlayer` et `useAudioPlayer` (composables), qui délèguent à ce composable.

**Notes** :
- `prefersReducedMotion()` : supprime l'autoplay si l'OS demande `prefers-reduced-motion: reduce`, avec avertissement console.
- `readBufferedEnd` : lit `buffered.end(length - 1)` avec try/catch (certains navigateurs lancent sur les plages disjoint).
- Volume > 0 + `muted=true` -> démute automatiquement (comportement identique aux navigateurs natifs).
- `setPlaybackRate` : clampé `[0.25, 4]`.
- `bind` / `unbind` via `onMounted` / `onBeforeUnmount`. Hydrate l'état initial depuis l'élément existant à la montée.

**Fonction helper exportée** : `shouldSuppressAutoplay(): boolean`.

---

## NumberField

### `useHold`

**Fichier** : `packages/ds/src/composables/NumberField/hold.composable.ts`

**Rôle / utilité** : Gestion du comportement "hold" (maintien d'un bouton enfoncé) pour les boutons d'incrément/décrément d'un `NumberField`. Déclenche un premier `tick` immédiat, puis après `holdDelay` ms démarre un `setInterval` toutes les `holdRepeat` ms.

**Entrées** :
```ts
useHold(
  { toggleUpDown: (increment: boolean) => void },
  holdRepeat?: number,    // défaut 50 ms
  holdDelay?: number      // défaut 500 ms
): { holdStart: (value: 'up' | 'down') => void, holdStop: () => void }
```

**Dépendances** : `onScopeDispose` pour nettoyer les timers.

**Consommé par** : `OrigamNumberField.vue`.

**Notes** : Utilise `window.setTimeout` / `window.setInterval` / `window.clearTimeout` / `window.clearInterval` — non SSR-safe (pas de garde `window === 'undefined'`). A appeler uniquement depuis un scope client.

---

## NumberFormat

### `useNumberFormat`

**Fichier** : `packages/ds/src/composables/NumberFormat/number-format.composable.ts`

**Rôle / utilité** : Wrapper réactif de `Intl.NumberFormat` avec cache LRU module-scope (`NUMBER_FORMAT_LRU_CAPACITY`). Supporte les dialectes : `decimal`, `currency`, `percent`, `unit`, `compact`, `scientific`, `engineering`. Résout automatiquement la locale depuis `<html lang>`, `navigator.language` ou un fallback configurable.

**Entrées** :
```ts
useNumberFormat(
  options?: MaybeRefOrGetter<IUseNumberFormatOptions>
): {
  intl: ComputedRef<Intl.NumberFormat>
  format: (value: number | string) => string
  formatToParts: (value: number | string) => Intl.NumberFormatPart[]
}
```
`IUseNumberFormatOptions` : `locale?`, `format?`, `currency?`, `currencyDisplay?`, `unit?`, `unitDisplay?`, `notation?`, `compactDisplay?`, `minimumFractionDigits?`, `maximumFractionDigits?`, `minimumSignificantDigits?`, `maximumSignificantDigits?`, `useGrouping?`, `signDisplay?`.

**Dépendances** :
- Constantes : `NUMBER_FORMAT_DEFAULT_CURRENCY`, `NUMBER_FORMAT_FALLBACK_LOCALE`, `NUMBER_FORMAT_LRU_CAPACITY` depuis `../../consts/NumberFormat/number-format.const`.
- Interface `IUseNumberFormatOptions`.

**Consommé par** : `OrigamNumberFormat.vue`.

**Notes** :
- `format('unit')` sans `unit` option -> fallback `decimal` + avertissement console.
- `coerceValue` : strings non-numériques -> `0` (jamais `NaN` affiché à l'utilisateur).
- La clé de cache est `JSON.stringify({ l: locale, o: intlOptions })` — stable entre appels.
- `__clearNumberFormatCache()` exposé pour les tests uniquement.

---

## Parallax

### `useParallaxRuntime`

**Fichier** : `packages/ds/src/composables/Parallax/parallax.composable.ts`

**Rôle / utilité** : Runtime headless du composant `<OrigamParallax>`. Maintient un registre de layers, calcule la progression de défilement, implémente deux branches : CSS scroll-driven (`animation-timeline: scroll()` quand disponible et easing `linear`) ou boucle rAF JS. Gère `prefers-reduced-motion`, le throttle via `IntersectionObserver` (boucle rAF active uniquement en viewport) et l'éasing spring (lerp damped par frame).

**Entrées** :
```ts
useParallaxRuntime(options: IUseParallaxRuntimeOptions): {
  layers: Ref<IParallaxLayerRegistry[]>
  progress: Ref<number>
  mouseRatio: Ref<{ x: number, y: number }>
  cssScrollDriven: ComputedRef<boolean>
  reducedMotion: Ref<boolean>
  register: (layer: IParallaxLayerRegistry) => void
  unregister: (id: symbol) => void
}
```
`IUseParallaxRuntimeOptions` : `target`, `direction`, `easing`, `threshold`, `disabled`, `speed`, `onEnter?`, `onLeave?`, `onProgress?`.

**Dépendances** :
- `useCssSupport` (CssSupport) pour détecter `animation-timeline: scroll()`.
- Enums : `PARALLAX_DIRECTION`, `PARALLAX_EASING`.
- Interfaces : `IParallaxLayerRegistry`, `IUseParallaxRuntimeOptions`.
- Types : `TParallaxDirection`, `TParallaxEasing`.

**Consommé par** : `OrigamParallax.vue`.

**Notes** :
- Éasing spring : damping = `0.12`, lerp par frame via `WeakMap<HTMLElement, { tx, ty }>`.
- CSS-first : publie des custom properties `--origam-parallax__layer---speed / offset-x / offset-y` sur chaque layer quand la branche CSS est active.
- `threshold` : proportion minimum de l'hôte dans le viewport avant le début du mouvement (re-normalise la progression restante).
- `prefersReducedMotion` : surveille la media query avec listeners (compatibilité `addListener` legacy + `addEventListener`).

---

### `useParallaxTransform`

**Fichier** : `packages/ds/src/composables/Parallax/transform.composable.ts`

**Rôle / utilité** : Calcule la string CSS `transform` pour un élément `<OrigamParallaxElement>` selon son `type` (translate, rotate, depth, depth_inv, scale, scale_x, scale_y), son `strength` et ses coordonnées `(x, y)` de déplacement (normalisées par le composant parent).

**Entrées** : `props: IParallaxElementProps`.
**Sorties** : `{ transformStyles: (x, y) => string, strength: ComputedRef<number> }`.

**Dépendances** : Enums `AXIS`, `PARALLAX_ELEMENT_TYPE`.

**Consommé par** : `OrigamParallaxElement.vue`.

---

## PasswordField

### `computeStrength`

**Fichier** : `packages/ds/src/composables/PasswordField/passwordStrength.composable.ts`

**Rôle / utilité** : Fonction pure de calcul du score de robustesse (0-4) et du niveau (`'weak' | 'fair' | 'good' | 'strong'`) d'un mot de passe selon cinq heuristiques : longueur >= 8, >= 12, présence de chiffre, mix majuscule/minuscule, caractère non-alphanumérique.

**Entrées** : `value: string | null | undefined`.
**Sorties** : `IPasswordStrength` — `{ score: TPasswordStrengthScore, level: TPasswordStrengthLevel }`.

**Dépendances** :
- Interfaces `IPasswordStrength`.
- Types `TPasswordStrengthLevel`, `TPasswordStrengthScore`.
- Re-export : `DEFAULT_PASSWORD_REQUIREMENTS` depuis `../../consts`.

**Consommé par** : `OrigamPasswordField.vue`.

**Notes** : Pas de dépendance externe (zxcvbn ou autre). Délibérément simple — score/niveau sert à l'UI (barre + couleur token), pas à la politique de sécurité.

---

## Progress

### `useProgress`

**Fichier** : `packages/ds/src/composables/Progress/progress.composable.ts`

**Rôle / utilité** : Calcule les classes CSS, styles, et valeurs dérivées pour les composants de progression (linéaire, circulaire). Gère la normalisation de la valeur, le détail de l'épaisseur, la visibilité via `IntersectionObserver`, et les classes d'espacement.

**Entrées** : `props: IProgressTypeProps`.
**Sorties** :
```ts
{
  progressClasses: ComputedRef<(string | object)[]>
  progressStyles: ComputedRef<(string | object)[]>
  normalizedValue: ComputedRef<number>    // (value / max) * 100
  thickness: ComputedRef<number>
  max: ComputedRef<number>
  progress: Ref<...>                      // v-model de la valeur
  hasContent: ComputedRef<boolean>        // slots.default present
}
```

**Dépendances** :
- Composables Commons : `useIntersectionObserver`, `useMargin`, `usePadding`, `useVModel`.
- Interface `IProgressTypeProps`.
- Utilitaire `int`.

**Consommé par** : `OrigamProgress.vue`, `OrigamProgressLinear.vue`, `OrigamProgressCircular.vue`.

---

## QrCode

### `useQrCode`

**Fichier** : `packages/ds/src/composables/QrCode/qr-code.composable.ts`

**Rôle / utilité** : Encode une valeur string via `qrcode-generator` (Reed-Solomon + masking), construit une string SVG complète avec support logo central, coins arrondis, fond configurable. Cache LRU module-scope (`QR_CODE_LRU_CAPACITY`) sur les matrices `(ecc, value)`.

**Entrées** :
```ts
useQrCode(
  value: MaybeRefOrGetter<string>,
  options?: MaybeRefOrGetter<IUseQrCodeOptions>
): {
  svg: ComputedRef<string>
  modules: ComputedRef<boolean[][]>
  size: ComputedRef<number>           // count de modules (NxN)
}
```
`IUseQrCodeOptions` : `errorCorrectionLevel?` (défaut `QR_CODE_DEFAULT_ECC`), `foreground?`, `background?`, `margin?`, `cornerRadius?`, `logo?` (`IQrCodeLogo`).

**Dépendances** :
- Dépendance runtime : `qrcode-generator`.
- Constantes : `QR_CODE_DEFAULT_ECC`, `QR_CODE_DEFAULT_LOGO_PADDING`, `QR_CODE_DEFAULT_LOGO_SIZE`, `QR_CODE_DEFAULT_MARGIN`, `QR_CODE_LRU_CAPACITY`, `QR_CODE_OVERLAY_MAX_RATIO`.
- Interfaces : `IQrCodeLogo`, `IUseQrCodeOptions`.
- Type : `TQrCodeErrorCorrectionLevel`.

**Consommé par** : `OrigamQrCode.vue`.

**Notes** :
- SSR-safe : aucun accès DOM, l'encodeur est pur JS.
- `escapeXmlAttr` appliqué à toutes les valeurs injectées dans le SVG (XSS safety).
- Avertissement console si `logo.size > QR_CODE_OVERLAY_MAX_RATIO` (risque de non-décodabilité).
- `typeNumber = 0` -> auto-sélection de la version la plus petite.
- `__clearQrCodeCache()` exposé pour les tests uniquement.

---

## Sheet

### `useSheetSwipe`

**Fichier** : `packages/ds/src/composables/Sheet/sheetSwipe.composable.ts`

**Rôle / utilité** : Gestionnaire de geste de swipe pour un bottom-sheet. Utilise les Pointer Events (couvre souris + touch) pour tracker `pointerdown -> pointermove -> pointerup`. Snap à l'arrêt selon la vélocité (flick rapide -> step d'un snap) ou la distance absolue (drag lent -> snap le plus proche). Respecte `persistent` (bloque le snap `closed`).

**Entrées** :
```ts
useSheetSwipe(options: ISheetSwipeOptions): ISheetSwipeReturn
```
`ISheetSwipeOptions` : `el`, `handle`, `snapPoints?`, `defaultSnap?`, `disabled?`, `persistent?`.

**Sorties (`ISheetSwipeReturn`)** :
```ts
{
  currentSnap: Ref<TSheetSnapId>
  dragOffset: ShallowRef<number>      // px de décalage pendant le drag
  isDragging: ShallowRef<boolean>
  snapTo: (id: TSheetSnapId) => void
  dismiss: () => void                 // snap vers 'closed'
  currentSnapHeight: ComputedRef<number>
}
```

**Dépendances** :
- Constantes : `DEFAULT_SHEET_SNAP_POINTS`, `SHEET_FAST_FLICK_THRESHOLD`.
- Interfaces : `ISheetSwipeOptions`, `ISheetSwipeReturn`.
- Types : `TSheetSnapId`, `TSheetSnapPoint`.
- Fonction interne `resolveHeightPx` : nombre -> px, string -> résolution `vh/%/vw/rem/em` via `window.innerHeight` / `getComputedStyle`.

**Consommé par** : `OrigamSheet.vue`.

**Notes** :
- `setPointerCapture` best-effort (silencieux si refusé par jsdom ou événement synthétique).
- Snap-points triés par hauteur ASC pour que les indices voisins correspondent à des positions monotones.
- `enforcePersistent` redirige `closed` -> premier snap non-closed si `persistent=true`.

---

## SliderField

### `useSteps`

**Fichier** : `packages/ds/src/composables/SliderField/slider-field.composable.ts`

**Rôle / utilité** : Calcule les paramètres de stepping pour `<OrigamSliderField>` : `min`, `max`, `step`, `decimals` et `roundValue` (snap à l'étape la plus proche dans `[min, max]`). Ce composable remplace l'ancien pipeline de drag JS depuis la migration vers `<input type="range">` natif.

**Entrées** : `props: ISliderFieldProps`.
**Sorties** : `{ min, max, step, decimals: ComputedRef<number>, roundValue: (value) => number }`.

**Dépendances** : Utilitaires `clamp`, `getDecimals`.

**Consommé par** : `OrigamSliderField.vue`.

**Notes** : `step <= 0` -> pas de snap (retourne la valeur parsée). L'offset `min % step` est soustrait puis réinjecté pour que les steps soient alignés sur `min` (ex. `min=1, step=2` -> valeurs valides : 1, 3, 5...).

---

## Snackbar

### `useCountdown`

**Fichier** : `packages/ds/src/composables/Snackbar/snackbar.composable.ts`

**Rôle / utilité** : Minuterie de décompte réactive. Calcule le temps restant en tenant compte de la durée de transition CSS de l'élément hôte pour synchroniser la fin du décompte avec la fin de l'animation de fermeture.

**Entrées** : `milliseconds: number`.
**Sorties** : `{ time: ShallowRef<number>, clear, reset, start: (el?: HTMLElement) => void }`.

**Dépendances** : `nextTick`, `onScopeDispose`.

**Consommé par** : `OrigamSnackbar.vue` (la consommation est documentée dans le composant, mais non visible dans un import direct — il s'agit d'une primitive publique exportée depuis le barrel).

---

### `useSnackbarGroup` / `useSnackbarGroupInternal`

**Fichier** : `packages/ds/src/composables/Snackbar/snackbar-group.composable.ts`

**Rôle / utilité** : Store singleton par `id` (pattern `STORES: Map<string, ISnackbarGroupState>`) pour la gestion des piles de notifications. `notify` pousse une notification, programme son auto-dismiss après `duration` ms, applique une éviction FIFO si `max` est configuré. `dismiss` retire un item et déclenche son callback `onDismiss`. `dismissAll` vide la pile.

**Entrées** :
```ts
useSnackbarGroup(options?: IUseSnackbarGroupOptions): IUseSnackbarGroupReturn
```
`IUseSnackbarGroupOptions` : `id?` (défaut `SNACKBAR_GROUP_DEFAULT_ID`), `max?`, `defaultDuration?`.

**Sorties (`IUseSnackbarGroupReturn`)** :
```ts
{
  items: Readonly<Ref<ReadonlyArray<ISnackbarGroupItem>>>
  notify: (opts: ISnackbarGroupItemOptions) => string    // retourne l'id de l'item
  dismiss: (itemId: string) => void
  dismissAll: () => void
}
```

**Dépendances** :
- Constantes : `SNACKBAR_GROUP_DEFAULT_DURATION`, `SNACKBAR_GROUP_DEFAULT_ID`.
- Interfaces : `ISnackbarGroupItem`, `ISnackbarGroupItemOptions`.

**Consommé par** : `OrigamSnackbarGroup.vue` (via `useSnackbarGroupInternal` pour accès writable), consommateur externe via `useSnackbarGroup`.

**Notes** :
- `useSnackbarGroupInternal` expose `rawItems` writable (le composant hôte a besoin de muter pour le rendu).
- `items` retourné par `useSnackbarGroup` est typé `ReadonlyArray` mais pas wrappé `readonly()` — compromis délibéré pour éviter un bug Histoire où `applyState` essaie d'assigner sur un proxy readonly.
- `resetSnackbarGroupForTesting()` expose le reset du singleton pour Vitest.

---

## Textarea

### `useTextareaRich`

**Fichier** : `packages/ds/src/composables/Textarea/textarea-rich.composable.ts`

**Rôle / utilité** : Runtime du champ de texte enrichi. Monte sur un `contenteditable`, applique les commandes de formatage via `document.execCommand` (bold, italic, underline, lien, listes, headings, code inline, suppression du format), piste l'état actif du caret via `document.queryCommandState` + traversée DOM, sanitise chaque émission via `sanitizeHtml`. Gère paste (strip HTML dangereux), keyboard shortcuts (Cmd/Ctrl + B/I/U/K/E/Shift+7/8).

**Entrées** :
```ts
useTextareaRich(options: IUseTextareaRichOptions): {
  hostRef: Ref<HTMLElement | undefined>
  active: ITextareaRichActiveState
  format: (command: TTextareaToolbarCommand, value?: string) => void
  isFormatActive: (command: TTextareaToolbarCommand) => boolean
  setValue: (html: string) => void
  onInput: () => void
  onKeydown: (event: KeyboardEvent) => void
  onPaste: (event: ClipboardEvent) => void
}
```
`IUseTextareaRichOptions` : `value: () => string`, `disabled: () => boolean`, `onUpdate: (html: string) => void`, `onFormat: (cmd, value?) => void`.

**Dépendances** :
- Enum `TEXTAREA_TOOLBAR_COMMAND`.
- Interfaces `ITextareaRichActiveState`, `IUseTextareaRichOptions`.
- Type `TTextareaToolbarCommand`.
- Utilitaire `sanitizeHtml`.

**Consommé par** : `OrigamTextareaField.vue`.

**Notes** :
- `execCommand` est "déprécié" par spec mais reste la seule API sans dépendance externe pour ce niveau de richesse.
- Toggle inline code : `removeFormat` pour désactiver, `insertHTML('<code>...</code>')` pour activer.
- Safari peut throw sur `queryCommandState` hors conteneur éditable -> catch silencieux.
- Paste : préfère `text/html` sanitisé, fallback `text/plain` avec escape des `<>`.

---

## Video

### `useVideoPlayer`

**Fichier** : `packages/ds/src/composables/Video/video-player.composable.ts`

**Rôle / utilité** : Couche spécialisée `HTMLVideoElement` au-dessus de `useMediaPlayer`. Ajoute l'état `fullscreen` et `pip` (Picture-in-Picture) et les méthodes associées : `enterFullscreen`, `exitFullscreen`, `toggleFullscreen`, `requestPip`, `exitPip`, `togglePip`. Bind les événements `enterpictureinpicture` / `leavepictureinpicture` sur l'élément et `fullscreenchange` sur le `document`.

**Entrées** : `options?: IUseVideoPlayerOptions` — mêmes champs que `IUseMediaPlayerOptions` + `videoRef?`.
**Sorties** :
```ts
{
  videoRef: Ref<HTMLVideoElement | null>
  state: IVideoPlayerState    // = IMediaPlayerState + fullscreen, pip
  methods: IVideoPlayerMethods // = IMediaPlayerMethods + enterFullscreen, exitFullscreen,
                                // toggleFullscreen, requestPip, exitPip, togglePip
}
```

**Dépendances** :
- `useMediaPlayer`, `shouldSuppressAutoplay` depuis `../Media/use-media-player.composable`.
- Interfaces : `IUseVideoPlayerOptions`, `IVideoPlayerMethods`, `IVideoPlayerState`.

**Consommé par** : `OrigamVideo.vue`.

**Notes** :
- iOS Safari : `requestFullscreen` n'est pas disponible sur `<video>` — fallback vers `webkitEnterFullscreen()` propriétaire.
- PIP : `requestPictureInPicture` via cast dynamique (l'API n'est pas dans les types lib standard de TS à tous les targets).
- `shouldSuppressAutoplay()` re-exporté depuis le module Media pour que le SFC puisse prendre la décision à la résolution des attributs (avant `onMounted`).

---

## Watermark

### `useWatermark`

**Fichier** : `packages/ds/src/composables/Watermark/watermark.composable.ts`

**Rôle / utilité** : Génère un motif SVG en `data:image/svg+xml` (filigrane text ou image) répété en CSS `background-repeat: repeat`. Expose `install(target?)` pour injecter un calque `position: absolute; inset: 0` dans un élément hôte, avec protection anti-tampering via `MutationObserver` (réinjecte le calque si retiré ou si ses attributs `style/class` sont modifiés).

**Entrées** :
```ts
useWatermark(
  options?: MaybeRefOrGetter<IUseWatermarkOptions>
): {
  patternUrl: ComputedRef<string>
  install: (target?: HTMLElement) => HTMLElement | null
  uninstall: () => void
}
```
`IUseWatermarkOptions` : `text?`, `image?`, `opacity?`, `angle?`, `gap?`, `fontSize?`, `fontFamily?`, `color?`, `fontWeight?`, `pointerEvents?`, `zIndex?`, `antiTamper?`.

**Dépendances** :
- Constantes : `WATERMARK_DATA_ATTR`, `WATERMARK_DEFAULT_*` depuis `../../consts/Watermark/watermark.const`.
- Interface `IUseWatermarkOptions`.

**Consommé par** : `OrigamWatermark.vue`.

**Notes** :
- SSR-safe : `patternUrl` est pur SVG string, aucun DOM.
- `install()` court-circuite si `document` est absent (SSR).
- Hôte statique (`position: static`) -> force `position: relative` pour que le calque absolu reste contenu.
- Anti-tamper : `MutationObserver` surveille `childList` (suppression du layer) + `attributes` (style, class, data-attr) sur l'hôte. Réinjection via microtask (`Promise.resolve().then(...)`) pour éviter les ping-pongs.
- `escapeXml` appliqué à toutes les valeurs utilisateur dans le SVG.

---

## Tableau récapitulatif

| Composable | Composant(s) consommateur(s) | Utils / domaines liés |
|---|---|---|
| `useAudioPlayer` | `OrigamAudio` | `useMediaPlayer` (Media) |
| `useWaveform` | `OrigamAudio` | `audio.const`, `IUseWaveformOptions` |
| `useCalendar` | `OrigamCalendar` | `date.util`, `rrule.util` (Calendar) |
| `useChart` | `OrigamChart`, `OrigamChartCartesian`, `OrigamChartPolar`, `OrigamChartHoneycomb`, `OrigamChartBoxPlot`, `OrigamChartLegend`, `OrigamChartAxis`, `OrigamChartPyramid`, `OrigamChartWordCloud`, `OrigamChartRadar`, `OrigamChartGauge` | `path.util`, `color.util` (Chart/Commons), `chart.const` |
| `useChartGauge` | `OrigamChartGauge` | `path.util` (Chart) |
| `useChartZoom` | `OrigamChartCartesian` | — |
| `useClipboard` | `OrigamClipboard`, `OrigamCode` | `clipboard.const` |
| `useCode` | `OrigamCode` | `code.const`, `CODE_LANG` enum, shiki (runtime) |
| `useCommand` | `OrigamCommandPalette` | `tryOnScopeDispose` (utils) |
| `useCell` | `OrigamDataTableRow`, `OrigamDataTableRows` | — |
| `provideExpanded` / `useExpanded` | `OrigamDataTable` (provide), `OrigamDataTableRow` (use) | `useVModel`, `ORIGAM_DATA_TABLE_EXPAND_KEY` |
| `createGroupBy` / `provideGroupBy` / `useGroupedItems` / `useGroupBy` | `OrigamDataTable`, `OrigamDataTableGroupHeaderRow` | `groupItems`, `flattenItems` (utils) |
| `createHeaders` / `useHeaders` / `useHeadersCell` | `OrigamDataTable`, `OrigamDataTableHeaders`, `OrigamDataTableHeaderCell` | `convertToInternalHeaders`, `parseHeaderItems`, etc. (utils) |
| `useDataTableItems` | `OrigamDataTable` | `transformDataTableItems` (utils) |
| `useOptions` | `OrigamDataTable` | `getCurrentInstance`, `deepEqual` (utils) |
| `createPagination` / `providePagination` / `usePagination` / `usePaginatedItems` | `OrigamDataTable` | `clamp`, `getCurrentInstance` (utils) |
| `provideSelection` / `useSelection` | `OrigamDataTable`, `OrigamDataTableRow`, `OrigamDataTableHeaders` | `singleSelectStrategy`, `pageSelectStrategy`, `allSelectStrategy` (consts) |
| `createSort` / `provideSort` / `useSort` / `useSortedItems` | `OrigamDataTable`, `OrigamDataTableHeaders`, `OrigamDataTableHeaderCell` | `sortItems` (utils), `SORT_DIRECTION` |
| `useForm` | `OrigamForm`, `OrigamNumberField` | `ORIGAM_FORM_KEY`, `useVModel`, `consoleWarn` |
| `useIcon` / `createIcons` | `OrigamIcon` | `OrigamSvgIcon`, `OrigamComponentIcon`, `MDI`, `MDI_ALIASES`, `mergeDeep` |
| `useInlineEdit` | `OrigamInlineEdit` | Interfaces `TInlineEditRule`, `TInlineEditValidator` |
| `useCreateList` / `useList` | `OrigamList`, `OrigamListItem`, `OrigamListGroup`, `OrigamListChildren` | `ORIGAM_LIST_KEY` |
| `useMask` | `OrigamTextField` | `applyMask`, `resolveMaskConfig`, `validatePattern` (utils) |
| `useMasonry` | `OrigamMasonry` | — (algorithme pur + ResizeObserver) |
| `useMediaPlayer` | `useVideoPlayer`, `useAudioPlayer` (composables) | `media.const`, `IMediaPlayerState`, `IMediaPlayerMethods` |
| `useHold` | `OrigamNumberField` | — |
| `useNumberFormat` | `OrigamNumberFormat` | `number-format.const`, `Intl.NumberFormat` |
| `useParallaxRuntime` | `OrigamParallax` | `useCssSupport`, `PARALLAX_DIRECTION`, `PARALLAX_EASING` enums |
| `useParallaxTransform` | `OrigamParallaxElement` | `AXIS`, `PARALLAX_ELEMENT_TYPE` enums |
| `computeStrength` | `OrigamPasswordField` | `IPasswordStrength`, `TPasswordStrengthLevel`, `DEFAULT_PASSWORD_REQUIREMENTS` |
| `useProgress` | `OrigamProgress`, `OrigamProgressLinear`, `OrigamProgressCircular` | `useIntersectionObserver`, `useMargin`, `usePadding`, `useVModel` |
| `useQrCode` | `OrigamQrCode` | `qrcode-generator` (runtime), `qr-code.const` |
| `useSheetSwipe` | `OrigamSheet` | `sheet-snap-points.const`, `sheet-swipe.const` |
| `useSteps` | `OrigamSliderField` | `clamp`, `getDecimals` (utils) |
| `useCountdown` | `OrigamSnackbar` (usage indirect / API publique) | — |
| `useSnackbarGroup` / `useSnackbarGroupInternal` | `OrigamSnackbarGroup` | `SNACKBAR_GROUP_DEFAULT_*` consts |
| `useTextareaRich` | `OrigamTextareaField` | `sanitizeHtml` (utils), `TEXTAREA_TOOLBAR_COMMAND` enum |
| `useVideoPlayer` | `OrigamVideo` | `useMediaPlayer` (Media), `IVideoPlayerState`, `IVideoPlayerMethods` |
| `useWatermark` | `OrigamWatermark` | `watermark.const`, `MutationObserver` (DOM) |
