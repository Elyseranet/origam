<template>
	<Story
			group="components"
			title="ExpansionPanel/OrigamExpansionPanel"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IExpansionPanelProps>>({
					color: undefined,
					bgColor: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
					hideActions: false,
					prependIcon: undefined,
					appendIcon: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel
							:color="state.color"
							:padding="state.padding"
							:margin="state.margin"
							:bg-color="state.bgColor"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:expand-icon="state.expandIcon || undefined"
							:collapse-icon="state.collapseIcon || undefined"
							:hide-actions="state.hideActions"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							title="Design panel"
							content="Panel body content goes here."
					/>
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
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Actions">
					<HstSelect   v-model="state.expandIcon"   title="Expand Icon"   :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.collapseIcon" title="Collapse Icon" :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.hideActions"  title="Hide Actions"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IBgColorProps & { active?: boolean | object }>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
							title="State panel"
							content="Panel body content goes here."
					/>
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
				:init-state="() => useStoryInitState<Partial<IExpansionPanelProps> & ILoadingState>({
					disabled: false,
					readonly: false,
					focusable: false,
					eager: false,
					tag: 'div',
					title: 'Functional panel',
					content: 'Panel body content goes here.',
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels :model-value="state.enabled ? [0] : undefined" multiple>
					<origam-expansion-panel
							:disabled="state.disabled"
							:readonly="state.readonly"
							:focusable="state.focusable"
							:eager="state.eager"
							:tag="state.tag"
							:title="state.title"
							:content="state.content"
							:loading="resolveLoading(state)"
					/>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
					<HstCheckbox v-model="state.focusable" title="Focusable"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.title"   title="Title"/>
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
				<StoryGroup title="Render">
					<HstCheckbox v-model="state.eager" title="Eager"/>
					<HstSelect   v-model="state.tag"   title="Tag"   :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - group:selected">
			<origam-expansion-panels>
				<origam-expansion-panel
						title="Select me"
						content="Panel body content."
						@group:selected="logEvent('group:selected', $event)"
				/>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Header">
			<origam-expansion-panels>
				<origam-expansion-panel title="Panel" content="Content here">
					<template #header>
						<span style="padding: 16px; font-weight: 600;">Custom header via slot</span>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Default">
			<origam-expansion-panels>
				<origam-expansion-panel title="Panel with slot content">
					<p>This content was inserted via the default slot.</p>
					<p>It supports rich markup.</p>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Title">
			<origam-expansion-panels>
				<origam-expansion-panel content="Content here">
					<template #title>
						<strong>Custom Title</strong>
						<origam-icon :icon="MDI_ICONS.STAR" style="margin-left: 8px;"/>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-expansion-panels>
				<origam-expansion-panel title="With prepend" content="Content here">
					<template #prepend>
						<origam-icon :icon="MDI_ICONS.FOLDER"/>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Append">
			<origam-expansion-panels>
				<origam-expansion-panel title="With append" content="Content here">
					<template #append>
						<origam-icon :icon="MDI_ICONS.INFORMATION_OUTLINE"/>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-expansion-panels>
				<origam-expansion-panel :loading="true" title="Loading panel" content="Content here">
					<template #loader>
						<span>Loading…</span>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-expansion-panels>
				<origam-expansion-panel title="Panel" content="Content here">
					<template #wrapper>
						<span style="padding: 16px; display: block;">Custom wrapper slot content</span>
					</template>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IExpansionPanelProps>({
					title: 'Panel title',
					content: 'Panel content text',
					expandIcon: MDI_ICONS.CHEVRON_DOWN,
					collapseIcon: MDI_ICONS.CHEVRON_UP,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel v-bind="state" @group:selected="logEvent('group:selected', $event)"/>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"   title="Title"/>
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstCheckbox v-model="state.readonly"    title="Readonly"/>
					<HstCheckbox v-model="state.hideActions" title="Hide Actions"/>
					<HstCheckbox v-model="state.eager"       title="Eager"/>
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
		OrigamExpansionPanels,
		OrigamIcon
	} from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IBgColorProps,
		IExpansionPanelProps,
		IHoverProps
	} from '@origam/interfaces'
	import type { TLoadingValue } from '@origam/types'

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
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	interface ILoadingState {
		enabled: boolean
		kind: 'bool' | 'number' | 'line' | 'circular' | 'skeleton'
		progress: number
		circularSize: number
	}

	const LOADING_KIND_OPTIONS = [
		{ label: 'true (default)', value: 'bool' },
		{ label: 'number', value: 'number' },
		{ label: '{ type: line }', value: 'line' },
		{ label: '{ type: circular }', value: 'circular' },
		{ label: '{ type: skeleton }', value: 'skeleton' }
	]

	const resolveLoading = (state: ILoadingState): TLoadingValue => {
		if (!state.enabled) return false
		if (state.kind === 'number') return state.progress
		if (state.kind === 'line') return { type: 'line' }
		if (state.kind === 'circular') return { type: 'circular', size: state.circularSize }
		if (state.kind === 'skeleton') return { type: 'skeleton' }

		return true
	}
</script>
