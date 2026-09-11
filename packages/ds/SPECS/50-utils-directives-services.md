# Utils, Directives & Services — Spec technique origam DS

> Périmètre : `packages/ds/src/utils/**/*.util.ts` (68 fichiers), `packages/ds/src/directives/*` (5 directives), `packages/ds/src/services/Commons/*` (3 services).
>
> Tout ce document est basé sur la lecture du code source réel. Aucune valeur n'est inventée.

---

## 1. Utils

Les fonctions utilitaires sont des fonctions pures (ou quasi-pures) sans état réactif. Elles sont regroupées dans `packages/ds/src/utils/` par domaine fonctionnel.

---

### 1.1 Commons — Général (`commons.util.ts`)

Fichier : `src/utils/Commons/commons.util.ts`

#### `convertToUnit`
- **Signature** : `(str: number, unit?: string) => string` / `(str: string | number | null | undefined, unit?: string) => string | undefined`
- **Rôle** : Convertit une valeur numérique ou chaîne en unité CSS (défaut `px`). Retourne `undefined` pour `null`, `''`, ou infini.
- **Consommé par** : `useDimension`, `useMargin`, `usePadding`, nombreux composables de positionnement.

#### `refElement`
- **Signature** : `(obj?: ComponentPublicInstance<any> | HTMLElement) => HTMLElement | undefined`
- **Rôle** : Résout un `ComponentPublicInstance` ou `HTMLElement` en `HTMLElement` brut. Gère le cas multi-root (retourne `nextElementSibling` si le nœud est `TEXT_NODE`).
- **Consommé par** : `goTo.util.ts`, `activator.util.ts`, `forwardRefs.util.ts`.

#### `toKebabCase`
- **Signature** : `(str?: string) => string`
- **Rôle** : Convertit une chaîne camelCase en kebab-case. Cache interne `Map<string, string>` pour les appels répétés.
- **Consommé par** : `getCurrentInstance.util.ts`, `getCurrentInstanceName`.

#### `findChildrenWithProvide`
- **Signature** : `(key: InjectionKey<any> | symbol, vnode?: VNodeChild) => Array<ComponentInternalInstance>`
- **Rôle** : Parcourt récursivement le VDOM pour trouver tous les composants enfants qui fournissent (`provide`) une clé d'injection donnée.
- **Consommé par** : `useGroup`, `useNestedGroup`.

#### `destructComputed`
- **Signature** : `<T extends object>(getter: ComputedGetter<T & TNotAUnion<T>>) => ToRefs<T>`
- **Rôle** : Crée un objet réactif dont chaque propriété est un `ref` dérivé d'un `computed` retournant un objet. Équivalent de `toRefs(computed(...))` avec `flush: sync`.
- **Consommé par** : `location.util.ts` (destructComputed pour `preferredAnchor`/`preferredOrigin`).

#### `padEnd` / `padStart`
- **Signature** : `(str: string, length: number, char?: string) => string`
- **Rôle** : Complète une chaîne à droite / à gauche avec un caractère (défaut `'0'`).
- **Consommé par** : `color.util.ts` (`parseHex`), `date.util.ts`.

#### `clamp`
- **Signature** : `(value: number, min?: number, max?: number) => number`
- **Rôle** : Contraint une valeur numérique entre `min` (défaut 0) et `max` (défaut 1).
- **Consommé par** : `color.util.ts`, `location.util.ts`, `goTo.util.ts`, `ripple.util.ts`.

#### `int`
- **Signature** : `(value: string | number, radix?: number) => number`
- **Rôle** : Alias de `parseInt` avec radix configurable (défaut 10).
- **Consommé par** : `color.util.ts`, `goTo.util.ts`, `layout.util.ts`.

#### `getDecimals`
- **Signature** : `(value: number) => number`
- **Rôle** : Compte le nombre de décimales d'un nombre.
- **Consommé par** : composables de slider/range.

#### `roundTo`
- **Signature** : `(value: number, places?: number) => number`
- **Rôle** : Arrondit à `places` décimales (défaut 0).
- **Consommé par** : `elevation.util.ts`.

#### `chunk`
- **Signature** : `(str: string, size?: number) => Array<string>`
- **Rôle** : Découpe une chaîne en morceaux de taille fixe.
- **Consommé par** : `color.util.ts` (`HexToRGB`).

#### `has`
- **Signature** : `<T extends string>(obj: object, key: Array<T>) => obj is Record<T, unknown>`
- **Rôle** : Type guard — vérifie que `obj` possède toutes les clés listées.
- **Consommé par** : `color.util.ts` (`parseColor`), `color-picker.util.ts`.

#### `oops`
- **Signature** : `() => never`
- **Rôle** : Lève une erreur inconditionnellement, utilisé comme sentinelle exhaustive.

#### `noop`
- **Signature** : `() => void`
- **Rôle** : Fonction vide, placeholder pour callbacks optionnels.

#### `debounce`
- **Signature** : `(fn: (...args: any[]) => void, delay: MaybeRef<number>) => wrap`
- **Rôle** : Crée une version rebondissante de `fn`. Expose `.clear()` pour annuler et `.immediate` pour appel direct. `delay` accepte un `Ref<number>` réactif.
- **Consommé par** : `useDisplay`, `useScroll`.

#### `deepEqual`
- **Signature** : `(a: any, b: any) => boolean`
- **Rôle** : Comparaison récursive profonde (primitives, `Date`, objets). Retourne `false` si le nombre de propriétés diffère.
- **Consommé par** : `group.util.ts`, `useSelection`.

#### `getPropertyFromItem`
- **Signature** : `(item: any, property: TSelectItemKey, fallback?: any) => any`
- **Rôle** : Extrait une valeur d'un item selon une clé polymorphe : booléen, string (dot-path), tableau de chemin, ou fonction.
- **Consommé par** : `filters.util.ts`, `list-item.util.ts`, `DataTable items.util.ts`.

#### `getObjectValueByPath`
- **Signature** : `(obj: any, path?: string | null, fallback?: any) => any`
- **Rôle** : Lit une valeur via un chemin dot-notation (ex. `'user.address.city'`). Supporte la notation `[n]` pour les tableaux.
- **Consommé par** : `getPropertyFromItem`, `group.util.ts`.

#### `getNestedValue`
- **Signature** : `(obj: any, path: Array<(string | number)>, fallback?: any) => any`
- **Rôle** : Lecture récursive d'un objet via un tableau de clés. Utilisé en interne par `getObjectValueByPath`.

#### `keys`
- **Signature** : `<O extends Record<string, unknown>>(o: O) => (keyof O)[]`
- **Rôle** : Version typée de `Object.keys`.

#### `omit`
- **Signature** : `<T extends object, U extends Extract<keyof T, string>>(obj: T, exclude: Array<U>) => Omit<T, U>`
- **Rôle** : Clone un objet en excluant certaines propriétés.
- **Consommé par** : `list-item.util.ts`, `input.util.ts`.

#### `only`
- **Signature** : `<T extends object, U extends Extract<keyof T, string>>(obj: T, include: Array<U>) => Pick<T, U>`
- **Rôle** : Clone un objet en ne gardant que les propriétés listées.

#### `pick`
- **Signature** : `<T extends object, U extends Extract<keyof T, string>>(obj: T, paths: Array<U>) => Pick<T, U>`
- **Rôle** : Extraction de propriétés depuis un objet (ne copie que si la clé existe).

#### `pickWithRest`
- **Signature** : `<T extends object, U, E>(obj: T, paths: Array<U | RegExp>, exclude?: Array<E>) => [yes: Partial<T>, no: Partial<T>]`
- **Rôle** : Partitionne un objet en deux : propriétés correspondant aux `paths` (avec support RegExp) vs le reste.
- **Consommé par** : `input.util.ts` (`filterInputAttrs`).

#### `focusChild` / `focusableChildren` / `getNextElement`
- **Signature** : `focusChild(el: Element, location?: TFocusLocation) => void` / `focusableChildren(el: Element, filterByTabIndex?: boolean) => Array<HTMLElement>` / `getNextElement(elements: Array<HTMLElement>, location?: 'next' | 'prev', condition?) => HTMLElement | undefined`
- **Rôle** : Navigation focus dans un conteneur. `focusableChildren` interroge les sélecteurs standards (button, input, select, etc.). `focusChild` déplace le focus vers first/last/next/prev. `getNextElement` trouve le prochain élément focusable visible.
- **Consommé par** : `useKeyboard`, dialogues, menus.

#### `humanReadableFileSize`
- **Signature** : `(bytes: number, base: 1000 | 1024) => string`
- **Rôle** : Formate des octets en chaîne lisible (`"1.2 kB"` ou `"1.1 KiB"`).
- **Consommé par** : `OrigamFileField`.

#### `hasEvent`
- **Signature** : `(props: Record<string, any>, name: string) => boolean`
- **Rôle** : Détecte si un handler d'événement est attaché (supporte `once`, `Capture`, `OnceCapture`).
- **Consommé par** : `useActivatable`.

#### `flattenFragments`
- **Signature** : `(nodes: Array<VNode>) => Array<VNode>`
- **Rôle** : Aplatit les fragments Vue (`<template>`) dans un tableau de VNode.
- **Consommé par** : `OrigamSlideGroup`, `OrigamList`.

#### `isObject`
- **Signature** : `(obj: any) => obj is object`
- **Rôle** : Type guard — objet non-null, non-array.
- **Consommé par** : `mergeDeep`, `ripple.util.ts`, `hover.util.ts`.

#### `mergeDeep`
- **Signature** : `(source?: Record<string, unknown>, target?: Record<string, unknown>, arrayFn?) => Record<string, unknown>`
- **Rôle** : Fusion récursive profonde de deux objets. Propriétés `target` écrasent `source`. Support d'une fonction de fusion pour les tableaux.
- **Consommé par** : `display.util.ts`, `goTo.util.ts`, `locale.util.ts`.

#### `defer`
- **Signature** : `(timeout: number, cb: () => void) => () => void`
- **Rôle** : Exécute `cb` immédiatement si hors navigateur ou `timeout === 0`, sinon via `setTimeout`. Retourne une fonction d'annulation.
- **Consommé par** : `useOverlay`, `useDialog`.

#### `matchesSelector`
- **Signature** : `(el: Element | undefined, selector: string) => boolean | null`
- **Rôle** : Teste `el.matches(selector)` uniquement si `CSS.supports('selector(...)')` est vrai. Retourne `null` si non supporté.
- **Consommé par** : `useActivator`.

#### `isOn` / `eventName`
- **Signature** : `isOn(key: string) => boolean` / `eventName(propName: string) => string`
- **Rôle** : `isOn` teste si une clé est un handler Vue (`onXxx`). `eventName` extrait le nom d'événement depuis un prop `onXxx` (retourne `xxx` en minuscule).
- **Consommé par** : `bindProps.util.ts`, `event.util.ts`.

#### `wrapInArray`
- **Signature** : `<T>(v: T | null | undefined) => TWrapInArrayResult<T>`
- **Rôle** : Entoure `v` dans un tableau si ce n'en est pas un. Retourne `[]` pour `null`/`undefined`.
- **Consommé par** : `filters.util.ts`, `nested.util.ts`.

