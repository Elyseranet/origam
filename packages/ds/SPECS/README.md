# Spécifications techniques — origam Design System (`packages/ds`)

> **Périmètre** : la librairie publiée `origam` (`packages/ds`) uniquement — composants,
> composables, interfaces, types, enums, constantes, utils, directives, services et tokens.
> Les autres packages du monorepo (`marketing`, `stories`, `docs`, `tests`, `figma-plugin`)
> ne sont pas couverts ici.

Ce dossier est la **référence technique exhaustive** de la lib. Chaque fichier a été rédigé
en **deep-dive prose** à partir d'une **lecture du code source réel** — aucune signature,
prop, emit, slot ou dépendance n'a été inventée. Quand une information n'était pas vérifiable,
elle est explicitement signalée.

**Total : 16 fichiers, ~17 900 lignes de spec.**

---

## Convention de lecture

Pour **chaque entité** (composant, composable, interface, type, enum, const, util, directive,
service), la spec documente la même grille :

| Rubrique | Contenu |
|---|---|
| **Rôle / utilité** | À quoi sert l'entité, dans quel contexte |
| **Entrées** | props / paramètres (nom · type · défaut · description) |
| **Sorties** | `return` / emits / slots (scopes) / classes & styles émis |
| **Dépendances (liens)** | composables, interfaces, types, enums, consts, utils, directives, sous-composants consommés |
| **Consommé par** | qui utilise l'entité (vérifié par lecture / grep) |
| **Comportement notable** | a11y / sémantique HTML, SSR / hydration, CSS-first / JS-fallback, edge cases |
| **Exemple d'usage** | snippet court et réel |

---

## Sommaire

### Fondations

| Fichier | Sujet | Lignes |
|---|---|---:|
| [`01-architecture.md`](./01-architecture.md) | Monorepo pnpm, structure `packages/ds/src`, pipeline build (unbuild + tokens), CSS-first/JS-fallback, classes-first (v2.x), layering & règle de réutilisation des Commons, conventions transverses | 528 |
| [`02-design-tokens-theming.md`](./02-design-tokens-theming.md) | 3 tiers de tokens (primitive → semantic → component), grammaire de nommage Style Dictionary → variables CSS, pipeline `tokens:build/watch/lint`, utility classes, multi-thème à 2 axes (`data-theme` + `data-mode`), `useTheme` / `ThemeProvider` / `DefaultsProvider`, API color/intent | 579 |

### Composants (~98 familles, ~217 fichiers `.vue`)

| Fichier | Domaine | Lignes |
|---|---|---:|
| [`10-components-layout.md`](./10-components-layout.md) | Layout & structure — App, Layout, Main, Section, Sheet, Grid(s), Masonry, Responsive, Card, Divider, SystemBar, Toolbar, AppBar, Watermark, Parallax | 804 |
| [`11-components-navigation.md`](./11-components-navigation.md) | Navigation — Breadcrumb, Tabs, Stepper, Pagination, Menu, ContextualMenu, CommandPalette, Drawer, Window, ItemGroup, BottomNav, Carousel, SlideGroup, ExpansionPanels | 1148 |
| [`12-components-forms-inputs.md`](./12-components-forms-inputs.md) | Formulaire (saisie) — Field, Input, TextField, TextareaField, NumberField, PasswordField, OtpInputField, FileField, SliderField, RatingField, Form, Label | 1144 |
| [`13-components-forms-controls.md`](./13-components-forms-controls.md) | Formulaire (contrôles) — SelectionControl, Checkbox, Radio, Switch, Select, ColorPicker(Field), DatePicker(Field), Calendar, Counter, NumberFormat, TextMask, InlineEdit | 1198 |
| [`14-components-feedback-overlays.md`](./14-components-feedback-overlays.md) | Feedback & overlays — Overlay, Dialog, Snackbar, Tooltip, Alert, Messages, Loader, Progress, Skeleton, EmptyState, ConfirmWrapper, Picker | 1136 |
| [`15-components-data-display.md`](./15-components-data-display.md) | Données & média — DataTable, Table, DataList, List, Timeline, Treeview, Chart, Avatar, Badge, Chip, Icon, Img, MediaController, Video, Audio | 1212 |
| [`16-components-utility-misc.md`](./16-components-utility-misc.md) | Utilitaires & divers — Btn, Blockquote, Code, Kbd, Clipboard, QrCode, Lazy, ClientOnly, DefaultsProvider, ThemeProvider, Transition, InfiniteScroll, VirtualScroll, Title | 1103 |

