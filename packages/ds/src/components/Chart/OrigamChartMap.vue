<template>
	<div
			class="origam-chart-map"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-map"
	>
		<header
				v-if="hasTitleBlock"
				class="origam-chart-map__header"
				data-cy="origam-chart-map-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-map__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-map__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</header>

		<div
				class="origam-chart-map__body"
				data-cy="origam-chart-map-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-map__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-map-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<defs>
					<linearGradient
							id="origam-map-legend-gradient"
							x1="0"
							y1="0"
							x2="1"
							y2="0"
					>
						<stop
								offset="0%"
								:style="{ stopColor: resolveColor(colorRange[0]) }"
						/>
						<stop
								offset="100%"
								:style="{ stopColor: resolveColor(colorRange[1]) }"
						/>
					</linearGradient>
				</defs>

				<g
						class="origam-chart__map-backdrop"
						data-cy="origam-chart-map-backdrop"
				>
					<path
							v-for="country in allCountries"
							:key="`backdrop-${ country.code }`"
							class="origam-chart__map-country"
							:class="{
								'origam-chart__map-country--has-data': country.hasData,
								'origam-chart__map-country--active': hoveredCode === country.code
							}"
							:d="country.d"
							:style="{ fill: country.fill, stroke: borderColor }"
							:data-cy="`origam-chart-map-country-${ country.code }`"
							:tabindex="country.hasData ? 0 : -1"
							:role="country.hasData ? 'button' : undefined"
							:aria-label="countryAriaLabel(country)"
							@click="onCountryActivate(country, $event)"
							@keydown.enter.prevent="onCountryActivate(country, $event)"
							@keydown.space.prevent="onCountryActivate(country, $event)"
							@mouseenter="onCountryEnter(country)"
							@mouseleave="onCountryLeave"
					/>
				</g>

				<g
						v-if="isRoutesMode"
						class="origam-chart__map-routes"
						data-cy="origam-chart-map-routes"
				>
					<path
							v-for="route in computedRoutes"
							:key="`route-${ route.index }`"
							class="origam-chart__map-route"
							:class="{ 'origam-chart__map-route--active': hoveredRouteIndex === route.index }"
							:d="route.d"
							:style="{ stroke: route.stroke, strokeWidth: route.strokeWidth }"
							fill="none"
							stroke-linecap="round"
							:data-cy="`origam-chart-map-route-${ route.index }`"
							tabindex="0"
							role="button"
							:aria-label="routeAriaLabel(route)"
							@click="onRouteActivate(route, $event)"
							@keydown.enter.prevent="onRouteActivate(route, $event)"
							@keydown.space.prevent="onRouteActivate(route, $event)"
							@mouseenter="onRouteEnter(route)"
							@mouseleave="onRouteLeave"
					/>

					<circle
							v-for="node in routeNodes"
							:key="`node-${ node.key }`"
							class="origam-chart__map-node"
							:cx="node.x"
							:cy="node.y"
							:r="nodeRadius"
							:style="{ fill: resolveColor(lineColor) }"
							:data-cy="`origam-chart-map-node-${ node.key }`"
					/>
				</g>

				<g
						v-if="showLegend && isChoroplethMode"
						class="origam-chart__map-gradient-legend"
						data-cy="origam-chart-map-gradient-legend"
				>
					<rect
							:x="gradientRect.x"
							:y="gradientRect.y"
							:width="gradientRect.w"
							:height="gradientRect.h"
							rx="2"
							ry="2"
							fill="url(#origam-map-legend-gradient)"
					/>
					<text
							class="origam-chart__map-legend-label"
							:x="gradientRect.x"
							:y="gradientRect.labelY"
							text-anchor="start"
							dominant-baseline="hanging"
					>
						{{ formatValue(valueRange.min) }}
					</text>
					<text
							class="origam-chart__map-legend-label"
							:x="gradientRect.x2"
							:y="gradientRect.labelY"
							text-anchor="end"
							dominant-baseline="hanging"
					>
						{{ formatValue(valueRange.max) }}
					</text>
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
					class="origam-chart-map__empty origam-chart__empty"
					data-cy="origam-chart-map-empty"
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
		ref,
		type StyleValue
	} from 'vue'

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
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import type {
		IChartMapCountry,
		IChartMapChoroplethDatum,
		IChartMapEmits,
		IChartMapProps,
		IChartMapRoute,
		IChartMapRouteDatum
	} from '../../interfaces/Chart/chart-map.interface'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import { CHART_MAP_MODE } from '../../enums/Chart/chart-map-mode.enum'

	import { WORLD_GEOGRAPHIC_DATA } from '../../consts/Chart/world-geographic.const'
	import { multiPolygonToSvgPath, multiPolygonCentroid } from '../../utils/Chart/mercator.util'

	import type { TIntent } from '../../types'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Map chart family. Two rendering modes:
	 *
	 * - `'choropleth'` — country shapes filled by interpolated colour
	 *   from `colorRange`, driven by `value / maxValue`. Countries
	 *   absent from the dataset use `defaultCountryFill`.
	 *
	 * - `'flight-routes'` — curved quadratic Bezier arcs drawn between
	 *   country centroid pairs over a neutral map backdrop.
	 *
	 * SVG coordinate space: 1000 × 500 (Mercator, simplified).
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartMap'
	})

	const props = withDefaults(defineProps<IChartMapProps>(), {
		mode: 'choropleth',
		title: undefined,
		subtitle: undefined,
		colorRange: () => ['info', 'danger'],
		defaultCountryFill: 'rgba(0,0,0,0.08)',
		borderColor: 'rgba(0,0,0,0.2)',
		lineColor: 'primary',
		nodeRadius: 4,
		routeCurvature: 0.3,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		categories: () => [],
		aspectRatio: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartMapEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * SVG canvas constants
	 ********************************************************/
	const SVG_WIDTH = 1000
	const SVG_HEIGHT = 500
	const LEGEND_H = 14
	const LEGEND_Y_OFFSET = 12
	const LEGEND_X = 20
	const LEGEND_W = 200

	/*********************************************************
	 * Projected paths — computed once from geographic data.
	 * Each country multi-polygon is projected via Mercator to
	 * SVG pixel space on a 1000 × 500 canvas.
	 ********************************************************/
	const WORLD_MAP_PATHS: Record<string, string> = Object.fromEntries(
		Object.entries(WORLD_GEOGRAPHIC_DATA).map(([code, multi]) => [
			code,
			multiPolygonToSvgPath(multi, SVG_WIDTH, SVG_HEIGHT)
		])
	)

	const COUNTRY_CENTROIDS: Record<string, [number, number]> = Object.fromEntries(
		Object.entries(WORLD_GEOGRAPHIC_DATA).map(([code, multi]) => [
			code,
			multiPolygonCentroid(multi, SVG_WIDTH, SVG_HEIGHT)
		])
	)

	/*********************************************************
	 * Mode helpers
	 ********************************************************/
	const isChoroplethMode = computed(() => props.mode === CHART_MAP_MODE.CHOROPLETH)
	const isRoutesMode = computed(() => props.mode === CHART_MAP_MODE.FLIGHT_ROUTES)

	/*********************************************************
	 * Colour helpers
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

	const choroplethColorFor = (value: number, minVal: number, maxVal: number): string => {
		const range = maxVal - minVal
		const pct = range === 0 ? 0 : Math.round(((value - minVal) / range) * 100)
		const start = resolveColor(props.colorRange[0])
		const end = resolveColor(props.colorRange[1])
		return `color-mix(in srgb, ${ end } ${ pct }%, ${ start })`
	}

	/*********************************************************
	 * Choropleth data
	 ********************************************************/
	const choroplethData = computed<Array<IChartMapChoroplethDatum>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []
		/*
		 * Only iterate the data when this series is in choropleth mode.
		 * Flight-route data has `{ from, to, value }` instead of
		 * `{ code, value }`; touching `.code` on those would throw on
		 * `undefined.toUpperCase()`.
		 */
		if (props.mode !== 'choropleth') return []
		return series.data as unknown as Array<IChartMapChoroplethDatum>
	})

	const choroplethMap = computed<Map<string, IChartMapChoroplethDatum>>(() => {
		const m = new Map<string, IChartMapChoroplethDatum>()
		for (const d of choroplethData.value) {
			if (!d?.code) continue
			m.set(d.code.toUpperCase(), d)
		}
		return m
	})

	const valueRange = computed<{ min: number, max: number }>(() => {
		const vals = choroplethData.value.map((d) => d.value).filter((v) => Number.isFinite(v))
		if (!vals.length) return { min: 0, max: 1 }
		return { min: Math.min(...vals), max: Math.max(...vals) }
	})

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		return String(v)
	}

	/*********************************************************
	 * Country descriptors — built for every mode.
	 * In flight-routes mode, all countries use defaultCountryFill.
	 ********************************************************/
	const allCountries = computed<Array<IChartMapCountry>>(() => {
		const { min, max } = valueRange.value
		return Object.entries(WORLD_MAP_PATHS).map(([code, d]) => {
			const datum = choroplethMap.value.get(code)
			const hasData = isChoroplethMode.value && datum !== undefined
			let fill: string
			if (hasData && datum !== undefined) {
				fill = choroplethColorFor(datum.value, min, max)
			} else {
				fill = props.defaultCountryFill
			}
			return {
				code,
				d,
				fill,
				value: datum?.value,
				name: datum?.name ?? code,
				hasData
			}
		})
	})

	/*********************************************************
	 * Route data
	 ********************************************************/
	const routeData = computed<Array<IChartMapRouteDatum>>(() => {
		if (!isRoutesMode.value) return []
		const series = props.series?.[0]
		if (!series?.data?.length) return []
		return series.data as unknown as Array<IChartMapRouteDatum>
	})

	const computedRoutes = computed<Array<IChartMapRoute>>(() => {
		return routeData.value.flatMap((datum, index) => {
			const fromC = COUNTRY_CENTROIDS[datum.from?.toUpperCase()]
			const toC = COUNTRY_CENTROIDS[datum.to?.toUpperCase()]
			if (!fromC || !toC) return []

			const [x1, y1] = fromC
			const [x2, y2] = toC

			const midX = (x1 + x2) / 2
			const midY = (y1 + y2) / 2

			const dx = x2 - x1
			const dy = y2 - y1
			const dist = Math.sqrt(dx * dx + dy * dy)

			const perpX = -dy / (dist || 1)
			const perpY = dx / (dist || 1)

			const offset = dist * props.routeCurvature
			const cx = midX + perpX * offset
			const cy = midY + perpY * offset

			const d = `M ${ x1 },${ y1 } Q ${ cx },${ cy } ${ x2 },${ y2 }`

			const strokeWidth = datum.value !== undefined
				? Math.max(1, Math.log(datum.value + 1) * 1.5)
				: 2

			const stroke = datum.color
				? resolveColor(datum.color)
				: resolveColor(props.lineColor)

			return [{
				index,
				d,
				stroke,
				strokeWidth,
				fromPoint: fromC,
				toPoint: toC,
				from: datum.from.toUpperCase(),
				to: datum.to.toUpperCase(),
				value: datum.value
			}]
		})
	})

	/*********************************************************
	 * Route endpoint nodes — deduplicated circles
	 ********************************************************/
	const routeNodes = computed<Array<{ key: string, x: number, y: number }>>(() => {
		const seen = new Set<string>()
		const nodes: Array<{ key: string, x: number, y: number }> = []
		for (const route of computedRoutes.value) {
			const addNode = (code: string, pt: [number, number]) => {
				if (!seen.has(code)) {
					seen.add(code)
					nodes.push({ key: code, x: pt[0], y: pt[1] })
				}
			}
			addNode(route.from, route.fromPoint)
			addNode(route.to, route.toPoint)
		}
		return nodes
	})

	/*********************************************************
	 * Gradient legend rect (inline, bottom-left corner of SVG)
	 ********************************************************/
	const gradientRect = computed(() => {
		const y = SVG_HEIGHT - LEGEND_H - LEGEND_Y_OFFSET - 20
		const x2 = LEGEND_X + LEGEND_W
		return {
			x: LEGEND_X,
			x2,
			y,
			w: LEGEND_W,
			h: LEGEND_H,
			labelY: y + LEGEND_H + 5
		}
	})

	/*********************************************************
	 * Hover / tooltip — choropleth
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredCode = ref<string | null>(null)
	const hoveredRouteIndex = ref<number | null>(null)

	const hoveredCountry = computed<IChartMapCountry | null>(() => {
		if (!hoveredCode.value) return null
		return allCountries.value.find((c) => c.code === hoveredCode.value) ?? null
	})

	const hoveredRoute = computed<IChartMapRoute | null>(() => {
		if (hoveredRouteIndex.value === null) return null
		return computedRoutes.value.find((r) => r.index === hoveredRouteIndex.value) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		if (isChoroplethMode.value) {
			const c = hoveredCountry.value
			if (!c?.hasData || !props.series?.[0]) return null
			return {
				seriesIndex: 0,
				seriesName: props.series[0].name,
				dataIndex: 0,
				x: c.name,
				y: c.value ?? 0,
				color: c.fill
			}
		}
		const r = hoveredRoute.value
		if (!r || !props.series?.[0]) return null
		return {
			seriesIndex: 0,
			seriesName: props.series[0].name,
			dataIndex: r.index,
			x: `${ r.from } → ${ r.to }`,
			y: r.value ?? 0,
			color: r.stroke
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		const hasHover = isChoroplethMode.value
			? hoveredCountry.value?.hasData
			: hoveredRoute.value !== null
		if (!hasHover || !props.series?.[0]) return null
		return props.series[0]
	})

	const hoveredCategory = computed<string | number>(() => {
		if (isChoroplethMode.value) {
			return hoveredCountry.value?.name ?? ''
		}
		const r = hoveredRoute.value
		if (!r) return ''
		return `${ r.from } → ${ r.to }`
	})

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		if (isChoroplethMode.value) {
			return choroplethData.value.length === 0
		}
		return computedRoutes.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-map--${ props.mode }`]: true,
			'origam-chart-map--no-animation': !props.animated
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

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'map chart')
	const svgAriaLabel = computed(() => props.title ?? 'map chart')
	const svgTitle = computed(() => props.title ?? 'map chart')
	const svgDesc = computed(() => {
		if (isChoroplethMode.value) {
			const n = choroplethData.value.length
			return `Choropleth map with ${ n } ${ n === 1 ? 'country' : 'countries' } in the dataset.`
		}
		const n = computedRoutes.value.length
		return `Flight-routes map with ${ n } ${ n === 1 ? 'route' : 'routes' }.`
	})

	const countryAriaLabel = (country: IChartMapCountry): string => {
		if (!country.hasData) return country.name
		return `${ country.name }: ${ formatValue(country.value ?? 0) }`
	}

	const routeAriaLabel = (route: IChartMapRoute): string => {
		const base = `${ route.from } to ${ route.to }`
		return route.value !== undefined ? `${ base }: ${ formatValue(route.value) }` : base
	}

	/*********************************************************
	 * Interaction — choropleth
	 ********************************************************/
	const onCountryEnter = (country: IChartMapCountry) => {
		if (country.hasData) hoveredCode.value = country.code
	}

	const onCountryLeave = () => {
		hoveredCode.value = null
	}

	const onCountryActivate = (country: IChartMapCountry, event: MouseEvent | KeyboardEvent) => {
		if (!country.hasData) return
		hoveredCode.value = country.code
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	/*********************************************************
	 * Interaction — routes
	 ********************************************************/
	const onRouteEnter = (route: IChartMapRoute) => {
		hoveredRouteIndex.value = route.index
	}

	const onRouteLeave = () => {
		hoveredRouteIndex.value = null
	}

	const onRouteActivate = (route: IChartMapRoute, event: MouseEvent | KeyboardEvent) => {
		hoveredRouteIndex.value = route.index
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	/*********************************************************
	 * SVG mouse tracking
	 ********************************************************/
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
		onCountryLeave()
		onRouteLeave()
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-map {
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

		.origam-chart__map-country {
			stroke-width: var(--origam-chart__map---stroke-width, 1);
			cursor: default;
			transition: filter 150ms ease, opacity 150ms ease;

			&--has-data {
				cursor: pointer;

				&:hover,
				&:focus-visible {
					outline: none;
					filter: brightness(1.1);
				}
			}

			&--active {
				filter: brightness(1.1);
			}
		}

		.origam-chart__map-route {
			cursor: pointer;
			transition: opacity 150ms ease, stroke-width 150ms ease;
			opacity: 0.75;

			&:hover,
			&:focus-visible {
				outline: none;
				opacity: 1;
			}

			&--active {
				opacity: 1;
			}
		}

		.origam-chart__map-node {
			pointer-events: none;
		}

		.origam-chart__map-legend-label {
			pointer-events: none;
			font-size: var(--origam-chart__map-legend-label---font-size, 0.625rem);
			fill: var(--origam-chart__map-legend-label---color, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__map-country--has-data {
			animation: origam-chart-map-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__svg--animated .origam-chart__map-route {
			animation: origam-chart-map-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__map-country,
		&--no-animation .origam-chart__map-route {
			animation: none;
		}
	}

	@keyframes origam-chart-map-fade {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-map .origam-chart__svg--animated .origam-chart__map-country,
		.origam-chart-map .origam-chart__svg--animated .origam-chart__map-route {
			animation: none;
		}
	}
</style>
