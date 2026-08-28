<template>
	<component
			:is="tag"
			:id="tabDomId"
			ref="rootRef"
			v-contrast
			role="tab"
			type="button"
			:class="tabClasses"
			:style="tabStyles"
			:aria-selected="ariaSelected"
			:aria-controls="panelId"
			:aria-disabled="isDisabled || undefined"
			:tabindex="tabIndex"
			:disabled="isDisabled || undefined"
			:data-origam-tab-id="groupItem?.id"
			@click="handleClick"
	>
		<span
				v-if="hasPrependMedia"
				class="origam-tab__prepend"
		>
			<origam-avatar
					v-if="prependAvatar"
					key="prepend-avatar"
					:image="prependAvatar"
			/>
			<origam-icon
					v-if="resolvedPrependIcon"
					key="prepend-icon"
					:icon="resolvedPrependIcon"
			/>
		</span>

		<span class="origam-tab__label">
			<slot
					name="default"
					v-bind="slotProps"
			>
				{{ text }}
			</slot>
		</span>

		<span
				v-if="hasAppendMedia"
				class="origam-tab__append"
		>
			<origam-avatar
					v-if="appendAvatar"
					key="append-avatar"
					:image="appendAvatar"
			/>
			<origam-icon
					v-if="appendIcon"
					key="append-icon"
					:icon="appendIcon"
			/>
		</span>

		<span
				v-if="hasIndicator"
				class="origam-tab__indicator"
				aria-hidden="true"
		/>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, ref, StyleValue, toRef } from 'vue'

	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useGroupItem } from '../../composables/Commons/groupItem.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { ORIGAM_TABS_KEY, ORIGAM_TAB_PANELS_LINK_KEY } from '../../consts/Tabs/tabs.const'

	import type {
		ITabEmits,
		ITabProps,
		ITabSlots
	} from '../../interfaces/Tabs/tab.interface'

	/*********************************************************
	 * Global
	 ********************************************************/
	const props = withDefaults(defineProps<ITabProps>(), {
		tag: 'button',
		value: undefined,
		text: '',
		variant: undefined
	})

	defineEmits<ITabEmits>()

	defineSlots<ITabSlots>()

	const {filterProps} = useProps<ITabProps>(props)

	const rootRef = ref<HTMLElement>()

	/*********************************************************
	 * Adjacent
	 *
	 * `icon` is a deprecated alias for `prependIcon` (same leading-icon
	 * position) — the merged computed is handed to `useAdjacent` so a
	 * legacy consumer's `icon` keeps rendering while a `prependIcon`
	 * takes priority when both are set.
	 ********************************************************/
	const resolvedPrependIcon = computed(() => props.prependIcon ?? props.icon)

	const {
		hasPrependMedia,
		hasAppendMedia
	} = useAdjacent(props, resolvedPrependIcon, toRef(props, 'appendIcon'))

	/*********************************************************
	 * Group registration
	 *
	 * @description
	 * Self-registers in the parent `<OrigamTabs>` tablist via
	 * `useGroupItem`. The panels group is NOT reachable via a plain
	 * `inject(ORIGAM_TAB_PANELS_KEY)` — `<OrigamTabPanels>` is a
	 * SIBLING of `<OrigamTabs>`, not its ancestor (#441). `<OrigamTabs>`
	 * resolves the sibling once (`useGroupSiblingLink`) and re-provides
	 * it under `ORIGAM_TAB_PANELS_LINK_KEY`, down its OWN ancestor
	 * chain — THAT is what we inject here.
	 ********************************************************/
	const groupItem = useGroupItem(props, ORIGAM_TABS_KEY)
	const panelsGroupLink = inject(ORIGAM_TAB_PANELS_LINK_KEY, undefined)

	if (!groupItem) {
		throw new Error('[Origam] <OrigamTab> must be used inside an <OrigamTabs>')
	}

	const slotProps = computed(() => ({
		isSelected: groupItem.isSelected.value,
		toggle: groupItem.toggle,
		select: groupItem.select,
		value: groupItem.value.value,
		disabled: groupItem.disabled.value
	}))

	/*********************************************************
	 * ARIA wiring
	 *
	 * @description
	 * `tabDomId` is the DOM id of THIS tab (referenced by the
	 * panel via `aria-labelledby`). `panelId` is the DOM id of
	 * the sibling panel — derived by reading the panels group's
	 * registry and matching on `value` (the user-supplied
	 * identifier, not the internal numeric id).
	 ********************************************************/
	const tabDomId = computed(() => `origam-tab-${groupItem!.id}`)

	const panelId = computed(() => {
		const panelsGroup = panelsGroupLink?.value
		if (!panelsGroup) return undefined

		const panel = panelsGroup.items.value.find(item => item.value === groupItem!.value.value)

		return panel ? `origam-tab-panel-${panel.id}` : undefined
	})

	const ariaSelected = computed(() => (groupItem!.isSelected.value ? 'true' : 'false'))

	const tabIndex = computed(() => {
		if (groupItem!.disabled.value) return -1

		return groupItem!.isSelected.value ? 0 : -1
	})

	/*********************************************************
	 * Disabled + activation
	 ********************************************************/
	const isDisabled = computed(() => groupItem!.disabled.value)

	const handleClick = (event: MouseEvent) => {
		if (isDisabled.value) return

		event.preventDefault()
		groupItem!.select(true)
	}

	/*********************************************************
	 * Indicator (only on variant=underline)
	 ********************************************************/
	const hasIndicator = computed(() => props.variant === 'underline')

	/*********************************************************
	 * Typography
	 ********************************************************/
	const {typographyStyles} = useTypography(props, 'tabs__item')

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const tabStyles = computed(() => {
		return [
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const tabClasses = computed(() => {
		return [
			'origam-tab',
			groupItem!.selectedClass.value,
			{
				'origam-tab--disabled': isDisabled.value,
				'origam-tab--with-prepend': hasPrependMedia.value,
				'origam-tab--with-append': hasAppendMedia.value
			},
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(tabStyles)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		toggle: groupItem.toggle,
		select: groupItem.select,
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
	.origam-tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--origam-tabs__item---gap, 8px);
		position: relative;
		flex: 0 0 auto;

		padding-block: var(--origam-tabs__item---padding-block, 0);
		padding-inline: var(--origam-tabs__item---padding-inline, 16px);
		min-height: var(--origam-tabs__item---height, 48px);

		font-family: inherit;
		font-size: var(--origam-tabs__item---font-size, 0.875rem);
		font-weight: var(--origam-tabs__item---font-weight, 500);
		line-height: 1;
		letter-spacing: var(--origam-tabs__item---letter-spacing, 0.03125em);
		text-transform: var(--origam-tabs__item---text-transform, none);

		color: var(--origam-tabs__item---color, currentColor);
		background-color: var(--origam-tabs__item---background-color, transparent);

		border: var(--origam-tabs__item---border-width, 0) solid transparent;
		border-radius: var(--origam-tabs__item---border-radius, 0);

		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		appearance: none;

		transition-property: color, background-color, border-color, transform;
		transition-duration: var(--origam-tabs__item---transition-duration, 0.2s);
		transition-timing-function: var(--origam-tabs__item---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));

		&:focus-visible {
			outline: 2px solid var(--origam-tabs__item--focus---outline-color, currentColor);
			outline-offset: -2px;
		}

		&:hover:not(.origam-tab--disabled) {
			color: var(--origam-tabs__item--hover---color, currentColor);
			background-color: var(--origam-tabs__item--hover---background-color, rgba(0, 0, 0, 0.04));
		}

		&--active {
			color: var(--origam-tabs__item--active---color, currentColor);
			background-color: var(--origam-tabs__item--active---background-color, transparent);
			font-weight: var(--origam-tabs__item--active---font-weight, 600);
		}

		&--disabled {
			color: var(--origam-tabs__item--disabled---color, rgba(0, 0, 0, 0.38));
			background-color: var(--origam-tabs__item--disabled---background-color, transparent);
			cursor: not-allowed;
			pointer-events: none;
		}

		&__prepend,
		&__append {
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		&__indicator {
			position: absolute;
			inset-inline: 0;
			inset-block-end: 0;
			height: var(--origam-tabs__indicator---height, 2px);
			background-color: var(--origam-tabs__indicator---color, currentColor);
			transform: scaleX(0);
			transform-origin: center;
			transition: transform 0.2s ease;
		}

		&--active &__indicator {
			transform: scaleX(1);
		}
	}

	.origam-tabs--direction-vertical .origam-tab {
		justify-content: flex-start;

		&__indicator {
			inset-block: 0;
			inset-inline-end: 0;
			inset-inline-start: auto;
			width: var(--origam-tabs__indicator---height, 2px);
			height: auto;
			transform: scaleY(0);
		}

		&--active .origam-tab__indicator {
			transform: scaleY(1);
		}
	}

	.origam-tabs--pills .origam-tab {
		border-radius: var(--origam-tabs__item---border-radius, var(--origam-radius---full, 9999px));

		&--active {
			background-color: var(--origam-tabs__item--pills--active---background-color, var(--origam-color__action--primary---bg, currentColor));
			color: var(--origam-tabs__item--pills--active---color, var(--origam-color__action--primary---fg, white));
		}
	}
</style>

<style>
	:root {
		--origam-tabs__item---height: 48px;
		--origam-tabs__item---padding-inline: 16px;
		--origam-tabs__item---padding-block: 0;
		--origam-tabs__item---gap: 8px;
		--origam-tabs__item---font-size: 0.875rem;
		--origam-tabs__item---font-weight: 500;
		--origam-tabs__item---letter-spacing: 0.03125em;
		--origam-tabs__item---text-transform: none;
		--origam-tabs__item---color: currentColor;
		--origam-tabs__item---background-color: transparent;
		--origam-tabs__item---border-width: 0;
		--origam-tabs__item---border-radius: 0;
		--origam-tabs__item---transition-duration: 0.2s;
		--origam-tabs__item---transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

		--origam-tabs__indicator---color: currentColor;
		--origam-tabs__indicator---height: 2px;
	}
</style>
