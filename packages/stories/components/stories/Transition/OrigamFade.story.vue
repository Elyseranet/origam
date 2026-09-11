<template>
	<Story
			group="components"
			title="Transition/OrigamFade"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<ITransitionProps>({ name: 'origam-transition--fade', origin: '' })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<button
							class="story-toggle"
							data-cy="toggle-design"
							@click="toggleDesign = !toggleDesign"
					>
						Toggle
					</button>
					<origam-fade
							:name="state.name"
							:origin="state.origin || undefined"
					>
						<div
								v-if="toggleDesign"
								class="story-target"
								data-cy="target-design"
						>
							Fade target
						</div>
					</origam-fade>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstText v-model="state.name"   title="Name (BEM class)"/>
					<HstText v-model="state.origin" title="Origin (transformOrigin)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<ITransitionProps>({ disabled: false, group: false, hideOnLeave: false, leaveAbsolute: false, mode: undefined })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<div class="story-actions">
						<button
								class="story-toggle"
								data-cy="toggle-functional"
								@click="toggleFunctional = !toggleFunctional"
						>
							Toggle
						</button>
						<button
								class="story-toggle"
								data-cy="group-add"
								@click="functionalItems.push(functionalItems.length + 1)"
						>
							Add item
						</button>
						<button
								class="story-toggle"
								data-cy="group-remove"
								@click="functionalItems.pop()"
						>
							Remove item
						</button>
					</div>
					<origam-fade
							:disabled="state.disabled"
							:group="state.group"
							:hide-on-leave="state.hideOnLeave"
							:leave-absolute="state.leaveAbsolute"
							:mode="state.mode"
					>
						<template v-if="state.group">
							<div
									v-for="item in functionalItems"
									:key="item"
									class="story-target"
									:data-cy="`target-group-${item}`"
							>
								Item {{ item }}
							</div>
						</template>
						<div
								v-else-if="toggleFunctional"
								class="story-target"
								data-cy="target-functional"
						>
							Functional target
						</div>
					</origam-fade>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"      title="Disabled (no animation)"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide on Leave"/>
					<HstCheckbox v-model="state.leaveAbsolute" title="Leave Absolute"/>
				</StoryGroup>
				<StoryGroup title="Mode">
					<HstCheckbox v-model="state.group" title="Group (TransitionGroup)"/>
					<HstSelect   v-model="state.mode"  title="Mode" :options="TRANSITION_MODE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<button
						class="story-toggle"
						data-cy="toggle-slot-default"
						@click="toggleSlotDefault = !toggleSlotDefault"
				>
					Toggle
				</button>
				<origam-fade>
					<div
							v-if="toggleSlotDefault"
							class="story-target"
							data-cy="target-slot-default"
					>
						<strong>Custom</strong> slot content
					</div>
				</origam-fade>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITransitionProps>({ name: 'origam-transition--fade', disabled: false, group: false, hideOnLeave: false, leaveAbsolute: false, origin: '' })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<div class="story-actions">
						<button
								class="story-toggle"
								data-cy="toggle-playground"
								@click="togglePlayground = !togglePlayground"
						>
							Toggle
						</button>
						<button
								class="story-toggle"
								data-cy="playground-group-add"
								@click="playgroundItems.push(playgroundItems.length + 1)"
						>
							Add item
						</button>
						<button
								class="story-toggle"
								data-cy="playground-group-remove"
								@click="playgroundItems.pop()"
						>
							Remove item
						</button>
					</div>
					<origam-fade v-bind="state">
						<template v-if="state.group">
							<div
									v-for="item in playgroundItems"
									:key="item"
									class="story-target"
									:data-cy="`target-playground-group-${item}`"
							>
								Item {{ item }}
							</div>
						</template>
						<div
								v-else-if="togglePlayground"
								class="story-target"
								data-cy="target-playground"
						>
							Playground
						</div>
					</origam-fade>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstText v-model="state.name"   title="Name (BEM class)"/>
					<HstText v-model="state.origin" title="Origin (transformOrigin)"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"      title="Disabled"/>
					<HstCheckbox v-model="state.group"         title="Group"/>
					<HstCheckbox v-model="state.hideOnLeave"   title="Hide on Leave"/>
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

	import { OrigamFade } from '@origam/components'
	import type { ITransitionProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const TRANSITION_MODE_OPTIONS = [
		{ label: 'default', value: 'default' },
		{ label: 'in-out',  value: 'in-out'  },
		{ label: 'out-in',  value: 'out-in'  }
	]

	const toggleDesign      = ref(false)
	const toggleFunctional  = ref(false)
	const toggleSlotDefault = ref(false)
	const togglePlayground  = ref(false)

	const functionalItems  = ref([1, 2])
	const playgroundItems  = ref([1, 2])
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-items: flex-start;
	}
	.story-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.story-toggle {
		appearance: none;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		padding: 6px 14px;
		border-radius: 6px;
		cursor: pointer;
		font: inherit;
	}
	.story-target {
		padding: 12px 16px;
		border-radius: 6px;
		background: var(--origam-color__surface---default, rgba(0, 0, 0, 0.06));
		border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12));
	}
</style>

<docs lang="md" src="@docs/components/Transition/OrigamFade.md"/>
