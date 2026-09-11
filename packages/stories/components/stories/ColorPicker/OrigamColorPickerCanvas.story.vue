<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPickerCanvas"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerCanvasProps>>({ dotSize: 15, height: 150, width: '100%' })"
		>
			<template #default="{ state }">
				<origam-color-picker-canvas
						:color-hsv="defaultColor"
						:dot-size="state.dotSize"
						:height="state.height"
						:width="state.width"
						:max-height="state.maxHeight"
						:max-width="state.maxWidth"
						:min-height="state.minHeight"
						:min-width="state.minWidth"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Dot">
					<HstNumber v-model="state.dotSize" title="Dot Size" :min="4" :max="30" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerCanvasProps>>({ disabled: false, ariaLabel: '' })"
		>
			<template #default="{ state }">
				<origam-color-picker-canvas
						:color-hsv="defaultColor"
						:disabled="state.disabled"
						:aria-label="state.ariaLabel || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.ariaLabel" title="Aria Label"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:colorHsv">
			<origam-color-picker-canvas
					:color-hsv="defaultColor"
					@update:color-hsv="logEvent('update:colorHsv', $event)"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IColorPickerCanvasProps>>({ dotSize: 15, height: 150, width: '100%', disabled: false })"
		>
			<template #default="{ state }">
				<origam-color-picker-canvas
						v-bind="state"
						:color-hsv="defaultColor"
						@update:color-hsv="logEvent('update:colorHsv', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstNumber v-model="state.dotSize" title="Dot Size" :min="4" :max="30" :step="1"/>
					<HstText   v-model="state.height"  title="Height"/>
					<HstText   v-model="state.width"   title="Width"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
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

	import { OrigamColorPickerCanvas } from '@origam/components'
	import type { IColorPickerCanvasProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const defaultColor = { h: 210, s: 0.7, v: 0.8, a: 1 }
</script>

<docs lang="md">
ColorPickerCanvas sub-component — the 2-D HSV gradient canvas for hue/saturation picking.
</docs>