#### `templateRef`
- **Signature** : `() => TTemplateRef`
- **Rôle** : Crée un ref de template VueJS qui expose `.value` (le composant/élément brut) et `.el` (le `HTMLElement` résolu via `refElement`).
- **Consommé par** : `useActivator`, nombreux composants overlay.

#### `getPosition`
- **Signature** : `(e: MouseEvent | TouchEvent, position: TClientPosition) => number`
- **Rôle** : Lit `clientX` ou `clientY` depuis un événement souris ou tactile.
- **Consommé par** : `ripple.util.ts`, composables tactiles.

#### `addWindowListener`
- **Signature** : `(event: string, listener: EventListenerOrEventListenerObject, onUnmountedCleanupFns?: any[]) => () => void`
- **Rôle** : Ajoute un listener sur `window` et l'inscrit dans un tableau de nettoyage. Retourne une fonction de suppression.

#### `isEmpty`
- **Signature** : `(val: any) => boolean`
- **Rôle** : Retourne `true` si `null`, `undefined`, ou chaîne vide (après trim).
- **Consommé par** : `sort.util.ts`.

#### `createRange`
- **Signature** : `(length: number, start?: number) => number[]`
- **Rôle** : Crée un tableau de `length` entiers à partir de `start` (défaut 0).
- **Consommé par** : `date.util.ts`, composants de pagination.

#### `getEventCoordinates`
- **Signature** : `(e: MouseEvent | TouchEvent) => { clientX: number, clientY: number }`
- **Rôle** : Extrait les coordonnées client d'un événement souris ou tactile.
- **Consommé par** : composables de drag, `useSlider`.

#### `tryOnMounted`
- **Signature** : `(fn: TFn, sync?: boolean, target?: any) => void`
- **Rôle** : Exécute `fn` dans `onMounted` si dans un composant, sinon directement (ou via `nextTick` si `sync=false`).
- **Consommé par** : `useGoTo`, `useDisplay`.

#### `tryOnScopeDispose`
- **Signature** : `(fn: TFn) => boolean`
- **Rôle** : Appelle `onScopeDispose(fn)` si dans un scope d'effet réactif, sinon ne fait rien. Retourne `true` si enregistré.
- **Consommé par** : composables de lifecycle.

#### `normalize`
- **Signature** : `(number: number, currentScaleMin: number, currentScaleMax: number, newScaleMin?: number, newScaleMax?: number) => number`
- **Rôle** : Normalise une valeur depuis une échelle source vers une échelle cible. Défauts : `newScaleMin=0`, `newScaleMax=1`.
- **Consommé par** : `elevation.util.ts`.

---

### 1.2 Commons — DOM (`dom.util.ts`)

Fichier : `src/utils/Commons/dom.util.ts`

#### `attachedRoot`
- **Signature** : `(node: Node) => null | HTMLDocument | ShadowRoot`
- **Rôle** : Remonte la chaîne de parenté jusqu'à la racine. Retourne `null` si le nœud n'est pas attaché au DOM, `HTMLDocument` s'il est dans le document principal, `ShadowRoot` s'il est dans un Shadow DOM.
- **Consommé par** : `clickOutside.util.ts`.

---

### 1.3 Commons — Couleurs (`color.util.ts`)

Fichier : `src/utils/Commons/color.util.ts`

#### `isCssColor`
- **Signature** : `(color?: string | null | false) => boolean`
- **Rôle** : Reconnaît toute chaîne traitée comme couleur CSS : hex, fonctions (`rgb()`, `hsl()`, `lab()`, etc.), `var(--)`, couleurs nommées CSS.
- **Consommé par** : `useColor`, `useBackgroundColor`, `useTextColor`.

#### `isParsableColor`
- **Signature** : `(color: string) => boolean`
- **Rôle** : `isCssColor` ET non `var(--)` dans une fonction `rgb()`/`hsl()`. Détermine si la couleur est analysable par le moteur interne.
- **Consommé par** : `elevation.util.ts`.

#### `parseColor`
- **Signature** : `(color: TColorType) => TRGBA`
- **Rôle** : Parse n'importe quelle représentation de couleur (entier, hex string, CSS fonctionnel, objet RGBA/HSL/HSV) vers `TRGBA`. Lance `TypeError` pour les valeurs invalides.
- **Consommé par** : `getForeground`, `getContrast`, `getLuma`, `useColorEffect`.

#### `getForeground`
- **Signature** : `(color: TColorType) => '#fff' | '#000'`
- **Rôle** : Calcule le meilleur contraste (blanc ou noir) sur un fond donné via APCA. Préfère blanc si le contraste blanc dépasse 50 ou est supérieur au contraste noir.
- **Consommé par** : `useColorEffect`.

#### `HSLtoRGB` / `RGBtoHSV` / `HSVtoHSL` / `HSLtoHSV` / `RGBtoCSS` / `HSVtoCSS`
- **Rôle** : Conversions entre espaces colorimétriques (HSL↔HSV↔RGB↔CSS). Toutes opèrent sur les types `TRGBA`, `THSVA`, `THSLA`.

#### `toHex` / `RGBtoHex` / `HexToRGB` / `HexToHSV` / `HSVtoHex` / `HSVtoRGB`
- **Rôle** : Conversions vers/depuis le format hexadécimal. `parseHex` normalise les hex 3/4 caractères en 6/8.

#### `lighten` / `darken`
- **Signature** : `(value: TRGBA, amount: number) => TRGBA`
- **Rôle** : Éclaircit / assombrit une couleur en modifiant la luminosité L* dans l'espace CIE LAB.
- **Consommé par** : `useColorEffect` (hover/active states).

#### `getContrast` / `getLuma`
- **Signature** : `getContrast(first: TColorType, second: TColorType) => number` / `getLuma(color: TColorType) => number`
- **Rôle** : Ratio de contraste WCAG 2.1 entre deux couleurs / luminance relative d'une couleur.

#### `APCAcontrast`
- **Signature** : `(text: TRGBA, background: TRGBA) => number`
- **Rôle** : Implémentation APCA (Advanced Perceptual Contrast Algorithm) pour les calculs de contraste perceptuel.
- **Consommé par** : `getForeground`.

#### `parseGradient` / `classToHex`
- **Signature** : `parseGradient(gradient: string, colors: Record<string, Record<string, string>>) => string` / `classToHex(color: string, colors: Record<string, Record<string, string>>) => string`
- **Rôle** : Résolution legacy de gradients à partir d'une map de couleurs. Convertit les noms de classe en hex.

#### `XyzToRgb` / `RgbtoXyz` / `XyztoLab` / `LabtoXyz`
- **Rôle** : Conversions entre espaces colorimétriques sRGB, XYZ (D65), et CIE LAB. Utilisées par `lighten`/`darken`.

#### Helpers intent/token (depuis v2.1)

#### `isIntent`
- **Signature** : `(v: TColor | TIntent | null | undefined) => v is TIntent`
- **Rôle** : Type guard — `v` est-il un intent sémantique connu (`COLOR_INTENTS` set) ?

#### `isUtilityIntent`
- **Signature** : `(v: TColor | TIntent | null | undefined) => v is TIntent`
- **Rôle** : Type guard — `v` est-il un intent pour lequel une classe utilitaire globale existe (exclut `'ghost'`).

#### `intentTokenBase`
- **Signature** : `(intent: TIntent) => string`
- **Rôle** : Résout le préfixe de token BEM pour un intent. Ex. : `'primary'` → `'action--primary'`, `'success'` → `'feedback--success'`.

#### `intentBgExpr`
- **Signature** : `(intent: TIntent, role: TBgFgRole) => string`
- **Rôle** : Construit l'expression CSS `var(--...)` pour le fond d'un intent selon l'état (`default`/`hover`/`active`/`disabled`). Utilise `color-mix()` comme fallback pour hover/active.

#### `intentFgExpr`
- **Signature** : `(intent: TIntent, role: TBgFgRole) => string`
- **Rôle** : Expression CSS pour la couleur de texte sur un intent (`fg` ou `fgDisabled`).

#### `tokenStylesForIntent`
- **Signature** : `(intent: TIntent, role?: TBgFgRole) => Record<string, string>`
- **Rôle** : Retourne un objet `{ 'background-color': ..., color: ... }` combinant fond + texte pour un intent à un état donné.

#### `rawBgExprWithState`
- **Signature** : `(raw: string, role: TBgFgRole) => string`
- **Rôle** : Applique `color-mix(in srgb, raw, black N%)` pour simuler hover/active sur une couleur brute (chemin legacy non-intent).

#### `tokenForegroundForIntent`
- **Signature** : `(intent: TIntent) => string`
- **Rôle** : Retourne la variable CSS `fgSubtle` pour les intents primaires/feedback, ou `fg` pour secondary/ghost/neutral. Utilisé pour `color="primary"` en texte coloré (pas fond+contraste).

#### `warnLegacyColor`
- **Signature** : `(kind: 'color' | 'bgColor' | ..., value: string) => void`
- **Rôle** : Affiche un warning une seule fois par (prop, valeur) pour signaler l'usage d'une couleur brute (dépréciée, suppression en v3.0.0).

---

### 1.4 Commons — Gradients (`gradient.util.ts`)

Fichier : `src/utils/Commons/gradient.util.ts`

#### `isGradient`
- **Signature** : `(value: unknown) => boolean`
- **Rôle** : Type guard — détecte un gradient CSS direct (`linear-gradient(...)`, etc.), un preset `gradient-{slug}`, ou un objet `IGradient`.

#### `gradientFromObject`
- **Signature** : `(g: IGradient) => string`
- **Rôle** : Construit la chaîne CSS d'un gradient depuis un descripteur structuré `IGradient` (`from`/`to`/`via` ou `stops[]`). Résout les intents en variables CSS.

#### `resolveGradient`
- **Signature** : `(value: TColor | IGradient) => string`
- **Rôle** : Point d'entrée unifié — retourne la valeur `background-image` CSS pour tout input gradient (string direct, preset, ou objet). Retourne `''` pour les inputs non-gradient.
- **Consommé par** : `useBackgroundColor`, `useColor`.

---

### 1.5 Commons — Animation (`animation.util.ts`)

Fichier : `src/utils/Commons/animation.util.ts`

#### `nullifyTransforms`
- **Signature** : `(el: HTMLElement) => IBox`
- **Rôle** : Calcule le bounding box d'un élément en annulant les transformations CSS (matrix/matrix3d). Retourne un `Box` avec position/taille corrigées.
- **Consommé par** : `location.util.ts`, `transition.util.ts`.

#### `animate`
- **Signature** : `(el: Element, keyframes: Array<Keyframe> | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions) => { finished: Promise<Animation> }`
- **Rôle** : Wrapper de `el.animate()` avec polyfill pour `animation.finished`. Retourne un objet inerte si `animate` n'est pas supporté.
- **Consommé par** : `useExpand`, composants de transition.

---

### 1.6 Commons — Anchor & Position (`anchor.util.ts`, `point.util.ts`, `location.util.ts`)

#### `parseAnchor`
- **Fichier** : `anchor.util.ts`
- **Signature** : `(anchor: TAnchor) => TParsedAnchor`
- **Rôle** : Parse une chaîne anchor (`'top left'`, `'bottom'`, etc.) en `{ side, align }`. Infère l'alignement si absent.

