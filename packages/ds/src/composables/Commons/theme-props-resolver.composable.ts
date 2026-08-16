import { type App, getCurrentInstance, inject, ref, shallowRef } from 'vue'

import { ORIGAM_DEFAULTS_KEY } from '../../consts'
import type { IDefault } from '../../interfaces'
import { getCurrentInstanceName } from '../../utils'
import { camelize } from './defaults.composable'

// ────────────────────────────────────────────────────────────────────────────
// Theme props resolver — ADR-005
// ────────────────────────────────────────────────────────────────────────────
//
// ⛔ INVISIBLE MACHINERY — READ THIS BEFORE TOUCHING PROP RESOLUTION ANYWHERE
// IN THE DS. If a component's prop resolves to a value that does not appear
// ANYWHERE in that component's own file (not in `withDefaults()`, not in a
// `useDefaults()` call), THIS is where it came from.
//
// ## The problem this solves (full writeup: ADR-005)
//
// `useDefaults(props)` was the ONLY way for a theme's `components` block to
// reach a component's props, and it was opt-in — 178 of 217 components never
// called it, so a theme's `'origam-xxx': { … }` was a silent no-op for them.
// Worse, the 39 components that DID call it were themselves broken for any
// prop their TEMPLATE reads by its bare name: `useDefaults()` returns a NEW
// object; the compiled template reads `__props.x` (`instance.props`, the
// UNMERGED object), never the value `useDefaults()` computed. See ADR-005
// "Manifestation 2" for the verified `OrigamSelectionControl` repro this
// exact defect caused (a themed `type: 'checkbox'` silently produced
// `<input>` with no `type` attribute at all).
//
// ## The fix — resolve INSIDE `instance.props`, once, for the whole app
//
// `installThemePropsResolver()` is called once by `createOrigam()` and
// installs a GLOBAL `app.mixin({ beforeCreate() {…} })`. A Vue global mixin's
// lifecycle hooks fire for EVERY component instance created within that app —
// no matter how deeply nested, no matter whether it was written directly in
// a parent's template or produced by ANOTHER component's own `v-for`/render
// logic. This is what closes Option A's blind spot (a `<OrigamDefaultsProvider>`
// walking its own rendered vnode tree can only ever see vnodes created in ITS
// render scope — never a vnode a CHILD component renders from its own
// template). A global mixin has no such scope limit.
//
// For each instance, IF a registered theme names one of ITS OWN declared
// props (see "Cost" below for how that set is computed), this hook replaces
// that prop slot on `instance.props` with an accessor (`get`/`set`) that:
//   1. Prefers a value the parent template EXPLICITLY bound this render, read
//      from `instance.vnode.props` and SNAPSHOT at each write (mirrors
//      `usePassedProps()` — an explicitly bound `undefined` does NOT count as
//      "passed", so it correctly falls through to the theme — this is
//      manifestation 1's fix, inherited for free). The snapshot is load-bearing,
//      not an optimisation: see "Why the passed value is a SNAPSHOT" below.
//   2. Falls back to the theme's per-component default, then its `global`
//      default — read from `inject(ORIGAM_DEFAULTS_KEY, …)`, i.e. the
//      CLOSEST provider (root app defaults, OR a `<OrigamThemeProvider
//      scoped>` sub-tree override — this hook does not bypass that scoping).
//   3. Otherwise falls back to whatever Vue itself resolved for this prop
//      with NO theme involved (the component's own `withDefaults()` value,
//      or an explicit value the parent passed). This is a LIVE mirror, not a
//      static snapshot — see "Why the setter matters" below.
//
// The template ALREADY reads `instance.props` (`__props.x`) — that is simply
// how the SFC compiler emits template code. Resolving the value THERE, not
// in a value `useDefaults()` returns and hands back to the script, means
// script and template read the exact same thing BY CONSTRUCTION.
// Manifestation 2 cannot recur — there is no second object to drift from.
//
// ## Why the setter matters — do NOT remove it
//
// `Object.defineProperty` is applied to `instance.props`, which (client-side,
// non-SSR) is a `shallowReactive` Proxy. Vue's OWN prop-resolution machinery
// (`setFullProps` inside `updateProps`, run on every parent re-render) does
// `props[key] = value` to push new/changed explicit values, and — for a prop
// the parent STOPS passing — resolves a fresh default and ALSO assigns it via
// `props[key] = <resolved default>`. Compiled Vue/SFC code runs in strict
// mode (ES modules always do). A property with a getter and NO setter throws
// `TypeError: Cannot set property … which has only a getter` the moment Vue
// performs that assignment — i.e. the FIRST time a parent re-renders past a
// themed component. A getter-only accessor here is not a smaller version of
// this fix, it is a ticking crash.
//
// The setter accepts the write into a private closure variable
// (`fallbackValue`) instead of acting on it directly. Since that variable is
// only ever written by Vue's OWN resolution code, it stays exactly in sync
// with "whatever this prop would hold with no theme involved" — which is
// precisely the case-3 fallback above — with NO extra bookkeeping needed on
// our side, and no need to special-case boolean coercion, `Function`-typed
// props, or the removed-prop reset path: whatever Vue would have put in that
// slot, `fallbackValue` mirrors it.
//
// ## Where this getter's reactivity comes from — all THREE branches
//
// ⛔ An earlier version of this comment claimed "reactivity comes for free".
// That was true of ONE branch out of three, and the other two shipped a bug
// that froze 53 (component, prop) couples across 77 components. Read the
// whole list before touching any of it.
//
// The getter can return from three places. They are NOT reactive for the
// same reason, and two of them are not reactive on their own at all:
//
//   1. the passed-value snapshot, taken from `instance.vnode.props` — a PLAIN
//      OBJECT that Vue never tracks. Reading it subscribes nothing.
//   2. `defaults.value` — the theme. A real `ref`, read DURING the render
//      effect (the compiled render function calls `__props.x` synchronously
//      while that component's `ReactiveEffect` is the active tracking
//      context). THIS is the branch that is reactive by itself: reading a
//      ref's `.value` inside any active effect auto-subscribes that effect.
//   3. `fallbackValue` — what Vue itself resolved. Was a plain closure
//      variable; likewise tracked by nothing.
//
// So a theme SWAP invalidated dependents, but a value arriving from the
// PARENT did not — nor did Vue re-resolving a default when a parent stopped
// passing a prop. The template still showed fresh values, which is what hid
// this for so long: the parent's patch force-re-runs the child's render, so
// a DIRECT `__props.x` read in `render()` always looks correct. Anything
// MEMOISED did not: a `computed()` on the prop stayed stale for the lifetime
// of the instance, and a `watch()` on it NEVER fired once.
//
// ## Why this is a `shallowRef`
//
// Making `fallbackValue` a `shallowRef` and reading it FIRST, unconditionally,
// gives branches 1 and 3 the reactive dependency they lacked. It works because
// Vue's own `setFullProps` writes `props[key] = value` — hitting our setter —
// on every change that matters: a new explicit value from the parent, and the
// re-resolved default when the parent stops passing one. The setter is
// therefore the exact point where reactivity re-attaches, which is one more
// reason not to remove it (see "Why the setter matters" above).
//
// ## Why the passed value is a SNAPSHOT, not a live `vnode.props` read
//
// ⛔ The `shallowRef` alone was NOT enough, and the reason is subtle enough
// that it shipped as a second, separate defect (#52 follow-up): a `computed()`
// on a themed prop was repaired, but a `watch()` on it still never fired once.
//
// An effect reading `props.x` subscribes TWO independent channels:
//   (a) the `shallowReactive` proxy's own per-key dep, registered by its `get`
//       trap — this one is subscribed by EVERY read through `instance.props`,
//       whenever it happens;
//   (b) whatever OUR getter itself touches (`fallbackValue`, `defaults`) —
//       subscribed only by effects whose first read runs AFTER `beforeCreate`
//       patched the slot.
//
// A `computed()` is lazy: its first evaluation happens during `render()`, so it
// gets (b). A `watch(() => props.x, …)` created in `setup()` runs its getter
// EAGERLY, before this hook exists (see "Known limitation" below for why
// `beforeCreate` is after `setup`), so it only ever has (a). Proven by
// intervention: the SAME watcher moved into `onMounted()` fires; in `setup()`
// it does not.
//
// And channel (a) was dead. `MutableReactiveHandler.set` does
// `let oldValue = target[key]` — a read THROUGH our getter — then gates
// `trigger()` on `hasChanged(assignedValue, oldValue)`. Vue's
// `updateComponentPreRender` assigns `instance.vnode = nextVNode` BEFORE
// calling `updateProps`, so a getter reading `instance.vnode.props` LIVE
// already returns the parent's NEW value at compare time. `hasChanged` is
// therefore false and Vue never triggers the key — measured: at the instant
// Vue assigns `'success'`, the getter already returned `'success'`.
//
// Snapshotting the passed value in the SETTER fixes channel (a) at the root:
// the getter still returns the OLD resolution when the trap compares, so
// `hasChanged` is true and Vue triggers the key dep normally. That repairs
// EVERY reader regardless of when it subscribed — which is why this is the
// fix rather than trying to make setup-time watchers subscribe (b).
//
// The snapshot cannot drift: Vue assigns `props[key]` unconditionally for
// every key it resolves — both on the optimized `dynamicProps` path and on the
// full `setFullProps` path, including the "parent stopped passing it" reset.
// A key Vue never assigns is a key whose binding cannot change. As a bonus the
// `vnode.props` scan moved off the read path (every render) onto the write path
// (parent updates only).
//
// ## Why there is still no `computed()` here
//
// Measured, at realistic width (1000 instances × 71 props, 6 themed), 21
// interleaved rounds: the `shallowRef` costs +1 % against the plain closure
// variable (reproduced 4×: +1.6 / +1.2 / +0.5 / +1.4 %), because it does
// per-prop work only on the THEMED subset — 6 props, not 71. That is also
// exactly why ADR-005's +42.6 % does NOT apply to it: that figure measured
// per-prop work across the ENTIRE prop surface. A `computed()` per prop was
// measured at a further −5.2 % vs the getter (both within noise). Do not
// "clean this up" into a computed — it buys nothing the shallowRef doesn't
// already buy, and the ADR rejected that option on measured grounds.
//
// Re-measured after the snapshot change, same harness, 3 interleaved rounds of
// 21: median 107.1 / 103.6 / 105.7 ms against 111.3 / 106.1 / 128.5 ms for the
// live-read version. Equal or slightly better — expected, since the
// `vnode.props` scan moved off the read path (every render of every themed
// instance) onto the write path (parent updates only).
//
// ## Cost — scoped to what a theme actually names
//
// `themedPropKeysUnion()` (in `origam.ts`, next to `activeDefaultsFor`) walks
// every REGISTERED theme at install time (not just the one active at mount —
// see the note on that in `origam.ts`) and returns the UNION of
// (componentName → Set<propKey>) any theme names, PLUS a `global` set. A
// component instance whose kebab name is in neither set (nor is `global`
// themed) returns immediately from `beforeCreate` having done a single Map
// lookup — no work scales with the size of the 217-component catalogue, only
// with the size of the themes actually installed. If NO theme names ANY
// prop, `installThemePropsResolver()` never even calls `app.mixin()`.
//
// ## Known gap — a setup-created `watch()` vs a pure THEME SWAP
//
// The snapshot above repairs the proxy key dep, which is what a setup-created
// `watch()` holds — so such a watcher now fires for any value arriving from the
// PARENT. It still does NOT fire for a pure theme swap with no parent update,
// because a theme swap performs no `props[key] = …` write, and there is no
// public API to trigger a reactive object's per-key dep from outside. Effects
// whose first read happens AFTER `beforeCreate` (every `computed()`, every
// render function, any `watch` created in `onMounted`) are unaffected: they hold
// the getter's own `defaults` dep.
//
// Left open deliberately, on measured grounds: both theme objects this DS ships
// (light and dark) carry BYTE-IDENTICAL `components` blocks, so no shipped theme
// can change a prop value on a swap. The gap can only bite a consumer that
// registers several BRAND themes whose `components` blocks differ, and it
// reaches exactly TWO call sites in the whole catalogue — `OrigamMasonry.gap`
// (`watch(() => props.gap, …)`) and `OrigamTextareaField.density`. Both recover
// on their next natural trigger (a resize, the next model change).
//
// The candidate fix was built and verified: one per-instance
// `watch(defaults, …)` that force-triggers each patched key by assigning a
// fresh `Symbol` sentinel through the proxy (guarded by an `internalWrite` flag
// so the setter ignores it), which makes `hasChanged` unconditionally true. It
// closes the gap at no measurable time cost (median mount+2-update cost over
// 21 rounds × 1000 instances: 102.7–124.9 ms, indistinguishable from the
// 103.6–107.1 ms of the shipped version). It was NOT shipped because it adds a
// SECOND undocumented-Vue-internals dependency to a file that already carries
// the upgrade warning below. Pinned by an `it.fails` test so it cannot go
// dormant.
//
// ### Why the gap is NOT closed by "installing the accessor before `setup()`"
//
// That is the obvious idea, and it would close the gap for free: a `watch()`
// created in `setup()` would run its eager getter THROUGH our accessor, touch
// the `defaults` ref, and subscribe channel (b) — no sentinel, no second
// internals dependency. It was investigated against Vue 3.5.39 and the answer
// is that NO SUCH HOOK EXISTS. Do not re-run this investigation.
//
// A plugin's entire reach over an app is `App` + `AppContext`: `use`, `mixin`,
// `component`, `directive`, `mount`, `unmount`, `onUnmount`, `provide`,
// `runWithContext`, and the 10 fields of `AppConfig` (`isNativeTag`,
// `performance`, `optionMergeStrategies`, `globalProperties`, `errorHandler`,
// `warnHandler`, `compilerOptions`, `isCustomElement`, `warnRecursiveComputed`,
// `throwUnhandledErrorInProduction`, `idPrefix`). None of them is a
// per-instance callback. The only per-instance callbacks a plugin can install
// app-wide are options-API lifecycle hooks via `app.mixin`, and MEASURED order
// for one instance is:
//
//     mixin `props` getter → setup() → beforeCreate → created
//                          → onBeforeMount → onVnodeBeforeMount → render
//
// Every candidate, and why each fails:
//
//   - `app.mixin({ beforeCreate })` — invoked from `applyOptions`, which
//     `finishComponentSetup` calls strictly AFTER `setupStatefulComponent`
//     has run `setup()`. This is the current hook; it cannot be moved earlier.
//   - `onVnodeBeforeMount` (and every other vnode hook) — for a COMPONENT
//     vnode it fires inside `componentUpdateFn`, i.e. after `setupComponent`.
//     Measured to land after `onBeforeMount`. It is also unreachable: it lives
//     in the PARENT's `vnode.props`, which a plugin does not author.
//   - `app.mixin({ props })` — global mixin props ARE merged early, by
//     `normalizePropsOptions` inside `createComponentInstance` (before
//     `setup()`). But the result is cached in `appContext.propsCache` PER
//     COMPONENT TYPE: measured 2 getter calls for 3 instances. There is no
//     per-instance callback here, and a component's own `props` overwrite the
//     mixin's (`extend(normalized, props)` runs mixins first), so this cannot
//     override a declared prop's default either.
//   - a mixin prop whose `default` is a FACTORY — the one route that genuinely
//     runs per instance before `setup()` (`resolvePropValue`, called from
//     `initProps`). It still fails, on four counts, all measured: inside the
//     factory `getCurrentInstance()` returns the PARENT instance, not this one;
//     `inject()` therefore resolves against the wrong provides chain and
//     returns the default (so `ORIGAM_DEFAULTS_KEY` is unreachable and
//     `<OrigamThemeProvider scoped>` would break); the component name is not
//     derivable; and the raw props object is still EMPTY at that moment, so the
//     `if (!(key in rawProps)) continue` guard that stops a theme rewiring
//     fallthrough attrs becomes impossible. It would also add a phantom prop to
//     all 217 components plus a factory call per instance per mount.
//   - `app.config.optionMergeStrategies` — only consulted by
//     `resolveMergedOptions`, whose only callers are `applyOptions`, the
//     `$options` getter, and template resolution. All after `setup()`. And
//     `setupStatefulComponent` reads `setup` off the RAW component, never off
//     merged options, so a merged `setup` would never be invoked (`setup` is
//     not in `internalOptionMergeStrats` either — mixins cannot supply one).
//   - `app.directive` — global directives only apply where a template writes
//     `v-xxx`, and their hooks run against the rendered element anyway.
//
// The one remaining route is NOT a Vue hook: `createOrigam` both registers and
// exports the component objects, so it could WRAP `Component.setup` at install
// time to install the accessor first. Rejected on coverage, not on taste — a
// theme's `global` block applies to EVERY component, including a consumer's
// own, and a theme may name any kebab component name. This hook matches on
// `getCurrentInstanceName()`, not on origam registration, and every spec in
// `theme-props-resolver.spec.ts` exercises it against consumer stand-ins
// (`FakeCard`, `SwapCard`) that are never passed to `app.component`. Wrapping
// origam's own registry would cover the 217 and silently lose everyone else,
// so it would have to run ALONGSIDE the mixin — two mechanisms instead of one,
// plus mutation of shared module singletons (multi-app, HMR, import order).
// Strictly more fragile than the sentinel it was meant to avoid.
//
// Conclusion: closing the gap requires the sentinel described above, or
// nothing. It is a real trade-off, not an oversight.
//
// ## Known limitation — a prop read ONCE, synchronously, inside `setup()`
//
// `beforeCreate` (where this hook installs the getter/setter) fires AFTER
// `setup()` has already returned — Vue's own sequencing, not a choice made
// here (`finishComponentSetup` → `applyOptions` → `beforeCreate` only runs
// once `setupStatefulComponent` has already called `setup()` and captured
// its return value). A component that reads `props.x` synchronously at the
// TOP LEVEL of `setup()` — not inside a `computed()`, `watchEffect()`, or the
// render function itself — captures whatever Vue resolved BEFORE this hook
// patched the slot (i.e. the theme is not yet visible at that exact read).
// This is a narrow case: reading a prop once to seed a local non-reactive
// variable, which is unusual and arguably already a smell independent of
// theming. `useDefaults()` does NOT have this gap (its computed's getter
// runs on `.value` access at any time, since the defaults ref is already
// injected by the time `setup()` runs) — worth knowing if you're deciding
// whether to keep a `useDefaults()` call for a specific component instead of
// relying solely on this hook. Not audited across the 178 previously
// uncovered components; flagged here rather than guessed away.
//
// ## Pinned Vue internal — READ BEFORE UPGRADING VUE
//
// Mutating `instance.props` via `Object.defineProperty` is not a documented
// public Vue API. It is verified correct against Vue 3.5.39 (client,
// `shallowReactive` proxy semantics, and SSR where `instance.props` is the
// raw object). If a Vue upgrade changes any of:
//   - `instance.props` no longer being a plain object / Proxy you can
//     `Object.defineProperty` on (e.g. becomes a `Map`, or is frozen),
//   - `updateProps` no longer writing explicit/reset values via a plain
//     `props[key] = value` assignment,
//   - `beforeCreate` no longer firing with an active `currentInstance` (i.e.
//     `getCurrentInstance()` / `inject()` stop working inside this hook),
// this file's own tests (`theme-props-resolver.spec.ts`) MUST start failing
// LOUDLY (thrown errors or wrong resolved values) rather than silently
// no-op. If you see them fail after a Vue bump: do NOT silence them — that
// is the fourth silent failure on this exact trajectory (see ADR-005's
// "manifestation" history). Re-verify the mechanism against the new Vue
// internals, or fall back to ADR-005's documented alternative (Option C:
// `useDefaults()` on every component, opt-in, visible-but-verbose) until a
// new mechanism is designed.
//
// ## What this does NOT change
//
// - The 39 existing `useDefaults()` callers keep working unmodified — they
//   read the same injected defaults map, just via their own explicit call
//   inside `setup()` (which always runs BEFORE this hook's `beforeCreate`).
//   The two mechanisms never read from or depend on each other: `useDefaults()`'s
//   own `usePassedProps()` check reads `instance.vnode.props` directly, the
//   the same source this hook snapshots — so both independently arrive at
//   the same answer without either needing to know the other exists.
// - A key a theme names that the target component does NOT declare as a prop
//   is silently skipped (not written to `instance.attrs`, not a crash) — a
//   theme cannot accidentally rewire fallthrough attributes.

