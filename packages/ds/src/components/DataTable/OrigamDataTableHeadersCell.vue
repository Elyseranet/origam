<template>
	<template
			v-for="(row, y) in headers"
			:key="y"
	>
		<tr
				:id="headerRowId(y)"
				class="origam-data-table-headers"
		>
			<template
					v-for="(column, x) in row"
					:key="x"
			>
				<origam-data-table-header-cell
						ref="origamDataTableHeaderCellRef"
						:class="dataTableHeadersCellClasses"
						:column="column"
						:style="dataTableHeadersCellStyles"
						:x="x"
						:y="y"
						v-bind="dataTableHeaderCellProps"
				/>
			</template>
		</tr>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import OrigamDataTableHeaderCell from './OrigamDataTableHeaderCell.vue'

	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { IDataTableHeadersCellEmits, IDataTableHeadersCellProps, IDataTableHeadersCellSlots } from '../../interfaces/DataTable/data-table-headers-cell.interface'
	import type { TOrigamDataTableHeaderCell } from '../../types/DataTable/data-table-header-cell.type'

	import { computed, ref, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableHeadersCellProps>(), {})

	defineEmits<IDataTableHeadersCellEmits>()

	defineSlots<IDataTableHeadersCellSlots>()

	const {filterProps} = useProps<IDataTableHeadersCellProps>(props)

	const origamDataTableHeaderCellRef = ref<Array<TOrigamDataTableHeaderCell>>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const dataTableHeaderCellProps = computed(() => {
		// Pre-fix this used `Array.prototype.some()` to "iterate" the
		// ref collection — but `.some()` returns a BOOLEAN, not the
		// filtered props object. Result: every per-cell `v-bind` was
		// receiving `true`, which Vue treats as "no props bound", so
		// `sortAscIcon` / `sortDescIcon` (and any other forwarded
		// IHeaderCellProps) never reached the inner
		// `<origam-data-table-header-cell>`. The sort icon then
		// resolved through OrigamComponentIcon's fallback path with
		// `icon: undefined`, rendering an empty `<!--v-if-->`. Take
		// the first ref's `filterProps`: every header cell shares the
		// same component type, so the prop schema is identical.
		return origamDataTableHeaderCellRef.value?.[0]?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableHeadersCellClasses = computed(() => {
		return [
			props.class
		]
	})
	const dataTableHeadersCellStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableHeadersCellStyles, () => props.id)

	const headerRowId = (index: number) => (props.id ? `${props.id}-row-${index}` : undefined)


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
