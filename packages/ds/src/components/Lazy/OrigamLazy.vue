<template>
	<component
			:is="tag"
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
	import { OrigamFade, OrigamTransition } from '../../components'

	import {
	useDimension,
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { vIntersect } from '../../directives'

	import type { ILazyComponentProps} from '../../interfaces'

	import type { ILazyEmits } from '../../interfaces/Commons/lazy.interface'

	import type { TTransitionProps } from "../../types"

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
	const {id, css, load, isLoaded, unload} = useStyle(lazyStyles)


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
