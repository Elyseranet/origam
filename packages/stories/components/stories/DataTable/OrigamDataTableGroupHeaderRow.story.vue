<template>
	<Story
			group="components"
			title="DataTable/OrigamDataTableGroupHeaderRow"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataTableGroupHeaderRowDesignState>>({})"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="items"
						:group-by="[{ key: 'team', order: 'asc' }]"
						:style="buildGroupHeaderRowStyle(state)"
						data-cy="group-header-design"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding"       title="Padding"/>
					<HstText v-model="state.paddingInline" title="Padding Inline"/>
					<HstText v-model="state.paddingBlock"  title="Padding Block"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Functional">
			<origam-data-table
					:headers="headers"
					:items="items"
					:group-by="[{ key: 'team', order: 'asc' }]"
					data-cy="group-header-single"
			/>
		</Variant>

		<Variant title="Functional - groupBy nested">
			<origam-data-table
					:headers="extendedHeaders"
					:items="extendedItems"
					:group-by="[{ key: 'team', order: 'asc' }, { key: 'role', order: 'asc' }]"
					data-cy="group-header-nested"
			/>
		</Variant>

		<Variant title="Functional - showSelect">
			<origam-data-table
					:headers="headers"
					:items="items"
					:group-by="[{ key: 'team', order: 'asc' }]"
					show-select
					data-cy="group-header-show-select"
			/>
		</Variant>

		<Variant title="Slots - data-table-group">
			<origam-data-table
					:headers="headers"
					:items="items"
					:group-by="[{ key: 'team', order: 'asc' }]"
					data-cy="group-header-slot-data-table-group"
			>
				<template #data-table-group="{ item, count }">
					<td colspan="3">
						<strong>{{ item.value }}</strong>
						<small>{{ count }} row(s)</small>
					</td>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - data-table-select">
			<origam-data-table
					:headers="headers"
					:items="items"
					:group-by="[{ key: 'team', order: 'asc' }]"
					show-select
					data-cy="group-header-slot-data-table-select"
			>
				<template #data-table-select="{ props: selectProps }">
					<td>
						<input type="checkbox" v-bind="selectProps"/>
					</td>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - group-header">
			<origam-data-table
					:headers="headers"
					:items="items"
					:group-by="[{ key: 'team', order: 'asc' }]"
					data-cy="group-header-slot-group-header"
			>
				<template #group-header="{ group, items: groupItems, isOpen, toggleGroup }">
					<tr @click="toggleGroup(group)">
						<td colspan="3">
							<strong>{{ group }}</strong>
							<small>{{ groupItems.length }} member(s) — {{ isOpen ? '▼' : '▶' }}</small>
						</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IDataTableGroupHeaderRowPlaygroundState>({ groupMode: 'single' })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="resolveHeaders(state.groupMode)"
						:items="resolveItems(state.groupMode)"
						:group-by="resolveGroupBy(state.groupMode)"
						:show-select="state.showSelect"
						:style="buildGroupHeaderRowStyle(state)"
						data-cy="group-header-default"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.groupMode"  title="Group Mode"   :options="GROUP_MODE_OPTIONS"/>
					<HstCheckbox v-model="state.showSelect" title="Show Select"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamDataTable } from '@origam/components'
	import type { IColorProps, IPaddingProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { COLOR_OPTIONS } from '@stories/const'

	interface IDataTableGroupHeaderRowDesignState extends IColorProps, IPaddingProps {}

	interface IDataTableGroupHeaderRowPlaygroundState extends IColorProps {
		groupMode: 'single' | 'nested'
		showSelect: boolean
	}

	const GROUP_MODE_OPTIONS = [
		{ label: 'Single column', value: 'single' },
		{ label: 'Nested (2 columns)', value: 'nested' }
	]

	const headers = [
		{ title: 'Name',    key: 'name'    },
		{ title: 'Team',    key: 'team'    },
		{ title: 'Commits', key: 'commits', align: 'end' }
	]

	const extendedHeaders = [
		{ title: 'Name',    key: 'name'    },
		{ title: 'Team',    key: 'team'    },
		{ title: 'Role',    key: 'role'    },
		{ title: 'Commits', key: 'commits', align: 'end' }
	]

	const items = [
		{ name: 'Alice', team: 'Frontend', commits: 142 },
		{ name: 'Bob',   team: 'Backend',  commits: 98  },
		{ name: 'Carol', team: 'Design',   commits: 31  },
		{ name: 'Dan',   team: 'Frontend', commits: 87  },
		{ name: 'Eve',   team: 'Backend',  commits: 64  }
	]

	const extendedItems = items.map((it, idx) => ({
		...it,
		role: ['lead', 'staff', 'senior', 'lead', 'senior'][idx] ?? 'staff'
	}))

	const resolveHeaders = (mode: 'single' | 'nested') => {
		return mode === 'nested' ? extendedHeaders : headers
	}

	const resolveItems = (mode: 'single' | 'nested') => {
		return mode === 'nested' ? extendedItems : items
	}

	const resolveGroupBy = (mode: 'single' | 'nested') => {
		if (mode === 'nested') {
			return [{ key: 'team', order: 'asc' }, { key: 'role', order: 'asc' }]
		}

		return [{ key: 'team', order: 'asc' }]
	}

	const buildGroupHeaderRowStyle = (state: Partial<IDataTableGroupHeaderRowDesignState>) => {
		return {
			...(state.color      ? { '--origam-data-table-group-header-row---color':            `var(--origam-color--${state.color})` } : {}),
			...(state.padding      ? { '--origam-data-table-group-header-row---padding':         state.padding      } : {}),
			...(state.paddingInline ? { '--origam-data-table-group-header-row---padding-inline': state.paddingInline } : {}),
			...(state.paddingBlock  ? { '--origam-data-table-group-header-row---padding-block':  state.paddingBlock  } : {})
		}
	}
</script>

<docs lang="md" src="@docs/components/DataTable/OrigamDataTableGroupHeaderRow.md"/>
