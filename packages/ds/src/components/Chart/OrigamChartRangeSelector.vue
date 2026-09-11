<template>
	<nav
			class="origam-chart-range-selector"
			aria-label="Chart range selector"
			data-cy="origam-chart-range-selector"
	>
		<ul
				class="origam-chart-range-selector__list"
		>
			<li
					v-for="(btn, i) in buttons"
					:key="btn.label"
					class="origam-chart-range-selector__item"
			>
				<button
						class="origam-chart-range-selector__btn"
						:class="{ 'origam-chart-range-selector__btn--active': i === activeIndex }"
						type="button"
						:aria-pressed="i === activeIndex"
						:data-cy="`origam-chart-range-selector-btn-${ btn.label }`"
						@click="onButtonClick(i)"
				>{{ btn.label }}</button>
			</li>
		</ul>
	</nav>
</template>

<script
		lang="ts"
		setup
>
	import type { IChartRangeSelectorButton } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Band-style preset range-selector toolbar rendered above the
	 * cartesian chart. Each button commits a zoom window expressed
	 * as `[start, end]` category indices and fires the `select`
	 * emit so the parent can react (e.g. emit `zoom`).
	 ********************************************************/
	defineOptions({
		name: 'OrigamChartRangeSelector'
	})

	const props = withDefaults(defineProps<{
		buttons: Array<IChartRangeSelectorButton>
		activeIndex?: number
		dataLength?: number
	}>(), {
		activeIndex: -1,
		dataLength: 0
	})

	const emit = defineEmits<{
		(e: 'select', index: number, start: number, end: number): void
	}>()

	const onButtonClick = (index: number): void => {
		const btn = props.buttons[index]
		if (!btn) return
		const len = props.dataLength
		if (len <= 0) return

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

		emit('select', index, start, end)
	}
</script>

<style
		lang="scss"
		scoped
>
	.origam-chart-range-selector {
		$this: &;

		display: flex;
		align-items: center;
		padding-inline: var(--origam-chart-range-selector---padding-inline, 4px);

		&__list {
			display: flex;
			align-items: center;
			gap: var(--origam-chart-range-selector__list---gap, 2px);
			list-style: none;
			margin: 0;
			padding: 0;
		}

		&__item {
			display: contents;
		}

		&__btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: var(--origam-chart-range-selector__btn---padding, 3px 8px);
			border: 1px solid var(--origam-chart-range-selector__btn---border-color, var(--origam-color-border-default, #d1d5db));
			border-radius: var(--origam-chart-range-selector__btn---border-radius, 4px);
			background-color: var(--origam-chart-range-selector__btn---background-color, transparent);
			color: var(--origam-chart-range-selector__btn---color, var(--origam-color-text-secondary, #6b7280));
			font-size: var(--origam-chart-range-selector__btn---font-size, 0.75rem);
			font-weight: 500;
			cursor: pointer;
			white-space: nowrap;
			transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
			user-select: none;

			&:hover,
			&:focus-visible {
				background-color: var(--origam-chart-range-selector__btn--hover---background-color, rgba(0, 0, 0, 0.06));
				color: var(--origam-chart-range-selector__btn--hover---color, var(--origam-color-text-primary, #111827));
				outline: none;
			}

			&:focus-visible {
				box-shadow: 0 0 0 2px var(--origam-color-focus-ring, rgba(59, 130, 246, 0.5));
			}

			&--active {
				background-color: var(--origam-chart-range-selector__btn--active---background-color, var(--origam-color-action-primary-bg-default, #3b82f6));
				border-color: var(--origam-chart-range-selector__btn--active---border-color, transparent);
				color: var(--origam-chart-range-selector__btn--active---color, #ffffff);

				&:hover,
				&:focus-visible {
					background-color: var(--origam-chart-range-selector__btn--active--hover---background-color, var(--origam-color-action-primary-bg-hover, #2563eb));
					color: var(--origam-chart-range-selector__btn--active--hover---color, #ffffff);
				}
			}
		}
	}
</style>
