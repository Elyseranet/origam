# Composables — Commons

> ⛔ Page **generee** depuis les sources par `packages/ds/scripts/analysis/gen-composables-doc.mjs`, et **verifiee** par le garde
> `composables-doc-sync`. Signature, description et consommateurs sont lus dans le code :
> rien n'est redige ici. Corriger une description se fait dans la banniere du symbole,
> puis en regenerant. Issue #545.

106 symbole(s) exporte(s).

## `_resetCssSupportCache`

```ts
export function _resetCssSupportCache ()
```

Aide de test : vide le cache partage de `rawSupports`, remet
`_initialized` a `false` et `_flags` a la carte tout-`false`, pour que le
prochain `useCssSupport()` re-detecte au lieu de lire l'etat fige d'un
spec precedent. Hors API publique — les consommateurs ne doivent pas en
dependre.

**Source** : `packages/ds/src/composables/Commons/cssSupport.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `_resetThemeForTesting`

```ts
export function _resetThemeForTesting ()
```

Aide de test : vide les singletons module (`theme`, `mode`,
`systemPrefersDark`, `mediaInitDone`) pour que chaque spec reparte
d'un etat propre. Hors API publique.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `applyModeSync`

```ts
export function applyModeSync (mode: TMode)
```

Aide interne pour plugins SSR / anti-flash : applique un mode CONCRET
au document synchronement, en court-circuitant la reactivite Vue. Un
argument `'auto'` est resolu contre `prefers-color-scheme` courant
(repli sur `'light'` si indisponible) — `data-mode` finit toujours
concret, jamais `'auto'` litteral, car la matrice de tokens n'a pas de
repli sans mode.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `applyThemeSync`

```ts
export function applyThemeSync (theme: TTheme)
```

Aide interne pour plugins SSR / anti-flash : applique une marque
(`theme`) au document SYNCHRONEMENT, avant le premier rendu, en
court-circuitant la reactivite Vue — utile pour poser `data-theme`
avant que l'hydratation ne demarre et eviter un flash de theme au
chargement.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `createDate`

```ts
export function createDate (options: IDateOptions | undefined, locale: ILocaleInstance)
```

Fabrique installee au niveau app (voir `createOrigam()`), pas un hook de
composant : fusionne les `options` fournies avec un adaptateur par
defaut (`DateAdapter`) et une table de locales BCP-47 par langue (`fr`,
`es`, `ar` en sont deliberement absents, commentes en code — leur valeur
differe selon la variante regionale), puis construit l'instance
d'adaptateur via `createInstance`. `useDate()` consomme ce resultat, il
ne le recree pas.

**Source** : `packages/ds/src/composables/Commons/date.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createDefaults`

```ts
export function createDefaults (options?: IDefault): Ref<IDefault>
```

Fabrique installee par `createOrigam()` : seme le `Ref<IDefault>` racine
a partir des `options.components` fournies par l'app hote (ou un objet
vide) — c'est ce Ref que `provideDefaults()` recoit comme premiere
valeur parente au sommet de l'arbre.

**Source** : `packages/ds/src/composables/Commons/defaults.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createDisplay`

```ts
export function createDisplay (options?: IDisplayOptions, ssr?: TSSROptions): IDisplayInstance
```

Fabrique installee par `createOrigam()` : suit `window.innerWidth/Height`
(via un listener `resize` passif) et derive dans un `reactive` unique
l'ensemble des breakpoints (`xs`..`xxl`, `smAndUp`, `mdAndDown`…), la
plateforme (`getPlatform`) et le flag `mobile` selon
`options.mobileBreakpoint`. Une seule instance est creee au niveau app ;
`useDisplay()` la lit plutot que d'en recreer une par composant.

Cote SSR, `height`/`width` sont seedes depuis `ssr` (dimensions
supposees du client) plutot que `window`, et le listener `resize` n'est
jamais attache (`IN_BROWSER` garde) — l'instance retournee porte
`ssr: true` pour que l'appelant sache que ces valeurs sont une
approximation tant que l'hydratation n'a pas tourne.

**Source** : `packages/ds/src/composables/Commons/display.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createGoTo`

```ts
export function createGoTo ( options: IGoToOptions | undefined, locale: ILocaleInstance & IRtlInstance ): IGoToInstance
```

Fabrique installee par `createOrigam()` : fusionne les `options` de
scroll fournies par l'app hote avec les defauts (`genDefaults()`) et
capture le sens RTL courant (`locale.isRtl`) dans l'instance injectee
— c'est cette instance que `useGoTo()` recupere via
`ORIGAM_GO_TO_KEY`.

**Source** : `packages/ds/src/composables/Commons/goTo.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createLocale`

```ts
export function createLocale (options?: ILocaleOptions & IRtlOptions)
```

Plugin-side factory used by `createOrigam()` to seed the root
locale instance (i18n adapter + RTL state) from the host app's
options. Delegates the RTL half to `createRtl` (own file) rather
than duplicating it.

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createRtl`

```ts
export function createRtl (i18n: ILocaleInstance, options?: IRtlOptions): IRtlInstance
```

Builds a fresh RTL state (locale → boolean map + derived `isRtl`)
for a given locale instance. Called by `createLocale`
(locale.composable.ts) when the consumer doesn't supply their own
adapter — kept in this file since `useRtl` / `provideRtl` are its
direct siblings on the same RTL contract.

**Source** : `packages/ds/src/composables/Commons/rtl.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `installThemePropsResolver`

```ts
export function installThemePropsResolver (app: App, themedKeysUnion: Map<string, Set<string>>): void
```

Install the global `beforeCreate` hook described at the top of this file.
Called once by `createOrigam()` per app instance.

⚠️ ALWAYS calls `app.mixin()`, even for an empty `themedKeysUnion`.

It used to early-out on an empty union, on the grounds that a theme naming
nothing means nothing to intercept. That stopped being true once this hook
also resolves the `provideDefaults` cascade (see "Two key sources" in the
hook body): a `<origam-defaults-provider>` — or any group component that
forwards props to its children — populates the very same defaults map at
RUNTIME, long after install time. There is no install-time way to know
whether one will ever mount, so the union being empty no longer implies
there is nothing to do.

The per-instance early-out inside the hook is unchanged in spirit and still
carries the cost argument: an instance that neither a theme nor an ancestor
provider names returns after a Map lookup and one property lookup.

**Source** : `packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `provideDefaults`

```ts
export function provideDefaults ( defaults?: Ref<IDefault> | IDefault, options?:
```

Cote fournisseur : declare une map de defauts pour le sous-arbre courant,
injectee sous `ORIGAM_DEFAULTS_KEY` et lue par `useDefaults()` chez les
descendants. Utilise par `<OrigamDefaultsProvider>` mais aussi appelable
directement (composant renderless, cas avances). `disabled` laisse passer
la map parente inchangee ; `reset`/`root`/`scoped` l'ignorent entierement
(seuls les defauts de ce provider sont visibles) ; par defaut, fusion
profonde (`mergeDeep`) des defauts parents sous ceux de ce provider.

Chaque option accepte une valeur brute OU un `Ref`/getter
(`MaybeRefOrGetter`), deroule via `toValue()` a chaque re-evaluation.
⛔ Un appelant dont l'option est une PROP de composant doit passer un
getter (`() => props.scoped`), jamais la valeur nue capturee une fois —
#438 : `<OrigamDefaultsProvider>` forwardait `props.scoped` comme un
booleen brut fige au `setup()`, donc ce `computed()` ne re-trackait
jamais les changements et `:scoped="uneRef"` restait sans effet apres le
montage initial.

**Source** : `packages/ds/src/composables/Commons/defaults.composable.ts`

**Consommateurs** (10) : `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/DefaultsProvider/OrigamDefaultsProvider.vue`, `components/SelectionControl/OrigamSelectionControl.vue`, `components/SelectionControl/OrigamSelectionControlGroup.vue`, `components/ThemeProvider/OrigamThemeProvider.vue`, …

## `provideLocale`

```ts
export function provideLocale (props: ILocaleProps & IRtlProps)
```

Provider-side hook: derives a subtree's locale + RTL state from
props, overriding the parent injection. Delegates the RTL half to
`provideRtl` (own file) rather than duplicating it.

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `provideRtl`

```ts
export function provideRtl (locale: ILocaleInstance, rtl: IRtlInstance['rtl'], props: IRtlProps): IRtlInstance
```

Derives a subtree's RTL state from a prop override (`props.rtl`)
falling back to the parent locale's RTL map. Called by
`provideLocale` (locale.composable.ts) — kept in this file since
`useRtl` / `createRtl` are its direct siblings on the same RTL
contract.

**Source** : `packages/ds/src/composables/Commons/rtl.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `readPersistedMode`

```ts
export function readPersistedMode (): TMode
```

Aide interne pour plugins SSR / anti-flash : lit le mode persiste dans
`localStorage` SANS instancier `useTheme()` — retourne `'auto'` si rien
n'est persiste ou hors navigateur.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `readPersistedTheme`

```ts
export function readPersistedTheme (): TTheme
```

Aide interne pour plugins SSR / anti-flash : lit la marque persistee
dans `localStorage` SANS instancier `useTheme()` (pas de Ref cree, pas
de singleton touche) — retourne `'auto'` si rien n'est persiste ou hors
navigateur.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `themedPropKeysUnion`

```ts
export function themedPropKeysUnion (themes: IDefault[]): Map<string, Set<string>>
```

Compute the set of prop keys, per component name (plus the special
`'global'` key), that AT LEAST ONE registered theme names in its
`components` block.

Scoped to the UNION across every theme `createOrigam` installs — not just
the brand×mode active at mount. A prop named only by a theme that becomes
active LATER (via a runtime brand switch) still needs interception wired
up from the start, or it will never update after the switch (verified gap
in ADR-005: `rounded` stayed `'none'` after swapping to a theme that was
the first to name it).

Pure — no Vue/DOM access — so it is called once, synchronously, at
`createOrigam()` install time.

**Source** : `packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `useActivator`

```ts
export function useActivator (props: IActivatorProps,
```

Cablage complet de l'activateur pour les composants flottants (Menu,
Tooltip, Dialog…) : derive depuis les props (`openOnHover`,
`openOnFocus`, `openOnClick`, `openOnContextMenu`) les gestionnaires
click/contextmenu/hover/focus a poser sur l'activateur, le contenu et le
scrim, et resout la cible de positionnement (`target`, y compris le mode
`'cursor'` qui suit les coordonnees du dernier clic).

Le delai d'ouverture/fermeture est delegue a `useDelay` — ce composable
ne fait que decider QUAND appeler `runOpenDelay`/`runCloseDelay`, jamais
le minutage lui-meme. Quand `props.activator` (selecteur externe) est
fourni, un `EffectScope` dedie est demarre/arrete au fil du temps via un
`watch` sur sa presence — pas de scope permanent quand aucun activateur
externe n'est utilise.

**Source** : `packages/ds/src/composables/Commons/activator.composable.ts`

**Consommateurs** (4) : `components/Dialog/OrigamDialog.vue`, `components/Menu/OrigamMenu.vue`, `components/Overlay/OrigamOverlay.vue`, `utils/Commons/activator.util.ts`

## `useAdjacent`

```ts
export function useAdjacent (props: IAdjacentProps, prependIcon?: Ref | ComputedRef, appendIcon?: Ref | ComputedRef)
```

Resolves the prepend/append media + slot presence and click emits
for a component's OUTER adjacent zone (prepend/append icon or
avatar). `useAdjacentInner` is the sibling hook for the INNER zone
(prependInner/appendInner/clear) — independent, no shared state.

⛔ issue #443 — `click:prepend` / `click:append` are a real, public
event API (relayed by TextField/TextareaField/PasswordField/
FileField/NumberField/DataTable/Card…, with dedicated story
Variants) meant for a consumer to attach a DISTINCT action to the
adjacent zone. A DOM click landing on the prepend/append `<span>`/
`<div>` fires it; a keyboard "click" synthesized by the browser on
the component ROOT (Enter/Space on a real `<button>` ancestor)
never does — the synthetic event's `target` is the root, so it
never reaches a listener bound to the descendant. The event was
therefore 100% keyboard-unreachable regardless of what the
ancestor renders as.

`isPrependClickable` / `isAppendClickable` mirror the existing
`useIconAccessibility` contract (`isClickable = !!attrs.onClick`):
the zone becomes a real `role="button"` + tab stop ONLY when the
consumer actually attached a `click:prepend`/`click:append`
listener — a decorative icon with nobody listening stays exactly
as inert as before, no spurious tab stop.

**Source** : `packages/ds/src/composables/Commons/adjacent.composable.ts`

**Consommateurs** (29) : `components/Alert/OrigamAlert.vue`, `components/Badge/OrigamBadge.vue`, `components/Breadcrumb/OrigamBreadcrumbItem.vue`, `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/Card/OrigamCardHeader.vue`, `components/Chip/OrigamChip.vue`, `components/ConfirmWrapper/OrigamConfirmWrapper.vue`, …

## `useAdjacentInner`

```ts
export function useAdjacentInner (props: IAdjacentInnerProps)
```

