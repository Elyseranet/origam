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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/cssSupport.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/cssSupport.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `_resetThemeForTesting`

```ts
export function _resetThemeForTesting ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `applyModeSync`

```ts
export function applyModeSync (mode: TMode)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `applyThemeSync`

```ts
export function applyThemeSync (theme: TTheme)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `createDate`

```ts
export function createDate (options: IDateOptions | undefined, locale: ILocaleInstance)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/date.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/date.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createDefaults`

```ts
export function createDefaults (options?: IDefault): Ref<IDefault>
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/defaults.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/defaults.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createDisplay`

```ts
export function createDisplay (options?: IDisplayOptions, ssr?: TSSROptions): IDisplayInstance
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/display.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/display.composable.ts`

**Consommateurs** (1) : `origam.ts`

## `createGoTo`

```ts
export function createGoTo ( options: IGoToOptions | undefined, locale: ILocaleInstance & IRtlInstance ): IGoToInstance
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/goTo.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/defaults.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `readPersistedTheme`

```ts
export function readPersistedTheme (): TTheme
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/activator.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/audio.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/date.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/date.composable.ts`

**Consommateurs** (5) : `components/DatePicker/OrigamDatePicker.vue`, `components/DatePicker/OrigamDatePickerMonth.vue`, `components/DatePicker/OrigamDatePickerMonths.vue`, `components/DatePicker/OrigamDatePickerYears.vue`, `components/DatePickerField/OrigamDatePickerField.vue`

## `useDatePickerCalendar`

```ts
export function useDatePickerCalendar (props: ICalendarProps)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/date-picker-calendar.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/delay.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/delay.composable.ts`

**Consommateurs** : aucun dans `packages/ds/src` — symbole exporte pour les consommateurs externes.

## `useDensity`

```ts
export function useDensity (props: IDensityProps | Ref<number | string | undefined>, name = getCurrentInstanceName())
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/density.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/density.composable.ts`

**Consommateurs** (44) : `components/Alert/OrigamAlert.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Avatar/OrigamAvatarGroup.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, …

## `useDimension`

```ts
export function useDimension (props: IDimensionProps)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/dimension.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/dimension.composable.ts`

**Consommateurs** (67) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketMatch.vue`, `components/Btn/OrigamBtn.vue`, `components/Calendar/OrigamCalendar.vue`, …

## `useDisplay`

```ts
export function useDisplay ( props: IDisplayProps =
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/display.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/display.composable.ts`

**Consommateurs** (9) : `components/DataTable/OrigamDataTable.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableRow.vue`, `components/DataTable/OrigamDataTableRows.vue`, `components/Pagination/OrigamPagination.vue`, `components/Parallax/OrigamParallax.vue`, `components/Slide/OrigamSlideGroup.vue`, `interfaces/DataTable/data-table-headers.interface.ts`, …

## `useDragResizer`

```ts
export function useDragResizer (el: HTMLElement | undefined, value: Ref<number>, min: number, max: number, axis: TAxis)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/dragResizer.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/dragResizer.composable.ts`

**Consommateurs** (1) : `components/TextareaField/OrigamTextareaField.vue`

## `useElevation`

```ts
export function useElevation ( props: IElevationProps | Ref<TElevation | undefined>, flat: Ref<boolean> = ref(false), bgColor: Ref<TColor> = ref(ELEVATION_LEGACY_BG_COLOR), name = getCurrentInstanceName() )
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/elevation.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/elevation.composable.ts`

**Consommateurs** (49) : `components/Audio/OrigamAudio.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Card/OrigamCard.vue`, `components/Chart/OrigamChartBoxPlot.vue`, `components/Chart/OrigamChartBullet.vue`, `components/Chart/OrigamChartCandlestick.vue`, `components/Chart/OrigamChartCartesian.vue`, `components/Chart/OrigamChartGauge.vue`, …

## `useEventListener`

```ts
export function useEventListener ( events: TEventListenerEvents, listeners: TEventListenerListeners, options?: TEventListenerOptions ): ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/eventListener.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useEventListener`

```ts
export function useEventListener ( target: TEventListenerTarget, events: TEventListenerEvents, listeners: TEventListenerListeners, options?: TEventListenerOptions ): ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/eventListener.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useEventListener`

```ts
export function useEventListener (...args: Array<unknown>): ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/eventListener.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/eventListener.composable.ts`

**Consommateurs** (1) : `types/Commons/event.type.ts`

## `useFilter`

```ts
export function useFilter<T extends IInternalItem> ( props: IFiltersProps, items: MaybeRef<T[]>, query: Ref<string | undefined> | (()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/filters.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/filters.composable.ts`

**Consommateurs** (2) : `components/DataTable/OrigamDataTable.vue`, `components/Select/OrigamSelect.vue`

## `useFocus`

