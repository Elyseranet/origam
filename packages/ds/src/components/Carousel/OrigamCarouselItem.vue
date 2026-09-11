<template>
	<origam-window-item
			ref="origamWindowItemRef"
			:class="carouselItemClasses"
			:style="carouselItemStyles"
			v-bind="windowItemProps"
	>
		<template #default>
			<slot name="default">
				<origam-img
						ref="origamImgRef"
						v-bind="({...attrs , ...imgProps} as any)"
				>
					<template
							v-if="slots.content"
							#default
					>
						<slot name="content"/>
					</template>

					<template
							v-if="slots.error"
							#error
					>
						<slot name="error"/>
					</template>

					<template
							v-if="slots.placeholder"
							#placeholder
					>
						<slot name="placeholder"/>
					</template>
				</origam-img>
			</slot>
		</template>
	</origam-window-item>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamImg, OrigamWindowItem } from '../../components'

	import {
	useProps,
	useStyle
} from '../../composables'

	import type { ICarouselItemProps } from '../../interfaces'

	import type { TOrigamImg, TOrigamWindowItem } from "../../types"

	import { computed, ref, StyleValue, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, child refs and delegated prop filtering.
	 ********************************************************/

	const props = withDefaults(defineProps<ICarouselItemProps>(), {
		transition: undefined,
		reverseTransition: undefined
	})

	const {filterProps} = useProps<ICarouselItemProps>(props)

	const attrs = useAttrs()

	const origamWindowItemRef = ref<TOrigamWindowItem>()
	const origamImgRef = ref<TOrigamImg>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const windowItemProps = computed(() => {
		return origamWindowItemRef.value?.filterProps(props)
	})
	const imgProps = computed(() => {
		return origamImgRef.value?.filterProps(props)
	})

	const slots = useSlots()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and passes through host styles.
	 ********************************************************/

	const carouselItemStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const carouselItemClasses = computed(() => {
		return [
			'origam-carousel-item',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(carouselItemStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
	.origam-carousel-item {
		display: block;
		height: inherit;
		text-decoration: none;

		> .origam-img {
			height: inherit;
		}
	}
</style>

