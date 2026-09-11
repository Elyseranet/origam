<template>
	<component
			:is="tag"
			:class="rowClasses"
			:style="rowStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, type Ref, StyleValue, toRef } from 'vue'
	import {
	useBorder,
	useBothColor,
	useDensity,
	useMargin,
	usePadding,
	useProps,
	useStyle
} from '../../composables'
	import { DENSITY } from '../../enums'

	import type { IRowProps } from '../../interfaces'
	import type { TColor } from '../../types'

	import { toKebabCase } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and composable setup.
	 ********************************************************/
	const props = withDefaults(defineProps<IRowProps>(), {tag: 'div', density: DENSITY.DEFAULT})

	const {filterProps} = useProps<IRowProps>(props)

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(
		toRef(props, 'bgColor') as Ref<TColor | undefined>,
		toRef(props, 'color') as Ref<TColor | undefined>
	)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const rowStyles = computed(() => {
		return [
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			props.style
		] as StyleValue
	})
	const rowClasses = computed(() => {
		const classes = [
			'origam-row',
			colorClasses.value,
			densityClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]

		const propFamilies = {
			align:     ['align',   'alignSm',   'alignMd',   'alignLg',   'alignXl',   'alignXxl'],
			justify:   ['justify', 'justifySm', 'justifyMd', 'justifyLg', 'justifyXl', 'justifyXxl'],
			direction: ['direction']
		}

		for (const family in propFamilies) {
			propFamilies[family as keyof typeof propFamilies].forEach((prop) => {
				const value = props[prop as keyof typeof props]
				if (value) classes.push(`origam-row--${toKebabCase(prop)}-${value}`)
			})
		}

		return classes
	})
	const {id, css, load, isLoaded, unload} = useStyle(rowStyles)


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
	$breakpoints: ('sm': 600px, 'md': 960px, 'lg': 1280px, 'xl': 1920px, 'xxl': 2560px);
	$justifies: ('start': flex-start, 'end': flex-end, 'center': center, 'space-between': space-between, 'space-around': space-around, 'space-evenly': space-evenly);
	$aligns: ('start': flex-start, 'end': flex-end, 'center': center, 'baseline': baseline, 'stretch': stretch);

	.origam-row {
		display: var(--origam-row---display);
		flex-direction: var(--origam-row---flex-direction);
		flex-wrap: var(--origam-row---flex-wrap);
		flex: var(--origam-row---flex);
		align-items: var(--origam-row---align-items);
		justify-content: var(--origam-row---justify-content);
		box-sizing: var(--origam-row---box-sizing);

		padding-block-start: var(--origam-container---padding-block-start);
		padding-block-end: var(--origam-container---padding-block-end);
		padding-inline-start: var(--origam-container---padding-inline-start);
		padding-inline-end: var(--origam-container---padding-inline-end);

		margin-block-start: calc(var(--origam-row---margin-block-start) + var(--origam-row---density));
		margin-block-end: calc(var(--origam-row---margin-block-end) + var(--origam-row---density));
		margin-inline-start: calc(var(--origam-row---margin-inline-start) + var(--origam-row---density));
		margin-inline-end: calc(var(--origam-row---margin-inline-end) + var(--origam-row---density));

		+ .v-row {
			margin-block-start: calc((var(--origam-row---margin-block-start) + var(--origam-row---density)) * -1);
		}

		&--density-default {
			--origam-row---density: 0;
		}

		&--density-compact {
			--origam-row---density: -8px;
		}

		&--density-comfortable {
			--origam-row---density: 8px;
		}

		&--border {
			border-width: var(--origam-row--border---border-width);
			box-shadow: var(--origam-row--border---box-shadow);
		}

		@each $align, $alignAttr in $aligns {
			&--align-#{$align} {
				--origam-row---align-items: #{$alignAttr};
			}
		}

		@each $justify, $justifyAttr in $justifies {
			&--justify-#{$justify} {
				--origam-row---justify-content: #{$justifyAttr};
			}
		}

		@each $direction in (row, row-reverse, column, column-reverse) {
			&--direction-#{$direction} {
				--origam-row---flex-direction: #{$direction};
			}
		}

		@each $breakpoint, $breakpointSize in $breakpoints {
			@each $align, $alignAttr in $aligns {
				&--align-#{$breakpoint}-#{$align} {
					@media (min-width: $breakpointSize) {
						--origam-row---align-items: #{$alignAttr};
					}
				}
			}

			@each $justify, $justifyAttr in $justifies {
				&--justify-#{$breakpoint}-#{$justify} {
					@media (min-width: $breakpointSize) {
						--origam-row---justify-content: #{$justifyAttr};
					}
				}
			}
		}
	}
</style>

<style>
	:root {
		--origam-row---display: flex;
		--origam-row---flex-direction: row;
		--origam-row---flex-wrap: wrap;
		--origam-row---flex: 1 1 auto;

		--origam-row---box-sizing: border-box;

		--origam-row---padding-block-start: 0;
		--origam-row---padding-block-end: 0;
		--origam-row---padding-inline-start: 0;
		--origam-row---padding-inline-end: 0;

		--origam-row---margin-block-start: -4px;
		--origam-row---margin-block-end: -4px;
		--origam-row---margin-inline-start: -4px;
		--origam-row---margin-inline-end: -4px;

		--origam-row---density: 0;

		--origam-row---align-items: stretch;
		--origam-row---justify-content: flex-start
	}
</style>
