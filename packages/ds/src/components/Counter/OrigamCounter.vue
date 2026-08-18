<template>
	<origam-transition
			:disabled="!isBooted"
			:transition="transition"
	>
		<component
				:is="tag"
				v-show="active"
				:class="counterClasses"
				:style="counterStyles"
		>
			<slot
					name="default"
					v-bind="{ counter, max: max, value: value}"
			>
				{{ counter }}
			</slot>
		</component>
	</origam-transition>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSlideY, OrigamTransition } from "../../components"

	import {
		useBorder,
		useBothColor,
		useDensity,
		useElevation,
		useMargin,
		usePadding,
		useProps,
		useRounded,
		useSsrBoot,
		useStyle
	} from "../../composables"

	import type { ICounterProps, ICounterSlots } from "../../interfaces"
	import type { TTransitionProps } from "../../types"

	import { computed, StyleValue, toRef } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ICounterProps>(), {
		value: 0,
		tag: 'div',
		transition: () => ({component: OrigamSlideY}) as unknown as TTransitionProps
	})

	defineSlots<ICounterSlots>()

	const {filterProps} = useProps<ICounterProps>(props)

	// `useBothColor` produces inline `color: …` and `background-color: …`
	// declarations from intent props. ICounterProps already extends
	// IColorProps but the component never consumed it — `<origam-counter
	// color="primary">` was a silent no-op despite the type system
	// promising otherwise. Audit-fix.
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	// Same audit-fix as `color` above, one rung out: ICounterProps also
	// extends IPaddingProps / IMarginProps / IBorderProps / IRoundedProps /
	// IElevationProps and consumed none of them, so 33 typed props resolved
	// to nothing at runtime.
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses, elevationStyles} = useElevation(props)
	const {densityClasses} = useDensity(props)

	const {isBooted} = useSsrBoot()

	const counter = computed(() => {
		return props.max ? `${props.value} / ${props.max}` : String(props.value)
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const counterStyles = computed(() => {
		return [
			colorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			elevationStyles.value,
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})
	const counterClasses = computed(() => {
		return [
			'origam-counter',
			{
				'origam-counter--error': props.max && !props.disabled && parseFloat(props.value) > parseFloat(props.max)
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			densityClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(counterStyles)


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
	.origam-counter {
		color: currentColor;
		flex: 0 1 auto;
		font-size: var(--origam-counter---font-size, 12px);
		transition-duration: 150ms;

		&--density-comfortable {
			--origam-counter---font-size: 13px;
		}

		&--density-default {
			--origam-counter---font-size: 12px;
		}

		&--density-compact {
			--origam-counter---font-size: 11px;
		}
	}
</style>

