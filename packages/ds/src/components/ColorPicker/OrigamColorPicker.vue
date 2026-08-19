<template>
	<origam-picker
			ref="origamPickerRef"
			:class="colorPickerClasses"
			:style="colorPickerStyles"
			v-bind="{...pickerProps}"
	>
		<template
				v-if="slots.title"
				#title
		>
			<slot name="title"/>
		</template>

		<template
				v-if="slots.header"
				#header
		>
			<slot
					name="header"
			/>
		</template>

		<slot name="default">
			<template v-if="!hideCanvas">
				<origam-color-picker-canvas
						key="canvas"
						ref="origamColorPickerCanvasRef"
						:color-hsv="currentColor"
						:height="canvasHeight"
						:width="canvasWidth"
						v-bind="{...colorPickerCanvasProps}"
						@update:color-hsv="handleUpdateColor"
				/>
			</template>

			<template v-if="!hideSliders || !hideInputs">
				<div
						key="controls"
						class="origam-color-picker__controls"
				>
					<template v-if="!hideSliders">
						<origam-color-picker-preview
								key="preview"
								ref="origamColorPickerPreviewRef"
								:color-hsv="currentColor"
								:hide-alpha="!mode.endsWith('a')"
								v-bind="{...colorPickerPreviewProps}"
								@update:color-hsv="handleUpdateColor"
						/>
					</template>

					<template v-if="!hideInputs">
						<origam-color-picker-edit
								key="edit"
								ref="origamColorPickerEditRef"
								:color-hsv="currentColor"
								:mode="mode"
								:modes="modes"
								v-bind="{...colorPickerEditProps}"
								@update:mode="handleUpdateMode"
								@update:color-hsv="handleUpdateColor"
						/>
					</template>
				</div>

				<template v-if="showSwatches">
					<origam-color-picker-swatches
							key="swatches"
							ref="origamColorPickerSwatchesRef"
							:color-hsv="currentColor"
							:max-height="swatchesMaxHeight"
							v-bind="{...colorPickerSwatchesProps}"
							@update:color-hsv="handleUpdateColor"
					/>
				</template>
			</template>
		</slot>

		<template
				v-if="slots.actions"
				#actions
		>
			<slot name="actions"/>
		</template>
	</origam-picker>
</template>

<script
		lang="ts"
		setup
