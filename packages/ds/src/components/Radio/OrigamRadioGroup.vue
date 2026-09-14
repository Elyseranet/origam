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
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import OrigamInput from '../Input/OrigamInput.vue'
	import OrigamLabel from '../Label/OrigamLabel.vue'
	import OrigamRadio from './OrigamRadio.vue'
	import OrigamSelectionControlGroup from '../SelectionControl/OrigamSelectionControlGroup.vue'

	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IRadioGroupEmits, IRadioGroupProps, IRadioGroupSlots } from '../../interfaces/Radio/radio-group.interface'
	import type { TOrigamInput } from '../../types/Input/input.type'
	import type { TOrigamSelectionControlGroup } from '../../types/SelectionControl/selection-control-group.type'

	import { filterInputAttrs } from '../../utils/Input/input.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'
	import { omitUndefined } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and filterProps for the RadioGroup component.
	 ********************************************************/
	const props = withDefaults(defineProps<IRadioGroupProps>(), {
		density: DENSITY.DEFAULT
	})

	defineSlots<IRadioGroupSlots>()

	defineEmits<IRadioGroupEmits>()

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
	//
	// Forward ONLY what the consumer actually passed — see #263 and the same
	// guard on `OrigamBtnGroup` / `OrigamAvatarGroup`. `color` / `bgColor` are
	// `TColor` (which includes `false`), so Vue's boolean-prop coercion
	// resolves each UNSET prop to the concrete value `false` — there is no
	// `undefined` left for `omitUndefined` to filter. `density` additionally
	// carries this group's OWN `withDefaults` value (`'default'`), which is
	// not the consumer's intent either; forwarded unconditionally it won the
	// `mergeDeep` against an ancestor/theme `'origam-radio'` entry and
	// silently erased it.
	const wasPropPassed = usePassedProps(props)
	const radioDefaults = computed(() => ({
		'origam-radio': omitUndefined({
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			density: wasPropPassed('density') ? props.density : undefined,
			size: wasPropPassed('size') ? props.size : undefined
		})
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
