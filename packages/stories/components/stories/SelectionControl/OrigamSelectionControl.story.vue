<template>
	<Story
			group="components"
			title="SelectionControl/OrigamSelectionControl"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISelectionControlProps>>({ label: 'Control label', color: 'primary', bgColor: undefined, density: undefined, trueIcon: undefined, falseIcon: undefined, inline: false, rounded: undefined, elevation: undefined, border: undefined, borderColor: undefined, borderStyle: undefined })"
		>
			<template #default="{ state }">
				<origam-selection-control-group v-model="designModel" type="checkbox">
					<origam-selection-control
							:label="state.label"
							:color="state.color"
							:bg-color="state.bgColor"
							:density="state.density"
							:true-icon="state.trueIcon || undefined"
							:false-icon="state.falseIcon || undefined"
							:inline="state.inline"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							value="design-val"
					/>
				</origam-selection-control-group>
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
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline" title="Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & IColorProps>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-selection-control-group v-model="stateModel" type="checkbox">
					<origam-selection-control
							:color="state.color"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
							value="state-val"
							label="State control"
					/>
				</origam-selection-control-group>
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
				:init-state="() => useStoryInitState<Partial<ISelectionControlProps>>({ type: 'checkbox', label: 'Control label', required: false, disabled: false, readonly: false, error: false, multiple: false, ripple: false })"
		>
			<template #default="{ state }">
				<origam-selection-control-group v-model="functionalModel" :type="state.type" :multiple="state.multiple">
					<origam-selection-control
							:label="state.label"
							:required="state.required"
							:disabled="state.disabled"
							:readonly="state.readonly"
							:error="state.error"
							:ripple="state.ripple"
							:name="state.name"
							:true-value="state.trueValue || undefined"
							:false-value="state.falseValue || undefined"
							value="functional-val"
					/>
				</origam-selection-control-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText     v-model="state.label"    title="Label"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.trueValue"  title="True Value"/>
					<HstText v-model="state.falseValue" title="False Value"/>
					<HstText v-model="state.name"       title="Name (group)"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstCheckbox v-model="state.ripple"   title="Ripple"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:label">
			<origam-selection-control-group v-model="emitModel" type="checkbox">
				<origam-selection-control
						value="a"
						label="Click the label"
						@click:label="logEvent('click:label', $event)"
				/>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Slots - Default">
			<origam-selection-control-group v-model="slotDefaultModel" type="checkbox">
				<origam-selection-control value="custom">
					<template #default="{ model, props: slotProps }">
						<div
								v-bind="slotProps"
								class="sc-slot-default"
						>
							<span>{{ model ? 'Checked' : 'Unchecked' }}</span>
						</div>
					</template>
				</origam-selection-control>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Slots - Label">
			<origam-selection-control-group v-model="slotLabelModel" type="checkbox">
				<origam-selection-control value="a">
					<template #label>
						<em class="sc-slot-label">Custom label slot</em>
					</template>
				</origam-selection-control>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Slots - Input">
			<origam-selection-control-group v-model="slotInputModel" type="checkbox">
				<origam-selection-control value="a" label="Custom input">
					<template #input="{ props: inputProps, icon, model }">
						<div
								v-bind="inputProps"
								class="sc-slot-input"
						>
							<origam-icon v-if="icon" :icon="icon"/>
							<span v-else-if="model">✓</span>
						</div>
					</template>
				</origam-selection-control>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Standalone in an unrelated grid (issue #247)">
			<div
					class="sc-grid-context"
					role="radiogroup"
					aria-label="Grid-context regression check"
			>
				<origam-selection-control
						v-for="n in 4"
						:key="n"
						v-model="gridContextModel"
						type="radio"
						name="grid-context"
						:value="`option-${n}`"
						:label="`Option ${n}`"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISelectionControlProps>({ label: 'Control label', type: 'checkbox', color: 'primary', density: undefined, trueIcon: undefined, falseIcon: undefined, disabled: false, readonly: false, required: false })"
		>
			<template #default="{ state }">
				<origam-selection-control-group v-model="playgroundModel" :type="state.type">
					<origam-selection-control
							v-bind="state"
							value="playground-val"
					/>
				</origam-selection-control-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText     v-model="state.label"    title="Label"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"    title="Color"      :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"  title="Bg Color"   :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"  title="Density"    :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.trueIcon" title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"    :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation"  :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText     v-model="state.borderColor" title="Border Color"/>
					<HstSelect   v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.type"     title="Type"     :options="TYPE_OPTIONS"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
					<HstCheckbox v-model="state.inline"   title="Inline"/>
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

	import { OrigamIcon, OrigamSelectionControl, OrigamSelectionControlGroup } from '@origam/components'
	import type {
		IActiveProps,
		IColorProps,
		IHoverProps,
		IOptions,
		ISelectionControlProps
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

	const TYPE_OPTIONS: Array<IOptions<string>> = [
		{ label: 'checkbox', value: 'checkbox' },
		{ label: 'radio',    value: 'radio'    },
		{ label: 'switch',   value: 'switch'   }
	]

	const designModel     = ref<string[]>([])
	const stateModel      = ref<string[]>([])
	const functionalModel = ref<string[]>([])
	const emitModel       = ref<string[]>([])
	const slotDefaultModel = ref<string[]>([])
	const slotLabelModel  = ref<string[]>([])
	const slotInputModel  = ref<string[]>([])
	const gridContextModel = ref<string>()
	const playgroundModel = ref<any>(undefined)
</script>

<style scoped>
	.sc-slot-default {
		display: flex;
		align-items: center;
		gap: var(--origam-space---2, 8px);
		padding: var(--origam-space---2, 8px);
		border: 1px solid var(--origam-color__border---subtle);
		border-radius: var(--origam-rounded---sm, 4px);
		cursor: pointer;
	}

	.sc-slot-label {
		color: var(--origam-color__action--primary---bg);
	}

	.sc-slot-input {
		width: 24px;
		height: 24px;
		border: 2px solid var(--origam-color__action--primary---bg);
		border-radius: var(--origam-rounded---sm, 4px);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.sc-grid-context {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--origam-space---2, 8px);
	}
</style>
