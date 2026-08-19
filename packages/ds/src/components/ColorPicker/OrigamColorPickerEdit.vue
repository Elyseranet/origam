<template>
	<div
			:id="id"
			:class="colorPickerEditClasses"
			:style="colorPickerEditStyles"
	>
		<template
				v-for="(inputProps, _i) in inputsProps"
				:key="_i"
		>
			<div
					class="origam-color-picker-edit__field"
			>
				<input
						class="origam-color-picker-edit__input"
						v-bind="{...inputProps}"
				/>
				<span class="origam-color-picker-edit__label">{{ inputProps.label }}</span>
			</div>
		</template>

		<template v-if="enabledModes.length > 1">
			<origam-btn
					:icon="MDI_ICONS.UNFOLD_LESS_HORIZONTAL"
					size="x-small"
					@click="handleUpdateMode"
			/>
		</template>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import OrigamBtn from '../Btn/OrigamBtn.vue'

	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { COLOR_NULL, COLOR_PICKER_MODES } from '../../consts/ColorPicker/color-picker.const'

	import { COLOR_MODES_NAMES } from '../../enums/ColorPicker/color-picker.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

	import type { IColorPickerEditProps } from '../../interfaces/ColorPicker/color-picker-edit.interface'

	import type { IColorPickerEditEmits } from '../../interfaces/ColorPicker/color-picker-edit.interface'

	import { computed, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and mode / input prop computation.
	 ********************************************************/

	const props = withDefaults(defineProps<IColorPickerEditProps>(), {
		mode: COLOR_MODES_NAMES.RGBA,
		modes: () => [COLOR_MODES_NAMES.RGB, COLOR_MODES_NAMES.RGBA, COLOR_MODES_NAMES.HSL, COLOR_MODES_NAMES.HSLA, COLOR_MODES_NAMES.HEX, COLOR_MODES_NAMES.HEXA]
	})

	const emits = defineEmits<IColorPickerEditEmits>()

	const {filterProps} = useProps<IColorPickerEditProps>(props)

	const enabledModes = computed(() => {
		return props.modes.map((key) => ({...COLOR_PICKER_MODES[key], name: key}))
	})

	const inputsProps = computed((): Array<Record<string, unknown>> => {
		const mode = enabledModes.value.find((m) => {
			return m.name === props.mode
		})

		if (!mode) return []

		const color = props.colorHsv ? mode.to(props.colorHsv) : null

		return (mode.inputs?.map(({getValue, getColor, ...inputProps}) => {
			return {
				...mode.inputProps,
				...inputProps,
				disabled: props.disabled,
				value: color && getValue(color),
				onChange: (e: InputEvent) => {
					const target = e.target as HTMLInputElement | null

					if (!target) return

					emits('update:colorHsv', mode.from(getColor(color ?? mode.to(COLOR_NULL), target.value)))
				}
			} as Record<string, unknown>
		}) ?? [])
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleUpdateMode = () => {
		const mi = enabledModes.value.findIndex((m) => {
			return m.name === props.mode
		})

		emits('update:mode', enabledModes.value[(mi + 1) % enabledModes.value.length].name)
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and passes through host styles.
	 ********************************************************/

	const colorPickerEditStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const colorPickerEditClasses = computed(() => {
		return [
			'origam-color-picker-edit',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerEditStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
	.origam-color-picker-edit {
		$this: &;

		display: flex;
		margin-top: 24px;

		&__field {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			text-align: center;

			&:not(:last-child) {
				margin-inline-end: 8px;
			}

			#{$this}__input {
				border-radius: 4px;
				margin-bottom: 8px;
				border: 1px solid rgba(163, 163, 163);
				min-width: 0;
				outline: none;
				text-align: center;
				width: 100%;
				height: 32px;
				background: rgba(255, 255, 255);
				color: rgba(0, 0, 0, .5);
			}

			#{$this}__label {
				// `rem` resolves against the document root, not this component's
				// ancestor — a plain literal here would be immune to the typography
				// bridge `OrigamColorPickerField` republishes on the teleported
				// surface (see `useTeleportTypography`). Generic-first read, same
				// convention as `useTypography`'s rollout: the bridged var wins when
				// present, the historical size is the fallback.
				font-size: var(--origam-color-picker-edit__label---font-size, .75rem);
			}
		}
	}
</style>
