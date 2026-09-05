# Audit — 775 tokens dormants (#550) — classification par bucket

Date : 2026-09-05. Base : `develop`@`98b5628a`. Source des 775 tokens :
`packages/ds/scripts/guards/baseline/token-var-channels-dormant.json`.

⛔ **Mission de classification, pas de câblage.** Aucun fichier source n'a été
modifié pour produire cet audit. Les mesures de rendu (bucket 4) ont été
faites via Playwright contre un Histoire **statique** servi sur un port isolé
(`:6014`, hors du `:6006` partagé par les ~55 autres worktrees) — jamais
`getComputedStyle` sous jsdom, qui ne résout jamais un `var()`.

## État d'avancement — **775 / 775 tokens classés (100 %).**

Les 6 lots ont fini par livrer (les groupes 3 et 5 avaient d'abord été
marqués « non traités » dans une version précédente de ce rapport après que
leurs sous-agents se soient crus à tort « orchestrateurs attendant leurs
propres sous-agents » — artefact d'un fork qui hérite de tout le contexte, y
compris l'acte de dispatcher. Corrigés et livrés depuis).

⚠️ **Incident de conduite à signaler** : en croyant devoir orchestrer,
`tri-group5` a lui-même spawné 6 agents dupliqués (`tri-g1`…`tri-g6`,
`general-purpose`) qui ont refait le même travail en parallèle des 6 forks
légitimes. Ressource gaspillée, non récupérable (`TaskStop` refusé : ces
tâches appartiennent à la session principale, pas à ce worktree). **Leurs
résultats n'ont pas été utilisés** dans cette synthèse — seuls les 6 forks
légitimes (`tri-group1`…`tri-group6`) + le travail du lead font foi. Si des
notifications de `tri-g1..tri-g6` arrivent encore, elles sont à ignorer.

---

## 1. Tableau de synthèse (775 / 775 tokens)

| Bucket | Tokens | Composants |
|---|---:|---:|
| 1 — Aucune surface de rendu | **0** | 0 — voir note ci-dessous |
| 2 — Délégué à un enfant | **104** | ~19 |
| 3 — Fonctionnalité jamais implémentée | **316** | ~50 |
| 4 — Écart de valeur | **34** | ~14 |
| 5 — Canal générique | **80** | ~16 |
| 6 — Mauvais nom (quasi-collision) | **35** | ~15 |
| 7 — Autre | **65** | ~19 |
| **Sous-total, tokens attribuables à un composant** | **634** | **~74** |
| Primitifs/génériques (color/font/motion/space/opacity/zIndex/gradient/border/shadow), traités à part — §7 | **141** | *(sans propriétaire unique)* |
| **TOTAL** | **775** | |

*(Le nombre de composants par bucket est une estimation d'après le détail par
lot — un composant peut apparaître dans plusieurs buckets à la fois selon ses
tokens.)*

**Détail par lot** :

| Bucket | Mine (App/AppBar/Progress/Chart/BottomNav) | Groupe 1 | Groupe 2 | Groupe 3 | Groupe 4 | Groupe 5 | Groupe 6 | **Total** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| 2 | 22 | 0 | 33 | 20 | 24 | 4 | 1 | **104** |
| 3 | 7 | 62 | 40 | 54 | 38 | 64 | 50 | **316** |
| 4 | 1 | 4 | 0 | 4 | 21 | 4 | 0 | **34** |
| 5 | 4 | 23 | 3 | 3 | 12 | 16 | 19 | **80** |
| 6 | 1 | 14 | 3 | 2 | 5 | 9 | 1 | **35** |
| 7 | 7 | 3 | 10 | 6 | 5 | 9 | 25 | **65** |
| **Total** | 42 | 106 | 89 | 89 | 105 | 106 | 96 | **634** |

(Le token `--origam-spacer---min-size` a été déplacé du lot « primitifs »
vers le Groupe 3 (Grids/`OrigamSpacer.vue`, bucket 3) — c'est bien un
composant réel, pas un rung de palette. D'où 141 primitifs au lieu de 142, et
634 tokens composants au lieu de 633.)

**Surprise n°1 — Bucket 1 est vide.** Sur les 580 tokens vérifiés, aucun ne
relève proprement de « aucune surface de rendu, point final » : les 3
candidats mécaniques trouvés par le détecteur « fichier propriétaire sans
`<style>` » (AppBar, Progress, Chart) se sont TOUS révélés être des cas de
délégation propre (bucket 2) une fois le code réellement lu. Le chiffre « 29
composants sans `<style>` » cité dans le ticket est réel à l'échelle du DS,
mais aucun de ces 29 composants ne porte, à lui seul, un nom de token encore
présent dans la liste des 775 dormants — soit ils délèguent proprement (→ B2),
soit ils n'ont simplement aucun token déclaré sous leur propre nom.

---

## 2. Décisions utilisateur tombées en cours de route (`gh issue view 550`)

Ces trois décisions **inversent** la règle des lots 1-4 et changent la lecture
du tableau ci-dessus :

1. **Écart de valeur (bucket 4) → le CODE gagne.** On réécrit la ligne dans
   `light.css`/`dark.css` pour qu'elle décrive la valeur RENDUE, puis on
   câble. Le rendu ne bouge pas d'un pixel. La colonne « valeur à écrire »
   du tableau §4 donne directement cette valeur.
2. **Fonctionnalité jamais implémentée (bucket 3) → supprimer le token,
   ouvrir un ticket pour la fonctionnalité.** Un token est un canal, pas un
   cahier des charges. Le détail par composant (§3) sert de base à ces
   tickets de remédiation.
3. **Bouton `ghost` → le verre dépoli reste**, tokens réécrits pour le
   décrire. ⚠️ **Conflit à trancher** : le lot Groupe 6 classe les 17 tokens
   `--origam-btn(--{intent})---*` (dont les tokens ghost) en **bucket 5**
   (couleur intégralement peinte par `useStateEffect`, aucun des 17 noms
   n'est lu nulle part dans `OrigamBtn.vue`) — alors que le ticket original
   listait `--origam-btn--ghost---background-color` comme une
   **quasi-collision bucket 6** (« lu comme
   `--origam-btn---background-color-ghost`, mort aussi »). Les deux mesures
   n'ont pas été réconciliées dans ce tour : soit un fallback var existe EN
   PLUS du chemin `useStateEffect` (auquel cas bucket 6 et bucket 5
   coexistent sur le même nom à des endroits différents du fichier), soit
   l'un des deux forks a mesuré sur une version différente du fichier. **À
   vérifier avant d'écrire quoi que ce soit dans la feuille pour `ghost`.**

---

## 3. Bucket 3 — Fonctionnalité jamais implémentée (197 tokens) — candidats suppression + ticket

### Composants déjà classés par le lead (7 tokens)
- **App** (3) : `--origam-app---display` / `---flex-direction` / `---overflow` — aucune règle CSS pour ces propriétés nulle part (ni App, ni Layout).
- **ProgressLinear** (1) : `--origam-progress-linear__bar---transition-property` — la barre fait `transition: inherit`, rien à lire.
- **Chart** (3) : `--origam-chart__bar---gap`, `--origam-chart__point---radius`, `--origam-chart__point---radius-hover` — gap/rayon de point pilotés par géométrie JS (`geo.radius`, `radiusFor(z)`), jamais par CSS.

### Groupe 1 (62 tokens)
- **List/ListItem** (9) : `__divider` (2, slot consommateur seulement), `__item---border-*-width/radius` per-côté (7, un seul `border-width` shorthand existe réellement).
- **SliderField** (12) : `padding-block`, `track-fill-*-disabled/error` (2), `track-fill-transition-duration`, `transition-duration/timing-function` racine (2), `__label---*` (3, seule règle = margin), `__thumb---focus-ring-*` (2), `__thumb---scale-active/hover` (2, le `scale(2)` existant s'applique à un halo `:before`, pas au thumb).
- **Chip** (2) : `--outlined---background-color/border-color` — la vraie variante s'appelle `--border`, pas `--outlined`.
- **InlineEdit** (9) : `__editor---*` (8, vocabulaire mort, remplacé par `__field` qui n'expose qu'un seul token), `__input---multiline-min-height`.
- **OtpInputField** (9) : racine entière (background/color/font-size/transition×2) + `__cell---border-color(-error/-filled/-focused)` (4).
- **Layout** (8) : `background-color`, `display`, `flex`, `flex-direction`, `max-width`, `overflow` (racine), `__wrapper---height/width`.
- **Overlay** : 0 (tout bucket 5).
- **Avatar** (2) : `--border-radius-square` (pas de variante square), `avatar-group---box-shadow` (repos, seul `-elevated` existe).
- **Responsive** (3) : `aspect-ratio-default/portrait/square` — **le composable dit lui-même explicitement que rien n'est prévu pour ces tokens** (non-implémentation documentée et volontaire).
- **Main** (2) : `background-color`, `color` — shell purement positionnel, déjà couvert par App.
- **CommandPalette** (1) : `__item---color` (repos ; seul `-active` existe).
- **VirtualScroll** (1) : `---item-height` — aucune notion `itemHeight` dans le composant.

### Groupe 2 (40 tokens)
- **Dialog** (11) : `__actions---*` (3), `__close---*` (2), `__content---*` (3), `__header---*` (3) — Card n'a strictement aucune règle pour ces zones.
- **Pagination** (5) : `border-radius-circle` (rejeté par design, commentaire explicite « NOT a full circle »), `prev-next-icon-color/opacity-disabled` (2), `__ellipsis---color/font-weight` (2, texte brut sans classe).
- **Icon** (9) : couleurs par intention ×6 (aucune logique intent sur Icon), tailles `2xl/3xl/4xl` ×3 (échelle réelle s'arrête à `xl`).
- **SelectionControl** (5) : `transition-duration/easing` racine (2, zéro transition dans le fichier), `__icon---opacity` repos (1), `__input---overlay-opacity-hover` (1, seul `-focus` existe), `__label---color` repos (1).
- **Badge** (4) : per-côté `border-*-width` — seul le raccourci `border-width` est lu.
- **Blockquote** (3) : `quote-mark-font-size/line-height/opacity` — le mark n'a que `font-family`/`color`.
- **Skeleton** (2) : `opacity-min/max` — aucune animation n'anime l'opacité.
- **Clipboard** (1) : `__feedback---offset` — élément inline-flex, pas un overlay positionné.

### Groupe 4 (38 tokens)
- **ColorPicker** (17) : `gap`, `min-width`, `transition-duration` (racine, 3), `__canvas---border-*` ×3 + `height/width` (2) = 5, `__cursor---border-width` (1), `__edit---label-color` (1), `__preview---border-*` ×3 + `height/width` ×2 = 5, `__swatches---border-color/width` (2), `__swatches---gap` (1, marges en dur pas gap).
- **Video** (2) : `__btn---color-hover` (survol change opacité, pas color), `__btn---background-color-active` (`:active` = scale seulement).
- **Switch** (7) : `__thumb---background-color-checked/disabled` (2), `__thumb---box-shadow` (1), `__track---background-color-checked` (1), `__track---border-color/width` (2, sauf forced-colors), *(+1 arrondi)*.
- **Audio** (6) : `secondary-color`, `__album/__artist/__duration---color` (3, sélecteur combiné sans aucune couleur), `__body---gap` + `__compact---body-gap` (2, `.origam-audio__body` n'existe pas dans le markup), `__transport---btn-icon-size`.
- **ColorPickerField** (5) : `min-width`, `__icon---color(-hover)` (2, **aucune icône dans ce composant**), `__swatch---border-color/width` (2).
- **Window** (2) : `---position` (racine, seul `__container---position` existe), `__controls---hover-color`.
- **Divider** (3) : `__label---color/font-size/padding-inline` — root = `<hr>` seul, aucun enfant label possible (content model HTML).

### Groupe 3 (54 tokens)
- **DatePicker** (17) : racine `padding-block/inline`, `transition-duration/timing-function` (4) ; `__day---background-color-hover/border-color-today/border-radius/color-out-of-month` (4, la classe `--today` est posée en template mais **aucune règle CSS `&--today` n'existe** — classe orpheline) ; `__header---background-color/color/font-weight` (3) ; `__month---border-color-today/border-width-today/padding-block` (3, aucun concept « mois courant » dans `OrigamDatePickerMonths.vue`) ; `__weekday---color/font-weight` (2) ; `__year---padding-block` (1).
- **DataList** (11, exemple cité par le ticket, confirmé) : `__bordered---*` (5), `__item---*` (4), `__striped---*` (2) — grep exhaustif, aucun mot « bordered »/« striped »/« __item » nulle part dans le composant, mode unique (title/text/kv).
- **Grids — Row/Container/Spacer** (9, bucket entier) : `container---margin-inline/padding-inline` (2, seul le split `-start/-end` existe, hardcodé), `container---max-width-sm` (1, échelle réelle commence à `md`), `row---gap-{comfortable,default,dense,none}` (4, **zéro `gap` nulle part** dans `OrigamRow.vue`), `row---margin-inline` (1), `spacer---min-size` (1, `OrigamSpacer.vue` ne lit que `flex-grow` — **reclassé ici depuis le lot primitifs**, c'est un vrai composant).
- **Breadcrumb** (5) : `---font-size/gap/home-icon-color` (3, aucune propriété nulle part), `-divider---character/font-size` (2, le séparateur passe par un slot Vue, jamais un `content:` CSS).
- **Sheet** (4) : `---border-{end-end,end-start,start-end,start-start}-radius` — seul un radius unique (4 coins uniformes) est lu, jamais les 4 coins logiques séparément.
- **Calendar** (3) : `---gap/padding` (racine, 2, seule la zone `__toolbar` a un gap propre), `__day-cell---bg-color-hover` (1, aucun `:hover` sur les cellules).
- **Title** (4, bucket entier) : `font-size-{sm,lg,2xl,3xl}` — le système de densité ne retombe que sur 3 paliers (xs/md/xl) sur les 7 déclarés.
- **TextMask** (1) : `__animation---easing-default` — chacune des 4 animations (pan/rotate/pulse/zoom) hardcode sa propre valeur d'easing, aucun « défaut » unifié n'existe.

### Groupe 5 (64 tokens)
- **Snackbar** (9) : `---position` (1, positionnement par classes en dur), `__actions---margin-inline-end` (1, `__actions` n'existe pas, seulement `snackbar-item__actions` qui hardcode `gap:6px`), `__content---*` (6, aucun `.origam-snackbar__content` dans tout le SCSS), `__prepend---margin-inline-end` (1, `prepend` ne lit que `color`).
- **SnackbarGroup** (3) : `__item---box-shadow/content-gap/text-gap` — `OrigamSnackbarGroup.vue` surcharge 16 propriétés `__item---*` mais PAS celles-ci : surface d'override incomplète, pas un oubli isolé.
- **Alert** (12) : `---border-radius-rounded` (1, les 7 classes `--rounded-*` sont des paliers de taille, pas une variante « rounded » distincte), `--{danger,info,success,warning}---bg-subtle/fg-subtle` (8, un ton « doux » n'existe pas), `--{danger,info,success,warning}---border` (4, ⚠️ **défaut réel repéré en chemin, non réparé** : les 4 blocs par statut fixent `background-color` ET `color`, mais AUCUN ne fixe `border-color` — fonctionnalité à moitié construite).
- **Code** (13) : `---line-number-gap` (1, la gouttière lit width/padding/color, jamais gap), `__syntax---*` (12, shiki gère sa propre coloration via son thème `css-variables` intégré, jamais mappé aux tokens origam par rôle syntaxique — fonctionnalité jamais construite).
- **ExpansionPanel** (3) : `__accordion---separator-color` (1), `__header---font-weight` (1), `__header---hover-overlay-opacity` (1, seul `-focus-overlay-opacity` existe, un survol distinct du focus n'est pas implémenté).
- **Picker** (9, bucket entier) : `---border-color/border-width/max-width/min-width/padding-block/padding-inline/transition-duration/transition-timing-function/z-index` — `OrigamPicker.vue` ne lit QUE background-color/color/box-shadow/border-radius.
- **Carousel** (2) : `__delimiters---gap/padding` (les points de navigation réels sont `__controls-item`, mécanisme d'espacement différent — `margin-inline`, pas `gap`), `__controls---color`.
- **Parallax** (6, bucket entier) : `---aspect-ratio` (1), `---transition-duration-spring/transition-easing-default/transition-easing-spring` (3, une seule courbe existe, aucun mode « spring » alternatif), `---translate-multiplier` (1, aucun concept de multiplicateur), `__element---transition-duration` (1, l'enfant réel s'appelle `__layer`, pas `__element`, et ne lit aucune transition-duration).
- **Card** (2) : `---box-shadow-elevated` (seul un variant `--flat` existe, aucun « elevated »), `---overlay-opacity-disabled` (l'état disabled agit sur la carte entière via un autre token déjà câblé, jamais sur `__overlay` spécifiquement).
- **EmptyState** (1) : `__icon---margin-bottom` — l'icône n'a que display/align/color/font-size/line-height.
- **Treeview** (1) : `---row-gap` — aucun gap entre lignes lu.

### Groupe 6 (50 tokens)
- **DataTable** (29) : racine `border-color/radius/font-size/font-weight/line-height` (5), `__cell---font-size` (1), `__footer---border-*` (3) + `items-per-page-select-width` (1), `__header---border-*` (3) + `color/font-size/font-weight/padding-*` (5) + `sort-badge-color` (1) + `sort-icon-color(-active)` (2, **asymétrie** : le pendant `opacity` EST câblé via un palier intermédiaire, `color` saute direct à la primitive), `__row---border-*` (3) + `selected-background-color` (1, **feature "ligne sélectionnée en surbrillance" inexistante : seul `aria-selected` existe, zéro CSS**) + `striped-background-color` (1, **zébrage jamais implémenté, zéro occurrence de "striped"**), `__sortable---icon-color(-active/-hover)` (3).
- **Toolbar** (2) : `border-variant-box-shadow`, `height-prominent` (zéro occurrence de "prominent").
- **Field** (6) : `transition-duration/easing` racine (2, chaque sous-partie a sa propre durée hardcodée), `__overlay---background-color/opacity/pointer-events/position` (4, **l'élément `.origam-field__overlay` existe dans le template mais aucune règle CSS ne le cible**).
- **Slide (Transition)** (3) : `transition-duration-reverse`, `translate-x-reverse`, `translate-y-reverse` — aucune notion de « reverse » dans SlideX/SlideY.
- **Tooltip** (8, bucket entier) : `transition-duration/timing-function` (2, `transition:false` par défaut), `__arrow---position/size` (2, **aucun élément flèche dans tout le composant**), `__{bottom,left,right,top}---offset` (4, offset = un seul nombre JS, pas par-côté).
- **FileField** (1) : `list-item__remove---size` (bouton = `<origam-btn>` standard, dimensionné par ses propres props).
- **Input** (1) : `icon-opacity-active` (opacité de base câblée, aucune variante active/focus).

---

## 4. Bucket 4 — Écart de valeur (34 tokens) — table complète

⛔ Nouvelle règle : **la valeur à écrire dans la feuille = la valeur rendue
mesurée** (colonne de droite). Le câblage se fait ensuite sans changement
visuel supplémentaire.

| Token | Déclaré (résolu jusqu'à la primitive) | Rendu (mesuré) | Composant | Valeur à écrire |
|---|---|---|---|---|
| `--origam-chart---animation-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-out` (mesuré Playwright : le mot-clé reste littéral, ne se résout PAS en cubic-bezier) | `OrigamChart*.vue` (~19 sous-types) | `ease-out` |
| `--origam-slider-field---opacity-disabled` | `0.32` (`var(--origam-opacity---32)`) | `0.38` | `OrigamSliderField.vue` | `0.38` |
| `--origam-slider-field__thumb---border-width` | `2px` (`var(--origam-border__width---2)`) | `1px` | `OrigamSliderField.vue` | `1px` |
| `--origam-slider-field__thumb---box-shadow` | `var(--origam-shadow---sm)` = `0px 1px 3px 0px rgba(0,0,0,.1), 0px 1px 2px -1px rgba(0,0,0,.1)` | `none` | `OrigamSliderField.vue` | `none` |
| `--origam-slider-field__tick---border-radius` | `9999px` (`var(--origam-radius---full)`) | `2px` | `OrigamSliderFieldTrack.vue` | `2px` |
| `--origam-color-picker---padding-block` | `16px` (`var(--origam-space---4)`) | `16px` | `OrigamColorPicker.vue` | **égal — câblage neutre, aucune réécriture nécessaire** |
| `--origam-color-picker---padding-inline` | `16px` | `16px` | `OrigamColorPicker.vue` | **égal — idem** |
| `--origam-color-picker__cursor---border-radius` | `9999px` (`var(--origam-radius---full)`) | `50%` | `OrigamColorPickerCanvas.vue` (élément réel `&__dot`) | `50%` |
| `--origam-color-picker__cursor---box-shadow` | `var(--origam-shadow---sm)` | `0 0 0 1.5px #fff, inset 0 0 1px 1.5px #0000004d` (anneau blanc) | idem | `0 0 0 1.5px #fff, inset 0 0 1px 1.5px #0000004d` — **écart structurel majeur, revue de design recommandée avant réécriture** |
| `--origam-color-picker__cursor---size` | `16px` | `15px` | idem | `15px` |
| `--origam-color-picker__edit---input-width` | `48px` | `100%` | `OrigamColorPickerEdit.vue` | `100%` — mécanisme différent (fixe vs fluide) |
| `--origam-color-picker__swatches---border-radius` | *(non résolu — à compléter)* | `2px` | `OrigamColorPickerSwatches.vue` | `2px` |
| `--origam-color-picker__swatches---item-size` | *(non résolu)* | `height:18px` / `width:45px` (deux valeurs distinctes) | idem | à trancher : un seul nom `size` pour deux dimensions différentes |
| `--origam-color-picker-field__swatch---border-radius` | *(non résolu)* | `0` | `OrigamColorPickerField.vue` | `0` |
| `--origam-color-picker-field__swatch---height` | *(non résolu)* | `100%` | idem | `100%` |
| `--origam-video__btn---border-radius` | `4px` (`var(--origam-radius---sm)`) | `50%` | `OrigamVideo.vue` | `50%` |
| `--origam-video__btn---size` | `32px` (`var(--origam-space---8)`) | `36px` | `OrigamVideo.vue` | `36px` |
| `--origam-video__btn---background-color-hover` | `#262626` (`var(--origam-color__neutral---800)`, gris sombre opaque) | `rgba(255,255,255,.12)` (blanc translucide) | `OrigamVideo.vue` | ⚠️ **couleurs opposées** — probable erreur d'auteur au moment de la déclaration, pas un oubli de câblage. À arbitrer avant réécriture. |
| `--origam-video__btn---font-size` | `1rem`/`16px` (`var(--origam-font__size---lg)`) | `20px` | `OrigamVideo.vue` | `20px` |
| `--origam-switch__thumb---transition-duration` | `200ms` (`var(--origam-motion__duration---medium)`) | `200ms` pour color/background/border ; `150ms` (+50ms delay) pour transform | `OrigamSwitch.vue` | **écart partiel** — propriété composite, transform seule diverge |
| `--origam-switch__thumb---translate-distance` | `20px` | `±10px` (déplacement total = 20px si on additionne les deux sens) | `OrigamSwitch.vue` | ambigu — probablement déjà cohérent selon l'interprétation « distance totale » |
| `--origam-audio__cover---border-radius` | `8px` (`var(--origam-radius---md)`) | `50%` | `OrigamAudio.vue` | `50%` — **design intentionnel (disque vinyle circulaire), à documenter plutôt qu'à traiter comme un bug** |
| `--origam-slide-group__next---flex` | `0 1 52px` | `0 1 52px` (via `min-width` déjà câblé) | `OrigamSlideGroup.vue` | **égal — token redondant avec `min-width`, pas un écart** |
| `--origam-slide-group__prev---flex` | idem | idem | idem | **égal — idem** |
| `--origam-date-picker__header---font-size` | `1rem`/`16px` (`var(--origam-font__size---lg)`) | `32px` (mesuré Playwright/Chromium sur `.origam-date-picker-header__content`) | `OrigamDatePickerHeader.vue` | `32px` |
| `--origam-date-picker__header---padding-inline` | `16px` symétrique (`var(--origam-space---4)`) | `padding-inline-start:24px` / `padding-inline-end:12px` (asymétrique, mesuré Playwright) | `OrigamDatePickerHeader.vue` | `24px` / `12px` (deux valeurs, pas une seule — le token shorthand ne peut pas porter les deux) |
| `--origam-date-picker__month---padding-inline` | `12px` (`var(--origam-space---3)`) | `8px` (littéral, lu en source — non re-mesuré en direct) | `OrigamDatePickerMonths.vue` | `8px` |
| `--origam-date-picker__year---padding-inline` | `16px` (`var(--origam-space---4)`) | `8px` (littéral, lu en source) | `OrigamDatePickerYears.vue` | `8px` |
| `--origam-snackbar__timer---transition-easing` | `var(--origam-motion__easing---linear)` = `cubic-bezier(0, 0, 1, 1)` | `"linear"` (littéral — l'animation hardcode le mot-clé `linear`, qui reste une chaîne sous `getComputedStyle`, confirmé plus haut pour Chart) | `OrigamSnackbar.vue` | `linear` |
| `--origam-kbd--outlined---background-color` | `rgba(0, 0, 0, 0)` (transparent) | `#ffffff` (`var(--origam-color__surface---raised)` → `neutral-0`, hardcodé) | `OrigamKbd.vue:189` | `#ffffff` |
| `--origam-kbd__filled---background-color` | `#ffffff` (`var(--origam-color__surface---raised)`) | `#f5f5f5` (`var(--origam-color__surface---overlay)` → `neutral-100`, référence sémantique différente) | `OrigamKbd.vue:197` | `#f5f5f5` |
| `--origam-kbd__tonal---background-color` | `#fafafa` (`var(--origam-color__surface---sunken)`, statique) | `color-mix(in srgb, currentColor 8%, transparent)` (mécanisme dynamique relatif à `currentColor`) | `OrigamKbd.vue:205` | ⚠️ **catégoriquement différent** — pas une valeur, un MÉCANISME (statique vs dérivé de `currentColor`). Décision produit avant réécriture. |

**Note de méthode** : 5 des 26 lignes ont une valeur déclarée **non résolue
jusqu'à la primitive** faute de temps dans le lot Groupe 4 (marqué
« non résolu » ci-dessus) — à compléter avant tout câblage. 5 autres lignes
ont une valeur déclarée = valeur rendue (« égal ») : ce ne sont pas des écarts
réels, elles ont été classées bucket 4 par le fork par excès de prudence ;
elles se câblent sans aucune réécriture.

---

## 5. Bucket 6 — Nouvelles quasi-collisions (au-delà des 7 déjà connues)

Le détecteur `canon()` fourni dans le ticket (`split` sur `-` uniquement) **ne
détecte pas** les cas où la frontière BEM `__` a glissé, ni les cas où un mot
d'état supplémentaire (`is-active`) s'est ajouté. Extension proposée par deux
lots indépendamment, à valider :

```js
const canon = (t) => t.replace(/^--origam-/, '')
  .split(/[-_]+/).filter(Boolean).sort().join('|')
```

Nouvelles collisions trouvées (non exhaustif — seulement dans les groupes
1, 2, 4, 6 ; groupes 3 et 5 non vérifiés) :

| Déclaré | Lu comme | Le nom lu est-il lui-même mort ? |
|---|---|---|
| `--origam-list__group---header-active-hover-opacity` | `--origam-list-group__header--active--hover---opacity` | Non — celui-là est vivant |
| `--origam-list__item---min-height` | `--origam-list-item---min-height` | **Oui, mort aussi** |
| `--origam-list__item---overlay-background-color` | `--origam-list-item__overlay---background-color` | **Oui, mort aussi** |
| `--origam-list__item---overlay-opacity` | `--origam-list-item__overlay---opacity` | **Oui, mort aussi** |
| `--origam-list__item---overlay-transition-timing-function` | `--origam-list-item__overlay---transition-timing-function` | **Oui, mort aussi** |
| `--origam-list__item---subtitle-font-size` | `--origam-list-item__subtitle---font-size` | **Oui, mort aussi** |
| `--origam-list__item---title-font-size` | `--origam-list-item__title---font-size` | **Oui, mort aussi** |
| `--origam-list__subheader---font-size` | `--origam-list-subheader---font-size` | **Oui, mort aussi** |
| `--origam-slider-field__thumb---border-color` | `--origam-slider-field-thumb__surface---border-color` | **Oui, mort aussi** |
| `--origam-slider-field__tick---size` | `--origam-slider-field-track__tick---size` | Non — vivant (famille enfant dédiée) |
| `--origam-pagination__item---active-background-color` | `--origam-pagination__item--is-active---background-color` | Non — vivant |
| `--origam-pagination__item---active-color` | `--origam-pagination__item--is-active---color` | Non — vivant |
| `--origam-pagination__item---active-overlay-opacity` | `--origam-pagination__item--is-active---active-overlay-opacity` | Non — vivant |
| `--origam-color-picker__edit---label-font-size` | `--origam-color-picker-edit__label---font-size` | Non — vivant |
| `--origam-tabs__panel---transition-duration` | `--origam-tab-panels__panel---transition-duration` | Non — vivant *(confirme l'exemple déjà cité dans le ticket, avec la nuance que le nom lu n'est PAS mort ici — simple défaut, pas double)* |

**8 nouveaux doubles-défauts** (le nom lu est lui-même mort) s'ajoutent donc
aux 3 déjà connus dans le ticket, portant le total à **11 doubles-défauts
identifiés**.

**Groupe 3, quasi-collisions supplémentaires** (mots substitués, pas
réordonnés — hors portée du `canon()` strict même étendu) :

| Déclaré | Lu comme | Le nom lu est-il vivant ? |
|---|---|---|
| `--origam-date-picker__weekday---font-size` | `--origam-date-picker-month__weekday---font-size` (mot « month » ajouté) | Oui, vivant (0.85rem, `light.css:2025`) — doublon mort, pas un double-défaut |
| `--origam-text-mask__animation---duration-default` | `--origam-text-mask---duration` (mots « animation »/« default » retirés) | ⛔ **Non déclaré nulle part, ET sans aucun repli** (`var(...)` sans 2ᵉ argument) — pire que les 7 connus, qui avaient tous un repli. Propriété `animation-duration` potentiellement invalide en l'état. |

**Groupe 5, quasi-collisions supplémentaires** :

| Déclaré | Lu comme | Le nom lu est-il vivant ? |
|---|---|---|
| `--origam-alert__text---font-size/font-weight/hyphens/letter-spacing/line-height/word-break/word-wrap` (7) | `--origam-alert__title---*` (mêmes 7 propriétés, substitution `text`→`title`) | Oui, vivant et correctement câblé |
| `--origam-carousel__delimiters---active-color/color` (2) | `--origam-carousel__controls-item---center-color/opacity` (substitution complète de vocabulaire) | Oui, vivant |

Les 4 « déjà connues » du ticket (Window `__item-{x,y}-transition-*`) sont
confirmées dans le Groupe 6, sans nouveauté.

---

## 6. Bucket 7 — Autre (50 tokens)

Motif dominant : **littéral en dur au lieu du token** (le token existe, la
propriété existe, mais le SCSS écrit la valeur directement plutôt que de
lire `var(--token, valeur)`). Ce motif est le plus sûr à câbler (remplacement
littéral → `var(token, même littéral)`, zéro changement visuel), à l'exception
notable du cas Toolbar ci-dessous.

- **Toolbar (13)** : `border-variant-border-width` (1, nom suspect,
  possible artefact #435) + **12 tokens margin/padding `__append/__prepend/__title`
  documentés dans le code comme RETIRÉS DÉLIBÉRÉMENT** (`OrigamToolbar.vue:402-409`,
  commentaire explicite : remplacés par `gap` sur `__wrapper`, « confirmed
  zero visual change before removal », issue #440-2). ⛔ **Ne pas câbler —
  ce serait réintroduire un anti-pattern déjà mesuré et rejeté.** Candidat
  net à la **suppression pure des déclarations**.
- **App (2)** : `min-height`/`position` — hardcodés dans Layout (100vh /
  relative), aucun canal var, ni sous le nom App ni sous un nom Layout dédié.
- **BottomNav (5)** : `border-variant-border-width`,
  `density-{comfortable,compact,default}-density` (nom doublé, artefact
  probable #435), `__rounded---border-radius` — tous hardcodés en dur dans
  les classes modificatrices (`&--border`, `&--density-*`, `&--rounded-*`).
- **Field (4)** : `append/prepend-inner-icon-opacity-focused` (2, littéral `1`
  en dur), `color` (littéral `inherit`/`currentColor`, choix délibéré),
  `letter-spacing` (littéral `0.009375em` en dur).
- **Slide/Transition (6)** : `opacity-from`, `transition-duration`,
  `transition-timing-function`, `translate-x-default`, `translate-y-default`
  — 100 % de SlideX/SlideY est en littéraux, zéro `var()` dans les deux
  fichiers (grep confirmé).
- **FileField (1)** : `transition-easing` — la durée est câblée, l'easing
  reste `ease` en dur juste à côté.
- **Input (1)** : `__details---padding-top` — hardcodé `6px` alors que ses
  deux voisins directs (`__prepend`/`__append---padding-top`) SONT câblés.
  Incohérence locale ponctuelle, pas un motif.
- **SlideGroup (2)** : `__next/__prev---flex` — redondant avec `min-width`
  déjà câblé, valeur identique des deux côtés (voir aussi §4, classé bucket 4
  par excès de prudence par le fork).
- **Pagination (3)** : `--primary---background-color/background-color-hover/color`
  — nom mort issu d'un renommage `primary → colored` jamais terminé.
- **Menu (4)** : `offset-{bottom,left,right,top}` — le décalage est un **prop
  JS** (`offset: 8`), pas un canal CSS ; la feature existe, pas via ces tokens.
- **SelectionControl (1)** : `color-error` — superseded par `__label`/`__icon`
  `-error`, doublon racine jamais lu.
- **Dialog (2)** : `__fullscreen---max-height/max-width` — le modifier
  `&--fullscreen` hardcode `100vh`/`100vw` au lieu de lire ces tokens.
- **InlineEdit (1)** : `__input---min-width` — même rôle que
  `__field---min-width` (vivant), vocabulaire renommé, pas une collision
  canon (mots différents).
- **Stepper (3)** : `indicator-active-color`, `indicator-done-bg`,
  `indicator-done-color` — **second cas du défaut « sélecteur combiné »**
  déjà documenté pour SlideGroup (`&--active, &--done` ne lit que les tokens
  génériques `color`/`background-color` pour les deux états).

---

## 7. Les 141 tokens « primitifs / génériques » (color, font, motion, space,
opacity, zIndex, gradient, border, shadow, spacer) — traités séparément

Ces tokens n'ont pas de composant propriétaire unique : ce sont des rungs
d'échelle (palette de couleurs, tailles de police, durées d'animation…),
normalement consommés PAR la couche sémantique (`light.css`/`dark.css`)
plutôt que directement par un composant. Le garde `token-var-channels` ne
scanne que les `.vue`/`.ts`, jamais les autres feuilles CSS entre elles — il
est donc structurellement aveugle à cette consommation intermédiaire.

| Sous-catégorie | Tokens | Explication |
|---|---:|---|
| **Référencés par la couche sémantique, qui EST lue par un composant** | **81** | ⛔ **Faux positif du garde**, pas un vrai défaut. La chaîne primitive→sémantique→composant est complète ; seul le premier maillon échappe au scan `.vue`/`.ts`. Recommandation : étendre le garde pour aussi scanner les `var()` internes à `light.css`/`dark.css` comme un « read » valide — ticket séparé à ouvrir. |
| **Référencés uniquement par un autre token LUI-MÊME dormant** (chaîne morte) | **12** | Même cause racine que les composants en bucket 5 (couleur peinte par un composable générique, pas par les tokens per-intent) — remontée d'un niveau. Ex. `--origam-color__feedback--warning---border` n'est lu que par `--origam-alert--warning---border` / `--origam-chip--warning---border-color` / `--origam-snackbar--warning---border`, eux-mêmes dormants. |
| **Zéro référence nulle part, à aucun niveau** | **48** | Réellement mort. Détail ci-dessous. *(49 mesurés initialement, moins `--origam-spacer---min-size` reclassé en §3 Groupe 3 — c'est un vrai composant, `OrigamSpacer.vue`, pas une primitive orpheline.)* |

### Le détail des 49 tokens réellement orphelins

- **Famille `gradient` (5, complète) : `fire`, `forest`, `midnight`, `ocean`,
  `sunset`** — zéro référence à AUCUN niveau (ni composant, ni sémantique,
  ni utilitaire). Une palette de dégradés entièrement non branchée.
  **Candidat net à la suppression.**
- **`border__style---{dashed,dotted,solid}` + `border__width---4`** (4) —
  les classes utilitaires (`origam-utilities.css:61-63`) hardcodent
  `border-style: solid` en littéral plutôt que de référencer le token ; le
  concept de style de bordure variable n'existe nulle part ailleurs.
- **Palette de couleurs jamais tirée** (35) : `amber` (100,200,300,500,800,900),
  `blue` (100,200,300,600,800,900), `green` (100,200,300,700,800,900),
  `red` (100,200,300,500,800,900), `primary` (100,200,800), `neutral-500`,
  `color__text---onColor`, `color__action--ghost/secondary---bgDisabled/fgDisabled` (4).
- **`font__weight---black/extrabold`** (2), **`motion__duration---instant`**
  (1), **`motion__easing---accelerate/sharp`** (2), **`zIndex---sticky`**
  (1).

---

## 7bis. Deux nouveaux angles morts du garde lui-même (trouvés par le Groupe 5)

Le garde `token-var-channels` a déjà un angle mort documenté (#552, script
JS/TS). Le Groupe 5 en a trouvé **deux autres**, tous deux structurels — ils
touchent potentiellement bien plus de composants que leur seul lot :

1. **Boucle SCSS `@each $x in (...) { --comp--#{$x}---prop }`** — le garde
   scanne le texte SCSS BRUT, jamais la sortie compilée. Un token lu
   seulement via interpolation de variable de boucle
   (`var(--origam-snackbar--#{$status}---border, ...)` dans un
   `@each $status in (success, info, warning, danger)`) est donc invisible
   au scanner ET compté « dormant » à tort. **4 faux positifs confirmés**
   dans ce lot (`--origam-snackbar--{danger,info,success,warning}---border`,
   classés bucket 7 faute de mieux dans ce rapport — ce n'est PAS un vrai
   défaut).
2. **Bloc `<script setup>` d'un SFC `.vue`** — le correctif #552
   (`readNamesFromScriptSources`) ne scanne que les fichiers `.ts`/`.mts`
   standalone, JAMAIS le `<script>` d'un `.vue` lui-même. `OrigamCode.vue`
   construit un objet de style inline (`copyBtnStyle`) dans son propre
   `<script setup>` qui référence 2 tokens en JS
   (`--origam-code__copy---padding-block/inline`) — invisibles au garde pour
   la même raison structurelle que #552, un cran plus bas.

**Ces deux angles morts ne sont PAS quantifiés à l'échelle du dépôt** — seul
le Groupe 5 les a rencontrés et documentés dans son propre périmètre.
Recommandation : ouvrir un ticket dédié pour étendre le garde (reconnaître le
motif `@each`/`#{$var}`, et scanner aussi les blocs `<script>` des `.vue`)
avant de tirer des conclusions définitives sur le nombre réel de canaux
morts dans tout le dépôt — certains des 316 tokens du bucket 3 pourraient
être de faux positifs du même type, non vérifiés dans ce tour.

## 8. Composants App/AppBar/Progress/Chart/BottomNav (42 tokens) — classés par le lead

| Composant | Tokens | Bucket | Détail |
|---|---:|---|---|
| AppBar | 11 | 2 | Délègue tout à Toolbar — **documenté explicitement dans le code** (`OrigamAppBar.vue:312-332` : « No AppBar-scoped CSS is necessary — the file no longer ships a `<style>` block »). |
| Progress (racine) | 11 | 2 | `<component :is="progressComponent">` dispatche vers ProgressCircular/ProgressLinear, qui ont chacun leur PROPRE famille de tokens (`progress-circular`/`progress-linear`, préfixes distincts, effectivement lus). |
| ProgressCircular | 4 | 5 | Couleurs par intention (danger/info/success/warning) peintes par `useTextColor` (composable générique), aucun canal CSS dédié. |
| ProgressLinear | 1 | 3 | `__bar---transition-property` : la barre fait `transition: inherit`, rien à lire. |
| App | 3 | 3 | `display`/`flex-direction`/`overflow` — zéro règle CSS nulle part (ni App, ni Layout). |
| App | 2 | 7 | `min-height`/`position` — hardcodés en dur dans Layout (100vh/relative), aucun canal var du tout. |
| Chart | 1 | 4 | `animation-easing` — déclaré `cubic-bezier(0.4,0,0.2,1)`, rendu **mesuré en Playwright** = littéralement `"ease-out"` (le mot-clé keyword `ease-out`, comme `linear`, reste une chaîne littérale sous `getComputedStyle`, ne se résout PAS en cubic-bezier — vérifié en navigateur réel, ne pas supposer). Affecte ~19 sous-types de Chart (Bullet, Candlestick, Cartesian, Gauge, Heatmap, Honeycomb, Map, Pareto, Pictorial, Polar, Pyramid, Radar…). |
| Chart | 1 | 6 | `__axis---label-font-size` lu comme `__axis-label---font-size` — **confirme l'exemple déjà cité dans le ticket**, et ce nom lu est lui-même mort (non déclaré). |
| Chart | 3 | 3 | `__bar---gap`, `__point---radius(-hover)` — gap/rayon pilotés par géométrie JS pure (`geo.radius`, `radiusFor(z)`, `CHART_ANNOTATION_DEFAULT_RADIUS`), jamais un CSS var. |
| BottomNav | 5 | 7 | `border-variant-border-width`, `density-{comfortable,compact,default}-density` (nom doublé, probable artefact #435), `__rounded---border-radius` — tous hardcodés en dur dans les classes modificatrices, jamais lus via `var()`. |

---

## 9. Avis motivé (frontend-lead) — synthèse des recommandations

**À supprimer avec un ticket de remédiation (bucket 3, 197 tokens)** :
particulièrement nets — DataTable ligne sélectionnée/zébrage (2 features
visuelles complètes jamais construites, 2 tokens mais représentatives de
29 tokens DataTable), Tooltip flèche/offset directionnel (8, feature
complète absente), Icon couleurs par intention + tailles étendues (9, à
arbitrer produit), OtpInputField theming racine (9, semble n'avoir jamais eu
de vraie couche de theming), InlineEdit vocabulaire « editor » mort (8),
Responsive aspect-ratio (3, **le composable dit lui-même que rien n'est
prévu**).

**À NE PAS supprimer ni câbler sans revue de design (bucket 4)** :
`--origam-color-picker__cursor---box-shadow` (structure visuelle différente),
`--origam-video__btn---background-color-hover` (couleur opposée, probable
erreur d'auteur), `--origam-audio__cover---border-radius` (cercle
intentionnel, à documenter comme tel plutôt que « corriger »).

**À NE PAS toucher, réintroduirait un défaut déjà rejeté** : les 12 tokens
Toolbar `__append/__prepend/__title` — retrait déjà mesuré et documenté dans
le code comme visuellement neutre (#440-2).

**Motif transversal à traiter une fois, pas composant par composant** : le
« sélecteur combiné qui ne lit que le nom générique » (`&--active, &--done`
sur Stepper ; `&__prev, &__next` sur SlideGroup, déjà connu) — vaut la peine
d'un grep systématique sur tout le DS plutôt que d'attendre qu'un lot tombe
dessus par hasard.

**Groupe 3 — suppressions nettes** : DataList `bordered`/`striped` (11,
zéro ligne de code, chantier jamais commencé) ; Sheet 4 rayons de coin
logiques (implémenter à l'aveugle fabriquerait une fonctionnalité, pas une
réparation). **Arbitrage produit requis, pas suppression silencieuse** : Row
`gap-*` (4) — Row n'a AUCUN espacement inter-éléments aujourd'hui ; câbler
changerait le rendu de CHAQUE `<origam-row>` existant.

**Groupe 5 — suppressions nettes** : Code `__syntax---*` (12, réécrire
l'intégration shiki pour émettre des classes par rôle est une feature à part
entière) ; Alert `--subtle` (8) et Snackbar `content`/`actions`/`prepend` (9,
extensions jamais démarrées) ; Parallax (6, mode « spring » jamais existé).
**À câbler, c'est un vrai bug** : Alert `border` par statut (4) — bg/fg
fonctionnent par intention, border non, incohérence visible dès qu'un
consommateur active `--border` sur un Alert coloré.

**Extension d'outillage recommandée** : le détecteur `canon()` du ticket rate
une partie significative des quasi-collisions BEM (`__` non normalisé, mots
d'état supplémentaires comme `is-active`). Version étendue proposée §5,
vérifiée sur 15 nouvelles collisions trouvées dans les 4 lots traités.

---

## 10. Ce qui reste à faire

1. **Résoudre les 5 valeurs déclarées non résolues** dans la table §4
   (ColorPicker/ColorPickerField swatches) et re-mesurer en Playwright les 2
   lignes DatePicker `__month`/`__year---padding-inline` (actuellement lues
   en source, pas re-vérifiées en navigateur faute de temps).
2. **Trancher le conflit Btn `ghost`** entre bucket 5 (mesuré Groupe 6 :
   couleur intégralement peinte par `useStateEffect`, aucun des 17 noms lu
   nulle part) et bucket 6 (cité dans le ticket original comme
   quasi-collision avec repli) avant toute réécriture de feuille — voir §2.
3. **Étendre le garde `token-var-channels`** sur trois angles morts
   maintenant identifiés :
   - un `var()` interne à `light.css`/`dark.css` comme « read » valide côté
     primitives (éliminerait 81 faux positifs, cf. §7) ;
   - le motif `@each $x in (...) { --comp--#{$x}---prop }` en SCSS (cf. §7bis,
     4 faux positifs confirmés, non quantifié à l'échelle du dépôt) ;
   - les blocs `<script setup>` des `.vue` eux-mêmes, pas seulement les
     fichiers `.ts` standalone (cf. §7bis, 2 faux positifs confirmés).
   Ces trois angles morts n'ont été vérifiés que dans les lots où ils sont
   apparus par hasard — un audit dédié pourrait faire baisser le compte de
   316 (bucket 3) et de 141 (primitifs) sans qu'un seul câblage soit fait.
4. **Ouvrir les tickets de remédiation** pour les fonctionnalités bucket 3
   jugées dignes d'être vraiment construites (décision utilisateur), et
   supprimer les autres, conformément à la décision « un token est un canal,
   pas un cahier des charges ».
