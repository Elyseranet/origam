<template>
	<component
			:is="props.tag"
			:id="id"
			v-contrast
			:class="labelClasses"
			:style="labelStyles"
			:name="name"
			@click="handleClick"
	>
		<slot name="default">
			<span>{{ text }}</span><sup v-if="required">*</sup>
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import {
	useBorder,
	useBothColor,
	useMargin,
	usePadding,
	useProps,
	useRounded,
	useStyle,
	useTypography
} from '../../composables'

	import { vContrast } from '../../directives'

	import type { ILabelProps, ILabelSlots} from '../../interfaces'

	import type { ILabelEmits } from '../../interfaces/Label/label.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ILabelProps>(), {
		tag: 'label'
	})
	const emits = defineEmits<ILabelEmits>()

	defineSlots<ILabelSlots>()

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = (e: MouseEvent) => {
		emits('click', e)
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Typography
	 *
	 * @description
	 * SCSS reads: font-size · font-weight · line-height · letter-spacing.
	 * fontFamily emits its var but label SCSS has no font-family rule — no visual effect.
	 ********************************************************/

	const {typographyStyles} = useTypography(props, 'label')

	const labelStyles = computed(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const labelClasses = computed(() => {
		return [
			'origam-label',
			{
				'origam-label--floating': props.floating
			},
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	const {filterProps} = useProps<ILabelProps>(props)
	const {id, css, load, isLoaded, unload} = useStyle(labelStyles)


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
	.origam-label {
		color:           var(--origam-label---color);
		font-size:       var(--origam-label---font-size);
		font-weight:     var(--origam-label---font-weight);
		line-height:     var(--origam-label---line-height);
		letter-spacing:  var(--origam-label---letter-spacing);
		pointer-events:  var(--origam-label---pointer-events);
		transition-property:        var(--origam-label---transition-property, color);
		transition-duration:        var(--origam-label---transition-duration);
		transition-timing-function: var(--origam-label---transition-easing);

		sup {
			color: var(--origam-label---required-indicator-color);
		}

		&--floating {
			font-size:  var(--origam-label__floating---font-size);
			visibility: var(--origam-label__floating---visibility);
		}
	}
</style>

