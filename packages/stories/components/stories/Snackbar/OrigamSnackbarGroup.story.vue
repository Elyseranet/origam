<template>
	<Story
			group="components"
			title="Snackbar/OrigamSnackbarGroup"
	>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISnackbarGroupProps> & IFunctionalState>({
					id: 'functional',
					location: 'bottom-right',
					max: 5,
					defaultDuration: 5000,
					spacing: '12px',
					direction: undefined,
					tag: 'div',
					attach: undefined,
					intent: 'info',
					dismissible: true
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<div class="story-row">
						<origam-btn
								text="Notify"
								@click="functionalNotify(state)"
						/>
						<origam-btn
								text="Dismiss all"
								@click="functionalDismissAll(state.id)"
						/>
					</div>
					<origam-snackbar-group
							:id="state.id"
							:location="state.location"
							:max="state.max"
							:default-duration="state.defaultDuration"
							:spacing="state.spacing"
							:direction="state.direction || undefined"
							:tag="state.tag"
							:attach="state.attach"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Stack">
					<HstText   v-model="state.id"              title="id"/>
					<HstNumber v-model="state.max"             title="max" :min="1" :max="20" :step="1"/>
					<HstNumber v-model="state.defaultDuration" title="defaultDuration (ms)" :min="0" :max="30000" :step="500"/>
					<HstText   v-model="state.spacing"         title="spacing"/>
				</StoryGroup>
				<StoryGroup title="Position">
					<HstSelect v-model="state.location"  title="location"  :options="LOCATION_OPTIONS"/>
					<HstSelect v-model="state.direction" title="direction" :options="DIRECTION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstSelect v-model="state.tag" title="tag" :options="TAG_OPTIONS"/>
					<HstText   v-model="state.attach" title="Attach (CSS selector)"/>
				</StoryGroup>
				<StoryGroup title="Notification">
					<HstSelect   v-model="state.intent"      title="intent"      :options="INTENT_OPTIONS"/>
					<HstCheckbox v-model="state.dismissible" title="dismissible"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop - attach">
			<div class="story-shell">
				<div class="story-row">
					<origam-btn
							text="Notify (attach to local target)"
							@click="attachNotify()"
					/>
				</div>
				<div
						id="snackbar-group-attach-target"
						class="story-attach-target"
						data-cy="snackbar-group-attach-target"
				>
					local teleport target (#snackbar-group-attach-target)
				</div>
				<origam-snackbar-group
						id="attach-demo"
						attach="#snackbar-group-attach-target"
						data-cy="snackbar-group-attached"
						location="bottom-right"
				/>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ISnackbarGroupProps> & IPlaygroundState>({
					id: 'playground',
					location: 'bottom-right',
					max: 5,
					defaultDuration: 5000,
					spacing: '12px',
					direction: undefined,
					tag: 'div',
					attach: undefined,
					intent: 'info',
					dismissible: true
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<div class="story-row">
						<origam-btn
								text="Notify"
								@click="playgroundNotify(state)"
						/>
						<origam-btn
								text="Dismiss all"
								@click="playgroundDismissAll(state.id)"
						/>
					</div>
					<origam-snackbar-group
							:id="state.id"
							:location="state.location"
							:max="state.max"
							:default-duration="state.defaultDuration"
							:spacing="state.spacing"
							:direction="state.direction || undefined"
							:tag="state.tag"
							:attach="state.attach"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect   v-model="state.intent"      title="intent"      :options="INTENT_OPTIONS"/>
					<HstCheckbox v-model="state.dismissible" title="dismissible"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstText   v-model="state.id"              title="id"/>
					<HstNumber v-model="state.max"             title="max" :min="1" :max="20" :step="1"/>
					<HstNumber v-model="state.defaultDuration" title="defaultDuration (ms)" :min="0" :max="30000" :step="500"/>
					<HstText   v-model="state.spacing"         title="spacing"/>
					<HstSelect v-model="state.location"        title="location"  :options="LOCATION_OPTIONS"/>
					<HstSelect v-model="state.direction"       title="direction" :options="DIRECTION_OPTIONS"/>
					<HstSelect v-model="state.tag"             title="tag"       :options="TAG_OPTIONS"/>
					<HstText   v-model="state.attach"          title="Attach (CSS selector)"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamSnackbarGroup } from '@origam/components'

	import { useSnackbarGroup } from '@origam/composables'

	import { SNACKBAR_GROUP_LOCATIONS, SNACKBAR_GROUP_DIRECTIONS } from '@origam/consts'

	import type { IOptions, ISnackbarGroupProps } from '@origam/interfaces'

	import type { TIntent, TSnackbarGroupDirection, TSnackbarGroupLocation } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { INTENT_OPTIONS, TAG_OPTIONS } from '@stories/const'

	interface IFunctionalState {
		intent: TIntent
		dismissible: boolean
	}

	interface IPlaygroundState {
		intent: TIntent
		dismissible: boolean
	}

	const LOCATION_OPTIONS: Array<IOptions<TSnackbarGroupLocation | undefined>> = [
		{ label: '(auto)', value: undefined },
		...SNACKBAR_GROUP_LOCATIONS.map(loc => ({ label: loc, value: loc }))
	]

	const DIRECTION_OPTIONS: Array<IOptions<TSnackbarGroupDirection | undefined>> = [
		{ label: '(auto)', value: undefined },
		...SNACKBAR_GROUP_DIRECTIONS.map(dir => ({ label: dir, value: dir }))
	]

	const functionalNotify = (state: Partial<ISnackbarGroupProps> & IFunctionalState) => {
		const stack = useSnackbarGroup({ id: state.id ?? 'functional' })

		stack.notify({
			title: 'Notification',
			message: `A ${state.intent} toast from Functional.`,
			intent: state.intent,
			dismissible: state.dismissible
		})

		logEvent('notify', { intent: state.intent, dismissible: state.dismissible })
	}

	const functionalDismissAll = (id: string | undefined) => {
		const stack = useSnackbarGroup({ id: id ?? 'functional' })

		stack.dismissAll()
	}

	const playgroundNotify = (state: Partial<ISnackbarGroupProps> & IPlaygroundState) => {
		const stack = useSnackbarGroup({ id: state.id ?? 'playground' })

		stack.notify({
			title: 'Notification',
			message: `A ${state.intent} toast from Default.`,
			intent: state.intent,
			dismissible: state.dismissible
		})
	}

	const playgroundDismissAll = (id: string | undefined) => {
		const stack = useSnackbarGroup({ id: id ?? 'playground' })

		stack.dismissAll()
	}

	const attachNotify = () => {
		const stack = useSnackbarGroup({ id: 'attach-demo' })

		stack.notify({
			title: 'Attached',
			message: 'This stack teleports into the local target below, not document.body.',
			intent: 'info'
		})

		logEvent('notify', { id: 'attach-demo' })
	}
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: stretch;
		padding: 16px;
	}

	.story-row {
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
	}

	.story-attach-target {
		position: relative;
		min-height: 120px;
		padding: 12px;
		border: 1px dashed var(--origam-color__border---subtle, rgba(0, 0, 0, 0.2));
		border-radius: 8px;
		font: 0.8125rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, rgba(0, 0, 0, 0.55));
	}
</style>

<docs lang="md" src="@docs/components/Snackbar/OrigamSnackbarGroup.md"/>
