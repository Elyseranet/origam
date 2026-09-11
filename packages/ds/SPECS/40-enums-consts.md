# Enums & Constantes — Spec technique origam design system

## Introduction

Ce document décrit exhaustivement les enums (`packages/ds/src/enums/**/*.enum.ts`) et les constantes (`packages/ds/src/consts/**/*.const.ts`) du design system origam. Il se base exclusivement sur la lecture du code source réel — aucune valeur n'est inventée ou extrapolée.

### Organisation générale

Les fichiers sont rangés **par domaine** (Audio, Chart, Commons, DataTable…) dans des sous-dossiers miroirs entre `enums/` et `consts/`. Le dossier `Commons/` concentre les primitives transversales réutilisées par la quasi-totalité des composants. Chaque autre dossier correspond à un composant ou à une famille de composants.

### Pattern `XXX_DEFAULTS` — contrainte compilateur SFC Vue

Plusieurs constantes portent le suffixe `_DEFAULTS` (ex. `AUDIO_DEFAULTS`, `BLOCKQUOTE_DEFAULTS`, `CODE_DEFAULTS`, `GRID_DEFAULTS`, `MASONRY_DEFAULTS`). Elles centralisent les valeurs par défaut d'un composant à des fins de :
- référence dans les stories Histoire (`useStoryInitState`),
- documentation et tests unitaires,
- consommateurs tiers qui créent des wrappers.

**Ces objets ne sont jamais référencés dans `withDefaults(defineProps<T>(), { … })`.**

Raison : le compilateur de SFC Vue 3 analyse `withDefaults` de façon **statique** au moment de la compilation. Il ne peut résoudre que des **littéraux inline** (chaînes, nombres, booléens, `() => ({})` pour les objets). Un accès `XXX_DEFAULTS.propName` n'est pas statiquement résolvable — le compilateur émet un descripteur avec `undefined` pour chaque clé, ce qui corrompt silencieusement l'objet `props` à l'exécution (erreurs `TypeError: Cannot read properties of undefined`). Les composants doublonnent donc les valeurs par défaut sous forme de littéraux inline dans `withDefaults`, et exportent séparément `XXX_DEFAULTS` pour les seuls usages non-compilateur. Cette règle est documentée explicitement dans `CLAUDE.md`.

---

## Section 1 — Enums

### Domaine : Commons (primitives transversales)

---

### `FOCUS_LOCATION`
- **Fichier** : `src/enums/Commons/commons.enum.ts`
- **Rôle** : Direction de navigation dans un groupe d'éléments focusables.
- **Membres** :
  - `NEXT = 'next'` — déplace le focus vers l'élément suivant
  - `PREV = 'prev'` — déplace vers l'élément précédent
  - `FIRST = 'first'` — saute au premier élément
  - `LAST = 'last'` — saute au dernier élément
- **Consommé par** : composables de navigation clavier (listes, menus, tabs, grilles).

---

### `CLIENT_POSITION`
- **Fichier** : `src/enums/Commons/commons.enum.ts`
- **Rôle** : Axe de lecture de la position souris/touch dans un `MouseEvent` / `TouchEvent`.
- **Membres** :
  - `Y = 'clientY'`
  - `X = 'clientX'`
- **Consommé par** : composables de drag, scroll, positionnement (SliderField, Sheet, Parallax).

---

### `ADJACENT`
- **Fichier** : `src/enums/Commons/adjacent.enum.ts`
- **Rôle** : Zones de slot adjacentes standard (prepend / append intérieur et extérieur) communes aux composants Field et Input.
- **Membres** :
  - `CLEAR = 'clear'`
  - `PREPEND = 'prepend'`
  - `APPEND = 'append'`
  - `APPEND_INNER = 'appendInner'`
  - `PREPEND_INNER = 'prependInner'`
- **Consommé par** : `OrigamField`, `OrigamInput`, `OrigamTextField`, composables de slots.

---

### `ALIGN`
- **Fichier** : `src/enums/Commons/align.enum.ts`
- **Rôle** : Valeurs d'alignement flexbox pour l'axe croisé (`align-items` / `align-self`).
- **Membres** :
  - `START = 'start'`
  - `END = 'end'`
  - `CENTER = 'center'`
  - `BASELINE = 'baseline'`
  - `STRETCH = 'stretch'`
- **Consommé par** : `OrigamGrid`, `OrigamRow`, composables de layout.

---

### `BLOCK`
- **Fichier** : `src/enums/Commons/anchor.enum.ts`
- **Rôle** : Valeurs de l'axe de bloc (vertical) pour les props d'ancrage et de localisation.
- **Membres** :
  - `TOP = 'top'`
  - `BOTTOM = 'bottom'`
- **Consommé par** : `useLocation`, composants overlays (Menu, Tooltip, Dialog).

---

### `INLINE`
- **Fichier** : `src/enums/Commons/anchor.enum.ts`
- **Rôle** : Valeurs de l'axe en ligne (horizontal). Annoté `TODO - rework inline` dans le source.
- **Membres** :
  - `LEFT = 'left'`
  - `RIGHT = 'right'`
- **Consommé par** : `useLocation`, `anchor.const.ts`.

---

### `START_END`
- **Fichier** : `src/enums/Commons/anchor.enum.ts`
- **Rôle** : Valeurs logiques de positionnement indépendantes de la direction de texte.
- **Membres** :
  - `START = 'start'`
  - `END = 'end'`
- **Consommé par** : `anchor.const.ts` (`BLOCK_START_END_ARRAY`, `INLINE_START_END_ARRAY`).

---

### `BORDER_STYLE`
- **Fichier** : `src/enums/Commons/border.enum.ts`
- **Rôle** : Valeurs CSS valides pour la propriété `border-style`.
- **Membres** : `NONE`, `HIDDEN`, `DOTTED`, `DASHED`, `SOLID`, `DOUBLE`, `GROOVE`, `RIDGE`, `INSET`, `OUTSET` — valeurs identiques aux mots-clés CSS.
- **Consommé par** : `useBorder`, `IBorderProps`, stories de bordures.

---

### `CALENDAR_STRATEGY`
- **Fichier** : `src/enums/Commons/calendar.enum.ts`
- **Rôle** : Mode de placement du calendrier dans les champs date.
- **Membres** :
  - `DYNAMIC = 'dynamic'` — s'adapte à l'espace disponible
  - `STATIC = 'static'` — position fixe
- **Consommé par** : `OrigamDatePicker`, `OrigamDatePickerField`.

---

### `DENSITY`
- **Fichier** : `src/enums/Commons/density.enum.ts`
- **Rôle** : Niveaux de densité visuelle (espacement interne) des composants.
- **Membres** :
  - `DEFAULT = 'default'`
  - `COMPACT = 'compact'`
  - `COMFORTABLE = 'comfortable'`
- **Consommé par** : `useDensity`, `IDensityProps`, `PREDIFINED_DENSITY` (const), tous les composants avec prop `density`.

---

### `DIMENSIONS`
- **Fichier** : `src/enums/Commons/dimension.enum.ts`
- **Rôle** : Clés de l'interface `IDimensionProps` — noms de props de dimension.
- **Membres** :
  - `HEIGHT = 'height'`
  - `MAX_HEIGHT = 'maxHeight'`
  - `MAX_WIDTH = 'maxWidth'`
  - `MIN_HEIGHT = 'minHeight'`
  - `MIN_WIDTH = 'minWidth'`
  - `WIDTH = 'width'`
- **Consommé par** : `useDimension`, `DIMENSIONS_ARRAY` (const), validation de props.

---

### `DIRECTION`
- **Fichier** : `src/enums/Commons/direction.enum.ts`
- **Rôle** : Orientation d'un composant (layout, scroll, swipe…).
- **Membres** :
  - `HORIZONTAL = 'horizontal'`
  - `VERTICAL = 'vertical'`
- **Consommé par** : `OrigamDivider`, `OrigamSlider`, `OrigamParallax`, composables de scroll.

---

### `BREAKPOINTS`
- **Fichier** : `src/enums/Commons/display.enum.ts`
- **Rôle** : Identifiants des points de rupture responsive du système de grille.
- **Membres** :
  - `XS = 'xs'`, `SM = 'sm'`, `MD = 'md'`, `LG = 'lg'`, `XL = 'xl'`, `XXL = 'xxl'`
- **Consommé par** : `useDisplay`, `DEFAULT_DISPLAY_OPTIONS`, `BREAKPOINTS_ARRAY`, `IDisplayOptions`, `OrigamCol`, props responsive.

---

### `AXIS`
- **Fichier** : `src/enums/Commons/drag.enum.ts`
- **Rôle** : Contrainte d'axe pour le drag-and-drop et les gestes.
- **Membres** :
  - `BOTH = 'both'`, `X = 'x'`, `Y = 'y'`
- **Consommé par** : `useDrag`, `OrigamParallax`, composants avec prop `axis`.

---

### `FILTERS_MODE`
- **Fichier** : `src/enums/Commons/filters.enum.ts`
- **Rôle** : Stratégie d'application de plusieurs filtres simultanés.
- **Membres** :
  - `SOME = 'some'` — au moins un filtre satisfait
  - `EVERY = 'every'` — tous les filtres satisfaits
  - `UNION = 'union'` — union des résultats
  - `INTERSECTION = 'intersection'` — intersection des résultats
- **Consommé par** : `OrigamDataTable`, `useFilter`, composants avec recherche multicritère.

---

### `KEYBOARD_MODIFIERS_KEY`
- **Fichier** : `src/enums/Commons/hotkey.enum.ts`
- **Rôle** : Noms canoniques des touches modificatrices clavier.
- **Membres** :
  - `CONTROL = 'ctrl'`, `SHIFT = 'shift'`, `ALT = 'alt'`, `META = 'meta'`, `COMMAND = 'cmd'`
- **Consommé par** : `useHotkey`, `KEYBOARD_MODIFIERS` (const), `OrigamCommandPalette`.

---

### `KEYBOARD_VALUES`
- **Fichier** : `src/enums/Commons/hotkey.enum.ts`
- **Rôle** : Valeurs de `KeyboardEvent.key` pour les touches spéciales, permettant de banaliser la gestion clavier sans magic strings.
- **Membres** (18) : `ENTER = 'Enter'`, `TAB = 'Tab'`, `DELETE = 'Delete'`, `ESC = 'Escape'`, `SPACE = 'Space'`, `UP = 'ArrowUp'`, `DOWN = 'ArrowDown'`, `LEFT = 'ArrowLeft'`, `RIGHT = 'ArrowRight'`, `END = 'End'`, `HOME = 'Home'`, `BACKSPACE = 'Backspace'`, `INSERT = 'Insert'`, `PAGEUP = 'PageUp'`, `PAGEDOWN = 'PageDown'`, `SHIFT = 'Shift'`, `EMPTY = ' '`
- **Consommé par** : `COMPOSITION_IGNORE_KEYS` (const), tous les composants avec navigation clavier.

---

### `JUSTIFY`
- **Fichier** : `src/enums/Commons/justify.enum.ts`
- **Rôle** : Valeurs CSS de justification du contenu (axe principal flex/grid).
- **Membres** : `START`, `END`, `CENTER`, `SPACE_BETWEEN = 'space-between'`, `SPACE_AROUND = 'space-around'`, `SPACE_EVENLY = 'space-evenly'`
- **Consommé par** : `OrigamGrid`, composants de layout, `IJustifyProps`.

---

### `LOCATION_STRATEGIES`
- **Fichier** : `src/enums/Commons/location.enum.ts`
- **Rôle** : Type de stratégie de positionnement des overlays.
- **Membres** :
  - `STATIC = 'static'` — position viewport fixe (centré)
  - `CONNECTED = 'connected'` — ancré à un élément DOM précis
- **Consommé par** : `useLocation`, `LOCATION_STRATEGIES` (const map), `OrigamMenu`, `OrigamTooltip`.

---

### `MODE`
- **Fichier** : `src/enums/Commons/mode.enum.ts`
- **Rôle** : Mode de transition / décalage dans les composants à fenêtre glissante.
- **Membres** :
  - `HORIZONTAL = 'horizontal'`, `VERTICAL = 'vertical'`, `SHIFT = 'shift'`
- **Consommé par** : `OrigamWindow`, `OrigamCarousel`, transitions.

---

### `SELECT_STRATEGY`
- **Fichier** : `src/enums/Commons/nested.enum.ts`
- **Rôle** : Algorithme de sélection dans les arbres hiérarchiques.
- **Membres** :
  - `SINGLE_LEAF = 'single-leaf'` — une seule feuille sélectionnable
  - `LEAF = 'leaf'` — toutes les feuilles sélectionnables, pas les nœuds
  - `INDEPENDENT = 'independent'` — chaque nœud indépendant
  - `SINGLE_INDEPENDENT = 'single-independent'` — sélection unique sans hiérarchie
  - `CLASSIC = 'classic'` — sélection parent/enfant liée
