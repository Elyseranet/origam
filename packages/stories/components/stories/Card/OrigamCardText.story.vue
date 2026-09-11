<template>
	<Story
			group="components"
			title="Card/OrigamCardText"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICardTextProps>>({
					text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
					tag: 'div',
					border: false,
					rounded: undefined
				})"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-text
							:tag="state.tag"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:rounded="state.rounded"
							:rounded-top-right="state.roundedTopRight"
							:rounded-top-left="state.roundedTopLeft"
							:rounded-bottom-left="state.roundedBottomLeft"
							:rounded-bottom-right="state.roundedBottomRight"
							:text="state.text"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
							:letter-spacing="state.letterSpacing"
					/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"            title="Rounded"              :options="ROUNDED_OPTIONS"/>
					<HstText   v-model="state.roundedTopRight"    title="Rounded Top-Right"/>
					<HstText   v-model="state.roundedTopLeft"     title="Rounded Top-Left"/>
					<HstText   v-model="state.roundedBottomLeft"  title="Rounded Bottom-Left"/>
					<HstText   v-model="state.roundedBottomRight" title="Rounded Bottom-Right"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICardTextProps>>({
					text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
					padding: undefined,
					margin: undefined
				})"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-text
							:text="state.text"
							:padding="state.padding"
							:padding-top="state.paddingTop"
							:padding-bottom="state.paddingBottom"
							:padding-left="state.paddingLeft"
							:padding-right="state.paddingRight"
							:padding-block="state.paddingBlock"
							:padding-inline="state.paddingInline"
							:margin="state.margin"
							:margin-top="state.marginTop"
							:margin-bottom="state.marginBottom"
							:margin-left="state.marginLeft"
							:margin-right="state.marginRight"
							:margin-block="state.marginBlock"
							:margin-inline="state.marginInline"
					/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Padding">
					<HstText v-model="state.padding"       title="Padding"/>
					<HstText v-model="state.paddingTop"    title="Padding Top"/>
					<HstText v-model="state.paddingBottom" title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"   title="Padding Left"/>
					<HstText v-model="state.paddingRight"  title="Padding Right"/>
					<HstText v-model="state.paddingBlock"  title="Padding Block"/>
					<HstText v-model="state.paddingInline" title="Padding Inline"/>
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
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-card style="max-width: 400px; margin: 24px auto;">
				<origam-card-text>
					<p>This is <strong>rich</strong> content rendered via the default slot.</p>
					<p>It supports any HTML markup.</p>
				</origam-card-text>
			</origam-card>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICardTextProps>({
					text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
					tag: 'div',
					border: false,
					rounded: undefined
				})"
		>
			<template #default="{ state }">
				<origam-card style="max-width: 400px; margin: 24px auto;">
					<origam-card-text v-bind="state"/>
				</origam-card>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.tag"         title="Tag"          :options="TAG_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText v-model="state.padding"       title="Padding"/>
					<HstText v-model="state.paddingTop"    title="Padding Top"/>
					<HstText v-model="state.paddingBottom" title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"   title="Padding Left"/>
					<HstText v-model="state.paddingRight"  title="Padding Right"/>
					<HstText v-model="state.margin"        title="Margin"/>
					<HstText v-model="state.marginTop"     title="Margin Top"/>
					<HstText v-model="state.marginBottom"  title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"    title="Margin Left"/>
					<HstText v-model="state.marginRight"   title="Margin Right"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamCard, OrigamCardText } from '@origam/components'
	import type { ICardTextProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<docs lang="md" src="@docs/components/Card/OrigamCardText.md"/>
