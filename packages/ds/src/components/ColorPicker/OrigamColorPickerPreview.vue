<template>
	<div
			:class="colorPickerPreviewClasses"
			:style="colorPickerPreviewStyles"
	>
		<template v-if="SUPPORTS_EYE_DROPPER">
			<div
					key="eyeDropper"
					class="origam-color-picker-preview__eye-dropper"
			>
				<origam-btn
						:density="DENSITY.DEFAULT"
						:icon="MDI_ICONS.EYEDROPPER"
						@click="openEyeDropper"
				/>
			</div>
		</template>

		<div class="origam-color-picker-preview__dot">
			<div :style="{ background: HSVtoCSS(colorHsv ?? COLOR_NULL) }"/>
		</div>

		<div class="origam-color-picker-preview__sliders">
			<origam-slider-field
					:disabled="disabled"
					:max="360"
					:model-value="colorHsv?.h"
					:thumb-props="{
							size: 14
						}"
					:track-props="{
							bgColor: 'transparent',
							size: 8
						}"
					class="origam-color-picker-preview__track origam-color-picker-preview__hue"
					hide-details
					@update:model-value="handleUpdateColorHue"
			/>

			<template v-if="!hideAlpha">
				<origam-slider-field
						:disabled="disabled"
						:max="1"
						:min="0"
						:model-value="colorHsv?.a ?? 1"
						:step="1 / 256"
						:thumb-props="{
							size: 14
						}"
						:track-props="{
							bgColor: 'transparent',
							size: 8
						}"
						class="origam-color-picker-preview__track origam-color-picker-preview__alpha"
						hide-details
						@update:model-value="handleUpdateColorAlpha"
				/>
			</template>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBtn, OrigamSliderField } from "../../components"

	import { useProps, useVModel , useStyle} from "../../composables"

	import { COLOR_NULL, SUPPORTS_EYE_DROPPER } from "../../consts"

	import { DENSITY, MDI_ICONS } from "../../enums"

	import type { IColorPickerPreviewProps} from "../../interfaces"

	import type { IColorPickerPreviewEmits } from '../../interfaces/ColorPicker/color-picker-preview.interface'

	import type { THSVA } from "../../types"

	import { consoleWarn, HSVtoCSS, parseColor, RGBtoHSV } from "../../utils"

	import { computed, onUnmounted, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, eye-dropper support and hue / alpha
	 * update handlers.
	 ********************************************************/

	const props = withDefaults(defineProps<IColorPickerPreviewProps>(), {})

	const emits = defineEmits<IColorPickerPreviewEmits>()

	const {filterProps} = useProps<IColorPickerPreviewProps>(props)

	const abortController = new AbortController()

	/*********************************************************
	 * Value
	 ********************************************************/

	const colorHsv = useVModel(props, 'colorHsv', COLOR_NULL)

	const openEyeDropper = async () => {
		if (!SUPPORTS_EYE_DROPPER) return

		const eyeDropper = new window.EyeDropper()

		try {
			const result = await eyeDropper.open({signal: abortController.signal})
			const colorHexValue = RGBtoHSV(parseColor(result.sRGBHex))
			emits('update:colorHsv', {...(props.colorHsv ?? COLOR_NULL), ...colorHexValue})
		} catch (err) {
			consoleWarn(err as any)
		}
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleUpdateColorHue = (h: number) => {
		colorHsv.value!.h = h
		emits('update:colorHsv', {...colorHsv.value, h} as THSVA)
	}
	const handleUpdateColorAlpha = (a: number) => {
		colorHsv.value!.a = a
		emits('update:colorHsv', {...colorHsv.value, a} as THSVA)
	}

	onUnmounted(() => {
		abortController.abort()
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM modifier classes and passes through host styles.
	 ********************************************************/

	const colorPickerPreviewStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const colorPickerPreviewClasses = computed(() => {
		return [
			'origam-color-picker-preview',
			{
				'origam-color-picker-preview--hide-alpha': props.hideAlpha
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerPreviewStyles)


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
	.origam-color-picker-preview {
		align-items: center;
		display: flex;
		margin-bottom: 0;

		&__eye-dropper {
			position: relative;
			margin-right: 12px;
		}

		&__track {
			position: relative;
			width: 100%;
			margin: 0;

			:deep(.origam-slider-field-track__fill) {
				display: none;
			}
		}

		&__alpha {
			:deep(.origam-slider-field-track) {
				background: none;
			}

			:deep(.origam-slider-field-track__background) {
				background-color: transparent;
				background-image: linear-gradient(to right, transparent, var(--origam-color-picker-color-hsv));

				&:after {
					content: "";
					z-index: 0;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					position: absolute;
					background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACRJREFUKFNjPHTo0H8GJGBnZ8eIzGekgwJk+0BsdCtRHEQbBQBbbh0dIGKknQAAAABJRU5ErkJggg==) repeat;
					border-radius: inherit;
				}
			}
		}

		&__sliders {
			display: flex;
			flex: 1 0 auto;
			flex-direction: column;
			padding-inline-end: 16px;
		}

		&__dot {
			position: relative;
			height: 30px;
			width: 30px;
			background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACRJREFUKFNjPHTo0H8GJGBnZ8eIzGekgwJk+0BsdCtRHEQbBQBbbh0dIGKknQAAAABJRU5ErkJggg==) repeat;
			border-radius: 50%;
			overflow: hidden;
			margin-inline-end: 24px;

			> div {
				width: 100%;
				height: 100%;
			}
		}

		&__hue {
			&:not(.origam-input--is-disabled) {
				:deep(.origam-slider-field-track__background) {
					background: linear-gradient(to right, red, #ff0, #0f0, #0ff, #00f, #f0f, red)
				}
			}
		}
	}
</style>
