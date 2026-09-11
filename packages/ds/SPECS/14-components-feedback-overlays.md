# Composants Feedback & Overlays — Spec technique

> Source : lecture du code réel, branche `feature/marketing-v5-phase1`, date 2026-06-01.
> Chaque affirmation est issue du fichier `.vue`, de l'interface `.interface.ts`, du composable ou de la constante référencés — aucune invention.

---

## Introduction

Cette famille regroupe deux grandes catégories de composants :

1. **Feedback inline** — composants qui s'affichent _dans_ le flux du document sans couche d'overlay : `Alert`, `Messages`, `Loader`, `Progress`, `Skeleton`, `EmptyState`, `ConfirmWrapper`.
2. **Overlays flottants** — composants qui s'affichent _au-dessus_ du document dans un portail Teleport géré par la pile globale `GLOBAL_STACK` : `Overlay` (primitive de base), `Snackbar`, `Dialog`, `Tooltip`. Le composant `Picker` se situe entre les deux : il est un panneau de saisie structuré qui, dans les usages DatePicker / ColorPicker, est placé à l'intérieur d'un overlay.

### Mécanique commune des overlays

#### `useStack` — pile de z-index globale

Fichier : `packages/ds/src/composables/Commons/stack.composable.ts`
Constante globale : `GLOBAL_STACK` (`reactive<Array<[uid, zIndex]>>`) dans `packages/ds/src/consts/Commons/stack.const.ts`.

Chaque overlay actif s'enregistre dans `GLOBAL_STACK` à l'ouverture (`isActive = true`) et s'en retire à la fermeture via `onScopeDispose`. La valeur de `zIndex` est calculée de manière incrémentale : `lastZIndex + 10` par rapport au dernier overlay de la pile. Cette règle garantit que le dernier overlay ouvert est toujours visuellement au-dessus.

Deux drapeaux sont exposés :
- `globalTop` — `true` si l'overlay est le **dernier** élément du tableau `GLOBAL_STACK`. Sert à décider si la touche Echap ou le clic sur le scrim doit fermer _cet_ overlay en particulier.
- `localTop` — `true` si aucun overlay enfant de l'arbre de provide/inject ne possède d'enfants actifs (`stack.activeChildren.size === 0`).

`disableGlobalStack: true` court-circuite l'inscription dans `GLOBAL_STACK`. `Snackbar` et `Tooltip` utilisent ce flag : ils ne doivent pas bloquer la fermeture d'autres overlays par Echap.

#### `useTeleport` — résolution du portail

Fichier : `packages/ds/src/composables/Commons/teleport.composable.ts`

Prend un `Ref<boolean | string | Element>` (la prop `attach` ou `contained`). Retourne `teleportTarget` :
- `attach = false` ou `attach` absent → téléporte dans `document.body`, sous un `<div class="origam-overlay-container">` créé automatiquement s'il n'existe pas.
- `attach = true` / SSR → `undefined` → le `<Teleport>` natif est désactivé (`disabled`).
- `attach = "#my-el"` / Element → téléporte à l'intérieur de cet élément.

#### `useActivator` — déclencheur de l'overlay

Fichier : `packages/ds/src/composables/Commons/activator.composable.ts`

Gère la relation activateur ↔ contenu. Consomme `IActivatorProps` (qui regroupe `activator`, `openOnClick`, `openOnHover`, `openOnFocus`, `openOnContextMenu`, `closeDelay`, `openDelay`, etc.). Délègue le calcul des délais à `useDelay`.

Retourne :
- `activatorEl` — référence à l'élément DOM déclencheur.
- `activatorEvents` — objet d'événements (`onClick`, `onMouseenter`, `onMouseleave`, `onFocus`, `onBlur`, `onContextmenu`) sélectionnés selon les props.
- `contentEvents` — événements à placer sur le panneau de contenu (maintient `isHovered` / `isFocused` pendant que la souris est dans le contenu).
- `scrimEvents` — événements à placer sur le scrim pour les hover-overlays.
- `target` / `targetEl` — position de référence pour la stratégie de positionnement.

#### `useDelay` — délais d'ouverture / fermeture

Fichier : `packages/ds/src/composables/Commons/delay.composable.ts`

Wraps `defer()` (utilitaire interne). Expose `runOpenDelay()` et `runCloseDelay()`. Les deux annulent tout timer précédent avant de lancer le nouveau. Utilisé par `useActivator` pour `openDelay` / `closeDelay`.

#### `useActive` — état ouvert / fermé (v-model)

Fichier : `packages/ds/src/composables/Commons/active.composable.ts`

Pont v-model générique. Accepte `props.active` / `props.modelValue` sous trois formes : `boolean`, `undefined`, ou objet `IActiveState` `{color?, bgColor?, enabled?, ...}`. Dans le cas objet, `isActive` est piloté par un toggle interne ; `onActive()` bascule cet interne. Retourne `isActive`, `activeClasses` (ajoute `{name}--active`), `activeState`.

#### `useLazy` — montage paresseux du contenu

Fichier : `packages/ds/src/composables/Commons/lazy.composable.ts`

Contrôle quand le slot `#default` de l'overlay est injecté dans le DOM. `hasContent` devient `true` dès que l'overlay est actif ou que `eager: true`. `onAfterLeave()` remet `isBooted` à `false` si `eager` est absent, provoquant un démontage du contenu après l'animation de fermeture.

#### Règle « surface BEM child, never teleport root »

Les classes utilitaires de couleur (`.origam--bg-primary`, etc.) et les styles inline de couleur/bg/border doivent être placés sur l'élément de **surface visible** du composant (ex. `.origam-snackbar__wrapper`, `.origam-tooltip__content`, `.origam-overlay__content`), jamais sur la racine du portail `<div class="origam-overlay">` qui couvre `position: fixed; left: 0; top: 0; right: 0; bottom: 0`. Peindre la racine du portail équivaut à colorier l'intégralité de la surface de la page.

Dans `OrigamSnackbar`, les classes de couleur (`colorClasses`) et styles (`colorStyles`) sont injectés dans `contentProps`, lesquels atterrissent sur `.origam-snackbar__wrapper` via `overlayContentClasses`. Dans `OrigamTooltip`, `colorClasses` est appliqué sur `.origam-tooltip__content`.

---

## Composants

### `OrigamAlert`

**Fichier** : `packages/ds/src/components/Alert/OrigamAlert.vue`
**Interface** : `packages/ds/src/interfaces/Alert/alert.interface.ts`

#### Rôle

Bloc de notification inline (succès, info, avertissement, erreur). N'utilise pas d'overlay — il s'insère directement dans le flux du document. Peut être fermé (`closable`) ou se positionner en `fixed` / `absolute` / `sticky`.

#### Entrées (props)