- **Consommé par** : `useNested`, `OrigamTreeview`, `OrigamList` avec select.

---

### `OPEN_STRATEGY`
- **Fichier** : `src/enums/Commons/nested.enum.ts`
- **Rôle** : Règle d'ouverture des nœuds dans les arbres.
- **Membres** :
  - `SINGLE = 'single'` — un seul nœud ouvert à la fois
  - `MULTIPLE = 'multiple'` — plusieurs nœuds simultanément
  - `LIST = 'list'` — ouvre toute la branche vers la racine
- **Consommé par** : `SINGLE_OPEN_STRATEGY`, `MULTIPLE_OPEN_STRATEGY`, `LIST_OPEN_STRATEGY` (consts), `OrigamTreeview`, `OrigamList`.

---

### `SELECTED`
- **Fichier** : `src/enums/Commons/nested.enum.ts`
- **Rôle** : État de sélection d'un nœud dans un arbre ou une liste.
- **Membres** :
  - `ON = 'on'`, `OFF = 'off'`, `INDETERMINATE = 'indeterminate'`
- **Consommé par** : `useNested`, `OrigamTreeview`, `OrigamCheckbox` (état indéterminé).

---

### `POSITION`
- **Fichier** : `src/enums/Commons/position.enum.ts`
- **Rôle** : Valeurs CSS de la propriété `position`.
- **Membres** : `STATIC`, `RELATIVE`, `FIXED`, `ABSOLUTE`, `STICKY`
- **Consommé par** : `IPositionProps`, `usePosition`, `OrigamAudio`, `OrigamAppBar`.

---

### `ROUNDED`
- **Fichier** : `src/enums/Commons/rounded.enum.ts`
- **Rôle** : Variantes prédéfinies de rayon de coin, chacune correspondant à un token dans `tokens/primitive.json` sous `radius.*` et à une classe utility `.origam--rounded-{value}`.
- **Membres** :
  - `X_SMALL = 'x-small'`, `SMALL = 'small'`, `DEFAULT = 'default'`, `MEDIUM = 'medium'`, `LARGE = 'large'`, `X_LARGE = 'x-large'`, `SHAPED = 'shaped'`, `SHAPED_INVERT = 'shaped-invert'`
- **Consommé par** : `useRounded`, `PREDEFINED_ROUNDED` (const), `BORDER_RADIUS_REGEX`, tous les composants avec prop `rounded`.

---

### `SCROLL_STRATEGIES`
- **Fichier** : `src/enums/Commons/scroll.enum.ts`
- **Rôle** : Comportement du scroll quand un overlay est ouvert.
- **Membres** :
  - `NONE = 'none'` — aucun comportement
  - `CLOSE = 'close'` — ferme l'overlay au scroll
  - `BLOCK = 'block'` — bloque le scroll du document
  - `REPOSITION = 'reposition'` — repositionne l'overlay
- **Consommé par** : `SCROLL_STRATEGIES` (const map), `OrigamMenu`, `OrigamDialog`, overlays.

---

### `SIZES`
- **Fichier** : `src/enums/Commons/size.enum.ts`
- **Rôle** : Variantes de taille standardisées pour les composants.
- **Membres** :
  - `X_SMALL = 'x-small'`, `SMALL = 'small'`, `DEFAULT = 'default'`, `LARGE = 'large'`, `X_LARGE = 'x-large'`
- **Consommé par** : `useSize`, `ISizeProps`, `SIZES_ARRAY` (const), `OrigamBtn`, `OrigamChip`, `OrigamAvatar`, `OrigamIcon`, etc.

---

### `SORT_DIRECTION`
- **Fichier** : `src/enums/Commons/sort.enum.ts`
- **Rôle** : Sens de tri d'une colonne.
- **Membres** :
  - `ASC = 'asc'`, `DESC = 'desc'`
- **Consommé par** : `OrigamDataTable`, `IDataTableSortItem`, composables de tri.

---

### `STATUS`
- **Fichier** : `src/enums/Commons/status.enum.ts`
- **Rôle** : Niveaux de statut sémantique (cohérents avec `TIntent`).
- **Membres** :
  - `SUCCESS = 'success'`, `INFO = 'info'`, `WARNING = 'warning'`, `ERROR = 'error'`
- **Consommé par** : `OrigamAlert`, `OrigamSnackbar`, composants de feedback.

---

### `STATUS_POSITION`
- **Fichier** : `src/enums/Commons/status.enum.ts`
- **Rôle** : Emplacement de l'icône de statut dans un composant de feedback.
- **Membres** :
  - `PREPEND = 'prepend'`, `APPEND = 'append'`, `REPLACE = 'replace'`, `BOTH = 'both'`
- **Consommé par** : composants avec prop `statusPosition`.

---

### `TOUCH_EVENTS`
- **Fichier** : `src/enums/Commons/touch.enum.ts`
- **Rôle** : Noms des événements touch natifs pour éviter les magic strings dans les listeners.
- **Membres** :
  - `TOUCH_START = 'touchstart'`, `TOUCH_END = 'touchend'`, `TOUCH_MOVE = 'touchmove'`
- **Consommé par** : `useTouch`, directive `v-touch`, composants glissables (Sheet, Carousel).

---

### `VALIDATE_ON`
- **Fichier** : `src/enums/Commons/validation.enum.ts`
- **Rôle** : Déclencheurs de validation d'un champ de formulaire. Supporte les formes composées (`lazy blur`, `input lazy`…).
- **Membres** (10) :
  - `BLUR = 'blur'`, `INPUT = 'input'`, `SUBMIT = 'submit'`
  - `LAZY_BLUR = 'lazy blur'`, `LAZY_INPUT = 'lazy input'`, `LAZY_SUBMIT = 'lazy submit'`
  - `BLUR_LAZY = 'blur lazy'`, `INPUT_LAZY = 'input lazy'`, `SUBMIT_LAZY = 'submit lazy'`
  - `LAZY = 'lazy'`
- **Consommé par** : `useValidation`, `OrigamForm`, `IInputProps`, tous les champs de saisie.

---

### `VARIANT`
- **Fichier** : `src/enums/Commons/variant.enum.ts`
- **Rôle** : Variantes visuelles des surfaces à élévation (Btn, Card, Chip…). Miroir du vocabulaire Vuetify pour la portabilité. Inclut `GHOST` pour le glassmorphisme (avec fallback CSS `@supports` pour les navigateurs sans `backdrop-filter`).
- **Membres** :
  - `TEXT = 'text'`, `FLAT = 'flat'`, `ELEVATED = 'elevated'`, `TONAL = 'tonal'`, `OUTLINED = 'outlined'`, `PLAIN = 'plain'`, `GHOST = 'ghost'`
- **Consommé par** : `IVariantProps`, `useVariant`, `OrigamBtn`, `OrigamCard`, `OrigamChip`, `OrigamAlert`.

---

### `VARIANT_INPUT`
- **Fichier** : `src/enums/Commons/variant.enum.ts`
- **Rôle** : Variantes visuelles spécifiques aux champs de saisie (distinct de `VARIANT` car la convention de rendu diffère).
- **Membres** :
  - `UNDERLINED = 'underlined'`, `FILLED = 'filled'`, `SOLO = 'solo'`, `OUTLINED = 'outlined'`, `PLAIN = 'plain'`
- **Consommé par** : `IFieldProps`, `useField`, `OrigamTextField`, `OrigamPasswordField`, `OrigamSelect`.

---

### Domaine : Audio

### `AUDIO_LOOP_MODE`
- **Fichier** : `src/enums/Audio/audio-loop-mode.enum.ts`
- **Rôle** : Stratégie de boucle lecture dans une playlist. Le bouton boucle cycle `NONE → ALL → ONE → NONE`.
- **Membres** :
  - `NONE = 'none'` — pas de boucle, arrêt en fin de playlist
  - `ALL = 'all'` — boucle toute la playlist
  - `ONE = 'one'` — boucle le titre courant (prev/next naviguent quand même)
- **Consommé par** : `OrigamAudio`, `useMediaPlayer`.

---

### `AUDIO_VARIANT`
- **Fichier** : `src/enums/Audio/audio-variant.enum.ts`
- **Rôle** : Layout visuel du lecteur audio. `NORMAL` et `MINIMAL` sont des alias dépréciés v0.x conservés pour la compatibilité ascendante.
- **Membres** :
  - `EXPANDED = 'expanded'` — surface complète avec jaquette 96 px, métadonnées et waveform
  - `COMPACT = 'compact'` — dock transport-only, jaquette 48 px, pas de waveform
  - `NORMAL = 'normal'` — **déprécié**, alias de `EXPANDED`
  - `MINIMAL = 'minimal'` — **déprécié**, alias de `COMPACT`
- **Consommé par** : `OrigamAudio`, `AUDIO_DEFAULTS`.

---

### `COVER_POSITION`
- **Fichier** : `src/enums/Audio/cover-position.enum.ts`
- **Rôle** : Côté de la jaquette album par rapport à la colonne contrôleur/métadonnées.
- **Membres** : `LEFT = 'left'`, `RIGHT = 'right'`
- **Consommé par** : `OrigamAudio`, `AUDIO_DEFAULTS`.

---

### Domaine : Blockquote

### `BLOCKQUOTE_LANG`
- **Fichier** : `src/enums/Blockquote/blockquote-lang.enum.ts`
- **Rôle** : Langue utilisée pour choisir les guillemets typographiques. `AUTO` résout la langue depuis `document.documentElement.lang` à l'exécution.
- **Membres** : `FR = 'fr'`, `EN = 'en'`, `ES = 'es'`, `DE = 'de'`, `AUTO = 'auto'`
- **Consommé par** : `OrigamBlockquote`, `BLOCKQUOTE_LANGS`, `QUOTE_MARKS_BY_LANG`.

---

### `BLOCKQUOTE_VARIANT`
- **Fichier** : `src/enums/Blockquote/blockquote-variant.enum.ts`
- **Rôle** : Style visuel de la citation.
- **Membres** : `DEFAULT = 'default'`, `ELEGANT = 'elegant'`, `QUOTED = 'quoted'`, `MINIMAL = 'minimal'`, `PULL = 'pull'`
- **Consommé par** : `OrigamBlockquote`, `BLOCKQUOTE_VARIANTS`, `BLOCKQUOTE_DEFAULTS`.

---

### Domaine : Bracket

### `BRACKET_MATCH_STATUS`
- **Fichier** : `src/enums/Bracket/bracket-match-status.enum.ts`
- **Rôle** : État d'un match dans un tableau de tournoi.
- **Membres** : `PENDING = 'pending'`, `LIVE = 'live'`, `COMPLETED = 'completed'`, `FORFEITED = 'forfeited'`
- **Consommé par** : `IBracketMatch`, `OrigamBracket`, `BRACKET_MATCH_STATUSES`.

---

### `BRACKET_VARIANT`
- **Fichier** : `src/enums/Bracket/bracket-variant.enum.ts`
- **Rôle** : Format du tableau de compétition.
- **Membres** : `SINGLE_ELIMINATION = 'single-elimination'`, `DOUBLE_ELIMINATION = 'double-elimination'`, `ROUND_ROBIN = 'round-robin'`
- **Consommé par** : `OrigamBracket`, `BRACKET_VARIANTS`.

---

### Domaine : Card

### `CARD_TYPE`
- **Fichier** : `src/enums/Card/card.enum.ts`
- **Rôle** : Mode d'affichage d'une liste de cartes.
- **Membres** : `GRID = 'grid'`, `LIST = 'list'`
- **Consommé par** : `OrigamCard`, prop `type`.

---

### Domaine : Chart (famille de 15 enums)

### `CHART_TYPE`
- **Fichier** : `src/enums/Chart/chart.enum.ts`
- **Rôle** : Identifiants de tous les types de graphiques supportés par `OrigamChart`.
- **Membres** (28) : `LINE`, `AREA`, `BAR`, `COLUMN`, `PIE`, `DONUT`, `SCATTER`, `RADAR`, `SPLINE`, `STEPPED_LINE`, `GAUGE`, `PYRAMID`, `FUNNEL`, `HONEYCOMB`, `TREEMAP`, `SANKEY`, `WORD_CLOUD`, `HEATMAP`, `SUNBURST`, `BOX_PLOT`, `PICTORIAL`, `CANDLESTICK`, `STREAMGRAPH`, `VARIWIDE`, `POLAR_BAR`, `BULLET`, `PARETO`, `MAP`, `SPARKLINE`
- **Consommé par** : `OrigamChart`, prop `type`.

