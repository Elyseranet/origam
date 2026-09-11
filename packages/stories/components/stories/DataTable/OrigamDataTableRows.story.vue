<template>
	<Story
			group="components"
			title="DataTable/OrigamDataTableRows"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataTableRowsProps>>({ color: 'primary' })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="items"
						:loading="true"
						:color="state.color"
						data-cy="rows-design"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Loader Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDataTableRowsProps>>({ noDataText: 'No data available.', itemsPerPage: 3 })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="state.loading ? [] : (state.hideNoData ? [] : items)"
						:loading="state.loading"
						:loading-text="state.loadingText"
						:items-per-page="state.itemsPerPage"
						:no-data-text="state.noDataText"
						:hide-no-data="state.hideNoData"
						:mobile-breakpoint="state.mobileBreakpoint"
						data-cy="rows-functional"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.loading"      title="Loading"/>
					<HstText     v-model="state.loadingText"  title="Loading Text"/>
				</StoryGroup>
				<StoryGroup title="Empty State">
					<HstText     v-model="state.noDataText"  title="No Data Text"/>
					<HstCheckbox v-model="state.hideNoData"  title="Hide No Data"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstNumber v-model="state.itemsPerPage"    title="Items Per Page" :min="1" :max="20" :step="1"/>
					<HstText   v-model="state.mobileBreakpoint" title="Mobile Breakpoint (px or name)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Loading">
			<origam-data-table
					:headers="headers"
					:items="[]"
					loading
					data-cy="rows-slot-loading"
			>
				<template #loading>
					<tr>
						<td
								:colspan="headers.length"
								style="padding: 32px; text-align: center; color: var(--origam-color__text---secondary);"
						>
							Loading…
						</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - No Data">
			<origam-data-table
					:headers="headers"
					:items="[]"
					data-cy="rows-slot-no-data"
			>
				<template #no-data>
					<p style="margin: 0 0 8px; font-weight: 600;">No commits yet</p>
					<small style="color: var(--origam-color__text---secondary);">
						The team will appear here as soon as activity rolls in.
					</small>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Item">
			<origam-data-table
					:headers="headers"
					:items="items"
					data-cy="rows-slot-item"
			>
				<template #item="{ item, columns }">
					<tr>
						<td
								v-for="col in columns"
								:key="col.key"
								style="padding: 8px 16px; border-bottom: 1px solid var(--origam-color__border---subtle);"
						>
							{{ item[col.key] }}
						</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Expanded Row">
			<origam-data-table
					:headers="headers"
					:items="items"
					show-expand
					data-cy="rows-slot-expanded-row"
			>
				<template #expanded-row="{ item }">
					<tr>
						<td
								:colspan="headers.length + 1"
								style="padding: 12px 16px; background: var(--origam-color__surface---overlay, rgba(0,0,0,.04));"
						>
							<strong>{{ item.name }}</strong> — {{ item.team }} team, {{ item.commits }} commits total.
						</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Group Header">
			<origam-data-table
					:headers="headers"
					:items="items"
					group-by="team"
					data-cy="rows-slot-group-header"
			>
				<template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
					<tr>
						<td
								:colspan="columns.length"
								style="padding: 8px 16px; font-weight: 600; background: var(--origam-color__surface---overlay, rgba(0,0,0,.04));"
						>
							{{ item.value }} ({{ item.items.length }})
							<button
									style="margin-inline-start: 8px; appearance: none; border: none; background: transparent; cursor: pointer;"
									@click="toggleGroup(item)"
							>
								{{ isGroupOpen(item) ? 'Collapse' : 'Expand' }}
							</button>
						</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDataTableRowsProps>>({ itemsPerPage: 3 })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="manyItems"
						:items-per-page="state.itemsPerPage"
						:loading="state.loading"
						:loading-text="state.loadingText"
						:no-data-text="state.noDataText"
						:hide-no-data="state.hideNoData"
						:color="state.color"
						data-cy="rows-playground"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstNumber v-model="state.itemsPerPage" title="Items Per Page" :min="1" :max="20" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color" title="Loader Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.loading"     title="Loading"/>
					<HstText     v-model="state.loadingText" title="Loading Text"/>
					<HstText     v-model="state.noDataText"  title="No Data Text"/>
					<HstCheckbox v-model="state.hideNoData"  title="Hide No Data"/>
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
	import type { IDataTableRowsProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { COLOR_OPTIONS } from '@stories/const'

	const headers = [
		{ title: 'Name',    key: 'name'    },
		{ title: 'Team',    key: 'team'    },
		{ title: 'Commits', key: 'commits', align: 'end' },
	]

	const items = [
		{ name: 'Alice', team: 'Frontend', commits: 142 },
		{ name: 'Bob',   team: 'Backend',  commits: 98  },
		{ name: 'Carol', team: 'Design',   commits: 31  },
	]

	const manyItems = Array.from({ length: 12 }, (_, i) => ({
		name:    `User ${i + 1}`,
		team:    ['Frontend', 'Backend', 'Design', 'DevOps'][i % 4],
		commits: 10 + (i * 17 % 190),
	}))
</script>

<docs lang="md" src="@docs/components/DataTable/OrigamDataTableRows.md"/>
