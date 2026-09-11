<template>
	<Story
			group="components"
			title="Transition/OrigamTranslatePicker"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<ITransitionProps>({
					name: 'origam-transition--translate-picker',
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false,
					origin: ''
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-functional" @click="toggleFunctional = !toggleFunctional">Toggle</button>
					<origam-translate-picker
							:name="state.name"
							:disabled="state.disabled"
							:group="state.group"
							:hide-on-leave="state.hideOnLeave"
							:leave-absolute="state.leaveAbsolute"
							:mode="state.mode"
							:origin="state.origin"
					>
						<div v-if="toggleFunctional" class="story-target" data-cy="target-functional">Animated content</div>
					</origam-translate-picker>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Transition">
					<HstText   v-model="state.name"   title="Name"/>
					<HstSelect v-model="state.mode"   title="Mode"   :options="TRANSITION_MODE_OPTIONS"/>
					<HstText   v-model="state.origin" title="Origin"/>
				</StoryGroup>
				<StoryGroup title="Leave Behaviour">
					<HstCheckbox v-model="state.hideOnLeave"    title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute"  title="Leave Absolute"/>
				</StoryGroup>
				<StoryGroup title="Group">
					<HstCheckbox v-model="state.group" title="Group (TransitionGroup)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button class="story-toggle" data-cy="toggle-slot-default" @click="toggleSlotDefault = !toggleSlotDefault">Toggle</button>
				<origam-translate-picker>
					<div v-if="toggleSlotDefault" class="story-target" data-cy="target-slot-default">
						<span>Custom slot content</span>
					</div>
				</origam-translate-picker>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITransitionProps>({
					name: 'origam-transition--translate-picker',
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false,
					origin: ''
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-playground" @click="togglePlayground = !togglePlayground">Toggle</button>
					<origam-translate-picker v-bind="state">
						<div v-if="togglePlayground" class="story-target" data-cy="target-playground">Playground</div>
					</origam-translate-picker>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"       title="Disabled"/>
					<HstCheckbox v-model="state.group"          title="Group (TransitionGroup)"/>
					<HstCheckbox v-model="state.hideOnLeave"    title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute"  title="Leave Absolute"/>
					<HstText     v-model="state.name"           title="Name"/>
					<HstSelect   v-model="state.mode"           title="Mode"   :options="TRANSITION_MODE_OPTIONS"/>
					<HstText     v-model="state.origin"         title="Origin"/>
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

	import { OrigamTranslatePicker } from '@origam/components'
	import { TRANSITION_MODE } from '@origam/enums'
	import type { ITransitionProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const toggleFunctional = ref(false)
	const togglePlayground = ref(false)
	const toggleSlotDefault = ref(false)

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'default', value: TRANSITION_MODE.DEFAULT },
		{ label: 'in-out', value: TRANSITION_MODE.IN_OUT },
		{ label: 'out-in', value: TRANSITION_MODE.OUT_IN }
	]
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; position: relative; }
	.story-toggle { appearance: none; border: 1px solid currentColor; background: transparent; color: inherit; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; }
	.story-target { padding: 12px 16px; border-radius: 6px; background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06)); border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)); }
</style>

<docs lang="md" src="@docs/components/Transition/OrigamTranslatePicker.md"/>
