<template>
	<Story
			group="components"
			title="Checkbox/OrigamCheckboxBtn"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICheckboxBtnProps>>({
					color: 'primary',
					bgColor: undefined,
					trueIcon: MDI_ICONS.CHECKBOX_MARKED,
					falseIcon: MDI_ICONS.CHECKBOX_BLANK_OUTLINE,
					indeterminateIcon: MDI_ICONS.MINUS_BOX,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-btn
						:model-value="true"
						label="Checkbox Button"
						:color="state.color"
						:bg-color="state.bgColor"
						:true-icon="state.trueIcon"
						:false-icon="state.falseIcon"
						:indeterminate-icon="state.indeterminateIcon"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.trueIcon"          title="True Icon"          :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.falseIcon"         title="False Icon"         :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.indeterminateIcon" title="Indeterminate Icon" :options="ICON_OPTIONS"/>
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
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & Partial<IColorProps>>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-checkbox-btn
						:model-value="true"
						label="Checkbox Button"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
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
				:init-state="() => useStoryInitState<Partial<ICheckboxBtnProps>>({
					disabled: false,
					readonly: false,
					indeterminate: false,
					required: false,
					error: false,
					inline: false,
					multiple: false,
					density: undefined,
					name: '',
					type: 'checkbox',
					label: 'Checkbox Button',
					trueValue: true,
					falseValue: false,
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-btn
						v-model="functionalModel"
						:label="state.label"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:indeterminate="state.indeterminate"
						:required="state.required"
						:error="state.error"
						:inline="state.inline"
						:multiple="state.multiple"
						:density="state.density"
						:name="state.name || undefined"
						:type="state.type || undefined"
						:true-value="state.trueValue"
						:false-value="state.falseValue"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
					<HstCheckbox v-model="state.indeterminate" title="Indeterminate"/>
					<HstCheckbox v-model="state.required"      title="Required"/>
					<HstCheckbox v-model="state.error"         title="Error"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline"   title="Inline"/>
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstSelect   v-model="state.density"  title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.label"      title="Label"/>
					<HstText v-model="state.name"       title="Name"/>
					<HstText v-model="state.type"       title="Type"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-checkbox-btn
					v-model="emitUpdateModel"
					label="Toggle me"
					color="primary"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:indeterminate">
			<origam-checkbox-btn
					v-model="emitIndeterminateModel"
					:indeterminate="true"
					label="Watch indeterminate change"
					color="primary"
					@update:indeterminate="logEvent('update:indeterminate', $event)"
			/>
		</Variant>

		<Variant title="Events - click:label">
			<origam-checkbox-btn
					v-model="emitClickLabelModel"
					label="Click the label"
					color="primary"
					@click:label="logEvent('click:label', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-checkbox-btn v-model="slotDefaultModel">
				<strong>Custom slot content</strong>
			</origam-checkbox-btn>
		</Variant>

		<Variant title="Slots - Label">
			<origam-checkbox-btn v-model="slotLabelModel" value="custom">
				<template #label>
					<strong>Custom label</strong>
					<small>via slot</small>
				</template>
			</origam-checkbox-btn>
		</Variant>

		<Variant title="Slots - Input">
			<origam-checkbox-btn v-model="slotInputModel" label="Custom input control">
				<template #input="{ props: inputProps, icon, model }">
					<div v-bind="inputProps" class="slot-input-demo">
						<origam-icon v-if="icon" :icon="icon"/>
						<span v-else-if="model">✓</span>
					</div>
				</template>
			</origam-checkbox-btn>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICheckboxBtnProps>({
					label: 'Accept terms',
					color: 'primary',
					trueIcon: MDI_ICONS.CHECKBOX_MARKED,
					falseIcon: MDI_ICONS.CHECKBOX_BLANK_OUTLINE,
					indeterminate: false,
					disabled: false,
					readonly: false,
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-btn
						v-model="playgroundModel"
						v-bind="state"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.label"     title="Label"/>
					<HstSelect v-model="state.trueIcon"  title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.indeterminate" title="Indeterminate"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.readonly"      title="Readonly"/>
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

	import { OrigamCheckboxBtn, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		ICheckboxBtnProps,
		IColorProps,
		IHoverProps
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

	const playgroundModel        = ref(false)
	const functionalModel        = ref(false)
	const slotDefaultModel       = ref(false)
	const slotLabelModel         = ref(false)
	const slotInputModel         = ref(false)
	const emitUpdateModel        = ref(false)
	const emitIndeterminateModel = ref(false)
	const emitClickLabelModel    = ref(false)
</script>

<style scoped>
	.slot-input-demo {
		width: 24px;
		height: 24px;
		border: 2px solid var(--origam-color__action--primary---bg);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
</style>

<docs lang="md" src="@docs/components/Checkbox/OrigamCheckboxBtn.md"/>
