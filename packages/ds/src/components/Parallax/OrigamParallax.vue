<template>
	<component
			:is="tag"
			ref="root"
			:class="parallaxClasses"
			:style="parallaxStyles"
			@mouseenter="handleMovementStart"
			@mouseleave="handleMovementStop"
			@mousemove="handleMovement"
	>
		<slot name="default"/>
		<audio
				v-if="audio"
				ref="audioRef"
				type="audio/mpeg"
				@ended="handleStop"
		>
			<source :src="audio">
		</audio>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onBeforeUnmount, onMounted, provide, ref, StyleValue, toRef, watch } from 'vue'
	import type { Ref } from 'vue'
	import {
		useAudio,
		useBorder,
		useBothColor,
		useDimension,
		useDisplay,
		useElevation,
		useMargin,
		usePadding,
		useParallaxRuntime,
		useProps,
		useRounded,
		useStyle,
		useThrottleFn
	} from '../../composables'

	import { ORIGAM_PARALLAX_KEY, ORIGAM_PARALLAX_LAYER_KEY } from '../../consts'

	import { PARALLAX_DIRECTION, PARALLAX_EASING, PARALLAX_EVENT } from '../../enums'

	import type { IBox, IParallaxProps } from '../../interfaces'

	import type { TParallaxDirection, TParallaxEasing } from '../../types'

	import { getCenter, getTargetBox, inViewport } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the Parallax component. Defaults preserve
	 * the v2.x single-layer / mouse-driven behaviour. Multi-layer support
	 * activates as soon as at least one <OrigamParallaxLayer> is mounted
	 * inside the slot (the legacy <OrigamParallaxElement> path keeps
	 * working in parallel — the two are independent injection contexts).
	 ********************************************************/
	const props = withDefaults(defineProps<IParallaxProps>(), {
		duration: 1000,
		easing: PARALLAX_EASING.LINEAR,
		perspective: 1000,
		tag: 'div',
		event: PARALLAX_EVENT.MOVE,
		active: true,
		direction: PARALLAX_DIRECTION.VERTICAL,
		speed: 0.5,
		disabled: false,
		threshold: 0
	})

	const emit = defineEmits<{
		(e: 'enter'): void
		(e: 'leave'): void
		(e: 'scroll-progress', progress: number): void
	}>()

	const {filterProps} = useProps<IParallaxProps>(props)

	/*********************************************************
	 * Composables (chrome)
	 ********************************************************/

	const {audioRef, audioData, onStop: handleStop} = useAudio(props)
	const {platform} = useDisplay()
	const {dimensionStyles} = useDimension(props)

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {borderStyles, borderClasses} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * State (legacy mouse / scroll / orientation path)
	 ********************************************************/
	const root = ref<HTMLElement>()

	const isMoving = ref(false)
	const leftOnce = ref(false)
	const shape = ref<IBox | DOMRect | null>(null)
	const movement = ref({ x: 0, y: 0 })
	const data = ref()

	const isTouch = computed(() => platform.value.touch)

	const eventActions = computed(() => {
		return {
			move: {
				action: mouseMovement,
				condition: isMoving.value && !isTouch.value,
				type: isTouch.value ? 'deviceorientation' : null
			},
			scroll: {
				action: scrollMovement,
				condition: !!shape.value?.height,
				type: 'scroll'
			},
			orientation: {
				action: orientationElement,
				condition: props.event === 'move' && isTouch.value,
				type: 'deviceorientation'
			}
		}
	})

	const eventMap = computed<{ move: any, scroll: any, orientation: any }>(() => {
		return {
			orientation: 'deviceorientation',
			scroll: 'scroll',
			move: isTouch.value ? 'deviceorientation' : null
		}
	})

	const mouseMovement = ({target, event}: { target: IBox | DOMRect, event: MouseEvent }) => {
		const x = event.clientX
		const y = event.clientY
		const relativeX = x - target.left
		const relativeY = y - target.top
		const center = getCenter(target)
		return {
			x: relativeX / center.x,
			y: relativeY / center.y,
			target
		}
	}
	const scrollMovement = ({target}: { target: IBox | DOMRect }) => {
		const x = window.scrollX
		const y = window.scrollY
		const relativeX = x - target.left
		const relativeY = y - target.top
		const center = getCenter(target)
		return {
			x: relativeX / center.x,
			y: relativeY / center.y,
			target
		}
	}
	const orientationElement = ({event, target}: { target: IBox | DOMRect, event: DeviceOrientationEvent }) => {
		const x = event.gamma ?? 1 / 45
		const y = event.beta ?? 1 / 90
		return {x, y, target}
	}

	const handleMovement = useThrottleFn((event: MouseEvent & DeviceOrientationEvent) => {
		if (!props.active && !root.value) return

		if (!isMoving.value && !leftOnce.value) {
			handleMovementStart()
		}

		shape.value = getTargetBox(root.value as unknown as HTMLElement)
		const isInViewport = inViewport(shape.value)
		const condition = eventActions.value[props.event].condition
		const action = eventActions.value[props.event].action

		if (isInViewport && condition) {
			movement.value = action({ target: shape.value, event })
			data.value = {x: event.clientX, y: event.clientY}
		}
	}, 100)

	const addEvents = (event: typeof props.event = props.event) => {
		if (eventMap.value[event]) {
			window.addEventListener(eventMap.value[event], handleMovement, true)
		}
	}
	const removeEvents = (event: typeof props.event = props.event) => {
		if (eventMap.value[event]) {
			window.removeEventListener(eventMap.value[event], handleMovement, true)
		}
	}

	const handleMovementStart = () => {
		if (!props.active) return
		isMoving.value = true
	}
	const handleMovementStop = () => {
		if (!props.active) return
		leftOnce.value = true
		isMoving.value = false
	}

	onMounted(() => addEvents())
	onBeforeUnmount(() => removeEvents())

	watch(() => props.event, (newEvent, oldEvent) => {
		if (newEvent === oldEvent) return
		removeEvents(oldEvent)
		addEvents(newEvent)
		isMoving.value = false
		movement.value = { x: 0, y: 0 }
	})

	/*********************************************************
	 * Provide — legacy <OrigamParallaxElement> context.
	 ********************************************************/
	let _animationDurationWarned = false
	const resolvedDuration = computed(() => {
		if (props.animationDuration != null && !_animationDurationWarned) {
			_animationDurationWarned = true
			console.warn(
				'[origam] OrigamParallax: the `animationDuration` prop is deprecated and will be removed in v3.0.0. ' +
				'Use `duration` instead. Both props currently resolve to the same value (`animationDuration` wins when both are set).'
			)
		}
		return props.animationDuration ?? props.duration ?? 1000
	})

	provide(ORIGAM_PARALLAX_KEY, {
		audioData,
		event: toRef(props, 'event'),
		eventData: data,
		isMoving: computed(() => isMoving.value || props.event === PARALLAX_EVENT.SCROLL) as unknown as Ref<boolean>,
		movement,
		duration: resolvedDuration,
		easing: toRef(props, 'easing') as unknown as Ref<string>,
		shape
	})

	/*********************************************************
	 * Multi-layer runtime — drives <OrigamParallaxLayer> children.
	 *
	 * Distinct from the legacy provide above so we don't couple the two
	 * APIs. Layers register themselves at mount and unregister on unmount;
	 * the runtime owns scroll / mouse listeners + the rAF loop.
	 ********************************************************/
	const {
		progress,
		mouseRatio,
		cssScrollDriven,
		reducedMotion,
		register,
		unregister
	} = useParallaxRuntime({
		target: root,
		direction: toRef(props, 'direction') as Ref<TParallaxDirection>,
		easing: toRef(props, 'easing') as Ref<TParallaxEasing | string>,
		threshold: toRef(props, 'threshold') as Ref<number>,
		disabled: toRef(props, 'disabled') as Ref<boolean>,
		speed: toRef(props, 'speed') as Ref<number>,
		onEnter: () => emit('enter'),
		onLeave: () => emit('leave'),
		onProgress: (p) => emit('scroll-progress', p)
	})

	provide(ORIGAM_PARALLAX_LAYER_KEY, {
		direction: toRef(props, 'direction') as Ref<TParallaxDirection>,
		easing: toRef(props, 'easing') as Ref<TParallaxEasing | string>,
		disabled: toRef(props, 'disabled') as Ref<boolean>,
		progress,
		mouseRatio,
		cssScrollDriven,
		reducedMotion,
		register,
		unregister
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const parallaxStyles = computed(() => {
		return [
			dimensionStyles.value,
			borderStyles.value,
			colorStyles.value,
			roundedStyles.value,
			paddingStyles.value,
			marginStyles.value,
			{
				'--origam-parallax---perspective': `${props.perspective}px`
			},
			props.style
		] as StyleValue
	})

	const parallaxClasses = computed(() => {
		return [
			'origam-parallax',
			{
				'origam-parallax--disabled': props.disabled,
				'origam-parallax--reduced-motion': reducedMotion.value,
				'origam-parallax--css-driven': cssScrollDriven.value,
				[`origam-parallax--${props.direction}`]: !!props.direction
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(parallaxStyles)

	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		progress,
		cssScrollDriven,
		reducedMotion
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-parallax {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		overflow: hidden;

		perspective: var(--origam-parallax---perspective, 1000px);
		transform-origin: var(--origam-parallax---transform-origin, center center);
		transition-duration: var(--origam-parallax---transition-duration, 600ms);
		transition-timing-function: var(--origam-parallax---transition-timing-function, cubic-bezier(0.23, 1, 0.32, 1));

		background-color: var(--origam-parallax---background-color, transparent);
		color: var(--origam-parallax---color, inherit);
	}

	.origam-parallax--disabled,
	.origam-parallax--reduced-motion {
		:deep(.origam-parallax__layer) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
