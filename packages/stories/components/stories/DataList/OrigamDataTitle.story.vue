<template>
	<Story
			group="components"
			title="DataList/OrigamDataTitle"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDataTitleProps>>({ text: 'Email', color: undefined, bgColor: undefined, density: undefined, padding: undefined, margin: undefined })"
		>
			<template #default="{ state }">
				<dl style="margin: 24px;">
					<origam-data-title
							:text="state.text"
							:color="state.color"
							:bg-color="state.bgColor"
							:density="state.density"
							:padding="state.padding"
							:margin="state.margin"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							:prepend-avatar="state.prependAvatar || undefined"
							:append-avatar="state.appendAvatar || undefined"
					/>
				</dl>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Avatars">
					<HstText v-model="state.prependAvatar" title="Prepend Avatar (URL)"/>
					<HstText v-model="state.appendAvatar"  title="Append Avatar (URL)"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDataTitleProps>>({ text: 'Email' })"
		>
			<template #default="{ state }">
				<dl style="margin: 24px;">
					<origam-data-title
							:text="state.text"
							:margin="state.margin"
							:margin-top="state.marginTop"
							:margin-bottom="state.marginBottom"
							:margin-left="state.marginLeft"
							:margin-right="state.marginRight"
							:margin-block="state.marginBlock"
							:margin-inline="state.marginInline"
							:padding="state.padding"
							:padding-top="state.paddingTop"
							:padding-bottom="state.paddingBottom"
							:padding-left="state.paddingLeft"
							:padding-right="state.paddingRight"
							:padding-block="state.paddingBlock"
							:padding-inline="state.paddingInline"
					/>
				</dl>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Margin">
					<HstText v-model="state.margin"       title="Margin"/>
					<HstText v-model="state.marginTop"    title="Margin Top"/>
					<HstText v-model="state.marginBottom" title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"   title="Margin Left"/>
					<HstText v-model="state.marginRight"  title="Margin Right"/>
					<HstText v-model="state.marginBlock"  title="Margin Block"/>
					<HstText v-model="state.marginInline" title="Margin Inline"/>
				</StoryGroup>
				<StoryGroup title="Padding">
					<HstText v-model="state.padding"        title="Padding"/>
					<HstText v-model="state.paddingTop"     title="Padding Top"/>
					<HstText v-model="state.paddingBottom"  title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"    title="Padding Left"/>
					<HstText v-model="state.paddingRight"   title="Padding Right"/>
					<HstText v-model="state.paddingBlock"   title="Padding Block"/>
					<HstText v-model="state.paddingInline"  title="Padding Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:prepend">
			<dl style="margin: 24px;">
				<origam-data-title
						text="Click the icon"
						:prepend-icon="emailIcon"
						prepend-aria-label="Open details"
						@click:prepend="logEvent('click:prepend', $event)"
				/>
			</dl>
		</Variant>

		<Variant title="Events - click:append">
			<dl style="margin: 24px;">
				<origam-data-title
						text="Click the icon"
						:append-icon="arrowIcon"
						append-aria-label="Show options"
						@click:append="logEvent('click:append', $event)"
				/>
			</dl>
		</Variant>

		<Variant title="Slots - Default">
			<dl style="margin: 24px;">
				<origam-data-title text="Customer">
					<template #default="{ text }">
						<span style="font-variant: small-caps; letter-spacing: 0.08em;">
							{{ text }}
						</span>
					</template>
				</origam-data-title>
			</dl>
		</Variant>

		<Variant title="Slots - Prepend">
			<dl style="margin: 24px;">
				<origam-data-title text="With prepend slot">
					<template #prepend>
						<origam-icon :icon="emailIcon"/>
					</template>
				</origam-data-title>
			</dl>
		</Variant>

		<Variant title="Slots - Append">
			<dl style="margin: 24px;">
				<origam-data-title text="With append slot">
					<template #append>
						<origam-icon :icon="arrowIcon"/>
					</template>
				</origam-data-title>
			</dl>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IDataTitleProps>({ text: 'Email' })"
		>
			<template #default="{ state }">
				<dl style="margin: 24px;">
					<origam-data-title
							v-bind="state"
							prepend-aria-label="Open details"
							@click:prepend="logEvent('click:prepend', $event)"
							append-aria-label="Show options"
							@click:append="logEvent('click:append', $event)"
					/>
				</dl>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.text"          title="Text"/>
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar (URL)"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar (URL)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density"  :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText v-model="state.margin"  title="Margin"/>
					<HstText v-model="state.padding" title="Padding"/>
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

	import { OrigamDataTitle, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDataTitleProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ICON_OPTIONS
	} from '@stories/const'

	const emailIcon = MDI_ICONS.EMAIL
	const arrowIcon = MDI_ICONS.ARROW_RIGHT
</script>

<docs lang="md" src="@docs/components/DataList/OrigamDataTitle.md"/>
