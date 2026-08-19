<template>
	<origam-overlay
			:id="id"
			ref="origamOverlayRef"
			v-model="isActive"
			:activator="activator"
			:activator-props="activatorProps"
			:class="menuClasses"
			:open-on-click="openOnClick"
			:open-on-context-menu="openOnContextMenu"
			:style="menuStyles"
			:target="target"
			absolute
			role="menu"
			v-bind="{...overlayProps, ...scopeId}"
			@keydown="handleKeydown"
			@click:outside="handleClickOutside"
	>
		<template #activator="{props}">
			<slot
					name="activator"
					v-bind="{props}"
			/>
		</template>

		<template #default>
			<div
					:class="menuContentClasses"
					:style="[colorStyles, roundedStyles, borderStyles, elevationStyles, paddingStyles, marginStyles]"
			>
				<slot name="default">
					<origam-list
							:density="density"
							:size="size"
							class="origam-menu__list"
					>
						<origam-list-subheader
								v-if="title"
								class="origam-menu__title"
						>{{ title }}
						</origam-list-subheader>
						<origam-list-group class="origam-menu__items">
							<template
									v-for="(item, index) in items"
									:key="index"
							>
								<origam-list-item
										v-if="!hasChilds(item)"
										class="origam-menu__item"
										v-bind="menuItemProps(item)"
										@click="handleSelect(item)"
								/>
								<origam-menu
										v-else
										v-bind="{...menuItemProps(item), ...overlayProps}"
										:items="childItems(item)"
										:offset="[8,8]"
										:open-on-context-menu="false"
										open-on-click
								>
									<template #activator="{props}">
										<origam-list-item
												:append-icon="MDI_ICONS.CHEVRON_RIGHT"
												class="origam-menu__item"
												v-bind="{...props, ...menuItemProps(item)}"
										/>
									</template>
								</origam-menu>
							</template>
						</origam-list-group>
					</origam-list>
				</slot>
			</div>
		</template>
	</origam-overlay>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, mergeProps, nextTick, provide, ref, shallowRef, StyleValue, toRef, watch } from 'vue'
	import OrigamList from '../List/OrigamList.vue'
	import OrigamListGroup from '../List/OrigamListGroup.vue'
	import OrigamListItem from '../List/OrigamListItem.vue'
	import OrigamListSubheader from '../List/OrigamListSubheader.vue'
	import OrigamOverlay from '../Overlay/OrigamOverlay.vue'
	import OrigamTranslateScale from '../Transition/OrigamTranslateScale.vue'

	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useScopeId } from '../../composables/Commons/scopeId.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { ORIGAM_MENU_KEY } from '../../consts/Menu/menu.const'

	import { INLINE } from '../../enums/Commons/anchor.enum'
	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
	import { LOCATION_STRATEGIES } from '../../enums/Commons/location.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { SCROLL_STRATEGIES } from '../../enums/Commons/scroll.enum'

	import type { IItemProps } from '../../interfaces/Commons/item.interface'
	import type { IListItemProps } from '../../interfaces/List/list-item.interface'
	import type { IMenuProps } from '../../interfaces/Menu/menu.interface'

	import type { IMenuEmits, IMenuSlots } from '../../interfaces/Menu/menu.interface'

	import type { TOrigamOverlay } from '../../types/Overlay/overlay.type'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { focusableChildren, focusChild, getNextElement, getPropertyFromItem, omit } from '../../utils/Commons/commons.util'
	import { forwardRefs } from '../../utils/Commons/forwardRefs.util'
	import { getUid } from '../../utils/Commons/getCurrentInstance.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, filterProps and core refs for the Menu component.
	 ********************************************************/
	const props = withDefaults(defineProps<IMenuProps>(), {
		closeDelay: 250,
		closeOnContentClick: true,
		locationStrategy: LOCATION_STRATEGIES.CONNECTED,
		openDelay: 300,
		scrim: false,
		openOnClick: true,
		location: INLINE.RIGHT,
		scrollStrategy: SCROLL_STRATEGIES.REPOSITION,
		offset: 8,
		// Matches `OrigamList`'s own default (see OrigamList.vue) so a
		// consumer's item objects use the same nested-children key
		// whether they render through `<origam-list>` or `<origam-menu>`.
		itemChildren: 'children',
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps
	})

	const emit = defineEmits<IMenuEmits>()

	defineSlots<IMenuSlots>()

	const {filterProps} = useProps<IMenuProps>(props)

	/*********************************************************
	 * Value & color
	 *
	 * @description
	 * isActive drives the overlay open/close state via v-model.
	 * colorStyles produces inline color/background-color from intent
	 * props so `<origam-menu color="primary">` actually takes effect.
	 * `useBothColor` wires those declarations onto `.origam-menu__content`
	 * so the inline-style specificity wins over class-level CSS.
	 ********************************************************/
	// `useBothColor` produces inline `color: …` and `background-color: …`
	// declarations from intent props (`color`, `bgColor`). Pre-fix the
	// SCSS read `var(--origam-menu---background)` from tokens but the
	// consumer-facing `<origam-menu color="primary">` was a silent
	// no-op. Wired here so the inline declaration on the
	// `.origam-menu__content` body wins via inline-style specificity.
	// Phase 3 (Vague C) — class-first companion alongside inline styles.
	// `colorClasses` lands the global `.origam--bg-{intent}` /
	// `.origam--color-{intent}` utility on the menu body for tokenised
	// intents; `colorStyles` keeps the legacy raw-color fallback.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	const {
		roundedClasses, roundedStyles,
		borderClasses, borderStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props)

	/*********************************************************
	 * Value
	 ********************************************************/

	const isActive = useVModel(props, 'modelValue')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {scopeId} = useScopeId()

	const uid = getUid()
	const id = computed(() => props.id || `origam-menu--${uid}`)

	const origamOverlayRef = ref<TOrigamOverlay>()

	/*********************************************************
	 * Parent / children menu tree
	 *
	 * @description
	 * Nested menus register with their parent via the ORIGAM_MENU_KEY
	 * injection. The parent tracks how many sub-menus are open so it
	 * knows when it is safe to close itself.
	 ********************************************************/
	const parent = inject(ORIGAM_MENU_KEY, null)
	const openChildren = shallowRef(0)

	provide(ORIGAM_MENU_KEY, {
		register () {
			++openChildren.value
		},
		unregister () {
			--openChildren.value
		},
		closeParents () {
			setTimeout(() => {
				if (!openChildren.value) {
					isActive.value = false
					parent?.closeParents()
				}
			}, 40)
		}
	})

	/*********************************************************
	 * Focus management
	 *
	 * @description
	 * Trap focus inside the menu while it is open.
	 * handleFocusIn keeps keyboard focus inside the content panel.
	 * handleKeydown handles Tab and arrow navigation.
	 * handleActivatorKeydown opens the menu on ArrowDown/Up.
	 ********************************************************/

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleFocusIn = async (e: FocusEvent) => {
		const before = e.relatedTarget as HTMLElement | null
		const after = e.target as HTMLElement | null

		await nextTick()

		if (
				isActive.value &&
				before !== after &&
				origamOverlayRef.value?.contentEl &&
				// We're the topmost menu
				origamOverlayRef.value?.globalTop &&
				// It isn't the document or the menu body
				![document, origamOverlayRef.value.contentEl].includes(after!) &&
				// It isn't inside the menu body
				!origamOverlayRef.value.contentEl.contains(after)
		) {
			const focusable = focusableChildren(origamOverlayRef.value.contentEl)
			focusable[0]?.focus()
		}
	}

	watch(isActive, (val) => {
		if (val) {
			parent?.register()
			document.addEventListener('focusin', handleFocusIn, {once: true})
		} else {
			parent?.unregister()
			document.removeEventListener('focusin', handleFocusIn)
		}
	})

	const handleClickOutside = () => {
		parent?.closeParents()
	}
	/**
	 * Fires the `select` emit for a picked leaf row.
	 *
	 * Bound only on the `v-if="!hasChilds(item)"` branch of the items
	 * loop, so a row that merely opens a submenu stays silent — opening a
	 * submenu is navigation, not a choice. The row's own `onClick` (spread
	 * through `menuItemProps`) still runs: Vue merges the two handlers
	 * rather than letting one replace the other, so consumers already
	 * relying on per-item callbacks keep working unchanged.
	 */
	const handleSelect = (item: IListItemProps) => {
		if (props.disabled) return

		emit('select', item)
	}
	const handleKeydown = (e: KeyboardEvent) => {
		if (props.disabled) return

		if (e.key === KEYBOARD_VALUES.TAB) {
			const nextElement = getNextElement(
					focusableChildren(origamOverlayRef.value?.contentEl as Element, false),
					e.shiftKey ? 'prev' : 'next',
					(el: HTMLElement) => el.tabIndex >= 0
			)
			if (!nextElement) {
				isActive.value = false
				origamOverlayRef.value?.activatorEl?.focus()
			}
		}
	}
	const handleActivatorKeydown = (e: KeyboardEvent) => {
		if (props.disabled) return

		const el = origamOverlayRef.value?.contentEl
		const keyDown = [KEYBOARD_VALUES.DOWN, KEYBOARD_VALUES.UP]

		if (el && isActive.value) {
			if (e.key === KEYBOARD_VALUES.DOWN) {
				e.preventDefault()
				focusChild(el, 'next')
			} else if (e.key === KEYBOARD_VALUES.UP) {
				e.preventDefault()
				focusChild(el, 'prev')
			}
		} else if (keyDown.includes(e.key as typeof keyDown[number])) {
			isActive.value = true
			e.preventDefault()
			setTimeout(() => setTimeout(() => handleActivatorKeydown(e)))
		}
	}

	/*********************************************************
	 * Computed props forwarded to overlay
	 *
	 * @description
	 * activatorProps merges ARIA attributes with consumer-provided
	 * activatorProps and the activator keydown handler.
	 * overlayProps filters and forwards relevant props to the inner overlay.
	 * hasChilds detects whether a menu item should render as a sub-menu.
	 ********************************************************/
	const activatorProps = computed(() => {
		return mergeProps({
			'aria-haspopup': 'menu',
			'aria-expanded': String(isActive.value),
			'aria-owns': id.value,
			onKeydown: handleActivatorKeydown
		}, props.activatorProps)
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const overlayProps = computed(() => {
		return origamOverlayRef.value?.filterProps(props, ['activatorProps', 'id', 'class', 'style', 'role', 'modelValue', 'absolute', 'activator', 'target', 'openOnClick', 'openOnContextMenu'])
	})

	/**
	 * ⛔ BUG 4 FIX — was `return item?.items`, hardcoding the child-items
	 * key to the literal `'items'` and ignoring `props.itemChildren`
	 * entirely (declared on `IItemProps`, defaulted above to `'children'`
	 * — the SAME default `OrigamList` already uses). A consumer whose
	 * item objects nest children under `children` (the DS-wide default,
	 * e.g. `OrigamMediaController`'s `configMenuItems`) got `hasChilds()
	 * === undefined` for every row: no nested `<origam-menu>` was ever
	 * rendered, so a click on that row fell through to the PARENT menu's
	 * ordinary `closeOnContentClick` handling and closed the whole menu
	 * instead of opening a submenu. `childItems` now resolves the
	 * children array through the same `getPropertyFromItem` helper
	 * `transformListItem` (packages/ds/src/utils/List/list-item.util.ts)
	 * already uses for `<origam-list>`, so both components agree on
	 * where an item's children live.
	 */
	const childItems = (item: IItemProps): Array<any> => {
		const children = getPropertyFromItem(item, props.itemChildren)

		return Array.isArray(children) ? children : []
	}
	const hasChilds = (item: IItemProps) => {
		return childItems(item).length > 0
	}

	/**
	 * The raw children array lives under `item[props.itemChildren]` (e.g.
	 * `item.children`) — it is NOT a real `<origam-menu>` / `<origam-list-
	 * item>` prop. Spreading `item` as-is (`v-bind="item"`) therefore leaks
	 * that key as a fallthrough attribute. When it cascades down to a
	 * native DOM element it collides with the browser's own read-only
	 * `Element.children` and Vue throws `TypeError: Cannot set property
	 * children of #<Element> which has only a getter` on every render.
	 * `menuItemProps` strips it before spreading (`childItems(item)` is
	 * bound explicitly as `:items="…"` on the recursive `<origam-menu>`
	 * instead — see the template).
	 */
	const menuItemProps = (item: IItemProps) => {
		return typeof props.itemChildren === 'string'
			? omit(item as Record<string, any>, [props.itemChildren])
			: item
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * menuStyles and menuClasses compose the BEM root classes.
	 ********************************************************/
	const menuStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const menuContentClasses = computed(() => {
		return [
			'origam-menu__content',
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value
		]
	})
	const menuClasses = computed(() => {
		return [
			'origam-menu',
			props.class
		]
	})
	const {id: styleId, css, load, isLoaded, unload} = useStyle(menuStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards overlay ref members plus openChildren and filterProps.
	 ********************************************************/
	defineExpose(forwardRefs({openChildren, filterProps,
		css,
		id,
		load,
		unload,
		isLoaded,
		styleId
	}, origamOverlayRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-menu {
		z-index: var(--origam-menu---z-index, 1000);
		background: transparent;
		box-shadow: none;
	}

	.origam-menu__content {
		background: var(--origam-menu---background, var(--origam-color__surface---raised));
		backdrop-filter: var(--origam-menu---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-menu---backdrop-filter, none);
		color: var(--origam-menu---color, var(--origam-color__text---primary));
		border-radius: var(--origam-menu---border-radius, 8px);
		box-shadow: var(--origam-menu---box-shadow);
		max-height: var(--origam-menu---max-height, calc(100vh - 32px));
		display: inline-block;
		width: max-content;

		.origam-menu__list {
			overflow: var(--origam-menu__content---overflow, auto);
			max-width: var(--origam-menu__content---max-width, 320px);
			padding: var(--origam-menu__content---padding, 4px);
		}
	}
</style>
