<template>
	<Story
			group="components"
			title="Icon/OrigamClassIcon"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_HOME })"
		>
			<template #default="{ state }">
				<origam-class-icon
						:icon="state.icon"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:border-top="state.borderTop"
						:border-right="state.borderRight"
						:border-bottom="state.borderBottom"
						:border-left="state.borderLeft"
						:rounded="state.rounded"
						:rounded-top-left="state.roundedTopLeft"
						:rounded-top-right="state.roundedTopRight"
						:rounded-bottom-left="state.roundedBottomLeft"
						:rounded-bottom-right="state.roundedBottomRight"
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
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon" title="Icon" :options="ICON_CLASS_OPTIONS"/>
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
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_HOME })"
		>
			<template #default="{ state }">
				<origam-class-icon
						:icon="state.icon"
						:disabled="state.disabled"
						:tag="state.tag"
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


		<Variant
				title="Prop — icon (class string)"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_HOME })"
		>
			<template #default="{ state }">
				<origam-class-icon :icon="state.icon"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Icon">
					<HstSelect v-model="state.icon" title="Icon" :options="ICON_CLASS_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Prop — size"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_HOME, size: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
					<origam-class-icon :icon="MDI_HOME" :size="state.size"/>
					<origam-class-icon :icon="MDI_HOME" size="x-small"/>
					<origam-class-icon :icon="MDI_HOME" size="small"/>
					<origam-class-icon :icon="MDI_HOME" size="default"/>
					<origam-class-icon :icon="MDI_HOME" size="large"/>
					<origam-class-icon :icon="MDI_HOME" size="x-large"/>
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
				<origam-class-icon :icon="MDI_HOME" :size="16"/>
				<origam-class-icon :icon="MDI_HOME" :size="24"/>
				<origam-class-icon :icon="MDI_HOME" :size="36"/>
				<origam-class-icon :icon="MDI_HOME" :size="48"/>
			</div>
		</Variant>
		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IIconComponentProps>({ icon: MDI_HOME })"
		>
			<template #default="{ state }">
				<origam-class-icon v-bind="state"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.icon" title="Icon" :options="ICON_CLASS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"     :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded" title="Rounded"  :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstSelect   v-model="state.tag"      title="Tag"     :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamClassIcon } from '@origam/components'
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

	const MDI_HOME = 'mdi mdi-home'

	const ICON_CLASS_OPTIONS = [
		{ label: '(none)',   value: undefined              },
		{ label: 'Home',     value: 'mdi mdi-home'         },
		{ label: 'Heart',    value: 'mdi mdi-heart'        },
		{ label: 'Star',     value: 'mdi mdi-star'         },
		{ label: 'Cog',      value: 'mdi mdi-cog'          },
		{ label: 'Bell',     value: 'mdi mdi-bell'         },
		{ label: 'Account',  value: 'mdi mdi-account'      },
		{ label: 'Close',    value: 'mdi mdi-close'        },
		{ label: 'Check',    value: 'mdi mdi-check'        },
		{ label: 'Alert',    value: 'mdi mdi-alert'        },
		{ label: 'Menu',     value: 'mdi mdi-menu'         },
	]
</script>

<docs lang="md" src="@docs/components/Icon/OrigamClassIcon.md"/>
