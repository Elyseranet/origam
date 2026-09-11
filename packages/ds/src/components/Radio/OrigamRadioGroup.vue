<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:class="radioGroupClasses"
			:style="radioGroupStyles"
			v-bind="{ ...rootAttrs, ...inputProps }"
	>
		<template #default="{id, messagesId, isDisabled, isReadonly, isValid}">
			<slot
					name="default"
					v-bind="{id, messagesId, isDisabled, isReadonly, isValid}"
			>

				<slot
						name="label"
						v-bind="{label, required}"
				>
					<origam-label
							:id="id"
							:required="required"
							:text="label"
					/>
				</slot>

				<origam-defaults-provider :defaults="radioDefaults">
					<origam-selection-control-group
							:id="id"
							ref="origamSelectionControlGroupRef"
							v-model="model"
							:aria-describedby="messagesId"
							:aria-labelledby="label ? id : undefined"
							:disabled="isDisabled"
							:items="items"
							:multiple="false"
							:readonly="isReadonly"
							v-bind="{ ...controlProps , ...controlAttrs}"
					>
						<template #item="{item}">
							<slot
									name="item"
									v-bind="{id, messagesId, isDisabled, isReadonly, isValid}"
							>
								<origam-radio
										v-model="model"
										:aria-describedby="messagesId"
										:disabled="isDisabled"
										:readonly="isReadonly"
										v-bind="item"
								/>
							</slot>
						</template>
					</origam-selection-control-group>
				</origam-defaults-provider>
			</slot>
		</template>
	</origam-input>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, useAttrs } from 'vue'
	import { OrigamDefaultsProvider, OrigamInput, OrigamLabel, OrigamRadio, OrigamSelectionControlGroup } from '../../components'

	import {
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { IRadioGroupProps } from '../../interfaces'
	import type { TOrigamInput, TOrigamSelectionControlGroup } from "../../types"

	import { filterInputAttrs, getUid } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the RadioGroup component.
	 ********************************************************/
	const props = withDefaults(defineProps<IRadioGroupProps>(), {
		density: DENSITY.DEFAULT
	})

	const {filterProps} = useProps<IRadioGroupProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Refs to sub-components for forward-prop delegation.
	 ********************************************************/
	const origamSelectionControlGroupRef = ref<TOrigamSelectionControlGroup>()
	const origamInputRef = ref<TOrigamInput>()

	/*********************************************************
	 * Value & identity
	 *
	 * @description
	 * v-model binding, attrs splitting, uid and id derivation.
	 ********************************************************/
	const attrs = useAttrs()

	const uid = getUid()
	const id = computed(() => {
		return props.id || `radio-group-${uid}`
	})

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(props, 'modelValue')

	/*********************************************************
	 * Forwarded props
	 *
	 * @description
	 * Attrs split between root and control; props forwarded to
	 * Input, SelectionControlGroup and Radio sub-components.
	 ********************************************************/
	const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)
	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'id', 'focused', 'style', 'class'])
	})
	const controlProps = computed(() => {
		return origamSelectionControlGroupRef.value?.filterProps(props, ['modelValue', 'id', 'style', 'class', 'readonly', 'disabled', 'type', 'multiple', 'items'])
	})
	// Radios inherit the group's visual props through the
	// `<origam-defaults-provider :defaults="radioDefaults">` wrapper. Reading
	// `origamRadioRef` (a v-for array ref, reassigned every render) inside a
	// computed to derive the radios' own props re-triggered the render
	// endlessly — "Maximum recursive updates in OrigamInput". Defaults provide
	// the same forwarding with no ref read; per-item props still win.
	const radioDefaults = computed(() => ({
		'origam-radio': {
			color: props.color,
			bgColor: props.bgColor,
			density: props.density,
			size: props.size
		}
	}))

	const items = computed(() => {
		return props.items ?? []
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * radioGroupStyles and radioGroupClasses compose the BEM block.
	 ********************************************************/
	const radioGroupStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const radioGroupClasses = computed(() => {
		return [
			'origam-radio-group',
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(radioGroupStyles)


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