`IAlertProps` étend : `ICommonsComponentProps`, `ITagProps`, `IColorProps`, `IBgColorProps`, `IBorderProps`, `IDimensionProps`, `IPaddingProps`, `IMarginProps`, `IDensityProps`, `IElevationProps`, `ILocationProps`, `IPositionProps`, `IRoundedProps`, `IStatusProps`, `IHoverProps`, `IAdjacentProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `closable` | `boolean` | — | Affiche le bouton de fermeture |
| `closeIcon` | `TIcon` | `MDI_ICONS.CLOSE` | Icône du bouton de fermeture |
| `closeLabel` | `string` | `'origam.close'` | Label i18n du bouton (aria-label) |
| `modelValue` | `boolean` | `true` | Contrôle la visibilité (v-model) |
| `title` | `string` | — | Titre affiché dans l'en-tête |
| `text` | `string` | — | Corps textuel |
| `status` | `TStatus` | — | `success \| info \| warning \| error` — pilote la couleur de fond via les tokens `--origam-alert--{status}---bg/fg` et le role ARIA |

`tag` par défaut : `'div'`. `density` par défaut : `DENSITY.DEFAULT`. `hover` par défaut : `true`.

#### Sorties

**Emits** : `IAlertEmits` = `ICommonsComponentEmits + IClickCloseEmits + IHoverEmits`.
- `click:close` (MouseEvent) — clic sur le bouton fermer
- `update:modelValue` (boolean) — fermeture par `onActive()`

**Slots** :

| Slot | Description |
|---|---|
| `wrapper` | Remplace l'intégralité du contenu interne |
| `prepend` | Zone de gauche (avatar ou icône) |
| `title` | Titre — fallback sur prop `title` |
| `text` | Corps — fallback sur prop `text` |
| `default` | Contenu libre en dessous du corps |
| `append` | Zone de droite (avatar ou icône) |
| `close` | Remplacement du bouton fermer |

**Classes** : `origam-alert`, `origam-alert--{status}`, classes de hover (`origam-alert--hover`), active (`origam-alert--active`), density, border, padding, margin, elevation, position, rounded, couleur.

**Styles** : `dimensionStyles`, `colorStyles`, `locationStyles`, `borderStyles`, `paddingStyles`, `marginStyles`, `roundedStyles`, `positionStyles`, `elevationStyles`.

#### Dépendances

| Type | Nom |
|---|---|
| Composable | `useActive(props, 'modelValue')` — gère l'état ouvert/fermé via `modelValue` |
| Composable | `useHover(props)` — survol |
| Composable | `useStateEffect(props, isHover, isActive, hoverState, activeState)` — couleur/border/rounded/elevation/padding/margin |
| Composable | `useStatus(props)` — résout `icon`, `prependIcon`, `appendIcon`, `statusClasses` selon `status` + `statusIconPosition` |
| Composable | `useAdjacent(props, prependIcon, appendIcon)` — logique prepend/append |
| Composable | `useDensity`, `useDimension`, `useLocation`, `usePosition`, `useStyle`, `useLocale` |
| Composant | `OrigamAvatar`, `OrigamBtn`, `OrigamIcon` |
| Interface | `IAlertProps`, `IAlertEmits` |

#### Comportement notable

**ARIA / sémantique** : `role` est `"alert"` pour `status === 'warning'` ou `status === 'error'` (flux assertif), `"status"` dans les autres cas. `aria-live` suit la même logique : `"assertive"` pour warning/error, `"polite"` pour info/success.

**classes-first** : `colorClasses` émet `.origam--bg-{intent}` au repos. `useStateEffect` retourne `colorClasses=[]` lors du survol / état actif — la couleur passe alors par `colorStyles` (inline). L'alerte ne peut donc pas être testée sur la classe utilitaire lors d'un hover.

**Grille CSS** : layout `display: grid` à quatre colonnes (`prepend content append close`).

**Token-driven** : tous les espacements, couleurs de statut, border-radius passent par les variables `--origam-alert---*` et `--origam-alert--{status}---bg/fg`. Fallback sur les primitives `--origam-color__feedback--{status}---bg/fg`.

#### Exemple d'usage

```vue
<origam-alert
  v-model="alertVisible"
  status="warning"
  title="Attention"
  text="Votre session expire dans 5 minutes."
  closable
/>
```

---

### `OrigamMessages`

**Fichier** : `packages/ds/src/components/Messages/OrigamMessages.vue`
**Interface** : `packages/ds/src/interfaces/Messages/messages.interface.ts`

#### Rôle

Composant de rendu de liste de messages de feedback liés à un champ de formulaire (erreurs de validation, hints, helpers). Utilisé par `OrigamField`, `OrigamConfirmWrapper`, etc. Non lié à un overlay.

#### Entrées (props)

`IMessagesProps` étend : `ICommonsComponentProps`, `ITagProps`, `ITransitionComponentProps`, `IColorProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IRoundedProps`, `IDensityProps`, `IElevationProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `active` | `boolean` | — | Contrôle la visibilité du bloc |
| `messages` | `Array<string> \| string` | — | Un message ou tableau de messages |
| `transition` | `TTransitionProps` | `{component: OrigamSlideY}` | Transition d'entrée/sortie |

`tag` par défaut : `'div'`. `density` par défaut : `DENSITY.DEFAULT`.

#### Sorties

**Slots** :

| Slot | Description |
|---|---|
| `default` | Reçoit `{message: string}` — permet de personnaliser le rendu de chaque message |

**Classes** : `origam-messages`, classes de couleur (`textColorClasses`), density, rounded, border, padding, margin.

**Styles** : `roundedStyles`, `borderStyles`, `paddingStyles`, `marginStyles`, `textColorStyles`.

#### Dépendances

| Type | Nom |
|---|---|
| Composable | `useTextColor(toRef(props, 'color'))` |
| Composable | `useRounded`, `useBorder`, `usePadding`, `useMargin`, `useDensity`, `useSsrBoot` |
| Composable | `useDefaults(_props)` — consomme les defaults injectés par le parent |
| Composant | `OrigamTransition`, `OrigamSlideY` (transition par défaut) |
| Utilitaire | `toKebabCase(message)` — pour générer les `id` des messages individuels |
| Utilitaire | `wrapInArray(props.messages)` — normalise en tableau |

#### Comportement notable

**ARIA** : `role="status"` + `aria-live="polite"` sur le conteneur. Les lecteurs d'écran annoncent les messages au fil de leur injection.

**SSR** : `useSsrBoot()` fournit `isBooted` qui est `false` côté serveur, désactivant la transition pour éviter un décalage d'hydratation (`<OrigamTransition :disabled="!isBooted">`).

**ID des messages** : chaque `<div class="origam-messages__message">` reçoit un `id` construit comme `` `${index}-${toKebabCase(message)}` `` — ce `id` peut être référencé par `aria-describedby` sur le champ parent.

#### Exemple d'usage

```vue
<origam-messages
  :id="messagesId"
  :active="hasMessages"
  :messages="['Ce champ est requis']"
/>
```

---

### `OrigamOverlay`

**Fichier** : `packages/ds/src/components/Overlay/OrigamOverlay.vue`
**Interface** : `packages/ds/src/interfaces/Overlay/overlay.interface.ts`

#### Rôle

Primitive de base pour **tous les composants flottants** du design system (Dialog, Snackbar, Tooltip, Menu, ContextualMenu, ColorPicker, DatePicker, Select, Drawer…). Orchestre le portail Teleport, la pile de z-index, l'activation, le scrim, les stratégies de positionnement et de scroll, et la gestion clavier.

#### Entrées (props)

