<template>
	<template v-if="renderless">
		<slot
				name="renderless"
				v-bind="{ itemRef: resizeRef }"
		/>
	</template>
	<template v-else>
		<div
				ref="resizeRef"
				:class="virtualScrollItemClasses"
				:style="virtualScrollItemStyles"
				v-bind="{ ...attrs }"
		>
			<slot name="default"/>
		</div>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, useAttrs, watch } from 'vue'
	import {
	useProps,
	useResizeObserver,
	useStyle
} from '../../composables'

	import type { IVirtualScrollItemProps} from '../../interfaces'

	import type { IVirtualScrollItemEmits } from '../../interfaces/VirtualScroll/virtual-scroll-item.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, filterProps utility, and raw attributes
	 * forwarded to the non-renderless wrapper div.
	 ********************************************************/
	const props = withDefaults(defineProps<IVirtualScrollItemProps>(), {})

	const emits = defineEmits<IVirtualScrollItemEmits>()

	const {filterProps} = useProps<IVirtualScrollItemProps>(props)

	const attrs = useAttrs()

	/*********************************************************
	 * Resize observation
	 *
	 * @description
	 * ResizeObserver on the item root element emits height
	 * updates to the parent virtual scroll engine so it can
	 * recalculate padding spacers and the visible window.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {resizeRef, contentRect} = useResizeObserver(undefined, 'border')

	watch(() => contentRect.value?.height, (height) => {
		if (height != null) emits('update:height', height)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles for the non-renderless
	 * wrapper div.
	 ********************************************************/
	const virtualScrollItemStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const virtualScrollItemClasses = computed(() => {
		return [
			'origam-virtual-scroll-item',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(virtualScrollItemStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
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

