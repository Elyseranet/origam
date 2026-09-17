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

				<div
						:id="groupLabelId"
						class="origam-checkbox-group__label"
				>
					<slot
							name="label"
							v-bind="{label, required}"
					>
						<origam-label
								:required="required"
								:text="label"
								tag="span"
						/>
					</slot>
				</div>

				<origam-defaults-provider :defaults="checkboxDefaults">
					<origam-selection-control-group
							:id="id"
							ref="origamSelectionControlGroupRef"
							v-model="model"
							:aria-describedby="messagesId"
							:aria-labelledby="groupLabelledBy"
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

	const slots = defineSlots<ICheckboxGroupSlots>()

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
	 * Nommage du groupe (#814)
	 *
	 * @description
	 * ⛔ Ce composant posait `:id="id"` A LA FOIS sur l'`<origam-label>` et
	 * sur l'`<origam-selection-control-group>`, et pointait
	 * `aria-labelledby` sur cet id partage. Mesure (Chromium, Histoire
	 * construit, variante « Default ») : DEUX porteurs pour
	 * `checkbox-group-v-2` — `<label class="origam-label">` et
	 * `<div role="group">` — donc un id duplique, invalide en HTML.
	 *
	 * @description
	 * ⚠️ La racine, elle, ne portait PAS cet id : `<origam-input>` pose
	 * `:id="styleId"` sur sa racine et n'expose l'id du consommateur qu'a
	 * son slot `#default` (#790). Le releve d'origine en annoncait trois,
	 * il y en avait deux — mesure, pas lecture.
	 *
	 * @description
	 * ⛔ L'AUTO-REFERENCE est reelle, mais seulement quand la prop `label`
	 * est posee ET le slot `#label` surcharge : l'`<origam-label>` ne rend
	 * plus rien, le seul porteur restant de l'id est le groupe lui-meme, et
	 * `aria-labelledby` resout alors vers `<div class="origam-selection-
	 * control-group">` — mesure `AUTO-REFERENCE : true` sur les deux
	 * composants. Aucune variante de story ne couvrait ce cas. Dans le rendu
	 * par defaut l'id resolvait vers le `<label>` (premier dans l'ordre du
	 * document) et le nom calcule etait correct — `group "Notifications"`.
	 *
	 * @description
	 * Patron repris de #810 (`OrigamRatingField`) : la cible d'
	 * `aria-labelledby` est un WRAPPER dedie, pas l'element de libelle, pour
	 * qu'un slot `label` surcharge garde un groupe nomme. Le wrapper est en
	 * `display: contents` — il doit porter un id sans introduire de boite,
	 * sinon les enfants du slot cessent d'etre les elements flex de
	 * `.origam-input__control` et la mise en page bouge.
	 *
	 * @description
	 * ⛔ Pas de libelle -> pas d'`aria-labelledby` du tout. Viser un wrapper
	 * vide reproduirait le defaut sous une autre forme, et ce DS ne fabrique
	 * pas de nom de repli (#622).
	 ********************************************************/
	const groupLabelId = computed(() => `${id.value}-label`)
	const groupLabelledBy = computed(() => {
		return (props.label || slots.label) ? groupLabelId.value : undefined
	})

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

<style
		lang="scss"
		scoped
>
	/*
	 * Le wrapper n'existe que pour porter l'id cible d'`aria-labelledby`
	 * (#814). `display: contents` le retire de l'arbre des boites : les
	 * enfants du slot `label` restent les elements flex directs de
	 * `.origam-input__control`, donc la mise en page est inchangee — mesure
	 * avant/apres identique au pixel sur les variantes « Default » et
	 * « Slots - Label ».
	 */
	.origam-checkbox-group__label {
		display: contents;
	}
</style>
