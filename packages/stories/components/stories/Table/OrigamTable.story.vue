<template>
	<Story
			group="components"
			title="Table/OrigamTable"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITableProps>>({ fontSize: undefined, fontWeight: undefined })"
		>
			<template #default="{ state }">
				<origam-table
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:padding="state.padding"
						:margin="state.margin"
						:width="state.width"
						:height="state.height"
						:max-width="state.maxWidth"
						:max-height="state.maxHeight"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
				>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
						</tr>
					</thead>
					<tbody>
						<tr><td>Ada Lovelace</td><td>ada@example.com</td></tr>
						<tr><td>Linus Torvalds</td><td>linus@example.com</td></tr>
						<tr><td>Grace Hopper</td><td>grace@example.com</td></tr>
					</tbody>
				</origam-table>
			</template>
			<template #controls="{ state }">
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps>({})"
		>
			<template #default="{ state }">
				<origam-table :hover="resolveHoverState(state.hover)" border>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
						</tr>
					</thead>
					<tbody>
						<tr><td>Ada Lovelace</td><td>ada@example.com</td></tr>
						<tr><td>Linus Torvalds</td><td>linus@example.com</td></tr>
					</tbody>
				</origam-table>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover" title="Hover" :options="HOVER_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITableProps>>({ tag: 'div', fixedHeader: false, fixedFooter: false, captionVisible: false })"
		>
			<template #default="{ state }">
				<origam-table
						:tag="state.tag"
						:fixed-header="state.fixedHeader"
						:fixed-footer="state.fixedFooter"
						:caption="state.caption"
						:caption-visible="state.captionVisible"
						:aria-rowcount="state.ariaRowcount"
						:max-height="state.fixedHeader || state.fixedFooter ? 160 : undefined"
						border
				>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="i in 8" :key="i">
							<td>User {{ i }}</td>
							<td>user{{ i }}@example.com</td>
						</tr>
					</tbody>
					<tfoot v-if="state.fixedFooter">
						<tr>
							<td colspan="2">Footer row</td>
						</tr>
					</tfoot>
				</origam-table>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Layout">
					<HstSelect   v-model="state.tag"         title="Tag"          :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.fixedHeader" title="Fixed Header"/>
					<HstCheckbox v-model="state.fixedFooter" title="Fixed Footer"/>
				</StoryGroup>
				<StoryGroup title="Caption">
					<HstText     v-model="state.caption"        title="Caption"/>
					<HstCheckbox v-model="state.captionVisible" title="Caption Visible"/>
				</StoryGroup>
				<StoryGroup title="Accessibility">
					<HstNumber v-model="state.ariaRowcount" title="aria-rowcount" :min="0" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:hover">
			<origam-table border @update:hover="logEvent('update:hover', $event)">
				<tbody>
					<tr><td>Hover over this table.</td></tr>
				</tbody>
			</origam-table>
		</Variant>

		<Variant title="Slots - Default">
			<origam-table border>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
					</tr>
				</thead>
				<tbody>
					<tr><td>Ada Lovelace</td><td>ada@example.com</td></tr>
					<tr><td>Linus Torvalds</td><td>linus@example.com</td></tr>
				</tbody>
			</origam-table>
		</Variant>

		<Variant title="Slots - Top">
			<origam-table border>
				<template #top>
					<div style="padding: 12px; background: var(--origam-color__surface---overlay);">
						Toolbar / search bar
					</div>
				</template>
				<thead>
					<tr><th>Name</th></tr>
				</thead>
				<tbody>
					<tr><td>Ada Lovelace</td></tr>
				</tbody>
			</origam-table>
		</Variant>

		<Variant title="Slots - Bottom">
			<origam-table border>
				<thead>
					<tr><th>Name</th></tr>
				</thead>
				<tbody>
					<tr><td>Ada Lovelace</td></tr>
				</tbody>
				<template #bottom>
					<div style="padding: 12px; background: var(--origam-color__surface---overlay);">
						Pagination / summary
					</div>
				</template>
			</origam-table>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-table border>
				<template #wrapper>
					<div style="padding: 16px; font-style: italic;">
						Wrapper slot fully replaces the &lt;table&gt; element.
					</div>
				</template>
			</origam-table>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITableProps>({ tag: 'div', fontSize: undefined, fontWeight: undefined })"
		>
			<template #default="{ state }">
				<origam-table v-bind="state">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
						</tr>
					</thead>
					<tbody>
						<tr><td>Ada Lovelace</td><td>ada@example.com</td></tr>
						<tr><td>Linus Torvalds</td><td>linus@example.com</td></tr>
						<tr><td>Grace Hopper</td><td>grace@example.com</td></tr>
						<tr><td>Alan Turing</td><td>alan@example.com</td></tr>
						<tr><td>Margaret Hamilton</td><td>margaret@example.com</td></tr>
					</tbody>
				</origam-table>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.tag"         title="Tag"          :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.fixedHeader" title="Fixed Header"/>
					<HstCheckbox v-model="state.fixedFooter" title="Fixed Footer"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
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
	import { OrigamTable } from '@origam/components'
	import type {
		IHoverProps,
		ITableProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/Table/OrigamTable.md"/>
