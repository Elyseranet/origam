<template>
	<component
			:is="tag"
			:class="itemGroupClasses"
      :style="itemGroupStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot
					name="default"
					v-bind="slotProps"
			/>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'

	import { OrigamDefaultsProvider } from '../../components'
	import {
	useGroup,
	useProps,
	useStyle
} from '../../composables'

	import { ORIGAM_ITEM_GROUP_KEY } from '../../consts'

	import type { IItemGroupProps} from '../../interfaces'

	import type { IItemGroupEmits } from '../../interfaces/ItemGroup/item-group.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IItemGroupProps>(), {
		tag: 'div',
		selectedClass: 'origam-item--selected'
	})

	defineEmits<IItemGroupEmits>()

	const {filterProps} = useProps<IItemGroupProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isSelected, select, next, prev, selected} = useGroup(props, ORIGAM_ITEM_GROUP_KEY)

	// Push the selectedClass down to every descendant `<origam-item>` as
	// DEFAULTS — items that pass their own props still win.
	const slotDefaults = computed(() => ({
		'origam-item': {
			selectedClass: props.selectedClass
		}
	}))

	const slotProps = computed(() => ({
		isSelected,
		select,
		next,
		prev,
		selected
	}))


	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const itemGroupClasses = computed(() => {
		return [
			'origam-item-group',
			props.class
		]
	})
	const itemGroupStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(itemGroupStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		next,
		prev,
		select,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>
