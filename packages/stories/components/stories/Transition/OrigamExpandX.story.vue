<template>
	<Story
			group="components"
			title="Transition/OrigamExpandX"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITransitionProps>>({ origin: '' })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-design" @click="toggleDesign = !toggleDesign">Toggle</button>
					<origam-expand-x :origin="state.origin">
						<div v-if="toggleDesign" class="story-target" data-cy="target-design">Design target</div>
					</origam-expand-x>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Origin">
					<HstText v-model="state.origin" title="Origin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITransitionProps>>({
					name: 'origam-transition--expand-x',
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-functional" @click="toggleFunctional = !toggleFunctional">Toggle</button>
					<origam-expand-x
							:name="state.name"
							:disabled="state.disabled"
							:group="state.group"
							:hide-on-leave="state.hideOnLeave"
							:leave-absolute="state.leaveAbsolute"
					>
						<div v-if="toggleFunctional" class="story-target" data-cy="target-functional">Functional target</div>
					</origam-expand-x>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.group"         title="Group (transition-group)"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
				</StoryGroup>
				<StoryGroup title="Name">
					<HstText v-model="state.name" title="Name"/>
				</StoryGroup>
				<StoryGroup title="Mode">
					<HstSelect v-model="state.mode" title="Mode" :options="TRANSITION_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button class="story-toggle" data-cy="toggle-slot-default" @click="toggleSlotDefault = !toggleSlotDefault">Toggle</button>
				<origam-expand-x>
					<div v-if="toggleSlotDefault" class="story-target" data-cy="target-slot-default">
						<span>Custom slot content</span>
					</div>
				</origam-expand-x>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITransitionProps>({
					name: 'origam-transition--expand-x',
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
					<origam-expand-x v-bind="state">
						<div v-if="togglePlayground" class="story-target" data-cy="target-playground">Playground</div>
					</origam-expand-x>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstText v-model="state.origin" title="Origin"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText     v-model="state.name"         title="Name"/>
					<HstSelect   v-model="state.mode"         title="Mode"           :options="TRANSITION_MODE_OPTIONS"/>
					<HstCheckbox v-model="state.disabled"     title="Disabled"/>
					<HstCheckbox v-model="state.group"        title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"  title="Hide On Leave"/>
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

	import { OrigamExpandX } from '@origam/components'
	import { TRANSITION_MODE } from '@origam/enums'
	import type { ITransitionProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const toggleDesign     = ref(false)
	const toggleFunctional = ref(false)
	const toggleSlotDefault = ref(false)
	const togglePlayground  = ref(false)

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'in-out', value: TRANSITION_MODE.IN_OUT },
		{ label: 'out-in', value: TRANSITION_MODE.OUT_IN },
		{ label: 'default', value: TRANSITION_MODE.DEFAULT }
	]
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
	.story-toggle { appearance: none; border: 1px solid currentColor; background: transparent; color: inherit; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; }
	.story-target { padding: 12px 16px; border-radius: 6px; background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06)); border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)); white-space: nowrap; overflow: hidden; }
</style>

<docs lang="md" src="@docs/components/Transition/OrigamExpandX.md"/>
