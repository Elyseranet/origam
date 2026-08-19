<template>
	<component
			:is="tag"
			:id="id"
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

	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import { useGroup } from '../../composables/Commons/group.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_ITEM_GROUP_KEY } from '../../consts/ItemGroup/item-group.const'

	import { omitUndefined } from '../../utils/Commons/commons.util'

	import type { IItemGroupProps } from '../../interfaces/ItemGroup/item-group.interface'

	import type { IItemGroupEmits, IItemGroupSlots } from '../../interfaces/ItemGroup/item-group.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IItemGroupProps>(), {
		tag: 'div',
		selectedClass: 'origam-item--selected'
	})

	defineEmits<IItemGroupEmits>()

	defineSlots<IItemGroupSlots>()

	const {filterProps} = useProps<IItemGroupProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isSelected, select, next, prev, selected} = useGroup(props, ORIGAM_ITEM_GROUP_KEY)

	// Push the selectedClass down to every descendant `<origam-item>` as
	// DEFAULTS — items that pass their own props still win.
	// Forward ONLY what the consumer actually passed — see #263. `selectedClass`
	// carries a `withDefaults` value today, so nothing junk leaks through in
	// practice, but the guard keeps every forwarder on one single shape.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-item': omitUndefined({
			selectedClass: wasPropPassed('selectedClass') ? props.selectedClass : undefined
		})
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
	const {id, css, load, isLoaded, unload} = useStyle(itemGroupStyles, () => props.id)


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
