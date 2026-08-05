<template>
	<component
			:is="tag"
			:id="id"
			ref="contentRef"
			:class="listClasses"
			:style="listStyles"
			:tabindex="tabIndex"
			role="listbox"
			@focus="handleFocus"
			@focusin="handleFocusIn"
			@focusout="handleFocusOut"
			@keydown="handleKeydown"
			@mousedown="handleMouseDown"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot name="default">
				<origam-list-children
						v-if="items"
						:items="items"
						:return-object="returnObject"
				>
					<template
							v-if="hasChildrenItem"
							#children="{item, index}"
					>
						<slot
								name="childrenItem"
								v-bind="{item, index}"
						/>
					</template>

					<template
							v-if="hasDivider"
							#divider="{itemProps}"
					>
						<slot
								name="divider"
								v-bind="itemProps"
						/>
					</template>

					<template
							v-if="hasSubheader"
							#subheader="{itemProps}"
					>
						<slot
								name="subheader"
								v-bind="itemProps"
						/>
					</template>

					<template
							v-if="hasGroup"
							#group="{itemProps}"
					>
						<slot
								name="group"
								v-bind="itemProps"
						/>
					</template>

					<template
							v-if="hasGroupActivator"
							#groupActivator="{props, isOpen, events, toggleIcon}"
					>
						<slot
								name="groupActivator"
								v-bind="{props, isOpen, events, toggleIcon}"
						/>
					</template>

					<template
							v-if="hasItem"
							#item="{itemProps}"
					>
						<slot
								name="item"
								v-bind="itemProps"
						/>
					</template>
				</origam-list-children>
			</slot>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, shallowRef, StyleValue, toRef, useSlots } from 'vue'
	import { OrigamDefaultsProvider, OrigamListChildren } from '../../components'


	import {
		useBorder,
		useBothColor,
		useCreateList,
		useDensity,
		useDimension,
		useElevation,
		useItems,
		useMargin,
		useNested,
		usePadding,
		useProps,
		useRounded,
		useStyle
} from '../../composables'

	import { DENSITY, KEYBOARD_VALUES, LINES, OPEN_STRATEGY, SELECT_STRATEGY } from '../../enums'

	import type { IListProps} from '../../interfaces'

	import type { IListEmits } from '../../interfaces/List/list.interface'

	import type { TFocusLocation } from '../../types'

	import { deepEqual, focusChild } from '../../utils'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListProps>(), {
		tag: 'div',
		lines: LINES.ONE,
		selectStrategy: SELECT_STRATEGY.SINGLE_LEAF,
		openStrategy: OPEN_STRATEGY.LIST,
		itemType: 'type',
		items: () => [],
		itemTitle: 'title',
		itemValue: 'value',
		itemChildren: 'children',
		itemProps: 'props',
		valueComparator: deepEqual,
		density: DENSITY.DEFAULT
	})

	defineEmits<IListEmits>()

	const {filterProps} = useProps<IListProps>(props)

	// Push visual-token props down to every descendant `<origam-list-item>` as
	// DEFAULTS — items that pass their own props still win.
	const slotDefaults = computed(() => ({
		'origam-list-item': {
			density: props.density,
			size: props.size,
			color: props.color,
			bgColor: props.bgColor
		}
	}))

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {items} = useItems(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {elevationClasses} = useElevation(props)
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {children, open, parents, select} = useNested(props)
	const slots = useSlots()

	useCreateList()

	const isFocused = shallowRef(false)
	const contentRef = ref<HTMLElement>()

	const lineClasses = computed(() => {
		return [
			props.lines ? `origam-list--${props.lines}-line` : undefined
		]
	})
	const tabIndex = computed(() => {
		return (props.disabled || isFocused.value) ? -1 : 0
	})

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleFocus = (e: FocusEvent) => {
		if (!isFocused.value && !(e.relatedTarget && contentRef.value?.contains(e.relatedTarget as Node))) {
			focus()
		}
	}
	const handleFocusIn = () => {
		isFocused.value = true
	}
	const handleFocusOut = () => {
		isFocused.value = false
	}
	const handleKeydown = (e: KeyboardEvent) => {
		if (!contentRef.value) return

		if (e.key === KEYBOARD_VALUES.DOWN) {
			focus('next')
		} else if (e.key === KEYBOARD_VALUES.UP) {
			focus('prev')
		} else if (e.key === KEYBOARD_VALUES.HOME) {
			focus('first')
		} else if (e.key === KEYBOARD_VALUES.END) {
			focus('last')
		} else {
			return
		}

		e.preventDefault()
	}
	const handleMouseDown = () => {
		isFocused.value = true
	}
	const focus = (location?: TFocusLocation) => {
		if (contentRef.value) {
			return focusChild(contentRef.value, location)
		}
	}

	/*********************************************************
	 * Slots
	 ********************************************************/
	const hasChildrenItem = computed(() => {
		return slots.childrenItem
	})
	const hasDivider = computed(() => {
		return slots.divider
	})
	const hasSubheader = computed(() => {
		return slots.subheader
	})
	const hasGroup = computed(() => {
		return slots.group
	})
	const hasGroupActivator = computed(() => {
		return slots.groupActivator
	})
	const hasItem = computed(() => {
		return slots.item
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const listStyles = computed(() => {
		return [
			colorStyles.value,
			dimensionStyles.value,
			borderStyles.value,
			roundedStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const listClasses = computed(() => {
		return [
			'origam-list',
			{
				'origam-list--disabled': props.disabled,
				'origam-list--nav': props.nav,
				'origam-list--slim': props.slim
			},
			colorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			lineClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(listStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		open,
		select,
		focus,
		children,
		parents,
		filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-list {
		padding-block-start: var(--origam-list---padding-block-start, 8px);
		padding-block-end: var(--origam-list---padding-block-end, 8px);
		padding-inline-start: var(--origam-list---padding-inline-start, 0);
		padding-inline-end: var(--origam-list---padding-inline-end, 0);

		position: var(--origam-list---position, relative);
		overflow: var(--origam-list---overflow, auto);
		outline: var(--origam-list---outline, none);

		border-color: var(--origam-list---border-color, var(--origam-color__text---primary));
		border-style: var(--origam-list---border-style, solid);
		border-width: var(--origam-list---border-width, 0);
		border-radius: var(--origam-list---border-radius, 0px);

		background: var(--origam-list---background, var(--origam-color__surface---default));
		box-shadow: var(--origam-list---box-shadow, var(--origam-shadow---none));
		color: var(--origam-list---color, var(--origam-color__text---primary));

		pointer-events: var(--origam-list---pointer-events, auto);
		user-select: var(--origam-list---user-select, auto);

		&--border {
			--origam-list---border-width: thin;
			--origam-list---box-shadow: none;
		}

		&--disabled {
			--origam-list---pointer-events: none;
			--origam-list---user-select: none;
		}

		&--nav {
			--origam-list---padding-inline: 8px;
			--origam-list-subheader---font-size: var(--origam-list__subheader---nav-font-size, 0.75rem);
			--origam-list---indent-padding: var(--origam-list---indent-padding-nav, -8px);
		}

		&--rounded {
			--origam-list---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			--origam-list---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-list---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-list---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-list---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-list---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-list---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--subheader {
			--origam-list---padding-block-start: 0px;
		}

		&--slim {
			--origam-list-group---prepend-width: var(--origam-list---slim-prepend-width, 28px);
		}

		&--density-default {
			--origam-list---density: 0px;
		}

		&--density-compact {
			--origam-list---density: -8px;
		}

		&--density-comfortable {
			--origam-list---density: 8px;
		}

		&__overlay {
			background-color: var(--origam-list__overlay---background-color, var(--origam-color__overlay---scrim));
			border-radius: var(--origam-list__overlay---border-radius, inherit);
			opacity: var(--origam-list__overlay---opacity, 0);
			pointer-events: var(--origam-list__overlay---pointer-events, none);
			position: var(--origam-list__overlay---position, absolute);
			bottom: var(--origam-list__overlay---position-bottom, 0);
			left: var(--origam-list__overlay---position-left, 0);
			right: var(--origam-list__overlay---position-right, 0);
			top: var(--origam-list__overlay---position-top, 0);
			transition-property: var(--origam-list__overlay---transition-property, opacity);
			transition-duration: var(--origam-list__overlay---transition-duration, 0.2s);
			transition-timing-function: var(--origam-list__overlay---transition-timing-function, ease-in-out);
		}
	}
</style>