/**
 * Compute the set of prop keys, per component name (plus the special
 * `'global'` key), that AT LEAST ONE registered theme names in its
 * `components` block.
 *
 * Scoped to the UNION across every theme `createOrigam` installs — not just
 * the brand×mode active at mount. A prop named only by a theme that becomes
 * active LATER (via a runtime brand switch) still needs interception wired
 * up from the start, or it will never update after the switch (verified gap
 * in ADR-005: `rounded` stayed `'none'` after swapping to a theme that was
 * the first to name it).
 *
 * Pure — no Vue/DOM access — so it is called once, synchronously, at
 * `createOrigam()` install time.
 */
export function themedPropKeysUnion (themes: IDefault[]): Map<string, Set<string>> {
    const union = new Map<string, Set<string>>()

    for (const componentDefaults of themes) {
        for (const componentName in componentDefaults) {
            const propsForComponent = componentDefaults[componentName]
            if (!propsForComponent) continue

            let keys = union.get(componentName)
            if (!keys) {
                keys = new Set<string>()
                union.set(componentName, keys)
            }
            for (const propKey in propsForComponent) {
                keys.add(propKey)
            }
        }
    }

    return union
}

/**
 * The value the parent EXPLICITLY bound for `key` on a given vnode, or
 * `undefined` when it bound nothing — or bound `undefined` itself, which
 * deliberately does NOT count as "passed" and falls through to the theme
 * (manifestation 1's fix; mirrors `usePassedProps()`).
 *
 * Matches both the camelCase key and its raw (possibly hyphenated) template
 * spelling, because `vnode.props` holds keys exactly as the template wrote
 * them while `instance.props` holds them camelized.
 *
 * Called only from the accessor's SETTER — never from its getter. See
 * "Why the passed value is a snapshot" at the top of this file.
 */
