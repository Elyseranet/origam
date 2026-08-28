<template>
	<origam-text-field
			:id="id"
			ref="origamTextFieldRef"
			v-model:focused="isFocused"
			v-model:model-value="search"
			:aria-label="t(label)"
			:class="selectClasses"
			:counter-value="counterValue"
			:dirty="isDirty"
			:placeholder="placeholder"
			:style="selectStyles"
			:title="t(label)"
			:validation-value="validationValue"
			v-bind="{ ...textFieldProps, ...comboboxAriaAttrs }"
			@blur="handleBlur"
			@change="handleChange"
			@keydown="handleKeydown"
			@update:model-value="handleModelUpdate"
			@click:clear="handleClear"
			@click:control="handleClickControl"
			@mousedown:control="handleMousedownControl"
	>
		<template
				v-if="slots.prepend"
				#prepend
		>
			<slot name="prepend"/>
		</template>

		<template
				v-if="slots.loader"
				#loader
		>
			<slot name="loader"/>
		</template>

		<template
				v-if="slots.prependInner"
				#prependInner
		>
			<slot name="prependInner"/>
		</template>

		<template
				v-if="slots.floatingLabel"
				#floatingLabel
		>
			<slot name="floatingLabel"/>
		</template>

		<template
				v-if="slots.label"
				#label
		>
			<slot name="label"/>
		</template>

		<template
				v-if="slots.prefix"
				#prefix
		>
			<slot name="prefix"/>
		</template>

		<template #default>
			<origam-menu
					ref="origamMenuRef"
					v-model="menu"
					:close-on-content-click="false"
					:disabled="menuDisabled"
					:eager="eager"
					:location="BLOCK.BOTTOM"
					:max-height="310"
					:offset="0"
					:open-on-click="false"
					:transition="{ component: OrigamExpandY }"
					:viewport-margin="0"
					activator="parent"
					content-class="origam-select__content"
					v-bind="{ ...menuProps }"
					@after-leave="handleAfterLeave"
			>

				<template #default>
					<origam-list
							v-if="hasList"
							:id="listboxId"
							ref="origamListRef"
							:density="density"
							:select-strategy="multiple ? SELECT_STRATEGY.INDEPENDENT : SELECT_STRATEGY.SINGLE_INDEPENDENT"
							:selected="selectedValues"
							:size="listSize"
							:tabindex="-1"
							aria-live="polite"
							v-bind="{ ...listProps }"
							@focusin="handleFocusin"
							@focusout="handleFocusout"
							@keydown="handleListKeydown"
							@mousedown="handleMousedown"
							@scroll-passive="handleListScroll"
					>

						<template #default>
							<slot name="items.prepend"/>

							<template v-if="hasNoData">
								<slot name="noData">
									<origam-list-item :title="t(noDataText)"/>
								</slot>
							</template>

							<template v-else>
								<origam-virtual-scroll
										ref="origamVirtualScrollRef"
										:items="displayItems"
										renderless
								>
									<template #item.renderless="{item, index, itemRef}">
										<slot
												name="item"
												v-bind="{item, index, props: menuListItemProps(item, itemRef, index)}"
										>
											<origam-list-item
													:key="index"
													v-bind="menuListItemProps(item, itemRef, index)"
											>
												<template
														v-if="showCheckbox || item.prependAvatar || item.prependIcon"
														#prepend="{isSelected}"
												>
													<origam-checkbox-btn
															:key="item"
															:model-value="isSelected"
															:ripple="false"
															:tabindex="-1"
													/>

													<origam-avatar
															v-if="item.prependAvatar"
															:image="item.prependAvatar"
													/>

													<origam-icon
															v-if="item.prependIcon"
															:icon="item.prependIcon"
													/>
												</template>

												<template #title>
													<template v-if="isPristine">
														<span class="origam-select__text">{{ item.title }}</span>
													</template>
													<template v-else>
                          <span class="origam-select__unmask">
                            {{ item.title.substr(0, getMatchStart(item)) }}
                          </span>
														<span class="origam-select__mask">
                            {{ item.title.substr(getMatchStart(item), getSearchLength()) }}
                          </span>
														<span class="origam-select__unmask">
                            {{ item.title.substr(getMatchStart(item) + getSearchLength()) }}
                          </span>
													</template>
												</template>
											</origam-list-item>
										</slot>
									</template>
								</origam-virtual-scroll>
							</template>

							<slot name="items.append"/>
						</template>
					</origam-list>
				</template>
			</origam-menu>

			<template
					v-for="(item, index) in model"
					:key="index"
			>
				<div
						:class="getSelectionClasses(index)"
						:style="[textColorStyles]"
				>
					<template v-if="hasChips">
						<slot
								name="chip"
								v-bind="{ item, index, props: chipSlotProps(item) }"
						>
							<origam-chip
									key="chip"
									ref="origamChipsRef"
									v-bind="chipSlotProps(item)"
							>
								<template #default>
									<slot name="selection">
										{{ item.title }}
									</slot>
								</template>
							</origam-chip>
						</slot>
					</template>
					<template v-else>
            <span class="origam-select__selection-text">
              <slot name="selection">
                {{ item.title }}
              </slot>
              <span
		              v-if="multiple && (index < model.length - 1)"
		              class="origam-select__selection-comma"
              >
                {{ divider }}
              </span>
            </span>
					</template>
				</div>
			</template>
		</template>

		<template
				v-if="slots.suffix"
				#suffix
		>
			<slot name="suffix"/>
		</template>

		<template #appendInner>
			<slot name="appendInner">
				<origam-avatar
						v-if="appendInnerAvatar"
						key="append-avatar"
						:density="density"
						:image="appendInnerAvatar"
				/>
				<origam-icon
						v-if="appendInnerIcon"
						key="append-icon"
						:density="density"
						:icon="appendInnerIcon"
				/>
				<origam-icon
						:icon="menuIcon"
						class="origam-select__menu-icon"
						@click="noop"
						@mousedown="handleMousedownMenuIcon"
				/>
			</slot>
		</template>

		<template
				v-if="slots.clear"
				#clear
		>
			<slot name="clear"/>
		</template>

		<template
				v-if="slots.append"
				#append
		>
			<slot name="append"/>
		</template>
	</origam-text-field>
