<template>
	<div
			:id="layoutId"
			ref="origamLayoutRef"
			:class="layClasses"
			:style="layStyles"
	>
		<div
				:id="`${layoutId}-wrapper`"
				class="origam-layout__wrapper"
		>
			<slot name="default"/>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import {
	useBorder,
	useBothColor,
	useCreateLayout,
	useDimension,
	useElevation,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useStyle
} from '../../composables'

	import type { ILayoutProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, layout composable and template ref wiring.
	 ********************************************************/

	const props = withDefaults(defineProps<ILayoutProps>(), {})

	const {filterProps} = useProps<ILayoutProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {layoutClasses, layoutStyles, layoutRef: origamLayoutRef, getLayoutItem, items, layoutId} = useCreateLayout(props)
	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {dimensionStyles} = useDimension(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles. `layoutStyles` from
	 * useCreateLayout emits the `--origam-layout---position-{left,right,
	 * top,bottom}` CSS custom properties that reflect the reserved-space
	 * each registered layout item (drawer, bottom nav, system bar, …)
	 * carved out of the layout. Descendants (toolbar, main, footer)
	 * inherit them and offset themselves accordingly — that's the "push
	 * content" behaviour. Without binding them onto the root, drawers
	 * register their width but main / toolbar never receive the offset.
	 ********************************************************/

	const layStyles = computed(() => {
		return [
			layoutStyles.value,
			colorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const layClasses = computed(() => {
		return [
			layoutClasses.value,
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(layStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components.
	 ********************************************************/

	defineExpose({
		getLayoutItem,
		items,
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
	.origam-layout {
		// position: relative makes this the containing block for any
		// position:absolute / position:relative descendants (drawer,
		// scrim, …) so their `height: 100 %` resolves against the
		// layout — NOT the viewport.
		position: relative;

		// `height: 100 %` so the layout inherits its parent's bounds
		// (typical consumer wraps OrigamApp in a fixed-height container
		// — story divs, Tauri windows, embedded dashboards …). Without
		// this, the layout collapses to its content height, and the
		// drawer's `height: 100 %` can't compute a meaningful value.
		height: 100%;
		width: 100%;

		&__wrapper {
			width: 100%;
			// `height: 100 %` (not just `max-height`) so nested drawers
			// in `height: 100 %` measure against the wrapper, not the
			// viewport. Without this, the drawer inflated to 100 vh and
			// overflowed any story / consumer container with a fixed
			// height ("le drawer dépasse de son layout").
			height: 100%;
			max-height: 100%;
			max-width: 100%;
		}

		&--full-height &__wrapper {
			// `min-height` (not `height`) — full-height means "occupy AT
			// LEAST the viewport", not "clip to exactly the viewport".
			// A fixed `height: 100vh` kept the wrapper's own box capped
			// at one screen even when its content (app-bar + main slot)
			// grows taller — the overflow still rendered (no
			// `overflow: hidden` here) but the wrapper's box, and
			// anything painting a background on an ancestor sized off
			// it, never grew to match, leaving a visible gap below the
			// first viewport on any page taller than one screen.
			width: 100vw;
			min-height: 100vh;
		}
	}
</style>

