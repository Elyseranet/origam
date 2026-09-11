<template>
	<Story
			group="components"
			title="Overlay/OrigamOverlay"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IOverlayProps>>({ scrim: true, transition: true, width: undefined, height: undefined })"
		>
			<template #default="{ state }">
				<div class="story-host">
					<origam-overlay v-model="designOpen" :scrim="state.scrim" :transition="state.transition" :width="state.width" :height="state.height">
						<template #activator="{ props: activator }">
							<origam-btn v-bind="activator" text="Open (design)"/>
						</template>
						<origam-sheet rounded elevation="8" style="padding: 24px;">
							Design variant.
							<origam-btn text="Close" @click="designOpen = false"/>
						</origam-sheet>
					</origam-overlay>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Scrim">
					<HstSelect v-model="state.scrim" title="Scrim" :options="SCRIM_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Transition">
					<HstCheckbox v-model="state.transition" title="Transition"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IOverlayProps>>({
					modelValue: false,
					persistent: false,
					disabled: false,
					contained: false,
					closeOnBack: true,
					noClickAnimation: false,
					disableGlobalStack: false,
					absolute: false,
					eager: false,
					closeOnContentClick: false,
					openOnClick: true,
					openOnHover: false,
					openOnFocus: false,
					openOnContextMenu: false,
					zIndex: 2000,
					locationStrategy: 'static',
					scrollStrategy: 'block',
					location: 'bottom',
					origin: 'auto',
					offset: undefined,
					viewportMargin: 12
				})"
		>
			<template #default="{ state }">
				<div class="story-host story-host--functional">
					<origam-overlay
							v-model="functionalOpen"
							:persistent="state.persistent"
							:disabled="state.disabled"
							:contained="state.contained"
							:close-on-back="state.closeOnBack"
							:no-click-animation="state.noClickAnimation"
							:disable-global-stack="state.disableGlobalStack"
							:absolute="state.absolute"
							:eager="state.eager"
							:close-on-content-click="state.closeOnContentClick"
							:open-on-click="state.openOnClick"
							:open-on-hover="state.openOnHover"
							:open-on-focus="state.openOnFocus"
							:open-on-context-menu="state.openOnContextMenu"
							:z-index="state.zIndex"
							:location-strategy="state.locationStrategy"
							:scroll-strategy="state.scrollStrategy"
							:location="state.location"
							:origin="state.origin"
							:offset="state.offset"
							:viewport-margin="state.viewportMargin"
					>
						<template #activator="{ props: activator }">
							<origam-btn v-bind="activator" text="Open (functional)"/>
						</template>
						<origam-sheet rounded elevation="8" style="padding: 24px;">
							Functional content.
							<origam-btn text="Close" @click="functionalOpen = false"/>
						</origam-sheet>
					</origam-overlay>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"   title="Disabled"/>
					<HstCheckbox v-model="state.persistent" title="Persistent"/>
					<HstCheckbox v-model="state.contained"  title="Contained"/>
					<HstCheckbox v-model="state.absolute"   title="Absolute"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.closeOnBack"        title="Close On Back"/>
					<HstCheckbox v-model="state.noClickAnimation"   title="No Click Animation"/>
					<HstCheckbox v-model="state.disableGlobalStack" title="Disable Global Stack"/>
					<HstCheckbox v-model="state.eager"              title="Eager"/>
					<HstCheckbox v-model="state.closeOnContentClick" title="Close On Content Click"/>
				</StoryGroup>
				<StoryGroup title="Open Triggers">
					<HstCheckbox v-model="state.openOnClick"       title="Open On Click"/>
					<HstCheckbox v-model="state.openOnHover"       title="Open On Hover"/>
					<HstCheckbox v-model="state.openOnFocus"       title="Open On Focus"/>
					<HstCheckbox v-model="state.openOnContextMenu" title="Open On Context Menu"/>
				</StoryGroup>
				<StoryGroup title="Z-Index">
					<HstNumber v-model="state.zIndex" title="Z-Index" :min="0" :step="100"/>
				</StoryGroup>
				<StoryGroup title="Location">
					<HstSelect v-model="state.locationStrategy" title="Location Strategy" :options="LOCATION_STRATEGY_OPTIONS"/>
					<HstSelect v-model="state.scrollStrategy"   title="Scroll Strategy"   :options="SCROLL_STRATEGY_OPTIONS"/>
					<HstSelect v-model="state.location"         title="Location"           :options="ANCHOR_OPTIONS"/>
					<HstSelect v-model="state.origin"           title="Origin"             :options="ORIGIN_OPTIONS"/>
					<HstNumber v-model="state.viewportMargin"   title="Viewport Margin"    :min="0" :step="4"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="story-host">
				<origam-overlay
						v-model="emitUpdateOpen"
						@update:modelValue="logEvent('update:modelValue', $event)"
				>
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open (update:modelValue)"/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						<origam-btn text="Close" @click="emitUpdateOpen = false"/>
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Events - afterEnter">
			<div class="story-host">
				<origam-overlay
						v-model="emitAfterEnterOpen"
						@afterEnter="logEvent('afterEnter', $event)"
				>
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open (afterEnter)"/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						<origam-btn text="Close" @click="emitAfterEnterOpen = false"/>
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Events - afterLeave">
			<div class="story-host">
				<origam-overlay
						v-model="emitAfterLeaveOpen"
						@afterLeave="logEvent('afterLeave', $event)"
				>
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open (afterLeave)"/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						<origam-btn text="Close" @click="emitAfterLeaveOpen = false"/>
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Events - click:outside">
			<div class="story-host">
				<origam-overlay
						v-model="emitClickOutsideOpen"
						@click:outside="logEvent('click:outside', $event)"
				>
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open (click:outside)"/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						Click outside to trigger the emit.
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Events - keydown">
			<div class="story-host">
				<origam-overlay
						v-model="emitKeydownOpen"
						@keydown="logEvent('keydown', $event)"
				>
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open (keydown)"/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						Press any key inside the overlay.
						<origam-btn text="Close" @click="emitKeydownOpen = false"/>
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Slots - Activator">
			<div class="story-host">
				<origam-overlay v-model="slotActivatorOpen">
					<template #activator="{ props: activator, isActive }">
						<origam-btn
								v-bind="activator"
								:color="isActive ? 'success' : 'primary'"
								:text="isActive ? 'Opened' : 'Custom activator slot'"
						/>
					</template>
					<origam-sheet rounded elevation="8" style="padding: 24px;">
						<span>Custom activator slot — the button colour changes when open.</span>
						<origam-btn text="Close" @click="slotActivatorOpen = false"/>
					</origam-sheet>
				</origam-overlay>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-host">
				<origam-overlay v-model="slotDefaultOpen">
					<template #activator="{ props: activator }">
						<origam-btn v-bind="activator" text="Open default slot"/>
					</template>
					<template #default>
						<origam-sheet rounded elevation="8" style="padding: 24px;">
							<strong>Custom default slot</strong> content rendered inside the overlay.
							<origam-btn text="Close" @click="slotDefaultOpen = false"/>
						</origam-sheet>
					</template>
				</origam-overlay>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IOverlayProps>({
					modelValue: false,
					scrim: true,
					persistent: false,
					disabled: false,
					contained: false,
					closeOnBack: true,
					noClickAnimation: false,
					eager: false,
					zIndex: 2000
				})"
		>
			<template #default="{ state }">
				<div class="story-host">
					<origam-overlay
							v-model="playgroundOpen"
							v-bind="state"
							@update:modelValue="logEvent('update:modelValue', $event)"
					>
						<template #activator="{ props: activator }">
							<origam-btn v-bind="activator" text="Open playground"/>
						</template>
						<origam-sheet rounded elevation="8" style="padding: 24px;">
							Playground content.
							<origam-btn text="Close" @click="playgroundOpen = false"/>
						</origam-sheet>
					</origam-overlay>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.scrim" title="Scrim" :options="SCRIM_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.persistent"    title="Persistent"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.contained"     title="Contained"/>
					<HstCheckbox v-model="state.closeOnBack"   title="Close On Back"/>
					<HstCheckbox v-model="state.noClickAnimation" title="No Click Animation"/>
					<HstCheckbox v-model="state.eager"         title="Eager"/>
					<HstNumber   v-model="state.zIndex"        title="Z-Index" :min="0" :step="100"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamOverlay, OrigamSheet } from '@origam/components'
	import type { IOverlayProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const designOpen = ref(false)
	const functionalOpen = ref(false)
	const playgroundOpen = ref(false)
	const slotActivatorOpen = ref(false)
	const slotDefaultOpen = ref(false)
	const emitUpdateOpen = ref(false)
	const emitAfterEnterOpen = ref(false)
	const emitAfterLeaveOpen = ref(false)
	const emitClickOutsideOpen = ref(false)
	const emitKeydownOpen = ref(false)

	const SCRIM_OPTIONS = [
		{ label: 'true (default backdrop)', value: true },
		{ label: 'false (no backdrop)', value: false },
		{ label: 'primary', value: 'primary' },
		{ label: 'rgba red', value: 'rgba(255, 0, 80, .4)' }
	]

	const LOCATION_STRATEGY_OPTIONS = [
		{ label: 'static', value: 'static' },
		{ label: 'connected', value: 'connected' }
	]

	const SCROLL_STRATEGY_OPTIONS = [
		{ label: 'none', value: 'none' },
		{ label: 'close', value: 'close' },
		{ label: 'block', value: 'block' },
		{ label: 'reposition', value: 'reposition' }
	]

	const ANCHOR_OPTIONS = [
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' },
		{ label: 'center', value: 'center' },
		{ label: 'start', value: 'start' },
		{ label: 'end', value: 'end' },
		{ label: 'top start', value: 'top start' },
		{ label: 'top end', value: 'top end' },
		{ label: 'bottom start', value: 'bottom start' },
		{ label: 'bottom end', value: 'bottom end' }
	]

	const ORIGIN_OPTIONS = [
		{ label: 'auto', value: 'auto' },
		{ label: 'overlap', value: 'overlap' },
		{ label: 'top', value: 'top' },
		{ label: 'bottom', value: 'bottom' },
		{ label: 'left', value: 'left' },
		{ label: 'right', value: 'right' },
		{ label: 'center', value: 'center' }
	]
</script>

<style scoped>
	.story-host {
		display: flex;
		gap: 12px;
		padding: 16px;
	}

	.story-host--functional {
		position: relative;
		min-height: 280px;
	}
</style>

<docs lang="md" src="@docs/components/Overlay/OrigamOverlay.md"/>