#### `flipSide` / `flipAlign` / `flipCorner` / `getAxis`
- **Fichier** : `anchor.util.ts`
- **Rôle** : Transformations géométriques sur un `TParsedAnchor`. `getAxis` retourne `AXIS.X` ou `AXIS.Y` selon le côté.
- **Consommé par** : `location.util.ts` (algorithme de flip overflow).

#### `elementToViewport` / `viewportToElement` / `getOffset` / `anchorToPoint` / `inViewport` / `getCenter`
- **Fichier** : `point.util.ts`
- **Rôle** : Transformations entre espaces de coordonnées (élément local ↔ viewport). `anchorToPoint` convertit un `TParsedAnchor` + `IBox` en coordonnée viewport.

#### `staticLocationStrategy` / `connectedLocationStrategy`
- **Fichier** : `location.util.ts`
- **Rôle** : Stratégies de positionnement pour les overlays.
  - `connectedLocationStrategy` : positionne un contenu "connecté" à un activateur, avec flip sur overflow viewport, shift, contraintes min/max. Utilise `ResizeObserver` pour se repositionner dynamiquement. Lit `props.viewportMargin` (défaut 12px) comme garde-fou bord de viewport.
- **Consommé par** : `useLocationStrategy`, `OrigamMenu`, `OrigamTooltip`, `OrigamSelect`.

#### `getIntrinsicSize` / `pixelRound` / `pixelCeil` / `isFixedPosition`
- **Fichier** : `location.util.ts`
- **Rôle** : Helpers internes à `connectedLocationStrategy`. `pixelRound`/`pixelCeil` arrondi au pixel physique (`devicePixelRatio`).

---

### 1.7 Commons — Activateur (`activator.util.ts`)

Fichier : `src/utils/Commons/activator.util.ts`

#### `activator`
- **Signature** : `(props: IActivatorProps, vm: ComponentInternalInstance, { activatorEl, activatorEvents }) => void`
- **Rôle** : Observe les changements du prop `activator`, lie/délie les props d'activation sur l'élément cible. Nettoyage via `onScopeDispose`.
- **Consommé par** : `useActivator`.

#### `getTargetActivator`
- **Signature** : `<T>(selector: T, vm: ComponentInternalInstance) => HTMLElement | undefined | [x, y]`
- **Rôle** : Résout le sélecteur d'activateur : `'parent'` remonte le DOM en ignorant `data-no-activator`, `'cursor'` retourne `body`, string CSS `querySelector`, `ComponentPublicInstance.$el`, tableau `[x,y]`, ou `HTMLElement` direct.

---

### 1.8 Commons — Props binding (`bindProps.util.ts`)

Fichier : `src/utils/Commons/bindProps.util.ts`

#### `bindProps` / `unbindProps`
- **Signature** : `(el: HTMLElement, props: Record<string, any>) => void`
- **Rôle** : Lie ou délie dynamiquement des props (attributs + event handlers) sur un `HTMLElement`. Utilise `HANDLERS` (Map globale) pour éviter les doublons de listeners.
- **Consommé par** : `activator.util.ts`.

---

### 1.9 Commons — Border / Rounded / Margin / Padding (`border.util.ts`, `rounded.util.ts`, `margin.util.ts`, `padding.util.ts`)

#### `formatBorderStylesVar`
- **Fichier** : `border.util.ts`
- **Signature** : `(values: Array<string>, type: string) => string[]`
- **Rôle** : Génère les déclarations CSS logiques pour un type de border (color/width/style) selon 1, 2 ou 4 valeurs.

#### `formatRoundedStylesVar`
- **Fichier** : `rounded.util.ts`
- **Signature** : `(values: Array<string>) => string[]`
- **Rôle** : Génère les déclarations CSS logiques de `border-radius` (1 ou 4 valeurs, notations `start-start`, `start-end`, etc.).

#### `formatMarginStylesVar`
- **Fichier** : `margin.util.ts`
- **Signature** : `(values: Array<string>) => string[]`
- **Rôle** : Génère les déclarations `margin` / `margin-block` / `margin-inline` CSS logiques (1 ou 4 valeurs).

#### `formatPaddingStylesVar`
- **Fichier** : `padding.util.ts`
- **Signature** : `(values: Array<string>) => string[]`
- **Rôle** : Génère les déclarations `padding` / `padding-block` / `padding-inline` CSS logiques (1, 2 ou 4 valeurs).

---

### 1.10 Commons — Box & Overflow (`box.util.ts`)

Fichier : `src/utils/Commons/box.util.ts`

#### `getOverflow`
- **Signature** : `(a: IBox, b: IBox) => { x: { before, after }, y: { before, after } }`
- **Rôle** : Calcule le dépassement de `a` hors des bornes de `b` pour chaque axe.
- **Consommé par** : `connectedLocationStrategy`.

#### `getTargetBox`
- **Signature** : `(target: HTMLElement | [x, y]) => IBox | DOMRect`
- **Rôle** : Retourne la bounding box d'un élément ou crée un `Box` de taille 0 pour une coordonnée `[x,y]`.
- **Consommé par** : `connectedLocationStrategy`, `transition.util.ts`.

---

### 1.11 Commons — Scroll (`scroll.util.ts`)

Fichier : `src/utils/Commons/scroll.util.ts`

#### `getScrollParent` / `getScrollParents`
- **Signature** : `(el?: HTMLElement, includeHidden?: boolean) => HTMLElement` / `(el?: Element | null, stopAt?: Element | null) => Array<HTMLElement>`
- **Rôle** : Remonte la chaîne DOM pour trouver le(s) parent(s) scrollables.

#### `hasScrollbar` / `isPotentiallyScrollable`
- **Signature** : `(el?: Element | null) => boolean`
- **Rôle** : Teste si un élément a une scrollbar active / pourrait scroller.

#### `closeScrollStrategy`
- **Signature** : `(data: IScrollStrategyData) => void`
- **Rôle** : Ferme un overlay dès qu'un scroll se produit dans ses parents.

#### `blockScrollStrategy`
- **Signature** : `(data: IScrollStrategyData, props: IScrollStrategyProps) => void`
- **Rôle** : Bloque le scroll de la page en injectant `--origam-body-scroll-x/y` et `--origam-scrollbar-offset`. Restaure le scroll à la destruction du scope.

#### `repositionScrollStrategy`
- **Signature** : `(data: IScrollStrategyData, props: IScrollStrategyProps, scope: EffectScope) => void`
- **Rôle** : Repositionne un overlay lors du scroll. Adaptatif : si le calcul est lent (> 2 frames), passe en mode "fin de scroll".

#### `bindScroll`
- **Signature** : `(el: HTMLElement | undefined, onScroll: (e: Event) => void) => void`
- **Rôle** : Attache un listener scroll sur `document` et tous les parents scrollables. Nettoyage via `onScopeDispose`.
- **Consommé par** : les trois stratégies ci-dessus.

---

### 1.12 Commons — GoTo (`goTo.util.ts`)

Fichier : `src/utils/Commons/goTo.util.ts`

