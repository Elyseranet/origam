<template>
	<Story
			group="components"
			title="DataTable/OrigamDataTableHeadersCellMobile"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ color: undefined, sticky: false, colspan: 1 })"
		>
			<template #default="{ state }">
				<origam-data-table
						:color="state.color"
						:headers="sortableHeaders"
						:items="items"
						:sticky="state.sticky"
						mobile-breakpoint="xl"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.sticky" title="Sticky"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ multiSort: false, disableSort: false })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="sortableHeaders"
						:items="items"
						:multi-sort="state.multiSort"
						:disable-sort="state.disableSort"
						:sort-asc-icon="state.sortAscIcon || undefined"
						:sort-desc-icon="state.sortDescIcon || undefined"
						mobile-breakpoint="xl"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sort">
					<HstCheckbox v-model="state.multiSort"   title="Multi Sort"/>
					<HstCheckbox v-model="state.disableSort" title="Disable Sort"/>
					<HstSelect   v-model="state.sortAscIcon"  title="Sort Asc Icon"  :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.sortDescIcon" title="Sort Desc Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:append">
			<origam-data-table
					:headers="selectHeaders"
					:items="items"
					mobile-breakpoint="xl"
					data-cy="mobile-cell-emit-click-append"
					append-aria-label="Show options"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-data-table
					:headers="sortableHeaders"
					:items="items"
					mobile-breakpoint="xl"
					data-cy="mobile-cell-emit-click-prepend"
					prepend-aria-label="Open details"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:clear">
			<origam-data-table
					:headers="sortableHeaders"
					:items="items"
					mobile-breakpoint="xl"
					data-cy="mobile-cell-emit-click-clear"
					@click:clear="logEvent('click:clear', $event)"
			/>
		</Variant>

		<Variant title="Slots - chip:append">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #chip:append>
							<origam-icon :icon="MDI_ICONS.ARROW_RIGHT"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - chip:close">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #chip:close>
							<origam-icon :icon="MDI_ICONS.CLOSE"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - chip:default">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #chip:default>
							<span>Custom chip content</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - chip:filter">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #chip:filter>
							<origam-icon :icon="MDI_ICONS.FILTER"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - chip:prepend">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #chip:prepend>
							<origam-icon :icon="MDI_ICONS.HEART"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - clear">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #clear>
							<origam-icon :icon="MDI_ICONS.CLOSE_CIRCLE"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.append">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.append>
							<origam-icon :icon="MDI_ICONS.ARROW_RIGHT"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.appendInner">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.appendInner>
							<origam-icon :icon="MDI_ICONS.MAGNIFY"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.appendItem">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.appendItem>
							<span>Append item</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.chip">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.chip>
							<origam-chip text="Demo"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.floatingLabel">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.floatingLabel>
							<span>Sort by</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.item">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.item>
							<span>Custom item</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.label">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.label>
							<span>Sort columns</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.loader">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.loader>
							<span>Loading...</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.noData">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.noData>
							<span>No sortable columns</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.prepend">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.prepend>
							<origam-icon :icon="MDI_ICONS.HEART"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.prependInner">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.prependInner>
							<origam-icon :icon="MDI_ICONS.MAGNIFY"/>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.prependItem">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.prependItem>
							<span>Prepend item</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.prefix">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.prefix>
							<span>Sort:</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.selection">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.selection>
							<span>Custom selection</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - select.suffix">
			<origam-data-table :headers="sortableHeaders" :items="items" mobile-breakpoint="xl">
				<template #header.mobile="headerProps">
					<origam-data-table-headers-cell-mobile :columns="headerProps.columns">
						<template #select.suffix>
							<span>↕</span>
						</template>
					</origam-data-table-headers-cell-mobile>
				</template>
			</origam-data-table>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ color: undefined, sticky: false, multiSort: false, disableSort: false })"
		>
			<template #default="{ state }">
				<origam-data-table
						:color="state.color"
						:disable-sort="state.disableSort"
						:headers="sortableHeaders"
						:items="items"
						:multi-sort="state.multiSort"
						:sort-asc-icon="state.sortAscIcon || undefined"
						:sort-desc-icon="state.sortDescIcon || undefined"
						:sticky="state.sticky"
						mobile-breakpoint="xl"
						append-aria-label="Show options"
						@click:append="logEvent('click:append', $event)"
						@click:clear="logEvent('click:clear', $event)"
						prepend-aria-label="Open details"
						@click:prepend="logEvent('click:prepend', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"   title="Color"   :options="COLOR_OPTIONS"/>
					<HstCheckbox v-model="state.sticky"  title="Sticky"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiSort"    title="Multi Sort"/>
					<HstCheckbox v-model="state.disableSort"  title="Disable Sort"/>
					<HstSelect   v-model="state.sortAscIcon"  title="Sort Asc Icon"  :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.sortDescIcon" title="Sort Desc Icon" :options="ICON_OPTIONS"/>
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

	import { OrigamChip, OrigamDataTable, OrigamDataTableHeadersCellMobile, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDataTableProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		ICON_OPTIONS
	} from '@stories/const'

	const sortableHeaders = [
		{ key: 'name',    title: 'Name',    sortable: true  },
		{ key: 'team',    title: 'Team',    sortable: true  },
		{ key: 'commits', title: 'Commits', sortable: false }
	]

	const selectHeaders = [
		{ key: 'data-table-select', title: 'Select', sortable: false },
		...sortableHeaders
	]

	const items = [
		{ name: 'Alice', team: 'Frontend', commits: 142 },
		{ name: 'Bob',   team: 'Backend',  commits: 98  },
		{ name: 'Carol', team: 'Design',   commits: 31  }
	]
</script>

<docs lang="md" src="@docs/components/DataTable/OrigamDataTableHeadersCellMobile.md"/>
