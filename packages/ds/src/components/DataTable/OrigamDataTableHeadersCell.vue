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
				>
					<template
							v-for="name in headerColumnSlotNames"
							:key="name"
							#[name]="columnProps"
					>
						<slot
								:name="name"
								v-bind="columnProps"
						/>
					</template>
				</origam-data-table-header-cell>
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

	import { pickDataTableHeaderColumnSlotNames } from '../../utils/DataTable/slot-name.util'

	import { computed, ref, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableHeadersCellProps>(), {})

	defineEmits<IDataTableHeadersCellEmits>()

	defineSlots<IDataTableHeadersCellSlots>()

	const {filterProps} = useProps<IDataTableHeadersCellProps>(props)

	const slots = useSlots()

	const origamDataTableHeaderCellRef = ref<Array<TOrigamDataTableHeaderCell>>()

	/*********************************************************
	 * Forwarded slots (#550, critere C7)
	 *
	 * @description
	 * Dernier maillon avant `<origam-data-table-header-cell>`, qui rend
	 * `header.{cle}`. `IDataTableHeadersCellSlots` etait declaree VIDE et
	 * decrivait le composant comme un « pur relais » — il relayait les
	 * props, pas les slots, et le contenu d'en-tete personnalise mourait
	 * ici.
	 ********************************************************/
	const headerColumnSlotNames = computed(() => {
		return pickDataTableHeaderColumnSlotNames(Object.keys(slots))
	})

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
