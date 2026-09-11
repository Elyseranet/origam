import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots, IChartPoint, IChartSeries } from '../../interfaces'

import type { TChartBulletOrientation, TIntent } from '../../types'

/**
 * One qualitative range band in a bullet chart.
 * Bands are rendered left-to-right (horizontal) or bottom-to-top
 * (vertical) and stack to cover the domain [0, maxRange].
 */
export interface IChartBulletRange {
    /**
     * Upper bound of this band (absolute value on the axis, not a
     * width / height fraction). Bands are rendered in array order —
     * each band covers [previous.to, this.to].
     */
    to: number
    /**
     * Fill colour for this band. Accepts a TIntent token or a raw CSS
     * colour string. When absent the component cycles through
     * `rangeColors`.
     */
    color?: TIntent | string
}

/**
 * Bullet data payload for a single series entry.
 *
 * A single datum drives one bullet row (horizontal) or column
 * (vertical). `ranges` define the qualitative background; `value` is
 * the actual-value bar; `target` is the comparative marker tick.
 */
export interface IChartBulletDatum {
    /** Actual (measured) value. Drives the solid foreground bar. */
    value: number
    /** Target / goal value. Rendered as a thin cross-tick. */
    target: number
    /**
     * Qualitative range bands rendered behind the bars.
     * At least one band is required; three is the Stephen Few
     * recommendation (poor / acceptable / good).
     */
    ranges: Array<IChartBulletRange>
}

/**
 * Pre-computed geometry descriptor for a single bullet.
 * Produced by the bullet layout engine inside `OrigamChartBullet`.
 */
export interface IChartBulletBullet {
    /** Position of this bullet in the original series array. */
    index: number
    /** Category label (from `categories[index]` or `series[index].name`). */
    category: string
    /** Raw datum ({value, target, ranges}). */
    datum: IChartBulletDatum
    /** Whether this bullet is currently visible (legend toggle). */
    visible: boolean
    /** Resolved fill colour for the actual-value bar. */
    barFill: string
    /** Resolved stroke colour for the target tick. */
    targetStroke: string
    /** Resolved fills for each range band, parallel to datum.ranges. */
    rangeFills: Array<string>
    /** SVG x of the bullet slot origin (horizontal: left edge; vertical: top edge). */
    slotX: number
    /** SVG y of the bullet slot origin. */
    slotY: number
    /** Total slot width (horizontal: plot width; vertical: slot column width). */
    slotW: number
    /** Total slot height (horizontal: slot row height; vertical: plot height). */
    slotH: number
    /** Maximum axis value = max(ranges[-1].to, target, value). */
    maxRange: number
}

/**
 * Props for `<OrigamChartBullet>` — the bullet / KPI chart family.
 *
 * Each series entry renders one bullet — a compact combination of
 * range bands (poor / acceptable / good), an actual-value bar, and a
 * target marker tick. Design by Stephen Few.
 */
export interface IChartBulletProps extends IChartBaseProps {
    /**
     * Category labels — one per series entry. Rendered beside each
     * bullet. Falls back to `series[i].name` when omitted.
     */
    categories?: Array<string>
    /**
     * Fill colour for the actual-value bar. Accepts a TIntent token or
     * a raw CSS colour. Default `'primary'`.
     */
    barColor?: TIntent | string
    /**
     * Stroke colour for the target marker tick. Default `'danger'`.
     */
    targetColor?: TIntent | string
    /**
     * Fallback palette used when `range.color` is omitted. Cycled in
     * array order across bands. Default `['danger', 'warning', 'success']`.
     */
    rangeColors?: Array<TIntent | string>
    /**
     * Layout direction. `'horizontal'` renders bullets as rows (label
     * left, bar extending right). `'vertical'` renders bullets as
     * columns (label below, bar extending upward). Default
     * `'horizontal'`.
     */
    orientation?: TChartBulletOrientation
    /**
     * Thickness of the actual-value bar as a fraction of the slot
     * height (horizontal) or slot width (vertical). Range [0, 1].
     * Default `0.45`.
     */
    barThickness?: number
    /**
     * Show the quantitative axis. Default `true`.
     */
    showAxis?: boolean
    /**
     * X-axis tick formatter — applied to axis tick labels.
     */
    xAxisFormat?: (value: string | number) => string
    /**
     * Y-axis tick formatter — applied to axis tick labels (vertical
     * orientation).
     */
    yAxisFormat?: (value: number) => string
}

/** Emits surfaced by `<OrigamChartBullet>`. Mirrors the base family. */
export type IChartBulletEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartBullet>`. */
export interface IChartBulletSlots extends IChartBaseSlots {
    /**
     * Override the default tooltip body. Receives the hovered bullet
     * descriptor plus a pre-computed delta % (value / target * 100).
     */
    tooltip?: (bindings: {
        point: IChartPoint
        series: IChartSeries
        category: string | number
        bullet: IChartBulletBullet
        delta: number
    }) => any
}
