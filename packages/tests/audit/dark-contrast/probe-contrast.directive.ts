import type { Directive } from 'vue'

/*********************************************************
 * probe-contrast.directive
 *
 * @description
 * Stand-in for `ds/src/directives/Contrast/contrast.directive.ts`, swapped in
 * by the harness' Vite alias (see `vite.config.mjs`). It marks every element
 * the real `v-contrast` binds to and does NOTHING else — no measurement, no
 * `color: !important`.
 *
 * Why an alias and not `app.directive('contrast', …)`: every component
 * imports the directive LOCALLY (`import vContrast from '…'` in
 * `<script setup>`), so an app-level registration would never be consulted.
 * Rewriting the module specifier is the only interception point that does not
 * require editing 30 components.
 *
 * ⛔ The measurement itself lives in the page-side probe of
 * `audit/dark-contrast.audit.mjs`, so that instrumenting the DS can never
 * influence what is measured.
 ********************************************************/
const probeContrast: Directive = {
    mounted (el: HTMLElement): void {
        el.dataset.origamProbe = '1'
    },
    updated (el: HTMLElement): void {
        el.dataset.origamProbe = '1'
    }
}

/*********************************************************
 * setContrastConfig
 *
 * @description
 * `createOrigam()` imports this named export from the real module. The alias
 * redirects that import here too, so the stub must keep the same shape.
 ********************************************************/
export function setContrastConfig (): void {
    /*** no-op: the probe never enforces anything ***/
}

export default probeContrast
