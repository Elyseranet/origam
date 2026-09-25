<template>
	<template v-if="renderless">
		<slot
				name="renderless"
				v-bind="{ itemRef: resizeRef }"
		/>
	</template>
	<template v-else>
		<div
				:id="id"
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
	import { useProps } from '../../composables/Commons/props.composable'
	import { useResizeObserver } from '../../composables/Commons/resizeObserver.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { IVirtualScrollItemProps } from '../../interfaces/VirtualScroll/virtual-scroll-item.interface'

	import type { IVirtualScrollItemEmits, IVirtualScrollItemSlots } from '../../interfaces/VirtualScroll/virtual-scroll-item.interface'

	/*
	 * inheritAttrs — #916 / #853
	 *
	 * The root `v-if` chain is MIXED: `v-if="renderless"` renders
	 * `<slot name="renderless">` (a FRAGMENT vnode — `renderSlot()` always
	 * returns one), while `v-else` renders a single wrapper `<div>`. Vue
	 * cannot merge fallthrough attributes onto the fragment branch and logs
	 * "Extraneous non-props attributes", whose trace serialises every
	 * ancestor's props including Vue Router's `RouteProvider` vnode
	 * (~4.4 MB per occurrence, #853).
	 *
	 * The non-renderless branch ALREADY re-binds them by hand —
	 * `v-bind="{ ...attrs }"` with `attrs = useAttrs()` below — so this flag
	 * removes a duplicate attempt, not a working one. Measured on `develop`
	 * before the flag: `class` / `data-cy` / `aria-label` landed in the
	 * `v-else` branch (via BOTH paths, deduplicated by `mergeProps`) and
	 * nowhere in the renderless branch. Behaviour is unchanged.
	 *
	 * ⛔ Note why `useAttrs()` did NOT already silence the warning: Vue skips
	 * it only when `$attrs` was read through the PUBLIC instance proxy during
	 * the render (`markAttrsAccessed()`). `useAttrs()` returns
	 * `instance.attrs` directly and never marks the access, so the warning
	 * fired on every render regardless — measured at 2 occurrences per
	 * renderless mount.
	 */
	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, filterProps utility, and raw attributes
	 * forwarded to the non-renderless wrapper div.
	 ********************************************************/
	const props = withDefaults(defineProps<IVirtualScrollItemProps>(), {})

	const emits = defineEmits<IVirtualScrollItemEmits>()

	defineSlots<IVirtualScrollItemSlots>()

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
	const {id, css, load, isLoaded, unload} = useStyle(virtualScrollItemStyles, () => props.id)


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

