<template>
	<Story
			group="components"
			title="List/OrigamList"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IListProps>>({ color: undefined, bgColor: undefined, density: 'default', rounded: undefined, elevation: undefined, lines: 'one' })"
		>
			<template #default="{ state }">
				<origam-list
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:density="state.density"
						:size="state.size"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:lines="state.lines"
						:width="state.width"
						:height="state.height"
				>
					<origam-list-item title="Item one"/>
					<origam-list-item title="Item two" subtitle="With subtitle"/>
					<origam-list-item title="Item three" :prepend-icon="preIcon"/>
				</origam-list>
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
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border" title="Border" :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Lines">
					<HstSelect v-model="state.lines" title="Lines" :options="LINES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IListProps>>({ slim: false, nav: false, disabled: false, selectStrategy: SELECT_STRATEGY.SINGLE_LEAF, openStrategy: OPEN_STRATEGY.LIST, tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-list
						:slim="state.slim"
						:nav="state.nav"
						:disabled="state.disabled"
						:select-strategy="state.selectStrategy"
						:open-strategy="state.openStrategy"
						:tag="state.tag"
						:items="selectableItems"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.slim" title="Slim"/>
					<HstCheckbox v-model="state.nav"  title="Nav"/>
				</StoryGroup>
				<StoryGroup title="Nested">
					<HstSelect v-model="state.selectStrategy" title="Select Strategy" :options="SELECT_STRATEGY_OPTIONS"/>
					<HstSelect v-model="state.openStrategy"   title="Open Strategy"   :options="OPEN_STRATEGY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:selected">
			<origam-list
					:items="selectableItems"
					@update:selected="logEvent('update:selected', $event)"
			/>
		</Variant>

		<Variant title="Events - click:select">
			<origam-list
					:items="selectableItems"
					@click:select="logEvent('click:select', $event)"
			/>
		</Variant>

		<Variant title="Events - click:open">
			<origam-list
					:items="groupedItems"
					@click:open="logEvent('click:open', $event)"
			/>
		</Variant>

		<Variant title="Events - update:opened">
			<origam-list
					:items="groupedItems"
					@update:opened="logEvent('update:opened', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-list>
				<origam-list-item title="Alpha"/>
				<origam-list-item title="Beta" subtitle="With subtitle"/>
				<origam-list-item title="Gamma"/>
			</origam-list>
		</Variant>

		<Variant title="Slots - ChildrenItem">
			<origam-list :items="groupedItems">
				<template #childrenItem="{ item, index }">
					<origam-list-item
							:title="item.title"
							:prepend-icon="preIcon"
							:data-cy="`children-item-${index}`"
					/>
				</template>
			</origam-list>
		</Variant>

		<Variant title="Slots - Divider">
			<origam-list :items="itemsWithDivider">
				<template #divider>
					<hr style="border-color: var(--origam-color__action--primary---bg); margin: 4px 0;"/>
				</template>
			</origam-list>
		</Variant>

		<Variant title="Slots - Subheader">
			<origam-list :items="itemsWithSubheader">
				<template #subheader="{ title }">
					<origam-list-subheader :title="`★ ${title}`"/>
				</template>
			</origam-list>
		</Variant>

		<Variant title="Slots - Group">
			<origam-list :items="groupedItems">
				<template #group>
					<span style="font-style: italic; opacity: 0.6;">Custom group content</span>
				</template>
			</origam-list>
		</Variant>

		<Variant title="Slots - GroupActivator">
			<origam-list :items="groupedItems">
				<template #groupActivator="{ props, isOpen, events, toggleIcon }">
					<origam-list-item
							v-bind="props"
							v-on="events"
							:append-icon="toggleIcon"
							:prepend-icon="folderIcon"
							title="Custom Activator"
					/>
				</template>
			</origam-list>
		</Variant>

		<Variant title="Slots - Item">
			<origam-list :items="selectableItems">
				<template #item="{ itemProps }">
					<origam-list-item
							v-bind="itemProps"
							:prepend-icon="preIcon"
					/>
				</template>
			</origam-list>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IListProps>({ density: 'default', lines: 'one', slim: false, nav: false, disabled: false })"
		>
			<template #default="{ state }">
				<origam-list v-bind="state" @update:selected="logEvent('update:selected', $event)">
					<origam-list-item title="Item one"/>
					<origam-list-item title="Item two" subtitle="With subtitle"/>
					<origam-list-item title="Item three" :prepend-icon="preIcon"/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.lines"     title="Lines"     :options="LINES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.slim"     title="Slim"/>
					<HstCheckbox v-model="state.nav"      title="Nav"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
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
		OrigamList,
		OrigamListItem,
		OrigamListSubheader
	} from '@origam/components'
	import { LINES, MDI_ICONS, OPEN_STRATEGY, SELECT_STRATEGY } from '@origam/enums'
	import type { IListProps, IOptions } from '@origam/interfaces'
	import type { TLines } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const preIcon = MDI_ICONS.STAR
	const folderIcon = MDI_ICONS.FOLDER

	const LINES_OPTIONS: Array<IOptions<TLines | undefined>> = [
		{ label: '(none)',  value: undefined    },
		{ label: 'One',    value: LINES.ONE    },
		{ label: 'Two',    value: LINES.TWO    },
		{ label: 'Three',  value: LINES.THREE  }
	]

	const SELECT_STRATEGY_OPTIONS: Array<IOptions<string>> = [
		{ label: 'single-leaf',        value: SELECT_STRATEGY.SINGLE_LEAF        },
		{ label: 'leaf',               value: SELECT_STRATEGY.LEAF               },
		{ label: 'independent',        value: SELECT_STRATEGY.INDEPENDENT        },
		{ label: 'single-independent', value: SELECT_STRATEGY.SINGLE_INDEPENDENT },
		{ label: 'classic',            value: SELECT_STRATEGY.CLASSIC            }
	]

	const OPEN_STRATEGY_OPTIONS: Array<IOptions<string>> = [
		{ label: 'list',     value: OPEN_STRATEGY.LIST     },
		{ label: 'single',   value: OPEN_STRATEGY.SINGLE   },
		{ label: 'multiple', value: OPEN_STRATEGY.MULTIPLE }
	]

	const selectableItems = [
		{ type: 'item', title: 'Option one',   value: 'one'   },
		{ type: 'item', title: 'Option two',   value: 'two'   },
		{ type: 'item', title: 'Option three', value: 'three' }
	]

	const groupedItems = [
		{
			type: 'group',
			title: 'Category A',
			children: [
				{ title: 'Item A-1' },
				{ title: 'Item A-2' }
			]
		},
		{
			type: 'group',
			title: 'Category B',
			children: [
				{ title: 'Item B-1' }
			]
		}
	]

	const itemsWithSubheader = [
		{ type: 'subheader', title: 'Fruits'    },
		{ type: 'item',      title: 'Apple'     },
		{ type: 'item',      title: 'Banana'    },
		{ type: 'subheader', title: 'Vegetables' },
		{ type: 'item',      title: 'Carrot'    }
	]

	const itemsWithDivider = [
		{ type: 'item',    title: 'Item Alpha' },
		{ type: 'divider'                      },
		{ type: 'item',    title: 'Item Beta'  },
		{ type: 'divider'                      },
		{ type: 'item',    title: 'Item Gamma' }
	]
</script>
