<template>
	<component
			:is="link.tag.value"
			:id="styleId"
			v-ripple="isClickable && ripple"
			:aria-disabled="itemRole === 'option' ? disabled : undefined"
			:aria-selected="itemRole === 'option' ? isSelected : undefined"
			:class="listItemClasses"
			:href="link.href.value"
			:role="itemRole"
			:style="listItemStyles"
			:tabindex="listItemTabIndex"
			@click="handleClick"
			@keydown="handleKeyDown"
	>
    <span
		    v-if="isClickable || isActive"
		    key="overlay"
		    class="origam-list-item__overlay"
    />
		<span
				key="underlay"
				class="origam-list-item__underlay"
		/>

		<slot name="wrapper">
			<div
					v-if="hasPrepend"
					key="prepend"
					class="origam-list-item__prepend"
					:role="isPrependZoneFocusable ? 'button' : undefined"
					:tabindex="isPrependZoneFocusable ? 0 : undefined"
					@click="handleClickPrepend"
					@keydown="handleKeydownPrepend"
			>
				<slot
						name="prepend"
						v-bind="slotProps"
				>
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
					class="origam-list-item__content"
					data-no-activator=""
			>
				<div
						v-if="hasTitle"
						key="title"
						class="origam-list-item__title"
						:style="titleTypographyStyles"
				>
					<slot
							name="title"
							v-bind="{ title }"
					>{{ title }}
					</slot>
				</div>

				<div
						v-if="hasSubtitle"
						key="subtitle"
						class="origam-list-item__subtitle"
						:style="subtitleTypographyStyles"
				>
					<slot
							name="subtitle"
							v-bind="{ subtitle }"
					>{{ subtitle }}
					</slot>
				</div>

				<slot
						name="default"
						v-bind="slotProps"
				/>
			</div>

			<div
					v-if="hasAppend"
					key="append"
					class="origam-list-item__append"
					:role="isAppendZoneFocusable ? 'button' : undefined"
					:tabindex="isAppendZoneFocusable ? 0 : undefined"
					@click="handleClickAppend"
					@keydown="handleKeydownAppend"
			>
				<slot
						name="append"
						v-bind="slotProps"
				>
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
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onBeforeMount, StyleValue, toRef, useAttrs, useSlots, watch } from 'vue'
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useBackgroundColor } from '../../composables/Commons/backgroundColor.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useLink } from '../../composables/Commons/link.composable'
	import { useList } from '../../composables/List/list.composable'
	import { useNestedItem } from '../../composables/Commons/nestedItem.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStateFlag } from '../../composables/Commons/stateFlag.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import vRipple from '../../directives/Ripple/ripple.directive'

	import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'

	import type { IListItemProps } from '../../interfaces/List/list-item.interface'

	import type { IListItemEmits, IListItemSlots } from '../../interfaces/List/list-item.interface'

	import type { TListItemSlot } from '../../types/List/list-item.type'

	const attrs = useAttrs()

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<IListItemProps>(), {tag: 'div'})

	const emits = defineEmits<IListItemEmits>()

	defineSlots<IListItemSlots>()

	const {filterProps} = useProps<IListItemProps>(props)

	const slots = useSlots()
	const link = useLink(props, attrs)
	const id = computed(() => props.value === undefined ? link.href.value : props.value)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		select,
		isSelected,
		isIndeterminate,
		isGroupActivator,
		root,
		parent,
		openOnSelect
	} = useNestedItem(id, false)
	const list = useList()
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	const {backgroundColorClasses, backgroundColorStyles} = useBackgroundColor(toRef(props, 'bgColor'))
	const {densityClasses} = useDensity(props)
	// Only `sizeClasses` is consumed — NEVER `sizeStyles`. Its non-tokenised
	// branch emits an identical `width` AND `height` (a square), which would
	// destroy a list row. The rung classes below drive `min-height` + block
	// padding instead; see the `&--size-*` rules in the style block.
	const {sizeClasses} = useSize(props)

	const {isOn: isHover, config: hoverState} = useStateFlag(props, {state: 'hover'})
	const {isOn: isActiveFlag} = useStateFlag(props, {state: 'active'})
	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, undefined, hoverState, undefined)
	const {dimensionStyles} = useDimension(props)

	/*********************************************************
	 * Typography — dual-surface (title + subtitle children)
	 *
	 * One ITypographyProps set drives both BEM children.
	 * SCSS reads the 4 vars on each surface at root level
	 * (no per-size suffix) → fontSize / fontWeight /
	 * letterSpacing / lineHeight all have a real visual effect.
	 * fontFamily is not read by either surface → not exposed.
	 ********************************************************/
	const { typographyStyles: titleTypographyStyles } = useTypography(props, 'list-item__title')
	const { typographyStyles: subtitleTypographyStyles } = useTypography(props, 'list-item__subtitle')

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
		hasAppend,
		hasPrepend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	/*********************************************************
	 * isPrependZoneFocusable / isAppendZoneFocusable
	 *
	 * @description
	 * issue #443 — same <a>-content-model gating as OrigamChip/OrigamBreadcrumbItem:
	 * the root is `<a>` whenever `link.isLink` is true, and a <button>/<a>
	 * forbids any descendant with a `tabindex` attribute specified.
	 ********************************************************/
	const isPrependZoneFocusable = computed(() => isPrependClickable.value && !link.isLink.value)
	const isAppendZoneFocusable = computed(() => isAppendClickable.value && !link.isLink.value)

	const isActive = computed(() => {
		return isActiveFlag.value || link.isActive?.value || isSelected.value
	})
	/*********************************************************
	 * itemRole (#424)
	 *
	 * @description
	 * `<OrigamList>` hard-codes `role="listbox"` on its root — a listbox
	 * with no `role="option"` descendant is ARIA posé à moitié. Only a row
	 * genuinely nested inside a list (`list` truthy, i.e. an
	 * `<OrigamListChildren>`/`<OrigamList>` ancestor provided
	 * `ORIGAM_LIST_KEY`) AND acting as a real selectable row — not a group
	 * activator, which only toggles expand/collapse and never fires
	 * `select()` (see `click` below) — gets `role="option"`.
	 * @description
	 * A bare `<OrigamListItem>` used outside any list keeps no role at
	 * all: no ARIA is better than a role whose promised container doesn't
	 * exist.
	 ********************************************************/
	const itemRole = computed(() => {
		return list && !isGroupActivator ? 'option' : undefined
	})
	const isLink = computed(() => {
		return props.link && link.isLink.value
	})
	// `isClickable` drives cursor: pointer, the ripple, the keydown
	// handler, the `--link` modifier class, the focusable tabindex, and
	// the click bridge. It must be true whenever the item is interactive
	// for any reason — i.e. when ANY of the following holds:
	//   • `props.link` toggles explicit router-link mode
	//   • `link.isClickable.value` — useLink detects an `href`, a `to`,
	//     OR an `onClick` listener (on attrs or props)
	//   • `props.value != null && !!list` — selectable value inside a
	//     list group (e.g. the items inside the Select dropdown)
	//
	// Pre-fix the chain was `… && props.link && (props.link || …)`. The
	// middle `props.link` short-circuited the whole expression to false
	// whenever the consumer didn't opt into link mode, killing cursor
	// feedback / ripple / keyboard activation on every click-only item
	// (notably Select dropdown items, which only carry `onClick` in
	// `menuListItemProps`). Drop the redundant precondition and let the
	// OR chain own the decision.
	const isClickable = computed(() => {
		return !props.disabled && (props.link || link.isClickable.value || (props.value != null && !!list))
	})
	const lineClasses = computed(() => {
		return [
			props.lines ? `origam-list-item--${props.lines}-line` : undefined
		]
	})
	const listItemTabIndex = computed(() => {
		return isClickable.value ? (list ? -2 : 0) : undefined
	})

	const setActiveLink = () => {
		if (parent.value != null) {
			root.open(parent.value, true)
		}
		openOnSelect(true)
	}

	watch(() => link.isActive?.value, val => {
		if (!val) {
			return
		}

		setActiveLink()
	})

	/*********************************************************
	 * Events
	 ********************************************************/
	const click = (e: MouseEvent) => {
		emits('click', e)

		if (isGroupActivator || !isClickable.value) return

		link.navigate?.(e)

		if (props.value != null) {
			select(!isSelected.value, e)
		}
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClick = (e: MouseEvent) => {
		click(e)
	}
	/*********************************************************
	 * handleKeyDown (#439)
	 *
	 * @description
	 * `@keydown="isClickable && !isLink && handleKeyDown"` used to compile
	 * to `$event => (cond && _ctx.handleKeyDown)` — Vue's inline-statement
	 * form for anything more complex than a bare member expression. The
	 * expression EVALUATES `handleKeyDown` (a function reference) and
	 * stops there; it never CALLS it.
	 * @description
	 * Root cause fixed at the binding (`@keydown="handleKeyDown"`, the one
	 * form Vue auto-invokes with `$event`) — the guard moves in here,
	 * where wrapping it in `&&`/`?:` again can't silently undo the fix
	 * (see issue #439 / #397).
	 ********************************************************/
	const handleKeyDown = (e: KeyboardEvent) => {
		if (!isClickable.value || isLink.value) return

		if (e.key === KEYBOARD_VALUES.ENTER || e.key === ' ') {
			e.preventDefault()
			click(e as any as MouseEvent)
		}
	}

	/*********************************************************
	 * Slots
	 ********************************************************/
	const slotProps = computed(() => {
		return ({
			isActive: isActive.value,
			select,
			isSelected: isSelected.value,
			isIndeterminate: isIndeterminate.value
		} satisfies TListItemSlot)
	})
	const hasTitle = computed(() => {
		return slots.title || props.title != null
	})
	const hasSubtitle = computed(() => {
		return slots.subtitle || props.subtitle != null
	})

	list?.updateHasPrepend(hasPrepend)
	list?.updateHasAppend(hasAppend)

	onBeforeMount(() => {
		if (link.isActive?.value) {
			setActiveLink()
		}
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const listItemStyles = computed(() => {
		return [
			dimensionStyles.value,
			borderStyles.value,
			backgroundColorStyles.value,
			paddingStyles.value,
			marginStyles.value,
			roundedStyles.value,
			props.style
		] as StyleValue
	})
	const listItemClasses = computed(() => {
		return [
			'origam-list-item',
			{
				'origam-list-item--active': isActive.value,
				'origam-list-item--disabled': props.disabled,
				'origam-list-item--link': isClickable.value,
				'origam-list-item--nav': props.nav,
				'origam-list-item--prepend': !hasPrepend && list && list.hasPrepend.value,
				'origam-list-item--append': !hasAppend && list && list.hasAppend.value,
				'origam-list-item--slim': props.slim,
				[`${props.activeClass}`]: props.activeClass && isActive.value
			},
			backgroundColorClasses.value,
			borderClasses.value,
			densityClasses.value,
			sizeClasses.value,
			elevationClasses.value,
			lineClasses.value,
			roundedClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #375 — the template used to write `:id="props.id"` explicitly,
	 * because the bare name `id` is ALREADY a local (the nested-item
	 * registration key computed above from `value`/`href` — DO NOT feed
	 * `props.id` into that one, `useNestedItem` uses it synchronously as
	 * a Map key, see #372/#442).
	 * @description
	 * Renaming this SEPARATE `useStyle` local to `styleId` and seeding it
	 * with `() => props.id` gives the template an unambiguous,
	 * rule-compliant binding (`:id="styleId"`) without touching the
	 * registration identity at all.
	 ********************************************************/
	const {id: styleId, css, load, isLoaded, unload} = useStyle(listItemStyles, () => props.id)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		isGroupActivator,
		isSelected,
		list,
		select,
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
	.origam-list-item {
		$this: &;

		// Declared locally rather than inherited from the global reset in
		// `assets/scss/main.scss`: the row height is the contract of the
		// `--size-*` rungs below, and it must resolve to the same number
		// whether or not the consumer imported the reset sheet. Same
		// precedent as `.origam-field__input`, which declares it too.
		align-items: var(--origam-list-item---align-items, center);
		display: var(--origam-list-item---display, grid);
		flex: var(--origam-list-item---flex, none);
		grid-template-areas: var(--origam-list-item---grid-template-areas, "prepend content append");
		grid-template-columns: var(--origam-list-item---grid-template-columns, max-content 1fr auto);

		max-width: var(--origam-list-item---max-width, 100%);
		// Density is added ONCE, on this term only — mirrors
		// `.origam-field__input`'s own `min-height: max(calc(height + density), lineHeight + padding)`.
		// The block padding below stays fixed per rung (no density term), exactly
		// like the field's `--origam-field__input---padding-top/bottom`, which are
		// only rung-dependent. Adding density a second time here (or a third time
		// via the block padding) double/triple-counts it — see the mixin comment.
		// `border-box` is declared here rather than inherited: the rung scale
		// below resolves to a DIFFERENT height under each box model, so leaving
		// it to the consumer's reset made the row depend on whether that reset
		// was loaded. Measured on x-large + comfortable: 60px without the reset
		// (content-box), 52px with it (border-box) — the second is what a built
		// app renders, and it silently broke the control/row match. Declaring
		// the model makes the scale mean one thing everywhere.
		box-sizing: border-box;

		// Density is added ONCE, on this term only — mirrors
		// `.origam-field__input`'s own `min-height: max(height + density, …)`.
		// Under `border-box` this min-height IS the row height, so the rungs
		// below hand it the FULL rung, not the rung minus its padding.
		min-height: max(calc(var(--origam-list-item---min-height, var(--origam-list__item---min-height, 56px)) + var(--origam-list---density, 0px)), 1.5rem);

		text-decoration: var(--origam-list-item---text-decoration, none);

		outline: var(--origam-list-item---outline, none);
		position: var(--origam-list-item---position, relative);

		padding-block-start: var(--origam-list-item---padding-block-start, 8px);
		padding-block-end: var(--origam-list-item---padding-block-end, 8px);
		padding-inline-start: calc(var(--origam-list-item---padding-inline-start, 16px) + var(--origam-list---indent-padding, 0px) + var(--origam-list---density, 0px));
		padding-inline-end: calc(var(--origam-list-item---padding-inline-end, 16px) + var(--origam-list---density, 0px));

		margin-block-start: var(--origam-list-item---margin-block-start, 0);
		margin-block-end: var(--origam-list-item---margin-block-end, 0);
		margin-inline-start: var(--origam-list-item---margin-inline-start, 0);
		margin-inline-end: var(--origam-list-item---margin-inline-end, 0);

		border-color: var(--origam-list-item---border-color, var(--origam-color__text---primary));
		border-style: var(--origam-list-item---border-style, solid);
		border-width: var(--origam-list-item---border-width, 0);
		border-radius: var(--origam-list-item---border-radius, 0px);

		&--border {
			--origam-list-item---border-width: thin;
		}

		&--rounded {
			--origam-list-item---border-radius: 4px;
		}

		// Row-height scale, aligned rung for rung on the control-height scale
		// (`--origam-input__control---height-{sm,md,lg,xl}` = 28/36/44/52px) so
		// a row and a field of the same `size` share an identical vertical
		// footprint. The block padding is the field's own per-size padding —
		// (rung - 24px title line-height) / 2.
		//
		// The row is `border-box` (declared on the base rule above), so the
		// `min-height` there IS the rendered height: the rung goes in whole,
		// and the block padding only positions the 24px title inside it.
		// Density is NOT touched here — the base rule already applies it once,
		// to `min-height` only, which is where the field applies it too.
		//
		// The result reproduces `.origam-field__input` exactly:
		// `max(controlHeight + density, 1.5rem + paddingTop + paddingBottom)`.
		@mixin size-rung($rung, $block) {
			--origam-list-item---min-height: #{$rung};
			--origam-list-item---padding-block-start: #{$block};
			--origam-list-item---padding-block-end: #{$block};
		}

		&--size-small {
			@include size-rung(var(--origam-list-item---height-sm, 28px), var(--origam-list-item---padding-block-sm, 2px));
		}

		// `x-small` maps onto the default rung on purpose: `.origam-field` has no
		// `--size-x-small` rule, so a field at that size renders at 36px. Giving
		// the row a smaller rung would re-create the mismatch instead of fixing it.
		&--size-x-small,
		&--size-default {
			@include size-rung(var(--origam-list-item---height-md, 36px), var(--origam-list-item---padding-block-md, 6px));
		}

		&--size-large {
			@include size-rung(var(--origam-list-item---height-lg, 44px), var(--origam-list-item---padding-block-lg, 10px));
		}

		&--size-x-large {
			@include size-rung(var(--origam-list-item---height-xl, 52px), var(--origam-list-item---padding-block-xl, 14px));
		}

		&--active {
			#{$this}__prepend,
			#{$this}__append {
				&,
				> .origam-badge {
					.origam-icon {
						--origam-list-item__icon---opacity: 1;
					}
				}
			}
		}

		&--disabled {
			pointer-events: var(--origam-list-item---pointer-events, none);
			user-select: var(--origam-list-item---user-select, none);
			opacity: var(--origam-list-item---opacity, 0.6);
		}

		&--link {
			cursor: var(--origam-list-item---cursor, pointer);
		}

		&--one-line {
			#{$this}__subtitle {
				-webkit-line-clamp: 1;
			}
		}

		&--two-line {
			#{$this}__subtitle {
				-webkit-line-clamp: 2;
			}
		}

		&--three-line {
			#{$this}__prepend {
				--origam-list-item__prepend---align-self: start;
			}

			#{$this}__append {
				--origam-list-item__append---align-self: start;
			}

			#{$this}__subtitle {
				-webkit-line-clamp: 3;
			}
		}

		&--nav {
			--origam-list-item---padding-inline: 8px;

			&:not(:only-child) {
				--origam-list-item---margin-block-end: 4px;
			}

			#{$this}__title {
				--origam-list-item__title---font-size: 0.8125rem;
				--origam-list-item__title---font-weight: 500;
				--origam-list-item__title---letter-spacing: normal;
				--origam-list-item__title---line-height: 1rem;
			}

			#{$this}__subtitle {
				--origam-list-item__subtitle---font-size: 0.75rem;
				--origam-list-item__subtitle---font-weight: 400;
				--origam-list-item__subtitle---letter-spacing: 0.0178571429em;
				--origam-list-item__subtitle---line-height: 1rem;
			}
		}

		&--link {
			&:hover,
			&:focus-visible {
				> #{$this}__overlay {
					--origam-list-item__overlay---opacity: calc(0.08 * 1);
				}
			}
		}

		&--active,
		[aria-haspopup=menu][aria-expanded=true] {
			> #{$this}__overlay {
				--origam-list-item__overlay---opacity: calc(0.12 * 1);
			}

			&:hover,
			&:focus-visible {
				> #{$this}__overlay {
					--origam-list-item__overlay---opacity: calc(0.16 * 1);
				}
			}
		}

		&__overlay {
			background-color: var(--origam-list-item__overlay---background-color, var(--origam-list__item---overlay-background-color, currentColor));
			border-radius: var(--origam-list-item__overlay---border-radius, inherit);
			opacity: var(--origam-list-item__overlay---opacity, var(--origam-list__item---overlay-opacity, 0));
			pointer-events: var(--origam-list-item__overlay---pointer-events, none);
			position: var(--origam-list-item__overlay---position, absolute);
			bottom: var(--origam-list-item__overlay---position-bottom, 0);
			left: var(--origam-list-item__overlay---position-left, 0);
			right: var(--origam-list-item__overlay---position-right, 0);
			top: var(--origam-list-item__overlay---position-top, 0);
			transition-property: var(--origam-list-item__overlay---transition-property, opacity);
			transition-duration: var(--origam-list-item__overlay---transition-duration, 0.2s);
			transition-timing-function: var(--origam-list-item__overlay---transition-timing-function, var(--origam-list__item---overlay-transition-timing-function, ease-in-out));
		}

		&__underlay {
			position: var(--origam-list-item__underlay---position, absolute);
		}

		&__prepend,
		&__append {
			&,
			> .origam-badge {
				.origam-icon {
					opacity: var(--origam-list-item__icon---opacity, 0.87);
				}
			}
		}

		&__prepend {
			align-items: var(--origam-list-item__prepend---align-items, center);
			align-self: var(--origam-list-item__prepend---align-self, center);
			display: var(--origam-list-item__prepend---display, flex);
			grid-area: var(--origam-list-item__prepend---grid-area, prepend);
			min-width: var(--origam-list-item__prepend---min-width, 24px);
			min-height: var(--origam-list-item__prepend---min-height, 24px);
		}

		&__append {
			align-items: var(--origam-list-item__append---align-items, center);
			align-self: var(--origam-list-item__append---align-self, center);
			display: var(--origam-list-item__append---display, flex);
			grid-area: var(--origam-list-item__append---grid-area, append);
			min-width: var(--origam-list-item__append---min-width, 24px);
			min-height: var(--origam-list-item__append---min-height, 24px);
		}

		&__content {
			align-self: var(--origam-list-item__content---align-self, center);
			grid-area: var(--origam-list-item__content---grid-area, content);
			overflow: var(--origam-list-item__content---overflow, hidden);
		}

		&__title {
			hyphens: var(--origam-list-item__title---hyphens, auto);
			overflow-wrap: var(--origam-list-item__title---overflow-wrap, normal);
			overflow: var(--origam-list-item__title---overflow, hidden);
			padding-block-start: var(--origam-list-item__title---padding-block-start, 0);
			padding-block-end: var(--origam-list-item__title---padding-block-end, 0);
			padding-inline-start: var(--origam-list-item__title---padding-inline-start, 0);
			padding-inline-end: var(--origam-list-item__title---padding-inline-end, 0);
			white-space: var(--origam-list-item__title---white-space, nowrap);
			text-overflow: var(--origam-list-item__title---text-overflow, ellipsis);
			word-break: var(--origam-list-item__title---word-break, normal);
			word-wrap: var(--origam-list-item__title---word-wrap, break-word);
			font-size: var(--origam-list-item__title---font-size, var(--origam-list__item---title-font-size, 1rem));
			font-weight: var(--origam-list-item__title---font-weight, 400);
			letter-spacing: var(--origam-list-item__title---letter-spacing, 0.009375em);
			line-height: var(--origam-list-item__title---line-height, 1.5rem);
			text-transform: var(--origam-list-item__title---text-transform, none);
		}

		&__subtitle {
			-webkit-box-orient: vertical;
			display: var(--origam-list-item__subtitle---display, -webkit-box);
			opacity: var(--origam-list-item__subtitle---opacity, 0.6);
			overflow: var(--origam-list-item__subtitle---overflow, hidden);
			padding-block-start: var(--origam-list-item__subtitle---padding-block-start, 0);
			padding-block-end: var(--origam-list-item__subtitle---padding-block-end, 0);
			padding-inline-start: var(--origam-list-item__subtitle---padding-inline-start, 0);
			padding-inline-end: var(--origam-list-item__subtitle---padding-inline-end, 0);
			text-overflow: var(--origam-list-item__subtitle---text-overflow, ellipsis);
			word-break: var(--origam-list-item__subtitle---word-break, break-all);
			font-size: var(--origam-list-item__subtitle---font-size, var(--origam-list__item---subtitle-font-size, 0.875rem));
			font-weight: var(--origam-list-item__subtitle---font-weight, 400);
			letter-spacing: var(--origam-list-item__subtitle---letter-spacing, 0.0178571429em);
			line-height: var(--origam-list-item__subtitle---line-height, 1rem);
			text-transform: var(--origam-list-item__subtitle---text-transform, none);
		}
	}
</style>

