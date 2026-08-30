<template>
	<div
			v-if="point && series"
			class="origam-chart__tooltip"
			aria-hidden="true"
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

	import type { IChartTooltipEmits, IChartTooltipProps, IChartTooltipSlots } from '../../interfaces/Chart/chart-tooltip.interface'

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
	 *
	 * @description
	 * ⛔ `aria-hidden="true"`, not `role="tooltip"` (#426). The trigger
	 * element (the hovered bar/point/slice in the parent chart) already
	 * carries a complete `aria-label` announcing the same category/value
	 * pair this card renders visually. A `role="tooltip"` with no `id`
	 * wired to the trigger's `aria-describedby` is an orphaned ARIA role —
	 * assistive tech gets no benefit from it and the APG explicitly warns
	 * against unconnected `role="tooltip"`. Rather than retrofitting a
	 * unique id + `aria-describedby` link across every point element in
	 * 18+ consuming files (Bullet, Cartesian, Polar, Radar, …, each with
	 * its own trigger markup), this card is marked purely decorative:
	 * `aria-hidden="true"` hides it from the accessibility tree entirely,
	 * which is correct BECAUSE the information already reaches AT users
	 * through the trigger's own `aria-label`.
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

	defineEmits<IChartTooltipEmits>()

	defineSlots<IChartTooltipSlots>()

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