#### `genDefaults`
- **Signature** : `() => Partial<IGoToOptions>`
- **Rôle** : Retourne les options par défaut (`duration: 300`, `easing: 'easeInOutCubic'`, 12 fonctions d'easing prédéfinies).

#### `getContainer` / `getTarget` / `getLocationOffset` / `clampTarget`
- **Rôle** : Résolution du conteneur scroll cible, offset d'un élément dans la page, et contrainte dans les bornes du scroll.

#### `scrollTo`
- **Signature** : `(target, options, horizontal?, goTo?) => Promise<number>`
- **Rôle** : Animation de scroll easing vers une cible (élément, sélecteur CSS, nombre). Utilise `requestAnimationFrame`. Supporte RTL, layout offset (`--origam-layout-top`).
- **Consommé par** : `useGoTo`.

---

### 1.13 Commons — Elevation (`elevation.util.ts`)

Fichier : `src/utils/Commons/elevation.util.ts`

#### `formatElevationStyle`
- **Signature** : `(elevation?: number, bgColor?: TColor) => string`
- **Statut** : **Déprécié depuis v0.4**. Remplacé par les tokens `--origam-shadow-{xs|sm|md|lg|xl}`. Sera supprimé en v3.0.0.
- **Rôle** : Génère un `box-shadow` calculé d'après le niveau d'élévation et la couleur de fond. La migration recommande `@include ds-elevation('md')` en SCSS.

---

### 1.14 Commons — Display (`display.util.ts`)

Fichier : `src/utils/Commons/display.util.ts`

#### `parseDisplayOptions`
- **Signature** : `(options?: IDisplayOptions) => IInternalDisplayOptions`
- **Rôle** : Fusionne les options utilisateur avec les options par défaut (`DEFAULT_DISPLAY_OPTIONS`).

#### `getClientWidth` / `getClientHeight`
- **Signature** : `(ssr?: TSSROptions) => number`
- **Rôle** : Lit la taille du viewport, compatible SSR (retourne `0` ou la valeur SSR fournie).

#### `getPlatform`
- **Signature** : `(ssr?: TSSROptions) => IDisplayPlatform`
- **Rôle** : Détecte l'environnement (android, ios, cordova, electron, chrome, edge, firefox, opera, win, mac, linux, touch, ssr) via `userAgent`.
- **Consommé par** : `useDisplay`.

---

### 1.15 Commons — Locale (`locale.util.ts`)

Fichier : `src/utils/Commons/locale.util.ts`

#### `createVueI18nAdapter`
- **Signature** : `(options: ILocaleI18n) => ILocaleInstance`
- **Rôle** : Crée un adaptateur i18n wrappant `vue-i18n`. Expose `current`, `fallback`, `messages`, `t`, `n`, `provide`. Gère les cas où `vue-i18n.t()` lancerait `SyntaxError`.

#### `createProvideFunction`
- **Signature** : `(data: { current, fallback, messages, useI18n }) => (props: ILocaleProps) => ILocaleInstance`
- **Rôle** : Génère la fonction `provide` d'une instance locale. Crée une portée i18n locale (`useScope: 'local'`) synchronisée avec la locale parente.

#### `useProvided`
- **Signature** : `<T>(props: any, prop: string, provided: Ref<T>) => Ref<T>`
- **Rôle** : Crée un modèle bidirectionnel héritant de la valeur parente si la prop locale n'est pas définie.
- **Consommé par** : `createProvideFunction`.

---

### 1.16 Commons — Group & Nested (`group.util.ts`, `nested.util.ts`)

#### `getItemIndex` / `getIds` / `getValues`
- **Fichier** : `group.util.ts`
- **Rôle** : Utilitaires de résolution d'identifiants dans un groupe d'items sélectionnables. `getIds` résout des valeurs en ids internes (via `deepEqual`). `getValues` fait l'inverse.
- **Consommé par** : `useGroup`.

#### `independentSelectStrategy` / `independentSingleSelectStrategy` / `leafSelectStrategy` / `leafSingleSelectStrategy` / `classicSelectStrategy`
- **Fichier** : `nested.util.ts`
- **Signature** : `(mandatory?: boolean) => TStrategySelect`
- **Rôle** : Stratégies de sélection pour les arbres imbriqués. `classicSelectStrategy` propage la sélection aux enfants et remonte l'état `indeterminate` aux parents. `leafSelectStrategy` bloque les nœuds ayant des enfants.
- **Consommé par** : `useNested`, `OrigamTreeview`.

---

### 1.17 Commons — Hotkey (`hotkey.util.ts`)

Fichier : `src/utils/Commons/hotkey.util.ts`

#### `splitKeyCombination`
- **Signature** : `(combination: string, isInternal?: boolean) => string[]`
- **Rôle** : Découpe une combinaison de touches (`'ctrl+k'`, `'shift+-'`) en tableau de clés. Valide la structure (pas de `++`, `--`, séparateurs invalides). Normalise via `normalizeKey`.

#### `splitKeySequence`
- **Signature** : `(str: string) => string[]`
- **Rôle** : Découpe une séquence de combinaisons séparées par `-` (ex. `'a-b'`, `'ctrl+k-p'`). Gère les cas edge des clés `-`, `--`, `--+`.

#### `normalizeKey`
- **Signature** : `(key: string) => string`
- **Rôle** : Normalise un nom de touche en forme canonique via `KEYBOARD_ALIASES` (ex. `'esc'` → `'escape'`).
- **Consommé par** : `useHotkey`.

---

### 1.18 Commons — Événements (`event.util.ts`, `eventListener.util.ts`)

#### `getPrefixedEventHandlers`
- **Fichier** : `event.util.ts`
- **Signature** : `<T extends ':...'>(attrs: Record<string, any>, suffix: T, getData: TEventHandler) => Record<..., TEventHandler>`
- **Rôle** : Filtre les attributs `onXxx{suffix}` et les re-projette sans le suffixe, en injectant `getData(event)` comme second argument du handler.
- **Consommé par** : composants DataTable (colonnes avec handlers suffixés).

#### `resolveUnref` / `unrefElement`
- **Fichier** : `eventListener.util.ts`
- **Signature** : `resolveUnref(r: Ref | (() => unknown)) => unknown` / `unrefElement(elRef: Ref) => HTMLElement`
- **Rôle** : Déréférence un `Ref` ou une fonction factory. `unrefElement` extrait l'HTMLElement en préférant `.$el` pour les composants Vue.

---

### 1.19 Commons — Ripple (`ripple.util.ts`)

Fichier : `src/utils/Commons/ripple.util.ts`

Contient toute la logique événementielle du ripple, utilisée exclusivement par `v-ripple`.

#### `updateRipple`
- **Signature** : `(el: IRippleHtmlElement, binding: IRippleDirectiveBinding, wasEnabled: boolean) => void`
- **Rôle** : Active ou désactive les listeners ripple sur un élément selon la valeur du binding. Gère les modifiers `stop`, `center`, `circle`.

#### `isRippleEnabled`
- **Signature** : `(value: any) => value is true`
- **Rôle** : `undefined` ou toute valeur truthy → activé.

#### `isTouchEvent` / `isKeyboardEvent`
- **Signature** : `(e: TRippleEvent) => boolean`
- **Rôle** : Type guards sur l'événement déclencheur.

#### `calculate`
- **Signature** : `(e: TRippleEvent, el: IRippleHtmlElement, value?: IRippleOptions) => { radius, scale, x, y, centerX, centerY }`
- **Rôle** : Calcule la géométrie du cercle d'ondulation depuis la position du click/touch.

#### `rippleShow` / `rippleHide` / `rippleStop` / `rippleCancelShow`
- **Rôle** : Handlers des événements souris/tactile. `rippleShow` gère le délai tactile (250ms via `DELAY_RIPPLE`).

#### `keyboardRippleShow` / `keyboardRippleHide` / `focusRippleHide`
- **Rôle** : Déclenche/arrête le ripple sur Espace/Entrée (accessibilité clavier) et perd le focus.

#### `rippleRemoveListeners`
- **Rôle** : Désinscrit tous les listeners ripple d'un élément.

#### `rippleTransform`
- **Signature** : `(el: IRippleHtmlElement, value: string) => void`
- **Rôle** : Applique `transform` + `webkitTransform` simultanément.

---

### 1.20 Commons — Hover (`hover.util.ts`)

Fichier : `src/utils/Commons/hover.util.ts`

#### `updateHover`
- **Signature** : `(el: IHoverHtmlElement, binding: IHoverDirectiveBinding, wasEnabled: boolean, name: string) => void`
- **Rôle** : Gère l'activation/désactivation des listeners hover. Stocke la classe CSS hover dans `el._hover.class`. Supporte le modifier `stop` pour bloquer la propagation.

#### `isHoverEnabled` / `hoverShow` / `hoverHide` / `hoverStop` / `hoverRemoveListeners`
- **Rôle** : Handlers d'événements souris/touch pour le hover. Gère les doublons touch/mouse sur Android/iOS via `el._hover.isTouch`.

---

### 1.21 Commons — Touch (`touch.util.ts`)

Fichier : `src/utils/Commons/touch.util.ts`

#### `handleGesture`
- **Signature** : `(wrapper: TTouchWrapper) => void`
- **Rôle** : Détecte les swipes (gauche, droite, haut, bas) en comparant positions start/end. Seuil minimal 16px, ratio directionnel 0.5.

#### `touchstart` / `touchend` / `touchmove`
- **Rôle** : Enregistrent les coordonnées tactiles dans le wrapper et appellent les callbacks `start`, `end`, `move`. `touchend` déclenche `handleGesture`.

#### `createHandlers`
- **Signature** : `(value?: ITouchHandlers) => ITouchStoredHandlers`
- **Rôle** : Crée les 3 handlers bound (`touchstart`, `touchend`, `touchmove`) à partir des callbacks utilisateur.
- **Consommé par** : `v-touch`.

---

### 1.22 Commons — Intersect (`intersect.util.ts`)

Fichier : `src/utils/Commons/intersect.util.ts`

#### `unmountIntersect`
- **Signature** : `(el: IIntersectHtmlElement, binding: IIntersectDirectiveBinding) => void`
- **Rôle** : Arrête l'observation IntersectionObserver pour l'instance Vue liée et supprime l'entrée dans `el._observe`.
- **Consommé par** : `v-intersect`.

---

### 1.23 Commons — ClickOutside (`clickOutside.util.ts`)

Fichier : `src/utils/Commons/clickOutside.util.ts`

#### `checkEvent`
- **Signature** : `(e: MouseEvent, el: HTMLElement, binding: IClickOutsideDirectiveBinding) => boolean`
- **Rôle** : Vérifie si le click était réellement hors des éléments concernés. Gère Shadow DOM (hôte shadow ignoré). Supporte `binding.value.include` pour inclure des éléments supplémentaires.

#### `checkIsActive`
- **Signature** : `(e: MouseEvent, binding: IClickOutsideDirectiveBinding) => boolean | void`
- **Rôle** : Appelle `binding.value.closeConditional` ou un défaut `true`.

#### `directive`
- **Signature** : `(e: MouseEvent, el: HTMLElement, binding: IClickOutsideDirectiveBinding) => void`
- **Rôle** : Orchestrateur — vérifie que le mousedown était hors de l'élément (`lastMousedownWasOutside`) avant d'appeler le handler.

#### `handleShadow`
- **Signature** : `(el: HTMLElement, callback: (root: Document | ShadowRoot) => void) => void`
- **Rôle** : Exécute `callback` sur `document` ET sur la `ShadowRoot` si l'élément est dans un shadow DOM.
- **Consommé par** : `v-click-outside`.

---

### 1.24 Commons — Layout (`layout.util.ts`)

Fichier : `src/utils/Commons/layout.util.ts`

#### `generateLayers`
- **Signature** : `(layout: string[], positions: Map<string, Ref<TDirectionBoth>>, layoutSizes: Map<string, Ref<number | string>>, activeItems: Map<string, Ref<boolean>>) => Array<{ id: string, layer: ILayer }>`
- **Rôle** : Calcule les couches d'empilement du layout (top/left/right/bottom) en accumulant les tailles de chaque item actif dans l'ordre du tableau `layout`.
- **Consommé par** : `useLayout`, `OrigamLayout`.

---

### 1.25 Commons — ForwardRefs (`forwardRefs.util.ts`)

Fichier : `src/utils/Commons/forwardRefs.util.ts`

#### `forwardRefs`
- **Signature** : `<T, U extends Ref[]>(target: T, ...refs: U) => T & TUnionToIntersection<...>`
- **Rôle** : Crée un proxy sur `target` qui délègue `get`/`set`/`has`/`getOwnPropertyDescriptor` aux refs enfants dans l'ordre. Permet à un composant parent d'exposer les méthodes de ses enfants via `defineExpose`.
- **Consommé par** : `OrigamTextField`, `OrigamField`, etc.

#### `getDescriptor`
- **Signature** : `(obj: any, key: PropertyKey) => PropertyDescriptor | undefined`
- **Rôle** : Remonte la chaîne prototype pour trouver un descripteur de propriété.

---

### 1.26 Commons — getCurrentInstance (`getCurrentInstance.util.ts`)

Fichier : `src/utils/Commons/getCurrentInstance.util.ts`

#### `getLifeCycleTarget`
- **Signature** : `(target?: any) => ComponentInternalInstance | null`
- **Rôle** : Retourne `target` ou l'instance Vue courante.

#### `getCurrentInstance`
- **Signature** : `(name: string, message?: string) => ComponentInternalInstance`
- **Rôle** : Récupère l'instance Vue courante ou lance une erreur descriptive si appelé hors setup.

#### `getCurrentInstanceName`
- **Signature** : `(name?: string) => string`
- **Rôle** : Retourne le nom kebab-case du composant courant (depuis `aliasName`, `name`, ou `__name`).

#### `getUid`
- **Signature** : `() => number`
- **Rôle** : Génère un UID stable par instance de composant (WeakMap). Expose `getUid.reset()` pour les tests.
- **Consommé par** : `useId`, directives.

---

### 1.27 Commons — Velocity (`velocity.util.ts`)

Fichier : `src/utils/Commons/velocity.util.ts`

#### `calculateImpulseVelocity`
- **Signature** : `(samples: Array<ISample>) => number`
- **Rôle** : Calcule la vélocité impulsionnelle à partir d'un historique de positions/timestamps (ordre décroissant). Algorithme énergie cinétique pour 3+ points, linéaire pour 2 points.
- **Consommé par** : `useSlideGroup`, `OrigamCarousel`.

#### `kineticEnergyToVelocity`
- **Signature** : `(work: number) => number`
- **Rôle** : `±√|2·work|`. Conversion interne énergie cinétique → vitesse scalaire.

---

### 1.28 Commons — Virtual (`virtual.util.ts`)

Fichier : `src/utils/Commons/virtual.util.ts`

#### `binaryClosest`
- **Signature** : `(arr: ArrayLike<number>, val: number) => number`
- **Rôle** : Recherche binaire de l'index du plus proche élément inférieur ou égal à `val` dans un tableau trié. Retourne l'index de fin si `val` dépasse le maximum.
- **Consommé par** : `useVirtual` (calcul de l'offset de départ de la liste virtuelle).

---

### 1.29 Commons — Autocomplete (`autocomplete.util.ts`)

Fichier : `src/utils/Commons/autocomplete.util.ts`

#### `isComposingIgnoreKey`
- **Signature** : `(e: KeyboardEvent) => boolean`
- **Rôle** : Retourne `true` si l'événement est en composition IME ET la touche est dans `COMPOSITION_IGNORE_KEYS`. Évite les faux positifs lors de la saisie de caractères CJK.
- **Consommé par** : `OrigamAutocomplete`.

---

### 1.30 Commons — Filters (`filters.util.ts`)

Fichier : `src/utils/Commons/filters.util.ts`

#### `defaultFilter`
- **Signature** : `(value: string | number, query: string | number) => number`
- **Rôle** : Recherche case-insensitive de `query` dans `value`. Retourne l'index de la correspondance ou `-1`.

#### `filterItems`
- **Signature** : `(items: ..., query: string, options?: { customKeyFilter?, default?, filterKeys?, filterMode?, noFilter? }) => Array<{ index, matches }>`
- **Rôle** : Filtre une liste d'items selon une requête. Supporte les modes `'every'`, `'union'`, `'intersection'` pour les filtres par clé multiples. Retourne les indices des items correspondants avec leur map de matches.
- **Consommé par** : `useFilter`, `OrigamAutocomplete`, `OrigamCombobox`.

---

### 1.31 Commons — Format Bytes (`format-bytes.util.ts`)

Fichier : `src/utils/Commons/format-bytes.util.ts`

#### `formatBytes`
- **Signature** : `(bytes: number, decimals?: number) => string`
- **Rôle** : Formate des octets en `'1.2 KB'` / `'3.4 MB'` etc. Base 1024, suffixes SI. `0` → `'0 B'`. Valeurs non-finies ou négatives → `'0 B'`.
- **Consommé par** : `OrigamFileField` (prop `showSize`).

---

### 1.32 Commons — RequestNewFrame (`requestNewFrame.util.ts`)

Fichier : `src/utils/Commons/requestNewFrame.util.ts`

#### `requestNewFrame`
- **Signature** : `(cb: () => void) => void`
- **Rôle** : Planifie `cb` dans un frame d'animation dédié. Les callbacks sont mis en file si plusieurs appels arrivent dans le même frame, évitant le jank sur les calculs lourds.
- **Consommé par** : `repositionScrollStrategy`, composables d'animation.

---

### 1.33 Commons — Date (`date.util.ts` — Commons)

Fichier : `src/utils/Commons/date.util.ts`

Bibliothèque de fonctions date pur-JS, SSR-safe. Aucune dépendance externe.

Fonctions exportées : `createInstance`, `date`, `parseLocalDate`, `toISO`, `parseISO`, `addMinutes`, `addHours`, `addDays`, `addWeeks`, `addMonths`, `getYear`, `getMonth`, `getDate`, `getNextMonth`, `getPreviousMonth`, `getHours`, `getMinutes`, `startOfYear`, `endOfYear`, `isWithinRange`, `isValid`, `isAfter`, `isAfterDay`, `isBefore`, `isEqual`, `isSameDay`, `isSameMonth`, `isSameYear`, `getDiff`, `setHours`, `setMinutes`, `setMonth`, `setDate`, `setYear`, `startOfDay`, `endOfDay`, `getWeekArray`, `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `formatDate`, `getWeekdays`, `getWeek`.

Points notables :
- `createInstance` : crée une instance `IDateAdapter` réactive qui synchronise la locale du watcher.
- `formatDate` : 22 formats nommés (`fullDate`, `keyboardDateTime24h`, etc.) via `Intl.DateTimeFormat`. Support des formats personnalisés via `TCustomDateFormat`.
- `getWeekArray` : génère un tableau de semaines pour un mois, locale-aware (premier jour de semaine via `FIRST_DAY` const).
- **Consommé par** : `DateAdapter`, `createInstance`, composants Calendar/DatePicker.

---

### 1.34 Commons — Console (`console.util.ts`)

Fichier : `src/utils/Commons/console.util.ts`

#### `consoleWarn` / `consoleError`
- **Signature** : `(message: string) => void`
- **Rôle** : Wrappers de `Vue.warn()` préfixant le message par `'Origam: '` ou `'Origam error: '`.
- **Consommé par** : partout dans le DS.

---

## 2. Utils domaine — Calendar

### 2.1 `Calendar/date.util.ts`

Fichier : `src/utils/Calendar/date.util.ts`

Ré-exporte un sous-ensemble des helpers Commons et ajoute des helpers spécifiques au composant `OrigamCalendar`.

#### `toDate`
- **Signature** : `(value: Date | string | number | null | undefined) => Date | null`
- **Rôle** : Coerce n'importe quelle représentation vers `Date`. Retourne `null` pour les valeurs invalides.

#### `startOfWeekFixed` / `endOfWeekFixed`
- **Signature** : `(date: Date, firstDayOfWeek: number) => Date`
- **Rôle** : Début/fin de semaine avec `firstDayOfWeek` explicite (ne passe pas par la locale).

#### `isToday` / `isPast` / `isWeekend`
- **Signature** : `(date: Date) => boolean`
- **Rôle** : Prédicats de date courants pour l'affichage du calendrier (surbrillance today, fade past, weekend stripe).

#### `diffMinutes`
- **Signature** : `(a: Date, b: Date) => number`
- **Rôle** : Différence en minutes entre deux dates. Utilisé pour calculer la hauteur des événements dans les vues timeline.

#### `formatTime`
- **Signature** : `(date: Date, format: '12h' | '24h', locale?: string) => string`
- **Rôle** : Formate une heure en `HH:MM` (24h) ou `H:MM AM/PM` (12h) via `Intl.DateTimeFormat`.

#### `formatDate`
- **Signature** : `(date: Date, locale: string, options: Intl.DateTimeFormatOptions) => string`
- **Rôle** : Formateur générique via `Intl.DateTimeFormat`.

#### `buildMonthMatrix`
- **Signature** : `(date: Date, firstDayOfWeek: number) => Array<Array<Date>>`
- **Rôle** : Construit une grille 6×7 (6 lignes de semaines) pour le mois contenant `date`. Stable en hauteur quelle que soit la configuration du mois.

#### `isoWeekNumber`
- **Signature** : `(date: Date) => number`
- **Rôle** : Numéro de semaine ISO 8601 (semaine 1 = première semaine contenant un jeudi). Utilisé pour la colonne `showWeekNumbers`.

#### `buildDisabledPredicate`
- **Signature** : `(input: Array<Date | string> | ((d: Date) => boolean) | undefined) => (date: Date) => boolean`
- **Rôle** : Normalise `disabledDates` (tableau ou fonction) en prédicat `(date) => boolean`. Le tableau est converti en `Set` pour O(1) lookups.

#### `eachDayOfInterval`
- **Signature** : `(from: Date, to: Date) => Array<Date>`
- **Rôle** : Itérateur jour par jour de `from` à `to` inclus (en `startOfDay`).

#### `getWeekdayNames`
- **Signature** : `(locale: string, firstDayOfWeek: number, length?: 'narrow' | 'short' | 'long') => Array<string>`
- **Rôle** : Noms des jours de la semaine localisés, rotés selon `firstDayOfWeek`.

---

### 2.2 `Calendar/rrule.util.ts`

Fichier : `src/utils/Calendar/rrule.util.ts`

#### `parseRRule`
- **Signature** : `(rrule: string) => IParsedRule | null`
- **Rôle** : Parse un sous-ensemble RFC 5545 (`FREQ=DAILY|WEEKLY|MONTHLY`, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY`). Retourne `null` pour les fréquences non supportées.

#### `expandRecurrence`
- **Signature** : `(event: IEvent, range: { start: Date, end: Date }) => Array<IEvent>`
- **Rôle** : Génère toutes les occurrences d'un événement récurrent dans une fenêtre. Plafond `MAX_OCCURRENCES = 366*3` (protection anti-boucle infinie). Strips `rrule` des occurrences générées.
- **Consommé par** : `OrigamCalendar`.

---

## 3. Utils domaine — Chart

### 3.1 `Chart/path.util.ts`

Fichier : `src/utils/Chart/path.util.ts`

Toutes les fonctions sont pures, stateless, SSR-safe (aucun accès DOM).

#### `linePath`
- **Signature** : `(points: Array<TPathPoint>) => string`
- **Rôle** : Chemin SVG `M…L…L…` à segments droits.

#### `smoothPath`
- **Signature** : `(points: Array<TPathPoint>) => string`
- **Rôle** : Courbe Catmull-Rom → Bézier cubique (tension 0.5). Fallback `linePath` si < 3 points.

#### `monotonePath`
- **Signature** : `(points: Array<TPathPoint>) => string`
- **Rôle** : Spline Bézier monotone (Fritsch-Carlson). Aucun dépassement aux pics. Algorithme de référence pour les charts production.

#### `steppedPath`
- **Signature** : `(points: Array<TPathPoint>) => string`
- **Rôle** : Polyline en escalier (horizontal puis vertical). Pour les visualisations d'états discrets.

#### `areaPath`
- **Signature** : `(points: Array<TPathPoint>, baselineY: number, smooth?: boolean | 'monotone' | 'stepped') => string`
- **Rôle** : Ferme le chemin de ligne vers la baseline pour créer la forme d'un chart d'aires.

#### `arcPath`
- **Signature** : `(cx, cy, outerR, innerR, startAngle, endAngle) => string`
- **Rôle** : Arc SVG pour secteur de camembert (`innerR=0`) ou donut. Angles en radians (convention mathématique, converti SVG en interne).

#### `polygonPath`
- **Signature** : `(points: Array<TPathPoint>) => string`
- **Rôle** : Polygone fermé (radar chart fill).

#### `pathLength` / `steppedPathLength`
- **Signature** : `(points: Array<TPathPoint>) => number`
- **Rôle** : Longueur d'une polyligne Cartésienne / Manhattan (pour `stroke-dasharray` des animations d'entrée).

