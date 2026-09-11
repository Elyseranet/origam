<template>
	<Story
			group="components"
			title="Clipboard/OrigamClipboard"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IClipboardProps>>({
					value: 'arnaud@example.com',
					fontSize: undefined,
					fontWeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-clipboard
						:value="state.value ?? 'arnaud@example.com'"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:rounded="state.rounded"
						:tag="state.tag"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded" title="Rounded" :options="ROUNDED_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IClipboardProps>>({
					value: 'arnaud@example.com',
					feedbackDuration: 2000,
					feedbackText: 'Copied!',
					disabled: false
				})"
		>
			<template #default="{ state }">
				<origam-clipboard
						:value="state.value ?? 'arnaud@example.com'"
						:feedback-duration="state.feedbackDuration"
						:feedback-text="state.feedbackText"
						:success-text="state.successText"
						:disabled="state.disabled"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Data">
					<HstText v-model="state.value"       title="Value"/>
					<HstText v-model="state.feedbackText" title="Feedback Text"/>
					<HstText v-model="state.successText"  title="Success Text"/>
				</StoryGroup>
				<StoryGroup title="Timing">
					<HstNumber v-model="state.feedbackDuration" title="Feedback Duration (ms)" :min="500" :max="10000" :step="100"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - copy">
			<origam-clipboard
					value="counter-payload"
					@copy="logEvent('copy', $event)"
			/>
		</Variant>

		<Variant title="Events - error">
			<div class="story-shell">
				<button
						type="button"
						class="story-arm"
						@click="armErrorMode"
				>
					Block clipboard API
				</button>
				<origam-clipboard
						value="never-copied"
						@error="logEvent('error', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-clipboard value="my-api-key-12345">
				<template #default="{ copy, copied }">
					<origam-btn @click="copy">
						{{ copied ? 'Copied!' : 'Copy API key' }}
					</origam-btn>
				</template>
			</origam-clipboard>
		</Variant>

		<Variant title="Slots - Feedback">
			<origam-clipboard value="hello-from-origam">
				<template #feedback="{ copied }">
					<span>{{ copied ? 'Done!' : '' }}</span>
				</template>
			</origam-clipboard>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IClipboardProps>({
					value: 'arnaud@example.com',
					feedbackDuration: 2000,
					feedbackText: 'Copied!',
					disabled: false,
					fontSize: undefined,
					fontWeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-clipboard
						v-bind="state"
						@copy="logEvent('copy', $event)"
						@error="logEvent('error', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.value"        title="Value"/>
					<HstText v-model="state.feedbackText" title="Feedback Text"/>
					<HstText v-model="state.successText"  title="Success Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"       title="Color"        :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"     title="Bg Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.tag"         title="Tag"          :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstNumber   v-model="state.feedbackDuration" title="Feedback Duration (ms)" :min="500" :max="10000" :step="100"/>
					<HstCheckbox v-model="state.disabled"         title="Disabled"/>
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

	import { OrigamBtn, OrigamClipboard } from '@origam/components'
	import type { IClipboardProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const armErrorMode = () => {
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				writeText: () => Promise.reject(new Error('Simulated denial'))
			}
		})
		document.execCommand = (() => false) as unknown as typeof document.execCommand
	}
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 540px;
	}

	.story-arm {
		align-self: flex-start;
		padding: 6px 10px;
		border-radius: 4px;
		border: 1px solid var(--origam-color__border---subtle, #ddd);
		background: var(--origam-color__surface---raised, #f5f5f5);
		font: 0.75rem/1 system-ui, sans-serif;
		cursor: pointer;
	}
</style>

<docs lang="md" src="@docs/components/Clipboard/OrigamClipboard.md"/>
