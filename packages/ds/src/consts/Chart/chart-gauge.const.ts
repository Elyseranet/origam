/*********************************************************
 * CHART_GAUGE_DEFAULT_START_ANGLE / CHART_GAUGE_DEFAULT_END_ANGLE
 *
 * @description
 * Default gauge arc sweep — 270 degrees centred on the bottom,
 * mirroring Highcharts' "Solid Gauge" demo. The remaining 90
 * degrees at the bottom stay open so the gauge looks like a
 * speedometer instead of a closed ring.
 ********************************************************/
export const CHART_GAUGE_DEFAULT_START_ANGLE = -Math.PI * 3 / 4
export const CHART_GAUGE_DEFAULT_END_ANGLE = Math.PI * 3 / 4

/*********************************************************
 * CHART_GAUGE_DEFAULT_THICKNESS
 *
 * @description
 * Default ring thickness, in SVG user units, when the consumer does
 * not pass a `thickness` getter.
 ********************************************************/
export const CHART_GAUGE_DEFAULT_THICKNESS = 18

/*********************************************************
 * CHART_GAUGE_MIN_THICKNESS
 *
 * @description
 * Floor applied to the resolved thickness. A zero / negative value
 * would make `innerRadius === outerRadius` and paint nothing.
 ********************************************************/
export const CHART_GAUGE_MIN_THICKNESS = 1

/*********************************************************
 * CHART_GAUGE_RADIUS_INSET
 *
 * @description
 * Inset (in SVG user units) shaved off the outer radius so the stroked
 * arc does not touch the edge of the plot box.
 ********************************************************/
export const CHART_GAUGE_RADIUS_INSET = 4

/*********************************************************
 * CHART_GAUGE_SPAN_EPSILON
 *
 * @description
 * Guard against a zero `max - min` span (division by zero) when the
 * consumer passes `min === max`.
 ********************************************************/
export const CHART_GAUGE_SPAN_EPSILON = 1e-9

/*********************************************************
 * CHART_GAUGE_RATIO_EPSILON
 *
 * @description
 * Below this ratio the value arc is treated as empty and no `d` string
 * is emitted, so the SVG never paints a degenerate `M0,0` segment.
 ********************************************************/
export const CHART_GAUGE_RATIO_EPSILON = 1e-6
