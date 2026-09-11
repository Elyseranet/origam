<template>
	<component
			:is="tag"
			ref="root"
			:class="progressLinearClasses"
			:style="progressLinearStyles"
			@click="clickable && handleClick"
	>
		<div
				v-if="stream"
				key="stream"
				:style="streamStyles"
				class="origam-progress__stream"
		/>
		<div
				:class="progressBackgroundClasses"
				:style="backgroundStyles"
		/>

		<origam-transition :transition="transition">
			<div :class="progressLoaderClasses">
				<template v-if="indeterminate">
					<div
							v-for="bar in ['long', 'short']"
							:key="bar"
							:class="`origam-progress__bar--${bar}`"
							:style="loaderStyles"
							class="origam-progress__bar"
					/>
				</template>
				<template v-else>
					<div
							:style="loaderStyles"
							class="origam-progress__bar"
					/>
				</template>
			</div>
		</origam-transition>

		<div
				v-if="hasContent"
				class="origam-progress__content"
		>
			<slot
					name="default"
					v-bind="{ value: normalizedValue, buffer: normalizedBuffer }"
			/>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import { OrigamFade, OrigamSlideX, OrigamTransition } from '../../components'

	import {
		useIntersectionObserver,
		useLocation,
		useProgress,
		useProps,
		useRounded,
		useRtl,
		useStyle,
		useTextColor
} from '../../composables'

	import type { IProgressLinearProps } from '../../interfaces'

	import { convertToUnit } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the ProgressLinear component.
	 ********************************************************/
	const props = withDefaults(defineProps<IProgressLinearProps>(), {
		tag: 'div',
		modelValue: 0,
		max: 100,
		thickness: 4
	})

	const {filterProps} = useProps<IProgressLinearProps>(props)

	/*********************************************************
	 * Decorators & layout
	 *
	 * @description
	 * Location, progress state, rounding, RTL direction and
	 * color utilities for the background and loader tracks.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {locationStyles} = useLocation(props)
	const {progressClasses, progressStyles, normalizedValue, thickness, progress, max, hasContent} = useProgress(props)
	const {roundedClasses} = useRounded(props)
	const {intersectionRef} = useIntersectionObserver()

	/*********************************************************
	 * Color
	 ********************************************************/

	const {textColorStyles: backgroundColorStyles, textColorClasses: backgroundColorClasses} = useTextColor(toRef(props, 'bgColor'))
	const {textColorStyles: loaderColorStyles, textColorClasses: loaderColorClasses} = useTextColor(toRef(props, 'color'))
	const {isRtl, rtlClasses} = useRtl()

	/*********************************************************
	 * Computed state
	 *
	 * @description
	 * Buffer normalisation, indeterminate transition and
	 * reversed direction flag.
	 ********************************************************/
	const normalizedBuffer = computed(() => {
		return parseFloat(props.bufferValue as string) / max.value * 100
	})
	const transition = computed(() => {
		return props.indeterminate ? {component: OrigamFade} : {component: OrigamSlideX}
	})
	const isReversed = computed(() => {
		return isRtl.value !== props.reverse
	})

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Click handler for the clickable progress bar — maps the
	 * click position to a normalized value.
	 ********************************************************/
	const handleClick = (e: MouseEvent) => {
		if (!intersectionRef.value) return

		const {left, right, width} = intersectionRef.value.getBoundingClientRect()
		const value = props.reverse ? (width - e.clientX) + (right - width) : e.clientX - left

		progress.value = Math.round(value / width * max.value)
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * progressLinearStyles and progressLinearClasses compose
	 * the BEM block.
	 ********************************************************/
	const progressLinearStyles = computed(() => {
		return [
			{
				'bottom': props.location === 'bottom' ? 0 : undefined,
				'top': props.location === 'top' ? 0 : undefined,
				'height': convertToUnit(thickness.value),
				'line-height': convertToUnit(thickness.value)
			},
			locationStyles.value,
			progressStyles.value,
			props.style
		] as StyleValue
	})
	const progressBackgroundClasses = computed(() => {
		return [
			'origam-progress__background',
			backgroundColorClasses.value
		]
	})
	const progressLoaderClasses = computed(() => {
		return [
			'origam-progress__loader',
			loaderColorClasses.value
		]
	})
	const progressLinearClasses = computed(() => {
		return [
			'origam-progress--linear',
			{
				'origam-progress--reverse': isReversed.value,
				'origam-progress--rounded': props.rounded
			},
			rtlClasses.value,
			progressClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const streamStyles = computed(() => {
		return [
			{
				[props.reverse ? 'left' : 'right']: convertToUnit(-thickness.value),
				'border-top-width': convertToUnit(thickness.value / 2),
				top: `calc(50% - ${convertToUnit(thickness.value / 4)})`,
				width: convertToUnit(100 - normalizedBuffer.value, '%'),
				transform: `translateX(${convertToUnit(thickness.value * (props.reverse ? 1 : -1))})`
			}
		] as StyleValue
	})
	const backgroundStyles = computed(() => {
		return [
			backgroundColorStyles.value,
			{
				width: `${convertToUnit((!props.stream ? 100 : normalizedBuffer.value), '%')}`
			}
		]
	})
	const loaderStyles = computed(() => {
		return [
			{
				width: props.indeterminate ? undefined : convertToUnit(normalizedValue.value, '%')
			},
			loaderColorStyles.value
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(progressLinearStyles)


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

		&--linear {
			background: transparent;
			overflow: hidden;
			position: relative;
			transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
			width: 100%;

			#{$this}__background {
				background: currentColor;
				bottom: 0;
				color: var(--origam-progress-linear__background---color, inherit);
				left: 0;
				opacity: var(--origam-progress-linear__background---opacity, 0.5);
				position: absolute;
				top: 0;
				transition: inherit;
			}

			#{$this}__content {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				left: 0;
				pointer-events: none;
				position: absolute;
				top: 0;
				width: 100%;
			}

			#{$this}__loader {
				color: var(--origam-progress-linear__loader---color, inherit);

				> * {
					background: currentColor;
				}
			}

			#{$this}__bar {
				height: 100%;
				left: 0;
				position: absolute;
				transition: inherit;
			}

			&#{$this}--indeterminate {
				#{$this}__bar {
					animation-play-state: paused;
					animation-duration: 2.2s;
					animation-iteration-count: infinite;
					bottom: 0;
					right: auto;
					top: 0;
					width: auto;

					&--long {
						animation-name: indeterminate-ltr;
					}

					&--short {
						animation-name: indeterminate-short-ltr;
					}
				}
			}

			#{$this}__stream {
				animation: stream 0.25s infinite linear;
				animation-play-state: paused;
				bottom: 0;
				left: auto;
				opacity: 0.3;
				pointer-events: none;
				position: absolute;
				transition: inherit;
			}

			&#{$this}--reverse {
				#{$this}__background,
				#{$this}__loader,
				#{$this}__content {
					left: auto;
					right: 0;
				}

				&#{$this}--indeterminate {
					#{$this}__long,
					#{$this}__short {
						left: auto;
						right: 0;
					}

					#{$this}__long {
						animation-name: indeterminate-rtl;
					}

					#{$this}__short {
						animation-name: indeterminate-short-rtl;
					}
				}

				#{$this}__stream {
					right: auto;
				}
			}

			&#{$this}--absolute,
			&#{$this}--fixed {
				left: 0;
				z-index: 1;
			}

			&#{$this}--absolute {
				position: absolute;
			}

			&#{$this}--fixed {
				position: fixed;
			}

			&#{$this}--rounded {
				border-radius: 9999px;

				#{$this}__loader {
					border-radius: inherit;
				}

				#{$this}__loader,
				#{$this}__stream + #{$this}__background {
					border-radius: 9999px;
				}

				&#{$this}__determinate {
					#{$this}__loader {
						border-start-start-radius: 0;
						border-end-start-radius: 0;
					}
				}
			}

			&#{$this}--active {
				&#{$this}--indeterminate {
					#{$this}__bar {
						animation-play-state: running;
					}
				}

				#{$this}__stream {
					animation-play-state: running;
				}
			}

			@media (prefers-reduced-motion: reduce) {
				&#{$this}--indeterminate #{$this}__bar {
					animation: none;
					left: 0;
					width: 50%;
				}

				#{$this}__stream {
					animation: none;
				}
			}
		}
	}
</style>

<style>
	@keyframes indeterminate-ltr {
		0% {
			left: -90%;
			right: 100%;
		}
		60% {
			left: -90%;
			right: 100%;
		}
		100% {
			left: 100%;
			right: -35%;
		}
	}

	@keyframes indeterminate-rtl {
		0% {
			left: 100%;
			right: -90%;
		}
		60% {
			left: 100%;
			right: -90%;
		}
		100% {
			left: -35%;
			right: 100%;
		}
	}

	@keyframes indeterminate-short-ltr {
		0% {
			left: -200%;
			right: 100%;
		}
		60% {
			left: 107%;
			right: -8%;
		}
		100% {
			left: 107%;
			right: -8%;
		}
	}

	@keyframes indeterminate-short-rtl {
		0% {
			left: 100%;
			right: -200%;
		}
		60% {
			left: -8%;
			right: 107%;
		}
		100% {
			left: -8%;
			right: 107%;
		}
	}

	@keyframes stream {
		to {
			transform: translateX(var(--v-progress-linear-stream-to));
		}
	}

	@keyframes progress-linear-stripes {
		0% {
			background-position-x: var(--v-progress-linear-height);
		}
	}
</style>
