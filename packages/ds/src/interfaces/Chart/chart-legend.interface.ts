import type {
    IChartLegendItem,
    IChartSeries
} from '../../interfaces'

import type { TChartLegendPosition } from '../../types'

/**
 * Props for `<OrigamChartLegend>` — the series-name + colour-swatch
 * + visibility-toggle list that sits on one side of the chart.
 * Extracted from the legacy `<OrigamChart>` so every family
 * (cartesian / polar / radar / gauge) can share the same rendering.
 *
 * The legend is a pure renderer: it expects the pre-resolved
 * `IChartLegendItem[]` array from `useChart().legend.value` and
 * emits clicks back upward.
 */
export interface IChartLegendProps {
    /**
     * Pre-resolved legend entries (series + index + colour + visibility).
     * Comes verbatim from `useChart().legend.value`.
     */
    items: Array<IChartLegendItem>
    /**
     * Anchor of the legend block. Drives the wrapping behaviour
     * (`row` on top/bottom, `column` on left/right).
     */
    position?: TChartLegendPosition
}

/**
 * Emits surfaced by `<OrigamChartLegend>`. The parent chart wires
 * these into its own `legend-click` + `series-toggle` emits so
 * consumers don't need to know about the extracted component.
 */
export interface IChartLegendEmits {
    /** Click on a legend entry — pair with `series-toggle` for state. */
    (e: 'legend-click', series: IChartSeries, index: number): void
    /** Resulting visibility flip after a legend click. */
    (e: 'series-toggle', series: IChartSeries, visible: boolean): void
}

/**
 * Slot signatures exposed by `<OrigamChartLegend>`. Currently
 * just `legend-item` so a consumer can replace one entry with a
 * custom render (chip, icon, …).
 */
export interface IChartLegendSlots {
    /** Replace one legend entry. */
    'legend-item'?: (bindings: { series: IChartSeries, index: number, visible: boolean }) => any
}
