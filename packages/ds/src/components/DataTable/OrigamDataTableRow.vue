<template>
	<tr
			:aria-selected="showSelect ? isSelected([item]) : undefined"
			:class="dataTableRowClasses"
			:style="dataTableRowStyles"
			v-bind="$attrs"
	>
		<template v-if="item">
			<template
					v-for="(column, i) in columns"
					:key="i"
			>
				<origam-data-table-column-cell
						:align="column.align"
						:class="dataTableColumnCellClasses(column.key)"
						:fixed="column.fixed"
						:fixed-offset="column.fixedOffset"
						:last-fixed="column.lastFixed"
						:max-width="!mobile ? column.maxWidth : undefined"
						:nowrap="column.nowrap"
						:padding="getPadding(column)"
						:width="!mobile ? column.width : undefined"
						v-bind="{ ...cellProps , ...columnCellProps }"
				>
					<template #default>
						<template v-if="column.key === 'data-table-select'">
							<slot
									name="item.data-table-select"
									v-bind="slotProps(i, column)"
							>
								<origam-checkbox-btn
										:disabled="!item.selectable"
										:model-value="isSelected([item])"
										@click="handleCheckBoxClick"
								/>
							</slot>
						</template>

						<template v-else-if="column.key === 'data-table-expand'">
							<slot
									name="item.data-table-expand"
									v-bind="slotProps(i, column)"
							>
								<origam-btn
										:aria-expanded="isExpanded(item)"
										:aria-label="isExpanded(item) ? t('origam.data_table_row.collapse_row', 'Collapse row') : t('origam.data_table_row.expand_row', 'Expand row')"
										:icon="isExpanded(item) ? MDI_ICONS.CHEVRON_UP : MDI_ICONS.CHEVRON_DOWN"
										:size="SIZES.SMALL"
										@click="handleBtnClick"
								/>
							</slot>
						</template>

						<template v-else>
							<template v-if="mobile">
								<div class="origam-data-table-row__column-title">
									<slot
											:name="`header.${column.key}`"
											v-bind="columnSlotProps(column)"
									>
										{{ column.title }}
									</slot>
								</div>
							</template>

							<div class="origam-data-table-row__column-value">
								<slot
										:name="`item.${column.key}`"
										v-bind="slotProps(i, column)"
								>
									{{ displayValue(i, column) }}
								</slot>
							</div>
						</template>

					</template>
				</origam-data-table-column-cell>
			</template>
		</template>
	</tr>
</template>

<script
		lang="ts"
		setup
