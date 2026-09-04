<template>
	<component
			:is="rootTag"
			:id="id"
			v-ripple="rippleProps"
			v-contrast
			:class="chipClasses"
			:disabled="disabled"
			:draggable="draggable"
			:href="link.href.value"
			:style="chipStyles"
			:tabindex="isClickable ? 0 : undefined"
			:type="typeAttr"
			@click="handleClick"
			@keydown="handleKeydown"
	>
    <span
		    v-if="isClickable"
		    key="overlay"
		    class="origam-chip__overlay"
    />
		<span
				key="underlay"
				class="origam-chip__underlay"
		/>

		<template v-if="hasFilter">
			<origam-expand-x key="filter">
				<div
						v-show="isSelected"
						class="origam-chip__filter"
				>
					<slot
							name="filter"
							v-bind="{filterIcon}"
					>
						<origam-icon :icon="filterIcon"/>
					</slot>
				</div>
			</origam-expand-x>
		</template>

		<div
				v-if="hasPrepend"
				key="prepend"
				class="origam-chip__prepend"
				:role="isPrependZoneFocusable ? 'button' : undefined"
				:tabindex="isPrependZoneFocusable ? 0 : undefined"
				@click="handleClickPrepend"
				@keydown="handleKeydownPrepend"
		>
			<slot name="prepend">
				<origam-avatar
						v-if="prependAvatar"
						key="prepend-avatar"
						:density="density"
						:image="prependAvatar"
				/>
				<origam-icon
						v-if="prependIcon"
						key="prepend-icon"
						:density="density"
						:icon="prependIcon"
				/>
			</slot>
		</div>

		<div
				class="origam-chip__content"
				data-no-activator=""
		>
			<slot
					name="default"
					v-bind="contentProps"
			>
				{{ text }}
			</slot>
		</div>

		<div
				v-if="hasAppend"
				key="append"
				class="origam-chip__append"
				:role="isAppendZoneFocusable ? 'button' : undefined"
				:tabindex="isAppendZoneFocusable ? 0 : undefined"
				@click="handleClickAppend"
				@keydown="handleKeydownAppend"
		>
			<slot name="append">
				<origam-avatar
						v-if="appendAvatar"
						key="append-avatar"
						:density="density"
						:image="appendAvatar"
				/>
				<origam-icon
						v-if="appendIcon"
						key="append-icon"
						:density="density"
						:icon="appendIcon"
				/>
			</slot>
		</div>

		<origam-btn
				v-if="hasClose"
				key="close"
				:aria-label="t(closeLabel)"
				class="origam-chip__close"
				variant="text"
				:icon="true"
				size="x-small"
				density="compact"
				:style="{'--origam-btn---min-width': '0', '--origam-btn---min-height': '0'}"
				@click.stop="handleClickClose"
		>
			<slot
					name="close"
					v-bind="{closeIcon}"
			>
				<origam-icon
						v-if="closeIcon"
						key="close-icon"
						:density="density"
						:icon="closeIcon"
						aria-hidden="true"
						size="x-small"
				/>
			</slot>
		</origam-btn>

	</component>
</template>

<script
		lang="ts"
		setup
