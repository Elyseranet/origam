<template>
	<component
			:is="tag"
			:class="itemClasses"
			:style="itemStyles"
	>
		<slot/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'

	import type { IGridItemProps, IGridLineSpec } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props + defaults for `<OrigamGridItem>`. Pure presentation —
	 * the only job is to serialise the `column` / `row` / `area`
	 * props into the matching CSS shorthand on the wrapping
	 * element. No internal state.
	 ********************************************************/
	const props = withDefaults(defineProps<IGridItemProps>(), {
		tag: 'div',
		column: undefined,
		row: undefined,
		area: undefined,
		alignSelf: undefined,
		justifySelf: undefined
	})

	/*********************************************************
	 * Line-spec serialisation
	 *
	 * @description
	 * Object syntax → CSS string (`{ start: 1, end: 5 }` becomes
	 * `'1 / 5'`, `{ start: 1, span: 4 }` becomes `'1 / span 4'`).
	 * Number / string passes through. `span` wins over `end` when
	 * both are present (more ergonomic for the common case).
	 ********************************************************/
	const serialiseLineSpec = (value: IGridLineSpec | string | number | undefined): string | undefined => {
		if (value == null) return undefined
		if (typeof value === 'number') return String(value)
		if (typeof value === 'string') return value

		const { start, end, span } = value
		const startPart = start != null ? String(start) : null
		let endPart: string | null = null
		if (span != null) endPart = `span ${span}`
		else if (end != null) endPart = String(end)

		if (startPart != null && endPart != null) return `${startPart} / ${endPart}`
		if (startPart != null) return startPart
		if (endPart != null) return endPart

		return undefined
	}

	const columnCss = computed<string | undefined>(() => serialiseLineSpec(props.column))
	const rowCss = computed<string | undefined>(() => serialiseLineSpec(props.row))

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const itemStyles = computed<StyleValue>(() => {
		const style: Record<string, string> = {}

		if (props.area) {
			style.gridArea = props.area
		} else {
			if (columnCss.value) style.gridColumn = columnCss.value
			if (rowCss.value) style.gridRow = rowCss.value
		}

		if (props.alignSelf) style.alignSelf = props.alignSelf
		if (props.justifySelf) style.justifySelf = props.justifySelf

		return [style, props.style] as StyleValue
	})

	const itemClasses = computed(() => {
		return [
			'origam-grid-item',
			props.class
		]
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		columnCss,
		rowCss
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-grid-item {
		min-width: 0;
		min-height: 0;
	}
</style>
