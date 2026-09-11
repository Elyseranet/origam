<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:class="radioClasses"
			:focused="isFocused"
			:style="radioStyles"
			v-bind="{...rootAttrs, ...inputProps}"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template #default="{id,messagesId,isDisabled,isReadonly,isValid}">
			<slot
					name="default"
					v-bind="{id,messagesId,isDisabled,isReadonly,isValid}"
			>
				<origam-radio-btn
						:id="id"
						ref="origamRadioBtnRef"
						v-model="model"
						:aria-describedby="messagesId"
						:disabled="isDisabled"
						:error="!isValid"
						:readonly="isReadonly"
						v-bind="{ ...radioBtnProps, ...controlAttrs }"
						@blur="handleBlur"
						@focus="handleFocus"
						@click:label="handleClickLabel"
				>
					<template
							v-if="slots.default"
							#default
					>
						<slot name="default"/>
					</template>

					<template
							v-if="slots.input"
							#input="{props, icon, model}"
					>
						<slot
								name="input"
								v-bind="{props, icon, model}"
						/>
					</template>

					<template
							v-if="slots.label"
							#label
					>
						<slot name="label"/>
					</template>
				</origam-radio-btn>
			</slot>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>

		<template
				v-if="slots.details"
				#details="detailsSlotProps"
		>
			<slot
					name="details"
					v-bind="detailsSlotProps"
			/>
		</template>

		<template
				v-if="slots.messages"
				#messages="{hasMessages, messages}"
		>
			<slot
					name="messages"
					v-bind="{hasMessages, messages}"
			/>
		</template>

		<template
				v-if="slots.message"
				#message="{message}"
		>
			<slot
					name="message"
					v-bind="{message}"
			/>
		</template>
	</origam-input>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, useAttrs, useSlots } from 'vue'
	import { OrigamInput, OrigamRadioBtn } from '../../components'

	import {
		useDefaults,
		useFocus,
		useHover,
		useMargin,
		usePadding,
		useProps,
		useStateEffect,
		useStyle,
		useVModel
} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { IRadioProps} from '../../interfaces'

	import type { IRadioEmits } from '../../interfaces/Radio/radio.interface'

	import type { TOrigamInput, TOrigamRadioBtn } from "../../types"

	import { filterInputAttrs, getUid } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the Radio component.
	 ********************************************************/
	const _props = withDefaults(defineProps<IRadioProps>(), {
		density: DENSITY.DEFAULT
	})

	// `useDefaults` resolves each prop against the closest
	// `<OrigamDefaultsProvider>` / theme `components['origam-radio']`
	// entry. Without this, `activeBgColor` and any other theme-level
	// default for this component were completely inert — the component
	// only ever saw its own `withDefaults()` value (see #279).
	const props = useDefaults(_props)

	const emits = defineEmits<IRadioEmits>()


	const {isHover, hoverState} = useHover(props)
	useStateEffect(props, isHover, undefined, hoverState, undefined)
	const {filterProps} = useProps<IRadioProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Refs to the inner Input and RadioBtn sub-components for
	 * forward-prop delegation.
	 ********************************************************/
	const origamInputRef = ref<TOrigamInput>()
	const origamRadioBtnRef = ref<TOrigamRadioBtn>()

	/*********************************************************
	 * Value & focus
	 *
	 * @description
	 * v-model binding, focus state, attrs, slots, uid and id.
	 ********************************************************/

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const {isFocused, onFocus: handleFocus, onBlur: handleBlur} = useFocus(props)
	const attrs = useAttrs()
	const slots = useSlots()

	const uid = getUid()
	const id = computed(() => props.id || `radio-${uid}`)

	/*********************************************************
	 * Event handlers
	 *
	 * @description
	 * Label click forwarded through the component tree.
	 ********************************************************/
	const handleClickLabel = (e: MouseEvent) => {
		emits('click:label', e)
	}

	/*********************************************************
	 * Forwarded props
	 *
	 * @description
	 * Attrs split between root and control; props forwarded
	 * to Input and RadioBtn sub-components via filterProps.
	 ********************************************************/
	const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)

	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused'])
	})
	const radioBtnProps = computed(() => {
		return origamRadioBtnRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'disabled', 'readonly', 'error'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * radioStyles and radioClasses compose the BEM block.
	 ********************************************************/
	// Spacing (padding / margin) is consumed HERE on the radio root —
	// the SelectionControl chain below only owns color / density / dimension,
	// so without this the `padding*` / `margin*` props are declared on the
	// interface but silently ignored.
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	const radioStyles = computed(() => {
		return [
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const radioClasses = computed(() => {
		return [
			'origam-radio',
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(radioStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
	 ********************************************************/
	defineExpose({
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleId
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-radio {
		&.origam-input {
			flex: 0 1 auto;
		}

		.origam-selection-control {
			min-height: calc(56px + 2 * var(--origam-input---density, 0px));
		}
	}
</style>

