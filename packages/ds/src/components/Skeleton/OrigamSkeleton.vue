<template>
	<template v-if="!loading">
		<slot/>
	</template>

	<div
			v-else-if="variant === 'list-item'"
			:class="skeletonContainerClasses"
			:style="skeletonContainerStyles"
			aria-busy="true"
			aria-label="Loading"
			role="status"
	>
		<div
				:class="skeletonCircularClasses"
				:style="circularStyle"
		/>
		<div class="origam-skeleton__lines">
			<div :class="skeletonTextClasses"/>
			<div :class="skeletonTextClasses"/>
		</div>
	</div>

	<div
			v-else-if="variant === 'card'"
			:class="skeletonContainerClasses"
			:style="skeletonContainerStyles"
			aria-busy="true"
			aria-label="Loading"
			role="status"
	>
		<div :class="skeletonRectangularClasses"/>
		<div :class="skeletonTextClasses"/>
		<div :class="skeletonTextClasses"/>
		<div :class="skeletonTextClasses"/>
	</div>

	<div
			v-else
			:class="skeletonClasses"
			:style="skeletonStyles"
			aria-busy="true"
			aria-label="Loading"
			role="status"
	/>
</template><script
		lang="ts"
		setup
>
	import {
	useBothColor,
	useProps,
	useRounded,
	useSize,
	useStyle
} from '../../composables'
	import type { ISkeletonProps } from '../../interfaces'
	import { convertToUnit } from '../../utils'
	import { computed, toRef } from 'vue'
	import type { StyleValue } from 'vue'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ISkeletonProps>(), {
		variant: 'rectangular',
		loading: true,
		pulse: true
	})

	const {filterProps} = useProps<ISkeletonProps>(props)
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {sizeClasses, sizeStyles} = useSize(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	// ── Resolve width / height to CSS strings ──────────────────────────────
	const resolvedWidth = computed(() => {
		if (props.variant === 'text' && props.width == null) return '100%'
		return props.width != null ? convertToUnit(props.width) : undefined
	})

	const resolvedHeight = computed(() => {
		if (props.variant === 'text') {
			return props.height != null ? convertToUnit(props.height) : 'var(--origam-skeleton---text-height)'
		}
		if (props.variant === 'circular') {
			// height mirrors width for circles
			return props.width != null ? convertToUnit(props.width) : undefined
		}
		return props.height != null ? convertToUnit(props.height) : undefined
	})

	// ── For circular, expose as a sub-style so the preset wrappers can use it ──
	const circularSize = computed(() => props.width != null ? convertToUnit(props.width) : '36px')
	const circularStyle = computed(() => ({
		width: circularSize.value,
		height: circularSize.value
	}))

	// ── Composite-variant container ────────────────────────────────────────
	/*********************************************************
	 * Class & Style
	 ********************************************************/

	const skeletonCircularClasses = computed(() => [
		'origam-skeleton',
		{ 'origam-skeleton--pulse': props.pulse },
		'origam-skeleton--circular'
	])
	const skeletonTextClasses = computed(() => [
		'origam-skeleton',
		{ 'origam-skeleton--pulse': props.pulse },
		'origam-skeleton--text'
	])
	const skeletonRectangularClasses = computed(() => [
		'origam-skeleton',
		{ 'origam-skeleton--pulse': props.pulse },
		'origam-skeleton--rectangular'
	])
	const skeletonContainerClasses = computed(() => [
		'origam-skeleton-wrapper',
		`origam-skeleton-wrapper--${props.variant}`,
		props.class
	])

	const skeletonContainerStyles = computed<StyleValue>(() => [props.style] as StyleValue)

	// ── Single-block classes & styles ──────────────────────────────────────
	const skeletonClasses = computed(() => [
		'origam-skeleton',
		`origam-skeleton--${props.variant}`,
		{'origam-skeleton--pulse': props.pulse},
		colorClasses.value,
		roundedClasses.value,
		sizeClasses.value,
		props.class
	])

	const skeletonStyles = computed<StyleValue>(() => {
		const styles: Record<string, string | undefined> = {}

		if (resolvedWidth.value) styles['width'] = resolvedWidth.value
		if (resolvedHeight.value) styles['height'] = resolvedHeight.value

		return [styles, colorStyles.value, roundedStyles.value, sizeStyles.value, props.style] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(skeletonStyles)


	/*********************************************************
	 * Expose
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
	@keyframes origam-skeleton-wave {
		0%   { background-position: -200% 0 }
		100% { background-position: 200% 0 }
	}

	@keyframes origam-skeleton-spin {
		from { transform: rotate(0deg) }
		to   { transform: rotate(360deg) }
	}

	.origam-skeleton {
		display: block;
		background-color: var(--origam-skeleton---background-color);
		border-radius: var(--origam-skeleton---border-radius);
		width: 100%;
		height: var(--origam-skeleton---text-height);

		&--text {
			height: var(--origam-skeleton---text-height);
			border-radius: var(--origam-skeleton---border-radius);
		}

		&--rectangular {
			border-radius: var(--origam-skeleton---border-radius);
			height: 100%;
		}

		&--circular {
			border-radius: var(--origam-skeleton---border-radius-circular, 50%);
			flex-shrink: 0;
		}

		&--card,
		&--list-item {
			display: none;
		}

		&--text.origam-skeleton--pulse,
		&--rectangular.origam-skeleton--pulse {
			background-image: linear-gradient(
				90deg,
				transparent 0%,
				var(
					--origam-skeleton---wave-color,
					color-mix(in srgb, var(--origam-skeleton---background-color) 50%, white)
				) 50%,
				transparent 100%
			);
			background-repeat: no-repeat;
			background-size: 200% 100%;
			animation: origam-skeleton-wave var(--origam-skeleton---animation-duration, 1500ms) linear infinite;
		}

		&--circular.origam-skeleton--pulse {
			background:
				conic-gradient(
					from 0deg,
					transparent 0deg,
					var(
						--origam-skeleton---wave-color,
						color-mix(in srgb, var(--origam-skeleton---background-color) 50%, white)
					) 90deg,
					var(--origam-skeleton---background-color) 270deg
				);
			animation: origam-skeleton-spin var(--origam-skeleton---animation-duration, 1500ms) linear infinite;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.origam-skeleton--pulse {
			animation: none;
			background-image: none;
		}
	}

	.origam-skeleton-wrapper {
		&--list-item {
			display: flex;
			gap: var(--origam-skeleton---gap, 12px);
			align-items: center;

			> .origam-skeleton--circular {
				flex-shrink: 0;
			}

			> .origam-skeleton__lines {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 6px;

				> .origam-skeleton:nth-child(1) {
					width: 60%;
				}

				> .origam-skeleton:nth-child(2) {
					width: 40%;
					opacity: 0.7;
				}
			}
		}

		&--card {
			display: flex;
			flex-direction: column;

			> .origam-skeleton:nth-child(1) {
				height: 80px;
				margin-bottom: 10px;
			}

			> .origam-skeleton:nth-child(2) {
				width: 70%;
				margin-bottom: 6px;
			}

			> .origam-skeleton:nth-child(3) {
				width: 90%;
				margin-bottom: 4px;
				opacity: 0.7;
			}

			> .origam-skeleton:nth-child(4) {
				width: 50%;
				opacity: 0.7;
			}
		}
	}
</style>
