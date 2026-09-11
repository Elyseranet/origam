<template>
	<Story
			group="components"
			title="ColorPicker/OrigamColorPicker"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColorPickerProps>>({
					canvasHeight: 150,
					canvasWidth: '100%'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; justify-content: center;">
					<origam-color-picker
							v-model="color"
							:color="state.color"
							:padding="state.padding"
							:margin="state.margin"
							:bg-color="state.bgColor"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:title="state.title"
							:landscape="state.landscape"
							:hide-header="state.hideHeader"
							:canvas-height="state.canvasHeight"
							:canvas-width="state.canvasWidth"
							:width="state.width"
							:height="state.height"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Header">
					<HstText     v-model="state.title"      title="Title"/>
					<HstCheckbox v-model="state.landscape"  title="Landscape"/>
					<HstCheckbox v-model="state.hideHeader" title="Hide Header"/>
				</StoryGroup>
				<StoryGroup title="Canvas">
					<HstNumber v-model="state.canvasHeight" title="Canvas Height" :min="50" :max="400"/>
					<HstText   v-model="state.canvasWidth"  title="Canvas Width"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IColorPickerProps>>({
					hideCanvas: false,
					hideSliders: false,
					hideInputs: false,
					showSwatches: false,
					mode: COLOR_MODES_NAMES.RGBA,
					swatchesMaxHeight: 150,
					disabled: false
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; justify-content: center;">
					<origam-color-picker
							v-model="color"
							:hide-canvas="state.hideCanvas"
							:hide-sliders="state.hideSliders"
							:hide-inputs="state.hideInputs"
							:show-swatches="state.showSwatches"
							:swatches-max-height="state.swatchesMaxHeight"
							:mode="state.mode"
							:disabled="state.disabled"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.hideCanvas"  title="Hide Canvas"/>
					<HstCheckbox v-model="state.hideSliders" title="Hide Sliders"/>
					<HstCheckbox v-model="state.hideInputs"  title="Hide Inputs"/>
					<HstCheckbox v-model="state.showSwatches" title="Show Swatches"/>
				</StoryGroup>
				<StoryGroup title="Swatches">
					<HstNumber v-model="state.swatchesMaxHeight" title="Swatches Max Height" :min="50" :max="400"/>
				</StoryGroup>
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="COLOR_MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — hideCanvas">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color" hide-canvas/>
			</div>
		</Variant>

		<Variant title="Prop — mode">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color" mode="hsla"/>
			</div>
		</Variant>

		<Variant title="Prop — hideSliders & hideInputs">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color" hide-sliders hide-inputs/>
			</div>
		</Variant>

		<Variant title="Prop — showSwatches & swatchesMaxHeight">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color" show-swatches :swatches-max-height="120"/>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-color-picker
					v-model="color"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:mode">
			<origam-color-picker
					v-model="color"
					@update:mode="logEvent('update:mode', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color">
					<strong>Custom canvas area</strong>
				</origam-color-picker>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color">
					<template #title>
						<strong>Pick a colour</strong>
					</template>
				</origam-color-picker>
			</div>
		</Variant>

		<Variant title="Slots - Header">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color">
					<template #header>
						<span style="font-weight: 600; padding: 8px 16px; display: block;">Custom header</span>
					</template>
				</origam-color-picker>
			</div>
		</Variant>

		<Variant title="Slots - Actions">
			<div style="padding: 24px; display: flex; justify-content: center;">
				<origam-color-picker v-model="color">
					<template #actions>
						<origam-btn color="primary" text="Apply" size="small"/>
						<origam-btn text="Cancel" size="small"/>
					</template>
				</origam-color-picker>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IColorPickerProps>>({
					canvasHeight: 150,
					canvasWidth: '100%',
					hideCanvas: false,
					hideSliders: false,
					hideInputs: false,
					showSwatches: false,
					mode: COLOR_MODES_NAMES.RGBA,
					swatchesMaxHeight: 150
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px; display: flex; justify-content: center;">
					<origam-color-picker
							v-model="color"
							v-bind="state"
							@update:model-value="logEvent('update:modelValue', $event)"
							@update:mode="logEvent('update:mode', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstText   v-model="state.title"     title="Title"/>
					<HstNumber v-model="state.canvasHeight" title="Canvas Height" :min="50" :max="400"/>
					<HstText   v-model="state.canvasWidth"  title="Canvas Width"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.hideCanvas"       title="Hide Canvas"/>
					<HstCheckbox v-model="state.hideSliders"      title="Hide Sliders"/>
					<HstCheckbox v-model="state.hideInputs"       title="Hide Inputs"/>
					<HstCheckbox v-model="state.showSwatches"     title="Show Swatches"/>
					<HstCheckbox v-model="state.landscape"        title="Landscape"/>
					<HstCheckbox v-model="state.hideHeader"       title="Hide Header"/>
					<HstCheckbox v-model="state.disabled"         title="Disabled"/>
					<HstSelect   v-model="state.mode"             title="Mode"              :options="COLOR_MODE_OPTIONS"/>
					<HstNumber   v-model="state.swatchesMaxHeight" title="Swatches Max Height" :min="50" :max="400"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'

	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamColorPicker } from '@origam/components'
	import { COLOR_MODES_NAMES } from '@origam/enums'
	import type { IColorPickerProps } from '@origam/interfaces'
	import type { TColorModes } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const color = ref('#42a5f5')

	const COLOR_MODE_OPTIONS: Array<{ label: string; value: TColorModes }> = [
		{ label: 'RGB',  value: COLOR_MODES_NAMES.RGB },
		{ label: 'RGBA', value: COLOR_MODES_NAMES.RGBA },
		{ label: 'HSL',  value: COLOR_MODES_NAMES.HSL },
		{ label: 'HSLA', value: COLOR_MODES_NAMES.HSLA },
		{ label: 'HEX',  value: COLOR_MODES_NAMES.HEX },
		{ label: 'HEXA', value: COLOR_MODES_NAMES.HEXA },
	]
</script>

<docs lang="md" src="@docs/components/ColorPicker/OrigamColorPicker.md"/>
