<template>
	<Story
			group="components"
			title="Form/OrigamForm"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<ITypographyProps & { errorMessages: string[] }>({
					errorMessages: ['Form-level validation error']
				})"
		>
			<template #default="{ state }">
				<origam-form
						:error-messages="state.errorMessages"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:letter-spacing="state.letterSpacing"
						:line-height="state.lineHeight"
						data-cy="form-design"
						@submit.prevent
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<IFormProps>({
					disabled: false,
					readonly: false,
					fastFail: false,
					validateOn: 'input',
					scrollToError: false,
				})"
		>
			<template #default="{ state }">
				<origam-form
						:disabled="state.disabled"
						:readonly="state.readonly"
						:fast-fail="state.fastFail"
						:validate-on="state.validateOn"
						:scroll-to-error="state.scrollToError"
						data-cy="form-functional"
						@submit.prevent
				>
					<origam-text-field
							v-model="functionalName"
							label="Name"
							:rules="[v => !!v || 'Name is required']"
							data-cy="form-functional-name"
					/>
					<origam-number-field
							v-model="functionalAge"
							label="Age"
							:min="0"
							:max="150"
							data-cy="form-functional-age"
					/>
					<origam-btn type="submit" text="Submit" color="primary" data-cy="form-functional-submit"/>
				</origam-form>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled"  title="Disabled"/>
					<HstCheckbox v-model="state.readonly"  title="Readonly"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstSelect   v-model="state.validateOn"    title="Validate On"       :options="VALIDATE_ON_OPTIONS"/>
					<HstCheckbox v-model="state.fastFail"      title="Fast Fail"/>
					<HstCheckbox v-model="state.scrollToError" title="Scroll To Error"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - submit">
			<origam-form data-cy="form-emit-submit" @submit.prevent="logEvent('submit', $event)">
				<origam-text-field v-model="emitSubmitName" label="Name" data-cy="form-emit-submit-field"/>
				<origam-btn type="submit" text="Submit" color="primary" data-cy="form-emit-submit-btn"/>
			</origam-form>
		</Variant>

		<Variant title="Events - reset">
			<origam-form data-cy="form-emit-reset" @reset="logEvent('reset', $event)">
				<origam-text-field v-model="emitResetName" label="Name" data-cy="form-emit-reset-field"/>
				<origam-btn type="reset" text="Reset" variant="outlined" data-cy="form-emit-reset-btn"/>
			</origam-form>
		</Variant>

		<Variant title="Slots - Default">
			<origam-form data-cy="form-slot-default">
				<span>Custom slot content</span>
			</origam-form>
		</Variant>

		<Variant title="Slots - Actions">
			<origam-form data-cy="form-slot-actions">
				<origam-text-field v-model="actionsName" label="Name" data-cy="form-slot-actions-field"/>
				<template #actions="{ submit, reset }">
					<origam-btn
							text="Submit"
							color="primary"
							data-cy="form-slot-actions-submit"
							@click="submit"
					/>
					<origam-btn
							text="Reset"
							variant="outlined"
							data-cy="form-slot-actions-reset"
							@click="reset"
					/>
				</template>
			</origam-form>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-form data-cy="form-slot-messages" :error-messages="['Error A', 'Error B']">
				<origam-text-field label="Field" data-cy="form-slot-messages-field"/>
				<template #messages="{ messages }">
					<span v-for="(m, i) in messages" :key="i">{{ m }}</span>
				</template>
			</origam-form>
		</Variant>

		<Variant title="Slots - Message">
			<origam-form data-cy="form-slot-message" :error-messages="['Error message']">
				<origam-text-field label="Field" data-cy="form-slot-message-field"/>
				<template #message="{ message }">
					<span>{{ message }}</span>
				</template>
			</origam-form>
		</Variant>

		<Variant title="Prop — basic wiring (TextField + NumberField)">
			<origam-form data-cy="form-basic" @submit.prevent="basicHandleSubmit">
				<origam-text-field
						v-model="basicName"
						label="Name"
						:rules="[v => !!v || 'Name is required']"
						data-cy="form-basic-name"
				/>
				<origam-number-field
						v-model="basicAge"
						label="Age"
						:min="0"
						:max="150"
						data-cy="form-basic-age"
				/>
				<origam-btn type="submit" text="Submit" color="primary" data-cy="form-basic-submit"/>
				<p data-cy="form-basic-submit-status">submitted = {{ basicSubmitted }}</p>
			</origam-form>
		</Variant>

		<Variant title="Prop — validateOn">
			<origam-form validate-on="input" data-cy="form-validateon" @submit.prevent>
				<origam-text-field
						v-model="validateOnName"
						label="Name"
						:rules="[v => !!v || 'Name is required']"
						data-cy="form-validateon-field"
				/>
				<origam-btn type="submit" text="Submit" color="primary" data-cy="form-validateon-submit"/>
			</origam-form>
		</Variant>

		<Variant title="Prop — disabled">
			<origam-form disabled data-cy="form-disabled" @submit.prevent>
				<origam-text-field v-model="disabledName" label="Name" data-cy="form-disabled-name"/>
				<origam-btn type="submit" text="Submit" color="primary" data-cy="form-disabled-submit"/>
			</origam-form>
		</Variant>

		<Variant title="Prop — fastFail">
			<origam-form :fast-fail="true" data-cy="form-fastfail" @submit.prevent>
				<origam-text-field
						v-model="fastFailF1"
						label="Field 1"
						:rules="[v => !!v || 'Field 1 is required']"
						data-cy="form-fastfail-f1"
				/>
				<origam-text-field
						v-model="fastFailF2"
						label="Field 2"
						:rules="[v => !!v || 'Field 2 is required']"
						data-cy="form-fastfail-f2"
				/>
				<origam-btn type="submit" text="Submit" color="primary" data-cy="form-fastfail-submit"/>
			</origam-form>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IFormProps>({
					disabled: false,
					readonly: false,
					fastFail: false,
					validateOn: 'input',
				})"
		>
			<template #default="{ state }">
				<origam-form v-bind="state" data-cy="form-playground" @submit.prevent>
					<origam-text-field
							v-model="playgroundName"
							label="Name"
							:rules="[v => !!v || 'Name is required']"
							data-cy="form-playground-name"
					/>
					<origam-number-field
							v-model="playgroundAge"
							label="Age"
							:min="0"
							:max="150"
							data-cy="form-playground-age"
					/>
					<origam-btn type="submit" text="Submit" color="primary" data-cy="form-playground-submit"/>
				</origam-form>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled"   title="Disabled"/>
					<HstCheckbox v-model="state.readonly"   title="Readonly"/>
					<HstCheckbox v-model="state.fastFail"   title="Fast Fail"/>
					<HstSelect   v-model="state.validateOn" title="Validate On" :options="VALIDATE_ON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
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

	import { OrigamBtn, OrigamForm, OrigamNumberField, OrigamTextField } from '@origam/components'
	import { VALIDATE_ON } from '@origam/enums'
	import type { IFormProps, ITypographyProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS
	} from '@stories/const'

	const VALIDATE_ON_OPTIONS = Object.values(VALIDATE_ON).map(v => ({ label: v, value: v }))

	const functionalName = ref('')
	const functionalAge  = ref<number | null>(null)

	const actionsName = ref('')

	const emitSubmitName = ref('')
	const emitResetName  = ref('')

	const playgroundName = ref('')
	const playgroundAge  = ref<number | null>(null)

	const basicName      = ref('')
	const basicAge       = ref<number | null>(null)
	const basicSubmitted = ref(false)
	const basicHandleSubmit = () => { basicSubmitted.value = true }

	const validateOnName = ref('')

	const disabledName = ref('')

	const fastFailF1 = ref('')
	const fastFailF2 = ref('')

	</script>

<docs lang="md" src="@docs/components/Form/OrigamForm.md"/>
