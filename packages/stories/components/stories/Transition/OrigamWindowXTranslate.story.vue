<template>
	<Story
			group="components"
			title="Transition/OrigamWindowXTranslate"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<ITransitionProps>({
					name: 'origam-transition--window-x-translate',
					mode: TRANSITION_MODE.OUT_IN,
					origin: ''
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-design" @click="toggleDesign = !toggleDesign">Toggle</button>
					<div class="story-window">
						<origam-window-x-translate
								:name="state.name"
								:mode="state.mode"
								:origin="state.origin || undefined"
						>
							<div v-if="toggleDesign" class="story-target" data-cy="target-design">Animation content</div>
						</origam-window-x-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstText   v-model="state.name"   title="Name"/>
					<HstSelect v-model="state.mode"   title="Mode"   :options="TRANSITION_MODE_OPTIONS"/>
					<HstText   v-model="state.origin" title="Origin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<ITransitionProps>({
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-functional" @click="toggleFunctional = !toggleFunctional">Toggle</button>
					<div class="story-window">
						<origam-window-x-translate
								:disabled="state.disabled"
								:group="state.group"
								:hide-on-leave="state.hideOnLeave"
								:leave-absolute="state.leaveAbsolute"
						>
							<div v-if="toggleFunctional" class="story-target" data-cy="target-functional">Functional content</div>
						</origam-window-x-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.group"         title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button class="story-toggle" data-cy="toggle-slot-default" @click="toggleSlotDefault = !toggleSlotDefault">Toggle</button>
				<div class="story-window">
					<origam-window-x-translate>
						<div v-if="toggleSlotDefault" class="story-target" data-cy="target-slot-default">
							<strong>Custom slot content</strong>
						</div>
					</origam-window-x-translate>
				</div>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITransitionProps>({
					name: 'origam-transition--window-x-translate',
					mode: TRANSITION_MODE.OUT_IN,
					origin: '',
					disabled: false,
					group: false,
					hideOnLeave: false,
					leaveAbsolute: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-playground" @click="togglePlayground = !togglePlayground">Toggle</button>
					<div class="story-window">
						<origam-window-x-translate v-bind="state">
							<div v-if="togglePlayground" class="story-target" data-cy="target-playground">Playground</div>
						</origam-window-x-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstText   v-model="state.name"   title="Name"/>
					<HstSelect v-model="state.mode"   title="Mode"   :options="TRANSITION_MODE_OPTIONS"/>
					<HstText   v-model="state.origin" title="Origin"/>
				</StoryGroup>
				<StoryGroup title="Functional">
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

	import { OrigamWindowXTranslate } from '@origam/components'
	import { TRANSITION_MODE } from '@origam/enums'
	import type { ITransitionProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const toggleDesign = ref(false)
	const toggleFunctional = ref(false)
	const toggleSlotDefault = ref(false)
	const togglePlayground = ref(false)

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'out-in', value: TRANSITION_MODE.OUT_IN },
		{ label: 'in-out', value: TRANSITION_MODE.IN_OUT },
		{ label: 'default', value: TRANSITION_MODE.DEFAULT }
	]
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
	.story-toggle { appearance: none; border: 1px solid currentColor; background: transparent; color: inherit; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; }
	.story-target { padding: 12px 16px; border-radius: 6px; background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06)); border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)); }
	.story-window { position: relative; min-width: 300px; min-height: 80px; overflow: hidden; }
</style>

<docs lang="md" src="@docs/components/Transition/OrigamWindowXTranslate.md"/>