function passedPropValue (vnodeProps: Record<string, unknown> | null, key: string): unknown {
    if (!vnodeProps) return undefined

    for (const rawKey in vnodeProps) {
        if (rawKey === key || camelize(rawKey) === key) return vnodeProps[rawKey]
    }

    return undefined
}

/**
 * Install the global `beforeCreate` hook described at the top of this file.
 * Called once by `createOrigam()` per app instance.
 *
 * No-ops (never calls `app.mixin()`) when no registered theme names any prop
 * at all — the common case for a bare `createOrigam()` install with only the
 * neutral baseline theme, which intentionally ships no `components` block.
 */
export function installThemePropsResolver (app: App, themedKeysUnion: Map<string, Set<string>>): void {
    if (!themedKeysUnion.size) return

    app.mixin({
        beforeCreate () {
            // `getCurrentInstance()` (and `inject()` below) are valid here:
            // `finishComponentSetup` wraps the WHOLE `applyOptions()` call —
            // which is what invokes merged mixin `beforeCreate` hooks — in
            // `setCurrentInstance(instance)`. See the "pinned Vue internal"
            // note above for what to do if a Vue upgrade breaks this.
            const instance = getCurrentInstance()
            if (!instance) return

            const name = getCurrentInstanceName('theme-props-resolver')

            const ownKeys = themedKeysUnion.get(name)
            const globalKeys = themedKeysUnion.get('global')
            if (!ownKeys?.size && !globalKeys?.size) return

            // Per-instance injection (NOT the root `defaultsRef` closed over
            // by `createOrigam`) so a `<OrigamThemeProvider scoped>` ancestor
            // correctly overrides this instance's resolution — same source
            // `useDefaults()` reads.
            const defaults = inject(ORIGAM_DEFAULTS_KEY, ref<IDefault>({}))

            const rawProps = instance.props as Record<string, unknown>
            const targetKeys = ownKeys ? new Set(ownKeys) : new Set<string>()
            if (globalKeys) for (const key of globalKeys) targetKeys.add(key)

            for (const key of targetKeys) {
                // A theme naming a prop the component doesn't declare is a
                // theme-authoring mistake, not a crash — and MUST NOT touch
                // `instance.attrs` (that's a different object with its own
                // fallthrough semantics).
                if (!(key in rawProps)) continue

                // Mirror of what Vue itself resolved (explicit value, or the
                // component's own `withDefaults()`). Kept LIVE by the setter
                // below — see "Why the setter matters" above.
                //
                // A `shallowRef`, NOT a plain closure variable: this is the
                // ONLY reactive dependency the getter can offer for the two
                // branches that read non-reactive sources. See "Why this is a
                // shallowRef" above before changing it back.
                const fallbackValue = shallowRef(rawProps[key])

                // SNAPSHOT of what the parent explicitly bound for this key,
                // NOT a live read of `instance.vnode.props`. `undefined` means
                // "not passed" (a present-but-`undefined` binding included —
                // manifestation 1's fix). Refreshed by the setter, i.e. at the
                // exact moment Vue pushes a new resolution into this slot.
                //
                // ⛔ A LIVE read here silently kills Vue's OWN `trigger` for
                // this key — see "Why the passed value is a snapshot" above.
                // Do not "simplify" this back into the getter.
                let passedValue = passedPropValue(instance.vnode.props as Record<string, unknown> | null, key)

                Object.defineProperty(rawProps, key, {
                    configurable: true,
                    enumerable: true,
                    get () {
                        // Read FIRST and UNCONDITIONALLY, before any branch can
                        // return early. This read is what subscribes the calling
                        // effect — and it is the whole point of the shallowRef.
                        // Vue writes this slot (`setFullProps` → `props[key] =
                        // value`) on every parent re-render that changes an
                        // explicit value, and again when a parent STOPS passing
                        // a prop and Vue re-resolves the default. Without this
                        // line, the branches below read sources Vue never
                        // tracks, and nothing invalidates a `computed` built on
                        // this prop.
                        const fallback = fallbackValue.value

                        if (passedValue !== undefined) return passedValue

                        const componentDefaults = defaults.value?.[name]
                        if (componentDefaults && componentDefaults[key] !== undefined) {
                            return componentDefaults[key]
                        }

                        const globalDefaults = defaults.value?.global
                        if (globalDefaults && globalDefaults[key] !== undefined) {
                            return globalDefaults[key]
                        }

                        return fallback
                    },
                    set (value: unknown) {
                        // ORDER MATTERS. `instance.vnode` is ALREADY the new
                        // vnode when Vue writes this slot (`updateComponentPreRender`
                        // assigns `instance.vnode = nextVNode` BEFORE calling
                        // `updateProps`), so this is the correct moment — and
                        // the only one — to re-snapshot. It must land BEFORE
                        // the ref write, because that write is what fires
                        // `flush: 'sync'` watchers synchronously; they would
                        // otherwise read a stale snapshot.
                        passedValue = passedPropValue(instance.vnode.props as Record<string, unknown> | null, key)
                        fallbackValue.value = value
                    }
                })
            }
        }
    })
}
