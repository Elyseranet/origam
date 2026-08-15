import { type App, getCurrentInstance, inject, ref } from 'vue'

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
//   1. Prefers a value the parent template EXPLICITLY bound this render,
//      read live from `instance.vnode.props` (mirrors `usePassedProps()` —
//      an explicitly bound `undefined` does NOT count as "passed", so it
//      correctly falls through to the theme — this is manifestation 1's fix,
//      inherited for free).
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
// ## Why there is no `computed()` here
//
// The getter reads `defaults.value` (a plain `ref`, injected per-instance so
// a `<OrigamThemeProvider scoped>` override is honoured) DURING the render
// effect — the compiled render function calls `__props.x` synchronously while
// that component's render `ReactiveEffect` is the active tracking context.
// Reading a ref's `.value` inside ANY active effect auto-subscribes that
// effect to the ref — reactivity comes for free, with NO extra reactive node
// per prop. A `computed()` per prop was measured at a further −5.2% vs the
// getter (both within noise of each other) — the number that actually
// matters, measured at realistic width (1000 instances × 71 props, 6 themed),
// is that doing PER-PROP work on the ENTIRE prop surface (not just the
// themed subset) costs +42.6%. See ADR-005 for the full numbers. Do not
// "clean this up" into a computed — it buys nothing and the ADR explicitly
// rejected that option on measured grounds.
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
//   read the same injected map, just via their own explicit call. Both
//   mechanisms coexist safely (verified: this hook patches `instance.props`
//   BEFORE `useDefaults()` even runs inside `setup()`... actually the reverse
//   — `setup()` runs BEFORE `beforeCreate`, so `useDefaults()`'s OWN
//   `usePassedProps()` check reads `instance.vnode.props` directly too, never
//   `instance.props` — the two mechanisms never read from each other, they
//   independently arrive at the same answer from the same sources).
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

                // Snapshot of what Vue itself resolved (explicit value, or
                // the component's own `withDefaults()`). Kept LIVE by the
                // setter below — see "Why the setter matters" above.
                let fallbackValue = rawProps[key]

                Object.defineProperty(rawProps, key, {
                    configurable: true,
                    enumerable: true,
                    get () {
                        const vnodeProps = instance.vnode.props as Record<string, unknown> | null
                        if (vnodeProps) {
                            for (const rawKey in vnodeProps) {
                                if (rawKey === key || camelize(rawKey) === key) {
                                    const passedValue = vnodeProps[rawKey]
                                    // A present-but-`undefined` binding does
                                    // NOT count as "passed" — falls through
                                    // to the theme (manifestation 1's fix).
                                    if (passedValue !== undefined) return passedValue
                                    break
                                }
                            }
                        }

                        const componentDefaults = defaults.value?.[name]
                        if (componentDefaults && componentDefaults[key] !== undefined) {
                            return componentDefaults[key]
                        }

                        const globalDefaults = defaults.value?.global
                        if (globalDefaults && globalDefaults[key] !== undefined) {
                            return globalDefaults[key]
                        }

                        return fallbackValue
                    },
                    set (value: unknown) {
                        fallbackValue = value
                    }
                })
            }
        }
    })
}
