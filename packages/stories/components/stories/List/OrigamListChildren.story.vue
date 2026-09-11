<template>
	<Story
			group="components"
			title="List/OrigamListChildren"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IListItemChildren>({ items: flatItems, returnObject: false })"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-children
							:items="state.items"
							:return-object="state.returnObject"
					/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstSelect
							v-model="state.items"
							title="Items preset"
							:options="ITEMS_PRESET_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.returnObject" title="Return Object"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IListItemChildren>({ items: nestedItems, returnObject: false })"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-children
							:items="state.items"
							:return-object="state.returnObject"
					/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstSelect
							v-model="state.items"
							title="Items preset"
							:options="ITEMS_PRESET_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.returnObject" title="Return Object"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Children">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<template #children="{ item }">
						<span>Custom child: {{ item.title }}</span>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - Default">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<span>Custom slot content</span>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - Divider">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<template #divider>
						<hr style="border-color: var(--origam-color__border---subtle); margin: 4px 0;"/>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - Group">
			<origam-list>
				<origam-list-children :items="nestedItems">
					<template #group="{ item }">
						<span style="font-weight: 600;">{{ item.title }}</span>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - GroupActivator">
			<origam-list>
				<origam-list-children :items="nestedItems">
					<template #groupActivator="{ item }">
						<span>Open: {{ item.title }}</span>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - Item">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<template #item="{ item }">
						<origam-list-item :title="item.title" :prepend-icon="item.prependIcon"/>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - Subheader">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<template #subheader>
						<span style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; padding: 4px 16px;">Custom subheader</span>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant title="Slots - SubheaderTitle">
			<origam-list>
				<origam-list-children :items="flatItems" return-object>
					<template #subheaderTitle>
						<span>Custom subheader title</span>
					</template>
				</origam-list-children>
			</origam-list>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IListItemChildren>({ items: nestedItems, returnObject: false })"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-children v-bind="state"/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect
							v-model="state.items"
							title="Items preset"
							:options="ITEMS_PRESET_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.returnObject" title="Return Object"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamList, OrigamListChildren, OrigamListItem } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IListItemChildren } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const flatItems = [
		{ title: 'Inbox',   prependIcon: MDI_ICONS.INBOX },
		{ title: 'Starred', prependIcon: MDI_ICONS.STAR },
		{ title: 'Sent',    prependIcon: MDI_ICONS.SEND },
		{ title: 'Drafts',  prependIcon: MDI_ICONS.FILE_DOCUMENT_OUTLINE },
	]

	const nestedItems = [
		{
			title: 'Mail',
			prependIcon: MDI_ICONS.EMAIL_OUTLINE,
			children: [
				{ title: 'Inbox',   prependIcon: MDI_ICONS.INBOX },
				{ title: 'Sent',    prependIcon: MDI_ICONS.SEND },
				{ title: 'Drafts',  prependIcon: MDI_ICONS.FILE_DOCUMENT_OUTLINE },
			],
		},
		{
			title: 'Calendar',
			prependIcon: MDI_ICONS.CALENDAR,
			children: [
				{ title: 'Today',    prependIcon: MDI_ICONS.CALENDAR_TODAY },
				{ title: 'Upcoming', prependIcon: MDI_ICONS.CALENDAR_CLOCK },
			],
		},
		{ title: 'Settings', prependIcon: MDI_ICONS.COG_OUTLINE },
	]

	const ITEMS_PRESET_OPTIONS = [
		{ label: 'Flat list',    value: flatItems },
		{ label: 'Nested items', value: nestedItems },
	]
</script>

<docs lang="md" src="@docs/components/List/OrigamListChildren.md"/>
