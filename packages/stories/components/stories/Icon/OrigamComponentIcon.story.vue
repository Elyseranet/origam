<template>
	<Story
			group="components"
			title="Icon/OrigamComponentIcon"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ size: 'default' })"
		>
			<template #default="{ state }">
				<origam-component-icon
						:icon="StarSvgComponent"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:rounded="state.rounded"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
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
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-component-icon
						:icon="StarSvgComponent"
						:disabled="state.disabled"
						:tag="state.tag"
						:size="state.size"
						:padding="state.padding"
						:margin="state.margin"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-component-icon>
				<svg viewBox="0 0 24 24" style="width:1em;height:1em;fill:currentColor;" aria-hidden="true">
					<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
				</svg>
			</origam-component-icon>
		</Variant>


		<Variant
				title="Prop — size"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ size: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-component-icon :icon="StarSvgComponent" :size="state.size"/>
					<origam-component-icon :icon="StarSvgComponent" size="x-small"/>
					<origam-component-icon :icon="StarSvgComponent" size="small"/>
					<origam-component-icon :icon="StarSvgComponent" size="default"/>
					<origam-component-icon :icon="StarSvgComponent" size="large"/>
					<origam-component-icon :icon="StarSvgComponent" size="x-large"/>
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
				<origam-component-icon :icon="StarSvgComponent" :size="16"/>
				<origam-component-icon :icon="StarSvgComponent" :size="24"/>
				<origam-component-icon :icon="StarSvgComponent" :size="36"/>
				<origam-component-icon :icon="StarSvgComponent" :size="48"/>
			</div>
		</Variant>

		<Variant title="Slot — default (overrides icon prop)">
			<origam-component-icon>
				<svg viewBox="0 0 24 24" style="width:1em;height:1em;fill:currentColor;" aria-hidden="true">
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
				</svg>
			</origam-component-icon>
		</Variant>
		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IIconComponentProps>({ tag: 'div', size: 'default' })"
		>
			<template #default="{ state }">
				<origam-component-icon
						:icon="StarSvgComponent"
						v-bind="state"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
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
	import { defineComponent, h } from 'vue'

	import { OrigamComponentIcon } from '@origam/components'
	import type { IIconComponentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS,
	} from '@stories/const'

	const StarSvgComponent = defineComponent({
		name: 'StarSvgComponent',
		setup () {
			return () => h('svg', {
				viewBox: '0 0 24 24',
				style: 'width:1em;height:1em;fill:currentColor;',
				'aria-hidden': 'true',
			}, [
				h('path', {
					d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
				}),
			])
		},
	})
</script>

<docs lang="md" src="@docs/components/Icon/OrigamComponentIcon.md"/>
