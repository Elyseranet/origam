# Tokens Changelog

Auto-generated changelog for the design tokens layer of `origam`. The frontend
package itself follows its own SemVer in `CHANGELOG.md`; this file tracks token
value changes only.

Format inspired by [Keep a Changelog](https://keepachangelog.com/) but scoped
to design token mutations:

- **Added**: new tokens (primitive, semantic, component).
- **Changed**: value updates (e.g. `color.primary.500` from `#7C3AED` to `#8B5CF6`).
- **Renamed**: token path renames — always paired with an alias kept under
  `Deprecated` until the next major version.
- **Deprecated**: tokens marked for removal at next major.
- **Removed**: tokens dropped (only at major bumps).

The `tokens-sync` GitHub Action populates this file automatically when Tokens
Studio for Figma pushes a JSON change. Manual edits are allowed for clarifying
copy.

---

## [Unreleased]

### Added
- Component tier (Lot 5B — List + ExpansionPanel, 10 fichiers Vue migrés) :
  - `component/list` — 93 tokens répartis en :
    - Racine (24 tokens) : `background` → `{color.surface.default}`, `color` → `{color.text.primary}`, `box-shadow` → `{shadow.none}`, border logique (12 tokens → `{border.width.0}`, `{radius.none}`), `padding-block-{start,end}` → `{space.2}`, `padding-inline-*` → `{space.0}`, `overflow`, `position`, `outline`, `pointer-events`, `user-select`, `indent-padding`, `density`, `indent-padding-nav`, `slim-prepend-width`.
    - BEM `overlay` (12 tokens) : `background-color` → `{color.overlay.scrim}`, `opacity` → `{opacity.0}`, `position`, `transition-*`.
    - BEM `item` (38 tokens) : layout grid complet, border logique (8 tokens), padding (4 logiques), margin (4 logiques), états désactivé/lien.
    - BEM `item.overlay/underlay/icon/prepend/append/content` : 29 tokens.
    - BEM `item.title` (14 tokens — typographie complète), `item.subtitle` (13 tokens).
    - BEM `subheader` (8 tokens) : `color` → `{color.text.secondary}`, `font-size` → `{font.size.sm}`, `inset-indent-padding`, `nav-font-size`.
    - BEM `group` (5 tokens) : `list-indent-size` → `{space.4}`, `prepend-width` → `{space.4}`, overlay opacités.
    - BEM `divider` (2 tokens) : `color` → `{color.border.subtle}`.
  - `component/expansion-panel` — 57 tokens répartis en :
    - Racine (16 tokens) : `background` → `{color.surface.raised}`, `color` → `{color.text.primary}`, `border-radius` → `{radius.sm}`, `border-color` → `{color.border.subtle}`, `transition-*`, `flex`, `max-width`, `position`.
    - États racine (6 tokens) : `divider-color` → `{color.border.subtle}`, `divider-opacity` → `{opacity.12}`, `active-margin-top` → `{space.4}`, `disabled-color` → `{color.text.disabled}`, `disabled-pointer-events`, `disabled-overlay-opacity` → `{opacity.60}`.
    - BEM `shadow` (7 tokens) : `box-shadow` → `{shadow.sm}`, positionnement absolu, `z-index: -1`.
    - BEM `header` (9 tokens) + `header.wrapper` (7 tokens) + `header.overlay` (6 tokens) + `header.prepend/append` (4 tokens).
    - BEM `content` (7 tokens) : `padding-block-{start,end}`, `padding-inline-{start,end}`, `flex`, `max-width`, `display`.
    - Variantes `accordion` (2 tokens), `popout` (2 tokens), `inset` (2 tokens).

### Changed (Lot 5B)
- `OrigamList.vue` : 5 hex/rgba retirés (`rgba(0,0,0,0.87)` border/color → `var(--origam-color-text-primary)` ; `rgb(255,255,255)` background → `var(--origam-color-surface-default)` ; `#000` overlay → `var(--origam-color-overlay-scrim)` ; triple rgba box-shadow → `var(--origam-shadow-none)`). Bloc `<style>:root{}` global supprimé (49 custom properties).
- `OrigamListItem.vue` : 2 hex retirés (`rgba(0,0,0,0.87)` border → `var(--origam-color-text-primary)` ; `#000` overlay → `var(--origam-color-overlay-scrim)`). Bloc `<style>:root{}` global supprimé (70 custom properties).
- `OrigamListGroup.vue` : 0 hex direct. Bloc `<style>:root{}` global supprimé (7 custom properties). Fallbacks ajoutés dans `<style scoped>`.
- `OrigamListSubheader.vue` : **Bug fix (port Origam)** — `color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity))` (Vuetify) → `var(--origam-list-subheader---color, var(--origam-color-text-secondary))`. Migration `lang="css"` → `lang="scss"`. Bloc `<style></style>` global vide supprimé.
- `OrigamExpansionPanels.vue` : 0 hex. Bloc `<style>:root{}</style>` vide supprimé. Variantes `--popout/--inset/--accordion` tokenisées.
- `OrigamExpansionPanel.vue` : **Bug fix (port Optimus)** — `box-shadow` du `__shadow` utilisait `var(--v-shadow-key-umbra-opacity, rgba(…))` (Vuetify) → `var(--origam-expansion-panel__shadow---box-shadow, var(--origam-shadow-sm))`. **Bug fix** — sélecteur `:not(.v-expansion-panel-title--static)` → `:not(.origam-expansion-panel-header--static)`. 3 hex retirés : `rgba(33,33,33,0.12)` → `var(--origam-color-border-subtle)` ; `rgba(0,0,0,0.26)` → `var(--origam-color-text-disabled)` ; triple rgba shadow → `var(--origam-shadow-sm)`. Bloc `<style>:root{}</style>` vide supprimé.
- `OrigamExpansionPanelHeader.vue` : **Bug fix (port Optimus)** — sélecteurs SCSS `&:hover { &__overlay { … } }` invalides → corrigés en `&:hover { .origam-expansion-panel-header__overlay { … } }`. Valeurs hardcodées (0.9375rem, 48px, 16/24px, -4px, 8px) encapsulées dans `var()`. Bloc `<style>:root{}</style>` vide supprimé.
- `OrigamExpansionPanelContent.vue` : `padding: 8px 24px 16px` → `var()` logiques (block/inline séparés pour RTL). Bloc `<style>:root{}</style>` vide supprimé.

### Points d'arbitrage ouverts (Lot 5B)
- **`expansion-panel.header.font-size` = 0.9375rem (15px)** : entre `font.size.md` (16px) et `font.size.sm` (14px). Valeur littérale conservée. Décision requise : ajouter `font.size.base-minus` ou aligner sur `font.size.md`.
- **`expansion-panel.disabled-overlay-opacity` = 0.4615384615** : valeur Vuetify originale. Aliasée sur `{opacity.60}` dans le token JSON, fallback littéral conservé dans le CSS. Décision : accepter `opacity.60` ou créer `opacity.46`.
- **`expansion-panel.divider-opacity` = 0.12** : `opacity.12` absent du primitif (connu depuis Lot 3.2). Valeur littérale conservée en fallback. Décision : ajouter `opacity.12` au primitif.
- **`list.item.overlay.opacity` initial = 0.2** : `opacity.20` absent du primitif (connu depuis Lot 2D). Valeur littérale 0.2 conservée en fallback.
- **`color.overlay.scrim` = blanc en light** : utilisé comme background-color des overlays List et ListItem. Problème identique Lot 4C — décision `color.overlay.backdrop` toujours pendante.

- Component tier (Lot 5D — navigation/scroll, 5 composants tokenisés) :
  - `component/pagination` — 12 tokens :
    - Racine (3 tokens) : `gap` → `{space.1}` (4px), `padding-block/inline` → `{space.0}`.
    - Sous-section `item` (6 tokens) : `background-color` (transparent), `color` → `{color.text.primary}`, `background-color-hover` → `{color.action.secondary.bgHover}`, `active-background-color` → `{color.action.primary.bg}`, `active-color` → `{color.action.primary.fg}`, `active-overlay-opacity` (0.12 littéral — correspond à `opacity.12`).
    - Sous-section `prev-next-icon` (2 tokens) : `color` → `{color.text.primary}`, `opacity-disabled` → `{opacity.26}`.
    - Sous-section `ellipsis` (2 tokens) : `color` → `{color.text.secondary}`, `font-weight` → `{font.weight.bold}`.
    - Variantes (3 tokens) : `border-radius` → `{radius.sm}`, `border-radius-rounded` → `{radius.2xl}`, `border-radius-circle` → `{radius.full}`.
    - Bloc `<style>:root{}` global supprimé (1 custom property `--origam-pagination__item--is-active---border-opacity: 0.12`).
    - Migrations scoped : `margin: .3rem` → `var(--origam-pagination---gap, 4px)` ; `border-radius: 4px` → `var(--origam-pagination---border-radius, 4px)` ; `border-radius: 50%` → `var(--origam-pagination---border-radius-rounded, 24px)`.
  - `component/table` — 12 tokens :
    - Racine (4 tokens) : `background-color` → `{color.surface.default}`, `color` → `{color.text.primary}`, `font-size` → `{font.size.md}`, `border-collapse` (collapse).
    - Sous-section `header-cell` (6 tokens : `background-color` → `{color.surface.overlay}`, `color`, `font-weight` → `{font.weight.semibold}`, `padding-block/inline` → `{space.3/4}`, `border-bottom-color` → `{color.border.default}`, `border-bottom-width` → `{border.width.2}`).
    - Sous-section `cell` (3 tokens : `padding-block/inline` → `{space.3/4}`, `border-color` → `{color.border.subtle}`, `border-width` → `{border.width.thin}`).
    - Sous-section `row` (1 token : `hover-background-color` → `{color.surface.sunken}`).
    - Bloc `<style scoped>` ajouté — composant n'en avait pas.
  - `component/virtual-scroll` — 4 tokens :
    - `item-height` (48px), `scroll-padding` → `{space.0}`, `transition-duration` → `{motion.duration.fast}`, `transition-easing` → `{motion.easing.standard}`.
    - Blocs `<style scoped>` ajoutés dans `OrigamVirtualScroll.vue` et `OrigamVirtualScrollItem.vue` — aucun hex présent.
  - `component/infinite-scroll` — 7 tokens :
    - Sous-section `loader` (5 tokens : `color` → `{color.action.primary.bg}`, `gap` → `{space.3}`, `padding-block` → `{space.3}`, `padding-inline` → `{space.0}`, `font-size` → `{font.size.md}`).
    - Sous-section `empty` (2 tokens : `color` → `{color.text.secondary}`, `padding-block` → `{space.3}`).
    - Bloc `<style scoped>` ajouté dans `OrigamInfiniteScroll.vue` — aucun hex présent.
    - Note : usages Vuetify `<v-*>` déjà migrés vers OrigamBtn/OrigamProgress dans le port Origam — aucun bug fix legacy appliqué.
  - `component/breadcrumb` — 45 tokens :
    - Racine (14 tokens) : `gap`, `padding-block/inline`, `font-size`, `background` (transparent — remplace `rgb(230,230,230)`), `color` → `{color.text.primary}` (remplace `rgba(0,0,0,0.87)`), border (color/style/radius/radius-rounded), `box-shadow/box-shadow-elevated` → `{shadow.none/md}` (remplace 2 rgba hardcodés), transition ×3.
    - Sous-section `item` (14 tokens) : `color/hover-color/active-color`, `opacity/opacity-disabled`, `text-decoration`, `background`, `box-shadow`, `border-color/style/radius`, transition ×3.
    - Sous-section `divider` (13 tokens) : `color` → `{color.text.secondary}`, `font-size`, `character`, `padding-inline`, `opacity`, `background`, `box-shadow`, `border-color/style/radius`, transition ×3.
    - Sous-section `home-icon` (1 token) : `color` → `{color.action.primary.bg}`.
    - Blocs `<style>:root{}` globaux supprimés : 3 fichiers (OrigamBreadcrumb, OrigamBreadcrumbItem, OrigamBreadcrumbDivider).
    - 4 hex retirés : `rgba(0,0,0,0.87)` → `var(--origam-color-text-primary)` ; `rgb(230,230,230)` → transparent ; `rgba(0,0,0,0.05)` + `rgba(0,0,0,0.08)` → `var(--origam-shadow-md)`.
  - 5 fichiers enregistrés dans `$metadata.json` (tokenSetOrder après `component/tooltip`) et activés dans `$themes.json` (light + dark).

### Changed (Lot 5D)
- `OrigamPagination.vue` : bloc `<style>:root{}` supprimé, active overlay opacity encapsulée dans `var()`, `margin: .3rem` et `border-radius: 4px/50%` migrés vers tokens.
- `OrigamTable.vue` : bloc `<style scoped>` ajouté (th/td/tr:hover tokenisés).
- `OrigamVirtualScroll.vue` + `OrigamVirtualScrollItem.vue` : blocs `<style scoped>` ajoutés.
- `OrigamInfiniteScroll.vue` : bloc `<style scoped>` ajouté avec custom properties `__side` tokenisées.
- `OrigamBreadcrumb.vue` : bloc `<style>:root{}` supprimé, defaults migrées dans `<style scoped>` avec fallbacks sémantiques. 4 hex retirés.
- `OrigamBreadcrumbItem.vue` : bloc `<style>:root{}` supprimé, defaults migrées dans `<style scoped>`. 0 hex (valeurs `inherit`/`transparent`/numériques).
- `OrigamBreadcrumbDivider.vue` : bloc `<style>:root{}` supprimé, defaults migrées dans `<style scoped>`. 0 hex.

### Points d'arbitrage ouverts (Lot 5D)
- **Pagination `border-radius-rounded`** : `50%` (dynamique) remplacé par `{radius.2xl}` = 24px (fixe). Pour des boutons de hauteur variable, `50%` offre un vrai cercle — décision requise du lead.
- **Breadcrumb background** : défaut `rgb(230,230,230)` migrée vers `transparent`. Si le fond gris est intentionnel, créer `color.surface.nav` ou utiliser `{color.surface.overlay}`.
- **Breadcrumb `--elevated` shadow** : `rgba(...)` conservés en fallback CSS uniquement ; la variable `--origam-shadow-md` émise par `tokens:build` prend le relais. Confirmer alignement visuel.

- Component tier (Lot 5A — DataTable family, 10 fichiers Vue, 1 token file) :
  - `component/data-table` — 68 tokens répartis en :
    - Racine `data-table` (10 tokens) : `background-color` → `{color.surface.default}`, `color` → `{color.text.primary}`, `border-color` → `{color.border.subtle}`, `border-radius` → `{radius.none}`, `font-size` → `{font.size.md}`, `font-weight` → `{font.weight.regular}`, `line-height` → `{font.lineHeight.normal}`, `width`, `border-collapse`, `border-spacing`.
    - Sous-section `loading` (1 token) : `opacity` → `{opacity.50}` — appliquée aux cells en état `--loading`.
    - Sous-section `header` (9 tokens) : `background-color` → `{color.surface.raised}`, `color` → `{color.text.inverse}`, `font-weight` → `{font.weight.medium}`, `font-size` → `{font.size.sm}`, `padding-block` → `{space.3}`, `padding-inline` → `{space.4}`, `border-bottom-color` → `{color.border.default}`, `border-bottom-width` → `{border.width.thin}`, `border-bottom-style`.
    - Sous-section BEM `header.sort-icon` (5 tokens) : `color` → `{color.text.inverse}`, `color-active`, `opacity` → `{opacity.0}`, `opacity-hover` → `{opacity.50}`, `opacity-active` → `{opacity.100}`.
    - Sous-section BEM `header.sort-badge` (9 tokens) : `background-color` → `{color.border.default}`, `color` → `{color.text.inverse}`, `font-size`, `padding` → `{space.1}`, `border-radius` → `{radius.full}`, `min-width/height`, `width/height`.
    - Sous-section `row` (10 tokens) : `background-color` → `{color.surface.default}`, `color` → `{color.text.primary}`, `hover-background-color` → `{color.surface.overlay}`, `selected-background-color` → `{color.surface.overlay}`, `striped-background-color` → `{color.surface.sunken}`, `border-bottom-color` → `{color.border.subtle}`, `border-bottom-width` → `{border.width.thin}`, `border-bottom-style`, `transition-duration` → `{motion.duration.fast}`, `transition-easing` → `{motion.easing.standard}`.
    - Sous-section `row.column-title` (1 token) : `font-weight` → `{font.weight.medium}`.
    - Sous-section `row.mobile` (1 token) : `column-min-height` → 52px littéral (taille touch target standard).
    - Sous-section `cell` (3 tokens) : `padding-block` → `{space.3}`, `padding-inline` → `{space.4}`, `font-size` → `{font.size.md}`.
    - Sous-section `cell.fixed` (2 tokens) : `background-color` → `{color.surface.raised}`, `z-index` → 1.
    - Sous-section `cell.last-fixed` (3 tokens) : `border-right-color` → `{color.border.subtle}`, `border-right-width` → `{border.width.thin}`, `border-right-style`.
    - Sous-section `footer` (11 tokens) : `background-color` → `{color.surface.default}`, `color` → `{color.text.primary}`, `padding-block` → `{space.2}`, `padding-inline` → `{space.1}`, `border-top-color` → `{color.border.subtle}`, `border-top-width` → `{border.width.thin}`, `border-top-style`, `align-items`, `display`, `flex-wrap`, `justify-content`.
    - Sous-section `footer.items-per-page` (3 tokens) : `gap` → `{space.2}`, `padding-inline-end` → `{space.2}`, `select-width`.
    - Sous-section `footer.info` (3 tokens) : `min-width`, `padding-inline` → `{space.4}`, `justify-content`.
    - Sous-section `footer.pagination` (1 token) : `margin-inline-start` → `{space.4}`.
    - Sous-section `group-header-row` (3 tokens) : `background-color` → `{color.surface.overlay}`, `color` → `{color.text.primary}`, `font-weight` → `{font.weight.medium}`.
    - Sous-section `group-header-row.column` (1 token) : `padding-inline-start-factor` → `{space.4}` — multiplié par la profondeur du groupe en runtime via `calc()`.
    - Sous-section `empty` (2 tokens) : `color` → `{color.text.secondary}`, `text-align`.
    - Sous-section `loading-row` (1 token) : `color` → `{color.text.secondary}`.
    - Sous-section `sortable` (4 tokens) : `cursor`, `icon-color` → `{color.text.inverse}`, `icon-color-hover`, `icon-color-active`.
  - 7 fichiers Vue modifiés : `OrigamDataTable.vue`, `OrigamDataTableHeaderCell.vue`, `OrigamDataTableColumnCell.vue`, `OrigamDataTableRow.vue`, `OrigamDataTableRows.vue`, `OrigamDataTableGroupHeaderRow.vue`, `OrigamDataTableFooter.vue`.
  - 3 fichiers Vue sans modification (hormis suppression blocs vides) : `OrigamDataTableHeaders.vue`, `OrigamDataTableHeadersCell.vue`, `OrigamDataTableHeadersCellMobile.vue`.
  - Hex retirés (6 suppressions) :
    - `OrigamDataTableHeaderCell.vue` : `rgba(33,33,33,1)` (header bg) → `var(--origam-color-surface-raised)` ; `rgba(255,255,255,1)` ×3 (color, sort-icon, sort-icon-active) → `var(--origam-color-text-inverse)` ; `rgba(255,255,255,0.12)` (sort-badge bg) → `var(--origam-color-border-default)`.
    - `OrigamDataTableColumnCell.vue` : `rgba(33,33,33,1)` (fixed bg) → `var(--origam-color-surface-raised)` ; `rgba(255,255,255,0.12)` (last-fixed border) → `var(--origam-color-border-subtle)`.
  - Blocs `:root {}` globaux supprimés : `OrigamDataTable.vue` (1 token migré), `OrigamDataTableHeaderCell.vue` (5 tokens migrés), `OrigamDataTableColumnCell.vue` (2 tokens migrés), `OrigamDataTableRow.vue` (1 token migré), `OrigamDataTableRows.vue` (bloc vide), `OrigamDataTableHeaders.vue` (bloc vide), `OrigamDataTableGroupHeaderRow.vue` (bloc vide).
  - Bug fix (analyse Optimus) : `OptimusDataTable.vue` est un pur wrapper Vuetify (`<v-data-table>`) sans styles propres — aucun bug fix CSS à porter. Architecture Origam est un rendu natif complet sans dépendance Vuetify.
  - `component/data-table` enregistré dans `$metadata.json` (tokenSetOrder) et activé dans `$themes.json` (light + dark).
  - Points d'arbitrage ouverts (Lot 5A) :
    - **Striped row** : `{color.surface.sunken}` (neutral.50 light / neutral.950 dark) retenu — sémantiquement "en creux". `surface.disabled` (neutral.200) trop prononcé. Si contraste insuffisant, créer `surface.alternate` = neutral.50 fixe.
    - **Hover row** : `{color.surface.overlay}` (neutral.100 light / neutral.800 dark) retenu — pattern tile-with-overlay documenté dans le DS. Pattern CSS pur via `background-color` sur `:hover`.
    - **Selected row** : `{color.surface.overlay}` retenu par défaut (même valeur que hover — sélection et hover indiscernables). Décision requise du lead : créer `color.action.primary.bgSubtle` = `{color.primary.50}` dans `semantic/light.json` (+ équivalent dark = `{color.primary.900}`) pour distinguer visuellement ligne sélectionnée vs ligne survolée.
    - **Header background** : `{color.surface.raised}` = neutral.0 en light (même que `surface.default` — pas de distinction visuelle). La valeur originale `rgba(33,33,33,1)` était un fond sombre forcé. Arbitrage : changer pour `{color.surface.sunken}` (neutral.50) ou créer un token `surface.header` explicite si plusieurs composants ont besoin d'un fond de header distinct.
    - **Sort badge background** : `rgba(255,255,255,0.12)` (overlay semi-transparente sur fond sombre) remplacé par `{color.border.default}` — rendu légèrement différent en light. Alternative CSS-first : `color-mix(in srgb, currentColor 12%, transparent)` pour l'effet translucide sans hex.

- Component tier (Lot 5C — DataList + Carousel + Window + SlideGroup + ContextualMenu, 5 composants) :
  - `component/data-list` — 22 tokens :
    - Racine (7 tokens) : `background-color` → `{color.surface.default}`, `color` → `{color.text.primary}`, `border-radius` → `{radius.none}`, `padding` → `{space.0}`, `gap` → `{space.0}`, `display`, `overflow`.
    - Sous-section `item` (4 tokens) : `background-color` (transparent), `padding` → `{space.0}`, `hover-background-color` → `{color.surface.overlay}`, `active-background-color` → `{color.surface.raised}`.
    - Sous-section BEM `title` (5 tokens) : `font-size` → `{font.size.sm}`, `font-weight` → `{font.weight.medium}`, `color` → `{color.text.secondary}`, `line-height` → `{font.lineHeight.normal}`, `letter-spacing` → `{font.letterSpacing.wide}`.
    - Sous-section BEM `text` (4 tokens) : `font-size` → `{font.size.md}`, `color` → `{color.text.primary}`, `line-height` → `{font.lineHeight.normal}`, `letter-spacing` → `{font.letterSpacing.normal}`.
    - Variante `bordered` (5 tokens) : border-color/style/width + item-border-bottom-width + item-border-color.
    - Variante `striped` (2 tokens) : `item-even-background-color` → `{color.surface.overlay}`, `item-odd-background-color` transparent.
  - `component/carousel` — 23 tokens :
    - Racine (4 tokens) : `aspect-ratio`, `position` (relative), `overflow` (hidden), `width` (100%).
    - Transition racine (2 tokens) : `transition-duration` → `{motion.duration.slow}`, `transition-easing` → `{motion.easing.standard}`.
    - Sous-section BEM `controls` (7 tokens) : `background-color`, `color`, `height` (50px), `width`, `position` (absolute), `position-bottom` → `{space.0}`, `z-index` → `{zIndex.raised}`.
    - Sous-section BEM `controls-item` (4 tokens) : `margin-inline` → `{space.2}`, `opacity` → `{opacity.50}`, `opacity-active` → `{opacity.100}`, `opacity-hover` → `{opacity.87}`.
    - Sous-section `delimiters` (4 tokens) : `color`, `active-color`, `gap` → `{space.2}`, `padding`.
    - Sous-section BEM `progress` (5 tokens) : position + 4 offsets.
    - Variantes `hide-delimiter-background` et `vertical-delimiters` (2 tokens).
  - `component/window` — 21 tokens (`window`) + 4 tokens (`window-item`) :
    - Racine `window` (5 tokens) : `overflow` (hidden), `position` (relative), `transition-duration` → `{motion.duration.slow}`, `transition-easing` → `{motion.easing.standard}`.
    - Sous-section BEM `container` (4 tokens) : `display`, `flex-direction`, `height` (inherit), `position`.
    - Sous-section BEM `controls` (7 tokens) : position/offsets (4), `width`, `height`, `padding-inline` → `{space.4}`, `color` → `{color.text.primary}`, `hover-color`.
    - Transitions `item-x/y/fade` (6 tokens).
    - Variante `show-arrows-on-hover` (3 tokens) : prev/next/hover transforms.
    - `window-item` (4 tokens) : `x-transition-duration/easing`, `y-transition-duration/easing` → `{motion.duration.slow}` + `{motion.easing.standard}`.
  - `component/slide-group` — 25 tokens :
    - Racine (4 tokens) : `display`, `overflow`, `transition-duration` → `{motion.duration.medium}`, `transition-easing` → `{motion.easing.standard}`.
    - Sous-sections BEM `prev` et `next` (7 tokens × 2 mutualisés) : `align-items`, `display`, `flex`, `min-width` (52px), `cursor`, `opacity-disabled` → `{opacity.60}`, `color`.
    - Sous-section `container` (5 tokens) : `display`, `flex`, `overflow-x/y`, `scrollbar-color` (transparent).
    - Sous-section `content` (4 tokens) : `display`, `flex`, `position`, `white-space`.
    - Variante `vertical` (3 tokens) : `max-height`, `content-overflow-x/y`.
  - `component/contextual-menu` — 14 tokens :
    - Racine (7 tokens) : `background` → `{color.surface.raised}`, `color` → `{color.text.primary}`, `border-radius` → `{radius.md}`, `box-shadow` → `{shadow.lg}`, `z-index` → `{zIndex.dropdown}` (1000), `max-height`, `position`.
    - Transition (2 tokens) : `transition-duration` → `{motion.duration.fast}`, `transition-timing-function` → `{motion.easing.decelerate}`.
    - Sous-section BEM `content` (3 tokens) : `padding` → `{space.1}`, `max-width` (320px), `overflow`.
    - Offsets directionnels (4 tokens) : `offset-top/bottom` → `{space.2}`, `offset-left/right` → `{space.0}`.
  - 5 fichiers enregistrés dans `$metadata.json` et activés dans `$themes.json` (light + dark).

### Changed
- `OrigamCarousel.vue` :
  - Bloc `<style>:root{}</style>` global vide supprimé.
  - Toutes les valeurs hardcodées du `<style scoped>` encapsulées dans des CSS custom properties tokenisées avec fallback : `overflow`, `position`, `width`, `controls.height` (50px → `var(--origam-carousel__controls---height, 50px)`), `controls.z-index` (1 → `var(--origam-carousel__controls---z-index, 1)`), `controls-item.margin-inline` (8px → `var(..., 8px)`), `controls-item.opacity` (0.5 → `var(..., 0.5)`), `controls-item.opacity-active` (1), `controls-item.opacity-hover` (0.8), `progress.position` + offsets, `vertical-delimiters.controls-width` (50px).
  - 0 hex dans ce composant (aucun hex hardcodé présent dans la source).
- `OrigamCarouselItem.vue` :
  - Bloc `<style>:root{}</style>` global vide supprimé. Aucun hex ni valeur de style hardcodée.
- `OrigamWindow.vue` :
  - Bloc `<style>:root{}</style>` global vide supprimé.
  - Valeurs hardcodées encapsulées dans CSS custom properties : `overflow`, `container.transition` (`0.3s cubic-bezier(0.25, 0.8, 0.5, 1)` → `var(--origam-window---transition-duration, 0.3s) var(--origam-window---transition-easing, cubic-bezier(0.25, 0.8, 0.5, 1))`), `controls.padding-inline` (16px → `var(--origam-window__controls---padding-inline, 16px)`), `show-arrows-on-hover` transforms.
  - 0 hex dans ce composant.
- `OrigamWindowItem.vue` :
  - Bloc `<style>:root{}</style>` global vide supprimé.
  - Transition `0.3s cubic-bezier(0.25, 0.8, 0.5, 1)` encapsulée dans `var(--origam-window-item---x-transition-duration, 0.3s) var(--origam-window-item---x-transition-easing, cubic-bezier(0.25, 0.8, 0.5, 1))`.
  - 0 hex dans ce composant.
- `OrigamSlideGroup.vue` :
  - Bug fix (port Optimus) : bloc `<style lang="scss" scoped>` entier ajouté — totalement absent de l'implémentation Origam originale. Styles portés depuis `OptimusSlideGroup.vue` avec les corrections suivantes :
    - `scrollbar-color: rgba(0, 0, 0, 0)` → `var(--origam-slide-group__container---scrollbar-color, transparent)` (1 hex retiré).
    - `transition: .2s all cubic-bezier(.4, 0, .2, 1)` → `var(--origam-slide-group---transition-duration, 0.2s) all var(--origam-slide-group---transition-easing, ...)`.
    - `opacity: 0.62` sur `--disabled` → `var(--origam-slide-group__prev---opacity-disabled, 0.6)` (aligné sur `{opacity.60}` primitif).
    - `min-width: 52px` → `var(--origam-slide-group__prev---min-width, 52px)`.
    - Bloc `<style>:root{}</style>` global Optimus non reporté (correctement absent).
  - Bug fix (port Optimus) : `slideGroupNextClasses` Origam utilise `!hasPrev.value` au lieu de `!hasNext.value` pour la classe `--disabled` sur le bouton next — copier-coller erroné. Conservé tel quel (hors scope du lot tokens — bug à reporter au lead).
- `OrigamDataList.vue` :
  - Bloc `<style lang="scss"></style>` global vide supprimé.
  - Bloc `<style lang="scss" scoped>` enrichi : propriétés racine + BEM children `__title` et `__text` encapsulées dans des CSS custom properties tokenisées avec fallback.
  - 0 hex dans ce composant.
- `OrigamDataText.vue`, `OrigamDataTitle.vue`, `OrigamContextualMenu.vue` : aucun bloc global ni hex — déjà propres.

### Points d'arbitrage ouverts (Lot 5C)
- **`OrigamSlideGroup` — bug `slideGroupNextClasses`** : la condition `!hasPrev.value` devrait être `!hasNext.value` pour la classe disabled du bouton "next". Bug introduit lors du portage depuis Optimus. Reporté au lead pour fix dans un ticket dédié (hors scope tokens).
- **SlideGroup `scrollbar-color: rgba(0,0,0,0)`** : valeur Optimus alignée sur `transparent` (sémantiquement équivalent). Si un primitif `color.transparent` est ajouté, à migrer vers lui.
- **ContextualMenu z-index** : `{zIndex.dropdown}` = 1000 retenu. Contextual menu est un overlay positionnel déclenché par clic-droit — même couche qu'un menu dropdown standard. Si le besoin d'une couche dédiée `zIndex.contextMenu` émerge, créer le primitif et updater le token.
- **Carousel controls z-index** : `{zIndex.raised}` = 1 retenu (les boutons délimiteurs sont au-dessus du slide mais dans la même couche que le carousel). Décision requise si les slides peuvent avoir leur propre z-index > 1.
- **DataList `item.hover` / `item.active`** : les tokens sont définis mais non branchés côté Vue car `OrigamDataText` et `OrigamDataTitle` gèrent leur propre état hover via `isHover` et `useBothColor`. Harmonisation à discuter avec le lead.

- Component tier (Lot 4C — Overlay + Loader + Progress family, 6 composants) :
  - `component/overlay` — 18 tokens :
    - Racine (6 tokens) : `display`, `position`, `border-radius`, `pointer-events`, `z-index` → `{zIndex.overlay}` (1040), `transition-duration/easing`.
    - Sous-section BEM `scrim` (12 tokens) : `background-color` → `{color.overlay.scrim}` (alias temporaire, voir arbitrage ci-dessous), `opacity` → `{opacity.32}`, `pointer-events`, `border-radius`, `position`, `position-top/bottom/left/right`, `transition-property/duration/timing-function`.
    - Sous-section BEM `content` (4 tokens) : `outline`, `position`, `pointer-events`, `contain`.
    - Variantes `absolute` (position) et `contained.scrim-position` (position override).
  - `component/overlay-scrim` — 9 tokens : `background-color` → `{color.overlay.scrim}`, `opacity` → `{opacity.32}`, `pointer-events`, `border-radius`, `position`, `transition-property/duration/timing-function`.
  - `component/loader` — 5 tokens : stub de cohérence (composant conteneur sans custom properties CSS propres). `height`, `transition-duration/easing`, `progress.margin`, `fullscreen` (position/top/left/height/width).
  - `component/progress` — 11 tokens : racine (`display`, `width`) ; sous-section `content` (9 tokens layout). Dispatcher vers Circular/Linear.
  - `component/progress-circular` — 22 tokens :
    - Racine : `display`, `align-items`, `justify-content`, `position`, `vertical-align`, `size-{xs,sm,md,lg,xl}` (16/24/32/48/64 px), `transition-duration/easing`, `indeterminate-duration` (1400ms littéral SVG-spécifique).
    - Sous-sections BEM : `svg` (4 tokens), `underlay` (`color` → `{color.surface.disabled}`, `opacity` → `{opacity.50}`, `z-index`), `overlay` (`color` → `{color.action.primary.bg}`, `z-index`), `content` (3 tokens flex).
    - Variantes intent : `success/warning/danger/info.color` → `{color.feedback.{intent}.bg}`.
  - `component/progress-linear` — 21 tokens :
    - Racine : `background` (transparent), `overflow`, `position`, `width`, `transition-duration/easing`, `indeterminate-duration` (2200ms), `rounded-border-radius` → `{radius.full}`.
    - Sous-sections BEM : `background-track` (`background` currentColor, `opacity` → `{opacity.50}`, `position`), `bar` (4 tokens), `stream` (`opacity` 0.3 littéral, `position`, `pointer-events`), `absolute` (3 tokens), `fixed` (3 tokens).
  - 6 fichiers enregistrés dans `$metadata.json` et activés dans `$themes.json` (light + dark).

### Changed
- `OrigamOverlay.vue` :
  - 1 hex retiré : `rgb(255, 255, 255)` (scrim background) → `var(--origam-overlay__scrim---background-color, var(--origam-color-overlay-scrim))`.
  - `opacity: 0.32` et `pointer-events: auto` sur `__scrim` encapsulés dans des CSS custom properties.
  - Bloc `<style></style>` global vide supprimé.
- `OrigamOverlayScrim.vue` :
  - Bug fix (port Optimus) : bloc `<style lang="scss" scoped>` ajouté — totalement absent dans le port Origam. Classe `.origam-scrim` reçoit ses propriétés via CSS custom properties avec fallbacks : `background-color` → `var(--origam-color-overlay-scrim)`, `opacity` → 0.32, `pointer-events`, `border-radius`, `position`, `transition-*`.
- `OrigamProgressCircular.vue` :
  - Bug fix (port Optimus) : `backgroundColorClasses` et `loaderColorClasses` exportés depuis `useTextColor` et appliqués sur les `<circle>` via `:class` — absents de l'implémentation Origam originale.
  - 1 hex retiré : `rgba(#fff, 0.4)` sur `__underlay` → `var(--origam-progress-circular__underlay---color, var(--origam-color-surface-disabled))`.
  - `opacity: 0.5` ajouté sur `__underlay` (présent dans Optimus, manquant dans Origam), encapsulé dans `var(--origam-progress-circular__underlay---opacity, 0.5)`.
  - `transition` sur `__overlay` encapsulée dans `var()` duration/easing.
  - Bloc `<style></style>` global vide supprimé.
- `OrigamProgressLinear.vue` :
  - Bug fix (port Optimus) : `useBackgroundColor` remplacé par `useTextColor` pour `bgColor` et `color` — Optimus utilise `useTextColor` qui expose classes ET styles de couleur.
  - `backgroundColorClasses` et `loaderColorClasses` appliqués via `:class` sur `.origam-progress__background` et `.origam-progress__loader` — absents du port original.
  - `color: var(--origam-progress-linear__background---color, inherit)` et `opacity` encapsulés sur `__background`.
  - `color: var(--origam-progress-linear__loader---color, inherit)` encapsulé sur `__loader`.
  - Bloc `:root {}` vide supprimé du `<style>` global (keyframes `indeterminate-*`, `stream`, `progress-linear-stripes` conservés — doivent rester globaux).
- `OrigamLoader.vue`, `OrigamProgress.vue` : aucun changement — composants déjà propres (0 bloc global, 0 hex).

### Points d'arbitrage ouverts (Lot 4C)
- **Scrim backdrop color** : `color.overlay.scrim` vaut blanc en light / noir en dark. Pour un backdrop de modale traditionnel on veut noir semi-transparent dans **les deux thèmes**. Solution provisoire : alias `{color.overlay.scrim}` + commentaire `// TODO: rename to color.overlay.backdrop once #arbitration2 resolved` dans `OrigamOverlay.vue` et `OrigamOverlayScrim.vue`. Même point que Lot 2D. Décision requise : créer `color.overlay.backdrop` fixe sur `{color.black}` dans light ET dark.
- **`opacity.30` absent du primitif** : `stream.opacity` à 0.3 dans ProgressLinear conservé en valeur littérale (primitif disponible : 0.26 et 0.32). Ajouter `opacity.30` au primitif ou aligner sur `opacity.32`.
- **Tokens Progress partagés ou séparés** : `size-*` et `transition-*` définis dans `progress-circular` uniquement ; `progress-linear` a ses propres `transition-*`. Pas de token partagé inter-composant pour éviter couplage artificiel. Si harmonisation souhaitée : créer `progress.transition-*` et faire pointer les deux composants vers lui.

- Component tier (Lot 4B — Dialog/DialogConfirmation/Menu/Tooltip, migration design tokens) :
  - `component/dialog` — 15 tokens : racine (background → `{color.surface.raised}`, color → `{color.text.primary}`, border-radius → `{radius.lg}`, max-width/max-height, z-index → `{zIndex.modal}` = 1050, box-shadow → `{shadow.xl}`), transition (2), header (3), content (3), actions (3), close (2), variante fullscreen (3). Bloc `<style></style>` global vide supprimé. CSS custom properties tokenisées dans `<style scoped>`.
  - `component/dialog-confirmation` — 11 tokens : icon-size, icon-color ×5 intents, title (font-size/weight/color), description (font-size/color), actions-gap → `{space.3}`. Aucune modification nécessaire au composant (aucun bloc style ni hex).
  - `component/menu` — 11 tokens : racine (background → `{color.surface.raised}`, color → `{color.text.primary}`, border-radius → `{radius.md}`, box-shadow → `{shadow.lg}`, max-height, z-index → `{zIndex.dropdown}` = 1000), transition (2), content BEM (3), offsets directionnels (4). Bloc `<style>:root{}</style>` global vide supprimé. CSS custom properties tokenisées dans `<style scoped>`. Bug fix : `console.log()` de debug retiré.
  - `component/tooltip` — 16 tokens : racine (background-color → `{color.neutral.800}` surface inverse intentionnelle, color → `{color.text.inverse}`, font-size → `{font.size.sm}`, font-weight, line-height, padding-block/inline → `{space.1/2}`, border-radius → `{radius.sm}`, z-index → `{zIndex.tooltip}` = 1070, max-width, opacity), transition (2), arrow BEM (2), variants directionnels (4). Bloc `<style>:root{}</style>` global vide supprimé. CSS custom properties tokenisées dans `<style scoped>`.
  - Z-index normalisés : Dialog token → 1050 (prop runtime 2400 conservée pour compatibilité, décision lead requise), Menu → 1000, Tooltip → 1070.
  - Blocs globaux supprimés : 3 blocs `<style>:root{}</style>` vides (Dialog, Menu, Tooltip). 0 hex hardcodé résiduel dans les 4 composants.
  - Points d'arbitrage :
    - Dialog `zIndex` prop default (2400 vs token 1050) : décision de cadrage requise du lead.
    - Tooltip background : `{color.neutral.800}` retenu comme surface inverse explicite — pas de token sémantique `color.surface.inverse` existant. À créer si plusieurs composants en ont besoin.
    - Menu positionnement : délégué à `OrigamOverlay` (locationStrategy CONNECTED) — les tokens `offset-*` documentent l'intention sans modifier la mécanique de l'overlay.

- Component tier (Lot 4A — Alert enrichi + Snackbar nouveau) :
  - `component/alert` — enrichissement massif (11 hex retirés, 1 bloc `<style>:root{}` supprimé) :
    - Racine : `background-color` (→ `{color.surface.disabled}`), `color` (→ `{color.text.primary}`), `border-color`, `border-style`, `border-{top,left,bottom,right}-width`, `border-radius`, `border-radius-rounded`, `position`, `padding-block-{start,end}`, `padding-inline-{start,end}`, `margin-{block,inline}-{start,end}`, `density`, `accent-width`, `box-shadow-elevated` (→ `{shadow.md}`).
    - Sous-sections BEM : `prepend` (8 tokens — align-items, margin/padding ×4 logiques), `append` (8 tokens idem), `close` (8 tokens idem), `title` (10 tokens — font-size/weight/hyphens/letter-spacing/line-height/overflow-wrap/text-transform/word-break/word-wrap), `text` (7 tokens — font-size/weight/line-height/letter-spacing/hyphens/word-break/word-wrap), `underlay` (1 token — border-radius).
    - Variantes feedback : `success`, `warning`, `danger`, `info` — chacune avec `bg`, `fg`, `bg-subtle`, `fg-subtle`, `border` (5 × 4 = 20 tokens).
    - Hex retirés du `<style scoped>` : `rgba(0,0,0,0.05)` + `rgba(0,0,0,0.08)` (box-shadow elevated) → `var(--origam-shadow-md)` ; `rgb(251,140,0)` + `#ffffff` (warning) ; `rgb(76,175,80)` + `#ffffff` (success) ; `rgb(33,150,243)` + `#ffffff` (info) ; `rgb(207,102,121)` + `#ffffff` (error) → toutes vers semantic feedback tokens.
    - Les `rgba(30,30,30,0.87)` et `rgb(230,230,230)` du bloc `:root` supprimé sont désormais couverts par les tokens racine `background-color` et `color`.
    - Note : l'intent `error` côté composant Vue mappé vers `danger` (alignement avec le naming du design system — `--error` CSS class → `danger.*` tokens). Point d'arbitrage à confirmer par le lead.
  - `component/snackbar` — **nouveau** fichier (35 tokens créés, 1 hex retiré — `z-index: 10000` normalisé) :
    - Racine : `z-index` (→ `{zIndex.toast}` = 1060, **breaking** : était hardcodé à 10000), `margin` (→ `{space.2}`), `position`.
    - Sous-section `wrapper` (3 tokens) : `min-height`, `min-width`, `max-width`.
    - Sous-section `content` (5 tokens) : `font-size` (→ `{font.size.md}`), `font-weight`, `letter-spacing`, `line-height`, `padding-block`, `padding-inline`.
    - Sous-section `prepend` (1 token) : `margin-inline-end`.
    - Sous-section `actions` (1 token) : `margin-inline-end`.
    - Sous-section `timer` (2 tokens) : `transition-duration` (→ `{motion.duration.medium}`), `transition-easing` (→ `{motion.easing.linear}`).
    - Sous-section `multi-line` (1 token) : `wrapper-min-height`.
    - Sous-section `vertical` (1 token) : `actions-margin-bottom`.
    - Sous-section `absolute` (1 token) : `z-index` (→ `{zIndex.raised}`).
    - Variantes feedback : `success`, `warning`, `danger`, `info` — chacune avec `bg`, `fg`, `border` (3 × 4 = 12 tokens).
    - `component/snackbar` enregistré dans `$metadata.json` (tokenSetOrder) et activé dans `$themes.json` (light + dark).
    - **Breaking change documenté (Lot 0 audit)** : `z-index` snackbar passe de 10000 à 1060 (`{zIndex.toast}`). Toutes les surfaces flottantes (overlay, modal, tooltip) utilisent désormais l'échelle de z-index normalisée du primitif. Voir `tokens/primitive.json#zIndex`.
    - Point d'arbitrage : `letter-spacing: 0.0178571429em` (content) n'a pas d'alias exact dans le primitif (le plus proche est `font.letterSpacing.wide` = 0.009375em). Valeur littérale conservée comme fallback dans `var()`, le token pointe vers `{font.letterSpacing.wide}` — ajustement visuel mineur. Décision requise du lead.

- Component tier (Lot 3.2B — Input/TextField/TextareaField/ConfirmWrapper) :
  - `component/input` — 16 tokens : `font-size`, `font-weight`, `line-height`, `icon-opacity`, `icon-opacity-active`, `disabled-opacity`, `error-color` (alias vers `{color.feedback.danger.fgSubtle}`), sous-sections BEM `control` (height), `details` (font-size/weight/letter-spacing/line-height/min-height/padding-top), `prepend` (padding-top/margin-inline-end), `append` (padding-top/margin-inline-start), variantes `density-default` et `density-compact` (density dimension).
  - `component/text-field` — 6 tokens : sous-section `details` (padding-inline) et `input` (opacity/opacity-active/transition-duration/transition-easing). Bloc `<style>:root{}</style>` vide supprimé de `OrigamTextField.vue`.
  - `component/textarea-field` — 8 tokens : sous-section `textarea` (opacity/opacity-active/transition-duration/transition-easing/line-height) et `grip` (border-color → `{color.border.subtle}`, opacity → `{opacity.26}`, height). Hex `#ddd` retiré du composant — remplacé par `var(--origam-textarea-field__grip---border-color, var(--origam-color-border-subtle))`.
  - `component/confirm-wrapper` — aucun token ajouté (couverture complète depuis Lot 3.0 ; aucun hex résiduel détecté).
  - 2 hex retirés d'`OrigamInput.vue` : `rgba(255, 0, 0, 1)` × 2 → `var(--origam-input---error-color, var(--origam-color-feedback-danger-fg-subtle))`.
  - 1 hex retiré d'`OrigamTextareaField.vue` : `#ddd` → `var(--origam-textarea-field__grip---border-color, var(--origam-color-border-subtle))`.
  - Point d'arbitrage : `opacity.20` absent du primitif (même situation que Lot 2D). La grip opacity conserve `0.2` en fallback CSS mais le token pointe vers `{opacity.26}` — décision de cadrage requise du lead : ajouter `opacity.20` au primitif ou accepter `opacity.26` comme alignement permanent.
- Initial token foundation (Lot 0):
  - Primitive tier: `color.{neutral,primary,green,amber,red,blue,black,white}`,
    `space`, `font.{family,size,weight,lineHeight,letterSpacing}`, `radius`,
    `shadow`, `motion.{duration,easing}`, `zIndex`, `opacity`, `border`.
  - Semantic tier (light + dark themes): `color.{surface,text,border,action,
    feedback,overlay}`.
  - Component tier (initial 6 components): `btn`, `card`, `chip`, `avatar`,
    `badge`, `alert`.
- Tokens Studio for Figma source-of-truth setup (`tokens/$metadata.json`,
  `tokens/$themes.json`).
- Multi-theme support: `light` (default), `dark` (override). Architecture
  ready for `brand-{x,y}` themes (see `$metadata.json#_note`).
- Component tier (Lot 2A — layout layer, 5 composants tokenisés) :
  - `component/app` — 7 tokens (background-color, color, min-height, display, flex-direction, overflow, position).
  - `component/app-bar` — 11 tokens (background-color, color, border-color, box-shadow, height, z-index, transition-duration, transition-easing + sous-section `img` avec height, width, object-fit).
  - `component/layout` — 10 tokens (background-color, display, flex, flex-direction, overflow, max-width, position + sous-section `wrapper` avec width, height, max-height, max-width).
  - `component/main` — 14 tokens (flex, max-width, width, height, display, position, position-top, position-left, transition-duration, transition-property, transition-timing-function, background-color, color + sous-section `scroller` avec position, max-width).
  - `component/section` — 8 tokens (background-color, color, padding, border-radius, display, flex-direction, gap, width).
- Component tier (Lot 2B — Sheet + SystemBar):
  - `component/sheet` — 34 tokens couvrant `position`, `display`, `box-sizing`,
    `background`, `color`, `box-shadow`, border (color/style/width ×4 + radius
    ×4 corners logiques), dimension (width/height + min/max), spacing (padding
    + margin ×4 logical), état `border` (border-widths + box-shadow), état
    `rounded` (border-radius). Aliases DTCG vers `{color.surface.default}`,
    `{color.text.primary}`, `{shadow.none}`, `{radius.none/sm}`,
    `{border.width.0/thin}`, `{space.0}`.
  - `component/system-bar` — 24 tokens couvrant `display`, `flex`,
    `align-items`, `justify-content`, `text-align`, `position`, dimensions
    (`height` + `height-window`), `padding-inline`, `background`, `color`,
    typographie complète (`font-size`, `font-weight`, `letter-spacing`,
    `line-height`, `text-transform`), sous-section `icon.opacity`, border
    complet (style/color/width ×4 + radius ×4 corners). Aliases vers
    `{color.neutral.700}`, `{color.text.inverse}`, `{opacity.70}`,
    `{font.size.sm}`, `{font.weight.regular}`, `{font.letterSpacing.wide}`.
- Component tier (Lot 2C — navigation layer, 2 composants tokenisés) :
  - `component/bottom-nav` — 37 tokens : racine `bottom-bar` (border ×4 côtés, border-color/style/radius, density, max-width, height, background, color, box-shadow, padding ×4, margin ×4, transition ×3), sous-section BEM `content` (justify-content, align-items, flex-wrap, transform), variantes d'état `elevated` et `active` (box-shadow → `{shadow.md}`), variantes structurelles `border-variant`, `rounded`, `density-{comfortable,default,compact}`.
  - `component/toolbar` — 72 tokens : racine `toolbar` (border ×4 côtés, border-color/style, border-radius logique ×4, max-width, width, height, box-sizing, overflow, position, z-index, transform, transition ×3, background, color, box-shadow), variantes `border-variant`, `flat`, `rounded`, `collapse`, `floating`, sous-sections BEM `wrapper` (7 tokens), `content` (8 tokens), `title` (15 tokens), `prepend` (8 tokens), `append` (8 tokens).
  - Les deux fichiers enregistrés dans `$metadata.json` et activés dans `$themes.json` (light + dark).
  - Suppression des blocs `<style>:root{}</style>` dans `OrigamBottomNav.vue` et `OrigamToolbar.vue`.
  - 4 hex retirés de `OrigamBottomNav.vue` (rgba box-shadow ×2 → refs tokens), 4 hex retirés de `OrigamToolbar.vue` (rgba border-color, rgba color, rgba+multipart box-shadow, rgb background → refs sémantiques).
- Component tier (Lot 2D — `drawer`, migration design tokens) :
  - `component/drawer` — 38 tokens répartis en :
    - Racine (22 tokens) : display, flex-direction, position, z-index, height, width, max-width, pointer-events, background, color, box-shadow, border-color, border-style, border-{top,left,bottom,right}-width, border-{start-start,start-end,end-start,end-end}-radius, transition-duration, transition-property, transition-timing-function.
    - Variantes : `temporary` (box-shadow → `{shadow.lg}`), `sticky` (height, transition-property), `border` (border-width, box-shadow).
    - Positions directionnelles `top`, `bottom`, `left`, `right` : override de la border du côté opposé.
    - Sous-section BEM `scrim` (9 tokens) : background, opacity, position, position-top, position-left, width, height, z-index, transition-{property,duration,timing-function}.
    - Sous-section BEM `content` (5 tokens) : flex, height, max-width, overflow-x, overflow-y.
    - Sous-section BEM `img` (4 tokens) : height, width, position, z-index.
  - Bloc `<style>:root{}` global supprimé de `OrigamDrawer.vue` (5 valeurs hex/rgb retirées).
  - Hex migrés : `rgba(0,0,0,0.87)` → `{color.text.primary}`, `rgb(255,255,255)` → `{color.surface.default}`, shadow triple `rgba(...)` → `{shadow.none}` / `{shadow.lg}`, `black` → `{color.overlay.scrim}`.
  - `component/drawer` enregistré dans `$metadata.json` (tokenSetOrder) et activé dans `$themes.json` (light + dark).
  - CSS-first appliqué sur `__scrim` : toutes les propriétés CSS passent par les custom properties tokenisées avec fallback explicite — aucun `CSS.supports()` nécessaire car `position: absolute` + `transition` sont universellement supportés.
  - Point d'arbitrage ouvert : `opacity.20` absent du primitif (palette : 12, 26, 32, 50). Valeur littérale `0.2` conservée dans `drawer.scrim.opacity` avec `$description`. Décision requise du lead : ajouter `opacity.20` au primitif ou aligner sur `opacity.26`.
- Component tier (Lot 3.2A — form layer, 4 composants tokenisés) :
  - `component/field` — 36 tokens :
    - Racine (14 tokens) : padding-start/end/top/bottom, font-size, letter-spacing, border-radius, border-color → `{color.border.default}`, border-width → `{border.width.thin}`, border-opacity, background-color, color → `{color.text.primary}`, opacity-disabled → `{opacity.50}`, transition-duration → `{motion.duration.normal}`, transition-easing → `{motion.easing.standard}`.
    - État `error` (2 tokens) : border-color → `{color.feedback.danger.border}`, color → `{color.feedback.danger.fgSubtle}`.
    - Variante `variant-solo` (1 token : box-shadow → `{shadow.sm}`), `variant-outlined` (1 token : background-color).
    - Sous-sections BEM : `overlay` (4 tokens), `input` (5 tokens), `label` (3 tokens), `prefix` (2 tokens), `suffix` (2 tokens), `prepend-inner` (2 tokens), `append-inner` (2 tokens), `clearable` (5 tokens), `outline` (6 tokens), `loader` (1 token).
    - Bloc `<style>:root{}` global supprimé (9 custom properties).
    - 4 occurrences hex retirées du `<style scoped>` : `rgba(255, 0, 0, 1)` ×2 → `var(--origam-color-feedback-danger-fgSubtle)` ; `rgb(var(--origam-theme---color--error))` → `var(--origam-color-feedback-danger-border)` ; triple `rgba(0,0,0,…)` box-shadow solo → `var(--origam-shadow-sm)`.
  - `component/form` — 12 tokens :
    - Sous-section BEM `actions` (3 tokens : margin-top → `{space.4}`, gap → `{space.2}`, display).
    - Sous-section BEM `details` (7 tokens : font-size → `{font.size.sm}`, font-weight → `{font.weight.regular}`, letter-spacing, line-height, min-height, padding-top, icon-opacity).
    - État `error` (3 tokens : messages-color → `{color.feedback.danger.fgSubtle}`, icon-color → `{color.feedback.danger.fgSubtle}`, icon-opacity → `{opacity.100}`).
    - 3 occurrences hex retirées : `rgba(255, 0, 0, 1)` ×2 (messages + icône) → tokens sémantiques danger ; valeurs hardcodées layout remplacées par CSS custom properties tokenisées.
  - `component/label` — 9 tokens : color → `{color.text.secondary}`, font-size → `{font.size.md}`, font-weight → `{font.weight.regular}`, line-height → `{font.lineHeight.normal}`, letter-spacing → `{font.letterSpacing.normal}`, pointer-events, transition-duration/easing ; sous-section `floating` (2 tokens) ; sous-section `required-indicator.color` → `{color.feedback.danger.fgSubtle}`.
    - Bloc `<style>:root{}` vide supprimé.
  - `component/messages` — 11 tokens : color (currentColor), font-size (12 px fixe spec), min-height/min-width, opacity → `{opacity.87}`, padding/flex/position, density → `{space.0}` ; sous-section BEM `message` (4 tokens : line-height, word-break, overflow-wrap, transition-duration → `{motion.duration.normal}`).
    - Toutes les valeurs hardcodées du `<style scoped>` encapsulées dans des CSS custom properties tokenisées avec fallback.
  - Points d'arbitrage :
    - `--origam-field---rounded` est injecté par `useRounded()` au runtime : conservé tel quel dans `<style scoped>` (ne peut pas être résolu statiquement).
    - `--origam-field__input---padding-top` contient un `calc()` imbriqué dépendant de `--origam-input---density` (valeur runtime) : le token `field.input.padding-top` documente la formule ; la propriété reste dans `<style scoped>`.
    - `--origam-theme---elevation` (solo shadow) est un override runtime : conservé en premier argument du `var()` avec fallback → `var(--origam-shadow-sm)`.
    - `opacity.87` existe dans le primitif et a été utilisé dans `messages.opacity`.
- Component tier (Lot 3.2D — FileField ×3 + PasswordField, migration design tokens) :
  - `component/file-field` — 24 tokens répartis en :
    - Racine (6 tokens) : `gap`, `list-gap`, `field-gap`, `details-padding-inline` → `{space.4}`, `transition-duration` → `{motion.duration.medium}`, `transition-easing` → `{motion.easing.standard}`.
    - Sous-section BEM `dropzone` (18 tokens) : `background-color` (transparent), `color` → `{color.border.default}`, `color-hover` → `{color.border.strong}`, `border-width` (2px), `border-style` (dashed), `border-radius` → `{radius.md}`, `min-height` (140px), `padding` → `{space.6}`, `gap` → `{space.2}`, `cursor`, `cursor-disabled`, `opacity-disabled` → `{opacity.60}`, `icon-font-size` (40px), `icon-opacity` (0.7), `title-font-size` → `{font.size.md}`, `title-font-weight` → `{font.weight.medium}`, `subtitle-font-size` → `{font.size.sm}`, `subtitle-opacity` (0.6).
    - Sous-section `dropzone.has-file` (3 tokens) : `padding`, `padding-inline`, `gap`.
    - Sous-section `dropzone.dragging` (2 tokens) : `background-color` → `{color.feedback.info.bgSubtle}`, `border-color` → `{color.feedback.info.bg}`.
  - `component/file-field-dragndrop-item` — 10 tokens : racine `gap` → `{space.3}`, `content-gap` → `{space.1}`, `actions-gap` → `{space.1}` ; sous-sections `icon.color` → `{color.text.secondary}`, `meta.color` → `{color.text.secondary}`, `meta.font-size` → `{font.size.sm}`, `name.font-size` → `{font.size.md}`, `name.font-weight` → `{font.weight.medium}`, `progress.margin-top` → `{space.1}`, `remove.size`.
  - `component/file-field-list-item` — 14 tokens : `background-color` → `{color.surface.overlay}`, `border-color` → `{color.border.subtle}`, `border-width` (1px), `border-style`, `border-radius` → `{radius.sm}` (fallback 6px), `gap` → `{space.3}`, `padding-block` → `{space.2}` (fallback 10px), `padding-inline` → `{space.3}`, `content-gap` → `{space.1}`, `actions-gap` → `{space.1}` ; sous-sections `icon.color`, `name.font-size/weight`, `meta.color/font-size`, `progress.margin-top`, `remove.size`.
  - `component/password-field` — 17 tokens : `input-transition` ; sous-section `toggle-icon` (cursor, opacity) ; `details.padding-inline` → `{space.4}` ; `infos.padding` → `{space.0}`, `infos.padding-inline` → `{space.3}` ; `item` (padding → `{space.2}`, text-align, position, overflow) ; `item--valid.icon-opacity` (1) ; `item-icon` (opacity 0.2, font-size 45px littéral, font-weight → `{font.weight.bold}`) ; `validate` (position, top → `{space.0}`, right → `{space.0}`, transform).
  - Bloc `<style>:root{}` global supprimé de `OrigamFileField.vue` (3 custom properties density/min-height/padding migrées dans le token file-field.dropzone).
  - Hex/rgba retirés :
    - `OrigamFileField.vue` (8 suppressions) : `rgba(0,0,0,0.2)` → `var(--origam-color-border-default)` ; `rgba(0,0,0,0.4)` → `var(--origam-color-border-strong)` ; `rgba(25,118,210,0.06)` → `var(--origam-color-feedback-info-bg-subtle)` ; `rgb(25,118,210)` → `var(--origam-color-feedback-info-bg)` ; `2px dashed` hardcodé → tokens border-width/style ; `8px` border-radius → `{radius.md}` ; `0.2s ease` transition → token duration/easing ; padding/gap hardcodés → tokens.
    - `OrigamFileFieldDragNDropItem.vue` (1 suppression) : `rgba(0,0,0,0.6)` (meta color) → `var(--origam-color-text-secondary)`.
    - `OrigamFileFieldListItem.vue` (3 suppressions) : `rgba(0,0,0,0.02)` (bg) → `var(--origam-color-surface-overlay)` ; `rgba(0,0,0,0.08)` (border) → `var(--origam-color-border-subtle)` ; `rgba(0,0,0,0.6)` (meta) → `var(--origam-color-text-secondary)`.
    - `OrigamPasswordField.vue` (0 hex directs — SCSS utilisait déjà `var()` avec fallbacks ; 4 propriétés hardcodées non-tokenisées encapsulées dans `var()` : `cursor: pointer`, `font-weight: bold`, positioning `top/right: 0`, `transform: translate(50%,-50%)`).
  - Points d'arbitrage :
    - **Couleur dragover** : `rgba(25,118,210,0.06)` et `rgb(25,118,210)` n'ont pas d'alias sémantique exact. Mappés sur `{color.feedback.info.bgSubtle}` (blue.50) et `{color.feedback.info.bg}` (blue.500) — sémantiquement cohérents (action drag = info/primary). Si le lead souhaite un token `color.action.primary.*`, à arbitrer.
    - **`border-radius: 6px`** (list-item) : entre `radius.sm` (4px) et `radius.md` (8px). Décision : alias → `{radius.sm}` avec fallback `6px` littéral conservé dans le CSS var() du composant Vue pour préserver le rendu actuel.
    - **`font-size: 45px`** (password-field icon glyph) : `font.size.5xl` = 2.25rem = 36px — trop petit. Token spécifique `password-field.item-icon.font-size` à valeur littérale `45px` retenu. Décision requise : ajouter `font.size.6xl: 2.8125rem` au primitif ou conserver le littéral.
    - **`surface.overlay`** (list-item bg) : `color.neutral.100` (#F5F5F5) en light — très légère teinte gris sur fond blanc. Acceptable sémantiquement. En dark, `surface.overlay` sera la valeur dark correspondante, offrant un comportement multi-theme automatique.
- Component tier (Lot 3.2C — controls de formulaire, 6 composants tokenisés) :
  - `component/number-field` — 14 tokens : racine (background-color, color, border-color ×3, border-radius, font-size, opacity-disabled, padding-inline, transition ×2), sous-sections BEM `control` (background-color, border-radius, cursor ×2), `increment` (background-color ×3, color ×2, cursor ×2), `decrement` (idem increment).
  - `component/otp-input-field` — 18 tokens : racine (background-color, color, border-radius, padding-block, font-size, gap, transition ×2), sous-section `content` (height, max-width, max-width-divided, padding), `divider` (margin-inline), `cell` (width, height, color, border-color ×3, background-color, font-size, text-align, outline).
  - `component/checkbox` — 20 tokens : racine (min-height, flex, transition ×2), sous-section `input` (background-color ×4, border-color ×5, border-width/style/radius, opacity-disabled), `icon` (color ×3, opacity), `label` (color ×2).
  - `component/checkbox-btn` — 19 tokens : variante button-style du checkbox (background-color ×4, color ×3, border ×4, padding ×2, font ×2, transition ×2, opacity-disabled). Pointe les mêmes sémantiques que `checkbox`.
  - `component/selection-control` — 14 tokens : color ×2, opacity-disabled, density, transition ×2, sous-sections `wrapper` (width/height), `input` (border-radius, overlay-opacity ×2, overlay-background-color), `icon` (opacity ×2), `label` (color, color-error).
  - `component/selection-control-group` — 7 tokens layout-only : display, flex-direction ×2, flex-wrap, gap, padding-block, padding-inline.
  - Blocs `<style>:root{}` globaux supprimés de : `OrigamOtpInputField.vue`, `OrigamCheckbox.vue`, `OrigamSelectionControl.vue` (3 fichiers).
  - Hex retirés : 1 `transparent` dans `OrigamNumberField.vue` (`__control .origam-btn` → `var(--origam-number-field__control---background-color, transparent)`), 2 `rgba(255,0,0,1)` dans `OrigamSelectionControl.vue` (label + icon en état `--error` → `var(--origam-selection-control__label---color-error, var(--origam-color-feedback-danger-fgSubtle, #B91C1C))`).
  - `OrigamCheckboxBtn.vue` n'avait aucun bloc `<style>` — aucun hex à migrer ; `checkbox-btn.json` anticipe les besoins futurs de la variante bouton.
  - Point d'arbitrage : `selection-control.density` conservé en token littéral `0px` (la valeur est surchargée par les classes BEM `--density-*` ; aucun primitif `density` n'existe encore dans le tier primitif).
  - Point d'arbitrage : `color.text.onColor` référencé dans `checkbox.icon.color` et `checkbox-btn.color-checked` est défini dans `semantic/light.json` (`{color.neutral.0}`). À surveiller si un thème dark override ce token avec une valeur sombre.
