<template>
	<component
			:is="link.tag"
			v-ripple="isClickable && ripple"
			v-contrast
			:class="cardClasses"
			:href="link.href"
			:style="cardStyles"
			:tabindex="disabled ? -1 : undefined"
			@click="handleClick"
			@mouseenter="onMouseenter"
			@mouseleave="onMouseleave"
	>
    <span
		    v-if="isClickable"
		    key="overlay"
		    class="origam-card__overlay"
    />
		<span
				key="underlay"
				class="origam-card__underlay"
		/>

		<slot name="wrapper">
			<template v-if="hasLoading">
				<slot name="loader">
					<div class="origam-card__loader">
						<origam-skeleton
								v-if="loaderConfig.kind === 'skeleton'"
								variant="card"
								:loading="true"
								v-bind="loaderConfig.overrides"
						/>
						<origam-progress
								v-else
								:active="true"
								:color="color"
								:indeterminate="loaderConfig.indeterminate"
								:model-value="loaderConfig.modelValue"
								:type="loaderConfig.kind === 'circular' ? PROGRESS_TYPE.CIRCULAR : PROGRESS_TYPE.LINEAR"
								:class="cardProgressClasses"
								thickness="4"
								v-bind="loaderConfig.overrides"
						/>
					</div>
				</slot>
			</template>

			<template v-if="!loaderConfig.isActive || loaderConfig.kind !== 'skeleton'">
				<template v-if="hasHeader">
					<slot name="header">
						<origam-card-header
								key="item"
								:append-avatar="appendAvatar"
								:append-icon="appendIcon"
								:density="density"
								:prepend-avatar="prependAvatar"
								:prepend-icon="prependIcon"
								:subtitle="subtitle"
								:title="title"
								class="origam-card__header"
								@click:prepend="handleClickPrepend"
								@click:append="handleClickAppend"
						>
							<template
									v-if="slots['header.append']"
									#append
							>
								<slot name="header.append"/>
							</template>

							<template
									v-if="slots['header.prepend']"
									#prepend
							>
								<slot name="header.prepend"/>
							</template>

							<template
									v-if="slots['header.title']"
									#title
							>
								<slot name="header.title"/>
							</template>

							<template
									v-if="slots['header.subtitle']"
									#subtitle
							>
								<slot name="header.subtitle"/>
							</template>

							<template
									v-if="slots['header.content']"
									#default
							>
								<slot name="header.content"/>
							</template>
						</origam-card-header>
					</slot>
				</template>

				<template v-if="hasAsset">
					<div
							key="image"
							class="origam-card__asset"
					>
						<slot name="asset">
							<origam-img
									key="image-img"
									:src="image"
									class="origam-card__image"
									cover
							/>
						</slot>
					</div>
				</template>

				<div class="origam-card__content">
					<template v-if="hasText">
						<slot name="text">
							<origam-card-text
									key="text"
									:density="density"
									:text="text"
									class="origam-card__text"
							/>
						</slot>
					</template>

					<slot name="default"/>
				</div>

				<template v-if="hasFooter">
					<div class="origam-card__footer">
						<slot name="footer"/>
					</div>
				</template>
			</template>
		</slot>
	</component>
</template><script
		lang="ts"
		setup
