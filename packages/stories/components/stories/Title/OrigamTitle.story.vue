<template>
	<Story
			group="components"
			title="Title/OrigamTitle"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITitleProps>>({ tag: 'h1', text: 'OrigamTitle' })"
		>
			<template #default="{ state }">
				<origam-title
						:tag="state.tag"
						:text="state.text"
						:color="state.color"
						:bg-color="state.bgColor"
						:density="state.density"
						:font-family="state.fontFamily"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						:letter-spacing="state.letterSpacing"
						:text-transform="state.textTransform"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:padding="state.padding"
						:padding-top="state.paddingTop"
						:padding-bottom="state.paddingBottom"
						:padding-left="state.paddingLeft"
						:padding-right="state.paddingRight"
						:margin="state.margin"
						:margin-top="state.marginTop"
						:margin-bottom="state.marginBottom"
						:margin-left="state.marginLeft"
						:margin-right="state.marginRight"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TITLE_TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_RAW_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_RAW_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily"    title="Font Family"    :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.textTransform" title="Text Transform" :options="TEXT_TRANSFORM_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing — Padding">
					<HstText v-model="state.padding"        title="Padding"/>
					<HstText v-model="state.paddingTop"     title="Padding Top"/>
					<HstText v-model="state.paddingBottom"  title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"    title="Padding Left"/>
					<HstText v-model="state.paddingRight"   title="Padding Right"/>
				</StoryGroup>
				<StoryGroup title="Spacing — Margin">
					<HstText v-model="state.margin"        title="Margin"/>
					<HstText v-model="state.marginTop"     title="Margin Top"/>
					<HstText v-model="state.marginBottom"  title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"    title="Margin Left"/>
					<HstText v-model="state.marginRight"   title="Margin Right"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-title tag="h2">
				Welcome <em>back</em>
			</origam-title>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITitleProps>({ tag: 'h1', text: 'OrigamTitle' })"
		>
			<template #default="{ state }">
				<origam-title v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.text" title="Text"/>
					<HstSelect v-model="state.tag"  title="Tag" :options="TITLE_TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_RAW_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_RAW_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density"  :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamTitle } from '@origam/components'
	import type { IOptions, ITitleProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_RAW_OPTIONS,
		DENSITY_OPTIONS,
		FONT_FAMILY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		TEXT_TRANSFORM_OPTIONS,
		LINE_HEIGHT_OPTIONS
	} from '@stories/const'

	const TITLE_TAG_OPTIONS: Array<IOptions<string>> = [
		{ label: '(default — h1)', value: undefined },
		{ label: 'h1', value: 'h1' },
		{ label: 'h2', value: 'h2' },
		{ label: 'h3', value: 'h3' },
		{ label: 'h4', value: 'h4' },
		{ label: 'h5', value: 'h5' },
		{ label: 'h6', value: 'h6' },
	]
</script>

<docs lang="md" src="@docs/components/Title/OrigamTitle.md"/>
