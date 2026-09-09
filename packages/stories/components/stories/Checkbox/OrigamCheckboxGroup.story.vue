<template>
	<Story
			group="components"
			title="Checkbox/OrigamCheckboxGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICheckboxGroupProps>>({
					modelValue: ['email'],
					label: 'Notifications',
					items: DEMO_ITEMS,
					color: undefined,
					bgColor: undefined,
					density: undefined,
					size: undefined
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-group
						v-model="state.modelValue"
						:bg-color="state.bgColor"
						:color="state.color"
						:density="state.density"
						:items="state.items"
						:label="state.label"
						:size="state.size"
				/>
			</template>

			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICheckboxGroupProps>>({
					modelValue: ['email', 'push'],
					label: 'Notifications',
					items: DEMO_ITEMS,
					multiple: true,
					required: false,
					disabled: false,
					readonly: false
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-group
						v-model="state.modelValue"
						:disabled="state.disabled"
						:items="state.items"
						:label="state.label"
						:multiple="state.multiple"
						:readonly="state.readonly"
						:required="state.required"
				/>
			</template>

			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.required" title="Required"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-checkbox-group
					label="Notifications"
					:items="DEMO_ITEMS"
					:model-value="[]"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Slots - Label">
			<origam-checkbox-group
					:items="DEMO_ITEMS"
					:model-value="['sms']"
			>
				<template #label>
					<strong>Un label entierement custom</strong>
				</template>
			</origam-checkbox-group>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICheckboxGroupProps>({
					modelValue: ['email'],
					label: 'Notifications',
					items: DEMO_ITEMS,
					multiple: true
				})"
		>
			<template #default="{ state }">
				<origam-checkbox-group v-bind="state"/>
			</template>

			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Label"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiple" title="Multiple"/>
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

	import { OrigamCheckboxGroup } from '@origam/components'
	import type { ICheckboxGroupProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const DEMO_ITEMS = [
		{ label: 'Email', value: 'email' },
		{ label: 'SMS', value: 'sms' },
		{ label: 'Push', value: 'push' }
	]
</script>

<docs
		lang="md"
		src="@docs/components/Checkbox/OrigamCheckboxGroup.md"
/>
