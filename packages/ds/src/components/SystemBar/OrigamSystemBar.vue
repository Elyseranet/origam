<template>
	<component
			:is="tag"
			v-contrast
			:class="systemBarClasses"
			:style="systemBarStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, shallowRef, StyleValue, toRef } from "vue"
	import {
		useBorder,
		useBothColor,
		useDimension,
		useElevation,
		useLayoutItem,
		useProps,
		useRounded,
		useSsrBoot,
		useStyle,
		useTypography
	} from "../../composables"

	import { vContrast } from "../../directives"

	import type { ISystemBarProps } from "../../interfaces"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<ISystemBarProps>(), {
		tag: 'div'
	})

	const {filterProps} = useProps<ISystemBarProps>(props)

	/*********************************************************
	 * Layout
	 *
	 * @description
	 * Layout item registration — positions the system bar at
	 * the top of the layout with a height derived from the
	 * `window` prop (32px) or default (24px).
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedStyles, roundedClasses} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {typographyStyles} = useTypography(props, 'system-bar')

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	const {ssrBootStyles} = useSsrBoot()
	const height = computed(() => props.height ?? (props.window ? 32 : 24))
	const {layoutItemStyles} = useLayoutItem({
		id: props.name,
		order: computed(() => parseInt(String(props.order ?? 0), 10)),
		position: shallowRef('top'),
		layoutSize: height,
		elementSize: height,
		active: computed(() => true),
		absolute: toRef(props, 'absolute')
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles.
	 ********************************************************/
	const systemBarStyles = computed(() => {
		return [
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			colorStyles.value,
			typographyStyles.value,
			ssrBootStyles.value,
			layoutItemStyles.value,
			props.style
		] as StyleValue
	})
	const systemBarClasses = computed(() => {
		return [
			'origam-system-bar',
			{
				'origam-system-bar--window': props.window
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(systemBarStyles)


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

<style
		lang="scss"
		scoped
>
	.origam-system-bar {
		align-items: var(--origam-system-bar---align-items, center);
		box-sizing: var(--origam-system-bar---box-sizing, border-box);
		display: var(--origam-system-bar---display, flex);
		flex: var(--origam-system-bar---flex, 1 1 auto);
		height: var(--origam-system-bar---height, 24px);
		justify-content: var(--origam-system-bar---justify-content, flex-end);
		max-width: var(--origam-system-bar---max-width, 100%);
		padding-inline: var(--origam-system-bar---padding-inline, 8px);
		position: var(--origam-system-bar---position, relative);
		text-align: var(--origam-system-bar---text-align, end);
		width: var(--origam-system-bar---width, 100%);
		background: var(--origam-system-bar---background, var(--origam-color__neutral---700, #404040));
		color: var(--origam-system-bar---color, var(--origam-color__text---inverse, #FFFFFF));
		font-size: var(--origam-system-bar---font-size, .75rem);
		font-weight: var(--origam-system-bar---font-weight, 400);
		letter-spacing: var(--origam-system-bar---letter-spacing, .0333333333em);
		line-height: var(--origam-system-bar---line-height, 1.667);
		text-transform: var(--origam-system-bar---text-transform, none);

		.origam-icon {
			opacity: var(--origam-system-bar__icon---opacity, 0.7);
		}

		&--absolute {
			position: absolute;
		}

		&--fixed {
			position: fixed;
		}

		&--rounded {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&--window {
			height: var(--origam-system-bar---height-window, 32px);
		}
	}
</style>