#### `polarToCartesian`
- **Signature** : `(cx, cy, radius, angle) => TPathPoint`
- **Rôle** : Conversion polaire → Cartésien (convention mathématique). Pour le positionnement des labels radar/pie.

### 3.2 `Chart/box-plot.util.ts`

Fichier : `src/utils/Chart/box-plot.util.ts`

#### `computeQuartiles`
- **Signature** : `(samples: Array<number>) => IBoxPlotStats`
- **Rôle** : Calcule le résumé de Tukey 5-nombres (min whisker, Q1, médiane, Q3, max whisker) + liste des outliers (règle 1.5×IQR). Interpolation linéaire PERCENTILE.INC.

#### `isRawDatum`
- **Signature** : `(datum: unknown) => datum is { category: string, samples: Array<number>, color?: string }`
- **Rôle** : Type guard — distingue les données brutes (tableau `samples`) des stats pré-agrégées.
- **Consommé par** : `OrigamChartBoxPlot`.

### 3.3 `Chart/mercator.util.ts`

Fichier : `src/utils/Chart/mercator.util.ts`

#### `mercatorProject`
- **Signature** : `(lng, lat, width?, height?) => [x, y]`
- **Rôle** : Projection Web Mercator (EPSG:3857) → pixels SVG (canvas 1000×500 par défaut). Clipping à ±85°.

#### `polygonToSvgPath` / `multiPolygonToSvgPath`
- **Signature** : `(polygon: Array<[number, number]>, width?, height?) => string`
- **Rôle** : Convertit un ou plusieurs polygones géographiques `[lng, lat][]` en attribut `d` SVG fermé.

#### `multiPolygonCentroid`
- **Signature** : `(multi: Array<Array<[number, number]>>, width?, height?) => [x, y]`
- **Rôle** : Centroïde géographique (moyenne arithmétique des sommets) projeté en pixels SVG.
- **Consommé par** : `OrigamChartMap`.

