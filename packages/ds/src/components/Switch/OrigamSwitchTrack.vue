<template>
	<div
			:class="switchTrackClasses"
			:style="switchTrackStyles"
			@click="handleClick"
	>
		<div
				v-if="slots['track.true']"
				key="prepend"
				class="origam-switch-track__true"
		>
			<slot
					name="track.true"
					v-bind="slotProps"
			/>
		</div>

		<div
				v-if="slots['track.false']"
				key="append"
				class="origam-switch-track__false"
		>
			<slot
					name="track.false"
					v-bind="slotProps"
			/>
		</div>

		<slot
				name="overlay"
				v-bind="slotProps"
		/>
	</div>
</template>

<script
		lang="ts"
		setup
>
	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and composables for OrigamSwitchTrack.
	 ********************************************************/
	import { computed, StyleValue, useSlots } from 'vue'

	import {
	useBackgroundColor,
	useBorder,
	useElevation,
	useProps,
	useRounded,
	useStyle
} from '../../composables'

	import type { ISwitchTrackProps, ISwitchTrackSlots} from "../../interfaces"

	import type { ISwitchTrackEmits } from '../../interfaces/Switch/switch-track.interface'

	const props = withDefaults(defineProps<ISwitchTrackProps>(), {
		modelValue: false,
		isValid: null,
		disabled: false,
		readonly: false,
		error: false,
		inset: false
	})

	const emits = defineEmits<ISwitchTrackEmits>()

	defineSlots<ISwitchTrackSlots>()

	const {filterProps} = useProps<ISwitchTrackProps>(props)

	const slots = useSlots()

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Track background color resolution and slot props.
	 ********************************************************/

	// Strict channel separation — `bgColor` ONLY paints the rail. The
	// `color` prop is exposed for slot consumers but is NOT applied here:
	// the foreground (thumb / label) is handled by the surrounding
	// SelectionControl wrapper via `currentColor`.
	const trackBgColor = computed(() => {
		// Disabled / error are token-driven (see SCSS) — return undefined
		// so the consumer's `bgColor` doesn't override them.
		if (props.disabled || props.error) return undefined

		return props.bgColor
	})

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {backgroundColorStyles} = useBackgroundColor(trackBgColor)

	// Props-first (lot 4 theming fix) — the track owns the visual surface,
	// so `border`/`rounded`/`elevation` (declared on `ISwitchTrackProps`,
	// forwarded from `OrigamSwitch` via `filterProps`) are consumed here,
	// not on the outer `OrigamSwitch`/`OrigamSelectionControl` wrapper.
	const {borderClasses, borderStyles} = useBorder(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {elevationClasses, elevationStyles} = useElevation(props)

	const slotProps = computed(() => ({
		model: props.modelValue,
		isValid: props.isValid
	}))

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Click handler with propagation control for toggle forwarding.
	 ********************************************************/

	const handleClick = (e: MouseEvent) => {
		if (props.disabled || props.readonly) return

		// Stop the click from bubbling to the underlying SelectionControl
		// AND prevent the default browser behaviour — the consumer is
		// expected to forward the click manually to the hidden `<input>`
		// via this emit (see OrigamSwitch). Pre-fix the click bubbled and
		// the input toggled twice (once from the bubble, once from the
		// emit-driven `.click()`), which silently swallowed every other
		// click.
		e.stopPropagation()
		e.preventDefault()
		emits('click', e)
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and inline styles.
	 ********************************************************/

	const switchTrackStyles = computed(() => {
		return [
			backgroundColorStyles.value,
			borderStyles.value,
			roundedStyles.value,
			elevationStyles.value,
			props.style
		] as StyleValue
	})
	const switchTrackClasses = computed(() => {
		return [
			'origam-switch-track',
			{
				'origam-switch-track--dirty': props.modelValue,
				'origam-switch-track--disabled': props.disabled,
				'origam-switch-track--readonly': props.readonly,
				'origam-switch-track--error': props.error,
				'origam-switch-track--inset': props.inset
			},
			borderClasses.value,
			roundedClasses.value,
			elevationClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(switchTrackStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent components via template refs.
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
	.origam-switch-track {
		$this: &;

		position: relative;
		display: inline-flex;
		align-items: center;
		font-size: 0.5rem;
		padding: 0 5px;
		background-color: var(--origam-switch__track---background-color, rgb(163, 163, 163));
		border-radius: var(--origam-switch__track---border-radius, 9999px);
		height: var(--origam-switch__track---height, 14px);
		min-width: var(--origam-switch__track---width, 36px);
		backdrop-filter: var(--origam-switch__track---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-switch__track---backdrop-filter, none);
		cursor: pointer;
		transition: 0.2s background-color cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;

		@media (prefers-reduced-motion: reduce) {
			transition: none;
		}

		@media (forced-colors: active) {
			border: 1px solid;
			color: buttontext;
			transition: none;
		}

		&__true {
			margin-inline-end: auto;
		}

		&__false {
			margin-inline-start: auto;
		}

		&:not(#{$this}--dirty) {
			#{$this}__true {
				opacity: 0;
			}
		}

		&--dirty {
			#{$this}__false {
				opacity: 0;
			}
		}

		&--disabled {
			cursor: default;
			opacity: var(--origam-switch---opacity-disabled, 0.32);
		}

		&--dirty#{$this}--disabled {
			background-color: var(--origam-switch__track---background-color-disabled, rgb(163, 163, 163));
		}

		&--error {
			&:not(#{$this}--disabled) {
				background-color: rgba(255, 0, 0, 1);
				color: rgba(255, 255, 255, 1);
			}
		}

		&--inset {
			border-radius: var(--origam-switch__track---border-radius, 9999px);
			font-size: 0.75rem;
			height: var(--origam-switch__track--inset---height, 32px);
			min-width: var(--origam-switch__track--inset---width, 52px);

			@media (forced-colors: active) {
				border-width: 2px;
			}
		}

		@media (forced-colors: active) {
			&--dirty {
				background-color: highlight;
				color: highlight;
			}
		}
	}
</style>

