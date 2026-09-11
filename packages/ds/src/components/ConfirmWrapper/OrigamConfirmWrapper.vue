<template>
	<div
			:class="confirmWrapperClasses"
			:style="confirmWrapperStyles"
	>
		<div
				v-if="hasHeader"
				class="origam-confirm-wrapper__header"
		>
			<slot name="header">
        <span
		        v-if="hasPrepend"
		        key="prepend"
		        class="origam-confirm-wrapper__prepend"
		        @click="handleClickPrepend"
        >
          <slot name="prepend">
            <origam-avatar
		            v-if="prependAvatar"
		            key="prepend-avatar"
		            :image="prependAvatar"
            />
            <origam-icon
		            v-if="prependIcon"
		            key="prepend-icon"
		            :icon="prependIcon"
            />
          </slot>
        </span>

				<span
						v-if="hasTitle"
						class="origam-confirm-wrapper__label"
				>
          <slot
		          name="title"
		          v-bind="{props: labelProps}"
          >
            <origam-label
		            ref="origamLabelRef"
		            tag="label"
		            v-bind="labelProps"
            />
          </slot>
        </span>

				<span
						v-if="hasAppend"
						key="append"
						class="origam-confirm-wrapper__append"
						@click="handleClickAppend"
				>
          <slot name="append">
            <origam-avatar
		            v-if="appendAvatar"
		            key="append-avatar"
		            :image="appendAvatar"
            />
            <origam-icon
		            v-if="appendIcon"
		            key="append-icon"
		            :icon="appendIcon"
            />
          </slot>
        </span>
			</slot>
		</div>

		<div class="origam-confirm-wrapper__content">
			<origam-defaults-provider :defaults="fieldDefaults">
				<div class="origam-confirm-wrapper__field">
					<slot name="default">
						<component
								:is="resolvedField"
								v-if="resolvedField"
								v-model="model"
								v-bind="defaults"
						/>
					</slot>
				</div>
				<div class="origam-confirm-wrapper__confirm">
					<slot name="confirm">
						<component
								:is="resolvedField"
								v-if="resolvedField"
								v-model="confirmModel"
								v-bind="{...resolvedConfirmDefaults, label: resolvedConfirmLabel}"
						/>
					</slot>
				</div>
			</origam-defaults-provider>
		</div>

		<div
				v-if="hasDetails"
				class="origam-confirm-wrapper__details"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages, messagesId}"
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

			<slot
					name="details"
					v-bind="detailsProps"
			/>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, useSlots, watch } from 'vue'

	import {
		OrigamAvatar,
		OrigamDefaultsProvider,
		OrigamIcon,
		OrigamLabel,
		OrigamMessages
	} from '../../components'

	import {
	useAdjacent,
	useDefaults,
	useLocale,
	useProps,
	useStyle,
	useVModel
} from '../../composables'
	import { DENSITY, DIRECTION } from '../../enums'
	import type { IConfirmWrapperProps, IConfirmWrapperSlots} from '../../interfaces'

	import type { IConfirmWrapperEmits } from '../../interfaces/ConfirmWrapper/confirm-wrapper.interface'
	import type { TOrigamLabel } from '../../types'
	import { forwardRefs, getUid, wrapInArray } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * Pairs a primary input with a confirmation input, validating that the
	 * two values match. Common pattern for password creation, email change,
	 * destructive operation confirmations.
	 *
	 * The `field` prop auto-renders the same Origam input twice (e.g.
	 * `field="text-field"` → two `<origam-text-field>`s); the `defaults`
	 * prop forwards arbitrary props to both. For full control, use the
	 * `default` and `confirm` slots and render any pair of inputs you like.
	 ********************************************************/
	const _props = withDefaults(defineProps<IConfirmWrapperProps>(), {
		density: DENSITY.DEFAULT,
		direction: DIRECTION.VERTICAL,
		modelValue: '',
		confirm: '',
		centerAffix: true
	})
	const props = useDefaults(_props)

	defineEmits<IConfirmWrapperEmits>()

	defineSlots<IConfirmWrapperSlots>()
	const slots = useSlots()

	const {t} = useLocale()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const confirmModel = useVModel(props, 'confirm')

	/*********************************************************
	 * Adjacent
	 *
	 * Prepend / append slot machinery shared with all input-style
	 * components — drives the icon/avatar render in the header.
	 ********************************************************/

	/*********************************************************
	 * Icon
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		hasPrepend,
		hasAppend,
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend
	} = useAdjacent(props)

	/*********************************************************
	 * Header
	 ********************************************************/
	const origamLabelRef = ref<TOrigamLabel>()

	const hasTitle = computed(() => {
		return props.label || slots.title
	})
	const hasHeader = computed(() => {
		return hasPrepend.value || hasAppend.value || hasTitle.value || slots.header
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const labelProps = computed(() => {
		return origamLabelRef.value?.filterProps(props, ['class', 'style', 'id', 'tag'])
	})

	/*********************************************************
	 * Ids
	 ********************************************************/
	const uid = getUid()
	const id = computed(() => {
		return props.id || `origam-confirm-wrapper-${uid}`
	})
	const messagesId = computed(() => {
		return `${id.value}-messages`
	})

	/*********************************************************
	 * Validation
	 *
	 * Dirty-state tracking: the wrapper enters "dirty" mode the first time
	 * the user types anything in the confirm input. Errors are surfaced only
	 * after that point so a fresh form does not flash red on first paint.
	 ********************************************************/
	const isPristine = ref(true)

	watch(confirmModel, () => {
		if (confirmModel.value != null && confirmModel.value !== '') {
			isPristine.value = false
		}
	})

	const isDisabled = computed(() => !!props.disabled)
	const isReadonly = computed(() => !!props.readonly)
	const isDirty = computed(() => {
		return !!(
				wrapInArray(model.value === '' ? null : model.value).length ||
				wrapInArray(confirmModel.value === '' ? null : confirmModel.value).length
		)
	})

	const confirmError = computed(() => {
		if (isPristine.value) return false
		if (!confirmModel.value && !model.value) return false

		return confirmModel.value !== model.value
	})

	const isError = computed(() => {
		return !!(props.error || confirmError.value)
	})

	const internalErrorMessages = computed<string[]>(() => {
		if (confirmError.value) {
			return [t('origam.validation.must_match')]
		}

		return []
	})

	const errorMessages = computed<string[]>(() => {
		if (props.errorMessages?.length) {
			return wrapInArray(props.errorMessages)
					.concat(internalErrorMessages.value)
		}

		return internalErrorMessages.value
	})

	/*********************************************************
	 * Messages & Details
	 ********************************************************/
	const messages = computed(() => {
		if (errorMessages.value.length) {
			return errorMessages.value
		}

		if (props.hint && (props.persistentHint || props.focused)) {
			return wrapInArray(props.hint)
		}

		return wrapInArray(props.messages ?? [])
	})
	const hasMessages = computed(() => {
		return messages.value.length > 0
	})
	const hasDetails = computed(() => {
		return !props.hideDetails || (
				props.hideDetails === 'auto' &&
				(hasMessages.value || slots.details)
		)
	})

	/*********************************************************
	 * Field component
	 *
	 * `field="text-field"` → renders `<origam-text-field>` twice. Useful
	 * shortcut when the inputs are identical other than their labels.
	 ********************************************************/
	const resolvedField = computed(() => {
		if (!props.field) return null

		return `origam-${props.field}`
	})
	const resolvedConfirmLabel = computed(() => {
		return props.confirmLabel || ((props.defaults as any)?.label
				? `${(props.defaults as any).label} (confirmation)`
				: undefined)
	})
	const resolvedConfirmDefaults = computed(() => {
		if (!props.defaults) return {}

		// Strip password-strength rules from the confirm field — the user
		// already met them in the primary field, the confirm only needs to
		// match. Keeps the second field free of duplicate validation noise.
		const {
			requirements, persistentRequirements,
			needTiny, needUppercase, needNumber, needSpecial, minLength,
			...rest
		} = props.defaults

		return rest
	})

	/*********************************************************
	 * Defaults Provider
	 *
	 * Pushes shared visual props (color, density, variant…) down to both
	 * field and confirm via `<OrigamDefaultsProvider>` so consumers don't
	 * have to repeat themselves.
	 ********************************************************/
	const fieldDefaults = computed(() => {
		const defaults: Record<string, unknown> = {}

		if (props.color !== undefined) defaults.color = props.color
		if (props.rounded !== undefined) defaults.rounded = props.rounded
		if (props.density !== undefined) defaults.density = props.density
		if (props.elevation !== undefined) defaults.elevation = props.elevation
		if (props.variant !== undefined) defaults.variant = props.variant
		if (isDisabled.value) defaults.disabled = true
		if (isReadonly.value) defaults.readonly = true
		if (props.required) defaults.required = true
		if (isError.value) defaults.error = true

		return {global: defaults}
	})

	/*********************************************************
	 * Details slot props
	 ********************************************************/
	const detailsProps = computed(() => {
		return {
			id: id.value,
			messagesId: messagesId.value,
			isDirty: isDirty.value,
			isDisabled: isDisabled.value,
			isReadonly: isReadonly.value
		}
	})

	/*********************************************************
	 * Validate (public API for Form integration)
	 ********************************************************/
	const validate = () => {
		isPristine.value = false

		return errorMessages.value
	}

	const reset = () => {
		model.value = ''
		confirmModel.value = ''
		isPristine.value = true
	}

	const resetValidation = () => {
		isPristine.value = true
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const confirmWrapperClasses = computed(() => {
		return [
			'origam-confirm-wrapper',
			`origam-confirm-wrapper--${props.direction}`,
			{
				'origam-confirm-wrapper--center-affix': props.centerAffix,
				'origam-confirm-wrapper--error': isError.value,
				'origam-confirm-wrapper--dirty': isDirty.value,
				'origam-confirm-wrapper--disabled': isDisabled.value,
				'origam-confirm-wrapper--readonly': isReadonly.value
			},
			props.class
		]
	})
	const confirmWrapperStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})

	/*********************************************************
	 * Expose
	 ********************************************************/
	const {filterProps} = useProps<IConfirmWrapperProps>(props)
	const {id: styleId, css, load, isLoaded, unload} = useStyle(confirmWrapperStyles)


	defineExpose(forwardRefs({filterProps, validate, reset, resetValidation,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleId
	}))
</script>

<style
		lang="scss"
		scoped
>
	.origam-confirm-wrapper {
		$this: &;

		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		display: grid;
		flex: 1 1 auto;
		grid-template-areas: "header" "content" "messages";
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto;

		&__header {
			grid-area: header;
			display: grid;
			flex: 1 1 auto;
			grid-template-areas: "prepend label append";
			grid-template-columns: max-content minmax(0, 1fr) max-content;
			grid-template-rows: auto;
			padding-block: var(--origam-confirm-wrapper---padding-top) var(--origam-confirm-wrapper---padding-bottom);
		}

		&__content {
			display: grid;
			flex: 1 1 auto;
			grid-area: content;
		}

		&__field {
			grid-area: field;
		}

		&__confirm {
			grid-area: confirm;
		}

		&__prepend,
		&__append {
			display: flex;
			align-items: flex-start;
		}

		&__prepend {
			grid-area: prepend;
			padding-inline-end: var(--origam-confirm-wrapper---padding-end);
		}

		&__append {
			grid-area: append;
			padding-inline-start: var(--origam-confirm-wrapper---padding-start);
		}

		&__details {
			align-items: flex-end;
			display: flex;
			font-size: var(--origam-confirm-wrapper---details-font-size);
			font-weight: 400;
			grid-area: messages;
			letter-spacing: var(--origam-confirm-wrapper---details-letter-spacing);
			line-height: var(--origam-confirm-wrapper---details-line-height);
			min-height: var(--origam-confirm-wrapper---details-min-height);
			overflow: hidden;
			justify-content: space-between;
			padding-block: var(--origam-confirm-wrapper---padding-top) var(--origam-confirm-wrapper---padding-bottom);
		}

		&__details,
		&__prepend,
		&__append {
			> .origam-icon {
				opacity: var(--origam-confirm-wrapper---icon-opacity);
			}
		}

		&--disabled {
			pointer-events: none;
		}

		&--vertical {
			#{$this}__content {
				grid-template-areas: "field field" "confirm confirm";
				grid-template-columns: repeat(2, 1fr);
				grid-template-rows: auto auto;
			}
		}

		&--horizontal {
			#{$this}__content {
				grid-template-areas: "field confirm";
				grid-template-rows: auto;
				gap: var(--origam-confirm-wrapper---horizontal-gap);
			}
		}

		&--disabled,
		&--error {
			#{$this}__details {
				> .origam-messages {
					opacity: 1;
				}
			}

			#{$this}__details,
			#{$this}__prepend,
			#{$this}__append {
				> .origam-icon {
					opacity: var(--origam-confirm-wrapper---icon-opacity-active);
				}
			}
		}

		&--disabled {
			#{$this}__details,
			#{$this}__prepend,
			#{$this}__append {
				opacity: var(--origam-confirm-wrapper---disabled-opacity);
			}
		}

		&--error {
			&:not(#{$this}--disabled) {
				#{$this}__details {
					> .origam-messages {
						color: var(--origam-confirm-wrapper--error---color);
					}
				}

				#{$this}__details,
				#{$this}__prepend,
				#{$this}__append {
					> .origam-icon {
						color: var(--origam-confirm-wrapper--error---color);
					}
				}
			}
		}

		&--center-affix {
			#{$this}__prepend,
			#{$this}__append {
				align-items: center;
				padding-top: 0;
			}
		}
	}
</style>
