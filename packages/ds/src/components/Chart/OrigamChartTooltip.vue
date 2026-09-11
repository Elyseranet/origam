<template>
	<div
			v-if="point && series"
			class="origam-chart__tooltip"
			role="tooltip"
			:style="tooltipStyle"
			data-cy="origam-chart-tooltip"
	>
		<slot
				v-bind="{ point, series, category }"
		>
			<div class="origam-chart__tooltip-title">
				{{ series.name }}
			</div>
			<div class="origam-chart__tooltip-row">
				<span
						class="origam-chart__tooltip-swatch"
						:style="{ backgroundColor: point.color }"
				/>
				<span class="origam-chart__tooltip-label">{{ formatX(category) }}</span>
				<span class="origam-chart__tooltip-value">{{ formatY(point.y) }}</span>
			</div>
		</slot>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		type StyleValue
	} from 'vue'

	import type { IChartTooltipProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Floating tooltip card that follows the cursor and displays
	 * the current data point. Extracted from the legacy
	 * `<OrigamChart>` so every family (cartesian / polar / radar /
	 * gauge) shares the same default body + `#default` slot API.
	 *
	 * Position is driven by the `x` / `y` props (pixels relative
	 * to the chart body). No `popper.js`, no measurement of the
	 * floating element — the legacy shell's behaviour reproduced
	 * verbatim.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartTooltip'
	})

	/*********************************************************
	 * Props — defaulted inline (literals only).
	 ********************************************************/
	const props = withDefaults(defineProps<IChartTooltipProps>(), {
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	/*********************************************************
	 * Format helpers — fall back to identity when the consumer
	 * doesn't supply a formatter.
	 ********************************************************/
	const formatX = (value: number | string): string => {
		if (props.xAxisFormat) return props.xAxisFormat(value)
		return String(value)
	}

	const formatY = (value: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(value)
		return String(value)
	}

	/*********************************************************
	 * Computed style — mirrors the legacy shell exactly so
	 * tooltip placement stays pixel-identical pre/post refactor.
	 ********************************************************/
	const tooltipStyle = computed<StyleValue>(() => ({
		left: `${ props.x + 12 }px`,
		top: `${ props.y + 12 }px`
	}))
</script>