---

## 4. Utils domaine — Code

### `Code/parse-highlight-lines.util.ts`

#### `parseHighlightLines`
- **Signature** : `(input: number[] | string | null | undefined) => number[]`
- **Rôle** : Normalise le prop `highlight-lines` de `OrigamCode`. Accepte tableau de numéros ou chaîne `'1,3-5,7'`. Retourne tableau trié dédupliqué de numéros de lignes 1-based.
- **Consommé par** : `OrigamCode`.

---

## 5. Utils domaine — ColorPicker

### `ColorPicker/color-picker.util.ts`

#### `stripAlpha`
- **Signature** : `(color: any, stripAlpha: boolean) => any`
- **Rôle** : Supprime la propriété `a` du résultat si `stripAlpha` est vrai.

#### `extractColor`
- **Signature** : `(color: THSVA, input: any) => any`
- **Rôle** : Convertit `THSVA` vers le format de sortie correspondant au type de `input` (hex string, RGBA, HSL, ou HSV brut). Gère l'opacité.

#### `hasAlpha`
- **Signature** : `(color: any) => boolean`
- **Rôle** : Vérifie si une couleur possède une composante alpha (hex 8 chars, ou objet avec `a`/`alpha`).
- **Consommé par** : `OrigamColorPicker`.

---

## 6. Utils domaine — CommandPalette

### `CommandPalette/fuzzy-match.util.ts`