```ts
export function useFocus (props: IFocusProps, name = getCurrentInstanceName())
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/focus.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/focus.composable.ts`

**Consommateurs** (22) : `components/Checkbox/OrigamCheckbox.vue`, `components/Field/OrigamField.vue`, `components/FileField/OrigamFileField.vue`, `components/NumberField/OrigamNumberField.vue`, `components/OtpInputField/OrigamOtpInputField.vue`, `components/PasswordField/OrigamPasswordField.vue`, `components/Radio/OrigamRadio.vue`, `components/SliderField/OrigamSliderField.vue`, …

## `useGoTo`

```ts
export function useGoTo (_options: Partial<IGoToOptions> =
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/goTo.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/hotkey.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/hotkey.composable.ts`

**Consommateurs** (6) : `components/CommandPalette/OrigamCommandPalette.vue`, `consts/CommandPalette/command-palette.const.ts`, `consts/Commons/hotkey.const.ts`, `interfaces/CommandPalette/command-palette.interface.ts`, `interfaces/CommandPalette/command.interface.ts`, `types/CommandPalette/command-palette.type.ts`

## `useHydration`

```ts
export function useHydration ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/hydration.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/hydration.composable.ts`

**Consommateurs** (2) : `components/Overlay/OrigamOverlay.vue`, `nuxt/module.ts`

## `useInstalledThemes`

```ts
export function useInstalledThemes (): TInstalledThemes
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/installed-themes.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/installed-themes.composable.ts`

**Consommateurs** (6) : `consts/Commons/theme.const.ts`, `interfaces/Commons/commons.interface.ts`, `interfaces/Commons/nuxt-module.interface.ts`, `interfaces/Commons/theme.interface.ts`, `nuxt/plugin.client.ts`, `types/Commons/installed-theme.type.ts`

## `useIntersectionObserver`

```ts
export function useIntersectionObserver (callback?: IntersectionObserverCallback, options?: IntersectionObserverInit)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/intersectionObserver.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/intersectionObserver.composable.ts`

**Consommateurs** (3) : `components/InfiniteScroll/OrigamInfiniteScrollIntersect.vue`, `components/Progress/OrigamProgressCircular.vue`, `components/Progress/OrigamProgressLinear.vue`

## `useItems`

```ts
export function useItems (props: IItemProps &
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/items.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/lazy.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/loader.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/loader.composable.ts`

**Consommateurs** (12) : `components/Btn/OrigamBtn.vue`, `components/Card/OrigamCard.vue`, `components/DataList/OrigamDataList.vue`, `components/DataTable/OrigamDataTableHeaders.vue`, `components/DataTable/OrigamDataTableRows.vue`, `components/ExpansionPanel/OrigamExpansionPanel.vue`, `components/ExpansionPanel/OrigamExpansionPanelContent.vue`, `components/ExpansionPanel/OrigamExpansionPanels.vue`, …

## `useLocale`

```ts
export function useLocale (strict?: true): ILocaleInstance export function useLocale (strict: false): ILocaleInstance | null export function useLocale (strict: boolean = true): ILocaleInstance | null
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
export function useLocale (strict: false): ILocaleInstance | null export function useLocale (strict: boolean = true): ILocaleInstance | null
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/locale.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/locale.composable.ts`

