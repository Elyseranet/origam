<template>
	<Story
			group="components"
			title="Chart/OrigamChartTooltip"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Pick<IChartTooltipProps, 'category'> & { seriesName: string; value: number; pointColor: string; formatX: string; formatY: string }>({
					category: 'Mar',
					pointColor: COLORS[0],
					seriesName: 'Sales 2026',
					value: 22,
					formatX: 'none',
					formatY: 'none'
				})"
		>
			<template #default="{ state }">
				<div
						class="tooltip-host"
						data-cy="tooltip-design-host"
				>
					<origam-chart-tooltip
							:point="pointFor(state.value, state.pointColor)"
							:series="seriesFor(state.seriesName)"
							:category="state.category"
							:x="24"
							:y="24"
							:x-axis-format="FORMATTERS_X[state.formatX]"
							:y-axis-format="FORMATTERS_Y[state.formatY]"
							data-cy="tooltip-design"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.seriesName" title="Series Name"/>
					<HstText   v-model="state.category"   title="Category (X)"/>
					<HstNumber v-model="state.value"      title="Value (Y)" :min="0" :max="1000" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Colour">
					<HstSelect v-model="state.pointColor" title="Swatch (point.color)" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Formatters">
					<HstSelect v-model="state.formatX" title="xAxisFormat" :options="FORMAT_X_OPTIONS"/>
					<HstSelect v-model="state.formatY" title="yAxisFormat" :options="FORMAT_Y_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Pick<IChartTooltipProps, 'x' | 'y'> & { hasPoint: boolean; hasSeries: boolean }>({
					hasPoint: true,
					hasSeries: true,
					x: 40,
					y: 40
				})"
		>
			<template #default="{ state }">
				<div
						class="tooltip-host tooltip-host--tall"
						data-cy="tooltip-functional-host"
				>
					<p class="hint">
						The card renders only when <code>point</code> AND <code>series</code> are
						both non-null. Its inline style is <code>left: x + 12px</code> /
						<code>top: y + 12px</code> — no viewport-edge flip.
					</p>
					<origam-chart-tooltip
							:point="state.hasPoint ? POINT_DEFAULT : null"
							:series="state.hasSeries ? SERIES_DEFAULT : null"
							category="Mar"
							:x="state.x"
							:y="state.y"
							data-cy="tooltip-functional"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.hasPoint"  title="point is set"/>
					<HstCheckbox v-model="state.hasSeries" title="series is set"/>
				</StoryGroup>
				<StoryGroup title="Position">
					<HstNumber v-model="state.x" title="x (px)" :min="0" :max="420" :step="10"/>
					<HstNumber v-model="state.y" title="y (px)" :min="0" :max="220" :step="10"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div
					class="tooltip-host"
					data-cy="tooltip-slot-default-host"
			>
				<p class="hint">
					The default slot replaces the WHOLE body — title row, swatch and value row
					all disappear.
				</p>
				<origam-chart-tooltip
						:point="POINT_DEFAULT"
						:series="SERIES_DEFAULT"
						category="Mar"
						:x="24"
						:y="48"
						data-cy="tooltip-slot-default"
				>
					<template #default="{ point, series, category }">
						<div class="custom-body">
							<strong class="custom-body__name">{{ series.name }}</strong>
							<span class="custom-body__cat">{{ category }}</span>
							<span
									class="custom-body__value"
									:style="{ color: point.color }"
							>{{ point.y }} k€</span>
						</div>
					</template>
				</origam-chart-tooltip>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Pick<IChartTooltipProps, 'category' | 'x' | 'y'> & { seriesName: string; value: number; pointColor: string; hasPoint: boolean; hasSeries: boolean; formatX: string; formatY: string }>({
					seriesName: 'Sales 2026',
					category: 'Mar',
					value: 22,
					pointColor: COLORS[0],
					hasPoint: true,
					hasSeries: true,
					x: 40,
					y: 40,
					formatX: 'none',
					formatY: 'none'
				})"
		>
			<template #default="{ state }">
				<div
						class="tooltip-host tooltip-host--tall"
						data-cy="tooltip-playground-host"
				>
					<origam-chart-tooltip
							:point="state.hasPoint ? pointFor(state.value, state.pointColor) : null"
							:series="state.hasSeries ? seriesFor(state.seriesName) : null"
							:category="state.category"
							:x="state.x"
							:y="state.y"
							:x-axis-format="FORMATTERS_X[state.formatX]"
							:y-axis-format="FORMATTERS_Y[state.formatY]"
							data-cy="tooltip-playground"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.seriesName" title="Series Name"/>
					<HstText   v-model="state.category"   title="Category (X)"/>
					<HstNumber v-model="state.value"      title="Value (Y)" :min="0" :max="1000" :step="1"/>
					<HstSelect v-model="state.pointColor" title="Swatch (point.color)" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.hasPoint"  title="point is set"/>
					<HstCheckbox v-model="state.hasSeries" title="series is set"/>
					<HstNumber   v-model="state.x"         title="x (px)" :min="0" :max="420" :step="10"/>
					<HstNumber   v-model="state.y"         title="y (px)" :min="0" :max="220" :step="10"/>
					<HstSelect   v-model="state.formatX"   title="xAxisFormat" :options="FORMAT_X_OPTIONS"/>
					<HstSelect   v-model="state.formatY"   title="yAxisFormat" :options="FORMAT_Y_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamChartTooltip } from '@origam/components'
	import type {
		IChartPoint,
		IChartSeries,
		IChartTooltipProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

	const COLOR_OPTIONS = COLORS.map(value => ({ label: value, value }))

	const FORMATTERS_X: Record<string, ((value: string | number) => string) | undefined> = {
		none: undefined,
		upper: (value: string | number) => String(value).toUpperCase(),
		bracketed: (value: string | number) => `[${ value }]`
	}

	const FORMATTERS_Y: Record<string, ((value: number) => string) | undefined> = {
		none: undefined,
		currency: (value: number) => `$${ value }k`,
		percent: (value: number) => `${ value }%`
	}

	const FORMAT_X_OPTIONS = [
		{ label: 'none — String(value)', value: 'none' },
		{ label: 'upper-case', value: 'upper' },
		{ label: 'bracketed', value: 'bracketed' }
	]

	const FORMAT_Y_OPTIONS = [
		{ label: 'none — String(value)', value: 'none' },
		{ label: 'currency ($k)', value: 'currency' },
		{ label: 'percent (%)', value: 'percent' }
	]

	const seriesFor = (name: string): IChartSeries => ({ name, data: [12, 18, 22, 19, 25] })

	const pointFor = (y: number, color: string): IChartPoint => ({
		seriesIndex: 0,
		seriesName: 'Sales 2026',
		dataIndex: 2,
		x: 'Mar',
		y,
		color
	})

	const SERIES_DEFAULT = seriesFor('Sales 2026')
	const POINT_DEFAULT = pointFor(22, COLORS[0])
</script>

<style
		scoped
		lang="scss"
>
	.tooltip-host {
		position: relative;
		min-height: 160px;
		padding: 16px;
		border: 1px solid var(--origam-color__border---subtle, #e5e7eb);
		border-radius: 8px;
		background-color: var(--origam-color__surface---default, #ffffff);
		overflow: hidden;
	}

	.tooltip-host--tall {
		min-height: 280px;
	}

	.hint {
		margin: 0 0 8px;
		font-size: 0.8125rem;
		color: var(--origam-color__text---secondary, #6b7280);
	}

	.custom-body {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.custom-body__cat {
		opacity: 0.7;
	}

	.custom-body__value {
		font-weight: 700;
	}

	:deep(.origam-chart__tooltip) {
		position: absolute;
		pointer-events: none;
		z-index: 10;
		font-size: 0.8125rem;
		background-color: var(--origam-chart__tooltip---background-color, #1f2937);
		color: var(--origam-chart__tooltip---color, #ffffff);
		padding: var(--origam-chart__tooltip---padding, 8px 12px);
		border-radius: var(--origam-chart__tooltip---border-radius, 6px);
		box-shadow: var(--origam-chart__tooltip---shadow, 0 4px 16px rgb(0 0 0 / 15%));
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
</style>

<docs
		lang="md"
		src="@docs/components/Chart/OrigamChartTooltip.md"
/>