`IOverlayProps` étend : `ICommonsComponentProps`, `IDimensionProps`, `IActivatorProps`, `ILocationStrategyProps`, `IScrollStrategyProps`, `ILazyProps`, `ITransitionComponentProps`, `IScrimProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | v-model ouvert/fermé |
| `attach` | `boolean \| string \| Element` | — | Cible de téléportation |
| `absolute` | `boolean` | — | Position absolute sur l'overlay root |
| `contained` | `boolean` | — | Overlay contenu dans son parent, scrim en absolute |
| `zIndex` | `number \| string` | `2000` | z-index de base |
| `disableGlobalStack` | `boolean` | — | Ne s'inscrit pas dans GLOBAL_STACK |
| `persistent` | `boolean` | — | Clic extérieur : bounce au lieu de fermer |
| `noClickAnimation` | `boolean` | — | Désactive l'animation de bounce |
| `closeOnBack` | `boolean` | `true` | Intercept bouton retour navigateur |
| `scrim` | `boolean \| string` | `true` | Affiche le fond semi-transparent ; string = couleur custom |
| `openOnClick` | `boolean` | `true` | Ouvre au clic sur l'activateur |
| `locationStrategy` | — | `LOCATION_STRATEGIES.STATIC` | `'static' \| 'connected'` |
| `scrollStrategy` | — | `SCROLL_STRATEGIES.BLOCK` | `'block' \| 'close' \| 'none' \| 'reposition'` |
| `viewportMargin` | `number` | `12` | Marge viewport pour la stratégie connected |
| `transition` | `TTransitionProps` | `{component: OrigamFade}` | Transition du contenu |
| `contentClass` | `string \| string[]` | — | Classes supplémentaires sur `.origam-overlay__content` |
| `contentProps` | `any` | — | Props arbitraires sur `.origam-overlay__content` |
| `disabled` | `boolean` | — | Empêche l'ouverture, force la fermeture si ouvert |

#### Sorties

**Emits** : `IOverlayEmits` = `ICommonsComponentEmits + IClickOutsideEmits + afterEnter + afterLeave + keydown`.

**Slots** :

| Slot | Scoped data | Description |
|---|---|---|
| `activator` | `{isActive, props}` | Élément déclencheur — mergeProps à appliquer sur l'activateur |
| `default` | `{isActive}` | Contenu de l'overlay |

**Expose** : `activatorEl`, `scrimEl`, `target`, `animateClick`, `contentEl`, `globalTop`, `localTop`, `updateLocation`, `filterProps`.

**Classes** : `origam-overlay`, `origam-overlay--absolute`, `origam-overlay--active`, `origam-overlay--contained`, classes RTL.
**Styles** : `stackStyles` (z-index dynamique), scroll offset compensation.

#### Dépendances

| Type | Nom |
|---|---|
| Composable | `useStack(isActive, zIndex, disableGlobalStack)` — z-index pile |
| Composable | `useTeleport(attach \| contained)` — résolution du portail |
| Composable | `useActivator(props, {isActive, isTop})` — activateur |
| Composable | `useLazy(props, isActive)` — montage paresseux |
| Composable | `useLocationStrategies(props, {contentEl, target, isActive})` — positionnement |
| Composable | `useScrollStrategies(props, {root, contentEl, targetEl, isActive, updateLocation})` — gestion scroll |
| Composable | `useHydration()` — retourne `isMounted` pour éviter le rendu SSR |
| Composable | `useScopeId()` — injection de l'attribut de scope Vue dans le portail |
| Composable | `useVModel(props, 'modelValue')` — pont v-model |
| Composable | `useBackgroundColor` — couleur custom du scrim |
| Composable | `useBackButton(router, fn)` — interception retour navigateur |
| Composable | `useToggleScope` |
| Directive | `v-click-outside` — fermeture au clic extérieur |
| Composant | `OrigamOverlayScrim`, `OrigamTransition`, `OrigamFade` |
| Const | `GLOBAL_STACK`, `IN_BROWSER`, `ORIGAM_STACK_KEY` |
| Enum | `BLOCK`, `EASING`, `KEYBOARD_VALUES`, `LOCATION_STRATEGIES`, `SCROLL_STRATEGIES` |
| Utilitaire | `animate()` (animation de bounce), `convertToUnit()`, `getScrollParent()` |

#### Comportement notable

**Focus / Echap** : `handleKeydown` est attaché à `window` tant que l'overlay est ouvert. Il agit uniquement si `globalTop.value` est `true` (overlay le plus haut de la pile). Si `persistent` : animation de bounce plutôt que fermeture.

**Scroll-lock** : `SCROLL_STRATEGIES.BLOCK` (défaut) bloque le scroll du body et ajoute un padding compensatoire (`padding-inline-end`) pour éviter le saut de mise en page lié à la disparition de la scrollbar. Géré par `useScrollStrategies`.

**SSR** : `isMounted = useHydration()` retourne `false` côté serveur → le `<template v-if="isMounted && hasContent">` empêche tout rendu du portail en SSR, évitant des erreurs de sérialisation.

**Montage paresseux** : avec `eager: false` (défaut), le contenu n'est inséré dans le DOM que lorsque l'overlay s'ouvre pour la première fois, puis démonté après la transition de fermeture via `onAfterLeave`.

**Bounce animation** : `animateClick()` utilise `animate()` (Web Animations API) avec `transform: scale(1.03)` et easing `EASING.STANDARD`, durée 150 ms. Actif si `!noClickAnimation`.

#### Exemple d'usage

```vue
<origam-overlay v-model="open" :scrim="true" persistent>
  <template #activator="{ props }">
    <origam-btn v-bind="props">Ouvrir</origam-btn>
  </template>
  <template #default="{ isActive }">
    <div>Contenu de l'overlay (isActive={{ isActive }})</div>
  </template>
</origam-overlay>
```

---

### `OrigamDialog`

**Fichier** : `packages/ds/src/components/Dialog/OrigamDialog.vue`
**Interface** : `packages/ds/src/interfaces/Dialog/dialog.interface.ts`

#### Rôle

Boîte de dialogue modale. Construit sur `OrigamOverlay` + `OrigamCard`. Implémente le focus trap WCAG, expose un slot `activator`, et supporte des préréglages visuels via `status` (icône dans le header-prepend). Supporte les modes `fullscreen` et `scrollable`.

#### Entrées (props)

`IDialogProps` étend : `ICommonsComponentProps`, `IOverlayProps`, `ICardProps`, `IStatusProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `fullscreen` | `boolean` | — | 100vw × 100vh, border-radius 0 |
| `retainFocus` | `boolean` | `true` | Focus trap actif |
| `scrollable` | `boolean` | — | Active le scroll interne de la card |
| `size` | `TSize` | — | `x-small` / `small` / `default` / `large` / `x-large` — width responsive |
| `openOnClick` | `boolean` | `true` | Override explicite (défaut Vue coerce à false sans ça) |
| `zIndex` | `number` | `2400` | z-index de base (au-dessus des menus à 2000) |
| `origin` | `string` | `'center center'` | Origine de la transition TranslateScale |
| `scrollStrategy` | — | `'block'` | Bloque le scroll du body |
| `transition` | `TTransitionProps` | `{component: OrigamTranslateScale}` | Transition scale depuis le centre |

#### Sorties

**Emits** : `IDialogEmits` = `ICommonsComponentEmits + IClickOutsideEmits + isRead(boolean)`.
- `isRead` (true) : déclenché par `IntersectionObserver` sur un div sentinelle en fin de contenu — pattern "j'ai lu les CGU".

**Slots** :

| Slot | Description |
|---|---|
| `activator` | `{props}` — délégué depuis OrigamOverlay |
| `default` | `{isActive}` — remplace la card entière |
| `loader` | Loader de la card |
| `header` | En-tête complet custom |
| `header-append` | Zone append de l'en-tête (défaut : bouton Fermer) |
| `header-prepend` | Zone prepend (défaut : icône de statut) |
| `header-title` | `{titleId}` — titre avec son `id` pour aria-labelledby |
| `header-subtitle` | Sous-titre |
| `header-content` | Contenu de l'en-tête |
| `asset` | Zone asset de la card |
| `text` | Corps texte de la card |
| `content` | Contenu principal (slot `#default` de la card) |
| `footer` | Pied de dialog |

