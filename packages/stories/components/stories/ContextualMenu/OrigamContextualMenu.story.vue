<template>
	<Story
			group="components"
			title="ContextualMenu/OrigamContextualMenu"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IContextualMenuProps>>({ })"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
					<div
							style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
					>
						Right-click to open menu
					</div>
					<origam-contextual-menu
							:color="state.color"
							:bg-color="state.bgColor"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:width="state.width"
							:height="state.height"
							:padding="state.padding"
							:margin="state.margin"
							:items="defaultItems"
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
				:init-state="() => useStoryInitState<Partial<IContextualMenuProps>>({
					closeOnContentClick: true,
					openOnContextMenu: true,
					openOnClick: false,
					openOnHover: false,
					openOnFocus: false,
					persistent: false,
					closeOnBack: true,
					disabled: false,
					eager: false,
					scrim: false,
					openDelay: 300,
					closeDelay: 250
				})"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
					<div
							style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
					>
						Right-click (or interact per controls)
					</div>
					<origam-contextual-menu
							:title="state.title || undefined"
							:items="defaultItems"
							:close-on-content-click="state.closeOnContentClick"
							:open-on-context-menu="state.openOnContextMenu"
							:open-on-click="state.openOnClick"
							:open-on-hover="state.openOnHover"
							:open-on-focus="state.openOnFocus"
							:persistent="state.persistent"
							:close-on-back="state.closeOnBack"
							:disabled="state.disabled"
							:eager="state.eager"
							:scrim="state.scrim"
							:open-delay="state.openDelay"
							:close-delay="state.closeDelay"
							:location="state.location || undefined"
							:location-strategy="state.locationStrategy || undefined"
							:scroll-strategy="state.scrollStrategy || undefined"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title (header)"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.persistent" title="Persistent"/>
					<HstCheckbox v-model="state.scrim"     title="Scrim"/>
					<HstCheckbox v-model="state.eager"     title="Eager"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstCheckbox v-model="state.closeOnContentClick" title="Close on content click"/>
					<HstCheckbox v-model="state.closeOnBack"        title="Close on back"/>
					<HstCheckbox v-model="state.openOnContextMenu"  title="Open on context menu"/>
					<HstCheckbox v-model="state.openOnClick"        title="Open on click"/>
					<HstCheckbox v-model="state.openOnHover"        title="Open on hover"/>
					<HstCheckbox v-model="state.openOnFocus"        title="Open on focus"/>
				</StoryGroup>
				<StoryGroup title="Timing">
					<HstNumber v-model="state.openDelay"  title="Open delay (ms)"  :min="0" :max="2000" :step="50"/>
					<HstNumber v-model="state.closeDelay" title="Close delay (ms)" :min="0" :max="2000" :step="50"/>
				</StoryGroup>
				<StoryGroup title="Positioning">
					<HstSelect v-model="state.location"         title="Location"          :options="LOCATION_OPTIONS"/>
					<HstSelect v-model="state.locationStrategy" title="Location Strategy" :options="LOCATION_STRATEGY_OPTIONS"/>
					<HstSelect v-model="state.scrollStrategy"   title="Scroll Strategy"   :options="SCROLL_STRATEGY_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — items (right-click a zone)">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
						data-cy="contextual-menu-default-zone"
				>
					Right-click to open menu
				</div>
				<origam-contextual-menu :items="defaultItems"/>
			</div>
		</Variant>

		<Variant title="Prop — title">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
						data-cy="contextual-menu-title-zone"
				>
					Right-click to open menu with title
				</div>
				<origam-contextual-menu :items="defaultItems" title="Actions"/>
			</div>
		</Variant>

		<Variant title="Prop — items with icons">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
						data-cy="contextual-menu-icons-zone"
				>
					Right-click to see icon items
				</div>
				<origam-contextual-menu :items="richItems"/>
			</div>
		</Variant>

		<Variant title="Slot — default (custom content)">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
						data-cy="contextual-menu-slot-zone"
				>
					Right-click for custom slot content
				</div>
				<origam-contextual-menu>
					<template #default>
						<div style="padding: 8px 16px; min-width: 180px;">
							<p style="margin: 0; font-weight: 700;">Custom menu</p>
							<p style="margin: 4px 0 0; font-size: 0.875rem;">Slot content here.</p>
						</div>
					</template>
				</origam-contextual-menu>
			</div>
		</Variant>

		<Variant title="Emit — update:modelValue">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
						data-cy="contextual-menu-emit-zone"
				>
					Right-click to open/close
				</div>
				<origam-contextual-menu
						:items="defaultItems"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
				>
					Right-click to open/close
				</div>
				<origam-contextual-menu
						:items="defaultItems"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - contextmenu">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
				>
					Right-click to trigger contextmenu event
				</div>
				<origam-contextual-menu
						:items="defaultItems"
						@contextmenu="logEvent('contextmenu', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<div
						style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
				>
					Right-click for custom content
				</div>
				<origam-contextual-menu>
					<template #default>
						<div style="padding: 8px 16px; min-width: 180px;">
							<p style="margin: 0; font-weight: 700;">Custom menu</p>
							<p style="margin: 4px 0 0; font-size: 0.875rem;">Any content goes here.</p>
						</div>
					</template>
				</origam-contextual-menu>
			</div>
		</Variant>

		<Variant title="Slots - Activator">
			<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
				<origam-contextual-menu
						:items="richItems"
						:open-on-context-menu="false"
						open-on-click
				>
					<template #activator="{ props: activatorProps }">
						<button v-bind="activatorProps" style="padding: 8px 20px; border-radius: 6px; border: 1px solid currentColor; cursor: pointer;">
							Click me (custom activator)
						</button>
					</template>
				</origam-contextual-menu>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IContextualMenuProps>>({
					closeOnContentClick: true,
					openOnContextMenu: true,
					openOnClick: false
				})"
		>
			<template #default="{ state }">
				<div style="padding: 48px; display: flex; align-items: center; justify-content: center;">
					<div
							style="padding: 40px; border: 2px dashed var(--origam-color__border---subtle, #ccc); text-align: center; border-radius: 8px; cursor: context-menu;"
							data-cy="contextual-menu-playground-zone"
					>
						Right-click to open menu
					</div>
					<origam-contextual-menu
							v-bind="state"
							:items="defaultItems"
							@update:model-value="logEvent('update:modelValue', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title (header)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"            title="Disabled"/>
					<HstCheckbox v-model="state.persistent"          title="Persistent"/>
					<HstCheckbox v-model="state.closeOnContentClick" title="Close on content click"/>
					<HstCheckbox v-model="state.openOnContextMenu"   title="Open on context menu"/>
					<HstCheckbox v-model="state.openOnClick"         title="Open on click"/>
					<HstCheckbox v-model="state.openOnHover"         title="Open on hover"/>
					<HstCheckbox v-model="state.scrim"               title="Scrim"/>
					<HstCheckbox v-model="state.eager"               title="Eager"/>
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

	import { OrigamContextualMenu } from '@origam/components'
	import { BLOCK, INLINE, LOCATION_STRATEGIES, SCROLL_STRATEGIES } from '@origam/enums'
	import type { IContextualMenuProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const defaultItems = [
		{ title: 'Copy' },
		{ title: 'Paste' },
		{ title: 'Select all' }
	]

	const richItems = [
		{ title: 'Edit', prependIcon: 'mdi-pencil' },
		{ title: 'Duplicate', prependIcon: 'mdi-content-copy' },
		{ title: 'Delete', prependIcon: 'mdi-delete' }
	]

	const LOCATION_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: 'top', value: BLOCK.TOP },
		{ label: 'bottom', value: BLOCK.BOTTOM },
		{ label: 'left', value: INLINE.LEFT },
		{ label: 'right', value: INLINE.RIGHT },
		{ label: 'center', value: 'center' },
		{ label: 'top left', value: 'top left' },
		{ label: 'top right', value: 'top right' },
		{ label: 'bottom left', value: 'bottom left' },
		{ label: 'bottom right', value: 'bottom right' }
	]

	const LOCATION_STRATEGY_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: 'connected', value: LOCATION_STRATEGIES.CONNECTED },
		{ label: 'static', value: LOCATION_STRATEGIES.STATIC }
	]

	const SCROLL_STRATEGY_OPTIONS = [
		{ label: '(default)', value: undefined },
		{ label: 'none', value: SCROLL_STRATEGIES.NONE },
		{ label: 'close', value: SCROLL_STRATEGIES.CLOSE },
		{ label: 'block', value: SCROLL_STRATEGIES.BLOCK },
		{ label: 'reposition', value: SCROLL_STRATEGIES.REPOSITION }
	]
</script>

<docs lang="md" src="@docs/components/ContextualMenu/OrigamContextualMenu.md"/>
