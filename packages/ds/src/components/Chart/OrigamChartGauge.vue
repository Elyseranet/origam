<template>
	<div
			class="origam-chart-gauge"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-gauge"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-gauge__header"
				data-cy="origam-chart-gauge-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-gauge__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-gauge__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-gauge__body"
				data-cy="origam-chart-gauge-body"
		>
			<svg
					class="origam-chart-gauge__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					:aria-valuemin="gaugeMin"
					:aria-valuemax="gaugeMax"
					:aria-valuenow="value"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-gauge-svg"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__gauge"
						data-cy="origam-chart-gauge-series"
				>
					<path
							class="origam-chart__gauge-track"
							:d="geometry.trackPath"
							data-cy="origam-chart-gauge-track"
					/>
					<path
							v-if="geometry.valuePath"
							class="origam-chart__gauge-value"
							:d="geometry.valuePath"
							:fill="valueColor"
							data-cy="origam-chart-gauge-value"
					/>

					<text
							v-if="gaugeShowEndpoints"
							class="origam-chart__gauge-endpoint origam-chart__gauge-endpoint--min"
							:x="minLabelPos.x"
							:y="minLabelPos.y"
							text-anchor="middle"
							dominant-baseline="middle"
							data-cy="origam-chart-gauge-min"
					>
						<slot
								name="gauge-min"
								v-bind="{ value: gaugeMin }"
						>
							{{ gaugeMin }}
						</slot>
					</text>
					<text
							v-if="gaugeShowEndpoints"
							class="origam-chart__gauge-endpoint origam-chart__gauge-endpoint--max"
							:x="maxLabelPos.x"
							:y="maxLabelPos.y"
							text-anchor="middle"
							dominant-baseline="middle"
							data-cy="origam-chart-gauge-max"
					>
						<slot
								name="gauge-max"
								v-bind="{ value: gaugeMax }"
						>
							{{ gaugeMax }}
						</slot>
					</text>

					<text
							v-if="gaugeShowValue"
							class="origam-chart__gauge-label"
							:x="geometry.centerX"
							:y="geometry.centerY"
							text-anchor="middle"
							dominant-baseline="middle"
							data-cy="origam-chart-gauge-label"
					>
						<slot
								name="gauge-value"
								v-bind="{ value: geometry.clampedValue, ratio: geometry.ratio, formatted: formattedValue, unit: gaugeUnit ?? '' }"
						>
							{{ formattedValue }}{{ gaugeUnit }}
						</slot>
					</text>
				</g>
			</svg>

			<div
					v-if="!hasData"
					class="origam-chart-gauge__empty origam-chart__empty"
					data-cy="origam-chart-gauge-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>
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

	import { useChartGauge } from '../../composables/Chart/chart-gauge.composable'
	import {
		useBackgroundColor,
		useChartHeaderTypography,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import type {
		IChartGaugeEmits,
		IChartGaugeProps
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Solid-gauge radial indicator. Renders a 270deg arc track
	 * with a filled value arc, an optional centre value label,
	 * and optional `min` / `max` endpoint labels. Mirrors the
	 * Highcharts "Solid Gauge" demo visually.
	 *
	 * Single-value visualisation: the gauge reads the first
	 * datum of the first series as the displayed value. Extra
	 * series are silently ignored.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartGauge'
	})

	const props = withDefaults(defineProps<IChartGaugeProps>(), {
		categories: () => [],
		height: 300,
		title: undefined,
		subtitle: undefined,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: false,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		gaugeMin: 0,
		gaugeMax: 100,
		gaugeUnit: '',
		gaugeThickness: 18,
		gaugeStartAngle: -2.3561944901923448,
		gaugeEndAngle: 2.3561944901923448,
		gaugeShowEndpoints: true,
		gaugeShowValue: true
	})

	const emit = defineEmits<IChartGaugeEmits>()
	void emit

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box
	 ********************************************************/
	const SVG_WIDTH = 360
	const SVG_HEIGHT = 280
	const PADDING_GAUGE = { top: 28, right: 28, bottom: 28, left: 28 }

	/*********************************************************
	 * Value resolution — first datum of the first series.
	 * Defaults to 0 when no series is provided.
	 ********************************************************/
	const hasData = computed(() => {
		const first = props.series?.[0]
		if (!first || !first.data?.length) return false
		return true
	})

	const value = computed<number>(() => {
		const first = props.series?.[0]
		if (!first || !first.data?.length) return 0
		const entry = first.data[0]
		return typeof entry === 'number' ? entry : entry.y
	})

	const valueColor = computed<string>(() => {
		const first = props.series?.[0]
		// Fall back to the action-primary intent token when the series
		// doesn't pin its own colour.
		if (first?.color) {
			if (/^(#|rgb|rgba|hsl|hsla|var|currentColor)/i.test(first.color)) {
				return first.color
			}
			return `var(--origam-color__action--${ first.color }---bg, var(--origam-color--${ first.color }, currentColor))`
		}
		const scheme = props.colorScheme
		if (scheme.length) {
			const c = scheme[0] as string
			if (/^(#|rgb|rgba|hsl|hsla|var|currentColor)/i.test(c)) return c
			return `var(--origam-color__action--${ c }---bg, var(--origam-color--${ c }, currentColor))`
		}
		return 'var(--origam-color__action--primary---bg, currentColor)'
	})

	/*********************************************************
	 * Geometry — `useChartGauge` returns the arc descriptors.
	 ********************************************************/
	const { geometry } = useChartGauge({
		value: () => value.value,
		min: () => props.gaugeMin,
		max: () => props.gaugeMax,
		width: () => SVG_WIDTH,
		height: () => SVG_HEIGHT,
		padding: () => PADDING_GAUGE,
		thickness: () => props.gaugeThickness,
		startAngle: () => props.gaugeStartAngle,
		endAngle: () => props.gaugeEndAngle
	})

	/*********************************************************
	 * Endpoint label positions — placed slightly outside the
	 * outer arc at the start / end angles, projected from the
	 * centre. Math angle (radian) -> SVG angle (zero at noon,
	 * clockwise) -> Cartesian pixel.
	 ********************************************************/
	const labelOffset = computed(() => geometry.value.outerRadius + 12)

	const minLabelPos = computed(() => {
		const a = geometry.value.startAngle - Math.PI / 2
		return {
			x: geometry.value.centerX + labelOffset.value * Math.cos(a),
			y: geometry.value.centerY + labelOffset.value * Math.sin(a)
		}
	})

	const maxLabelPos = computed(() => {
		const a = geometry.value.endAngle - Math.PI / 2
		return {
			x: geometry.value.centerX + labelOffset.value * Math.cos(a),
			y: geometry.value.centerY + labelOffset.value * Math.sin(a)
		}
	})

	/*********************************************************
	 * Value formatting
	 ********************************************************/
	const formattedValue = computed(() => {
		const n = geometry.value.clampedValue
		// Round to integer when within tolerance, otherwise keep
		// one decimal so 50.0 still reads "50".
		const rounded = Math.round(n * 10) / 10
		return Number.isInteger(rounded) ? String(Math.round(rounded)) : String(rounded)
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			'origam-chart-gauge--no-animation': !props.animated
		},
		backgroundColorClasses.value,
		elevationClasses.value,
		marginClasses.value,
		paddingClasses.value,
		roundedClasses.value
	])

	const rootStyles = computed<StyleValue>(() => {
		const out: Record<string, string> = {}
		if (props.aspectRatio) {
			out.aspectRatio = props.aspectRatio
		}
		out['--origam-chart---animation-duration'] = `${ props.animationDuration }ms`
		// Expose the arc fraction as a CSS variable so the entrance
		// animation can transition `stroke-dashoffset` from full to
		// the value-arc length on first paint.
		out['--origam-chart-gauge---ratio'] = String(geometry.value.ratio)
		return out
	})

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	const ariaLabel = computed(() => props.title ?? `Gauge: ${ formattedValue.value }${ props.gaugeUnit ?? '' }`)
	const svgAriaLabel = computed(() => ariaLabel.value)
	const svgTitle = computed(() => props.title ?? 'gauge chart')
	const svgDesc = computed(() =>
		`Gauge showing ${ formattedValue.value }${ props.gaugeUnit ?? '' } out of a range from ${ props.gaugeMin } to ${ props.gaugeMax }.`
	)
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-gauge {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto 1fr;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"body";

		&__header {
			grid-area: header;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		&__title {
			font-size: var(--origam-chart__title---font-size, 1.125rem);
			font-weight: var(--origam-chart__title---font-weight, 600);
			color: var(--origam-chart__title---color, inherit);
		}

		&__subtitle {
			font-size: var(--origam-chart__subtitle---font-size, 0.875rem);
			color: var(--origam-chart__subtitle---color, var(--origam-color-text-secondary, #6b7280));
		}

		&__body {
			grid-area: body;
			position: relative;
			display: flex;
			min-height: 0;
			min-width: 0;
		}

		&__svg {
			flex: 1 1 auto;
			width: 100%;
			height: 100%;
			min-width: 0;
			min-height: 0;
			overflow: visible;
			display: block;
		}

		.origam-chart__gauge-track {
			fill: var(--origam-chart__gauge-track---color, var(--origam-color-border-subtle, #e5e7eb));
			stroke: none;
		}

		.origam-chart__gauge-value {
			stroke: none;
			transition: d var(--origam-chart---animation-duration, 600ms) ease-out;
		}

		.origam-chart__gauge-endpoint {
			fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart__axis-label---font-size, 0.75rem);
		}

		.origam-chart__gauge-label {
			fill: var(--origam-chart__gauge-label---color, var(--origam-color-text-primary, currentColor));
			font-size: var(--origam-chart__gauge-label---font-size, 1.5rem);
			font-weight: var(--origam-chart__gauge-label---font-weight, 700);
		}

		.origam-chart__svg--animated .origam-chart__gauge-value {
			animation: origam-chart-gauge-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		&__empty {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--origam-chart__empty---color, var(--origam-color-text-secondary, #6b7280));
		}

		&--no-animation .origam-chart__gauge-value {
			animation: none;
			transition: none;
		}
	}

	@keyframes origam-chart-gauge-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-gauge .origam-chart__svg--animated .origam-chart__gauge-value {
			animation: none;
		}
	}
</style>
