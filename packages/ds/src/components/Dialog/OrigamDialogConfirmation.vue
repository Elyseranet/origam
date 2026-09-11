<template>
	<origam-dialog
			:id="id"
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
									:text="cancelText"
									@click="handleCancel"
							/>
						</origam-col>

						<origam-col cols="auto">
							<origam-btn
									:disabled="!validatable"
									:text="validateText"
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

	import { useLocale } from '../../composables/Commons/locale.composable'
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamCol from '../Grids/OrigamCol.vue'
	import OrigamContainer from '../Grids/OrigamContainer.vue'
	import OrigamDialog from './OrigamDialog.vue'
	import OrigamRow from '../Grids/OrigamRow.vue'

	import { useProps } from '../../composables/Commons/props.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { JUSTIFY } from '../../enums/Commons/justify.enum'

	import type { IDialogConfirmationProps } from '../../interfaces/Dialog/dialog-confirmation.interface'

	import type { IDialogConfirmationEmits, IDialogConfirmationSlots } from '../../interfaces/Dialog/dialog-confirmation.interface'

	import type { TOrigamDialog } from '../../types/Dialog/dialog.type'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots, and ref to the inner OrigamDialog.
	 ********************************************************/
	const props = withDefaults(defineProps<IDialogConfirmationProps>(), {
		cancellable: true,
		cancelTextKey: 'origam.dialog.confirmation.cancel',
		validateTextKey: 'origam.dialog.confirmation.validate'
	})

	const emits = defineEmits<IDialogConfirmationEmits>()

	/*********************************************************
	 * Libelles des boutons — traduits, et surchargeables.
	 *
	 * @description
	 * ⛔ Les deux etaient ECRITS EN DUR dans le template (`text="Cancel"`,
	 * `text="Validate"`), et l'interface n'exposait que `cancellable` : un
	 * consommateur non anglophone ne pouvait ni traduire ni renommer, sinon
	 * en remplacant le pied ENTIER. Sur un dialogue de confirmation — celui
	 * qui demande de valider une action — c'est le pire endroit possible.
	 *
	 * @description
	 * Les props transportent une CLE, jamais la chaine finale : c'est le
	 * composant qui traduit. Lecture dans un computed, jamais eagerly dans
	 * le corps de setup() (ADR-005).
	 *
	 * @description
	 * ⚠️ ANGLE MORT DU HARNAIS, mesure au classeur : le detecteur C8 ne
	 * scanne que aria-label, title, placeholder et alt. Une chaine passee en
	 * PROP d'affichage lui echappe entierement. Trois occurrences de ce type
	 * existaient dans tout le depot : ces deux-ci et le « Load more »
	 * d'OrigamInfiniteScroll, corrige sous #423.
	 ********************************************************/
	const { t } = useLocale()

	const cancelText = computed(() => t(props.cancelTextKey))
	const validateText = computed(() => t(props.validateTextKey))

	defineSlots<IDialogConfirmationSlots>()

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
