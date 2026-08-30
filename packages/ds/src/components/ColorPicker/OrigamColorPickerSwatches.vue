<template>
	<div
			:id="id"
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
					<button
							type="button"
							class="origam-color-picker-swatches__color"
							:aria-label="swatchLabel(color)"
							:aria-pressed="isSelected(color)"
							:disabled="disabled"
							@click="handleUpdateColor(color)"
					>
						<div :style="{ 'background-color': background(color)}">
							<template v-if="isSelected(color)">
								<origam-icon
										:color="getContrast(color, '#FFFFFF') > 2 ? 'white' : 'black'"
										:icon="MDI_ICONS.CHECK_CIRCLE_OUTLINE"
										aria-hidden="true"
										size="x-small"
								/>
							</template>
						</div>
					</button>
				</template>
			</div>
		</template>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'

  import type {
    IColorPickerSwatchesProps,
    IColorPickerSwatchesSlots
  } from '../../interfaces/ColorPicker/color-picker-swatches.interface'

	import type { IColorPickerSwatchesEmits } from '../../interfaces/ColorPicker/color-picker-swatches.interface'
	import type { TColorType, TRGBA } from '../../types/Commons/color.type'

	import { convertToUnit, deepEqual } from '../../utils/Commons/commons.util'
	import { getContrast, parseColor, RGBtoCSS, RGBtoHSV } from '../../utils/Commons/color.util'

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

  defineSlots<IColorPickerSwatchesSlots>()

	const {filterProps} = useProps<IColorPickerSwatchesProps>(props)

	const {t} = useLocale()

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
	 * Accessibility (issue #443)
	 *
	 * @description
	 * Each swatch was a bare `<div @click>` — no accessible name (a
	 * screen reader announced nothing distinguishing one swatch from
	 * another), no tabindex, no keyboard path. Now a real
	 * `<button type="button">`: `isSelected` also fixes the pre-existing
	 * `deepEqual(colorHsv, hsva)` bug (#401, comparing against the
	 * FUNCTION `hsva` itself rather than its return value) by
	 * centralising the comparison in one place instead of repeating it
	 * inline in the template twice.
	 ********************************************************/
	const isSelected = (color: TColorType) => {
		return !!props.colorHsv && deepEqual(props.colorHsv, hsva(color))
	}
	const swatchLabel = (color: TColorType) => {
		return t('origam.color_picker.swatches.aria_label', background(color))
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	/*********************************************************
	 * handleUpdateColor — disabled guard (#401)
	 *
	 * @description
	 * `disabled` is declared on `IColorPickerSwatchesProps` and forwarded
	 * by the parent color picker, but was never read anywhere in this
	 * component — a swatch click emitted `update:colorHsv` regardless of
	 * the prop's value.
	 ********************************************************/
	const handleUpdateColor = (color: TColorType) => {
		if (props.disabled) return

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
	const {id, css, load, isLoaded, unload} = useStyle(colorPickerSwatchesStyles, () => props.id)


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

			// issue #443 — now a real <button> (was a bare <div>): reset the
			// UA button chrome so the checkerboard background + dimensions
			// aren't disturbed by a default border/padding/font.
			border: none;
			padding: 0;
			font: inherit;
			color: inherit;

			&:disabled {
				cursor: default;
				opacity: 0.5;
			}

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
