<template>
	<Story
			group="components"
			title="ExpansionPanel/OrigamExpansionPanels"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IExpansionPanelsProps>>({
					color: undefined,
					bgColor: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: false,
					flat: false,
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
					hideActions: false,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:flat="state.flat"
						:expand-icon="state.expandIcon || undefined"
						:collapse-icon="state.collapseIcon || undefined"
						:hide-actions="state.hideActions"
				>
					<origam-expansion-panel title="Panel 1" content="Content for panel 1"/>
					<origam-expansion-panel title="Panel 2" content="Content for panel 2"/>
					<origam-expansion-panel title="Panel 3" content="Content for panel 3"/>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border" title="Border" :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect   v-model="state.expandIcon"   title="Expand Icon"   :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.collapseIcon" title="Collapse Icon" :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.hideActions"  title="Hide Actions"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & IBgColorProps>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-expansion-panels
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
				>
					<origam-expansion-panel title="Panel 1" content="Content 1"/>
					<origam-expansion-panel title="Panel 2" content="Content 2"/>
				</origam-expansion-panels>
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
				:init-state="() => useStoryInitState<Partial<IExpansionPanelsProps>>({
					accordion: false,
					popout: false,
					inset: false,
					multiple: false,
					mandatory: false,
					tag: 'div',
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels
						:accordion="state.accordion"
						:popout="state.popout"
						:inset="state.inset"
						:multiple="state.multiple"
						:mandatory="state.mandatory"
						:tag="state.tag"
				>
					<origam-expansion-panel title="Step 1" content="First step content."/>
					<origam-expansion-panel title="Step 2" content="Second step content."/>
					<origam-expansion-panel title="Step 3" content="Third step content."/>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.accordion" title="Accordion"/>
					<HstCheckbox v-model="state.popout"    title="Popout"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
				</StoryGroup>
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-expansion-panels @update:model-value="logEvent('update:modelValue', $event)">
				<origam-expansion-panel title="Panel 1" content="Click to fire emit"/>
				<origam-expansion-panel title="Panel 2" content="Click to fire emit"/>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Events - group:selected">
			<origam-expansion-panels>
				<origam-expansion-panel
						title="Select me"
						content="Content"
						@group:selected="logEvent('group:selected', $event)"
				/>
				<origam-expansion-panel
						title="Or me"
						content="Content"
						@group:selected="logEvent('group:selected', $event)"
				/>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Default">
			<origam-expansion-panels>
				<origam-expansion-panel>
					<template #title>
						<span>Custom title one</span>
					</template>
					<template #default>
						<p>Slot-driven content for panel one.</p>
					</template>
				</origam-expansion-panel>
				<origam-expansion-panel>
					<template #title>
						<span>Custom title two</span>
					</template>
					<template #default>
						<p>Slot-driven content for panel two.</p>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Item">
			<origam-expansion-panels :items="panelItems">
				<template #item="{ item, index, expandIcon, collapseIcon }">
					<origam-expansion-panel
							:title="`[${index + 1}] ${item.title}`"
							:content="item.content"
							:expand-icon="expandIcon"
							:collapse-icon="collapseIcon"
					/>
				</template>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Header">
			<origam-expansion-panels>
				<origam-expansion-panel>
					<template #header="{ collapseIcon, expandIcon, expanded }">
						<origam-expansion-panel-header
								:collapse-icon="collapseIcon"
								:expand-icon="expandIcon"
								:prepend-icon="expanded ? MDI_ICONS.FOLDER_OPEN : MDI_ICONS.FOLDER"
								title="Custom header slot"
						/>
					</template>
					<template #default>
						<p>Content shown when open.</p>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-expansion-panels :items="panelItems">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Title">
			<origam-expansion-panels>
				<origam-expansion-panel>
					<template #title>
						<strong>Custom title slot</strong>
					</template>
					<template #default>
						<p>This is the content.</p>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Append">
			<origam-expansion-panels :items="panelItems">
				<template #append>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-expansion-panels :items="panelItems">
				<template #wrapper>
					<div style="padding: 16px; background: var(--origam-color__surface---overlay, rgba(0,0,0,0.04));">
						<span>Custom wrapper slot content</span>
					</div>
				</template>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Content">
			<origam-expansion-panels :items="panelItems">
				<template #content>
					<span>Custom slot content</span>
				</template>
			</origam-expansion-panels>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IExpansionPanelsProps>({
					color: undefined,
					bgColor: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: false,
					flat: false,
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
					hideActions: false,
					accordion: false,
					popout: false,
					inset: false,
					multiple: false,
					mandatory: false,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels v-bind="state" @update:model-value="logEvent('update:modelValue', $event)">
					<origam-expansion-panel title="Panel 1" content="Content for panel 1"/>
					<origam-expansion-panel title="Panel 2" content="Content for panel 2"/>
					<origam-expansion-panel title="Panel 3" content="Content for panel 3"/>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"        title="Color"         :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"      title="Bg Color"      :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.density"      title="Density"       :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"      title="Rounded"       :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation"    title="Elevation"     :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.border"       title="Border"        :options="BORDER_OPTIONS"/>
					<HstCheckbox v-model="state.flat"         title="Flat"/>
					<HstSelect   v-model="state.expandIcon"   title="Expand Icon"   :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.collapseIcon" title="Collapse Icon" :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.hideActions"  title="Hide Actions"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.accordion" title="Accordion"/>
					<HstCheckbox v-model="state.popout"    title="Popout"/>
					<HstCheckbox v-model="state.inset"     title="Inset"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
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

	import {
		OrigamExpansionPanel,
		OrigamExpansionPanelHeader,
		OrigamExpansionPanels,
		OrigamIcon
	} from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IBgColorProps,
		IExpansionPanelProps,
		IExpansionPanelsProps,
		IHoverProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const panelItems: Array<IExpansionPanelProps> = [
		{ title: 'Item A', content: 'Content for item A' },
		{ title: 'Item B', content: 'Content for item B' },
		{ title: 'Item C', content: 'Content for item C' },
	]
</script>
