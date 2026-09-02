<template>
	<origam-input
			:id="id"
			ref="origamInputRef"
			v-model="model"
			:class="checkboxGroupClasses"
			:style="checkboxGroupStyles"
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

				<origam-defaults-provider :defaults="checkboxDefaults">
					<origam-selection-control-group
							:id="id"
							ref="origamSelectionControlGroupRef"
							v-model="model"
							:aria-describedby="messagesId"
							:aria-labelledby="label ? id : undefined"
							:disabled="isDisabled"
							:items="items"
							:multiple="multiple"
							:readonly="isReadonly"
							v-bind="{ ...controlProps , ...controlAttrs}"
					>
						<template #item="{item}">
							<slot
									name="item"
									v-bind="{id, messagesId, isDisabled, isReadonly, isValid}"
							>
								<origam-checkbox
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

	import OrigamCheckbox from './OrigamCheckbox.vue'
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import OrigamInput from '../Input/OrigamInput.vue'
	import OrigamLabel from '../Label/OrigamLabel.vue'
	import OrigamSelectionControlGroup from '../SelectionControl/OrigamSelectionControlGroup.vue'

	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { ICheckboxGroupEmits, ICheckboxGroupProps, ICheckboxGroupSlots } from '../../interfaces/Checkbox/checkbox-group.interface'
	import type { TOrigamInput } from '../../types/Input/input.type'
	import type { TOrigamSelectionControlGroup } from '../../types/SelectionControl/selection-control-group.type'

	import { filterInputAttrs } from '../../utils/Input/input.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'
	import { omitUndefined } from '../../utils/Commons/commons.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Le pendant checkbox d'`<OrigamRadioGroup>`, cree a la demande de
	 * l'utilisateur (ligne L53 du classeur d'inspection).
	 *
	 * @description
	 * ⛔ La difference structurante avec RadioGroup : `multiple` est EXPOSEE
	 * et vaut `true` par defaut. RadioGroup l'`Omit` de son interface et
	 * code `:multiple="false"` en dur dans son template — c'est correct pour
	 * un radio, dont la semantique est « exactement un ». Un groupe de cases
	 * a cocher, c'est l'inverse : en selectionner plusieurs est le cas normal.
	 ********************************************************/
	const props = withDefaults(defineProps<ICheckboxGroupProps>(), {
		density: DENSITY.DEFAULT,
		multiple: true
	})

	defineSlots<ICheckboxGroupSlots>()

	/*********************************************************
	 * ⛔ Emits declares des le depart, et ce n'est pas une formalite.
	 *
	 * @description
	 * RadioGroup a vecu sans aucune option `emits` alors qu'il lie
	 * `useVModel(props, 'modelValue')` en v-model sur trois enfants. Vue
	 * reste SILENCIEUX dans ce cas : son avertissement ne se declenche que si
	 * le composant a une option `emits` qui OMET l'evenement, jamais s'il
	 * n'en a aucune. Le symptome etait `onUpdate:modelValue` bloque dans
	 * `$attrs`, reinjecte sur `<origam-input>` par le spread `rootAttrs` — le
	 * handler du consommateur etait appele DEUX fois par selection.
	 ********************************************************/
	defineEmits<ICheckboxGroupEmits>()

	const {filterProps} = useProps<ICheckboxGroupProps>(props)

	/*********************************************************
	 * DOM refs
	 ********************************************************/
	const origamSelectionControlGroupRef = ref<TOrigamSelectionControlGroup>()
	const origamInputRef = ref<TOrigamInput>()

	/*********************************************************
	 * Value & identity
	 ********************************************************/
	const attrs = useAttrs()

	const uid = getUid()
	const id = computed(() => {
		return props.id || `checkbox-group-${uid}`
	})

	const model = useVModel(props, 'modelValue')

	/*********************************************************
	 * Forwarded props
	 ********************************************************/
	const [rootAttrs, controlAttrs] = filterInputAttrs(attrs)
	const inputProps = computed(() => {
		return origamInputRef.value?.filterProps(props, ['modelValue', 'id', 'focused', 'style', 'class'])
	})
	const controlProps = computed(() => {
		return origamSelectionControlGroupRef.value?.filterProps(props, ['modelValue', 'id', 'style', 'class', 'readonly', 'disabled', 'type', 'multiple', 'items'])
	})

	/*********************************************************
	 * checkboxDefaults — cascade visuelle vers les enfants.
	 *
	 * @description
	 * Les checkbox heritent des props visuelles du groupe par le wrapper
	 * `<origam-defaults-provider>`, PAS par lecture d'un `ref` de v-for :
	 * lire un tel ref (reassigne a chaque rendu) dans un computed relancait
	 * le rendu sans fin sur RadioGroup — « Maximum recursive updates in
	 * OrigamInput ».
	 *
	 * @description
	 * ⛔ On ne transmet QUE ce que le consommateur a REELLEMENT passe (#263,
	 * meme garde sur OrigamBtnGroup / OrigamAvatarGroup). `color` et
	 * `bgColor` sont des `TColor`, qui inclut `false` : la coercition des
	 * props booleennes de Vue resout chaque prop NON PASSEE a la valeur
	 * concrete `false`, il ne reste donc aucun `undefined` a filtrer pour
	 * `omitUndefined`. `density` porte en plus la valeur du `withDefaults` de
	 * CE groupe, qui n'est pas davantage l'intention du consommateur :
	 * transmise inconditionnellement, elle gagnait le `mergeDeep` contre une
	 * entree `'origam-checkbox'` d'un ancetre ou d'un theme et l'effacait en
	 * silence.
	 ********************************************************/
	const wasPropPassed = usePassedProps(props)
	const checkboxDefaults = computed(() => ({
		'origam-checkbox': omitUndefined({
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
	 ********************************************************/
	const checkboxGroupStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const checkboxGroupClasses = computed(() => {
		return [
			'origam-checkbox-group',
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(checkboxGroupStyles)

	/*********************************************************
	 * Expose
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
