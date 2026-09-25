<template>
	<template v-if="mobile">
		<slot
				name="mobile"
				v-bind="slotProps"
		>
			<origam-data-table-headers-cell-mobile
					:id="id"
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
					:id="id"
					ref="origamDataTableHeadersCellRef"
					:class="dataTableHeadersClasses"
					:headers="headers"
					:style="dataTableHeadersStyles"
					v-bind="dataTableHeadersCellProps"
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
			</origam-data-table-headers-cell>
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
	import OrigamDataTableHeadersCell from './OrigamDataTableHeadersCell.vue'
	import OrigamDataTableHeadersCellMobile from './OrigamDataTableHeadersCellMobile.vue'
	import OrigamProgress from '../Progress/OrigamProgress.vue'

	import { useDisplay } from '../../composables/Commons/display.composable'
	import { useHeaders } from '../../composables/DataTable/headers.composable'
	import { useHeadersCell } from '../../composables/DataTable/headersCell.composable'
	import { useLoader } from '../../composables/Commons/loader.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSelection } from '../../composables/DataTable/select.composable'
	import { useSort } from '../../composables/DataTable/sort.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { LOADER_KIND } from '../../enums/Commons/loader.enum'
	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

	import type { IDataTableHeadersEmits, IDataTableHeadersProps, IDataTableHeadersSlotProps, IDataTableHeadersSlots } from '../../interfaces/DataTable/data-table-headers.interface'
	import type { TOrigamDataTableHeadersCell } from '../../types/DataTable/data-table-headers-cell.type'
	import type { TOrigamDataTableHeadersCellMobile } from '../../types/DataTable/data-table-headers-cell-mobile.type'

	import { pickDataTableHeaderColumnSlotNames } from '../../utils/DataTable/slot-name.util'

	import { computed, ref, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	/*
	 * inheritAttrs — #916 / #853
	 *
	 * BOTH branches of the root `v-if="mobile"` render a `<slot>`, and
	 * `renderSlot()` returns a FRAGMENT vnode — the root is a fragment in
	 * either case. Vue cannot merge fallthrough attributes onto a fragment
	 * and logs "Extraneous non-props attributes", whose trace serialises the
	 * whole ancestor chain including Vue Router's `RouteProvider` vnode
	 * (~4.4 MB per occurrence, #853).
	 *
	 * ⛔ NOTHING is forwarded, deliberately, and this one is a JUDGEMENT the
	 * next reader should be able to re-open: the slot's DEFAULT content is a
	 * single `<origam-data-table-headers-cell(-mobile)>`, so attributes
	 * COULD be pushed onto it. They are not, because a consumer overriding
	 * the slot leaves that element non-existent — the attributes would then
	 * land somewhere in one configuration and nowhere in the other, which is
	 * worse than consistently nowhere. Measured on `develop` before this
	 * flag, a consumer's `class` / `data-cy` / `aria-label` reached NOTHING;
	 * the flag keeps exactly that, and the cell's own `class` / `style` come
	 * from the `dataTableHeadersClasses` / `…Styles` props as before.
	 */
	defineOptions({ inheritAttrs: false })

	const props = withDefaults(defineProps<IDataTableHeadersProps>(), {})

	defineEmits<IDataTableHeadersEmits>()

	defineSlots<IDataTableHeadersSlots>()

	const {filterProps} = useProps<IDataTableHeadersProps>(props)

	const slots = useSlots()

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

	const {loaderClasses, loaderConfig} = useLoader(props, LOADER_KIND.LINE)
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
	 * Forwarded slots (#550, critere C7)
	 *
	 * @description
	 * `header.{cle}` est rendu tout au bout de la chaine, par
	 * `<origam-data-table-header-cell>`. Ce composant et
	 * `<origam-data-table-headers-cell>` ne font que le convoyer : sans ce
	 * relais, un `<template #header.commits>` ecrit sur
	 * `<origam-data-table>` n'atteignait jamais le `<th>`.
	 ********************************************************/
	const headerColumnSlotNames = computed(() => {
		return pickDataTableHeaderColumnSlotNames(Object.keys(slots))
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
	const {id, css, load, isLoaded, unload} = useStyle(dataTableHeadersStyles, () => props.id)


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

