<template>
	<component
			:is="tag"
			:class="mainClasses"
			:style="mainStyles"
	>
		<div
				:class="{'origam-main__scroller': scrollable}"
				class="origam-main__wrapper"
		>
			<slot name="default"/>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import {
	useBorder,
	useBothColor,
	useElevation,
	useLayout,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useSsrBoot,
	useStyle
} from '../../composables'

	import type { IMainProps } from '../../interfaces'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props / filterProps for the component.
	 ********************************************************/
	const props = withDefaults(defineProps<IMainProps>(), {tag: 'main'})

	const {filterProps} = useProps<IMainProps>(props)

	/*********************************************************
	 * Layout & decorators
	 *
	 * @description
	 * Layout position offsets, SSR boot guard, rounded, border,
	 * padding and margin composables.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {mainStyles: mainLayoutStyles} = useLayout()
	const {ssrBootStyles} = useSsrBoot()
	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {elevationClasses} = useElevation(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * mainStyles aggregates layout, ssr-boot and decorator styles.
	 * mainClasses emits BEM modifiers.
	 ********************************************************/
	const mainStyles = computed(() => {
		return [
			mainLayoutStyles.value,
			ssrBootStyles.value,
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const mainClasses = computed(() => {
		return [
			'origam-main',
			{
				'origam-main--scrollable': props.scrollable
			},
			colorClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(mainStyles)


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
	.origam-main {
		$this: &;

		flex: var(--origam-main---flex);
		max-width: var(--origam-main---max-width);
		transition-duration: var(--origam-main---transition-duration);
		transition-property: var(--origam-main---transition-property);
		transition-timing-function: var(--origam-main---transition-timing-function);
		padding-inline-start: var(--origam-layout---position-left);
		padding-inline-end: var(--origam-layout---position-right);
		padding-block-start: var(--origam-layout---position-top);
		padding-block-end: var(--origam-layout---position-bottom);

		&__scroller {
			max-width: var(--origam-main__scroller---max-width);
			position: var(--origam-main__scroller---position);
		}

		&--scrollable {
			display: var(--origam-main---display);
			position: var(--origam-main---position);
			top: var(--origam-main---position-top);
			left: var(--origam-main---position-left);
			width: var(--origam-main---width);
			height: var(--origam-main---height);

			#{$this}__scroller {
				flex: 1 1 auto;
				overflow-y: auto;

				--origam-layout---position-left: 0px;
				--origam-layout---position-right: 0px;
				--origam-layout---position-top: 0px;
				--origam-layout---position-bottom: 0px;
			}
		}
	}
</style>