Resolves the prependInner/appendInner/clear media + slot presence
and click emits for a component's INNER adjacent zone (e.g. a
text-field's clear button, sitting inside the input's border rather
than outside it). `useAdjacent` is the sibling hook for the OUTER
zone — independent, no shared state.

⛔ issue #443 — same gap as `useAdjacent`: `click:prependInner` /
`click:appendInner` only ever fired from a literal DOM click inside
the zone, never from a keyboard activation of an ancestor. See the
long comment on `useAdjacent` for the full reasoning; mirrored here
for the inner zone. `isClearClickable` stays permanently true when
`hasClear` is — the clear zone only renders (`v-show="dirty"`) when
there is something to clear, so it is unconditionally actionable
whenever visible, unlike prependInner/appendInner whose
actionability depends on whether the consumer wired a listener.

**Source** : `packages/ds/src/composables/Commons/adjacentInner.composable.ts`

**Consommateurs** (15) : `components/Field/OrigamField.vue`, `components/FileField/OrigamFileField.vue`, `components/NumberField/OrigamNumberField.vue`, `components/OtpInputField/OrigamOtpInputField.vue`, `components/PasswordField/OrigamPasswordField.vue`, `components/Select/OrigamSelect.vue`, `components/TextField/OrigamTextField.vue`, `components/TextareaField/OrigamTextareaField.vue`, …

## `useAudio`

```ts
export function useAudio (props: IUseAudioProps)
```

Pilote un `<audio>` via `props.playAudio` (play/pause) et expose des
donnees de frequence (`audioData`, via un `AnalyserNode` du Web Audio
API) rafraichies a chaque frame (`requestAnimationFrame`) tant que la
lecture est active — utile pour un rendu de visualiseur audio.

L'`AudioContext` et l'`AnalyserNode` ne sont crees qu'a la PREMIERE
lecture (`wasPlayed`), pas a l'appel du composable. Un changement de
`props.audio` reinitialise `wasPlayed` a `false`, donc une nouvelle
lecture recree un `AudioContext` complet plutot que de reutiliser
l'ancien.

**Source** : `packages/ds/src/composables/Commons/audio.composable.ts`

**Consommateurs** (3) : `components/Parallax/OrigamParallax.vue`, `consts/Audio/audio.const.ts`, `interfaces/Commons/audio.interface.ts`

## `useBackButton`

```ts
export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext)
```

Wires a `popstate` listener + router navigation guard so a consumer
(e.g. a Dialog / Sheet / Bottom-sheet) can intercept the native
back-button gesture and run its own close callback instead of
letting the browser navigate away.
Independent from `useRoute` / `useRouter` / `useLink` — does not
delegate to any of them.

**Source** : `packages/ds/src/composables/Commons/backButton.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useBackgroundColor`

```ts
export function useBackgroundColor<T extends Record<K, TColor>, K extends string> ( props: T | Ref<TColor>, name?: K )
```

Resolves the background-only colour channel from a single prop
source and delegates to `useColor` — kept in its own file so the
split by hook stays one-file-one-hook, without duplicating
`useColor`'s resolution logic.

**Source** : `packages/ds/src/composables/Commons/backgroundColor.composable.ts`

**Consommateurs** (32) : `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, `components/Chart/OrigamChartHeatmap.vue`, `components/Chart/OrigamChartHoneycomb.vue`, `components/Chart/OrigamChartMap.vue`, …

## `useBorder`

```ts
export function useBorder (props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>, name = getCurrentInstanceName())
```

Precedence rule (issue #215) — SPECIFIC beats GLOBAL, always in this
order, enforced purely by PUSH ORDER onto the `styles` array (later
declarations win within the same inline `style` attribute — this holds
even across logical vs physical property syntax for the same box edge):

  1. global `border` shorthand (1/2/4-value, logical properties)
  2. global standalone `borderColor` / `borderStyle`
  3. logical-axis `borderBlock` / `borderInline` (width, and
     style/color when a full string like `"2px dashed red"` is given)
  4. per-side `borderTop` / `borderRight` / `borderBottom` / `borderLeft`
     (physical properties — more specific than the axis rung above:
     `borderTop` overrides whatever `borderBlock` set for the top edge)
  5. per-side `borderTopColor` / `borderRightColor` /
     `borderBottomColor` / `borderLeftColor`

So `borderBlock` beats `border` for the top+bottom edges, `borderTop`
beats both `border` and `borderBlock` for the top side specifically,
and `borderTopColor` beats the color embedded in `borderTop`, the
axis-level color, and the global `borderColor` — each rung only
overrides the side(s)/axis it actually targets, everything else keeps
cascading from the rung below.

**Source** : `packages/ds/src/composables/Commons/border.composable.ts`

**Consommateurs** (50) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Btn/OrigamBtn.vue`, `components/Calendar/OrigamCalendar.vue`, `components/Card/OrigamCardHeader.vue`, `components/Card/OrigamCardText.vue`, `components/Chip/OrigamChipGroup.vue`, …

## `useBothColor`

```ts
export function useBothColor<T extends Record<K, TColor>, K extends string> (bgColorProps: T | Ref<TColor> | ComputedRef<TColor>, colorProps: T | Ref<TColor> | ComputedRef<TColor>, name?: K)
```

Resolves a bg/text colour pair from two independent prop sources
(bgColorProps + colorProps) and delegates the actual CSS resolution
to `useColor` — kept in its own file so the split by hook stays
one-file-one-hook, without duplicating `useColor`'s resolution logic.

**Source** : `packages/ds/src/composables/Commons/bothColor.composable.ts`

