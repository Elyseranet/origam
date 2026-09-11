<template>
	<origam-btn-group
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
	import { OrigamBtnGroup } from '../../components'

	import {
	useDefaults,
	useGroup,
	useProps,
	useStyle
} from '../../composables'

	import { ORIGAM_BTN_TOGGLE_KEY } from '../../consts'

	import { DENSITY } from '../../enums'

	import type { IBtnToggleProps} from '../../interfaces'

	import type { IBtnToggleEmits } from '../../interfaces/Btn/btn-toggle.interface'

	import type { TOrigamBtnGroup } from "../../types"

	import { computed, ref, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and group selection state for the toggle.
	 ********************************************************/
	const _props = withDefaults(defineProps<IBtnToggleProps>(), {tag: 'div', items: () => [], density: DENSITY.DEFAULT})

	// `useDefaults` resolves the TOGGLE's OWN props (rounded/border/elevation/…)
	// against the closest `provideDefaults({ 'origam-btn-toggle': … })` (a
	// marketing theme's `components` block). `btnGroupProps` below then
	// forwards the RESOLVED values down to the underlying `<origam-btn-group>`
	// as explicit props, so `OrigamBtnGroup`'s own `useDefaults` sees them as
	// parent-passed (highest priority) rather than needing to resolve
	// `'origam-btn-group'` itself for a toggle instance. Mirrors
	// `OrigamBtn.vue`'s exact pattern.
	const props = useDefaults(_props)

	defineEmits<IBtnToggleEmits>()

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
	const {id, css, load, isLoaded, unload} = useStyle(btnToggleStyles)


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

