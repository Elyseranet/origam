<template>
	<component
			:is="iconData.component"
			:aria-hidden="!attrs.onClick"
			:class="iconClasses"
			:icon="iconData.icon"
			:role="attrs.onClick ? 'button' : undefined"
			:size="size"
			:style="iconStyles"
			:tag="tag"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, toRef, useAttrs, useSlots } from 'vue'
	import {
	useBorder,
	useBothColor,
	useDimension,
	useIcon,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useSize,
	useStyle
} from '../../composables'

	import type { IIconComponentProps } from '../../interfaces'

	import { flattenFragments } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, composables, and slot icon resolution.
	 ********************************************************/
	const attrs = useAttrs()

	const props = withDefaults(defineProps<IIconComponentProps>(), {tag: 'i'})

	const {filterProps} = useProps<IIconComponentProps>(props)

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {dimensionStyles} = useDimension(props)
	const {sizeClasses, sizeStyles} = useSize(props)
	const slots = useSlots()
	const {iconData} = useIcon(computed(() => slotIcon.value || props.icon))

	const slotIcon = ref<string>()

	if (slots.default && slots.default?.()) {
		slotIcon.value = flattenFragments(slots.default?.()).filter(node =>
				node.type === Text && node.children && typeof node.children === 'string'
		)[0]?.children as string
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const iconStyles = computed(() => {
		return [
			colorStyles.value,
			sizeStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})
	const iconClasses = computed(() => {
		return [
			'origam-icon',
			{
				'origam-icon--clickable': !!attrs.onClick
			},
			colorClasses.value,
			sizeClasses.value,
			borderClasses.value,
			roundedClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(iconStyles)


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
>
	.origam-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--origam-icon---color, currentColor);
		transition-duration: var(--origam-icon---transition-duration, 150ms);
		transition-timing-function: var(--origam-icon---transition-timing-function, ease);
		transition-property: color, background-color, transform;

		&--clickable {
			cursor: pointer;
		}

		&--size-x-small {
			font-size: var(--origam-icon---font-size-xs, 1em);
		}

		&--size-small {
			font-size: var(--origam-icon---font-size-sm, 1.25em);
		}

		&--size-default {
			font-size: var(--origam-icon---font-size-md, 1.5em);
		}

		&--size-large {
			font-size: var(--origam-icon---font-size-lg, 1.75em);
		}

		&--size-x-large {
			font-size: var(--origam-icon---font-size-xl, 2em);
		}
	}
</style>
