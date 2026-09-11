<template>
	<origam-table
			ref="origamTableRef"
			:class="dataTableClasses"
			:style="dataTableStyles"
			v-bind="tableProps"
			:aria-rowcount="itemsLength"
	>
		<template
				v-if="slots.top"
				#top
		>
			<slot name="top"/>
		</template>

		<template #default>
			<slot
					name="default"
					v-bind="slotProps"
			>
				<slot
						name="colgroup"
						v-bind="slotProps"
				/>

				<template v-if="!hideDefaultHeader">
					<thead key="thead">
					<origam-data-table-headers
							ref="origamDataTableHeadersRef"
							v-bind="dataTableHeadersProps"
					>
						<template
								v-if="slots.header"
								#default="headerProps"
						>
							<slot
									name="header"
									v-bind="headerProps"
							/>
						</template>

						<template
								v-if="slots['header.mobile']"
								#mobile="headerProps"
						>
							<slot
									name="header.mobile"
									v-bind="headerProps"
							/>
						</template>

						<template
								v-if="slots['header.loader']"
								#loader="headerLoaderProps"
						>
							<slot
									name="header.loader"
									v-bind="headerLoaderProps"
							/>
						</template>
					</origam-data-table-headers>
					</thead>
				</template>

				<slot
						name="thead"
						v-bind="slotProps"
				/>

				<template v-if="!hideDefaultBody">
					<tbody>
					<slot
							name="prepend"
							v-bind="slotProps"
					/>
					<slot
							name="body"
							v-bind="slotProps"
					>
						<origam-data-table-rows
								ref="origamDataTableRowsRef"
								:items="paginatedItems"
								v-bind="dataTableRowsBindProps"
						>
						</origam-data-table-rows>
					</slot>
					<slot
							name="append"
							v-bind="slotProps"
					/>
					</tbody>
				</template>
			</slot>
		</template>

		<template #bottom>
			<slot name="bottom">
				<template v-if="!hideDefaultFooter">
					<origam-divider/>

					<origam-data-table-footer
							ref="origamDataTableFooterRef"
							v-bind="dataTableFooterProps"
					>
					</origam-data-table-footer>
				</template>
			</slot>
		</template>
	</origam-table>
</template><script
		lang="ts"
		setup
