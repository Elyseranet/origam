<template>
	<div
			:class="colorPickerSwatchesClasses"
			:style="colorPickerSwatchesStyles"
	>
		<template
				v-for="(swatch, _swatchIndex) in swatches"
				:key="_swatchIndex"
		>
			<div class="origam-color-picker-swatches__swatch">
				<template
						v-for="(color, _colorIndex) in swatch"
						:key="_colorIndex"
				>
					<div
							class="origam-color-picker-swatches__color"
							@click="handleUpdateColor(color)"
					>
						<div :style="{ 'background-color': background(color)}">
							<template v-if="colorHsv && deepEqual(colorHsv, hsva)">
								<origam-icon
										:color="getContrast(color, '#FFFFFF') > 2 ? 'white' : 'black'"
										:icon="MDI_ICONS.CHECK_CIRCLE_OUTLINE"
										size="x-small"
								/>
							</template>
						</div>
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamIcon } from "../../components"

	import { useProps , useStyle} from "../../composables"

	import { MDI_ICONS } from "../../enums"

	import type { IColorPickerSwatchesProps} from "../../interfaces"

	import type { IColorPickerSwatchesEmits } from '../../interfaces/ColorPicker/color-picker-swatches.interface'
	import type { TColorType, TRGBA } from "../../types"

	import { convertToUnit, deepEqual, getContrast, parseColor, RGBtoCSS, RGBtoHSV } from "../../utils"

	import { computed, StyleValue } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and swatch color conversion helpers.
	 ********************************************************/

	const props = withDefaults(defineProps<IColorPickerSwatchesProps>(), {
		maxHeight: 150
	})

	const emits = defineEmits<IColorPickerSwatchesEmits>()

	const {filterProps} = useProps<IColorPickerSwatchesProps>(props)

	// `swatches` items are typed as TColorType (string | number | THSVA | TRGBA | THSLA)
	// in the interface. At runtime the consumer always passes RGBA objects, so the
	// cast via unknown is safe and avoids TS2345 on the template bindings.
	const rgba = (color: TColorType) => {
		return parseColor(color as unknown as TRGBA)
	}
	const hsva = (color: TColorType) => {
		return RGBtoHSV(rgba(color))
	}
	const background = (color: TColorType) => {
		return RGBtoCSS(rgba(color))
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleUpdateColor = (color: TColorType) => {
		const colorUpdate = hsva(color)

		if (colorUpdate) {
			emits('update:colorHsv', colorUpdate)
		}
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and injects maxHeight style.
	 ********************************************************/

	const colorPickerSwatchesStyles = computed(() => {
		return [
			{
				maxHeight: convertToUnit(props.maxHeight)
			},
			props.style
		] as StyleValue
	})
	const colorPickerSwatchesClasses = computed(() => {
		return [
			'origam-color-picker-swatches',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerSwatchesStyles)


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
	.origam-color-picker-swatches {
		overflow-y: auto;

		> div {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			padding: 8px;
		}

		&__swatch {
			display: flex;
			flex-direction: column;
			margin-bottom: 10px
		}

		&__color {
			position: relative;
			height: 18px;
			max-height: 18px;
			width: 45px;
			margin: 2px 4px;
			border-radius: 2px;
			-webkit-user-select: none;
			user-select: none;
			overflow: hidden;
			background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAACRJREFUKFNjPHTo0H8GJGBnZ8eIzGekgwJk+0BsdCtRHEQbBQBbbh0dIGKknQAAAABJRU5ErkJggg==) repeat;
			cursor: pointer;

			> div {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
