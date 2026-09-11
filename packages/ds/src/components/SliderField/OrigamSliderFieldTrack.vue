<template>
	<div
			:class="sliderFieldTrackClasses"
			:style="sliderFieldTrackStyles"
	>
		<div
				:class="sliderFieldTrackBgClasses"
				:style="sliderFieldTrackBgStyles"
		/>

		<div
				:class="sliderFieldTrackFillClasses"
				:style="sliderFieldTrackFillStyles"
		/>

		<div
				v-if="showTicks && parsedTicks.length"
				:class="sliderFieldTrackTicksClasses"
		>
			<template
					v-for="(tick, index) in parsedTicks"
					:key="index"
			>
				<div
						:class="sliderFieldTickClasses(tick)"
						:style="sliderFieldTickStyles(tick)"
				>
					<div
							v-if="tick.label || slots.item || slots[`item.${index}`]"
							class="origam-slider-field-track__tick-label"
					>
						<slot
								name="item"
								v-bind="{ tick, index }"
						>
							<slot
									:name="`item.${index}`"
									v-bind="{ tick, index }"
							>
								{{ tick.label }}
							</slot>
						</slot>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, useSlots } from 'vue'
	import {
		useBackgroundColor,
		useProps,
		useRounded,
		useStyle
	} from '../../composables'

	import type { ISliderFieldTrackProps } from "../../interfaces"

	import type { TTick } from '../../types'

	import { convertToUnit, int } from '../../utils'

	const props = withDefaults(defineProps<ISliderFieldTrackProps>(), {
		start: 0,
		stop: 100,
		size: 4,
		min: 0,
		max: 100,
		isVertical: false,
		indexFromEnd: false,
		showTicks: false,
		tickSize: 2
	})

	const {filterProps} = useProps<ISliderFieldTrackProps>(props)

	const slots = useSlots()

	const isDisabled = computed(() => {
		return !!props.disabled
	})
	const color = computed(() => {
		if (isDisabled.value) return undefined
		if (props.error) return 'danger'
		return props.color
	})
	const bgColor = computed(() => {
		if (isDisabled.value) return undefined
		if (props.error) return 'danger'
		return props.bgColor
	})
	const size = computed(() => {
		if (typeof props?.size === 'number') {
			return int(props.size)
		}

		return 4
	})

	const showTicks = computed(() => {
		return !!props.showTicks
	})

	const roundedProps = computed(() => {
		return props.rounded
	})

	const parsedTicks = computed<Array<TTick>>(() => {
		const ticks = props.ticks ?? []
		return props.isVertical ? ticks.slice().reverse() : ticks
	})

	const {roundedClasses, roundedStyles} = useRounded(roundedProps)
	const {
		backgroundColorClasses: trackFillColorClasses,
		backgroundColorStyles: trackFillColorStyles
	} = useBackgroundColor(color)
	const {backgroundColorClasses, backgroundColorStyles} = useBackgroundColor(bgColor)

	const startDir = computed(() => `inset-${props.isVertical ? 'block' : 'inline'}-${props.indexFromEnd ? 'end' : 'start'}`)
	const endDir = computed(() => props.isVertical ? 'height' : 'width')

	const backgroundStyles = computed(() => {
		return {
			[startDir.value]: '0%',
			[endDir.value]: '100%'
		}
	})
	const trackFillWidth = computed(() => {
		return props.stop - props.start
	})

	const trackFillStyles = computed(() => {
		return {
			[startDir.value]: convertToUnit(props.start, '%'),
			[endDir.value]: convertToUnit(trackFillWidth.value, '%')
		}
	})

	const sliderFieldTickStyles = (tick: TTick) => {
		const directionValue = tick.value !== props.min && tick.value !== props.max ? convertToUnit(tick.position, '%') : undefined

		return [
			{
				'--origam-slider-field-track__tick---size': convertToUnit(props.tickSize),
				[startDir.value]: directionValue
			},
			props.style
		] as StyleValue
	}
	const sliderFieldTickClasses = (tick: TTick) => {
		return [
			'origam-slider-field-track__tick',
			{
				'origam-slider-field-track__tick--filled': tick.position >= props.start && tick.position <= props.stop,
				'origam-slider-field-track__tick--first': tick.value === props.min,
				'origam-slider-field-track__tick--last': tick.value === props.max
			}
		]
	}

	const sliderFieldTrackStyles = computed(() => {
		return [
			{
				'--origam-slider-field-track---size': convertToUnit(size.value)
			},
			roundedStyles.value,
			props.style
		] as StyleValue
	})
	const sliderFieldTrackClasses = computed(() => {
		return [
			'origam-slider-field-track',
			roundedClasses.value,
			props.class
		]
	})
	const sliderFieldTrackBgStyles = computed(() => {
		return [
			backgroundStyles.value,
			backgroundColorStyles.value
		] as StyleValue
	})
	const sliderFieldTrackBgClasses = computed(() => {
		return [
			'origam-slider-field-track__background',
			{
				'origam-slider-field-track__background--opacity': !!color.value
			},
			backgroundColorClasses.value
		]
	})
	const sliderFieldTrackFillStyles = computed(() => {
		return [
			trackFillStyles.value,
			trackFillColorStyles.value
		] as StyleValue
	})
	const sliderFieldTrackFillClasses = computed(() => {
		return [
			'origam-slider-field-track__fill',
			trackFillColorClasses.value
		]
	})
	const sliderFieldTrackTicksClasses = computed(() => {
		return [
			'origam-slider-field-track__ticks',
			{
				'origam-slider-field-track__ticks--always-show': props.showTicks === 'always'
			}
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(sliderFieldTrackStyles)


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
	.origam-slider-field-track {
		$this: &;

		position: relative;
		border-radius: 9999px;
		pointer-events: none;

		@media (forced-colors: active) {
			border: thin solid buttontext;
		}

		&__background,
		&__fill {
			position: absolute;
			border-radius: inherit;
			transition: var(--origam-slider-field__track---transition, 0.3s cubic-bezier(0.25, 0.8, 0.5, 1));

			@media (forced-colors: active) {
				background-color: highlight;
			}
		}

		&__background {
			background-color: rgb(148, 148, 148);
		}

		&__fill {
			background-color: rgba(84, 84, 84, 1);
		}

		&__ticks {
			height: 100%;
			width: 100%;
			position: relative;

			#{$this}--always-show {
				#{$this}__tick {
					opacity: 1;
				}
			}
		}

		&__tick {
			background-color: rgba(66, 66, 66, 1);
			position: absolute;
			opacity: 0;
			transition: 0.2s opacity cubic-bezier(0.4, 0, 0.2, 1);
			border-radius: 2px;
			width: var(--origam-slider-field-track__tick---size, 2);
			height: var(--origam-slider-field-track__tick---size, 2);
			transform: translate(calc(var(--origam-slider-field-track__tick---size, 2) / -2), calc(var(--origam-slider-field-track__tick---size, 2) / -2));

			&--filled {
				background-color: rgba(238, 238, 238, 1);
			}

			&--first {
				#{$this}__tick-label {
					transform: none;
				}
			}

			&--last {
				#{$this}__tick-label {
					transform: translateX(-100%);
				}
			}
		}

		&__tick-label {
			position: absolute;
			user-select: none;
			white-space: nowrap;
		}

		&__background--opacity {
			opacity: 0.38;
		}
	}
</style>