</template><script
		lang="ts"
		setup
>
	import {
		computed,
		getCurrentInstance,
		inject,
		mergeProps,
		nextTick,
		onMounted,
		ref,
		shallowRef,
		StyleValue,
		toRef,
		useSlots,
		VNodeRef,
		watch
	} from 'vue'
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamCheckboxBtn from '../Checkbox/OrigamCheckboxBtn.vue'
	import OrigamChip from '../Chip/OrigamChip.vue'
	import OrigamExpandY from '../Transition/OrigamExpandY.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'
	import OrigamList from '../List/OrigamList.vue'
	import OrigamListItem from '../List/OrigamListItem.vue'
	import OrigamMenu from '../Menu/OrigamMenu.vue'
	import OrigamTextField from '../TextField/OrigamTextField.vue'
	import OrigamTranslateScale from '../Transition/OrigamTranslateScale.vue'
	import OrigamVirtualScroll from '../VirtualScroll/OrigamVirtualScroll.vue'

	import { useFilter } from '../../composables/Commons/filters.composable'
	import { useItems } from '../../composables/Commons/items.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useScrolling } from '../../composables/Commons/scrolling.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTeleportTypography } from '../../composables/Commons/teleport-typography.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { IN_BROWSER } from '../../consts/Commons/commons.const'
	import { ORIGAM_FORM_KEY } from '../../consts/Form/form.const'

	import { BLOCK } from '../../enums/Commons/anchor.enum'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { DIRECTION } from '../../enums/Commons/direction.enum'
	import { FILTERS_MODE } from '../../enums/Commons/filters.enum'
	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { SELECT_STRATEGY } from '../../enums/Commons/nested.enum'
	import { SIZES } from '../../enums/Commons/size.enum'
	import { TEXT_FIELD_TYPE } from '../../enums/TextField/text-field.enum'

	import type { IInternalListItem } from '../../interfaces/List/list-children.interface'
	import type { IItemProps } from '../../interfaces/Commons/item.interface'
	import type { ISelectProps } from '../../interfaces/Select/select.interface'

	import type { ISelectEmits, ISelectSlots } from '../../interfaces/Select/select.interface'

	import type { TOrigamChip } from '../../types/Chip/chip.type'
	import type { TOrigamList } from '../../types/List/list.type'
	import type { TOrigamMenu } from '../../types/Menu/menu.type'
	import type { TOrigamTextField } from '../../types/TextField/text-field.type'
	import type { TOrigamVirtualScroll } from '../../types/VirtualScroll/virtual-scroll.type'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { deepEqual, matchesSelector, noop, wrapInArray } from '../../utils/Commons/commons.util'
	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and filterProps for the Select component.
	 ********************************************************/
	const props = withDefaults(defineProps<ISelectProps>(), {
		type: TEXT_FIELD_TYPE.TEXT,
		centerAffix: true,
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		border: true,
		rounded: true,
		modelValue: null,
		role: 'combobox',
		itemType: 'type',
		items: () => [],
		itemTitle: 'title',
		itemValue: 'value',
		itemChildren: 'children',
		itemProps: 'props',
		valueComparator: deepEqual,
		menuIcon: MDI_ICONS.CHEVRON_DOWN,
		divider: ',',
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps,
		filterKeys: () => ['title'],
		filterMode: FILTERS_MODE.INTERSECTION,
		closeText: 'origam.close',
		openText: 'origam.open',
		noDataText: 'origam.no_data_text'
	})

	const emit = defineEmits<ISelectEmits>()

	defineSlots<ISelectSlots>()

	const {filterProps} = useProps<ISelectProps>(props)

	/*********************************************************
	 * DOM refs
	 *
	 * @description
	 * Refs to sub-components for forward-prop delegation.
	 * `vm` is the component instance — used as a fallback path
	 * to reach the underlying `<input>` when the forwardRefs-
	 * based proxy on `origamTextFieldRef` doesn't expose `$el`
	 * (filtered because of its `$` prefix).
	 ********************************************************/
	const {t} = useLocale()

	const origamTextFieldRef = ref<TOrigamTextField>()
	const origamMenuRef = ref<TOrigamMenu>()
	const origamVirtualScrollRef = ref<TOrigamVirtualScroll>()
	const origamListRef = ref<TOrigamList>()
	const origamChipsRef = ref<TOrigamChip>()

	// Component instance — used as a fallback path to reach the
	// underlying `<input>` (`vm.proxy.$el.querySelector('input')`) when
	// the `forwardRefs`-based proxy on `origamTextFieldRef` doesn't
	// expose certain props/methods (notably `$el`, which the proxy filters
	// because of its `$` prefix).
	const vm = getCurrentInstance()

	/*********************************************************
	 * WAI-ARIA combobox IDs
	 *
	 * @description
	 * Stable IDs for the listbox + per-option elements.
	 * `listboxId` is applied to the OrigamList root; each option
	 * gets `optionId(index)` so `aria-activedescendant` on the
	 * combobox input can point to the keyboard-highlighted row
	 * without moving DOM focus off the input.
	 ********************************************************/
	const _uid = getUid()
	const listboxId = `origam-select-listbox-${_uid}`
	const optionId = (index: number) => `${listboxId}-opt-${index}`

	// Index of the currently keyboard-highlighted option.
	// -1 = no highlight (listbox closed or nothing highlighted).
	const highlightIndex = shallowRef(-1)

	/*********************************************************
	 * Value & model
	 *
	 * @description
	 * Locale, slots, color, items, model and search bindings.
	 ********************************************************/
	const slots = useSlots()

	// Phase 3 (Vague B) — class-first companion alongside inline styles.
	// When `color` resolves to a tokenisable intent, `textColorClasses`
	// hits `.origam--color-{intent}` on the selection chip; `textColorStyles`
	// stays in parallel to cover legacy raw colors and to keep zero-regression
	// during the transition (strategy "a").

	/*********************************************************
	 * Color
	 ********************************************************/

	const {textColorClasses, textColorStyles} = useTextColor(toRef(props, 'color'))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {items, transformIn, transformOut} = useItems(props as IItemProps)

	/*********************************************************
	 * Value
	 ********************************************************/

	const model = useVModel(
			props,
			'modelValue',
			[],
			(v) => {
				return transformIn(v === null ? [null] : wrapInArray(v))
			},
			(v) => {
				const transformed = transformOut(v)
				return props.multiple ? transformed : (transformed[0] ?? null)
			}
	)
	const search = useVModel(props, 'search', '')

	const validationValue = computed(() => {
		return model.externalValue
	})

	const menuState = useVModel(props, 'menu')
	const menu = computed({
		get: () => menuState.value,
		set: (v) => {
			if (menuState.value && !v && origamMenuRef.value?.openChildren) {
				return
			}

			menuState.value = v
		}
	})
	const counterValue = computed(() => {
		if (typeof props.counterValue === 'function') {
			return props.counterValue(model.value)
		}

		if (props.counterValue) {
			return props.counterValue
		}

		return model.value.length
	})
	const selectedValues = computed(() => {
		return model.value.map((selection) => selection.value)
	})
	const highlightFirst = computed(() => {
		const selectFirst = props.autoSelectFirst === true ||
				(props.autoSelectFirst === 'exact' && search.value === displayItems.value[0]?.title)
		return selectFirst &&
				displayItems.value.length > 0 &&
				!isPristine.value &&
				!listHasFocus.value
	})
	const showCheckbox = computed(() => {
		return props.multiple && !props.hideSelected
	})

	const hasNoData = computed(() => {
		return !displayItems.value.length && (!props.hideNoData || slots.noData)
	})

	const isFocused = shallowRef(false)
	const form = inject(ORIGAM_FORM_KEY, null)
	const isPristine = shallowRef(true)

	const {filteredItems, getMatches} = useFilter(props, items, () => isPristine.value ? '' : search.value)

	let keyboardLookupPrefix = ''
	let keyboardLookupLastTime: number

	const listHasFocus = shallowRef(false)
	const selectionIndex = shallowRef(-1)
	const isSelecting = shallowRef(false)

	const displayItems = computed(() => {
		if (props.hideSelected) {
			return filteredItems.value.filter((filteredItem) => !model.value.some((s) => s.value === filteredItem.value))
		}

		return filteredItems.value
	})

	const menuDisabled = computed(() => {
		return (props.hideNoData && !displayItems.value.length) || props.readonly || form?.isReadonly.value
	})
	// Typography bridge across the teleport — see `useTeleportTypography` for
	// the full rationale (the menu is teleported out of the select's DOM
	// subtree, so a consumer's CSS never reaches it, and `rem`-sized option
	// text would stay pinned to the document root even if it did).
	const { typographyStyles: menuTypographyStyles } = useTeleportTypography(origamTextFieldRef, menu, (fontSize) => ({
		'--origam-list-item__title---font-size': fontSize,
		// Kept proportional to the title rather than pinned, so the pair
		// keeps its relationship at any scale.
		'--origam-list-item__subtitle---font-size': `calc(${ fontSize } * 0.875)`
	}))

	const menuProps = computed(() => {
		const consumerProps = (props.menuProps ?? {}) as Record<string, any>
		const consumerContentProps = (consumerProps.contentProps ?? {}) as Record<string, any>

		return {
			...consumerProps,
			contentProps: {
				...consumerContentProps,
				// The consumer's own style is listed last so it still wins —
				// the bridge is a default, not a lock.
				style: [menuTypographyStyles.value, consumerContentProps.style]
			}
		}
	})

	// Computed ARIA attrs forwarded to the TextField (→ <input>).
	// `aria-activedescendant` is only emitted when the menu is open
	// AND a real option is highlighted.
	const comboboxAriaAttrs = computed(() => {
		const activeDescendant =
			menu.value && highlightIndex.value >= 0
				? optionId(highlightIndex.value)
				: undefined

		/*
		 * `role="combobox"` MUST sit on the same element as the
		 * `aria-haspopup` / `aria-expanded` / `aria-controls`
		 * attributes — axe-core's `aria-allowed-attr` rule will
		 * flag those attrs as illegal on an element without the
		 * matching combobox role. We force the role here so
		 * regardless of how `OrigamTextField` distributes the
		 * fall-through attrs, the role travels with them.
		 */
		return {
			role: 'combobox',
			'aria-haspopup': 'listbox',
			'aria-expanded': menu.value ? 'true' : 'false',
			'aria-controls': menu.value ? listboxId : undefined,
			'aria-autocomplete': props.autocomplete ? 'list' : undefined,
			'aria-activedescendant': activeDescendant
		}
	})

	const menuListItemProps = (item: IInternalListItem, itemRef: VNodeRef | HTMLElement | null | undefined, index: number) => {
		const isKeyboardHighlighted = highlightIndex.value === index
		const isItemSelected = isSelected(item)
		return mergeProps(item.props ?? {}, {
			ref: itemRef as VNodeRef,
			key: index,
			id: optionId(index),
			role: 'option',
			'aria-selected': isItemSelected,
			active: (highlightFirst.value && index === 0) || isItemSelected || isKeyboardHighlighted,
			onClick: () => handleSelect(item, null)
		})
	}
	const isSelected = (item: IInternalListItem) => {
		return selectedValues.value.includes(item.value)
	}

	// Type-narrow helpers used in the template to avoid TS18048 / TS2365.
	// `getMatches(item)?.title` is `TFilterMatch | undefined` (union of
	// boolean | number | tuples) — coerce to number before arithmetic.
	// `search` is `string | undefined` from the VLS context — fallback to 0
	// for the length so substr stays well-typed.
	const getMatchStart = (item: IInternalListItem): number =>
		Number(getMatches(item)?.title ?? 0)
	const getSearchLength = (): number =>
		(search.value ?? '').length

	const {
		onListScroll: handleListScroll,
		onListKeydown: handleListKeydown
	} = useScrolling(origamListRef, origamTextFieldRef)

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleSelect = (item: IInternalListItem, set: boolean | null = true) => {
		if (item.props?.disabled) return

		if (props.multiple) {
			const index = model.value.findIndex((selection) => (props.valueComparator ? props.valueComparator(selection.value, item.value) : deepEqual(selection.value, item.value)))
			const add = set == null ? !~index : set

			if (~index) {
				const value = add ? [...model.value, item] : [...model.value]

				value.splice(index, 1)
				model.value = value
			} else if (add) {
				model.value = [...model.value, item]
			}

			if (props.clearOnSelect && props.autocomplete) {
				search.value = ''
			}
		} else {
			const add = set !== false

			model.value = add ? [item] : []

			if (props.autocomplete) {
				search.value = add ? item.title : ''
			}

			nextTick(() => {
				menu.value = false
				isPristine.value = true
			})
		}
	}
	const handleClear = () => {
		if (props.openOnClear) {
			menu.value = true
		}

		if (props.autocomplete) {
			search.value = ''
		}
	}
	const handleClickControl = (e: MouseEvent) => {
		emit('click:control', e)
	}
	const handleMousedownControl = (e: MouseEvent) => {
		emit('mousedown:control', e)

		if (menuDisabled.value) return

		menu.value = !menu.value

		// Select-all the input text on every field click in autocomplete-
		// single mode when there's a selection. The focus watcher already
		// runs select() on the focus TRANSITION, but that fires only on
		// the false→true edge — clicking an already-focused field, OR a
		// click that races with the menu's focus management (focusin
		// steal / scroll-strategy refocus), leaves the cursor at the end
		// with the selection cleared. Wiring it here too means EVERY
		// mousedown re-selects, so the next keystroke always replaces.
		// We DOM-query the `<input>` instead of going through the
		// `origamTextFieldRef` proxy — `forwardRefs` doesn't reliably
		// expose the underlying HTMLInputElement's `select()` method.
		// Two `nextTick`s — one for Vue to flush, one to land AFTER the
		// menu's focusin handler has run.
		if (props.autocomplete && !props.multiple && search.value) {
			// `setTimeout(0)` instead of `nextTick` — the browser's
			// click cursor-placement and the TextField's
			// `handleFocus` chain (which calls `input.focus()` →
			// cursor jumps to end) run AFTER mousedown's synchronous
			// handlers AND after Vue's microtask queue. A microtask
			// `nextTick` resolves too early (before the click cycle
			// finishes its cursor placement) so our select() takes
			// effect for an instant then gets clobbered. A macrotask
			// (setTimeout) lands AFTER all that, so the selection
			// sticks.
			setTimeout(() => {
				const root = vm?.proxy?.$el as HTMLElement | undefined
				const input = root?.querySelector('input') as HTMLInputElement | null
				input?.select()
			}, 0)
		}
	}
	const handleMousedownMenuIcon = (e: MouseEvent) => {
		if (menuDisabled.value) return

		if (isFocused.value) {
			// Field is already focused: stop propagation so the bubbling
			// mousedown does NOT also reach handleMousedownControl (which
			// would toggle the menu a second time and cancel the opening).
			e.preventDefault()
			e.stopPropagation()
			menu.value = !menu.value
		}
		// When the field is NOT yet focused, let the event bubble up to
		// handleControlMousedown in OrigamTextField.  That handler emits
		// mousedown:control → handleMousedownControl toggles the menu AND
		// manages focus in a single step.  Without this guard the first
		// click double-toggles (icon → open, control → close again) because
		// stopPropagation is only called after the first focus is set.
	}
	const handleKeydown = (e: KeyboardEvent) => {
		if (!e.key || props.readonly || form?.isReadonly.value) return

		const selectionStart = origamTextFieldRef.value?.selectionStart
		const length = model.value.length

		const keyAutocompleteOut = [KEYBOARD_VALUES.ENTER, KEYBOARD_VALUES.EMPTY, KEYBOARD_VALUES.DOWN, KEYBOARD_VALUES.UP, KEYBOARD_VALUES.HOME, KEYBOARD_VALUES.END]
		if ((props.autocomplete && selectionIndex.value > -1) || keyAutocompleteOut.includes(e.key as typeof keyAutocompleteOut[number])) {
			e.preventDefault()
		}

		const keyMenuOpen = [KEYBOARD_VALUES.ENTER, KEYBOARD_VALUES.DOWN, KEYBOARD_VALUES.EMPTY]
		if (keyMenuOpen.includes(e.key as typeof keyMenuOpen[number])) {
			menu.value = true
		}

		const keyMenuOut = [KEYBOARD_VALUES.ESC, KEYBOARD_VALUES.TAB]
		if (keyMenuOut.includes(e.key as typeof keyMenuOut[number])) {
			highlightIndex.value = -1
			menu.value = false
		}

		// WAI-ARIA combobox: highlight navigation stays on the <input>.
		// DOM focus never leaves the input — only aria-activedescendant changes.
		const itemCount = displayItems.value.length
		if (menu.value && itemCount > 0) {
			if (e.key === KEYBOARD_VALUES.DOWN) {
				highlightIndex.value = highlightIndex.value < itemCount - 1
					? highlightIndex.value + 1
					: 0
			} else if (e.key === KEYBOARD_VALUES.UP) {
				highlightIndex.value = highlightIndex.value > 0
					? highlightIndex.value - 1
					: itemCount - 1
			} else if (e.key === KEYBOARD_VALUES.HOME) {
				highlightIndex.value = 0
			} else if (e.key === KEYBOARD_VALUES.END) {
				highlightIndex.value = itemCount - 1
			} else if (e.key === KEYBOARD_VALUES.ENTER && highlightIndex.value >= 0) {
				handleSelect(displayItems.value[highlightIndex.value] as IInternalListItem, null)
				highlightIndex.value = -1
				return
			}
		}

		if (e.key === KEYBOARD_VALUES.HOME) {
			origamListRef.value?.focus('first')
		} else if (e.key === KEYBOARD_VALUES.END) {
			origamListRef.value?.focus('last')
		}

		const keyAutocompleteEnter = [KEYBOARD_VALUES.ENTER, KEYBOARD_VALUES.TAB]
		if (props.autocomplete) {
			if (highlightFirst.value && keyAutocompleteEnter.includes(e.key as typeof keyAutocompleteEnter[number])) {
				handleSelect(displayItems.value[0] as IInternalListItem)
			}

			if (e.key === KEYBOARD_VALUES.DOWN && highlightFirst.value) {
				origamListRef.value?.focus('next')
			}

			const keyBack = [KEYBOARD_VALUES.BACKSPACE, KEYBOARD_VALUES.DELETE]
			if (keyBack.includes(e.key as typeof keyBack[number])) {
				if (
						!props.multiple &&
						model.value.length > 0 &&
						!search.value
				) return handleSelect(model.value[0], false)

				if (~selectionIndex.value) {
					const originalSelectionIndex = selectionIndex.value
					handleSelect(model.value[selectionIndex.value], false)

					selectionIndex.value = originalSelectionIndex >= length - 1 ? (length - 2) : originalSelectionIndex
				} else if (e.key === KEYBOARD_VALUES.BACKSPACE && !search.value) {
					selectionIndex.value = length - 1
				}
			}

			if (!props.multiple) return

			if (e.key === KEYBOARD_VALUES.LEFT) {
				if (selectionIndex.value < 0 && (selectionStart ?? 0) > 0) return

				const prev = selectionIndex.value > -1
						? selectionIndex.value - 1
						: length - 1

				if (model.value[prev]) {
					selectionIndex.value = prev
				} else {
					selectionIndex.value = -1
					origamTextFieldRef.value?.setSelectionRange(search.value?.length ?? null, search.value?.length ?? null)
				}
			}

			if (e.key === KEYBOARD_VALUES.RIGHT) {
				if (selectionIndex.value < 0) return

				const next = selectionIndex.value + 1

				if (model.value[next]) {
					selectionIndex.value = next
				} else {
					selectionIndex.value = -1
					origamTextFieldRef.value?.setSelectionRange(0, 0)
				}
			}
		} else {
			// html select hotkeys
			const KEYBOARD_LOOKUP_THRESHOLD = 1000 // milliseconds

			const checkPrintable = (e: KeyboardEvent) => {
				const isPrintableChar = e.key.length === 1
				const noModifier = !e.ctrlKey && !e.metaKey && !e.altKey

				return isPrintableChar && noModifier
			}

			if (props.multiple || !checkPrintable(e)) return

			const now = performance.now()

			if (now - keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
				keyboardLookupPrefix = ''
			}

			keyboardLookupPrefix += e.key.toLowerCase()
			keyboardLookupLastTime = now

			const item = items.value.find((item) => item.title?.toLowerCase().startsWith(keyboardLookupPrefix))

			if (item !== undefined) {
				model.value = [item as IInternalListItem]
				const index = displayItems.value.indexOf(item)

				if (IN_BROWSER) {
					window.requestAnimationFrame(() => {
						if (index >= 0) {
							origamVirtualScrollRef.value?.scrollToIndex(index)
						}
					})
				}
			}
		}
	}
	const handleBlur = (e: FocusEvent) => {
		if (!origamListRef.value?.$el.contains(e.relatedTarget as HTMLElement)) {
			menu.value = false
		}
	}
	const handleChange = (e: Event) => {
		if (matchesSelector(origamTextFieldRef.value, ':autofill') || matchesSelector(origamTextFieldRef.value, ':-webkit-autofill')) {
			const item = items.value.find(item => item.title === (e.target as HTMLInputElement).value)

			if (item) {
				handleSelect(item as IInternalListItem)
			}
		}
	}
	const handleAfterLeave = () => {
		highlightIndex.value = -1
		if (isFocused.value) {
			isPristine.value = true
			origamTextFieldRef.value?.focus()
		}
	}
	const handleFocusin = () => {
		isFocused.value = true

		setTimeout(() => {
			listHasFocus.value = true
		})
	}
	const handleFocusout = () => {
		listHasFocus.value = false
	}
	const handleModelUpdate = (v: any) => {
		if (v == null || (v === '' && !props.multiple)) {
			model.value = []
		}

		if (origamTextFieldRef.value) {
			origamTextFieldRef.value.value = ''
		}
	}
	const handleMousedown = (e: MouseEvent) => {
		e.preventDefault()
	}

	/*********************************************************
	 * Chips
	 *
	 * @description
	 * Chip slot props and chip event handlers (close, keydown,
	 * mousedown) for the multi-select chip display mode.
	 ********************************************************/
	const hasChips = computed(() => {
		return props.chips || slots.chip
	})

	/*********************************************************
	 * chipSlotProps
	 *
	 * @description
	 * Return typed as Record<string, unknown> so vue-tsc does not try to
	 * validate the event-handler keys ('onClick:close', 'onKeydown', …)
	 * against IChipProps when the object is spread via v-bind on <origam-chip>.
	 * `bgColor` / `color` are deliberately OMITTED (#456) — they used to be
	 * hardcoded RGB literals, hiding the chip behind whatever theme was
	 * active. `OrigamChip`'s own SCSS already reads
	 * `var(--origam-chip---background-color)` / `var(--origam-chip---color)`
	 * with no inline fallback, and the token pipeline emits both
	 * (`packages/ds/tokens/component/chip.json` → `color.surface.overlay` /
	 * `color.text.primary`) — so leaving them unset lets Chip resolve its
	 * own themed default instead of this component overriding it.
	 ********************************************************/
	const chipSlotProps = (item: IInternalListItem): Record<string, unknown> => {
		return {
			closable: props.closableChips,
			disabled: item.props?.disabled,
			border: true,
			rounded: true,
			'onClick:close': (e: Event) => handleChipClose(e, item),
			onKeydown: (e: KeyboardEvent) => handleChipKeydown(e, item),
			onMousedown: (e: MouseEvent) => handleChipMousedown(e),
			modelValue: true,
			size: 'small',
			...props.chipProps
		}
	}

	const handleChipClose = (e: Event, item: IInternalListItem) => {
		e.stopPropagation()
		e.preventDefault()

		handleSelect(item, false)
	}
	const handleChipKeydown = (e: KeyboardEvent, item: IInternalListItem) => {
		if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

		e.preventDefault()
		e.stopPropagation()

		handleChipClose(e, item)
	}
	const handleChipMousedown = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
	}

	watch(isFocused, (val, oldVal) => {
		if (val === oldVal) return

		if (val) {
			isSelecting.value = true
			// Sync `search` (the input value) from the current model on focus
			// — but ONLY in autocomplete mode, where the input is meant to
			// be editable so the user can refine their pick. In non-
			// autocomplete mode this writes the selected title into the
			// `<input value>`, which then renders ALONGSIDE the
			// `.origam-select__selection` div that ALSO carries the title
			// → user sees "Germany Germany" in the field after a re-focus
			// (tab-out-then-back, click-elsewhere-then-back, …). The input
			// in non-autocomplete is effectively a screen-reader proxy
			// (`pointer-events: none`, opacity flipped on by --active) —
			// it must stay empty so it doesn't visually duplicate the
			// selection.
			if (props.autocomplete) {
				// @ts-expect-error TODO
				search.value = props.multiple ? '' : String(model.value?.at(-1)?.props.title ?? '')
			}
			isPristine.value = true

			nextTick(() => {
				isSelecting.value = false

				// Select-all the input text in single-autocomplete mode
				// when there IS a selection. The user expects: "click
				// the field with `France` already picked, start typing
				// → my keystrokes REPLACE the selection". Without the
				// select-all the cursor lands at the end and typing
				// appends — `France` + `S` → `FranceS` filters against
				// nothing and looks broken.
				// Skip in multiple mode (the input is meant to be a
				// fresh filter input, NOT a copy of any chip).
				// We DOM-query the input instead of going through
				// `origamTextFieldRef.value.select()` — the
				// `forwardRefs` proxy on TextField doesn't reliably
				// expose the HTMLInputElement's `select()` method.
				if (props.autocomplete && !props.multiple && search.value) {
					const root = vm?.proxy?.$el as HTMLElement | undefined
				const input = root?.querySelector('input') as HTMLInputElement | null
				input?.select()
				}
			})
		} else {
			if (!props.multiple && search.value == null) model.value = []
			else if (
					highlightFirst.value &&
					!listHasFocus.value &&
					!model.value.some(({value}) => value === displayItems.value[0].value)
			) {
				handleSelect(displayItems.value[0] as IInternalListItem)
			}
			menu.value = false
			search.value = ''
			selectionIndex.value = -1
		}
	})

	/*********************************************************
	 *  DEFERRED TO onMounted — NOT AN OPTIMISATION
	 *
	 *  @description
	 *  `watch(search, cb)` reads `search.value` synchronously the instant it
	 *  is created, to seed `oldValue`. `search` is a `useVModel(props,
	 *  'search', '')` model — its getter reads `props.search`. Creating this
	 *  watch at the top level of `setup()` forced that seeding read before
	 *  Vue's `beforeCreate` hook runs, which is where the ADR-005 theme
	 *  resolver patches `instance.props`. A `computed` (which the `useVModel`
	 *  model is) caches whatever its first evaluation saw and only
	 *  invalidates on a tracked dependency change; the resolver's
	 *  `Object.defineProperty` patch is not one on a static mount with no
	 *  parent re-render, so `search` stayed cached at `''` forever — a theme
	 *  naming `search` never landed. Deferring to `onMounted` delays the
	 *  seeding read to after the component's first render, which is already
	 *  past `beforeCreate`.
	 ********************************************************/
	onMounted(() => {
		watch(search, val => {
			if (!isFocused.value || isSelecting.value) return

			if (val) menu.value = true

			isPristine.value = !val
		})
	})

	watch(menu, () => {
		if (!props.hideSelected && menu.value && model.value.length) {
			const index = displayItems.value.findIndex(
					item => model.value.some((s) => (props.valueComparator ? props.valueComparator(s.value, item.value) : deepEqual(s.value, item.value)))
			)
			if (IN_BROWSER) {
				window.requestAnimationFrame(() => {
					if (index >= 0) {
						origamVirtualScrollRef.value?.scrollToIndex(index)
					}
				})
			}
		}
	})

	watch(() => props.items, (newVal, oldVal) => {
		if (menu.value) return

		if (isFocused.value && !oldVal.length && newVal.length) {
			menu.value = true
		}
	})

	const hasList = computed(() => {
		return !props.hideNoData || displayItems.value.length || slots.prependItem || slots.appendItem || slots.noData
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const textFieldProps = computed(() => {
		return origamTextFieldRef.value?.filterProps(props, ['class', 'id', 'style', 'counterValue', 'dirty', 'modelValue', 'placeholder', 'validationValue', 'focused'])
	})

	// The dropdown rows must sit on the same height rung as the control, so the
	// popup never dwarfs a small field. `size` is optional on the select and an
	// unsized `.origam-field` still resolves its control height from the `md`
	// rung — the list has to be told that explicitly, because with no `size` at
	// all `useSize` emits no rung class and the row would fall back to the
	// standalone-list height instead.
	const listSize = computed(() => {
		return props.size ?? SIZES.DEFAULT
	})

	const isDirty = computed(() => {
		return model.value.length > 0
	})
	const placeholder = computed(() => {
		return isDirty.value || (!isFocused.value && props.label && !props.persistentPlaceholder) ? undefined : props.placeholder
	})
	const label = computed(() => {
		return menu.value ? props.closeText : props.openText
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * selectStyles and selectClasses compose the BEM block.
	 ********************************************************/
	const selectStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const getSelectionClasses = (index: number) => {
		return [
			'origam-select__selection',
			{ 'origam-select__selection--selected': index === selectionIndex.value },
			textColorClasses.value
		]
	}
	const selectClasses = computed(() => {
		return [
			'origam-select',
			`origam-select--${props.multiple ? 'multiple' : 'single'}`,
			{
				'origam-select--autocomplete': props.autocomplete,
				'origam-select--active-menu': menu.value,
				'origam-select--chips': props.chips,
				'origam-select--selected': selectionIndex.value > -1
			},
			props.class
		]
	})
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #372 — `id` must be seeded with `() => props.id`: without it, the id
	 * returned here is a purely GENERATED one for the scoped stylesheet
	 * selector, and the template's `:id="id"` on `<origam-text-field>`
	 * would forward that generated id instead of the consumer's.
	 * @description
	 * `id` was already excluded from `textFieldProps` below
	 * (`filterProps(props, [..., 'id', ...])`) because it needed this
	 * explicit binding instead of the generic spread — the explicit
	 * binding was simply missing.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(selectStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps and imperative handles to parent ref
	 * consumers, forwarded through origamTextFieldRef.
	 ********************************************************/
	defineExpose(forwardRefs({
		filterProps,
		isFocused,
		menu,
		handleSelect,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamTextFieldRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-select {
		$this: &;

		:deep(.origam-field) {
			.origam-field__prefix,
			.origam-field__suffix,
			.origam-field__input {
				cursor: pointer;

				> input {
					opacity: 0;
					flex: 0 0;
					position: absolute;
					width: 100%;
					align-self: stretch;
					padding: 0;
					transition: none;
					pointer-events: none;
					caret-color: transparent;
					font-size: 16px;
				}

				> #{$this}__selection,
				> #{$this}__selection-text {
					+ input {
						position: static;
						flex: 1 1;
					}
				}
			}

			&.origam-field--dirty {
				#{$this}__selection {
					margin-inline-end: 2px;
				}
			}
		}

		&__selection-text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&__content {
			overflow: hidden;
			box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
			border-radius: 4px;
		}

		&__selection {
			display: inline-flex;
			align-items: center;
			letter-spacing: inherit;
			line-height: inherit;
			max-width: calc(100% - 2px - 2px);

			&:first-child {
				margin-inline-start: 0;
			}
		}

		&__menu-icon {
			margin-inline-start: 4px;
			transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		}

		&--selected {
			:deep(.origam-field) {
				.origam-field__input {
					> input {
						caret-color: transparent;
					}
				}
			}
		}

		&--active-menu {
			#{$this}__menu-icon {
				opacity: 1;
				transform: rotate(180deg);
			}
		}

		&#{$this}--autocomplete {
			:deep(.origam-field) {
				.origam-field__prefix,
				.origam-field__suffix,
				.origam-field__input {
					cursor: text;
				}

				.origam-field__input {
					> input {
						flex: 1 1;
						opacity: 1;
						pointer-events: auto;
						caret-color: inherit;
						position: static;
					}
				}

				input {
					min-width: 64px;
				}

				&:not(.origam-field--focused) {
					input {
						min-width: 0;
					}
				}
			}

			#{$this}__mask {
				background: rgb(66, 66, 66);
			}

			&#{$this}--selected {
				#{$this}__selection {
					opacity: 0.7;

					&--selected {
						opacity: 1;
					}
				}
			}

			&#{$this}--multiple {
				:deep(.origam-field) {
					input {
						position: relative;
					}
				}
			}

			&#{$this}--single {
				:deep(.origam-field) {
					input {
						left: 0;
						right: 0;
						padding-inline: 0;
						opacity: 1;
					}

					&.origam-field--active {
						input {
							transition: none;
						}
					}

					&.origam-field--dirty {
						&:not(.origam-field--focused) {
							input {
								opacity: 0;
							}
						}
					}

					&.origam-field--focused {
						#{$this}__selection {
							opacity: 0;
							position: absolute;
							pointer-events: none;
						}
					}
				}
			}
		}
	}
</style>

<style>
	.origam-select__content .origam-menu__content {
		display: block;
		width: 100%;
		max-width: none;
	}

	.origam-select__content .origam-menu__list {
		max-width: none;
	}

	.origam-select__content .origam-list-item {
		--origam-list-item---padding-inline-start: 32px;
	}
</style>
