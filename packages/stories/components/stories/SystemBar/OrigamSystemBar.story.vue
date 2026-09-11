<template>
	<Story
			group="components"
			title="SystemBar/OrigamSystemBar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISystemBarProps>>({
					color: undefined,
					bgColor: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					width: undefined,
					height: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					letterSpacing: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<div class="system-bar-story-wrapper">
					<origam-layout>
						<origam-system-bar
								name="systembar-design"
								order="0"
								:color="state.color"
								:bg-color="state.bgColor"
								:elevation="state.elevation"
								:rounded="state.rounded"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:width="state.width"
								:height="state.height"
								:font-size="state.fontSize"
								:font-weight="state.fontWeight"
								:letter-spacing="state.letterSpacing"
								:line-height="state.lineHeight"
						>
							<span>SystemBar — design preview</span>
						</origam-system-bar>
						<origam-main>
							<p class="system-bar-story-content">Main content</p>
						</origam-main>
					</origam-layout>
				</div>
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
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISystemBarProps>>({
					window: false,
					absolute: false,
					tag: 'div',
					name: 'systembar-functional',
					order: '0'
				})"
		>
			<template #default="{ state }">
				<div class="system-bar-story-wrapper">
					<origam-layout>
						<origam-system-bar
								:window="state.window"
								:absolute="state.absolute"
								:tag="state.tag"
								:name="state.name"
								:order="state.order"
						>
							<span>window={{ state.window }} — absolute={{ state.absolute }} — tag={{ state.tag }}</span>
						</origam-system-bar>
						<origam-main>
							<p class="system-bar-story-content">Main content (pushed by the bar)</p>
						</origam-main>
					</origam-layout>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Window">
					<HstCheckbox v-model="state.window" title="Window (32px height)"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.absolute" title="Absolute"/>
					<HstText     v-model="state.name"     title="Name (layout id)"/>
					<HstText     v-model="state.order"    title="Order"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="system-bar-story-wrapper">
				<origam-layout>
					<origam-system-bar window name="systembar-slot" order="0">
						<strong>App name</strong>
						<span class="system-bar-story-slot-hint">— v1.0.0</span>
					</origam-system-bar>
					<origam-main>
						<p class="system-bar-story-content">Main content</p>
					</origam-main>
				</origam-layout>
			</div>
		</Variant>

				<Variant title="Prop — window">
			<div style="height: 200px; border: 1px dashed var(--origam-color__border---default, #ccc); overflow: hidden;">
				<origam-layout>
					<origam-system-bar name="systembar-window-prop" order="0" :window="true">
						<span>SystemBar — window mode (32px)</span>
					</origam-system-bar>
					<origam-main>
						<p style="padding: 12px;">Main content — bar height is 32px in window mode.</p>
					</origam-main>
				</origam-layout>
			</div>
		</Variant>


		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISystemBarProps>({
					window: false,
					color: undefined,
					bgColor: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					absolute: false,
					tag: 'div',
					name: 'systembar-playground',
					order: '0'
				})"
		>
			<template #default="{ state }">
				<div class="system-bar-story-wrapper">
					<origam-layout>
						<origam-system-bar v-bind="state">
							<span>SystemBar playground</span>
						</origam-system-bar>
						<origam-main>
							<p class="system-bar-story-content">Main content</p>
						</origam-main>
					</origam-layout>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"       title="Color"        :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"     title="Bg Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"   title="Elevation"    :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.window"   title="Window (32px)"/>
					<HstCheckbox v-model="state.absolute" title="Absolute"/>
					<HstSelect   v-model="state.tag"      title="Tag"          :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamLayout, OrigamMain, OrigamSystemBar } from '@origam/components'
	import type { ISystemBarProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<style scoped>
	.system-bar-story-wrapper {
		height: 200px;
		border: 1px dashed var(--origam-color__border---default, #ccc);
		overflow: hidden;
	}

	.system-bar-story-content {
		padding: 12px;
	}

	.system-bar-story-slot-hint {
		opacity: 0.7;
		margin-inline-start: 8px;
	}
</style>

<docs lang="md" src="@docs/components/SystemBar/OrigamSystemBar.md"/>
