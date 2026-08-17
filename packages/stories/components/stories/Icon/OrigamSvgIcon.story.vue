<template>
	<Story
			group="components"
			title="Icon/OrigamSvgIcon"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ color: undefined, bgColor: undefined, size: 'default', rounded: undefined })"
		>
			<template #default="{ state }">
				<origam-svg-icon
						:icon="SVG_PATH_HEART"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:rounded="state.rounded"
						:rounded-top-left="state.roundedTopLeft"
						:rounded-top-right="state.roundedTopRight"
						:rounded-bottom-left="state.roundedBottomLeft"
						:rounded-bottom-right="state.roundedBottomRight"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:border-top="state.borderTop"
						:border-right="state.borderRight"
						:border-bottom="state.borderBottom"
						:border-left="state.borderLeft"
						:width="state.width"
						:height="state.height"
						:padding="state.padding"
						:padding-top="state.paddingTop"
						:padding-right="state.paddingRight"
						:padding-bottom="state.paddingBottom"
						:padding-left="state.paddingLeft"
						:padding-block="state.paddingBlock"
						:padding-inline="state.paddingInline"
						:margin="state.margin"
						:margin-top="state.marginTop"
						:margin-right="state.marginRight"
						:margin-bottom="state.marginBottom"
						:margin-left="state.marginLeft"
						:margin-block="state.marginBlock"
						:margin-inline="state.marginInline"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Rounded — per corner">
					<HstText v-model="state.roundedTopLeft"     title="Rounded Top Left"/>
					<HstText v-model="state.roundedTopRight"    title="Rounded Top Right"/>
					<HstText v-model="state.roundedBottomLeft"  title="Rounded Bottom Left"/>
					<HstText v-model="state.roundedBottomRight" title="Rounded Bottom Right"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border — per side">
					<HstSelect v-model="state.borderTop"    title="Border Top"    :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderRight"  title="Border Right"  :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderBottom" title="Border Bottom" :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderLeft"   title="Border Left"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Padding — per side">
					<HstText v-model="state.paddingTop"    title="Padding Top"/>
					<HstText v-model="state.paddingRight"  title="Padding Right"/>
					<HstText v-model="state.paddingBottom" title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"   title="Padding Left"/>
					<HstText v-model="state.paddingBlock"  title="Padding Block"/>
					<HstText v-model="state.paddingInline" title="Padding Inline"/>
				</StoryGroup>
				<StoryGroup title="Margin — per side">
					<HstText v-model="state.marginTop"    title="Margin Top"/>
					<HstText v-model="state.marginRight"  title="Margin Right"/>
					<HstText v-model="state.marginBottom" title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"   title="Margin Left"/>
					<HstText v-model="state.marginBlock"  title="Margin Block"/>
					<HstText v-model="state.marginInline" title="Margin Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ tag: 'div', disabled: false })"
		>
			<template #default="{ state }">
				<origam-svg-icon
						:icon="SVG_PATH_HEART"
						:tag="state.tag"
						:disabled="state.disabled"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>


		<Variant title="Prop — icon (multi-path array)">
			<origam-svg-icon :icon="SVG_MULTI_PATHS"/>
		</Variant>

		<Variant title="Prop — icon (multi-path with opacity tuples)">
			<origam-svg-icon :icon="SVG_OPACITY_PATHS"/>
		</Variant>

		<Variant
				title="Prop — size"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ size: 'default' })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-svg-icon :icon="SVG_PATH_HEART" :size="state.size"/>
					<origam-svg-icon :icon="SVG_PATH_HEART" size="x-small"/>
					<origam-svg-icon :icon="SVG_PATH_HEART" size="small"/>
					<origam-svg-icon :icon="SVG_PATH_HEART" size="default"/>
					<origam-svg-icon :icon="SVG_PATH_HEART" size="large"/>
					<origam-svg-icon :icon="SVG_PATH_HEART" size="x-large"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — size (numeric override)">
			<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
				<origam-svg-icon :icon="SVG_PATH_HEART" :size="16"/>
				<origam-svg-icon :icon="SVG_PATH_HEART" :size="24"/>
				<origam-svg-icon :icon="SVG_PATH_HEART" :size="36"/>
				<origam-svg-icon :icon="SVG_PATH_HEART" :size="48"/>
			</div>
		</Variant>
		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IIconComponentProps>({ tag: 'div', size: 'default' })"
		>
			<template #default="{ state }">
				<origam-svg-icon :icon="SVG_PATH_HEART" v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.tag"      title="Tag"      :options="TAG_OPTIONS"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSvgIcon } from '@origam/components'
	import type { IIconComponentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const SVG_MULTI_PATHS = [
		'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
		'M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
	]

	const SVG_OPACITY_PATHS: Array<string | [string, number]> = [
		['M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', 0.3]
	]

	const SVG_PATH_HEART =
		'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
</script>

<docs lang="md" src="@docs/components/Icon/OrigamSvgIcon.md"/>
