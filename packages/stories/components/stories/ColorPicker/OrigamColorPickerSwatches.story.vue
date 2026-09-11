<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPickerSwatches"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ maxHeight: 150 })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						:color-hsv="defaultColor"
						:swatches="defaultSwatches"
						:max-height="state.maxHeight"
						:height="state.height"
						:width="state.width"
						:min-height="state.minHeight"
						:min-width="state.minWidth"
						:max-width="state.maxWidth"
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
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ disabled: false })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						:color-hsv="defaultColor"
						:swatches="defaultSwatches"
						:disabled="state.disabled"
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
				:init-state="() => useStoryInitState<Partial<IColorPickerSwatchesProps>>({ disabled: false, maxHeight: 150 })"
		>
			<template #default="{ state }">
				<origam-color-picker-swatches
						v-bind="state"
						:color-hsv="defaultColor"
						:swatches="defaultSwatches"
						@update:color-hsv="logEvent('update:colorHsv', $event)"
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
	import type { THSVA, TColorType } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const defaultColor: THSVA = { h: 210, s: 0.7, v: 0.8, a: 1 }

	const defaultSwatches: Array<Array<TColorType>> = [
		['#F44336', '#E91E63', '#9C27B0'],
		['#3F51B5', '#2196F3', '#03A9F4'],
		['#009688', '#4CAF50', '#8BC34A'],
		['#FFEB3B', '#FF9800', '#FF5722'],
	]
</script>
