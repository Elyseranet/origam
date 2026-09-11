<template>
	<Story
			group="components"
			title="InlineEdit/OrigamInlineEdit"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IInlineEditProps>>({
					modelValue: 'Inline edit value',
					placeholder: 'Click to edit',
					tag: 'span',
					fontSize: undefined,
					fontWeight: undefined
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-inline-edit
							v-model="state.modelValue"
							:placeholder="state.placeholder"
							:tag="state.tag"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
					/>
					<output class="story-state">{{ state.modelValue }}</output>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Structure">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.placeholder" title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="Typography (error + action-btn)">
					<HstSelect v-model="state.fontSize"   title="Font Size (error + btn)" :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight (error only)" :options="FONT_WEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IInlineEditProps>>({
					modelValue: 'Editable value',
					placeholder: 'Click to edit',
					autoFocus: true,
					selectOnFocus: true,
					confirmOnBlur: true,
					confirmOnEnter: true,
					cancelOnEscape: true,
					disabled: false,
					multiline: false,
					trim: true,
					inputType: 'text',
					loadingOnConfirm: false,
					showActions: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-inline-edit
							v-model="state.modelValue"
							:placeholder="state.placeholder"
							:auto-focus="state.autoFocus"
							:select-on-focus="state.selectOnFocus"
							:confirm-on-blur="state.confirmOnBlur"
							:confirm-on-enter="state.confirmOnEnter"
							:cancel-on-escape="state.cancelOnEscape"
							:disabled="state.disabled"
							:multiline="state.multiline"
							:trim="state.trim"
							:input-type="state.inputType"
							:loading-on-confirm="state.loadingOnConfirm"
							:show-actions="state.showActions"
					/>
					<output class="story-state">{{ state.modelValue }}</output>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"        title="Disabled"/>
					<HstCheckbox v-model="state.loadingOnConfirm" title="Loading on Confirm"/>
				</StoryGroup>
				<StoryGroup title="Editing Behaviour">
					<HstCheckbox v-model="state.multiline"       title="Multiline"/>
					<HstCheckbox v-model="state.trim"            title="Trim"/>
					<HstCheckbox v-model="state.autoFocus"       title="Auto Focus"/>
					<HstCheckbox v-model="state.selectOnFocus"   title="Select on Focus"/>
					<HstCheckbox v-model="state.showActions"     title="Show Actions"/>
				</StoryGroup>
				<StoryGroup title="Keyboard">
					<HstCheckbox v-model="state.confirmOnBlur"   title="Confirm on Blur"/>
					<HstCheckbox v-model="state.confirmOnEnter"  title="Confirm on Enter"/>
					<HstCheckbox v-model="state.cancelOnEscape"  title="Cancel on Escape"/>
				</StoryGroup>
				<StoryGroup title="Input">
					<HstSelect  v-model="state.inputType" title="Input Type" :options="INPUT_TYPE_OPTIONS"/>
					<HstText    v-model="state.placeholder" title="Placeholder"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - edit">
			<div class="story-shell">
				<origam-inline-edit
						v-model="emitEditValue"
						placeholder="Click to trigger edit"
						data-cy="inline-edit-event-edit"
						@edit="logEvent('edit', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - confirm">
			<div class="story-shell">
				<origam-inline-edit
						v-model="emitConfirmValue"
						placeholder="Edit and confirm"
						data-cy="inline-edit-event-confirm"
						@confirm="logEvent('confirm', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - cancel">
			<div class="story-shell">
				<origam-inline-edit
						v-model="emitCancelValue"
						placeholder="Edit then press Escape"
						data-cy="inline-edit-event-cancel"
						@cancel="logEvent('cancel', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - validate-error">
			<div class="story-shell">
				<p class="hint">Sync validator: value must be at least 3 characters. Enter a shorter value to trigger the error.</p>
				<origam-inline-edit
						v-model="emitValidateErrorValue"
						:validate="validateMinLengthForEmit"
						placeholder="Min 3 chars"
						data-cy="inline-edit-event-validate-error"
						@validate-error="logEvent('validate-error', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Display">
			<div class="story-shell">
				<p class="hint">The <code>#display</code> slot exposes <code>{ value, edit, isEmpty, placeholder, disabled }</code>. Click the heading to enter edit mode.</p>
				<origam-inline-edit
						v-model="slotDisplayValue"
						placeholder="Untitled"
						data-cy="inline-edit-slot-display"
				>
					<template #display="{ value, edit, isEmpty, placeholder }">
						<h2
								class="story-heading"
								:class="{ 'story-heading--empty': isEmpty }"
								data-cy="inline-edit-slot-display-trigger"
								@click="edit"
						>{{ isEmpty ? placeholder : value }}</h2>
					</template>
				</origam-inline-edit>
			</div>
		</Variant>

		<Variant title="Slots - Edit">
			<div class="story-shell">
				<p class="hint">The <code>#edit</code> slot exposes <code>{ value, setValue, confirm, cancel, error, isPending }</code>. Custom input layout with pencil icon prefix.</p>
				<origam-inline-edit
						v-model="slotEditValue"
						:validate="validateMinLengthForSlot"
						placeholder="Search query"
						data-cy="inline-edit-slot-edit"
				>
					<template #edit="{ value, setValue, confirm, cancel, error }">
						<div class="story-custom-editor">
							<span
									class="story-custom-editor__icon"
									aria-hidden="true"
							>&#9998;</span>
							<input
									class="story-custom-editor__input"
									:value="value"
									data-cy="inline-edit-slot-edit-input"
									@input="setValue(($event.target as HTMLInputElement).value)"
									@keydown.enter.prevent="confirm()"
									@keydown.esc.prevent="cancel()"
							>
							<span
									v-if="error"
									class="story-custom-editor__error"
									role="alert"
							>{{ error }}</span>
						</div>
					</template>
				</origam-inline-edit>
			</div>
		</Variant>

		<Variant title="Slots - Actions">
			<div class="story-shell">
				<p class="hint">The <code>#actions</code> slot exposes <code>{ confirm, cancel, isPending }</code>. Custom confirm/cancel buttons with <code>showActions=true</code>.</p>
				<origam-inline-edit
						v-model="slotActionsValue"
						:show-actions="true"
						:confirm-on-blur="false"
						placeholder="Click to edit"
						data-cy="inline-edit-slot-actions"
				>
					<template #actions="{ confirm, cancel, isPending }">
						<div class="story-actions">
							<button
									type="button"
									class="story-actions__btn story-actions__btn--confirm"
									:disabled="isPending"
									data-cy="inline-edit-slot-actions-confirm"
									@mousedown.prevent
									@click="confirm()"
							>&#10003;</button>
							<button
									type="button"
									class="story-actions__btn story-actions__btn--cancel"
									data-cy="inline-edit-slot-actions-cancel"
									@mousedown.prevent
									@click="cancel()"
							>&#10005;</button>
						</div>
					</template>
				</origam-inline-edit>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IInlineEditProps>({
					modelValue: 'Initial title',
					placeholder: 'Click to edit',
					autoFocus: true,
					selectOnFocus: true,
					confirmOnBlur: true,
					confirmOnEnter: true,
					cancelOnEscape: true,
					disabled: false,
					multiline: false,
					trim: true,
					inputType: 'text',
					loadingOnConfirm: false,
					showActions: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-inline-edit
							v-bind="state"
							@edit="logEvent('edit', $event)"
							@confirm="logEvent('confirm', $event)"
							@cancel="logEvent('cancel', $event)"
							@validate-error="logEvent('validate-error', $event)"
					/>
					<output class="story-state">{{ state.modelValue }}</output>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.modelValue"   title="Model Value"/>
					<HstText v-model="state.placeholder"  title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"         title="Disabled"/>
					<HstCheckbox v-model="state.multiline"        title="Multiline"/>
					<HstCheckbox v-model="state.trim"             title="Trim"/>
					<HstCheckbox v-model="state.autoFocus"        title="Auto Focus"/>
					<HstCheckbox v-model="state.selectOnFocus"    title="Select on Focus"/>
					<HstCheckbox v-model="state.confirmOnBlur"    title="Confirm on Blur"/>
					<HstCheckbox v-model="state.confirmOnEnter"   title="Confirm on Enter"/>
					<HstCheckbox v-model="state.cancelOnEscape"   title="Cancel on Escape"/>
					<HstCheckbox v-model="state.loadingOnConfirm" title="Loading on Confirm"/>
					<HstCheckbox v-model="state.showActions"      title="Show Actions"/>
					<HstSelect  v-model="state.inputType" title="Input Type" :options="INPUT_TYPE_OPTIONS"/>
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

	import { OrigamInlineEdit } from '@origam/components'
	import type { IInlineEditProps } from '@origam/interfaces'
	import type { TInlineEditInputType } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { FONT_SIZE_OPTIONS, FONT_WEIGHT_OPTIONS, TAG_OPTIONS } from '@stories/const'

	const INPUT_TYPE_OPTIONS: Array<{ label: string; value: TInlineEditInputType }> = [
		{ label: 'text', value: 'text' },
		{ label: 'number', value: 'number' },
		{ label: 'email', value: 'email' },
		{ label: 'tel', value: 'tel' }
	]

	const validateMinLengthForEmit = (v: string): true | string => v.length >= 3 || 'Min 3 chars'
	const validateMinLengthForSlot = (v: string): true | string => v.length >= 3 || 'Min 3 chars'

	const emitEditValue = ref('Click to trigger edit')
	const emitConfirmValue = ref('Edit and confirm')
	const emitCancelValue = ref('Edit then press Escape')
	const emitValidateErrorValue = ref('Hello')

	const slotDisplayValue = ref('A great article')
	const slotEditValue = ref('vue 3')
	const slotActionsValue = ref('My item')
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 540px;
	}

	.hint {
		margin: 0;
		font: 0.875rem/1.4 system-ui, sans-serif;
		color: var(--origam-color__text---secondary, #555);
	}

	.story-state {
		display: inline-flex;
		padding: 4px 8px;
		border-radius: 4px;
		background: var(--origam-color__surface---raised, #f5f5f5);
		font: 600 0.75rem/1 ui-monospace, monospace;
		color: var(--origam-color__text---primary, #171717);
	}

	.story-heading {
		margin: 0;
		font: 600 1.5rem/1.2 system-ui, sans-serif;
		cursor: pointer;
		color: var(--origam-color__text---primary, #171717);
	}

	.story-heading--empty {
		color: var(--origam-color__text---disabled, #aaa);
		font-style: italic;
	}

	.story-custom-editor {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border: 1px solid var(--origam-color__border---subtle, #ddd);
		border-radius: 4px;
		background: var(--origam-color__surface---default, #fff);
	}

	.story-custom-editor__icon {
		font-size: 1rem;
		color: var(--origam-color__text---secondary, #555);
	}

	.story-custom-editor__input {
		border: none;
		outline: none;
		font: inherit;
		min-width: 200px;
		background: transparent;
		color: var(--origam-color__text---primary, #171717);
	}

	.story-custom-editor__error {
		font-size: 0.75rem;
		color: var(--origam-color__feedback--danger---fg, #c00);
	}

	.story-actions {
		display: inline-flex;
		gap: 4px;
	}

	.story-actions__btn {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		font: 600 0.875rem/1 system-ui, sans-serif;
	}

	.story-actions__btn--confirm {
		background: var(--origam-color__feedback--success---bgSubtle, #e6f6ec);
		color: var(--origam-color__feedback--success---fgSubtle, #16a34a);
	}

	.story-actions__btn--cancel {
		background: var(--origam-color__feedback--danger---bgSubtle, #fee);
		color: var(--origam-color__feedback--danger---fgSubtle, #b00);
	}
</style>

<docs lang="md" src="@docs/components/InlineEdit/OrigamInlineEdit.md"/>
