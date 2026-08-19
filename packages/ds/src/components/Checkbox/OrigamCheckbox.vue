<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:class="checkboxClasses"
			:focused="isFocused"
			:style="checkboxStyles"
			v-bind="{...rootAttrs, ...inputProps}"
	>
		<template #default="{id,messagesId,isDisabled,isReadonly,isValid}">
			<slot
					name="default"
					v-bind="{id,messagesId,isDisabled,isReadonly,isValid}"
			>
				<origam-checkbox-btn
						:id="id"
						ref="origamCheckboxBtnRef"
						v-model="model"
						:aria-describedby="messagesId"
						:disabled="isDisabled"
						:error="!isValid"
						:readonly="isReadonly"
						v-bind="{ ...checkboxBtnProps, ...controlAttrs }"
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
							#input="{props, icon, textColorStyles, backgroundColorStyles, model}"
					>
						<slot
								name="input"
								v-bind="{props, icon, textColorStyles, backgroundColorStyles, model}"
						/>
					</template>

					<template
							v-if="slots.label"
							#label
					>
						<slot name="label"/>
					</template>
				</origam-checkbox-btn>
			</slot>
		</template>
	</origam-input>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamCheckboxBtn, OrigamInput } from '../../components'

	import {
		useFocus,
		useMargin,
		usePadding,
		useProps,
		useStyle,
		useVModel
} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { ICheckboxProps, ICheckboxSlots} from '../../interfaces'

	import type { ICheckboxEmits } from '../../interfaces/Checkbox/checkbox.interface'

	import type { TOrigamCheckboxBtn, TOrigamInput } from "../../types"

	import { filterInputAttrs, getUid } from '../../utils'

	import { computed, ref, StyleValue, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots, model binding and focus tracking.
	 ********************************************************/

	const props = withDefaults(defineProps<ICheckboxProps>(), {
		density: DENSITY.DEFAULT
	})

	const emits = defineEmits<ICheckboxEmits>()

	defineSlots<ICheckboxSlots>()

	const {filterProps} = useProps<ICheckboxProps>(props)

	const origamInputRef = ref<TOrigamInput>()
	const origamCheckboxBtnRef = ref<TOrigamCheckboxBtn>()

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')
	const {isFocused, onFocus: handleFocus, onBlur: handleBlur} = useFocus(props)
	const attrs = useAttrs()
	const slots = useSlots()

	const uid = getUid()
	const id = computed(() => {
		return props.id || `checkbox-${uid}`
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClickLabel = (e: MouseEvent) => {
		emits('click:label', e)
	}

	const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'class', 'style', 'id', 'focused'])
	})
	const checkboxBtnProps = computed(() => {
		return origamCheckboxBtnRef.value?.filterProps(props, ['class', 'style', 'modelValue', 'id', 'disabled', 'readonly', 'error'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and passes through host styles.
	 ********************************************************/

	// Spacing (padding / margin) is consumed HERE on the checkbox root —
	// the SelectionControl chain below only owns color / density / dimension,
	// so without this the `padding*` / `margin*` props are declared on the
	// interface but silently ignored.
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)

	const checkboxStyles = computed(() => {
		return [
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const checkboxClasses = computed(() => {
		return [
			'origam-checkbox',
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(checkboxStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
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
	.origam-checkbox {
		&.origam-input {
			flex: 0 1 auto;
		}

		.origam-selection-control {
			min-height: calc(56px + 2 * var(--origam-input---density, 0px));
		}
	}
</style>

