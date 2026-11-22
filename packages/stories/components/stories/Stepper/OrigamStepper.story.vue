<template>
	<Story
			group="components"
			title="Stepper/OrigamStepper"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IStepperProps>>({ color: 'primary', bgColor: undefined, size: 'default', density: 'default' })"
		>
			<template #default="{ state }">
				<origam-stepper
						:items="defaultItems"
						:model-value="1"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
						:min-width="state.minWidth"
						:max-width="state.maxWidth"
						:min-height="state.minHeight"
						:max-height="state.maxHeight"
						:margin="state.margin"
						:padding="state.padding"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
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
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.margin"  title="Margin"/>
					<HstText v-model="state.padding" title="Padding"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IStepperProps>>({ modelValue: 1, orientation: 'horizontal', clickable: false, showConnectors: true })"
		>
			<template #default="{ state }">
				<origam-stepper
						:items="defaultItems"
						:model-value="state.modelValue"
						:orientation="state.orientation"
						:clickable="state.clickable"
						:show-connectors="state.showConnectors"
						@update:model-value="state.modelValue = $event"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber   v-model="state.modelValue" title="Model Value" :min="0" :max="3" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.orientation"    title="Orientation"     :options="STEPPER_ORIENTATION_OPTIONS"/>
					<HstCheckbox v-model="state.showConnectors" title="Show Connectors"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.clickable" title="Clickable"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-stepper
					:items="defaultItems"
					:model-value="1"
					:clickable="true"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-stepper :items="defaultItems" :model-value="1">
				<span>Custom slot content</span>
			</origam-stepper>
		</Variant>

		<Variant title="Slots - Item prepend">
			<origam-stepper :items="defaultItems" :model-value="1">
				<template #item-prepend="{ index }">
					<span data-cy="story-item-prepend">#{{ index }}</span>
				</template>
			</origam-stepper>
		</Variant>

		<Variant title="Slots - Item append">
			<div style="inline-size: 316px">
				<origam-stepper :items="defaultItems" :model-value="1" orientation="vertical">
					<template #item-append="{ status }">
						<span data-cy="story-item-append">{{ status }}</span>
					</template>
				</origam-stepper>
			</div>
		</Variant>

		<Variant title="Tokens - Status colors">
			<div
					data-cy="story-status-colors"
					style="--origam-stepper---color-done: rgb(0, 128, 0); --origam-stepper---color-active: rgb(0, 0, 255)"
			>
				<origam-stepper :items="defaultItems" :model-value="1" />
			</div>
		</Variant>

		<Variant title="Tokens - Wrapping">
			<div
					data-cy="story-wrapping"
					style="inline-size: 316px"
			>
				<origam-stepper :items="longItems" :model-value="1" orientation="vertical" />
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IStepperProps>({ modelValue: 1, orientation: 'horizontal', clickable: false, showConnectors: true, color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-stepper
						v-bind="state"
						:items="defaultItems"
						@update:model-value="state.modelValue = $event"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber v-model="state.modelValue" title="Model Value" :min="0" :max="3" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.orientation"    title="Orientation"     :options="STEPPER_ORIENTATION_OPTIONS"/>
					<HstCheckbox v-model="state.clickable"      title="Clickable"/>
					<HstCheckbox v-model="state.showConnectors" title="Show Connectors"/>
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

	import { OrigamStepper } from '@origam/components'
	import type { IOptions, IStepperItem, IStepperProps } from '@origam/interfaces'
	import type { TStepperOrientation } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const STEPPER_ORIENTATION_OPTIONS: Array<IOptions<TStepperOrientation>> = [
		{ label: 'Horizontal', value: 'horizontal' },
		{ label: 'Vertical', value: 'vertical' }
	]

	const defaultItems: Array<IStepperItem> = [
		{ title: 'Account', subtitle: 'Email & password' },
		{ title: 'Profile', subtitle: 'Personal info' },
		{ title: 'Plan', subtitle: 'Choose plan' },
		{ title: 'Confirm', subtitle: 'Review & submit' }
	]

	const longItems: Array<IStepperItem> = [
		{ title: 'Qualifications', subtitle: 'En cours · 68 / 105 validés · 7 saisis · 30 sans score' },
		{ title: 'Barrages', subtitle: 'À venir' }
	]
</script>

<docs lang="md" src="@docs/components/Stepper/OrigamStepper.md"/>
