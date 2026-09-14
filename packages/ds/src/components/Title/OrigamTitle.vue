<template>
	<component
			:is="tag"
			:id="id"
			v-contrast
			:class="titleClasses"
			:style="titleStyles"
	>
		<slot
				v-if="hasContent"
				name="default"
		>
			{{ text }}
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef, useSlots } from 'vue'
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import type { ITitleEmits, ITitleProps, ITitleSlots } from '../../interfaces/Title/title.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults, filterProps utility, and slot ref.
	 ********************************************************/
	// `h2`, NOT `h1`. A document may carry exactly ONE `h1`, so `h1` is the
	// one level a shared component must never emit by default: two untagged
	// titles on a page produced two `h1`s and broke both the heading order
	// and the automated a11y audit. `h2` is the deepest level that is always
	// valid under a page-owned `h1`, and repeating it is legal.
	// The right level still depends on document position, which the
	// component cannot know — pass `tag` explicitly whenever it matters.
	const props = withDefaults(defineProps<ITitleProps>(), {tag: 'h2'})

	const {filterProps} = useProps<ITitleProps>(props)

	defineEmits<ITitleEmits>()

	defineSlots<ITitleSlots>()

	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const slots = useSlots()
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {typographyStyles} = useTypography(props, 'title')

	const hasContent = computed(() => {
		return slots.default || props.text
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles.
	 ********************************************************/
	const titleStyles = computed(() => {
		return [
			colorStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const titleClasses = computed(() => {
		return [
			'origam-title',
			colorClasses.value,
			densityClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	// NOTE: `useStyle` returns the id its generated `#<id> { … }` rule
	// targets. It MUST stay aliased — leaving it named `id` shadows the `id`
	// PROP in the template, so `:id="id"` on the root would bind the
	// generated id instead of the consumer's, silently dropping `id` /
	// breaking `aria-labelledby`.
	// Passing `() => props.id` is the other half of the same defect: without
	// it the root carried the consumer's `id` while the rule kept targeting
	// the generated one, so the two DIVERGED and the rule matched nothing.
	// Same correction as OrigamBtn — latent here rather than visible, because
	// Title also applies the very same bag inline via `:style`, and an inline
	// style outranks an id rule anyway.
	const {id: styleId, css, load, isLoaded, unload} = useStyle(titleStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id: styleId,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-title {
		color:          var(--origam-title---color);
		font-family:    var(--origam-title---font-family);
		font-size:      var(--origam-title---font-size, var(--origam-title---font-size-md));
		font-weight:    var(--origam-title---font-weight);
		letter-spacing: var(--origam-title---letter-spacing);
		line-height:    var(--origam-title---line-height);
		margin-block-start: var(--origam-title---margin-block-start);
		margin-block-end:   var(--origam-title---margin-block-end);

		&--density-compact {
			font-size: var(--origam-title---font-size, var(--origam-title---font-size-xs));
		}

		&--density-default {
			font-size: var(--origam-title---font-size, var(--origam-title---font-size-md));
		}

		&--density-comfortable {
			font-size: var(--origam-title---font-size, var(--origam-title---font-size-xl));
		}
	}
</style>
