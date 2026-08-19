<template>
	<component
			:is="tag"
			:id="id"
			v-intersect="intersect"
			:aria-busy="!isActive || undefined"
			:class="lazyClasses"
			:style="lazyStyles"
	>
		<template v-if="isActive">
			<origam-transition
					:transition="transition"
					appear
			>
				<slot name="default"/>
			</origam-transition>
		</template>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import OrigamFade from '../Transition/OrigamFade.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import vIntersect from '../../directives/Intersect/intersect.directive'

	import type { ILazyComponentProps } from '../../interfaces/Lazy/lazy.interface'

	import type { ILazyEmits, ILazySlots } from '../../interfaces/Lazy/lazy.interface'

	import type { TTransitionProps } from '../../types/Transition/transition.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and composables.
	 ********************************************************/

	const props = withDefaults(defineProps<ILazyComponentProps>(), {
		tag: 'div',
		options: () => ({
			root: undefined,
			rootMargin: undefined,
			threshold: undefined
		}),
		transition: () => ({component: OrigamFade}) as unknown as TTransitionProps
	})

	defineEmits<ILazyEmits>()

	defineSlots<ILazySlots>()

	const {filterProps} = useProps<ILazyComponentProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)

	/*********************************************************
	 * Value
	 ********************************************************/

	const isActive = useVModel(props, 'modelValue')

	/*********************************************************
	 * Intersection
	 *
	 * @description
	 * Intersection observer config and activation handler.
	 ********************************************************/

	const intersect = computed(() => {
		return [
			{handler: handleIntersect, options: props.options},
			null,
			isActive.value ? [] : ['once']
		]
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleIntersect = (isIntersecting: boolean) => {
		if (isActive.value) return

		isActive.value = isIntersecting
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const lazyStyles = computed(() => {
		return [
			dimensionStyles.value,
			props.style
		] as StyleValue
	})
	const lazyClasses = computed(() => {
		return [
			'origam-lazy',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(lazyStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
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
