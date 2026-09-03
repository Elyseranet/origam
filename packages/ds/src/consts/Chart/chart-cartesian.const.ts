/*********************************************************
 * CHART_ZOOM_MIN_VISIBLE_CATEGORIES
 *
 * @description
 * Minimum number of categories that must remain visible after a zoom
 * operation. Prevents the viewport from collapsing to zero width.
 ********************************************************/
export const CHART_ZOOM_MIN_VISIBLE_CATEGORIES = 2

/*********************************************************
 * CHART_ZOOM_WHEEL_STEP
 *
 * @description
 * Scroll-wheel zoom speed. Each wheel tick moves the window by this
 * fraction of the current visible range. `0.15` is ~15 % per notch
 * which matches Highcharts' feel without being jerky.
 ********************************************************/
export const CHART_ZOOM_WHEEL_STEP = 0.15
