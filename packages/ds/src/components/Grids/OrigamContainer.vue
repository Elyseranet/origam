<template>
	<component
			:is="tag"
			:id="id"
			:class="containerClasses"
			:style="containerStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRtl } from '../../composables/Commons/rtl.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type {
		IContainerEmits,
		IContainerProps,
		IContainerSlots
	} from '../../interfaces/Grids/container.interface'

	import { computed, StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IContainerProps>(), {tag: 'div', fluid: false})

	const {filterProps} = useProps<IContainerProps>(props)

	defineEmits<IContainerEmits>()

	defineSlots<IContainerSlots>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {rtlClasses} = useRtl()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const containerStyles = computed(() => {
		return [
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const containerClasses = computed(() => {
		return [
			'origam-container',
			{
				'origam-container--fluid': props.fluid,
				'origam-container--fullscreen': props.fullscreen
			},
			rtlClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(containerStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
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
	.origam-container {
		box-sizing: var(--origam-container---box-sizing);
		align-items: var(--origam-container---align-items);
		display: var(--origam-container---display);

		width: var(--origam-container---width);
		max-width: var(--origam-container---max-width);
		min-width: var(--origam-container---min-width);
		height: var(--origam-container---height);
		max-height: var(--origam-container---max-height);
		min-height: var(--origam-container---min-height);

		padding-block-start: var(--origam-container---padding-block-start);
		padding-block-end: var(--origam-container---padding-block-end);
		padding-inline-start: var(--origam-container---padding-inline-start);
		padding-inline-end: var(--origam-container---padding-inline-end);

		margin-block-start: var(--origam-container---margin-block-start);
		margin-block-end: var(--origam-container---margin-block-end);
		margin-inline-start: var(--origam-container---margin-inline-start);
		margin-inline-end: var(--origam-container---margin-inline-end);

    &--is-rtl {
      direction: rtl;
    }

    &--is-ltr {
      direction: ltr;
    }

		&--border {
			border-width: var(--origam-container--border---border-width);
			box-shadow: var(--origam-container--border---box-shadow);
		}

		@media (min-width: 960px) {
			--origam-container---max-width: var(--origam-container---max-width-md, 768px);
		}

		@media (min-width: 1280px) {
			--origam-container---max-width: var(--origam-container---max-width-lg, 992px);
		}

		@media (min-width: 1920px) {
			--origam-container---max-width: var(--origam-container---max-width-xl, 1280px);
		}

		@media (min-width: 2560px) {
			--origam-container---max-width: var(--origam-container---max-width-xxl, 1440px);
		}

		&--fluid {
			--origam-container---max-width: 100%;
		}

		&--fullscreen {
			--origam-container---max-width: 100%;
			--origam-container---height: 100%;
			--origam-container---align-items: center;
			--origam-container---display: flex;
		}
	}
</style>

<style>
	:root {
		--origam-container---box-sizing: border-box;

		--origam-container---width: auto;
		--origam-container---max-width: 100%;
		--origam-container---min-width: 0;
		--origam-container---height: auto;
		--origam-container---max-height: 100%;
		--origam-container---min-height: 0;

		--origam-container---padding-block-start: 16px;
		--origam-container---padding-block-end: 16px;
		--origam-container---padding-inline-start: 16px;
		--origam-container---padding-inline-end: 16px;

		--origam-container---margin-block-start: 0;
		--origam-container---margin-block-end: 0;
		--origam-container---margin-inline-end: auto;
		--origam-container---margin-inline-start: auto;

		--origam-container---align-items: auto;
		--origam-container---display: block;
	}
</style>