>
	import { OrigamCardHeader, OrigamCardText, OrigamImg, OrigamProgress, OrigamSkeleton } from '../../components'

	import {
		useActive,
		useAdjacent,
		useDefaults,
		useDensity,
		useDimension,
		useHover,
		useLink,
		useLoader,
		useLocation,
		usePosition,
		useProps,
		useStateEffect,
		useStyle
} from '../../composables'

	import { vContrast, vRipple } from '../../directives'

	import { DENSITY, PROGRESS_TYPE } from '../../enums'

	import type { ICardProps} from '../../interfaces'

	import type { ICardEmits } from '../../interfaces/Card/card.interface'

	import { computed, StyleValue, toRef, useAttrs, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and link resolution for the Card component.
	 ********************************************************/
	const _props = withDefaults(defineProps<ICardProps>(), {ripple: true, density: DENSITY.DEFAULT, tag: 'div'})

	// `useDefaults` resolves each prop against the closest theme
	// `components['origam-card']` config (OrigamBtn pattern) — without this,
	// theme entries like `rounded` / `border` / `flat` never took effect.
	const props = useDefaults(_props)

	defineEmits<ICardEmits>()

	const {filterProps} = useProps<ICardProps>(props)

	const attrs = useAttrs()

	const link = useLink(props, attrs)

	/*********************************************************
	 * Adjacent (prepend / append) & clickability
	 *
	 * @description
	 * Resolves prepend/append icons, click handlers and the
	 * clickable flag that enables ripple + overlay.
	 ********************************************************/
	// `useStateEffect` produces inline `color: …` / `background-color: …`
	// declarations from intent props (`color`, `bgColor`) and also reacts
	// to hover/active states by swapping in `hoverBgColor` / `hoverColor`
	// / `activeBgColor` / `activeColor` overrides (or auto-darken via
	// color-mix when no explicit override is provided).
	//
	// Pre-fix Card used `useBothColor` — the legacy composable — which
	// is stateless: passing `<origam-card hover-color="success">` was a
	// silent no-op because the composable never saw `isHover.value`.
	// We now wire `useHover` + `useActive` so the resting / hover /
	// pressed cycles cascade through the same intent system as Btn /
	// BottomNav / Alert.

	/*********************************************************
	 * Effect
	 ********************************************************/

	const {isHover, hoverState, hoverClasses, onMouseenter, onMouseleave} = useHover(props)
	const {isActive, activeState, activeClasses, onActive} = useActive(props)

	/*********************************************************
	 * Color
	 ********************************************************/

	// `useElevation` (inside `useStateEffect` below) treats `flat` as a hard
	// "no shadow, ever" override of `elevation` — by design, for the case
	// where a consumer sets BOTH props explicitly on the same instance.
	// Since useDefaults wiring (issue #242), `flat` can now also resolve
	// from `theme.components['origam-card'].flat` (the origam base theme
	// defaults every card to `flat: true`) — so a consumer who explicitly
	// passes only `elevation` (e.g. the free-form custom box-shadow escape
	// hatch) had their explicit choice silently suppressed by the THEME's
	// flat default, even though `elevation` itself correctly resolved via
	// useDefaults' own explicit-prop-wins precedence. `props.elevation` is
	// non-null ONLY when a consumer explicitly sets it (the origam base
	// theme never sets `elevation` on `origam-card`) — a reliable, low-risk
	// signal to stop `flat` from suppressing that explicit choice, without
	// touching the shared `useElevation`/`useStateEffect` composables used
	// by other components. `origam-card--flat` (the visual/hover modifier
	// class) is unaffected — only the value fed to useElevation's shadow
	// suppression is adjusted.
	const flatForElevation = computed(() => props.elevation != null ? false : props.flat)

	// Single state-aware composable for ALL 8 visual axes
	// (color/bgColor/border/rounded/elevation/padding/margin/gap).
	// Hover / active object overrides (e.g. `:hover="{ border: 'thick' }"`)
	// flow through here uniformly; previously these axes were each
	// resolved by their own per-axis composable AND missed the state
	// swap entirely.
	const {
		colorClasses, colorStyles,
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses, elevationStyles,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(
			props,
			isHover,
			isActive as unknown as import('vue').ComputedRef<boolean>,
			hoverState,
			activeState,
			computed(() => !!props.disabled),
			flatForElevation,
	)

	/*********************************************************
	 * Icon
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		hasAppend,
		hasPrepend
	} = useAdjacent(props, toRef(props, 'prependIcon'), toRef(props, 'appendIcon'))

	const isClickable = computed(() => {
		return !props.disabled && props.link && (props.link || link.isClickable.value)
	})

	// Combined click handler — drives both `isActive` (so `activeColor`
	// / `activeBgColor` resolve via `useStateEffect`) and the link
	// navigation when the Card is interactive (`link` prop / clickable).
	const handleClick = (event: MouseEvent) => {
		onActive()
		if (isClickable.value && link.navigate) {
			link.navigate(event)
		}
	}

	/*********************************************************
	 * Loader
	 *
	 * @description
	 * Controls the card loader slot and progress renderer.
	 ********************************************************/
	const {loaderClasses, loaderConfig} = useLoader(props, 'line')

	const slots = useSlots()

	const hasLoading = computed(() => {
		// `loaderConfig` is a `ComputedRef<IResolvedLoader>` from
		// `useLoader`. In `<script setup>` JS the ref must be unwrapped via
		// `.value` to read its fields — pre-fix this read `loaderConfig
		// .isActive` (a property of the Ref object itself, always
		// `undefined`) so `hasLoading` was permanently falsy and the
		// `<template v-if="hasLoading">` block — including the
		// `<origam-card__loader>` div with the linear/circular/skeleton
		// renderer — never mounted. The Card was visually marked
		// `origam-card--loading` (because `loaderClasses` does the
		// auto-unwrap correctly) yet rendered no loader, breaking the
		// "Loading shapes" e2e suite. Btn already uses the correct
		// `loaderConfig.value.isActive` form.
		return slots.loader || loaderConfig.value.isActive
	})

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Computed flags controlling header, asset, text and
	 * footer section rendering.
	 ********************************************************/
	const hasTitle = computed(() => {
		return slots['header.title'] || props.title != null
	})
	const hasSubtitle = computed(() => {
		return slots['header.subtitle'] || props.subtitle != null
	})
	const hasAsset = computed(() => {
		return !!(slots.asset || props.image)
	})
	const hasFooter = computed(() => {
		return slots.footer
	})
	const hasHeader = computed(() => {
		return slots.header || hasTitle.value || hasSubtitle.value || hasPrepend.value || hasAppend.value
	})
	const hasText = computed(() => {
		return slots.text || props.text != null
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all border, color, elevation, loader and
	 * layout classes/styles onto the root element.
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {locationStyles} = useLocation(props)
	const {positionClasses} = usePosition(props)
	// border / rounded / elevation / padding / margin all come from
	// `useStateEffect` above — state-aware versions that honour
	// `:hover="{ … }"` / `:active="{ … }"` overrides.

	const cardStyles = computed(() => {
		return [
			borderStyles.value,
			colorStyles.value,
			dimensionStyles.value,
			elevationStyles.value,
			locationStyles.value,
			roundedStyles.value,
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})
	const cardProgressClasses = computed(() => {
		return [
			'origam-card__progress',
			`origam-card__progress--${loaderConfig.value.kind === 'line' ? 'linear' : loaderConfig.value.kind}`
		]
	})
	const cardClasses = computed(() => {
		return [
			'origam-card',
			{
				'origam-card--disabled': props.disabled,
				'origam-card--flat': props.flat,
				'origam-card--hover': props.hover && !(props.disabled || props.flat),
				'origam-card--link': isClickable.value
			},
			borderClasses.value,
			colorClasses.value,
			densityClasses.value,
			elevationClasses.value,
			hoverClasses.value,
			activeClasses.value,
			loaderClasses.value,
			positionClasses.value,
			roundedClasses.value,
			marginClasses.value,
			paddingClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(cardStyles)


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
	.origam-card {
		$this: &;

		display: var(--origam-card---display);
		overflow: var(--origam-card---overflow);
		overflow-wrap: var(--origam-card---overflow-wrap);
		position: var(--origam-card---position);
		z-index: var(--origam-card---z-index);

		text-decoration: var(--origam-card---text-decoration);
		transition-duration: var(--origam-card---transition-duration);
		transition-property: var(--origam-card---transition-property);
		transition-timing-function: var(--origam-card---transition-timing-function);

		pointer-events: var(--origam-card---pointer-events);
		user-select: var(--origam-card---user-select);
		cursor: var(--origam-card---cursor);

		background-color: var(--origam-card---background);
		backdrop-filter: var(--origam-card---backdrop-filter, none);
		-webkit-backdrop-filter: var(--origam-card---backdrop-filter, none);
		box-shadow: var(--origam-card---box-shadow);
		color: var(--origam-card---color);

		padding-block-start: calc(var(--origam-card---padding-block-start) + var(--origam-card---density));
		padding-block-end: calc(var(--origam-card---padding-block-end) + var(--origam-card---density));
		padding-inline-start: calc(var(--origam-card---padding-inline-start) + var(--origam-card---density));
		padding-inline-end: calc(var(--origam-card---padding-inline-end) + var(--origam-card---density));

		margin-block-start: var(--origam-card---margin-block-start);
		margin-block-end: var(--origam-card---margin-block-end);
		margin-inline-start: var(--origam-card---margin-inline-start);
		margin-inline-end: var(--origam-card---margin-inline-end);

		border-color: var(--origam-card---border-color);
		border-style: var(--origam-card---border-style);
		border-top-width: var(--origam-card---border-top-width, 0);
		border-right-width: var(--origam-card---border-right-width, 0);
		border-bottom-width: var(--origam-card---border-bottom-width, 0);
		border-left-width: var(--origam-card---border-left-width, 0);
		border-start-start-radius: var(--origam-card---border-start-start-radius, 0);
		border-start-end-radius: var(--origam-card---border-start-end-radius, 0);
		border-end-end-radius: var(--origam-card---border-end-end-radius, 0);
		border-end-start-radius: var(--origam-card---border-end-start-radius, 0);

		&__asset {
			aspect-ratio: var(--origam-card__asset---aspect-ratio, 16 / 9);
			overflow: hidden;
		}

		&__overlay {
			background-color: var(--origam-card__overlay---background-color, var(--origam-color__overlay---scrim));
			border-radius: var(--origam-card__overlay---border-radius, inherit);
			opacity: var(--origam-card__overlay---opacity, var(--origam-card---overlay-opacity, 0));
			pointer-events: var(--origam-card__overlay---pointer-events, none);
			position: var(--origam-card__overlay---position, absolute);
			bottom: var(--origam-card__overlay---position-bottom, var(--origam-card---overlay-position-bottom, 0));
			left: var(--origam-card__overlay---position-left, var(--origam-card---overlay-position-left, 0));
			right: var(--origam-card__overlay---position-right, var(--origam-card---overlay-position-right, 0));
			top: var(--origam-card__overlay---position-top, var(--origam-card---overlay-position-top, 0));
			transition-property: var(--origam-card__overlay---transition-property, var(--origam-card---overlay-transition-property, opacity));
			transition-duration: var(--origam-card__overlay---transition-duration, var(--origam-card---overlay-transition-duration, 0.2s));
			transition-timing-function: var(--origam-card__overlay---transition-timing-function, var(--origam-card---overlay-transition-timing-function, ease-in-out));
		}

		&__underlay {
			position: var(--origam-card__underlay---position, var(--origam-card---underlay-position, absolute));
		}

		> * {
			opacity: var(--origam-card---opacity);
		}

		&--border {
			--origam-card---border-top-width: thin;
			--origam-card---border-right-width: thin;
			--origam-card---border-bottom-width: thin;
			--origam-card---border-left-width: thin;
		}

		&--border-top {
			--origam-card---border-top-width: thin;
			--origam-card---border-right-width: 0;
			--origam-card---border-bottom-width: 0;
			--origam-card---border-left-width: 0;
		}

		&--border-right {
			--origam-card---border-top-width: 0;
			--origam-card---border-right-width: thin;
			--origam-card---border-bottom-width: 0;
			--origam-card---border-left-width: 0;
		}

		&--border-bottom {
			--origam-card---border-top-width: 0;
			--origam-card---border-right-width: 0;
			--origam-card---border-bottom-width: thin;
			--origam-card---border-left-width: 0;
		}

		&--border-left {
			--origam-card---border-top-width: 0;
			--origam-card---border-right-width: 0;
			--origam-card---border-bottom-width: 0;
			--origam-card---border-left-width: thin;
		}

		&--rounded {
			--origam-card---border-start-start-radius: var(--origam-card---border-radius-rounded, 4px);
			--origam-card---border-start-end-radius: var(--origam-card---border-radius-rounded, 4px);
			--origam-card---border-end-end-radius: var(--origam-card---border-radius-rounded, 4px);
			--origam-card---border-end-start-radius: var(--origam-card---border-radius-rounded, 4px);
		}

		&--loading {
			min-width: var(--origam-card---loading-min-width, 240px);
			min-height: var(--origam-card---loading-min-height, 120px);
		}

		&__loader {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			min-height: var(--origam-card__loader---min-height, 4px);

			:deep(.origam-progress--linear) {
				position: absolute;
				inset-inline: 0;
				inset-block-start: 0;
				width: 100%;
				height: var(--origam-card__progress---linear-height, 4px);
			}

			:deep(.origam-progress--circular) {
				margin: var(--origam-card__progress---circular-margin, 24px auto);
			}

			:deep(.origam-skeleton-wrapper--card),
			:deep(.origam-skeleton--rectangular),
			:deep(.origam-skeleton--text) {
				width: 100%;
			}

			:deep(.origam-skeleton-wrapper--card) {
				min-height: var(--origam-card__loader---min-height-skeleton, 200px);
			}
		}

		&--loading &__loader:has(.origam-card__progress--circular) {
			position: absolute;
			inset: 0;
			z-index: var(--origam-card__loader---z-index, 3);
			min-height: 0;
			border-radius: inherit;
			background-color: var(--origam-card__loader---overlay-background, color-mix(in srgb, var(--origam-card---background) 62%, transparent));

			:deep(.origam-progress--circular) {
				margin: 0;
			}
		}

		&--rounded-shaped {
			border-start-start-radius: var(--origam-card---border-radius-rounded, 16px);
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-card---border-radius-rounded, 16px);
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-card---border-radius-rounded, 16px);
			border-end-start-radius: var(--origam-card---border-radius-rounded, 16px);
			border-end-end-radius: 0;
		}

		&--absolute {
			--origam-card---position: absolute;
		}

		&--fixed {
			--origam-card---position: fixed;
		}

		&--density-default {
			--origam-card---density: 0px;
		}

		&--density-compact {
			--origam-card---density: -8px;
		}

		&--density-comfortable {
			--origam-card---density: 8px;
		}

		&:hover,
		&:focus-visible,
		&:focus {
			> #{$this}__overlay {
				--origam-card__overlay---opacity: var(--origam-card---overlay-opacity-hover, 0.12);
			}
		}

		&--active,
		[aria-haspopup=menu][aria-expanded=true] {
			> #{$this}__overlay {
				--origam-card__overlay---opacity: var(--origam-card---overlay-opacity-hover, 0.12);
			}

			&:hover,
			&:focus-visible,
			&:focus {
				> #{$this}__overlay {
					--origam-card__overlay---opacity: var(--origam-card---overlay-opacity-hover, 0.12);
				}
			}
		}

		&--disabled {
			--origam-card---pointer-events: none;
			--origam-card---user-select: none;

			> * {
				--origam-card---opacity: var(--origam-card---opacity-disabled, 0.6);
			}
		}

		&--flat {
			--origam-card---box-shadow: none;
		}

		&--link {
			--origam-card---cursor: pointer;
		}

		&--hover {
			--origam-card---cursor: pointer;

			&:before {
				border-radius: var(--origam-card__before---border-radius, var(--origam-card---before-border-radius, inherit));
				bottom: var(--origam-card__before---bottom, var(--origam-card---before-bottom, 0));
				content: var(--origam-card__before---content, var(--origam-card---before-content, ""));
				display: var(--origam-card__before---display, var(--origam-card---before-display, block));
				left: var(--origam-card__before---left, var(--origam-card---before-left, 0));
				pointer-events: var(--origam-card__before---pointer-events, var(--origam-card---before-pointer-events, none));
				position: var(--origam-card__before---position, var(--origam-card---before-position, absolute));
				right: var(--origam-card__before---right, var(--origam-card---before-right, 0));
				top: var(--origam-card__before---top, var(--origam-card---before-top, 0));
				transition: var(--origam-card__before---transition, var(--origam-card---before-transition, inherit));
				opacity: var(--origam-card__before---opacity, var(--origam-card---before-opacity, 1));
				z-index: var(--origam-card__before---z-index, var(--origam-card---before-z-index, -1));
				box-shadow: var(--origam-card__before---box-shadow, var(--origam-card---before-box-shadow));
			}

			&:after {
				border-radius: var(--origam-card__after---border-radius, var(--origam-card---after-border-radius, inherit));
				bottom: var(--origam-card__after---bottom, var(--origam-card---after-bottom, 0));
				content: var(--origam-card__after---content, var(--origam-card---after-content, ""));
				display: var(--origam-card__after---display, var(--origam-card---after-display, block));
				left: var(--origam-card__after---left, var(--origam-card---after-left, 0));
				pointer-events: var(--origam-card__after---pointer-events, var(--origam-card---after-pointer-events, none));
				position: var(--origam-card__after---position, var(--origam-card---after-position, absolute));
				right: var(--origam-card__after---right, var(--origam-card---after-right, 0));
				top: var(--origam-card__after---top, var(--origam-card---after-top, 0));
				transition: var(--origam-card__after---transition, var(--origam-card---after-transition, inherit));
				z-index: var(--origam-card__after---z-index, var(--origam-card---after-z-index, 1));
				opacity: var(--origam-card__after---opacity, var(--origam-card---after-opacity, 0));
				box-shadow: var(--origam-card__after---box-shadow, var(--origam-card---after-box-shadow));
			}

			&:hover {
				--origam-card---box-shadow: var(--origam-card---box-shadow-hover);

				&:after {
					--origam-card__after---opacity: 1;
				}

				&:before {
					--origam-card__after---opacity: 0;
				}
			}
		}
	}
</style>

<style
		lang="scss"
		scoped
>
	.origam-card {
		--origam-card---border-width: var(--origam-card---border-top-width, var(--origam-card---border-top-width, 0px)) var(--origam-card---border-left-width, 0px) var(--origam-card---border-bottom-width, 0px) var(--origam-card---border-right-width, 0px);
		--origam-card---border-radius: var(--origam-card---border-start-start-radius, 0px) var(--origam-card---border-start-end-radius, 0px) var(--origam-card---border-end-start-radius, 0px) var(--origam-card---border-end-end-radius, 0px);
	}
</style>
