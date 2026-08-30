<template>
	<component
			:is="tag"
			:id="id"
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
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useLayoutItem } from '../../composables/Commons/layoutItem.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import type { ICommonsComponentSlots } from '../../interfaces/Commons/commons.interface'
	import type { ISystemBarEmits, ISystemBarProps } from '../../interfaces/SystemBar/system-bar.interface'

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

	defineEmits<ISystemBarEmits>()

	defineSlots<ICommonsComponentSlots>()

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
	/*********************************************************
	 * explicitElementSize
	 *
	 * @description
	 * #440-3 — `elementSize` (unlike `layoutSize`) makes useLayoutItem
	 * write a literal `height: {n}px` inline style, flattened by
	 * useStyle() into a `#origam-system-bar-{n} { height: … }` rule.
	 * An ID selector always beats the component's own
	 * `.origam-system-bar--window { height: var(--origam-system-bar---
	 * height-window, 32px) }` class rule, so the token was dead in the
	 * one documented usage of the component (inside an OrigamLayout):
	 * no theme override of the height token could ever apply.
	 * Only force the literal when the consumer passed an explicit
	 * `height` prop — an intentional override that should win over the
	 * theme, same as everywhere else in the DS. Otherwise `elementSize`
	 * stays undefined so no inline height is emitted and the CSS var /
	 * theme resolves the visual height; `layoutSize` still carries the
	 * JS default (24 / 32) for sibling offset math, unchanged.
	 ********************************************************/
	const explicitElementSize = computed(() => props.height !== undefined ? height.value : undefined)
	const {layoutItemStyles} = useLayoutItem({
		id: props.name,
		order: computed(() => parseInt(String(props.order ?? 0), 10)),
		position: shallowRef('top'),
		layoutSize: height,
		elementSize: explicitElementSize,
		active: computed(() => true),
		absolute: toRef(props, 'absolute')
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles.
	 ********************************************************/
	/*********************************************************
	 * systemBarStyles
	 *
	 * @description
	 * #383 — layoutItemStyles MUST come before dimensionStyles here.
	 * useStyle() flattens every source into ONE #id{...} rule, so source
	 * order (not specificity) decides which width declaration wins when
	 * both are present. useLayoutItem unconditionally writes
	 * width: calc(100% - left - right) while docked in an OrigamLayout —
	 * placing it FIRST lets a consumer-supplied width (from
	 * dimensionStyles) override it, instead of the layout's calc()
	 * silently winning every time (same root cause as OrigamBottomNav).
	 ********************************************************/
	const systemBarStyles = computed(() => {
		return [
			layoutItemStyles.value,
			borderStyles.value,
			roundedStyles.value,
			dimensionStyles.value,
			colorStyles.value,
			typographyStyles.value,
			ssrBootStyles.value,
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
	const {id, css, load, isLoaded, unload} = useStyle(systemBarStyles, () => props.id)


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