**Consommateurs** (47) : `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, `components/Card/OrigamCard.vue`, `components/Card/OrigamCardHeader.vue`, `components/Chip/OrigamChip.vue`, `components/Clipboard/OrigamClipboard.vue`, `components/Code/OrigamCode.vue`, `components/Counter/OrigamCounter.vue`, `components/DataList/OrigamDataList.vue`, …

## `useColor`

```ts
export function useColor (colors: ComputedRef<
```

Legacy bg/text colour resolver (kept for backward compat — used by
~49 components).
Base hook of the color family: useBothColor / useTextColor /
useBackgroundColor all delegate to this one to avoid duplicating the
intent / gradient / legacy-CSS-color resolution logic.
`useColorEffect` (hover/active-aware) lives in its own file and does
NOT depend on this hook — its role/state derivation is a different
algorithm, not a variant of this one.

**Source** : `packages/ds/src/composables/Commons/color.composable.ts`

**Consommateurs** (6) : `consts/Commons/color.const.ts`, `interfaces/Commons/state-effect.interface.ts`, `types/Commons/state-effect.type.ts`, `utils/Commons/color.util.ts`, `utils/Commons/gradient.util.ts`, `utils/QrCode/qr-code-adapters.util.ts`

## `useColorEffect`

```ts
export function useColorEffect ( props: IColorProps & IBgColorProps, isHover: Ref<boolean> | ComputedRef<boolean> = ref(false), isActive: Ref<boolean> | ComputedRef<boolean> = ref(false), isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false) )
```

Hover/active/disabled-aware bg+fg colour resolver — refactored for
design-tokens / intent support (Lot 1).
Deliberately independent from `useColor`: the role/state derivation
(default / hover / active slots) is a different algorithm from the
legacy static resolver, not a variant of it — kept in its own file
rather than forced to share a base.

Returns the same shape as before — `{ colorStyles, color, bgColor }` —
so existing callers (`OrigamAudio`, `OrigamVideo`) keep working
without changes.

`colorStyles` is an array of CSS declarations like
`'background-color: …'`, either pointing to a token
(`var(--origam-color__action--primary---bg)`) when `props.color` is
an intent, or to a raw value when it's a hex/rgb (legacy).

State resolution: `isHover.value` / `isActive.value` bump an intent
`bgColor` to its `bgHover` / `bgActive` token rung (color-mix
fallback when the token is missing). The flat `hoverColor` /
`activeColor` / `hoverBgColor` / `activeBgColor` per-state override
props were removed (folded into the `hover` / `active` object props
on components that support them — see `color.interface.ts`); neither
real caller of this composable (`OrigamAudio`, `OrigamVideo`) ever
declared them, so the foreground/background scalars are now just
`props.color` / `props.bgColor` — only the darken-derivation role
(`bgRole`) still reacts to `isHover` / `isActive`.

**Source** : `packages/ds/src/composables/Commons/colorEffect.composable.ts`

**Consommateurs** (8) : `components/Audio/OrigamAudio.vue`, `components/Video/OrigamVideo.vue`, `consts/Commons/color.const.ts`, `enums/Commons/color.enum.ts`, `enums/Commons/intent.enum.ts`, `types/Commons/color.type.ts`, `types/Commons/intent.type.ts`, `utils/Commons/color.util.ts`

## `useCreateLayout`

```ts
export function useCreateLayout (props:
```

Root of the layout system — provides `ORIGAM_LAYOUT_KEY` so
`useLayout` / `useLayoutItem` consumers down the tree can register
(drawers, toolbars, bottom-navs…) and read back the reserved main
area.
Independent from `useLayout` / `useLayoutItem` at the call level (no
direct function dependency) — the three only share the
`ORIGAM_LAYOUT_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/createLayout.composable.ts`

**Consommateurs** (3) : `components/Layout/OrigamLayout.vue`, `interfaces/Commons/layout.interface.ts`, `interfaces/Layout/layout.interface.ts`

## `useCssSupport`

```ts
export function useCssSupport (): IUseCssSupport
```

Single feature-detection layer for the whole CSS-first / JS-fallback
matrix (see `FEATURE_QUERIES`). Returns a reactive frozen flag map
plus free-form `supports` / `supportsAny` / `supportsAll` helpers.
`useCssSupportClient` (own file) is the hydration-safe sibling for
markup-driving flags — both share the cached `rawSupports` primitive.

**Source** : `packages/ds/src/composables/Commons/cssSupport.composable.ts`

**Consommateurs** (6) : `components/Masonry/OrigamMasonry.vue`, `consts/Commons/css-support.const.ts`, `interfaces/Commons/css-support.interface.ts`, `interfaces/Masonry/masonry.interface.ts`, `types/Commons/css-support.type.ts`, `utils/Commons/css-support.util.ts`

## `useCssSupportClient`

```ts
export function useCssSupportClient ( feature: TCssFeatureName | string, options: IUseCssSupportClientOptions =
```

Hydration-safe single-feature gate. Returns a `Ref<boolean>` that
starts at `defaultValue` and flips to the real support result on
`onMounted`. Use to gate **markup**, not styles — for style-only
branches prefer `useCssSupport().css.value.X` directly.

**Exemple**

const supportsContainer = useCssSupportClient('containerQueries')
  // template:
  //   <div v-if="supportsContainer">…CSS path…</div>
  //   <div v-else>…JS fallback path…</div>

**Source** : `packages/ds/src/composables/Commons/cssSupportClient.composable.ts`

**Consommateurs** (2) : `interfaces/Commons/css-support.interface.ts`, `utils/Commons/css-support.util.ts`

## `useDate`

```ts
export function useDate ()
```

Recupere les options de date injectees par `createDate()` (cle
`ORIGAM_DATE_OPTIONS_KEY`) et la locale active (`useLocale()`), puis
retourne l'instance d'adaptateur de date (`createInstance`) que les
composants Date/DatePicker consomment pour toute arithmetique de date.

Leve une erreur explicite si les options ne sont pas injectees — signe
que l'app n'a pas ete initialisee via `createOrigam()`. Ce n'est pas une
valeur par defaut silencieuse : sans adaptateur enregistre, aucune
hypothese de locale/format n'est fiable.

**Source** : `packages/ds/src/composables/Commons/date.composable.ts`

**Consommateurs** (5) : `components/DatePicker/OrigamDatePicker.vue`, `components/DatePicker/OrigamDatePickerMonth.vue`, `components/DatePicker/OrigamDatePickerMonths.vue`, `components/DatePicker/OrigamDatePickerYears.vue`, `components/DatePickerField/OrigamDatePickerField.vue`

## `useDatePickerCalendar`

```ts
export function useDatePickerCalendar (props: ICalendarProps)
```

Derive la grille de jours d'un calendrier (semaine ou mois) a partir de
`props` : modele de date(s) selectionnee(s) (`model`, toujours un
tableau via `useVModel`), annee/mois pilotables independamment
(`year`/`month`), et les jours enrichis (`daysInMonth`/`daysInWeek`) avec
leur statut (`isToday`, `isSelected`, `isAdjacent`, `isDisabled`, `isHidden`…).
Toute l'arithmetique de date passe par `useDate()` (l'adaptateur), jamais
par `Date` directement.

`weeksInMonth` complete la derniere semaine avec des jours du mois
suivant quand `props.weeksInMonth === 'static'`, pour garantir 6 semaines
pleines meme si le mois affiche n'en a que 4 ou 5 — une grille a hauteur
constante evite un calendrier qui change de taille d'un mois a l'autre.

**Source** : `packages/ds/src/composables/Commons/date-picker-calendar.composable.ts`

**Consommateurs** (3) : `components/DatePicker/OrigamDatePickerMonth.vue`, `interfaces/DatePicker/date-picker-calendar.interface.ts`, `interfaces/DatePicker/date-picker-month.interface.ts`

## `useDefaults`

```ts
export function useDefaults<T extends object> ( props: T, name = getCurrentInstanceName() ): T
```

Resolves a component's props against the closest
`<OrigamDefaultsProvider>` (or global defaults), falling back to the
component's own `withDefaults()` value. Delegates the "was this prop
explicitly passed?" check to `usePassedProps`.

**Source** : `packages/ds/src/composables/Commons/defaults.composable.ts`

**Consommateurs** (6) : `components/DefaultsProvider/OrigamDefaultsProvider.vue`, `consts/Commons/defaults.const.ts`, `interfaces/DefaultsProvider/defaults-provider.interface.ts`, `nuxt/plugin.client.ts`, `origam.ts`, `utils/Commons/commons.util.ts`

## `useDelay`

```ts
export function useDelay (props: IDelayProps, cb?: (value: boolean)
```

Temporise l'ouverture/fermeture d'un composant flottant selon
`props.openDelay` / `props.closeDelay` (via `defer`), et invoque `cb`
avec `true`/`false` une fois le delai ecoule. `useActivator` s'en sert
pour decider QUAND declencher son propre changement d'etat — ce
composable ne connait rien du hover/focus/click qui l'appelle.

Chaque appel a `runOpenDelay`/`runCloseDelay` ANNULE le delai en cours
(`cancelRef.current()`) avant d'en programmer un nouveau — un
enter/leave rapide (survol qui repasse) ne declenche donc jamais les
deux callbacks empiles, seul le dernier delai programme aboutit.

**Source** : `packages/ds/src/composables/Commons/delay.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useDensity`

```ts
export function useDensity (props: IDensityProps | Ref<number | string | undefined>, name = getCurrentInstanceName())
```

Traduit `props.density` (ou un `Ref` de densite passe directement) en une
classe utilitaire `{name}--density-{valeur}` — `name` par defaut le nom
kebab-case du composant courant, surchargeable pour un enfant qui
emprunte le canal densite d'un parent.

N'emet une classe QUE si la valeur figure dans `PREDEFINED_DENSITY`. Une
valeur `null`/`undefined` ne produit aucune classe (densite par defaut du
composant), et une valeur hors catalogue est silencieusement ignoree —
ce composable ne genere pas de style custom, contrairement a
`useDimension` ou `useMargin` qui basculent en style inline pour une
valeur non tokenisee.

**Source** : `packages/ds/src/composables/Commons/density.composable.ts`

**Consommateurs** (44) : `components/Alert/OrigamAlert.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, …

## `useDimension`

```ts
export function useDimension (props: IDimensionProps)
```

Traduit les six props de `IDimensionProps` (`height`, `maxHeight`,
`maxWidth`, `minHeight`, `minWidth`, `width`) en declarations CSS inline
(`dimensionStyles`, un tableau de chaines `"propriete: valeur"`) via
`convertToUnit` — qui accepte un nombre (`→ "Npx"`), une longueur CSS
deja unite, une reference a une custom property, ou un raccourci
`aspect-ratio`.

Contrairement aux composables de couleur/rounded/elevation, il n'y a pas
de canal "tokenise → classe" ici : toute dimension produit du style
inline, jamais de classe utilitaire — c'est le composable de reference a
`extends`-er (cf. CLAUDE.md racine) plutot que de parser `height`/`width`
a la main dans un nouveau composant.

**Source** : `packages/ds/src/composables/Commons/dimension.composable.ts`

**Consommateurs** (67) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Btn/OrigamBtn.vue`, `components/Calendar/OrigamCalendar.vue`, …

## `useDisplay`

```ts
export function useDisplay ( props: IDisplayProps =
```

Cote composant : lit l'instance de display globale (injectee sous
`ORIGAM_DISPLAY_KEY`, creee par `createDisplay()`) et y superpose un
`mobile`/`displayClasses` propre au composant quand `props.mobileBreakpoint`
derode le seuil global — sinon retombe sur `display.mobile` partage.

Leve si aucune instance n'est injectee : signe que l'app n'a pas ete
initialisee via `createOrigam()`, meme logique de garde que `useDate()`.
`displayClasses` ne produit une entree que si `name` est fourni (par
defaut le nom kebab-case du composant courant).

**Source** : `packages/ds/src/composables/Commons/display.composable.ts`

**Consommateurs** (9) : `components/DataTable/OrigamDataTable.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `components/Pagination/OrigamPagination.vue`, `components/Parallax/OrigamParallax.vue`, `components/Slide/OrigamSlideGroup.vue`, `interfaces/DataTable/data-table-headers.interface.ts`, …

## `useDragResizer`

```ts
export function useDragResizer (el: HTMLElement | undefined, value: Ref<number>, min: number, max: number, axis: TAxis)
```

Attache un drag mousedown/touchstart sur `el` qui fait varier `value`
(un `Ref<number>`, borne a `[min, max]` via `clamp`) le long de `axis` —
utilise pour les poignees de redimensionnement (panneau, colonne…).
`resizing` reste `true` tant que le geste (souris ou tactile) n'est pas
termine.

⛔ Seul l'axe `X` (`AXIS.X`) est reellement gere : `isVertical` est
commente en mort dans le code et un `// TODO - Rework for both axis`
l'annonce explicitement. Passer `AXIS.Y` fait juste tomber dans la
branche verticale de `getPosition` sans etre teste par ce composable.

**Source** : `packages/ds/src/composables/Commons/dragResizer.composable.ts`

**Consommateurs** (1) : `components/TextareaField/OrigamTextareaField.vue`

## `useElevation`

```ts
export function useElevation ( props: IElevationProps | Ref<TElevation | undefined>, flat: Ref<boolean> = ref(false), bgColor: Ref<TColor> = ref(ELEVATION_LEGACY_BG_COLOR), name = getCurrentInstanceName() )
```

Traduit `elevation` (`TElevation` : soit un echelon origam natif
`'none'|'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'`, soit un nombre Material
`0..24`, soit un `box-shadow` custom en clair) en `elevationClasses`
(utilitaire quand l'echelon est couvert par la Phase 1 des utilitaires)
ET `elevationStyles` (toujours une declaration `box-shadow: var(--origam-shadow-*)`
ou la valeur custom telle quelle) — les deux canaux emis en parallele,
jamais l'un a la place de l'autre (strategie A, cf. CLAUDE.md racine).

`bgColor` est accepte pour compatibilite mais IGNORE (n'affecte plus
ni `elevationClasses` ni `elevationStyles`) — passer une valeur autre
que `ELEVATION_LEGACY_BG_COLOR` declenche un `console.warn` de
depreciation une seule fois via `warnBgColorUsage`. La detection du
`box-shadow` custom passe AVANT le `parseInt` de secours : sans cet
ordre, `parseInt('0 4px 12px rgba(0,0,0,.24)', 10)` lirait `0` (chiffre
de tete) et resoudrait silencieusement vers l'echelon `none`, perdant
l'ombre custom.

**Source** : `packages/ds/src/composables/Commons/elevation.composable.ts`

**Consommateurs** (49) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Card/OrigamCard.vue`, `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, …

## `useEventListener`

```ts
export function useEventListener ( events: TEventListenerEvents, listeners: TEventListenerListeners, options?: TEventListenerOptions ): ()
```

Forme courte : sans premier argument cible, attache sur `window` (ou
ne fait rien en SSR, ou `window` n'existe pas). Voir la banniere de
l'implementation ci-dessous pour le comportement complet.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useEventListener`

```ts
export function useEventListener ( target: TEventListenerTarget, events: TEventListenerEvents, listeners: TEventListenerListeners, options?: TEventListenerOptions ): ()
```

Forme longue : `target` peut etre un element, un `Ref`/getter d'element,
`document`/`window`, ou une valeur nullable — voir la banniere de
l'implementation ci-dessous pour le comportement complet.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useEventListener`

```ts
export function useEventListener (...args: Array<unknown>): ()
```

Attache un ou plusieurs listeners a un ou plusieurs evenements sur une
cible reactive (`target` peut etre un `Ref`/getter, re-resolue via
`unrefElement`/`resolveUnref` a chaque changement) et retourne une
fonction `stop()` qui detache tout. Se detache aussi automatiquement a
la destruction du scope (`tryOnScopeDispose`).

⛔ Le `watch` sur `[target, options]` tourne en `flush: 'post'` et
re-attache TOUS les listeners a chaque changement de cible ou
d'options (nettoyage puis re-registration complete), jamais un diff
incremental — un `options` recree a chaque render (objet litteral
non stable) detache/rattache les listeners a chaque tick plutot que de
les laisser en place.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useFilter`

```ts
export function useFilter<T extends IInternalItem> ( props: IFiltersProps, items: MaybeRef<T[]>, query: Ref<string | undefined> | (()
```

Filtre reactivement `items` selon `query` (Ref ou getter) et les props de
filtre (`filterKeys`, `filterMode`, `customFilter`, `noFilter`), en
deleguant le matching a `filterItems` (util). Expose `filteredItems`,
`filteredMatches` (une `Map` cle par `item.value` → matches par champ) et
`getMatches(item)` pour surligner les portions qui matchent (List,
Select, Autocomplete…).

`options.transform` permet de filtrer sur une projection de l'item
(ex. un champ derive) plutot que l'item brut, et `options.customKeyFilter`
se fusionne PAR-DESSUS `props.customKeyFilter` — la valeur passee en
options gagne sur celle de la prop en cas de cle en commun.

**Source** : `packages/ds/src/composables/Commons/filters.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `components/Select/OrigamSelect.vue`

## `useFocus`

```ts
export function useFocus (props: IFocusProps, name = getCurrentInstanceName())
```

Etat de focus v-modelisable (`props.focused`, via `useVModel` — donc
`update:focused` remonte au parent) plus une classe `{name}--focused`
et deux handlers `onFocus`/`onBlur` prets a poser sur un `@focus`/`@blur`
de template. `name` par defaut le nom kebab-case du composant courant.

**Source** : `packages/ds/src/composables/Commons/focus.composable.ts`

**Consommateurs** (22) : `components/Checkbox/OrigamCheckbox.vue`, `components/Field/OrigamField.vue`, `components/FileField/OrigamFileField.vue`, `components/NumberField/OrigamNumberField.vue`, `components/OtpInputField/OrigamOtpInputField.vue`, `components/PasswordField/OrigamPasswordField.vue`, `components/Radio/OrigamRadio.vue`, `components/SliderField/OrigamSliderField.vue`, …

## `useGoTo`

```ts
export function useGoTo (_options: Partial<IGoToOptions> =
```

Retourne une fonction `go(target, options)` qui scrolle vers un
composant, un element, un selecteur ou une position (`scrollTo` util),
verticalement par defaut. `go.horizontal(...)` est la meme fonction en
mode scroll horizontal — meme signature, meme fusion d'options.

Le sens RTL effectif recalcule `goToInstance.rtl.value || isRtl.value`
plutot que de ne lire que l'instance injectee au niveau app : un
`<OrigamThemeProvider>` local peut inverser le RTL pour un sous-arbre
sans que l'instance globale de `createGoTo()` le sache.

**Source** : `packages/ds/src/composables/Commons/goTo.composable.ts`

**Consommateurs** (3) : `components/Slide/OrigamSlideGroup.vue`, `consts/Commons/virtual.const.ts`, `interfaces/Commons/virtual.interface.ts`

## `useGroup`

```ts
export function useGroup ( props: IGroupProps, injectKey: InjectionKey<IGroupProvide> )
```

Root of a selectable group (tabs, chip-group, toggle-group…) —
tracks registered items and the v-model selection, provides
`injectKey` so `useGroupItem` consumers down the tree can register
and read/write back into it.
Independent from `useGroupItem` at the call level (no direct
function dependency) — the two only share the `injectKey`
provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/group.composable.ts`

**Consommateurs** (14) : `components/BottomNav/OrigamBottomNav.vue`, `components/Btn/OrigamBtnToggle.vue`, `components/Chip/OrigamChipGroup.vue`, `components/ExpansionPanel/OrigamExpansionPanels.vue`, `components/ItemGroup/OrigamItemGroup.vue`, `components/Slide/OrigamSlideGroup.vue`, `components/Tabs/OrigamTabPanels.vue`, `components/Tabs/OrigamTabs.vue`, …

## `useGroupItem`

```ts
export function useGroupItem ( props: IGroupItemProps, injectKey: InjectionKey<IGroupProvide>, required = true ): IGroupItemProvide | null
```

Registers a single item (tab, chip, toggle button…) against the
nearest `injectKey` group provided by `useGroup`.
Independent from `useGroup` at the call level (no direct function
dependency) — the two only share the `injectKey` provide/inject
contract.

**Source** : `packages/ds/src/composables/Commons/groupItem.composable.ts`

**Consommateurs** (15) : `components/Btn/OrigamBtn.vue`, `components/Chip/OrigamChip.vue`, `components/ExpansionPanel/OrigamExpansionPanel.vue`, `components/ItemGroup/OrigamItemGroupItem.vue`, `components/Tabs/OrigamTab.vue`, `components/Tabs/OrigamTabPanel.vue`, `components/Tabs/OrigamTabs.vue`, `components/Window/OrigamWindowItem.vue`, …

## `useGroupSiblingLink`

```ts
export function useGroupSiblingLink ( ownKey: InjectionKey<IGroupProvide>, siblingKey: InjectionKey<IGroupProvide> ): Ref<IGroupProvide | null>
```

Vue's `provide` / `inject` only crosses the ANCESTOR chain — two
components declared as SIBLINGS under a common parent (e.g. the
documented `<OrigamTabs>` / `<OrigamTabPanels>` usage, #441) can
never `inject()` each other directly: the sibling never appears in
either one's ancestor chain, so the lookup always resolves to
`null`, no matter how the injection key is built.

This composable finds the matching sibling's `useGroup` state by
walking the shared parent's RENDERED subtree instead — the same
`findChildrenWithProvide` trick `useGroup.register` already uses to
order same-group children. Multiple same-parent pairs are matched
by DOCUMENT ORDER: the n-th component providing `ownKey` pairs with
the n-th component providing `siblingKey`.

Resolved lazily in `onMounted`, not read eagerly during `setup()`:
mount order follows document order, so when e.g. `<OrigamTabs>`'s
own `setup()` runs, a LATER-declared `<OrigamTabPanels>` sibling
does not exist yet — an eager read would always see nothing, which
is the exact #441 bug. `onMounted` callbacks are queued and only
flushed once the whole initial tree (both siblings) has mounted, so
by the time this runs the sibling is guaranteed to have registered.
The returned `Ref` starts at `null` and updates once resolved —
callers must read it inside a `computed` (or other reactive spot)
for the update to reach the template, never destructure `.value`
during their own `setup()` body.

**Source** : `packages/ds/src/composables/Commons/groupSiblingLink.composable.ts`

**Consommateurs** (5) : `components/Tabs/OrigamTab.vue`, `components/Tabs/OrigamTabPanel.vue`, `components/Tabs/OrigamTabPanels.vue`, `components/Tabs/OrigamTabs.vue`, `consts/Tabs/tabs.const.ts`

## `useHotkey`

```ts
export function useHotkey ( keys: MaybeRef<string | undefined>, callback: (e: KeyboardEvent)
```

Enregistre un raccourci clavier global (`window.addEventListener`) pour
`keys` (une combinaison `"ctrl+k"` ou une SEQUENCE `"g g"` separee par
espace, avec un `sequenceTimeout` entre chaque groupe). Traduit `cmd`/`meta`
selon la plateforme detectee (`navigator.userAgent`) : `ctrl` attendu sur
non-Mac, `meta` attendu sur Mac. Ignore l'evenement quand un champ de
saisie a le focus, sauf `options.inputs`.

⛔ En dehors d'un contexte `setup()` Vue, AUCUN nettoyage automatique
n'est enregistre (pas de `onBeforeUnmount` possible) — un
`console.warn` (`HOTKEY_NO_AUTO_CLEANUP_WARNING`) le signale, et
l'appelant DOIT invoquer lui-meme la fonction `cleanup` retournee.
Hors navigateur (`!IN_BROWSER`), la fonction est un no-op immediat, y
compris pour le retour (fonction vide, pas d'erreur).

**Source** : `packages/ds/src/composables/Commons/hotkey.composable.ts`

**Consommateurs** (6) : `components/CommandPalette/OrigamCommandPalette.vue`, `consts/CommandPalette/command-palette.const.ts`, `consts/Commons/hotkey.const.ts`, `interfaces/CommandPalette/command-palette.interface.ts`, `interfaces/CommandPalette/command.interface.ts`, `types/CommandPalette/command-palette.type.ts`

## `useHydration`

```ts
export function useHydration ()
```

Retourne un `Ref<boolean>` qui vaut `false` jusqu'a l'hydratation cote
client puis bascule a `true` dans un `onMounted` — utile pour retarder un
rendu sensible a l'hydratation sans passer par `<ClientOnly>`.

Le flag SSR vient de `useDisplay().ssr` : si l'instance de display n'a
jamais ete creee en mode SSR (`ssr` falsy), le Ref demarre directement a
`true` — pas de delai artificiel dans une app 100% client. Hors
navigateur (`!IN_BROWSER`), retourne un Ref fige a `false`.

**Source** : `packages/ds/src/composables/Commons/hydration.composable.ts`

**Consommateurs** (2) : `components/Overlay/OrigamOverlay.vue`, `nuxt/module.ts`

## `useInstalledThemes`

```ts
export function useInstalledThemes (): TInstalledThemes
```

Retourne la liste des themes de marque installes via
`createOrigam({ themes })` — une entree par `name` de marque distincte,
chacune listant les modes concrets pour lesquels elle a ete installee.
Un consommateur (ex. un switch de theme) itere sur cette liste au lieu
de coder en dur les marques disponibles.

Retourne un tableau vide (jamais `undefined`) si aucun theme n'a ete
installe, ou hors d'une app qui a execute `createOrigam()` — aucun
garde-nul necessaire cote appelant. La liste est un instantane STATIQUE
pris a l'installation ; a coupler avec `useTheme()` pour lire/changer la
marque et le mode actifs.

**Source** : `packages/ds/src/composables/Commons/installed-themes.composable.ts`

**Consommateurs** (6) : `consts/Commons/theme.const.ts`, `interfaces/Commons/commons.interface.ts`, `interfaces/Commons/nuxt-module.interface.ts`, `interfaces/Commons/theme.interface.ts`, `nuxt/plugin.client.ts`, `types/Commons/installed-theme.type.ts`

## `useIntersectionObserver`

```ts
export function useIntersectionObserver (callback?: IntersectionObserverCallback, options?: IntersectionObserverInit)
```

Expose `intersectionRef` (a poser en template ref sur l'element a
observer) et `isIntersecting` — un `IntersectionObserver` est cree une
fois, re-attache automatiquement quand `intersectionRef` change
d'element (desobserve l'ancien, observe le nouveau), et deconnecte a
`onBeforeUnmount`.

Si `SUPPORTS_INTERSECTION` est faux (navigateur sans l'API, ou SSR),
AUCUN observer n'est cree — `isIntersecting` reste fige a `false` et
`callback` n'est jamais appele, silencieusement. Aucun fallback
polyfill.

**Source** : `packages/ds/src/composables/Commons/intersectionObserver.composable.ts`

**Consommateurs** (3) : `components/InfiniteScroll/OrigamInfiniteScrollIntersect.vue`, `components/Progress/OrigamProgressCircular.vue`, `components/Progress/OrigamProgressLinear.vue`

## `useItems`

```ts
export function useItems (props: IItemProps &
```

Normalise `props.items` (formats varies : chaine, objet, `itemTitle`/
`itemValue` custom…) en `IInternalListItem[]` via `transformListItems`,
et fournit `transformIn`/`transformOut` pour convertir entre le
v-model brut (valeurs primitives ou objets selon `props.returnObject`)
et ces items internes — utilise par Select/Autocomplete/Combobox.

`transformIn` filtre les `null` du modele SAUF si `null` est lui-meme
une valeur d'item valide (`hasNullItem`) — sans cette exception, un item
"Aucun" dont la valeur est `null` ne pourrait jamais etre selectionne.
`valueComparator` (par defaut `deepEqual`) est ce qui decide si une
valeur du modele correspond a un item existant plutot que de creer un
item ad hoc.

**Source** : `packages/ds/src/composables/Commons/items.composable.ts`

**Consommateurs** (2) : `components/List/OrigamList.vue`, `components/Select/OrigamSelect.vue`

## `useLayout`

```ts
export function useLayout ()
```

Reads the nearest `ORIGAM_LAYOUT_KEY` injection provided by
`useCreateLayout` and exposes its main-area rect/styles.
Throws when no layout provider is found in the tree — unlike
`useLayoutItem`, a bare consumer of the main area has no sensible
standalone fallback.
Independent from `useLayoutItem` / `useCreateLayout` at the call
level (no direct function dependency) — the three only share the
`ORIGAM_LAYOUT_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/layout.composable.ts`

**Consommateurs** (2) : `components/Main/OrigamMain.vue`, `components/Snackbar/OrigamSnackbar.vue`

## `useLayoutItem`

```ts
export function useLayoutItem (options:
```

Registers a component (BottomNav, AppBar, Drawer…) as an item of the
nearest `ORIGAM_LAYOUT_KEY` layout provided by `useCreateLayout`.
Falls back to inert styles when no layout provider is present so the
component still renders standalone (stories, modal previews, tests).
Independent from `useLayout` / `useCreateLayout` at the call level
(no direct function dependency) — the three only share the
`ORIGAM_LAYOUT_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/layoutItem.composable.ts`

**Consommateurs** (7) : `components/App/OrigamAppBar.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Drawer/OrigamDrawer.vue`, `components/SystemBar/OrigamSystemBar.vue`, `interfaces/Commons/layout.interface.ts`, `interfaces/Layout/layout.interface.ts`, `interfaces/SystemBar/system-bar.interface.ts`

## `useLazy`

```ts
export function useLazy (props:
```

Rendu paresseux du contenu d'un composant flottant/conditionnel :
`hasContent` ne devient vrai qu'apres la PREMIERE activation de
`active` (ou immediatement si `props.eager`), et reste vrai ensuite
(`isBooted`) meme quand `active` repasse a `false` — le contenu n'est
donc monte qu'une fois, puis conserve.

`onAfterLeave` (a cabler sur la fin de transition de sortie) remet
`isBooted` a `false` pour un composant NON `eager` — c'est ce hook qui
demonte reellement le contenu apres la fermeture, pas le changement de
`active` lui-meme. Un composant `eager` ignore ce reset : son contenu
reste toujours monte.

**Source** : `packages/ds/src/composables/Commons/lazy.composable.ts`

**Consommateurs** (4) : `components/ExpansionPanel/OrigamExpansionPanelContent.vue`, `components/Overlay/OrigamOverlay.vue`, `components/Tabs/OrigamTabPanel.vue`, `components/Window/OrigamWindowItem.vue`

## `useLink`

```ts
export function useLink (props: ILinkProps & ITagProps, attrs: SetupContext['attrs']): ILink
```

Resolves the tag / clickable state / router-aware navigation of any
link-like component (Btn, Card, Chip, ListItem, BreadcrumbItem…).
Depends on `useRoute` for the exact-match `isActive` derivation —
kept in its own file since it is a consumer of `useRoute`, not a
variant of it.

**Source** : `packages/ds/src/composables/Commons/link.composable.ts`

**Consommateurs** (9) : `components/Breadcrumb/OrigamBreadcrumbItem.vue`, `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/Chip/OrigamChip.vue`, `components/DatePicker/OrigamDatePickerHeader.vue`, `components/List/OrigamListItem.vue`, `interfaces/Commons/link.interface.ts`, `interfaces/Commons/router.interface.ts`, …

## `useLoader`

```ts
export function useLoader ( props: ILoaderProps, defaultKind: TLoaderKind = LOADER_KIND.CIRCULAR, name = getCurrentInstanceName() ):
```

Resout la prop polymorphe `loading` (`boolean | number | TLoaderConfig`)
en un descripteur normalise : `loaderClasses` (`{name}--loading`),
`isLoading` (booleen), et `loaderConfig` (kind, `modelValue`,
`indeterminate`, `overrides`) que le composant utilise pour monter le
bon renderer. `defaultKind` est choisi par CHAQUE consommateur —
`'circular'` pour Btn, `'line'` pour Card, etc. — utilise quand
`loading` est `true`/un nombre plutot qu'un objet `{ type }`.

Determinisme derive de la FORME de la valeur, pas d'un flag explicite :
`loading={true}` → indetermine ; `loading={42}` → determine a 42 ;
`loading={{ type: 'line', modelValue: 42 }}` → determine ; `loading=
{{ type: 'line' }}` (sans `modelValue`) → indetermine. Un objet SANS
`type` est traite comme "pas d'objet reconnu" et retombe sur l'etat
inactif.

**Source** : `packages/ds/src/composables/Commons/loader.composable.ts`

**Consommateurs** (12) : `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/DataList/OrigamDataList.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableRows.vue`, `components/ExpansionPanel/OrigamExpansionPanel.vue`, `components/ExpansionPanel/OrigamExpansionPanelContent.vue`, `components/ExpansionPanel/OrigamExpansionPanels.vue`, …

## `useLocale`

```ts
export function useLocale (strict?: true): ILocaleInstance /********************************************************* * useLocale (surcharge `strict: false`) * * @description * Variante non stricte : retourne `null` plutot que de lever quand aucun * `createOrigam()` n'est installe. Voir la banniere au-dessus de la * premiere surcharge pour le comportement complet et son unique usage * legitime (#444, `OrigamLoader`). ********************************************************/ export function useLocale (strict: false): ILocaleInstance | null /********************************************************* * useLocale (implementation) * * @description * Lit l'instance de locale injectee sous `ORIGAM_LOCALE_KEY` ; leve si * absente et `strict` (defaut `true`), retourne `null` sinon. Voir la * banniere au-dessus de la premiere surcharge pour le detail du contrat. ********************************************************/ export function useLocale (strict: boolean = true): ILocaleInstance | null
```

Reads the injected locale instance (i18n adapter + RTL state).
Independent from `useRtl` at the call level (both inject
`ORIGAM_LOCALE_KEY` separately) — kept in its own file since it is
conceptually the locale-resolution half of the system, not RTL.

`strict` (default `true`) preserves the exact behaviour every one of
the 50+ existing call sites already depends on: throw when no
`createOrigam()` plugin is installed. Pass `strict: false` ONLY for a
component that MUST keep mounting without the plugin (e.g. it sits in
another component's unconditionally-rendered tree, so simply mounting
that parent must not hard-fail) — the caller then gets `null` back and
is responsible for its own fallback (issue #444, `OrigamLoader`).

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** (75) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Calendar/OrigamCalendar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `useLocale`

```ts
export function useLocale (strict: false): ILocaleInstance | null /********************************************************* * useLocale (implementation) * * @description * Lit l'instance de locale injectee sous `ORIGAM_LOCALE_KEY` ; leve si * absente et `strict` (defaut `true`), retourne `null` sinon. Voir la * banniere au-dessus de la premiere surcharge pour le detail du contrat. ********************************************************/ export function useLocale (strict: boolean = true): ILocaleInstance | null
```

Variante non stricte : retourne `null` plutot que de lever quand aucun
`createOrigam()` n'est installe. Voir la banniere au-dessus de la
premiere surcharge pour le comportement complet et son unique usage
legitime (#444, `OrigamLoader`).

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** (75) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Calendar/OrigamCalendar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `useLocale`

```ts
export function useLocale (strict: boolean = true): ILocaleInstance | null
```

Lit l'instance de locale injectee sous `ORIGAM_LOCALE_KEY` ; leve si
absente et `strict` (defaut `true`), retourne `null` sinon. Voir la
banniere au-dessus de la premiere surcharge pour le detail du contrat.

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** (75) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Calendar/OrigamCalendar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `useLocation`

```ts
export function useLocation (props: ILocationProps, opposite = false, offset?: (side: string)
```

Resolves a `location` prop (e.g. `'top end'`) into absolute-position
CSS declarations, with an optional offset callback and an
`opposite` mode used by anchored/floating components.
Independent from `useLocationStrategies` — no shared state or call
dependency.

**Source** : `packages/ds/src/composables/Commons/location.composable.ts`

**Consommateurs** (6) : `components/Alert/OrigamAlert.vue`, `components/Badge/OrigamBadge.vue`, `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/Progress/OrigamProgressLinear.vue`, `components/Sheet/OrigamSheet.vue`

## `useLocationStrategies`

```ts
export function useLocationStrategies ( props: ILocationStrategyProps, data: ILocationStrategyData )
```

Runs a floating component's configured location strategy
(connected, static, custom function…), re-armed on window resize
and on strategy change, inside a disposable toggle scope.
Independent from `useLocation` — no shared state or call
dependency.

**Source** : `packages/ds/src/composables/Commons/locationStrategies.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useMargin`

```ts
export function useMargin (props: IMarginProps, name = getCurrentInstanceName())
```

Precedence rule — SPECIFIC beats GLOBAL, always in this order, enforced
purely by PUSH ORDER onto the `styles` array (later declarations win
within the same inline `style` attribute — this holds even across
logical vs physical property syntax for the same box edge). Mirrors
`useBorder` / `usePadding` exactly:

  1. global `margin` shorthand (1/2/4-value, logical properties)
  2. logical-axis `marginBlock` / `marginInline`
  3. physical per-side `marginTop` / `marginRight` / `marginBottom` /
     `marginLeft`

So `marginBlock` beats `margin` for the top+bottom edges, and
`marginTop` beats both `margin` and `marginBlock` for the top edge
specifically.

⚠️ The 4-value `margin` shorthand distributes in the DS's
**Haut/Gauche/Bas/Droite** order, NOT the CSS clockwise order — an
intentional convention arbitrated in issue #216 (see
`formatMarginStylesVar`). The per-side props exist precisely so a
consumer never has to know that.

NOTE ON THE UTILITY CLASSES — the scale steps
(`SPACING_SCALE_STEPS`) are mirrored by global utility classes
(`.origam--m-0` … `.origam--m-12`) that a STRING value opts into
(`margin="4"` → `var(--origam-space---4)`); the NUMBER form keeps its
legacy raw-pixel meaning (`margin={4}` → `4px`). Axis-specific
utilities (`mx`, `my`, `mt`, …) do NOT exist in the manifest, so the
directional props resolve through the INLINE-STYLE path below.

(An earlier version of this comment claimed `marginTop` / `marginInline`
"continue to fall through to the inline style path until Phase 1.5
lands". That was false in a way worth naming: no such path existed —
the props were parsed by nothing at all and emitted nothing. They now
genuinely do fall through to the inline path, which is what rungs 2
and 3 below implement.)

**Source** : `packages/ds/src/composables/Commons/margin.composable.ts`

**Consommateurs** (69) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, `components/Card/OrigamCardHeader.vue`, `components/Card/OrigamCardText.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `useMask`

```ts
export function useMask ( modelValue: MaybeRef<string | null | undefined>, mask: MaybeRef<TMask | undefined> ): IUseMaskReturn
```

Moteur de masque reactif : maintient `masked`, `unmasked`, `isValid` et
`complete` synchronises avec une chaine source (`modelValue`) et une
config de masque (possiblement polymorphe, resolue par
`resolveMaskConfig`). `modelValue` et `mask` sont tous deux acceptes en
`MaybeRef`, donc utilisables directement avec `props.modelValue`/
`props.mask`. Un changement de `mask` re-resout la config ET reformate
la valeur courante ; un changement de `modelValue` reformate seulement.

`isValid` sans config de masque est toujours `true` (rien a valider).
Avec config : vide et non requis → valide ; requis et incomplet →
invalide ; un `validator` present tranche pour le cas incomplet non
requis ; sinon la validite suit simplement `complete`.

**Source** : `packages/ds/src/composables/Commons/mask.composable.ts`

**Consommateurs** (4) : `components/TextField/OrigamTextField.vue`, `enums/TextField/text-field.enum.ts`, `interfaces/Commons/mask.interface.ts`, `types/TextField/text-field.type.ts`

## `useMessage`

```ts
export function useMessage (props: IMessageProps, otherMessages: Ref<Array<string>> | ComputedRef<Array<string>> = ref([]))
```

Resout les messages a afficher sous un champ (Field, TextField…) par
ordre de priorite : `props.errorMessages`/`otherMessages` (erreurs
externes, ex. validation) d'abord, sinon `props.hint`, sinon
`props.messages`. `hasMessages` vaut vrai des qu'une SOURCE existe —
y compris le slot `#message`, meme si les props textuelles sont vides.

`otherMessages` (typiquement les erreurs de `useValidation`) est un
parametre separe plutot qu'une prop, pour que ce composable reste
utilisable sans dependre du systeme de validation complet — un appelant
qui n'a pas de validateur passe simplement le defaut `ref([])`.

**Source** : `packages/ds/src/composables/Commons/message.composable.ts`

**Consommateurs** (2) : `components/Form/OrigamForm.vue`, `interfaces/Commons/message.interface.ts`

## `useNested`

```ts
export const useNested = (props: INestedProps)
```

Root of the nested-tree system — tracks children/parents/opened/
selected state and provides `ORIGAM_NESTED_KEY` so `useNestedItem` /
`useNestedGroupActivator` consumers down the tree (list items, tree
nodes, menu items…) can register and read/write back into it.
Independent from `useNestedItem` / `useNestedGroupActivator` at the
call level (no direct function dependency) — the three only share
the `ORIGAM_NESTED_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/nested.composable.ts`

**Consommateurs** (1) : `components/List/OrigamList.vue`

## `useNestedGroupActivator`

```ts
export function useNestedGroupActivator ()
```

Marks the current provide scope as a "group activator" — the next
`useNestedItem` down the tree reads `isGroupActivator` off the
nearest `ORIGAM_NESTED_KEY` value to skip its own register/unregister
(the activator is a visual proxy for its group, not a node itself).
Independent from `useNested` / `useNestedItem` at the call level (no
direct function dependency) — the three only share the
`ORIGAM_NESTED_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/nestedGroupActivator.composable.ts`

**Consommateurs** (1) : `components/List/OrigamListGroupActivator.vue`

## `useNestedItem`

```ts
export function useNestedItem (id: Ref<unknown>, isGroup: boolean)
```

Registers a single node (list item, tree node, menu item…) against
the nearest `ORIGAM_NESTED_KEY` tree provided by `useNested`.
Independent from `useNested` / `useNestedGroupActivator` at the call
level (no direct function dependency) — the three only share the
`ORIGAM_NESTED_KEY` provide/inject contract.

**Source** : `packages/ds/src/composables/Commons/nestedItem.composable.ts`

**Consommateurs** (2) : `components/List/OrigamListGroup.vue`, `components/List/OrigamListItem.vue`

## `usePadding`

```ts
export function usePadding (props: IPaddingProps, name = getCurrentInstanceName())
```

Precedence rule — SPECIFIC beats GLOBAL, always in this order, enforced
purely by PUSH ORDER onto the `styles` array (later declarations win
within the same inline `style` attribute — this holds even across
logical vs physical property syntax for the same box edge). Mirrors
`useBorder`'s table exactly, so the three spacing-ish surfaces
(border / padding / margin) share ONE grammar:

  1. global `padding` shorthand (1/2/4-value, logical properties)
  2. logical-axis `paddingBlock` / `paddingInline`
  3. physical per-side `paddingTop` / `paddingRight` / `paddingBottom` /
     `paddingLeft`

So `paddingBlock` beats `padding` for the top+bottom edges, and
`paddingTop` beats both `padding` and `paddingBlock` for the top edge
specifically — each rung only overrides the edge(s) it actually
targets, everything else keeps cascading from the rung below.

⚠️ The 4-value `padding` shorthand distributes in the DS's
**Haut/Gauche/Bas/Droite** order, NOT the CSS clockwise order — an
intentional convention arbitrated in issue #216 (see
`formatPaddingStylesVar`). The per-side props exist precisely so a
consumer never has to know that: `paddingLeft="8px"` is unambiguous.

Accepted per-side value forms are documented on `resolveSpacingValue`.

**Source** : `packages/ds/src/composables/Commons/padding.composable.ts`

**Consommateurs** (69) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, `components/Card/OrigamCardHeader.vue`, `components/Card/OrigamCardText.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `usePassedProps`

```ts
export function usePassedProps<T extends object> ( _props: T, instanceLabel = 'usePassedProps' ): (key: Extract<keyof T, string> | string)
```

Was-prop-passed factory — component-side primitive: for the CURRENT
component instance, returns a predicate telling whether a given prop
key was explicitly written by the parent template (`vnode.props`) —
as opposed to resolved from a default (`withDefaults()`, or Vue's
own boolean-prop coercion).

This matters beyond `useDefaults()` itself: any component that
FORWARDS its own props down to descendants as
`<OrigamDefaultsProvider>` entries (e.g. `OrigamAvatarGroup` →
`origam-avatar`, `OrigamBtnGroup` → `origam-btn`) must use this —
not a plain `!== undefined` check — to decide whether to forward a
value. Reason: Vue resolves an UNSET prop whose declared type
*includes* `boolean` (e.g. `border?: boolean | string`, `rounded?:
boolean | TRounded`) to the concrete value `false`, never to
`undefined`. A naive `omitUndefined()` over the forwarded map
therefore still ships an explicit `false` for `border`/`rounded`
even when the consumer never set them, which then wins the
`mergeDeep` against an ancestor/theme default (e.g. `origam-avatar:
{ border: true }`) — see #263.

MUST be re-read on every resolution (not captured once), for the
same reason `useDefaults()` re-reads it: a parent binding through a
dynamic `v-bind` whose object starts empty
(`childRef?.filterProps(...)` before mount) only fills `vnode.props`
on a later render.

Kept in its own file since `useDefaults` is its consumer, not the
other way round — moving it alongside `useDefaults` would make the
dependency direction backwards to read.

**Source** : `packages/ds/src/composables/Commons/passedProps.composable.ts`

**Consommateurs** (22) : `components/Avatar/OrigamAvatarGroup.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketRound.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/Carousel/OrigamCarouselItem.vue`, `components/Chart/OrigamChartPareto.vue`, …

## `usePosition`

```ts
export function usePosition (props: IPositionProps, name = getCurrentInstanceName())
```

`positionClasses` traduit `props.position` (`'absolute'|'fixed'|'relative'|'sticky'|'static'`)
en classe `{name}--{position}`. `positionStyles` emet une declaration
inline par cote present parmi `top`/`bottom`/`left`/`right`.

⛔ Contrairement a `useDimension`, AUCUNE conversion via `convertToUnit`
n'est appliquee sur `top`/`bottom`/`left`/`right` : bien que
`IPositionProps` les type `number | string`, un nombre est interpole
TEL QUEL (`"top: 8"`, pas `"top: 8px"`) — declaration CSS invalide.
Passer une chaine unitee (`"8px"`) est le seul usage sur qui marche
aujourd'hui.

**Source** : `packages/ds/src/composables/Commons/position.composable.ts`

**Consommateurs** (7) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/Sheet/OrigamSheet.vue`, `components/Snackbar/OrigamSnackbar.vue`, `components/Toolbar/OrigamToolbar.vue`

## `useProps`

```ts
export function useProps<T extends object> (props: T): IFilterPropsOptions<T>
```

## The template-ref forwarding pattern, and its one-tick delta

39 components (68 call sites, re-derive with
    grep -rlE "Ref\.value\??\.filterProps" packages/ds/src/components/
) forward their resolved props to an INTERNAL ROOT component through that
child's own exposed `filterProps`, reached via a TEMPLATE REF:

    const childRef = ref<TOrigamChild>()
    const childProps = computed(() => childRef.value?.filterProps(props, […]))

A template ref is `undefined` during the first render — it is assigned while
that very render is being patched. So render 1 binds NOTHING and the child
paints with its OWN resolved value; assigning the ref invalidates the
computed, and render 2 delivers the parent's. Before ADR-005's theme-props
resolver landed, the parent's value often never arrived at all, so the
mismatch was PERMANENT and read as an ordinary bug; the resolver turned it
into a one-tick transient.

## Measured: the transient is real, and it is NOT observable

The delta is real. Reading `wrapper.html()` synchronously after `mount()`
and again after `nextTick()` differs on 13 of the 16 sampled mountable
components (Switch, TextField, Checkbox, Radio, Select, NumberField,
PasswordField, RatingField, TextareaField, FileField, Carousel, ColorPicker,
DatePicker; Btn, Field and SliderField are stable). On OrigamSwitch the
difference is one class: `origam-input--density-default` (the child's own
themed value) becomes `origam-input--density-compact` (the parent's).

It is nevertheless invisible, because Vue flushes the invalidated re-render
on a MICROTASK, and the browser paints only at the end of a task — after the
microtask checkpoint. Measured in Chromium against the built Histoire with a
per-animation-frame sampler (rAF callbacks run immediately before that
frame's paint, so the sample sequence IS the sequence a user could see):
10 cold loads × 40 frames = 400 painted frames of the OrigamSwitch root,
sampling both the density class and `offsetHeight` (density moves geometry).
Every one of the 400: `compact@76`. Zero frames carried the stale value, and
the height never jumped.

⛔ So do NOT refactor these 68 sites to avoid the template ref on
"flash" grounds — there is no flash to fix, and the change would touch 39
components at once. If you have a DIFFERENT reason to move off template refs
(SSR, or a `watch`/`computed` in a consumer observing the intermediate
value, which IS reachable unlike the paint), state that reason: it is not
this one.

**Source** : `packages/ds/src/composables/Commons/props.composable.ts`

**Consommateurs** (171) : `components/Alert/OrigamAlert.vue`, `components/App/OrigamApp.vue`, `components/App/OrigamAppBar.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracket.vue`, …

## `useRefs`

```ts
export function useRefs<T extends object> ()
```

Collecte un tableau de template refs pour une liste `v-for` (`:ref`
pointant vers `(e) => updateRef(e, index)`) — pattern standard pour
recuperer les instances/elements enfants d'une boucle dans un ordre
stable.

Le tableau est REINITIALISE a vide a chaque `onBeforeUpdate` : c'est ce
qui evite d'accumuler des references perimees quand la liste retrecit
(sans ce reset, un index au-dela de la nouvelle longueur garderait
l'ancien element). Vue re-remplit ensuite les index via `updateRef`
pendant le re-render qui suit.

**Source** : `packages/ds/src/composables/Commons/refs.composable.ts`

**Consommateurs** (1) : `components/Pagination/OrigamPagination.vue`

## `useResizeObserver`

```ts
export function useResizeObserver (callback?: ResizeObserverCallback, box: 'content' | 'border' = 'content'): IResizeState
```

Expose `resizeRef` (template ref a poser sur l'element observe) et
`contentRect` (lecture seule) via un `ResizeObserver` re-attache
automatiquement quand `resizeRef` change d'element, meme pattern que
`useIntersectionObserver`. `box: 'border'` lit `getBoundingClientRect()`
de la cible plutot que l'`entries[0].contentRect` du callback natif.

Hors navigateur (`!IN_BROWSER`), aucun observer n'est cree —
`contentRect` reste `undefined` en permanence, silencieusement, meme
comportement de garde que `useIntersectionObserver`.

**Source** : `packages/ds/src/composables/Commons/resizeObserver.composable.ts`

**Consommateurs** (5) : `components/ColorPicker/OrigamColorPickerCanvas.vue`, `components/Pagination/OrigamPagination.vue`, `components/Progress/OrigamProgressCircular.vue`, `components/Slide/OrigamSlideGroup.vue`, `components/VirtualScroll/OrigamVirtualScrollItem.vue`

## `useRounded`

```ts
export function useRounded ( props: IRoundedProps | Ref<boolean | number | string | TRounded | null | undefined>, name = getCurrentInstanceName() )
```

Resolve the consumer's `rounded` prop into either a class (named variant
or legacy boolean) or an inline `border-radius` declaration (free-form
CSS value), then layer the per-corner overrides on top.

Precedence rule — SPECIFIC beats GLOBAL, enforced by PUSH ORDER onto the
`styles` array (later declarations win within the same inline `style`
attribute — this holds even across logical vs physical corner syntax for
the same corner). Mirrors `useBorder` / `usePadding` / `useMargin`:

  1. global `rounded` (utility rung, named variant, legacy boolean, or
     free-form 1/4-value CSS)
  2. per-corner `roundedTopLeft` / `roundedTopRight` /
     `roundedBottomLeft` / `roundedBottomRight`

So `roundedTopLeft="0"` beats `rounded="lg"` for the top-left corner
only; the other three keep the `lg` rung.

⚠️ The per-corner props are only reachable through the PROPS-OBJECT
overload. The `Ref` overload carries a single scalar — the `rounded`
shorthand — by construction, so a caller that needs the corners must
pass an object (see `useStateEffect`, which builds a `reactive` getter
bag for exactly this reason).

Behaviour matrix for the shorthand:

| `rounded` value           | output                                      |
|---------------------------|---------------------------------------------|
| unset / `false` / `null`  | nothing — component default radius wins      |
| `'small'`, `'large'`, …   | class `${name}--rounded-${value}` + token    |
| `true` or `''`            | class `${name}--rounded` (legacy)            |
| `4` (number)              | inline `border-radius: 4px`                  |
| `'4px'`                   | inline `border-radius: 4px`                  |
| `'4px 0 4px 0'`           | inline 4-corner radii                        |

Free-form strings are parsed by `BORDER_RADIUS_REGEX`. Anything that
doesn't match (and isn't a `var()`/`calc()`) is silently dropped.
Accepted per-corner value forms are documented on
`resolveRoundedCornerValue`.

**Source** : `packages/ds/src/composables/Commons/rounded.composable.ts`

**Consommateurs** (71) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Card/OrigamCardHeader.vue`, `components/Card/OrigamCardText.vue`, `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, …

## `useRoute`

```ts
export function useRoute (): Ref<RouteLocationNormalizedLoaded | undefined>
```

Reads the current route off the active component instance's proxy
(`$route`), Options-API style — kept separate from `useRouter` so a
consumer that only needs the current route doesn't pull in the
router instance accessor too.
`useLink` depends on this hook (route-aware `isActive` derivation).

**Source** : `packages/ds/src/composables/Commons/route.composable.ts`

**Consommateurs** (1) : `nuxt/module.ts`

## `useRouter`

```ts
export function useRouter (): Router | undefined
```

Reads the router instance off the active component instance's proxy
(`$router`), Options-API style — kept separate from `useRoute` so a
consumer that only needs the router instance doesn't pull in the
current-route accessor too.

**Source** : `packages/ds/src/composables/Commons/router.composable.ts`

**Consommateurs** (3) : `components/Drawer/OrigamDrawer.vue`, `components/Overlay/OrigamOverlay.vue`, `nuxt/module.ts`

## `useRtl`

```ts
export function useRtl (name = getCurrentInstanceName())
```

Reads the injected locale's RTL state and derives a `--is-rtl` /
`--is-ltr` class name for the calling component.
Independent from `useLocale` at the call level (both inject
`ORIGAM_LOCALE_KEY` separately) — kept in its own file since it is
conceptually the RTL half of the locale system, not the locale
resolution itself.

**Source** : `packages/ds/src/composables/Commons/rtl.composable.ts`

**Consommateurs** (11) : `components/App/OrigamApp.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/ColorPicker/OrigamColorPicker.vue`, `components/Field/OrigamField.vue`, `components/Grids/OrigamContainer.vue`, `components/Input/OrigamInput.vue`, `components/Overlay/OrigamOverlay.vue`, `components/Progress/OrigamProgressLinear.vue`, …

## `useScopeId`

```ts
export function useScopeId ()
```

Lit `vm.vnode.scopeId` (l'attribut `data-v-xxxx` que Vue attache aux
elements d'un `<style scoped>`) et le retourne sous forme d'un objet
d'attribut pret a `v-bind` (`{scopeId: ''}`), ou `undefined` si le
composant courant n'a pas de scope.

Utile pour du contenu TELEPORTE (Menu, Tooltip, Dialog…) : un noeud
deplace hors de l'arbre DOM du composant perd l'heritage naturel de
l'attribut scoped, donc le style scoped du parent ne s'appliquerait
plus sans le re-poser explicitement sur la racine teleportee.

**Source** : `packages/ds/src/composables/Commons/scopeId.composable.ts`

**Consommateurs** (6) : `components/Dialog/OrigamDialog.vue`, `components/Drawer/OrigamDrawer.vue`, `components/Menu/OrigamMenu.vue`, `components/Overlay/OrigamOverlay.vue`, `components/Snackbar/OrigamSnackbar.vue`, `components/Tooltip/OrigamTooltip.vue`

## `useScroll`

```ts
export function useScroll ( props: IScrollProps, args: IScrollArguments =
```

Tracks scroll position / direction / threshold ratio for a target
element (or window), driving app-bar shrink-on-scroll and similar
scroll-reactive behaviours.
Independent from `useScrollStrategies` / `useScrolling` — no shared
state or call dependency.

**Source** : `packages/ds/src/composables/Commons/scroll.composable.ts`

**Consommateurs** (1) : `components/App/OrigamAppBar.vue`

## `useScrolling`

```ts
export function useScrolling (listRef: Ref<TOrigamList | undefined>, textFieldRef: Ref<TOrigamTextField | undefined>)
```

Keyboard-driven list scrolling (PageUp/PageDown/Home/End) with a
frame-accurate "is currently scrolling" flag used to defer focus
moves until the scroll settles.
Independent from `useScroll` / `useScrollStrategies` — no shared
state or call dependency.

**Source** : `packages/ds/src/composables/Commons/scrolling.composable.ts`

**Consommateurs** (1) : `components/Select/OrigamSelect.vue`

## `useScrollStrategies`

```ts
export function useScrollStrategies ( props: IScrollStrategyProps, data: IScrollStrategyData )
```

Runs a floating component's configured scroll strategy (close,
reposition, block, …) in its own disposable effect scope, re-armed
whenever the component becomes active.
Independent from `useScroll` / `useScrolling` — no shared state or
call dependency.

**Source** : `packages/ds/src/composables/Commons/scrollStrategies.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useSelectLink`

```ts
export function useSelectLink (link: IUseLink, select?: (value: boolean, e?: Event)
```

Relie un lien de navigation (`link`, la valeur retournee par `useLink`)
a un groupe selectionnable (`select`, ex. `useGroupItem`) : quand le
lien devient actif (route courante correspond a `link.isActive`) ET que
`link.isLink` est vrai, appelle `select(true)` au `nextTick` — utilise
par `OrigamBtn` pour se marquer selectionne quand il agit comme lien de
navigation actif dans un `OrigamBtnGroup`.

Le `watch` est deliberement enveloppe dans `onMounted` — voir la
banniere juste au-dessus ("DEFERRED TO onMounted — NOT AN
OPTIMISATION") : cree en plein `setup()`, son evaluation `immediate`
lirait `link.isLink`/`link.isActive` AVANT que le resolveur de props
ADR-005 ait patché `instance.props`, figeant `isLink` a `false` pour
toujours.

**Source** : `packages/ds/src/composables/Commons/selectLink.composable.ts`

**Consommateurs** (1) : `components/Btn/OrigamBtn.vue`

## `useSize`

```ts
export function useSize (props: ISizeProps, name = getCurrentInstanceName())
```

Pour une valeur d'enum connue (`SIZES_ARRAY`), emet une classe
`{name}--size-{valeur}` PLUS, via `LEGACY_SIZE_TO_UTILITY`, la classe
utilitaire typographique `origam--text-{xs|sm|md|lg|xl}` correspondante.
Pour une valeur custom (nombre ou longueur CSS non reconnue de l'enum),
`sizeStyles` emet `width`/`height` inline via `convertToUnit` — jamais
les deux canaux a la fois pour une meme valeur.

⛔ `useSize` pilote historiquement `width`/`height`, PAS `font-size` —
la classe `origam--text-*` n'est donc pertinente QUE pour un composant
dont `size` implique aussi une echelle typographique (Btn, Chip). Un
composant qui traite `size` comme une pure dimension de boite ne doit
pas consommer `sizeClasses` dans son `:class` : `sizeStyles` reste seul
autoritaire pour la geometrie.

**Source** : `packages/ds/src/composables/Commons/size.composable.ts`

**Consommateurs** (21) : `components/Avatar/OrigamAvatar.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, `components/Btn/OrigamBtn.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/Chip/OrigamChip.vue`, `components/Dialog/OrigamDialog.vue`, `components/Field/OrigamField.vue`, `components/Icon/OrigamIcon.vue`, …

## `useSsrBoot`

```ts
export function useSsrBoot ()
```

Empeche un flash de transition CSS entre le rendu SSR et l'hydratation :
tant que `isBooted` est faux, `ssrBootStyles` force `transition: none
!important`. `isBooted` bascule a `true` un frame apres le montage
(`onMounted` + `requestAnimationFrame`), pas au montage lui-meme — le
temps que la mise en page initiale se stabilise avant d'autoriser les
transitions.

`ssrBootStyles` retourne un OBJET quand la transition doit etre
bloquee, et un TABLEAU VIDE une fois booted — deux formes differentes
pour la meme cle de retour, a bind sans normalisation prealable (Vue
accepte les deux formes dans un `:style`).

**Source** : `packages/ds/src/composables/Commons/ssrBoot.composable.ts`

**Consommateurs** (9) : `components/App/OrigamAppBar.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Counter/OrigamCounter.vue`, `components/Drawer/OrigamDrawer.vue`, `components/List/OrigamListGroup.vue`, `components/Main/OrigamMain.vue`, `components/Messages/OrigamMessages.vue`, `components/SystemBar/OrigamSystemBar.vue`, …

## `useStack`

```ts
export function useStack ( isActive: Readonly<Ref<boolean>>, zIndex: Readonly<Ref<string | number>>, disableGlobalStack: Readonly<Ref<boolean>> )
```

⛔ ADR-005 — `disableGlobalStack` used to arrive as a plain `boolean`
(`props.disableGlobalStack`, read once by the caller's setup() body). A
value set via `theme.components['origam-overlay'].disableGlobalStack`
is only patched onto `instance.props` in the `beforeCreate` hook the
theme-props-resolver installs — a read taken before that hook runs (a
plain top-level `const`) can never see it.

Accepting a `Ref` and re-reading `.value` only inside the reactive
scopes below (the toggle-scope callback, the watchEffect) defers every
read to render time — same fix shape as `useLink`/`useVModel` under the
same issue. `createStackEntry` is a `computed` for the same reason: it
must not snapshot `disableGlobalStack` either.

**Source** : `packages/ds/src/composables/Commons/stack.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useStateEffect`

```ts
export function useStateEffect ( props: TStateEffectProps, isHover: Ref<boolean> | ComputedRef<boolean> = noopRef, isActive: Ref<boolean> | ComputedRef<boolean> = noopRef, hoverState: ComputedRef<IHoverState | undefined> = computed(()
```

Composable unique remplacant la chaine `useColorEffect` +
`useBorder` + `useRounded` + `useElevation` + `usePadding` + `useMargin`
que chaque composant visuel devait repeter. Lit les etats `isHover`/
`isActive`/`isDisabled` (et leurs overrides `hoverState`/`activeState`)
et resout 8 axes state-aware : color, bgColor, border, rounded,
elevation, padding, margin, gap — chacun avec classes ET styles.
Priorite de resolution par axe : HOVER gagne sur ACTIVE (survoler un
element presse/selectionne montre la surface hover), qui gagne sur la
valeur de repos (`props.xxx`).

⛔ `status` (`success|info|warning|error`) ECRASE `color`/`bgColor` —
il n'est PAS surchargeable par les props de couleur du consommateur,
sinon le statut serait cosmetiquement sans effet. Les props directionnelles
(`borderTop`, `paddingBlock`, `marginInline`, les coins `roundedTopLeft`…)
ne sont PAS state-swappables : elles sont lues directement depuis
`props` via un objet `reactive` a accesseurs `get` — jamais un litteral
plat, qui figerait la valeur au moment de l'appel et casserait la
reactivite sur un changement de prop ulterieur (meme piege que
`pickEffective` documente plus haut pour la valeur de repos).

**Source** : `packages/ds/src/composables/Commons/stateEffect.composable.ts`

**Consommateurs** (38) : `components/Alert/OrigamAlert.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, …

## `useStateFlag`

```ts
export function useStateFlag<S extends TStateName> ( props: object, options: IStateFlagOptions<S> ): IStateFlagReturn
```

`useHover` and `useActive` were the same algorithm written twice: 33 of
their 49 lines were byte-identical once the domain word was normalised,
and their config types (`IHoverState` / `IActiveState`) were already both
aliases of `IStateEffectConfig`. This is the merge — one implementation,
driven by `options.state` (`'hover' | 'active'`).

`props.{state}` (or `props[source]` when `source` is set) accepts three
shapes. `undefined` / `false` → `isOn` is driven by `set()` / `unset()` /
`toggle()` (pointer events or click, depending on what the component
wires up), `config` is undefined. `true` → `isOn` is FORCED to `true`
regardless of interaction, `config` is undefined. An `IStateEffectConfig`
object → `isOn` is still driven by `set()`/`unset()`/`toggle()` (UNLESS
`enabled: true` is set inside the object, which forces it on like the
bare `true` case), `config` is the object itself — consumed by
`useStateEffect` to swap effective values per axis.

⛔ BUG FIX carried over from this merge (was hover-only): `set()` /
`unset()` / `toggle()` now all gate on whether the current value is a
config object, and if so flip a local `internalToggle` ref INSTEAD of
writing through the v-model. `useActive` already did this (that's where
`internalToggle` came from). `useHover` did not: its old `onMouseenter`
wrote `vmodel.value = true` unconditionally, which — for a controlled
`v-model:hover="{ bgColor: 'success' }"` — emitted `true` back to the
parent and destroyed the config object on the FIRST mouseenter (measured:
`{ bgColor: 'success' }` → `true`, config lost). Unifying on
`useActive`'s gate fixes this by construction; hover consumers get it for
free.

**Source** : `packages/ds/src/composables/Commons/stateFlag.composable.ts`

**Consommateurs** (35) : `components/Alert/OrigamAlert.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumbItem.vue`, …

## `useStatus`

```ts
export function useStatus (props: IStatusProps & IAdjacentProps, name = getCurrentInstanceName())
```

Traduit `props.status` (`success|info|warning|error`) en icone
(`$success`, `$error`…), position (`prependIcon`/`appendIcon`/`icon`
selon `statusIconPosition`), classe `{name}--{status}` et intention de
couleur forcee (`statusIntent`, non surchargeable par `color`/`bgColor`
— `error` mappe sur l'intent `danger`, les autres 1:1).

Sans `statusIconPosition` explicite, la position par defaut est
PREPEND, pas "partout" : l'ancienne logique traitait `undefined` comme
"rendre a chaque emplacement", peignant l'icone en double (prepend ET
append) dans `OrigamAlert`. Une icone `prependIcon`/`appendIcon`/`icon`
deja fournie par le consommateur passe toujours avant l'icone de statut.

**Source** : `packages/ds/src/composables/Commons/status.composable.ts`

**Consommateurs** (6) : `components/Alert/OrigamAlert.vue`, `components/Badge/OrigamBadge.vue`, `components/Btn/OrigamBtn.vue`, `components/Dialog/OrigamDialog.vue`, `components/Snackbar/OrigamSnackbar.vue`, `interfaces/Badge/badge.interface.ts`

## `useSticky`

```ts
export function useSticky (
```

Cale `rootEl` en `sticky` manuel (via un listener `scroll` passif,
pas la propriete CSS `position: sticky`) contre le layout ambiant
(`layoutItemStyles.value.top`) : `isStuck` bascule entre `false`,
`true`, `'top'` ou `'bottom'` selon la direction de scroll et la
hauteur de l'element vs la fenetre, et `stickyStyles` traduit cet etat
en declarations `top`/`bottom` inline.

`onScroll` compense le decalage fige par un overlay qui bloque le
defilement, en lisant la custom property `--origam-body-scroll-y` que
`useScroll` pose sur chaque parent defilant.

⛔ Cette lecture visait `--v-body-scroll-y` jusqu'a #556 — prefixe `--v-`,
la grammaire d'un autre design system, vestige de portage. Ce nom n'etant
declare nulle part, `bodyScroll` valait TOUJOURS `0` et la branche de
compensation etait morte. Corrige le 2026-09-06 ; le test
`TU/composables/position-sticky-556-557.spec.ts` verrouille l'accord entre
le nom pose et le nom lu.

**Source** : `packages/ds/src/composables/Commons/sticky.composable.ts`

**Consommateurs** (1) : `components/Drawer/OrigamDrawer.vue`

## `useStyle`

```ts
export function useStyle ( styles: ComputedRef, uniq: MaybeRefOrGetter<string | undefined> = undefined, name = getCurrentInstanceName() )
```

Serialises a reactive style bag into a scoped `#id { … }` rule and
delegates the actual `<head>` injection to `useStyleTag` rather than
duplicating it — this hook only owns the id resolution + style-bag
flattening (`toDeclarations`).

**Source** : `packages/ds/src/composables/Commons/style.composable.ts`

**Consommateurs** (144) : `components/Alert/OrigamAlert.vue`, `components/App/OrigamApp.vue`, `components/App/OrigamAppBar.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, …

## `useStyleTag`

```ts
export function useStyleTag ( css: MaybeRef<string>, options: IStyleTagOptions =
```

Injects a reactive `<style>` element into `<head>`, keyed by a
generated or caller-supplied id, and keeps its textContent in sync
with the reactive `css` source. `useStyle` (own file) builds a
per-instance rule ON TOP of this primitive rather than duplicating
the head-injection logic.

**Source** : `packages/ds/src/composables/Commons/styleTag.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useTeleport`

```ts
export function useTeleport (target: Ref<boolean | string | Element>)
```

Resout `target` (`true` = pas de teleport ; `false` = `document.body` ;
une chaine = selecteur CSS ; un `Element` direct) en conteneur reel a
`<teleport :to="teleportTarget">`. Cree paresseusement UN conteneur
`.origam-overlay-container` par cible parente et le REUTILISE si un
autre composant a deja teleporte dans la meme cible — pas un
conteneur par instance.

Un selecteur qui ne matche rien produit un `console.warn` et
`teleportTarget` reste `undefined` — le composant appelant retombe
alors sur son rendu non-teleporte plutot que de crasher. En SSR
(`!IN_BROWSER`), toujours `undefined`, sans avertissement.

**Source** : `packages/ds/src/composables/Commons/teleport.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useTeleportTypography`

```ts
export function useTeleportTypography ( fieldRef: Ref<
```

Fait passer la typographie REELLE d'un champ (mesuree via
`getComputedStyle`, pas les props — les props ne voient pas le
stylesheet du consommateur) vers une surface teleportee (menu de
Select, calendrier de DatePickerField…), qui sinon ne recoit ni les
regles CSS ecrites contre le champ (le selecteur ne matche pas hors du
sous-arbre) ni un `font-size` `rem`-based coherent (un `rem` descendant
se resout contre la racine du document, pas contre l'ancetre
teleporte). Republie `font-family`/`font-size`/`letter-spacing` en CSS
generique PLUS les tokens specifiques de la surface via `extraVars`.

Mesure sur `.origam-field` (pas le `<input>` brut, qui sur
ColorPickerField/DatePickerField est hors flux et rend la police par
defaut du NAVIGATEUR, sans rapport avec le design system). Quand la
taille mesuree egale `neutralFontSize` (defaut `'16px'`, la valeur non
stylee de `.origam-field`), `typographyStyles` reste VIDE — chaque
surface garde alors son propre defaut historique (`.75rem` liste,
`.85rem` calendrier) au lieu d'etre forcee a 16px a chaque ouverture.
Seule une divergence REELLE (stylesheet consommateur, wrapper de champ
different) republie les tokens. Origine : `OrigamSelect` (commit
`8354407c`), extrait ici pour eviter la reimplementation.

**Source** : `packages/ds/src/composables/Commons/teleport-typography.composable.ts`

**Consommateurs** (6) : `components/ColorPicker/OrigamColorPickerEdit.vue`, `components/ColorPickerField/OrigamColorPickerField.vue`, `components/DatePicker/OrigamDatePickerMonth.vue`, `components/DatePickerField/OrigamDatePickerField.vue`, `components/Select/OrigamSelect.vue`, `consts/Commons/teleport-typography.const.ts`

## `useTextColor`

```ts
export function useTextColor<T extends Record<K, TColor>, K extends string> ( props: T | Ref<TColor>, name?: K )
```

Resolves the text-only colour channel from a single prop source and
delegates to `useColor` — kept in its own file so the split by hook
stays one-file-one-hook, without duplicating `useColor`'s resolution
logic.

**Source** : `packages/ds/src/composables/Commons/textColor.composable.ts`

**Consommateurs** (8) : `components/DatePickerField/OrigamDatePickerField.vue`, `components/Messages/OrigamMessages.vue`, `components/Progress/OrigamProgressCircular.vue`, `components/Progress/OrigamProgressLinear.vue`, `components/QrCode/OrigamQrCode.vue`, `components/Select/OrigamSelect.vue`, `components/SliderField/OrigamSliderField.vue`, `utils/Commons/gradient.util.ts`

## `useTheme`

```ts
export function useTheme ()
```

Handle reactif partage (singleton) sur DEUX axes de theming
independants : `theme`/`setTheme`/`resolved`/`toggle` pour la marque
(`data-theme`, `'auto'|'light'|'dark'|string`), et `mode`/`setMode`/
`resolvedMode`/`toggleMode` pour le clair/sombre (`data-mode`,
`'auto'|'light'|'dark'`). Chaque setter persiste dans `localStorage` et
applique l'attribut correspondant sur `<html>`. `resolved`/`resolvedMode`
ramenent `'auto'` a une valeur concrete via `prefers-color-scheme`.

Le listener `prefers-color-scheme` est un SINGLETON initialise
paresseusement (`ensureSystemPreference`), pas un `onMounted` — donc
`resolvedMode` reste correct meme quand `useTheme()` est appele hors
d'un composant (ex. un plugin Nuxt, ou aucun cycle de vie n'existe pour
driver `onMounted`). `data-mode` ne perd JAMAIS son attribut (retombe
toujours sur une valeur concrete) — contrairement a `data-theme`, qui
est retire quand `theme === 'auto'`, car la matrice de tokens n'a pas
d'equivalent "sans mode".

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** (5) : `components/Code/OrigamCode.vue`, `components/Masonry/OrigamMasonry.vue`, `components/TextareaField/OrigamTextareaField.vue`, `interfaces/Commons/theme.interface.ts`, `nuxt/plugin.client.ts`

## `useThrottleFn`

```ts
export function useThrottleFn<T extends unknown[], R = void> (fn: (...args: T)
```

Limite `fn` a un appel toutes les `wait` ms — pattern LEADING-edge :
le premier appel dans une fenetre passe immediatement, les suivants
dans la meme fenetre sont ignores (pas mis en file). Contrairement a
un debounce, `fn` n'est jamais appele "en retard" apres la derniere
invocation.

Aucun mecanisme de nettoyage n'est retourne : le `setTimeout` interne
n'est pas annule si le composant se demonte avant `wait`. Sans
consequence sur `fn` elle-meme — le timer ne fait que reinitialiser le
flag interne (`timer = null`), il ne rappelle jamais `fn` — mais le
timer continue de tourner en memoire jusqu'a son echeance.

**Source** : `packages/ds/src/composables/Commons/throttle.composable.ts`

**Consommateurs** (1) : `components/Parallax/OrigamParallax.vue`

## `useToggleScope`

```ts
export function useToggleScope (source: WatchSource<boolean>, fn: (reset: ()
```

Execute `fn` dans un `EffectScope` dedie tant que `source` (un booleen
reactif) est vrai, et arrete ce scope (`scope.stop()` — donc tous les
effets/watchers crees a l'interieur de `fn`) des que `source` repasse a
faux. Utile pour n'activer des effets reactifs QUE pendant une periode
conditionnelle, sans les laisser tourner en arriere-plan.

Si `fn` declare un parametre (`fn.length > 0`), elle recoit une
fonction `reset` qui arrete le scope courant ET en redemarre un
nouveau immediatement — a appeler depuis l'interieur de `fn` pour
relancer ses propres effets sans attendre un cycle `source` false→true.

**Source** : `packages/ds/src/composables/Commons/toggleScope.composable.ts`

**Consommateurs** (5) : `components/App/OrigamAppBar.vue`, `components/Drawer/OrigamDrawer.vue`, `components/Overlay/OrigamOverlay.vue`, `components/Snackbar/OrigamSnackbar.vue`, `components/VirtualScroll/OrigamVirtualScroll.vue`

## `useTouch`

```ts
export function useTouch (
```

Geste tactile swipe-to-open/close pour un panneau ancre a un `position`
(`left|right|top|bottom`, ex. Navigation Drawer) : ecoute
`touchstart`/`touchmove`/`touchend` sur `window`, ne se declenche que si
le doigt part depuis la zone de bord (`TOUCH_EDGE_ZONE_PX`) ou depuis
le panneau deja ouvert, decide de la direction de drag (horizontal vs
vertical) au premier depassement de `TOUCH_DRAG_THRESHOLD_PX`, et bascule
`isActive` a la fin du geste selon la VELOCITE (fling, via
`useVelocity`) ou a defaut selon `dragProgress > TOUCH_SETTLE_PROGRESS`.

`dragStyles` emet une `transform: translate(...)` directement liee a
`dragProgress` PENDANT le drag (`transition: none` pour suivre le doigt
sans latence) — c'est au composant appelant de reprendre la transition
normale une fois `isDragging` retombe a `false`. `touchless.value` a
`true` desactive l'ouverture par swipe des `touchstart`, sans retirer
les listeners.

**Source** : `packages/ds/src/composables/Commons/touch.composable.ts`

**Consommateurs** (1) : `components/Drawer/OrigamDrawer.vue`

## `useTypography`

```ts
export function useTypography (props: ITypographyProps, varPrefix: string)
```

Volet typographique de `useMargin`/`useBorder`/`useColor` : pour
chacune des cinq `ITypographyProps` (`fontFamily`, `fontSize`,
`fontWeight`, `lineHeight`, `letterSpacing`) que le consommateur a
fixee, emet une custom property inline `--origam-{varPrefix}---{prop}`
qui repointe vers le token primitif correspondant. Une prop non fixee
n'emet rien — le theme/la variante du composant garde la main.

INLINE UNIQUEMENT (pas de classe utilitaire — `origam-utilities.css`
n'a pas de famille `.origam--font-*`), et `typographyStyles` est un
objet PLAT `{ '--var': valeur }` (jamais un tableau) : `useStyle()`
(consomme par Btn) serialise le tableau de styles au premier niveau
seulement, un objet imbrique y fuirait en `[object Object]`. ⛔ Le
var GENERIQUE emis ici (`--origam-{prefix}---font-size`, sans suffixe)
est le canal via lequel `fontSize` ecrase une variante `size`/`density`
du composant — un token statique portant ce meme nom generique
ecraserait TOUJOURS la variante (bug historique Chip/Kbd) ; la SCSS du
composant doit lire ce generique EN PREMIER, avec le token par taille
en repli.

**Source** : `packages/ds/src/composables/Commons/typography.composable.ts`

**Consommateurs** (47) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Badge/OrigamBadge.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketRound.vue`, …

## `useValidation`

```ts
export function useValidation (props: IValidationProps, name = getCurrentInstanceName(), id: MaybeRef<string | number> = getUid())
```

Moteur de validation d'un champ : execute `props.rules` contre
`validationValue`/`modelValue`, s'enregistre aupres du `OrigamForm`
ambiant (`ORIGAM_FORM_KEY`) via `register`/`unregister`/`update`, et
expose `isValid`/`isDirty`/`isPristine`/`errorMessages`/`validationClasses`.
`validateOn` (`'input'|'blur'|'submit'|'lazy'`, ou heritee du form
parent) pilote QUAND `validate()` se redeclenche automatiquement — via
`useToggleScope` pour n'ecouter que les axes concernes.

`isValid` peut valoir `undefined` (ni valide ni invalide) : c'est l'etat
"pas encore juge" d'un champ vierge (`isPristine`) sans erreur interne
ni mode `lazy` — a distinguer explicitement de `true`/`false` cote
consommateur. Le `watch([isValid, errorMessages], …)` qui notifie le
form est deliberement differe a `onMounted` (voir la banniere
"DEFERRED TO onMounted" plus bas dans le corps) pour la meme raison
ADR-005 que `useSelectLink` : une lecture
`immediate` en plein `setup()` figerait `isValid` AVANT que le
resolveur de theme ait patché `props.error`.

**Source** : `packages/ds/src/composables/Commons/validation.composable.ts`

**Consommateurs** (5) : `components/Form/OrigamForm.vue`, `components/Input/OrigamInput.vue`, `components/NumberField/OrigamNumberField.vue`, `components/OtpInputField/OrigamOtpInputField.vue`, `interfaces/Input/input.interface.ts`

## `useVariant`

```ts
export function useVariant (props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>, name = getCurrentInstanceName())
```

Traduit `props.variant` (ou un `Ref` passe directement) en une seule
classe `{name}--variant-{valeur}`. Accepte n'importe quelle chaine —
contrairement a `useDensity`/`useSize`, il n'y a pas de liste blanche
(`*_ARRAY`) a matcher : toute valeur non-nulle produit une classe, y
compris une variante que le composant ne connait pas.

**Source** : `packages/ds/src/composables/Commons/variant.composable.ts`

**Consommateurs** (3) : `components/Btn/OrigamBtn.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/Field/OrigamField.vue`

## `useVelocity`

```ts
export function useVelocity ()
```

Suit un historique glissant (`CircularBuffer`, taille `HISTORY`) de
positions par identifiant de touch (`addMovement`) et calcule une
vitesse d'impulsion (`getVelocity`) a partir des seuls echantillons
dans la fenetre `HORIZON` la plus recente — utilise par `useTouch` pour
detecter un "fling" (swipe rapide) en fin de geste.

⛔ `getVelocity(id)` LEVE si aucun echantillon n'existe pour cet `id` —
un appelant doit avoir appele `addMovement` au moins une fois pour ce
touch avant, et ne jamais appeler `getVelocity` apres `endTouch` (qui
supprime l'historique de l'id). `direction` est une propriete calculee
a chaque lecture (pas mise en cache), derivee du plus grand des deux
axes x/y.

**Source** : `packages/ds/src/composables/Commons/velocity.composable.ts`

**Consommateurs** (1) : `consts/Commons/touch.const.ts`

## `useVirtual`

```ts
export function useVirtual<T> (props: IVirtualProps, items: Ref<readonly T[]>)
```

Virtualisation de liste : ne rend que la tranche `[first, last[` de
`items` réellement visible (`computedItems`), en maintenant des
`offsets` par index (recalcules via `updateOffsets`, debattus) et un
padding haut/bas qui simule la hauteur totale de la liste. La fenetre
visible est recalculee sur scroll (`handleScroll`/`calcVisibleItems`,
via `requestAnimationFrame`) et sur redimensionnement du conteneur
(`useResizeObserver`). `scrollToIndex` delegue l'animation a `useGoTo`,
ou differe le scroll si la liste n'a pas encore mesure sa mise en page
(`targetScrollIndex`).

Le PREMIER `estimateLast()` (au moment du `shallowRef()`, en plein
`setup()`) peut lire un `props.height` PRE-THEME — voir la banniere
"the anti-flash first-paint guess" et "last's FIRST guess is
re-applied once mounted (#504)" juste en dessous : le meme piege
ADR-005 que `useSelectLink`/`useValidation`, corrige ici en
re-executant la meme estimation dans un `onMounted`. `itemHeight` n'est
jamais fige : `handleItemResize` le retrecit au minimum observe parmi
les items reellement mesures.

**Source** : `packages/ds/src/composables/Commons/virtual.composable.ts`

**Consommateurs** (2) : `components/VirtualScroll/OrigamVirtualScroll.vue`, `interfaces/VirtualScroll/virtual-scroll.interface.ts`

## `useVModel`

```ts
export function useVModel< Props extends object &
```

V-model generique pour n'importe quelle prop (pas seulement
`modelValue`) : detecte si `prop` est CONTROLE (le parent a fourni a la
fois la prop et son `onUpdate:{prop}`) ou NON CONTROLE (le composant
gere son propre etat interne, seede depuis `props[prop]` ou
`defaultValue`). `transformIn`/`transformOut` convertissent entre la
forme externe (celle de la prop) et la forme interne utilisee par le
composant — identite par defaut.

⛔ Le seed non controle est lu PARESSEUSEMENT (au premier acces via
`model`, pas a l'appel de `useVModel()`) — voir la banniere "THE
UNCONTROLLED SEED IS READ LAZILY, NOT AT SETUP" juste en dessous : le
meme piege ADR-005 que `useSelectLink`/`useValidation`/`useVirtual`,
ici avec deux consequences (le seed lui-meme ET `defaultValue` passe en
argument, qui doit etre un getter `() => props.xxx` pour rester
theme-safe). `UNSEEDED` est un symbole distinct de `undefined`, qui est
une valeur de modele legitime.

**Source** : `packages/ds/src/composables/Commons/vModel.composable.ts`

**Consommateurs** (59) : `components/App/OrigamAppBar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Checkbox/OrigamCheckbox.vue`, `components/Checkbox/OrigamCheckboxBtn.vue`, `components/Checkbox/OrigamCheckboxGroup.vue`, `components/ColorPicker/OrigamColorPicker.vue`, `components/ColorPicker/OrigamColorPickerPreview.vue`, `components/ColorPickerField/OrigamColorPickerField.vue`, …

