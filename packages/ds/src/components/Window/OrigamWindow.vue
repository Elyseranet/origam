<template>
	<component
			:is="tag"
			ref="rootRef"
			v-touch="touchOptions"
			:class="windowClasses"
			:style="windowStyles"
	>
		<div
				:style="windowContainerStyles"
				class="origam-window__container"
		>
			<slot
					name="default"
					v-bind="group"
			/>

			<div
					v-if="showArrows !== false"
					class="origam-window__controls"
			>
				<slot
						name="arrows"
						v-bind="{prevProps, nextProps, canMoveBack, canMoveForward}"
				>
					<slot
							name="prev"
							v-bind="{ props: prevProps, canMove: canMoveBack }"
					>
						<origam-btn
								v-if="canMoveBack"
								v-bind="prevProps"
								:bg-color="bgColor"
								:hover="hover"
								:active="active"
						/>
					</slot>

					<origam-spacer v-if="!canMoveBack"/>

					<slot
							name="next"
							v-bind="{ props: nextProps, canMove: canMoveForward }"
					>
						<origam-btn
								v-if="canMoveForward"
								v-bind="nextProps"
								:bg-color="bgColor"
								:hover="hover"
								:active="active"
						/>
					</slot>
				</slot>
			</div>
		</div>

		<slot
				name="additional"
				v-bind="group"
		/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, provide, ref, shallowRef, StyleValue, watch } from 'vue'
	import { OrigamBtn, OrigamSpacer } from '../../components'

	import {
	useBorder,
	useElevation,
	useGroup,
	useLocale,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useStyle
} from '../../composables'

	import { ORIGAM_WINDOW_GROUP_KEY, ORIGAM_WINDOW_KEY } from '../../consts'

	import { vTouch } from '../../directives'

	import { AXIS, DIRECTION, MDI_ICONS } from '../../enums'

	import type { ITouchHandlers, IWindowProps} from '../../interfaces'

	import type { IWindowEmits } from '../../interfaces/Window/window.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults, emits, filterProps utility, and
	 * locale helper for ARIA labels on navigation buttons.
	 ********************************************************/
	const props = withDefaults(defineProps<IWindowProps>(), {
		// Affix icons were swapped: prev pointed right, next pointed left.
		// Reversed so the chevrons match the scroll/navigation direction.
		prevIcon: MDI_ICONS.CHEVRON_LEFT,
		nextIcon: MDI_ICONS.CHEVRON_RIGHT,
		touch: undefined,
		direction: DIRECTION.HORIZONTAL,
		selectedClass: 'origam-window-item--active',
		mandatory: true,
		tag: 'div',
		// Vue 3 coerces unset Boolean-union props to `false` at runtime,
		// which made `showArrows !== false` evaluate false on every variant
		// that didn't explicitly opt-in — the entire `__controls` block
		// was collapsed to a `<!--v-if-->` placeholder and there was no
		// way to navigate. Default to `true` so navigation works out of
		// the box; consumers can still pass `:show-arrows="false"` to hide.
		showArrows: true
	})

	defineEmits<IWindowEmits>()

	const {filterProps} = useProps<IWindowProps>(props)

	const {t} = useLocale()

	/*********************************************************
	 * Group & window state
	 *
	 * @description
	 * useGroup manages the selected-item registry. isReversed
	 * tracks swipe / arrow direction for choosing the correct
	 * CSS transition class. transition, transitionCount, and
	 * transitionHeight are provided to child WindowItems so
	 * they can coordinate enter/leave height animations.
	 ********************************************************/
	const group = useGroup(props, ORIGAM_WINDOW_GROUP_KEY)

	const rootRef = ref()
	const isReversed = shallowRef(false)
	const transition = computed(() => {
		const axis = props.direction === DIRECTION.VERTICAL ? AXIS.Y : AXIS.X
		const reverse = props.reverse ? !isReversed.value : isReversed.value
		const direction = reverse ? '-reverse' : ''

		return `origam-window-item--${axis}${direction}-transition`
	})
	const transitionCount = shallowRef(0)
	const transitionHeight = ref<undefined | string>(undefined)

	const activeIndex = computed(() => {
		return group.items.value.findIndex(item => group.selected.value.includes(item.id))
	})

	watch(activeIndex, (newVal, oldVal) => {
		const itemsLength = group.items.value.length
		const lastIndex = itemsLength - 1

		if (itemsLength <= 2) {
			isReversed.value = newVal < oldVal
		} else if (newVal === lastIndex && oldVal === 0) {
			isReversed.value = true
		} else if (newVal === 0 && oldVal === lastIndex) {
			isReversed.value = false
		} else {
			isReversed.value = newVal < oldVal
		}
	})

	provide(ORIGAM_WINDOW_KEY, {
		transition,
		isReversed,
		transitionCount,
		transitionHeight,
		rootRef
	})

	/*********************************************************
	 * Navigation controls
	 *
	 * @description
	 * canMoveBack / canMoveForward guard continuous wrapping.
	 * prevProps / nextProps are spread onto OrigamBtn slots.
	 * prev() / next() set isReversed before calling group nav
	 * so the transition class matches the movement direction.
	 ********************************************************/
	const canMoveBack = computed(() => props.continuous || activeIndex.value !== 0)
	const canMoveForward = computed(() => props.continuous || activeIndex.value !== group.items.value.length - 1)

	const prevProps = {
		icon: props.prevIcon,
		class: `origam-window__prev`,
		onClick: group.prev,
		'aria-label': t('origam.carousel.prev')
	}

	const prev = () => {
		if (canMoveBack.value) {
			isReversed.value = true
			group.prev()
		}
	}

	const nextProps = {
		icon: props.nextIcon,
		class: `origam-window__next`,
		onClick: group.next,
		'aria-label': t('origam.carousel.next')
	}

	const next = () => {
		if (canMoveForward.value) {
			isReversed.value = false
			group.next()
		}
	}

	/*********************************************************
	 * Touch / swipe
	 *
	 * @description
	 * vTouch directive options wired to prev / next helpers.
	 * When props.touch is false the directive is disabled;
	 * when it is an object, caller overrides are merged in.
	 ********************************************************/
	const touchOptions = computed(() => {
		if (props.touch === false) return props.touch

		const options: ITouchHandlers = {
			left: () => {
				next()
			},
			right: () => {
				prev()
			},
			start: ({originalEvent}) => {
				originalEvent.stopPropagation()
			}
		}

		return {
			...options,
			...(props.touch === true ? {} : props.touch)
		}
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root, container, and show-arrows-on-hover modifier
	 * classes and styles for the window shell.
	 ********************************************************/
	// Cross-cutting SURFACE props (rounded / border / elevation / padding /
	// margin) are consumed here so they actually paint the window shell —
	// previously they were declared on the interface but silently ignored.
	// color / bgColor / hover / active intentionally stay OUT (they're
	// forwarded to the nav buttons, not the container).
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {elevationClasses, elevationStyles} = useElevation(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	const windowStyles = computed(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			elevationStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const windowClasses = computed(() => {
		return [
			'origam-window',
			{
				'origam-window--show-arrows-on-hover': props.showArrows === 'hover'
			},
			roundedClasses.value,
			borderClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const windowContainerStyles = computed(() => {
		return [
			{
				height: transitionHeight
			},
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(windowStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
	 ********************************************************/
	defineExpose({
		filterProps,
		group,
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
	.origam-window {
		$this: &;

		overflow: var(--origam-window---overflow, hidden);

		&__container {
			display: var(--origam-window__container---display, flex);
			flex-direction: var(--origam-window__container---flex-direction, column);
			height: inherit;
			position: var(--origam-window__container---position, relative);
			transition:
				var(--origam-window---transition-duration, 0.3s)
				var(--origam-window---transition-easing, cubic-bezier(0.25, 0.8, 0.5, 1));
		}

		&__controls {
			box-sizing: border-box;
			position: var(--origam-window__controls---position, absolute);
			left: var(--origam-window__controls---position-left, 0);
			top: var(--origam-window__controls---position-top, 0);
			width: var(--origam-window__controls---width, 100%);
			height: var(--origam-window__controls---height, 100%);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 var(--origam-window__controls---padding-inline, 16px);
			pointer-events: none;
			color: var(--origam-window__controls---color, inherit);

			> * {
				pointer-events: auto;
			}
		}

		&--show-arrows-on-hover {
			overflow: hidden;

			#{$this}__prev {
				transform: var(--origam-window--show-arrows-on-hover---prev-transform, translateX(-200%));
			}

			#{$this}__next {
				transform: var(--origam-window--show-arrows-on-hover---next-transform, translateX(200%));
			}

			&:hover {
				#{$this}__prev,
				#{$this}__next {
					transform: var(--origam-window--show-arrows-on-hover---hover-transform, translateX(0));
				}
			}
		}
	}
</style>
