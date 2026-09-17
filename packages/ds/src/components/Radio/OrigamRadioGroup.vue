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

				<div
						:id="groupLabelId"
						class="origam-radio-group__label"
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

				<origam-defaults-provider :defaults="radioDefaults">
					<origam-selection-control-group
							:id="id"
							ref="origamSelectionControlGroupRef"
							v-model="model"
							:aria-describedby="messagesId"
							:aria-labelledby="groupLabelledBy"
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

	const slots = defineSlots<IRadioGroupSlots>()

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
	 * Nommage du groupe (#814)
	 *
	 * @description
	 * ⛔ Ce composant posait `:id="id"` A LA FOIS sur l'`<origam-label>` et
	 * sur l'`<origam-selection-control-group>`, et pointait
	 * `aria-labelledby` sur cet id partage. Mesure (Chromium, Histoire
	 * construit, variante « Default ») : DEUX porteurs pour
	 * `radio-group-v-2` — `<label class="origam-label">` et
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
	 * document) et le nom calcule etait correct.
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
	.origam-radio-group__label {
		display: contents;
	}
</style>
