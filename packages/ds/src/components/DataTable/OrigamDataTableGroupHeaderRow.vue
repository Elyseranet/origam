<template>
	<tr
			:class="dataTableGroupHeaderRowClasses"
			:style="dataTableGroupHeaderRowStyles"
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
	import { OrigamBtn, OrigamCheckboxBtn, OrigamDataTableColumnCell } from "../../components"

	import { useGroupBy, useHeaders, useProps, useSelection , useStyle} from "../../composables"
	import { MDI_ICONS } from "../../enums"

	import type { IDataTableGroupHeaderRowProps } from "../../interfaces"

	import { computed, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableGroupHeaderRowProps>(), {})

	const {filterProps} = useProps<IDataTableGroupHeaderRowProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isGroupOpen, toggleGroup, extractRows} = useGroupBy()
	const {isSelected, isSomeSelected, select} = useSelection()
	const {columns} = useHeaders()

	const rows = computed(() => {
		return extractRows([props.item])
	})
	const groupIcon = computed(() => {
		return isGroupOpen(props.item) ? MDI_ICONS.CHEVRON_DOWN : MDI_ICONS.CHEVRON_RIGHT
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = () => toggleGroup(props.item)

	const modelValue = computed(() => {
		return isSelected(rows.value)
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
	const {id, css, load, isLoaded, unload} = useStyle(dataTableGroupHeaderRowStyles)


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
		background-color: var(--origam-data-table-group-header-row---background-color, var(--origam-color__surface---overlay));
		color: var(--origam-data-table-group-header-row---color, var(--origam-color__text---primary));
		font-weight: var(--origam-data-table-group-header-row---font-weight, 500);

		&__column {
			padding-inline-start: calc(var(--origam-data-table-group-header-row--depth, 0) * var(--origam-data-table-group-header-row__column---padding-inline-start-factor, 16px));
		}
	}
</style>
