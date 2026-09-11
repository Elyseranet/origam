<template>
	<div
			class="origam-chart-word-cloud"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-word-cloud"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-word-cloud__header"
				data-cy="origam-chart-word-cloud-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-word-cloud__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-word-cloud__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-word-cloud__body"
				:class="bodyClasses"
				data-cy="origam-chart-word-cloud-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-word-cloud__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-word-cloud-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-word-cloud-series"
				>
					<text
							v-for="word in placedWords"
							:key="`word-${ word.index }`"
							class="origam-chart__word-cloud-word"
							:class="{ 'origam-chart__word-cloud-word--active': hoveredIndex === word.index }"
							:style="{
								fill: word.color,
								fontSize: word.fontSize + 'px',
								fontFamily: fontFamily,
								fontWeight: String(fontWeight)
							}"
							text-anchor="middle"
							dominant-baseline="central"
							:transform="`translate(${ word.x }, ${ word.y }) rotate(${ word.angle })`"
							:data-cy="`origam-chart-word-cloud-word-${ word.index }`"
							tabindex="0"
							role="button"
							:aria-label="`${ word.text }: ${ formatValue(word.value) }`"
							@click="onWordActivate(word, $event)"
							@keydown.enter.prevent="onWordActivate(word, $event)"
							@keydown.space.prevent="onWordActivate(word, $event)"
							@mouseenter="onWordEnter(word)"
							@mouseleave="onWordLeave"
					>{{ word.text }}</text>
				</g>
			</svg>

			<origam-chart-tooltip
					v-if="showTooltip"
					:point="hoveredPoint"
					:series="hoveredSeries"
					:category="hoveredCategory"
					:x="mousePos.x"
					:y="mousePos.y"
					:y-axis-format="yAxisFormat"
			>
				<template
						v-if="$slots.tooltip"
						#default="bindings"
				>
					<slot
							name="tooltip"
							v-bind="bindings"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-word-cloud__empty origam-chart__empty"
					data-cy="origam-chart-word-cloud-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>

		<origam-chart-legend
				v-if="showLegend"
				:items="legendItems"
				:position="legendPosition"
				@legend-click="onLegendClick"
				@series-toggle="onSeriesToggle"
		>
			<template
					v-if="$slots['legend-item']"
					#legend-item="bindings"
			>
				<slot
						name="legend-item"
						v-bind="bindings"
				/>
			</template>
		</origam-chart-legend>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		ref,
		type StyleValue
	} from 'vue'

	import OrigamChartLegend from './OrigamChartLegend.vue'
	import OrigamChartTooltip from './OrigamChartTooltip.vue'

	import type {
		IChartLegendItem,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import type {
		IChartWordCloudEmits,
		IChartWordCloudProps,
		IChartWordCloudWord
	} from '../../interfaces/Chart/chart-word-cloud.interface'

	import {
		useBackgroundColor,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Word cloud chart family. Renders a single series of N
	 * text/value pairs as SVG `<text>` elements, sized by
	 * value and arranged using an Archimedean spiral placement
	 * algorithm to minimise overlap.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartWordCloud'
	})

	const props = withDefaults(defineProps<IChartWordCloudProps>(), {
		categories: () => [],
		height: 400,
		title: undefined,
		subtitle: undefined,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		minFontSize: 12,
		maxFontSize: 64,
		rotation: 'none',
		fontFamily: 'inherit',
		fontWeight: 600,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartWordCloudEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)

	/*********************************************************
	 * Static SVG box — fixed 800 × 500 coordinate space;
	 * CSS scales it.
	 ********************************************************/
	const SVG_WIDTH = 800
	const SVG_HEIGHT = 500
	const CENTER_X = SVG_WIDTH / 2
	const CENTER_Y = SVG_HEIGHT / 2

	const SPIRAL_STEP = 0.15
	const SPIRAL_A = 4
	const MAX_SPIRAL_ITERATIONS = 1000
	const WORD_WIDTH_FACTOR = 0.6

	/*********************************************************
	 * Default colour palette — mirrors useChart DEFAULT_PALETTE
	 ********************************************************/
	const DEFAULT_PALETTE: Array<TIntent> = [
		'primary',
		'success',
		'warning',
		'danger',
		'info',
		'secondary',
		'ghost',
		'neutral'
	]

	const resolveColor = (raw: TIntent | string | undefined): string => {
		if (!raw) return 'currentColor'
		if (/^(#|rgb|hsl|var|currentColor|transparent|linear-gradient|radial-gradient|conic-gradient)/i.test(raw)) {
			return raw
		}
		if (isIntent(raw)) {
			return intentBgExpr(raw as TIntent, 'default')
		}
		return 'currentColor'
	}

	const colorFor = (dataIndex: number): string => {
		const series = props.series?.[0]
		const datum = series?.data?.[dataIndex]
		if (datum && typeof datum === 'object' && 'text' in datum && 'color' in datum && (datum as any).color) {
			return resolveColor((datum as any).color)
		}
		if (series?.color) return resolveColor(series.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[dataIndex % scheme.length])
	}

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		if (props.xAxisFormat) return String(props.xAxisFormat(v))
		return String(v)
	}

	/*********************************************************
	 * Rotation angle computation
	 ********************************************************/
	const angleFor = (index: number): number => {
		if (props.rotation === 'random') {
			const seed = (index * 9301 + 49297) % 233280
			return Math.round(((seed / 233280) * 60) - 30)
		}
		if (props.rotation === 'orthogonal') {
			return index % 2 === 0 ? 0 : 90
		}
		return 0
	}

	/*********************************************************
	 * AABB overlap test
	 ********************************************************/
	const overlaps = (
		ax: number, ay: number, aw: number, ah: number,
		bx: number, by: number, bw: number, bh: number
	): boolean => {
		return Math.abs(ax - bx) < (aw + bw) / 2 + 2
			&& Math.abs(ay - by) < (ah + bh) / 2 + 2
	}

	/*********************************************************
	 * Word cloud placement — Archimedean spiral
	 ********************************************************/
	const placedWords = computed<Array<IChartWordCloudWord>>(() => {
		const series = props.series?.[0]
		if (!series || !series.data?.length) return []

		type RawDatum = { text: string; value: number; color?: string }
		const raw = series.data as unknown as Array<RawDatum>

		const valid = raw.filter((d) => d && typeof d === 'object' && 'text' in d && typeof d.value === 'number')
		if (!valid.length) return []

		const sorted = [...valid].sort((a, b) => b.value - a.value)
		const maxVal = Math.max(...sorted.map((d) => d.value), 1e-9)

		const result: Array<IChartWordCloudWord> = []
		const placed: Array<IChartWordCloudWord> = []

		sorted.forEach((datum, idx) => {
			const fontSize = props.minFontSize + (datum.value / maxVal) * (props.maxFontSize - props.minFontSize)
			const angle = angleFor(idx)
			const isVertical = angle !== 0 && Math.abs(angle) === 90

			const estimatedW = datum.text.length * fontSize * WORD_WIDTH_FACTOR
			const estimatedH = fontSize * 1.2
			const wordW = isVertical ? estimatedH : estimatedW
			const wordH = isVertical ? estimatedW : estimatedH

			const color = colorFor(idx)

			let cx = CENTER_X
			let cy = CENTER_Y
			let placed_ = false

			if (placed.length === 0) {
				placed_ = true
			} else {
				let theta = 0
				for (let iter = 0; iter < MAX_SPIRAL_ITERATIONS; iter++) {
					const r = SPIRAL_A * theta
					cx = CENTER_X + r * Math.cos(theta)
					cy = CENTER_Y + r * Math.sin(theta)

					if (cx < wordW / 2 || cx > SVG_WIDTH - wordW / 2
						|| cy < wordH / 2 || cy > SVG_HEIGHT - wordH / 2) {
						theta += SPIRAL_STEP
						continue
					}

					let collision = false
					for (const p of placed) {
						if (overlaps(cx, cy, wordW, wordH, p.x, p.y, p.width, p.height)) {
							collision = true
							break
						}
					}

					if (!collision) {
						placed_ = true
						break
					}

					theta += SPIRAL_STEP
				}

				if (!placed_) {
					console.warn(`[OrigamChartWordCloud] Could not place word "${datum.text}" within ${MAX_SPIRAL_ITERATIONS} iterations — skipped.`)
					return
				}
			}

			const word: IChartWordCloudWord = {
				text: datum.text,
				value: datum.value,
				color,
				fontSize,
				x: cx,
				y: cy,
				angle,
				index: idx,
				width: wordW,
				height: wordH
			}

			result.push(word)
			placed.push(word)
		})

		return result
	})

	/*********************************************************
	 * Legend — one entry per word
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return placedWords.value.map((word) => ({
			series: {
				...series,
				name: word.text,
				data: [word.value],
				visible: true
			} as IChartSeries,
			index: word.index,
			color: word.color,
			visible: true
		}))
	})

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredWord = computed<IChartWordCloudWord | null>(() => {
		if (hoveredIndex.value === null) return null
		return placedWords.value.find((w) => w.index === hoveredIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const w = hoveredWord.value
		if (!w || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: w.index,
			x: w.text,
			y: w.value,
			color: w.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if (!hoveredWord.value || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredWord.value?.text ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return placedWords.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-word-cloud--legend-${ props.legendPosition }`]: true,
			'origam-chart-word-cloud--no-animation': !props.animated
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
		return out
	})

	const bodyClasses = computed(() => ({
		'origam-chart-word-cloud__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'word cloud chart')
	const svgAriaLabel = computed(() => props.title ?? 'word cloud chart')
	const svgTitle = computed(() => props.title ?? 'word cloud chart')
	const svgDesc = computed(() => {
		const n = placedWords.value.length
		return `Word cloud chart with ${ n } ${ n === 1 ? 'word' : 'words' }.`
	})

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onWordEnter = (word: IChartWordCloudWord) => {
		hoveredIndex.value = word.index
	}

	const onWordLeave = () => {
		hoveredIndex.value = null
	}

	const onSvgMouseMove = (event: MouseEvent) => {
		const target = svgRef.value
		if (!target) return
		const rect = target.getBoundingClientRect()
		mousePos.value = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		}
	}

	const onSvgMouseLeave = () => {
		onWordLeave()
	}

	const onWordActivate = (word: IChartWordCloudWord, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = word.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-word-cloud {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"body"
			"legend";

		&--legend-top {
			grid-template-areas:
				"header"
				"legend"
				"body";
			grid-template-rows: auto auto 1fr;
		}

		&--legend-bottom {
			grid-template-areas:
				"header"
				"body"
				"legend";
			grid-template-rows: auto 1fr auto;
		}

		&--legend-left {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"legend body";
		}

		&--legend-right {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-rows: auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"body legend";
		}

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

			&--with-side-legend {
				min-width: var(--origam-chart__body---min-width, 200px);
			}
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

		.origam-chart__word-cloud-word {
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;
			user-select: none;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
				opacity: 0.85;
			}
		}

		.origam-chart__svg--animated .origam-chart__word-cloud-word {
			animation: origam-chart-word-cloud-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		:deep(.origam-chart__tooltip) {
			position: absolute;
			pointer-events: none;
			background-color: var(--origam-chart__tooltip---background-color, var(--origam-color-surface-overlay, #1f2937));
			color: var(--origam-chart__tooltip---color, #ffffff);
			padding: var(--origam-chart__tooltip---padding, 8px 12px);
			border-radius: var(--origam-chart__tooltip---border-radius, 6px);
			font-size: 0.8125rem;
			box-shadow: var(--origam-chart__tooltip---shadow, 0 4px 16px rgba(0, 0, 0, 0.15));
			z-index: 10;
		}

		:deep(.origam-chart__tooltip-title) {
			font-weight: 600;
			margin-bottom: 4px;
		}

		:deep(.origam-chart__tooltip-row) {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		:deep(.origam-chart__tooltip-swatch) {
			display: inline-block;
			width: 10px;
			height: 10px;
			border-radius: 2px;
		}

		:deep(.origam-chart__tooltip-value) {
			font-weight: 600;
			margin-left: auto;
		}

		&__empty {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--origam-chart__empty---color, var(--origam-color-text-secondary, #6b7280));
		}

		:deep(.origam-chart__legend) {
			grid-area: legend;
			list-style: none;
			margin: 0;
			padding: 0;
			display: flex;
			flex-wrap: wrap;
			gap: var(--origam-chart__legend---gap, 12px);
			align-content: center;
		}

		:deep(.origam-chart__legend--top),
		:deep(.origam-chart__legend--bottom) {
			flex-direction: row;
			justify-content: center;
		}

		:deep(.origam-chart__legend--left),
		:deep(.origam-chart__legend--right) {
			flex-direction: column;
			justify-content: center;
			flex-wrap: nowrap;
			align-self: stretch;
		}

		:deep(.origam-chart__legend--left) {
			padding-right: var(--origam-chart__legend---side-gap, 8px);
		}

		:deep(.origam-chart__legend--right) {
			padding-left: var(--origam-chart__legend---side-gap, 8px);
		}

		:deep(.origam-chart__legend-item) {
			display: flex;
			align-items: center;
			gap: 6px;
			cursor: pointer;
			font-size: 0.8125rem;
			user-select: none;
		}

		:deep(.origam-chart__legend-item--hidden) {
			opacity: 0.4;
			text-decoration: line-through;
		}

		:deep(.origam-chart__legend-swatch) {
			display: inline-block;
			width: 12px;
			height: 12px;
			border-radius: var(--origam-chart__legend-swatch---border-radius, 3px);
		}

		&--no-animation .origam-chart__word-cloud-word {
			animation: none;
		}
	}

	@keyframes origam-chart-word-cloud-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-word-cloud .origam-chart__svg--animated .origam-chart__word-cloud-word {
			animation: none;
		}
	}
</style>
