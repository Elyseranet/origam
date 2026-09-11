<template>
	<Story
			group="components"
			title="Window/OrigamWindowItem"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IWindowItemProps>({ value: 1, disabled: false, eager: false })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window :model-value="state.value" :style="hostStyle">
						<origam-window-item
								:value="1"
								:disabled="state.disabled"
								:eager="state.eager"
								:selected-class="state.selectedClass || undefined"
						>
							<div :style="slideStyle(0)">Slide 1</div>
						</origam-window-item>
						<origam-window-item
								:value="2"
								:eager="state.eager"
						>
							<div :style="slideStyle(1)">Slide 2</div>
						</origam-window-item>
						<origam-window-item
								:value="3"
								:eager="state.eager"
						>
							<div :style="slideStyle(2)">Slide 3</div>
						</origam-window-item>
					</origam-window>
					<div class="story-status">Active value: <strong>{{ state.value }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled (item 1)"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstNumber   v-model="state.value"         title="Active value" :min="1" :max="3" :step="1"/>
					<HstText     v-model="state.selectedClass" title="Selected Class"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.eager" title="Eager (no lazy)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional - Transition"
				:init-state="() => useStoryInitState<{ value: number, transition: string | boolean | undefined, reverseTransition: string | boolean | undefined }>({ value: 1, transition: undefined, reverseTransition: undefined })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window :model-value="state.value" :style="hostStyle">
						<origam-window-item
								v-for="n in 3"
								:key="n"
								:value="n"
								:transition="state.transition"
								:reverse-transition="state.reverseTransition"
						>
							<div :style="slideStyle(n - 1)">Slide {{ n }}</div>
						</origam-window-item>
					</origam-window>
					<div class="story-status">Active value: <strong>{{ state.value }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Navigation">
					<HstNumber v-model="state.value" title="Active value" :min="1" :max="3" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Transition">
					<HstSelect v-model="state.transition"        title="Transition"         :options="TRANSITION_OPTIONS"/>
					<HstSelect v-model="state.reverseTransition" title="Reverse Transition" :options="TRANSITION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - group:selected">
			<div class="story-shell">
				<origam-window :model-value="emitStep" show-arrows :style="hostStyle">
					<origam-window-item
							v-for="n in 3"
							:key="n"
							:value="n"
							@group:selected="logEvent('group:selected', $event)"
					>
						<div :style="slideStyle(n - 1)">Slide {{ n }}</div>
					</origam-window-item>
				</origam-window>
				<div class="story-status">Active: <strong>{{ emitStep }}</strong></div>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div class="story-shell">
				<origam-window :model-value="slotStep" :style="hostStyle">
					<origam-window-item :value="1">
						<template #default>
							<div :style="slideStyle(0)">
								<strong>Custom</strong>&nbsp;slot content
							</div>
						</template>
					</origam-window-item>
					<origam-window-item :value="2">
						<div :style="slideStyle(1)">Slide 2</div>
					</origam-window-item>
					<origam-window-item :value="3">
						<div :style="slideStyle(2)">Slide 3</div>
					</origam-window-item>
				</origam-window>
				<div class="story-status">Active: <strong>{{ slotStep }}</strong></div>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IWindowItemProps & { activeValue: number }>({ activeValue: 1, value: 1, disabled: false, eager: false, transition: undefined, reverseTransition: undefined })"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-window :model-value="state.activeValue" :style="hostStyle">
						<origam-window-item
								v-for="n in 3"
								:key="n"
								:value="n"
								:disabled="n === state.value ? state.disabled : false"
								:eager="state.eager"
								:transition="state.transition"
								:reverse-transition="state.reverseTransition"
								@group:selected="logEvent('group:selected', $event)"
						>
							<div :style="slideStyle(n - 1)">Slide {{ n }}</div>
						</origam-window-item>
					</origam-window>
					<div class="story-status">Active: <strong>{{ state.activeValue }}</strong></div>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Navigation">
					<HstNumber v-model="state.activeValue" title="Active value" :min="1" :max="3" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.value"    title="Target item (for disabled)" :min="1" :max="3" :step="1"/>
					<HstCheckbox v-model="state.disabled" title="Disabled (target item)"/>
					<HstCheckbox v-model="state.eager"    title="Eager"/>
				</StoryGroup>
				<StoryGroup title="Transition">
					<HstSelect v-model="state.transition"        title="Transition"         :options="TRANSITION_OPTIONS"/>
					<HstSelect v-model="state.reverseTransition" title="Reverse Transition" :options="TRANSITION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref, type CSSProperties } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamWindow, OrigamWindowItem } from '@origam/components'
	import type { IWindowItemProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'

	const emitStep = ref(1)
	const slotStep = ref(1)

	const TRANSITION_OPTIONS = [
		{ label: '(default — inherit window axis)', value: undefined },
		{ label: 'false (no transition)',           value: false },
		{ label: 'origam-fade-transition',          value: 'origam-fade-transition' },
		{ label: 'origam-scale-rotate-transition',  value: 'origam-scale-rotate-transition' },
	]

	const hostStyle: CSSProperties = {
		width: '100%',
		height: '180px',
		border: '1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))',
		borderRadius: '6px',
		backgroundColor: 'var(--origam-color__surface---default, rgba(0, 0, 0, 0.03))',
	}

	const palette = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444']
	function slideStyle (i: number): CSSProperties {
		return {
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontWeight: '600',
			fontSize: '1.25rem',
			color: '#fff',
			background: palette[i % palette.length],
		}
	}
</script>

<style scoped>
	.story-shell { display: flex; flex-direction: column; gap: 12px; }
	.story-status { font: 0.875rem/1.4 system-ui, sans-serif; color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)); }
</style>

<docs lang="md" src="@docs/components/Window/OrigamWindowItem.md"/>
