<template>
	<template v-if="loaderConfig.isActive">
		<template v-if="loaderConfig.kind === 'skeleton'">
			<tr
					v-for="rowIndex in SKELETON_ROW_COUNT"
					:id="skeletonRowId(rowIndex)"
					:key="`skeleton-row_${rowIndex}`"
					class="origam-data-table-rows origam-data-table-rows--skeleton"
					aria-busy="true"
			>
				<td
						v-for="col in columns"
						:key="`skeleton-cell_${col.key}`"
						class="origam-data-table-rows__skeleton-cell"
				>
					<origam-skeleton variant="text" :loading="true" />
				</td>
			</tr>
		</template>
		<template v-else>
			<tr
					:id="id"
					key="loading"
					class="origam-data-table-rows origam-data-table-rows--loading"
					:class="textColorClasses"
					:style="textColorStyles"
			>
				<td :colspan="columns.length">
					<slot name="loading">
						{{ t(loadingText) }}
					</slot>
				</td>
			</tr>
		</template>
	</template>

	<template v-else-if="!(items && items.length) && !hideNoData">
		<tr
				:id="id"
				key="no-data"
				class="origam-data-table-rows origam-data-table-rows--no-data"
				:class="textColorClasses"
				:style="textColorStyles"
				v-bind="$attrs"
		>
			<td :colspan="columns.length">
				<slot name="no-data">
					{{ t(noDataText) }}
				</slot>
			</td>
		</tr>
	</template>

	<template v-else>
		<template v-for="(item, index) in items">
			<template v-if="item.type === 'group'">
				<slot
						name="group-header"
						v-bind="groupHeaderSlotProps(item, index)"
				>
					<origam-data-table-group-header-row
							:id="itemRowId(index)"
							:key="`group-header_${item.id}`"
							v-bind="groupHeaderRowProps(item, index)"
					>
						<template
								v-if="$slots['data-table-group']"
								#data-table-group="groupProps"
						>
							<slot
									name="data-table-group"
									v-bind="groupProps"
							/>
						</template>

						<template
								v-if="$slots['data-table-select']"
								#data-table-select="selectProps"
						>
							<slot
									name="data-table-select"
									v-bind="selectProps"
							/>
						</template>
					</origam-data-table-group-header-row>
				</slot>
			</template>

			<template v-else>
				<slot
						name="item"
						v-bind="itemSlotProps(item, index)"
				>
					<origam-data-table-row
							:id="itemRowId(index)"
							:item="item"
							v-bind="{...itemSlotProps(item, index).props}"
							@expand="emit('expand', $event)"
							@select="emit('select', $event)"
					>
						<template
								v-for="name in itemColumnSlotNames"
								:key="name"
								#[name]="cellProps"
						>
							<slot
									:name="name"
									v-bind="cellProps"
							/>
						</template>

						<template
								v-for="name in headerColumnSlotNames"
								:key="name"
								#[name]="titleProps"
						>
							<slot
									:name="name"
									v-bind="titleProps"
							/>
						</template>
					</origam-data-table-row>
				</slot>

				<template v-if="isExpanded(item)">
					<slot
							name="expanded-row"
							v-bind="slotProps(item, index)"
					/>
				</template>
			</template>
		</template>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import OrigamDataTableGroupHeaderRow from './OrigamDataTableGroupHeaderRow.vue'
	import OrigamDataTableRow from './OrigamDataTableRow.vue'
	import OrigamSkeleton from '../Skeleton/OrigamSkeleton.vue'

	import { useExpanded } from '../../composables/DataTable/expand.composable'
	import { useGroupBy } from '../../composables/DataTable/group.composable'
	import { useHeaders } from '../../composables/DataTable/headers.composable'
	import { useLoader } from '../../composables/Commons/loader.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { usePagination } from '../../composables/DataTable/pagination.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSelection } from '../../composables/DataTable/select.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'

	import type { IDataTableGroup, IDataTableGroupHeaderSlot } from '../../interfaces/DataTable/group.interface'
	import type { IDataTableItemBaseSlot, IDataTableItemSlot } from '../../interfaces/DataTable/items.interface'
	import type { IDataTableRowsEmits, IDataTableRowsProps, IDataTableRowsSlots } from '../../interfaces/DataTable/data-table-rows.interface'

	import { LOADER_KIND } from '../../enums/Commons/loader.enum'

	import { getPrefixedEventHandlers } from '../../utils/Commons/event.util'
	import {
		pickDataTableHeaderColumnSlotNames,
		pickDataTableItemColumnSlotNames
	} from '../../utils/DataTable/slot-name.util'

	import { computed, mergeProps, useAttrs, useSlots } from 'vue'

	const attrs = useAttrs()

	/*
	 * inheritAttrs — #916 / #853
	 *
	 * The root `v-if` chain is MIXED. Asked of the Vue 3.5.39 compiler rather
	 * than eyeballed, the root codegen node is:
	 *
	 *     COND{ FRAGMENT | COND{ element(tr) | FRAGMENT } }
	 *
	 * i.e. EXACTLY ONE of the three outcomes is a single element — the
	 * `no-data` `<tr>`. The `loaderConfig.isActive` branch is a FRAGMENT even
	 * when it renders one `<tr>`, because that outer `<template v-if>` wraps a
	 * nested `v-if` chain and the compiler emits a `Fragment` block for it;
	 * the default branch is a `v-for` over `items`. Vue cannot merge
	 * fallthrough attributes onto a fragment and logs "Extraneous non-props
	 * attributes", whose trace serialises every ancestor's props including Vue
	 * Router's `RouteProvider` vnode (~4.4 MB per occurrence, #853).
	 *
	 * ⛔ Measured on `develop` before this change, mounting with `class` /
	 * `data-cy` / `aria-label`:
	 *
	 *     no-data branch   (element root) -> all three LAND
	 *     loader   branch  (fragment)     -> all three land NOWHERE
	 *     items    branch  (fragment)     -> all three land NOWHERE
	 *
	 * So the flag alone would silently strip them from the `no-data` row —
	 * #492's defect. `v-bind="$attrs"` is re-bound THERE ONLY.
	 *
	 * ⚠️ Deliberately NOT added to the `--loading` `<tr>`, even though it
	 * looks like a twin of the `no-data` one. It is not a root: attributes do
	 * not reach it today, and binding them there would be a NEW behaviour
	 * smuggled in under a warning fix. The resulting asymmetry — the no-data
	 * row carries a consumer's `class`, the loading row does not — is
	 * pre-existing, is now measured, and is left for a decision of its own.
	 * The `v-for` branches likewise forward nothing: N sibling rows have no
	 * single home for one `id`, and each row already receives its own
	 * attributes through `itemSlotProps()` / `groupHeaderRowProps()`.
	 *
	 * ⚠️ The explicit `v-bind="$attrs"` is EQUIVALENT to the automatic
	 * fallthrough it replaces — same object, same element, same merge order
	 * (`mergeProps` concatenates `class` / `style`, later source wins for a
	 * scalar). That equivalence is what makes it safe here, and it matters
	 * because this component's `$attrs` is also a CONTROL channel: the
	 * prefixed `:row` / `:group-header` handlers are read out of it by
	 * `getPrefixedEventHandlers` above. #371 was exactly the failure of
	 * letting a non-DOM key reach a `<tr>` root, where Vue serialises it as a
	 * literal attribute (`index="0" mobile="false"`). This change neither
	 * adds nor removes any key from that path — do NOT "tidy" it into a
	 * broader forward without re-measuring #371's symptom.
	 */
	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IDataTableRowsProps>(), {
		loadingText: 'origam.data_iterator.loading_text',
		noDataText: 'origam.no_data_text'
	})

	const emit = defineEmits<IDataTableRowsEmits>()

	defineSlots<IDataTableRowsSlots>()

	/*********************************************************
	 * Forwarded slots (#550, critere C7)
	 *
	 * @description
	 * `<origam-data-table-row>` rend `item.{cle}` (valeur de cellule) et,
	 * en disposition mobile, `header.{cle}` (titre de colonne). Aucun des
	 * deux n'etait relaye : le contenu du consommateur s'arretait ici.
	 *
	 * @description
	 * `useSlots()` n'est pas une prop — la lecture ci-dessous ne tombe pas
	 * sous la reserve ADR-005 sur les lectures eager du corps de `setup`.
	 ********************************************************/
	const slots = useSlots()

	const itemColumnSlotNames = computed(() => {
		return pickDataTableItemColumnSlotNames(Object.keys(slots))
	})
	const headerColumnSlotNames = computed(() => {
		return pickDataTableHeaderColumnSlotNames(Object.keys(slots))
	})

	const {filterProps} = useProps<IDataTableRowsProps>(props)

	const {t} = useLocale()

	/** Fixed number of skeleton placeholder rows when kind='skeleton'. */
	const SKELETON_ROW_COUNT = 5

	const skeletonRowId = (index: number) => (props.id ? `${props.id}-skeleton-row-${index}` : undefined)
	const itemRowId = (index: number) => (props.id ? `${props.id}-row-${index}` : undefined)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {loaderConfig} = useLoader(props, LOADER_KIND.LINE)

	/*********************************************************
	 * Couleur des lignes propres au composant (#550)
	 *
	 * @description
	 * `color` etait declaree (heritee d'`ILoaderProps`) et lue nulle part,
	 * alors que la story expose un controle de couleur qui la traverse.
	 *
	 * @description
	 * Elle peint desormais les deux seules lignes que ce composant rend
	 * lui-meme : la ligne de chargement et la ligne « aucune donnee ». Les
	 * lignes d'items sont rendues par `<origam-data-table-row>` et se
	 * colorent via `rowProps`.
	 *
	 * @description
	 * `useTextColor` lit la prop dans un `computed` : la valeur ecrite par
	 * le resolveur de theme en `beforeCreate` (ADR-005) reste visible.
	 ********************************************************/
	const {textColorClasses, textColorStyles} = useTextColor(props, 'color')

	const {columns} = useHeaders()
	const {expandOnClick, toggleExpand, isExpanded} = useExpanded()
	const {isSelected, toggleSelect} = useSelection()
	const {toggleGroup, isGroupOpen} = useGroupBy()
	const {startIndex} = usePagination()

	const slotProps = (item: any, index: number): IDataTableItemBaseSlot => {
		return {
			index,
			item: item.raw,
			internalItem: item,
			columns: columns.value,
			isExpanded,
			toggleExpand,
			isSelected,
			toggleSelect
		}
	}
	const groupHeaderSlotProps = (item: IDataTableGroup, index: number): IDataTableGroupHeaderSlot => {
		const slotPropsLocal = slotProps(item, index)

		return Object.assign({}, slotPropsLocal, {
			index,
			item,
			columns: columns.value,
			...getPrefixedEventHandlers(attrs, ':group-header', () => slotPropsLocal),
			isExpanded,
			toggleExpand,
			isSelected,
			toggleSelect,
			toggleGroup,
			isGroupOpen
		})
	}
	/*********************************************************
	 * Props reellement declarees par la ligne d'en-tete de groupe
	 *
	 * @description
	 * ⛔ Ne PAS spreader `groupHeaderSlotProps()` sur le composant. Le
	 * scope de slot porte volontairement plus de cles que l'interface du
	 * composant n'en declare (`internalItem`, `isExpanded`, `toggleExpand`,
	 * `toggleSelect`, `isGroupOpen`) : elles servent au consommateur qui
	 * remplace le rendu via `#group-header`.
	 *
	 * @description
	 * Une cle non declaree ne disparait pas — elle tombe dans `$attrs` et
	 * atterrit sur la racine du composant, un `<tr>`, ou Vue la pose en
	 * ATTRIBUT DOM. Une fonction y serait serialisee en chaine
	 * (`toggleexpand="(item) => {…}"`). D'ou ce second constructeur, borne
	 * a ce que `IDataTableGroupHeaderRowProps` declare, plus les
	 * gestionnaires prefixes `:group-header` qui, eux, doivent bien passer.
	 ********************************************************/
	const groupHeaderRowProps = (item: IDataTableGroup, index: number) => {
		const slotPropsLocal = slotProps(item, index)

		return {
			index,
			item,
			columns: columns.value,
			isSelected,
			toggleGroup,
			...getPrefixedEventHandlers(attrs, ':group-header', () => slotPropsLocal)
		}
	}
	const itemSlotProps = (item: any, index: number): IDataTableItemSlot => {
		const slotPropsLocal = slotProps(item, index)

		return Object.assign({}, slotPropsLocal, {
			props: mergeProps(
					{
						key: `item_${item.key ?? item.index}`,
						onClick: expandOnClick.value ? () => {
							toggleExpand(item)
						} : undefined,
						item,
						cellProps: props.cellProps,
						/*********************************************************
						 * Forward `mobileBreakpoint` — never `mobile` (#371)
						 *
						 * @description
						 * `IDataTableRowProps` (extends `IDisplayProps`)
						 * declares `mobileBreakpoint`, not `index` or
						 * `mobile`. Each row resolves its OWN `mobile` from
						 * `mobileBreakpoint` via its own `useDisplay(props)`
						 * call — passing a precomputed `mobile` here was
						 * always dead weight, and passing `index` was never
						 * read by the row at all. Both fell through
						 * `<OrigamDataTableRow>`'s undeclared-key path
						 * straight into `$attrs`, which its
						 * `v-bind="$attrs"` root then serialised as literal
						 * DOM attributes on every rendered `<tr>`:
						 * `index="0" mobile="false"`.
						 *
						 * @description
						 * A prior fix (mobileBreakpoint forwarding) added
						 * the correct key without removing the stale one it
						 * replaced — same shape as the point-1 closure leak
						 * in this same file's `groupHeaderRowProps()`.
						 ********************************************************/
						mobileBreakpoint: props.mobileBreakpoint,
						'aria-rowindex': startIndex.value + index + 2
					},
					getPrefixedEventHandlers(attrs, ':row', () => slotPropsLocal),
					typeof props.rowProps === 'function'
							? props.rowProps({
								item: slotPropsLocal.item,
								index: slotPropsLocal.index,
								internalItem: slotPropsLocal.internalItem
							})
							: props.rowProps
			)
		})
	}

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-data-table-rows {
		&--no-data {
			text-align: var(--origam-data-table-empty---text-align, var(--origam-data-table__empty---text-align, center));
			color: var(--origam-data-table-rows--no-data---color, var(--origam-data-table__empty---color, var(--origam-color__text---secondary)));
		}

		&--loading {
			color: var(--origam-data-table-rows--loading---color, var(--origam-data-table---loading-row-color, var(--origam-color__text---secondary)));
		}

		&--skeleton {
			> .origam-data-table-rows__skeleton-cell {
				padding: var(--origam-data-table-rows--skeleton---cell-padding, 4px 8px);
			}
		}
	}
</style>

