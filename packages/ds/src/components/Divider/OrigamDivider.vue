<template>
	<hr
			:aria-orientation="dividerOrientation"
			:class="dividerClasses"
			:role="dividerRole"
			:style="dividerStyles"
	/>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef, useAttrs } from 'vue'
	import {
	useBothColor,
	useMargin,
	useProps,
	useStyle
} from '../../composables'
	import { DIRECTION } from '../../enums'

	import type { IDividerProps } from '../../interfaces'

	import { convertToUnit } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and attrs setup. Orientation and role are derived from
	 * the HTML `role` attribute so screen readers can override the
	 * separator semantics when needed.
	 ********************************************************/
	const attrs = useAttrs()

	const props = withDefaults(defineProps<IDividerProps>(), {
		direction: DIRECTION.HORIZONTAL
	})

	const {filterProps} = useProps<IDividerProps>(props)

	/*********************************************************
	 * Accessibility
	 *
	 * @description
	 * Computes aria-orientation and role for the <hr> element.
	 ********************************************************/
	const dividerOrientation = computed(() => {
		return !attrs.role || attrs.role === 'separator'
				? props.direction
				: undefined
	})
	const dividerRole = computed(() => {
		return `${attrs.role || 'separator'}`
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * dividerClasses and dividerStyles computed properties.
	 * Length and thickness are forwarded as CSS custom properties.
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {marginClasses, marginStyles} = useMargin(props)

	const dividerClasses = computed(() => {
		return [
			'origam-divider',
			`origam-divider--${props.direction}`,
			{
				'origam-divider--inset': props.inset
			},
			colorClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const dividerStyles = computed(() => {
		const styles = [
			marginStyles.value,
			colorStyles.value,
			props.style
		]

		if (props.length) {
			styles.push({[props.direction === DIRECTION.VERTICAL ? '--origam-divider---max-height' : '--origam-divider---max-width']: convertToUnit(props.length)})
		}

		if (props.thickness) {
			styles.push({[props.direction === DIRECTION.VERTICAL ? '--origam-divider---border-right-width' : '--origam-divider---border-top-width']: convertToUnit(props.thickness)})
		}

		return styles as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(dividerStyles)


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
	.origam-divider {
		display: block;
		flex: 1 1 100%;
		height: 0px;
		max-height: 0px;
		max-width: var(--origam-divider---max-width, 100%);
		opacity: var(--origam-divider---opacity, 0.12);
		transition: inherit;
		border-style: solid;

		border-top-width: var(--origam-divider---border-top-width, thin);
		border-right-width: 0;
		border-bottom-width: 0;
		border-left-width: 0;
		margin: 0;

		&--vertical {
			align-self: stretch;
			border-top-width: 0;
			border-right-width: var(--origam-divider---border-right-width, thin);
			border-bottom-width: 0;
			border-left-width: 0;
			display: inline-flex;
			height: auto;
			margin-left: -1px;
			max-height: var(--origam-divider---max-height, 100%);
			max-width: 0px;
			vertical-align: text-bottom;
			width: 0px;
		}

		&--inset {
			margin-inline-start: var(--origam-divider--inset---margin-inline-start, 16px);
			max-width: calc(100% - var(--origam-divider--inset---margin-inline-start, 16px));

			&.origam-divider--vertical {
				margin-block-start: var(--origam-divider--inset---margin-block-start, 8px);
				max-height: calc(100% - var(--origam-divider--inset---margin-block-start, 8px) * 2);
			}
		}
	}
</style>