### Logique transversale (~103 composables)

| Fichier | Domaine | Lignes |
|---|---|---:|
| [`20-composables-commons.md`](./20-composables-commons.md) | ~70 composables transversaux (`Commons/` + CssSupport/Theme/Transition/Responsive) — le cœur architectural : color/border/rounded/elevation/stateEffect, dimension/size/density/margin/padding, location/position/layout/sticky, vModel/active/hover/group/nested/items, stack/teleport/activator, événements, SSR, données, locale/routage | 1587 |
| [`21-composables-feature.md`](./21-composables-feature.md) | ~38 composables métier — Audio, Calendar, Chart, Clipboard, Code, CommandPalette, DataTable, Form, Icon, InlineEdit, List, Mask, Masonry, Media, NumberField, NumberFormat, Parallax, PasswordField, Progress, QrCode, Sheet, SliderField, Snackbar, Textarea, Video, Watermark | 1200 |

### Contrats de types & valeurs

| Fichier | Domaine | Lignes |
|---|---|---:|
| [`30-interfaces.md`](./30-interfaces.md) | ~269 interfaces — 55 Commons en deep-dive (source de vérité des surfaces de props : `IColorProps`, `IDimensionProps`, `IMarginProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`, …) + interfaces composant par domaine + **graphe d'héritage** | 1750 |
| [`31-types.md`](./31-types.md) | ~258 types — 34 Commons (`TIntent`, `TSize`, `TDensity`, `TRounded`, `TVariant`, `TColor`, …), ~110 aliases `TOrigamXxx`, types composant par domaine, `TTokenName` auto-généré | 1260 |
| [`40-enums-consts.md`](./40-enums-consts.md) | ~79 enums (dont `MDI_ICONS`) + ~84 constantes (clés d'injection `Symbol.for`, guards SSR, matrices couleur, `FEATURE_QUERIES`, objets `_DEFAULTS`) + explication du pattern `XXX_DEFAULTS` vs `withDefaults` | 1721 |
| [`50-utils-directives-services.md`](./50-utils-directives-services.md) | ~68 utils purs (Commons + par domaine), 5 directives (`v-click-outside`, `v-hover`, `v-intersect`, `v-ripple`, `v-touch`), 3 services (`Box`, `CircularBuffer`, `DateAdapter`) | 1539 |

---

## Carte des dépendances (flux des couches)

```
                 ┌──────────────────────────────────────────────┐
   tokens/  ───► │  CSS variables + utility classes (généré)     │
                 └──────────────────────────────────────────────┘
                                    ▲
   types/  ─────► interfaces/ ─────► composables/ ─────► components/
   (TXxx)         (IXxx, extends     (useXxx :           (Origam*.vue)
                   Commons)           classes-first)
                       ▲                  ▲                  ▲
   enums/ ─────────────┘                  │                  │
   consts/ ────────────────────────────── ┘                  │
   utils/ (fonctions pures) ──────────────────────────────── ┤
   directives/ (v-xxx ↔ useXxx) ──────────────────────────── ┘
   services/ (classes : Box, CircularBuffer, DateAdapter)
```

**Règle d'or du projet** : avant de déclarer une prop transversale (dimension, couleur,
espacement, bordure…), un composant **`extends` l'interface Commons** correspondante et
consomme le **composable Commons** associé — jamais de redéclaration inline. Voir
[`01-architecture.md`](./01-architecture.md) §6 et [`30-interfaces.md`](./30-interfaces.md).

## Ordre de lecture conseillé

1. **`01`** puis **`02`** — comprendre l'architecture et le système de tokens/thème.
2. **`30`** + **`31`** + **`40`** — les contrats (interfaces, types, enums/consts) qui
   sous-tendent tout le reste.
3. **`20`** — les composables transversaux (la mécanique réutilisée partout).
4. **`50`** — utils/directives/services (briques de bas niveau).
5. **`10`–`16`** + **`21`** — les composants et leurs composables métier.

---

## Méthodologie & limites

- **Source unique** : le code de `packages/ds` à l'état de la branche au moment de la rédaction.
- **Véracité** : aucune donnée extrapolée ; les points non vérifiables sont signalés dans le texte.
- **Non couvert** : implémentations détaillées des autres packages, et l'évolution future
  (ex. retrait des retours `*Styles` prévu en v3.0.0, mentionné là où c'est pertinent).
