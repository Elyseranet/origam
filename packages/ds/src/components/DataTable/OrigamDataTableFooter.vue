<template>
	<div
			:id="id"
			:class="dataTableFooterClasses"
			:style="dataTableFooterStyles"
	>
		<origam-row>
			<slot name="prepend"/>

			<div class="origam-data-table-footer__items-per-page">
				<span>{{ t(itemsPerPageText) }}</span>

				<origam-select
						:density="DENSITY.COMPACT"
						:items="itemsPerPageOptions"
						:model-value="itemsPerPage"
						hide-details
						@update:model-value="handleUpdateItemsPerPage"
				/>
			</div>

			<div class="origam-data-table-footer__info">
				<span>{{ t(pageText, !itemsLength ? 0 : startIndex + 1, stopIndex, itemsLength) }}</span>
			</div>

			<div class="origam-data-table-footer__pagination">
				<origam-pagination
						ref="origamPaginationRef"
						v-model:model-value="currentPage"
						:density="DENSITY.COMPACT"
						:length="length"
						:total-visible="showCurrentPage ? 0 : 1"
						rounded
						show-first-last-page
						v-bind="paginationProps"
				/>
			</div>

			<slot name="append"/>
		</origam-row>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import OrigamPagination from '../Pagination/OrigamPagination.vue'
	import OrigamRow from '../Grids/OrigamRow.vue'
	import OrigamSelect from '../Select/OrigamSelect.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { usePagination } from '../../composables/DataTable/pagination.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IDataTableFooterProps, IDataTableFooterSlots } from '../../interfaces/DataTable/footer.interface'
	import type { TOrigamPagination } from '../../types/Pagination/pagination.type'

	import { computed, ref, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableFooterProps>(), {
		itemsPerPageOptions: () => [
			{value: 10, title: '10'},
			{value: 25, title: '25'},
			{value: 50, title: '50'},
			{value: 100, title: '100'},
			{value: -1, title: 'origam.data_footer.items_per_page_all'}
		],
		itemsPerPageText: 'origam.data_footer.items_per_page_text',
		pageText: 'origam.data_footer.page_text',
		firstPageLabel: 'origam.data_footer.first_page',
		prevPageLabel: 'origam.data_footer.prev_page',
		nextPageLabel: 'origam.data_footer.next_page',
		lastPageLabel: 'origam.data_footer.last_page',
		showCurrentPage: true
	})

	defineSlots<IDataTableFooterSlots>()

	const {filterProps} = useProps<IDataTableFooterProps>(props)
	const {t} = useLocale()

	const origamPaginationRef = ref<TOrigamPagination>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {page, pageCount, startIndex, stopIndex, itemsLength, itemsPerPage, setItemsPerPage} = usePagination()

	const itemsPerPageOptions = computed(() => (
			props.itemsPerPageOptions.map((option) => {
				if (typeof option === 'number') {
					return {
						value: option,
						title: option === -1
								? t('origam.data_footer.items_per_page_all')
								: String(option)
					}
				}

				return {
					...option,
					title: !isNaN(Number(option.title)) ? option.title : t(option.title)
				}
			})
	))
	const length = computed(() => {
		return pageCount.value
	})
	const currentPage = computed({
		get: () => {
			return page.value
		},
		set: (value) => {
			page.value = value
		}
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleUpdateItemsPerPage = (v: number) => {
		setItemsPerPage(Number(v))
	}

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const paginationProps = computed(() => {
		return origamPaginationRef.value?.filterProps(props, ['class', 'style', 'id', 'totalVisible', 'modelValue', 'length', 'rounded', 'showFirstLastPage', 'density'])
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableFooterClasses = computed(() => {
		return [
			'origam-data-table-footer',
			props.class
		]
	})
	const dataTableFooterStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableFooterStyles, () => props.id)


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
	.origam-data-table-footer {
		align-items: var(--origam-data-table-footer---align-items, center);
		background-color: var(--origam-data-table-footer---background-color, var(--origam-color__surface---default));
		color: var(--origam-data-table-footer---color, var(--origam-color__text---primary));
		display: var(--origam-data-table-footer---display, flex);
		flex-wrap: var(--origam-data-table-footer---flex-wrap, wrap);
		justify-content: var(--origam-data-table-footer---justify-content, flex-end);
		padding-block: var(--origam-data-table-footer---padding-block, var(--origam-space---2, 8px));
		padding-inline: var(--origam-data-table-footer---padding-inline, var(--origam-space---1, 4px));

		&__items-per-page {
			align-items: center;
			display: flex;
			justify-content: center;
			gap: var(--origam-data-table-footer__items-per-page---gap, var(--origam-space---2, 8px));

			> span {
				padding-inline-end: var(--origam-data-table-footer__items-per-page---padding-inline-end, var(--origam-space---2, 8px));
			}
		}

		&__info {
			display: flex;
			justify-content: var(--origam-data-table-footer__info---justify-content, flex-end);
			min-width: var(--origam-data-table-footer__info---min-width, 116px);
			padding-inline: var(--origam-data-table-footer__info---padding-inline, var(--origam-space---4, 16px));
		}

		&__pagination {
			align-items: center;
			display: flex;
			margin-inline-start: var(--origam-data-table-footer__pagination---margin-inline-start, var(--origam-space---4, 16px));
		}
	}
</style>
