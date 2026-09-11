<template>
	<origam-data-table-column-cell
			:align="column.align"
			:aria-sort="column.sortable && !disableSort ? (isSorted(column) ? (sortBy.find((s: IDataTableSortItem) => s.key === column.key)?.order === 'desc' ? 'descending' : 'ascending') : 'none') : undefined"
			:class="dataTableHeaderCellClasses"
			:colspan="column.colspan"
			:fixed="column.fixed"
			:last-fixed="column.lastFixed"
			:nowrap="column.nowrap"
			:padding="getPadding(column)"
			:rowspan="column.rowspan"
			:style="dataTableHeaderCellStyles"
			tag="th"
			v-bind="{ ...headerProps }"
			@click="handleClick"
	>
		<template #default>
			<slot
					:name="`header.${column.key}`"
					v-bind="slotProps"
			>

				<template v-if="hasColumn('data-table-select')">
					<origam-checkbox-btn
							:indeterminate="someSelected && !allSelected"
							:model-value="allSelected"
							@update:model-value="selectAll"
					/>
				</template>

				<template v-else>
					<div class="origam-data-table-header-cell__content">
						<span>{{ column.title }}</span>

						<template v-if="column.sortable && !disableSort">
							<origam-icon
									key="icon"
									:class="{'origam-data-table-header-cell__sort-icon--active': isSorted(column)}"
									:icon="getSortIcon(column)"
									class="origam-data-table-header-cell__sort-icon"
							/>
						</template>

						<template v-if="multiSort && isSorted(column)">
							<div
									key="badge"
									:style="colorStyles"
									class="origam-data-table-header-cell__sort-badge"
							>
								{{ sortedItems(column) }}
							</div>
						</template>
					</div>
				</template>
			</slot>
		</template>
	</origam-data-table-column-cell>
</template><script
		lang="ts"
		setup
>
	import { OrigamCheckboxBtn, OrigamDataTableColumnCell, OrigamIcon } from '../../components'

	import {
	useBothColor,
	useCell,
	useHeadersCell,
	useProps,
	useSelection,
	useSort,
	useStyle
} from '../../composables'

	import type { IDataTableHeaderCellProps, IDataTableSortItem, IInternalDataTableHeader } from '../../interfaces'

	import { convertToUnit } from '../../utils'

	import { computed, CSSProperties, mergeProps, toRef } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableHeaderCellProps>(), {})

	const {filterProps} = useProps<IDataTableHeaderCellProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {toggleSort, sortBy, isSorted} = useSort()
	const {someSelected, allSelected, selectAll} = useSelection()
	const {getSortIcon} = useHeadersCell(props)
	const {getPadding} = useCell()
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	const headerProps = mergeProps(props.headerProps ?? {})

	const sortedItems = (column: IInternalDataTableHeader) => {
		return sortBy.value.findIndex((x: IDataTableSortItem) => {
			return x.key === column.key! + 1
		})
	}

	const getFixedStyles = (column: IInternalDataTableHeader, y: number): CSSProperties | undefined => {
		if (!props.sticky && !column.fixed) return undefined

		return {
			position: 'sticky',
			left: column.fixed ? convertToUnit(column.fixedOffset) : undefined,
			top: props.sticky ? `calc(var(--origam-table-header-height) * ${y})` : undefined
		}
	}
	const hasColumn = (name: string) => {
		return props.column.key === name
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = () => {
		if (props.column.sortable) {
			toggleSort(props.column)
		}
	}

	const slotProps = computed(() => {
		return {
			column: props.column,
			selectAll,
			isSorted,
			toggleSort,
			sortBy: sortBy.value,
			someSelected: someSelected.value,
			allSelected: allSelected.value,
			getSortIcon
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableHeaderCellClasses = computed(() => {
		return [
			'origam-data-table-header-cell',
			{
				'origam-data-table-header-cell--sortable': props.column.sortable && !props.disableSort,
				'origam-data-table-header-cell--sorted': isSorted(props.column),
				'origam-data-table-header-cell--fixed': props.column.fixed
			},
			colorClasses.value,
			props.class
		]
	})
	const dataTableHeaderCellStyles = computed(() => {
		return [
			// `colorStyles` from `useBothColor` was only applied to the
			// sort badge pre-fix — meaning consumers passing `color` /
			// `bgColor` on the DataTable saw NO effect on the header
			// row itself (the visual surface they actually want to
			// theme). Apply at the cell level so `bg-color="primary"`
			// paints the title row, and `color="primary"` tints the
			// title text + sort indicator.
			colorStyles.value,
			{
				width: convertToUnit(props.column.width),
				minWidth: convertToUnit(props.column.minWidth),
				maxWidth: convertToUnit(props.column.maxWidth),
				...getFixedStyles(props.column, props.y)
			},
			props.style
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableHeaderCellStyles)


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
	.origam-data-table-header-cell {
		$this: &;

		align-items: center;
		color: var(--origam-data-table-header-cell---color, var(--origam-color__text---primary));

		&__sort-icon {
			opacity: var(--origam-data-table-header-cell__sort-icon---opacity, 0);
			color: var(--origam-data-table-header-cell__sort-icon---color, var(--origam-color__text---primary));

			&--active {
				color: var(--origam-data-table-header-cell__sort-icon--active---color, var(--origam-color__text---primary));
			}
		}

		&__content {
			display: flex;
			align-items: center;
			gap: var(--origam-data-table-header-cell__content---gap, 4px);
		}

		&__sort-badge {
			display: inline-flex;
			justify-content: center;
			align-items: center;
			font-size: var(--origam-data-table-header-cell__sort-badge---font-size, 0.875rem);
			padding: var(--origam-data-table-header-cell__sort-badge---padding, var(--origam-space---1, 4px));
			border-radius: var(--origam-data-table-header-cell__sort-badge---border-radius, var(--origam-radius---full, 9999px));
			background: var(--origam-data-table-header-cell__sort-badge---background, var(--origam-color__border---default));
			color: var(--origam-data-table-header-cell__sort-badge---color, var(--origam-color__text---primary));
			min-width: var(--origam-data-table-header-cell__sort-badge---min-width, 20px);
			min-height: var(--origam-data-table-header-cell__sort-badge---min-height, 20px);
			width: var(--origam-data-table-header-cell__sort-badge---width, 20px);
			height: var(--origam-data-table-header-cell__sort-badge---height, 20px)
		}

		&#{$this}--sortable {
			cursor: var(--origam-data-table-sortable---cursor, pointer);

			&:hover {
				#{$this}__sort-icon {
					opacity: var(--origam-data-table-header-cell__sort-icon---opacity-hover, 0.5);
				}
			}
		}

		&#{$this}--sorted {
			#{$this}__sort-icon {
				opacity: var(--origam-data-table-header-cell__sort-icon---opacity-active, 1);
			}
		}

		&:deep(.origam-data-table-cell--fixed) {
			z-index: 2;
		}

		&:deep(.origam-data-table-cell) {
			background: var(--origam-data-table-header-cell---background, var(--origam-color__surface---raised));
			color: var(--origam-data-table-header-cell---color, var(--origam-color__text---primary));
		}
	}
</style>

