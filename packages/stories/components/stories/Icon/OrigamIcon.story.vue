<template>
	<Story
			group="components"
			title="Icon/OrigamIcon"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: MDI_ICONS.HOME })"
		>
			<template #default="{ state }">
				<origam-icon
						:icon="state.icon"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:rounded="state.rounded"
						:width="state.width"
						:height="state.height"
						:padding="state.padding"
						:margin="state.margin"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon" title="Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: MDI_ICONS.HOME })"
		>
			<template #default="{ state }">
				<origam-icon
						:icon="state.icon"
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

		<Variant title="Events - click">
			<origam-icon
					:icon="MDI_ICONS.CLOSE"
					aria-label="Close"
					@click="logEvent('click', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-icon>mdi-heart</origam-icon>
		</Variant>

				<Variant
				title="Prop — size"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: MDI_ICONS.HOME, size: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-icon :icon="MDI_ICONS.HOME" :size="state.size"/>
					<origam-icon :icon="MDI_ICONS.HOME" size="x-small"/>
					<origam-icon :icon="MDI_ICONS.HOME" size="small"/>
					<origam-icon :icon="MDI_ICONS.HOME" size="default"/>
					<origam-icon :icon="MDI_ICONS.HOME" size="large"/>
					<origam-icon :icon="MDI_ICONS.HOME" size="x-large"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size" title="Size" :options="SIZE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — color & bgColor"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: MDI_ICONS.HOME, color: undefined, bgColor: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-icon :icon="MDI_ICONS.HOME" :color="state.color" :bg-color="state.bgColor"/>
					<origam-icon :icon="MDI_ICONS.HOME" color="primary"/>
					<origam-icon :icon="MDI_ICONS.HOME" color="success"/>
					<origam-icon :icon="MDI_ICONS.HOME" color="danger"/>
					<origam-icon :icon="MDI_ICONS.HOME" color="warning"/>
					<origam-icon :icon="MDI_ICONS.HOME" color="info"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Emit — click (button mode)">
			<origam-icon
					:icon="MDI_ICONS.CLOSE"
					aria-label="Close"
					@click="logEvent('click', $event)"
			/>
		</Variant>

		<Variant title="Prop — icon (SVG path dispatch)">
			<origam-icon :icon="ICON_SVG_PATH_STAR"/>
		</Variant>


		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_ICONS.HOME })"
		>
			<template #default="{ state }">
				<origam-icon v-bind="state" @click="logEvent('click', $event)"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.icon" title="Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"  title="Border"   :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstSelect   v-model="state.tag"      title="Tag" :options="TAG_OPTIONS"/>
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

	import { OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IIconComponentProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const ICON_SVG_PATH_STAR = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
</script>

<docs lang="md" src="@docs/components/Icon/OrigamIcon.md"/>