**Expose** : forwarde tout l'expose d'`OrigamOverlay` via `forwardRefs`.

**Classes** : `origam-dialog`, `origam-dialog--fullscreen`, `origam-dialog--scrollable`, classes de size (`origam-dialog--size-{x-small|small|default|large|x-large}`), classes de statut.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamOverlay` (portail + stack + activateur) |
| Composant | `OrigamCard` (surface visible) |
| Composant | `OrigamBtn` (bouton fermer dans header-append) |
| Composant | `OrigamIcon` (icône de statut) |
| Composant | `OrigamTranslateScale` (transition par défaut) |
| Composable | `useVModel(props, 'modelValue')` |
| Composable | `useScopeId`, `useSize`, `useStatus`, `useStyle`, `useProps` |
| Directive | `v-intersect` — déclenchement `isRead` |
| Utilitaire | `focusableChildren()` — focus trap : sélection des éléments focusables |
| Utilitaire | `forwardRefs()` — transmission de l'expose |
| Utilitaire | `getUid()` — génération de `dialogTitleId` |

#### Comportement notable

**Focus trap** : `handleFocusin` est attaché à `document` via `addEventListener('focusin', …)` lorsque `isActive && retainFocus`. Si le focus sort de `contentEl`, il est renvoyé sur `firstElement` ou `lastElement` selon la direction (Tab / Shift+Tab). À l'ouverture, `contentEl.focus({ preventScroll: true })`. À la fermeture, `activatorEl.focus()`.

**ARIA** : `role="dialog"` et `aria-modal="true"` sur la card. `aria-labelledby` pointe sur l'id unique `origam-dialog-title-{uid}`. L'activateur reçoit `aria-haspopup="dialog"` et `aria-expanded` via `activatorProps`.

**Workaround Boolean coercion** : commentaire documenté dans le code. Sans `openOnClick: true` dans `withDefaults`, Vue 3 coerce la prop manquante à `false`, cassant la chaîne Dialog → Overlay → useActivator.

**Tailles CSS** : chaque `--size-*` classe surcharge `--origam-dialog---width`. La largeur effective est `min(var(--origam-dialog---width, auto), calc(100vw - 48px))`.

**`isRead`** : un `<div ref="endText" v-intersect="handleIntersect">` est inséré à la fin du slot `content`. Dès qu'il devient visible (scroll jusqu'en bas), `emit('isRead', true)` est déclenché — utile pour les dialogs de CGU / onboarding.

#### Exemple d'usage

```vue
<origam-dialog v-model="dialogOpen" size="small" status="warning" :retain-focus="true">
  <template #activator="{ props }">
    <origam-btn v-bind="props">Supprimer le compte</origam-btn>
  </template>
  <template #header-title="{ titleId }">
    <span :id="titleId">Confirmer la suppression</span>
  </template>
  <template #content>
    <p>Cette action est irréversible.</p>
  </template>
  <template #footer>
    <origam-btn @click="dialogOpen = false">Annuler</origam-btn>
    <origam-btn intent="danger" @click="deleteAccount">Supprimer</origam-btn>
  </template>
</origam-dialog>
```

---

### `OrigamSnackbar`

**Fichier** : `packages/ds/src/components/Snackbar/OrigamSnackbar.vue`
**Composant interne** : `OrigamSnackbarItem` (`OrigamSnackbarItem.vue`)
**Interface** : `packages/ds/src/interfaces/Snackbar/snackbar.interface.ts`

#### Rôle

Notification toast non-bloquante à durée de vie limitée. Construit sur `OrigamOverlay` avec `scrim: false`, `disableGlobalStack: true`, `persistent: true`, `scrollStrategy: SCROLL_STRATEGIES.NONE`. Auto-dismiss configurable (`timeout`). Supporte hover-pause, swipe-to-dismiss, timer visuel, et modes multi-line / vertical.

#### Entrées (props)

`ISnackbarProps` étend : `ICommonsComponentProps`, `ITagProps`, `IStatusProps`, `IColorProps`, `IBgColorProps`, `IOverlayProps`, `IPositionProps`, `ILocationProps`, `IRoundedProps`, `IBorderProps`, `IPaddingProps`, `IMarginProps`, `IElevationProps`, `ITransitionComponentProps`, `IActiveProps`, `IHoverProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `timeout` | `number \| string` | `5000` | Délai auto-dismiss en ms. `-1` = pas de fermeture automatique |
| `text` | `string` | — | Message court |
| `multiLine` | `boolean` | — | Mode multi-ligne |
| `vertical` | `boolean` | — | Layout vertical (message au-dessus des actions) |
| `timer` | `boolean \| string` | — | Affiche la barre de progression de durée |
| `location` | `string` | `'bottom'` | Position (`top`, `bottom`, `left`, `right`, `center`) |
| `border` | `boolean` | `true` | Bordure sur le wrapper |
| `rounded` | `boolean` | `true` | Border-radius sur le wrapper |
| `elevation` | `number` | `1` | Ombre |
| `transition` | `TTransitionProps` | `{component: OrigamSnack}` | Transition d'entrée/sortie |

#### Sorties

**Emits** : héritages de `IOverlayProps` (via `update:modelValue`).

**Slots** :

| Slot | Description |
|---|---|
| `prepend` | Icône ou avatar à gauche |
| `title` | Titre du snackbar |
| `text` / `message` | Corps du message |
| `default` | Contenu libre |
| `action` | `{isActive}` — boutons d'action |

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamOverlay` — portail + cycle de vie |
| Composant | `OrigamSnackbarItem` — surface visible (règle BEM child) |
| Composant | `OrigamSnack` (transition par défaut) |
| Composable | `useVModel(props, 'modelValue')` |
| Composable | `usePosition`, `useScopeId`, `useStateEffect`, `useStatus`, `useBothColor` |
| Composable | `useLayout` (via `useToggleScope` + injection `ORIGAM_LAYOUT_KEY`) — offset padding layout |
| Composable | `useStyle` |
| Const | `ORIGAM_LAYOUT_KEY`, `SCROLL_STRATEGIES` |
| Utilitaire | `forwardRefs()` |

#### Comportement notable

**Auto-dismiss** : `window.setTimeout` déclenche `isActive.value = false` après `timeout` ms. Le timer est relancé à chaque changement de `isActive` ou de `timeout`. Au montage, si déjà actif, le timer démarre.

**Hover-pause** : `handlePointerenter` / `handlePointerleave` sur `contentProps` (forwarded à `.origam-snackbar__wrapper`) appellent `clearTimeout()` / `startTimeout()`. `isHovering` pilote la classe `origam-snackbar__timer--paused` qui met en pause l'animation CSS de la barre timer.

**Swipe-to-dismiss** : `handleTouchstart` mémorise `startY`, `handleTouchend` calcule le delta vertical. Si `|delta| > 50px` → `isActive.value = false`.

**Timer visuel** : un `<div class="origam-snackbar__timer">` contient `<div class="origam-snackbar__timer-bar">`. L'animation CSS `origam-snackbar__timer-shrink` réduit `scaleX` de 1 à 0 en `timeout` ms. La variable `--origam-snackbar__timer---duration` est injectée en inline style. La clé `timerKey` est incrémentée à chaque redémarrage pour forcer le rechargement de l'animation CSS.

**Classes BEM child (règle surface)** : `colorClasses` et `colorStyles` vont dans `contentProps`, qui atterrissent sur `.origam-snackbar__wrapper` via l'overlay (`overlayContentClasses`). Ni `colorClasses` ni `colorStyles` ne sont jamais placés sur la racine `.origam-overlay`.

**Intent bridge** : `OrigamSnackbar` accepte `status: TStatus` (enum `success|info|warning|error`) pour la compatibilité avec la famille des composants feedback. `OrigamSnackbarItem` travaille avec `intent: TIntent`. Le bridge est explicite : `snackbarIntent = props.status as unknown as TIntent`.

**z-index** : `--origam-snackbar---z-index` fallback sur `--origam-z-index-toast` (valeur token : 1060). Quand `absolute`, surcharge à `--origam-z-index-raised` (1).

**Layout awareness** : via `useToggleScope(() => !!hasLayout, …)` et `useLayout()`, le snackbar ajoute des paddings basés sur `layout.mainStyles.value` pour respecter les barres d'application (AppBar, SystemBar).

#### Exemple d'usage

```vue
<origam-snackbar
  v-model="snackVisible"
  status="success"
  text="Enregistrement réussi"
  :timeout="4000"
  timer
  location="bottom right"
