/*********************************************************
 * IChartRoving
 *
 * @description
 * Handler returned by `useChartRoving`, to bind on the chart `<svg>` with
 * `@keydown`: Arrow / Home / End navigation between the points of the chart.
 * The composable also keeps the single tab stop in sync with the rendered
 * points (mount, update, focus).
 ********************************************************/
export interface IChartRoving {
    onKeydown: (event: KeyboardEvent) => void
}
