<template>
	<component
			:is="tag"
			:class="dataTableColumnClasses"
			:scope="tag === 'th' ? 'col' : undefined"
			:style="dataTableColumnStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import {
	useDimension,
	usePadding,
	useProps,
	useStyle
} from '../../composables'

	import { ALIGN } from '../../enums'

	import type { IDataTableColumnProps } from '../../interfaces'

	import { convertToUnit } from '../../utils'

	import { computed, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableColumnProps>(), {
		align: ALIGN.START,
		tag: 'td'
	})

	const {filterProps} = useProps<IDataTableColumnProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)
	const {paddingStyles, paddingClasses} = usePadding(props)

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableColumnClasses = computed(() => {
		return [
			'origam-data-table-cell',
			`origam-data-table-cell--align-${props.align}`,
			{
				'origam-data-table-cell--fixed': props.fixed,
				'origam-data-table-cell--last-fixed': props.lastFixed,
				'origam-data-table-cell--nowrap': props.nowrap
			},
			paddingClasses.value,
			props.class
		]
	})
	const dataTableColumnStyles = computed(() => {
		return [
			paddingStyles.value,
			dimensionStyles.value,
			{
				left: convertToUnit(props.fixedOffset || null)
			},
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableColumnStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-data-table-cell {
		&--align-end {
			text-align: end;

			&:deep(.origam-data-table-header-cell__content) {
				flex-direction: row-reverse;
			}
		}

		&--align-center {
			text-align: center;

			&:deep(.origam-data-table-header-cell__content) {
				justify-content: center;
			}
		}

		&--align-start {
			text-align: start;
		}

		&--nowrap {
			text-overflow: ellipsis;
			text-wrap: nowrap;
			overflow: hidden;

			&:deep(.origam-data-table-header-cell__content) {
				display: contents;
			}
		}

		&--fixed {
			position: sticky;
			background: var(--origam-data-table-cell--fixed---background, var(--origam-color__surface---raised));
			left: 0;
			z-index: var(--origam-data-table-cell--fixed---z-index, 1)
		}

		&--last-fixed {
			border-right: var(--origam-data-table-cell--last-fixed---border-right-width, 1px) solid var(--origam-data-table-cell--last-fixed---border-right-color, var(--origam-color__border---subtle));
		}
	}
</style>

