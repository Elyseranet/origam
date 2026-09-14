import type {
    IChartBaseEmits,
    IChartBaseProps,
    IChartBaseSlots
} from './chart-base.interface'

/**
 * Props for `<OrigamChartRadar>` — radar / spider chart
 *
 * Type-specific wrapper around `<OrigamChart type="radar">`
 * with a tightly-typed surface (no `type` prop, only options
 * relevant to radar charts).
 */
export interface IChartRadarProps extends IChartBaseProps {

}

/** Emits surfaced by `<OrigamChartRadar>`. Mirrors the base family. */
export type IChartRadarEmits = IChartBaseEmits

/**
 * Slot signatures exposed by `<OrigamChartRadar>`.
 *
 * Omits `tooltip` from the base family — the radar spoke geometry
 * has no per-point hover tooltip wired in the template (no
 * `<slot name="tooltip">` to forward it to), unlike the other
 * per-type chart components.
 */
export type IChartRadarSlots = Omit<IChartBaseSlots, 'tooltip'>
