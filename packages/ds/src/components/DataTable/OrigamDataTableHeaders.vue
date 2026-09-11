<template>
	<template v-if="mobile">
		<slot
				name="mobile"
				v-bind="slotProps"
		>
			<origam-data-table-headers-cell-mobile
					ref="origamDataTableHeadersCellMobileRef"
					:class="dataTableHeadersClasses"
					:columns="columns"
					:style="dataTableHeadersStyles"
					v-bind="dataTableHeadersCellMobileProps"
			/>
		</slot>
	</template>
	<template v-else>
		<slot
				name="default"
				v-bind="slotProps"
		>
			<origam-data-table-headers-cell
					ref="origamDataTableHeadersCellRef"
					:class="dataTableHeadersClasses"
					:headers="headers"
					:style="dataTableHeadersStyles"
					v-bind="dataTableHeadersCellProps"
			/>
		</slot>
	</template>

	<template v-if="loaderConfig.isActive && loaderConfig.kind !== 'skeleton'">
		<tr class="origam-data-table-headers origam-data-table-headers--progress">
			<th
					:colspan="columns.length"
					scope="col"
					class="origam-data-table-headers__progress-cell"
			>
				<slot name="loader">
					<origam-progress
							:color="color"
							:type="loaderConfig.kind === 'line' ? PROGRESS_TYPE.LINEAR : PROGRESS_TYPE.CIRCULAR"
							:active="true"
							:indeterminate="loaderConfig.indeterminate"
							:model-value="loaderConfig.modelValue"
							thickness="2"
							v-bind="loaderConfig.overrides"
					/>
				</slot>
			</th>
		</tr>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamDataTableHeadersCell, OrigamDataTableHeadersCellMobile, OrigamProgress } from '../../components'

	import {
	useDisplay,
	useHeaders,
	useHeadersCell,
	useLoader,
	useProps,
	useSelection,
	useSort,
	useStyle
} from '../../composables'

	import { PROGRESS_TYPE } from '../../enums'

	import type { IDataTableHeadersProps, IDataTableHeadersSlotProps } from '../../interfaces'
	import type { TOrigamDataTableHeadersCell, TOrigamDataTableHeadersCellMobile } from "../../types"

	import { computed, ref, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableHeadersProps>(), {})

	const {filterProps} = useProps<IDataTableHeadersProps>(props)

	const origamDataTableHeadersCellRef = ref<TOrigamDataTableHeadersCell>()
	const origamDataTableHeadersCellMobileRef = ref<TOrigamDataTableHeadersCellMobile>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {toggleSort, sortBy, isSorted} = useSort()
	const {someSelected, allSelected, selectAll} = useSelection()
	const {columns, headers} = useHeaders()

	/*********************************************************
	 * Loader
	 ********************************************************/

	const {loaderClasses, loaderConfig} = useLoader(props, 'line')
	const {getSortIcon} = useHeadersCell(props)

	const {displayClasses, mobile} = useDisplay(props)

	const slotProps = computed(() => {
		return {
			headers: headers.value,
			columns: columns.value,
			toggleSort,
			isSorted,
			sortBy: sortBy.value,
			someSelected: someSelected.value,
			allSelected: allSelected.value,
			selectAll,
			getSortIcon
		} satisfies IDataTableHeadersSlotProps
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const dataTableHeadersCellProps = computed(() => {
		return origamDataTableHeadersCellRef.value?.filterProps(props)
	})
	const dataTableHeadersCellMobileProps = computed(() => {
		return origamDataTableHeadersCellMobileRef.value?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableHeadersClasses = computed(() => {
		return [
			'origam-data-table-headers',
			{
				'origam-data-table-headers--sticky': props.sticky
			},
			displayClasses.value,
			loaderClasses.value,
			props.class
		]
	})
	const dataTableHeadersStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableHeadersStyles)


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
	.origam-data-table-headers {
		&--progress > &__progress-cell {
			border: none;
			height: auto;
			padding: 0;
		}
	}
</style>

