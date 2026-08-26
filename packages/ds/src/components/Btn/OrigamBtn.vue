<template>
	<component
			:is="link.tag.value"
			:id="id"
			v-ripple="isRipple"
			v-contrast
			:data-origam-color-locked="colorLocked"
			:class="btnClasses"
			:disabled="isDisabled || undefined"
			:aria-disabled="ariaDisabled"
			:href="hrefAttr"
			:type="typeAttr"
			:value="valueAttr"
			@click="handleClick"
			@mouseenter="handleMouseenter"
			@mouseleave="handleMouseleave"
	>
    <span
		    key="overlay"
		    class="origam-btn__overlay"
    />
		<span
				key="underlay"
				class="origam-btn__underlay"
		/>

		<origam-progress
				v-if="isOverlayLoading"
				ref="origamProgressRef"
				class="origam-btn__progress"
				v-bind="progressProps"
				:thickness="loaderConfig.kind === 'line' ? 3 : undefined"
				:color="color"
				:active="true"
		/>

		<slot name="wrapper">
			<origam-loader
					:loading="isSkeletonLoading"
					class="origam-btn__loader"
			>
				<template
						v-if="hasLoader && isSkeletonLoading"
						#loader
				>
					<slot
							name="loader"
							v-bind="progressProps"
					>
						<origam-skeleton
								variant="rectangular"
								:width="'100%'"
								:height="'100%'"
								v-bind="loaderConfig.overrides"
						/>
					</slot>
				</template>

				<template #default>
          <span
		          v-if="hasPrepend"
		          key="prepend"
		          class="origam-btn__prepend"
		          @click="handleClickPrepend"
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
          </span>

					<span
							class="origam-btn__content"
							data-no-activator=""
					>
            <slot name="default">
              <template v-if="hasIcon">
                <origam-icon
		                key="content-icon"
		                :icon="icon"
                />
              </template>
              <template v-else>
                {{ text }}
              </template>
            </slot>
          </span>

					<span
							v-if="hasAppend"
							key="append"
							class="origam-btn__append"
							@click="handleClickAppend"
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
          </span>
				</template>
			</origam-loader>
		</slot>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, ref, StyleValue, toRef, useAttrs, useSlots } from 'vue'
	import type { ComputedRef, ExtractPropTypes } from 'vue'
	import OrigamAvatar from '../Avatar/OrigamAvatar.vue'
	import OrigamIcon from '../Icon/OrigamIcon.vue'
	import OrigamLoader from '../Loader/OrigamLoader.vue'
	import OrigamProgress from '../Progress/OrigamProgress.vue'
	import OrigamSkeleton from '../Skeleton/OrigamSkeleton.vue'

	import { useAdjacent } from '../../composables/Commons/adjacent.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useGroupItem } from '../../composables/Commons/groupItem.composable'
	import { useLink } from '../../composables/Commons/link.composable'
	import { useLoader } from '../../composables/Commons/loader.composable'
	import { useLocation } from '../../composables/Commons/location.composable'
	import { usePosition } from '../../composables/Commons/position.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSelectLink } from '../../composables/Commons/selectLink.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStateFlag } from '../../composables/Commons/stateFlag.composable'
	import { useStatus } from '../../composables/Commons/status.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'
	import { useVariant } from '../../composables/Commons/variant.composable'

	import { ORIGAM_BTN_TOGGLE_KEY } from '../../consts/Btn/btn-toggle.const'

	import vContrast from '../../directives/Contrast/contrast.directive'
	import vRipple from '../../directives/Ripple/ripple.directive'

	import { DENSITY } from '../../enums/Commons/density.enum'
	import { LOADER_KIND } from '../../enums/Commons/loader.enum'
	import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'
	import { SIZES } from '../../enums/Commons/size.enum'

	import type { IAdjacentProps } from '../../interfaces/Commons/adjacent.interface'
	import type { IBtnProps } from '../../interfaces/Btn/btn.interface'
	import type { IProgressProps } from '../../interfaces/Progress/progress.interface'
	import type { IStatusProps } from '../../interfaces/Commons/status.interface'

	import type { IBtnEmits, IBtnSlots } from '../../interfaces/Btn/btn.interface'

	import type { TOrigamProgress } from '../../types/Progress/progress.type'

	/*********************************************************
	 * Global
	 ********************************************************/
	const attrs = useAttrs()

	const props = withDefaults(defineProps<IBtnProps>(), {
		tag: 'button',
		ripple: true,
		active: undefined,
		size: SIZES.DEFAULT,
		density: DENSITY.DEFAULT
	})

	// When the consumer explicitly picks a foreground `color`, mark the element
	// so `v-contrast` doesn't override that intentional colour for legibility.
	const colorLocked = computed(() => (props.color ? 'true' : undefined))

	defineEmits<IBtnEmits>()

	defineSlots<IBtnSlots>()

	const {filterProps} = useProps<IBtnProps>(props)

	const origamProgressRef = ref<TOrigamProgress>()

	const group = useGroupItem(props, ORIGAM_BTN_TOGGLE_KEY, false)
	const link = useLink(props, attrs)
	const slots = useSlots()

	useSelectLink(link, group?.select)

	/*********************************************************
	 * Effect
	 ********************************************************/
	const {isOn: isHover, config: hoverState, set: handleMouseenter, unset: handleMouseleave} = useStateFlag(props, {state: 'hover'})
	const {isOn: active, config: activeState} = useStateFlag(props, {state: 'active'})

	const isActive = computed(() => {
		// An explicitly FORCED active (`active=true` or `{ enabled: true }`)
		// wins everywhere — incl. inside a group (e.g. OrigamBottomNav
		// diffuses a forced active to every button).
		const a = props.active
		const forcedActive = a === true || (!!a && typeof a === 'object' && (a as { enabled?: boolean }).enabled === true)

		if (forcedActive) {
			return true
		}

		// Otherwise, inside a toggle group the SELECTION owns the active
		// state — only the selected item is active. A styling-only `active`
		// config still customises that item's surface (via `activeState`),
		// but it must not activate every button. (Previously this read
		// `active.value`, which `useActive` always resolves to a boolean —
		// never `undefined` — so the `group.isSelected` fallback was dead
		// code and toggle selection never highlighted the chosen item.)
		if (group) {
			return group.isSelected.value
		}

		if (link.isLink.value) {
			return link.isActive?.value
		}

		return active.value
	})
	/*********************************************************
	 * Disabled
	 ********************************************************/
	const isDisabled = computed(() => group?.disabled.value || props.disabled)

	/*********************************************************
	 *  ANCHOR-ONLY ATTRIBUTES
	 *
	 *  @description
	 *  A button rendered as `<a>` cannot carry `disabled`, so it announces the
	 *  disabled state through `aria-disabled` and drops its `href` instead.
	 *  Rendered as anything else it takes an explicit `type="button"`, which
	 *  stops a button inside a form from defaulting to submit.
	 *  Kept out of the template so the markup stays as readable as a wireframe.
	 ********************************************************/
	const isAnchor = computed(() => link.tag.value === 'a')
	const ariaDisabled = computed(() => (isAnchor.value && isDisabled.value ? 'true' : undefined))
	const hrefAttr = computed(() => (isAnchor.value && isDisabled.value ? undefined : link.href.value))
	const typeAttr = computed(() => (isAnchor.value ? undefined : 'button'))

	/*********************************************************
	 * Value
	 ********************************************************/
	const valueAttr = computed(() => {
		if (props.value === undefined || typeof props.value === 'symbol') return undefined

		return Object(props.value) === props.value
				? JSON.stringify(props.value, null, 0)
				: props.value
	})
	/*********************************************************
	 * Ripple
	 ********************************************************/
	const isRipple = computed(() => {
		return [
			!isDisabled.value && props.ripple,
			null,
			props.icon ? ['center'] : null
		]
	})

	/*********************************************************
	 * Composables — visual chrome (size, density, color, …)
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {loaderClasses, loaderConfig} = useLoader(props, LOADER_KIND.CIRCULAR)
	const {locationStyles} = useLocation(props)
	const {positionClasses} = usePosition(props)
	const {sizeClasses, sizeStyles} = useSize(props)
	const {typographyStyles} = useTypography(props, 'btn')

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {icon, prependIcon, appendIcon, statusClasses} = useStatus(props as unknown as IStatusProps & IAdjacentProps)
	// Phase 3 (Vague A) — strategy (a): we destructure BOTH `colorClasses`
	// and `colorStyles`. The classes hit the `.origam--bg-{intent}` /
	// `.origam--color-{intent}` global utilities for the resting state;
	// the inline styles still own hover/active/disabled (no utility class
	// for those slots) and any non-tokenisable raw color (legacy). Keeping
	// both in parallel guarantees zero visual regression while shrinking
	// the inline declaration count for tokenised intents.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {
		colorClasses, colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive as ComputedRef<boolean>, hoverState, activeState, isDisabled, toRef(props, 'flat'))
	const {variantClasses} = useVariant(props)
	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		hasAppend,
		hasPrepend
	} = useAdjacent(props, prependIcon, appendIcon)

	/*********************************************************
	 * Click handler
	 ********************************************************/
	const handleClick = (e: MouseEvent) => {
		if (
				isDisabled.value ||
				(link.isLink.value && (
						e.metaKey ||
						e.ctrlKey ||
						e.shiftKey ||
						(e.button !== 0) ||
						attrs.target === '_blank'
				))
		) return

		link.navigate?.(e)
		group?.toggle()

		// Note: Vue 3.5 automatically merges parent-passed `onClick`
		// (from `v-bind`) with the template `@click` listener — the
		// vnode receives a 2-element listener array, both fire. Don't
		// manually invoke `attrs.onClick` here, otherwise the parent's
		// handler runs twice and `isActive` toggles back to its
		// previous state.
	}

	/*********************************************************
	 * Icon & Loader
	 ********************************************************/
	const hasIcon = computed(() => {
		return !!(icon.value && props.icon !== true)
	})
	const hasLoader = computed(() => {
		return slots.loader || loaderConfig.value.isActive
	})

	// Skeleton mode REPLACES the btn content entirely — OrigamLoader's
	// v-if removes the default slot from the DOM, so the btn collapses
	// to the skeleton's bounds. Used as the `:loading` prop of the
	// wrapping OrigamLoader.
	const isSkeletonLoading = computed(() => {
		return loaderConfig.value.isActive && loaderConfig.value.kind === 'skeleton'
	})

	// Line / circular loaders OVERLAY the regular content (so the label
	// stays in the DOM, reserving the btn's natural width and — for
	// linear — staying visible behind the progress strip). Driven inside
	// the #default slot of OrigamLoader, which renders only when
	// `:loading` is false (= non-skeleton modes).
	const isOverlayLoading = computed(() => {
		return loaderConfig.value.isActive && (
			loaderConfig.value.kind === 'line' ||
			loaderConfig.value.kind === 'circular'
		)
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const progressProps = computed<Record<string, unknown>>(() => {
		// Exclude `size`, `type` and (critically) `tag` from filterProps.
		// The Btn's own `tag` prop is `'button'` or `'a'` (from useLink),
		// and without this exclusion `Object.assign` propagates it onto
		// the spinner — which then renders as a NATIVE <button> with the
		// user-agent default chrome (light-gray bg, 2px outset border,
		// rounded corners). That's the "gros carré blanc" Arnaud was
		// seeing INSIDE the loading button. Verified via Playwright DOM
		// dump: depth 2 was a <button> with bg rgb(239,239,239) and
		// border "2px outset rgb(0,0,0)" — straight UA defaults.
		const cfg = loaderConfig.value
		return Object.assign({
					size: '23',
					indeterminate: cfg.indeterminate,
					modelValue: cfg.modelValue,
					type: cfg.kind === 'line' ? PROGRESS_TYPE.LINEAR : PROGRESS_TYPE.CIRCULAR
				},
				origamProgressRef.value?.filterProps(props as Partial<ExtractPropTypes<IProgressProps>>, ['class', 'style', 'id', 'tag', 'size', 'type']) ?? {},
				cfg.overrides)
	})

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const btnStyles = computed(() => {
		return [
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			colorStyles.value,
			dimensionStyles.value,
			locationStyles.value,
			roundedStyles.value,
			sizeStyles.value,
			elevationStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const btnClasses = computed(() => {
		return [
			'origam-btn',
			group?.selectedClass.value,
			{
				'origam-btn--active': isActive.value,
				'origam-btn--block': props.block,
				'origam-btn--disabled': isDisabled.value,
				// Legacy boolean shortcut — kept in v2.x. `variantClasses`
				// emits `origam-btn--variant-flat` when `variant="flat"`,
				// so consumers can pick either spelling.
				'origam-btn--flat': props.flat,
				'origam-btn--icon': !!props.icon,
				'origam-btn--loading': loaderConfig.value.isActive,
				// Loader-kind discriminator so SCSS can branch per kind:
				//   • `--loader-line`     → linear progress strip overlay,
				//      keeps the label visible (like OrigamCard's loader).
				//   • `--loader-circular` → centred spinner; label hidden.
				//   • `--loader-skeleton` → full-box shimmer; label hidden,
				//      btn keeps a min-width so it doesn't collapse.
				[`origam-btn--loader-${loaderConfig.value.kind}`]: loaderConfig.value.isActive,
				'origam-btn--slim': props.slim,
				'origam-btn--stacked': props.stacked
			},
			variantClasses.value,
			borderClasses.value,
			colorClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			loaderClasses.value,
			positionClasses.value,
			roundedClasses.value,
			sizeClasses.value,
			statusClasses.value,
			props.class
		]
	})

	// `useStyle` returns the id the root element must carry — it is the
	// selector of the generated `#<id> { … }` rule, and Btn has no inline
	// `:style` fallback, so root id and rule selector cannot drift apart.
	// Passing `() => props.id` makes a CONSUMER-supplied `id` win and the
	// rule follow it; without it the generated id silently overwrote the
	// consumer's, breaking every `<label for>` / `aria-labelledby` /
	// `aria-controls` / `aria-describedby` association targeting a button.
	const {id, css, load, isLoaded, unload} = useStyle(btnStyles, () => props.id)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		group,
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
	.origam-btn {
		$this: &;

		position: var(--origam-btn---position, relative);
		vertical-align: middle;
		flex-shrink: 0;

		font-size: var(--origam-btn---font-size);
		font-weight: var(--origam-btn---font-weight);
		letter-spacing: var(--origam-btn---letter-spacing);
		line-height: var(--origam-btn---line-height);
		text-decoration: var(--origam-btn---text-decoration);
		text-indent: var(--origam-btn---text-indent);

		transition-property: box-shadow, transform, opacity, background;
		transition-duration: var(--origam-btn---transition-duration, 0.28s);
		transition-timing-function: var(--origam-btn---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));

		padding: 0 calc(16px + var(--origam-btn---density-padding-x, 0px));

		width: var(--origam-btn---width, auto);
		min-width: var(--origam-btn---min-width, calc(var(--origam-btn---width, 64px) + var(--origam-btn---density, 0px)));
		max-width: var(--origam-btn---max-width, 100%);
		height: calc(var(--origam-btn---height, 36px) + var(--origam-btn---density, 0px));
		min-height: var(--origam-btn---min-height, calc(var(--origam-btn---height, 36px) + var(--origam-btn---density, 0px)));
		max-height: var(--origam-btn---max-height, 100%);

		background-color: var(--origam-btn---background-color, rgb(230, 230, 230));
		color: var(--origam-btn---color, rgba(30, 30, 30, 0.87));

		outline: none;
		cursor: pointer;

		user-select: none;
		opacity: var(--origam-btn---opacity, 1);

		border-width: var(--origam-btn-group---border-width);
		border-style: var(--origam-btn-group---border-style);
		border-color: var(--origam-btn-group---border-color);
		border-radius: var(
			--origam-btn---border-radius,
			var(--origam-btn-group---border-radius, 4px)
		);

		@media (prefers-reduced-motion: reduce) {
			transition: none;
		}

		&:focus-visible {
			outline: var(--origam-border__width---2, 2px) solid var(--origam-color__border---focus, currentColor);
			outline-offset: var(--origam-space---1, 2px);
		}

		#{$this}__loader {
			align-items: center;
			justify-content: center;
			display: inline-grid;
			grid-template-areas: "prepend content append";
			grid-template-columns: max-content auto max-content;
			height: 100%;
			width: 100%;

			:deep(.origam-progress--circular) {
				width: 1.5em;
				height: 1.5em;
			}
		}

		&--size-x-small {
			--origam-btn---height: 20px;
			--origam-btn---font-size: 0.625rem;
			--origam-btn---min-width: 36px;
			padding: 0 calc(8px + var(--origam-btn---density-padding-x, 0px));

			:deep(.origam-icon) {
				--origam-btn---font-size: 16px;
			}
		}

		&--size-small {
			--origam-btn---height: 28px;
			--origam-btn---font-size: 0.75rem;
			--origam-btn---min-width: 50px;
			padding: 0 calc(12px + var(--origam-btn---density-padding-x, 0px));

			:deep(.origam-icon) {
				--origam-btn---font-size: 20px;
			}
		}

		&--size-default {
			--origam-btn---height: 36px;
			--origam-btn---font-size: 0.875rem;
			--origam-btn---min-width: 64px;
			padding: 0 calc(16px + var(--origam-btn---density-padding-x, 0px));

			:deep(.origam-icon) {
				--origam-btn---font-size: 24px;
			}
		}

		&--size-large {
			--origam-btn---height: 44px;
			--origam-btn---font-size: 1rem;
			--origam-btn---min-width: 78px;
			padding: 0 calc(20px + var(--origam-btn---density-padding-x, 0px));

			:deep(.origam-icon) {
				--origam-btn---font-size: 28px;
			}
		}

		&--size-x-large {
			--origam-btn---height: 52px;
			--origam-btn---font-size: 1.125rem;
			--origam-btn---min-width: 92px;
			padding: 0 calc(24px + var(--origam-btn---density-padding-x, 0px));

			:deep(.origam-icon) {
				--origam-btn---font-size: 32px;
			}
		}

		&--density-comfortable {
			--origam-btn---density: 8px;
			--origam-btn---density-padding-x: 4px;
		}

		&--density-default {
			--origam-btn---density: 0px;
			--origam-btn---density-padding-x: 0px;
		}

		&--density-compact {
			--origam-btn---density: -8px;
			--origam-btn---density-padding-x: -4px;
		}

		&--border {
			--origam-btn---border-width: thin;
		}

		&--absolute {
			--origam-btn---position: absolute;
		}

		&--fixed {
			--origam-btn---position: fixed;
		}

		&:hover,
		&:focus-visible {
			> #{$this}__overlay {
				--origam-btn__overlay---opacity: var(--origam-btn---overlay-opacity-hover, 0.12);
			}
		}

		&--active,
		[aria-haspopup=menu][aria-expanded=true] {
			> #{$this}__overlay {
				--origam-btn__overlay---opacity: var(--origam-btn---overlay-opacity-active, 0.2);
			}

			&:hover,
			&:focus-visible {
				> #{$this}__overlay {
					--origam-btn__overlay---opacity: var(--origam-btn---overlay-opacity-active-hover, 0.28);
				}
			}
		}

		&--icon {
			--origam-btn---border-radius: var(--origam-btn---border-radius-icon, 50%);

			--origam-btn---min-width: 0;
			--origam-btn---width: calc(var(--origam-btn---height, 36px) + var(--origam-btn---density, 0px));

			padding: 0;

			#{$this}__loader {
				display: flex;
				align-items: center;
				justify-content: center;
				grid-template-areas: none;
				grid-template-columns: none;
			}

			#{$this}__content :deep(.origam-icon) {
				width: 1em;
				height: 1em;
				line-height: 1;
				text-align: center;
				font-size: inherit;
			}
		}

		&--flat,
		&--variant-flat {
			box-shadow: none;
		}

		&--variant-text {
			background-color: transparent !important;
			box-shadow: none;
		}

		&--variant-elevated {
			box-shadow: var(--origam-btn---box-shadow-elevated, var(--origam-shadow---md));
		}

		&--variant-tonal {
			background-color: var(
				--origam-btn---background-color-tonal,
				var(--origam-color__surface---overlay)
			) !important;
			box-shadow: none;

			// Active / selected state (e.g. inside an OrigamBtnToggle):
			// lift the surface to the "raised" rung so the selected
			// button is clearly distinct from the resting siblings.
			// Three axes change on selection:
			//   1. background → raised surface (white in light / elevated in dark)
			//   2. box-shadow → xs shadow (segmented-control "pill" lift)
			//   3. font-weight → semibold (label emphasis)
			// All three are driven by theme-overridable tokens.
			&#{$this}--active {
				background-color: var(
					--origam-btn---background-color-tonal-active,
					var(--origam-color__surface---raised, var(--origam-color__surface---overlay))
				) !important;
				box-shadow: var(
					--origam-btn---box-shadow-tonal-active,
					var(--origam-shadow---xs)
				);
				font-weight: 600;
			}
		}

		&--variant-outlined {
			background-color: transparent !important;
			border-width: var(--origam-btn---border-width-outlined, var(--origam-border__width---thin));
			border-style: solid;
			border-color: var(--origam-btn---border-color, currentColor);
			box-shadow: none;

			// Selected state inside an OrigamBtnToggle: the active option
			// FILLS like a real default button (using the btn's own bg/fg
			// tokens, so it follows color/intent and theme), while the resting
			// siblings stay outlined. This is what makes a btn-toggle read as
			// a row of real buttons rather than a flat segmented strip.
			//
			// `-background-color-active` is a DEDICATED token, separate from
			// the plain `-background-color` one: a theme is free to keep
			// outlined buttons unfilled at rest (background-color:
			// transparent, e.g. a print/minimalist identity) without also
			// erasing the active/selected indicator — the two states are
			// no longer forced to share one token. Themes that don't
			// declare it fall straight through to the existing behaviour
			// (their own `-background-color`), so this is additive only.
			&#{$this}--active {
				background-color: var(--origam-btn---background-color-active, var(--origam-btn---background-color)) !important;
				color: var(--origam-btn---color);
				border-color: var(--origam-btn---background-color-active, var(--origam-btn---background-color));
			}
		}

		&--variant-plain {
			background-color: transparent !important;
			box-shadow: none;
			opacity: var(--origam-btn---opacity-plain, var(--origam-opacity---70));

			&:hover,
			&:focus-visible {
				opacity: 1;
			}
		}

		&--variant-ghost {
			background-color: var(
				--origam-btn---background-color-ghost,
				color-mix(in srgb, currentColor 12%, transparent)
			) !important;
			border-width: var(--origam-btn---border-width-ghost, var(--origam-border__width---thin));
			border-style: solid;
			border-color: var(
				--origam-btn---border-color-ghost,
				color-mix(in srgb, currentColor 24%, transparent)
			);

			box-shadow: var(
				--origam-btn---box-shadow-ghost,
				0 0 0 1px color-mix(in srgb, currentColor 18%, transparent),
				0 4px 18px 0 color-mix(in srgb, currentColor 28%, transparent),
				0 1px 0 0 color-mix(in srgb, white 35%, transparent) inset
			);

			@supports (backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px)) {
				backdrop-filter: var(--origam-btn---backdrop-filter-ghost, blur(8px));
				-webkit-backdrop-filter: var(--origam-btn---backdrop-filter-ghost, blur(8px));
			}

			@supports not ((backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px))) {
				background-color: var(
					--origam-btn---background-color-ghost,
					color-mix(in srgb, currentColor 18%, transparent)
				) !important;
			}

			&:hover,
			&:focus-visible {
				background-color: var(
					--origam-btn---background-color-ghost-hover,
					color-mix(in srgb, currentColor 18%, transparent)
				) !important;
				box-shadow: var(
					--origam-btn---box-shadow-ghost-hover,
					0 0 0 1px color-mix(in srgb, currentColor 26%, transparent),
					0 6px 24px 0 color-mix(in srgb, currentColor 40%, transparent),
					0 1px 0 0 color-mix(in srgb, white 45%, transparent) inset
				);
			}
		}

		&--block {
			display: flex;
			flex: 1 0 auto;

			--origam-btn---min-width: 100%;
		}

		&--disabled {
			pointer-events: none;
			--origam-btn---opacity: var(--origam-btn---opacity-disabled, 0.5);

			&:hover {
				--origam-btn---opacity: var(--origam-btn---opacity-disabled, 0.5);
			}
		}

		&--loading {
			pointer-events: none;
			position: relative;
			overflow: hidden;
		}

		// Linear progress — strip overlay at the BOTTOM edge of the btn
		// (configurable to the top via the `--linear-position-top: 0`
		// token). Label / prepend / append stay visible — same pattern
		// as OrigamCard's linear loader.
		//
		// Two non-obvious bits:
		//  1. `:deep()` is required around `.origam-btn__progress`
		//     because Vue 3 scoped CSS does NOT match the ROOT of a
		//     child component (`<origam-progress>`), even when the
		//     class is propagated through. Without `:deep()` the
		//     selector silently no-ops.
		//  2. `!important` is required to win against the inline
		//     `width: 23px; height: 23px` that OrigamProgress's
		//     `useSize(props)` injects (the btn's progressProps sets
		//     `size: '23'` for the circular case — it leaks onto the
		//     linear branch and would render the strip as a 23×23
		//     square otherwise).
		&--loader-line {
			:deep(#{$this}__progress) {
				position: absolute !important;
				inset-inline: 0 !important;
				inset-block-end: var(--origam-btn__progress---linear-position, 0) !important;
				inset-block-start: var(--origam-btn__progress---linear-position-top, auto) !important;
				width: 100% !important;
				height: var(--origam-btn__progress---linear-height, 3px) !important;
				margin: 0 !important;
				z-index: 1;
				pointer-events: none;
			}
		}

		// Circular spinner — centred absolutely over the
		// (invisible-but-still-laid-out) label. The `inset: 0` +
		// `margin: auto` pattern centres an absolutely-positioned
		// element when it has intrinsic width/height (the spinner is
		// 16-23 px square from its `size` prop). Hiding the label via
		// opacity preserves the btn's natural width.
		&--loader-circular {
			#{$this}__content,
			#{$this}__prepend,
			#{$this}__append {
				opacity: 0;
			}

			:deep(#{$this}__progress) {
				position: absolute !important;
				inset: 0 !important;
				margin: auto !important;
				pointer-events: none;
			}
		}

		// Skeleton — rectangular placeholder REPLACES the btn content
		// entirely (OrigamLoader's #loader branch). The btn collapses to
		// the skeleton's natural size unless we give it a sensible
		// min-width / min-height.
		&--loader-skeleton {
			min-width: var(--origam-btn---loader-skeleton-min-width, 96px);
			min-height: var(--origam-btn---loader-skeleton-min-height, 36px);

			:deep(.origam-skeleton--rectangular) {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				border-radius: inherit;
			}
		}

		&--stacked {
			#{$this}__loader {
				grid-template-areas: "prepend" "content" "append";
				grid-template-columns: auto;
				grid-template-rows: max-content max-content max-content;
				justify-items: center;
				align-content: center;
			}

			#{$this}__content {
				flex-direction: column;
				line-height: 1.25;
			}

			#{$this}__prepend,
			#{$this}__append,
			#{$this}__content > :deep(.origam-icon--start),
			#{$this}__content > :deep(.origam-icon--end) {
				margin-inline: 0;
			}

			#{$this}__prepend,
			#{$this}__content > :deep(.origam-icon--start) {
				margin-bottom: 4px;
			}

			#{$this}__append,
			#{$this}__content > :deep(.origam-icon--end) {
				margin-top: 4px;
			}

			#{$this}__content {
				white-space: normal;
			}

			&#{$this}--size-x-small {
				--origam-btn---height: 56px;
				font-size: 0.625rem;
				min-width: 56px;
				padding: 0 calc(12px + var(--origam-btn---density-padding-x, 0px));
			}

			&#{$this}--size-small {
				--origam-btn---height: 64px;
				font-size: 0.75rem;
				min-width: 64px;
				padding: 0 calc(14px + var(--origam-btn---density-padding-x, 0px));
			}

			&#{$this}--size-default {
				--origam-btn---height: 72px;
				font-size: 0.875rem;
				min-width: 72px;
				padding: 0 calc(16px + var(--origam-btn---density-padding-x, 0px));
			}

			&#{$this}--size-large {
				--origam-btn---height: 80px;
				font-size: 1rem;
				min-width: 80px;
				padding: 0 calc(18px + var(--origam-btn---density-padding-x, 0px));
			}

			&#{$this}--size-x-large {
				--origam-btn---height: 88px;
				font-size: 1.125rem;
				min-width: 88px;
				padding: 0 calc(20px + var(--origam-btn---density-padding-x, 0px));
			}

			&#{$this}--density-comfortable {
				--origam-btn---density: 16px;
			}

			&#{$this}--density-compact {
				--origam-btn---density: -24px;
			}
		}

		&--slim {
			padding: 0 8px;
		}

		&--rounded {
			--origam-btn---border-radius: var(--origam-btn---border-radius-rounded, var(--origam-radius---2xl, 24px));

			&#{$this}--icon {
				--origam-btn---border-radius: var(--origam-btn---border-radius, 4px);
			}
		}

		&--rounded-x-small {
			--origam-btn---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-btn---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-btn---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-btn---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-btn---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-btn---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-shaped {
			border-start-start-radius: var(--origam-btn---border-radius-rounded, 16px);
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-btn---border-radius-rounded, 16px);
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-btn---border-radius-rounded, 16px);
			border-end-start-radius: var(--origam-btn---border-radius-rounded, 16px);
			border-end-end-radius: 0;
		}

		&__content,
		&__prepend,
		&__append {
			align-items: center;
			display: flex;

			transition: transform, opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		}

		&__prepend {
			grid-area: prepend;

			margin-inline-start: var(--origam-btn__prepend---margin-inline-start);
			margin-inline-end: var(--origam-btn__prepend---margin-inline-end);
		}

		&__append {
			grid-area: append;

			margin-inline-start: var(--origam-btn__append---margin-inline-start);
			margin-inline-end: var(--origam-btn__append---margin-inline-end);
		}

		&__content {
			grid-area: content;
			justify-content: center;
			white-space: nowrap;

			margin-inline-start: var(--origam-btn__content---margin-inline-start);
			margin-inline-end: var(--origam-btn__content---margin-inline-end);

			> :deep(.origam-icon--start) {
				--origam-btn__content---margin-inline-start: calc(var(--origam-btn---height) / -9);
				--origam-btn__content---margin-inline-end: calc(var(--origam-btn---height) / 4.5);
			}

			> :deep(.origam-icon--end) {
				--origam-btn__content---margin-inline-start: calc(var(--origam-btn---height) / 4.5);
				--origam-btn__content---margin-inline-end: calc(var(--origam-btn---height) / -9);
			}
		}

		&__overlay {
			background-color: var(--origam-color__overlay---scrim);
			border-radius: inherit;
			opacity: var(--origam-btn__overlay---opacity, 0);
			transition: opacity 0.2s ease-in-out;
		}

		&__overlay,
		&__underlay {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			pointer-events: none;
		}
	}
</style>

<style
		lang="scss"
		scoped
>
	.origam-btn {
		--origam-btn__content---margin-inline-start: 0;
		--origam-btn__content---margin-inline-end: 0;

		--origam-btn__append---margin-inline-end: calc(var(--origam-btn---height) / -9);
		--origam-btn__append---margin-inline-start: calc(var(--origam-btn---height) / 4.5);

		--origam-btn__prepend---margin-inline-start: calc(var(--origam-btn---height) / -9);
		--origam-btn__prepend---margin-inline-end: calc(var(--origam-btn---height) / 4.5);

		--origam-btn---min-width: calc(var(--origam-btn---width, 36px) + var(--origam-btn---density, 0));
		--origam-btn---min-height: calc(var(--origam-btn---height, 36px) + var(--origam-btn---density, 0));
	}
</style>
