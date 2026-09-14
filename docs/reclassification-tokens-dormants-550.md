# Reclassification des tokens dormants apres correction du garde (#550)

Date : 2026-09-05. Base : `develop`@`989e2f13`.

⛔ **Ce document remplace les chiffres de `audit-tokens-dormants-550.md`**, etabli sur 775 tokens dont **228 n etaient pas morts**. Quatre angles morts du garde ont ete corriges depuis (blocs `<script>` des `.vue`, interpolation Sass `@each`, graphe des tokens, et le correctif #552 sur les `.ts`). Le compte de reference est **680**.

| | tokens |
|---|---:|
| avant correction du garde | 908 |
| **apres** | **680** |
| ...dont attribuables a un composant | 609 |
| ...dont primitifs sans proprietaire | 71 |

## Classification des 680

| bucket | tokens | traitement decide |
|---|---:|---|
| 0-primitif | 71 | a rejuger : un primitif sans consommateur vivant |
| 1-sans-surface | 11 | delegue en realite (AppBar -> Toolbar), a verifier a la main |
| 2-delegue-a-un-enfant | 15 | ne rien faire : la surface est peinte ailleurs |
| 3-jamais-implemente | 434 | **supprimer + ouvrir un ticket par fonctionnalite** |
| 4-ecart-de-valeur | 43 | **reecrire le token sur la valeur rendue, puis cabler** |
| 5-canal-generique | 103 | ne rien faire : peint par un composable transversal |
| 6-mauvais-nom | 3 | renommer, ou arbitrer si les valeurs different |

## Bucket 3 — jamais implemente (434) — le gros du travail

| composant | tokens |
|---|---:|
| `date-picker` | 44 |
| `color-picker` | 32 |
| `data-table` | 31 |
| `alert` | 19 |
| `number-field` | 19 |
| `dialog` | 18 |
| `list` | 18 |
| `snackbar` | 17 |
| `chip` | 14 |
| `code` | 13 |
| `btn` | 11 |
| `data-list` | 11 |
| `slider-field` | 11 |
| `inline-edit` | 10 |
| `switch` | 10 |
| `video` | 9 |
| `field` | 8 |
| `picker` | 8 |
| `tooltip` | 8 |
| `carousel` | 7 |
| `otp-input-field` | 7 |
| `pagination` | 7 |
| `color-picker-field` | 6 |
| `menu` | 6 |
| `overlay` | 6 |
| `parallax` | 6 |
| `app` | 5 |
| `expansion-panel` | 5 |
| `row` | 5 |
| `selection-control` | 5 |
| `divider` | 4 |
| `layout` | 4 |
| `progress-circular` | 4 |
| `container` | 3 |
| `kbd` | 3 |
| `responsive` | 3 |
| `sheet` | 3 |
| `snackbar-group` | 3 |
| `audio` | 2 |
| `blockquote` | 2 |
| `breadcrumb` | 2 |
| `breadcrumb-divider` | 2 |
| `card` | 2 |
| `loader` | 2 |
| `main` | 2 |
| `skeleton` | 2 |
| `text-mask` | 2 |
| `calendar` | 1 |
| `clipboard` | 1 |
| `file-field` | 1 |
| `file-field-list-item` | 1 |
| `infinite-scroll` | 1 |
| `input` | 1 |
| `progress-linear` | 1 |
| `stepper` | 1 |
| `system-bar` | 1 |
| `tabs` | 1 |
| `toolbar` | 1 |
| `treeview` | 1 |
| `virtual-scroll` | 1 |

## Bucket 4 — ecart de valeur (43)

Chacun doit etre mesure en navigateur avant reecriture — la valeur rendue ne se deduit pas de la lecture du SCSS (`thin` calcule `1px`, `linear` reste la chaine `linear`).

| token | composant |
|---|---|
| `--origam-audio__album---color` | audio |
| `--origam-audio__artist---color` | audio |
| `--origam-audio__cover---border-radius` | audio |
| `--origam-audio__duration---color` | audio |
| `--origam-avatar-group---box-shadow` | avatar-group |
| `--origam-btn--ghost---color` | btn |
| `--origam-calendar---gap` | calendar |
| `--origam-calendar---padding` | calendar |
| `--origam-carousel__controls---color` | carousel |
| `--origam-color-picker-field---min-width` | color-picker-field |
| `--origam-command-palette__item---color` | command-palette |
| `--origam-expansion-panel---color` | expansion-panel |
| `--origam-field---color` | field |
| `--origam-field---letter-spacing` | field |
| `--origam-kbd--outlined---background-color` | kbd |
| `--origam-kbd--outlined---border-width` | kbd |
| `--origam-layout---max-width` | layout |
| `--origam-layout---overflow` | layout |
| `--origam-layout__wrapper---height` | layout |
| `--origam-layout__wrapper---width` | layout |
| `--origam-number-field---background-color` | number-field |
| `--origam-number-field---border-radius` | number-field |
| `--origam-number-field---color` | number-field |
| `--origam-number-field---font-size` | number-field |
| `--origam-number-field---padding-inline` | number-field |
| `--origam-otp-input-field---color` | otp-input-field |
| `--origam-otp-input-field---font-size` | otp-input-field |
| `--origam-picker---min-width` | picker |
| `--origam-selection-control---color` | selection-control |
| `--origam-slide-group__next---flex` | slide-group |
| `--origam-slide-group__prev---flex` | slide-group |
| `--origam-slider-field__label---color` | slider-field |
| `--origam-slider-field__label---font-size` | slider-field |
| `--origam-slider-field__label---padding` | slider-field |
| `--origam-slider-field__thumb---box-shadow` | slider-field |
| `--origam-slider-field__tick---border-radius` | slider-field |
| `--origam-snackbar---position` | snackbar |
| `--origam-switch__input---opacity` | switch |
| `--origam-switch__thumb---box-shadow` | switch |
| `--origam-video__btn---border-radius` | video |
| `--origam-video__btn---font-size` | video |
| `--origam-video__scrubber---color` | video |
| `--origam-window---position` | window |

## Bucket 6 — mauvais nom (3)

- `--origam-btn--ghost---background-color` — lu ailleurs sous --origam-btn---background-color-ghost
- `--origam-btn--ghost---background-color-hover` — lu ailleurs sous --origam-btn---background-color-ghost-hover
- `--origam-chart__axis---label-font-size` — lu ailleurs sous --origam-chart__axis-label---font-size

## Methode

Classement mecanique (`/tmp/classify.mjs`, reproduit dans ce depot au besoin) sur quatre signaux : proprietaire du token par correspondance de slug, presence d un bloc `<style>`, existence du selecteur BEM ou d etat vise, et presence de la propriete CSS finale dans le SCSS du composant.

⛔ **Limite connue, mesuree** : le classement mecanique se trompe sur les buckets qui demandent un jugement. Deux exemples verifies a la main — `--origam-chart---animation-easing` est range en `1-sans-surface` alors que la propriete est bien rendue par un sous-composant, et `--origam-video__btn---background-color-hover` en `5-canal-generique` alors que c est un vrai ecart de valeur (`#262626` declare, `rgba(255,255,255,.12)` rendu). Les buckets **3** et **6** sont fiables ; les buckets **2**, **4** et **5** demandent une verification par composant avant action.
