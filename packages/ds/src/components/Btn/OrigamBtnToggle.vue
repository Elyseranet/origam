<template>
	<origam-btn-group
			:id="id"
			ref="origamBtnGroupRef"
			:class="btnToggleClasses"
			:styles="btnToggleStyles"
			v-bind="btnGroupProps"
	>
		<template
				v-if="slots.default"
				#default
		>
			<slot
					name="default"
					v-bind="{items, isSelected, next, prev, select, selected }"
			/>
		</template>

		<template
				v-if="slots.item"
				#item="{item, index}"
		>
			<slot
					name="item"
					v-bind="{item, index}"
			/>
		</template>
	</origam-btn-group>
</template>

<script
		lang="ts"
		setup
>
	import OrigamBtnGroup from './OrigamBtnGroup.vue'

	import { useGroup } from '../../composables/Commons/group.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_BTN_TOGGLE_KEY } from '../../consts/Btn/btn-toggle.const'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IBtnToggleProps } from '../../interfaces/Btn/btn-toggle.interface'

	import type { IBtnToggleEmits, IBtnToggleSlots } from '../../interfaces/Btn/btn-toggle.interface'

	import type { TOrigamBtnGroup } from '../../types/Btn/btn-group.type'

	import { computed, ref, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and group selection state for the toggle.
	 ********************************************************/
	const props = withDefaults(defineProps<IBtnToggleProps>(), {tag: 'div', items: () => [], density: DENSITY.DEFAULT})

	defineEmits<IBtnToggleEmits>()

	defineSlots<IBtnToggleSlots>()

	const {filterProps} = useProps<IBtnToggleProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isSelected, next, prev, select, selected} = useGroup(props, ORIGAM_BTN_TOGGLE_KEY)

	const slots = useSlots()

	const origamBtnGroupRef = ref<TOrigamBtnGroup>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const btnGroupProps = computed(() => {
		return origamBtnGroupRef.value?.filterProps(props)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Thin wrapper — adds only the toggle BEM modifier class.
	 ********************************************************/
	const btnToggleStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const btnToggleClasses = computed(() => {
		return [
			'origam-btn-toggle',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(btnToggleStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: group navigation + filterProps.
	 ********************************************************/
	defineExpose({
		next,
		prev,
		select,
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

