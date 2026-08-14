<template>
	<component
			:is="props.tag"
			:id="id"
			ref="rootRef"
			role="tablist"
			:aria-orientation="ariaOrientation"
			:class="tabsClasses"
			:style="tabsStyles"
			@keydown="handleKeydown"
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
	import { computed, ref, StyleValue } from 'vue'

	import { OrigamDefaultsProvider } from '../../components'

	import {
		useDefaults,
		useDensity,
		useGroup,
		useProps,
		useRounded,
		useStyle
	} from '../../composables'

	import { ORIGAM_TABS_KEY } from '../../consts'

	import { DENSITY, DIRECTION, TAB_VARIANT } from '../../enums'

	import type { ITabsProps} from '../../interfaces'

	import type { ITabsEmits, ITabsSlots } from '../../interfaces/Tabs/tabs.interface'

	/*********************************************************
	 * Global
	 ********************************************************/
	const _props = withDefaults(defineProps<ITabsProps>(), {
		tag: 'div',
		direction: DIRECTION.HORIZONTAL,
		density: DENSITY.DEFAULT,
		variant: TAB_VARIANT.DEFAULT,
		mandatory: true,
		fixed: false,
		centered: false,
		selectedClass: 'origam-tab--active'
	})

	// `useDefaults` resolves each prop against the closest
	// `<OrigamDefaultsProvider>` / theme `components['origam-tabs']` entry.
	// OrigamTabs is the SOLE owner of `variant` — without this hook a
	// theme's `'origam-tabs': { variant: 'pills' }` was completely inert,
	// and the `slotDefaults` forwarded to descendant `<OrigamTab>` (which
	// reads straight off `props.variant`/`density`/`color`/`fixed`) never
	// picked it up either (see #279).
	const props = useDefaults(_props)

	defineEmits<ITabsEmits>()

	defineSlots<ITabsSlots>()

	const {filterProps} = useProps<ITabsProps>(props)

	/*********************************************************
	 * Group orchestration
	 *
	 * @description
	 * Re-uses the shared `useGroup` registry — every child
	 * `<OrigamTab>` self-registers via `useGroupItem` against
	 * the same injection key.
	 ********************************************************/
	const {isSelected, select, next, prev, selected, items} = useGroup(props, ORIGAM_TABS_KEY)

	const rootRef = ref<HTMLElement>()

	/*********************************************************
	 * Slot scope + default propagation
	 ********************************************************/
	const slotProps = computed(() => ({
		isSelected,
		select,
		next,
		prev,
		selected,
		items: items.value
	}))

	const slotDefaults = computed(() => ({
		'origam-tab': {
			density: props.density,
			color: props.color,
			variant: props.variant,
			fixed: props.fixed
		}
	}))

	/*********************************************************
	 * ARIA + keyboard navigation
	 *
	 * @description
	 * `← / →` for horizontal, `↑ / ↓` for vertical. `Home`
	 * / `End` jump to first/last. Disabled items are skipped
	 * but `useGroup.step` already handles the wrap-around.
	 * Focus stays on the freshly-selected tab so screen
	 * readers announce the change.
	 ********************************************************/
	const ariaOrientation = computed(() => props.direction === DIRECTION.VERTICAL ? 'vertical' : 'horizontal')

	const focusTab = (id: number) => {
		if (!rootRef.value) return

		const target = rootRef.value.querySelector(`[data-origam-tab-id="${id}"]`) as HTMLElement | null
		target?.focus()
	}

	const focusFirstNonDisabled = (offset: number) => {
		const list = items.value
		if (!list.length) return

		const start = offset > 0 ? 0 : list.length - 1
		const end = offset > 0 ? list.length : -1

		for (let i = start; i !== end; i += offset) {
			const item = list[i]
			if (!item.disabled) {
				select(item.id, true)
				focusTab(item.id)
				return
			}
		}
	}

	const handleKeydown = (event: KeyboardEvent) => {
		const isHorizontal = props.direction !== DIRECTION.VERTICAL
		const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
		const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'

		const currentId = selected.value[0]

		if (event.key === prevKey) {
			event.preventDefault()
			prev()
			if (selected.value[0] != null) focusTab(selected.value[0])
		} else if (event.key === nextKey) {
			event.preventDefault()
			next()
			if (selected.value[0] != null) focusTab(selected.value[0])
		} else if (event.key === 'Home') {
			event.preventDefault()
			focusFirstNonDisabled(1)
		} else if (event.key === 'End') {
			event.preventDefault()
			focusFirstNonDisabled(-1)
		} else if (event.key === 'Enter' || event.key === ' ') {
			if (currentId != null) {
				event.preventDefault()
				select(currentId, true)
			}
		}
	}

	/*********************************************************
	 * Composables — visual chrome
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {roundedClasses, roundedStyles} = useRounded(props)

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const tabsStyles = computed(() => {
		return [
			roundedStyles.value,
			props.style
		] as StyleValue
	})
	const tabsClasses = computed(() => {
		return [
			'origam-tabs',
			`origam-tabs--${props.variant}`,
			`origam-tabs--direction-${props.direction}`,
			{
				'origam-tabs--fixed': props.fixed,
				'origam-tabs--centered': props.centered
			},
			densityClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(tabsStyles)

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

<style
		lang="scss"
		scoped
>
	.origam-tabs {
		display: flex;
		flex-wrap: nowrap;
		position: relative;
		min-height: var(--origam-tabs---height, 48px);

		gap: var(--origam-tabs---gap, 0);
		padding-block: var(--origam-tabs---padding-block, 0);
		padding-inline: var(--origam-tabs---padding-inline, 0);

		background-color: var(--origam-tabs---background-color, transparent);
		border-radius: var(--origam-tabs---border-radius, 0);
		border-width: var(--origam-tabs---border-width, 0);
		border-style: var(--origam-tabs---border-style, solid);
		border-color: var(--origam-tabs---border-color, currentColor);
		color: var(--origam-tabs---color, inherit);

		&--direction-horizontal {
			flex-direction: row;
			align-items: stretch;
		}

		&--direction-vertical {
			flex-direction: column;
			align-items: stretch;
			min-height: 0;
		}

		&--fixed {
			:deep(.origam-tab) {
				flex: 1 1 0;
				min-width: 0;
			}
		}

		&--centered {
			justify-content: center;
		}

		&--default {
			border-block-end-width: var(--origam-tabs--default---border-block-end-width, 1px);
			border-block-end-color: var(--origam-tabs--default---border-block-end-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)));
		}

		&--pills {
			background-color: var(--origam-tabs--pills---background-color, transparent);
			gap: var(--origam-tabs--pills---gap, 8px);
			padding: var(--origam-tabs--pills---padding, 4px);
		}

		&--underline {
			border-block-end-width: var(--origam-tabs--underline---border-block-end-width, 1px);
			border-block-end-color: var(--origam-tabs--underline---border-block-end-color, var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12)));
		}

		&--density-comfortable {
			--origam-tabs---height: 56px;
		}

		&--density-default {
			--origam-tabs---height: 48px;
		}

		&--density-compact {
			--origam-tabs---height: 36px;
		}
	}
</style>

<style>
	:root {
		--origam-tabs---height: 48px;
		--origam-tabs---gap: 0;
		--origam-tabs---padding-block: 0;
		--origam-tabs---padding-inline: 0;
		--origam-tabs---background-color: transparent;
		--origam-tabs---border-radius: 0;
		--origam-tabs---border-width: 0;
		--origam-tabs---border-style: solid;
		--origam-tabs---border-color: currentColor;
		--origam-tabs---color: inherit;
	}
</style>
