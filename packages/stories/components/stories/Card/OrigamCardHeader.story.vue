<template>
	<Story
			group="components"
			title="Card/OrigamCardHeader"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICardHeaderProps>>({
					title: 'Card Title',
					subtitle: 'Card Subtitle',
					density: undefined,
					rounded: undefined,
					border: false,
					borderColor: undefined,
					borderStyle: undefined,
					padding: undefined,
					margin: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					prependAvatar: undefined,
					appendAvatar: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined,
					letterSpacing: undefined
				})"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-header
							:title="state.title"
							:subtitle="state.subtitle"
							:density="state.density"
							:rounded="state.rounded"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:padding="state.padding"
							:margin="state.margin"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							:prepend-avatar="state.prependAvatar || undefined"
							:append-avatar="state.appendAvatar || undefined"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
							:line-height="state.lineHeight"
							:letter-spacing="state.letterSpacing"
					/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
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
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar"/>
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
				:init-state="() => useStoryInitState<Partial<ICardHeaderProps>>({ tag: 'div', title: 'Card Title', subtitle: 'Card Subtitle' })"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-header
							:tag="state.tag"
							:title="state.title"
							:subtitle="state.subtitle"
					/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:append">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header
						title="Header"
						:append-icon="appendIcon"
						@click:append="logEvent('click:append', $event)"
				/>
			</origam-card>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header
						title="Header"
						:prepend-icon="prependIcon"
						@click:prepend="logEvent('click:prepend', $event)"
				/>
			</origam-card>
		</Variant>

		<Variant title="Slots - Default">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header>
					<span>Custom slot content</span>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header title="Header">
					<template #prepend>
						<origam-icon :icon="prependIcon"/>
					</template>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant title="Slots - Append">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header title="Header">
					<template #append>
						<origam-icon :icon="appendIcon"/>
					</template>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant title="Slots - Title">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header>
					<template #title>
						<strong>Custom title text</strong>
					</template>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant title="Slots - Subtitle">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header title="Header">
					<template #subtitle>
						<em>Custom subtitle text</em>
					</template>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-header>
					<template #wrapper>
						<div style="display: flex; gap: 8px; align-items: center; padding: 12px;">
							<span>Wrapper override</span>
						</div>
					</template>
				</origam-card-header>
			</origam-card>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICardHeaderProps>({
					title: 'Card Title',
					subtitle: 'Card Subtitle'
				})"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-header
							v-bind="state"
							@click:append="logEvent('click:append', $event)"
							@click:prepend="logEvent('click:prepend', $event)"
					/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"  :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.tag"        title="Tag"          :options="TAG_OPTIONS"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
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

	import { OrigamCard, OrigamCardHeader, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { ICardHeaderProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		DENSITY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ICON_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const prependIcon = MDI_ICONS.ACCOUNT
	const appendIcon = MDI_ICONS.DOTS_VERTICAL
</script>

<docs lang="md" src="@docs/components/Card/OrigamCardHeader.md"/>
