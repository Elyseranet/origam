import { watchEffect } from 'vue'

import { warnUnsupportedProp } from '../../utils/Commons/color.util'

/*********************************************************
 * useChartUnsupportedProp
 *
 * @description
 * ⛔ issue #426 — dev-time warning for a prop that a chart component
 * publicly exposes (usually inherited from `IChartBaseProps`) but that
 * has no rendering effect on THAT particular chart type. First
 * consumer: `colorScheme` (a rotating discrete palette) on
 * `OrigamChartBullet` / `OrigamChartCandlestick` / `OrigamChartHeatmap`
 * / `OrigamChartMap` — their colour model is a uniform fill, binary, or
 * a continuous gradient, none of which a rotating palette can drive.
 *
 * Neither wiring a fake behaviour (nothing to invent — no spec says
 * what a "rotating palette" would mean on a 2-colour or gradient
 * model) nor removing the prop (breaking change for existing
 * consumers) is on the table — see #426. Documenting + warning is the
 * third option.
 *
 * @description
 * The check runs inside `watchEffect` rather than a bare `if` in the
 * `setup()` body: per ADR-005, a prop read eagerly at `setup()` time
 * never sees a value applied later via `theme.components` (the
 * resolver patches `instance.props` after `setup()` runs). Wrapping
 * the read in `watchEffect` defers it to Vue's reactive effect flush,
 * same pattern as `useIconAccessibility`'s dev-time a11y warning.
 *
 * @description
 * Actual `console.warn` emission is delegated to `warnUnsupportedProp`
 * (`utils/Commons/color.util.ts`), which dedupes per `(component, prop)`
 * key and gates on `import.meta.env.DEV` — so the effect above may
 * re-run on every reactive change, but the console only ever sees the
 * warning once, and never in a production build.
 *
 * @param component - PascalCase component name, e.g. `'OrigamChartHeatmap'`.
 * @param prop - Name of the inapplicable prop, e.g. `'colorScheme'`.
 * @param reason - What DOES drive colour on this component, and why a
 *   rotating palette doesn't apply — surfaced verbatim in the warning.
 * @param isPassed - Reactive getter, `true` when the consumer passed a
 *   non-empty / meaningful value for the prop.
 ********************************************************/
export function useChartUnsupportedProp (
    component: string,
    prop: string,
    reason: string,
    isPassed: () => boolean,
): void {
    watchEffect(() => {
        if (isPassed()) {
            warnUnsupportedProp(component, prop, reason)
        }
    })
}