---

### `CHART_BULLET_ORIENTATION`
- **Fichier** : `src/enums/Chart/chart-bullet-orientation.enum.ts`
- **Rôle** : Orientation d'un graphique bullet.
- **Membres** : `HORIZONTAL`, `VERTICAL`
- **Consommé par** : `OrigamChartBullet`.

---

### `CHART_CARTESIAN_KIND`
- **Fichier** : `src/enums/Chart/chart-cartesian-kind.enum.ts`
- **Rôle** : Topologie d'un graphique cartésien (évite les magic strings pour les switch internes).
- **Membres** : `LINE`, `AREA`, `BAR`, `COLUMN`, `SCATTER`, `SPLINE`, `STEPPED_LINE`
- **Consommé par** : `OrigamChartCartesian`, composable chart cartésien.

---

### `CHART_HONEYCOMB_COLOR_MODE`
- **Fichier** : `src/enums/Chart/chart-honeycomb-color-mode.enum.ts`
- **Rôle** : Mode de colorisation du graphique nid d'abeille.
- **Membres** : `CATEGORICAL = 'categorical'`, `HEATMAP = 'heatmap'`
- **Consommé par** : `OrigamChartHoneycomb`.

---

### `CHART_HONEYCOMB_ORIENTATION`
- **Fichier** : `src/enums/Chart/chart-honeycomb-orientation.enum.ts`
- **Rôle** : Orientation des hexagones.
- **Membres** : `POINTY_TOP = 'pointy-top'`, `FLAT_TOP = 'flat-top'`
- **Consommé par** : `OrigamChartHoneycomb`.

---

### `CHART_MAP_MODE`
- **Fichier** : `src/enums/Chart/chart-map-mode.enum.ts`
- **Rôle** : Mode du graphique cartographique.
- **Membres** : `CHOROPLETH = 'choropleth'`, `FLIGHT_ROUTES = 'flight-routes'`
- **Consommé par** : `OrigamChartMap`.

---

### `CHART_PICTORIAL_DIRECTION`
- **Fichier** : `src/enums/Chart/chart-pictorial-direction.enum.ts`
- **Rôle** : Direction de remplissage du graphique pictorial.
- **Membres** : `VERTICAL`, `HORIZONTAL`
- **Consommé par** : `OrigamChartPictorial`.

---

### `CHART_PICTORIAL_MODE`
- **Fichier** : `src/enums/Chart/chart-pictorial-mode.enum.ts`
- **Rôle** : Mode de répétition/remplissage des icônes dans le chart pictorial.
- **Membres** : `STACK = 'stack'`, `FILL = 'fill'`
- **Consommé par** : `OrigamChartPictorial`.

---

### `CHART_POLAR_KIND`
- **Fichier** : `src/enums/Chart/chart-polar-kind.enum.ts`
- **Rôle** : Type de graphique polaire (deux valeurs uniquement).
- **Membres** : `PIE = 'pie'`, `DONUT = 'donut'`
- **Consommé par** : `OrigamChartPolar`.

---

### `CHART_PYRAMID_KIND`
- **Fichier** : `src/enums/Chart/chart-pyramid-kind.enum.ts`
- **Rôle** : Sous-type du chart pyramide.
- **Membres** : `PYRAMID = 'pyramid'`, `FUNNEL = 'funnel'`
- **Consommé par** : `OrigamChartPyramid`.

---

### `CHART_SPARKLINE_KIND`
- **Fichier** : `src/enums/Chart/chart-sparkline-kind.enum.ts`
- **Rôle** : Type de sparkline.
- **Membres** : `LINE`, `AREA`, `COLUMN`, `BAR`
- **Consommé par** : `OrigamChartSparkline`.

---

### `CHART_STACKING`
- **Fichier** : `src/enums/Chart/chart-stacking.enum.ts`
- **Rôle** : Stratégie d'empilement pour les charts barres/colonnes/area. `PERCENT` normalise à 100 % avec axe Y fixé.
- **Membres** : `NORMAL = 'normal'`, `PERCENT = 'percent'`
- **Consommé par** : `OrigamChart`, `OrigamChartCartesian`.

---

### `CHART_STREAMGRAPH_OFFSET`
- **Fichier** : `src/enums/Chart/chart-streamgraph-offset.enum.ts`
- **Rôle** : Algorithme de décalage de référence pour le streamgraph.
- **Membres** : `WIGGLE`, `SILHOUETTE`, `EXPAND`, `ZERO`
- **Consommé par** : `OrigamChartStreamgraph`.

---

### `CHART_TREEMAP_ALGORITHM`
- **Fichier** : `src/enums/Chart/chart-treemap-algorithm.enum.ts`
- **Rôle** : Algorithme de placement des rectangles dans un treemap.
- **Membres** : `SQUARIFIED = 'squarified'`, `SLICE_DICE = 'slice-dice'`
- **Consommé par** : `OrigamChartTreemap`.

---

### `CHART_WORD_CLOUD_ROTATION`
- **Fichier** : `src/enums/Chart/chart-word-cloud-rotation.enum.ts`
- **Rôle** : Stratégie de rotation des mots dans un nuage de mots.
- **Membres** : `NONE`, `RANDOM`, `ORTHOGONAL`
- **Consommé par** : `OrigamChartWordCloud`.

---

### Domaine : Code

### `CODE_LANG`
- **Fichier** : `src/enums/Code/code-lang.enum.ts`
- **Rôle** : Langages de coloration syntaxique supportés, en lockstep avec le bundle shiki. Chaque membre correspond à une grammaire chargée (~50–100 KB).
- **Membres** (14) : `PLAINTEXT`, `VUE`, `TS`, `JS`, `TSX`, `JSX`, `SCSS`, `CSS`, `JSON`, `BASH`, `HTML`, `XML`, `YAML`, `MD`
- **Consommé par** : `OrigamCode`, `useCode`, `SUPPORTED_LANGS`, `CODE_DEFAULTS`.

---

### `CODE_THEME`
- **Fichier** : `src/enums/Code/code-theme.enum.ts`
- **Rôle** : Mode de thème du colorateur syntaxique. `AUTO` suit l'attribut `<html data-theme>` ou `prefers-color-scheme`.
- **Membres** : `AUTO = 'auto'`, `LIGHT = 'light'`, `DARK = 'dark'`
- **Consommé par** : `OrigamCode`, `useCode`.

---

### Domaine : ColorPicker

### `COLOR_MODES_NAMES`
- **Fichier** : `src/enums/ColorPicker/color-picker.enum.ts`
- **Rôle** : Modes de saisie de couleur disponibles dans le ColorPicker.
- **Membres** : `RGB = "rgb"`, `RGBA = "rgba"`, `HSL = "hsl"`, `HSLA = "hsla"`, `HEX = "hex"`, `HEXA = "hexa"`
- **Consommé par** : `OrigamColorPicker`, `COLOR_PICKER_MODES` (const).

---

### Domaine : DataTable

### `DATATABLE_SELECT_STRATEGY`
- **Fichier** : `src/enums/DataTable/data-table.enum.ts`
- **Rôle** : Stratégie de sélection des lignes dans la DataTable.
- **Membres** :
  - `SINGLE = 'single'` — une seule ligne
  - `PAGE = 'page'` — toute la page courante
  - `ALL = 'all'` — tous les éléments
- **Consommé par** : `OrigamDataTable`, stratégies de sélection (`singleSelectStrategy`, `pageSelectStrategy`, `allSelectStrategy`).

---

### Domaine : DatePicker

### `DATE_MODE`
- **Fichier** : `src/enums/DatePicker/date-picker.enum.ts`
- **Rôle** : Vue courante du calendrier.
- **Membres** : `MONTH = 'month'`, `MONTHS = 'months'`, `YEARS = 'years'`
- **Consommé par** : `OrigamDatePicker`.

---

### Domaine : EmptyState

### `EMPTY_STATE_PRESET`
- **Fichier** : `src/enums/EmptyState/empty-state-preset.enum.ts`
- **Rôle** : Preset prédéfini pour `<OrigamEmptyState>`. Miroir du type `TEmptyStatePreset` pour permettre l'itération runtime (`Object.values(EMPTY_STATE_PRESET)`). Valeurs en kebab-case pour l'interchangeabilité avec le type.
- **Membres** : `NO_DATA = 'no-data'`, `NO_RESULTS = 'no-results'`, `ERROR = 'error'`, `OFFLINE = 'offline'`, `LOCKED = 'locked'`
- **Consommé par** : `OrigamEmptyState`, `EMPTY_STATE_PRESETS`, `EMPTY_STATE_PRESET_CONFIG`.

---

### Domaine : Grids

### `COLS`
- **Fichier** : `src/enums/Grids/col.enum.ts`
- **Rôle** : Nombres de colonnes de 1 à 12, sous forme d'enum pour éviter les valeurs numériques magiques dans les props de grille.
- **Membres** : `ONE = 1` à `TWELVE = 12` (valeurs entières)
- **Consommé par** : `OrigamCol`, props de grille responsive.

---

### `FLEX_DIRECTION`
- **Fichier** : `src/enums/Grids/row.enum.ts`
- **Rôle** : Direction flex des lignes de la grille.
- **Membres** : `ROW = 'row'`, `COLUMN = 'column'`, `COLUMN_REVERSE = 'column-reverse'`, `ROW_REVERSE = 'row-reverse'`
- **Consommé par** : `OrigamRow`.

---

### Domaine : Img

### `CROSS_ORIGIN`
- **Fichier** : `src/enums/Img/img.enum.ts`
- **Rôle** : Valeurs de l'attribut HTML `crossorigin` pour les images.
- **Membres** : `ANONYMOUS = 'anonymous'`, `USE_CREDENTIALS = 'use-credentials'`
- **Consommé par** : `OrigamImg`.

---

### `REFERRER_POLICY`
- **Fichier** : `src/enums/Img/img.enum.ts`
- **Rôle** : Valeurs de l'attribut HTML `referrerpolicy`.
- **Membres** (8) : `NO_REFERRER`, `NO_REFERRER_WHEN_DOWNGRADE`, `ORIGIN`, `ORIGIN_WHEN_CROSS_ORIGIN`, `SAME_ORIGIN`, `STRICT_ORIGIN`, `STRICT_ORIGIN_WHEN_CROSS_ORIGIN`, `UNSAFE_URL`
- **Consommé par** : `OrigamImg`.

---

### `IMG_STATE`
- **Fichier** : `src/enums/Img/img.enum.ts`
- **Rôle** : État du chargement d'une image.
- **Membres** : `IDLE = 'idle'`, `LOADING = 'loading'`, `LOADED = 'loaded'`, `ERROR = 'error'`
- **Consommé par** : `OrigamImg`, `useImg`.

---

### Domaine : InfiniteScroll

### `INFINITE_SCROLL_SIDE`
- **Fichier** : `src/enums/InfiniteScroll/infinite-scroll.enum.ts`
- **Rôle** : Côté du déclencheur de chargement infini.
- **Membres** : `START = 'start'`, `END = 'end'`, `BOTH = 'both'`
- **Consommé par** : `OrigamInfiniteScroll`.

---

### `INFINITE_SCROLL_MODE`
- **Fichier** : `src/enums/InfiniteScroll/infinite-scroll.enum.ts`
- **Rôle** : Mécanisme de déclenchement du chargement.
- **Membres** : `INTERSECT = 'intersect'`, `MANUAL = 'manual'`
- **Consommé par** : `OrigamInfiniteScroll`.

---

### `INFINITE_SCROLL_STATUS`
- **Fichier** : `src/enums/InfiniteScroll/infinite-scroll.enum.ts`
- **Rôle** : État courant du scroll infini.
- **Membres** : `OK = 'ok'`, `EMPTY = 'empty'`, `LOADING = 'loading'`, `ERROR = 'error'`
- **Consommé par** : `OrigamInfiniteScroll`, slot `default`.

---

### Domaine : InlineEdit

### `INLINE_EDIT_ACTION`
- **Fichier** : `src/enums/InlineEdit/inline-edit-action.enum.ts`
- **Rôle** : Identifiant de chaque bouton d'action de `<OrigamInlineEdit>`. Utilisé pour construire les attributs `data-cy` et les `aria-label`.
- **Membres** : `EDIT = 'edit'`, `CONFIRM = 'confirm'`, `CANCEL = 'cancel'`
- **Consommé par** : `OrigamInlineEdit`.

