<template>
	<g
			v-if="showGrid"
			class="origam-chart__grid"
			data-cy="origam-chart-grid"
	>
		<line
				v-for="(tick, i) in ticks.y"
				:key="`yg-${ i }`"
				class="origam-chart__grid-line"
				:x1="plot.x0"
				:y1="tick.position"
				:x2="plot.x1"
				:y2="tick.position"
		/>
	</g>

	<g
			v-if="showAxis"
			class="origam-chart__axis"
			data-cy="origam-chart-axis"
	>
		<line
				class="origam-chart__axis-line"
				:x1="plot.x0"
				:y1="plot.y0"
				:x2="plot.x0"
				:y2="plot.y1"
		/>
		<line
				class="origam-chart__axis-line"
				:x1="plot.x0"
				:y1="plot.y1"
				:x2="plot.x1"
				:y2="plot.y1"
		/>
		<text
				v-for="(tick, i) in ticks.y"
				:key="`yl-${ i }`"
				class="origam-chart__axis-label origam-chart__axis-label--y"
				:x="plot.x0 - 8"
				:y="tick.position"
				text-anchor="end"
				dominant-baseline="middle"
		>
			{{ formatY(tick.value as number) }}
		</text>
		<text
				v-for="(tick, i) in ticks.x"
				:key="`xl-${ i }`"
				class="origam-chart__axis-label origam-chart__axis-label--x"
				:x="tick.position"
				:y="plot.y1 + 16"
				text-anchor="middle"
		>
			{{ formatX(tick.value) }}
		</text>
	</g>

	<g
			v-if="showAxis && secondaryYTicks && secondaryYTicks.length"
			class="origam-chart__axis origam-chart__axis--secondary"
			data-cy="origam-chart-axis-secondary"
	>
		<line
				class="origam-chart__axis-line origam-chart__axis-line--secondary"
				:x1="plot.x1"
				:y1="plot.y0"
				:x2="plot.x1"
				:y2="plot.y1"
		/>
		<text
				v-for="(tick, i) in secondaryYTicks"
				:key="`y2l-${ i }`"
				class="origam-chart__axis-label origam-chart__axis-label--y origam-chart__axis-label--y-secondary"
				:x="plot.x1 + 8"
				:y="tick.position"
				text-anchor="start"
				dominant-baseline="middle"
		>
			{{ formatSecondaryY(tick.value as number) }}
		</text>
	</g>
</template>

<script
		lang="ts"
		setup
>
	import type { IChartAxisProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Cartesian-only chrome (X+Y axes + horizontal grid lines +
	 * tick labels). Extracted from the legacy `<OrigamChart>` so
	 * polar / radar / gauge families don't inherit it — the user's
	 * primary complaint about pie charts showing axis lines came
	 * from `<OrigamChart>` rendering this block for every type
	 * that wasn't a radar.
	 *
	 * The component is a pure renderer:
	 *   - inputs are the pre-computed `plot` corners + `ticks` array
	 *     from `useChart()`,
	 *   - outputs are SVG `<g>` groups identical to the ones the
	 *     legacy shell painted (same classes, same `data-cy`, same
	 *     SCSS rules — visual parity is the whole point).
	 *
	 * No JS interaction, no DOM measurement, SSR-safe.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartAxis'
	})

	/*********************************************************
	 * Props — defaulted inline (literals only, per CLAUDE.md).
	 ********************************************************/
	const props = withDefaults(defineProps<IChartAxisProps>(), {
		showAxis: true,
		showGrid: true,
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		secondaryYTicks: undefined,
		secondaryYAxisFormat: undefined
	})

	/*********************************************************
	 * Format helpers — fall back to identity when the consumer
	 * doesn't supply a formatter. Identical to the helpers the
	 * legacy `<OrigamChart>` defined inline.
	 ********************************************************/
	const formatX = (value: number | string): string => {
		if (props.xAxisFormat) return props.xAxisFormat(value)
		return String(value)
	}

	const formatY = (value: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(value)
		return String(value)
	}

	const formatSecondaryY = (value: number): string => {
		if (props.secondaryYAxisFormat) return props.secondaryYAxisFormat(value)
		if (props.yAxisFormat) return props.yAxisFormat(value)
		return String(value)
	}
</script>

<style
		lang="scss"
		scoped
>
	/*
	 * Axis component is rendered as SVG `<g>` fragments by the
	 * cartesian family. SVG elements MUST have an explicit `stroke`
	 * / `fill` to be visible — there is no default. When the
	 * component is used STANDALONE (without the cartesian parent),
	 * no `:deep()` rule from above paints the lines, so `showGrid`
	 * appears to "do nothing" because the lines exist in the DOM
	 * but have no stroke. The rules below ship visible defaults
	 * scoped to the axis component itself; consumers can override
	 * via the `--origam-chart__{grid,axis}---*` CSS variables.
	 */
	.origam-chart__grid-line {
		stroke: var(--origam-chart__grid---color, var(--origam-color-border-subtle, #e5e7eb));
		stroke-width: var(--origam-chart__grid---stroke-width, 1);
	}

	.origam-chart__axis-line {
		stroke: var(--origam-chart__axis---color, var(--origam-color-border-default, #d1d5db));
		stroke-width: var(--origam-chart__axis---stroke-width, 1);
	}

	.origam-chart__axis-label {
		fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
		font-size: var(--origam-chart__axis-label---font-size, 0.75rem);
	}
</style>
