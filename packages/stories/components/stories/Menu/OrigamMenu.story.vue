<template>
	<Story
			group="components"
			title="Menu/OrigamMenu"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IMenuProps>>({ bgColor: undefined, color: undefined })"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; justify-content: center;">
					<origam-menu
							:bg-color="state.bgColor"
							:color="state.color"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:width="state.width"
							:height="state.height"
							:min-width="state.minWidth"
							:max-width="state.maxWidth"
							:location="state.location"
							:origin="state.origin"
							:offset="state.offset ?? 8"
							:items="defaultItems"
					>
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Design preview"/>
						</template>
					</origam-menu>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor"     title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.color"       title="Color"    :options="COLOR_OPTIONS"/>
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
					<HstText v-model="state.width"    title="Width"/>
					<HstText v-model="state.height"   title="Height"/>
					<HstText v-model="state.minWidth" title="Min Width"/>
					<HstText v-model="state.maxWidth" title="Max Width"/>
				</StoryGroup>
				<StoryGroup title="Position">
					<HstSelect v-model="state.location" title="Location" :options="LOCATION_OPTIONS"/>
					<HstSelect v-model="state.origin"   title="Origin"   :options="ORIGIN_OPTIONS"/>
					<HstNumber v-model="state.offset"   title="Offset"   :min="-64" :max="64" :step="4"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IMenuProps>>({
					openOnClick: true,
					openOnHover: false,
					openOnFocus: false,
					openOnContextMenu: false,
					closeOnContentClick: true,
					closeOnBack: true,
					disabled: false,
					persistent: false,
					eager: false,
					nav: false,
					slim: false,
					title: undefined,
					lines: undefined,
					locationStrategy: 'connected',
					scrollStrategy: 'reposition',
					zIndex: undefined
				})"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; justify-content: center;">
					<origam-menu
							:open-on-click="state.openOnClick"
							:open-on-hover="state.openOnHover"
							:open-on-focus="state.openOnFocus"
							:open-on-context-menu="state.openOnContextMenu"
							:close-on-content-click="state.closeOnContentClick"
							:close-on-back="state.closeOnBack"
							:disabled="state.disabled"
							:persistent="state.persistent"
							:eager="state.eager"
							:nav="state.nav"
							:slim="state.slim"
							:title="state.title"
							:lines="state.lines"
							:location-strategy="state.locationStrategy"
							:scroll-strategy="state.scrollStrategy"
							:z-index="state.zIndex"
							:items="defaultItems"
					>
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Functional menu"/>
						</template>
					</origam-menu>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Open / Close">
					<HstCheckbox v-model="state.openOnClick"          title="Open On Click"/>
					<HstCheckbox v-model="state.openOnHover"          title="Open On Hover"/>
					<HstCheckbox v-model="state.openOnFocus"          title="Open On Focus"/>
					<HstCheckbox v-model="state.openOnContextMenu"    title="Open On Context Menu"/>
					<HstCheckbox v-model="state.closeOnContentClick"  title="Close On Content Click"/>
					<HstCheckbox v-model="state.closeOnBack"          title="Close On Back"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"   title="Disabled"/>
					<HstCheckbox v-model="state.persistent" title="Persistent"/>
					<HstCheckbox v-model="state.eager"      title="Eager"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.nav"  title="Nav"/>
					<HstCheckbox v-model="state.slim" title="Slim"/>
					<HstSelect   v-model="state.lines" title="Lines" :options="LINES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
				</StoryGroup>
				<StoryGroup title="Strategy">
					<HstSelect v-model="state.locationStrategy" title="Location Strategy" :options="LOCATION_STRATEGY_OPTIONS"/>
					<HstSelect v-model="state.scrollStrategy"   title="Scroll Strategy"   :options="SCROLL_STRATEGY_OPTIONS"/>
					<HstNumber v-model="state.zIndex"           title="Z-Index"           :min="0" :max="9999" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div style="padding: 48px; display: flex; justify-content: center;">
				<origam-menu
						:items="defaultItems"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Toggle (watch Events)"/>
					</template>
				</origam-menu>
			</div>
		</Variant>

		<Variant title="Events - contextmenu">
			<div style="padding: 48px; display: flex; justify-content: center;">
				<origam-menu
						:items="defaultItems"
						@contextmenu="logEvent('contextmenu', $event)"
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Right-click me"/>
					</template>
				</origam-menu>
			</div>
		</Variant>

		<Variant title="Slots - Activator">
			<div style="padding: 48px; display: flex; justify-content: center;">
				<origam-menu :items="defaultItems">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" bg-color="primary" color="white" text="Custom activator slot"/>
					</template>
				</origam-menu>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 48px; display: flex; justify-content: center;">
				<origam-menu>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Custom content"/>
					</template>
					<ul style="list-style: none; margin: 0; padding: 8px 0; min-width: 160px;">
						<li style="padding: 8px 16px; font-weight: 700;">Custom slot</li>
						<li style="padding: 4px 16px;">Any markup goes here.</li>
					</ul>
				</origam-menu>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IMenuProps>({
					openOnClick: true,
					openOnHover: false,
					closeOnContentClick: true,
					offset: 8
				})"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; justify-content: center;">
					<origam-menu
							v-bind="state"
							:items="defaultItems"
							@update:model-value="logEvent('update:modelValue', $event)"
					>
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Playground"/>
						</template>
					</origam-menu>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.openOnClick"         title="Open On Click"/>
					<HstCheckbox v-model="state.openOnHover"         title="Open On Hover"/>
					<HstCheckbox v-model="state.closeOnContentClick" title="Close On Content Click"/>
					<HstCheckbox v-model="state.disabled"            title="Disabled"/>
					<HstCheckbox v-model="state.persistent"          title="Persistent"/>
					<HstNumber   v-model="state.offset"              title="Offset" :min="-64" :max="64" :step="4"/>
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

	import { OrigamBtn, OrigamMenu } from '@origam/components'
	import type { IMenuProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const defaultItems = [
		{ title: 'Edit', prependIcon: 'mdi-pencil' },
		{ title: 'Duplicate', prependIcon: 'mdi-content-copy' },
		{ title: 'Delete', prependIcon: 'mdi-delete' }
	]

	const LOCATION_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' },
		{ label: 'start', value: 'start' },
		{ label: 'end', value: 'end' },
		{ label: 'center', value: 'center' },
		{ label: 'top start', value: 'top start' },
		{ label: 'top end', value: 'top end' },
		{ label: 'bottom start', value: 'bottom start' },
		{ label: 'bottom end', value: 'bottom end' }
	]

	const ORIGIN_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: 'auto', value: 'auto' },
		{ label: 'overlap', value: 'overlap' },
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' },
		{ label: 'top start', value: 'top start' },
		{ label: 'top end', value: 'top end' },
		{ label: 'bottom start', value: 'bottom start' },
		{ label: 'bottom end', value: 'bottom end' }
	]

	const LOCATION_STRATEGY_OPTIONS = [
		{ label: 'connected (default)', value: 'connected' },
		{ label: 'static', value: 'static' }
	]

	const SCROLL_STRATEGY_OPTIONS = [
		{ label: 'reposition (default)', value: 'reposition' },
		{ label: 'none', value: 'none' },
		{ label: 'close', value: 'close' },
		{ label: 'block', value: 'block' }
	]

	const LINES_OPTIONS = [
		{ label: '(none)', value: undefined },
		{ label: 'one', value: 'one' },
		{ label: 'two', value: 'two' },
		{ label: 'three', value: 'three' }
	]
</script>

<docs lang="md" src="@docs/components/Menu/OrigamMenu.md"/>
