<template>
	<Story
			group="components"
			title="Overlay/OrigamOverlayScrim"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<IOverlayScrimProps>({ active: true, scrim: true })"
		>
			<template #default="{ state }">
				<div class="story-host">
					<origam-overlay-scrim
							:active="state.active"
							:scrim="state.scrim"
							:transition="state.transition"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Scrim">
					<HstSelect v-model="state.scrim" title="Scrim" :options="SCRIM_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Transition">
					<HstSelect v-model="state.transition" title="Transition" :options="TRANSITION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IOverlayScrimProps>({ active: false, scrim: true })"
		>
			<template #default="{ state }">
				<div class="story-host">
					<origam-btn
							text="Toggle scrim"
							@click="state.active = !state.active"
					/>
					<origam-overlay-scrim
							:active="state.active"
							:scrim="state.scrim"
							:tag="state.tag"
							:disabled="state.disabled"
							@click="state.active = false"
					/>
					<span>active={{ state.active }}</span>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.active"   title="Active"/>
					<HstCheckbox v-model="state.disabled" title="Disabled (transition)"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<div class="story-host">
				<origam-btn
						text="Show scrim"
						@click="emitActive = true"
				/>
				<origam-overlay-scrim
						:active="emitActive"
						@click="logEvent('click', $event); emitActive = false"
				/>
			</div>
		</Variant>

		<Variant title="Events - mouseenter">
			<div class="story-host">
				<origam-btn
						text="Show scrim"
						@click="mouseenterActive = true"
				/>
				<origam-overlay-scrim
						:active="mouseenterActive"
						@click="mouseenterActive = false"
						@mouseenter="logEvent('mouseenter', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - mouseleave">
			<div class="story-host">
				<origam-btn
						text="Show scrim"
						@click="mouseleaveActive = true"
				/>
				<origam-overlay-scrim
						:active="mouseleaveActive"
						@click="mouseleaveActive = false"
						@mouseleave="logEvent('mouseleave', $event)"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IOverlayScrimProps>({ active: false, scrim: true })"
		>
			<template #default="{ state }">
				<div class="story-host">
					<origam-btn
							text="Toggle scrim"
							@click="state.active = !state.active"
					/>
					<origam-overlay-scrim
							v-bind="state"
							@click="state.active = false"
					/>
					<span>active={{ state.active }} | scrim={{ String(state.scrim) }}</span>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect   v-model="state.scrim"      title="Scrim"      :options="SCRIM_OPTIONS"/>
					<HstSelect   v-model="state.transition" title="Transition" :options="TRANSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.active"   title="Active"/>
					<HstCheckbox v-model="state.disabled" title="Disabled (transition)"/>
					<HstSelect   v-model="state.tag"      title="Tag"         :options="TAG_OPTIONS"/>
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

	import { OrigamBtn, OrigamOverlayScrim } from '@origam/components'
	import type { IOverlayScrimProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const emitActive       = ref(false)
	const mouseenterActive = ref(false)
	const mouseleaveActive = ref(false)

	const SCRIM_OPTIONS = [
		{ label: 'true (default dark overlay)', value: true },
		{ label: 'false (no scrim)',             value: false },
		{ label: 'primary',                      value: 'primary' },
		{ label: 'secondary',                    value: 'secondary' },
		{ label: 'rgba blue',                    value: 'rgba(0, 120, 255, .45)' }
	]

	const TRANSITION_OPTIONS = [
		{ label: 'default (OrigamFade)', value: undefined },
		{ label: 'disabled',             value: false },
		{ label: 'fade',                 value: 'fade' },
		{ label: 'slide-y',              value: 'slide-y' }
	]
</script>

<style scoped>
	.story-host {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 16px;
		min-height: 80px;
	}
</style>

<docs lang="md" src="@docs/components/Overlay/OrigamOverlayScrim.md"/>
