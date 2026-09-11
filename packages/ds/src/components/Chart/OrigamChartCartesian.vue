<template>
	<div
			class="origam-chart-cartesian"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-cartesian"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-cartesian__header"
				data-cy="origam-chart-cartesian-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-cartesian__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-cartesian__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<origam-chart-range-selector
				v-if="hasRangeSelector"
				:buttons="rangeSelectorButtons"
				:active-index="rangeSelectorActiveIndex"
				:data-length="activeCategories.length"
				data-cy="origam-chart-cartesian-range-selector"
				@select="onRangeSelectorSelect"
		/>

		<nav
				v-if="hasDrilldown && isDrilled"
				class="origam-chart-cartesian__breadcrumb"
				aria-label="Drilldown navigation"
				data-cy="origam-chart-cartesian-breadcrumb"
		>
			<origam-btn
					class="origam-chart-cartesian__breadcrumb-back"
					variant="outlined"
					:text="drilldownBackLabel"
					:aria-label="drilldownBackLabel"
					:style="{ '--origam-btn---min-height': '0', '--origam-btn---min-width': '0' }"
					data-cy="origam-chart-cartesian-breadcrumb-back"
					@click="onDrillUp"
			/>
			<ol class="origam-chart-cartesian__breadcrumb-trail">
				<li
						v-for="item in breadcrumbItems"
						:key="item.depth"
						class="origam-chart-cartesian__breadcrumb-item"
						:class="{ 'origam-chart-cartesian__breadcrumb-item--active': item.depth === drillStack.length - 1 }"
				>
					<button
							v-if="item.depth < drillStack.length - 1"
							class="origam-chart-cartesian__breadcrumb-link"
							type="button"
							@click="onBreadcrumbClick(item.depth)"
					>{{ item.name }}</button>
					<span
							v-else
							class="origam-chart-cartesian__breadcrumb-current"
							aria-current="page"
					>{{ item.name }}</span>
				</li>
			</ol>
		</nav>

		<div
				class="origam-chart-cartesian__body"
				:class="bodyClasses"
				data-cy="origam-chart-cartesian-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-cartesian__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="viewBox"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-cartesian-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
					@mousedown="onSvgMouseDown"
					@mouseup="onSvgMouseUp"
					@wheel.prevent="onSvgWheel"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<origam-chart-axis
						:plot="plot"
						:ticks="ticks"
						:secondary-y-ticks="secondaryTicks"
						:show-axis="showAxis"
						:show-grid="showGrid"
						:x-axis-format="xAxisFormat"
						:y-axis-format="yAxisFormat"
						:secondary-y-axis-format="secondaryYAxis?.format"
				/>

				<g
						v-if="belowBands.length || belowLines.length"
						class="origam-chart__plot-decorations origam-chart__plot-decorations--below"
						data-cy="origam-chart-plot-below"
				>
					<template
							v-for="(d, i) in belowBands"
							:key="`pb-below-${ i }`"
					>
						<rect
								class="origam-chart__plot-band"
								:x="d.geo!.x"
								:y="d.geo!.y"
								:width="d.geo!.width"
								:height="d.geo!.height"
								:style="{ fill: d.geo!.fill, fillOpacity: d.geo!.opacity }"
								data-cy="origam-chart-plot-band"
						/>
						<text
								v-if="d.geo!.label"
								class="origam-chart__plot-band-label"
								:x="d.geo!.labelX"
								:y="d.geo!.labelY"
								text-anchor="middle"
								dominant-baseline="middle"
								:style="{ fill: d.geo!.labelColor }"
								data-cy="origam-chart-plot-band-label"
						>{{ d.geo!.label }}</text>
					</template>
					<template
							v-for="(d, i) in belowLines"
							:key="`pl-below-${ i }`"
					>
						<line
								class="origam-chart__plot-line"
								:x1="d.geo!.x1"
								:y1="d.geo!.y1"
								:x2="d.geo!.x2"
								:y2="d.geo!.y2"
								:style="{ stroke: d.geo!.stroke, strokeWidth: d.geo!.strokeWidth, strokeDasharray: d.geo!.strokeDasharray }"
								data-cy="origam-chart-plot-line"
						/>
						<text
								v-if="d.geo!.label"
								class="origam-chart__plot-line-label"
								:x="d.geo!.labelX"
								:y="d.geo!.labelY"
								:text-anchor="d.geo!.labelAnchor"
								dominant-baseline="auto"
								:style="{ fill: d.geo!.stroke }"
								data-cy="origam-chart-plot-line-label"
						>{{ d.geo!.label }}</text>
					</template>
				</g>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-cartesian-series"
				>
					<template
							v-for="(path, i) in paths"
							:key="`p-${ i }`"
					>
						<path
								v-if="path.kind === 'path'"
								:class="['origam-chart__path', `origam-chart__path--${ effectiveTypeOf(path) }`, { 'origam-chart__path--area-fill': path.variant === 'fill' && effectiveTypeOf(path) === 'area' }]"
								:d="path.d"
								:style="pathStyleFor(path)"
								data-cy="origam-chart-path"
						/>
						<rect
								v-else-if="path.kind === 'rect'"
								class="origam-chart__bar"
								:x="path.rect!.x"
								:y="path.rect!.y"
								:width="path.rect!.width"
								:height="path.rect!.height"
								:fill="path.color"
								tabindex="0"
								role="button"
								:aria-label="pointAriaLabel(path)"
								:data-cy="`origam-chart-bar-${ path.seriesIndex }-${ path.dataIndex }`"
								@click="onPointActivate(path, $event)"
								@keydown.enter.prevent="onPointActivate(path, $event)"
								@keydown.space.prevent="onPointActivate(path, $event)"
								@mouseenter="onPointEnter(path)"
								@mouseleave="onPointLeaveEvent"
						/>
						<circle
								v-else-if="path.kind === 'circle'"
								class="origam-chart__point"
								:cx="path.circle!.cx"
								:cy="path.circle!.cy"
								:r="hoverMatches(path) ? path.circle!.r + 2 : path.circle!.r"
								:fill="path.color"
								tabindex="0"
								role="button"
								:aria-label="pointAriaLabel(path)"
								:data-cy="`origam-chart-point-${ path.seriesIndex }-${ path.dataIndex }`"
								@click="onPointActivate(path, $event)"
								@keydown.enter.prevent="onPointActivate(path, $event)"
								@keydown.space.prevent="onPointActivate(path, $event)"
								@mouseenter="onPointEnter(path)"
								@mouseleave="onPointLeaveEvent"
						/>
					</template>
				</g>

				<g
						v-if="aboveBands.length || aboveLines.length"
						class="origam-chart__plot-decorations origam-chart__plot-decorations--above"
						data-cy="origam-chart-plot-above"
				>
					<template
							v-for="(d, i) in aboveBands"
							:key="`pb-above-${ i }`"
					>
						<rect
								class="origam-chart__plot-band"
								:x="d.geo!.x"
								:y="d.geo!.y"
								:width="d.geo!.width"
								:height="d.geo!.height"
								:style="{ fill: d.geo!.fill, fillOpacity: d.geo!.opacity }"
								data-cy="origam-chart-plot-band"
						/>
						<text
								v-if="d.geo!.label"
								class="origam-chart__plot-band-label"
								:x="d.geo!.labelX"
								:y="d.geo!.labelY"
								text-anchor="middle"
								dominant-baseline="middle"
								:style="{ fill: d.geo!.labelColor }"
								data-cy="origam-chart-plot-band-label"
						>{{ d.geo!.label }}</text>
					</template>
					<template
							v-for="(d, i) in aboveLines"
							:key="`pl-above-${ i }`"
					>
						<line
								class="origam-chart__plot-line"
								:x1="d.geo!.x1"
								:y1="d.geo!.y1"
								:x2="d.geo!.x2"
								:y2="d.geo!.y2"
								:style="{ stroke: d.geo!.stroke, strokeWidth: d.geo!.strokeWidth, strokeDasharray: d.geo!.strokeDasharray }"
								data-cy="origam-chart-plot-line"
						/>
						<text
								v-if="d.geo!.label"
								class="origam-chart__plot-line-label"
								:x="d.geo!.labelX"
								:y="d.geo!.labelY"
								:text-anchor="d.geo!.labelAnchor"
								dominant-baseline="auto"
								:style="{ fill: d.geo!.stroke }"
								data-cy="origam-chart-plot-line-label"
						>{{ d.geo!.label }}</text>
					</template>
				</g>

				<g
						v-if="zoomable && isDragging && dragSelectionRect !== null"
						class="origam-chart__zoom-selection"
						data-cy="origam-chart-zoom-selection"
						aria-hidden="true"
				>
					<rect
							:x="dragSelectionRect.x"
							:y="dragSelectionRect.y"
							:width="dragSelectionRect.width"
							:height="dragSelectionRect.height"
							:style="{ fill: 'rgba(59,130,246,0.15)', stroke: 'rgba(59,130,246,0.6)', strokeWidth: '1' }"
					/>
				</g>

				<g
						v-if="zoomable && isZoomed"
						class="origam-chart__zoom-reset"
						data-cy="origam-chart-zoom-reset"
						:transform="`translate(${ plot.x1 - 68 }, ${ plot.y0 })`"
				>
					<rect
							x="0"
							y="0"
							width="64"
							height="20"
							rx="4"
							:style="{ fill: 'var(--origam-chart__zoom-reset---bg, rgba(59,130,246,0.9))', cursor: 'pointer' }"
							tabindex="0"
							role="button"
							aria-label="Reset zoom"
							data-cy="origam-chart-zoom-reset-btn"
							@click="onZoomReset"
							@keydown.enter.prevent="onZoomReset"
							@keydown.space.prevent="onZoomReset"
					/>
					<text
							x="32"
							y="13"
							text-anchor="middle"
							dominant-baseline="auto"
							pointer-events="none"
							:style="{ fill: '#ffffff', fontSize: '0.6875rem', fontWeight: '600' }"
					>Reset zoom</text>
				</g>

				<g
						v-if="annotationGeos.length"
						class="origam-chart__annotations"
						aria-hidden="true"
						data-cy="origam-chart-annotations"
				>
					<template
							v-for="(geo, i) in annotationGeos"
							:key="`anno-${ i }`"
					>
						<template v-if="geo.kind === 'arrow'">
							<line
									class="origam-chart__annotation-line"
									:x1="geo.ax"
									:y1="geo.ay"
									:x2="geo.bx"
									:y2="geo.by"
									:style="{ stroke: geo.stroke, strokeWidth: geo.strokeWidth }"
									data-cy="origam-chart-annotation-arrow-line"
							/>
							<polygon
									class="origam-chart__annotation-arrowhead"
									:points="geo.arrowPoints"
									:style="{ fill: geo.stroke }"
									data-cy="origam-chart-annotation-arrow-head"
							/>
							<text
									v-if="geo.text"
									class="origam-chart__annotation-text"
									:x="geo.ax + geo.dx"
									:y="geo.ay + geo.dy"
									text-anchor="middle"
									dominant-baseline="auto"
									:style="{ fill: geo.stroke }"
									data-cy="origam-chart-annotation-arrow-text"
							>{{ geo.text }}</text>
						</template>

						<template v-else-if="geo.kind === 'label'">
							<line
									v-if="geo.leaderEnd"
									class="origam-chart__annotation-leader"
									:x1="geo.ax"
									:y1="geo.ay"
									:x2="geo.leaderEnd.x"
									:y2="geo.leaderEnd.y"
									:style="{ stroke: geo.stroke, strokeWidth: geo.strokeWidth, strokeDasharray: '3 3' }"
									data-cy="origam-chart-annotation-leader"
							/>
							<rect
									v-if="geo.callout"
									class="origam-chart__annotation-callout"
									:x="geo.callout.x"
									:y="geo.callout.y"
									:width="geo.callout.width"
									:height="geo.callout.height"
									rx="4"
									:style="{ fill: geo.stroke }"
									data-cy="origam-chart-annotation-callout"
							/>
							<text
									v-if="geo.text && geo.callout"
									class="origam-chart__annotation-callout-text"
									:x="geo.callout.x + geo.callout.width / 2"
									:y="geo.callout.y + geo.callout.height / 2"
									text-anchor="middle"
									dominant-baseline="middle"
									data-cy="origam-chart-annotation-label-text"
							>{{ geo.text }}</text>
						</template>

						<template v-else-if="geo.kind === 'circle'">
							<circle
									class="origam-chart__annotation-circle"
									:cx="geo.ax"
									:cy="geo.ay"
									:r="geo.radius"
									:style="{ stroke: geo.stroke, strokeWidth: geo.strokeWidth }"
									data-cy="origam-chart-annotation-circle"
							/>
							<text
									v-if="geo.text"
									class="origam-chart__annotation-text"
									:x="geo.ax + geo.radius + geo.dx + 4"
									:y="geo.ay + geo.dy"
									text-anchor="start"
									dominant-baseline="middle"
									:style="{ fill: geo.stroke }"
									data-cy="origam-chart-annotation-circle-text"
							>{{ geo.text }}</text>
						</template>

						<template v-else-if="geo.kind === 'bracket'">
							<path
									class="origam-chart__annotation-bracket"
									:d="`M ${geo.ax},${geo.by + 8} L ${geo.ax},${geo.ay} L ${geo.bx},${geo.by} L ${geo.bx},${geo.by + 8}`"
									:style="{ stroke: geo.stroke, strokeWidth: geo.strokeWidth }"
									data-cy="origam-chart-annotation-bracket"
							/>
							<text
									v-if="geo.text"
									class="origam-chart__annotation-text"
									:x="(geo.ax + geo.bx) / 2 + geo.dx"
									:y="Math.min(geo.ay, geo.by) + geo.dy"
									text-anchor="middle"
									dominant-baseline="auto"
									:style="{ fill: geo.stroke }"
									data-cy="origam-chart-annotation-bracket-text"
							>{{ geo.text }}</text>
						</template>
					</template>
				</g>
			</svg>

			<origam-chart-tooltip
					v-if="showTooltip"
					:point="hoveredPoint"
					:series="hoveredSeries"
					:category="hoveredCategory"
					:x="mousePos.x"
					:y="mousePos.y"
					:x-axis-format="xAxisFormat"
					:y-axis-format="activeYAxisFormat"
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
					class="origam-chart-cartesian__empty origam-chart__empty"
					data-cy="origam-chart-cartesian-empty"
			>
				<slot name="empty">
					<span>No data to display</span>
				</slot>
			</div>
		</div>

		<origam-chart-legend
				v-if="showLegend"
				:items="legend"
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
		type StyleValue,
		watch
	} from 'vue'

	import {
		useChartHeaderTypography,
		useBackgroundColor,
		useChart,
		useChartZoom,
		useDimension,
		useElevation,
		useMargin,
		usePadding,
		useRounded
	} from '../../composables'

	import {
		computeAnnotationGeometry,
		computePlotBandGeometry,
		computePlotLineGeometry
	} from '../../composables/Chart/chart.composable'

	import { CHART_RANGE_SELECTOR_DEFAULT_BUTTONS } from '../../consts/Chart/chart.const'

	import { OrigamBtn } from '../Btn'

	import OrigamChartAxis from './OrigamChartAxis.vue'
	import OrigamChartLegend from './OrigamChartLegend.vue'
	import OrigamChartRangeSelector from './OrigamChartRangeSelector.vue'
	import OrigamChartTooltip from './OrigamChartTooltip.vue'

	import type {
		IChartAnnotationGeo,
		IChartCartesianEmits,
		IChartCartesianProps,
		IChartDrilldownFrame,
		IChartDrilldownLink,
		IChartPath,
		IChartPlotBand,
		IChartPlotLine,
		IChartPoint,
		IChartRangeSelectorButton,
		IChartSeries,
		IChartSeriesPoint
	} from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Cartesian chart family — renders `line`, `area`, `bar`,
	 * `column`, `scatter`, `spline`, `stepped-line`. Owns
	 * the X+Y axes + grid + tick labels via `<OrigamChartAxis>`.
	 *
	 * Polar / radar / gauge live in their own family components so
	 * pie / donut don't inherit the cartesian chrome. The shell
	 * `<OrigamChart>` dispatches between families based on the
	 * `type` prop.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartCartesian'
	})

	/*********************************************************
	 * Props / Emits — defaults inlined per CLAUDE.md.
	 ********************************************************/
	const props = withDefaults(defineProps<IChartCartesianProps>(), {
		type: 'line',
		categories: () => [],
		height: 300,
		title: undefined,
		subtitle: undefined,
		showLegend: true,
		legendPosition: 'bottom',
		showTooltip: true,
		showGrid: true,
		showAxis: true,
		animated: true,
		animationDuration: 600,
		stacked: false,
		stacking: 'normal',
		colorScheme: () => [],
		xAxisFormat: undefined,
		yAxisFormat: undefined,
		aspectRatio: undefined,
		smoothing: 'none',
		yMin: undefined,
		yMax: undefined,
		secondaryYAxis: undefined,
		plotBands: () => [],
		plotLines: () => [],
		annotations: () => [],
		drilldown: undefined,
		zoomable: false,
		rangeSelector: undefined
	})

	const emit = defineEmits<IChartCartesianEmits>()

	/*********************************************************
	 * Drilldown state — a navigation stack where index 0 is the
	 * root frame (props.series / props.categories). Each drill-in
	 * pushes a new frame; "Back" pops it. The chart engine always
	 * reads the top frame so reactivity flows automatically.
	 *
	 * Cycle detection: a point's drilldown id is looked up in the
	 * dataset bank; if the id already appears in the current stack
	 * we silently ignore the click to prevent infinite loops.
	 * Maximum depth is naturally bounded by the number of distinct
	 * dataset ids the consumer provides — infinite levels are
	 * supported as long as there are no cycles.
	 ********************************************************/
	const drillStack = ref<Array<IChartDrilldownFrame>>([])

	const activeSeries = computed<Array<IChartSeries>>(() => {
		if (!drillStack.value.length) return props.series
		return drillStack.value[drillStack.value.length - 1].series
	})

	const activeCategories = computed<Array<string>>(() => {
		if (!drillStack.value.length) return props.categories
		return drillStack.value[drillStack.value.length - 1].categories
	})

	const hasDrilldown = computed(() => Boolean(props.drilldown?.datasets?.length))

	const isDrilled = computed(() => drillStack.value.length > 0)

	const breadcrumbItems = computed<Array<{ name: string, depth: number }>>(() => {
		const root = { name: props.title ?? 'Root', depth: -1 }
		return [root, ...drillStack.value.map((frame, i) => ({ name: frame.name, depth: i }))]
	})

	const drilldownBackLabel = computed(() => props.drilldown?.backLabel ?? '← Back')

	const resolveDrilldownLink = (link: IChartDrilldownLink): IChartDrilldownFrame | null => {
		if (!props.drilldown) return null
		const dataset = props.drilldown.datasets.find((d) => d.id === link.id)
		if (!dataset) return null
		return {
			name: dataset.name,
			series: dataset.series,
			categories: dataset.categories ?? []
		}
	}

	const isDrilldownCycle = (id: string): boolean =>
		drillStack.value.some((frame) => frame.name === id)

	const onDrillIn = (link: IChartDrilldownLink, point: IChartPoint): void => {
		if (isDrilldownCycle(link.id)) return
		const frame = resolveDrilldownLink(link)
		if (!frame) return
		drillStack.value = [...drillStack.value, frame]
		hoveredPath.value = null
		emit('drill', link, point)
	}

	const onDrillUp = (): void => {
		if (!drillStack.value.length) return
		drillStack.value = drillStack.value.slice(0, -1)
		hoveredPath.value = null
		emit('drill-up')
	}

	const onBreadcrumbClick = (depth: number): void => {
		if (depth === -1) {
			drillStack.value = []
		} else {
			drillStack.value = drillStack.value.slice(0, depth + 1)
		}
		hoveredPath.value = null
	}

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { paddingClasses, paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static — viewBox geometry. SVG renders into a fixed coordinate
	 * space; CSS scales the resulting box. Trend sparklines use a
	 * shorter viewBox so they don't grow taller than their host
	 * row when wrapped into a table cell.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 360
	const PADDING_DEFAULT = { top: 24, right: 24, bottom: 36, left: 48 }
	const PADDING_WITH_SECONDARY_AXIS = { top: 24, right: 56, bottom: 36, left: 48 }

	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })

	const hasSecondaryAxis = computed(() =>
		Boolean(props.secondaryYAxis) || activeSeries.value.some((s) => (s.yAxis ?? 0) === 1)
	)

	const chartPadding = computed(() =>
		hasSecondaryAxis.value ? PADDING_WITH_SECONDARY_AXIS : PADDING_DEFAULT
	)

	/*********************************************************
	 * Zoom / pan state — `useChartZoom` manages the visible
	 * category window. The engine clips `activeCategories` to
	 * `[zoomStart, zoomEnd]` before scale computation. When
	 * `zoomable` is `false` the window covers the full range and
	 * all methods are no-ops from the consumer's perspective.
	 ********************************************************/
	const zoom = useChartZoom({ dataLength: () => activeCategories.value.length })

	const {
		zoomStart,
		zoomEnd,
		isDragging,
		dragStartPx,
		dragEndPx,
		isZoomed,
		zoomTo,
		zoomReset: zoomResetState,
		zoomBy,
		pxToCategoryIndex,
		WHEEL_ZOOM_STEP
	} = zoom

	const visibleCategories = computed<Array<string>>(() => {
		if (!props.zoomable) return activeCategories.value
		const len = activeCategories.value.length
		if (!len) return activeCategories.value
		const s = zoomStart.value
		const e = Math.min(zoomEnd.value, len - 1)
		return activeCategories.value.slice(s, e + 1)
	})

	/*********************************************************
	 * Range selector state — tracks which button is currently active.
	 ********************************************************/
	const rangeSelectorActiveIndex = ref<number>(-1)

	const hasRangeSelector = computed(() =>
		Boolean(props.rangeSelector?.enabled)
	)

	const rangeSelectorButtons = computed<Array<IChartRangeSelectorButton>>(() => {
		const custom = props.rangeSelector?.buttons
		if (custom && custom.length) return custom
		return CHART_RANGE_SELECTOR_DEFAULT_BUTTONS as unknown as Array<IChartRangeSelectorButton>
	})

	const onRangeSelectorSelect = (index: number, start: number, end: number): void => {
		rangeSelectorActiveIndex.value = index
		if (props.zoomable) {
			zoomTo(start, end)
			emit('zoom', { start, end })
		}
	}

	watch(
		() => activeCategories.value.length,
		() => {
			zoomResetState()
			rangeSelectorActiveIndex.value = -1
			const sel = props.rangeSelector?.selected
			if (sel !== undefined && rangeSelectorButtons.value[sel]) {
				const btn = rangeSelectorButtons.value[sel]
				const len = activeCategories.value.length
				let start: number
				let end: number
				if (btn.fraction !== undefined) {
					const windowSize = Math.round(len * Math.max(0, Math.min(1, btn.fraction)))
					start = Math.max(0, len - windowSize)
					end = len - 1
				} else if (btn.count !== undefined) {
					start = Math.max(0, len - btn.count)
					end = len - 1
				} else {
					start = 0
					end = len - 1
				}
				rangeSelectorActiveIndex.value = sel
				if (props.zoomable) zoomTo(start, end)
			}
		},
		{ immediate: true }
	)

	/*********************************************************
	 * Engine — `useChart` produces every descriptor needed to
	 * paint. The thunks make the composable reactive against
	 * `props` without owning the prop reference itself.
	 * When drilled in, `activeSeries` / `activeCategories` point
	 * to the sub-dataset instead of the root props.
	 * The zoom window clips the visible category slice so the
	 * X scale maps only the visible range to the full plot width.
	 ********************************************************/
	const chart = useChart({
		type: () => props.type,
		series: () => activeSeries.value,
		categories: () => visibleCategories.value,
		stacked: () => props.stacked,
		stacking: () => props.stacking,
		// donutHoleSize is a no-op for cartesian; fixed to 0.
		donutHoleSize: () => 0,
		colorScheme: () => props.colorScheme,
		smoothing: () => props.smoothing,
		yMin: () => props.yMin,
		yMax: () => props.yMax,
		width: () => SVG_WIDTH,
		height: () => SVG_HEIGHT,
		padding: () => chartPadding.value,
		secondaryYAxis: () => props.secondaryYAxis
	})

	const { viewBox, ticks, secondaryTicks, paths, legend, plot, scales, yRange, slotCount, effectiveStacking, percentValues } = chart

	/*********************************************************
	 * Plot bands + lines — background decoration layers.
	 * Split by `layer` so the template renders below/above
	 * data in the correct order without z-index tricks.
	 ********************************************************/
	const bandDescriptors = computed(() => {
		const { x0, x1, y0, y1 } = plot.value
		return (props.plotBands ?? []).map((band: IChartPlotBand) => ({
			band,
			geo: computePlotBandGeometry(
				band,
				scales.value,
				activeCategories.value,
				x0, x1, y0, y1
			)
		})).filter((d) => d.geo !== null)
	})

	const lineDescriptors = computed(() => {
		const { x0, x1, y0, y1 } = plot.value
		return (props.plotLines ?? []).map((line: IChartPlotLine) => ({
			line,
			geo: computePlotLineGeometry(
				line,
				scales.value,
				activeCategories.value,
				x0, x1, y0, y1
			)
		})).filter((d) => d.geo !== null)
	})

	const belowBands = computed(() =>
		bandDescriptors.value.filter((d) => (d.band.layer ?? 'below') === 'below')
	)
	const aboveBands = computed(() =>
		bandDescriptors.value.filter((d) => d.band.layer === 'above')
	)
	const belowLines = computed(() =>
		lineDescriptors.value.filter((d) => (d.line.layer ?? 'above') === 'below')
	)
	const aboveLines = computed(() =>
		lineDescriptors.value.filter((d) => (d.line.layer ?? 'above') === 'above')
	)

	/*********************************************************
	 * Annotations — projected above all series and decorations.
	 * Each entry is `IChartAnnotationGeo | null`; nulls are
	 * filtered out so the template never receives bad geometry.
	 ********************************************************/
	const annotationGeos = computed<Array<IChartAnnotationGeo>>(() => {
		const annos = props.annotations ?? []
		if (!annos.length) return []
		return annos
			.map((a) => computeAnnotationGeometry(a, scales.value, visibleCategories.value, slotCount.value))
			.filter((g): g is IChartAnnotationGeo => g !== null)
	})

	/*********************************************************
	 * Hover / tooltip — pure data flow, no DOM measurements
	 * beyond positioning the floating tooltip. Identical to the
	 * shell pattern.
	 ********************************************************/
	const hoveredPath = ref<IChartPath | null>(null)
	const hoveredPoint = computed<IChartPoint | null>(() => {
		const p = hoveredPath.value
		if (!p) return null
		const series = p.series
		const visibleIdx = p.dataIndex ?? 0
		const absIdx = zoomStart.value + visibleIdx
		const entry = series.data[absIdx] ?? series.data[visibleIdx]
		const x = typeof entry === 'number'
			? (visibleCategories.value[visibleIdx] ?? activeCategories.value[absIdx] ?? absIdx)
			: entry.x
		const y = typeof entry === 'number' ? entry : entry.y
		return {
			seriesIndex: p.seriesIndex,
			seriesName: series.name,
			dataIndex: absIdx,
			x,
			y,
			color: p.color
		}
	})
	const hoveredSeries = computed<IChartSeries | null>(() =>
		hoveredPath.value?.series ?? null
	)
	const hoveredCategory = computed<string | number>(() => {
		if (!hoveredPoint.value) return ''
		return activeCategories.value[hoveredPoint.value.dataIndex] ?? hoveredPoint.value.x
	})

	/*********************************************************
	 * Empty state — fired when no series carries usable data.
	 ********************************************************/
	const showEmpty = computed(() => {
		if (!activeSeries.value?.length) return true
		return activeSeries.value.every((s) => !s.data?.length || s.visible === false)
	})

	/*********************************************************
	 * Root classes / styles — `aspectRatio` wins over `height`.
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-cartesian--${ props.type }`]: true,
			[`origam-chart-cartesian--legend-${ props.legendPosition }`]: true,
			'origam-chart-cartesian--no-animation': !props.animated
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
		'origam-chart-cartesian__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated,
		'origam-chart__svg--zoomable': props.zoomable
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * Format helpers — fall back to identity.
	 ********************************************************/
	const formatY = (value: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(value)
		return String(value)
	}

	/**
	 * Y-axis formatter active for the currently hovered series.
	 *
	 * - Secondary axis: uses `secondaryYAxis.format` when present.
	 * - Percent stacking: overrides with `rawValue (XX.X%)` so the
	 *   tooltip shows both the raw data value and the stack share.
	 * - Default: falls back to `props.yAxisFormat` or identity.
	 */
	const activeYAxisFormat = computed<((v: number) => string) | undefined>(() => {
		const isPercent = effectiveStacking.value === 'percent' && props.stacked

		if (isPercent) {
			return (rawY: number) => {
				const seriesIdx = hoveredPath.value?.seriesIndex ?? -1
				const dataIdx = hoveredPath.value?.dataIndex ?? 0
				const pct = seriesIdx >= 0
					? (percentValues.value.get(seriesIdx)?.[dataIdx] ?? 0)
					: 0
				const base = props.yAxisFormat ? props.yAxisFormat(rawY) : String(rawY)
				return `${base} (${pct.toFixed(1)}%)`
			}
		}

		const s = hoveredSeries.value
		if (s && (s.yAxis ?? 0) === 1 && props.secondaryYAxis?.format) {
			return props.secondaryYAxis.format
		}
		return props.yAxisFormat
	})

	/*********************************************************
	 * Path classification — pie / donut helpers don't apply
	 * here (the engine never emits a slice descriptor when
	 * `type` is cartesian). We keep `effectiveTypeOf` for
	 * mixed-type series (e.g. a `<column>` chart with a `line`
	 * overlay series).
	 ********************************************************/
	const effectiveTypeOf = (path: IChartPath) =>
		path.series.type ?? props.type

	const strokeStyleFor = (path: IChartPath): StyleValue => {
		if (!props.animated) return {}
		const length = path.pathLength ?? 0
		if (!length) return {}
		return { '--origam-chart-path---length': String(length) }
	}

	/*
	 * Combined inline style for SVG `<path>` — pre-fix the fill /
	 * stroke were emitted as SVG presentation attributes
	 * (`fill="..."`, `stroke="..."`), which are treated as INITIAL
	 * CSS values and lose against the scoped `.origam-chart__path
	 * { fill: none; }` rule below. The area's translucent fill
	 * therefore never rendered — the user-reported "area looks
	 * identical to line" symptom. Inline styles have higher
	 * precedence than CSS rules, so emitting them here makes the
	 * fill / stroke survive the cascade.
	 */
	const pathStyleFor = (path: IChartPath): StyleValue => {
		const base = strokeStyleFor(path) as Record<string, string>
		const isAreaFill = path.variant === 'fill' && effectiveTypeOf(path) === 'area'
		const isStroke = path.variant !== 'fill'
		return {
			...base,
			fill: isAreaFill ? path.color : 'none',
			fillOpacity: isAreaFill ? '0.25' : '0',
			stroke: isStroke ? path.color : 'none'
		}
	}

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const hoverMatches = (path: IChartPath) =>
		hoveredPath.value === path

	const onPointEnter = (path: IChartPath) => {
		hoveredPath.value = path
		if (hoveredPoint.value) chart.onPointHover(hoveredPoint.value)
	}

	const onPointLeaveEvent = () => {
		hoveredPath.value = null
		chart.onPointHover(null)
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
		if (isDragging.value) {
			isDragging.value = false
			dragStartPx.value = null
			dragEndPx.value = null
		}
		onPointLeaveEvent()
	}

	/*********************************************************
	 * Zoom / pan interactions
	 *
	 * SVG has a fixed coordinate space (600 × 360). Mouse events
	 * are in DOM pixels; we convert via `getBoundingClientRect()` +
	 * the scale factor between DOM and SVG viewBox dimensions.
	 ********************************************************/

	const svgToCategoryIndex = (clientX: number): number => {
		const svgEl = svgRef.value
		if (!svgEl) return 0
		const rect = svgEl.getBoundingClientRect()
		const domRatio = SVG_WIDTH / Math.max(1, rect.width)
		const svgX = (clientX - rect.left) * domRatio
		return pxToCategoryIndex(svgX, plot.value.x0, plot.value.x1)
	}

	const onSvgMouseDown = (event: MouseEvent): void => {
		if (!props.zoomable) return
		if (event.button !== 0) return

		if (event.ctrlKey || event.metaKey) {
			isDragging.value = false
			dragStartPx.value = event.clientX
			return
		}

		isDragging.value = true
		dragStartPx.value = event.clientX
		dragEndPx.value = event.clientX

		const handleMouseMove = (mv: MouseEvent): void => {
			if (!isDragging.value) return
			dragEndPx.value = mv.clientX
		}

		const handleMouseUp = (mu: MouseEvent): void => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)

			if (!isDragging.value) return
			isDragging.value = false

			const startIdx = svgToCategoryIndex(dragStartPx.value ?? mu.clientX)
			const endIdx = svgToCategoryIndex(mu.clientX)
			dragStartPx.value = null
			dragEndPx.value = null

			const lo = Math.floor(Math.min(startIdx, endIdx))
			const hi = Math.ceil(Math.max(startIdx, endIdx))
			if (hi - lo < 1) return
			const len = activeCategories.value.length
			const absLo = zoomStart.value + lo
			const absHi = Math.min(len - 1, zoomStart.value + hi)
			if (absHi - absLo < 1) return
			zoomTo(absLo, absHi)
			rangeSelectorActiveIndex.value = -1
			emit('zoom', { start: absLo, end: absHi })
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
	}

	const onSvgMouseUp = (_event: MouseEvent): void => {
	}

	const onSvgWheel = (event: WheelEvent): void => {
		if (!props.zoomable) return
		if (!event.shiftKey) return
		event.preventDefault()

		const svgEl = svgRef.value
		if (!svgEl) return
		const rect = svgEl.getBoundingClientRect()
		const domRatio = SVG_WIDTH / Math.max(1, rect.width)
		const svgX = (event.clientX - rect.left) * domRatio
		const { x0, x1 } = plot.value
		const plotWidth = Math.max(1, x1 - x0)
		const anchorFraction = Math.max(0, Math.min(1, (svgX - x0) / plotWidth))

		const zoomIn = event.deltaY < 0
		const delta = zoomIn ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP
		zoomBy(delta, anchorFraction)
		rangeSelectorActiveIndex.value = -1
		emit('zoom', { start: zoomStart.value, end: zoomEnd.value })
	}

	const onZoomReset = (): void => {
		zoomResetState()
		rangeSelectorActiveIndex.value = -1
		emit('reset-zoom')
	}

	const dragSelectionRect = computed<{ x: number, y: number, width: number, height: number } | null>(() => {
		if (!isDragging.value || dragStartPx.value === null || dragEndPx.value === null) return null
		const svgEl = svgRef.value
		if (!svgEl) return null
		const rect = svgEl.getBoundingClientRect()
		const domRatio = SVG_WIDTH / Math.max(1, rect.width)
		const startSvgX = (dragStartPx.value - rect.left) * domRatio
		const endSvgX = (dragEndPx.value - rect.left) * domRatio
		const { x0, x1, y0, y1 } = plot.value
		const left = Math.max(x0, Math.min(x1, Math.min(startSvgX, endSvgX)))
		const right = Math.max(x0, Math.min(x1, Math.max(startSvgX, endSvgX)))
		const width = right - left
		if (width < 1) return null
		return { x: left, y: y0, width, height: y1 - y0 }
	})

	const onPointActivate = (path: IChartPath, event: MouseEvent | KeyboardEvent) => {
		if (!hoveredPoint.value || hoveredPath.value !== path) {
			hoveredPath.value = path
		}
		if (!hoveredPoint.value) return

		const currentPoint = hoveredPoint.value

		if (hasDrilldown.value) {
			const dataIdx = path.dataIndex ?? 0
			const entry = path.series.data[dataIdx]
			const drillLink = (typeof entry !== 'number')
				? (entry as IChartSeriesPoint).drilldown
				: undefined
			if (drillLink) {
				onDrillIn(drillLink, currentPoint)
				return
			}
		}

		emit('point-click', currentPoint, event)
	}

	const onLegendClick = (series: IChartSeries, index: number): void => {
		emit('legend-click', series, index)
	}

	const onSeriesToggle = (series: IChartSeries, nextVisible: boolean): void => {
		series.visible = nextVisible
		emit('series-toggle', series, nextVisible)
	}

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'Chart')
	const svgAriaLabel = computed(() => props.title ?? `${ props.type } chart`)
	const svgTitle = computed(() => props.title ?? `${ props.type } chart`)
	const svgDesc = computed(() => {
		const seriesCount = activeSeries.value.length
		if (!seriesCount) return 'No data'
		const range = yRange.value
		const points = slotCount.value
		return `${ props.type } chart with ${ seriesCount } series and ${ points } ${ points === 1 ? 'point' : 'points' }, values ranging from ${ range.min } to ${ range.max }.`
	})

	const pointAriaLabel = (path: IChartPath) => {
		const dataIdx = path.dataIndex ?? 0
		const absIdx = zoomStart.value + dataIdx
		const entry = path.series.data[absIdx] ?? path.series.data[dataIdx]
		const y = typeof entry === 'number' ? entry : entry.y
		const cat = visibleCategories.value[dataIdx] ?? activeCategories.value[absIdx] ?? absIdx
		const isPercent = effectiveStacking.value === 'percent' && props.stacked
		if (isPercent) {
			const pct = percentValues.value.get(path.seriesIndex)?.[dataIdx] ?? 0
			return `${ path.series.name }, ${ cat }: ${ formatY(y) } (${ pct.toFixed(1) }%)`
		}
		return `${ path.series.name }, ${ cat }: ${ formatY(y) }`
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-cartesian {
		$this: &;

		display: grid;
		gap: var(--origam-chart---gap, 12px);
		padding: var(--origam-chart---padding, 12px);
		background-color: var(--origam-chart---background-color, transparent);
		color: var(--origam-chart---color, inherit);
		width: 100%;
		box-sizing: border-box;
		grid-template-rows: auto auto auto 1fr auto;
		grid-template-columns: 1fr;
		grid-template-areas:
			"header"
			"range-selector"
			"breadcrumb"
			"body"
			"legend";

		&--legend-top {
			grid-template-areas:
				"header"
				"range-selector"
				"breadcrumb"
				"legend"
				"body";
			grid-template-rows: auto auto auto auto 1fr;
		}

		&--legend-bottom {
			grid-template-areas:
				"header"
				"range-selector"
				"breadcrumb"
				"body"
				"legend";
			grid-template-rows: auto auto auto 1fr auto;
		}

		&--legend-left {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-rows: auto auto auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"range-selector range-selector"
				"breadcrumb breadcrumb"
				"legend body";
		}

		&--legend-right {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-rows: auto auto auto minmax(0, 1fr);
			grid-template-areas:
				"header header"
				"range-selector range-selector"
				"breadcrumb breadcrumb"
				"body legend";
		}

		&__header {
			grid-area: header;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		:deep(.origam-chart-range-selector) {
			grid-area: range-selector;
		}

		&__breadcrumb {
			grid-area: breadcrumb;
			display: flex;
			align-items: center;
			gap: var(--origam-chart__breadcrumb---gap, 8px);
			font-size: var(--origam-chart__breadcrumb---font-size, 0.8125rem);
			color: var(--origam-chart__breadcrumb---color, var(--origam-color-text-secondary, #6b7280));
		}

		&__breadcrumb-back {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			padding: 4px 10px;
			border: 1px solid var(--origam-chart__breadcrumb-back---border-color, var(--origam-color-border-default, #d1d5db));
			border-radius: var(--origam-chart__breadcrumb-back---border-radius, 4px);
			background-color: var(--origam-chart__breadcrumb-back---background-color, transparent);
			color: var(--origam-chart__breadcrumb-back---color, inherit);
			font-size: inherit;
			cursor: pointer;
			white-space: nowrap;
			transition: background-color 120ms ease, border-color 120ms ease;

			&:hover,
			&:focus-visible {
				background-color: var(--origam-chart__breadcrumb-back---hover-background-color, rgba(0, 0, 0, 0.05));
				outline: none;
			}
		}

		&__breadcrumb-trail {
			display: flex;
			align-items: center;
			gap: 4px;
			list-style: none;
			margin: 0;
			padding: 0;
			flex-wrap: wrap;
		}

		&__breadcrumb-item {
			display: flex;
			align-items: center;
			gap: 4px;

			&:not(:last-child)::after {
				content: "/";
				opacity: 0.5;
			}
		}

		&__breadcrumb-link {
			background: none;
			border: none;
			padding: 0;
			color: var(--origam-chart__breadcrumb-link---color, var(--origam-color-action-primary-text, #3b82f6));
			font-size: inherit;
			cursor: pointer;
			text-decoration: underline;
			text-underline-offset: 2px;

			&:hover,
			&:focus-visible {
				opacity: 0.8;
				outline: none;
			}
		}

		&__breadcrumb-current {
			font-weight: var(--origam-chart__breadcrumb-current---font-weight, 600);
			color: var(--origam-chart__breadcrumb-current---color, inherit);
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

			&--zoomable {
				cursor: crosshair;
			}
		}

		:deep(.origam-chart__grid-line) {
			stroke: var(--origam-chart__grid---color, var(--origam-color-border-subtle, #e5e7eb));
			stroke-width: var(--origam-chart__grid---stroke-width, 1);
		}

		:deep(.origam-chart__axis-line) {
			stroke: var(--origam-chart__axis---color, var(--origam-color-border-default, #d1d5db));
			stroke-width: 1;
		}

		:deep(.origam-chart__axis-label) {
			fill: var(--origam-chart__axis-label---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart__axis-label---font-size, 0.75rem);
		}

		.origam-chart__path {
			fill: none;
			stroke-width: var(--origam-chart__path---stroke-width, 2);
			stroke-linejoin: round;
			stroke-linecap: round;
		}

		.origam-chart__svg--animated .origam-chart__path--line,
		.origam-chart__svg--animated .origam-chart__path--area,
		.origam-chart__svg--animated .origam-chart__path--spline,
		.origam-chart__svg--animated .origam-chart__path--stepped-line {
			stroke-dasharray: var(--origam-chart-path---length, 1000);
			stroke-dashoffset: var(--origam-chart-path---length, 1000);
			animation: origam-chart-cartesian-draw var(--origam-chart---animation-duration, 600ms) ease-out forwards;
		}

		.origam-chart__svg--animated .origam-chart__bar {
			transform-origin: center bottom;
			animation: origam-chart-cartesian-grow var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__svg--animated .origam-chart__point {
			animation: origam-chart-cartesian-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__bar {
			rx: var(--origam-chart__bar---border-radius, 2);
			cursor: pointer;
			transition: opacity 150ms ease;

			&:hover,
			&:focus-visible {
				opacity: 0.85;
				outline: none;
			}
		}

		.origam-chart__point {
			cursor: pointer;
			transition: r 120ms ease;
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

		.origam-chart__plot-band-label {
			font-size: var(--origam-chart__plot-band-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart__plot-band-label---font-weight, 600);
			pointer-events: none;
		}

		.origam-chart__plot-line {
			pointer-events: none;
			fill: none;
		}

		.origam-chart__plot-line-label {
			font-size: var(--origam-chart__plot-line-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart__plot-line-label---font-weight, 600);
			pointer-events: none;
		}

		.origam-chart__annotation-line,
		.origam-chart__annotation-leader,
		.origam-chart__annotation-bracket {
			fill: none;
			pointer-events: none;
		}

		.origam-chart__annotation-arrowhead {
			pointer-events: none;
		}

		.origam-chart__annotation-circle {
			fill: none;
			pointer-events: none;
		}

		.origam-chart__annotation-callout {
			pointer-events: none;
		}

		.origam-chart__annotation-callout-text {
			fill: var(--origam-chart__annotation-callout---text-color, #ffffff);
			font-size: var(--origam-chart__annotation-callout---font-size, 0.6875rem);
			font-weight: var(--origam-chart__annotation-callout---font-weight, 600);
			pointer-events: none;
		}

		.origam-chart__annotation-text {
			font-size: var(--origam-chart__annotation---font-size, 0.6875rem);
			font-weight: var(--origam-chart__annotation---font-weight, 600);
			pointer-events: none;
		}

		&--no-animation .origam-chart__path,
		&--no-animation .origam-chart__bar,
		&--no-animation .origam-chart__point {
			animation: none;
			stroke-dashoffset: 0;
		}

	}

	@keyframes origam-chart-cartesian-draw {
		to { stroke-dashoffset: 0; }
	}

	@keyframes origam-chart-cartesian-grow {
		from { transform: scaleY(0.01); opacity: 0; }
		to { transform: scaleY(1); opacity: 1; }
	}

	@keyframes origam-chart-cartesian-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-cartesian .origam-chart__svg--animated .origam-chart__path,
		.origam-chart-cartesian .origam-chart__svg--animated .origam-chart__bar,
		.origam-chart-cartesian .origam-chart__svg--animated .origam-chart__point {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
</style>
