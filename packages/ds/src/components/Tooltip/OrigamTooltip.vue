<template>
	<origam-overlay
			:id="id"
			ref="origamOverlayRef"
			v-model="isActive"
			:activator-props="activatorProps"
			:class="tooltipClasses"
			:location="location"
			:origin="origin"
			:style="tooltipStyles"
			:transition="transition"
			absolute
			disable-global-stack
			persistent
			role="tooltip"
			v-bind="{...overlayProps, ...scopeId}"
	>
		<template #activator="{props}">
			<slot
					name="activator"
					v-bind="{props}"
			/>
		</template>

		<template #default>
			<div
					v-contrast
					:class="tooltipContentClasses"
					:style="[colorStyles, typographyStyles]"
			>
				<slot name="default">
					<span>{{ text }}</span>
				</slot>
			</div>
		</template>
	</origam-overlay>
</template>

<script
		lang="ts"
		setup
>
	import { computed, mergeProps, ref, StyleValue, toRef } from 'vue'
	import { OrigamFade, OrigamOverlay, OrigamTranslateScale } from '../../components'

	import {
	useBothColor,
	useProps,
	useScopeId,
	useStyle,
	useTypography,
	useVModel
} from '../../composables'

	import { vContrast } from '../../directives'

	import { INLINE, LOCATION_STRATEGIES, SCROLL_STRATEGIES } from '../../enums'

	import type { ITooltipProps} from '../../interfaces'

	import type { ITooltipEmits } from '../../interfaces/Tooltip/tooltip.interface'

	import type { TAnchor, TOrigamOverlay } from '../../types'

	import { forwardRefs, getUid } from '../../utils'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ITooltipProps>(), {
		closeOnBack: false,
		location: INLINE.RIGHT,
		locationStrategy: LOCATION_STRATEGIES.CONNECTED,
		eager: true,
		minWidth: 0,
		offset: 10,
		openOnClick: false,
		openOnHover: true,
		origin: 'auto',
		scrim: false,
		scrollStrategy: SCROLL_STRATEGIES.REPOSITION,
		transition: false
	})

	defineEmits<ITooltipEmits>()

	const {filterProps} = useProps<ITooltipProps>(props)

	// `useBothColor` produces inline `color: …` and `background-color: …`
	// declarations from intent props. Pre-fix `ITooltipProps` did NOT
	// extend `IColorProps`, so a consumer `<origam-tooltip
	// color="primary">` was a silent no-op despite the SCSS reading
	// `var(--origam-tooltip---background-color)` from the design tokens.
	// Wired here so the inline declaration on `.origam-tooltip__content`
	// wins via inline-style specificity.
	// Phase 3 (Vague C) — class-first companion alongside inline styles.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {typographyStyles} = useTypography(props, 'tooltip')

	/*********************************************************
	 * Value
	 ********************************************************/

	const isActive = useVModel(props, 'modelValue')
	const {scopeId} = useScopeId()

	const uid = getUid()
	const id = computed(() => props.id || `origam-tooltip-${uid}`)

	const origamOverlayRef = ref<TOrigamOverlay>()

	const location = computed(() => {
		return props.location.split(' ').length > 1
				? props.location
				: props.location + ' center' as TAnchor
	})

	const origin = computed(() => {
		return (
				props.origin === 'auto' ||
				props.origin === 'overlap' ||
				props.origin.split(' ').length > 1 ||
				props.location.split(' ').length > 1
		) ? props.origin
				: props.origin + ' center' as TAnchor | 'auto' | 'overlap'
	})

	const transition = computed(() => {
		if (props.transition) return props.transition
		return {component: isActive.value ? OrigamTranslateScale : OrigamFade}
	})

	const activatorProps = computed(() => {
		return mergeProps({
			'aria-describedby': id.value
		}, props.activatorProps)
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const overlayProps = computed(() => {
		return origamOverlayRef.value?.filterProps(props, ['activatorProps', 'class', 'style', 'modelValue', 'location', 'origin', 'transition', 'disableGlobalStack', 'absolute', 'persistent', 'id'])
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const tooltipStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const tooltipContentClasses = computed(() => {
		return [
			'origam-tooltip__content',
			colorClasses.value
		]
	})
	const tooltipClasses = computed(() => {
		return [
			'origam-tooltip',
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(tooltipStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleId
	}, origamOverlayRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-tooltip {
		background-color: transparent;
		z-index: var(--origam-tooltip---z-index, 1070);
	}

	.origam-tooltip__content {
		background-color: var(--origam-tooltip---background-color, var(--origam-color__neutral---800));
		color: var(--origam-tooltip---color, var(--origam-color__text---inverse));
		backdrop-filter: var(--origam-tooltip---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-tooltip---backdrop-filter, none);
		font-size: var(--origam-tooltip---font-size, 0.75rem);
		font-weight: var(--origam-tooltip---font-weight, 500);
		line-height: var(--origam-tooltip---line-height, 1.5);
		padding-block: var(--origam-tooltip---padding-block, 4px);
		padding-inline: var(--origam-tooltip---padding-inline, 8px);
		border-radius: var(--origam-tooltip---border-radius, 4px);
		max-width: var(--origam-tooltip---max-width, 300px);
		opacity: var(--origam-tooltip---opacity, 1);
		display: inline-block;
		width: max-content;
	}
</style>
