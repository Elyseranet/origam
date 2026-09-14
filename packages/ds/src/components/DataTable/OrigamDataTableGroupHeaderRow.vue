<template>
	<tr
			:id="id"
			:class="[dataTableGroupHeaderRowClasses, textColorClasses]"
			:style="[dataTableGroupHeaderRowStyles, textColorStyles]"
	>
		<template
				v-for="(column, index) in columns"
				:key="index"
		>
			<template v-if="column.key === 'data-table-group'">
				<slot
						name="data-table-group"
						v-bind="{ ...slotGroupProps }"
				>
					<origam-data-table-column-cell class="origam-data-table-group-header-row__column">
						<origam-btn
								:icon="groupIcon"
								size="small"
								variant="text"
								@click="handleClick"
						/>
						<span>{{ item.value }}</span>
						<span>({{ rows.length }})</span>
					</origam-data-table-column-cell>
				</slot>
			</template>

			<template v-else-if="column.key === 'data-table-select'">
				<slot
						name="data-table-select"
						v-bind="{...slotSelectGroupProps}"
				>
					<td>
						<origam-checkbox-btn
								:indeterminate="indeterminate"
								:model-value="modelValue"
								@update:model-value="handleSelectGroup"
						/>
					</td>
				</slot>
			</template>

			<template v-else>
				<td/>
			</template>
		</template>
	</tr>
</template>

<script
		lang="ts"
		setup
>
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamCheckboxBtn from '../Checkbox/OrigamCheckboxBtn.vue'
	import OrigamDataTableColumnCell from './OrigamDataTableColumnCell.vue'

	import { useGroupBy } from '../../composables/DataTable/group.composable'
	import { useHeaders } from '../../composables/DataTable/headers.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSelection } from '../../composables/DataTable/select.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IDataTableGroupHeaderRowEmits, IDataTableGroupHeaderRowProps, IDataTableGroupHeaderRowSlots } from '../../interfaces/DataTable/group.interface'

	import { computed, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableGroupHeaderRowProps>(), {})

	defineEmits<IDataTableGroupHeaderRowEmits>()

	defineSlots<IDataTableGroupHeaderRowSlots>()

	const {filterProps} = useProps<IDataTableGroupHeaderRowProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isGroupOpen, toggleGroup, extractRows} = useGroupBy()
	const {isSelected, isSomeSelected, select} = useSelection()
	const {columns} = useHeaders()

	/*********************************************************
	 * Couleur de la ligne d'en-tete de groupe
	 *
	 * @description
	 * `color` etait declaree (heritee d'`IColorProps`) et lue nulle part :
	 * le garde `unconsumed-props` la signalait comme prop inerte. Le SCSS
	 * scope declare deja `color:` sur le `<tr>` — c'est donc bien cet
	 * element qui porte la couleur de texte du groupe, heritee par ses
	 * cellules.
	 *
	 * @description
	 * Meme forme que `<OrigamDataTableRows>` (#550) : `useTextColor` lit la
	 * prop dans un `computed`, donc la valeur ecrite par le resolveur de
	 * theme en `beforeCreate` (ADR-005) reste visible.
	 ********************************************************/
	const {textColorClasses, textColorStyles} = useTextColor(props, 'color')

	const rows = computed(() => {
		return extractRows([props.item])
	})
	const groupIcon = computed(() => {
		return isGroupOpen(props.item) ? MDI_ICONS.CHEVRON_DOWN : MDI_ICONS.CHEVRON_RIGHT
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	/*********************************************************
	 * Props d'abord, contexte en repli
	 *
	 * @description
	 * `toggleGroup` et `isSelected` sont declarees ET fournies par
	 * `useGroupBy()` / `useSelection()`. Le binding `<script setup>`
	 * l'emportait sur la prop du meme nom (famille d'homonymes #372), donc
	 * ce que le parent passait etait accepte puis jete en silence.
	 *
	 * @description
	 * La prop passe devant, le contexte reste le repli — c'est ce qui rend
	 * le composant utilisable hors `<OrigamDataTable>`, la ou il n'y a
	 * aucun provide a injecter. Les deux lectures sont differees dans un
	 * handler / un `computed` : la valeur ecrite par le resolveur de theme
	 * en `beforeCreate` (ADR-005) reste donc visible.
	 ********************************************************/
	const handleClick = () => (props.toggleGroup ?? toggleGroup)(props.item)

	const modelValue = computed(() => {
		return (props.isSelected ?? isSelected)(rows.value)
	})
	const indeterminate = computed(() => {
		return isSomeSelected(rows.value) && !modelValue.value
	})

	const handleSelectGroup = (v: boolean) => select(rows.value, v)

	const slotGroupProps = computed(() => {
		return {
			item: props.item,
			count: rows.value.length,
			props: {
				icon: groupIcon.value,
				onClick: handleClick
			}
		}
	})
	const slotSelectGroupProps = computed(() => {
		return {
			props: {
				modelValue: modelValue.value,
				indeterminate: indeterminate.value,
				'onUpdate:modelValue': handleSelectGroup
			}
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const dataTableGroupHeaderRowClasses = computed(() => {
		return [
			'origam-data-table-group-header-row',
			props.class
		]
	})
	const dataTableGroupHeaderRowStyles = computed(() => {
		return [
			{
				'--origam-data-table-group-header-row--depth': props.item.depth
			},
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dataTableGroupHeaderRowStyles, () => props.id)


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
	.origam-data-table-group-header-row {
		background-color: var(--origam-data-table-group-header-row---background-color, var(--origam-data-table---group-header-row-background-color, var(--origam-color__surface---overlay)));
		color: var(--origam-data-table-group-header-row---color, var(--origam-data-table---group-header-row-color, var(--origam-color__text---primary)));
		font-weight: var(--origam-data-table-group-header-row---font-weight, var(--origam-data-table---group-header-row-font-weight, 500));

		&__column {
			padding-inline-start: calc(var(--origam-data-table-group-header-row--depth, 0) * var(--origam-data-table-group-header-row__column---padding-inline-start-factor, var(--origam-data-table---group-header-row-column-padding-inline-start-factor, 16px)));
		}
	}
</style>
