<template>
	<origam-dialog
			ref="origamDialogRef"
			v-model="isActive"
			v-bind="dialogProps"
			@is-read="handleIsRead"
	>
		<template
				v-if="slots.activator"
				#activator="{props}"
		>
			<slot
					name="activator"
					v-bind="{props}"
			/>
		</template>

		<template
				v-if="slots.loader"
				#loader
		>
			<slot name="loader"/>
		</template>

		<template
				v-if="slots.header"
				#header
		>
			<slot name="header"/>
		</template>

		<template
				v-if="slots['header-append']"
				#header-append
		>
			<slot name="header-append"/>
		</template>

		<template
				v-if="slots['header-prepend']"
				#header-prepend
		>
			<slot name="header-prepend"/>
		</template>

		<template
				v-if="slots['header-title']"
				#header-title
		>
			<slot name="header-title"/>
		</template>

		<template
				v-if="slots['header-subtitle']"
				#header-subtitle
		>
			<slot name="header-subtitle"/>
		</template>

		<template
				v-if="slots['header-content']"
				#header-content
		>
			<slot name="header-content"/>
		</template>

		<template
				v-if="slots.asset"
				#asset
		>
			<slot name="asset"/>
		</template>

		<template
				v-if="slots.text"
				#text
		>
			<slot name="text"/>
		</template>

		<template
				v-if="slots.content"
				#content
		>
			<slot name="content"/>
		</template>

		<template
				v-if="slots.default"
				#default
		>
			<slot name="default"/>
		</template>

		<template #footer>
			<slot name="footer">
				<origam-container fluid>
					<origam-row :justify="JUSTIFY.SPACE_BETWEEN">
						<origam-col cols="auto">
							<origam-btn
									v-if="cancellable"
									text="Cancel"
									@click="handleCancel"
							/>
						</origam-col>

						<origam-col cols="auto">
							<origam-btn
									:disabled="!validatable"
									text="Validate"
									@click="handleValidate"
							/>
						</origam-col>
					</origam-row>
				</origam-container>
			</slot>
		</template>
	</origam-dialog>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, useSlots } from 'vue'
	import { OrigamBtn, OrigamCol, OrigamContainer, OrigamDialog, OrigamRow } from '../../components'

	import { useProps, useVModel } from '../../composables'

	import { JUSTIFY } from '../../enums'

	import type { IDialogConfirmationProps} from '../../interfaces'

	import type { IDialogConfirmationEmits } from '../../interfaces/Dialog/dialog-confirmation.interface'

	import type { TOrigamDialog } from "../../types"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots, and ref to the inner OrigamDialog.
	 ********************************************************/
	const props = withDefaults(defineProps<IDialogConfirmationProps>(), {
		cancellable: true
	})

	const emits = defineEmits<IDialogConfirmationEmits>()

	const {filterProps} = useProps<IDialogConfirmationProps>(props)

	const origamDialogRef = ref<TOrigamDialog>()

	const slots = useSlots()

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Two-way binding for open/close state and validation guard.
	 ********************************************************/
	const isActive = useVModel(props, 'modelValue')
	const validatable = ref(false)

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const dialogProps = computed(() => {
		return origamDialogRef.value?.filterProps(props, ['class', 'style', 'id', 'modelValue'])
	})

	/*********************************************************
	 * Events
	 *
	 * @description
	 * Handlers for read-state, validate, and cancel actions.
	 ********************************************************/

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleIsRead = (value: boolean) => {
		validatable.value = value
	}

	const handleValidate = () => {
		emits('validate')
		isActive.value = false
	}

	const handleCancel = () => {
		emits('cancel')
		isActive.value = false
	}

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>
