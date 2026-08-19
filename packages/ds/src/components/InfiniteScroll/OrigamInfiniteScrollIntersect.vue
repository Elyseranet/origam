<template>
	<div
			ref="intersectionRef"
			class="origam-infinite-scroll-intersect"
	>&nbsp;
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { watch } from 'vue'
	import { useIntersectionObserver } from '../../composables/Commons/intersectionObserver.composable'
	import { useProps } from '../../composables/Commons/props.composable'

	import type { IInfiniteScrollIntersectProps } from '../../interfaces/InfiniteScroll/infinite-scroll-intersect.interface'

	import type { IInfiniteScrollIntersectEmits } from '../../interfaces/InfiniteScroll/infinite-scroll-intersect.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IInfiniteScrollIntersectProps>(), {})

	const emits = defineEmits<IInfiniteScrollIntersectEmits>()

	const {filterProps} = useProps<IInfiniteScrollIntersectProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {intersectionRef, isIntersecting} = useIntersectionObserver(() => {
	}, props.margin ? {rootMargin: props.margin} : undefined)

	watch(isIntersecting, async (val) => {
		if (!props.side) return
		emits('intersect', {isIntersecting: val, side: props.side})
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>
