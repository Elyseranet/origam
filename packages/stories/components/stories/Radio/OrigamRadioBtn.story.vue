<template>
	<Story
			group="components"
			title="Radio/OrigamRadioBtn"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IRadioBtnProps>>({
					color: 'primary',
					bgColor: undefined,
					density: 'default',
					trueIcon: MDI_ICONS.RADIOBOX_MARKED,
					falseIcon: MDI_ICONS.RADIOBOX_BLANK,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined
				})"
		>
			<template #default="{ state }">
				<origam-radio-btn
						v-model="designModel"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:true-icon="state.trueIcon || undefined"
						:false-icon="state.falseIcon || undefined"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						value="design"
						label="Radio button"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.trueIcon"  title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
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
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & { color?: string }>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-radio-btn
						v-model="stateModel"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						value="state"
						label="Radio button"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IRadioBtnProps>>({
					label: 'Radio button',
					value: 'option-a',
					disabled: false,
					readonly: false,
					error: false,
					required: false,
					inline: false,
					multiple: false,
					name: '',
					trueValue: undefined,
					falseValue: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-radio-btn
						v-model="functionalModel"
						:label="state.label"
						:value="state.value"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:required="state.required"
						:inline="state.inline"
						:multiple="state.multiple"
						:name="state.name || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstText v-model="state.label" title="Label"/>
					<HstText v-model="state.value" title="Value"/>
					<HstText v-model="state.name"  title="Name (group)"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline"   title="Inline"/>
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-radio-btn
					v-model="emitModel"
					value="emitted"
					label="Toggle me"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - click:label">
			<origam-radio-btn
					v-model="emitModel"
					value="emitted"
					label="Click the label"
					@click:label="logEvent('click:label', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-radio-btn v-model="slotModel" value="custom">
				<strong>Custom</strong> slot content
			</origam-radio-btn>
		</Variant>

		<Variant title="Slots - Label">
			<origam-radio-btn v-model="slotModel" value="custom-label">
				<template #label>
					<strong>Custom label</strong>
					<small style="margin-inline-start: 8px; color: var(--origam-color__text---secondary);">rendered via slot</small>
				</template>
			</origam-radio-btn>
		</Variant>

		<Variant title="Slots - Input">
			<origam-radio-btn v-model="slotModel" value="custom-input" label="Custom input">
				<template #input="{ props: inputProps, icon }">
					<div
							v-bind="inputProps"
							style="width: 20px; height: 20px; border: 2px solid var(--origam-color__action--primary---bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;"
					>
						<origam-icon v-if="icon" :icon="icon"/>
					</div>
				</template>
			</origam-radio-btn>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IRadioBtnProps>({
					label: 'Toggle me',
					value: 'play',
					color: 'primary',
					bgColor: undefined,
					density: 'default',
					disabled: false,
					readonly: false,
					error: false,
					trueIcon: MDI_ICONS.RADIOBOX_MARKED,
					falseIcon: MDI_ICONS.RADIOBOX_BLANK,
				})"
		>
			<template #default="{ state }">
				<origam-radio-btn
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.label" title="Label"/>
					<HstText   v-model="state.value" title="Value"/>
					<HstSelect v-model="state.trueIcon"  title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"   :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
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

	import { OrigamIcon, OrigamRadioBtn } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IHoverProps,
		IRadioBtnProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const designModel    = ref()
	const stateModel     = ref()
	const functionalModel = ref()
	const emitModel      = ref()
	const slotModel      = ref()
	const playgroundModel = ref()
</script>

<docs lang="md" src="@docs/components/Radio/OrigamRadioBtn.md"/>
