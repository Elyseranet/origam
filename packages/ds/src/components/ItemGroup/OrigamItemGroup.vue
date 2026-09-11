<template>
	<component
			:is="tag"
			:id="id"
			:class="itemGroupClasses"
      :style="itemGroupStyles"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot
					name="default"
					v-bind="slotProps"
			/>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'

	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import { useGroup } from '../../composables/Commons/group.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_ITEM_GROUP_KEY } from '../../consts/ItemGroup/item-group.const'

	import { omitUndefined } from '../../utils/Commons/commons.util'

	import type { IItemGroupProps } from '../../interfaces/ItemGroup/item-group.interface'

	import type { IItemGroupEmits, IItemGroupSlots } from '../../interfaces/ItemGroup/item-group.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IItemGroupProps>(), {
		tag: 'div',
		selectedClass: 'origam-item--selected'
	})

	defineEmits<IItemGroupEmits>()

	defineSlots<IItemGroupSlots>()

	const {filterProps} = useProps<IItemGroupProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isSelected, select, next, prev, selected} = useGroup(props, ORIGAM_ITEM_GROUP_KEY)

	/*********************************************************
	 * slotDefaults
	 *
	 * @description
	 * ⛔ INERTE tel qu'ecrit, et conserve uniquement parce que retirer le
	 * fournisseur changerait le DOM rendu. La table est indexee sur
	 * `'origam-item'`, alors que le resolveur de defauts identifie l'enfant par
	 * SON PROPRE nom kebab, `origam-item-group-item`
	 * (`toKebabCase(vm.aliasName ?? vm.name ?? vm.__name)`,
	 * `getCurrentInstance.util.ts:38`). Les cles ne coincident jamais : l'entree
	 * est ecartee avant qu'aucune prop ne soit examinee, et l'avertissement de
	 * prop non supportee introduit par #515 ne part pas davantage.
	 *
	 * @description
	 * `selectedClass` atteint pourtant bien chaque item — par l'INJECTION de
	 * groupe, dans `useGroupItem` (`group.selectedClass.value ? … :
	 * props.selectedClass`), qui est le seul chemin reellement emprunte.
	 *
	 * @description
	 * ⛔ Re-indexer cette table n'est PAS un correctif gratuit : un groupe dont
	 * la classe a ete explicitement videe (`selected-class=""`) ecraserait alors
	 * la prop propre de l'item, ce qui casserait le repli par item que la doc
	 * decrit.
	 *
	 * @description
	 * Ne transmet QUE ce que le consommateur a reellement passe (#263).
	 * `selectedClass` porte aujourd'hui une valeur de `withDefaults`, donc rien
	 * d'indesirable ne fuit en pratique ; la garde maintient simplement tous les
	 * transmetteurs sur une seule et meme forme.
	 ********************************************************/
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-item': omitUndefined({
			selectedClass: wasPropPassed('selectedClass') ? props.selectedClass : undefined
		})
	}))

	const slotProps = computed(() => ({
		isSelected,
		select,
		next,
		prev,
		selected
	}))


	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const itemGroupClasses = computed(() => {
		return [
			'origam-item-group',
			props.class
		]
	})
	const itemGroupStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(itemGroupStyles, () => props.id)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		next,
		prev,
		select,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>
