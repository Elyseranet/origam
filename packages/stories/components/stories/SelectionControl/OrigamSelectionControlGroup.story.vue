<template>
	<Story
			group="components"
			title="SelectionControl/OrigamSelectionControlGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISelectionControlGroupProps>>({ color: 'primary', density: 'default', trueIcon: undefined, falseIcon: undefined, inline: false, ripple: true })"
		>
			<template #default="{ state }">
				<origam-selection-control-group
						v-model="designModel"
						type="checkbox"
						:color="state.color"
						:density="state.density"
						:true-icon="state.trueIcon || undefined"
						:false-icon="state.falseIcon || undefined"
						:inline="state.inline"
						:ripple="state.ripple"
				>
					<origam-selection-control value="a" label="Option A"/>
					<origam-selection-control value="b" label="Option B"/>
					<origam-selection-control value="c" label="Option C"/>
				</origam-selection-control-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.trueIcon"  title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.inline" title="Inline"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstCheckbox v-model="state.ripple" title="Ripple"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISelectionControlGroupProps>>({ type: 'checkbox', multiple: false, disabled: false, readonly: false, error: false, name: undefined })"
		>
			<template #default="{ state }">
				<origam-selection-control-group
						v-model="functionalModel"
						:type="state.type"
						:multiple="state.multiple"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:error="state.error"
						:name="state.name || undefined"
				>
					<origam-selection-control value="a" label="Option A"/>
					<origam-selection-control value="b" label="Option B"/>
					<origam-selection-control value="c" label="Option C"/>
				</origam-selection-control-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.error"    title="Error"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
					<HstText     v-model="state.name"     title="Name"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-selection-control-group
					v-model="emitModel"
					type="checkbox"
					@update:model-value="logEvent('update:modelValue', $event)"
			>
				<origam-selection-control value="a" label="Option A"/>
				<origam-selection-control value="b" label="Option B"/>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Slots - Default">
			<origam-selection-control-group
					v-model="slotDefaultModel"
					type="radio"
			>
				<origam-selection-control value="x" label="Choice X"/>
				<origam-selection-control value="y" label="Choice Y"/>
				<origam-selection-control value="z" label="Choice Z"/>
			</origam-selection-control-group>
		</Variant>

		<Variant title="Slots - Item">
			<origam-selection-control-group
					v-model="slotItemModel"
					type="checkbox"
					:items="checkboxItems"
			>
				<template #item="{ item, index }">
					<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
						<origam-selection-control :value="item.value"/>
						<span style="font-weight: 600;">{{ index + 1 }}. {{ item.label }}</span>
					</div>
				</template>
			</origam-selection-control-group>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ISelectionControlGroupProps>>({ color: 'primary', density: 'default', type: 'checkbox', multiple: false, inline: false, disabled: false, readonly: false, error: false, ripple: true, trueIcon: undefined, falseIcon: undefined })"
		>
			<template #default="{ state }">
				<origam-selection-control-group
						v-model="playgroundModel"
						v-bind="state"
				>
					<origam-selection-control value="a" label="Alpha"/>
					<origam-selection-control value="b" label="Beta"/>
					<origam-selection-control value="c" label="Gamma"/>
				</origam-selection-control-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"   :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density" :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.trueIcon"  title="True Icon"  :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.falseIcon" title="False Icon" :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.inline"  title="Inline"/>
					<HstCheckbox v-model="state.ripple"  title="Ripple"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.type"     title="Type"     :options="TYPE_OPTIONS"/>
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
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

	import { OrigamSelectionControl, OrigamSelectionControlGroup } from '@origam/components'
	import type { ISelectionControlGroupProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ICON_OPTIONS
	} from '@stories/const'

	const TYPE_OPTIONS = [
		{ label: 'Checkbox', value: 'checkbox' },
		{ label: 'Radio',    value: 'radio'    },
		{ label: 'Switch',   value: 'switch'   },
	]

	const checkboxItems = [
		{ value: 'alpha', label: 'Alpha' },
		{ value: 'beta',  label: 'Beta'  },
		{ value: 'gamma', label: 'Gamma' },
	]

	const designModel      = ref<string[]>([])
	const functionalModel  = ref<string[]>([])
	const emitModel        = ref<string[]>([])
	const slotDefaultModel = ref<string | undefined>(undefined)
	const slotItemModel    = ref<string[]>([])
	const playgroundModel  = ref<any>(undefined)
</script>
