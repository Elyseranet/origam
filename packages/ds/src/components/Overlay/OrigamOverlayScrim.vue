<template>
	<origam-transition
			:disabled="disabled"
			:transition="transition"
	>
		<component
				:is="tag"
				v-if="active"
				:id="id"
				:class="scrimClasses"
				:style="scrimStyles"
				aria-hidden="true"
				v-bind="$attrs"
				@click="handleClick"
				@mouseenter="handleMouseenter"
				@mouseleave="handleMouseleave"
		/>
	</origam-transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'
	import OrigamFade from '../Transition/OrigamFade.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'
	import { useBackgroundColor } from '../../composables/Commons/backgroundColor.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import type { IOverlayScrimProps } from '../../interfaces/Overlay/overlay-scrim.interface'

	import type { IOverlayScrimEmits, IOverlayScrimSlots } from '../../interfaces/Overlay/overlay-scrim.interface'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the OverlayScrim component.
	 ********************************************************/
	const props = withDefaults(defineProps<IOverlayScrimProps>(), {
		tag: 'div',
		transition: () => ({component: OrigamFade}) as unknown as TTransitionProps
	})

	const emits = defineEmits<IOverlayScrimEmits>()

	defineSlots<IOverlayScrimSlots>()

	const {filterProps} = useProps<IOverlayScrimProps>(props)

	/*********************************************************
	 * Background color
	 *
	 * @description
	 * When `scrim` is a color string, backgroundColorStyles injects
	 * an inline background-color declaration.
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {backgroundColorClasses, backgroundColorStyles} = useBackgroundColor(computed(() => {
		return typeof props.scrim === 'string' ? props.scrim : null
	}))

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Forwarded click, mouseenter and mouseleave events so the parent
	 * overlay can hook into scrim interactions.
	 ********************************************************/
	const handleClick = (e: MouseEvent) => {
		emits('click', e)
	}
	const handleMouseenter = (e: MouseEvent) => {
		emits('mouseenter', e)
	}
	const handleMouseleave = (e: MouseEvent) => {
		emits('mouseleave', e)
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * scrimStyles and scrimClasses compose the BEM element.
	 ********************************************************/
	const scrimStyles = computed(() => {
		return [
			backgroundColorStyles.value,
			props.style
		] as StyleValue
	})
	const scrimClasses = computed(() => {
		return [
			'origam-scrim',
			backgroundColorClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(scrimStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
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
	.origam-scrim {
		background-color: var(--origam-overlay-scrim---background-color, var(--origam-color__overlay---scrim)); // TODO: rename to color.overlay.backdrop once #arbitration2 resolved
		backdrop-filter: var(--origam-overlay-scrim---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-overlay-scrim---backdrop-filter, none);
		pointer-events: var(--origam-overlay-scrim---pointer-events, auto);
		border-radius: var(--origam-overlay-scrim---border-radius, inherit);
		inset: 0;
		opacity: var(--origam-overlay-scrim---opacity, 0.32);
		position: var(--origam-overlay-scrim---position, fixed);
		transition-property: var(--origam-overlay-scrim---transition-property, opacity);
		transition-duration: var(--origam-overlay-scrim---transition-duration, 200ms);
		transition-timing-function: var(--origam-overlay-scrim---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
	}
</style>
