<template>
	<div
			class="origam-chart-pictorial"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-pictorial"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-pictorial__header"
				data-cy="origam-chart-pictorial-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-pictorial__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-pictorial__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-pictorial__body"
				:class="bodyClasses"
				data-cy="origam-chart-pictorial-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-pictorial__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-pictorial-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<defs>
					<symbol
							id="origam-chart-pictorial-icon"
							viewBox="0 0 24 24"
							:preserveAspectRatio="mode === 'fill' ? 'xMidYMax meet' : 'xMidYMid meet'"
					>
						<path :d="icon" />
					</symbol>

					<clipPath
							v-for="col in fillModeColumns"
							:id="`origam-chart-pictorial-clip-${ col.seriesIndex }-${ col.dataIndex }`"
							:key="`clip-${ col.seriesIndex }-${ col.dataIndex }`"
					>
						<rect
								:x="fillColX(col)"
								:y="fillColY(col) + fillClipY(col)"
								:width="fillIconWidth"
								:height="fillClipHeight(col)"
						/>
					</clipPath>
				</defs>

				<g
						v-if="mode === 'stack'"
						class="origam-chart__series"
						data-cy="origam-chart-pictorial-series"
				>
					<g
							v-for="col in visibleColumns"
							:key="`col-${ col.seriesIndex }-${ col.dataIndex }`"
							:transform="`translate(${ col.x }, ${ col.y })`"
							class="origam-chart-pictorial__column"
							:data-cy="`origam-chart-pictorial-col-${ col.dataIndex }`"
							tabindex="0"
							role="button"
							:aria-label="columnAriaLabel(col)"
							@click="onColumnActivate(col, $event)"
							@keydown.enter.prevent="onColumnActivate(col, $event)"
							@keydown.space.prevent="onColumnActivate(col, $event)"
							@mouseenter="onColumnEnter(col)"
							@mouseleave="onColumnLeave"
					>
						<use
								v-for="slotIdx in col.totalSlots"
								:key="`bg-${ slotIdx }`"
								href="#origam-chart-pictorial-icon"
								:x="iconX(col, slotIdx - 1)"
								:y="iconY(col, slotIdx - 1)"
								:width="col.iconSize"
								:height="col.iconSize"
								:style="{ fill: emptyIconColor }"
								class="origam-chart-pictorial__icon origam-chart-pictorial__icon--empty"
						/>
						<use
								v-for="slotIdx in col.filledSlots"
								:key="`fill-${ slotIdx }`"
								href="#origam-chart-pictorial-icon"
								:x="iconX(col, slotIdx - 1)"
								:y="iconY(col, slotIdx - 1)"
								:width="col.iconSize"
								:height="col.iconSize"
								:style="{ fill: col.color }"
								class="origam-chart-pictorial__icon origam-chart-pictorial__icon--filled"
						/>

						<text
								v-if="showLabel"
								:x="labelX(col)"
								:y="labelY(col)"
								class="origam-chart-pictorial__value-label"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-pictorial-label-${ col.dataIndex }`"
						>
							{{ col.formatted }}
						</text>
					</g>
				</g>

				<g
						v-else
						class="origam-chart__series origam-chart__series--fill"
						data-cy="origam-chart-pictorial-series"
				>
					<g
							v-for="col in fillModeColumns"
							:key="`fill-col-${ col.seriesIndex }-${ col.dataIndex }`"
							:transform="`translate(${ fillColX(col) }, ${ fillColY(col) })`"
							class="origam-chart-pictorial__column"
							:data-cy="`origam-chart-pictorial-col-${ col.dataIndex }`"
							tabindex="0"
							role="button"
							:aria-label="fillColumnAriaLabel(col)"
							@click="onColumnActivate(col, $event)"
							@keydown.enter.prevent="onColumnActivate(col, $event)"
							@keydown.space.prevent="onColumnActivate(col, $event)"
							@mouseenter="onColumnEnter(col)"
							@mouseleave="onColumnLeave"
					>
						<use
								href="#origam-chart-pictorial-icon"
								:x="0"
								:y="0"
								:width="fillIconWidth"
								:height="fillIconHeight"
								:style="{ fill: emptyIconColor }"
								class="origam-chart-pictorial__icon origam-chart-pictorial__icon--empty"
						/>
						<use
								href="#origam-chart-pictorial-icon"
								:x="0"
								:y="0"
								:width="fillIconWidth"
								:height="fillIconHeight"
								:style="{ fill: col.color }"
								:clip-path="`url(#origam-chart-pictorial-clip-${ col.seriesIndex }-${ col.dataIndex })`"
								class="origam-chart-pictorial__icon origam-chart-pictorial__icon--filled"
						/>

						<text
								v-if="showLabel"
								:x="fillIconWidth / 2"
								:y="fillLabelY(col)"
								class="origam-chart-pictorial__value-label"
								text-anchor="middle"
								dominant-baseline="middle"
								:data-cy="`origam-chart-pictorial-label-${ col.dataIndex }`"
						>
							{{ fillValueLabel(col) }}
						</text>
					</g>

					<g
							v-if="showAxis"
							class="origam-chart-pictorial__axis"
							data-cy="origam-chart-pictorial-axis-fill"
					>
						<text
								v-for="col in fillModeColumns"
								:key="`axis-fill-${ col.seriesIndex }-${ col.dataIndex }`"
								:x="fillColX(col) + fillIconWidth / 2"
								:y="PLOT_Y + fillPlotHeight + AXIS_PADDING"
								class="origam-chart-pictorial__axis-label"
								text-anchor="middle"
								dominant-baseline="hanging"
						>
							{{ axisLabel(col) }}
						</text>
					</g>
				</g>

				<g
						v-if="mode === 'stack' && showAxis && direction === 'vertical'"
						class="origam-chart-pictorial__axis"
						data-cy="origam-chart-pictorial-axis"
				>
					<text
							v-for="col in visibleColumns"
							:key="`axis-${ col.seriesIndex }-${ col.dataIndex }`"
							:x="col.x + columnWidth / 2"
							:y="PLOT_Y + plotHeight + AXIS_PADDING"
							class="origam-chart-pictorial__axis-label"
							text-anchor="middle"
							dominant-baseline="hanging"
					>
						{{ axisLabel(col) }}
					</text>
				</g>

				<g
						v-if="mode === 'stack' && showAxis && direction === 'horizontal'"
						class="origam-chart-pictorial__axis"
						data-cy="origam-chart-pictorial-axis"
				>
					<text
							v-for="col in visibleColumns"
							:key="`axis-h-${ col.seriesIndex }-${ col.dataIndex }`"
							:x="AXIS_PADDING"
							:y="col.y + columnWidth / 2"
							class="origam-chart-pictorial__axis-label"
							text-anchor="end"
							dominant-baseline="middle"
					>
						{{ axisLabel(col) }}
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
					class="origam-chart-pictorial__empty origam-chart__empty"
					data-cy="origam-chart-pictorial-empty"
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
		IChartLegendItem,
		IChartPoint,
		IChartSeries
	} from '../../interfaces'

	import type {
		IChartPictorialColumn,
		IChartPictorialEmits,
		IChartPictorialProps
	} from '../../interfaces/Chart/chart-pictorial.interface'

	import { intentBgExpr, isIntent } from '../../utils/Commons/color.util'

	import type { TIntent } from '../../types'
	import { CHART_PICTORIAL_MODE } from '../../enums'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Pictorial / isotype chart family. Renders each data value
	 * as a column of repeated SVG icons — one icon per N units.
	 * Filled icons represent the value; background (empty) icons
	 * show the maximum capacity, making partial fills immediately
	 * legible ("3 of 4 customers recommend us").
	 *
	 * Supports vertical (traditional column) and horizontal stacking.
	 * Multiple series are rendered side-by-side per category.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartPictorial'
	})

	const props = withDefaults(defineProps<IChartPictorialProps>(), {
		icon: 'M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Zm-7 20a7 7 0 0 1 14 0v1H5v-1Z',
		iconColor: undefined,
		emptyIconColor: 'rgba(0,0,0,0.1)',
		iconsPerUnit: 1,
		mode: 'stack',
		direction: 'vertical',
		height: 400,
		title: undefined,
		subtitle: undefined,
		showLabel: true,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		showAxis: true,
		animated: true,
		animationDuration: 600,
		colorScheme: () => [],
		aspectRatio: undefined,
		categories: () => [],
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartPictorialEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG coordinate space
	 * Component always paints into 600 × 400; CSS scales it.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const ICON_GAP = 2
	const AXIS_LABEL_HEIGHT = 20
	const VALUE_LABEL_HEIGHT = 16
	const AXIS_PADDING = 4
	const SERIES_GAP = 4
	const MAX_SLOTS = 8
	const MIN_ICON_SIZE = 24

	/*********************************************************
	 * Default colour palette — mirrors useChart's DEFAULT_PALETTE
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

	const colorForSeries = (seriesIndex: number): string => {
		if (props.iconColor) return resolveColor(props.iconColor)
		const s = props.series?.[seriesIndex]
		if (s?.color) return resolveColor(s.color)
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[seriesIndex % scheme.length])
	}

	/*********************************************************
	 * Legend hidden-series set
	 ********************************************************/
	const hiddenSeries = ref<Set<string>>(new Set())

	const categoryLabel = (dataIndex: number): string => {
		const cat = props.categories?.[dataIndex]
		if (cat != null) return String(cat)
		return `Category ${ dataIndex + 1 }`
	}

	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		if (props.xAxisFormat) return String(props.xAxisFormat(v))
		return String(v)
	}

	/*********************************************************
	 * Geometry helpers
	 ********************************************************/
	const maxValue = computed<number>(() => {
		if (!props.series?.length) return 0
		let max = 0
		for (const s of props.series) {
			for (const d of s.data) {
				const v = typeof d === 'number' ? d : (d as { y: number }).y
				if (Number.isFinite(v) && v > max) max = v
			}
		}
		return max
	})

	const rawSlotsPerColumn = computed<number>(() => {
		const m = maxValue.value
		if (m <= 0) return 1
		return Math.ceil(m / Math.max(1, props.iconsPerUnit))
	})

	const slotsPerColumn = computed<number>(() =>
		Math.min(rawSlotsPerColumn.value, MAX_SLOTS)
	)

	const effectiveIconsPerUnit = computed<number>(() => {
		const raw = rawSlotsPerColumn.value
		if (raw <= MAX_SLOTS) return Math.max(1, props.iconsPerUnit)
		return maxValue.value / MAX_SLOTS
	})

	const categoryCount = computed<number>(() => {
		if (!props.series?.length) return 0
		return Math.max(...props.series.map((s) => s.data?.length ?? 0))
	})

	const seriesCount = computed<number>(() => props.series?.length ?? 0)

	/*********************************************************
	 * Plot dimensions — derived from SVG_WIDTH / SVG_HEIGHT
	 * minus axis / label reserves.
	 ********************************************************/
	const axisH = computed<number>(() => (props.showAxis ? AXIS_LABEL_HEIGHT + AXIS_PADDING : 0))
	const valueLabelH = computed<number>(() => (props.showLabel ? VALUE_LABEL_HEIGHT : 0))

	const plotHeight = computed<number>(() => {
		if (props.direction === 'horizontal') {
			return SVG_HEIGHT - axisH.value
		}
		return SVG_HEIGHT - axisH.value - valueLabelH.value
	})

	const plotWidth = computed<number>(() => {
		if (props.direction === 'horizontal') {
			return SVG_WIDTH - axisH.value - valueLabelH.value
		}
		return SVG_WIDTH
	})

	const PLOT_Y = computed<number>(() => (props.showLabel ? VALUE_LABEL_HEIGHT : 0))
	const PLOT_X = computed<number>(() => (props.direction === 'horizontal' && props.showAxis ? AXIS_LABEL_HEIGHT + AXIS_PADDING : 0))

	const columnWidth = computed<number>(() => {
		const totalCols = categoryCount.value * seriesCount.value
		if (totalCols <= 0) return 0
		const totalGaps = (totalCols - 1) * SERIES_GAP
		if (props.direction === 'vertical') {
			return Math.max(4, (plotWidth.value - totalGaps) / totalCols)
		}
		const totalGapsH = (categoryCount.value - 1) * SERIES_GAP
		return Math.max(4, (plotHeight.value - totalGapsH) / Math.max(1, categoryCount.value))
	})

	const iconSize = computed<number>(() => {
		const s = slotsPerColumn.value
		if (s <= 0) return 0
		if (props.direction === 'vertical') {
			const slotH = plotHeight.value / s - ICON_GAP
			const colBound = columnWidth.value - ICON_GAP
			return Math.max(MIN_ICON_SIZE, Math.min(slotH, colBound))
		}
		const slotW = plotWidth.value / s - ICON_GAP
		const colBound = columnWidth.value - ICON_GAP
		return Math.max(MIN_ICON_SIZE, Math.min(slotW, colBound))
	})

	/*********************************************************
	 * Column descriptors
	 ********************************************************/
	const columns = computed<Array<IChartPictorialColumn>>(() => {
		if (!props.series?.length || categoryCount.value === 0) return []

		const result: Array<IChartPictorialColumn> = []
		const colW = columnWidth.value
		const iSize = iconSize.value

		for (let catIdx = 0; catIdx < categoryCount.value; catIdx++) {
			for (let serIdx = 0; serIdx < seriesCount.value; serIdx++) {
				const s = props.series[serIdx]
				if (!s) continue

				const raw = s.data[catIdx]
				const value = raw == null
					? 0
					: typeof raw === 'number' ? raw : (raw as { y: number }).y
				const safeValue = Number.isFinite(value) && value >= 0 ? value : 0
				const filledSlots = Math.round(safeValue / effectiveIconsPerUnit.value)
				const colIdx = catIdx * seriesCount.value + serIdx
				const isHidden = hiddenSeries.value.has(s.name)

				let x: number
				let y: number

				if (props.direction === 'vertical') {
					x = PLOT_X.value + colIdx * (colW + SERIES_GAP)
					y = PLOT_Y.value
				} else {
					x = PLOT_X.value
					y = PLOT_Y.value + catIdx * (colW + SERIES_GAP)
				}

				result.push({
					seriesIndex: serIdx,
					dataIndex: catIdx,
					category: categoryLabel(catIdx),
					value: safeValue,
					formatted: formatValue(safeValue),
					totalSlots: slotsPerColumn.value,
					filledSlots: Math.min(filledSlots, slotsPerColumn.value),
					color: colorForSeries(serIdx),
					x,
					y,
					iconSize: iSize,
					visible: !isHidden
				})
			}
		}

		return result
	})

	const visibleColumns = computed(() => columns.value.filter((c) => c.visible))

	/*********************************************************
	 * Fill mode geometry
	 * One large icon per category, clip-masked from bottom up
	 * to show the fill ratio (like a thermometer / glass fill).
	 ********************************************************/
	const FILL_LABEL_HEIGHT = 20
	const FILL_GAP = 12
	const FILL_AXIS_HEIGHT = computed<number>(() => (props.showAxis ? AXIS_LABEL_HEIGHT + AXIS_PADDING : 0))
	const FILL_LABEL_RESERVE = computed<number>(() => (props.showLabel ? FILL_LABEL_HEIGHT : 0))

	const fillPlotHeight = computed<number>(() =>
		SVG_HEIGHT - FILL_AXIS_HEIGHT.value - FILL_LABEL_RESERVE.value
	)

	const fillCategoryCount = computed<number>(() => {
		if (!props.series?.length) return 0
		return Math.max(...props.series.map((s) => s.data?.length ?? 0))
	})

	const fillTotalCols = computed<number>(() =>
		fillCategoryCount.value * (props.series?.length ?? 0)
	)

	/**
	 * fillIconWidth — horizontal space per column (derived from SVG_WIDTH).
	 * fillIconHeight — vertical space each icon occupies (= full plot height).
	 * Keeping them separate allows portrait icons to fill the column vertically
	 * while the column width remains constrained by the number of categories.
	 */
	const fillIconWidth = computed<number>(() => {
		const totalCols = fillTotalCols.value
		if (totalCols <= 0) return 0
		const totalGaps = (totalCols - 1) * FILL_GAP
		return Math.max(24, (SVG_WIDTH - totalGaps) / totalCols)
	})

	const fillIconHeight = computed<number>(() =>
		Math.max(24, fillPlotHeight.value)
	)

	const fillModeColumns = computed<Array<IChartPictorialColumn>>(() => {
		if (props.mode !== CHART_PICTORIAL_MODE.FILL) return []
		if (!props.series?.length || fillCategoryCount.value === 0) return []

		const result: Array<IChartPictorialColumn> = []
		const iWidth = fillIconWidth.value
		const seriesLen = props.series.length

		for (let catIdx = 0; catIdx < fillCategoryCount.value; catIdx++) {
			for (let serIdx = 0; serIdx < seriesLen; serIdx++) {
				const s = props.series[serIdx]
				if (!s) continue
				const isHidden = hiddenSeries.value.has(s.name)
				const raw = s.data[catIdx]
				const value = raw == null
					? 0
					: typeof raw === 'number' ? raw : (raw as { y: number }).y
				const safeValue = Number.isFinite(value) && value >= 0 ? value : 0
				const colIdx = catIdx * seriesLen + serIdx

				result.push({
					seriesIndex: serIdx,
					dataIndex: catIdx,
					category: categoryLabel(catIdx),
					value: safeValue,
					formatted: formatValue(safeValue),
					totalSlots: 1,
					filledSlots: 1,
					color: colorForSeries(serIdx),
					x: colIdx * (iWidth + FILL_GAP),
					y: PLOT_Y.value,
					iconSize: iWidth,
					visible: !isHidden
				})
			}
		}

		return result.filter((c) => c.visible)
	})

	const fillColX = (col: IChartPictorialColumn): number =>
		col.x

	const fillColY = (col: IChartPictorialColumn): number =>
		col.y

	const fillRatio = (col: IChartPictorialColumn): number => {
		const max = maxValue.value
		if (max <= 0) return 0
		return Math.min(1, Math.max(0, col.value / max))
	}

	const fillClipY = (col: IChartPictorialColumn): number => {
		const ratio = fillRatio(col)
		return fillIconHeight.value * (1 - ratio)
	}

	const fillClipHeight = (col: IChartPictorialColumn): number => {
		const ratio = fillRatio(col)
		return fillIconHeight.value * ratio
	}

	const fillLabelY = (_col: IChartPictorialColumn): number =>
		-FILL_LABEL_HEIGHT / 2

	const fillValueLabel = (col: IChartPictorialColumn): string => {
		const pct = Math.round(fillRatio(col) * 100)
		return `${ col.formatted } (${ pct }%)`
	}

	const fillColumnAriaLabel = (col: IChartPictorialColumn): string => {
		const pct = Math.round(fillRatio(col) * 100)
		return `${ col.category }: ${ col.formatted } — ${ pct }% of maximum`
	}

	/*********************************************************
	 * Icon position helpers
	 * Vertical: icons stacked bottom-to-top (slot 0 = bottom)
	 * Horizontal: icons stacked left-to-right (slot 0 = left)
	 ********************************************************/
	const iconX = (col: IChartPictorialColumn, slotIdx: number): number => {
		if (props.direction === 'horizontal') {
			return slotIdx * (col.iconSize + ICON_GAP)
		}
		const colW = columnWidth.value
		return (colW - col.iconSize) / 2
	}

	const iconY = (col: IChartPictorialColumn, slotIdx: number): number => {
		if (props.direction === 'horizontal') {
			const colW = columnWidth.value
			return (colW - col.iconSize) / 2
		}
		const totalH = slotsPerColumn.value * (col.iconSize + ICON_GAP) - ICON_GAP
		const fromBottom = slotsPerColumn.value - 1 - slotIdx
		return totalH - fromBottom * (col.iconSize + ICON_GAP) - col.iconSize
	}

	/*********************************************************
	 * Label position helpers
	 ********************************************************/
	const labelX = (col: IChartPictorialColumn): number => {
		if (props.direction === 'horizontal') {
			const usedW = slotsPerColumn.value * (col.iconSize + ICON_GAP)
			return usedW + VALUE_LABEL_HEIGHT / 2
		}
		return columnWidth.value / 2
	}

	const labelY = (_col: IChartPictorialColumn): number => {
		if (props.direction === 'horizontal') {
			return columnWidth.value / 2
		}
		return -VALUE_LABEL_HEIGHT / 2
	}

	const axisLabel = (col: IChartPictorialColumn): string => {
		if (props.xAxisFormat) return String(props.xAxisFormat(col.category))
		return col.category
	}

	/*********************************************************
	 * Legend items — one per series
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		if (!props.series?.length) return []
		return props.series.map((s, i) => ({
			series: {
				...s,
				visible: !hiddenSeries.value.has(s.name)
			} as IChartSeries,
			index: i,
			color: colorForSeries(i),
			visible: !hiddenSeries.value.has(s.name)
		}))
	})

	/*********************************************************
	 * Hover / tooltip state
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredColKey = ref<string | null>(null)

	const activeColumns = computed<Array<IChartPictorialColumn>>(() =>
		props.mode === CHART_PICTORIAL_MODE.FILL ? fillModeColumns.value : visibleColumns.value
	)

	const hoveredColumn = computed<IChartPictorialColumn | null>(() => {
		if (!hoveredColKey.value) return null
		return activeColumns.value.find(
			(c) => `${ c.seriesIndex }-${ c.dataIndex }` === hoveredColKey.value
		) ?? null
	})

	const hoveredPoint = computed<IChartPoint | null>(() => {
		const col = hoveredColumn.value
		if (!col || !props.series?.[col.seriesIndex]) return null
		return {
			seriesIndex: col.seriesIndex,
			seriesName: props.series[col.seriesIndex].name,
			dataIndex: col.dataIndex,
			x: col.category,
			y: col.value,
			color: col.color
		}
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		const col = hoveredColumn.value
		if (!col) return null
		return props.series?.[col.seriesIndex] ?? null
	})

	const hoveredCategory = computed<string | number>(() =>
		hoveredColumn.value?.category ?? ''
	)

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const hasData = props.series.some((s) => s.data?.length > 0)
		if (!hasData) return true
		return activeColumns.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-pictorial--${ props.direction }`]: true,
			[`origam-chart-pictorial--${ props.mode }`]: true,
			[`origam-chart-pictorial--legend-${ props.legendPosition }`]: true,
			'origam-chart-pictorial--no-animation': !props.animated
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
		'origam-chart-pictorial__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'pictorial chart')
	const svgAriaLabel = computed(() => props.title ?? 'pictorial chart')
	const svgTitle = computed(() => props.title ?? 'pictorial chart')
	const svgDesc = computed(() => {
		const n = visibleColumns.value.length
		return `Pictorial chart with ${ n } ${ n === 1 ? 'column' : 'columns' }.`
	})

	const columnAriaLabel = (col: IChartPictorialColumn): string =>
		`${ col.category }: ${ col.formatted } (${ col.filledSlots } of ${ col.totalSlots } icons)`

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onColumnEnter = (col: IChartPictorialColumn) => {
		hoveredColKey.value = `${ col.seriesIndex }-${ col.dataIndex }`
	}

	const onColumnLeave = () => {
		hoveredColKey.value = null
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
		onColumnLeave()
	}

	const onColumnActivate = (col: IChartPictorialColumn, event: MouseEvent | KeyboardEvent) => {
		hoveredColKey.value = `${ col.seriesIndex }-${ col.dataIndex }`
		if (hoveredPoint.value) {
			emit('point-click', hoveredPoint.value, event)
		}
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		if (nextVisible) hiddenSeries.value.delete(series.name)
		else hiddenSeries.value.add(series.name)
		emit('series-toggle', series, nextVisible)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-pictorial {
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

		&__column {
			cursor: pointer;
			outline: none;

			&:focus-visible {
				outline: 2px solid var(--origam-color-focus-ring, #3b82f6);
				outline-offset: 2px;
			}
		}

		&__icon {
			transition: opacity 150ms ease;

			&--empty {
				pointer-events: none;
			}
		}

		&__column:hover &__icon--filled,
		&__column:focus-visible &__icon--filled {
			filter: brightness(1.1);
		}

		&__value-label {
			pointer-events: none;
			font-size: var(--origam-chart-pictorial__label---font-size, 0.6875rem);
			font-weight: var(--origam-chart-pictorial__label---font-weight, 600);
			fill: var(--origam-chart-pictorial__label---color, var(--origam-color-text-primary, currentColor));
			user-select: none;
		}

		&__axis-label {
			pointer-events: none;
			font-size: var(--origam-chart-pictorial__axis---font-size, 0.6875rem);
			fill: var(--origam-chart-pictorial__axis---color, var(--origam-color-text-secondary, #6b7280));
			user-select: none;
		}

		&__svg.origam-chart__svg--animated &__icon {
			animation: origam-chart-pictorial-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--fill &__icon--filled {
			transition: clip-path 400ms ease;
		}

		&--fill &__column:hover &__icon--filled,
		&--fill &__column:focus-visible &__icon--filled {
			filter: brightness(1.12) saturate(1.1);
		}

		&--no-animation &__icon {
			animation: none;
		}

		&--no-animation &__icon--filled {
			transition: none;
		}
	}

	@keyframes origam-chart-pictorial-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-pictorial .origam-chart__svg--animated .origam-chart-pictorial__icon {
			animation: none;
		}
	}
</style>