>
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamExpandX from '../Transition/OrigamExpandX.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useGroupItem } from '../../composables/Commons/groupItem.composable'
	import { useLink } from '../../composables/Commons/link.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStateFlag } from '../../composables/Commons/stateFlag.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { ORIGAM_CHIP_GROUP_KEY } from '../../consts/Chip/chip-group.const'

	import vContrast from '../../directives/Contrast/contrast.directive'
	import vRipple from '../../directives/Ripple/ripple.directive'

	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
	import { MDI_ICONS } from '../../enums/Commons/mdi.enum'
	import { SIZES } from '../../enums/Commons/size.enum'

	import type { IChipProps } from '../../interfaces/Chip/chip.interface'
	import type { IChipEmits, IChipSlots } from '../../interfaces/Chip/chip.interface'

	import { computed, StyleValue, toRef, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, defaults propagation, group item and link
	 * bindings for the chip.
	 ********************************************************/

	const props = withDefaults(defineProps<IChipProps>(), {
		tag: 'span',
		closeIcon: MDI_ICONS.CLOSE_CIRCLE_OUTLINE,
		filterIcon: MDI_ICONS.CHECK,
		closeLabel: 'origam.close',
		modelValue: true,
		// Default size — without this `withDefaults` value, `useSize`
		// emits no `--size-*` class on the chip root, and the size
		// variants (which alone declare padding / font-size) never
		// apply. Result pre-fix: chip rendered at body's 16px font and
		// 0 padding, collapsing to ~18px tall. Mirrors `OrigamBtn`'s
		// own `size: SIZES.DEFAULT` default.
		size: SIZES.DEFAULT
	})

	const emits = defineEmits<IChipEmits>()

	defineSlots<IChipSlots>()

	const {filterProps} = useProps<IChipProps>(props)

	const {t} = useLocale()

	const attrs = useAttrs()
	const slots = useSlots()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)

	const {isOn: isHover, config: hoverState} = useStateFlag(props, {state: 'hover'})
	/*********************************************************
	 * active — decorative state-effect toggle (IActiveProps)
	 *
	 * @description
	 * `active` here is the DECORATIVE state-effect toggle from
	 * `IActiveProps` (forced highlight / color-bgColor-border-rounded-
	 * elevation override via an `IActiveState` config) — unrelated to
	 * `closeChip` below, which reads `modelValue` (source override) under
	 * the SAME `state: 'active'` label to drive dismiss/close, not this
	 * decorative surface. Named `active` (not `isActive`) so neither
	 * call's destructured names collide.
	 ********************************************************/
	const {isOn: active, config: activeState, classes: activeClasses} = useStateFlag(props, {state: 'active'})
	const {
		colorClasses, colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, active, hoverState, activeState)
	const {sizeClasses, sizeStyles} = useSize(props)
	const {typographyStyles} = useTypography(props, 'chip')
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color — porte par useStateEffect, PAS par useBothColor.
	 *
	 * @description
	 * useStateEffect etait deja appele juste au-dessus, mais on ne lui
	 * prenait que border / rounded / elevation / padding / margin : son
	 * canal COULEUR etait jete, et la couleur repassait par useBothColor,
	 * qui est statique. Consequence : les surcharges de couleur declarees
	 * dans la config d'etat (hover / active) ne peignaient jamais — le
	 * chip lisait props.color et props.bgColor bruts quoi qu'il arrive.
	 *
	 * @description
	 * On consomme desormais colorClasses / colorStyles du meme
	 * useStateEffect que les autres axes. Un seul canal, coherent avec
	 * border / rounded / elevation qui, eux, respectaient deja l'etat.
	 ********************************************************/

	/*********************************************************
	 * Value
	 ********************************************************/

	const { unset: closeChip } = useStateFlag(props, {state: 'active', source: 'modelValue'})
	const group = useGroupItem(props, ORIGAM_CHIP_GROUP_KEY, false)
	const link = useLink(props, attrs)

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		onKeydownPrepend: handleKeydownPrepend,
		onKeydownAppend: handleKeydownAppend,
		isPrependClickable,
		isAppendClickable,
		hasPrepend,
		hasAppend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * isPrependZoneFocusable / isAppendZoneFocusable
	 *
	 * @description
	 * issue #443 — root renders `<component :is="link.tag.value">`, which is
	 * `<a>` whenever `link.isLink` is true regardless of the `link` PROP
	 * (that prop only gates the chip's OWN `isLink` computed below, not the
	 * tag resolution). A <button>/<a> content model forbids any descendant
	 * with a `tabindex` attribute specified, so the prepend/append zone can
	 * only become its own tab stop when the root is NOT actually an <a>.
	 ********************************************************/
	const isPrependZoneFocusable = computed(() => isPrependClickable.value && !link.isLink.value)
	const isAppendZoneFocusable = computed(() => isAppendClickable.value && !link.isLink.value)

	/*********************************************************
	 * rootTag / typeAttr — issue #530 (a11y sweep)
	 *
	 * @description
	 * The root used to render whatever `useLink` resolved — `<a>` when
	 * linked, `<span>` (the `tag` default) otherwise — even when the chip
	 * was clickable. A clickable, non-link `<span>` carries no implicit
	 * role at all: nothing is announced to assistive tech beyond a bare
	 * tab stop, and any `type="button"` attribute a consumer forwarded
	 * (expecting button semantics) landed on the `<span>` as an INVALID
	 * attribute (axe: `aria-allowed-attr`, `type` is not allowed outside
	 * `<button>`/`<input>`/…).
	 *
	 * Root cause fix, not an attribute strip: when the chip is purely
	 * clickable — not a link, no close button, no focusable prepend/append
	 * zone — swap the DEFAULT `span` for a real `<button>`. `<button>` is
	 * *phrasing content that forbids interactive descendants* (no nested
	 * `<a>`/`<button>`/`tabindex` element), so the swap only happens when
	 * none of those descendants can exist: `hasClose` renders an
	 * `<origam-btn>` (a real `<button>`) inside, and a focusable
	 * prepend/append zone renders `tabindex="0"` — both would make a
	 * `<button>` root invalid content. An explicit non-default `tag` (e.g.
	 * a chip deliberately rendered as `li`) is left untouched — the
	 * upgrade only applies to the unstyled `span` default, never overrides
	 * a consumer's own semantic choice.
	 *
	 * @description
	 * `typeAttr` is hardcoded, not read off a prop — mirrors `OrigamBtn`'s
	 * own `typeAttr`: without it, a chip-as-button inside a `<form>` would
	 * default to `type="submit"` and submit the form on click.
	 ********************************************************/
	const isButtonSafe = computed(() => {
		return props.tag === 'span' &&
			isClickable.value &&
			!link.isLink.value &&
			!hasClose.value &&
			!isPrependZoneFocusable.value &&
			!isAppendZoneFocusable.value
	})
	const rootTag = computed(() => (isButtonSafe.value ? 'button' : link.tag.value))
	const typeAttr = computed(() => (rootTag.value === 'button' ? 'button' : undefined))

	const isLink = computed(() => {
		return props.link && link.isLink.value
	})
	// `props.link &&` used to gate the whole expression, which short-circuited
	// the `!!group` disjunct into dead code: a chip inside an
	// `<origam-chip-group>` was inert unless it ALSO carried `link`, so the
	// group never emitted `update:modelValue`. Same shape as the repaired
	// `OrigamListItem.isClickable` — a chip is clickable when it belongs to a
	// group, when it opts in via `link`, or when `useLink` detects an `href` /
	// `to` / a bound `click` listener.
	const isClickable = computed(() => {
		return !props.disabled && (!!group || props.link || link.isClickable.value)
	})
	const rippleProps = computed(() => {
		return [isClickable.value && props.ripple, null]
	})
	const isSelected = computed(() => {
		return !group || group.isSelected.value
	})

	const contentProps = computed(() => {
		return {
			isSelected: group?.isSelected.value,
			selectedClass: group?.selectedClass.value,
			select: group?.select,
			toggle: group?.toggle,
			value: group?.value.value,
			disabled: props.disabled
		}
	})

	const onClick = (e: MouseEvent) => {
		emits('click', e)

		if (!isClickable.value) return

		link.navigate?.(e)
		group?.toggle()
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClickClose = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		closeChip()

		emits('click:close', e)
	}
	const handleClick = (e: MouseEvent) => {
		onClick(e)
	}
	/*********************************************************
	 * handleKeydown (#439)
	 *
	 * @description
	 * `@keydown="isClickable && !isLink && handleKeydown"` used to compile
	 * to `$event => (cond && _ctx.handleKeydown)` — Vue's inline-statement
	 * form for anything more complex than a bare member expression. The
	 * expression EVALUATES `handleKeydown` (a function reference) and
	 * stops there; it never CALLS it.
	 * @description
	 * Root cause fixed at the binding (`@keydown="handleKeydown"`, the one
	 * form Vue auto-invokes with `$event`) — the guard moves in here,
	 * where wrapping it in `&&`/`?:` again can't silently undo the fix
	 * (see issue #439 / #397).
	 *
	 * @description
	 * #530 — also bails when `rootTag` resolved to a real `<button>`: it
	 * already activates on Enter/Space natively and fires its own `click`
	 * event, so re-firing `onClick` here would double-invoke every handler
	 * downstream. Verified empirically against a real browser (Chromium):
	 * pressing Enter then Space on the button-tagged "Events - click" chip
	 * produced exactly one `click` per key, not two.
	 ********************************************************/
	const handleKeydown = (e: KeyboardEvent) => {
		if (!isClickable.value || isLink.value || rootTag.value === 'button') return

		if (e.key === KEYBOARD_VALUES.ENTER || e.key === ' ') {
			e.preventDefault()
			onClick(e as any as MouseEvent)
		}
	}

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Computed flags for conditional close / filter rendering.
	 ********************************************************/

	const hasClose = computed(() => {
		return slots.close || props.closable
	})
	const hasFilter = computed(() => {
		return (slots.filter || props.filter) && group
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes size, rounded, border, spacing and color styles.
	 ********************************************************/

	const chipStyles = computed(() => {
		return [
			sizeStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const chipClasses = computed(() => {
		return [
			'origam-chip',
			// `OrigamChipGroup` declares `selectedClass: 'origam-chip--selected'`
			// and the chip exposed it to the default slot only, so a chip that
			// WAS selected carried no class on its root and stayed visually
			// indistinguishable. Same position as `OrigamBtn`, `OrigamItem`,
			// `OrigamTab` and `OrigamWindowItem`.
			group?.selectedClass.value,
			{
				'origam-chip--disabled': props.disabled,
				'origam-chip--label': props.label,
				'origam-chip--link': isClickable.value,
				'origam-chip--filter': hasFilter.value,
				'origam-chip--pill': props.pill
			},
			colorClasses.value,
			borderClasses.value,
			roundedClasses.value,
			densityClasses.value,
			elevationClasses.value,
			sizeClasses.value,
			paddingClasses.value,
			marginClasses.value,
			activeClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(chipStyles, () => props.id)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps.
	 ********************************************************/

	defineExpose({
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
	.origam-chip {
		$this: &;

		align-items: center;
		display: inline-flex;
		// Every `&--size-*` height below is a CONTENT-box measurement (chip
		// only ever rendered as `<span>`/`<a>`, both `content-box` under the
		// UA stylesheet, when those were authored). #530 made a purely
		// clickable chip render as a real `<button>` — and `button` is
		// `box-sizing: border-box` by default in the UA stylesheet, which
		// would silently shrink every bordered/outlined chip by its own
		// border-width (measured: 26px → 24px with `border: true` + `thin`).
		// Pinning `content-box` here keeps the token math identical no
		// matter which tag ends up on the root.
		box-sizing: content-box;
		font-weight: var(--origam-chip---font-weight, 400);
		max-width: 100%;
		min-width: 0;
		overflow: hidden;
		position: relative;
		text-decoration: none;
		white-space: nowrap;
		vertical-align: middle;
		border-color: var(--origam-chip---border-color, currentColor);
		border-style: var(--origam-chip---border-style, solid);
		border-width: var(--origam-chip---border-width, 0px);
		border-radius: var(--origam-chip---border-radius, 9999px);

		background-color: var(--origam-chip---background-color);
		color: var(--origam-chip---color);
		backdrop-filter: var(--origam-chip---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-chip---backdrop-filter, none);

		&__content {
			align-items: center;
			display: inline-flex;
			overflow: hidden;
		}

		&__filter,
		&__prepend,
		&__append,
		&__close {
			align-items: center;
			display: inline-flex;
		}

		&__close {
			cursor: var(--origam-chip__close---cursor, pointer);
			flex: var(--origam-chip__close---flex, 0 1 auto);
			font-size: var(--origam-chip__close---font-size, 18px);
			max-height: var(--origam-chip__close---max-height, 18px);
			max-width: var(--origam-chip__close---max-width, 18px);
			user-select: var(--origam-chip__close---user-select, none);
			margin-inline-start: var(--origam-chip__close---margin-inline-start, 6px);
			margin-inline-end: var(--origam-chip__close---margin-inline-end, -4px);

			.origam-icon {
				font-size: inherit;
			}
		}

		&__filter {
			transition:
				var(--origam-chip__filter---transition-property, transform, opacity)
				var(--origam-chip__filter---transition-duration, 0.15s)
				var(--origam-chip__filter---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
		}

		&__overlay {
			position: var(--origam-chip__overlay---position, absolute);
			top: var(--origam-chip__overlay---position-top, 0);
			left: var(--origam-chip__overlay---position-left, 0);
			width: var(--origam-chip__overlay---width, 100%);
			height: var(--origam-chip__overlay---height, 100%);
			background-color: var(--origam-chip__overlay---background-color, currentColor);
			border-radius: var(--origam-chip__overlay---border-radius, inherit);
			pointer-events: var(--origam-chip__overlay---pointer-events, none);
			opacity: var(--origam-chip__overlay---opacity, var(--origam-chip---overlay-opacity, 0));
			transition:
				var(--origam-chip__overlay---transition-property, opacity)
				var(--origam-chip__overlay---transition-duration, var(--origam-chip---transition-duration, 0.2s))
				var(--origam-chip__overlay---transition-timing-function, var(--origam-chip---transition-easing, ease-in-out));
		}

		&--disabled {
			opacity: var(--origam-chip---opacity-disabled, 0.3);
			pointer-events: none;
			user-select: none;
		}

		&--label {
			border-radius: var(--origam-chip---border-radius-label, 4px);
		}

		&--selected {
			background-color: var(--origam-chip--selected---background-color);
			color: var(--origam-chip--selected---color);
		}

		&--size-x-small {
			font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-xs, 0.625rem));
			line-height: 1;
			height: var(--origam-chip---height-xs, 20px);
			padding: 0 var(--origam-chip---padding-xs, 8px);
		}

		&--size-small {
			font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-sm, 0.75rem));
			line-height: 1;
			height: var(--origam-chip---height-sm, 24px);
			padding: 0 var(--origam-chip---padding-sm, 10px);
		}

		&--size-default {
			font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-md, 0.875rem));
			line-height: 1;
			height: var(--origam-chip---height-md, 32px);
			padding: 0 var(--origam-chip---padding-md, 12px);
		}

		&--size-large {
			font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-lg, 1rem));
			line-height: 1;
			height: var(--origam-chip---height-lg, 38px);
			padding: 0 var(--origam-chip---padding-lg, 14px);
		}

		&--size-x-large {
			font-size: var(--origam-chip---font-size, var(--origam-chip---font-size-xl, 1.125rem));
			line-height: 1;
			height: var(--origam-chip---height-xl, 44px);
			padding: 0 var(--origam-chip---padding-xl, 17px);
		}

		&--density-default {
			--origam-chip---density: 0px;
		}

		&--density-compact {
			--origam-chip---density: -8px;
		}

		&:hover {
			> #{$this}__overlay {
				--origam-chip__overlay---opacity: var(--origam-chip---overlay-opacity-hover, 0.24);
			}
		}

		&:focus-visible,
		&:focus {
			> #{$this}__overlay {
				--origam-chip__overlay---opacity: var(--origam-chip---overlay-opacity-focus, 0.12);
			}
		}

		&--active,
		&[aria-haspopup=menu][aria-expanded=true] {
			> #{$this}__overlay {
				--origam-chip__overlay---opacity: var(--origam-chip---overlay-opacity-active, 0.12);
			}

			&:hover {
				> #{$this}__overlay {
					--origam-chip__overlay---opacity: var(--origam-chip---overlay-opacity-hover, 0.04);
				}
			}

			&:focus-visible,
			&:focus {
				> #{$this}__overlay {
					--origam-chip__overlay---opacity: var(--origam-chip---overlay-opacity-focus, 0.12);
				}
			}
		}

		&__underlay {
			position: var(--origam-chip__underlay---position, absolute);
		}

		&--rounded {
			--origam-chip---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-x-small {
			--origam-chip---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-chip---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-chip---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-chip---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-chip---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-chip---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-shaped {
			border-start-start-radius: var(--origam-chip---border-radius-rounded, 16px);
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-chip---border-radius-rounded, 16px);
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-chip---border-radius-rounded, 16px);
			border-end-start-radius: var(--origam-chip---border-radius-rounded, 16px);
			border-end-end-radius: 0;
		}

		&--border {
			border-width: var(--origam-chip---border-width-outlined, thin);
		}

		&--link {
			cursor: pointer;
		}

		&--link,
		&--filter {
			user-select: none;
		}
	}
</style>

<style
		lang="scss"
		scoped
>
	.origam-chip {
		--origam-chip---density: 0px;
	}
</style>
