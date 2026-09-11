<template>
	<origam-selection-control
			ref="origamSelectionControlRef"
			v-model="model"
			:aria-checked="indeterminate ? 'mixed' : undefined"
			:class="checkboxBtnClasses"
			:false-icon="falseIcon"
			:style="checkboxBtnStyles"
			:true-icon="trueIcon"
			type="checkbox"
			v-bind="controlProps"
			@update:model-value="handleChange"
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
	</origam-selection-control>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamSelectionControl } from '../../components'

	import {
	useProps,
	useStyle,
	useVModel
} from '../../composables'

	import { DENSITY, MDI_ICONS } from '../../enums'

	import type { ICheckboxBtnProps, ICheckboxBtnSlots} from '../../interfaces'

	import type { ICheckboxBtnEmits } from '../../interfaces/Checkbox/checkbox-btn.interface'

	import type { TOrigamSelectionControl } from "../../types"

	import { computed, ref, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots, indeterminate and model binding.
	 ********************************************************/

	const props = withDefaults(defineProps<ICheckboxBtnProps>(), {
		density: DENSITY.DEFAULT,
		trueIcon: MDI_ICONS.CHECKBOX_MARKED_OUTLINE,
		falseIcon: MDI_ICONS.CHECKBOX_BLANK_OUTLINE,
		indeterminateIcon: MDI_ICONS.MINUS_BOX
	})

	const emits = defineEmits<ICheckboxBtnEmits>()

	defineSlots<ICheckboxBtnSlots>()

	const {filterProps} = useProps<ICheckboxBtnProps>(props)

	const origamSelectionControlRef = ref<TOrigamSelectionControl>()

	/*********************************************************
	 * Value
	 ********************************************************/

	const indeterminate = useVModel(props, 'indeterminate')
	const model = useVModel(props, 'modelValue')

	const slots = useSlots()

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleChange = () => {
		if (indeterminate.value) {
			indeterminate.value = false
		}
	}
	const handleClickLabel = (e: MouseEvent) => {
		emits('click:label', e)
	}

	const falseIcon = computed(() => {
		return indeterminate.value
				? props.indeterminateIcon
				: props.falseIcon
	})
	const trueIcon = computed(() => {
		return indeterminate.value
				? props.indeterminateIcon
				: props.trueIcon
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const controlProps = computed(() => {
		return origamSelectionControlRef.value?.filterProps(props, ['modelValue', 'falseIcon', 'trueIcon', 'type', 'class', 'style'])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes BEM classes and passes through host styles.
	 ********************************************************/

	const checkboxBtnStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const checkboxBtnClasses = computed(() => {
		return [
			'origam-checkbox-btn',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(checkboxBtnStyles)


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
		isLoaded
	})
</script>
