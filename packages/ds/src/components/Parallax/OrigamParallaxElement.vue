<template>
	<component
			:is="tag"
			:class="parallaxElementClasses"
			:style="parallaxElementStyles"
	>
		<slot name="default"/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, StyleValue } from 'vue'
	import {
	useBorder,
	useElevation,
	useMargin,
	usePadding,
	useParallaxTransform,
	useProps,
	useRounded,
	useStyle
} from '../../composables'

	import { ORIGAM_PARALLAX_KEY } from '../../consts'

	import { AXIS, PARALLAX_ELEMENT_TYPE } from '../../enums'

	import type { IParallaxElementProps } from '../../interfaces'

	import { cyclicMovement, elementMovement } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the ParallaxElement component.
	 ********************************************************/
	const props = withDefaults(defineProps<IParallaxElementProps>(), {
		tag: 'div',
		type: PARALLAX_ELEMENT_TYPE.TRANSLATE,
		transformOrigin: 'center',
		originX: 50,
		originY: 50,
		strength: 10,
		cycle: 0,
		audioIndex: 50
	})

	const {filterProps} = useProps<IParallaxElementProps>(props)

	/*********************************************************
	 * Decorators
	 *
	 * @description
	 * Border, rounded, elevation, padding and margin composables mirror
	 * the IParallaxElementProps interface extensions.
	 ********************************************************/
	// Chrome composables — mirror the IParallaxElementProps interface
	// (IBorderProps / IPaddingProps / IMarginProps / IRoundedProps / IElevationProps).

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses} = useElevation(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	/*********************************************************
	 * Parallax inject & transform
	 *
	 * @description
	 * parallax is the context provided by the parent OrigamParallax.
	 * transformStyles / strength come from useParallaxTransform.
	 * transform, transitionDuration, transitionTimingFunction and
	 * transformParameters compose the final CSS transform style.
	 ********************************************************/
	const parallax = inject(ORIGAM_PARALLAX_KEY)

	if (!parallax) throw new Error('[Origam] parallax-element needs to be placed inside parallax')

	const {transformStyles, strength} = useParallaxTransform(props)

	const transform = computed(() => {
		return transformCalculation()
	})
	const transitionDuration = computed(() => {
		return `${parallax.duration.value}ms`
	})
	const transitionTimingFunction = computed(() => {
		return parallax.easing.value
	})
	const transformParameters = computed(() => {
		return {
			transitionProperty: 'transform',
			transitionDuration: transitionDuration.value,
			transformOrigin: props.transformOrigin,
			transitionTimingFunction: transitionTimingFunction.value
		}
	})

	const calculateAudioMovement = () => {
		let movementX = 0
		let movementY = 0

		if (parallax.audioData.value) {
			movementX = parallax.audioData.value[props.audioIndex]
			movementY = parallax.audioData.value[props.audioIndex]
		}

		return {
			x: movementX,
			y: movementY
		}
	}
	const calculateMouseMovement = () => {
		if (!parallax.shape.value || (!parallax.isMoving.value)) return {
			x: 0,
			y: 0
		}

		let movementX = 0
		let movementY = 0

		const {x, y} = props.cycle < 1
				? elementMovement({
					x: parallax.movement.value.x,
					y: parallax.movement.value.y,
					target: parallax.movement.value?.target,
					originX: props.originX,
					originY: props.originY,
					strength: strength.value,
					event: parallax.event.value,
					minX: props.minX,
					minY: props.minY,
					maxX: props.maxX,
					maxY: props.maxY
				})
				: cyclicMovement({
					referencePosition: parallax.event.value === 'scroll' ? {x: 0, y: 0} : parallax.eventData.value,
					shape: parallax.shape.value,
					event: parallax.event.value,
					cycles: props.cycle,
					strength: strength.value
				})

		if (parallax.event.value !== 'scroll') {
			movementX = props.axis === AXIS.Y ? 0 : x
			movementY = props.axis === AXIS.X ? 0 : y
		} else if (parallax.event.value === 'scroll') {
			movementX = props.axis === AXIS.X ? y : 0
			movementY = props.axis === AXIS.Y || !props.axis ? y : 0
		} else if (props.cycle > 0) {
			movementX = props.axis === AXIS.X ? x : 0
			movementY = props.axis === AXIS.Y ? y : 0
		}

		return {
			x: movementX,
			y: movementY
		}
	}
	const transformCalculation = () => {
		let x = 0
		let y = 0

		if (parallax.audioData.value) {
			const audioMovement = calculateAudioMovement()

			x = audioMovement.x
			y = audioMovement.y
		} else {
			const mouseMovement = calculateMouseMovement()

			x = mouseMovement.x
			y = mouseMovement.y
		}

		return {
			transform: transformStyles(x, y)
		}
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * parallaxElementStyles / parallaxElementClasses compose the BEM root.
	 ********************************************************/
	const parallaxElementStyles = computed(() => {
		return [
			borderStyles.value,
			roundedStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style,
			{
				...transform.value,
				...transformParameters.value
			}
		] as StyleValue
	})
	const parallaxElementClasses = computed(() => {
		return [
			'origam-parallax-element',
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(parallaxElementStyles)


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
