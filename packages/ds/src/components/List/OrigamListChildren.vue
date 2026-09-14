<template>
	<div class="origam-list-children">
		<slot name="default">
			<template v-for="(item, index) in listItems">
				<slot
						name="children"
						v-bind="{item, index}"
				>
					<div
							:key="index"
							class="origam-list-children__item"
					>
						<slot
								v-if="hasDivider(item)"
								name="divider"
								v-bind="{ itemProps: item.props }"
						>
							<origam-divider v-bind="item.props"/>
						</slot>

						<slot
								v-else-if="hasSubheader(item)"
								name="subheader"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-subheader v-bind="item.props">
								<template
										v-if="hasSubheaderTitle"
										#default="{title}"
								>
									<slot
											name="subheaderTitle"
											v-bind="{title}"
									/>
								</template>
							</origam-list-subheader>
						</slot>

						<slot
								v-else-if="hasChildren(item)"
								name="group"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-group v-bind="item.props">
								<template
										v-if="hasGroupActivator"
										#activator="{props, isOpen, events, toggleIcon}"
								>
									<slot
											name="groupActivator"
											v-bind="{props, isOpen, events, toggleIcon}"
									/>
								</template>

								<template
										v-if="item.children"
										#items
								>
									<origam-list-children :items="item.children"/>
								</template>
							</origam-list-group>
						</slot>

						<slot
								v-else
								name="item"
								v-bind="{ itemProps: item.props }"
						>
							<origam-list-item v-bind="item.props"/>
						</slot>
					</div>
				</slot>
			</template>
		</slot>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, useSlots } from 'vue'
	import OrigamDivider from '../Divider/OrigamDivider.vue'
	import OrigamListGroup from './OrigamListGroup.vue'
	import OrigamListItem from './OrigamListItem.vue'
	import OrigamListSubheader from './OrigamListSubheader.vue'

	import { useUnsupportedProp } from '../../composables/Commons/unsupportedProp.composable'
	import { useCreateList } from '../../composables/List/createList.composable'
	import { useProps } from '../../composables/Commons/props.composable'

	import { LIST_ITEM_TYPE } from '../../enums/List/list-item.enum'

	import type { IInternalListItemChildren, IListChildrenEmits, IListChildrenSlots, IListItemChildren } from '../../interfaces/List/list-children.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListItemChildren>(), {})

	defineEmits<IListChildrenEmits>()

	defineSlots<IListChildrenSlots>()

	const {filterProps} = useProps<IListItemChildren>(props)

	const slots = useSlots()

	useCreateList()

	const listItems = computed(() => {
		return props.items.map((item) => {
			return {children: item.children, props: item.props, type: item.type, raw: item}
		})
	})

	/*********************************************************
	 * Props declarees sans effet (#550, critere C1)
	 *
	 * @description
	 * ⛔ Exposees dans la story, parfois documentees, et pourtant lues
	 * nulle part. Elles ne sont ni retirees — ca casserait la story et le
	 * type d'un consommateur pour une prop qui ne faisait deja rien — ni
	 * cablees a un comportement invente. Elles avertissent une fois, en
	 * dev, avec la raison exacte. Meme traitement que la famille Chart.
	 ********************************************************/
	useUnsupportedProp(
		'OrigamListChildren',
		'returnObject',
		'this renderer emits nothing — selection payload shape is decided by `<origam-list>` upstream.',
		() => props.returnObject !== undefined
	)

	/*********************************************************
	 * Slots
	 ********************************************************/
	const hasSubheaderTitle = computed(() => {
		return slots.subheaderTitle
	})
	const hasGroupActivator = computed(() => {
		return slots.groupActivator
	})

	/*********************************************************
	 * Branchement par item — c'est le `type` de l'item qui decide
	 *
	 * @description
	 * ⛔ Ces deux predicats testaient AUSSI la presence du slot
	 * (`slots.divider || item.type === DIVIDER`). Le slot n'appartient pas
	 * a un item : le fournir faisait donc matcher CHAQUE ligne, et une
	 * liste de 4 items rendue avec un `#divider` ne rendait que 4
	 * separateurs — plus aucun item, plus aucun subheader (`divider`
	 * gagnant le `v-else-if`). Le slot est un OVERRIDE de rendu pour les
	 * items de ce type, pas un selecteur de branche.
	 *
	 * @description
	 * Le motif correct pour « le consommateur fournit-il ce slot ? » reste
	 * `hasSubheaderTitle` / `hasGroupActivator` ci-dessus : ils pilotent un
	 * slot d'un composant enfant, pas le choix de branche d'une ligne.
	 ********************************************************/
	const hasDivider = (item: IInternalListItemChildren) => {
		return item.type === LIST_ITEM_TYPE.DIVIDER
	}
	const hasSubheader = (item: IInternalListItemChildren) => {
		return item.type === LIST_ITEM_TYPE.SUBHEADER
	}
	const hasChildren = (item: IInternalListItemChildren) => {
		return item.children && item.children.length
	}

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>