>
	import OrigamColorPickerCanvas from './OrigamColorPickerCanvas.vue'
	import OrigamColorPickerEdit from './OrigamColorPickerEdit.vue'
	import OrigamColorPickerPreview from './OrigamColorPickerPreview.vue'
	import OrigamColorPickerSwatches from './OrigamColorPickerSwatches.vue'
	import OrigamPicker from '../Picker/OrigamPicker.vue'

	import { useProps } from '../../composables/Commons/props.composable'
	import { useRtl } from '../../composables/Commons/rtl.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { COLOR_MODES_NAMES } from '../../enums/ColorPicker/color-picker.enum'

	import type { IColorPickerProps } from '../../interfaces/ColorPicker/color-picker.interface'

	import type { IColorPickerEmits, IColorPickerSlots } from '../../interfaces/ColorPicker/color-picker.interface'

	import type { TColorModes } from '../../types/ColorPicker/color-picker.type'
	import type { THSVA } from '../../types/Commons/color.type'
	import type { TOrigamColorPickerCanvas } from '../../types/ColorPicker/color-picker-canvas.type'
	import type { TOrigamColorPickerEdit } from '../../types/ColorPicker/color-picker-edit.type'
	import type { TOrigamColorPickerPreview } from '../../types/ColorPicker/color-picker-preview.type'
	import type { TOrigamColorPickerSwatches } from '../../types/ColorPicker/color-picker-swatches.type'
	import type { TOrigamPicker } from '../../types/Picker/picker.type'

	import { consoleWarn } from '../../utils/Commons/console.util'
	import { extractColor } from '../../utils/ColorPicker/color-picker.util'
	import { HSVtoCSS, parseColor, RGBtoHSV } from '../../utils/Commons/color.util'

	import { computed, onBeforeMount, ref, StyleValue, useSlots, watch } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, model binding, color conversion and
	 * child ref delegation.
	 ********************************************************/

	const props = withDefaults(defineProps<IColorPickerProps>(), {
		canvasHeight: 150,
		canvasWidth: '100%',
		swatchesMaxHeight: 150,
		dotSize: 10,
		mode: COLOR_MODES_NAMES.RGBA,
		modes: () => [COLOR_MODES_NAMES.RGB, COLOR_MODES_NAMES.RGBA, COLOR_MODES_NAMES.HSL, COLOR_MODES_NAMES.HSLA, COLOR_MODES_NAMES.HEX, COLOR_MODES_NAMES.HEXA]
	})

	defineEmits<IColorPickerEmits>()

	defineSlots<IColorPickerSlots>()

	const slots = useSlots()
	const {filterProps} = useProps<IColorPickerProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {rtlClasses} = useRtl()

	/*********************************************************
	 * Value
	 ********************************************************/

	const mode = useVModel(props, 'mode')
	const hue = ref<number | null>(null)
	const model = useVModel(
			props,
			'modelValue',
			undefined,
			(v) => {
				if (v == null || v === '') return null

				let c: THSVA
				try {
					c = RGBtoHSV(parseColor(v as any))
				} catch (err) {
					consoleWarn(err as any)
					return null
				}

				return c
			},
			(v) => {
				if (!v) return null

				return extractColor(v, props.modelValue)
			}
	)
	const currentColor = computed(() => {
		return model.value
				? {...model.value, h: hue.value ?? model.value.h}
				: null
	})

	let externalChange = true
	watch(model, v => {
		if (!externalChange) {
			// prevent hue shift from rgb conversion inaccuracy
			externalChange = true
			return
		}
		if (!v) return
		hue.value = v.h
	}, {immediate: true})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleUpdateColor = (hsva: THSVA) => {
		externalChange = false
		hue.value = hsva.h
		model.value = hsva
	}
	const handleUpdateMode = (m: TColorModes) => {
		mode.value = m
	}

	const origamPickerRef = ref<TOrigamPicker>()
	const origamColorPickerCanvasRef = ref<TOrigamColorPickerCanvas>()
	const origamColorPickerPreviewRef = ref<TOrigamColorPickerPreview>()
	const origamColorPickerEditRef = ref<TOrigamColorPickerEdit>()
	const origamColorPickerSwatchesRef = ref<TOrigamColorPickerSwatches>()

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const pickerProps = computed(() => {
		return origamPickerRef.value?.filterProps(props)
	})
	const colorPickerCanvasProps = computed(() => {
		return origamColorPickerCanvasRef.value?.filterProps(props, ['class', 'style', 'id', 'height', 'colorHsv'])
	})
	const colorPickerPreviewProps = computed(() => {
		return origamColorPickerPreviewRef.value?.filterProps(props, ['class', 'style', 'id', 'colorHsv'])
	})
	const colorPickerEditProps = computed(() => {
		return origamColorPickerEditRef.value?.filterProps(props, ['class', 'style', 'id', 'colorHsv'])
	})
	const colorPickerSwatchesProps = computed(() => {
		return origamColorPickerSwatchesRef.value?.filterProps(props, ['class', 'style', 'id', 'maxHeight', 'colorHsv'])
	})

	onBeforeMount(() => {
		if (!props.modes.includes(mode.value)) mode.value = props.modes[0]
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM mode modifier class and injects the current
	 * HSV color as a CSS custom property.
	 ********************************************************/

	const colorPickerStyles = computed(() => {
		return [
			{
				'--origam-color-picker-color-hsv': HSVtoCSS({...currentColor.value, a: 1} as THSVA)
			},
			props.style
		] as StyleValue
	})
	const colorPickerClasses = computed(() => {
		return [
			'origam-color-picker',
			`origam-color-picker--${mode.value}`,
			rtlClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerStyles)


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
	.origam-color-picker {
		align-self: flex-start;
		contain: content;

		&__controls {
			display: flex;
			flex-direction: column;
			padding: 16px;
		}
	}
</style>