---

### Domaine : List

### `LIST_ITEM_TYPE`
- **Fichier** : `src/enums/List/list-item.enum.ts`
- **Rôle** : Type d'un élément de liste.
- **Membres** : `ITEM = 'item'`, `SUBHEADER = 'subheader'`, `DIVIDER = 'divider'`
- **Consommé par** : `OrigamList`, `OrigamListItem`.

---

### `LINES`
- **Fichier** : `src/enums/List/list.enum.ts`
- **Rôle** : Nombre de lignes de texte visibles dans un item de liste (contrôle la hauteur de l'item).
- **Membres** : `ONE = 'one'`, `TWO = 'two'`, `THREE = 'three'`
- **Consommé par** : `OrigamList`, `OrigamListItem`.

---

### Domaine : Mask

### `BUILT_IN_PATTERN` (const as enum)
- **Fichier** : `src/enums/Mask/mask.enum.ts`
- **Rôle** : Clés des masques intégrés reconnus par `useMask` / `resolveMaskConfig`. Déclaré `as const` (pas `enum`) pour la compatibilité de type avec `BUILT_IN_PATTERNS`.
- **Membres** (13) : `PHONE_FR`, `PHONE_US`, `PHONE_INTERNATIONAL`, `IBAN`, `SIRET`, `CREDIT_CARD`, `DATE_ISO`, `DATE_FR`, `DATE_US`, `TIME`, `TIME_12H`, `POSTCODE_FR`, `POSTCODE_US`
- **Consommé par** : `BUILT_IN_PATTERNS` (const), `useMask`, `OrigamMaskField`.

---

### `PATTERN_VALIDATOR` (const as enum)
- **Fichier** : `src/enums/Mask/mask.enum.ts`
- **Rôle** : Clés des validateurs sémantiques (opèrent sur la valeur démasquée) : Luhn, IBAN mod-97, dates calendrier.
- **Membres** : `LUHN`, `IBAN`, `DATE_ISO`, `DATE_FR`, `DATE_US`
- **Consommé par** : `BUILT_IN_PATTERNS` (const), `useMask`.

---

### Domaine : OtpInputField

### `OTP_INPUT_FIELD_TYPE`
- **Fichier** : `src/enums/OtpInputField/otp-input-field.enum.ts`
- **Rôle** : Type HTML des cases de saisie OTP.
- **Membres** : `TEXT = 'text'`, `NUMBER = 'number'`, `PASSWORD = 'password'`
- **Consommé par** : `OrigamOtpInputField`.

---

### Domaine : Parallax

### `PARALLAX_DIRECTION`
- **Fichier** : `src/enums/Parallax/parallax-direction.enum.ts`
- **Rôle** : Axe du déplacement parallaxe.
- **Membres** : `VERTICAL`, `HORIZONTAL`, `BOTH`
- **Consommé par** : `OrigamParallax`.

---

### `PARALLAX_EASING`
- **Fichier** : `src/enums/Parallax/parallax-easing.enum.ts`
- **Rôle** : Courbe d'accélération appliquée au déplacement des couches.
- **Membres** : `LINEAR = 'linear'`, `EASE_OUT = 'ease-out'`, `SPRING = 'spring'`
- **Consommé par** : `OrigamParallax`, `OrigamParallaxLayer`.

---

### `PARALLAX_ELEMENT_TYPE`
- **Fichier** : `src/enums/Parallax/parallax-element.enum.ts`
- **Rôle** : Transformation CSS appliquée à une couche parallaxe.
- **Membres** : `SCALE`, `SCALE_X = 'scaleX'`, `SCALE_Y = 'scaleY'`, `TRANSLATE`, `ROTATE`, `DEPTH`, `DEPTH_INV = 'depth_inv'`, `CUSTOM`
- **Consommé par** : `OrigamParallaxLayer`.

---

### `PARALLAX_EVENT`
- **Fichier** : `src/enums/Parallax/parallax.enum.ts`
- **Rôle** : Événement déclencheur du déplacement parallaxe.
- **Membres** : `MOVE = 'move'`, `SCROLL = 'scroll'`, `ORIENTATION = 'orientation'`
- **Consommé par** : `OrigamParallax`.

---

### Domaine : Progress

### `PROGRESS_TYPE`
- **Fichier** : `src/enums/Progress/progress.enum.ts`
- **Rôle** : Forme du composant de progression.
- **Membres** : `CIRCULAR = 'circular'`, `LINEAR = 'linear'`
- **Consommé par** : `OrigamProgress`.

---

### Domaine : SliderField

### `SLIDER_FIELD_VARIANT`
- **Fichier** : `src/enums/SliderField/slider-field-variant.enum.ts`
- **Rôle** : Variante visuelle du champ slider.
  - `FIELD` — chrome complet `<origam-input>` (formulaire)
  - `TIMER` — rail fin sans chrome, style scrubber vidéo
  - `AUDIO` — identique à `TIMER` + fond waveform piloté par la prop `peaks`
- **Membres** : `FIELD = 'field'`, `TIMER = 'timer'`, `AUDIO = 'audio'`
- **Consommé par** : `OrigamSliderField`, `OrigamAudio`, `OrigamMediaController`.

---

### Domaine : Tabs

### `TAB_VARIANT`
- **Fichier** : `src/enums/Tabs/tab-variant.enum.ts`
- **Rôle** : Style visuel des onglets.
- **Membres** : `DEFAULT = 'default'`, `PILLS = 'pills'`, `UNDERLINE = 'underline'`
- **Consommé par** : `OrigamTabs`, `OrigamTab`.

---

### Domaine : TextField

### `TEXT_FIELD_TYPE`
- **Fichier** : `src/enums/TextField/text-field.enum.ts`
- **Rôle** : Valeurs de l'attribut `type` d'un `<input>` HTML, couvrant tous les types natifs (texte, fichier, couleur, date, boutons, cases…).
- **Membres** (22) : `TEXT`, `NUMBER`, `EMAIL`, `PASSWORD`, `HIDDEN`, `SEARCH`, `TEL`, `URL`, `IMAGE`, `RANGE`, `FILE`, `COLOR`, `SUBMIT`, `BUTTON`, `RESET`, `CHECKBOX`, `RADIO`, `TIME`, `DATETIME = 'datetime-local'`, `DATE`, `MONTH`, `WEEK`
- **Consommé par** : `OrigamTextField`, `ACTIVE_TEXT_FIELD_TYPE`, `INPUT_TEXT_FIELD_TYPE`.

---

### Domaine : Textarea

### `TEXTAREA_MODE`
- **Fichier** : `src/enums/Textarea/textarea-mode.enum.ts`
- **Rôle** : Mode de rendu du textarea. `RICH` remplace le `<textarea>` par un `contenteditable` dans le shell Field.
- **Membres** : `PLAIN = 'plain'`, `RICH = 'rich'`
- **Consommé par** : `OrigamTextareaField`.

---

### `TEXTAREA_OUTPUT`
- **Fichier** : `src/enums/Textarea/textarea-output.enum.ts`
- **Rôle** : Format de sérialisation du v-model en mode rich text.
- **Membres** : `HTML = 'html'`, `MARKDOWN = 'markdown'`
- **Consommé par** : `OrigamTextareaField`, `useTextareaRich`.

---

### `TEXTAREA_TOOLBAR_COMMAND`
- **Fichier** : `src/enums/Textarea/textarea-toolbar-command.enum.ts`
- **Rôle** : Identifiant de chaque commande de la barre d'outils rich text. Pilote le contrat `*Props`, le payload de l'emit `format` et la map de raccourcis clavier.
- **Membres** (12) : `BOLD`, `ITALIC`, `UNDERLINE`, `LINK`, `LIST_BULLET = 'list-bullet'`, `LIST_ORDERED = 'list-ordered'`, `HEADING_1 = 'heading-1'`, `HEADING_2 = 'heading-2'`, `HEADING_3 = 'heading-3'`, `HEADING`, `CODE_INLINE = 'code-inline'`, `CLEAR_FORMAT = 'clear-format'`
- **Consommé par** : `OrigamTextareaField`, `DEFAULT_TOOLBAR`, `useTextareaRich`.

---

### `TEXTAREA_TOOLBAR_POSITION`
- **Fichier** : `src/enums/Textarea/textarea-toolbar-position.enum.ts`
- **Rôle** : Position de la barre d'outils relative à la surface éditable.
- **Membres** : `TOP = 'top'`, `BOTTOM = 'bottom'`, `FLOATING = 'floating'`
- **Consommé par** : `OrigamTextareaField`.

---

### Domaine : Toolbar

### `SCROLL_BEHAVIOR`
- **Fichier** : `src/enums/Toolbar/toolbar.enum.ts`
- **Rôle** : Comportement de la barre d'app lors du scroll.
- **Membres** : `HIDE = 'hide'`, `INVERTED = 'inverted'`, `COLLAPSE = 'collapse'`, `ELEVATED = 'elevate'`
- **Consommé par** : `OrigamAppBar`.

---

### Domaine : Transition

### `TRANSITION_MODE`
- **Fichier** : `src/enums/Transition/transition.enum.ts`
- **Rôle** : Mode de transition Vue (`<Transition mode="…">`).
- **Membres** : `IN_OUT = 'in-out'`, `OUT_IN = 'out-in'`, `DEFAULT = 'default'`
- **Consommé par** : composants avec prop `transitionMode`.

---

### `EASING`
- **Fichier** : `src/enums/Transition/transition.enum.ts`
- **Rôle** : Courbes d'accélération Material Design exprimées en courbes de Bézier CSS.
- **Membres** :
  - `STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'`
  - `DECELERATE = 'cubic-bezier(0.0, 0, 0.2, 1)'`
  - `ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'`
- **Consommé par** : animations CSS de composants, `ripple.const.ts`.

---

### Domaine : Icon

### `MDI_ICONS`
- **Fichier** : `src/enums/Icon/mdi.enum.ts`
- **Rôle** : Catalogue exhaustif des icônes Material Design Icons au format `'mdi:mdi-{name}'`. Enum de ~7 299 lignes, la plus volumineuse du codebase.
- **Forme** : `ACCOUNT = 'mdi:mdi-account'`, `MAGNIFY = 'mdi:mdi-magnify'`, etc.
- **Consommé par** : `MDI_ALIASES` (const), `EMPTY_STATE_PRESET_CONFIG`, partout où une icône MDI est utilisée.

---

## Section 2 — Constantes

### Domaine : Commons

---

### `IN_BROWSER`, `DEFAULT_DOCUMENT`, `SUPPORTS_INTERSECTION`, `SUPPORTS_TOUCH`, `SUPPORTS_EYE_DROPPER`
- **Fichier** : `src/consts/Commons/commons.const.ts`
- **Rôle** : Guards de détection d'environnement SSR-safe.
  - `IN_BROWSER` — `true` si `window` et `document` existent
  - `DEFAULT_DOCUMENT` — `window.document` en navigateur, `undefined` en SSR
  - `SUPPORTS_INTERSECTION` — `IntersectionObserver` présent
  - `SUPPORTS_TOUCH` — événements touch disponibles
  - `SUPPORTS_EYE_DROPPER` — API EyeDropper disponible (ColorPicker natif)
- **Consommé par** : composables universels, directives.

---

### `HISTORY`, `HORIZON`
- **Fichier** : `src/consts/Commons/commons.const.ts`
- **Rôle** : Paramètres de la fenêtre d'historique undo/redo interne.
  - `HISTORY = 20`
  - `HORIZON = 100`
- **Consommé par** : Je ne sais pas avec certitude quels composables les consomment directement.

---

### `ON_REGEX`
- **Fichier** : `src/consts/Commons/commons.const.ts`
- **Rôle** : Regex `/^on[^a-z]/` pour détecter les props handler Vue (`onClick`, `onUpdate`, …). Utilisé pour séparer les props forward des attributs HTML.
- **Consommé par** : `useBindProps`, `mergeProps` interne.

---

### `EVENT_PROP`
- **Fichier** : `src/consts/Commons/commons.const.ts`
- **Rôle** : Factory de type de prop Vue pour les handlers d'événement typés (`[Function, Array] as PropType<TEventProp<T>>`).
- **Consommé par** : définitions de props d'événements dans les interfaces de composants.

---

### `ORIGAM_DEFAULTS_KEY`
- **Fichier** : `src/consts/Commons/defaults.const.ts`
- **Rôle** : Clé d'injection Vue (`InjectionKey<Ref<IDefault>>`) partagée entre `<OrigamDefaultsProvider>` et `useDefaults()`. Définie avec `Symbol.for(…)` pour survivre aux instances multiples du bundle.
- **Consommé par** : `OrigamDefaultsProvider`, `useDefaults`.

---

### `CSS_COLOR_REGEX`, `CSS_NAMED_COLORS`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** :
  - `CSS_COLOR_REGEX` — regex pour détecter les fonctions couleur CSS (`rgb(…)`, `hsl(…)`, etc.)
  - `CSS_NAMED_COLORS` — `Set` des 148 couleurs CSS nommées + mots-clés CSS-wide (`transparent`, `currentColor`, …)
- **Consommé par** : `isCssColor` (util), `useColor`, `useBackgroundColor`.

---

### `COLOR_MAPPERS`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** : Map des convertisseurs de fonctions couleur (`rgb`, `rgba`, `hsl`, `hsla`, `hsv`, `hsva`) vers l'espace RGBA interne.
- **Consommé par** : `parseColor` (util).

---

### `SRGB_FORWARD_MATRIX`, `SRGB_REVERSE_MATRIX`, `SRGB_FORWARD_TRANSFORM`, `SRGB_REVERSE_TRANSFORM`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** : Matrices de conversion et fonctions de gamma pour l'espace sRGB (ICC standard). Utilisées dans les calculs de contraste WCAG / APCA.
- **Consommé par** : utils de contraste couleur, `useColorEffect`.

---

### `CIELAB_FORWARD_TRANSFORM`, `CIELAB_REVERSE_TRANSFORM`, `COLOR_DELTA`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** : Fonctions de transformation vers/depuis l'espace CIE Lab (delta = `6÷29`).
- **Consommé par** : utils de contraste et de mélange de couleurs.

---

### `COLOR_INTENTS`, `COLOR_UTILITY_INTENTS`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** :
  - `COLOR_INTENTS` — `ReadonlySet` de tous les intents sémantiques reconnus par `useColorEffect`. Doit rester en sync avec `TIntent`.
  - `COLOR_UTILITY_INTENTS` — sous-ensemble pour lequel une classe utility `.origam--bg-{intent}` est émise. `ghost` est exclus (surface transparente, non exprimable par une classe statique).
- **Consommé par** : `useColor`, `useColorEffect`, `isIntent`.

---

### `COLOR_HOVER_MIX_PCT = 20`, `COLOR_ACTIVE_MIX_PCT = 30`
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** : Pourcentages de mélange avec le noir pour les états hover/active quand aucun token designer (`bgHover`, `bgActive`) n'est présent.
- **Consommé par** : `useColorEffect`.

---

### Constantes APCA (contraste)
- **Fichier** : `src/consts/Commons/color.const.ts`
- **Rôle** : Constantes numériques de l'algorithme APCA v0.0.98G (Accessible Perceptual Contrast Algorithm) : `RCO`, `GCO`, `BCO`, `NORM_BG`, `REV_BG`, `NORM_TXT`, `REV_TXT`, `BLK_THRS`, `BLK_CLMP`, `COLOR_DELTA_Y_MIN`, `SCALE_B_O_W`, `SCALE_W_O_B`, `LO_CON_THRESH`, `LO_CON_FACTOR`, `LO_CON_OFFSET`, `LO_CLIP`, `MAIN_TRC`
- **Consommé par** : utils de contraste APCA.

---

### `BLOCK_ARRAY`, `INLINE_ARRAY`, `BLOCK_START_END_ARRAY`, `INLINE_START_END_ARRAY`, `DIRECTION_ARRAY`
- **Fichier** : `src/consts/Commons/anchor.const.ts`
- **Rôle** : Tableaux de valeurs valides pour les axes bloc/inline, utilisés comme whitelist dans les props d'ancrage.
- **Consommé par** : `useLocation`, validation de la prop `anchor`.

---

### `COMPOSITION_IGNORE_KEYS`
- **Fichier** : `src/consts/Commons/autocomplete.const.ts`
- **Rôle** : Liste des touches à ignorer pendant la composition IME (flèches, entrée, échap, tabulation). Evite les conflits avec les autocomplétions asiatiques.
- **Consommé par** : `useVirtualKeyboard`, `OrigamAutocomplete`, `OrigamSelect`.

---

### `HANDLERS`
- **Fichier** : `src/consts/Commons/bindProps.const.ts`
- **Rôle** : `WeakMap<HTMLElement, Set<[string, () => void]>>` de handlers liés par élément. Permet le nettoyage propre des événements sans retenir de références.
- **Consommé par** : `useBindProps`.

---

### `BORDER_REGEX`
- **Fichier** : `src/consts/Commons/border.const.ts`
- **Rôle** : Regex d'analyse d'une valeur `border` libre en groupes `width`, `style`, `color`. Supporte hex, fonctions CSS, `var(--…)` (avec ou sans fallback) et noms CSS. L'alternance `var()` passe avant les mots bruts pour éviter que `var` soit consommé comme nom de couleur.
- **Consommé par** : `useBorder`.

---

### `ORIGAM_DATE_OPTIONS_KEY`, `ORIGAM_DATE_ADAPTER_KEY`
- **Fichier** : `src/consts/Commons/date.const.ts`
- **Rôle** : Clés d'injection Vue pour les options de date et l'adaptateur de date.
- **Consommé par** : `useDate`, `OrigamDatePicker`.

---

### `REGEX_DATE_YYYY_MM_DD`
- **Fichier** : `src/consts/Commons/date.const.ts`
- **Rôle** : Regex de validation du format ISO `YYYY-MM-DD` avec plages de mois/jours correctes.
- **Consommé par** : `useDate`, `OrigamDatePicker`.

---

### `FIRST_DAY`
- **Fichier** : `src/consts/Commons/date.const.ts`
- **Rôle** : `Record<string, number>` donnant le premier jour de la semaine (0 = dimanche, 1 = lundi, 6 = samedi) pour ~110 codes de territoire ISO-3166.
- **Consommé par** : `useDate`, affichage du calendrier.

---

### `PREDIFINED_DENSITY`
- **Fichier** : `src/consts/Commons/density.const.ts`
- **Rôle** : Tableau des valeurs de densité valides `[DEFAULT, COMPACT, COMFORTABLE]`.
- **Consommé par** : `useDensity`, validation de la prop `density`.

---

### `DIMENSIONS_ARRAY`
- **Fichier** : `src/consts/Commons/dimension.const.ts`
- **Rôle** : Tableau des 6 noms de props dimensionnelles (mirror de `DIMENSIONS` enum).
- **Consommé par** : `useDimension`, itération des props de dimension.

---

### `ORIGAM_DISPLAY_KEY`, `DEFAULT_DISPLAY_OPTIONS`, `BREAKPOINTS_ARRAY`
- **Fichier** : `src/consts/Commons/display.const.ts`
- **Rôle** :
  - `ORIGAM_DISPLAY_KEY` — clé d'injection pour `IDisplayInstance`
  - `DEFAULT_DISPLAY_OPTIONS` — options par défaut (`mobileBreakpoint: 'lg'`, seuils xs→xxl en px)
  - `BREAKPOINTS_ARRAY` — `[SM, MD, LG, XL, XXL]` (sans XS car < 600 px)
- **Consommé par** : `useDisplay`, `OrigamDisplayProvider`.

---

### `ORIGAM_SHADOW_RUNGS`, `UTILITY_SHADOW_RUNGS`
- **Fichier** : `src/consts/Commons/elevation.const.ts`
- **Rôle** :
  - `ORIGAM_SHADOW_RUNGS` — set complet : `none xs sm md lg xl 2xl 3xl`
  - `UTILITY_SHADOW_RUNGS` — sous-ensemble avec classe utility : `none xs sm md lg xl` (`2xl` et `3xl` restent en inline-style)
- **Consommé par** : `useElevation`, `elevationToToken`.

---

### `FORWARD_REFS`
- **Fichier** : `src/consts/Commons/forwardRefs.const.ts`
- **Rôle** : `Symbol('Forwarded refs')` — clé de stockage des refs transmises via `useForwardRefs`.
- **Consommé par** : `useForwardRefs`.

---

### `ORIGAM_GO_TO_KEY`
- **Fichier** : `src/consts/Commons/goTo.const.ts`
- **Rôle** : Clé d'injection pour `IGoToInstance` (scroll programmé vers cibles CSS ou éléments).
- **Consommé par** : `useGoTo`, `OrigamBtn[href]`.

---

### `KEYBOARD_MODIFIERS`, `KEYBOARD_ALIASES`
- **Fichier** : `src/consts/Commons/hotkey.const.ts`
- **Rôle** :
  - `KEYBOARD_MODIFIERS` — tableau des 5 modificateurs clavier valides
  - `KEYBOARD_ALIASES` — map d'alias normalisés (`control → ctrl`, `up → arrowup`, `esc → escape`, etc.)
- **Consommé par** : `useHotkey`.

---

### `HOVER`, `ORIGAM_HOVER_STOP_KEY`
- **Fichier** : `src/consts/Commons/hover.const.ts`
- **Rôle** :
  - `HOVER` — objet avec méthodes `show`/`hide` qui ajoutent/retirent une classe CSS hover sur l'élément
  - `ORIGAM_HOVER_STOP_KEY` — `Symbol` pour stopper la propagation de l'événement hover
- **Consommé par** : directive `v-hover`.

---

### `ORIGAM_LAYOUT_KEY`, `ORIGAM_LAYOUT_ITEM_KEY`, `ROOT_ZINDEX`
- **Fichier** : `src/consts/Commons/layout.const.ts`
- **Rôle** :
  - Clés d'injection pour le système de layout (AppBar, Drawer, Footer, BottomNav)
  - `ROOT_ZINDEX = 1000` — z-index de base pour les overlays
- **Consommé par** : `useLayout`, `OrigamAppBar`, `OrigamDrawer`.

---

### `ORIGAM_LOCALE_KEY`, `LOCALE_RTL_DEFAULT`
- **Fichier** : `src/consts/Commons/locale.const.ts`
- **Rôle** :
  - `ORIGAM_LOCALE_KEY` — clé d'injection pour `ILocaleInstance & IRtlInstance`
  - `LOCALE_RTL_DEFAULT` — map `{code: boolean}` de 40+ locales précisant leur direction RTL
- **Consommé par** : `useLocale`, `OrigamLocaleProvider`.

---

### `OPPOSITE_MAP`, `LOCATION_STRATEGIES`
- **Fichier** : `src/consts/Commons/location.const.ts`
- **Rôle** :
  - `OPPOSITE_MAP` — `{center→center, top→bottom, left→right, …}` pour le calcul d'ancrage opposé
  - `LOCATION_STRATEGIES` — map `{static: staticLocationStrategy, connected: connectedLocationStrategy}`
- **Consommé par** : `useLocation`.

---

### `MARGIN_REGEX`, `PADDING_REGEX`
- **Fichiers** : `src/consts/Commons/margin.const.ts`, `src/consts/Commons/padding.const.ts`
- **Rôle** : Regex de validation des valeurs `margin` / `padding` (0 à 4 valeurs avec unités CSS).
- **Consommé par** : `useMargin`, `usePadding`.

---

### `SINGLE_OPEN_STRATEGY`, `MULTIPLE_OPEN_STRATEGY`, `LIST_OPEN_STRATEGY`, `ORIGAM_NESTED_KEY`, `EMPTY_NESTED`
- **Fichier** : `src/consts/Commons/nested.const.ts`
- **Rôle** :
  - `SINGLE_OPEN_STRATEGY` — un seul nœud ouvert, referme les autres
  - `MULTIPLE_OPEN_STRATEGY` — plusieurs nœuds, ouvre la branche parente
  - `LIST_OPEN_STRATEGY` — sélection ferme les autres nœuds sauf branche sélectionnée
  - `ORIGAM_NESTED_KEY` — clé d'injection du contexte imbriqué
  - `EMPTY_NESTED` — sentinel noop pour les composants hors contexte
- **Consommé par** : `useNested`, `OrigamTreeview`, `OrigamList`.

---

### `ORIGAM_RIPPLE_STOP_KEY`, `DELAY_RIPPLE`, `KEYCODES`, `RIPPLE_OPTIONS`, `RIPPLES`
- **Fichier** : `src/consts/Commons/ripple.const.ts`
- **Rôle** :
  - `DELAY_RIPPLE = 80` — délai ms avant apparition
  - `KEYCODES` — map `{enter: 13, space: 32, …}` pour la directive ripple
  - `RIPPLE_OPTIONS` — options par défaut `{class, center, circle, duration: 1000, opacity: 0.3, …}`
  - `RIPPLES` — objet `{show, hide}` implémentant l'animation DOM complète (création/suppression de `span.origam-ripple__animation`)
- **Consommé par** : directive `v-ripple`.

---

### `BORDER_RADIUS_REGEX`, `PREDEFINED_ROUNDED`
- **Fichier** : `src/consts/Commons/rounded.const.ts`
- **Rôle** :
  - `BORDER_RADIUS_REGEX` — regex pour valeurs CSS de rayon libres (`4px`, `0`, `4px 0 4px 0`…)
  - `PREDEFINED_ROUNDED` — tableau des 8 variantes nommées
- **Consommé par** : `useRounded`.

---

### `SCROLL_STRATEGIES`
- **Fichier** : `src/consts/Commons/scroll.const.ts`
- **Rôle** : Map `{none: null, close: closeScrollStrategy, block: blockScrollStrategy, reposition: repositionScrollStrategy}` associant les valeurs de l'enum aux fonctions d'implémentation.
- **Consommé par** : overlays avec prop `scrollStrategy`.

---

### `SIZES_ARRAY`
- **Fichier** : `src/consts/Commons/size.const.ts`
- **Rôle** : Tableau des 5 tailles standardisées.
- **Consommé par** : `useSize`, validation de la prop `size`.

---

### `ORIGAM_STACK_KEY`, `GLOBAL_STACK`, `UP = -1`, `DOWN = 1`, `BUFFER_PX = 100`
- **Fichiers** : `src/consts/Commons/stack.const.ts`, `src/consts/Commons/virtual.const.ts`
- **Rôle** :
  - `ORIGAM_STACK_KEY` — clé d'injection pour le gestionnaire de z-index global
  - `GLOBAL_STACK` — stack réactive `[uid, zIndex][]` de tous les overlays
  - `UP / DOWN` — directions pour le scroll virtuel
  - `BUFFER_PX = 100` — zone tampon (px) autour de la fenêtre visible pour le rendu virtuel
- **Consommé par** : `useStack` (z-index), `useVirtual` (VirtualScroller).

---

### Domaine : Audio

### `WAVEFORM_DEFAULT_BINS = 200`, `AUDIO_DEFAULTS`
- **Fichier** : `src/consts/Audio/audio.const.ts`
- **Rôle** :
  - `WAVEFORM_DEFAULT_BINS` — nombre de bins waveform par défaut (200 = 1 pixel/bin sur 200 px)
  - `AUDIO_DEFAULTS` — objet DEFAULTS pour `OrigamAudio` (voir section pattern `_DEFAULTS`)
- **Consommé par** : `useWaveform`, stories de `OrigamAudio`.

---

### Domaine : Blockquote

### `BLOCKQUOTE_VARIANTS`, `BLOCKQUOTE_LANGS`, `BLOCKQUOTE_ALIGNS`, `QUOTE_MARKS_BY_LANG`, `BLOCKQUOTE_DEFAULTS`
- **Fichier** : `src/consts/Blockquote/blockquote.const.ts`
- **Rôle** :
  - Tableaux fermés des valeurs valides (`BLOCKQUOTE_VARIANTS`, `BLOCKQUOTE_LANGS`, `BLOCKQUOTE_ALIGNS`)
  - `QUOTE_MARKS_BY_LANG` — map `{fr: {open:'« ', close:' »'}, en: {…}, es: {…}, de: {…}}` des paires de guillemets typographiques
  - `BLOCKQUOTE_DEFAULTS` — objet DEFAULTS pour `OrigamBlockquote`
- **Consommé par** : `OrigamBlockquote`, stories.

---

### Domaine : Bracket

### `BRACKET_VARIANTS`, `BRACKET_MATCH_STATUSES`, `BRACKET_DEFAULT_MATCH_WIDTH/HEIGHT/GAP`, `BRACKET_DEFAULT_ROUND_GAP`
- **Fichier** : `src/consts/Bracket/bracket.const.ts`
- **Rôle** :
  - Listes fermées de valeurs (`BRACKET_VARIANTS`, `BRACKET_MATCH_STATUSES`)
  - Constantes géométriques du layout d'algorithme : `BRACKET_DEFAULT_MATCH_WIDTH = 240`, `BRACKET_DEFAULT_MATCH_HEIGHT = 72`, `BRACKET_DEFAULT_MATCH_GAP = 24`, `BRACKET_DEFAULT_ROUND_GAP = 48`
- **Consommé par** : `OrigamBracket`, algorithme de tracé des connecteurs.

---

### Domaine : Btn

### `ORIGAM_BTN_TOGGLE_KEY`
- **Fichier** : `src/consts/Btn/btn-toggle.const.ts`
- **Rôle** : Clé d'injection `Symbol.for('origam:btn-toggle')` partagée entre `OrigamBtnToggle` et `OrigamBtn`.
- **Consommé par** : `OrigamBtnToggle`, `OrigamBtn`.

---

### Domaine : Chart

### `CHART_Y_TICK_COUNT = 5`, `CHART_RANGE_SELECTOR_DEFAULT_BUTTONS`
- **Fichier** : `src/consts/Chart/chart.const.ts`
- **Rôle** :
  - `CHART_Y_TICK_COUNT` — nombre de ticks Y par défaut
  - `CHART_RANGE_SELECTOR_DEFAULT_BUTTONS` — boutons de sélecteur de plage par défaut (`1w`, `1m`, `3m`, `6m`, `1y`, `all`)
- **Consommé par** : `OrigamChart`.

---

### `COUNTRY_CENTROIDS`
- **Fichier** : `src/consts/Chart/country-centroids.const.ts`
- **Rôle** : `Record<string, [number, number]>` de centroïdes visuels `[x, y]` pour les pays sur le canvas Mercator 1000×500. Utilisé comme points d'extrémité des courbes de Bézier pour les routes aériennes (`CHART_MAP_MODE.FLIGHT_ROUTES`).
- **Consommé par** : `OrigamChartMap`.

---

### `PICTORIAL_ICON_PERSON` (et autres icônes pictoriales)
- **Fichier** : `src/consts/Chart/pictorial-icons.const.ts`
- **Rôle** : Chaînes de chemins SVG `d` pour les icônes du chart pictorial. Chaque chemin s'inscrit dans un `viewBox="0 0 24 24"`. `PICTORIAL_ICON_PERSON` est l'icône par défaut.
- **Consommé par** : `OrigamChartPictorial`.

---

### `WORLD_MAP_PATHS`
- **Fichier** : `src/consts/Chart/world-map.const.ts`
- **Rôle** : `Record<string, string>` de chemins SVG simplifiés par pays (code ISO-3166-1 alpha-2) sur un canvas Mercator 1000×500. 31 pays sur 6 régions.
- **Consommé par** : `OrigamChartMap`.

---

### `WORLD_GEOGRAPHIC`
- **Fichier** : `src/consts/Chart/world-geographic.const.ts`
- **Rôle** : Données géographiques mondiales (1 815 lignes) pour la carte choroplèthe. Structure exacte : Je ne sais pas (fichier non lu en détail).
- **Consommé par** : `OrigamChartMap`.

---

### Domaine : Chip

### `ORIGAM_CHIP_GROUP_KEY`
- **Fichier** : `src/consts/Chip/chip-group.const.ts`
- **Rôle** : `Symbol.for('origam:chip-group')` — clé d'injection entre `OrigamChipGroup` et `OrigamChip`.
- **Consommé par** : `OrigamChipGroup`, `OrigamChip`.

---

### Domaine : Clipboard

### `CLIPBOARD_DEFAULT_FEEDBACK_DURATION_MS = 2000`
- **Fichier** : `src/consts/Clipboard/clipboard.const.ts`
- **Rôle** : Durée d'affichage de la pill "Copié!" en ms. Alignée sur le défaut Snackbar.
- **Consommé par** : `useClipboard`.

---

### Domaine : CssSupport

### `FEATURE_QUERIES`
- **Fichier** : `src/consts/CssSupport/css-support.const.ts`
- **Rôle** : Catalogue de requêtes CSS pour `CSS.supports(…)`, déclaré `as const satisfies Record<string, string>`. 22 features documentées : `grid`, `subgrid`, `flexGap`, `containerQueries`, `has`, `aspectRatio`, `colorMix`, `accentColor`, `minMaxClamp`, `mathFunctions`, `anchorPositioning`, `scrollDrivenAnims`, `viewTransitions`, `nestedSelectors`, `individualTransforms`, `logicalProperties`, `backdropFilter`, `fieldSizing`, `textWrapBalance`, `contentVisibility`, `masonry`.
- **Consommé par** : `useCssSupport` (seule source de vérité pour la détection CSS).

---

### Domaine : DataTable

### Clés d'injection DataTable
- **Fichiers** : `src/consts/DataTable/*.const.ts`
- **Rôle** : 6 clés d'injection Vue portant les providers du DataTable :
  - `ORIGAM_DATA_TABLE_EXPAND_KEY` — expand/collapse des lignes
  - `ORIGAM_DATA_TABLE_GROUP_KEY` — groupement
  - `ORIGAM_DATA_TABLE_HEADERS_KEY` — colonnes et en-têtes
  - `ORIGAM_DATA_TABLE_PAGINATION_KEY` — pagination
  - `ORIGAM_DATA_TABLE_SELECT_KEY`, `ORIGAM_DATA_TABLE_SHOW_SELECT_KEY` — sélection
  - `ORIGAM_DATA_TABLE_SORT_KEY` — tri
- **Consommé par** : composants internes de `OrigamDataTable`.

---

### `DEFAULT_HEADER`, `DEFAULT_ACTION_HEADER`
- **Fichier** : `src/consts/DataTable/headers.const.ts`
- **Rôle** :
  - `DEFAULT_HEADER = {title: '', sortable: false}` — squelette de colonne minimal
  - `DEFAULT_ACTION_HEADER = {...DEFAULT_HEADER, width: 48}` — colonne d'actions (expand, select)
- **Consommé par** : construction interne des en-têtes.

---

### Stratégies de sélection DataTable
- **Fichier** : `src/consts/DataTable/select.const.ts`
- **Rôle** : Implémentations des stratégies `IDataTableSelectStrategy` :
  - `singleSelectStrategy` — sélection d'un seul élément
  - `pageSelectStrategy` — sélection de la page courante
  - `allSelectStrategy` — sélection de tous les éléments
- **Consommé par** : `OrigamDataTable`.

---

### Domaine : EmptyState

### `EMPTY_STATE_PRESETS`, `EMPTY_STATE_SIZES`, `EMPTY_STATE_ALIGNS`, `EMPTY_STATE_PRESET_CONFIG`
- **Fichier** : `src/consts/EmptyState/empty-state.const.ts`
- **Rôle** :
  - Tableaux fermés de valeurs valides
  - `EMPTY_STATE_PRESET_CONFIG` — map `TEmptyStatePreset → {icon: MDI_ICONS.XXX, intent: TIntent}` associant icône et intent sémantique à chaque preset
- **Consommé par** : `OrigamEmptyState`.

---

### Domaine : ExpansionPanel, Form, Slide, Tabs, Stepper, Treeview, Window

Ces constantes sont des **clés d'injection Vue** (`Symbol.for(…)`) partagées entre le composant parent et ses enfants :

| Constante | Fichier | Composants |
|---|---|---|
| `ORIGAM_EXPANSION_PANEL_KEY` | `ExpansionPanel/expansion-panel.const.ts` | `OrigamExpansionPanels` → `OrigamExpansionPanel` |
| `ORIGAM_FORM_KEY` | `Form/form.const.ts` | `OrigamForm` → champs de formulaire |
| `ORIGAM_SLIDE_GROUP_KEY` | `Slide/slide-group.const.ts` | `OrigamSlideGroup` → `OrigamSlide` |
| `ORIGAM_TABS_KEY`, `ORIGAM_TAB_PANELS_KEY`, `ORIGAM_TAB_PANELS_CTX_KEY` | `Tabs/tabs.const.ts` | `OrigamTabs` → `OrigamTab`, `OrigamTabPanels` → `OrigamTabPanel` |
| `ORIGAM_STEPPER_KEY` | `Stepper/stepper.const.ts` | `OrigamStepper` → steps |
| `ORIGAM_TREEVIEW_KEY` | `Treeview/treeview.const.ts` | `OrigamTreeview` |
| `ORIGAM_WINDOW_KEY`, `ORIGAM_WINDOW_GROUP_KEY` | `Window/window.const.ts` | `OrigamWindow` |
| `ORIGAM_SELECTION_CONTROL_GROUP_KEY` | `SelectionControl/selection-control.const.ts` | `OrigamSelectionControlGroup` |
| `ORIGAM_ITEM_GROUP_KEY` | `ItemGroup/item-group.const.ts` | `OrigamItemGroup` → `OrigamItem` |
| `ORIGAM_LIST_KEY` | `List/list.const.ts` | `OrigamList` → items |
| `ORIGAM_MENU_KEY` | `Menu/menu.const.ts` | `OrigamMenu` |
| `ORIGAM_PARALLAX_KEY`, `ORIGAM_PARALLAX_LAYER_KEY` | `Parallax/*.const.ts` | `OrigamParallax` → `OrigamParallaxLayer` |
| `TIMELINE_CONTEXT_KEY` | `Timeline/timeline.const.ts` | `OrigamTimeline` → `OrigamTimelineItem` |

---

### Domaine : Grid

### `GRID_GAP_SIZES`, `GRID_AUTO_FLOWS`, `GRID_PLACE_ITEMS`, `GRID_PLACE_SELF`, `GRID_PLACE_CONTENT`, `GRID_GAP_SIZE_VAR`, `GRID_DEFAULTS`
- **Fichier** : `src/consts/Grid/grid.const.ts`
- **Rôle** :
  - Tableaux fermés de valeurs valides pour les props de `OrigamGrid`
  - `GRID_GAP_SIZE_VAR` — map `{xs: 'var(--origam-grid---gap-xs)', …}` liant tokens à variables CSS
  - `GRID_DEFAULTS` — objet DEFAULTS pour `OrigamGrid` (`columns: 'auto'`, `gap: 'md'`, `autoFlow: 'row'`, etc.)
- **Consommé par** : `OrigamGrid`, stories.

---

### Domaine : Icon

### `ORIGAM_ICONS_KEY`, `DEFAULT_SETS`
- **Fichier** : `src/consts/Icon/icon.const.ts`
- **Rôle** :
  - `ORIGAM_ICONS_KEY` — clé d'injection pour les options d'icônes globales
  - `DEFAULT_SETS` — `{svg: {component: OrigamSvgIcon}, class: {component: OrigamClassIcon}}`
- **Consommé par** : `createOrigam`, `useIcons`.

---

### `MDI`, `MDI_ALIASES`
- **Fichier** : `src/consts/Icon/mdi.const.ts`
- **Rôle** :
  - `MDI` — implémentation `IIconSet` qui normalise les icônes MDI (ajoute le préfixe `mdi-` si absent) et injecte la classe `.mdi`
  - `MDI_ALIASES` — spread de `MDI_ICONS` + aliases sémantiques supplémentaires (`collapse: 'mdi-chevron-up'`, `complete: 'mdi-check'`, `cancel: 'mdi-close-circle'`, `close: 'mdi-close'`, `delete: 'mdi-close-circle'`, `clear: 'mdi-close-circle'`)
- **Consommé par** : `createOrigam({ icons: { defaultSet: 'mdi' } })`.

---

### Domaine : Input

### `BUBBLING_EVENTS`
- **Fichier** : `src/consts/Input/input.const.ts`
- **Rôle** : Liste des ~55 noms d'événements DOM qui se propagent (bubbling), utilisée pour distinguer les props handler Vue (`onXxx`) à transmettre au nœud racine de ceux à intercepter.
- **Consommé par** : `useBindProps`, `OrigamInput`.

---

### Domaine : Mask

### `BUILT_IN_PATTERNS`, `BUILT_IN_PATTERN_KEYS`
- **Fichier** : `src/consts/Mask/built-in-patterns.const.ts`
- **Rôle** :
  - `BUILT_IN_PATTERNS` — map `TBuiltInPattern → IMaskOptions` avec les patrons de masque (syntaxe : `#` chiffre, `A` lettre, `*` tout) et les validateurs sémantiques
  - `BUILT_IN_PATTERN_KEYS` — `Set<string>` des clés pour la discrimination chaîne/preset dans `resolveMaskConfig`
- **Consommé par** : `useMask`, `OrigamMaskField`.

---

### Domaine : Masonry

### `MASONRY_ALIGNS`, `MASONRY_DEFAULTS`
- **Fichier** : `src/consts/Masonry/masonry.const.ts`
- **Rôle** :
  - `MASONRY_ALIGNS` — `['top', 'center']`
  - `MASONRY_DEFAULTS` — objet DEFAULTS : `{columns: 3, gap: 'md', animated: true, align: 'top', tag: 'div'}`
- **Consommé par** : `OrigamMasonry`, stories.

---

### Domaine : Media

### `MEDIA_DEFAULT_PRELOAD = 'metadata'`, `MEDIA_DEFAULT_VOLUME = 1`
- **Fichier** : `src/consts/Media/media.const.ts`
- **Rôle** : Valeurs par défaut partagées entre `OrigamAudio` et `OrigamVideo` pour éviter la duplication.
- **Consommé par** : `useMediaPlayer`, `VIDEO_DEFAULT_PRELOAD`.

---

### Domaine : NumberFormat

### `NUMBER_FORMAT_LRU_CAPACITY = 16`, `NUMBER_FORMAT_FALLBACK_LOCALE = 'en-US'`, `NUMBER_FORMAT_DEFAULT_CURRENCY = 'USD'`
- **Fichier** : `src/consts/NumberFormat/number-format.const.ts`
- **Rôle** : Limites et défauts du formatage numérique avec `Intl.NumberFormat`.
- **Consommé par** : `useNumberFormat`.

---

### Domaine : PasswordField

### `REQUIREMENT_MIN_LENGTH`, `REQUIREMENT_TINY`, `REQUIREMENT_UPPERCASE`, `REQUIREMENT_NUMBER`, `REQUIREMENT_SPECIAL`
- **Fichier** : `src/consts/PasswordField/password-requirements.const.ts`
- **Rôle** : Descripteurs de règles de force de mot de passe avec `key`, `message`, `icon` (glyphe de la tuile) et `reg` (regex). `REQUIREMENT_MIN_LENGTH` est une factory `(length: number) => …` pour la règle paramétrique.
- **Consommé par** : `OrigamPasswordField`.

---

### `DEFAULT_PASSWORD_REQUIREMENTS`
- **Fichier** : `src/consts/PasswordField/password-field.const.ts`
- **Rôle** : Tableau de 4 `IPasswordRequirement` par défaut quand `requirements: true` est passé sans tableau explicite (min 8 chars, 1 majuscule, 1 chiffre, 1 caractère spécial).
- **Consommé par** : `OrigamPasswordField`.

---

### Domaine : Progress

### `MAGIC_RADIUS = 20`, `CIRCUMFERENCE`
- **Fichier** : `src/consts/Progress/progress.const.ts`
- **Rôle** :
  - `MAGIC_RADIUS = 20` — rayon du cercle SVG du progress circulaire
  - `CIRCUMFERENCE = 2 * Math.PI * MAGIC_RADIUS` — circonférence pour le calcul du `stroke-dashoffset`
- **Consommé par** : `OrigamProgressCircular`.

---

### Domaine : QrCode

### `QR_CODE_DEFAULT_ECC = 'M'`, `QR_CODE_DEFAULT_MARGIN = 4`, `QR_CODE_OVERLAY_MAX_RATIO = 0.3`, `QR_CODE_DEFAULT_LOGO_SIZE = 0.2`, `QR_CODE_DEFAULT_LOGO_PADDING = 6`, `QR_CODE_LRU_CAPACITY = 16`
- **Fichier** : `src/consts/QrCode/qr-code.const.ts`
- **Rôle** : Paramètres de génération de QR codes. `QR_CODE_OVERLAY_MAX_RATIO` émet un warning (pas un clamp) si le logo dépasse 30% de la surface.
- **Consommé par** : `OrigamQrCode`, `useQrCode`.

---

### Domaine : Sheet

### `DEFAULT_SHEET_SNAP_POINTS`
- **Fichier** : `src/consts/Sheet/sheet-snap-points.const.ts`
- **Rôle** : Points d'accrochage par défaut de la bottom sheet : `closed (0)`, `peek (120px)`, `half (50vh)`, `full (90vh)`.
- **Consommé par** : `OrigamSheet`, `useSheetSwipe`.

---

### `SHEET_FAST_FLICK_THRESHOLD = 0.5`
- **Fichier** : `src/consts/Sheet/sheet-swipe.const.ts`
- **Rôle** : Seuil de vitesse (px/ms) au-delà duquel le relâchement est traité comme un "flick rapide" (sauter un snap plutôt que snap le plus proche).
- **Consommé par** : `useSheetSwipe`.

---

### Domaine : Snackbar

### `SNACKBAR_GROUP_LOCATIONS`, `SNACKBAR_GROUP_DIRECTIONS`, `SNACKBAR_GROUP_DEFAULT_ID`, `SNACKBAR_GROUP_DEFAULT_DURATION`, `SNACKBAR_GROUP_DEFAULT_MAX`, `SNACKBAR_GROUP_DEFAULT_SPACING`
- **Fichier** : `src/consts/Snackbar/snackbar-group.const.ts`
- **Rôle** :
  - Listes fermées de positions (`top-left`, `top-right`, …) et de directions (`top-down`, `bottom-up`)
  - `SNACKBAR_GROUP_DEFAULT_ID = 'default'`
  - `SNACKBAR_GROUP_DEFAULT_DURATION = 5000` (ms)
  - `SNACKBAR_GROUP_DEFAULT_MAX = 5`
  - `SNACKBAR_GROUP_DEFAULT_SPACING = '12px'`
- **Consommé par** : `OrigamSnackbarGroup`, `useSnackbarGroup`.

---

### Domaine : Textarea

### `DEFAULT_TOOLBAR`, `ALLOWED_TAGS`, `BLOCKED_TAGS`, `ALLOWED_ATTRIBUTES`, `ALLOWED_URL_SCHEMES`, `ALLOWED_CLASS_PREFIX`
- **Fichier** : `src/consts/Textarea/textarea.const.ts`
- **Rôle** :
  - `DEFAULT_TOOLBAR` — liste ordonnée de 9 commandes de toolbar par défaut
  - `ALLOWED_TAGS` — whitelist HTML pour le sanitiseur rich text (14 tags)
  - `BLOCKED_TAGS` — blacklist (script, style, iframe, …) dont le sous-arbre est supprimé entièrement
  - `ALLOWED_ATTRIBUTES` — map `{tag: [attributs permis]}` par tag
  - `ALLOWED_URL_SCHEMES` — `['http:', 'https:', 'mailto:', 'tel:']`
  - `ALLOWED_CLASS_PREFIX = 'origam-rich--'` — préfixe autorisé pour les classes après sanitisation
- **Consommé par** : `useTextareaRich`, sanitiseur HTML interne.

---

### Domaine : TextField

### `ACTIVE_TEXT_FIELD_TYPE`, `INPUT_TEXT_FIELD_TYPE`
- **Fichier** : `src/consts/TextField/text-field.const.ts`
- **Rôle** :
  - `ACTIVE_TEXT_FIELD_TYPE` — types qui ont une valeur "active" visible sans que l'utilisateur ait saisi quoi que ce soit : `[COLOR, FILE, TIME, DATE, DATETIME, WEEK, MONTH]`
  - `INPUT_TEXT_FIELD_TYPE` — types qui comportent une vraie zone de saisie libre : `[TEXT, SEARCH, PASSWORD, TEL, URL]`
- **Consommé par** : `OrigamTextField`, logique de label flottant.

---

### Domaine : Theme

### `ORIGAM_THEME_AUTO`, `ORIGAM_THEME_LIGHT`, `ORIGAM_THEME_DARK`, `ORIGAM_THEMES_KEY`, `ORIGAM_THEME_STORAGE_KEY`, `ORIGAM_THEME_ATTR`
### `ORIGAM_MODE_AUTO`, `ORIGAM_MODE_LIGHT`, `ORIGAM_MODE_DARK`, `ORIGAM_MODE_STORAGE_KEY`, `ORIGAM_MODE_ATTR`
### `ORIGAM_NUXT_DEFAULT_*`
- **Fichier** : `src/consts/Theme/theme.const.ts`
- **Rôle** : Ensemble de constantes de chaîne et clés d'injection pour le système de thèmes bi-axes d'origam.
  - Thème (`light/dark/auto`) : `ORIGAM_THEME_STORAGE_KEY = 'origam-theme'`, `ORIGAM_THEME_ATTR = 'data-theme'`
  - Mode (`light/dark/auto`) : `ORIGAM_MODE_STORAGE_KEY = 'origam-mode'`, `ORIGAM_MODE_ATTR = 'data-mode'`
  - Nuxt module : noms de cookies, durée `60 * 60 * 24 * 365` (1 an), listes par défaut `['light', 'dark']`, thème par défaut `'auto'`
- **Consommé par** : `useTheme`, module Nuxt origam.

---

### Domaine : Video

### `VIDEO_DEFAULT_PRELOAD = 'metadata'`
- **Fichier** : `src/consts/Video/video.const.ts`
- **Rôle** : Alias de `MEDIA_DEFAULT_PRELOAD` ciblant uniquement la surface vidéo.
- **Consommé par** : `OrigamVideo`.

---

### Domaine : Watermark

### `WATERMARK_DEFAULT_*`, `WATERMARK_DATA_ATTR`
- **Fichier** : `src/consts/Watermark/watermark.const.ts`
- **Rôle** : Paramètres par défaut du filigrane. Dupliqués sous forme de littéraux dans `withDefaults` du composant (règle CLAUDE.md) ; exportés ici pour les consommateurs externes.
  - `WATERMARK_DEFAULT_GAP_PX = 120`
  - `WATERMARK_DEFAULT_FONT_SIZE_PX = 16`
  - `WATERMARK_DEFAULT_OPACITY = 0.1`
  - `WATERMARK_DEFAULT_ANGLE_DEG = -30`
  - `WATERMARK_DEFAULT_COLOR = 'currentColor'`
  - `WATERMARK_DEFAULT_FONT_FAMILY = 'inherit'`
  - `WATERMARK_DEFAULT_FONT_WEIGHT = 400`
  - `WATERMARK_DEFAULT_Z_INDEX = 1`
  - `WATERMARK_DEFAULT_POINTER_EVENTS = 'none'`
  - `WATERMARK_DATA_ATTR = 'data-origam-watermark'` — attribut de marquage pour l'anti-tamper MutationObserver
- **Consommé par** : `OrigamWatermark`, `useWatermark`.

---

### Domaine : Code

### `SUPPORTED_LANGS`, `CODE_CACHE_MAX_ENTRIES = 64`, `CODE_LIGHT_THEME`, `CODE_DARK_THEME`, `CODE_DEFAULTS`
- **Fichier** : `src/consts/Code/code.const.ts`
- **Rôle** :
  - `SUPPORTED_LANGS` — freeze des 14 langues bundlées avec shiki
  - `CODE_CACHE_MAX_ENTRIES` — taille max du cache LRU de rendu HTML précolorisé
  - `CODE_LIGHT_THEME = 'github-light'`, `CODE_DARK_THEME = 'github-dark'`
  - `CODE_DEFAULTS` — objet DEFAULTS pour `OrigamCode` : `{lang: PLAINTEXT, lineNumbers: false, copyable: true, wrap: false, format: false, copyFeedbackDurationMs: 2000}`
- **Consommé par** : `useCode`, `OrigamCode`, stories.

---

### Domaine : ColorPicker

### `COLOR_NULL`, `COLOR_PICKER_MODES`
- **Fichier** : `src/consts/ColorPicker/color-picker.const.ts`
- **Rôle** :
  - `COLOR_NULL = {h: 0, s: 0, v: 0, a: 1}` — couleur nulle (HSV) pour l'état initial
  - `COLOR_PICKER_MODES` — map `{rgb, rgba, hsl, hsla, hex, hexa}` → `IColorPickerMode`. Chaque mode déclare ses `inputs` (label, max, step, getter/setter), ses fonctions `to`/`from` (conversion depuis/vers HSV interne).
- **Consommé par** : `OrigamColorPicker`.

---

### Domaine : CommandPalette

### `COMMAND_PALETTE_DEFAULT_HOTKEY`, `COMMAND_PALETTE_GLOBAL_ID`, `COMMAND_PALETTE_DEFAULT_MAX_HEIGHT`, `COMMAND_PALETTE_DEFAULT_WIDTH`
- **Fichier** : `src/consts/CommandPalette/command-palette.const.ts`
- **Rôle** :
  - `COMMAND_PALETTE_DEFAULT_HOTKEY` — `[['meta', 'k'], ['ctrl', 'k']]` (macOS + Windows/Linux)
  - `COMMAND_PALETTE_GLOBAL_ID = 'origam-command-palette-global'`
  - `COMMAND_PALETTE_DEFAULT_MAX_HEIGHT = 480` (px)
  - `COMMAND_PALETTE_DEFAULT_WIDTH = 640` (px)
- **Consommé par** : `OrigamCommandPalette`, `useCommand`.

---

## Tableaux récapitulatifs

### Récapitulatif des enums par domaine

| Domaine | Enum(s) | Nombre de membres |
|---|---|---|
| Commons | `FOCUS_LOCATION`, `CLIENT_POSITION`, `ADJACENT`, `ALIGN`, `BLOCK`, `INLINE`, `START_END`, `BORDER_STYLE`, `CALENDAR_STRATEGY`, `DENSITY`, `DIMENSIONS`, `DIRECTION`, `BREAKPOINTS`, `AXIS`, `FILTERS_MODE`, `KEYBOARD_MODIFIERS_KEY`, `KEYBOARD_VALUES`, `JUSTIFY`, `LOCATION_STRATEGIES`, `MODE`, `SELECT_STRATEGY`, `OPEN_STRATEGY`, `SELECTED`, `POSITION`, `ROUNDED`, `SCROLL_STRATEGIES`, `SIZES`, `SORT_DIRECTION`, `STATUS`, `STATUS_POSITION`, `TOUCH_EVENTS`, `VALIDATE_ON`, `VARIANT`, `VARIANT_INPUT` | 34 enums |
| Audio | `AUDIO_LOOP_MODE`, `AUDIO_VARIANT`, `COVER_POSITION` | 3 |
| Blockquote | `BLOCKQUOTE_LANG`, `BLOCKQUOTE_VARIANT` | 2 |
| Bracket | `BRACKET_MATCH_STATUS`, `BRACKET_VARIANT` | 2 |
| Card | `CARD_TYPE` | 1 |
| Chart | `CHART_TYPE`, `CHART_BULLET_ORIENTATION`, `CHART_CARTESIAN_KIND`, `CHART_HONEYCOMB_COLOR_MODE`, `CHART_HONEYCOMB_ORIENTATION`, `CHART_MAP_MODE`, `CHART_PICTORIAL_DIRECTION`, `CHART_PICTORIAL_MODE`, `CHART_POLAR_KIND`, `CHART_PYRAMID_KIND`, `CHART_SPARKLINE_KIND`, `CHART_STACKING`, `CHART_STREAMGRAPH_OFFSET`, `CHART_TREEMAP_ALGORITHM`, `CHART_WORD_CLOUD_ROTATION` | 15 |
| Code | `CODE_LANG`, `CODE_THEME` | 2 |
| ColorPicker | `COLOR_MODES_NAMES` | 1 |
| DataTable | `DATATABLE_SELECT_STRATEGY` | 1 |
| DatePicker | `DATE_MODE` | 1 |
| EmptyState | `EMPTY_STATE_PRESET` | 1 |
| Grids | `COLS`, `FLEX_DIRECTION` | 2 |
| Icon | `MDI_ICONS` | 1 (très volumineux, ~7 200 membres) |
| Img | `CROSS_ORIGIN`, `REFERRER_POLICY`, `IMG_STATE` | 3 |
| InfiniteScroll | `INFINITE_SCROLL_SIDE`, `INFINITE_SCROLL_MODE`, `INFINITE_SCROLL_STATUS` | 3 |
| InlineEdit | `INLINE_EDIT_ACTION` | 1 |
| List | `LIST_ITEM_TYPE`, `LINES` | 2 |
| Mask | `BUILT_IN_PATTERN` (const as), `PATTERN_VALIDATOR` (const as) | 2 |
| OtpInputField | `OTP_INPUT_FIELD_TYPE` | 1 |
| Parallax | `PARALLAX_DIRECTION`, `PARALLAX_EASING`, `PARALLAX_ELEMENT_TYPE`, `PARALLAX_EVENT` | 4 |
| Progress | `PROGRESS_TYPE` | 1 |
| SliderField | `SLIDER_FIELD_VARIANT` | 1 |
| Tabs | `TAB_VARIANT` | 1 |
| TextField | `TEXT_FIELD_TYPE` | 1 |
| Textarea | `TEXTAREA_MODE`, `TEXTAREA_OUTPUT`, `TEXTAREA_TOOLBAR_COMMAND`, `TEXTAREA_TOOLBAR_POSITION` | 4 |
| Toolbar | `SCROLL_BEHAVIOR` | 1 |
| Transition | `TRANSITION_MODE`, `EASING` | 2 |

**Total : ~79 enums** (incluant les 2 `const as`).

---

### Récapitulatif des constantes par catégorie fonctionnelle

| Catégorie | Fichiers | Rôle principal |
|---|---|---|
| Détection d'environnement | `commons.const.ts` | Guards SSR (`IN_BROWSER`, `SUPPORTS_*`) |
| Calcul couleur | `color.const.ts` | Matrices sRGB, CIE Lab, APCA, intents, regex |
| Layout / positionnement | `anchor.const.ts`, `location.const.ts`, `layout.const.ts` | Tableaux de valeurs, strategies, ROOT_ZINDEX |
| Date / calendrier | `date.const.ts` | Injection, regex, premier jour par locale (110 pays) |
| Display / breakpoints | `display.const.ts` | Clé injection, seuils, tableau breakpoints |
| Navigation clavier | `hotkey.const.ts`, `autocomplete.const.ts` | Modificateurs, aliases, touches à ignorer |
| Ripple | `ripple.const.ts` | Options, implémentation DOM complète |
| Scroll | `scroll.const.ts` | Map strategies → implémentations |
| Density / size / rounded | `density.const.ts`, `size.const.ts`, `rounded.const.ts` | Tableaux whitelist + regex |
| Elevation | `elevation.const.ts` | Rungs disponibles + sous-ensemble utility |
| Nested / arbres | `nested.const.ts` | Stratégies d'ouverture/sélection + clé injection |
| Hover / stack | `hover.const.ts`, `stack.const.ts` | Impl. DOM, GLOBAL_STACK, ROOT_ZINDEX |
| Locale / RTL | `locale.const.ts` | Clé injection, map RTL par langue |
| Clés d'injection (composants) | `btn-toggle.const.ts`, `chip-group.const.ts`, `expansion-panel.const.ts`, `form.const.ts`, `item-group.const.ts`, `list.const.ts`, `menu.const.ts`, `parallax-*.const.ts`, `slide-group.const.ts`, `tabs.const.ts`, `stepper.const.ts`, `timeline.const.ts`, `treeview.const.ts`, `window.const.ts`, DataTable x6 | Provide/inject parent → enfant |
| Objets DEFAULTS | `audio.const.ts`, `blockquote.const.ts`, `code.const.ts`, `grid.const.ts`, `masonry.const.ts`, `watermark.const.ts` | Valeurs par défaut pour stories/consommateurs (non utilisées dans `withDefaults`) |
| Données cartographiques | `world-map.const.ts`, `world-geographic.const.ts`, `country-centroids.const.ts` | SVG paths pays, centroïdes Mercator |
| Icônes | `icon.const.ts`, `mdi.const.ts` | Clé injection, DEFAULT_SETS, MDI implémentation |
| Masques | `built-in-patterns.const.ts` | 13 patterns avec validateurs sémantiques |
| Media | `media.const.ts`, `video.const.ts` | Défauts preload/volume partagés |
| Theme | `theme.const.ts` | Constantes du système de thèmes bi-axes + Nuxt |
| ColorPicker | `color-picker.const.ts` | Modes de saisie couleur avec convertisseurs |
| Chart | `chart.const.ts`, `pictorial-icons.const.ts` | Paramètres chart, SVG icônes pictorials |
| TextField | `text-field.const.ts` | Types actifs vs types texte libre |
| Textarea (rich) | `textarea.const.ts` | Toolbar, sanitiseur HTML (whitelist/blacklist) |
| PasswordField | `password-field.const.ts`, `password-requirements.const.ts` | Règles de force + défauts |
| QrCode | `qr-code.const.ts` | ECC, margin, LRU, overlay max ratio |
| Snackbar | `snackbar-group.const.ts` | Positions, durées, max items |
| Sheet | `sheet-snap-points.const.ts`, `sheet-swipe.const.ts` | Points d'accrochage, seuil flick |
| Progress | `progress.const.ts` | MAGIC_RADIUS, CIRCUMFERENCE |
| Grid | `grid.const.ts` | Gap vars, flows, defaults |
| CommandPalette | `command-palette.const.ts` | Hotkeys, ID global, dimensions |
| CSS Support | `css-support.const.ts` | FEATURE_QUERIES (22 features) |

**Total : ~84 fichiers de constantes.**
