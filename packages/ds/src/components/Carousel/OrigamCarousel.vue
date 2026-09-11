<template>
	<origam-window
			ref="origamWindowRef"
			v-model="model"
			:class="carouselClasses"
			:style="carouselStyles"
			v-bind="windowProps"
	>
		<template #default="group">
			<slot
					name="default"
					v-bind="group"
			/>
		</template>

		<template #additional="group">
			<slot
					name="additional"
					v-bind="group"
			>
				<div
						v-if="!hideDelimiters"
						:style="carouselControlsStyles"
						class="origam-carousel__controls"
				>
					<template
							v-for="(item, index) in group.items.value"
							:key="index"
					>
						<slot
								:name="`item.${index}`"
								v-bind="{props: controlProps(item, index, group), item}"
						>
							<slot
									name="item"
									v-bind="{props: controlProps(item, index, group), item, index}"
							>
								<origam-btn v-bind="(controlProps(item, index, group) as any)"/>
							</slot>
						</slot>
					</template>
				</div>

				<template v-if="progress">
					<slot
							name="progress"
							v-bind="{percent: progressPercent}"
					>
						<div class="origam-carousel__progress">
							<origam-progress-linear :model-value="progressPercent"/>
						</div>
					</slot>
				</template>
			</slot>
		</template>

		<template
				v-if="slots.prev"
				#prev="{props, canMove}"
		>
			<slot
					name="prev"
					v-bind="{props, canMove}"
			/>
		</template>

		<template
				v-if="slots.next"
				#next="{canMove, props}"
		>
			<slot
					name="next"
					v-bind="{props, canMove}"
			/>
		</template>

		<template
				v-if="slots.arrows"
				#arrows="{canMoveBack, canMoveForward, nextProps, prevProps}"
		>
			<slot
					name="arrows"
					v-bind="{canMoveBack, canMoveForward, nextProps, prevProps}"
			/>
		</template>
	</origam-window>
</template><script
		lang="ts"
		setup