>

	import { OrigamBtn, OrigamCheckboxBtn, OrigamDataTableColumnCell } from '../../components'

	import {
	useCell,
	useDisplay,
	useExpanded,
	useHeaders,
	useLocale,
	useProps,
	useSelection,
	useSort,
	useStyle
} from '../../composables'

	import { MDI_ICONS, SIZES } from '../../enums'

	import type { IDataTableHeaderCellColumnSlot, IDataTableItemKey, IDataTableRowProps} from '../../interfaces'

	import type { IDataTableRowEmits } from '../../interfaces/DataTable/row.interface'

	import { getCurrentInstance, getObjectValueByPath } from '../../utils'

	import { ORIGAM_DATA_TABLE_SHOW_SELECT_KEY } from '../../consts'

	import { computed, inject, ref, Ref, StyleValue, toDisplayString, withModifiers } from 'vue'

	const vm = getCurrentInstance('dataTableRow')

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = defineProps<IDataTableRowProps>()

	/*********************************************************
	 * Labels — localised through the DS i18n provider (`useLocale`).
	 * Keys live under `origam.dataTableRow.*` in the shipped locale messages.
	 ********************************************************/
	const { t } = useLocale()

	const emits = defineEmits<IDataTableRowEmits>()

	const {filterProps} = useProps<IDataTableRowProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const showSelect = inject<Ref<boolean>>(ORIGAM_DATA_TABLE_SHOW_SELECT_KEY, ref(false))

	const {displayClasses, mobile} = useDisplay(props, 'origam-data-table-row')
	const {isSelected, toggleSelect, someSelected, allSelected, selectAll} = useSelection()
	const {isExpanded, toggleExpand} = useExpanded()
	const {toggleSort, sortBy, isSorted} = useSort()
	const {columns} = useHeaders()
	const {getPadding} = useCell()

	const slotProps = (index: number, column: any): IDataTableItemKey => {
		return {
			index: index,
			item: props.item?.raw,
			internalItem: props.item,
			value: getObjectValueByPath(props.item?.columns, column.key),
			column,
			isSelected,
			toggleSelect,
			isExpanded,
			toggleExpand
		}
	}
	const columnSlotProps = (column: any): IDataTableHeaderCellColumnSlot => {
		return {
			column,
			selectAll,
			isSorted,
			toggleSort,
			sortBy: sortBy,
			someSelected: someSelected,
			allSelected: allSelected,
			getSortIcon: () => ''
		}
	}
	const cellProps = (index: number, column: any) => {
		const localSlotProp = slotProps(index, column)

		return typeof props.cellProps === 'function'
				? props.cellProps({
					index: localSlotProp.index,
					item: localSlotProp.item,
					internalItem: localSlotProp.internalItem,
					value: localSlotProp.value,
					column
				})
				: props.cellProps
	}
	const columnCellProps = (index: number, column: any) => {
		const localSlotProp = slotProps(index, column)

		return typeof column.cellProps === 'function'
				? column.cellProps({
					index: localSlotProp.index,
					item: localSlotProp.item,
					internalItem: localSlotProp.internalItem,
					value: localSlotProp.value
				})
				: column.cellProps
	}

	const displayValue = (index: number, column: any) => {
		return toDisplayString(slotProps(index, column).value)
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleCheckBoxClick = () => {
		withModifiers(() => toggleSelect(props.item), ['stop'])
		emits('select')
	}
	const handleBtnClick = () => {
		withModifiers(() => toggleExpand(props.item), ['stop'])
		emits('expand')
	}

	const dataTableColumnCellClasses = (key: string | null) => {
		return [
			'origam-data-table-row__column',
			{
				'origam-data-table-row__column--expanded-row': key === 'data-table-expand',
				'origam-data-table-row__column--select-row': key === 'data-table-select'
			}
		]
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableRowClasses = computed(() => {
		return [
			'origam-data-table-row',
			{
				'origam-data-table-row--clickable': !!(Object.prototype.hasOwnProperty.call(vm.vnode.props, 'onClick') || Object.prototype.hasOwnProperty.call(vm.vnode.props, 'onContextmenu') || Object.prototype.hasOwnProperty.call(vm.vnode.props, 'onDblclick'))
			},
			displayClasses.value,
			props.class
		]
	})
	const dataTableRowStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableRowStyles)


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
	.origam-data-table-row {
		$this: &;

		background-color: var(--origam-data-table-row---background-color, var(--origam-color__surface---default));
		color: var(--origam-data-table-row---color, var(--origam-color__text---primary));
		transition-property: background-color;
		transition-duration: var(--origam-data-table-row---transition-duration, 100ms);
		transition-timing-function: var(--origam-data-table-row---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));

		&:hover {
			background-color: var(--origam-data-table-row--hover---background-color, var(--origam-color__surface---overlay));
		}

		&__column-title {
			font-weight: var(--origam-data-table-row__column-title---font-weight, 500);
		}

		&--clickable {
			cursor: pointer
		}

		&--mobile {
			#{$this}__column-title {
				text-align: left;
			}

			#{$this}__column-value {
				text-align: right;
			}

			#{$this}__column {
				height: fit-content;

				&--expanded-row {
					grid-template-columns: 0;
					justify-content: center;
				}

				&--select-row {
					grid-template-columns: 0;
					justify-content: end;
				}
			}

			> .origam-data-table-column-cell {
				align-items: center;
				column-gap: 4px;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				min-height: var(--origam-data-table-row--mobile__column-min-height, var(--origam-data-table-row--mobile__column, 52px));

				&:not(:last-child) {
					border-bottom: 0;
				}
			}
		}
	}
</style>