**Consommateurs** (75) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Badge/OrigamBadge.vue`, `components/BottomNav/OrigamBottomNav.vue`, `components/Breadcrumb/OrigamBreadcrumb.vue`, `components/Calendar/OrigamCalendar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Chart/OrigamChartBoxPlot.vue`, …

## `useLocale`

```ts
export function useLocale (strict: boolean = true): ILocaleInstance | null
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/locale.composable.ts`, puis regenerer.

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

Reactive mask engine — keeps `masked`, `unmasked`,
`isValid` and `complete` in sync with a source string
(`modelValue`) and a (possibly polymorphic) mask spec.

Both the value and the mask are accepted as a `MaybeRef`
so the composable plays well with `props.modelValue` and
a static `props.mask` alike.

Reactivity:
  - When `modelValue` changes → reformat + revalidate.
  - When `mask` changes      → re-resolve config, reformat
                               the current value.

**Source** : `packages/ds/src/composables/Commons/mask.composable.ts`

**Consommateurs** (4) : `components/TextField/OrigamTextField.vue`, `enums/TextField/text-field.enum.ts`, `interfaces/Commons/mask.interface.ts`, `types/TextField/text-field.type.ts`

## `useMessage`

```ts
export function useMessage (props: IMessageProps, otherMessages: Ref<Array<string>> | ComputedRef<Array<string>> = ref([]))
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/message.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/position.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/refs.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/refs.composable.ts`

**Consommateurs** (1) : `components/Pagination/OrigamPagination.vue`

## `useResizeObserver`

```ts
export function useResizeObserver (callback?: ResizeObserverCallback, box: 'content' | 'border' = 'content'): IResizeState
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/resizeObserver.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/scopeId.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/selectLink.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/selectLink.composable.ts`

**Consommateurs** (1) : `components/Btn/OrigamBtn.vue`

## `useSize`

```ts
export function useSize (props: ISizeProps, name = getCurrentInstanceName())
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/size.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/size.composable.ts`

**Consommateurs** (21) : `components/Avatar/OrigamAvatar.vue`, `components/Breadcrumb/OrigamBreadcrumbDivider.vue`, `components/Btn/OrigamBtn.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/Chip/OrigamChip.vue`, `components/Dialog/OrigamDialog.vue`, `components/Field/OrigamField.vue`, `components/Icon/OrigamIcon.vue`, …

## `useSsrBoot`

```ts
export function useSsrBoot ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/ssrBoot.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/stateEffect.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/status.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/status.composable.ts`

**Consommateurs** (6) : `components/Alert/OrigamAlert.vue`, `components/Badge/OrigamBadge.vue`, `components/Btn/OrigamBtn.vue`, `components/Dialog/OrigamDialog.vue`, `components/Snackbar/OrigamSnackbar.vue`, `interfaces/Badge/badge.interface.ts`

## `useSticky`

```ts
export function useSticky (
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/sticky.composable.ts`, puis regenerer.

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/teleport.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/teleport.composable.ts`

**Consommateurs** (1) : `components/Overlay/OrigamOverlay.vue`

## `useTeleportTypography`

```ts
export function useTeleportTypography ( fieldRef: Ref<
```

Floating surfaces (`OrigamMenu` and everything built on it — Select's
option list, ColorPickerField's channel editor, DatePickerField's
calendar) are teleported out of the field's DOM subtree, to escape
`overflow` and stacking contexts. A CSS rule the consuming application
writes against the field — `.my-field * { font-size: 13px }`, a compact
form theme, a scaled container — therefore never reaches the popup: the
selector simply does not match nodes outside the field's subtree.

Re-inheriting `font-size` on the teleported root is NOT enough on its
own, either. Descendant text that sizes itself with a `rem`-based token
(`var(--origam-list-item__title---font-size, 1rem)`,
`var(--origam-picker-title---font-size, .75rem)`, …) resolves `rem`
against the DOCUMENT ROOT, not the inherited value — it would keep the
root size whatever the teleported ancestor inherits.

So this composable measures the typography that ACTUALLY WON on the
field when the surface opens (`getComputedStyle`, not the props — the
props can't see a consumer's own stylesheet) and hands back a plain
style object the caller republishes on the teleported content root as
both generic CSS (`font-family` / `font-size` / `letter-spacing`, for
whatever inherits normally) AND the specific component tokens the
surface's own `rem`-sized text reads (via `extraVars`), so the two
layers of the bug are closed together. Originates from `OrigamSelect`
(commit `8354407c`) — extracted here so `OrigamColorPickerField` /
`OrigamDatePickerField` don't reimplement the same measurement.

Measured on `.origam-field` (NOT the raw `<input>`), which is the one
element every `<origam-text-field>`-based field renders with a plain,
unconditional `font-size: 16px` (no prop/token influences it — see
`OrigamField`'s own SCSS). The raw `<input>` is NOT a safe measurement
point: on `OrigamColorPickerField` / `OrigamDatePickerField` it is
deliberately taken out of flow and carries none of `OrigamInput`'s
classes, so it renders at the BROWSER's own default control font
(13.3333px in Chrome) rather than the design system's — a value with
nothing to do with the field's real typography.

That same "16px, unconditionally" fact is also what keeps this bridge a
true no-op absent a consumer override: `neutralFontSize` (default
`'16px'`) is the value `.origam-field` would show with zero consuming-app
CSS involved. When the measured size still equals it, nothing diverges —
`typographyStyles` stays empty and every surface keeps its OWN historical
default (`.75rem` list-item text, `.85rem` calendar cells, …), instead of
being forced to 16px on every open. Only an ACTUAL divergence (a
consumer's stylesheet, a different field wrapper with its own baseline)
republishes the tokens.

@param fieldRef  ref to the field sub-component (e.g. the wrapped
                 `<origam-text-field>`). Its `$el` is the DOM root the
                 typography is measured FROM.
@param isOpen    ref toggled when the teleported surface opens; the
                 measurement re-runs on every open (the consumer's CSS
                 can change between opens — a live theme switch, a
                 responsive breakpoint, …).
@param extraVars given the resolved `font-size`, returns the extra
                 `{ '--origam-…---font-size': value }` entries for the
                 specific tokens the surface's own `rem`-sized text
                 reads. Read the surface's SCSS before adding one —
                 republishing a var nothing consumes is a no-op.
@param measureSelector  selector for the element the typography is read
                 from, resolved within `fieldRef`'s root (defaults to
                 `'.origam-field'`). Falls back to the root itself when
                 no match is found.
@param neutralFontSize  the `measureSelector` element's OWN unstyled
                 `font-size` (defaults to `'16px'`, `.origam-field`'s
                 literal default). When the measured value still equals
                 this, the bridge is a no-op for this open — see above.

**Exemple**

const { typographyStyles } = useTeleportTypography(origamTextFieldRef, menu, (fontSize) => ({
    '--origam-list-item__title---font-size': fontSize,
    '--origam-list-item__subtitle---font-size': `calc(${ fontSize } * 0.875)`
}))
// …
contentProps: { style: [typographyStyles.value, consumerContentProps.style] }

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

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/theme.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/theme.composable.ts`

**Consommateurs** (5) : `components/Code/OrigamCode.vue`, `components/Masonry/OrigamMasonry.vue`, `components/TextareaField/OrigamTextareaField.vue`, `interfaces/Commons/theme.interface.ts`, `nuxt/plugin.client.ts`

## `useThrottleFn`

```ts
export function useThrottleFn<T extends unknown[], R = void> (fn: (...args: T)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/throttle.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/throttle.composable.ts`

**Consommateurs** (1) : `components/Parallax/OrigamParallax.vue`

## `useToggleScope`

```ts
export function useToggleScope (source: WatchSource<boolean>, fn: (reset: ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/toggleScope.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/toggleScope.composable.ts`

**Consommateurs** (5) : `components/App/OrigamAppBar.vue`, `components/Drawer/OrigamDrawer.vue`, `components/Overlay/OrigamOverlay.vue`, `components/Snackbar/OrigamSnackbar.vue`, `components/VirtualScroll/OrigamVirtualScroll.vue`

## `useTouch`

```ts
export function useTouch (
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/touch.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/touch.composable.ts`

**Consommateurs** (1) : `components/Drawer/OrigamDrawer.vue`

## `useTypography`

```ts
export function useTypography (props: ITypographyProps, varPrefix: string)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/typography.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/typography.composable.ts`

**Consommateurs** (47) : `components/Alert/OrigamAlert.vue`, `components/Audio/OrigamAudio.vue`, `components/Avatar/OrigamAvatar.vue`, `components/Badge/OrigamBadge.vue`, `components/Blockquote/OrigamBlockquote.vue`, `components/Bracket/OrigamBracket.vue`, `components/Bracket/OrigamBracketCompetitor.vue`, `components/Bracket/OrigamBracketRound.vue`, …

## `useValidation`

```ts
export function useValidation (props: IValidationProps, name = getCurrentInstanceName(), id: MaybeRef<string | number> = getUid())
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/validation.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/validation.composable.ts`

**Consommateurs** (5) : `components/Form/OrigamForm.vue`, `components/Input/OrigamInput.vue`, `components/NumberField/OrigamNumberField.vue`, `components/OtpInputField/OrigamOtpInputField.vue`, `interfaces/Input/input.interface.ts`

## `useVariant`

```ts
export function useVariant (props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>, name = getCurrentInstanceName())
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/variant.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/variant.composable.ts`

**Consommateurs** (3) : `components/Btn/OrigamBtn.vue`, `components/Btn/OrigamBtnGroup.vue`, `components/Field/OrigamField.vue`

## `useVelocity`

```ts
export function useVelocity ()
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/velocity.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/velocity.composable.ts`

**Consommateurs** (1) : `consts/Commons/touch.const.ts`

## `useVirtual`

```ts
export function useVirtual<T> (props: IVirtualProps, items: Ref<readonly T[]>)
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/virtual.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/virtual.composable.ts`

**Consommateurs** (2) : `components/VirtualScroll/OrigamVirtualScroll.vue`, `interfaces/VirtualScroll/virtual-scroll.interface.ts`

## `useVModel`

```ts
export function useVModel< Props extends object &
```

> ⛔ **Aucune description dans le code.** Ce symbole n'a pas de banniere
> `@description` au-dessus de sa declaration. Le generateur ne l'invente pas :
> ecrire la banniere dans `packages/ds/src/composables/Commons/vModel.composable.ts`, puis regenerer.

**Source** : `packages/ds/src/composables/Commons/vModel.composable.ts`

**Consommateurs** (59) : `components/App/OrigamAppBar.vue`, `components/Carousel/OrigamCarousel.vue`, `components/Checkbox/OrigamCheckbox.vue`, `components/Checkbox/OrigamCheckboxBtn.vue`, `components/Checkbox/OrigamCheckboxGroup.vue`, `components/ColorPicker/OrigamColorPicker.vue`, `components/ColorPicker/OrigamColorPickerPreview.vue`, `components/ColorPickerField/OrigamColorPickerField.vue`, …

