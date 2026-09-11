<template>
	<component
			:is="tag"
			v-contrast
			:class="listSubheaderClasses"
			:style="listSubheaderStyles"
	>
		<div
				v-if="hasText"
				class="origam-list-subheader__text"
		>
			<slot
					name="default"
					v-bind="{title}"
			>
				{{ title }}
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef, useSlots } from 'vue'
	import {
	useBorder,
	useBothColor,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useStyle,
	useTypography
} from '../../composables'

	import { vContrast } from '../../directives'

	import type { IListSubheader } from '../../interfaces'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListSubheader>(), {tag: 'div'})

	const {filterProps} = useProps<IListSubheader>(props)

	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {typographyStyles} = useTypography(props, 'list-subheader')
	const slots = useSlots()

	const hasText = computed(() => {
		return slots.default || props.title
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const listSubheaderStyles = computed(() => {
		return [
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const listSubheaderClasses = computed(() => {
		return [
			'origam-list-subheader',
			{
				'origam-list-subheader--inset': props.inset,
				'origam-list-subheader--sticky': props.sticky
			},
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(listSubheaderStyles)


	/*********************************************************
	 * Expose
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
	.origam-list-subheader {
		align-items: center;
		background: inherit;
		color: var(--origam-list-subheader---color, var(--origam-color__text---secondary));
		display: flex;
		font-size: var(--origam-list-subheader---font-size, 0.875rem);
		font-weight: var(--origam-list-subheader---font-weight, 400);
		line-height: var(--origam-list-subheader---line-height, 1.375rem);
		padding-inline-end: var(--origam-list-subheader---padding-inline-end, 16px);
		min-height: var(--origam-list-subheader---min-height, 40px);
		transition: var(--origam-list-subheader---transition-duration, 0.2s) min-height var(--origam-list-subheader---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));

		&__text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&--inset {
			--origam-list---indent-padding: var(--origam-list-subheader---inset-indent-padding, 32px);
		}

		&--sticky {
			background: inherit;
			left: 0;
			position: sticky;
			top: 0;
			z-index: 1;
		}
	}
</style>
