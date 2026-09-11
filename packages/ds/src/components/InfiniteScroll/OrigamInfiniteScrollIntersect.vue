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
	import { useIntersectionObserver, useProps } from '../../composables'

	import type { IInfiniteScrollIntersectProps} from '../../interfaces'

	import type { IInfiniteScrollIntersectEmits } from '../../interfaces/InfiniteScroll/infinite-scroll.interface'

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
