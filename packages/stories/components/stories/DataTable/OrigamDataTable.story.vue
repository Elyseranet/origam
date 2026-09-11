<template>
	<Story
			group="components"
			title="DataTable/OrigamDataTable"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ color: undefined, bgColor: undefined })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="sortableHeaders"
						:items="items"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
						:fixed-header="state.fixedHeader"
						:fixed-footer="state.fixedFooter"
						:caption="state.caption || undefined"
						:caption-visible="state.captionVisible"
				/>
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
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Caption">
					<HstText     v-model="state.caption"        title="Caption"/>
					<HstCheckbox v-model="state.captionVisible" title="Caption Visible"/>
				</StoryGroup>
				<StoryGroup title="Fixed">
					<HstCheckbox v-model="state.fixedHeader" title="Fixed Header"/>
					<HstCheckbox v-model="state.fixedFooter" title="Fixed Footer"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ color: undefined })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="sortableHeaders"
						:items="items"
						:color="state.color"
						:hover="resolveHoverState(state.hover)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover" title="Hover" :options="HOVER_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDataTableProps> & ILoadingState>({
					showSelect: false,
					showExpand: false,
					expandOnClick: false,
					multiSort: false,
					mustSort: false,
					hideDefaultHeader: false,
					hideDefaultFooter: false,
					hideDefaultBody: false,
					itemsPerPage: 5,
					search: '',
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24
				})"
		>
			<template #default="{ state }">
				<div>
					<origam-text-field
							v-model="state.search"
							label="Search"
							clearable
							style="max-width: 320px; margin-bottom: 12px;"
					/>
					<origam-data-table
							v-model="selected"
							:headers="sortableHeaders"
							:items="manyItems"
							:show-select="state.showSelect"
							:show-expand="state.showExpand"
							:expand-on-click="state.expandOnClick"
							:multi-sort="state.multiSort"
							:must-sort="state.mustSort"
							:hide-default-header="state.hideDefaultHeader"
							:hide-default-footer="state.hideDefaultFooter"
							:hide-default-body="state.hideDefaultBody"
							:items-per-page="state.itemsPerPage"
							:search="state.search || undefined"
							:loading="resolveLoading(state)"
							item-value="id"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Selection">
					<HstCheckbox v-model="state.showSelect" title="Show Select"/>
				</StoryGroup>
				<StoryGroup title="Expand">
					<HstCheckbox v-model="state.showExpand"     title="Show Expand"/>
					<HstCheckbox v-model="state.expandOnClick"  title="Expand on Click"/>
				</StoryGroup>
				<StoryGroup title="Sort">
					<HstCheckbox v-model="state.multiSort" title="Multi Sort"/>
					<HstCheckbox v-model="state.mustSort"  title="Must Sort"/>
				</StoryGroup>
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.hideDefaultHeader" title="Hide Header"/>
					<HstCheckbox v-model="state.hideDefaultFooter" title="Hide Footer"/>
					<HstCheckbox v-model="state.hideDefaultBody"   title="Hide Body"/>
				</StoryGroup>
				<StoryGroup title="Pagination">
					<HstNumber v-model="state.itemsPerPage" title="Items Per Page" :min="1" :max="25" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Search">
					<HstText v-model="state.search" title="Search"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:currentItems">
			<origam-data-table
					:headers="headers"
					:items="items"
					@update:current-items="logEvent('update:currentItems', $event)"
			/>
		</Variant>

		<Variant title="Events - update:expanded">
			<origam-data-table
					:headers="headers"
					:items="items"
					show-expand
					@update:expanded="logEvent('update:expanded', $event)"
			/>
		</Variant>

		<Variant title="Events - update:groupBy">
			<origam-data-table
					:headers="headers"
					:items="items"
					@update:group-by="logEvent('update:groupBy', $event)"
			/>
		</Variant>

		<Variant title="Events - update:itemsPerPage">
			<origam-data-table
					:headers="headers"
					:items="manyItems"
					:items-per-page="5"
					@update:items-per-page="logEvent('update:itemsPerPage', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-data-table
					v-model="selected"
					:headers="headers"
					:items="items"
					show-select
					item-value="id"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - update:options">
			<origam-data-table
					:headers="sortableHeaders"
					:items="items"
					@update:options="logEvent('update:options', $event)"
			/>
		</Variant>

		<Variant title="Events - update:page">
			<origam-data-table
					:headers="headers"
					:items="manyItems"
					:items-per-page="5"
					@update:page="logEvent('update:page', $event)"
			/>
		</Variant>

		<Variant title="Events - update:sortBy">
			<origam-data-table
					:headers="sortableHeaders"
					:items="items"
					@update:sort-by="logEvent('update:sortBy', $event)"
			/>
		</Variant>

		<Variant title="Slots - Top">
			<origam-data-table :headers="headers" :items="items">
				<template #top>
					<div style="padding: 12px; font-weight: bold;">User list</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-data-table :headers="headers" :items="items">
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Append">
			<origam-data-table :headers="headers" :items="items">
				<template #append>
					<div style="padding: 12px; font-size: 0.75rem; opacity: 0.7;">Append area below table body</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Body">
			<origam-data-table :headers="headers" :items="items">
				<template #body>
					<tr>
						<td colspan="4" style="padding: 16px; text-align: center; font-style: italic;">Custom body slot content</td>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Bottom">
			<origam-data-table :headers="headers" :items="items">
				<template #bottom>
					<div style="padding: 12px; display: flex; justify-content: flex-end;">
						<span style="font-size: 0.75rem;">Custom footer area</span>
					</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Colgroup">
			<origam-data-table :headers="headers" :items="items">
				<template #colgroup>
					<colgroup>
						<col style="width: 60px;"/>
						<col style="width: 160px;"/>
						<col style="width: 160px;"/>
						<col style="width: 80px;"/>
					</colgroup>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Default">
			<origam-data-table :headers="headers" :items="items">
				<template #default>
					<span>Custom default slot content</span>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Header">
			<origam-data-table :headers="headers" :items="items">
				<template #header>
					<div style="padding: 12px; background: var(--origam-color__surface---overlay); font-weight: 700;">Custom header slot</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Header.loader">
			<origam-data-table :headers="headers" :items="items" loading>
				<template #header.loader>
					<span>Loading...</span>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Header.mobile">
			<origam-data-table :headers="headers" :items="items">
				<template #header.mobile>
					<div style="padding: 8px; font-size: 0.875rem; font-weight: 600;">Mobile header slot</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Slots - Thead">
			<origam-data-table :headers="headers" :items="items">
				<template #thead>
					<tr>
						<th colspan="4" style="padding: 8px 16px; background: var(--origam-color__surface---overlay); font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase;">Custom thead slot</th>
					</tr>
				</template>
			</origam-data-table>
		</Variant>

		<Variant title="Prop — headers & items (basic dataset)">
			<origam-data-table
					:headers="headers"
					:items="items"
			/>
		</Variant>

		<Variant
				title="Prop — multiSort & mustSort"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ multiSort: false, mustSort: false })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="sortableHeaders"
						:items="items"
						:multi-sort="state.multiSort"
						:must-sort="state.mustSort"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sort">
					<HstCheckbox v-model="state.multiSort" title="multiSort"/>
					<HstCheckbox v-model="state.mustSort"  title="mustSort"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — itemsPerPage (pagination)"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ itemsPerPage: 5 })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="manyItems"
						:items-per-page="state.itemsPerPage"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Pagination">
					<HstNumber v-model="state.itemsPerPage" title="Items Per Page" :min="1" :max="20"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — showSelect">
			<origam-data-table
					v-model="selected"
					:headers="headers"
					:items="items"
					show-select
					item-value="id"
			/>
		</Variant>

		<Variant
				title="Prop — search"
				:init-state="() => useStoryInitState<{ search: string }>({ search: '' })"
		>
			<template #default="{ state }">
				<div>
					<origam-text-field
							v-model="state.search"
							label="Search"
							clearable
							style="max-width: 320px; margin-bottom: 12px;"
					/>
					<origam-data-table
							:headers="headers"
							:items="items"
							:search="state.search || undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Search">
					<HstText v-model="state.search" title="Search"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — loading"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({ loading: true })"
		>
			<template #default="{ state }">
				<origam-data-table
						:headers="headers"
						:items="items"
						:loading="state.loading"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.loading" title="Loading"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slot — top">
			<origam-data-table :headers="headers" :items="items">
				<template #top>
					<div style="padding: 12px; font-weight: bold;">User list</div>
				</template>
			</origam-data-table>
		</Variant>

		<Variant
				title="Prop — loading (all shapes)"
				:init-state="() => useStoryInitState<ILoadingState>({ enabled: true, kind: 'line', progress: 42, circularSize: 24 })"
		>
			<template #default="{ state }">
				<origam-data-table
						data-cy="data-table-loading-interactive"
						:headers="headers"
						:items="items"
						:loading="resolveLoading(state)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Enabled"/>
					<HstSelect   v-model="state.kind"         title="Kind"     :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress" :min="0" :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size"     :min="12" :max="64" :step="2"/>
				</StoryGroup>
			</template>
		</Variant>

				<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDataTableProps>>({
					itemsPerPage: 5,
					showSelect: false,
					multiSort: false,
					mustSort: false,
					loading: false,
					hideDefaultHeader: false,
					hideDefaultFooter: false
				})"
		>
			<template #default="{ state }">
				<origam-data-table
						v-model="selected"
						:headers="sortableHeaders"
						:items="manyItems"
						item-value="id"
						v-bind="state"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.showSelect"        title="Show Select"/>
					<HstCheckbox v-model="state.multiSort"         title="Multi Sort"/>
					<HstCheckbox v-model="state.mustSort"          title="Must Sort"/>
					<HstNumber   v-model="state.itemsPerPage"      title="Items Per Page" :min="1" :max="25"/>
					<HstCheckbox v-model="state.loading"           title="Loading"/>
					<HstCheckbox v-model="state.hideDefaultHeader" title="Hide Header"/>
					<HstCheckbox v-model="state.hideDefaultFooter" title="Hide Footer"/>
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

	import { OrigamDataTable, OrigamIcon, OrigamTextField } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDataTableProps } from '@origam/interfaces'
	import type { TLoadingValue } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ROUNDED_OPTIONS
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

	const selected = ref([])

	const headers = [
		{ title: 'ID',         key: 'id' },
		{ title: 'First name', key: 'firstName' },
		{ title: 'Last name',  key: 'lastName' },
		{ title: 'Age',        key: 'age' }
	]

	const sortableHeaders = headers.map(h => ({ ...h, sortable: true }))

	const items = [
		{ id: 1, firstName: 'Alice',  lastName: 'Dupont',  age: 30 },
		{ id: 2, firstName: 'Bob',    lastName: 'Martin',  age: 25 },
		{ id: 3, firstName: 'Claire', lastName: 'Bernard', age: 35 },
		{ id: 4, firstName: 'David',  lastName: 'Leroy',   age: 28 },
		{ id: 5, firstName: 'Eve',    lastName: 'Moreau',  age: 22 }
	]

	const manyItems = Array.from({ length: 25 }, (_, i) => ({
		id: i + 1,
		firstName: `First${i + 1}`,
		lastName:  `Last${i + 1}`,
		age:       20 + (i % 30)
	}))
</script>

<docs lang="md" src="@docs/components/DataTable/OrigamDataTable.md"/>
