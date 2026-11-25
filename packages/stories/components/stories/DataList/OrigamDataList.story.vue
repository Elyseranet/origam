<template>
	<Story
			group="components"
			title="DataList/OrigamDataList"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataListProps>>({
					color: undefined,
					bgColor: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: false,
					borderColor: undefined,
					borderStyle: undefined,
					padding: undefined,
					margin: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined,
					letterSpacing: undefined
				})"
		>
			<template #default="{ state }">
				<origam-data-list
						:items="basicItems"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:padding="state.padding"
						:margin="state.margin"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						:letter-spacing="state.letterSpacing"
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDataListProps>>({
					mode: 'avatar',
					prependIcon: undefined,
					appendIcon: undefined,
					prependAvatar: undefined,
					appendAvatar: undefined,
					padding: undefined,
					margin: undefined
				})"
		>
			<template #default="{ state }">
				<origam-data-list
						:items="state.mode === 'kv' ? kvBasicItems : basicItems"
						:mode="state.mode"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-avatar="state.prependAvatar || undefined"
						:append-avatar="state.appendAvatar || undefined"
						:padding="state.padding"
						:margin="state.margin"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="DATA_LIST_MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar (URL)"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar (URL)"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Surface - on a coloured stage">
			<div style="padding: 1rem; background: linear-gradient(135deg, #6d28d9, #db2777); color: #fff;">
				<origam-data-list :items="basicItems"/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-data-list :items="basicItems">
				<span>Custom default slot content</span>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item">
			<origam-data-list :items="basicItems">
				<template #item="{ item }">
					<div style="display: flex; justify-content: space-between; padding: 4px 0;">
						<strong>{{ item.title?.text }}</strong>
						<span>{{ item.text?.[0]?.text }}</span>
					</div>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.title">
			<origam-data-list :items="basicItems">
				<template #item.title="props">
					<em>{{ props }}</em>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.title.prepend">
			<origam-data-list :items="basicItems">
				<template #item.title.prepend>
					<span>•</span>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.title.append">
			<origam-data-list :items="basicItems">
				<template #item.title.append>
					<span>*</span>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.text">
			<origam-data-list :items="basicItems">
				<template #item.text="{ item }">
					<em>{{ item.text?.[0]?.text }}</em>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.text.prepend">
			<origam-data-list :items="basicItems">
				<template #item.text.prepend>
					<span>→</span>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Item.text.append">
			<origam-data-list :items="basicItems">
				<template #item.text.append>
					<span>↗</span>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Key (KV mode)">
			<origam-data-list mode="kv" :items="kvBasicItems">
				<template #key="{ key }">
					<strong>{{ key }}</strong>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - Value (KV mode)">
			<origam-data-list mode="kv" :items="kvBasicItems">
				<template #value="{ key, value }">
					<a
							v-if="key === 'Owner'"
							href="#owner-profile"
					>
						{{ value }}
					</a>
					<span v-else>{{ value }}</span>
				</template>
			</origam-data-list>
		</Variant>

		<Variant title="Slots - KV component-value cells">
			<origam-data-list mode="kv" :items="kvMixedItems"/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDataListProps>>({
					mode: 'avatar',
					color: undefined,
					bgColor: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					border: false,
					prependIcon: undefined,
					appendIcon: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined,
					letterSpacing: undefined
				})"
		>
			<template #default="{ state }">
				<origam-data-list
						:items="state.mode === 'kv' ? kvBasicItems : basicItems"
						v-bind="state"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.mode" title="Mode" :options="DATA_LIST_MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { markRaw } from 'vue'

	import { OrigamChip, OrigamDataList } from '@origam/components'
	import type { IDataListKVItem, IDataListProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ICON_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const DATA_LIST_MODE_OPTIONS = [
		{ label: 'avatar (default)', value: 'avatar' },
		{ label: 'kv', value: 'kv' }
	]

	const RawChip = markRaw(OrigamChip)

	const basicItems = [
		{ title: { text: 'Status' },   text: [{ text: 'Active' }] },
		{ title: { text: 'Created' },  text: [{ text: '2024-01-15' }] },
		{ title: { text: 'Owner' },    text: [{ text: 'Alice Dupont' }] },
		{ title: { text: 'Priority' }, text: [{ text: 'High' }] },
	]

	const kvBasicItems: IDataListKVItem[] = [
		{ key: 'Status',     value: 'Active' },
		{ key: 'Owner',      value: 'Arnaud Martin' },
		{ key: 'Created at', value: 'Apr 12, 2026' },
		{ key: 'Priority',   value: 'High' },
	]

	const kvMixedItems: IDataListKVItem[] = [
		{
			key: 'Status',
			value: { component: RawChip, props: { text: 'Active', bgColor: 'success' } }
		},
		{ key: 'Owner', value: 'Arnaud Martin' },
		{ key: 'Created at', value: 'Apr 12, 2026' },
		{
			key: 'Priority',
			value: { component: RawChip, props: { text: 'High', bgColor: 'danger' } }
		},
	]
</script>

<docs lang="md" src="@docs/components/DataList/OrigamDataList.md"/>
