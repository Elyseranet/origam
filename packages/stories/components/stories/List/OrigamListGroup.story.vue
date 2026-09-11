<template>
	<Story
			group="components"
			title="List/OrigamListGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IListGroupProps>>({
					title: 'Group',
					color: undefined,
					bgColor: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-group
							:title="state.title"
							:padding="state.padding"
							:margin="state.margin"
							:color="state.color"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							:expand-icon="state.expandIcon"
							:collapse-icon="state.collapseIcon"
					>
						<template #items>
							<origam-list-item title="Item one"/>
							<origam-list-item title="Item two"/>
							<origam-list-item title="Item three"/>
						</template>
					</origam-list-group>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"  title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"   title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.expandIcon"   title="Expand Icon"    :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.collapseIcon" title="Collapse Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
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
				<origam-list>
					<origam-list-group
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
							title="Group"
					>
						<template #items>
							<origam-list-item title="Item one"/>
							<origam-list-item title="Item two"/>
						</template>
					</origam-list-group>
				</origam-list>
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
				:init-state="() => useStoryInitState<Partial<IListGroupProps>>({
					fluid: false,
					tag: 'div',
					value: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-group
							:fluid="state.fluid"
							:tag="state.tag"
							:value="state.value"
							title="Group"
					>
						<template #items>
							<origam-list-item title="Item one"/>
							<origam-list-item title="Item two"/>
							<origam-list-item title="Item three"/>
						</template>
					</origam-list-group>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.fluid" title="Fluid"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag"  title="Tag"  :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.value" title="Value"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:activator">
			<origam-list>
				<origam-list-group
						title="Click the header"
						@click:activator="logEvent('click:activator', $event)"
				>
					<template #items>
						<origam-list-item title="Item one"/>
						<origam-list-item title="Item two"/>
					</template>
				</origam-list-group>
			</origam-list>
		</Variant>

		<Variant title="Slots - Default">
			<origam-list>
				<origam-list-group>
					<div style="padding: 8px 16px; font-style: italic;">Fully custom default slot content</div>
				</origam-list-group>
			</origam-list>
		</Variant>

		<Variant title="Slots - Activator">
			<origam-list>
				<origam-list-group title="Group A">
					<template #activator="{ events, props, isOpen, toggleIcon }">
						<origam-list-item
								v-bind="props"
								v-on="events"
								:append-icon="toggleIcon"
								:prepend-icon="isOpen ? MDI_ICONS.FOLDER_OPEN : MDI_ICONS.FOLDER"
								title="Custom activator"
						/>
					</template>
					<template #items>
						<origam-list-item title="Child item one"/>
						<origam-list-item title="Child item two"/>
					</template>
				</origam-list-group>
			</origam-list>
		</Variant>

		<Variant title="Slots - Items">
			<origam-list>
				<origam-list-group title="Custom items">
					<template #items>
						<origam-list-item :prepend-icon="MDI_ICONS.STAR" title="Custom item one"/>
						<origam-list-item :prepend-icon="MDI_ICONS.STAR" title="Custom item two"/>
					</template>
				</origam-list-group>
			</origam-list>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IListGroupProps>({
					title: 'Group',
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-group
							v-bind="state"
							@click:activator="logEvent('click:activator', $event)"
					>
						<template #items>
							<origam-list-item title="Item one"/>
							<origam-list-item title="Item two"/>
							<origam-list-item title="Item three"/>
						</template>
					</origam-list-group>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"        title="Title"/>
					<HstSelect v-model="state.prependIcon"  title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"   title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.expandIcon"   title="Expand Icon"    :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.collapseIcon" title="Collapse Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"       title="Color"        :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"     title="Bg Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.fluid" title="Fluid"/>
					<HstSelect   v-model="state.tag"   title="Tag"   :options="TAG_OPTIONS"/>
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

	import { OrigamList, OrigamListGroup, OrigamListItem } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IBgColorProps,
		IHoverProps,
		IListGroupProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>
