<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPickerSwatches"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ maxHeight: 150, colorHsv: defaultColor })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						:color-hsv="state.colorHsv"
						:swatches="defaultSwatches"
						:max-height="state.maxHeight"
						:height="state.height"
						:width="state.width"
						:min-height="state.minHeight"
						:min-width="state.minWidth"
						:max-width="state.maxWidth"
						@update:color-hsv="state.colorHsv = $event"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Dimension">
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ disabled: false, colorHsv: defaultColor })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						:color-hsv="state.colorHsv"
						:swatches="defaultSwatches"
						:disabled="state.disabled"
						@update:color-hsv="state.colorHsv = $event"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:colorHsv">
			<origam-color-picker-swatches
					:color-hsv="defaultColor"
					:swatches="defaultSwatches"
					@update:color-hsv="logEvent('update:colorHsv', $event)"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ disabled: false, maxHeight: 150, colorHsv: defaultColor })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						v-bind="state"
						:swatches="defaultSwatches"
						@update:color-hsv="handleUpdate(state, $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.width"     title="Width"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'

	import { OrigamColorPickerSwatches } from '@origam/components'
	import type { IColorPickerSwatchesProps } from '@origam/interfaces'
	import type { THSVA, TColorType, TRGBA } from '@origam/types'
	import { parseColor, RGBtoHSV } from '@origam/utils'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const defaultSwatches: Array<Array<TColorType>> = [
		['#F44336', '#E91E63', '#9C27B0'],
		['#3F51B5', '#2196F3', '#03A9F4'],
		['#009688', '#4CAF50', '#8BC34A'],
		['#FFEB3B', '#FF9800', '#FF5722'],
	]

	/*
	 * The seed MUST be the HSVA of an actual swatch, computed with the same
	 * conversion the component uses — otherwise the selection tick has nothing
	 * to match and the story shows the exact symptom issue #401 was about,
	 * on fixed code. The previous hand-written `{ h: 210, s: 0.7, v: 0.8, a: 1 }`
	 * matched no swatch in the grid.
	 */
	const swatchColor = (color: TColorType): THSVA => RGBtoHSV(parseColor(color as unknown as TRGBA))

	const defaultColor: THSVA = swatchColor('#2196F3')

	/*
	 * The Playground both LOGS the emit (so the event panel documents it) and
	 * writes it back into the variant state (so the tick follows the click).
	 * A story that logs without applying shows a component that never marks a
	 * selection — the exact symptom of #401.
	 */
	const handleUpdate = (state: Partial<IColorPickerSwatchesProps>, colorHsv: THSVA) => {
		logEvent('update:colorHsv', colorHsv)
		state.colorHsv = colorHsv
	}
</script>

<docs lang="md" src="@docs/components/ColorPicker/OrigamColorPickerSwatches.md"/>
