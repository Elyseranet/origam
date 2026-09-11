<template>
	<div
			class="origam-chart-sankey"
			:class="rootClasses"
			:style="[rootStyles, dimensionStyles, marginStyles, paddingStyles, backgroundColorStyles, elevationStyles, roundedStyles, headerTypographyStyles]"
			role="figure"
			:aria-label="ariaLabel"
			data-cy="origam-chart-sankey"
	>
		<div
				v-if="hasTitleBlock"
				class="origam-chart-sankey__header"
				data-cy="origam-chart-sankey-header"
		>
			<slot name="title">
				<div
						v-if="title"
						class="origam-chart-sankey__title"
				>
					{{ title }}
				</div>
				<div
						v-if="subtitle"
						class="origam-chart-sankey__subtitle"
				>
					{{ subtitle }}
				</div>
			</slot>
		</div>

		<div
				class="origam-chart-sankey__body"
				:class="bodyClasses"
				data-cy="origam-chart-sankey-body"
		>
			<svg
					ref="svgRef"
					class="origam-chart-sankey__svg origam-chart__svg"
					:class="svgClasses"
					:viewBox="`0 0 ${ SVG_WIDTH } ${ SVG_HEIGHT }`"
					role="img"
					:aria-label="svgAriaLabel"
					preserveAspectRatio="xMidYMid meet"
					data-cy="origam-chart-sankey-svg"
					@mousemove="onSvgMouseMove"
					@mouseleave="onSvgMouseLeave"
			>
				<title>{{ svgTitle }}</title>
				<desc>{{ svgDesc }}</desc>

				<g
						class="origam-chart__series"
						data-cy="origam-chart-sankey-series"
				>
					<path
							v-for="link in layoutLinks"
							:key="`link-${ link.index }`"
							class="origam-chart__sankey-link"
							:class="{ 'origam-chart__sankey-link--active': hoveredLinkIndex === link.index }"
							:d="link.d"
							:style="{
								fill: link.color,
								fillOpacity: hoveredLinkIndex === link.index ? Math.min(linkOpacity + 0.2, 1) : linkOpacity,
								stroke: 'none'
							}"
							:data-cy="`origam-chart-sankey-link-${ link.index }`"
							tabindex="0"
							role="button"
							:aria-label="`${ link.from } to ${ link.to }: ${ link.formatted }`"
							@click="onLinkActivate(link, $event)"
							@keydown.enter.prevent="onLinkActivate(link, $event)"
							@keydown.space.prevent="onLinkActivate(link, $event)"
							@mouseenter="onLinkEnter(link)"
							@mouseleave="onHoverLeave"
					/>

					<rect
							v-for="node in layoutNodes"
							:key="`node-${ node.name }`"
							class="origam-chart__sankey-node"
							:class="{ 'origam-chart__sankey-node--active': hoveredNodeName === node.name }"
							:x="node.x"
							:y="node.y"
							:width="nodeWidth"
							:height="node.height"
							rx="2"
							ry="2"
							:style="{ fill: node.color }"
							:data-cy="`origam-chart-sankey-node-${ node.name }`"
							tabindex="0"
							role="button"
							:aria-label="`${ node.name }: ${ node.formatted }`"
							@click="onNodeActivate(node, $event)"
							@keydown.enter.prevent="onNodeActivate(node, $event)"
							@keydown.space.prevent="onNodeActivate(node, $event)"
							@mouseenter="onNodeEnter(node)"
							@mouseleave="onHoverLeave"
					/>

					<template v-if="showLabel">
						<text
								v-for="node in layoutNodes"
								:key="`label-${ node.name }`"
								class="origam-chart__sankey-label"
								:x="nodeLabelX(node)"
								:y="node.y + node.height / 2"
								:text-anchor="nodeLabelAnchor(node)"
								dominant-baseline="middle"
								:data-cy="`origam-chart-sankey-label-${ node.name }`"
						>
							{{ node.name }}
						</text>
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
					class="origam-chart-sankey__empty origam-chart__empty"
					data-cy="origam-chart-sankey-empty"
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
		IChartSankeyEmits,
		IChartSankeyLink,
		IChartSankeyNode,
		IChartSankeyProps,
		IChartSeries
	} from '../../interfaces'

	import {
		useChartHeaderTypography,
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
	 * Sankey diagram family. Visualises flows between categories:
	 * energy budgets, revenue funnels, web-traffic paths.
	 *
	 * - Nodes are inferred from unique `from` / `to` strings.
	 * - Columns are assigned via topological sort (Kahn's algorithm).
	 * - Flows are rendered as cubic Bezier ribbons.
	 *
	 * `withDefaults` literals only, per CLAUDE.md.
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartSankey'
	})

	const props = withDefaults(defineProps<IChartSankeyProps>(), {
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
		nodeWidth: 16,
		nodePadding: 8,
		linkOpacity: 0.4,
		showLabel: true,
		xAxisFormat: undefined,
		yAxisFormat: undefined
	})

	const emit = defineEmits<IChartSankeyEmits>()

	const { dimensionStyles } = useDimension(props)
	const { backgroundColorClasses, backgroundColorStyles } = useBackgroundColor(props, 'bgColor')
	const { elevationClasses, elevationStyles } = useElevation(props)
	const { marginStyles } = useMargin(props)
	const { paddingStyles } = usePadding(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { headerTypographyStyles } = useChartHeaderTypography(props)

	/*********************************************************
	 * Static SVG box — always paints into 600 × 400 coordinate
	 * space; CSS scales it.
	 ********************************************************/
	const SVG_WIDTH = 600
	const SVG_HEIGHT = 400
	const PADDING = { top: 20, right: 100, bottom: 20, left: 100 }

	/*********************************************************
	 * Default colour palette — mirrors the pyramid family
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

	/*********************************************************
	 * Sankey layout engine
	 *
	 * Step 1 — parse data into node set + link set
	 * Step 2 — topological sort (Kahn) to assign column depths
	 * Step 3 — compute node values (max of in/out sums)
	 * Step 4 — vertical layout per column (proportional height)
	 * Step 5 — generate link paths (cubic Bezier)
	 ********************************************************/
	const formatValue = (v: number): string => {
		if (props.yAxisFormat) return props.yAxisFormat(v)
		if (props.xAxisFormat) return String(props.xAxisFormat(v))
		return String(v)
	}

	const colorForColumn = (columnIndex: number): string => {
		const scheme = props.colorScheme?.length ? props.colorScheme : DEFAULT_PALETTE
		return resolveColor(scheme[columnIndex % scheme.length])
	}

	/*
	 * Kahn's topological sort — assigns each node the maximum
	 * column depth reachable from any source node.
	 * Returns an empty map on cycle detection (logs a warning).
	 */
	const topoColumns = (
		nodeNames: Array<string>,
		edges: Array<{ from: string, to: string }>
	): Map<string, number> => {
		const inDegree = new Map<string, number>()
		const adjacency = new Map<string, Array<string>>()

		for (const name of nodeNames) {
			inDegree.set(name, 0)
			adjacency.set(name, [])
		}

		for (const { from, to } of edges) {
			adjacency.get(from)?.push(to)
			inDegree.set(to, (inDegree.get(to) ?? 0) + 1)
		}

		const columns = new Map<string, number>()
		const queue: Array<string> = []

		for (const name of nodeNames) {
			if (inDegree.get(name) === 0) {
				queue.push(name)
				columns.set(name, 0)
			}
		}

		let processed = 0

		while (queue.length > 0) {
			const current = queue.shift()!
			processed++

			for (const neighbour of adjacency.get(current) ?? []) {
				const nextCol = (columns.get(current) ?? 0) + 1
				if (!columns.has(neighbour) || (columns.get(neighbour) ?? 0) < nextCol) {
					columns.set(neighbour, nextCol)
				}

				inDegree.set(neighbour, (inDegree.get(neighbour) ?? 1) - 1)
				if (inDegree.get(neighbour) === 0) {
					queue.push(neighbour)
				}
			}
		}

		if (processed < nodeNames.length) {
			console.warn('[origam] OrigamChartSankey: cycle detected in flow data — diagram may be incomplete.')
		}

		return columns
	}

	const layoutNodes = computed<Array<IChartSankeyNode>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []

		const data = series.data as unknown as Array<{ from: string, to: string, value: number, color?: TIntent | string }>

		const nodeSet = new Set<string>()
		for (const d of data) {
			nodeSet.add(d.from)
			nodeSet.add(d.to)
		}
		const nodeNames = Array.from(nodeSet)

		const edges = data.map(({ from, to }) => ({ from, to }))
		const columns = topoColumns(nodeNames, edges)

		const totalColumns = Math.max(...Array.from(columns.values())) + 1

		const incomingSum = new Map<string, number>()
		const outgoingSum = new Map<string, number>()
		for (const name of nodeNames) {
			incomingSum.set(name, 0)
			outgoingSum.set(name, 0)
		}
		for (const d of data) {
			outgoingSum.set(d.from, (outgoingSum.get(d.from) ?? 0) + d.value)
			incomingSum.set(d.to, (incomingSum.get(d.to) ?? 0) + d.value)
		}

		const nodeValues = new Map<string, number>()
		for (const name of nodeNames) {
			nodeValues.set(name, Math.max(incomingSum.get(name) ?? 0, outgoingSum.get(name) ?? 0))
		}

		const plotLeft = PADDING.left
		const plotRight = SVG_WIDTH - PADDING.right
		const plotTop = PADDING.top
		const plotBottom = SVG_HEIGHT - PADDING.bottom
		const plotWidth = plotRight - plotLeft
		const plotHeight = plotBottom - plotTop

		const colXStep = totalColumns > 1 ? (plotWidth - props.nodeWidth) / (totalColumns - 1) : 0

		const byColumn = new Map<number, Array<string>>()
		for (const [name, col] of columns.entries()) {
			if (!byColumn.has(col)) byColumn.set(col, [])
			byColumn.get(col)!.push(name)
		}

		/*
		 * Barycentric node ordering — sort each column so each node
		 * sits near the average position of its neighbours. Two
		 * sweeps (left-to-right then right-to-left, applied twice)
		 * are enough to minimise crossings on the typical 3-5
		 * column funnel without paying for a full LP solver.
		 */
		const orderIndex = new Map<string, number>()
		const sortedColumns = Array.from(byColumn.keys()).sort((a, b) => a - b)
		for (const col of sortedColumns) {
			const names = byColumn.get(col)!
			names.forEach((n, i) => orderIndex.set(n, i))
		}

		const predecessors = new Map<string, Array<string>>()
		const successors = new Map<string, Array<string>>()
		for (const name of nodeNames) {
			predecessors.set(name, [])
			successors.set(name, [])
		}
		for (const { from, to } of edges) {
			successors.get(from)!.push(to)
			predecessors.get(to)!.push(from)
		}

		const barycenter = (neighbours: Array<string>): number => {
			if (!neighbours.length) return Number.POSITIVE_INFINITY
			let sum = 0
			let count = 0
			for (const n of neighbours) {
				const idx = orderIndex.get(n)
				if (idx !== undefined) { sum += idx; count++ }
			}
			return count ? sum / count : Number.POSITIVE_INFINITY
		}

		const sweep = (direction: 'down' | 'up') => {
			const cols = direction === 'down' ? sortedColumns : [...sortedColumns].reverse()
			for (const col of cols) {
				const names = byColumn.get(col)!
				if (names.length < 2) continue
				const neighbours = direction === 'down' ? predecessors : successors
				names.sort((a, b) => barycenter(neighbours.get(a)!) - barycenter(neighbours.get(b)!))
				names.forEach((n, i) => orderIndex.set(n, i))
			}
		}

		for (let pass = 0; pass < 2; pass++) {
			sweep('down')
			sweep('up')
		}

		const nodes: Array<IChartSankeyNode> = []

		for (const [col, names] of byColumn.entries()) {
			const colTotal = names.reduce((sum, n) => sum + (nodeValues.get(n) ?? 0), 0)
			const totalPadding = props.nodePadding * (names.length - 1)
			const availableHeight = Math.max(plotHeight - totalPadding, 1)

			let currentY = plotTop
			const xPos = plotLeft + col * colXStep

			for (const name of names) {
				const val = nodeValues.get(name) ?? 0
				const nodeH = colTotal > 0 ? (val / colTotal) * availableHeight : availableHeight / names.length
				const colIndex = col

				nodes.push({
					name,
					column: colIndex,
					value: val,
					formatted: formatValue(val),
					color: colorForColumn(colIndex),
					x: xPos,
					y: currentY,
					height: Math.max(nodeH, 2),
					outgoingOffset: 0,
					incomingOffset: 0
				})

				currentY += nodeH + props.nodePadding
			}
		}

		return nodes
	})

	const layoutLinks = computed<Array<IChartSankeyLink>>(() => {
		const series = props.series?.[0]
		if (!series?.data?.length) return []

		const data = series.data as unknown as Array<{ from: string, to: string, value: number, color?: TIntent | string }>

		if (layoutNodes.value.length === 0) return []

		const nodeMap = new Map<string, IChartSankeyNode>()
		for (const node of layoutNodes.value) {
			nodeMap.set(node.name, node)
		}

		const incomingSum = new Map<string, number>()
		const outgoingSum = new Map<string, number>()
		for (const name of nodeMap.keys()) {
			incomingSum.set(name, 0)
			outgoingSum.set(name, 0)
		}
		for (const d of data) {
			outgoingSum.set(d.from, (outgoingSum.get(d.from) ?? 0) + d.value)
			incomingSum.set(d.to, (incomingSum.get(d.to) ?? 0) + d.value)
		}

		/*
		 * Pre-compute per-link source / target band heights and
		 * sort the links so ribbons leave each source in target-Y
		 * order and arrive at each target in source-Y order. Without
		 * this sort, ribbons cross themselves on the same node and
		 * produce the swirl-from-hell visual.
		 */
		type TLinkSpec = {
			index: number
			from: string
			to: string
			value: number
			color: string
			srcBandH: number
			tgtBandH: number
			srcY: number
			tgtY: number
		}

		const specs: Array<TLinkSpec> = []
		for (let i = 0; i < data.length; i++) {
			const d = data[i]
			const sourceNode = nodeMap.get(d.from)
			const targetNode = nodeMap.get(d.to)
			if (!sourceNode || !targetNode) continue

			const srcOutTotal = outgoingSum.get(d.from) ?? 1
			const tgtInTotal = incomingSum.get(d.to) ?? 1
			const srcBandH = srcOutTotal > 0 ? (d.value / srcOutTotal) * sourceNode.height : 0
			const tgtBandH = tgtInTotal > 0 ? (d.value / tgtInTotal) * targetNode.height : 0

			const linkColor = d.color
				? resolveColor(d.color)
				: (sourceNode.color ?? 'currentColor')

			specs.push({
				index: i,
				from: d.from,
				to: d.to,
				value: d.value,
				color: linkColor,
				srcBandH,
				tgtBandH,
				srcY: sourceNode.y,
				tgtY: targetNode.y
			})
		}

		/*
		 * Assign source-side Y offsets: for each source node, sort
		 * its outgoing links by target Y ascending so the topmost
		 * link leaves the node from the top of its outgoing band.
		 * We store the band TOP (not its centre) — the ribbon is
		 * drawn as a filled path with explicit top + bottom edges,
		 * so we need the exact vertical extent.
		 */
		const srcOffsetMap = new Map<number, { yTop: number, srcBandH: number }>()
		const bySource = new Map<string, Array<TLinkSpec>>()
		for (const s of specs) {
			if (!bySource.has(s.from)) bySource.set(s.from, [])
			bySource.get(s.from)!.push(s)
		}
		for (const [from, group] of bySource.entries()) {
			group.sort((a, b) => a.tgtY - b.tgtY)
			const source = nodeMap.get(from)!
			let acc = source.y
			for (const link of group) {
				srcOffsetMap.set(link.index, { yTop: acc, srcBandH: link.srcBandH })
				acc += link.srcBandH
			}
		}

		/*
		 * Same on the receiving side. Incoming bands stack from
		 * the target's top edge, sorted by source Y so the topmost
		 * band on the target came from the topmost source.
		 */
		const tgtOffsetMap = new Map<number, { yTop: number, tgtBandH: number }>()
		const byTarget = new Map<string, Array<TLinkSpec>>()
		for (const s of specs) {
			if (!byTarget.has(s.to)) byTarget.set(s.to, [])
			byTarget.get(s.to)!.push(s)
		}
		for (const [to, group] of byTarget.entries()) {
			group.sort((a, b) => a.srcY - b.srcY)
			const target = nodeMap.get(to)!
			let acc = target.y
			for (const link of group) {
				tgtOffsetMap.set(link.index, { yTop: acc, tgtBandH: link.tgtBandH })
				acc += link.tgtBandH
			}
		}

		/*
		 * Filled ribbon path — two Bezier curves (top + bottom)
		 * joined by short vertical segments at each node face.
		 * Each curve uses control points midway between source
		 * and target so the band hugs both ends. Drawing the
		 * ribbon as a fill instead of a stroke means the band's
		 * vertical extent matches the source / target band exactly
		 * — no spillover above / below the node bars.
		 */
		const links: Array<IChartSankeyLink> = []
		for (const s of specs) {
			const srcOff = srcOffsetMap.get(s.index)
			const tgtOff = tgtOffsetMap.get(s.index)
			if (!srcOff || !tgtOff) continue
			const sourceNode = nodeMap.get(s.from)!
			const targetNode = nodeMap.get(s.to)!

			const x0 = sourceNode.x + props.nodeWidth
			const x1 = targetNode.x

			const y0Top = srcOff.yTop
			const y0Bot = srcOff.yTop + srcOff.srcBandH
			const y1Top = tgtOff.yTop
			const y1Bot = tgtOff.yTop + tgtOff.tgtBandH

			const cp = (x1 - x0) * 0.5

			const pathD = [
				`M ${ x0 },${ y0Top }`,
				`C ${ x0 + cp },${ y0Top } ${ x1 - cp },${ y1Top } ${ x1 },${ y1Top }`,
				`L ${ x1 },${ y1Bot }`,
				`C ${ x1 - cp },${ y1Bot } ${ x0 + cp },${ y0Bot } ${ x0 },${ y0Bot }`,
				'Z'
			].join(' ')

			links.push({
				index: s.index,
				from: s.from,
				to: s.to,
				value: s.value,
				formatted: formatValue(s.value),
				d: pathD,
				color: s.color,
				strokeWidth: Math.max((s.srcBandH + s.tgtBandH) / 2, 1)
			})
		}

		return links
	})

	/*********************************************************
	 * Legend items — one per node (source nodes)
	 ********************************************************/
	const legendItems = computed<Array<IChartLegendItem>>(() => {
		const series = props.series?.[0]
		if (!series) return []
		return layoutNodes.value.map((node, idx) => ({
			series: {
				...series,
				name: node.name,
				data: [node.value],
				visible: true
			} as IChartSeries,
			index: idx,
			color: node.color,
			visible: true
		}))
	})

	/*********************************************************
	 * Node label positioning
	 ********************************************************/
	const numColumns = computed(() => {
		if (!layoutNodes.value.length) return 1
		return Math.max(...layoutNodes.value.map(n => n.column)) + 1
	})

	const nodeLabelX = (node: IChartSankeyNode): number => {
		if (node.column === 0) return node.x - 6
		if (node.column === numColumns.value - 1) return node.x + props.nodeWidth + 6
		return node.x + props.nodeWidth + 6
	}

	const nodeLabelAnchor = (node: IChartSankeyNode): string => {
		if (node.column === 0) return 'end'
		return 'start'
	}

	/*********************************************************
	 * Hover / tooltip
	 ********************************************************/
	const svgRef = ref<SVGSVGElement | null>(null)
	const mousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
	const hoveredNodeName = ref<string | null>(null)
	const hoveredLinkIndex = ref<number | null>(null)

	const hoveredPoint = computed<IChartPoint | null>(() => {
		if (hoveredNodeName.value !== null) {
			const node = layoutNodes.value.find(n => n.name === hoveredNodeName.value)
			if (!node || !props.series?.[0]) return null
			return {
				seriesIndex: 0,
				seriesName: props.series[0].name,
				dataIndex: 0,
				x: node.name,
				y: node.value,
				color: node.color
			}
		}
		if (hoveredLinkIndex.value !== null) {
			const link = layoutLinks.value.find(l => l.index === hoveredLinkIndex.value)
			if (!link || !props.series?.[0]) return null
			return {
				seriesIndex: 0,
				seriesName: `${ link.from } → ${ link.to }`,
				dataIndex: link.index,
				x: `${ link.from } → ${ link.to }`,
				y: link.value,
				color: link.color
			}
		}
		return null
	})

	const hoveredSeries = computed<IChartSeries | null>(() => {
		if ((hoveredNodeName.value !== null || hoveredLinkIndex.value !== null) && props.series?.[0]) {
			return props.series[0]
		}
		return null
	})

	const hoveredCategory = computed<string | number>(() => {
		if (hoveredNodeName.value !== null) return hoveredNodeName.value
		if (hoveredLinkIndex.value !== null) {
			const link = layoutLinks.value.find(l => l.index === hoveredLinkIndex.value)
			return link ? `${ link.from } → ${ link.to }` : ''
		}
		return ''
	})

	const showEmpty = computed(() => {
		if (!props.series?.length) return true
		const first = props.series[0]
		if (!first?.data?.length) return true
		return layoutNodes.value.length === 0
	})

	/*********************************************************
	 * Root classes / styles
	 ********************************************************/
	const rootClasses = computed(() => [
		{
			[`origam-chart-sankey--legend-${ props.legendPosition }`]: true,
			'origam-chart-sankey--no-animation': !props.animated
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
		'origam-chart-sankey__body--with-side-legend': props.showLegend
			&& (props.legendPosition === 'left' || props.legendPosition === 'right')
	}))

	const svgClasses = computed(() => ({
		'origam-chart__svg--animated': props.animated
	}))

	const hasTitleBlock = computed(() => Boolean(props.title || props.subtitle))

	/*********************************************************
	 * ARIA
	 ********************************************************/
	const ariaLabel = computed(() => props.title ?? 'sankey chart')
	const svgAriaLabel = computed(() => props.title ?? 'sankey chart')
	const svgTitle = computed(() => props.title ?? 'sankey chart')
	const svgDesc = computed(() => {
		const n = layoutNodes.value.length
		const l = layoutLinks.value.length
		return `Sankey diagram with ${ n } ${ n === 1 ? 'node' : 'nodes' } and ${ l } ${ l === 1 ? 'link' : 'links' }.`
	})

	/*********************************************************
	 * Interaction
	 ********************************************************/
	const onNodeEnter = (node: IChartSankeyNode) => {
		hoveredNodeName.value = node.name
		hoveredLinkIndex.value = null
	}

	const onLinkEnter = (link: IChartSankeyLink) => {
		hoveredLinkIndex.value = link.index
		hoveredNodeName.value = null
	}

	const onHoverLeave = () => {
		hoveredNodeName.value = null
		hoveredLinkIndex.value = null
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
		onHoverLeave()
	}

	const onNodeActivate = (node: IChartSankeyNode, event: MouseEvent | KeyboardEvent) => {
		hoveredNodeName.value = node.name
		const point: IChartPoint = {
			seriesIndex: 0,
			seriesName: props.series?.[0]?.name ?? '',
			dataIndex: 0,
			x: node.name,
			y: node.value,
			color: node.color
		}
		emit('point-click', point, event)
	}

	const onLinkActivate = (link: IChartSankeyLink, event: MouseEvent | KeyboardEvent) => {
		hoveredLinkIndex.value = link.index
		const point: IChartPoint = {
			seriesIndex: 0,
			seriesName: `${ link.from } → ${ link.to }`,
			dataIndex: link.index,
			x: `${ link.from } → ${ link.to }`,
			y: link.value,
			color: link.color
		}
		emit('point-click', point, event)
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
	.origam-chart-sankey {
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

		.origam-chart__sankey-node {
			cursor: pointer;
			transition: filter 150ms ease;

			&:hover,
			&:focus-visible,
			&--active {
				outline: none;
				filter: brightness(1.12);
			}
		}

		.origam-chart__sankey-link {
			cursor: pointer;
			transition: stroke-opacity 150ms ease;

			&:focus-visible {
				outline: none;
			}
		}

		.origam-chart__sankey-label {
			pointer-events: none;
			font-size: var(--origam-chart__sankey-label---font-size, 0.6875rem);
			font-weight: var(--origam-chart__sankey-label---font-weight, 500);
			fill: var(--origam-chart__sankey-label---color, var(--origam-color-text-primary, currentColor));
			user-select: none;
		}

		.origam-chart__svg--animated .origam-chart__sankey-node {
			animation: origam-chart-sankey-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
		}

		.origam-chart__svg--animated .origam-chart__sankey-link {
			animation: origam-chart-sankey-fade var(--origam-chart---animation-duration, 600ms) ease-out both;
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

		&--no-animation .origam-chart__sankey-node,
		&--no-animation .origam-chart__sankey-link {
			animation: none;
		}
	}

	@keyframes origam-chart-sankey-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-chart-sankey .origam-chart__svg--animated .origam-chart__sankey-node,
		.origam-chart-sankey .origam-chart__svg--animated .origam-chart__sankey-link {
			animation: none;
		}
	}
</style>