>
	import {
		OrigamDataTableFooter,
		OrigamDataTableHeaders,
		OrigamDataTableRows,
		OrigamDivider,
		OrigamTable
	} from '../../components'

	import {
		createGroupBy,
		createHeaders,
		createPagination,
		createSort,
		provideExpanded,
		provideGroupBy,
		providePagination,
		provideSelection,
		provideSort,
		useDataTableItems,
		useFilter,
		useGroupedItems,
		useOptions,
		usePaginatedItems,
		useProps,
		useSortedItems,
		useStyle
} from '../../composables'

	import { ORIGAM_DATA_TABLE_SHOW_SELECT_KEY } from '../../consts'

	import { DENSITY, MDI_ICONS } from '../../enums'

	import type {
		IDataTableGroup, IDataTableGroupableItem, IDataTableProps, IDataTableSelectableItem, IDataTableSortItem} from '../../interfaces'

	import type { IDataTableEmits } from '../../interfaces/DataTable/data-table.interface'

	import type { TOrigamDataTableFooter, TOrigamDataTableHeaders, TOrigamDataTableRows, TOrigamTable } from "../../types"

	import { computed, provide, Ref, ref, StyleValue, toRef, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableProps>(), {
		page: 1,
		itemsPerPage: 10,
		tag: 'div',
		density: DENSITY.DEFAULT,
		hideDefaultFooter: false,
		// `useDisplay` falls back to the global `mobileBreakpoint: 'lg'`
		// (1280px) when the DataTable doesn't pin its own. That's far
		// too aggressive — every viewport under 1280px ended up
		// rendering each row as a stack of `[label, value]` cells (the
		// "mobile" fallback), which the user reports as "completely
		// bugged". Pin to `'xs'` (= 0px threshold) so the table only
		// ever switches to mobile when the consumer explicitly opts in
		// by passing a higher breakpoint. Aligns with Vuetify v3's
		// `<v-data-table>` whose `mobile` is opt-in.
		mobileBreakpoint: 'xs',
		// Sort indicators — without defaults, `getSortIcon()` returns
		// undefined and the `<origam-icon>` renders nothing, so users
		// got NO visual feedback when clicking a sortable header. Match
		// Vuetify's `v-data-table` defaults: a unicode-sort triangle
		// (`mdi-arrow-up`) that flips to `mdi-arrow-down` for DESC.
		sortAscIcon: MDI_ICONS.ARROW_UP,
		sortDescIcon: MDI_ICONS.ARROW_DOWN
	})

	defineEmits<IDataTableEmits>()

	const {filterProps} = useProps<IDataTableProps>(props)

	const attrs = useAttrs()

	const origamTableRef = ref<TOrigamTable>()
	const origamDataTableHeadersRef = ref<TOrigamDataTableHeaders>()
	const origamDataTableRowsRef = ref<TOrigamDataTableRows>()
	const origamDataTableFooterRef = ref<TOrigamDataTableFooter>()

	const {groupBy} = createGroupBy(props)
	const {sortBy, multiSort, mustSort} = createSort(props)
	const {page, itemsPerPage} = createPagination(props)

	const {
		columns,
		headers,
		sortFunctions,
		sortRawFunctions,
		filterFunctions
	} = createHeaders(props, {
		groupBy: groupBy as unknown as Ref<Array<IDataTableSortItem>>,
		showSelect: toRef(props, 'showSelect'),
		showExpand: toRef(props, 'showExpand')
	})

	const slots = useSlots()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {items} = useDataTableItems(props, columns)

	const search = toRef(props, 'search')
	const {filteredItems} = useFilter(props, items, search, {
		transform: item => item.columns,
		customKeyFilter: filterFunctions
	})

	const {toggleSort} = provideSort({sortBy, multiSort, mustSort, page} as unknown as {
		sortBy: Ref<Array<IDataTableSortItem>>,
		multiSort: Ref<boolean>,
		mustSort: Ref<boolean>,
		page: Ref | undefined
	})
	const {sortByWithGroups, opened, extractRows, isGroupOpen, toggleGroup} = provideGroupBy({
		groupBy,
		sortBy
	} as unknown as { groupBy: Ref<Array<IDataTableSortItem>>, sortBy: Ref<Array<IDataTableSortItem>> })

	const {sortedItems} = useSortedItems(props, filteredItems, sortByWithGroups, {
		transform: item => item.columns,
		sortFunctions,
		sortRawFunctions
	})
	const {flatItems} = useGroupedItems(sortedItems, groupBy as unknown as Ref<Array<IDataTableSortItem>>, opened)
	const itemsLength = computed(() => flatItems.value.length)

	const {startIndex, stopIndex, pageCount, setItemsPerPage} = providePagination({page, itemsPerPage, itemsLength})
	const {paginatedItems} = usePaginatedItems({items: flatItems, startIndex, stopIndex, itemsPerPage})

	const paginatedItemsWithoutGroups = computed(() => {
		return extractRows(paginatedItems.value as unknown as Array<IDataTableGroup<IDataTableGroupableItem<any>> | IDataTableGroupableItem<any>>)
	})

	const {
		isSelected,
		select,
		selectAll,
		toggleSelect,
		someSelected,
		allSelected
	} = provideSelection(props, {
		allItems: items,
		currentPage: paginatedItemsWithoutGroups as unknown as Ref<Array<IDataTableSelectableItem>>
	})

	const {isExpanded, toggleExpand} = provideExpanded(props)

	provide(ORIGAM_DATA_TABLE_SHOW_SELECT_KEY, toRef(props, 'showSelect') as unknown as Ref<boolean>)

	useOptions({
		page,
		itemsPerPage,
		sortBy: sortBy as unknown as Ref<Array<IDataTableSortItem>>,
		groupBy: groupBy as unknown as Ref<Array<IDataTableSortItem>>,
		search
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const tableProps = computed(() => {
		return origamTableRef.value?.filterProps(props)
	})

	const slotProps = computed(() => {
		return {
			page: page.value,
			itemsPerPage: itemsPerPage.value,
			sortBy: sortBy.value,
			pageCount: pageCount.value,
			toggleSort,
			setItemsPerPage,
			someSelected: someSelected.value,
			allSelected: allSelected.value,
			isSelected,
			select,
			selectAll,
			toggleSelect,
			isExpanded,
			toggleExpand,
			isGroupOpen,
			toggleGroup,
			items: paginatedItemsWithoutGroups.value.map((item) => item.raw),
			internalItems: paginatedItemsWithoutGroups.value,
			groupedItems: paginatedItems.value,
			columns: columns.value,
			headers: headers.value
		}
	})

	const dataTableHeadersProps = computed(() => {
		return origamDataTableHeadersRef.value?.filterProps(props)
	})

	const dataTableRowsProps = computed(() => {
		return origamDataTableRowsRef.value?.filterProps(props, ['class', 'style', 'id', 'items'])
	})

	// Merges fallthrough attrs with the filtered rows props.
	// Typed as `Record<string, unknown>` to prevent TS from widening
	// `class`/`style` to include `null | false` (from `useAttrs()`)
	// which `OrigamDataTableRows` does not accept.
	const dataTableRowsBindProps = computed((): Record<string, unknown> => {
		return { ...attrs, ...dataTableRowsProps.value } as Record<string, unknown>
	})

	const dataTableFooterProps = computed(() => {
		return origamDataTableFooterRef.value?.filterProps(props, ['class', 'style', 'id'])
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const dataTableClasses = computed(() => {
		return [
			'origam-data-table',
			{
				'origam-data-table--show-select': props.showSelect,
				'origam-data-table--loading': props.loading
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableStyles)


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
	.origam-data-table {
		width: var(--origam-data-table---width, 100%);
		background-color: var(--origam-data-table---background-color, var(--origam-color__surface---default));
		color: var(--origam-data-table---color, var(--origam-color__text---primary));

		&__table {
			width: 100%;
			border-collapse: var(--origam-data-table---border-collapse, separate);
			border-spacing: var(--origam-data-table---border-spacing, 0)
		}

		&--loading {
			&:deep(.origam-data-table-cell) {
				opacity: var(--origam-data-table--loading---opacity, var(--origam-data-table__loading---opacity, 0.5));
			}
		}
	}
</style>