>
  <template #action="{ isActive }">
    <origam-btn variant="text" @click="isActive.value = false">Fermer</origam-btn>
  </template>
</origam-snackbar>
```

---

### `OrigamTooltip`

**Fichier** : `packages/ds/src/components/Tooltip/OrigamTooltip.vue`
**Interface** : `packages/ds/src/interfaces/Tooltip/tooltip.interface.ts`

#### Rôle

Info-bulle positionnée à côté de son activateur au survol (ou au focus clavier). Construit sur `OrigamOverlay` avec `persistent: true`, `disableGlobalStack: true`, `scrim: false`, `scrollStrategy: SCROLL_STRATEGIES.REPOSITION`, `locationStrategy: LOCATION_STRATEGIES.CONNECTED`, `openOnHover: true`, `openOnClick: false`.

#### Entrées (props)

`ITooltipProps` étend : `ICommonsComponentProps`, `IOverlayProps`, `IColorProps`, `IBgColorProps`, `IDimensionProps`, `IActivatorProps`, `ILocationStrategyProps`, `IScrollStrategyProps`, `ILazyProps`, `ITransitionComponentProps`, `IScrimProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | auto-généré `origam-tooltip-{uid}` | `id` sur le panneau — pour `aria-describedby` |
| `text` | `string` | — | Texte simple du tooltip |
| `location` | `string` | `INLINE.RIGHT` | Position : `top`, `bottom`, `left`, `right` + alignement |
| `offset` | `number` | `10` | Décalage en px par rapport à l'activateur |
| `minWidth` | `number` | `0` | Largeur minimale |
| `eager` | `boolean` | `true` | Montage immédiat (pas de lazy) |
| `openOnHover` | `boolean` | `true` | — |
| `openOnClick` | `boolean` | `false` | — |
| `closeOnBack` | `boolean` | `false` | — |
| `transition` | — | `false` | Désactivée par défaut ; dynamique : OrigamTranslateScale si isActive, OrigamFade sinon |

#### Sorties

**Emits** : `ITooltipEmits` = `ICommonsComponentEmits`.

**Slots** :

| Slot | Description |
|---|---|
| `activator` | `{props}` — délégué depuis OrigamOverlay |
| `default` | Contenu du tooltip — fallback sur `<span>{{ text }}</span>` |

**Expose** : forwarde `filterProps`, `css`, `id`, `load`, `unload`, `isLoaded`, `styleId` + expose d'OrigamOverlay via `forwardRefs`.

**Classes** : `origam-tooltip` (sur la racine overlay — transparente), `origam-tooltip__content` + `colorClasses`.
**Styles** : `colorStyles` sur `.origam-tooltip__content` (règle surface BEM child).

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamOverlay` |
| Composant | `OrigamFade`, `OrigamTranslateScale` |
| Composable | `useBothColor(bgColor, color)` — inline style sur `__content` |
| Composable | `useVModel`, `useScopeId`, `useStyle`, `useProps` |
| Utilitaire | `getUid()`, `forwardRefs()` |
| Enum | `INLINE`, `LOCATION_STRATEGIES`, `SCROLL_STRATEGIES` |
| Type | `TAnchor`, `TOrigamOverlay` |

#### Comportement notable

**ARIA** : l'activateur reçoit `aria-describedby="{id}"` via `activatorProps`. Le panneau tooltip a `role="tooltip"` (transmis à OrigamOverlay via la prop `role`). La connexion `aria-describedby` est le standard WCAG pour les tooltips.

**Règle surface** : `colorClasses` est appliqué sur `<div class="origam-tooltip__content">`, jamais sur la racine `.origam-tooltip`. Le `.origam-tooltip` racine est `background-color: transparent`.

**`location` normalisé** : si un seul mot est fourni (ex. `'top'`), le composant ajoute automatiquement `' center'` pour former une ancre complète (`'top center'`). Idem pour `origin`.

**Transition dynamique** : `transition` est calculé dynamiquement — `OrigamTranslateScale` quand le tooltip s'ouvre (crée un effet de scale depuis l'origine), `OrigamFade` pour la fermeture. Désactivable avec `transition: false`.

**z-index** : `--origam-tooltip---z-index` fallback `1070`.

#### Exemple d'usage

```vue
<origam-tooltip text="Copier dans le presse-papiers" location="top">
  <template #activator="{ props }">
    <origam-btn v-bind="props" icon="mdi-content-copy" aria-label="Copier" />
  </template>
</origam-tooltip>
```

---

### `OrigamLoader`

**Fichier** : `packages/ds/src/components/Loader/OrigamLoader.vue`
**Interface** : `packages/ds/src/interfaces/Commons/loader.interface.ts`

#### Rôle

Wrapper conditionnel qui affiche soit un indicateur de chargement (`OrigamProgress` circulaire) soit son contenu par défaut selon l'état `loading`. Composant utilitaire léger, pas d'overlay.

#### Entrées (props)

`ILoaderProps` étend : `ICommonsComponentProps`, `ITagProps`, `IColorProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `loading` | `TLoadingValue` | — | Valeur truthy = chargement actif |
| `loadingText` | `string` | — | Prévu pour l'aria-label futur |
| `tag` | `string` | `'span'` | Élément HTML racine |

`TLoadingValue` est traité comme booléen via `!!props.loading` dans le composant.

#### Sorties

**Slots** :

| Slot | Description |
|---|---|
| `loader` | Remplacement du spinner par défaut (actif si `loading`) |
| `default` | Contenu normal (actif si `!loading`) |

**Classes** : `origam-loader`.
**Styles** : `props.style`.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamProgress` (circulaire, taille 23, width 2, indeterminate) |
| Composable | `useProps`, `useStyle` |
| Enum | `PROGRESS_TYPE` |

#### Comportement notable

**ARIA** : `aria-busy="true"` sur le tag racine quand `isLoading`. `aria-label="Loading"` également. Ces attributs signalent aux technologies d'assistance que le contenu est en cours de chargement.

**CSS fullscreen** : le modificateur `.origam-loader--fullscreen` (non déterminé par une prop directe, à activer via `class`) positionne le loader en `position: fixed` couvrant tout l'écran.

#### Exemple d'usage

```vue
<origam-loader :loading="isSubmitting" color="primary">
  <template #default>
    <origam-btn @click="submit">Envoyer</origam-btn>
  </template>
