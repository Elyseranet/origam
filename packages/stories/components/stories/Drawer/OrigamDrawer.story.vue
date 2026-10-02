<template>
	<Story
			group="components"
			title="Drawer/OrigamDrawer"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDrawerProps>>({
					color: undefined,
					bgColor: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					density: undefined
				})"
		>
			<template #default="{ state }">
				<div style="height: 320px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
					<origam-app :full-height="false">
						<origam-drawer
								permanent
								:color="state.color"
								:padding="state.padding"
								:margin="state.margin"
								:bg-color="state.bgColor"
								:elevation="state.elevation"
								:rounded="state.rounded"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:density="state.density"
						>
							<div style="padding: 16px;">Drawer content</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Main content</p>
						</origam-main>
					</origam-app>
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IDrawerProps>>({ bgColor: undefined })"
		>
			<template #default="{ state }">
				<div style="height: 320px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
					<origam-app :full-height="false">
						<origam-drawer
								permanent
								:bg-color="state.bgColor"
								:hover="resolveHoverState(state.hover)"
								:active="resolveActiveState(state.active)"
						>
							<div style="padding: 16px;">Drawer content</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Main content</p>
						</origam-main>
					</origam-app>
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
				:init-state="() => useStoryInitState<Partial<IDrawerProps> & { open: boolean }>({
					open: true,
					permanent: true,
					temporary: false,
					rail: false,
					railWidth: 56,
					floating: false,
					scrim: true,
					expandOnHover: false,
					touchless: false,
					sticky: false,
					disableResizeWatcher: false,
					disableRouteWatcher: false,
					width: 256,
					location: 'left',
					push: null,
					clipped: null,
					attach: null,
					tag: undefined
				})"
		>
			<template #default="{ state }">
				<div style="height: 360px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
					<origam-app :full-height="false">
						<origam-app-bar title="My App">
							<template #prepend>
								<origam-btn
										:icon="MDI_ICONS.MENU"
										aria-label="Toggle"
										@click="state.open = !state.open"
								/>
							</template>
						</origam-app-bar>
						<origam-drawer
								:model-value="state.open"
								:permanent="state.permanent"
								:temporary="state.temporary"
								:rail="state.rail"
								:rail-width="state.railWidth"
								:floating="state.floating"
								:scrim="state.scrim"
								:expand-on-hover="state.expandOnHover"
								:touchless="state.touchless"
								:sticky="state.sticky"
								:disable-resize-watcher="state.disableResizeWatcher"
								:disable-route-watcher="state.disableRouteWatcher"
								:width="state.width"
								:location="state.location"
								:push="state.push"
								:clipped="state.clipped"
								:attach="state.attach"
								:tag="state.tag"
								@update:model-value="(v: boolean) => state.open = v"
						>
							<div style="padding: 16px;">Drawer content</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Main content</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Mode">
					<HstCheckbox v-model="state.permanent" title="Permanent"/>
					<HstCheckbox v-model="state.temporary" title="Temporary"/>
					<HstCheckbox v-model="state.open"      title="Open (modelValue)"/>
				</StoryGroup>
				<StoryGroup title="Rail">
					<HstCheckbox v-model="state.rail"      title="Rail"/>
					<HstNumber   v-model="state.railWidth" title="Rail Width" :min="40" :max="120" :step="4"/>
					<HstCheckbox v-model="state.expandOnHover" title="Expand on Hover"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstNumber v-model="state.width" title="Width" :min="64" :max="480"/>
					<HstSelect
							v-model="state.location"
							title="Location"
							:options="DRAWER_LOCATION_OPTIONS"
					/>
					<HstSelect
							v-model="state.push"
							title="Push"
							:options="DRAWER_PUSH_OPTIONS"
					/>
					<HstSelect
							v-model="state.clipped"
							title="Clipped"
							:options="DRAWER_CLIPPED_OPTIONS"
					/>
					<HstSelect
							v-model="state.attach"
							title="Attach"
							:options="DRAWER_ATTACH_OPTIONS"
					/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.floating"             title="Floating"/>
					<HstCheckbox v-model="state.scrim"                title="Scrim"/>
					<HstCheckbox v-model="state.touchless"            title="Touchless"/>
					<HstCheckbox v-model="state.sticky"               title="Sticky"/>
					<HstCheckbox v-model="state.disableResizeWatcher" title="Disable Resize Watcher"/>
					<HstCheckbox v-model="state.disableRouteWatcher"  title="Disable Route Watcher"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Events - update:modelValue"
				:init-state="() => useStoryInitState<{ open: boolean }>({ open: false })"
		>
			<template #default="{ state }">
				<div style="height: 320px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
					<origam-app :full-height="false">
						<origam-app-bar title="Watch update:modelValue">
							<template #prepend>
								<origam-btn
										:icon="MDI_ICONS.MENU"
										aria-label="Toggle"
										@click="state.open = !state.open"
								/>
							</template>
						</origam-app-bar>
						<origam-drawer
								:model-value="state.open"
								temporary
								@update:model-value="(v: boolean) => { state.open = v; logEvent('update:modelValue', v) }"
						>
							<div style="padding: 16px;">
								<p>Drawer open.</p>
								<origam-btn text="Close" @click="state.open = false"/>
							</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Click the menu icon to toggle the drawer and watch the event log.</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
		</Variant>

		<Variant
				title="Events - update:rail"
				:init-state="() => useStoryInitState<{ rail: boolean }>({ rail: true })"
		>
			<template #default="{ state }">
				<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
					<origam-app :full-height="false">
						<origam-drawer
								:rail="state.rail"
								permanent
								expand-on-hover
								@update:rail="(v: boolean) => { state.rail = v; logEvent('update:rail', v) }"
						>
							<div style="padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
								<origam-btn :icon="MDI_ICONS.HOME"    aria-label="Home"/>
								<origam-btn :icon="MDI_ICONS.ACCOUNT" aria-label="Account"/>
							</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Hover the drawer (expand-on-hover) to trigger update:rail.</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
				<origam-app :full-height="false">
					<origam-drawer permanent>
						<div style="padding: 16px; display: flex; flex-direction: column; gap: 6px;">
							<span>Inbox</span>
							<span>Sent</span>
							<span>Drafts</span>
							<span>Archive</span>
						</div>
					</origam-drawer>
					<origam-main>
						<p style="padding: 16px;">Default slot — drawer body content.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Prepend">
			<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
				<origam-app :full-height="false">
					<origam-drawer permanent>
						<template #prepend>
							<div style="padding: 16px; font-weight: 700; border-bottom: 1px solid var(--origam-color__border---subtle, #ddd); display: flex; align-items: center; gap: 8px;">
								<span>App Logo</span>
							</div>
						</template>
						<div style="padding: 16px;">Body content (after prepend slot).</div>
					</origam-drawer>
					<origam-main>
						<p style="padding: 16px;">Prepend slot — typically used for a logo or brand header.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Append">
			<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
				<origam-app :full-height="false">
					<origam-drawer permanent>
						<div style="padding: 16px;">Default content.</div>
						<template #append>
							<div style="padding: 16px; border-top: 1px solid var(--origam-color__border---subtle, #ddd); font-size: 0.75rem; color: var(--origam-color__text---secondary);">
								v1.0.0
							</div>
						</template>
					</origam-drawer>
					<origam-main>
						<p style="padding: 16px;">Append slot — typically used for version info, sign-out, etc.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Wrapper">
			<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc);">
				<origam-app :full-height="false">
					<origam-drawer permanent>
						<template #wrapper>
							<div style="padding: 24px; background: var(--origam-color__action--primary---bgSubtle, #f5f3ff); height: 100%;">
								<p style="font-weight: 700;">Custom wrapper</p>
								<p style="font-size: 0.875rem;">Replaces the drawer's default __prepend / __content / __append flex skeleton.</p>
							</div>
						</template>
					</origam-drawer>
					<origam-main>
						<p style="padding: 16px;">Wrapper slot — full control over the drawer's inner layout.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Prop - attach">
			<div style="height: 280px; border: 1px solid var(--origam-color__border---subtle, #ccc); display: flex; flex-direction: column; gap: 8px; padding: 8px;">
				<origam-btn
						text="Toggle (attach to local target)"
						@click="attachOpen = !attachOpen"
				/>
				<div
						id="drawer-attach-target"
						class="story-attach-target"
						data-cy="drawer-attach-target"
				>
					local teleport target (#drawer-attach-target) — NOT an OrigamLayout wrapper
				</div>
				<origam-drawer
						:model-value="attachOpen"
						attach="#drawer-attach-target"
						data-cy="drawer-attached"
						permanent
						@update:model-value="(v: boolean) => (attachOpen = v)"
				>
					<div style="padding: 16px;">Teleported into the local target, not document.body.</div>
				</origam-drawer>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDrawerProps> & { open: boolean }>({
					open: true,
					permanent: true,
					temporary: false,
					rail: false,
					railWidth: 56,
					floating: false,
					scrim: true,
					expandOnHover: false,
					width: 256,
					location: 'left',
					push: null,
					clipped: null,
					attach: null,
					color: undefined,
					bgColor: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					density: undefined
				})"
		>
			<template #default="{ state }">
				<div style="height: 360px; border: 1px solid var(--origam-color__border---subtle, #ccc);" data-cy="drawer-playground">
					<origam-app :full-height="false">
						<origam-app-bar title="My App">
							<template #prepend>
								<origam-btn
										:icon="MDI_ICONS.MENU"
										aria-label="Menu"
										@click="state.open = !state.open"
								/>
							</template>
						</origam-app-bar>
						<origam-drawer
								:model-value="state.open"
								:permanent="state.permanent"
								:temporary="state.temporary"
								:rail="state.rail"
								:rail-width="state.railWidth"
								:floating="state.floating"
								:scrim="state.scrim"
								:expand-on-hover="state.expandOnHover"
								:width="state.width"
								:location="state.location"
								:push="state.push"
								:clipped="state.clipped"
								:attach="state.attach"
								:color="state.color"
								:bg-color="state.bgColor"
								:elevation="state.elevation"
								:rounded="state.rounded"
								:border="state.border"
								:density="state.density"
								@update:model-value="(v: boolean) => state.open = v"
								@update:rail="(v: boolean) => logEvent('update:rail', v)"
						>
							<div style="padding: 16px;">Drawer content</div>
						</origam-drawer>
						<origam-main>
							<p style="padding: 16px;">Main content</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstCheckbox v-model="state.open" title="Open (modelValue)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.permanent"     title="Permanent"/>
					<HstCheckbox v-model="state.temporary"     title="Temporary"/>
					<HstCheckbox v-model="state.rail"          title="Rail"/>
					<HstNumber   v-model="state.railWidth"     title="Rail Width" :min="40" :max="120" :step="4"/>
					<HstCheckbox v-model="state.floating"      title="Floating"/>
					<HstCheckbox v-model="state.scrim"         title="Scrim"/>
					<HstCheckbox v-model="state.expandOnHover" title="Expand on Hover"/>
					<HstNumber   v-model="state.width"         title="Width" :min="64" :max="480"/>
					<HstSelect
							v-model="state.location"
							title="Location"
							:options="DRAWER_LOCATION_OPTIONS"
					/>
					<HstSelect
							v-model="state.push"
							title="Push"
							:options="DRAWER_PUSH_OPTIONS"
					/>
					<HstSelect
							v-model="state.clipped"
							title="Clipped"
							:options="DRAWER_CLIPPED_OPTIONS"
					/>
					<HstSelect
							v-model="state.attach"
							title="Attach"
							:options="DRAWER_ATTACH_OPTIONS"
					/>
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
	import { ref } from 'vue'

	import { OrigamApp, OrigamAppBar, OrigamBtn, OrigamDrawer, OrigamMain } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDrawerProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		HOVER_OPTIONS,
		resolveHoverState,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const attachOpen = ref<boolean>(true)

	const DRAWER_LOCATION_OPTIONS = [
		{ label: 'left',   value: 'left' },
		{ label: 'right',  value: 'right' },
		{ label: 'top',    value: 'top' },
		{ label: 'bottom', value: 'bottom' }
	]

	const DRAWER_PUSH_OPTIONS = [
		{ label: 'auto (derived from permanent)', value: null },
		{ label: 'true — drawer pushes content',  value: true },
		{ label: 'false — drawer overlays content', value: false }
	]

	const DRAWER_CLIPPED_OPTIONS = [
		{ label: 'auto (HTML order)',       value: null },
		{ label: 'true — below AppBar',     value: true },
		{ label: 'false — full height',     value: false }
	]

	const DRAWER_ATTACH_OPTIONS = [
		{ label: 'auto (layout wrapper / inline if orphan)', value: null },
		{ label: 'true — render in place (no teleport)',     value: true },
		{ label: 'false — document.body',                    value: false }
	]
</script>

<style scoped>
	.story-attach-target {
		position: relative;
		flex: 1 1 auto;
		min-height: 80px;
		padding: 12px;
		border: 1px dashed var(--origam-color__border---subtle, rgba(0, 0, 0, 0.2));
		border-radius: 8px;
		font: 0.8125rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55));
	}
</style>

<docs lang="md" src="@docs/components/Drawer/OrigamDrawer.md"/>
