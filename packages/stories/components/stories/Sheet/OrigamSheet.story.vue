<template>
	<Story
			group="components"
			title="Sheet/OrigamSheet"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISheetProps>>({
					bgColor: undefined,
					color: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					width: '240',
					height: '120',
					position: undefined
				})"
		>
			<template #default="{ state }">
				<origam-sheet
						:bg-color="state.bgColor"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:elevation="state.elevation"
						:rounded="state.rounded"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
						:position="state.position"
						style="padding: 16px;"
				>
					Sheet content
				</origam-sheet>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
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
				<StoryGroup title="Position">
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
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & { bgColor?: string }>({ bgColor: undefined })"
		>
			<template #default="{ state }">
				<origam-sheet
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						border
						style="padding: 16px;"
				>
					Hover / active state
				</origam-sheet>
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
				:init-state="() => useStoryInitState<Partial<ISheetProps>>({
					tag: 'div',
					side: undefined,
					swipeable: false,
					defaultSnap: 'half',
					open: undefined,
					disabled: false,
					persistent: false
				})"
		>
			<template #default="{ state }">
				<div style="position: relative; height: 320px; background: var(--origam-color__surface---overlay, #f5f5f5); overflow: hidden; border-radius: 8px;">
					<origam-sheet
							:tag="state.tag"
							:side="state.side"
							:swipeable="state.swipeable"
							:default-snap="state.defaultSnap"
							:open="state.open"
							:disabled="state.disabled"
							:persistent="state.persistent"
							elevation="lg"
							style="background: var(--origam-color__surface---default); padding: 16px;"
					>
						Functional sheet — swipeable={{ state.swipeable }}, side={{ state.side ?? '(unset)' }}
					</origam-sheet>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Swipe">
					<HstSelect   v-model="state.side"        title="Side"          :options="SIDE_OPTIONS"/>
					<HstCheckbox v-model="state.swipeable"   title="Swipeable"/>
					<HstSelect   v-model="state.defaultSnap" title="Default Snap"  :options="SNAP_OPTIONS"/>
					<HstCheckbox v-model="state.open"        title="Open"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstCheckbox v-model="state.persistent"  title="Persistent"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:open">
			<div style="position: relative; height: 320px; background: var(--origam-color__surface---overlay, #f5f5f5); overflow: hidden; border-radius: 8px;">
				<origam-sheet
						:swipeable="true"
						side="bottom"
						default-snap="peek"
						elevation="lg"
						style="background: var(--origam-color__surface---default);"
						@update:open="logEvent('update:open', $event)"
				>
					<div style="padding: 16px;">
						<p>Drag to open/close — watch the log</p>
					</div>
				</origam-sheet>
			</div>
		</Variant>

		<Variant title="Events - update:snap">
			<div style="position: relative; height: 320px; background: var(--origam-color__surface---overlay, #f5f5f5); overflow: hidden; border-radius: 8px;">
				<origam-sheet
						:swipeable="true"
						side="bottom"
						default-snap="peek"
						elevation="lg"
						style="background: var(--origam-color__surface---default);"
						@update:snap="logEvent('update:snap', $event)"
				>
					<div style="padding: 16px;">
						<p>Drag to change snap — watch the log</p>
					</div>
				</origam-sheet>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-sheet border rounded style="padding: 16px;">
				<strong>Custom default slot</strong>
				<p>Anything goes inside a sheet.</p>
			</origam-sheet>
		</Variant>

				<Variant title="Prop — elevation">
			<origam-sheet elevation="4" style="padding: 16px; width: 240px;">
				Sheet with elevation=4 — box-shadow is non-none.
			</origam-sheet>
		</Variant>

		<Variant title="Prop — rounded">
			<origam-sheet rounded style="padding: 16px; width: 240px;">
				Sheet with rounded — border-radius is &gt; 0.
			</origam-sheet>
		</Variant>

		<Variant title="Prop — position">
			<div style="position: relative; height: 120px; width: 300px; background: var(--origam-color__surface---overlay, #f5f5f5);">
				<origam-sheet position="absolute" style="padding: 16px;">
					Sheet with position=absolute.
				</origam-sheet>
			</div>
		</Variant>

		<Variant title="Prop — color & bgColor">
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<origam-sheet bg-color="primary" style="padding: 16px; width: 120px;">bgColor=primary</origam-sheet>
				<origam-sheet color="primary" border style="padding: 16px; width: 120px;">color=primary</origam-sheet>
			</div>
		</Variant>


		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISheetProps>({
					tag: 'div',
					bgColor: undefined,
					color: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					position: undefined,
					width: undefined,
					height: undefined,
					swipeable: false,
					side: undefined,
					defaultSnap: 'half',
					disabled: false,
					persistent: false
				})"
		>
			<template #default="{ state }">
				<origam-sheet
						v-bind="state"
						style="padding: 16px;"
						@update:open="logEvent('update:open', $event)"
						@update:snap="logEvent('update:snap', $event)"
				>
					Playground sheet
				</origam-sheet>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.bgColor"    title="Bg Color"   :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.color"      title="Color"      :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.elevation"  title="Elevation"  :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"    title="Rounded"    :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"     title="Border"     :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.position"   title="Position"   :options="POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.tag"         title="Tag"          :options="TAG_OPTIONS"/>
					<HstSelect   v-model="state.side"        title="Side"         :options="SIDE_OPTIONS"/>
					<HstCheckbox v-model="state.swipeable"   title="Swipeable"/>
					<HstSelect   v-model="state.defaultSnap" title="Default Snap" :options="SNAP_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstCheckbox v-model="state.persistent"  title="Persistent"/>
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

	import { OrigamSheet } from '@origam/components'
	import type {
		IActiveProps,
		IHoverProps,
		ISheetProps
	} from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		POSITION_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const SIDE_OPTIONS = [
		{ label: '(none)', value: undefined },
		{ label: 'top',    value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left',   value: 'left' },
		{ label: 'right',  value: 'right' }
	]

	const SNAP_OPTIONS = [
		{ label: 'closed', value: 'closed' },
		{ label: 'peek',   value: 'peek' },
		{ label: 'half',   value: 'half' },
		{ label: 'full',   value: 'full' }
	]
</script>

<docs lang="md" src="@docs/components/Sheet/OrigamSheet.md"/>
