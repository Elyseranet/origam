<template>
	<Story
			group="components"
			title="App/OrigamAppBar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IAppBarProps>>({
					title: 'My Application',
					color: undefined,
					bgColor: undefined,
					density: undefined,
					elevation: undefined,
					rounded: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					height: undefined
				})"
		>
			<template #default="{ state }">
				<div class="app-bar-story-wrapper">
					<origam-app :full-height="false">
						<origam-app-bar
								:order="0"
								:title="state.title"
								:color="state.color"
								:bg-color="state.bgColor"
								:density="state.density"
								:elevation="state.elevation"
								:rounded="state.rounded"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:height="state.height"
								data-cy="app-bar-design"
						>
							<template #prepend>
								<origam-btn :icon="menuIcon" aria-label="Navigation menu"/>
							</template>
							<template #append>
								<origam-btn :icon="moreIcon" aria-label="More options"/>
							</template>
						</origam-app-bar>
						<origam-main>
							<p class="app-bar-story-content">Main content</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
				</StoryGroup>
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
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<Partial<IAppBarProps>>({ bgColor: 'primary', title: 'My Application' })"
		>
			<template #default="{ state }">
				<div class="app-bar-story-wrapper">
					<origam-app :full-height="false">
						<origam-app-bar
								:order="0"
								:title="state.title"
								:color="state.color"
								:bg-color="state.bgColor"
								:hover="resolveHoverState(state.hover)"
								:active="resolveActiveState(state.active)"
								scroll-behavior="active"
								scroll-target=".origam-main"
								data-cy="app-bar-state"
						>
							<template #prepend>
								<origam-btn :icon="menuIcon" aria-label="Navigation menu"/>
							</template>
						</origam-app-bar>
						<origam-main style="height: 280px; overflow-y: auto;">
							<p class="app-bar-story-content" style="height: 1200px;">Hover the bar to test <code>hover</code>; scroll this area to engage <code>active</code> (the chosen Active design is applied on scroll).</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
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
				:init-state="() => useStoryInitState<Partial<IAppBarProps>>({
					title: 'My Application',
					collapse: false,
					flat: false,
					modelValue: true,
					scrollHide: false,
					scrollInverted: false,
					scrollCollapse: false,
					scrollElevate: false,
					scrollActive: false,
					scrollThreshold: 300,
					scrollTarget: '.origam-main',
					location: 'top',
					order: 0
				})"
		>
			<template #default="{ state }">
				<div class="app-bar-story-wrapper">
					<origam-app :full-height="false">
						<origam-app-bar
								:order="state.order"
								:title="state.title"
								:collapse="state.collapse"
								:flat="state.flat"
								:model-value="state.modelValue"
								:scroll-behavior="composeScrollBehavior(state)"
								:scroll-threshold="state.scrollThreshold"
								:scroll-target="state.scrollTarget || undefined"
								:location="state.location"
								data-cy="app-bar-functional"
						>
							<template #prepend>
								<origam-btn :icon="menuIcon" aria-label="Navigation menu"/>
							</template>
						</origam-app-bar>
						<origam-main style="height: 280px; overflow-y: auto;">
							<p class="app-bar-story-content" style="height: 1200px;">Scroll this area — with <code>scroll-behavior="active"</code> the bar engages its active state (<code>origam-app-bar--active</code>) once scrolled past the top.</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Modifiers">
					<HstCheckbox v-model="state.collapse"  title="Collapse"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
					<HstCheckbox v-model="state.modelValue" title="Model Value (visible)"/>
				</StoryGroup>
				<StoryGroup title="Scroll behavior (combine freely)">
					<HstCheckbox v-model="state.scrollHide"     title="hide"/>
					<HstCheckbox v-model="state.scrollInverted" title="inverted (modifies hide / collapse / elevate)"/>
					<HstCheckbox v-model="state.scrollCollapse" title="collapse"/>
					<HstCheckbox v-model="state.scrollElevate"  title="elevate"/>
					<HstCheckbox v-model="state.scrollActive"   title="active (paint on scroll)"/>
					<HstNumber   v-model="state.scrollThreshold" title="Scroll Threshold" :min="0" :max="1000" :step="50"/>
					<HstText     v-model="state.scrollTarget"   title="Scroll Target"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.location" title="Location" :options="LOCATION_OPTIONS"/>
					<HstNumber v-model="state.order"    title="Order"    :min="0" :max="10" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar
							:order="0"
							v-model="emitModelValue"
							title="Model Value"
							data-cy="app-bar-emit-update"
							@update:model-value="logEvent('update:modelValue', $event)"
					/>
					<origam-main>
						<p class="app-bar-story-content">modelValue = {{ emitModelValue }}</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Prepend">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" title="App with prepend" data-cy="app-bar-slot-prepend">
						<template #prepend>
							<origam-btn :icon="menuIcon" aria-label="Navigation menu"/>
						</template>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Prepend slot — typically a hamburger icon.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Append">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" title="App with append" data-cy="app-bar-slot-append">
						<template #append>
							<origam-btn :icon="accountIcon" aria-label="Account"/>
							<origam-btn :icon="moreIcon"    aria-label="More options"/>
						</template>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Append slot — typically action icons.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Title">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" data-cy="app-bar-slot-title">
						<template #title>
							<strong>Custom title</strong>
						</template>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Title slot — override the default title rendering.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Content">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" data-cy="app-bar-slot-content">
						<template #content>
							<span>Custom slot content</span>
						</template>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Content slot — full bar content override.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" title="Default slot" data-cy="app-bar-slot-default">
						<span>Extra inline content</span>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Default slot — extra content injected into the bar.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant title="Slots - Img">
			<div class="app-bar-story-wrapper">
				<origam-app :full-height="false">
					<origam-app-bar :order="0" title="Image bar" data-cy="app-bar-slot-img">
						<template #img>
							<div class="app-bar-story-img-gradient"/>
						</template>
					</origam-app-bar>
					<origam-main>
						<p class="app-bar-story-content">Img slot — background image or gradient behind the bar.</p>
					</origam-main>
				</origam-app>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IAppBarProps>({
					title: 'My Application',
					collapse: false,
					flat: false,
					modelValue: true
				})"
		>
			<template #default="{ state }">
				<div class="app-bar-story-wrapper">
					<origam-app :full-height="false">
						<origam-app-bar
								v-bind="state"
								:order="0"
								data-cy="app-bar-playground"
								@update:model-value="logEvent('update:modelValue', $event)"
						>
							<template #prepend>
								<origam-btn :icon="menuIcon" aria-label="Navigation menu"/>
							</template>
							<template #append>
								<origam-btn :icon="moreIcon" aria-label="More options"/>
							</template>
						</origam-app-bar>
						<origam-main>
							<p class="app-bar-story-content">Main content</p>
						</origam-main>
					</origam-app>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.collapse"   title="Collapse"/>
					<HstCheckbox v-model="state.flat"       title="Flat"/>
					<HstCheckbox v-model="state.modelValue" title="Visible"/>
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

	import { OrigamApp, OrigamAppBar, OrigamBtn, OrigamMain } from '@origam/components'
	import { MDI_ICONS, SCROLL_BEHAVIOR } from '@origam/enums'
	import type { IAppBarProps } from '@origam/interfaces'
	import type { IOptions } from '@origam/interfaces'

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
		ROUNDED_OPTIONS
	} from '@stories/const'

	const menuIcon    = MDI_ICONS.MENU
	const moreIcon    = MDI_ICONS.DOTS_VERTICAL
	const accountIcon = MDI_ICONS.ACCOUNT

	// `scrollBehavior` is a space-separated token list. `inverted` is a MODIFIER
	// (it flips the trigger of hide / collapse / elevate) — it does nothing on
	// its own, which is why the controls are checkboxes that compose here.
	const composeScrollBehavior = (s: Record<string, unknown>): string | undefined => {
		const tokens = [
			s.scrollHide && SCROLL_BEHAVIOR.HIDE,
			s.scrollInverted && SCROLL_BEHAVIOR.INVERTED,
			s.scrollCollapse && SCROLL_BEHAVIOR.COLLAPSE,
			s.scrollElevate && SCROLL_BEHAVIOR.ELEVATED,
			s.scrollActive && SCROLL_BEHAVIOR.ACTIVE
		].filter(Boolean)

		return tokens.length ? tokens.join(' ') : undefined
	}

	const LOCATION_OPTIONS: Array<IOptions<'top' | 'bottom'>> = [
		{ label: 'top',    value: 'top' },
		{ label: 'bottom', value: 'bottom' }
	]

	const emitModelValue = ref(true)
</script>

<style scoped>
	.app-bar-story-wrapper {
		height: 360px;
		border: 1px solid var(--origam-color__border---subtle, #ccc);
	}

	.app-bar-story-content {
		padding: 12px;
		margin: 0;
	}

	.app-bar-story-img-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--origam-color__action--primary---bg, #1976d2) 0%, var(--origam-color__action--secondary---bg, #9c27b0) 100%);
	}
</style>

<docs lang="md" src="@docs/components/App/OrigamAppBar.md"/>
