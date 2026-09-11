<template>
	<Story
			group="components"
			title="Transition/OrigamTranslateScale"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITranslateScaleProps>>({
					name: 'origam-transition--transform-scale',
					origin: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-design" @click="toggleDesign = !toggleDesign">Toggle</button>
					<origam-translate-scale :name="state.name" :origin="state.origin">
						<div v-if="toggleDesign" class="story-target" data-cy="target-design">Animate me</div>
					</origam-translate-scale>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstText v-model="state.name"   title="Name (CSS class)"/>
					<HstText v-model="state.origin" title="Origin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITranslateScaleProps>>({
					disabled: false,
					mode: 'in-out',
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-functional" @click="toggleFunctional = !toggleFunctional">Toggle</button>
					<origam-translate-scale
							:disabled="state.disabled"
							:mode="state.mode"
							:group="state.group"
							:hide-on-leave="state.hideOnLeave"
							:leave-absolute="state.leaveAbsolute"
					>
						<div v-if="toggleFunctional" class="story-target" data-cy="target-functional">Functional</div>
					</origam-translate-scale>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstSelect   v-model="state.mode"          title="Mode"           :options="TRANSITION_MODE_OPTIONS"/>
					<HstCheckbox v-model="state.group"         title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button class="story-toggle" data-cy="toggle-slot-default" @click="toggleSlotDefault = !toggleSlotDefault">Toggle</button>
				<origam-translate-scale>
					<div v-if="toggleSlotDefault" class="story-target" data-cy="target-slot-default">
						<strong>Custom</strong> slot content
					</div>
				</origam-translate-scale>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITranslateScaleProps>({
					name: 'origam-transition--transform-scale',
					mode: 'in-out',
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-playground" @click="togglePlayground = !togglePlayground">Toggle</button>
					<origam-translate-scale v-bind="state">
						<div v-if="togglePlayground" class="story-target" data-cy="target-playground">Playground</div>
					</origam-translate-scale>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstText v-model="state.name"   title="Name (CSS class)"/>
					<HstText v-model="state.origin" title="Origin"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect   v-model="state.mode"          title="Mode"           :options="TRANSITION_MODE_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.group"         title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
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

	import { OrigamTranslateScale } from '@origam/components'
	import { TRANSITION_MODE } from '@origam/enums'
	import type { ITranslateScaleProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const toggleDesign    = ref(false)
	const toggleFunctional = ref(false)
	const toggleSlotDefault = ref(false)
	const togglePlayground  = ref(false)

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'in-out',  value: TRANSITION_MODE.IN_OUT },
		{ label: 'out-in',  value: TRANSITION_MODE.OUT_IN },
		{ label: 'default', value: TRANSITION_MODE.DEFAULT }
	]
</script>

<style scoped>
	.story-shell  { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
	.story-toggle { appearance: none; border: 1px solid currentColor; background: transparent; color: inherit; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; }
	.story-target { padding: 12px 16px; border-radius: 6px; background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06)); border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)); }
</style>

<docs lang="md" src="@docs/components/Transition/OrigamTranslateScale.md"/>