</origam-loader>
```

---

### `OrigamProgress`

**Fichier** : `packages/ds/src/components/Progress/OrigamProgress.vue`
**Interfaces** : `packages/ds/src/interfaces/Progress/progress.interface.ts`

#### Rôle

Proxy de sélection entre `OrigamProgressCircular` et `OrigamProgressLinear` selon la prop `type`. Unifie l'API des deux sous-composants.

#### Entrées (props)

`IProgressProps` étend `IProgressLinearProps` et `IProgressCircularProps` (union).

Props principales (communes) :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `TProgressType` | `'linear'` | `'circular'` ou `'linear'` |
| `modelValue` | `string \| number` | `0` | Valeur courante |
| `max` | `number \| string` | `100` | Valeur maximum |
| `indeterminate` | `boolean` | — | Animation continue |
| `color` | — | — | Couleur de l'indicateur |
| `thickness` | `string \| number` | `4` | Épaisseur (stroke pour circular, height pour linear) |
| `size` | — | `SIZES.DEFAULT` | Taille du composant |
| `active` | `boolean` | — | Visibilité (`aria-hidden`) |
| `striped` | `boolean` | — | Mode rayé (linear uniquement) |
| `absolute` | `boolean` | — | Position absolute |

#### Sorties

**Slots** :

| Slot | Description |
|---|---|
| `default` | Contenu centré (circular uniquement si `hasContent`) |

**Expose** : `filterProps`.

**Classes** : forwarde `sizeClasses` (`.origam--size-{value}`).
**Styles** : `sizeStyles`.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamProgressCircular` |
| Composant | `OrigamProgressLinear` |
| Composable | `useProgress(props)` — `normalizedValue` (0–100), `hasContent` (boolean) |
| Composable | `useSize(props)` |
| Composable | `useProps`, `useStyle` |
| Enum | `PROGRESS_TYPE`, `SIZES` |

#### Comportement notable

**ARIA** : `role="progressbar"` sur le composant rendu. `aria-valuemin="0"`, `aria-valuemax={max}`, `aria-valuenow={normalizedValue}` (absent si `indeterminate`). `aria-busy="true"` si `indeterminate`. `aria-hidden="!active"`. `aria-label={label ?? 'Loading'}`. Conforme aux pratiques ARIA pour les progress bars.

**Proxy pattern** : `progressProps` utilise `origamProgressRef.value?.filterProps(props)` pour ne forwarder que les props connues du sous-composant sélectionné. Cette technique évite les warnings Vue de prop inconnue.

#### Exemple d'usage

```vue
<!-- Circulaire indéterminé -->
<origam-progress
  :type="PROGRESS_TYPE.CIRCULAR"
  indeterminate
  color="primary"
  :size="32"
/>

<!-- Linéaire déterminé -->
<origam-progress
  :type="PROGRESS_TYPE.LINEAR"
  :model-value="uploadPercent"
  color="success"
/>
```

---

### `OrigamSkeleton`

**Fichier** : `packages/ds/src/components/Skeleton/OrigamSkeleton.vue`
**Interface** : `packages/ds/src/interfaces/Skeleton/skeleton.interface.ts`

#### Rôle

Placeholder animé affiché pendant le chargement d'une portion de contenu. Quand `loading` est `false`, rend le slot `default` à la place. Supporte 5 variantes visuelles et 2 variantes composites prêtes à l'emploi.

#### Entrées (props)

`ISkeletonProps` étend : `ICommonsComponentProps`, `IColorProps`, `IBgColorProps`, `ISizeProps`, `IRoundedProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `TSkeletonVariant` | `'rectangular'` | `'text'`, `'rectangular'`, `'circular'`, `'card'`, `'list-item'` |
| `loading` | `boolean` | `true` | Active le skeleton |
| `pulse` | `boolean` | `true` | Active l'animation de shimmer/spin |
| `width` | `string \| number` | — | Largeur (auto-ajustée pour `text` → `'100%'`, pour `circular` → miroir de height) |
| `height` | `string \| number` | — | Hauteur (pour `text` → `var(--origam-skeleton---text-height)`) |

`TSkeletonVariant` : `'text' | 'rectangular' | 'circular' | 'card' | 'list-item'`

#### Sorties

**Slots** :

| Slot | Description |
|---|---|
| `default` | Rendu si `loading === false` |

**Classes (mode simple)** : `origam-skeleton`, `origam-skeleton--{variant}`, `origam-skeleton--pulse`, `colorClasses`, `roundedClasses`, `sizeClasses`.
**Styles (mode simple)** : `width`, `height`, `colorStyles`, `roundedStyles`, `sizeStyles`.

**Classes (mode composite `card` / `list-item`)** : `origam-skeleton-wrapper`, `origam-skeleton-wrapper--{variant}`.

#### Dépendances

| Type | Nom |
|---|---|
| Composable | `useBothColor(bgColor, color)` |
| Composable | `useRounded`, `useSize`, `useStyle`, `useProps` |
| Utilitaire | `convertToUnit()` — width/height number → px string |

#### Comportement notable

**ARIA** : `role="status"` + `aria-busy="true"` + `aria-label="Loading"` sur chaque bloc skeleton affiché.

**Animation** : animation CSS `origam-skeleton-wave` (gradient animé, `background-size: 200%`, direction `90deg`) pour les variantes text/rectangular. Pour `circular`, animation `origam-skeleton-spin` avec `conic-gradient`. Respecte `prefers-reduced-motion: reduce` (suppression de l'animation).

**Variantes composites** : `'card'` et `'list-item'` utilisent un wrapper dédié avec des éléments `.origam-skeleton--rectangular`, `.origam-skeleton--circular` et `.origam-skeleton--text` dont les proportions sont définies par le CSS (`nth-child`). Ces variantes ne peuvent pas recevoir les props `width`/`height`/`color` directement — seul le container wrapper est rendu.

**`color-mix`** : la couleur du shimmer est calculée par `color-mix(in srgb, var(--origam-skeleton---background-color) 50%, white)` — CSS natif moderne, aucun calcul JS.

#### Exemple d'usage

```vue
<!-- Loading : skeleton list-item -->
<origam-skeleton variant="list-item" :loading="isPending" />

<!-- Loaded : contenu réel -->
<origam-skeleton variant="rectangular" :loading="isPending" height="200px">
  <img src="..." alt="Photo de profil" />
