<template>
	<div
			class="origam-chart-bullet"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-bullet"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-bullet__header"
				data-cy="origam-chart-bullet-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-bullet__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-bullet__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-bullet__body"
				:class="bodyClasses"
				data-cy="origam-chart-bullet-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-bullet__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-bullet-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__bullet-bullets"
						data-cy="origam-chart-bullet-series"
				>
					<g
							v-for="bullet in visibleBullets"
							:key="`bullet-${ bullet.index }`"
							class="origam-chart__bullet-row"
							:data-cy="`origam-chart-bullet-row-${ bullet.index }`"
					>
						<rect
								v-for="(rangeFill, ri) in bullet.rangeFills"
								:key="`range-${ bullet.index }-${ ri }`"
								class="origam-chart__bullet-range"
								:x="rangeX(bullet, ri)"
								:y="rangeY(bullet, ri)"
								:width="rangeW(bullet, ri)"
								:height="rangeH(bullet, ri)"
								:style="{ fill: rangeFill }"
								:data-cy="`origam-chart-bullet-range-${ bullet.index }-${ ri }`"
						/>

						<rect
								class="origam-chart__bullet-bar"
								:class="{ 'origam-chart__bullet-bar--active': hoveredIndex === bullet.index }"
								:x="barX(bullet)"
								:y="barY(bullet)"
								:width="barW(bullet)"
								:height="barH(bullet)"
								:style="{ fill: bullet.barFill }"
								:data-cy="`origam-chart-bullet-bar-${ bullet.index }`"
								tabindex="0"
								role="button"
								:aria-label="bulletAriaLabel(bullet)"
								@click="onBulletActivate(bullet, $event)"
								@keydown.enter.prevent="onBulletActivate(bullet, $event)"
								@keydown.space.prevent="onBulletActivate(bullet, $event)"
								@mouseenter="onBulletEnter(bullet)"
								@mouseleave="onBulletLeave"
						/>

						<line
								class="origam-chart__bullet-target"
								:x1="targetX1(bullet)"
								:y1="targetY1(bullet)"
								:x2="targetX2(bullet)"
								:y2="targetY2(bullet)"
								:style="{ stroke: bullet.targetStroke }"
								:data-cy="`origam-chart-bullet-target-${ bullet.index }`"
						/>

						<text
								v-if="isHorizontal"
								class="origam-chart__bullet-label"
								:x="PADDING.left - LABEL_GAP"
								:y="bullet.slotY + bullet.slotH / 2"
								text-anchor="end"
								dominant-baseline="middle"
								:data-cy="`origam-chart-bullet-label-${ bullet.index }`"
						>
							{{ bullet.category }}
						</text>

						<text
								v-else
								class="origam-chart__bullet-label"
								:x="bullet.slotX + bullet.slotW / 2"
								:y="SVG_HEIGHT - PADDING.bottom + LABEL_GAP"
								text-anchor="middle"
								dominant-baseline="hanging"
								:data-cy="`origam-chart-bullet-label-${ bullet.index }`"
						>
							{{ bullet.category }}
						</text>
					</g>

					<g
							v-if="showAxis"
							class="origam-chart__bullet-axis"
							data-cy="origam-chart-bullet-axis"
					>
						<line
								v-if="isHorizontal"
								class="origam-chart__bullet-axis-line"
								:x1="PADDING.left"
								:y1="PADDING.top + plotH"
								:x2="PADDING.left + plotW"
								:y2="PADDING.top + plotH"
						/>
						<line
								v-else
								class="origam-chart__bullet-axis-line"
								:x1="PADDING.left"
								:y1="PADDING.top"
								:x2="PADDING.left"
								:y2="PADDING.top + plotH"
						/>

						<text
								v-for="tick in axisTicks"
								:key="`tick-${ tick.value }`"
								class="origam-chart__bullet-axis-tick"
								:x="tick.x"
								:y="tick.y"
								:text-anchor="isHorizontal ? 'middle' : 'end'"
								:dominant-baseline="isHorizontal ? 'hanging' : 'middle'"
								:data-cy="`origam-chart-bullet-tick-${ tick.value }`"
						>
							{{ tick.label }}
						</text>
					</g>
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
							v-bind="{ ...bindings, bullet: hoveredBullet, delta: hoveredDelta }"
					/>
				</template>
			</origam-chart-tooltip>

			<div
					v-if="showEmpty"
					class="origam-chart-bullet__empty origam-chart__empty"
					data-cy="origam-chart-bullet-empty"
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

	import {
		useChartHeaderTypography,
		useBackgroundColor,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import type {
		IChartBulletBullet,
		IChartBulletDatum,
		IChartBulletEmits,
		IChartBulletProps,
		IChartLegendItem,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Bullet chart (Stephen Few) — compact KPI display.
	 *
	 * Each series entry renders one bullet: qualitative range
	 * bands (poor / acceptable / good) as the background,
	 * an actual-value bar overlaid on top, and a thin target
	 * marker tick for the comparative measure.
	 *
	 * Supports `orientation='horizontal'` (default, label left,
	 * bar right) and `orientation='vertical'` (label bottom,
	 * bar upward).
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartBullet'
	})

	const props = withDefaults(defineProps<IChartBulletProps>(), {
		categories: () => [],
		height: 280,
		title: undefined,
		subtitle: undefined,
		barColor: 'primary',
		targetColor: 'danger',
		rangeColors: () => ['danger', 'warning', 'success'],
		orientation: 'horizontal',
		barThickness: 0.45,
		showLegend: false,
		legendPosition: 'bottom',
		showTooltip: true,
		showAxis: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartBulletEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG coordinate space — CSS scales to fit.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400

	const AXIS_TICK_COUNT = 5
	const TARGET_TICK_FRACTION = 0.7
	const LABEL_GAP = 6

	const isHorizontal = computed(() => props.orientation !== 'vertical')

	const PADDING = computed(() => isHorizontal.value
		? { top: 12, right: 24, bottom: 32, left: 120 }
		: { top: 24, right: 24, bottom: 48, left: 40 }
	)

	const plotW = computed(() => SVG_WIDTH - PADDING.value.left - PADDING.value.right)
	const plotH = computed(() => SVG_HEIGHT - PADDING.value.top - PADDING.value.bottom)

	/*********************************************************
	 * Colour resolution helpers
	 ********************************************************/
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

	const resolveRangeColor = (raw: TIntent | string | undefined, bandIndex: number): string => {
		if (raw) return resolveColor(raw)
		const palette = props.rangeColors?.length ? props.rangeColors : ['danger', 'warning', 'success']
		return resolveColor(palette[bandIndex % palette.length])
	}

	/*********************************************************
	 * Bullet geometry
	 ********************************************************/
	const bulletCount = computed(() => props.series?.length ?? 0)

	const bullets = computed<Array<IChartBulletBullet>>(() => {
		if (!bulletCount.value) return []

		const pad = PADDING.value
		const count = bulletCount.value

		const result: Array<IChartBulletBullet> = []

		for (let i = 0; i < count; i++) {
			const ser = props.series[i]
			if (!ser) continue

			const rawDatum = ser.data?.[0]
			if (!rawDatum || typeof rawDatum !== 'object' || !('value' in rawDatum)) continue

			const datum = rawDatum as unknown as IChartBulletDatum
			if (!datum.ranges?.length) continue

			const maxRange = Math.max(
				datum.ranges.reduce((m, r) => Math.max(m, r.to), 0),
				datum.target,
				datum.value
			)

			const cat = props.categories[i] ?? ser.name ?? `Bullet ${ i + 1 }`

			const barFill = resolveColor(props.barColor)
			const targetStroke = resolveColor(props.targetColor)
			const rangeFills = datum.ranges.map((r, ri) =>
				resolveRangeColor(r.color, ri)
			)

			let slotX: number
			let slotY: number
			let slotW: number
			let slotH: number

			if (isHorizontal.value) {
				slotW = plotW.value
				slotH = plotH.value / count
				slotX = pad.left
				slotY = pad.top + i * slotH
			} else {
				slotW = plotW.value / count
				slotH = plotH.value
				slotX = pad.left + i * slotW
				slotY = pad.top
			}

			result.push({
				index: i,
				category: cat,
				datum,
				visible: ser.visible !== false,
				barFill,
				targetStroke,
				rangeFills,
				slotX,
				slotY,
				slotW,
				slotH,
				maxRange
			})
		}

		return result
	})

	const visibleBullets = computed(() => bullets.value.filter((b) => b.visible))

	/*********************************************************
	 * Geometry helpers — each returns an SVG attribute value.
	 * Horizontal: bars extend left→right from slotX.
	 * Vertical: bars extend bottom→top from slotY + slotH.
	 ********************************************************/
	const scaleX = (bullet: IChartBulletBullet, v: number): number => {
		if (bullet.maxRange <= 0) return 0
		return isHorizontal.value
			? (v / bullet.maxRange) * bullet.slotW
			: (v / bullet.maxRange) * bullet.slotH
	}

	const rangeX = (bullet: IChartBulletBullet, ri: number): number => {
		if (!isHorizontal.value) return bullet.slotX + rangePad(bullet)
		const bandFrom = ri === 0 ? 0 : bullet.datum.ranges[ri - 1].to
		return bullet.slotX + scaleX(bullet, bandFrom)
	}

	const rangePad = (bullet: IChartBulletBullet): number =>
		isHorizontal.value ? bullet.slotH * 0.1 : bullet.slotW * 0.1

	const rangeY = (bullet: IChartBulletBullet, ri: number): number => {
		if (isHorizontal.value) return bullet.slotY + rangePad(bullet)
		return bullet.slotY + bullet.slotH - scaleX(bullet, bullet.datum.ranges[ri].to)
	}

	const rangeW = (bullet: IChartBulletBullet, ri: number): number => {
		if (!isHorizontal.value) return bullet.slotW - rangePad(bullet) * 2
		const bandFrom = ri === 0 ? 0 : bullet.datum.ranges[ri - 1].to
		const bandTo = bullet.datum.ranges[ri].to
		return Math.max(0, scaleX(bullet, bandTo) - scaleX(bullet, bandFrom))
	}

	const rangeH = (bullet: IChartBulletBullet, ri: number): number => {
		if (isHorizontal.value) return bullet.slotH - rangePad(bullet) * 2
		const bandFrom = ri === 0 ? 0 : bullet.datum.ranges[ri - 1].to
		const bandTo = bullet.datum.ranges[ri].to
		return Math.max(0, scaleX(bullet, bandTo) - scaleX(bullet, bandFrom))
	}

	const barX = (bullet: IChartBulletBullet): number => {
		return isHorizontal.value ? bullet.slotX : bullet.slotX + bullet.slotW * (1 - props.barThickness) / 2
	}

	const barY = (bullet: IChartBulletBullet): number => {
		if (isHorizontal.value) {
			const barThick = bullet.slotH * props.barThickness
			return bullet.slotY + (bullet.slotH - barThick) / 2
		}
		return bullet.slotY + bullet.slotH - scaleX(bullet, bullet.datum.value)
	}

	const barW = (bullet: IChartBulletBullet): number => {
		return isHorizontal.value ? scaleX(bullet, bullet.datum.value) : bullet.slotW * props.barThickness
	}

	const barH = (bullet: IChartBulletBullet): number => {
		return isHorizontal.value ? bullet.slotH * props.barThickness : scaleX(bullet, bullet.datum.value)
	}

	const targetX1 = (bullet: IChartBulletBullet): number => {
		if (isHorizontal.value) return bullet.slotX + scaleX(bullet, bullet.datum.target)
		const barThick = bullet.slotW * props.barThickness
		const center = bullet.slotX + bullet.slotW / 2
		return center - barThick * TARGET_TICK_FRACTION
	}

	const targetY1 = (bullet: IChartBulletBullet): number => {
		if (isHorizontal.value) {
			const pad = bullet.slotH * (1 - TARGET_TICK_FRACTION) / 2
			return bullet.slotY + pad
		}
		return bullet.slotY + bullet.slotH - scaleX(bullet, bullet.datum.target)
	}

	const targetX2 = (bullet: IChartBulletBullet): number => {
		if (isHorizontal.value) return bullet.slotX + scaleX(bullet, bullet.datum.target)
		const barThick = bullet.slotW * props.barThickness
		const center = bullet.slotX + bullet.slotW / 2
		return center + barThick * TARGET_TICK_FRACTION
	}

	const targetY2 = (bullet: IChartBulletBullet): number => {
		if (isHorizontal.value) {
			const pad = bullet.slotH * (1 - TARGET_TICK_FRACTION) / 2
			return bullet.slotY + bullet.slotH - pad
		}
		return bullet.slotY + bullet.slotH - scaleX(bullet, bullet.datum.target)
	}

	/*********************************************************
	 * Axis ticks
	 ********************************************************/
	const globalMax = computed(() => {
		if (!visibleBullets.value.length) return 1
		return visibleBullets.value.reduce((m, b) => Math.max(m, b.maxRange), 0) || 1
	})

	const axisTicks = computed(() => {
		const ticks: Array<{ value: number, label: string, x: number, y: number }> = []
		const max = globalMax.value
		for (let i = 0; i <= AXIS_TICK_COUNT; i++) {
			const v = (i / AXIS_TICK_COUNT) * max
			const label = props.xAxisFormat
				? props.xAxisFormat(v)
				: props.yAxisFormat
					? props.yAxisFormat(v)
					: String(Math.round(v * 10) / 10)

			const pad = PADDING.value
			const x = isHorizontal.value
				? pad.left + (v / max) * plotW.value
				: pad.left
			const y = isHorizontal.value
				? pad.top + plotH.value + 8
				: pad.top + plotH.value - (v / max) * plotH.value

			ticks.push({ value: v, label, x, y })
		}
		return ticks
	})

	/*********************************************************
	 * Legend — one item per series / bullet
	 ********************************************************/
	const hiddenNames = ref<Set<string>>(new Set())

	const legendItems = computed<Array<IChartLegendItem>>(() =>
		bullets.value.map((b) => ({
			series: {
				...props.series[b.index],
				name: b.category,
				visible: b.visible
			} as IChartSeries,
			index: b.index,
			color: b.barFill,
			visible: b.visible
		}))
	)

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredIndex = ref<number | null>(null)

	const hoveredBullet = computed<IChartBulletBullet | null>(() => {
		if (hoveredIndex.value === null) return null
		return visibleBullets.value.find((b) => b.index === hoveredIndex.value) ?? null
	})

	const hoveredDelta = computed<number>(() => {
		const b = hoveredBullet.value
		if (!b) return 0
		const target = b.datum.target
		if (!target) return 0
		return Math.round((b.datum.value / target) * 100)
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const b = hoveredBullet.value
		if (!b) return null
		const ser = props.series[b.index]
		if (!ser) return null
		return {
			seriesIndex: b.index,
			seriesName: ser.name,
			dataIndex: 0,
			x: b.category,
			y: b.datum.value,
			color: b.barFill
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		const b = hoveredBullet.value
		if (!b) return null
		return props.series[b.index] ?? null
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredBullet.value?.category ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		return visibleBullets.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-bullet--${ props.orientation }`]: true,
			[`origam-chart-bullet--legend-${ props.legendPosition }`]: props.showLegend,
			'origam-chart-bullet--no-animation': !props.animated
		},
		backgroundColorClasses.value,
		elevationClasses.value,
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
		'origam-chart-bullet__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'bullet chart')
	const svgAriaLabel = computed(() => props.title ?? 'bullet chart')
	const svgTitle = computed(() => props.title ?? 'bullet chart')
	const svgDesc = computed(() => {
		const n = visibleBullets.value.length
		return `Bullet chart with ${ n } ${ n === 1 ? 'indicator' : 'indicators' }.`
	})

	const bulletAriaLabel = (bullet: IChartBulletBullet): string => {
		const pct = bullet.datum.target ? Math.round((bullet.datum.value / bullet.datum.target) * 100) : 0
		return `${ bullet.category }: value ${ bullet.datum.value }, target ${ bullet.datum.target }, ${ pct }% achievement`
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onBulletEnter = (bullet: IChartBulletBullet) => {
		hoveredIndex.value = bullet.index
	}

	const onBulletLeave = () => {
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
		onBulletLeave()
	}

	const onBulletActivate = (bullet: IChartBulletBullet, event: MouseEvent | KeyboardEvent) => {
		hoveredIndex.value = bullet.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenNames.value.delete(series.name)
		else hiddenNames.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-bullet {
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

		.origam-chart__bullet-range {
			opacity: var(--origam-chart__bullet-range---opacity, 0.55);
			transition: opacity 150ms ease;
		}

		.origam-chart__bullet-bar {
			cursor: pointer;
			transition: opacity 150ms ease, filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.1);
			}
		}

		.origam-chart__bullet-target {
			stroke-width: var(--origam-chart__bullet-target---stroke-width, 3);
			stroke-linecap: round;
		}

		.origam-chart__bullet-label {
			fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart__axis-label---font-size, 0.75rem);
			pointer-events: none;
			user-select: none;
		}

		.origam-chart__bullet-axis-line {
			stroke: var(--origam-chart__axis-line---color, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: 1;
		}

		.origam-chart__bullet-axis-tick {
			fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart__axis-label---font-size, 0.6875rem);
			pointer-events: none;
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__bullet-bar {
			animation: origam-chart-bullet-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__bullet-bar {
			animation: none;
		}
	}

	@keyframes origam-chart-bullet-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-bullet .origam-chart__svg--animated .origam-chart__bullet-bar {
			animation: none;
		}
	}
</style>
