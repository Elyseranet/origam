<template>
	<Story
			group="components"
			title="Chip/OrigamChip"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IChipProps>>({ text: 'Chip', bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-chip
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:pill="state.pill"
						:label="state.label"
						:text="state.text"
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
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.pill"      title="Pill"/>
					<HstCheckbox v-model="state.label"     title="Label"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & Partial<IBgColorProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-chip :bg-color="state.bgColor" :hover="resolveHoverState(state.hover)" :active="resolveActiveState(state.active)" text="Chip"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IChipProps>>({ text: 'Chip', bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-chip
						:bg-color="state.bgColor"
						:text="state.text"
						:closable="state.closable"
						:close-icon="state.closeIcon || undefined"
						:close-label="state.closeLabel"
						:draggable="state.draggable"
						:filter="state.filter"
						:filter-icon="state.filterIcon || undefined"
						:link="state.link"
						:disabled="state.disabled"
						:tag="state.tag"
						:href="state.href"
						:to="state.to"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.closable"  title="Closable"/>
					<HstCheckbox v-model="state.draggable" title="Draggable"/>
				</StoryGroup>
				<StoryGroup title="Close">
					<HstSelect v-model="state.closeIcon"  title="Close Icon"  :options="ICON_OPTIONS"/>
					<HstText   v-model="state.closeLabel" title="Close Label"/>
				</StoryGroup>
				<StoryGroup title="Filter">
					<HstCheckbox v-model="state.filter"   title="Filter"/>
					<HstSelect   v-model="state.filterIcon" title="Filter Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstCheckbox v-model="state.link" title="Link"/>
					<HstSelect   v-model="state.tag"  title="Tag"  :options="TAG_OPTIONS"/>
					<HstText     v-model="state.href" title="Href (tag=a)"/>
					<HstText     v-model="state.to"   title="To (router-link)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<origam-chip link bg-color="primary" text="Click me" @click="logEvent('click', $event)"/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-chip
					bg-color="primary"
					:prepend-icon="prependIcon"
					text="Click the icon"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-chip
					bg-color="primary"
					:append-icon="appendIcon"
					text="Click the chevron"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - click:close">
			<origam-chip
					closable
					bg-color="primary"
					text="Close me"
					@click:close="logEvent('click:close', $event)"
			/>
		</Variant>

		<Variant title="Events - group:selected">
			<div class="story-shell">
				<origam-chip-group>
					<origam-chip :value="1" link text="Option A" @group:selected="logEvent('group:selected', $event)"/>
					<origam-chip :value="2" link text="Option B" @group:selected="logEvent('group:selected', $event)"/>
				</origam-chip-group>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="story-shell">
				<origam-chip-group
						v-model="emitModelValue"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<origam-chip :value="1" link text="A"/>
					<origam-chip :value="2" link text="B"/>
				</origam-chip-group>
				<span class="story-status">selected = <strong>{{ emitModelValue }}</strong></span>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-chip>
				<span style="font-style: italic;">Custom slot content</span>
			</origam-chip>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-chip text="With prepend">
				<template #prepend>
					<origam-icon :icon="prependIcon" size="x-small"/>
				</template>
			</origam-chip>
		</Variant>

		<Variant title="Slots - Append">
			<origam-chip text="With append">
				<template #append>
					<origam-icon :icon="appendIcon" size="x-small"/>
				</template>
			</origam-chip>
		</Variant>

		<Variant title="Slots - Close">
			<origam-chip closable text="Custom close">
				<template #close>
					<origam-icon :icon="closeIcon" size="x-small"/>
				</template>
			</origam-chip>
		</Variant>

		<Variant title="Slots - Filter">
			<div class="story-shell">
				<origam-chip-group v-model="filterSlotSelected" filter>
					<origam-chip :value="1" filter link text="Option A">
						<template #filter>
							<origam-icon :icon="prependIcon" size="x-small"/>
						</template>
					</origam-chip>
					<origam-chip :value="2" filter link text="Option B"/>
				</origam-chip-group>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IChipProps>({ text: 'Chip', bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-chip v-bind="state" @click="logEvent('click', $event)" @click:close="logEvent('click:close', $event)"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.text"        title="Text"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.pill"      title="Pill"/>
					<HstCheckbox v-model="state.label"     title="Label"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.closable"  title="Closable"/>
					<HstCheckbox v-model="state.draggable" title="Draggable"/>
					<HstCheckbox v-model="state.filter"    title="Filter"/>
					<HstCheckbox v-model="state.link"      title="Link"/>
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

	import { OrigamChip, OrigamChipGroup, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IBgColorProps,
		IChipProps,
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
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const prependIcon = MDI_ICONS.HEART
	const appendIcon  = MDI_ICONS.ARROW_RIGHT
	const closeIcon   = MDI_ICONS.CLOSE

	const emitModelValue    = ref<number | undefined>(undefined)
	const filterSlotSelected = ref<number | undefined>(undefined)
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
	.story-status { font: 0.875rem/1.4 system-ui, sans-serif; color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)); }
</style>

<docs lang="md" src="@docs/components/Chip/OrigamChip.md"/>
