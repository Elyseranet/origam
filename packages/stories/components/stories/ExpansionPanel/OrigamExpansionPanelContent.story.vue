<template>
	<Story
			group="components"
			title="ExpansionPanel/OrigamExpansionPanelContent"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IExpansionPanelContentProps>>({
					content: 'Lorem ipsum body.',
					color: undefined,
					bgColor: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					padding: undefined,
					margin: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel>
						<origam-expansion-panel-header title="Design variant"/>
						<origam-expansion-panel-content
								:content="state.content"
								:color="state.color"
								:bg-color="state.bgColor"
								:rounded="state.rounded"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:padding="state.padding"
								:margin="state.margin"
						/>
					</origam-expansion-panel>
				</origam-expansion-panels>
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IExpansionPanelContentProps>>({
					content: 'Functional variant body.',
					density: undefined,
					eager: false,
					loading: false,
					tag: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel>
						<origam-expansion-panel-header title="Functional variant"/>
						<origam-expansion-panel-content
								:content="state.content"
								:density="state.density"
								:eager="state.eager"
								:loading="state.loading"
								:tag="state.tag"
						/>
					</origam-expansion-panel>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.eager"   title="Eager (no lazy mount)"/>
					<HstCheckbox v-model="state.loading" title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-expansion-panels>
				<origam-expansion-panel>
					<origam-expansion-panel-header title="Open for details"/>
					<origam-expansion-panel-content>
						<p style="margin: 0 0 8px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
						<ul style="margin: 0; padding-left: 16px;">
							<li>Item one</li>
							<li>Item two</li>
							<li>Item three</li>
						</ul>
					</origam-expansion-panel-content>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-expansion-panels>
				<origam-expansion-panel>
					<origam-expansion-panel-header title="Loading panel"/>
					<origam-expansion-panel-content loading>
						<template #loader>
							<span>Loading...</span>
						</template>
					</origam-expansion-panel-content>
				</origam-expansion-panel>
			</origam-expansion-panels>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IExpansionPanelContentProps>({
					content: 'Lorem ipsum body.',
				})"
		>
			<template #default="{ state }">
				<origam-expansion-panels>
					<origam-expansion-panel>
						<origam-expansion-panel-header title="Playground"/>
						<origam-expansion-panel-content v-bind="state"/>
					</origam-expansion-panel>
				</origam-expansion-panels>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.content" title="Content"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
					<HstCheckbox v-model="state.eager"   title="Eager"/>
					<HstCheckbox v-model="state.loading" title="Loading"/>
					<HstSelect   v-model="state.tag"     title="Tag"     :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import {
		OrigamExpansionPanel,
		OrigamExpansionPanelContent,
		OrigamExpansionPanelHeader,
		OrigamExpansionPanels,
	} from '@origam/components'
	import type { IExpansionPanelContentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS,
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/ExpansionPanel/OrigamExpansionPanelContent.md"/>
