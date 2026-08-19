import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import { FEATURE_QUERIES } from '../../consts/Commons/css-support.const'
import type { IUseCssSupportClientOptions } from '../../interfaces/Commons/css-support.interface'
import type { TCssFeatureName } from '../../types/Commons/css-support.type'
import { rawSupports } from '../../utils/Commons/css-support.util'

// ────────────────────────────────────────────────────────────────────────────
// `useCssSupportClient` — hydration-safe variant
// ────────────────────────────────────────────────────────────────────────────
//
// PROBLEM
// ───────
// `useCssSupport()` returns a flag that stays `false` during SSR and flips
// to the real value after hydration. If a component renders a different
// DOM tree based on that flag (e.g. CSS-vs-JS branch), the SSR markup
// shows the JS fallback, the client hydrates into the CSS branch, and
// Vue logs a hydration mismatch.
//
// SOLUTION
// ────────
// `useCssSupportClient()` returns a `Ref<boolean>` that starts at the
// caller-provided `defaultValue` (defaults to `false`) and only flips to
// the real `CSS.supports()` result inside an `onMounted` callback. Both
// SSR and the first client render therefore see the same `defaultValue`
// — no mismatch — and the runtime branch resolves a tick after mount.
//
// Use when a feature flag drives **markup** (template `v-if` /
// `<component :is>` / different DOM structure). For style-only
// branches (CSS variables, class toggles), the regular
// `useCssSupport()` is fine because the post-hydration class flip is
// invisible to the reconciler.
//
// Shares the cached `rawSupports` primitive with `useCssSupport` (its
// non-hydration-safe sibling, in its own file) — it lives in
// `utils/Commons/css-support.util.ts` so neither hook duplicates it.

/*********************************************************
 * useCssSupportClient
 *
 * @description
 * Hydration-safe single-feature gate. Returns a `Ref<boolean>` that
 * starts at `defaultValue` and flips to the real support result on
 * `onMounted`. Use to gate **markup**, not styles — for style-only
 * branches prefer `useCssSupport().css.value.X` directly.
 *
 * @example
 *   const supportsContainer = useCssSupportClient('containerQueries')
 *   // template:
 *   //   <div v-if="supportsContainer">…CSS path…</div>
 *   //   <div v-else>…JS fallback path…</div>
 ********************************************************/
export function useCssSupportClient (
    feature: TCssFeatureName | string,
    options: IUseCssSupportClientOptions = {}
): Ref<boolean> {
    const { defaultValue = false } = options
    const flag = ref(defaultValue)

    onMounted(() => {
        // We don't reuse the `useCssSupport` singleton's flags because it
        // might not be initialised yet (the caller may be the first
        // consumer). Going through `rawSupports` keeps the shared cache
        // warm regardless of call order.
        const query = (FEATURE_QUERIES as Record<string, string>)[feature] ?? feature
        flag.value = rawSupports(query)
    })

    return flag
}
