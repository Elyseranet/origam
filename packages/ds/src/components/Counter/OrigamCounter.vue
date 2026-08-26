<template>
	<origam-transition
			:disabled="!isBooted"
			:transition="transition"
	>
		<component
				:is="tag"
				v-show="active"
				:id="id"
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
	import OrigamSlideY from '../Transition/OrigamSlideY.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { ICounterEmits, ICounterProps, ICounterSlots } from '../../interfaces/Counter/counter.interface'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { computed, StyleValue, toRef } from "vue"

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ICounterProps>(), {
		value: 0,
		tag: 'div',
		transition: () => ({component: OrigamSlideY}) as unknown as TTransitionProps
	})

	defineEmits<ICounterEmits>()

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
	/*********************************************************
	 * Density and transition contract
	 *
	 * @description
	 * `density` emits a class that shifts `--origam-counter---density`, a
	 * DELTA in px added to the theme token — the same grammar as Card and
	 * Chip. It must never assign `--origam-counter---font-size` itself.
	 * @description
	 * Assigning that token was issue #356: any density replaced the themed
	 * value with a hardcoded px, so `counter.font-size` set by a theme was
	 * silently dropped, and `density="default"` rendered 12px where no
	 * density at all rendered the token's 10px.
	 * @description
	 * `transition-property` is declared explicitly because a lone
	 * `transition-duration` leaves the initial value `all`, which animates
	 * `font-size`. That is what made the font look pinned: for 150ms after
	 * any change `getComputedStyle().fontSize` still reported the OLD size
	 * and the box kept its old height, so every synchronous measurement —
	 * including one taken after forcing an inline `font-size` — read a
	 * value that had not landed yet.
	 * @description
	 * Font size is a layout property; animating it reflows on every theme
	 * or density change. Only paint properties belong here.
	 ********************************************************/
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
	const {id, css, load, isLoaded, unload} = useStyle(counterStyles, () => props.id)


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
		--origam-counter---density: 0px;

		color: currentColor;
		flex: 0 1 auto;
		font-size: calc(var(--origam-counter---font-size, 12px) + var(--origam-counter---density));
		transition-property: color, opacity;
		transition-duration: var(--origam-counter---transition-duration, 150ms);

		&--density-comfortable {
			--origam-counter---density: 1px;
		}

		&--density-default {
			--origam-counter---density: 0px;
		}

		&--density-compact {
			--origam-counter---density: -1px;
		}
	}
</style>

