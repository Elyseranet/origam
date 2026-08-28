<template>
	<Story
			group="components"
			title="Snackbar/OrigamSnackbarItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ISnackbarItemProps>>({
					intent: 'info',
					title: 'Notification title',
					message: 'A body message with more context.',
					icon: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined,
					letterSpacing: undefined
				})"
		>
			<template #default="{ state }">
				<origam-snackbar-item
						:intent="state.intent"
						:title="state.title"
						:message="state.message"
						:icon="state.icon"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						:letter-spacing="state.letterSpacing"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Intent">
					<HstSelect v-model="state.intent" title="Intent" :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize" title="Font Size" :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.icon" title="Icon Override" :options="ICON_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ISnackbarItemProps>>({
					intent: 'info',
					title: 'Notification title',
					message: 'A body message with more context.',
					dismissible: true,
					dismissLabel: 'Dismiss notification',
					role: undefined,
					ariaLive: undefined
				})"
		>
			<template #default="{ state }">
				<origam-snackbar-item
						:intent="state.intent"
						:title="state.title"
						:message="state.message"
						:dismissible="state.dismissible"
						:dismiss-label="state.dismissLabel"
						:role="state.role"
						:aria-live="state.ariaLive"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText  v-model="state.title"   title="Title"/>
					<HstText  v-model="state.message" title="Message"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.dismissible"   title="Dismissible"/>
					<HstText     v-model="state.dismissLabel"  title="Dismiss Label"/>
				</StoryGroup>
				<StoryGroup title="Accessibility">
					<HstSelect v-model="state.role"     title="Role"      :options="ROLE_OPTIONS"/>
					<HstSelect v-model="state.ariaLive" title="Aria Live" :options="ARIA_LIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - dismiss">
			<origam-snackbar-item
					intent="danger"
					message="Click the dismiss button."
					title="Dismiss me"
					@dismiss="logEvent('dismiss', $event)"
			/>
		</Variant>

		<Variant title="Events - action">
			<origam-snackbar-item
					:actions="sampleActions"
					intent="warning"
					message="A row was removed from your list."
					title="Item deleted"
					@action="logEvent('action', $event)"
			/>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-snackbar-item
					intent="info"
					message="Custom prepend icon via slot."
					title="Custom icon"
			>
				<template #prepend>
					<origam-icon
							:icon="MDI_ICONS.HEART"
							:size="24"
					/>
				</template>
			</origam-snackbar-item>
		</Variant>

		<Variant title="Slots - Actions">
			<origam-snackbar-item
					intent="success"
					message="Profile updated successfully."
					title="Saved"
			>
				<template #actions>
					<button
							class="story-btn"
							type="button"
							@click="logEvent('actions slot click', $event)"
					>
						Undo
					</button>
				</template>
			</origam-snackbar-item>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ISnackbarItemProps>({
					intent: 'info',
					title: 'Notification title',
					message: 'A body message with more context.',
					dismissible: true
				})"
		>
			<template #default="{ state }">
				<origam-snackbar-item
						v-bind="state"
						@dismiss="logEvent('dismiss', $event)"
						@action="logEvent('action', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"   title="Title"/>
					<HstText v-model="state.message" title="Message"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.intent" title="Intent" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.icon"   title="Icon"   :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize" title="Font Size" :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.dismissible" title="Dismissible"/>
					<HstText     v-model="state.dismissLabel" title="Dismiss Label"/>
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

	import { OrigamIcon, OrigamSnackbarItem } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { ISnackbarGroupItemAction, ISnackbarItemProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ICON_OPTIONS,
		INTENT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS
	} from '@stories/const'

	const ROLE_OPTIONS = [
		{ label: '(auto)', value: undefined },
		{ label: 'status', value: 'status' },
		{ label: 'alert', value: 'alert' }
	]

	const ARIA_LIVE_OPTIONS = [
		{ label: '(auto)', value: undefined },
		{ label: 'polite', value: 'polite' },
		{ label: 'assertive', value: 'assertive' }
	]

	const sampleActions: ReadonlyArray<ISnackbarGroupItemAction> = [
		{
			label: 'Undo',
			intent: 'primary',
			handler: () => undefined
		}
	]
</script>

<style scoped>
	.story-btn {
		background: transparent;
		border: 1px solid currentColor;
		border-radius: 4px;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		padding: 4px 12px;
	}
</style>
