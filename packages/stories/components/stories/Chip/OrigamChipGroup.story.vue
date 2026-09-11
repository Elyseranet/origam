<template>
	<Story
			group="components"
			title="Chip/OrigamChipGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChipGroupProps>>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-chip-group
						:color="state.color"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:column="state.column"
						:margin="state.margin"
						:padding="state.padding"
				>
					<origam-chip :value="1" link text="Alpha"/>
					<origam-chip :value="2" link text="Beta"/>
					<origam-chip :value="3" link text="Gamma"/>
				</origam-chip-group>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"     title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.column" title="Column (wrap)"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.margin"  title="Margin"/>
					<HstText v-model="state.padding" title="Padding"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChipGroupProps>>({ multiple: false, mandatory: false, filter: false, disabled: false })"
		>
			<template #default="{ state }">
				<origam-chip-group
						v-model="functionalModel"
						:multiple="state.multiple"
						:mandatory="state.mandatory"
						:filter="state.filter"
						:disabled="state.disabled"
						:max="state.max"
						:selected-class="state.selectedClass"
						:tag="state.tag"
						:center-active="state.centerActive"
						:show-arrows="state.showArrows"
						:next-icon="state.nextIcon || undefined"
						:prev-icon="state.prevIcon || undefined"
				>
					<origam-chip :value="1" link text="Alpha"/>
					<origam-chip :value="2" link text="Beta"/>
					<origam-chip :value="3" link text="Gamma"/>
				</origam-chip-group>
				<span class="story-status">selected = <strong>{{ JSON.stringify(functionalModel) }}</strong></span>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstCheckbox v-model="state.filter"    title="Filter (check icon)"/>
					<HstNumber   v-model="state.max"       title="Max selections" :min="1" :max="20" :step="1"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Appearance">
					<HstText v-model="state.selectedClass" title="Selected Class"/>
				</StoryGroup>
				<StoryGroup title="Arrows">
					<HstCheckbox v-model="state.centerActive" title="Center Active"/>
					<HstCheckbox v-model="state.showArrows"   title="Show Arrows"/>
					<HstSelect   v-model="state.nextIcon"     title="Next Icon"  :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.prevIcon"     title="Prev Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-chip-group
					v-model="emitModel"
					@update:model-value="logEvent('update:modelValue', $event)"
			>
				<origam-chip :value="1" link text="Alpha"/>
				<origam-chip :value="2" link text="Beta"/>
				<origam-chip :value="3" link text="Gamma"/>
			</origam-chip-group>
		</Variant>

		<Variant title="Slots - Default">
			<origam-chip-group v-model="slotModel">
				<origam-chip :value="1" link text="One"/>
				<origam-chip :value="2" link text="Two"/>
				<origam-chip :value="3" link text="Three"/>
			</origam-chip-group>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChipGroupProps>({ color: 'primary', multiple: false, mandatory: false, filter: false, column: false })"
		>
			<template #default="{ state }">
				<origam-chip-group v-bind="state" v-model="playgroundModel" @update:model-value="logEvent('update:modelValue', $event)">
					<origam-chip :value="1" link text="Alpha"/>
					<origam-chip :value="2" link text="Beta"/>
					<origam-chip :value="3" link text="Gamma"/>
				</origam-chip-group>
				<span class="story-status">selected = <strong>{{ JSON.stringify(playgroundModel) }}</strong></span>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"         title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"       title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"       title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstCheckbox v-model="state.column"        title="Column (wrap)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
					<HstCheckbox v-model="state.filter"    title="Filter"/>
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
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

	import { OrigamChip, OrigamChipGroup } from '@origam/components'
	import type { IChipGroupProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const functionalModel = ref<number | Array<number> | undefined>(undefined)
	const emitModel = ref<number | undefined>(undefined)
	const slotModel = ref<number | undefined>(undefined)
	const playgroundModel = ref<number | Array<number> | undefined>(undefined)
</script>

<style scoped>
	.story-status { font: 0.875rem/1.4 system-ui, sans-serif; color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)); }
</style>

<docs lang="md" src="@docs/components/Chip/OrigamChipGroup.md"/>