>
	import { OrigamBtn, OrigamProgressLinear, OrigamWindow } from '../../components'

	import {
	useDimension,
	useLocale,
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { DENSITY, MDI_ICONS, SIZES } from '../../enums'

	import { intentBgExpr, isCssColor, isIntent } from '../../utils/Commons/color.util'

	import type { ICarouselProps, IGroupProvide} from '../../interfaces'

	import type { ICarouselEmits } from '../../interfaces/Carousel/carousel.interface'

	import type { TOrigamWindow } from "../../types"


	import { computed, onBeforeUnmount, onMounted, ref, StyleValue, useSlots, watch } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, model binding and slide-cycle timer.
	 ********************************************************/

	const props = withDefaults(defineProps<ICarouselProps>(), {
		delimiterIcon: MDI_ICONS.CIRCLE,
		height: 500,
		interval: 6000,
		continuous: true,
		mandatory: true,
		showArrows: true
	})

	defineEmits<ICarouselEmits>()

	const {filterProps} = useProps<ICarouselProps>(props)
	const {t} = useLocale()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const origamWindowRef = ref<TOrigamWindow>()

	let slideTimeout = -1

	// Real-time progress driven by the cycle timer: starts at 0 the moment
	// the timer is (re)armed, climbs to 100 over `interval` ms via rAF,
	// resets on every slide change or timer restart. This is what users
	// expect when they enable `progress: true` alongside `cycle: true` —
	// not the previous "current-slide / total-slides" step bar.
	const progressPercent = ref(0)
	let progressRaf = -1
	let progressStart = 0

	const stopProgress = () => {
		if (progressRaf !== -1) {
			window.cancelAnimationFrame(progressRaf)
			progressRaf = -1
		}
	}

	const startProgress = () => {
		stopProgress()
		if (!props.cycle || !props.progress) {
			progressPercent.value = 0
			return
		}
		const interval = +props.interval > 0 ? +props.interval : 6000
		progressStart = performance.now()
		progressPercent.value = 0
		const tick = () => {
			const elapsed = performance.now() - progressStart
			progressPercent.value = Math.min(100, (elapsed / interval) * 100)
			if (progressPercent.value < 100 && props.cycle && props.progress) {
				progressRaf = window.requestAnimationFrame(tick)
			} else {
				progressRaf = -1
			}
		}
		progressRaf = window.requestAnimationFrame(tick)
	}

	const prefersReducedMotion = (): boolean => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches
	}

	const startTimeout = () => {
		if (!props.cycle || !origamWindowRef.value) return
		if (prefersReducedMotion()) return

		slideTimeout = window.setTimeout(origamWindowRef.value.group.next, +props.interval > 0 ? +props.interval : 6000)
		startProgress()
	}

	const restartTimeout = () => {
		window.clearTimeout(slideTimeout)
		window.requestAnimationFrame(startTimeout)
	}

	watch(model, restartTimeout)
	watch(() => props.interval, restartTimeout)
	watch(() => props.cycle, (val) => {
		if (val) restartTimeout()
		else {
			window.clearTimeout(slideTimeout)
			stopProgress()
			progressPercent.value = 0
		}
	})
	watch(() => props.progress, (val) => {
		if (val && props.cycle) startProgress()
		else stopProgress()
	})

	onMounted(startTimeout)
	onBeforeUnmount(() => {
		window.clearTimeout(slideTimeout)
		stopProgress()
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const windowProps = computed(() => {
		return origamWindowRef.value?.filterProps(props, ['modelValue'])
	})

	const controlProps = (item: {
		id: number
		value: unknown
		disabled: boolean | undefined
	}, index: number, group: IGroupProvide) => {
		return Object.assign({},
				item,
				{
					id: `carousel-item-${item.id}`,
					'aria-label': t('origam.carousel.aria_label.delimiter', index + 1, group.items.value.length),
					// The SELECTED dot is active. When the consumer passes an
					// `active` STATE object, the selected dot wears that surface
					// (forced); otherwise it just reads as active. Hover applies
					// to any dot on hover.
					active: group.isSelected(item.id)
						? (props.active && typeof props.active === 'object' ? { ...props.active, enabled: true } : true)
						: false,
					hover: props.hover,
					class: [
						'origam-carousel__controls-item'
					],
					onClick: () => group.select(item.id, true),
					icon: props.delimiterIcon,
					bgColor: props.bgColor,
					size: SIZES.SMALL,
					density: DENSITY.COMPACT
				})
	}

	const slots = useSlots()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM modifier classes and height/position styles.
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)

	const carouselStyles = computed(() => {
		return [
			dimensionStyles.value,
			props.style
		] as StyleValue
	})
	const carouselClasses = computed(() => {
		return [
			'origam-carousel',
			{
				'origam-carousel--hide-delimiter-background': props.hideDelimiterBackground,
				'origam-carousel--vertical-delimiters': props.verticalDelimiters
			},
			props.class
		]
	})
	// Pagination dots: the dot surface takes `bgColor`; its CENTER (the
	// delimiter glyph) is always a MIX of that bgColor (a lighter shade)
	// rather than a flat white — so the dot reads as one coherent coloured
	// element. Resolved to a `color-mix(...)` expression from the intent
	// token (or the raw custom colour).
	const dotCenterColor = computed<string | undefined>(() => {
		const bg = props.bgColor

		if (bg && isIntent(bg)) return `color-mix(in srgb, ${ intentBgExpr(bg, 'default') }, #ffffff 55%)`
		if (bg && typeof bg === 'string' && isCssColor(bg)) return `color-mix(in srgb, ${ bg }, #ffffff 55%)`

		return undefined
	})

	const carouselControlsStyles = computed(() => {
		return [
			{
				left: (props.verticalDelimiters === 'left') && props.verticalDelimiters ? 0 : 'auto',
				right: (props.verticalDelimiters === 'right') ? 0 : 'auto',
				'--origam-carousel__controls-item---center-color': dotCenterColor.value
			},
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(carouselStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
	.origam-carousel {
		$this: &;

		overflow: var(--origam-carousel---overflow, hidden);
		position: var(--origam-carousel---position, relative);
		width: var(--origam-carousel---width, 100%);

		&__controls {
			align-items: center;
			bottom: var(--origam-carousel__controls---position-bottom, 0);
			display: flex;
			height: var(--origam-carousel__controls---height, 50px);
			justify-content: center;
			list-style-type: none;
			position: var(--origam-carousel__controls---position, absolute);
			width: var(--origam-carousel__controls---width, 100%);
			z-index: var(--origam-carousel__controls---z-index, 1);
			background-color: var(--origam-carousel__controls---background-color, rgba(0, 0, 0, 0.4));

			> .origam-item-group {
				flex: 0 1 auto;
			}
		}

		&__controls-item {
			margin-inline: var(--origam-carousel__controls-item---margin-inline, 8px);

			:deep(.origam-icon) {
				opacity: var(--origam-carousel__controls-item---opacity, 0.5);
				color: var(--origam-carousel__controls-item---center-color, currentColor);
			}

			&--active {
				:deep(.origam-icon) {
					opacity: var(--origam-carousel__controls-item---opacity-active, 1);
					vertical-align: middle;
				}
			}

			&:hover {
				background: none;

				:deep(.origam-icon) {
					opacity: var(--origam-carousel__controls-item---opacity-hover, 0.8);
				}
			}
		}

		&__progress {
			margin: var(--origam-carousel__progress---margin, 0);
			position: var(--origam-carousel__progress---position, absolute);
			// Defaults to TOP so the progress bar isn't hidden behind the
			// 50 px-tall `__controls` strip at the bottom. Both edges are
			// still overridable via the CSS variable triplet below — set
			// `--origam-carousel__progress---position-top: auto` and a
			// `--…position-bottom` value to put it at the bottom instead.
			top: var(--origam-carousel__progress---position-top, 0);
			bottom: var(--origam-carousel__progress---position-bottom, auto);
			left: var(--origam-carousel__progress---position-left, 0);
			right: var(--origam-carousel__progress---position-right, 0);
			z-index: var(--origam-carousel__progress---z-index, 2);
		}

		&--hide-delimiter-background {
			#{$this}__controls {
				background: var(--origam-carousel--hide-delimiter-background---controls-background, transparent);
			}
		}

		&--vertical-delimiters {
			#{$this}__controls {
				flex-direction: column;
				height: 100% !important;
				width: var(--origam-carousel--vertical-delimiters---controls-width, 50px);
			}
		}
	}
</style>
