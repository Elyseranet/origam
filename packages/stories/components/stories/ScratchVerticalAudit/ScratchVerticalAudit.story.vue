<template>
	<Story
			group="components"
			title="ScratchVerticalAudit/VerticalAudit"
	>
		<Variant title="Default">
			<template #default>
				<div style="display: flex; flex-direction: column; gap: 24px; padding: 16px;">
					<div data-cy="vaudit-input" style="border: 1px dashed red; width: 320px;">
						<origam-input
								:direction="DIRECTION.VERTICAL"
								label="Bare input"
						>
							<template #default="{ id }">
								<input :id="id" placeholder="Type here…" style="border: none; outline: none; background: transparent; width: 100%;"/>
							</template>
						</origam-input>
					</div>

					<div data-cy="vaudit-textfield" style="border: 1px dashed red; width: 320px;">
						<origam-text-field
								v-model="textFieldModel"
								:direction="DIRECTION.VERTICAL"
								label="TextField"
						/>
					</div>

					<div data-cy="vaudit-textareafield" style="border: 1px dashed red; width: 320px;">
						<origam-textarea-field
								v-model="textareaFieldModel"
								:direction="DIRECTION.VERTICAL"
								label="TextareaField"
						/>
					</div>

					<div data-cy="vaudit-passwordfield" style="border: 1px dashed red; width: 320px;">
						<origam-password-field
								v-model="passwordFieldModel"
								:direction="DIRECTION.VERTICAL"
								label="PasswordField"
						/>
					</div>

					<div data-cy="vaudit-otpinputfield" style="border: 1px dashed red; width: 320px;">
						<origam-otp-input-field
								v-model="otpFieldModel"
								:direction="DIRECTION.VERTICAL"
								:length="6"
								label="OtpInputField"
						/>
					</div>

					<div data-cy="vaudit-numberfield" style="border: 1px dashed red; width: 320px;">
						<origam-number-field
								v-model="numberFieldModel"
								:direction="DIRECTION.VERTICAL"
								label="NumberField"
						/>
					</div>

					<div data-cy="vaudit-ratingfield" style="border: 1px dashed red; width: 320px;">
						<origam-rating-field
								v-model="ratingFieldModel"
								:direction="DIRECTION.VERTICAL"
								:length="5"
								label="RatingField"
						/>
					</div>

					<div data-cy="vaudit-filefield" style="border: 1px dashed red; width: 320px;">
						<origam-file-field
								v-model="fileFieldModel"
								:direction="DIRECTION.VERTICAL"
								label="FileField"
						/>
					</div>

					<div data-cy="vaudit-checkbox" style="border: 1px dashed red; width: 320px;">
						<origam-checkbox
								v-model="checkboxModel"
								:direction="DIRECTION.VERTICAL"
								label="Checkbox"
						/>
					</div>

					<div data-cy="vaudit-switch" style="border: 1px dashed red; width: 320px;">
						<origam-switch
								:model-value="switchModel"
								:direction="DIRECTION.VERTICAL"
								label="Switch"
						/>
					</div>
				</div>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'

	import {
		OrigamCheckbox,
		OrigamFileField,
		OrigamInput,
		OrigamNumberField,
		OrigamOtpInputField,
		OrigamPasswordField,
		OrigamRatingField,
		OrigamSwitch,
		OrigamTextField,
		OrigamTextareaField
	} from '@origam/components'
	import { DIRECTION } from '@origam/enums'

	const textFieldModel     = ref('')
	const textareaFieldModel = ref('')
	const passwordFieldModel = ref('')
	const otpFieldModel      = ref('')
	const numberFieldModel   = ref(0)
	const ratingFieldModel   = ref(0)
	const fileFieldModel     = ref(null)
	const checkboxModel      = ref(false)
	const switchModel        = ref(false)
</script>
