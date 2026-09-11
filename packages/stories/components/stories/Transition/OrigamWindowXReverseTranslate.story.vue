<template>
	<Story
			group="components"
			title="Transition/OrigamWindowXReverseTranslate"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITransitionProps>>({ name: 'origam-transition--window-x-reverse-translate', origin: '' })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-design" @click="toggleDesign = !toggleDesign">Toggle</button>
					<div class="story-window">
						<origam-window-x-reverse-translate
								:name="state.name"
								:origin="state.origin || undefined"
						>
							<div v-if="toggleDesign" class="story-target" data-cy="target-design">Design preview</div>
						</origam-window-x-reverse-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstText v-model="state.name"   title="Name (CSS class prefix)"/>
					<HstText v-model="state.origin" title="Origin (transform-origin)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITransitionProps>>({ disabled: false, group: false, mode: undefined, hideOnLeave: false, leaveAbsolute: false })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-functional" @click="toggleFunctional = !toggleFunctional">Toggle</button>
					<div class="story-window">
						<origam-window-x-reverse-translate
								:disabled="state.disabled"
								:group="state.group"
								:mode="state.mode || undefined"
								:hide-on-leave="state.hideOnLeave"
								:leave-absolute="state.leaveAbsolute"
						>
							<div v-if="toggleFunctional" class="story-target" data-cy="target-functional">Functional preview</div>
						</origam-window-x-reverse-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled (no animation)"/>
					<HstCheckbox v-model="state.group"         title="Group (TransitionGroup)"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
				</StoryGroup>
				<StoryGroup title="Behaviour">
					<HstSelect v-model="state.mode" title="Mode" :options="TRANSITION_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button class="story-toggle" data-cy="toggle-slot-default" @click="toggleSlotDefault = !toggleSlotDefault">Toggle</button>
				<div class="story-window">
					<origam-window-x-reverse-translate>
						<div v-if="toggleSlotDefault" class="story-target" data-cy="target-slot-default">
							<strong>Custom</strong> slot content
						</div>
					</origam-window-x-reverse-translate>
				</div>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITransitionProps>({ name: 'origam-transition--window-x-reverse-translate', disabled: false, group: false, hideOnLeave: false, leaveAbsolute: false })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button class="story-toggle" data-cy="toggle-playground" @click="togglePlayground = !togglePlayground">Toggle</button>
					<div class="story-window">
						<origam-window-x-reverse-translate v-bind="state">
							<div v-if="togglePlayground" class="story-target" data-cy="target-playground">Playground</div>
						</origam-window-x-reverse-translate>
					</div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.name"   title="Name (CSS class prefix)"/>
					<HstText v-model="state.origin" title="Origin (transform-origin)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.group"         title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide On Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
					<HstSelect   v-model="state.mode"          title="Mode" :options="TRANSITION_MODE_OPTIONS"/>
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

	import { OrigamWindowXReverseTranslate } from '@origam/components'
	import { TRANSITION_MODE } from '@origam/enums'
	import type { ITransitionProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const toggleDesign     = ref(false)
	const toggleFunctional = ref(false)
	const toggleSlotDefault = ref(false)
	const togglePlayground  = ref(false)

	const TRANSITION_MODE_OPTIONS = [
		{ label: '— none —',  value: undefined },
		{ label: TRANSITION_MODE.IN_OUT,  value: TRANSITION_MODE.IN_OUT },
		{ label: TRANSITION_MODE.OUT_IN,  value: TRANSITION_MODE.OUT_IN },
		{ label: TRANSITION_MODE.DEFAULT, value: TRANSITION_MODE.DEFAULT }
	]
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
	.story-toggle { appearance: none; border: 1px solid currentColor; background: transparent; color: inherit; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; }
	.story-target { padding: 12px 16px; border-radius: 6px; background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06)); border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)); }
	.story-window { position: relative; min-width: 300px; min-height: 80px; overflow: hidden; }
</style>

<docs lang="md" src="@docs/components/Transition/OrigamWindowXReverseTranslate.md"/>
