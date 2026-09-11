import type { IChartBaseEmits, IChartBaseProps, IChartBaseSlots } from '../../interfaces'

/**
 * Props for `<OrigamChartGauge>` — solid gauge (radial progress
 * indicator). Mirrors Highcharts' "Solid Gauge" demo: a 270-degree
 * track with a filled arc indicating the current value, an
 * optional centre label, and optional min / max endpoint labels.
 *
 * Reads the first datum of the first series as the value. Extra
 * series are ignored (gauges are single-value visualisations).
 */
export interface IChartGaugeProps extends IChartBaseProps {
    /**
     * Lower bound of the gauge range. Default `0`.
     */
    gaugeMin?: number
    /**
     * Upper bound of the gauge range. Default `100`.
     */
    gaugeMax?: number
    /**
     * Optional unit appended to the centre label (e.g. `'%'`,
     * `' km/h'`). Default `''`.
     */
    gaugeUnit?: string
    /**
     * Arc thickness in SVG pixels. Default `18`.
     */
    gaugeThickness?: number
    /**
     * Arc start angle in radians. Defaults to `-3pi/4` (bottom-left
     * of a 270deg arc centred on the bottom).
     */
    gaugeStartAngle?: number
    /**
     * Arc end angle in radians. Defaults to `+3pi/4` (bottom-right).
     */
    gaugeEndAngle?: number
    /**
     * Whether to render `gaugeMin` / `gaugeMax` labels at the arc
     * endpoints. Default `true`.
     */
    gaugeShowEndpoints?: boolean
    /**
     * Whether to render the centre value label. Default `true`.
     */
    gaugeShowValue?: boolean
}

/** Emits surfaced by `<OrigamChartGauge>`. Mirrors the base family. */
export type IChartGaugeEmits = IChartBaseEmits

/** Slot signatures exposed by `<OrigamChartGauge>`. */
export interface IChartGaugeSlots extends IChartBaseSlots {
    /**
     * Replace the centre value label. Receives the formatted value
     * + raw datum + ratio (0..1) for custom rendering.
     */
    'gauge-value'?: (bindings: { value: number, ratio: number, formatted: string, unit: string }) => any
    /** Replace the min label at the start of the arc. */
    'gauge-min'?: (bindings: { value: number }) => any
    /** Replace the max label at the end of the arc. */
    'gauge-max'?: (bindings: { value: number }) => any
}

/**
 * Output of `useChartGauge` — geometry descriptors for the arc
 * track, the indicator arc, and the label anchor points. All
 * fields are pre-formatted so the SFC just renders without
 * computing anything itself.
 */
export interface IChartGaugeGeometry {
    /** SVG `d` attribute for the full empty track arc. */
    trackPath: string
    /** SVG `d` attribute for the filled value arc (empty when value === min). */
    valuePath: string
    /** Radian angle where the value arc ends. Useful for needles. */
    valueAngle: number
    /** Radian angle where the gauge arc starts. */
    startAngle: number
    /** Radian angle where the gauge arc ends. */
    endAngle: number
    /** Outer arc radius in SVG pixels. */
    outerRadius: number
    /** Inner arc radius in SVG pixels (outerRadius - thickness). */
    innerRadius: number
    /** SVG pixel coordinate of the arc centre (X). */
    centerX: number
    /** SVG pixel coordinate of the arc centre (Y). */
    centerY: number
    /** Normalised value in `[0..1]`. */
    ratio: number
    /** Clamped value in `[min..max]`. */
    clampedValue: number
}

/**
 * Strict options consumed by `useChartGauge`. All getters are
 * thunks so the composable can be reactively driven by props,
 * a store, or computed sources without re-instantiation.
 */
export interface IUseChartGaugeOptions {
    /** Current value (un-clamped — the engine clamps to [min..max]). */
    value: () => number
    /** Lower bound of the gauge range. */
    min: () => number
    /** Upper bound of the gauge range. */
    max: () => number
    /** SVG viewBox width. */
    width: () => number
    /** SVG viewBox height. */
    height: () => number
    /** SVG inner padding (frees room for endpoint labels). */
    padding: () => { top: number, right: number, bottom: number, left: number }
    /** Optional override for the arc thickness. */
    thickness?: () => number
    /** Optional override for the arc start angle (radians). */
    startAngle?: () => number
    /** Optional override for the arc end angle (radians). */
    endAngle?: () => number
}
