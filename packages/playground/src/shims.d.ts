/*
 * `origam/styles` resolves (via `vite.host.config.ts`'s alias) to the DS's
 * hand-maintained `assets/css/main.css` — a side-effect CSS import the
 * standalone host needs, with no TypeScript types of its own.
 */
declare module 'origam/styles'

/*
 * ⛔ Ambient ANY-typed shims for `origam`'s PUBLISHED subpath entry points.
 *
 * `packages/ds`'s `package.json` `exports` map resolves these to
 * `dist/src/...` — a build artefact absent from a fresh checkout
 * (`packages/ds` is not built in CI before this package's own `type-check`
 * runs). Pointing `tsconfig.json` `paths` at DS *source* instead was tried
 * and reverted: DS's own `tsconfig.json` carries compiler options and
 * ambient globals (`noUnusedLocals: false`, `ImportMeta.env`,
 * `__VUE_OPTIONS_API__`, `HTMLElement._clickOutside`, …, declared in
 * `globals.d.ts` / `vite-env.d.ts`) this package does not and should not
 * inherit — type-checking the WHOLE DS source tree under a foreign
 * tsconfig surfaced ~70 errors that are not this package's to fix, and are
 * not real under DS's own `pnpm -F origam type-check`.
 *
 * So: loosely typed shims for the handful of symbols this package actually
 * imports, kept deliberately narrow. `vite.host.config.ts`'s alias still
 * points the RUNTIME resolution at DS source (Vite doesn't need `.d.ts`
 * files, only a real module), so the standalone host runs with full
 * fidelity — only `vue-tsc`'s static check is narrowed.
 */
declare module 'origam' {
    import type { Plugin } from 'vue'

    export function createOrigam (options?: Record<string, unknown>): Plugin
}

declare module 'origam/composables' {
    import type { Ref } from 'vue'

    export function useHydration (): Ref<boolean>
    export function useVModel<T extends Record<string, unknown>, K extends keyof T> (props: T, key: K): Ref<T[K]>
}

declare module 'origam/components' {
    const components: Record<string, unknown>

    export = components
}
