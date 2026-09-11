<template>
	<Story
			group="components"
			title="Icon/OrigamLigatureIcon"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: 'home', size: undefined })"
		>
			<template #default="{ state }">
				<origam-ligature-icon
						:icon="state.icon"
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
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon" title="Icon (ligature)" :options="LIGATURE_OPTIONS"/>
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
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: 'home', tag: 'span' })"
		>
			<template #default="{ state }">
				<origam-ligature-icon
						:icon="state.icon"
						:tag="state.tag"
						:disabled="state.disabled"
						:padding="state.padding"
						:margin="state.margin"
						size="large"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>


		<Variant
				title="Prop — icon (ligature name)"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: 'home', size: undefined })"
		>
			<template #default="{ state }">
				<origam-ligature-icon :icon="state.icon" size="large"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon" title="Icon (ligature)" :options="LIGATURE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — size"
				:init-state="() => useStoryInitState<Partial<IIconComponentProps>>({ icon: 'home', size: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-ligature-icon icon="home" :size="state.size"/>
					<origam-ligature-icon icon="home" size="x-small"/>
					<origam-ligature-icon icon="home" size="small"/>
					<origam-ligature-icon icon="home" size="default"/>
					<origam-ligature-icon icon="home" size="large"/>
					<origam-ligature-icon icon="home" size="x-large"/>
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
				<origam-ligature-icon icon="home" :size="16"/>
				<origam-ligature-icon icon="home" :size="24"/>
				<origam-ligature-icon icon="home" :size="36"/>
				<origam-ligature-icon icon="home" :size="48"/>
			</div>
		</Variant>

		<Variant title="Prop — icon (common ligature names showcase)">
			<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
				<origam-ligature-icon icon="home" size="large"/>
				<origam-ligature-icon icon="favorite" size="large"/>
				<origam-ligature-icon icon="settings" size="large"/>
				<origam-ligature-icon icon="search" size="large"/>
				<origam-ligature-icon icon="close" size="large"/>
				<origam-ligature-icon icon="menu" size="large"/>
				<origam-ligature-icon icon="star" size="large"/>
				<origam-ligature-icon icon="add" size="large"/>
			</div>
		</Variant>
		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: 'home', tag: 'span' })"
		>
			<template #default="{ state }">
				<origam-ligature-icon v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.icon" title="Icon (ligature)" :options="LIGATURE_OPTIONS"/>
				</StoryGroup>
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
	import { OrigamLigatureIcon } from '@origam/components'
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

	const LIGATURE_OPTIONS = [
		{ label: 'home',           value: 'home' },
		{ label: 'favorite',       value: 'favorite' },
		{ label: 'settings',       value: 'settings' },
		{ label: 'account_circle', value: 'account_circle' },
		{ label: 'search',         value: 'search' },
		{ label: 'close',          value: 'close' },
		{ label: 'menu',           value: 'menu' },
		{ label: 'delete',         value: 'delete' },
		{ label: 'star',           value: 'star' },
		{ label: 'add',            value: 'add' },
		{ label: 'check',          value: 'check' },
		{ label: 'edit',           value: 'edit' },
		{ label: 'arrow_back',     value: 'arrow_back' },
		{ label: 'arrow_forward',  value: 'arrow_forward' },
		{ label: 'cloud_upload',   value: 'cloud_upload' },
		{ label: 'cloud_download', value: 'cloud_download' },
	]
</script>

<docs lang="md" src="@docs/components/Icon/OrigamLigatureIcon.md"/>
