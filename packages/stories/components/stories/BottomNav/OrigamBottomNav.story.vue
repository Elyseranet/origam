<template>
	<Story
			group="components"
			title="BottomNav/OrigamBottomNav"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBottomNavProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<div class="story-bottom-nav-shell">
					<origam-bottom-nav
							:model-value="true"
							:color="state.color"
							:padding="state.padding"
							:margin="state.margin"
							:bg-color="state.bgColor"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:width="state.width"
							:height="state.height"
							:position="state.position"
							:items="navItems"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
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
					<HstText   v-model="state.width"    title="Width"/>
					<HstText   v-model="state.height"   title="Height"/>
					<HstSelect v-model="state.position" title="Position" :options="POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IBottomNavProps>>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<div class="story-bottom-nav-shell">
					<origam-bottom-nav
							:model-value="true"
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
							:items="navItems"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IBottomNavProps> & { visible: boolean }>({ visible: true, grow: false, mode: MODE.VERTICAL })"
		>
			<template #default="{ state }">
				<div class="story-bottom-nav-shell">
					<origam-bottom-nav
							:model-value="state.visible"
							:grow="state.grow"
							:mode="state.mode"
							:disabled="state.disabled"
							:multiple="state.multiple"
							:mandatory="state.mandatory"
							:tag="state.tag"
							:items="navItems"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Visibility">
					<HstCheckbox v-model="state.visible" title="Model Value (visible)"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.grow" title="Grow"/>
					<HstSelect   v-model="state.mode" title="Mode" :options="MODE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Group">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Events - update:modelValue"
				:init-state="() => useStoryInitState<{ visible: boolean }>({ visible: true })"
		>
			<template #default="{ state }">
				<div class="story-bottom-nav-shell">
					<origam-bottom-nav
							:model-value="state.visible"
							:items="navItems"
							@update:model-value="logEvent('update:modelValue', $event)"
					/>
				</div>
			</template>
		</Variant>

		<Variant title="Events - update:active">
			<div class="story-bottom-nav-shell">
				<origam-bottom-nav
						:model-value="true"
						:items="navItems"
						@update:active="logEvent('update:active', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:hover">
			<div class="story-bottom-nav-shell">
				<origam-bottom-nav
						:model-value="true"
						:items="navItems"
						@update:hover="logEvent('update:hover', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-bottom-nav-shell">
				<origam-bottom-nav :model-value="true">
					<origam-btn :prepend-icon="MDI_ICONS.HOME"    text="Home"/>
					<origam-btn :prepend-icon="MDI_ICONS.MAGNIFY" text="Search"/>
					<origam-btn :prepend-icon="MDI_ICONS.ACCOUNT" text="Profile"/>
				</origam-bottom-nav>
			</div>
		</Variant>

		<Variant title="Slots - Item">
			<div class="story-bottom-nav-shell">
				<origam-bottom-nav :model-value="true" :items="navItems">
					<template #item="{ props: itemProps, index }">
						<origam-btn
								v-bind="itemProps"
								:prepend-icon="MDI_ICONS.STAR"
								:data-cy="`slot-item-${index}`"
						/>
					</template>
				</origam-bottom-nav>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBottomNavProps>({ bgColor: 'primary', mode: MODE.VERTICAL, grow: false })"
		>
			<template #default="{ state }">
				<div class="story-bottom-nav-shell">
					<origam-bottom-nav
							v-bind="state"
							:model-value="true"
							:items="navItems"
							@update:model-value="logEvent('update:modelValue', $event)"
							@update:active="logEvent('update:active', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.grow"      title="Grow"/>
					<HstSelect   v-model="state.mode"      title="Mode"     :options="MODE_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.multiple"  title="Multiple"/>
					<HstCheckbox v-model="state.mandatory" title="Mandatory"/>
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

	import { OrigamBottomNav, OrigamBtn } from '@origam/components'
	import { BOTTOM_NAV_POSITION, MDI_ICONS, MODE } from '@origam/enums'
	import type { IBottomNavProps, IOptions } from '@origam/interfaces'
	import type { TBottomNavPosition, TNavMode } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		ACTIVE_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveActiveState,
		resolveHoverState,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const MODE_OPTIONS: Array<IOptions<TNavMode>> = [
		{ label: 'vertical',   value: MODE.VERTICAL   },
		{ label: 'horizontal', value: MODE.HORIZONTAL },
		{ label: 'shift',      value: MODE.SHIFT      },
	]

	const POSITION_OPTIONS: Array<IOptions<TBottomNavPosition>> = [
		{ label: 'start',  value: BOTTOM_NAV_POSITION.START  },
		{ label: 'center', value: BOTTOM_NAV_POSITION.CENTER },
		{ label: 'end',    value: BOTTOM_NAV_POSITION.END    },
	]

	const navItems: Array<IBottomNavProps['items'][number]> = [
		{ text: 'Home',    prependIcon: MDI_ICONS.HOME,    value: 'home'    },
		{ text: 'Search',  prependIcon: MDI_ICONS.MAGNIFY, value: 'search'  },
		{ text: 'Profile', prependIcon: MDI_ICONS.ACCOUNT, value: 'profile' },
	]
</script>

<style scoped>
	.story-bottom-nav-shell {
		position: relative;
		width: 100%;
		height: 80px;
		overflow: hidden;
	}
</style>
