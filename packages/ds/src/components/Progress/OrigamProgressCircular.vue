<template>
	<component
			:is="tag"
			:id="id"
			ref="root"
			:aria-busy="indeterminate ? true : undefined"
			:aria-hidden="!active"
			:aria-label="progressAriaLabel"
			:aria-valuemax="max"
			:aria-valuenow="indeterminate ? undefined : normalizedValue"
			:class="progressCircularClasses"
			:style="progressCircularStyles"
			aria-valuemin="0"
			role="progressbar"
	>
		<svg
				:style="svgStyles"
				:viewBox="svgViewBox"
				xmlns="http://www.w3.org/2000/svg"
		>
			<circle
					:r="MAGIC_RADIUS"
					:class="progressUnderlayClasses"
					:stroke-dasharray="CIRCUMFERENCE"
					:stroke-width="strokeWidth"
					:style="backgroundStyles"
					cx="50%"
					cy="50%"
					fill="transparent"
					stroke-dashoffset="0"
			/>

			<circle
					:r="MAGIC_RADIUS"
					:class="progressOverlayClasses"
					:stroke-dasharray="CIRCUMFERENCE"
					:stroke-dashoffset="strokeDashOffset"
					:stroke-width="strokeWidth"
					:style="loaderStyles"
					cx="50%"
					cy="50%"
					fill="transparent"
			/>
		</svg>

		<div
				v-if="hasContent"
				class="origam-progress__content"
		>
			<slot
					name="default"
					v-bind="{ value: normalizedValue }"
			/>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, toRef, watchEffect } from 'vue'
	import { useIntersectionObserver } from '../../composables/Commons/intersectionObserver.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProgress } from '../../composables/Progress/progress.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useResizeObserver } from '../../composables/Commons/resizeObserver.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'

	import { CIRCUMFERENCE, MAGIC_RADIUS } from '../../consts/Progress/progress.const'

	import type {
		IProgressCircularEmits,
		IProgressCircularProps,
		IProgressCircularSlots
	} from '../../interfaces/Progress/progress-circular.interface'

	import { convertToUnit, int } from '../../utils/Commons/commons.util'

	import { SIZES } from '../../enums/Commons/size.enum'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the ProgressCircular component.
	 * Default size to `SIZES.DEFAULT` so the SCSS rule
	 * `.origam-progress--circular.origam-progress--size-default`
	 * pins width/height — without this the SVG (position: absolute)
	 * collapses to 0×0 and the component renders invisible.
	 *
	 * Why not the native `<progress>` element (#500): it has no
	 * circular rendering model at all — per the HTML spec it is an
	 * inherently horizontal-bar element, so it cannot express a ring.
	 * The ARIA `role="progressbar"` + `aria-value*` contract below
	 * gives assistive tech the exact same semantics natively-supported
	 * `<progress>` would, without requiring one.
	 ********************************************************/
	const props = withDefaults(defineProps<IProgressCircularProps>(), {
		tag: 'div',
		modelValue: 0,
		max: 100,
		thickness: 4,
		size: SIZES.DEFAULT,
		rotate: 0,
		active: true,
		label: 'origam.loading'
	})

	defineEmits<IProgressCircularEmits>()

	defineSlots<IProgressCircularSlots>()

	const {filterProps} = useProps<IProgressCircularProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Root element ref for resize / intersection observers.
	 ********************************************************/
	const root = ref<HTMLElement>()

	/*********************************************************
	 * Decorators & size
	 *
	 * @description
	 * Progress composable, resize / intersection observers, size
	 * and color utilities.
	 * Pass an explicit name so `useSize` emits
	 * `origam-progress--size-{size}`, matching the SCSS rule
	 * `.origam-progress--circular.origam-progress--size-x` —
	 * otherwise the class would be `origam-progress-circular--size-x`
	 * and the pinned width/height would never apply (0×0 SVG).
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {progressClasses, progressStyles, normalizedValue, thickness, hasContent} = useProgress(props)
	const {resizeRef, contentRect} = useResizeObserver()
	const {intersectionRef} = useIntersectionObserver()
	const {sizeStyles, sizeClasses} = useSize(props, 'origam-progress')

	const {t} = useLocale()

	/*********************************************************
	 * Accessibility
	 *
	 * @description
	 * #500 — own ARIA semantics (role, aria-value.., aria-label, aria-hidden)
	 * moved down from the `<OrigamProgress>` wrapper so a consumer who
	 * mounts this component standalone (both are exported publicly) still
	 * gets an accessible progress bar.
	 ********************************************************/
	const progressAriaLabel = computed(() => t(props.label))

	/*********************************************************
	 * Color
	 ********************************************************/

	const {textColorStyles: backgroundColorStyles, textColorClasses: backgroundColorClasses} = useTextColor(toRef(props, 'bgColor'))
	const {textColorStyles: loaderColorStyles, textColorClasses: loaderColorClasses} = useTextColor(toRef(props, 'color'))

	/*********************************************************
	 * SVG geometry
	 *
	 * @description
	 * Derived dimensions for the circular SVG track.
	 ********************************************************/
	/*********************************************************
	 * size
	 *
	 * @description
	 * #384 — `Number(props.size)` returned NaN for any CSS
	 * length string (`Number('48px')` === NaN). Unlike the
	 * dimension components in this ticket, this value isn't a
	 * CSS declaration silently dropped on an invalid value —
	 * it feeds SVG geometry math (`diameter`, `strokeWidth`,
	 * `svgViewBox`), so NaN poisoned all three and produced an
	 * invalid `viewBox="0 0 NaN NaN"`. `int()` parses both a
	 * bare number and a CSS-length string.
	 ********************************************************/
	const size = computed(() => {
		if (sizeStyles.value.length) {
			return int(props.size)
		}

		if (contentRect.value) {
			return contentRect.value.width
		}

		return Math.max(thickness.value, 32)
	})
	const diameter = computed(() => {
		return (MAGIC_RADIUS / (1 - thickness.value / size.value)) * 2
	})
	const strokeWidth = computed(() => {
		return thickness.value / size.value * diameter.value
	})
	const strokeDashOffset = computed(() => {
		return convertToUnit(((100 - normalizedValue.value) / 100) * CIRCUMFERENCE)
	})
	const svgViewBox = computed(() => {
		return `0 0 ${diameter.value} ${diameter.value}`
	})

	watchEffect(() => {
		intersectionRef.value = root.value
		resizeRef.value = root.value
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * progressCircularStyles and progressCircularClasses compose
	 * the BEM block.
	 ********************************************************/
	const progressCircularStyles = computed(() => {
		return [
			progressStyles.value,
			props.style
		] as StyleValue
	})
	const progressUnderlayClasses = computed(() => {
		return [
			'origam-progress__underlay',
			backgroundColorClasses.value
		]
	})
	const progressOverlayClasses = computed(() => {
		return [
			'origam-progress__overlay',
			loaderColorClasses.value
		]
	})
	const progressCircularClasses = computed(() => {
		return [
			`origam-progress--circular`,
			sizeClasses.value,
			progressClasses.value,
			props.class
		]
	})
	/*********************************************************
	 * svgStyles
	 *
	 * @description
	 * #384 (adjacent finding, not in the original scope) —
	 * `Number(props.rotate)` ran UNCONDITIONALLY with no
	 * default in `withDefaults`, so every instance that didn't
	 * explicitly pass `rotate` computed `Number(undefined)` ===
	 * NaN, rendering the entire `transform` declaration invalid
	 * and silently dropped by the browser — losing the base
	 * `-90deg` start-angle offset. Added the missing `rotate: 0`
	 * default (matches the documented "no extra rotation"
	 * behaviour) and switched to `int()` for CSS-length-string
	 * safety, consistent with the `size` fix above.
	 ********************************************************/
	const svgStyles = computed(() => {
		return [`transform: rotate(calc(-90deg + ${int(props.rotate)}deg))`]
	})
	const backgroundStyles = computed(() => {
		return [
			backgroundColorStyles.value
		]
	})
	const loaderStyles = computed(() => {
		return [
			loaderColorStyles.value
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(progressCircularStyles, () => props.id)


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
	.origam-progress {
		$this: &;

		&--circular {
			align-items: center;
			display: inline-flex;
			justify-content: center;
			position: relative;
			vertical-align: middle;

			> svg {
				width: 100%;
				height: 100%;
				margin: auto;
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				z-index: 0;
			}

			#{$this}__content {
				align-items: var(--origam-progress__content---align-items, center);
				display: var(--origam-progress__content---display, flex);
				justify-content: var(--origam-progress__content---justify-content, center);
			}

			#{$this}__underlay {
				color: var(--origam-progress-circular__underlay---color, var(--origam-color__surface---disabled));
				stroke: currentColor;
				opacity: var(--origam-progress-circular__underlay---opacity, 0.5);
				z-index: 1;
			}

			#{$this}__overlay {
				color: var(--origam-progress-circular__overlay---color, inherit);
				stroke: currentColor;
				transition: all var(--origam-progress-circular---transition-duration, 0.2s) var(--origam-progress-circular---transition-easing, ease-in-out), stroke-width 0s;
				z-index: 2;
			}

			&#{$this}--size-x-small {
				height: 16px;
				width: 16px;
			}

			&#{$this}--size-small {
				height: 24px;
				width: 24px;
			}

			&#{$this}--size-default {
				height: 32px;
				width: 32px;
			}

			&#{$this}--size-large {
				height: 48px;
				width: 48px;
			}

			&#{$this}--size-x-large {
				height: 64px;
				width: 64px;
			}

			&#{$this}--indeterminate {
				> svg {
					animation: progress-circular-rotate 1.4s linear infinite;
					transform-origin: center center;
					transition: all 0.2s ease-in-out;
				}

				#{$this}__overlay {
					animation: progress-circular-dash 1.4s ease-in-out infinite, progress-circular-rotate 1.4s linear infinite;
					stroke-dasharray: 25, 200;
					stroke-dashoffset: 0;
					stroke-linecap: round;
					transform-origin: center center;
					transform: rotate(-90deg);
				}
			}
		}
	}

	@keyframes progress-circular-dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0px;
		}
		50% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -15px;
		}
		100% {
			stroke-dasharray: 100, 200;
			stroke-dashoffset: -124px;
		}
	}

	@keyframes progress-circular-rotate {
		100% {
			transform: rotate(270deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-progress--circular.origam-progress--indeterminate > svg,
		.origam-progress--circular.origam-progress--indeterminate .origam-progress__overlay {
			animation: none;
		}
	}
</style>
