<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPickerPreview"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerPreviewProps>>({ colorHsv: { h: 210, s: 0.7, v: 0.8, a: 0.6 } })"
		>
			<template #default="{ state }">
				<origam-color-picker-preview
						:color-hsv="state.colorHsv"
						:width="state.width"
						:height="state.height"
						:max-width="state.maxWidth"
						:max-height="state.maxHeight"
						:min-width="state.minWidth"
						:min-height="state.minHeight"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerPreviewProps>>({ colorHsv: { h: 210, s: 0.7, v: 0.8, a: 0.6 }, disabled: false, hideAlpha: false })"
		>
			<template #default="{ state }">
				<origam-color-picker-preview
						:color-hsv="state.colorHsv"
						:disabled="state.disabled"
						:hide-alpha="state.hideAlpha"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.hideAlpha" title="Hide Alpha"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:colorHsv">
			<origam-color-picker-preview
					:color-hsv="{ h: 210, s: 0.7, v: 0.8, a: 0.6 }"
					@update:color-hsv="logEvent('update:colorHsv', $event)"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IColorPickerPreviewProps>({ colorHsv: { h: 210, s: 0.7, v: 0.8, a: 0.6 } })"
		>
			<template #default="{ state }">
				<origam-color-picker-preview
						v-bind="state"
						@update:color-hsv="logEvent('update:colorHsv', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstCheckbox v-model="state.hideAlpha" title="Hide Alpha"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
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

	import { OrigamColorPickerPreview } from '@origam/components'
	import type { IColorPickerPreviewProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
</script>