</origam-skeleton>
```

---

### `OrigamEmptyState`

**Fichier** : `packages/ds/src/components/EmptyState/OrigamEmptyState.vue`
**Interface** : `packages/ds/src/interfaces/EmptyState/empty-state.interface.ts`

#### Rôle

Placeholder contextuel affiché lorsqu'une liste, un tableau ou une collection n'a rien à montrer. Propose 5 presets (`no-data`, `no-results`, `error`, `offline`, `locked`) qui associent automatiquement une icône et un intent. Supporte title, description et actions.

#### Entrées (props)

`IEmptyStateProps` étend : `ICommonsComponentProps`, `ITagProps`.

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `preset` | `TEmptyStatePreset` | `'no-data'` | Preset bundlant icône + intent |
| `title` | `string` | — | Titre affiché |
| `description` | `string` | — | Description / sous-titre |
| `icon` | `TIcon` | — | Override de l'icône preset |
| `iconColor` | `TIntent` | — | Override de l'intent preset |
| `size` | `TEmptyStateSize` | `'md'` | `'sm'` / `'md'` / `'lg'` |
| `align` | `TEmptyStateAlign` | `'center'` | `'center'` / `'left'` |
| `tag` | `string` | `'div'` | Balise racine |

**Presets disponibles** (`EMPTY_STATE_PRESET_CONFIG`) :

| Preset | Icône | Intent |
|---|---|---|
| `no-data` | `MDI_ICONS.DATABASE_OFF_OUTLINE` | `neutral` |
| `no-results` | `MDI_ICONS.MAGNIFY_CLOSE` | `neutral` |
| `error` | `MDI_ICONS.ALERT_CIRCLE_OUTLINE` | `danger` |
| `offline` | `MDI_ICONS.WIFI_OFF` | `warning` |
| `locked` | `MDI_ICONS.LOCK_OUTLINE` | `secondary` |

#### Sorties

**Expose** : `resolvedIcon`, `resolvedIntent`, `hasDefaultSlot`, `hasTitle`, `hasDescription`, `hasActions`.

**Slots** (`IEmptyStateSlots`) :

| Slot | Description |
|---|---|
| `default` | Remplace l'intégralité du layout built-in |
| `icon` | Remplace `<OrigamIcon>` (SVG, img) |
| `title` | Remplace le titre — slot prime sur la prop |
| `description` | Remplace la description |
| `actions` | Rangée de boutons (Create / Retry / …) |

**Classes** : `origam-empty-state`, `origam-empty-state--size-{sm|md|lg}`, `origam-empty-state--align-{center|left}`, `origam-empty-state--preset-{preset}`, `origam-empty-state--intent-{intent}`.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamIcon` |
| Const | `EMPTY_STATE_PRESET_CONFIG` |
| Type | `TEmptyStatePreset`, `TEmptyStateSize`, `TEmptyStateAlign`, `TIntent`, `TIcon` |

#### Comportement notable

**ARIA** : `role="status"` + `aria-live="polite"` sur le conteneur. Annonce les changements d'état de vide (ex. filtre qui vide la liste) aux lecteurs d'écran. La zone icône est `aria-hidden="true"` (purement décorative).

**CSS-first** : toutes les dimensions (padding, gap, icon-size, font-sizes) sont pilotées par des variables CSS locales résolues par les classes modificatrices de taille. Aucun calcul JS pour le responsive.

**Slot default** : si le slot `default` est fourni, il remplace toute la structure built-in. Les slots `icon`, `title`, `description`, `actions` permettent un remplacement chirurgical pièce par pièce.

#### Exemple d'usage

```vue
<origam-empty-state
  preset="no-results"
  title="Aucun résultat"
  description="Modifiez vos critères de recherche."
  size="lg"
>
  <template #actions>
    <origam-btn @click="resetFilters">Réinitialiser les filtres</origam-btn>
  </template>
</origam-empty-state>
```

---

### `OrigamConfirmWrapper`

**Fichier** : `packages/ds/src/components/ConfirmWrapper/OrigamConfirmWrapper.vue`
**Interface** : `packages/ds/src/interfaces/ConfirmWrapper/confirm-wrapper.interface.ts`

#### Rôle

Composant de formulaire "tape deux fois" : associe un champ principal à un champ de confirmation. Vérifie que les deux valeurs correspondent. Patron usuel : création de mot de passe, changement d'email, confirmation de suppression. Peut auto-instancier les deux champs via la prop `field`.

#### Entrées (props)

`IConfirmWrapperProps` étend : `ICommonsComponentProps`, `IAdjacentProps`, `IDirectionProps`, `IColorProps`, `IDensityProps`, `IRoundedProps`, `IElevationProps`, `IVariantProps`, `IFocusProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `modelValue` | `any` | `''` | Valeur du champ principal |
| `confirm` | `any` | `''` | Valeur du champ de confirmation |
| `field` | `string` | — | `'text-field'` → instancie `<origam-text-field>` en double |
| `defaults` | `Record<string, any>` | — | Props partagées forwarded aux deux champs |
| `confirmLabel` | `string` | — | Label du champ confirm (calculé auto si absent) |
| `disabled` | `boolean` | — | Désactive les deux champs |
| `readonly` | `boolean` | — | Lecture seule |
| `required` | `boolean` | — | |
| `error` | `boolean` | — | Force l'état erreur |
| `errorMessages` | `string \| string[]` | — | Messages d'erreur externes |
| `hideDetails` | `boolean \| 'auto'` | — | Masque la zone de details |
| `messages` | `string \| string[]` | — | Messages helpers |
| `hint` | `string` | — | Hint |
| `persistentHint` | `boolean` | — | |
| `centerAffix` | `boolean` | `true` | Centre les icônes prepend/append |
| `label` | `string` | — | Label de l'en-tête |
| `direction` | `DIRECTION` | `DIRECTION.VERTICAL` | `vertical` ou `horizontal` |
| `density` | `DENSITY` | `DENSITY.DEFAULT` | |

#### Sorties

**Emits** : `IConfirmWrapperEmits` = `ICommonsComponentEmits + IAdjacentEmits + IFocusEmits + update:confirm`.

**Slots** (`IConfirmWrapperSlots`) :

| Slot | Description |
|---|---|
| `default` | Champ principal (remplace le champ auto-instancié) |
| `confirm` | Champ de confirmation |
| `header` | En-tête complet |
| `title` | `{props}` — label |
| `prepend` / `append` | Icônes |
| `messages` | `{hasMessages, messages, messagesId}` |
| `message` | `{message}` — rendu unitaire d'un message |
| `details` | `{id, messagesId, isDirty, isDisabled, isReadonly}` |

**Expose** : `filterProps`, `validate()`, `reset()`, `resetValidation()`.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamMessages`, `OrigamLabel`, `OrigamAvatar`, `OrigamIcon`, `OrigamDefaultsProvider` |
| Composable | `useVModel(props, 'modelValue')` + `useVModel(props, 'confirm')` |
| Composable | `useAdjacent(props)` |
| Composable | `useDefaults(_props)` — les defaults injectés par le parent |
| Composable | `useLocale` — `t('origam.validation.must_match')` |
| Composable | `useProps`, `useStyle` |
| Utilitaire | `forwardRefs`, `getUid`, `wrapInArray` |

#### Comportement notable

**Validation dirty-aware** : `isPristine` reste `true` tant que l'utilisateur n'a pas tapé dans le champ confirm. L'erreur de non-correspondance n'apparaît qu'après la première interaction (`isPristine = false`), évitant le "rouge dès l'ouverture".

**`validate()` public** : force `isPristine = false` et retourne `errorMessages.value`. Appelable par un formulaire parent (`OrigamForm`).

**`resolvedConfirmDefaults`** : les props de validation de mot de passe (`requirements`, `needTiny`, `needUppercase`, etc.) sont retirées du `defaults` forwarded au champ confirm pour éviter la duplication de la UI de force de mot de passe.

**`OrigamDefaultsProvider`** : le wrapper pousse les props visuelles partagées (color, density, variant, rounded…) vers les deux champs via le contexte inject/provide, sans les répéter en `v-bind` sur chaque champ.

**Direction** : en `vertical`, les deux champs occupent deux lignes (`grid-template-areas: "field field" "confirm confirm"`). En `horizontal`, côte à côte (`grid-template-areas: "field confirm"`).

#### Exemple d'usage

```vue
<origam-confirm-wrapper
  v-model="password"
  v-model:confirm="passwordConfirm"
  field="password-field"
  :defaults="{
    label: 'Mot de passe',
    variant: 'outlined',
    requirements: true
  }"
  label="Sécurisez votre compte"
/>
```

---

### `OrigamPicker`

**Fichier** : `packages/ds/src/components/Picker/OrigamPicker.vue`
**Interface** : `packages/ds/src/interfaces/Picker/picker.interface.ts`