#### `fuzzyMatch<T>`
- **Signature** : `(items: ReadonlyArray<T>, query: string, getHaystack: (item: T) => { label: string, haystack: string }) => Array<IFuzzyMatchResult<T>>`
- **Rôle** : Filtre et classe des items par correspondance de sous-séquences. Score composite : runs consécutifs (×4), position premiere lettre dans label (bonus décroissant jusqu'à 30), préfixe label exact (+50). Retourne tout si `query` vide.
- **Consommé par** : `OrigamCommandPalette`.

---

## 7. Utils domaine — DataList

### `DataList/data-list-kv-item-value-component.util.ts`

#### `isDataListKVItemValueComponent`
- **Signature** : `(v: IDataListKVItem['value']) => v is IDataListKVItemValueComponent`
- **Rôle** : Type guard — vérifie la présence de la propriété `component` pour distinguer un composant dynamique d'une valeur scalaire dans une KV row.
- **Consommé par** : `OrigamDataListKV`.

---

## 8. Utils domaine — DataTable

### `DataTable/group.util.ts`

#### `groupItemsByProperty`
- **Signature** : `<T extends IDataTableGroupableItem>(items: Array<T>, groupBy: string) => Map<any, Array<T>>`
- **Rôle** : Groupe les items par la valeur d'une propriété (lecture via `getObjectValueByPath`).

#### `groupItems`
- **Signature** : `<T>(items, groupBy: string[], depth?, prefix?) => Array<IDataTableGroup<T>>`
- **Rôle** : Groupe récursif multi-niveaux. Chaque groupe a un `id` stable `prefix_key_value`.

#### `flattenItems`
- **Signature** : `<T>(items, opened: Set<string>) => Array<T | IDataTableGroup<T>>`
- **Rôle** : Aplatit la hiérarchie en respectant les groupes ouverts (`opened` Set d'ids).
- **Consommé par** : `useDataTableGroup`, `OrigamDataTable`.

### `DataTable/headers.util.ts`

#### `extractKeys` / `convertToInternalHeaders` / `parseFixedColumns` / `parseHeaderItems`
- **Rôle** : Pipeline de normalisation des en-têtes. `convertToInternalHeaders` déduit `key`/`value`/`sortable`. `parseFixedColumns` propage `fixed`/`lastFixed`/`fixedOffset`. `parseHeaderItems` construit la grille multi-niveaux avec `rowspan`/`colspan`.

#### `getHeaderDepth` / `extractLeaves` / `priorityQueue`
- **Rôle** : Helpers internes pour l'algorithme de rendu d'en-têtes imbriqués. `priorityQueue` est un min-heap simple.
- **Consommé par** : `useDataTableHeaders`, `OrigamDataTable`.

### `DataTable/items.util.ts`

#### `transformDataTableItem` / `transformDataTableItems`
- **Signature** : `(props, item, index, columns) => IDataTableItem`
- **Rôle** : Normalise un item brut en `IDataTableItem` structuré avec `value`, `key`, `selectable`, `columns` (map clé → valeur extraite).
- **Consommé par** : `useDataTableItems`, `OrigamDataTable`.

### `DataTable/sort.util.ts`

#### `sortItems`
- **Signature** : `<T extends IInternalItem>(items: T[], sortByItems: IDataTableSortItem[], options?) => T[]`
- **Rôle** : Tri multi-clé stable. Supporte les fonctions de tri personnalisées (`sortFunctions`/`sortRawFunctions`), les dates, et `localCompare`. Gère DESC en permutant les opérandes.
- **Consommé par** : `useDataTableSort`, `OrigamDataTable`.

---

## 9. Utils domaine — Input

### `Input/input.util.ts`

#### `filterInputAttrs`
- **Signature** : `(attrs: Record<string, unknown>) => [rootAttrs, inputAttrs]`
- **Rôle** : Partitionne les `$attrs` : `class`, `style`, `id`, `data-*` + événements bubbling → root. Autres événements + attributs → `<input>` interne.
- **Consommé par** : `OrigamInput`, `OrigamTextField`.

---

## 10. Utils domaine — List

### `List/list-item.util.ts`

#### `transformListItem` / `transformListItems`
- **Signature** : `(props, item) => IInternalListItem`
- **Rôle** : Normalise un item (string ou object) en `IInternalListItem` avec `title`, `value`, `props`, `children` (récursif), `raw`.
- **Consommé par** : `useListItems`, `OrigamList`, `OrigamAutocomplete`.

---

## 11. Utils domaine — Mask

### `Mask/apply-mask.util.ts`

#### `parsePattern`
- **Signature** : `(pattern: string) => Array<IMaskToken>`
- **Rôle** : Parse un pattern en tokens (`digit`/`letter`/`any`/`literal`). Cache module-scope `TOKEN_CACHE`.

#### `applyMask`
- **Signature** : `(value: string, pattern: string) => IMaskApplyResult`
- **Rôle** : Applique le masque en single-pass. Strip d'abord les littéraux, puis walk les tokens. Retourne `{ masked, unmasked, complete }`.

#### `unmaskValue`
- **Signature** : `(value: string, pattern: string) => string`
- **Rôle** : Raccourci vers `applyMask(...).unmasked`.
- **Consommé par** : `useMask`, `OrigamMaskedInput`.

### `Mask/resolve-mask-config.util.ts`

#### `resolveMaskConfig`
- **Signature** : `(mask: TMask | undefined) => IResolvedMaskConfig | null`
- **Rôle** : Normalise le prop `mask` polymorphe (null, string, `IMaskOptions`) en `{ pattern, validator, required }`. Résout les built-ins via `BUILT_IN_PATTERNS`.

### `Mask/validate-pattern.util.ts`

#### `isLuhnValid`
- **Signature** : `(digits: string) => boolean`
- **Rôle** : Algorithme de Luhn (validation carte bancaire/IMEI/SIRET).

#### `isIbanValid`
- **Signature** : `(raw: string) => boolean`
- **Rôle** : Validation IBAN ISO 13616 (réarrangement + mod-97 incrémental sans BigInt).

#### `isIsoDateValid` / `isFrDateValid` / `isUsDateValid`
- **Signature** : `(unmasked: string) => boolean`
- **Rôle** : Validation calendaire pour les formats YYYYMMDD / DDMMYYYY / MMDDYYYY.

#### `validatePattern`
- **Signature** : `(unmasked: string, validator: TPatternValidator) => boolean`
- **Rôle** : Exécute un validateur nommé (lookup dans `VALIDATORS`) ou une fonction custom.
- **Consommé par** : `useMask`.

---

## 12. Utils domaine — Media

### `Media/format-time.util.ts`

#### `formatMediaTime`
- **Signature** : `(seconds: number) => string`
- **Rôle** : Formate une durée en `mm:ss` ou `h:mm:ss`. Retourne `'--:--'` pour les valeurs négatives ou non-finies.
- **Consommé par** : `OrigamMediaController`, `OrigamAudio`, `OrigamVideo`.

---

## 13. Utils domaine — Parallax

### `Parallax/parallax-element.util.ts`

#### `elementMovement`
- **Signature** : `(action: IParallaxElementMovement) => { x, y, target }`
- **Rôle** : Calcule le déplacement X/Y d'un élément en fonction de la position du pointeur et de la force (`strength`). Supporte les clamping min/max et le mode scroll.

#### `cyclicMovement`
- **Signature** : `(cycleData: IParallaxElementCicle) => TPoint`
- **Rôle** : Calcule un déplacement sinusoïdal cyclique (effet pendulaire) basé sur la position radiale dans la forme conteneur.
- **Consommé par** : `OrigamParallax`.

---

## 14. Utils domaine — QrCode

### `QrCode/qr-code-adapters.util.ts`

#### `resolveQrColor`
- **Signature** : `(value: TColor | undefined | null, role: 'foreground' | 'background', fallback: string) => string`
- **Rôle** : Résout un intent/couleur vers une string CSS utilisable dans un attribut SVG `fill`. `'foreground'` → `fgSubtle` (couleur propre de l'intent), `'background'` → `bg` (surface de l'intent).

#### `resolveQrCornerRadius`
- **Signature** : `(value: TRounded | number | boolean | string | null | undefined) => number`
- **Rôle** : Convertit le prop `rounded` DS en rayon de module `[0, 0.5]`. Mapping `ROUNDED_TO_CORNER` de `x-small` (0.10) à `x-large` (0.50).
- **Consommé par** : `OrigamQrCode`.

---

## 15. Utils domaine — Slide

### `Slide/slide-group.util.ts`

#### `calculateUpdatedTarget`
- **Signature** : `({ selectedElement, containerElement, isRtl, isHorizontal }) => number`
- **Rôle** : Calcule la position de scroll pour rendre visible un élément sélectionné, avec un offset de 40% de la taille de l'enfant pour contextualiser.

#### `calculateCenteredTarget`
- **Signature** : `({ selectedElement, containerElement, isHorizontal }) => number`
- **Rôle** : Calcule la position de scroll pour centrer un élément sélectionné dans son conteneur.

#### `getScrollSize` / `getClientSize` / `getScrollPosition` / `getOffsetSize` / `getOffsetPosition`
- **Rôle** : Abstractions directionnelles (horizontal/vertical, RTL). `getScrollPosition` gère le scroll négatif en RTL.
- **Consommé par** : `useSlideGroup`, `OrigamSlideGroup`, `OrigamTabs`.

---

## 16. Utils domaine — Textarea

### `Textarea/sanitize-html.util.ts`

#### `sanitizeHtml`
- **Signature** : `(input: string) => string`
- **Rôle** : Sanitise du HTML via `DOMParser`. Supprime les tags `BLOCKED_TAGS`, préserve les `ALLOWED_TAGS` (avec filtrage d'attributs), désenveloppe le reste. Supprime tout attribut `on*`. Valide les URLs via `ALLOWED_URL_SCHEMES`. Filtre les classes CSS par `ALLOWED_CLASS_PREFIX`. SSR-safe (retourne input si `DOMParser` absent).
- **Consommé par** : `OrigamTextareaField` (mode rich).

### `Textarea/html-to-markdown.util.ts`

#### `htmlToMarkdown`
- **Signature** : `(input: string) => string`
- **Rôle** : Convertit le HTML riche de l'éditeur en Markdown. Supporte : `strong`/`b`, `em`/`i`, `u`, `a`, `ul`/`ol`/`li`, `h1`-`h3`, `code`, `p`, `br`. Les autres tags sont désenveloppés (texte conservé). Effondre les lignes vides multiples.
- **Consommé par** : `OrigamTextareaField` (prop `output="markdown"`).

---

## 17. Utils domaine — Theme

### `Theme/apply-theme.util.ts`

#### `semanticTreeToVars`
- **Signature** : `(tree: ISemanticTree, rootPath: ReadonlyArray<string>) => TThemeVars`
- **Rôle** : Walk récursif d'un arbre sémantique, convertit chaque feuille en var CSS via `tokenPathToCssVar`.

#### `themeVarsToVars`
- **Signature** : `(vars: IThemeVars) => TThemeVars`
- **Rôle** : Effondre les groupes structurés (`color`, `rounded`, `border`, `typo`, `shadow`, `spacing`, `motion`) en map plate de vars CSS.

#### `resolveThemeVars`
- **Signature** : `(theme: IOrigamTheme) => TThemeVars`
- **Rôle** : Résout `vars` (structure) + `cssVars` (escape hatch brute) en map unifiée. `cssVars` a priorité sur `vars`.

#### `themeSelector`
- **Signature** : `(theme: IOrigamTheme) => string`
- **Rôle** : Construit le sélecteur CSS ciblé (`':root'`, `'[data-theme="X"]'`, `'[data-mode="Y"]'`, ou combinaison).

#### `themeToCss`
- **Signature** : `(theme: IOrigamTheme) => string`
- **Rôle** : Sérialise un thème en règle CSS `selector { --var: value; }`. Pur, sans accès DOM.

#### `applyTheme`
- **Signature** : `(theme: IOrigamTheme) => string | null`
- **Rôle** : Injecte/remplace le bloc CSS du thème dans `<head>`. SSR-safe (no-op si `document` absent). L'id de la balise `<style>` est `origam-theme[-name][-mode]`.

#### `applyThemes`
- **Signature** : `(themes: IOrigamTheme[]) => string[]`
- **Rôle** : Applique une liste de thèmes d'un coup. Retourne les ids réellement écrits.

#### `installedThemesFromList`
- **Signature** : `(themes: IOrigamTheme[]) => TInstalledThemes`
- **Rôle** : Résume les thèmes installés par nom (modes disponibles + métadonnées UI). Pur/SSR-safe.
- **Consommé par** : `useTheme`, `OrigamThemeProvider`.

### `Theme/token-name.util.ts`

#### `TOKEN_INTENT_STATES`
- **Type** : `ReadonlySet<string>`
- **Rôle** : Segments reconnus comme modificateurs d'état/intent dans un chemin de token composant.

#### `isBemChildKey`
- **Signature** : `(key: string) => boolean`
- **Rôle** : `true` si la clé est un mot simple (lettres uniquement, pas de tiret) → traité comme enfant BEM.

#### `tokenPathToCssVarName`
- **Signature** : `(path: ReadonlyArray<string>, isComponent: boolean) => string`
- **Rôle** : Résout un tableau de segments en nom de variable CSS origam (sans `--`). Implémente la grammaire BEM complète : `__` enfant, `--` état/modifier, `---` propriété.

#### `tokenPathToCssVar`
- **Signature** : `(path: ReadonlyArray<string>, isComponent: boolean) => string`
- **Rôle** : Préfixe `tokenPathToCssVarName` de `'--'`.
- **Consommé par** : `apply-theme.util.ts`, Theme Builder export.

---

## 18. Utils domaine — Transition

### `Transition/transition.util.ts`

#### `getChildren`
- **Signature** : `(el: Element) => HTMLCollectionOf<Element> | undefined`
- **Rôle** : Cherche le premier enfant `.origam-card`, `.origam-sheet`, ou `.origam-list` sous `el` et retourne ses enfants.

#### `getDimensions`
- **Signature** : `(target: HTMLElement | [x, y], el: HTMLElement) => { x, y, sx, sy, speed }`
- **Rôle** : Calcule l'origine et le facteur d'échelle d'une animation "expand from activator". Lit `--origam-overlay-anchor-origin` pour aligner l'expansion. `speed` est adaptatif (ralentit jusqu'à ×1.5 pour les grands overlays).
- **Consommé par** : `OrigamDialogTransition`, `OrigamMenuTransition`.

---

## 19. Récapitulatif Utils — Tableau

| Domaine | Fichier | Fonctions clés |
|---|---|---|
| Commons/Général | `commons.util.ts` | `convertToUnit`, `debounce`, `deepEqual`, `clamp`, `mergeDeep`, `focusChild`, `getPropertyFromItem`, `omit`, `pick`, `wrapInArray`, `templateRef`, `normalize` |
| Commons/DOM | `dom.util.ts` | `attachedRoot` |
| Commons/Couleur | `color.util.ts` | `parseColor`, `isCssColor`, `isIntent`, `intentBgExpr`, `tokenStylesForIntent`, `APCAcontrast`, `getForeground`, conversions HSV/HSL/RGB/Hex/XYZ/LAB |
| Commons/Gradient | `gradient.util.ts` | `isGradient`, `resolveGradient`, `gradientFromObject` |
| Commons/Animation | `animation.util.ts` | `nullifyTransforms`, `animate` |
| Commons/Anchor | `anchor.util.ts` | `parseAnchor`, `flipSide`, `flipAlign`, `flipCorner`, `getAxis` |
| Commons/Point | `point.util.ts` | `anchorToPoint`, `elementToViewport`, `getOffset`, `inViewport`, `getCenter` |
| Commons/Location | `location.util.ts` | `connectedLocationStrategy`, `staticLocationStrategy`, `getIntrinsicSize` |
| Commons/Activateur | `activator.util.ts` | `activator`, `getTargetActivator` |
| Commons/Props | `bindProps.util.ts` | `bindProps`, `unbindProps` |
| Commons/CSS logique | `border/rounded/margin/padding.util.ts` | `formatBorderStylesVar`, `formatRoundedStylesVar`, `formatMarginStylesVar`, `formatPaddingStylesVar` |
| Commons/Box | `box.util.ts` | `getOverflow`, `getTargetBox` |
| Commons/Scroll | `scroll.util.ts` | `getScrollParent(s)`, `closeScrollStrategy`, `blockScrollStrategy`, `repositionScrollStrategy`, `bindScroll` |
| Commons/GoTo | `goTo.util.ts` | `scrollTo`, `genDefaults`, `getContainer`, `clampTarget` |
| Commons/Elevation | `elevation.util.ts` | `formatElevationStyle` (**déprécié**) |
| Commons/Display | `display.util.ts` | `parseDisplayOptions`, `getClientWidth`, `getPlatform` |
| Commons/Locale | `locale.util.ts` | `createVueI18nAdapter`, `createProvideFunction` |
| Commons/Group | `group.util.ts` | `getIds`, `getValues`, `getItemIndex` |
| Commons/Nested | `nested.util.ts` | 5 stratégies de sélection |
| Commons/Hotkey | `hotkey.util.ts` | `splitKeyCombination`, `splitKeySequence`, `normalizeKey` |
| Commons/Événements | `event.util.ts` + `eventListener.util.ts` | `getPrefixedEventHandlers`, `resolveUnref`, `unrefElement` |
| Commons/Ripple | `ripple.util.ts` | `updateRipple`, `calculate`, `rippleShow/Hide` |
| Commons/Hover | `hover.util.ts` | `updateHover`, `hoverShow/Hide` |
| Commons/Touch | `touch.util.ts` | `createHandlers`, `handleGesture` |
| Commons/Intersect | `intersect.util.ts` | `unmountIntersect` |
| Commons/ClickOutside | `clickOutside.util.ts` | `checkEvent`, `directive`, `handleShadow` |
| Commons/Layout | `layout.util.ts` | `generateLayers` |
| Commons/ForwardRefs | `forwardRefs.util.ts` | `forwardRefs`, `getDescriptor` |
| Commons/Instance | `getCurrentInstance.util.ts` | `getCurrentInstance`, `getCurrentInstanceName`, `getUid` |
| Commons/Velocity | `velocity.util.ts` | `calculateImpulseVelocity` |
| Commons/Virtual | `virtual.util.ts` | `binaryClosest` |
| Commons/Autocomplete | `autocomplete.util.ts` | `isComposingIgnoreKey` |
| Commons/Filters | `filters.util.ts` | `defaultFilter`, `filterItems` |
| Commons/FormatBytes | `format-bytes.util.ts` | `formatBytes` |
| Commons/RequestFrame | `requestNewFrame.util.ts` | `requestNewFrame` |
| Commons/Date | `date.util.ts` | 40+ helpers date/time pur-JS |
| Commons/Console | `console.util.ts` | `consoleWarn`, `consoleError` |
| Calendar/Date | `Calendar/date.util.ts` | `buildMonthMatrix`, `isoWeekNumber`, `buildDisabledPredicate`, `eachDayOfInterval`, `formatTime` |
| Calendar/RRule | `Calendar/rrule.util.ts` | `parseRRule`, `expandRecurrence` |
| Chart/Path | `Chart/path.util.ts` | `linePath`, `smoothPath`, `monotonePath`, `steppedPath`, `areaPath`, `arcPath`, `polygonPath`, `pathLength` |
| Chart/BoxPlot | `Chart/box-plot.util.ts` | `computeQuartiles`, `isRawDatum` |
| Chart/Mercator | `Chart/mercator.util.ts` | `mercatorProject`, `polygonToSvgPath`, `multiPolygonCentroid` |
| Code | `Code/parse-highlight-lines.util.ts` | `parseHighlightLines` |
| ColorPicker | `ColorPicker/color-picker.util.ts` | `extractColor`, `stripAlpha`, `hasAlpha` |
| CommandPalette | `CommandPalette/fuzzy-match.util.ts` | `fuzzyMatch` |
| DataList | `DataList/data-list-kv-item-value-component.util.ts` | `isDataListKVItemValueComponent` |
| DataTable | `DataTable/group.util.ts` + `headers.util.ts` + `items.util.ts` + `sort.util.ts` | `groupItems`, `flattenItems`, `convertToInternalHeaders`, `parseHeaderItems`, `transformDataTableItem`, `sortItems` |
| Input | `Input/input.util.ts` | `filterInputAttrs` |
| List | `List/list-item.util.ts` | `transformListItem`, `transformListItems` |
| Mask | `Mask/apply-mask.util.ts` + `resolve-mask-config.util.ts` + `validate-pattern.util.ts` | `applyMask`, `unmaskValue`, `resolveMaskConfig`, `validatePattern`, `isLuhnValid`, `isIbanValid` |
| Media | `Media/format-time.util.ts` | `formatMediaTime` |
| Parallax | `Parallax/parallax-element.util.ts` | `elementMovement`, `cyclicMovement` |
| QrCode | `QrCode/qr-code-adapters.util.ts` | `resolveQrColor`, `resolveQrCornerRadius` |
| Slide | `Slide/slide-group.util.ts` | `calculateUpdatedTarget`, `calculateCenteredTarget`, getters directionnels |
| Textarea | `Textarea/sanitize-html.util.ts` + `html-to-markdown.util.ts` | `sanitizeHtml`, `htmlToMarkdown` |
| Theme | `Theme/apply-theme.util.ts` + `token-name.util.ts` | `applyTheme`, `applyThemes`, `themeToCss`, `installedThemesFromList`, `tokenPathToCssVar` |
| Transition | `Transition/transition.util.ts` | `getDimensions`, `getChildren` |

---

## 20. Directives

### `v-click-outside`

- **Fichier** : `src/directives/ClickOutside/clickOutside.directive.ts`
- **Rôle** : Détecte les clics en dehors d'un élément (et ses includes). Gère Shadow DOM, ShadowRoot, et le mécanisme mousedown+click.
- **API binding** :
  - `value` : `(e: MouseEvent) => void` (handler direct) OU `{ handler, closeConditional?, include? }`.
  - `include` : `() => HTMLElement[]` — éléments supplémentaires considérés comme "dedans".
  - `closeConditional` : `(e: MouseEvent) => boolean` — condition d'activation.
- **Hooks** : `mounted` (attache `click` + `mousedown` en capture sur `document`/`ShadowRoot`), `unmounted` (nettoie par uid d'instance).
- **Composable sous-jacent** : `clickOutside.util.ts` (`directive`, `checkEvent`, `handleShadow`).
- **Composants consommateurs** : `OrigamMenu`, `OrigamDialog`, `OrigamSelect`, `OrigamDatePicker`, `OrigamContextualMenu`.
- **Exemple** :
  ```vue
  <div v-click-outside="{ handler: close, closeConditional: () => isOpen }">…</div>
  ```

---

### `v-hover`

- **Fichier** : `src/directives/Hover/hover.directive.ts`
- **Rôle** : Ajoute/retire une classe CSS sur hover (souris + touch). Gère le double-déclenchement touch/mouse sur Android/iOS.
- **API binding** :
  - `value` : `boolean | { class?: string }` — active/désactive le hover, ou spécifie la classe personnalisée (défaut `'{componentName}--hover'`).
  - **Modifier** `stop` : stoppe la propagation du hover vers les parents.
- **Hooks** : `mounted` (initialise avec `wasEnabled=false`), `updated` (compare old/new value), `unmounted` (supprime `el._hover` + listeners).
- **Composable sous-jacent** : `hover.util.ts` (`updateHover`, `hoverRemoveListeners`).
- **Composants consommateurs** : `OrigamBtn`, `OrigamListItem`, `OrigamCard`.
- **Exemple** :
  ```vue
  <button v-hover>…</button>
  <button v-hover="{ class: 'my-hover' }">…</button>
  <button v-hover.stop>…</button>
  ```

---

### `v-intersect`

- **Fichier** : `src/directives/Intersect/intersect.directive.ts`
- **Rôle** : Observe la visibilité d'un élément dans le viewport via `IntersectionObserver`. No-op si `SUPPORTS_INTERSECTION` est faux.
- **API binding** :
  - `value` : `(isIntersecting: boolean, entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void` (handler direct) OU `{ handler, options? }`.
  - `options` : `IntersectionObserverInit` (défaut `{ threshold: 0.1 }`).
  - **Modifier** `quiet` : ne déclenche pas au premier appel (init silencieux).
  - **Modifier** `once` : se désinscrit après la première intersection.
- **Hooks** : `mounted` (crée l'`IntersectionObserver` par uid), `unmounted` (appelle `unmountIntersect`).
- **Composable sous-jacent** : `intersect.util.ts` (`unmountIntersect`).
- **Composants consommateurs** : `OrigamInfiniteScroll`, `OrigamLazyImage`, `OrigamList`.
- **Exemple** :
  ```vue
  <div v-intersect.quiet.once="onVisible">…</div>
  <div v-intersect="{ handler: onVisible, options: { threshold: 0.5 } }">…</div>
  ```

---

### `v-ripple`

- **Fichier** : `src/directives/Ripple/ripple.directive.ts`
- **Rôle** : Ajoute l'effet d'ondulation Material aux interactions souris/tactile/clavier.
- **API binding** :
  - `value` : `boolean | { class?: string, center?: boolean, circle?: boolean }` — active/désactive avec options.
  - **Modifier** `center` : ondulation centrée indépendamment du point de click.
  - **Modifier** `circle` : forme circulaire parfaite (vs ellipse).
  - **Modifier** `stop` : bloque la propagation du ripple aux parents.
- **Hooks** : `mounted` (initialise avec `wasEnabled=false`), `updated` (compare old/new), `unmounted` (supprime `el._ripple` + listeners).
- **Composable sous-jacent** : `ripple.util.ts` (`updateRipple`, `isRippleEnabled`, `rippleRemoveListeners`).
- **Composants consommateurs** : `OrigamBtn`, `OrigamListItem`, `OrigamChip`, `OrigamCheckbox`, `OrigamRadio`.
- **Exemple** :
  ```vue
  <button v-ripple>…</button>
  <button v-ripple.center="{ class: 'my-ripple' }">…</button>
  <div v-ripple.stop>…</div>
  ```

---

### `v-touch`

- **Fichier** : `src/directives/Touch/touch.directive.ts`
- **Rôle** : Détecte les gestes tactiles directionnels (swipe left/right/up/down) et les événements start/move/end.
- **API binding** :
  - `value` : `ITouchHandlers` — objet avec callbacks optionnels `left`, `right`, `up`, `down`, `start`, `move`, `end`. Chaque callback reçoit `TTouchWrapper`.
  - `value.parent` : `boolean` — attache les listeners sur `el.parentElement` au lieu de `el`.
  - `value.options` : `AddEventListenerOptions` — défaut `{ passive: true }`.
- **Hooks** : `mounted` (crée les handlers via `createHandlers`, attache sur `target`, stocke dans `target._touchHandlers[uid]`), `unmounted` (retire les listeners par uid).
- **Composable sous-jacent** : `touch.util.ts` (`createHandlers`, `handleGesture`).
- **Composants consommateurs** : `OrigamCarousel`, `OrigamDrawer`, `OrigamSlideGroup`, `OrigamBottomSheet`.
- **Exemple** :
  ```vue
  <div v-touch="{ left: onSwipeLeft, right: onSwipeRight }">…</div>
  <div v-touch="{ parent: true, down: onPullDown }">…</div>
  ```

---

## 21. Récapitulatif Directives — Tableau

| Directive | Modifier(s) | Binding value | Hooks actifs | Util sous-jacent | Consommateurs principaux |
|---|---|---|---|---|---|
| `v-click-outside` | — | `fn` ou `{ handler, closeConditional?, include? }` | `mounted`, `unmounted` | `clickOutside.util.ts` | Menu, Dialog, Select, DatePicker |
| `v-hover` | `stop` | `boolean` ou `{ class? }` | `mounted`, `updated`, `unmounted` | `hover.util.ts` | Btn, ListItem, Card |
| `v-intersect` | `quiet`, `once` | `fn` ou `{ handler, options? }` | `mounted`, `unmounted` | `intersect.util.ts` | InfiniteScroll, LazyImage, List |
| `v-ripple` | `center`, `circle`, `stop` | `boolean` ou `{ class?, center?, circle? }` | `mounted`, `updated`, `unmounted` | `ripple.util.ts` | Btn, ListItem, Chip, Checkbox, Radio |
| `v-touch` | — | `{ left?, right?, up?, down?, start?, move?, end?, parent?, options? }` | `mounted`, `unmounted` | `touch.util.ts` | Carousel, Drawer, SlideGroup, BottomSheet |

---

## 22. Services

### `Box` (service)

- **Fichier** : `src/services/Commons/box.service.ts`
- **Rôle** : Classe `Box implements IBox`. Représente un rectangle avec `x`, `y`, `width`, `height` et les getters calculés `top`, `bottom`, `left`, `right`.
- **Méthodes / Getters** :
  - `get top()` → `this.y`
  - `get bottom()` → `this.y + this.height`
  - `get left()` → `this.x`
  - `get right()` → `this.x + this.width`
- **Consommateurs** : `animation.util.ts`, `box.util.ts`, `location.util.ts`, `scroll.util.ts`, `transition.util.ts`. Partout où une `DOMRect`-like est construite programmatiquement.

---

### `CircularBuffer<T>` (service)

- **Fichier** : `src/services/Commons/circular-buffer.service.ts`
- **Rôle** : Buffer circulaire de taille fixe. Écrase les anciennes valeurs une fois plein. Implémentation privée avec champs `#arr` et `#pointer`.
- **API** :
  - `constructor(size: number)` — crée un buffer de capacité `size`.
  - `push(val: T) => void` — ajoute une valeur, écrase la plus ancienne si plein.
  - `values() => Array<T>` — retourne les valeurs dans l'ordre d'insertion (le plus ancien en premier).
- **Consommateurs** : `useSlideGroup` (historique de positions pour `calculateImpulseVelocity`).

---

### `DateAdapter` (service)

- **Fichier** : `src/services/Commons/date-adapter.service.ts`
- **Rôle** : Implémentation concrète de `IDateAdapter<Date>`. Adaptateur date pur-JS basé sur les helpers de `date.util.ts`. Configuré avec une `locale` et des `formats` personnalisés.
- **Méthodes** (implémentent `IDateAdapter`) :
  - Construction : `constructor({ locale, formats? })`
  - Parsing : `date(value?)`, `toJsDate(date)`, `toISO(date)`, `parseISO(date)`
  - Arithmétique : `addMinutes`, `addHours`, `addDays`, `addWeeks`, `addMonths`
  - Navigation : `getWeekArray`, `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `startOfDay`, `endOfDay`, `startOfYear`, `endOfYear`
  - Accesseurs : `getYear`, `getMonth`, `getDate`, `getHours`, `getMinutes`, `getNextMonth`, `getPreviousMonth`, `getWeekdays`
  - Mutateurs : `setHours`, `setMinutes`, `setMonth`, `setDate`, `setYear`
  - Comparaisons : `isEqual`, `isValid`, `isWithinRange`, `isAfter`, `isAfterDay`, `isBefore`, `isSameDay`, `isSameMonth`, `isSameYear`
  - Divers : `getDiff(date, comparing, unit?)`, `format(date, formatString)`
- **Consommateurs** : `createInstance` (date.util.ts), `getWeek` (date.util.ts), `OrigamDatePicker`, `OrigamCalendar`, partout où `IDateAdapter` est injecté.

---

## 23. Récapitulatif Services — Tableau

| Service | Fichier | Type | Méthodes principales | Consommateurs |
|---|---|---|---|---|
| `Box` | `services/Commons/box.service.ts` | Classe | Getters `top/bottom/left/right` | `animation.util`, `box.util`, `location.util`, `scroll.util`, `transition.util` |
| `CircularBuffer<T>` | `services/Commons/circular-buffer.service.ts` | Classe générique | `push(val)`, `values()` | `useSlideGroup` |
| `DateAdapter` | `services/Commons/date-adapter.service.ts` | Classe (`IDateAdapter<Date>`) | 40+ méthodes date/time | `createInstance`, DatePicker, Calendar |
