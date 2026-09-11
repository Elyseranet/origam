<template>
	<Story
			group="components"
			title="Main/OrigamMain"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IMainProps>>({ tag: 'main', padding: undefined, margin: undefined })"
		>
			<template #default="{ state }">
				<origam-layout style="height: 280px; border: 1px dashed var(--origam-color__border---default, #ccc);">
					<origam-main
							:color="state.color"
							:bg-color="state.bgColor"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:width="state.width"
							:height="state.height"
							:max-width="state.maxWidth"
							:max-height="state.maxHeight"
							:min-width="state.minWidth"
							:min-height="state.minHeight"
							:padding="state.padding"
							:margin="state.margin"
							:tag="state.tag"
					>
						<div class="demo-content">Main content</div>
					</origam-main>
				</origam-layout>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
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
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxWidth"  title="Max Width"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
					<HstText v-model="state.minWidth"  title="Min Width"/>
					<HstText v-model="state.minHeight" title="Min Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="MAIN_TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IMainProps>>({ tag: 'main', scrollable: false })"
		>
			<template #default="{ state }">
				<origam-layout style="height: 280px; border: 1px dashed var(--origam-color__border---default, #ccc);">
					<origam-main
							:scrollable="state.scrollable"
							:tag="state.tag"
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
					>
						<div class="demo-content">
							<p v-for="n in 20" :key="n">Long content line {{ n }}</p>
						</div>
					</origam-main>
				</origam-layout>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.scrollable" title="Scrollable"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="MAIN_TAG_OPTIONS"/>
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
				<StoryGroup title="Margin">
					<HstText v-model="state.margin"        title="Margin"/>
					<HstText v-model="state.marginTop"     title="Margin Top"/>
					<HstText v-model="state.marginBottom"  title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"    title="Margin Left"/>
					<HstText v-model="state.marginRight"   title="Margin Right"/>
					<HstText v-model="state.marginBlock"   title="Margin Block"/>
					<HstText v-model="state.marginInline"  title="Margin Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-layout style="height: 220px;">
				<origam-main>
					<div class="demo-content">
						<strong>Custom slot content</strong>
						<p>Anything goes — pages, panels, grid layouts…</p>
					</div>
				</origam-main>
			</origam-layout>
		</Variant>

				<Variant title="Prop — default layout">
			<origam-layout style="height: 280px; border: 1px dashed var(--origam-color__border---default, #ccc);">
				<origam-main>
					<div class="demo-content">
						<strong>Default layout — main element</strong>
						<p>The root element is a &lt;main&gt; and always renders a .origam-main__wrapper child.</p>
					</div>
				</origam-main>
			</origam-layout>
		</Variant>


		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IMainProps>({ tag: 'main', scrollable: false })"
		>
			<template #default="{ state }">
				<origam-layout style="height: 280px; border: 1px dashed var(--origam-color__border---default, #ccc);">
					<origam-main v-bind="state">
						<div class="demo-content">
							<p v-for="n in 20" :key="n">Line {{ n }}</p>
						</div>
					</origam-main>
				</origam-layout>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.scrollable" title="Scrollable"/>
					<HstSelect   v-model="state.tag"        title="Tag" :options="MAIN_TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamLayout, OrigamMain } from '@origam/components'
	import type { IMainProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const MAIN_TAG_OPTIONS: Array<IOptions<string>> = [
		{ label: 'main (default)', value: 'main' },
		{ label: 'section', value: 'section' },
		{ label: 'article', value: 'article' },
		{ label: 'div', value: 'div' }
	]
</script>

<style scoped>
	.demo-content {
		padding: 12px;
		background: var(--origam-color__surface---default, #fff);
	}
</style>

<docs lang="md" src="@docs/components/Main/OrigamMain.md"/>
