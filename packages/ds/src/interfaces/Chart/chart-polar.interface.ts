import type {
    IChartBaseEmits,
    IChartBaseProps,
    IChartBaseSlots,
    IChartDrilldownLink,
    IChartDrilldownProps,
    IChartPoint
} from '../../interfaces'

import type { TChartPolarKind } from '../../types'

/**
 * Props for `<OrigamChartPolar>` — the polar family component.
 * Handles `pie` and `donut`. NO axes, NO grid, NO tick labels —
 * the cartesian chrome stays out of polar territory to fix the
 * historical "pie has axis lines" bug.
 */
export interface IChartPolarProps extends IChartBaseProps {
    /** Polar visualisation primitive. Default `'pie'`. */
    type?: TChartPolarKind
    /**
     * Inner-radius proportion for `'donut'`. `0` collapses to a
     * pie, `1` to a zero-thickness ring. Ignored when
     * `type='pie'`. Default `0.6`.
     */
    donutHoleSize?: number
    /** Toggle the hover tooltip. Default `true`. */
    showTooltip?: boolean
    /**
     * Formatter applied to the tooltip X label. Pie tooltips
     * show the category name + value.
     */
    xAxisFormat?: (value: string | number) => string
    /** Formatter applied to the tooltip Y value. */
    yAxisFormat?: (value: number) => string
    /**
     * Drilldown configuration. When provided, data points that carry
     * an `IChartDrilldownLink` in their object-form entry trigger a
     * chart-level navigation instead of (or alongside) `point-click`.
     * A breadcrumb `<nav>` appears above the chart when depth > 1.
     */
    drilldown?: IChartDrilldownProps
}

/** Emits surfaced by `<OrigamChartPolar>`. Extends the family base with drilldown events. */
export interface IChartPolarEmits extends IChartBaseEmits {
    /** Fired when the user drills into a sub-dataset. */
    (e: 'drill', link: IChartDrilldownLink, point: IChartPoint): void
    /** Fired when the user navigates back one drilldown level. */
    (e: 'drill-up'): void
}

/** Slot signatures exposed by `<OrigamChartPolar>`. */
export type IChartPolarSlots = IChartBaseSlots
