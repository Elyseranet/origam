<template>
	<component
			:is="tag"
			:id="id"
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
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useParallaxTransform } from '../../composables/Parallax/transform.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import {
		PARALLAX_ELEMENT_VAR_X,
		PARALLAX_ELEMENT_VAR_Y
	} from '../../consts/Parallax/parallax-element.const'
	import { ORIGAM_PARALLAX_KEY } from '../../consts/Parallax/parallax.const'

	import { AXIS } from '../../enums/Commons/drag.enum'
	import { PARALLAX_ELEMENT_TYPE } from '../../enums/Parallax/parallax-element.enum'
	import { PARALLAX_EASING, PARALLAX_EVENT } from '../../enums/Parallax/parallax.enum'

	import type { IParallaxElementEmits, IParallaxElementProps, IParallaxElementSlots } from '../../interfaces/Parallax/parallax-element.interface'

	import { cyclicMovement, elementMovement } from '../../utils/Parallax/parallax-element.util'

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

	defineEmits<IParallaxElementEmits>()

	defineSlots<IParallaxElementSlots>()

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

	const {transformStyles, strength, customMovement} = useParallaxTransform(props)

	const transform = computed(() => {
		return transformCalculation()
	})
	const transitionDuration = computed(() => {
		return `${parallax.duration.value}ms`
	})
	/*********************************************************
	 * `parallax.easing` carries the raw `IParallaxProps.easing` value —
	 * `'linear'` / `'ease-out'` happen to already BE valid CSS
	 * `transition-timing-function` keywords, but `'spring'` is not: the
	 * browser silently drops `transition-timing-function: spring` (invalid
	 * value), so passing `easing="spring"` produced NO spring feel at all
	 * on this legacy mouse/scroll path — only the multi-layer runtime
	 * (`useParallaxRuntime`) implements the actual spring lerp. This maps
	 * the enum's `spring` member onto the dedicated token so the CSS
	 * transition at least approximates the intended curve instead of being
	 * silently ignored.
	 ********************************************************/
	const transitionTimingFunction = computed(() => {
		return parallax.easing.value === PARALLAX_EASING.SPRING
			? 'var(--origam-parallax---transition-easing-spring, cubic-bezier(0.16, 1, 0.3, 1))'
			: parallax.easing.value
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
					referencePosition: parallax.event.value === PARALLAX_EVENT.SCROLL ? {x: 0, y: 0} : parallax.eventData.value,
					shape: parallax.shape.value,
					event: parallax.event.value,
					cycles: props.cycle,
					strength: strength.value
				})

		if (parallax.event.value !== PARALLAX_EVENT.SCROLL) {
			movementX = props.axis === AXIS.Y ? 0 : x
			movementY = props.axis === AXIS.X ? 0 : y
		} else if (parallax.event.value === PARALLAX_EVENT.SCROLL) {
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

		/*********************************************************
		 * type="custom" — la trappe d'extension (#432)
		 *
		 * @description
		 * Les sept autres types composent leur `transform` ici. `custom`
		 * n'en compose aucun : il PUBLIE le mouvement calcule dans deux
		 * proprietes personnalisees et laisse le consommateur ecrire sa
		 * propre transform en CSS. C'est ce que la doc annoncait depuis le
		 * debut sans qu'aucune surface d'API ne le rende atteignable — le
		 * `switch` de `useParallaxTransform` ne couvrait pas ce cas et
		 * rendait `undefined`, silencieusement.
		 * @description
		 * On n'ecrit deliberement AUCUN `transform` : sans regle CSS cote
		 * consommateur, l'element se rend exactement comme avant ce
		 * correctif. La trappe est donc non cassante — elle ajoute un
		 * moyen, elle ne change aucun rendu existant.
		 * @description
		 * Ces deux variables ne sont posees que pour `custom` : les sept
		 * autres types gardent un chemin chaud intact, sans deux ecritures
		 * de propriete personnalisee a chaque frame.
		 ********************************************************/
		if (props.type === PARALLAX_ELEMENT_TYPE.CUSTOM) {
			const movement = customMovement(x, y)

			return {
				[PARALLAX_ELEMENT_VAR_X]: String(movement.x),
				[PARALLAX_ELEMENT_VAR_Y]: String(movement.y)
			}
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
	const {id, css, load, isLoaded, unload} = useStyle(parallaxElementStyles, () => props.id)


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
