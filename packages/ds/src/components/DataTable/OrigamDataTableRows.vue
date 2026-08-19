<template>
	<template v-if="loaderConfig.isActive">
		<template v-if="loaderConfig.kind === 'skeleton'">
			<tr
					v-for="rowIndex in SKELETON_ROW_COUNT"
					:id="skeletonRowId(rowIndex)"
					:key="`skeleton-row_${rowIndex}`"
					class="origam-data-table-rows origam-data-table-rows--skeleton"
					aria-busy="true"
			>
				<td
						v-for="col in columns"
						:key="`skeleton-cell_${col.key}`"
						class="origam-data-table-rows__skeleton-cell"
				>
					<origam-skeleton variant="text" :loading="true" />
				</td>
			</tr>
		</template>
		<template v-else>
			<tr
					:id="id"
					key="loading"
					class="origam-data-table-rows origam-data-table-rows--loading"
			>
				<td :colspan="columns.length">
					<slot name="loading">
						{{ t(loadingText) }}
					</slot>
				</td>
			</tr>
		</template>
	</template>

	<template v-else-if="!(items && items.length) && !hideNoData">
		<tr
				:id="id"
				key="no-data"
				class="origam-data-table-rows origam-data-table-rows--no-data"
		>
			<td :colspan="columns.length">
				<slot name="no-data">
					{{ t(noDataText) }}
				</slot>
			</td>
		</tr>
	</template>

	<template v-else>
		<template v-for="(item, index) in items">
			<template v-if="item.type === 'group'">
				<slot
						name="group-header"
						v-bind="groupHeaderSlotProps(item, index)"
				>
					<origam-data-table-group-header-row
							:id="itemRowId(index)"
							:key="`group-header_${item.id}`"
							v-bind="groupHeaderSlotProps(item, index)"
					>
					</origam-data-table-group-header-row>
				</slot>
			</template>

			<template v-else>
				<slot
						name="item"
						v-bind="itemSlotProps(item, index)"
				>
					<origam-data-table-row
							:id="itemRowId(index)"
							:item="item"
							v-bind="{...itemSlotProps(item, index).props}"
					>
					</origam-data-table-row>
				</slot>

				<template v-if="isExpanded(item)">
					<slot
							name="expanded-row"
							v-bind="slotProps(item, index)"
					/>
				</template>
			</template>
		</template>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import OrigamDataTableGroupHeaderRow from './OrigamDataTableGroupHeaderRow.vue'
	import OrigamDataTableRow from './OrigamDataTableRow.vue'
	import OrigamSkeleton from '../Skeleton/OrigamSkeleton.vue'

	import { useDisplay } from '../../composables/Commons/display.composable'
	import { useExpanded } from '../../composables/DataTable/expand.composable'
	import { useGroupBy } from '../../composables/DataTable/group.composable'
	import { useHeaders } from '../../composables/DataTable/headers.composable'
	import { useLoader } from '../../composables/Commons/loader.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { usePagination } from '../../composables/DataTable/pagination.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSelection } from '../../composables/DataTable/select.composable'

	import type { IDataTableGroup, IDataTableGroupHeaderSlot } from '../../interfaces/DataTable/group.interface'
	import type { IDataTableItemBaseSlot, IDataTableItemSlot } from '../../interfaces/DataTable/items.interface'
	import type { IDataTableRowsProps, IDataTableRowsSlots } from '../../interfaces/DataTable/data-table-rows.interface'

	import { LOADER_KIND } from '../../enums/Commons/loader.enum'

	import { getPrefixedEventHandlers } from '../../utils/Commons/event.util'

	import { mergeProps, useAttrs } from 'vue'

	const attrs = useAttrs()

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableRowsProps>(), {
		loadingText: 'origam.data_iterator.loading_text',
		noDataText: 'origam.no_data_text'
	})

	defineSlots<IDataTableRowsSlots>()

	const {filterProps} = useProps<IDataTableRowsProps>(props)

	const {t} = useLocale()

	/** Fixed number of skeleton placeholder rows when kind='skeleton'. */
	const SKELETON_ROW_COUNT = 5

	const skeletonRowId = (index: number) => (props.id ? `${props.id}-skeleton-row-${index}` : undefined)
	const itemRowId = (index: number) => (props.id ? `${props.id}-row-${index}` : undefined)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {loaderConfig} = useLoader(props, LOADER_KIND.LINE)

	const {columns} = useHeaders()
	const {expandOnClick, toggleExpand, isExpanded} = useExpanded()
	const {isSelected, toggleSelect} = useSelection()
	const {toggleGroup, isGroupOpen} = useGroupBy()
	const {mobile} = useDisplay(props)
	const {startIndex} = usePagination()

	const slotProps = (item: any, index: number): IDataTableItemBaseSlot => {
		return {
			index,
			item: item.raw,
			internalItem: item,
			columns: columns.value,
			isExpanded,
			toggleExpand,
			isSelected,
			toggleSelect
		}
	}
	const groupHeaderSlotProps = (item: IDataTableGroup, index: number): IDataTableGroupHeaderSlot => {
		const slotPropsLocal = slotProps(item, index)

		return Object.assign({}, slotPropsLocal, {
			index,
			item,
			columns: columns.value,
			...getPrefixedEventHandlers(attrs, ':group-header', () => slotPropsLocal),
			isExpanded,
			toggleExpand,
			isSelected,
			toggleSelect,
			toggleGroup,
			isGroupOpen
		})
	}
	const itemSlotProps = (item: any, index: number): IDataTableItemSlot => {
		const slotPropsLocal = slotProps(item, index)

		return Object.assign({}, slotPropsLocal, {
			props: mergeProps(
					{
						key: `item_${item.key ?? item.index}`,
						onClick: expandOnClick.value ? () => {
							toggleExpand(item)
						} : undefined,
						index,
						item,
						cellProps: props.cellProps,
						// Forward `mobileBreakpoint` so each row's own
						// `useDisplay(props)` resolves to the SAME
						// threshold the table-level resolved. Pre-fix
						// only `mobile: mobile.value` was passed but the
						// row's interface declares `mobileBreakpoint`,
						// not `mobile` — so the row fell back to the
						// global `'lg'` (1280px), forcing mobile mode
						// on every viewport <1280px regardless of what
						// the consumer set on the DataTable.
						mobileBreakpoint: props.mobileBreakpoint,
						mobile: mobile.value,
						'aria-rowindex': startIndex.value + index + 2
					},
					getPrefixedEventHandlers(attrs, ':row', () => slotPropsLocal),
					typeof props.rowProps === 'function'
							? props.rowProps({
								item: slotPropsLocal.item,
								index: slotPropsLocal.index,
								internalItem: slotPropsLocal.internalItem
							})
							: props.rowProps
			)
		})
	}

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-data-table-rows {
		&--no-data {
			text-align: var(--origam-data-table-empty---text-align, center);
			color: var(--origam-data-table-rows--no-data---color, var(--origam-color__text---secondary));
		}

		&--loading {
			color: var(--origam-data-table-rows--loading---color, var(--origam-color__text---secondary));
		}

		&--skeleton {
			> .origam-data-table-rows__skeleton-cell {
				padding: var(--origam-data-table-rows--skeleton---cell-padding, 4px 8px);
			}
		}
	}
</style>