#### Rôle

Surface structurée de type "picker" (sélecteur de date, sélecteur de couleur, etc.). Fournit une mise en page `display: grid` à zones nommées (`title`, `header`, `body`, `actions`) avec une couleur de fond distincte sur la zone titre/header. Utilisé comme shell par `OrigamDatePicker` et `OrigamColorPicker`.

#### Entrées (props)

`IPickerProps` étend : `ISheetProps`, `IBgColorProps`, `IPickerTitleProps`.

Props spécifiques :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `landscape` | `boolean` | — | Layout landscape : header et body côte à côte |
| `hideHeader` | `boolean` | — | Masque la zone header/title |
| `title` | `string` | — | Via `IPickerTitleProps` — texte du titre |
| `bgColor` | — | — | Couleur de fond de la zone titre/header |

`ISheetProps` apporte : `color`, `border`, `rounded`, `elevation`, `width`, `height`, `tag`, ainsi que tous les props de Sheet (qui étend lui-même plusieurs interfaces commons).

#### Sorties

**Slots** :

| Slot | Description |
|---|---|
| `title` | Remplace `<OrigamPickerTitle>` |
| `header` | Contenu de la zone header (contrôles nav mois/année pour DatePicker) |
| `default` | Corps du picker (grille de jours, canvas couleur, etc.) |
| `actions` | Boutons de validation/annulation |

**Expose** : `filterProps`.

**Classes** : `origam-picker`, `origam-picker--landscape`, `origam-picker--has-actions`.

#### Dépendances

| Type | Nom |
|---|---|
| Composant | `OrigamSheet` (surface et élévation) |
| Composant | `OrigamPickerTitle` |
| Composable | `useBackgroundColor(toRef(props, 'bgColor'))` — `backgroundColorClasses` / `backgroundColorStyles` sur la zone title/header |
| Composable | `useProps`, `useStyle` |
| Type | `TOrigamSheet` |

#### Comportement notable

**Règle surface BEM child** : `backgroundColorClasses` et `backgroundColorStyles` sont appliqués sur le `<div>` de la zone titre/header (BEM child), pas sur la racine `<origam-sheet>`. Cela permet d'avoir une couleur de fond différente sur l'en-tête sans colorer toute la surface.

**Layout CSS grid** : 4 zones nommées (`grid-template-areas: "title" "header" "body"`). En mode `landscape` : `"title" "header body" "header body"`. Avec `has-actions` : ajout de `"actions"` en dernière ligne (ou deuxième colonne en landscape).

**Pas d'overlay natif** : `OrigamPicker` lui-même n'est pas un overlay. L'intégration dans un overlay (ex. `OrigamDatePickerField`) est gérée par le composant parent qui place le Picker dans le slot `default` d'un `OrigamOverlay` / `OrigamMenu`.

#### Exemple d'usage

```vue
<origam-picker bg-color="primary" title="Sélectionner une date">
  <template #header>
    <!-- Contrôles navigation mois / année -->
  </template>
  <template #default>
    <!-- Grille de jours -->
  </template>
  <template #actions>
    <origam-btn variant="text" @click="cancel">Annuler</origam-btn>
    <origam-btn @click="confirm">OK</origam-btn>
  </template>
</origam-picker>
```

---

## Tableau récapitulatif

| Composant | Overlay ? | Composables clés | Interface | Transition défaut | ARIA rôle |
|---|---|---|---|---|---|
| `OrigamAlert` | Non — inline | `useActive`, `useStateEffect`, `useStatus`, `useHover`, `useAdjacent` | `IAlertProps` | — | `alert` (warning/error) / `status` |
| `OrigamMessages` | Non — inline | `useTextColor`, `useSsrBoot`, `useDefaults` | `IMessagesProps` | `OrigamSlideY` | `status` |
| `OrigamOverlay` | Oui — primitive | `useStack`, `useTeleport`, `useActivator`, `useLazy`, `useLocationStrategies`, `useScrollStrategies`, `useHydration`, `useScopeId` | `IOverlayProps` | `OrigamFade` | — |
| `OrigamDialog` | Oui (via Overlay) | `useVModel`, `useScopeId`, `useSize`, `useStatus`, `focusableChildren` | `IDialogProps` | `OrigamTranslateScale` | `dialog` (sur OrigamCard) |
| `OrigamSnackbar` | Oui (via Overlay) | `useVModel`, `usePosition`, `useStateEffect`, `useStatus`, `useLayout`, `useBothColor` | `ISnackbarProps` | `OrigamSnack` | `status` / `alert` (via SnackbarItem) |
| `OrigamTooltip` | Oui (via Overlay) | `useBothColor`, `useVModel`, `useScopeId` | `ITooltipProps` | dynamique (TranslateScale/Fade) | `tooltip` |
| `OrigamLoader` | Non — inline | `useProps`, `useStyle` | `ILoaderProps` | — | (aria-busy) |
| `OrigamProgress` | Non — inline | `useProgress`, `useSize`, `useProps` | `IProgressProps` | — | `progressbar` |
| `OrigamSkeleton` | Non — inline | `useBothColor`, `useRounded`, `useSize` | `ISkeletonProps` | — | `status` |
| `OrigamEmptyState` | Non — inline | — (pur CSS-classes) | `IEmptyStateProps` | — | `status` |
| `OrigamConfirmWrapper` | Non — inline | `useVModel` x2, `useAdjacent`, `useDefaults`, `useLocale` | `IConfirmWrapperProps` | — | — |
| `OrigamPicker` | Non (shell) | `useBackgroundColor`, `useProps` | `IPickerProps` | — | — |

---

## Notes transversales

### Chaîne d'héritage des overlays

```
OrigamOverlay (primitive)
  ├── OrigamDialog
  ├── OrigamSnackbar
  ├── OrigamTooltip
  ├── OrigamMenu
  ├── OrigamDrawer
  ├── OrigamContextualMenu
  └── (champs pickers : OrigamDatePickerField, OrigamColorPickerField, OrigamSelect)
```

Tous ces composants délèguent à `OrigamOverlay` via `ref` + `filterProps` + `forwardRefs`. Ils ne ré-implémentent pas le Teleport, le stack, ou l'activateur.

### z-index par couche

| Couche | Token / Valeur par défaut |
|---|---|
| Overlay (base) | `zIndex: 2000` |
| Dialog | `zIndex: 2400` |
| Snackbar | `--origam-z-index-toast: 1060` |
| Tooltip | `--origam-tooltip---z-index: 1070` |

### SSR Safety

Tous les composants overlay encadrent leur portail par `v-if="isMounted && hasContent"` via `useHydration()`. Aucun `document.body` n'est accédé avant le montage client.

### Accessibilité — résumé

- `OrigamAlert` : `role="alert"` assertif pour warning/error.
- `OrigamMessages` : `role="status"` polite — idéal pour les erreurs de validation.
- `OrigamDialog` : focus trap complet, `aria-modal`, `aria-labelledby`.
- `OrigamTooltip` : `role="tooltip"` + `aria-describedby` sur l'activateur.
- `OrigamProgress` : `role="progressbar"` avec `aria-valuenow`/`max`/`min`.
- `OrigamSkeleton` / `OrigamEmptyState` : `role="status"` + `aria-busy` / `aria-live="polite"`.
- `OrigamSnackbar` (via `OrigamSnackbarItem`) : `role="alert"` pour danger/warning, `role="status"` sinon. `aria-live` correspond. `aria-atomic="true"`.
