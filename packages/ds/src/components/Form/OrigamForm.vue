<template>
	<form
			ref="formRef"
			:class="formClasses"
			:style="formStyles"
			novalidate
			@reset="handleReset"
			@submit="handleSubmit"
	>
		<div class="origam-form__content">
			<slot
					name="default"
					v-bind="form"
			/>
		</div>

		<div
				v-if="hasMessages"
				class="origam-form__details"
				:style="typographyStyles"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages}"
			>
				<origam-messages
						:id="messagesId"
						:active="hasMessages"
						:messages="messages"
				>
					<template
							v-if="slots.message"
							#default="{message}"
					>
						<slot
								name="message"
								v-bind="{message}"
						/>
					</template>
				</origam-messages>
			</slot>
		</div>

		<div
				v-if="slots.actions"
				class="origam-form__actions"
		>
			<slot
					name="actions"
					v-bind="{submit: () => handleSubmit, reset: () => handleReset}"
			/>
		</div>
	</form>
</template>

<script
		lang="ts"
		setup
>
	import { computed, nextTick, ref, StyleValue, useSlots } from 'vue'
	import { OrigamMessages } from '../../components'

	import {
	useDefaults,
	useForm,
	useMessage,
	useProps,
	useStyle,
	useTypography,
	useValidation
} from '../../composables'

	import type { IFormProps, IFormSlots, ISubmitEventPromise} from '../../interfaces'

	import type { IFormEmits } from '../../interfaces/Form/form.interface'

	import { forwardRefs, getUid } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots, and composable setup.
	 ********************************************************/
	const _props = withDefaults(defineProps<IFormProps>(), {})
	const props = useDefaults(_props)

	const emits = defineEmits<IFormEmits>()

	defineSlots<IFormSlots>()
	const slots = useSlots()


	const {filterProps} = useProps<IFormProps>(props)

	/*********************************************************
	 * Reset & Submit
	 *
	 * @description
	 *
	 ********************************************************/
	const form = useForm(props)
	const formRef = ref<HTMLFormElement>()

	/*********************************************************
	 * Validation globale (form-level)
	 *
	 * @description
	 * useValidation gère les règles et errorMessages au niveau
	 * du formulaire, et s'enregistre auprès d'un éventuel
	 * formulaire parent (nested forms).
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		errorMessages,
		isValid: formIsValid,
		validate: validateFormRules,
		reset: resetFormValidation,
		validationClasses
	} = useValidation(props as any)

	/*********************************************************
	 * Messages globaux
	 *
	 * @description
	 * Seules les erreurs des règles du formulaire lui-même
	 * (props.rules, props.errorMessages) sont affichées ici.
	 * Les erreurs des champs enfants sont affichées sur les champs.
	 ********************************************************/
	const messagesId = `origam-form-messages-${ getUid() }`

	const { hasMessages, messages } = useMessage(props, errorMessages)
	const { typographyStyles } = useTypography(props, 'form__details')

	/*********************************************************
	 * Event
	 *
	 * @description
	 *
	 ********************************************************/
	const scrollToFirstError = async (options?: boolean | ScrollIntoViewOptions) => {
		await nextTick()

		const el = formRef.value?.querySelector('.origam-input--error') as HTMLElement | null

		if (!el) return

		const scrollOptions = typeof options === 'object'
			? options
			: { behavior: 'smooth' as const, block: 'center' as const }

		el.scrollIntoView(scrollOptions)
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleReset = (e: Event) => {
		e.preventDefault()
		form.reset()
		resetFormValidation()
	}

	const handleSubmit = (_e: Event) => {
		const e = _e as ISubmitEventPromise

		const ready = Promise.all([form.validate(), validateFormRules()])
				.then(([childResult]) => ({
					valid: childResult.valid && formIsValid.value !== false,
					errors: childResult.errors
				}))

		e.then = ready.then.bind(ready)
		e.catch = ready.catch.bind(ready)
		e.finally = ready.finally.bind(ready)

		emits('submit', e)

		if (!e.defaultPrevented) {
			ready.then(({ valid }) => {
				if (valid) {
					formRef.value?.submit()
				}
			})
		}

		ready.then(({ valid }) => {
			if (!valid && props.scrollToError) {
				scrollToFirstError(props.scrollToError)
			}
		})

		e.preventDefault()
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composable-driven class and style composition.
	 ********************************************************/
	const formStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const formClasses = computed(() => {
		return [
			'origam-form',
			validationClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(formStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps and form helpers to parent components.
	 ********************************************************/
	defineExpose(forwardRefs({ filterProps, ...form, errorMessages, formIsValid, scrollToFirstError,
		css,
		id,
		load,
		unload,
		isLoaded
	}, formRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-form {
		$this: &;

		&__actions {
			margin-top: var(--origam-form__actions---margin-top, 16px);
			display: var(--origam-form__actions---display, flex);
			gap: var(--origam-form__actions---gap, 8px);
		}

		&__details {
			align-items: flex-end;
			display: flex;
			font-size: var(--origam-form__details---font-size, 0.75rem);
			font-weight: var(--origam-form__details---font-weight, 400);
			grid-area: messages;
			letter-spacing: var(--origam-form__details---letter-spacing, 0.0333333333em);
			line-height: var(--origam-form__details---line-height, 1);
			min-height: var(--origam-form__details---min-height, 22px);
			padding-top: var(--origam-form__details---padding-top, 6px);
			overflow: hidden;
			justify-content: space-between;

			> .origam-icon {
				opacity: var(--origam-form__details---icon-opacity, 0.7);
			}
		}

		&--error {
			#{$this}__details {
				> .origam-messages {
					opacity: var(--origam-form--error---icon-opacity, 1);
					color: var(--origam-form--error---messages-color, var(--origam-color__feedback--danger---fgSubtle));
				}
			}

			#{$this}__details {
				> .origam-icon {
					opacity: var(--origam-form--error---icon-opacity, 1);
					color: var(--origam-form--error---icon-color, var(--origam-color__feedback--danger---fgSubtle));
				}
			}
		}
	}
</style>
