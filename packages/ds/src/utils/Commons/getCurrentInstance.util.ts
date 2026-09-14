import type { ComponentInternalInstance } from 'vue'
import { getCurrentInstance as _getCurrentInstance, useId } from 'vue'
import { toKebabCase } from './commons.util'

/**
 * Get life cycle target.
 *
 * @param target …
 */
export function getLifeCycleTarget (target?: any) {
    return target || _getCurrentInstance()
}

/**
 * Get current instance.
 *
 * @param name    …
 * @param message …
 */
export function getCurrentInstance (name: string, message?: string) {
    const vm = _getCurrentInstance()

    if (!vm) {
        throw new Error(`[Origam] ${name} ${message || 'must be called from inside a setup function'}`)
    }

    return vm
}

/**
 * Get current instance name.
 *
 * @param name …
 */
export function getCurrentInstanceName (name = 'composable') {
    const vm = getCurrentInstance(name).type

    return toKebabCase((vm as unknown as { aliasName?: string })?.aliasName ?? vm?.name ?? vm?.__name)
}

const _map = new WeakMap<ComponentInternalInstance, string>()

/**
 * Stable per-instance id, safe to render on the server and hydrate on the
 * client.
 *
 * ⛔ This used to be a module-global monotonic counter (`let _uid = 0`), with
 * `createOrigam()`'s `install()` calling a `getUid.reset()`. Both halves were
 * wrong on a persistent SSR process, in two independent ways — measured on the
 * marketing site's production build, not inferred:
 *
 *  1. A LINEAR COUNTER IS ORDER-DEPENDENT, and the order differs between the
 *     two sides. Vue's SSR renderer buffers an async subtree and resumes it
 *     after its siblings, so instances call this function in a different
 *     sequence server-side than they mount client-side. On `/`, with a single
 *     request and an idle server, **82 of 125 `origam-*` ids differed** between
 *     the served HTML and the post-hydration DOM.
 *  2. `reset()` WAS MODULE-GLOBAL STATE MUTATED FROM A PER-REQUEST PATH.
 *     Nuxt's server plugin runs `createOrigam()` + `app.use()` once per
 *     request, so request B's install rewound the counter while request A was
 *     still rendering. Under parallel load the same page was served with
 *     `origam-app-263` where a quiet server served `origam-app-0`, and every
 *     one of the 125 ids was replaced at hydration. Worse, a rewound counter
 *     hands the same number out twice, which puts **two elements with the same
 *     `id` in one document** — invalid HTML, and `useStyle` then injects two
 *     `#id { … }` rules that both match both elements.
 *
 * Vue 3.5's `useId()` fixes both by construction: the value comes from the
 * instance's position in the tree (`instance.ids`, inherited from the parent
 * and extended at every async boundary) and nothing lives at module scope.
 * Same position ⇒ same id on both sides; separate apps ⇒ separate namespaces,
 * so concurrent renders cannot see each other.
 *
 * Two properties callers rely on are preserved:
 *
 *  - **One id per instance for its whole life.** `useId()` increments on every
 *     call, so the `WeakMap` below is what makes repeated calls return the same
 *     value — same contract as before, and `style.composable.ts` depends on it.
 *  - **Must run inside `setup()`.** Unchanged: `getCurrentInstance` throws
 *     otherwise, which is a louder failure than `useId()`'s own dev-only warn.
 *
 * ⚠️ Two things changed for callers:
 *
 *  - **The return type is a `string`** (`'v-3'`, or `'v-2-0'` past an async
 *    boundary), not a number. Treat it as opaque — never parse it, never do
 *    arithmetic on it, never assume it sorts. `useGroupItem` is deliberately
 *    NOT a caller: its id is runtime-only identity that never reaches the DOM,
 *    so it keeps its own counter and `IGroupProvide`'s `id: number` is intact.
 *  - **Uniqueness is scoped to the Vue app**, where it used to be global to
 *    the module. That is the scope the value actually needs — it becomes a DOM
 *    `id`, and ids only have to be unique inside one document, which is one
 *    app in every configuration this DS ships (Nuxt, Histoire, VitePress). A
 *    page that mounts TWO independent Vue apps and renders origam components
 *    in both must give at least one of them its own
 *    `app.config.idPrefix`, or the two id spaces will overlap.
 */
export function getUid () {
    const vm = getCurrentInstance('getUid')

    const cached = _map.get(vm)

    if (cached !== undefined) return cached

    const uid = useId()

    _map.set(vm, uid)

    return uid
}
