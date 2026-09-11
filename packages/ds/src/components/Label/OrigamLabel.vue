<template>
	<component
			:is="tag"
			:id="id"
			v-contrast
			:class="labelClasses"
			:style="labelStyles"
			:name="resolvedName"
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
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { NAME_ATTR_TAGS } from '../../consts/Commons/commons.const'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import type { ILabelProps, ILabelSlots } from '../../interfaces/Label/label.interface'

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
	 * name attribute
	 *
	 * @description
	 * `name` is only a valid content attribute on a handful of elements
	 * (see NAME_ATTR_TAGS). The default tag here is `label`, which is NOT
	 * one of them, so binding it unconditionally rendered
	 * `<label name="…">` — ignored by the browser and a W3C validation
	 * error on every page using the component (issue #458).
	 * @description
	 * Resolved lazily in a computed rather than read in the setup body, so
	 * a `tag` supplied by `theme.components` is still seen (ADR-005).
	 ********************************************************/
	const resolvedName = computed(() => (
		NAME_ATTR_TAGS.has(String(props.tag)) ? props.name : undefined
	))

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
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on the root rendered the
	 * generated id, never the consumer's.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(labelStyles, () => props.id)


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

