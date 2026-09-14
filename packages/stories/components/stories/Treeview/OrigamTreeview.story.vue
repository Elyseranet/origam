<template>
	<Story
			group="components"
			title="Treeview/OrigamTreeview"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITreeviewProps>>({ color: 'primary', size: 'default', density: 'default' })"
		>
			<template #default="{ state }">
				<origam-treeview
						:items="fileTree"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:expanded-value="defaultExpanded"
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
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITreeviewProps>>({
					selectMode: 'none',
					selectableNodes: 'leaf',
					showLines: true,
					expandOnClick: false,
					ariaLabel: ''
				})"
		>
			<template #default="{ state }">
				<origam-treeview
						:items="fileTree"
						:select-mode="state.selectMode"
						:selectable-nodes="state.selectableNodes"
						:show-lines="state.showLines"
						:expand-on-click="state.expandOnClick"
						:expanded-value="defaultExpanded"
						:aria-label="state.ariaLabel || undefined"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstSelect   v-model="state.selectMode"      title="Select Mode"      :options="SELECT_MODE_OPTIONS"/>
					<HstSelect   v-model="state.selectableNodes" title="Selectable Nodes" :options="SELECTABLE_NODES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.showLines"     title="Show Lines"/>
					<HstCheckbox v-model="state.expandOnClick" title="Expand on Click"/>
				</StoryGroup>
				<StoryGroup title="Accessibility">
					<HstText v-model="state.ariaLabel" title="Aria Label (empty = localised default)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - select">
			<origam-treeview
					:items="fileTree"
					select-mode="single"
					selectable-nodes="leaf"
					:expanded-value="defaultExpanded"
					@select="logEvent('select', $event)"
			/>
		</Variant>

		<Variant title="Events - toggle">
			<origam-treeview
					:items="fileTree"
					:expanded-value="defaultExpanded"
					@toggle="logEvent('toggle', $event)"
			/>
		</Variant>

		<Variant title="Events - update:expandedValue">
			<origam-treeview
					:items="fileTree"
					:expanded-value="defaultExpanded"
					@update:expanded-value="logEvent('update:expandedValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-treeview
					:items="fileTree"
					select-mode="multiple"
					selectable-nodes="leaf"
					:expanded-value="defaultExpanded"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Slots - Node">
			<origam-treeview
					:items="fileTree"
					:expanded-value="defaultExpanded"
			>
				<template #node="{ node, depth, isExpanded, isSelected }">
					<span
							:style="{
								paddingInlineStart: `${(depth ?? 0) * 8}px`,
								fontSize: '0.7rem',
								color: isSelected ? 'var(--origam-color__action--primary---bg)' : 'var(--origam-color__text---secondary)',
								fontStyle: 'italic'
							}"
					>
						[slot] {{ node.label }} {{ isExpanded ? '(open)' : '' }}
					</span>
				</template>
			</origam-treeview>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITreeviewProps>({
					selectMode: 'none',
					selectableNodes: 'leaf',
					showLines: true,
					expandOnClick: false,
					color: undefined,
					bgColor: undefined,
					density: 'default',
					size: 'default',
					items: []
				})"
		>
			<template #default="{ state }">
				<origam-treeview
						v-bind="state"
						:items="fileTree"
						:expanded-value="defaultExpanded"
						@select="logEvent('select', $event)"
						@toggle="logEvent('toggle', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density"  :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.selectMode"      title="Select Mode"      :options="SELECT_MODE_OPTIONS"/>
					<HstSelect   v-model="state.selectableNodes" title="Selectable Nodes" :options="SELECTABLE_NODES_OPTIONS"/>
					<HstCheckbox v-model="state.showLines"       title="Show Lines"/>
					<HstCheckbox v-model="state.expandOnClick"   title="Expand on Click"/>
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

	import { OrigamTreeview } from '@origam/components'
	import type { IOptions, ITreeviewNode, ITreeviewProps } from '@origam/interfaces'
	import type { TTreeviewSelectMode, TTreeviewSelectableNodes } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		SIZE_OPTIONS
	} from '@stories/const'

	const SELECT_MODE_OPTIONS: Array<IOptions<TTreeviewSelectMode>> = [
		{ label: 'None', value: 'none' },
		{ label: 'Single', value: 'single' },
		{ label: 'Multiple', value: 'multiple' }
	]

	const SELECTABLE_NODES_OPTIONS: Array<IOptions<TTreeviewSelectableNodes>> = [
		{ label: 'Leaf only', value: 'leaf' },
		{ label: 'All', value: 'all' }
	]

	const fileTree: ITreeviewNode[] = [
		{
			id: 'src',
			label: 'src',
			children: [
				{
					id: 'src/components',
					label: 'components',
					children: [
						{ id: 'src/components/Btn.vue', label: 'Btn.vue', size: '12.4 KB' },
						{ id: 'src/components/Card.vue', label: 'Card.vue', size: '8.1 KB' }
					]
				},
				{
					id: 'src/types',
					label: 'types',
					children: [
						{ id: 'src/types/commons.type.ts', label: 'commons.type.ts', size: '2.3 KB' }
					]
				}
			]
		},
		{
			id: 'tokens',
			label: 'tokens',
			children: [
				{ id: 'tokens/primitive.json', label: 'primitive.json', size: '24 KB' },
				{ id: 'tokens/semantic.light.json', label: 'semantic.light.json', size: '12 KB' },
				{ id: 'tokens/semantic.dark.json', label: 'semantic.dark.json', size: '12 KB' }
			]
		},
		{
			id: 'README.md',
			label: 'README.md',
			size: '3.2 KB'
		}
	]

	const defaultExpanded: string[] = ['src', 'src/components', 'tokens']
</script>

<docs lang="md" src="@docs/components/Treeview/OrigamTreeview.md"/>
