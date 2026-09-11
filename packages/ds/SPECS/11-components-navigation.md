# Composants Navigation — Spec technique ultra-détaillée

> Périmètre de ce document : **Breadcrumb**, **Tabs / TabPanels**, **Stepper**, **Pagination**, **Menu**, **ContextualMenu**, **CommandPalette**, **Drawer**, **Window**, **ItemGroup**, **BottomNav**, **Carousel / SlideGroup**, **ExpansionPanel**.

Chaque section repose exclusivement sur le code source lu dans `packages/ds/src/`. Aucune information n'a été extrapolée ; si un point n'est pas couvert par le code, la mention « Je ne sais pas » est utilisée.

---

## Table des matières

1. [OrigamBreadcrumb](#origambreadcrumb)
2. [OrigamBreadcrumbItem](#origambreadcrumbitem)
3. [OrigamBreadcrumbDivider](#origambreadcrumpdivider)
4. [OrigamTabs / OrigamTab / OrigamTabPanels / OrigamTabPanel](#onglets)
5. [OrigamStepper / OrigamStepperItem](#stepper)
6. [OrigamPagination](#origampagination)
7. [OrigamMenu](#origammenu)
8. [OrigamContextualMenu](#origamcontextualmenu)
9. [OrigamCommandPalette](#origamcommandpalette)
10. [OrigamDrawer](#origamdrawer)
11. [OrigamWindow / OrigamWindowItem](#onglet-window)
12. [OrigamItemGroup / OrigamItem](#origamitemgroup)
13. [OrigamBottomNav](#origambottomnav)
14. [OrigamCarousel / OrigamCarouselItem](#origamcarousel)
15. [OrigamSlideGroup](#origamslidegroup)
16. [OrigamExpansionPanels / OrigamExpansionPanel](#accordeon)
17. [Tableau récapitulatif](#tableau-recapitulatif)

---

## OrigamBreadcrumb

**Fichier** : `packages/ds/src/components/Breadcrumb/OrigamBreadcrumb.vue`

**Rôle** : Fil d'Ariane sémantique (`<nav>` par défaut). Affiche une liste ordonnée de liens séparés par des diviseurs. Le dernier élément est automatiquement désactivé et marqué `aria-current="page"`. Propage ses props visuelles (couleur, densité, états hover/active) à tous ses `OrigamBreadcrumbItem` enfants via `OrigamDefaultsProvider`.

### Entrées (props)

`IBreadcrumbProps` étend : `IColorProps`, `IBgColorProps`, `ITagProps`, `ICommonsComponentProps`, `IDensityProps`, `IRoundedProps`, `IPaddingProps`, `IMarginProps`, `IBorderProps`, `IElevationProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'nav'` | Élément racine. |
| `divider` | `string \| TIcon` | `'/'` | Caractère ou icône MDI séparant les items. |
| `items` | `Array<TBreadcrumbItem>` | `[]` | Liste d'items (objets ou chaînes simples). |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Contrôle le padding via `--density`. Valeurs : `comfortable`, `default`, `compact`. |
| `disabled` | `boolean` | — | Désactive tous les items. |
| `activeClass` | `string` | — | Classe CSS appliquée à l'item actif. |
| `color`, `bgColor` | `TColor` | — | Intent tokens ou valeurs custom. |
| `hoverColor`, `hoverBgColor`, `activeColor`, `activeBgColor` | `TColor` | — | Overrides d'état propagés aux items via DefaultsProvider. |
| `rounded`, `border`, `elevation`, `padding*`, `margin*` | — | — | Via interfaces Commons. |

La prop `items` est normalisée dans un `computed` : chaque item est enrichi de `disabled: true` et `isActive: true` si c'est le dernier. Les chaînes simples deviennent `{ title: item, disabled: true }`.

### Sorties

**Emits** : aucun emit direct documenté dans l'interface.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | — | Remplace intégralement le contenu rendu (y compris `<ol>`). |
| `item` | `{ item, index }` | Remplace tout item de la liste. |
| `item.${index}` | `{ item, index }` | Remplace l'item à la position `index`. |
| `item.title` | — | Remplace le titre à l'intérieur d'`OrigamBreadcrumbItem`. |
| `divider` | `{ divider }` | Remplace tous les diviseurs. |
| `divider.${index}` | `{ divider }` | Remplace le diviseur à la position `index`. |

**Classes / styles** : `useStateEffect` alimente `colorClasses`, `colorStyles`, `borderClasses`, `borderStyles`, `roundedClasses`, `roundedStyles`, `elevationClasses`, `elevationStyles`, `paddingClasses`, `paddingStyles`, `marginClasses`, `marginStyles`. Ces valeurs sont combinées dans `breadcrumbClasses` et `breadcrumbStyles`.

### Dépendances

- **Composables** : `useStateEffect`, `useDensity`, `useLocale`, `useProps`, `useStyle`.
- **Composants** : `OrigamBreadcrumbItem`, `OrigamBreadcrumbDivider`, `OrigamDefaultsProvider`.
- **Interfaces** : `IBreadcrumbProps`, `IBreadcrumbItemProps`.
- **Types** : `TBreadcrumbItem`.
- **Enums** : `DENSITY`.
- **Consts** : aucune injection key dédiée (propagation via `provideDefaults`).

### Comportement notable

- **ARIA sémantique** : racine `<nav>` avec `aria-label="Breadcrumb"` (via `useLocale`). Items dans `<ol>` / `<li>` (HTML sémantique correct, `list-style: none`).
- **Propagation de contexte** : `slotDefaults` transmet `density`, `color`, `bgColor`, `hoverColor`, `hoverBgColor`, `activeColor`, `activeBgColor`, `disabled` aux items enfants. Cela garantit que le contraste auto (détection `color === bgColor`) fonctionne sur chaque item.
- **CSS-first** : densité gérée par la variable CSS `--origam-breadcrumb---density` utilisée dans des `calc()`.
- **SSR** : pas de `onMounted`, safe côté serveur.

### Exemple d'usage

```vue
<OrigamBreadcrumb
  :items="[
    { title: 'Accueil', href: '/' },
    { title: 'Produits', href: '/produits' },
    'Téléphones'
  ]"
  color="primary"
  divider="chevron-right"
/>
```

---

## OrigamBreadcrumbItem

**Fichier** : `packages/ds/src/components/Breadcrumb/OrigamBreadcrumbItem.vue`

**Rôle** : Item individuel du fil d'Ariane. Résout ses props via `useDefaults` (injections du parent), supporte les liens via `useLink`, les icônes prepend/append via `useAdjacent`, et les états hover/active via `useHover` / `useActive`.

### Entrées (props)

`IBreadcrumbItemProps` étend : `ICommonsComponentProps`, `ITagProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `ILinkProps`, `IColorProps`, `IBgColorProps`, `IDensityProps`, `IAdjacentProps`, `IHoverProps`, `IActiveProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'span'` | Élément racine (remplacé par l'`href` via `useLink` si fourni). |
| `title` | `string` | — | Texte de l'item. |
| `disabled` | `boolean` | — | Applique la classe `--disabled` et `pointer-events: none`. Opacité réduite via `--opacity-disabled`. |
| `prependIcon`, `appendIcon` | `TIcon` | — | Icônes de bord. |
| `prependAvatar`, `appendAvatar` | `string` | — | URL d'avatar. |
| `href`, `to`, `replace`, `exact` | — | — | Hérités de `ILinkProps`. |
| `color`, `bgColor`, `hoverColor`, `hoverBgColor`, `activeColor`, `activeBgColor` | `TColor` | — | Intentions visuelles. |

**Résolution des props** : `useDefaults(_props)` applique les valeurs injectées par le parent `OrigamBreadcrumb` avant les props locales.

### Sorties

**Emits** : `IBreadcrumbItemEmits` étend `IAdjacentEmits` (clics prepend/append).

**Slots** :

| Nom | Description |
|---|---|
| `default` | Contenu principal (par défaut `<span>{{ title }}</span>`). |
| `prepend` | Zone prepend (par défaut `OrigamAvatar` ou `OrigamIcon`). |
| `append` | Zone append. |

**Classes** : `origam-breadcrumb-item`, `--link` (si `href` présent), `--disabled`, `activeClasses`, classes de composables.

### Dépendances

- **Composables** : `useActive`, `useAdjacent`, `useDefaults`, `useDensity`, `useHover`, `useLink`, `useProps`, `useStateEffect`, `useStyle`.
- **Composants** : `OrigamAvatar`, `OrigamIcon`.

### Comportement notable

- **ARIA** : `aria-current="page"` sur l'item actif (dernier item du fil d'Ariane).
- **`useStateEffect`** reçoit `isHover`, `isActive` (union de `useActive` et `link.isActive`), `hoverState`, `activeState`, `disabled` pour résoudre la bonne teinte de couleur à chaque état.

---

## OrigamBreadcrumbDivider

**Fichier** : `packages/ds/src/components/Breadcrumb/OrigamBreadcrumbDivider.vue`

**Rôle** : Diviseur entre items du fil d'Ariane. Détecte automatiquement si la valeur passée est une icône MDI ou une chaîne libre. Rendu dans un `<span>` par défaut.

### Entrées (props)

`IBreadcrumbDividerProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'span'` | Élément racine. |
| `divider` | `string \| TIcon` | `'/'` | Valeur affichée. Si c'est un membre de `MDI_ICONS`, rendu comme `OrigamIcon`. |
| `color`, `bgColor` | `TColor` | — | Via `useBothColor`. |
| spacing, size, density | — | — | Via `usePadding`, `useMargin`, `useSize`, `useDensity`. |

**Détection icône** : `isIcon = Object.values(MDI_ICONS).includes(divider)` — si vrai, rendu `<OrigamIcon :icon="divider"/>`, sinon texte brut.

### Dépendances

- **Composables** : `useBothColor`, `useDensity`, `useMargin`, `usePadding`, `useProps`, `useSize`, `useStyle`.
- **Composants** : `OrigamIcon`.
- **Enums** : `MDI_ICONS`.

---

## Onglets

### OrigamTabs

**Fichier** : `packages/ds/src/components/Tabs/OrigamTabs.vue`

**Rôle** : Conteneur de tablist WAI-ARIA (`role="tablist"`). Orchestre la sélection via `useGroup` (injection key `ORIGAM_TABS_KEY`). Propage `density`, `color`, `variant`, `fixed` aux `OrigamTab` enfants.

#### Entrées (props)

`ITabsProps` étend : `ICommonsComponentProps`, `ITagProps`, `IDirectionProps`, `IDensityProps`, `IRoundedProps`, `IColorProps`, `IBgColorProps`, `IGroupProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `direction` | `DIRECTION` | `DIRECTION.HORIZONTAL` | `'horizontal'` ou `'vertical'`. Adapte `flex-direction` et `aria-orientation`. |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Hauteur via `--origam-tabs---height` (56px comfortable / 48px default / 36px compact). |
| `variant` | `TTabVariant` | `TAB_VARIANT.DEFAULT` | `'default'`, `'pills'`, `'underline'`. Chaque variant a des styles SCSS dédiés. |
| `mandatory` | `boolean` | `true` | Toujours un onglet sélectionné (convention WAI-ARIA). |
| `fixed` | `boolean` | `false` | Distribution égale des onglets (`flex: 1 1 0`). |
| `centered` | `boolean` | `false` | Centre le tablist (`justify-content: center`). |
| `modelValue` | `any` | — | Valeur de l'onglet actif (via `IGroupProps`). |
| `multiple`, `max` | — | — | Via `IGroupProps` (usage rare dans les tabs). |
| `selectedClass` | `string` | `'origam-tab--active'` | Classe CSS de l'onglet sélectionné. |

#### Sorties

**Emits** : `ITabsEmits` étend `ICommonsComponentEmits` (v-model `update:modelValue`).

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | `{ isSelected, select, next, prev, selected, items }` | Contenu du tablist (les `OrigamTab`). |

**Expose** : `filterProps`, `next`, `prev`, `select`, utilitaires style.

#### Navigation clavier

Le handler `handleKeydown` gère :
- `ArrowLeft` / `ArrowRight` (horizontal) → `prev()` / `next()` + focus sur l'onglet sélectionné.
- `ArrowUp` / `ArrowDown` (vertical) → idem.
- `Home` / `End` → premier/dernier onglet non désactivé.
- `Enter` / `Space` → sélectionne l'onglet courant.

Focus maintenu via `querySelector('[data-origam-tab-id="${id}"]')`.

#### Dépendances

- **Composables** : `useDensity`, `useGroup`, `useProps`, `useRounded`, `useStyle`.
- **Consts** : `ORIGAM_TABS_KEY`.
- **Enums** : `DENSITY`, `DIRECTION`, `TAB_VARIANT`.
- **Composants** : `OrigamDefaultsProvider`.

---

### OrigamTab

**Fichier** : `packages/ds/src/components/Tabs/OrigamTab.vue`

**Rôle** : Onglet individuel. `role="tab"`, s'auto-enregistre dans le groupe parent (`useGroupItem`, `ORIGAM_TABS_KEY`). Génère ses IDs ARIA (`tabDomId` = `origam-tab-{id}`) et calcule `aria-controls` en cherchant le panel correspondant dans le groupe `ORIGAM_TAB_PANELS_KEY`.

#### Entrées (props)

Interface locale étendant `ITabProps` et `IGroupItemProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'button'` | Élément racine. |
| `text` | `string` | `''` | Texte du label (fallback si pas de slot). |
| `icon` | `TIcon` | — | Icône prepend. |
| `appendIcon` | `TIcon` | — | Icône append. |
| `value` | `any` | — | Valeur de cet onglet dans le groupe. |
| `disabled` | `boolean` | — | Désactive l'onglet (`tabindex=-1`, `aria-disabled`). |
| `variant` | `TTabVariant` | — | Résolu par `useDefaults` depuis le parent. Contrôle l'indicateur (`hasIndicator = variant === 'underline'`). |

**`tabindex`** : `0` si sélectionné et non désactivé, `-1` sinon (roving tabindex).

**Indicateur underline** : `<span class="origam-tab__indicator" aria-hidden="true"/>` rendu uniquement si `variant === 'underline'`. Il se scale de `scaleX(0)` à `scaleX(1)` via CSS sur la classe `--active`.

#### Dépendances

- **Composables** : `useDefaults`, `useGroupItem`, `useProps`, `useStyle`.
- **Consts** : `ORIGAM_TABS_KEY`, `ORIGAM_TAB_PANELS_KEY`.
- **Composants** : `OrigamIcon`.

---

### OrigamTabPanels

**Fichier** : `packages/ds/src/components/Tabs/OrigamTabPanels.vue`

**Rôle** : Conteneur des panneaux de contenu. Orchestre la sélection via `useGroup` (`ORIGAM_TAB_PANELS_KEY`). Expose le contexte de transition (`ORIGAM_TAB_PANELS_CTX_KEY`) aux panels enfants. Supporte le swipe tactile via la directive `vTouch`.

#### Entrées (props)

`ITabPanelsProps` (composé de `IGroupProps` + props locales) :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `direction` | `DIRECTION` | `DIRECTION.HORIZONTAL` | Direction des panneaux. |
| `mandatory` | `boolean` | `true` | Toujours un panel visible. |
| `transition` | `string \| false` | `'fade'` | Nom de la transition CSS Vue. `false` désactive l'animation. |
| `swipeable` | `boolean` | `false` | Active le swipe gauche/droite (via `vTouch`). |
| `selectedClass` | `string` | `'origam-tab-panel--active'` | Classe du panel actif. |

**Tracking de direction** : un `watch` sur `activeIndex` met à jour `isReversed` (fourni au contexte) pour permettre des transitions directionnelles.

#### Dépendances

- **Composables** : `useGroup`, `useProps`, `useStyle`.
- **Directives** : `vTouch`.
- **Consts** : `ORIGAM_TAB_PANELS_KEY`, `ORIGAM_TAB_PANELS_CTX_KEY`.
- **Composants** : `OrigamDefaultsProvider`.

---

### OrigamTabPanel

**Fichier** : `packages/ds/src/components/Tabs/OrigamTabPanel.vue`

**Rôle** : Panneau de contenu (`role="tabpanel"`). S'auto-enregistre dans `ORIGAM_TAB_PANELS_KEY`. Génère `panelDomId = origam-tab-panel-{id}` et `aria-labelledby` pointant vers le tab correspondant (recherche par `value` dans `ORIGAM_TABS_KEY`). Utilise `v-show` (DOM conservé) + `useLazy` (montage différé) + `<Transition>`.

#### Entrées (props)

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `value` | `any` | — | Valeur correspondant à l'onglet associé. |
| `eager` | `boolean` | `false` | Monte le contenu dès le premier rendu (désactive `useLazy`). |

**Transition** : résolu depuis `ORIGAM_TAB_PANELS_CTX_KEY` (fourni par le parent `OrigamTabPanels`). Par défaut `'fade'`.

**`tabindex="0"`** + `:focus-visible` avec outline 2px sur le panel.

---

## Stepper

### OrigamStepper

**Fichier** : `packages/ds/src/components/Stepper/OrigamStepper.vue`

**Rôle** : Indicateur de progression multi-étapes. Rendu en `<nav aria-label="Progress steps">`. Gère un modèle interne synchronisé avec `modelValue`. Fournit un contexte (`ORIGAM_STEPPER_KEY`) aux `OrigamStepperItem` enfants. Supporte les connecteurs entre étapes.

#### Entrées (props)

`IStepperProps` étend : `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`, `ISizeProps`, `IDensityProps`, `IDimensionProps`, `IElevationProps`, `IMarginProps`, `IPaddingProps`, `IRoundedProps`, `IBorderProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number` | `0` | Index de l'étape courante. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Disposition des étapes et connecteurs. |
| `clickable` | `boolean` | `false` | Permet de cliquer sur les étapes pour naviguer. |
| `showConnectors` | `boolean` | `true` | Affiche les lignes entre les étapes. |
| `items` | `IStepperItem[]` | — | Données des étapes si on n'utilise pas le slot. |
| `size` | `SIZES` | `SIZES.DEFAULT` | Taille des indicateurs : xs (24px), sm (28px), default (32px), lg (40px), xl (48px). |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | Espacement. |
| `color`, `bgColor` | `TColor` | — | Couleur de l'indicateur actif/fait. |

**Emit** : `(e: 'update:modelValue', value: number)`.

**Contexte fourni** (`ORIGAM_STEPPER_KEY`) :

```ts
{
  modelValue: internalModel,        // Ref<number>
  orientation: computed(() => ...),  // ComputedRef<TStepperOrientation>
  clickable: computed(() => ...),    // ComputedRef<boolean>
  color: computed(() => props.color) // ComputedRef<string | undefined>
}
```

**Connecteurs** : `connectorStatus(index)` retourne `'done'` si `index - 1 < modelValue`, `'pending'` sinon. La classe `origam-stepper__connector--done` colore le connecteur avec la couleur du stepper.

#### Dépendances

- **Composables** : `useDensity`, `useDimension`, `useProps`, `useSize`, `useStateEffect`, `useStyle`.
- **Consts** : `ORIGAM_STEPPER_KEY`.
- **Composants** : `OrigamStepperItem`.
- **Types** : `TStepperItemStatus`.

---

### OrigamStepperItem

**Fichier** : `packages/ds/src/components/Stepper/OrigamStepperItem.vue`

**Rôle** : Étape individuelle du stepper. Injecte le contexte parent via `ORIGAM_STEPPER_KEY`. Calcule le statut résolu (`pending`, `active`, `done`, `error`). Rendu comme `<button>` si cliquable, sinon `<div>`.

#### Entrées (props)

`IStepperItemProps` étend `ICommonsComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `index` | `number` | `0` | Position de l'étape (0-based). |
| `title` | `string` | — | Titre affiché sous l'indicateur. |
| `subtitle` | `string` | — | Sous-titre. |
| `icon` | `TIcon` | — | Icône custom dans l'indicateur (si `status` n'est ni `done` ni `error`). |
| `status` | `TStepperItemStatus` | — | Override explicite : `'pending'`, `'active'`, `'done'`, `'error'`. |
| `clickable` | `boolean` | — | Override item-level. La logique priorité : `props.clickable === true` > contexte parent. |

**Résolution du statut** :
- Si `props.status` est défini → utilisé tel quel.
- Sinon : `idx < modelValue` → `'done'`, `idx === modelValue` → `'active'`, sinon `'pending'`.

**Indicateur** : `aria-hidden="true"`. Icône `CHECK` si `done`, `EXCLAMATION` si `error`, icône custom si fournie, sinon numéro `(index + 1)`.

**ARIA** : `aria-current="step"` si `resolvedStatus === 'active'`. `aria-label="Step N: title"`. L'étape active est rendue comme `<button disabled>` (visuellement sélectionnable mais non re-cliquable).

**Focus** : `:focus-visible` avec outline 2px et radius full sur l'indicateur.

---

## OrigamPagination

**Fichier** : `packages/ds/src/components/Pagination/OrigamPagination.vue`

**Rôle** : Barre de pagination. Deux modes : standard (liste de boutons numérotés) et compact (input number + prev/next). Un troisième mode `withInfo` affiche `"Showing N-M of total"` à gauche avec prev/next textuels.

### Entrées (props)

`IPaginationProps` étend : `ICommonsComponentProps`, `ITagProps`, `IColorProps`, `IBgColorProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IElevationProps`, `ISizeProps`, `IDensityProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `number` | `1` | Page courante. |
| `length` | `number \| string` | `1` | Nombre total de pages. |
| `start` | `number` | `1` | Index de la première page. |
| `totalVisible` | `number \| string` | — | Nombre max de boutons visibles. Calculé depuis la largeur si absent. |
| `disabled` | `boolean` | — | Désactive tous les boutons. |
| `compact` | `boolean` | `false` | Mode compact avec input numérique. |
| `withInfo` | `boolean` | `false` | Affiche la plage `Showing N-M of total`. Collapse à un seul bouton de page. |
| `total` | `number \| string` | — | Total d'items (pour `withInfo`). Fallback : `length * perPage`. |
| `perPage` | `number \| string` | `10` | Items par page (pour `withInfo`). |
| `showFirstLastPage` | `boolean` | — | Affiche les boutons première/dernière page. |
| `prevIcon`, `nextIcon`, `firstIcon`, `lastIcon` | `TIcon` | `CHEVRON_LEFT/RIGHT`, `CHEVRON_DOUBLE_LEFT/RIGHT` | Icônes de navigation. |
| `ellipsis` | `string` | `'...'` | Texte de l'ellipse. |
| `ariaLabel`, `pageAriaLabel`, `currentPageAriaLabel`, `firstAriaLabel`, `previousAriaLabel`, `nextAriaLabel`, `lastAriaLabel` | `string` | clés i18n | Labels ARIA. |
| `previousText`, `nextText` | `string` | — | Texte textuel des boutons prev/next en mode `withInfo`. |
| `size`, `density` | — | — | Via interfaces Commons. |

### Sorties

**Emits** : `IPaginationEmits` étend `ICommonsComponentEmits` plus `first(value)`, `prev(value)`, `next(value)`, `last(value)`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `first` | `controls.first` | Bouton première page. |
| `prev` | `controls.prev` | Bouton page précédente. |
| `item` | (item courant) | Remplace tous les boutons de page. |
| `item-${item.key}` | — | Remplace un bouton de page spécifique. |
| `next` | `controls.next` | Bouton page suivante. |
| `last` | `controls.last` | Bouton dernière page. |
| `info` | `{ start, end, total }` | Contenu de la zone info (mode `withInfo`). |

### Comportement notable

**Algorithme d'ellipses** : quand `length > totalVisible`, l'algorithme calcule `left/right/middle` pour placer 1 ou 2 ellipses. En mode `withInfo`, seule la page courante est rendue (pas d'ellipse).

**Couleur unifiée** (`sharedBtnColorProps`) : tous les boutons de la rangée (pages + contrôles + ellipses) reçoivent les mêmes 6 champs `IColorProps`. La synthèse `bgColor = bgColor || color` garantit le bon contraste auto sur les surfaces colorées.

**`--colored`** : modificateur CSS activé si `color || bgColor`. Branche SCSS qui réoriente les variables `--bg-base` et `--fg-base`. States hover/active dérivés par `color-mix`.

**Responsive** : `useResizeObserver` mesure la largeur du premier item pour calculer `maxButtons`.

**Navigation clavier** : `ArrowLeft` / `ArrowRight` changent la page et déplacent le focus via `refs.value[currentIndex].$el.focus()`.

**Mode compact** : `<input type="number">` avec clamp côté `handleCompactInput`. `appearance: textfield` masque les spinners navigateur.

### Dépendances

- **Composables** : `useDensity`, `useDisplay`, `useLocale`, `useProps`, `useRefs`, `useResizeObserver`, `useSize`, `useVModel`, `useStyle`.
- **Utils** : `createRange`, `int`.
- **Enums** : `KEYBOARD_VALUES`, `MDI_ICONS`.
- **Composants** : `OrigamBtn`.

---

## OrigamMenu

**Fichier** : `packages/ds/src/components/Menu/OrigamMenu.vue`

**Rôle** : Menu flottant positionné relativement à son activateur. Délègue l'overlay à `OrigamOverlay`. Supporte les sous-menus imbriqués via injection `ORIGAM_MENU_KEY`. Ferme la chaîne de menus parents à la fermeture.

### Entrées (props)

`IMenuProps` étend `IOverlayProps`, `IListProps`, `IListItemProps` plus `id?: string`.

Principales props overlay pertinentes (avec défauts dans `withDefaults`) :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | Contrôle l'état ouvert/fermé (v-model). |
| `activator` | `string \| Element` | — | Élément déclencheur. |
| `target` | `string \| Element` | — | Cible de positionnement. |
| `openOnClick` | `boolean` | `true` | Ouvre au clic sur l'activateur. |
| `openOnContextMenu` | `boolean` | — | Ouvre au clic droit. |
| `closeOnContentClick` | `boolean` | `true` | Ferme au clic dans le contenu. |
| `closeDelay` | `number` | `250` | Délai de fermeture (ms). |
| `openDelay` | `number` | `300` | Délai d'ouverture (ms). |
| `location` | `TInline` | `INLINE.RIGHT` | Côté d'ancrage. |
| `locationStrategy` | `TLocationStrategy` | `LOCATION_STRATEGIES.CONNECTED` | Stratégie de positionnement. |
| `scrollStrategy` | `TScrollStrategy` | `SCROLL_STRATEGIES.REPOSITION` | Comportement au scroll. |
| `offset` | `number \| [number, number]` | `8` | Décalage. |
| `scrim` | `boolean` | `false` | Fond semi-transparent. |
| `transition` | `TTransitionProps` | `{ component: OrigamTranslateScale }` | Transition d'entrée/sortie. |
| `items` | `IItemProps[]` | — | Items du menu (liste prédéfinie). |
| `title` | `string` | — | Sous-en-tête de liste. |
| `color`, `bgColor`, `rounded`, `border`, `elevation`, `padding*`, `margin*` | — | — | Visuels appliqués au `.origam-menu__content`. |

### Sorties

**Emits** : `IMenuEmits` étend `ICommonsComponentEmits` plus `contextmenu(event)`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `activator` | `{ props }` | Élément déclencheur (props à spreader). |
| `default` | — | Contenu du menu (remplace la liste auto-générée). |

**Expose** : membres de `OrigamOverlay` via `forwardRefs` + `openChildren`, `filterProps`.

### Comportement notable

**Sous-menus** : chaque `OrigamMenu` `inject(ORIGAM_MENU_KEY)` son parent et `provide` son propre contexte. `openChildren` compte les sous-menus ouverts. `closeParents()` se propage en chaîne via `setTimeout(40ms)` pour permettre aux transitions de terminer.

**Focus trap** : `handleFocusIn` détecte si le focus quitte le contenu et ramène au premier focusable. `handleKeydown` intercepte `Tab` : si on dépasse le dernier élément, ferme le menu et retourne le focus à l'activateur. `handleActivatorKeydown` ouvre le menu sur `ArrowDown/Up` et navigue dans les items.

**ARIA sur l'activateur** : `aria-haspopup="menu"`, `aria-expanded`, `aria-owns` sont fusionnés via `mergeProps` avec les `activatorProps` consommateurs.

**Items imbriqués** : si un item possède des sous-items (`item.items`), un `OrigamMenu` récursif est rendu avec un `OrigamListItem` comme activateur (icône chevron droite, `openOnClick`, pas de contextMenu).

**CSS token** : `.origam-menu__content` lit `--origam-menu---background`, `--origam-menu---color`, `--origam-menu---border-radius`, `--origam-menu---box-shadow`, `--origam-menu---max-height`.

### Dépendances

- **Composables** : `useBothColor`, `useProps`, `useScopeId`, `useStateEffect`, `useStyle`, `useVModel`.
- **Utils** : `focusableChildren`, `focusChild`, `forwardRefs`, `getNextElement`, `getUid`.
- **Consts** : `ORIGAM_MENU_KEY`.
- **Enums** : `INLINE`, `KEYBOARD_VALUES`, `LOCATION_STRATEGIES`, `MDI_ICONS`, `SCROLL_STRATEGIES`.
- **Composants** : `OrigamList`, `OrigamListGroup`, `OrigamListItem`, `OrigamListSubheader`, `OrigamOverlay`, `OrigamTranslateScale`.

---

## OrigamContextualMenu

**Fichier** : `packages/ds/src/components/ContextualMenu/OrigamContextualMenu.vue`

**Rôle** : Wrapper mince autour d'`OrigamMenu` précâblé pour le menu contextuel (clic droit). `activator="cursor"`, `target="cursor"`, `openOnContextMenu=true`, `openOnClick=false`. Tous les slots sont transférés via la boucle `v-for (_, name) in $slots`.

### Entrées (props)

`IContextualMenuProps` reprend les mêmes props que `IMenuProps` avec les susdits défauts forcés. Props locaux `withDefaults` :

| Prop | Défaut forcé |
|---|---|
| `target` | `'cursor'` |
| `openOnClick` | `false` |
| `openOnContextMenu` | `true` |
| `activator` | `'cursor'` |
| `closeDelay` | `250` |
| `location` | `INLINE.RIGHT` |
| `transition` | `{ component: OrigamTranslateScale }` |

### Comportement notable

Le `modelValue` est initialisé à `false`. Tous les membres d'`OrigamMenu` sont exposés via `forwardRefs`. Aucun SCSS propre (la classe `origam-contextual-menu` est ajoutée mais le fichier scoped est vide).

---

## OrigamCommandPalette

**Fichier** : `packages/ds/src/components/CommandPalette/OrigamCommandPalette.vue`

**Rôle** : Palette de commandes modale universelle. Rendu via `<teleport to="body">`. Déclenché par `⌘K / Ctrl+K` (configurable). Filtre les commandes par fuzzy-match. Supporte les groupes, le clavier complet et un système de registre global via `useCommand()`.

### Entrées (props)

`ICommandPaletteProps` étend `ICommonsComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Contrôle l'ouverture. |
| `hotkey` | `TCommandPaletteHotkey \| null` | `[['meta','k'],['ctrl','k']]` | Raccourci global. `null` désactive. |
| `commands` | `ReadonlyArray<ICommand>` | — | Liste statique. Si absent, utilise le registre global `useCommand()`. |
| `placeholder` | `string` | `'Search…'` | Placeholder de l'input. |
| `emptyText` | `string` | `'No results'` | Message état vide. |
| `maxHeight` | `number \| string` | `480` | Hauteur max de la liste (px ou string CSS). |
| `width` | `number \| string` | `640` | Largeur du dialogue (px). |
| `loading` | `boolean` | `false` | Affiche un spinner à la place des résultats. |
| `closeOnSelect` | `boolean` | `true` | Ferme automatiquement après sélection. |
| `closeOnEscape` | `boolean` | `true` | Ferme sur `Escape`. |
| `closeOnBackdrop` | `boolean` | `true` | Ferme au clic sur le backdrop. |

### Interface `ICommand`

| Champ | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant stable (dédupliqué dans le registre). |
| `label` | `string` | Label principal (fuzzy-match dessus). |
| `description` | `string?` | Ligne secondaire. |
| `icon` | `TIcon?` | Icône prepend. |
| `kbd` | `ReadonlyArray<string>?` | Raccourci affiché (display-only via `OrigamKbd`). |
| `group` | `string?` | Groupe de commandes. |
| `keywords` | `ReadonlyArray<string>?` | Termes de recherche supplémentaires. |
| `perform` | `() => void \| Promise<void>` | Action exécutée. Awaitée avant fermeture si `closeOnSelect`. |
| `disabled` | `boolean?` | Visible mais non sélectionnable. |

### Sorties

**Emits** : `ICommandPaletteEmits` : `update:modelValue(boolean)`, `select(command)`, `query(text)`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `item` | `{ command, isActive }` | Remplace le rendu de chaque commande. |
| `empty` | — | État vide. |
| `footer` | — | Pied de dialogue (défaut : hints navigate/select/close avec `OrigamKbd`). |

**Expose** : `query`, `filtered`, `activeIndex`, `isActive`.

### Comportement notable

**Fuzzy-match** : `fuzzyMatch(sourceCommands, query, getter)` depuis `utils/CommandPalette/fuzzy-match.util.ts`. Quand `query` est vide, les commandes sont groupées par `group`. Quand `query` est renseigné, la vue est plate (ordre par score).

**Registre global** : `useCommand()` retourne `{ commands, isOpen }`. La palette synchronise `isActive` ↔ `registryOpen` via deux `watch`. Cela permet `useCommand().open()` depuis n'importe où dans l'app.

**Hotkeys** : `useHotkey(keysAsString, () => toggle())` pour chaque combinaison. `inputs: false` par défaut dans `useHotkey` — ne déclenche pas si le focus est sur un `<input>`.

**Focus management** : à l'ouverture, le focus précédent est mémorisé (`returnFocusEl = document.activeElement`) et restauré à la fermeture. L'input reçoit le focus via `inputRef.value?.focus({ preventScroll: true })`.

**Keyboard** : `ArrowDown/Up` → `moveActive(±1)` (skip des items disabled). `Enter` → `selectCommand`. `Escape` → fermeture. `Tab` → piège le focus sur l'input.

**ARIA** : `role="dialog"`, `aria-modal="true"`, `role="combobox"` sur l'input, `aria-controls` pointant le listbox, `aria-activedescendant` sur l'option active, `role="listbox"` sur la liste, `role="option"` sur chaque commande.

**SSR** : `IN_BROWSER` gate les listeners `useHotkey` et le `watch` des hotkeys.

**Animations** : `prefers-reduced-motion` réduit la durée du fade backdrop à `60ms`.

### Dépendances

- **Composables** : `useCommand`, `useHotkey`, `useVModel`.
- **Composants** : `OrigamIcon`, `OrigamKbd`.
- **Utils** : `fuzzyMatch`, `getUid`.
- **Consts** : `COMMAND_PALETTE_DEFAULT_HOTKEY` (`[['meta','k'],['ctrl','k']]`), `COMMAND_PALETTE_DEFAULT_MAX_HEIGHT` (`480`), `COMMAND_PALETTE_DEFAULT_WIDTH` (`640`), `IN_BROWSER`.
- **Enums** : `MDI_ICONS`.

---

## OrigamDrawer

**Fichier** : `packages/ds/src/components/Drawer/OrigamDrawer.vue`

**Rôle** : Panneau latéral (navigation drawer). Intègre `useLayoutItem` pour réserver de l'espace dans la grille de layout. Supporte 4 positions (`left`, `right`, `top`, `bottom`), les modes `permanent`, `temporary`, `rail`, `expandOnHover`. Gère le glissement tactile (`useTouch`) et l'animation d'entrée/sortie par transition CSS.

### Entrées (props)

`IDrawerProps` étend : `ITagProps`, `ICommonsComponentProps`, `IBorderProps`, `IElevationProps`, `ILayoutItemProps`, `IRoundedProps`, `IColorProps`, `IBgColorProps`, `IDensityProps`, `IPaddingProps`, `IMarginProps`, `ITransitionComponentProps`, `IScrimProps`, `IActiveProps`, `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'nav'` | Élément racine. |
| `modelValue` | `boolean` | `true` | Ouvert/fermé. |
| `location` | `INLINE` | `INLINE.LEFT` | Position : `left`, `right`, `top`, `bottom`. |
| `width` | `number \| string` | `256` | Largeur (px). |
| `railWidth` | `number \| string` | `56` | Largeur en mode rail. |
| `permanent` | `boolean \| null` | `null` | Drawer toujours visible (jamais caché). |
| `temporary` | `boolean` | — | Overlay (pas de réservation dans le layout). |
| `rail` | `boolean \| null` | `null` | Mode icônes seulement (width = railWidth). |
| `expandOnHover` | `boolean` | — | En mode rail, s'élargit au survol. |
| `push` | `boolean \| null` | `null` | Force la réservation de layout. `null` = heuristique (permanent → push). |
| `clipped` | `boolean \| null` | `null` | Positionne le drawer sous l'AppBar. `null` = ordre HTML. |
| `floating` | `boolean` | — | Supprime la bordure (`border: none`). |
| `sticky` | `boolean` | — | Sticky positioning. |
| `touchless` | `boolean` | — | Désactive le swipe. |
| `scrim` | `boolean` | `true` | Fond semi-transparent en mode temporaire. |
| `disableResizeWatcher` | `boolean` | — | Désactive le watch sur `isTemporary`. |
| `disableRouteWatcher` | `boolean` | — | Désactive la fermeture auto au changement de route. |
| `transition` | `string \| TTransitionProps` | `'origam-transition--drawer'` | Transition. |
| `bgColor` | `TColor` | — | Couleur de fond via `useBackgroundColor`. |
| `order` | `number \| string` | — | Ordre dans le layout (override de `clipped`). |
| `absolute` | `boolean` | — | Positioning absolu. |

### Sorties

**Emits** : `IDrawerEmits` : `update:rail(boolean)`.

**Slots** :

| Nom | Description |
|---|---|
| `default` | Contenu principal. |
| `prepend` | Zone en haut. |
| `append` | Zone en bas. |
| `wrapper` | Remplace entièrement `.origam-drawer__wrapper`. |

### Comportement notable

**Layout integration** : `useLayoutItem` enregistre le drawer avec `id=props.name`, `position=location`, `layoutSize` (0 si temporaire ou non-push, `width` sinon), `elementSize=width`, `active`. En retour, `layoutItemStyles` contient les styles de transformation (translateX, width…) injectés en inline.

**`isLayoutOrphan`** : si `layoutId === 'origam-layout-orphan'`, le `<teleport>` est désactivé (`disabled`) → le drawer se rend en place dans le DOM (stories, tests).

**Téléport** : cible `#${layoutId} .origam-layout__wrapper` quand le layout existe.

**Animation** : `origam-transition--drawer` est une transition CSS globale avec `!important` sur `transform` (nécessaire car `useLayoutItem` émet `transform: translateX(0%)` en inline). Keyframes :
- `--left` (défaut) : `translateX(-100%)`.
- `--right` : `translateX(100%)`.
- `--top` : `translateY(-100%)`.
- `--bottom` : `translateY(100%)`.

**Drag tactile** : `useTouch` retourne `isDragging`, `dragProgress`, `dragStyles`. Le scrim suit `dragProgress * 0.2` en opacité. L'état active du layout suit `isActive || isDragging`.

**Route watcher** : ferme automatiquement le drawer temporaire au changement de route (via `useRouter`).

**SSR** : `useSsrBoot` fournit `ssrBootStyles` pour éviter le flash de layout.

**`prefers-reduced-motion`** : la durée de la transition tombe à `0.01ms` via `@media (prefers-reduced-motion: reduce)`.

### Dépendances

- **Composables** : `useActive`, `useBackgroundColor`, `useDensity`, `useHover`, `useLayoutItem`, `useProps`, `useRouter`, `useScopeId`, `useSsrBoot`, `useStateEffect`, `useSticky`, `useStyle`, `useToggleScope`, `useTouch`, `useVModel`.
- **Composants** : `OrigamOverlayScrim`, `OrigamTransition`.

---

## Window

### OrigamWindow

**Fichier** : `packages/ds/src/components/Window/OrigamWindow.vue`

**Rôle** : Conteneur de slides/panneaux avec navigation prev/next et support tactile. Fournit le contexte de transition (`ORIGAM_WINDOW_KEY`) aux items enfants.

#### Entrées (props)

`IWindowProps` étend : `ICommonsComponentProps`, `ITagProps`, `IDirectionProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `IElevationProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `modelValue` | `any` | — | Slide actif (v-model). |
| `direction` | `DIRECTION` | `DIRECTION.HORIZONTAL` | Axe de transition (X ou Y). |
| `prevIcon` | `TIcon` | `MDI_ICONS.CHEVRON_LEFT` | Icône bouton précédent. |
| `nextIcon` | `TIcon` | `MDI_ICONS.CHEVRON_RIGHT` | Icône bouton suivant. |
| `continuous` | `boolean` | — | Wrapping circulaire des slides. |
| `showArrows` | `string \| boolean` | `true` | Affichage des flèches : `true`, `false`, `'hover'`. |
| `reverse` | `boolean` | — | Inverse la direction de la transition. |
| `touch` | `boolean \| ITouchHandlers` | — | Config du swipe. `false` désactive. |
| `mandatory` | `boolean` | `true` | Toujours un item sélectionné. |
| `selectedClass` | `string` | `'origam-window-item--active'` | Classe de l'item actif. |
| `disabled` | `boolean` | — | Désactive la navigation. |

#### Sorties

**Emits** : `IWindowEmits` étend `ICommonsComponentEmits`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | `group` (IGroupProvide) | Contenu (les `OrigamWindowItem`). |
| `additional` | `group` | Zone sous le container (utilisé par Carousel pour les délimiteurs). |
| `arrows` | `{ prevProps, nextProps, canMoveBack, canMoveForward }` | Remplace entièrement la zone de contrôles. |
| `prev` | `{ props, canMove }` | Remplace le bouton précédent. |
| `next` | `{ props, canMove }` | Remplace le bouton suivant. |

**Expose** : `filterProps`, `group`, utilitaires style.

#### Comportement notable

**Transition directionnelle** : `isReversed` suit `activeIndex` (wrapping 0↔last traité séparément). La transition est `origam-window-item--x-transition` ou `--y-transition` avec leur variante `--reverse`.

**Hauteur animée** : `transitionHeight` est fourni au contexte. `OrigamWindowItem` le met à jour à `beforeEnter` / `onEnter` pour que la hauteur du container suive le contenu entrant.

**`showArrows: 'hover'`** : ajoute `origam-window--show-arrows-on-hover`. Les flèches sont translateX(±200%) au repos et reviennent à translateX(0) au `:hover` via CSS.

#### Dépendances

- **Composables** : `useGroup`, `useLocale`, `useProps`, `useStyle`.
- **Directives** : `vTouch`.
- **Consts** : `ORIGAM_WINDOW_GROUP_KEY`, `ORIGAM_WINDOW_KEY`.
- **Composants** : `OrigamBtn`, `OrigamSpacer`.

---

### OrigamWindowItem

**Fichier** : `packages/ds/src/components/Window/OrigamWindowItem.vue`

**Rôle** : Slide individuel. S'enregistre dans `ORIGAM_WINDOW_GROUP_KEY`. Utilise `v-show` pour rester dans le DOM. Délègue la transition à `OrigamTransition` avec le nom calculé depuis le contexte parent.

#### Entrées (props)

`IWindowItemProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `any` | — | Identifiant dans le groupe. |
| `disabled` | `boolean` | — | Désactive la sélection. |
| `transition` | `string \| false` | — | Override de la transition pour ce slide. |
| `reverseTransition` | `string \| false` | — | Override de la transition inverse. |
| `eager` | `boolean` | — | Monte immédiatement (via `useLazy`). |

**`useSsrBoot`** : `isBooted` gate l'activation des transitions (évite l'animation au premier rendu SSR).

---

## OrigamItemGroup

**Fichier** : `packages/ds/src/components/ItemGroup/OrigamItemGroup.vue`

**Rôle** : Conteneur de sélection renderless. Pas de chrome visuel propre. Orchestre la sélection de ses items enfants via `useGroup` (`ORIGAM_ITEM_GROUP_KEY`). Propage `selectedClass` aux items via `OrigamDefaultsProvider`.

### Entrées (props)

`IItemGroupProps` étend : `ICommonsComponentProps`, `ITagProps`, `IGroupProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `modelValue` | `any` | — | Item(s) sélectionné(s). |
| `multiple` | `boolean` | — | Sélection multiple. |
| `mandatory` | `boolean` | — | Toujours un item sélectionné. |
| `max` | `number` | — | Nombre max de sélections. |
| `disabled` | `boolean` | — | Désactive tout le groupe. |
| `selectedClass` | `string` | `'origam-item--selected'` | Classe CSS de l'item sélectionné. |

### Sorties

**Emits** : `IItemGroupEmits` étend `ICommonsComponentEmits`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | `{ isSelected, select, next, prev, selected }` | Contenu du groupe. |

**Expose** : `filterProps`, `next`, `prev`, `select`.

### Dépendances

- **Composables** : `useGroup`, `useProps`, `useStyle`.
- **Consts** : `ORIGAM_ITEM_GROUP_KEY`.
- **Composants** : `OrigamDefaultsProvider`.

---

### OrigamItem

**Fichier** : `packages/ds/src/components/ItemGroup/OrigamItem.vue`

**Rôle** : Item individuel d'un `OrigamItemGroup`. S'enregistre via `useGroupItem(ORIGAM_ITEM_GROUP_KEY)`. Expose son état de sélection dans le slot scope.

#### Entrées (props)

Interface locale étendant `IItemGroupItemProps` :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `value` | `any` | — | Valeur dans le groupe. |
| `disabled` | `boolean` | — | Désactive cet item. |
| `selectedClass` | `string` | — | Override de la classe sélectionnée. |

**Slot scope** : `{ isSelected, selectedClass, toggle, select, value, disabled }`.

**Erreur** : si utilisé hors `OrigamItemGroup`, throw `'[Origam] <OrigamItem> must be used inside an <OrigamItemGroup>'`.

---

## OrigamBottomNav

**Fichier** : `packages/ds/src/components/BottomNav/OrigamBottomNav.vue`

**Rôle** : Barre de navigation inférieure fixe. Intègre `useLayoutItem` (position `bottom`). Gère sa propre visibilité via `useActive(props, 'modelValue')` et anime l'entrée/sortie via `OrigamTransition` (défaut : `OrigamTranslateBottom`). Délègue la sélection active à `useGroup(ORIGAM_BTN_TOGGLE_KEY)`.

### Entrées (props)

`IBottomNavProps` étend : `ITagProps`, `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`, `IPaddingProps`, `IBorderProps`, `IElevationProps`, `IMarginProps`, `IDimensionProps`, `IDensityProps`, `IRoundedProps`, `ILayoutItemProps`, `IGroupProps`, `IHoverProps`, `ITransitionComponentProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'nav'` | Élément racine. |
| `modelValue` | `boolean` | `true` | Visible/caché. |
| `name` | `string` | `'bottom-navigation'` | Identifiant dans le layout. |
| `mode` | `TMode` | `MODE.VERTICAL` | `'horizontal'`, `'vertical'`, `'shift'`. |
| `grow` | `boolean` | — | Les boutons s'étendent (`flex-grow: 1`). |
| `items` | `Array<IBtnProps>` | `[]` | Boutons prédéfinis. |
| `height` | `number \| string` | — | Hauteur custom (défaut calculé à 48px). |
| `selectedClass` | `string` | `'origam-bottom-nav__btn--selected'` | Classe du bouton actif. |
| `color`, `bgColor`, `hover`, `active` | — | — | Propagés aux `OrigamBtn` enfants via `slotDefaults`. |
| `density`, `rounded`, `border`, `elevation`, `padding*`, `margin*` | — | — | Via interfaces Commons. |
| `transition` | `TTransitionProps` | `{ component: OrigamTranslateBottom }` | Transition slide-up. |

### Sorties

**Emits** : `IBottomNavEmits` étend `ICommonsComponentEmits`, `IActiveEmits`, `IHoverEmits`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | — | Contenu (les `OrigamBtn`). |
| `item` | `{ props, index }` | Remplace chaque bouton. |
| `item.${index}` | `{ props }` | Remplace le bouton à la position `index`. |

### Comportement notable

**Mode vertical** (`MODE.VERTICAL`) : les boutons empilent icône + label (grille `prepend / content / append`). Défaut car le mode matériel "bottom navigation" standard présente icon + label verticaux.

**Mode shift** : les labels des boutons non sélectionnés se translatent de `0.5rem` vers le bas et passent en opacité 0 (shift effect).

**Couleur container vs buttons** : `useStateEffect` reçoit `ref(false)` pour `isHover` et `isActive` afin que le fond de la barre ne s'assombrisse pas en hover — seuls les boutons enfants reçoivent les états visuels via `slotDefaults`.

**Height** : si `props.height` est fourni, soustrait 8px en mode compact. Layout `layoutSize = isActive ? height : 0`.

**Classe `--active`** : alias de `modelValue` (visible), pas d'état "pressé".

### Dépendances

- **Composables** : `useActive`, `useDensity`, `useGroup`, `useHover`, `useLayoutItem`, `useProps`, `useSsrBoot`, `useStateEffect`, `useStyle`.
- **Consts** : `ORIGAM_BTN_TOGGLE_KEY`.
- **Composants** : `OrigamBtn`, `OrigamDefaultsProvider`, `OrigamTransition`, `OrigamTranslateBottom`.
- **Types** : `TMode`.
- **Enums** : `MODE`.

---

## OrigamCarousel

**Fichier** : `packages/ds/src/components/Carousel/OrigamCarousel.vue`

**Rôle** : Carrousel d'images/slides avec défilement automatique (`cycle`), délimiteurs (points) et barre de progression. Délègue la logique de slides à `OrigamWindow`.

### Entrées (props)

`ICarouselProps` étend `IWindowProps`, `IColorProps`, `ICommonsComponentProps`, `ITagProps`, `IDimensionProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `height` | `number \| string` | `500` | Hauteur du carrousel (px). |
| `cycle` | `boolean` | — | Défilement automatique. |
| `interval` | `number \| string` | `6000` | Durée entre slides (ms). |
| `delimiterIcon` | `TIcon` | `MDI_ICONS.CIRCLE` | Icône des délimiteurs. |
| `hideDelimiters` | `boolean` | — | Masque les points de navigation. |
| `hideDelimiterBackground` | `boolean` | — | Masque le fond de la zone délimiteurs. |
| `progress` | `boolean` | — | Affiche une barre de progression temps-réel. |
| `verticalDelimiters` | `boolean \| TInline` | — | Place les délimiteurs verticalement (`left` ou `right`). |
| `continuous` | `boolean` | `true` | Bouclage circulaire. |
| `mandatory` | `boolean` | `true` | Toujours un slide actif. |
| `showArrows` | `boolean` | `true` | Affiche les flèches. |
| Toutes `IWindowProps` | — | — | Transmises via `windowProps`. |

### Sorties

**Emits** : `ICarouselEmits` étend `ICommonsComponentEmits`.

**Slots** :

| Nom | Scope | Description |
|---|---|---|
| `default` | `group` | Contenu (les `OrigamCarouselItem`). |
| `additional` | `group` | Remplace les délimiteurs et la progress bar. |
| `item` | `{ props, item, index }` | Remplace chaque délimiteur. |
| `item.${index}` | `{ props, item }` | Remplace le délimiteur à la position `index`. |
| `progress` | `{ percent }` | Remplace la barre de progression. |
| `prev`, `next`, `arrows` | — | Transmis à `OrigamWindow`. |

### Comportement notable

**Cycle timer** : `startTimeout()` appelle `origamWindowRef.value.group.next` après `interval` ms. Redémarré par un `watch` sur `model` et `interval`. Annulé à `onBeforeUnmount`. **`prefers-reduced-motion`** : si la media query est active, le cycle est désactivé (`prefersReducedMotion()` retourne `true` → `startTimeout` no-op).

**Progress bar** : basée sur `requestAnimationFrame`. `progressPercent` monte de 0 à 100 sur `interval` ms. Réinitialisée à chaque changement de slide.

**Délimiteurs** : chaque délimiteur est un `OrigamBtn` avec `icon=delimiterIcon`, `size=SIZES.SMALL`, `density=DENSITY.COMPACT`, `active=group.isSelected(item.id)`.

**Position** : `height` appliqué via `{ height: convertToUnit(props.height) }` en style inline.

### Dépendances

- **Composables** : `useLocale`, `useProps`, `useStyle`, `useVModel`.
- **Utils** : `convertToUnit`.
- **Composants** : `OrigamBtn`, `OrigamProgressLinear`, `OrigamWindow`.

---

### OrigamCarouselItem

**Fichier** : `packages/ds/src/components/Carousel/OrigamCarouselItem.vue`

**Rôle** : Slide individuel d'un carrousel. Délègue à `OrigamWindowItem` (pour le groupe/transition) et à `OrigamImg` (pour l'image). Les props sont filtrées et dispatched via `filterProps`.

**Slots** : `default` (remplace `OrigamImg`), `content`, `error`, `placeholder` (transmis à `OrigamImg`).

---

## OrigamSlideGroup

**Fichier** : `packages/ds/src/components/Slide/OrigamSlideGroup.vue`

**Rôle** : Groupe de slides avec scroll horizontal/vertical et flèches affix. Utilisé notamment comme base pour des composants avec scroll overflow. Supporte la sélection via `useGroup(ORIGAM_SLIDE_GROUP_KEY)`.

### Entrées (props)

`ISlideGroupProps` étend : `ICommonsComponentProps`, `ITagProps`, `IDirectionProps`, `IGroupProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `IBorderProps`, `IDisplayProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `direction` | `DIRECTION` | `DIRECTION.HORIZONTAL` | Axe de scroll. |
| `prevIcon` | `TIcon` | `MDI_ICONS.CHEVRON_LEFT` | Icône affix précédent. |
| `nextIcon` | `TIcon` | `MDI_ICONS.CHEVRON_RIGHT` | Icône affix suivant. |
| `showArrows` | `boolean \| string` | — | `true`, `false`, `'always'`, `'desktop'`, `'mobile'`. |
| `centerActive` | `boolean` | — | Centre l'item sélectionné. |
| `selectedClass` | `string` | `'origam-slide-group-item--active'` | Classe de l'item actif. |
| props de groupe | — | — | Via `IGroupProps`. |

### Comportement notable

**Overflow detection** : `useResizeObserver` sur `containerRef` et `contentRef`. `isOverflowing = containerSize < contentSize`.

**Scroll to active** : `scrollToChildren(selectedElement, centerActive)`. Utilise `calculateUpdatedTarget` ou `calculateCenteredTarget` (utils). `useGoTo.horizontal` pour le scroll animé (easing `easeOutQuart`, 200ms).

**RTL** : dans `scrollToPosition`, si `isRtl && isHorizontal`, la position est inversée par `(scrollWidth - containerWidth) - newPosition`.

**Affixes** : `hasPrev = |scrollOffset| > 1`, `hasNext = (scrollSize - clientSize) - |scrollOffset| > 1`. La classe `--disabled` est appliquée quand l'affix n'est pas disponible. Les flèches sont rendues dans `OrigamFade` pour un fondu d'apparition.

**Navigation clavier** : `ArrowLeft/Right` (horizontal) ou `ArrowUp/Down` (vertical) → `focus('next'/'prev')`. `Home/End` → `focus('first'/'last')`. Parcourt `contentRef.value.children` directement.

**Focus management** : `isFocused`, `handleFocusin` scrolle automatiquement vers l'enfant focalisé. Le tabindex racine passe à `-1` quand le groupe a une sélection ou le focus.

### Dépendances

- **Composables** : `useBorder`, `useDisplay`, `useGoTo`, `useGroup`, `useMargin`, `usePadding`, `useProps`, `useResizeObserver`, `useRounded`, `useRtl`, `useStyle`.
- **Consts** : `IN_BROWSER`, `ORIGAM_SLIDE_GROUP_KEY`.
- **Utils** : `calculateCenteredTarget`, `calculateUpdatedTarget`, `focusableChildren`, `getClientSize`, `getOffsetSize`, `getScrollPosition`, `getScrollSize`.
- **Composants** : `OrigamFade`, `OrigamIcon`.

---

## Accordéon

### OrigamExpansionPanels

**Fichier** : `packages/ds/src/components/ExpansionPanel/OrigamExpansionPanels.vue`

**Rôle** : Conteneur de panneaux accordéon. Orchestre la sélection via `useGroup(ORIGAM_EXPANSION_PANEL_KEY)`. Propage `density`, `color`, `bgColor`, `rounded`, `border` aux panels enfants via `slotDefaults`. Supporte les modes `accordion`, `popout`, `inset`, `flat`.

#### Entrées (props)

`IExpansionPanelsProps` étend : `IColorProps`, `IBgColorProps`, `ITagProps`, `ICommonsComponentProps`, `IGroupProps`, `IDensityProps`, `IRoundedProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `ILazyProps`, `ILoaderProps`, `IElevationProps`, `IActiveProps`, `IHoverProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Élément racine. |
| `items` | `Array<IExpansionPanelProps>` | — | Panels prédéfinis. |
| `flat` | `boolean` | — | Supprime la box-shadow (`.origam-expansion-panel__shadow`). |
| `accordion` | `boolean` | — | Pas d'écart entre les panels. Radii supprimés sur les bords internes. |
| `popout` | `boolean` | — | Le panel actif s'élargit (max-width augmente de 16px). |
| `inset` | `boolean` | — | Le panel actif se rétrécit (max-width diminue de 32px). |
| `expandIcon`, `collapseIcon` | `TIcon` | — | Icônes de l'en-tête. Propagées aux panels. |
| `hideActions` | `boolean` | — | Masque les icônes d'expand/collapse. |
| Toutes props de groupe et visuelles | — | — | Via interfaces Commons. |

#### Sorties

**Emits** : `IExpansionPanelsEmits` étend `ICommonsComponentEmits`.

**Slots** (permettant un override total ou partiel de chaque panel) :

| Nom | Scope | Description |
|---|---|---|
| `default` | — | Remplace intégralement la liste. |
| `item` | `{ collapseIcon, expandIcon, hideActions, item, index }` | Remplace un panel. |
| `item.${index}` | idem | Remplace le panel à la position index. |
| `header`, `header.${index}` | `headerSlotProps` | Remplace l'en-tête. |
| `title`, `title.${index}` | `titleSlotProps` | Remplace le titre. |
| `prepend`, `prepend.${index}` | `prependSlotProps` | Prépend icon/avatar. |
| `append`, `append.${index}` | `appendSlotProps` | Append icon/avatar. |
| `wrapper`, `wrapper.${index}` | `wrapperSlotProps` | Remplace le wrapper de contenu. |
| `content`, `content.${index}` | — | Contenu du panel. |

#### Dépendances

- **Composables** : `useActive`, `useBothColor`, `useDensity`, `useGroup`, `useHover`, `useLoader`, `useProps`, `useStateEffect`, `useStyle`.
- **Consts** : `ORIGAM_EXPANSION_PANEL_KEY`.
- **Composants** : `OrigamDefaultsProvider`, `OrigamExpansionPanel`.

---

### OrigamExpansionPanel

**Fichier** : `packages/ds/src/components/ExpansionPanel/OrigamExpansionPanel.vue`

**Rôle** : Panel accordéon individuel. S'enregistre dans `ORIGAM_EXPANSION_PANEL_KEY`. Calcule `isBeforeSelected` / `isAfterSelected` pour les radii CSS contextuels. Gère un loader (line/circular/skeleton). Structure : `shadow` + `loader` + `header` (via `OrigamExpansionPanelHeader`) + `content` (via `OrigamExpansionPanelContent`).

#### Entrées (props)

`IExpansionPanelProps` étend : `ITagProps`, `ICommonsComponentProps`, `IDensityProps`, `IColorProps`, `IBgColorProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IElevationProps`, `IRoundedProps`, `IGroupItemProps`, `IExpansionPanelHeaderProps`, `IExpansionPanelContentProps`, `ILazyProps`, `ILoaderProps`, `IActiveProps`, `IHoverProps`.

Principales props issues de `IExpansionPanelHeaderProps` (transmises au header) :

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Titre du panel. |
| `expandIcon` | `TIcon` | Icône "déplier". |
| `collapseIcon` | `TIcon` | Icône "replier". |
| `hideActions` | `boolean` | Masque les icônes. |
| `readonly` | `boolean` | Empêche l'ouverture/fermeture. |

**Props loader** (via `ILoaderProps`) : `loading`, `loaderType`, `loaderValue`, etc.

#### Comportement notable

**Résolution des props** : `useDefaults(_props)` applique les valeurs injectées par `OrigamExpansionPanels`.

**Position relative** : `isBeforeSelected` et `isAfterSelected` permettent au SCSS parent de masquer les diviseurs `::after` corrects (pas de diviseur entre deux panels quand l'un est ouvert).

**Loader** : `useLoader(props, 'line')` retourne `loaderClasses` et `loaderConfig`. `hasLoading = slots.loader || loaderConfig.value.isActive`. Le composant `OrigamProgress` est rendu avec `type=LINEAR` ou `CIRCULAR` selon `loaderConfig.kind`.

**Shadow** : `.origam-expansion-panel__shadow` est un pseudo-élément absolu avec `box-shadow: var(--origam-shadow---sm)`. La classe `--flat` (propagée depuis le parent) le masque via `display: none`.

**États CSS** : `--active`, `--before-active`, `--after-active`, `--disabled`. La classe `--active` espace le panel avec `margin-top: 16px` et augmente la hauteur min du header à 64px.

**Transition** : délégée à `OrigamExpansionPanelContent` (contenu animé via `<Transition>`). La durée par défaut est `0.3s cubic-bezier(0.4, 0, 0.2, 1)`.

#### Dépendances

- **Composables** : `useActive`, `useBothColor`, `useDefaults`, `useDensity`, `useGroupItem`, `useHover`, `useLoader`, `useProps`, `useStateEffect`, `useStyle`.
- **Consts** : `ORIGAM_EXPANSION_PANEL_KEY`.
- **Enums** : `PROGRESS_TYPE`.
- **Composants** : `OrigamExpansionPanelContent`, `OrigamExpansionPanelHeader`, `OrigamProgress`.

---

## Tableau récapitulatif

| Composant | Composables clés | Interfaces principales | Consts / injection keys |
|---|---|---|---|
| `OrigamBreadcrumb` | `useStateEffect`, `useDensity`, `useLocale` | `IBreadcrumbProps`, `IBreadcrumbItemProps` | `provideDefaults` (pas de key dédiée) |
| `OrigamBreadcrumbItem` | `useActive`, `useAdjacent`, `useDefaults`, `useHover`, `useLink`, `useStateEffect` | `IBreadcrumbItemProps` | — |
| `OrigamBreadcrumbDivider` | `useBothColor`, `useSize`, `useDensity` | `IBreadcrumbDividerProps` | `MDI_ICONS` |
| `OrigamTabs` | `useGroup`, `useDensity`, `useRounded` | `ITabsProps` | `ORIGAM_TABS_KEY` |
| `OrigamTab` | `useDefaults`, `useGroupItem` | `ITabProps` | `ORIGAM_TABS_KEY`, `ORIGAM_TAB_PANELS_KEY` |
| `OrigamTabPanels` | `useGroup` | `ITabPanelsProps` | `ORIGAM_TAB_PANELS_KEY`, `ORIGAM_TAB_PANELS_CTX_KEY` |
| `OrigamTabPanel` | `useGroupItem`, `useLazy` | `ITabPanelProps` | `ORIGAM_TAB_PANELS_KEY`, `ORIGAM_TABS_KEY` |
| `OrigamStepper` | `useDensity`, `useDimension`, `useSize`, `useStateEffect` | `IStepperProps`, `IStepperItem`, `IStepperProvide` | `ORIGAM_STEPPER_KEY` |
| `OrigamStepperItem` | `useProps` (inject uniquement) | `IStepperItemProps` | `ORIGAM_STEPPER_KEY` |
| `OrigamPagination` | `useVModel`, `useDisplay`, `useResizeObserver`, `useRefs`, `useDensity`, `useSize` | `IPaginationProps` | `KEYBOARD_VALUES`, `MDI_ICONS` |
| `OrigamMenu` | `useBothColor`, `useStateEffect`, `useVModel`, `useScopeId` | `IMenuProps`, `IMenuProvide` | `ORIGAM_MENU_KEY` |
| `OrigamContextualMenu` | `useVModel` | `IContextualMenuProps` | — (délègue à `OrigamMenu`) |
| `OrigamCommandPalette` | `useCommand`, `useHotkey`, `useVModel` | `ICommandPaletteProps`, `ICommand` | `COMMAND_PALETTE_DEFAULT_HOTKEY`, `IN_BROWSER` |
| `OrigamDrawer` | `useBackgroundColor`, `useLayoutItem`, `useTouch`, `useStateEffect`, `useSsrBoot`, `useRouter` | `IDrawerProps` | — (layout system) |
| `OrigamWindow` | `useGroup`, `useLocale` | `IWindowProps`, `IWindowProvide` | `ORIGAM_WINDOW_GROUP_KEY`, `ORIGAM_WINDOW_KEY` |
| `OrigamWindowItem` | `useGroupItem`, `useLazy`, `useSsrBoot` | `IWindowItemProps` | `ORIGAM_WINDOW_GROUP_KEY`, `ORIGAM_WINDOW_KEY` |
| `OrigamItemGroup` | `useGroup` | `IItemGroupProps`, `IItemGroupItemProps` | `ORIGAM_ITEM_GROUP_KEY` |
| `OrigamItem` | `useGroupItem` | `IItemGroupItemProps` | `ORIGAM_ITEM_GROUP_KEY` |
| `OrigamBottomNav` | `useActive`, `useGroup`, `useLayoutItem`, `useStateEffect`, `useSsrBoot` | `IBottomNavProps` | `ORIGAM_BTN_TOGGLE_KEY` |
| `OrigamCarousel` | `useVModel`, `useLocale` | `ICarouselProps` | — (délègue à `OrigamWindow`) |
| `OrigamCarouselItem` | `useProps` | `ICarouselItemProps` | — (délègue à `OrigamWindowItem`) |
| `OrigamSlideGroup` | `useGroup`, `useDisplay`, `useGoTo`, `useResizeObserver`, `useRtl` | `ISlideGroupProps` | `ORIGAM_SLIDE_GROUP_KEY` |
| `OrigamExpansionPanels` | `useGroup`, `useBothColor`, `useStateEffect`, `useLoader` | `IExpansionPanelsProps` | `ORIGAM_EXPANSION_PANEL_KEY` |
| `OrigamExpansionPanel` | `useDefaults`, `useGroupItem`, `useBothColor`, `useLoader`, `useStateEffect` | `IExpansionPanelProps` | `ORIGAM_EXPANSION_PANEL_KEY` |
