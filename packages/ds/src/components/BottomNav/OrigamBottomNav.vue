<template>
	<origam-transition :transition="transition">
		<component
				:is="tag"
				v-if="isActive"
				:id="id"
				v-contrast
				:data-origam-color-locked="colorLocked"
				:class="bottomNavClasses"
				:aria-label="t('origam.bottom_nav.aria_label', 'Bottom navigation')"
				@mouseenter="handleMouseenter"
				@mouseleave="handleMouseleave"
		>
			<div class="origam-bottom-nav__content">
				<origam-defaults-provider :defaults="slotDefaults">
					<slot name="default">
						<template
								v-for="(item, index) in items"
								:key="index"
						>
							<slot
									:name="`item.${index}`"
									v-bind="{props: item}"
							>
								<slot
										name="item"
										v-bind="{props: item, index}"
								>
									<origam-btn
											ref="origamBtnRef"
											class="origam-bottom-nav__btn"
											v-bind="item"
									/>
								</slot>
							</slot>
						</template>
					</slot>
				</origam-defaults-provider>
			</div>
		</component>
	</origam-transition>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamBtn, OrigamDefaultsProvider, OrigamTransition, OrigamTranslateBottom } from "../../components"

	import { vContrast } from '../../directives'

	import {
		useActive,
		useDensity,
		useDimension,
		useGroup,
		useHover,
		useLayoutItem,
		useLocale,
		useProps,
		useSsrBoot,
		useStateEffect,
		useStyle
	} from '../../composables'

	import { ORIGAM_BTN_TOGGLE_KEY } from '../../consts'
	import { MODE } from "../../enums"

	import type { IBottomNavProps, IBreadcrumbItemProps} from '../../interfaces'

	import type { IBottomNavEmits, IBottomNavSlots } from '../../interfaces/BottomNav/bottom-nav.interface'
	import type { TOrigamBtn, TTransitionProps } from "../../types"

	import { convertToUnit, int } from '../../utils'

	import { computed, ref, StyleValue, toRef } from 'vue'
	import type { ComputedRef } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and slot defaults propagation to child buttons
	 * via OrigamDefaultsProvider.
	 ********************************************************/
	const props = withDefaults(defineProps<IBottomNavProps>(), {
		tag: 'nav',
		name: 'bottom-navigation',
		modelValue: true,
		selectedClass: 'origam-bottom-nav__btn--selected',
		mode: MODE.VERTICAL,
		position: 'start',
		items: () => [] as Array<TOrigamBtn>,
		// Default transition — slide up from the bottom of the viewport.
		// Passed as a component descriptor (not just a name string) so the
		// matching `<style>` block of `OrigamTranslateBottom` is guaranteed
		// to be injected globally; a bare name like
		// `'origam-transition--translate-bottom'` only works if the
		// component is already mounted somewhere else (fragile).
		transition: () => ({component: OrigamTranslateBottom}) as unknown as TTransitionProps
	})

	defineEmits<IBottomNavEmits>()

	defineSlots<IBottomNavSlots>()

	const {filterProps} = useProps<IBottomNavProps>(props)
	const {t} = useLocale()

	// When `color` is explicitly set, mark the element so `v-contrast` keeps
	// the chosen foreground instead of forcing black/white for legibility.
	const colorLocked = computed(() => (props.color ? 'true' : undefined))

	// Push visual-token props down to every descendant `<origam-btn>` (the
	// bottom-nav button children) as DEFAULTS — items that pass their own
	// props still win. `OrigamBtn` already calls `useDefaults` so this is
	// picked up automatically.
	const slotDefaults = computed(() => ({
		'origam-btn': {
			density: props.density,
			color: props.color,
			bgColor: props.bgColor,
			// New API: forward `hover` / `active` (boolean | object)
			// to each child OrigamBtn; the legacy split `hoverColor` /
			// `hoverBgColor` / `activeColor` / `activeBgColor` props no
			// longer exist on the parent or the children.
			hover: props.hover,
			active: props.active
		}
	}))

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover, active, color and scroll-aware visibility state.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/
	const {isActive, activeClasses} = useActive(props, 'modelValue')
	const {hoverClasses, onMouseenter: handleMouseenter, onMouseleave: handleMouseleave} = useHover(props)
	// Phase 3 (Vague C) — class-first companion alongside inline styles.
	// `colorClasses` ships `.origam--bg-{intent}` / `.origam--color-{intent}`
	// ONLY for the resting state — `useStateEffect` returns `[]` for
	// hover/active so the inline `colorStyles` keeps owning those slots
	// (no utility class exists for `bgHover`/`bgActive` rungs).

	/*********************************************************
	 * Color
	 *
	 * @description
	 * The BottomNav is a CONTAINER — hover/active interaction
	 * effects belong to its child buttons, not to the nav surface
	 * itself. We deliberately feed `ref(false)` to `useStateEffect`
	 * for both `isHover` and `isActive` so:
	 *   • The resting bg stays on the intent's `bg` rung (same
	 *     teinte as the child buttons in their resting state).
	 *   • Hovering the nav doesn't darken the whole bar.
	 *   • `isActive` from `useActive(props, 'modelValue')` means
	 *     "the nav is currently displayed" (drives slide-in), NOT
	 *     a pressed state — feeding it would resolve to `bgActive`
	 *     (color-mix -30 %) and paint the resting bar darker than
	 *     its buttons. `hoverColor` / `activeColor` props are still
	 *     propagated to the child OrigamBtn instances via
	 *     `slotDefaults` — that's where they take visual effect.
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, elevationClasses, paddingClasses, paddingStyles, marginClasses, marginStyles } = useStateEffect(props, ref(false), ref(false))

	/*********************************************************
	 * Layout
	 *
	 * @description
	 * Registers as a layout item so sibling regions offset
	 * correctly; height accounts for density.
	 ********************************************************/
	const {ssrBootStyles} = useSsrBoot()

	const height = computed(() => {
		if (props.height) {
			return Number(props.height) - (props.density === 'compact' ? 8 : 0)
		}

		return 48
	})

	const {layoutItemStyles} = useLayoutItem({
		id: props.name,
		order: computed(() => int(props.order ?? 0)),
		position: computed(() => 'bottom'),
		layoutSize: computed(() => isActive.value ? height.value : 0),
		elementSize: height,
		active: isActive as ComputedRef<boolean>,
		absolute: toRef(props, 'absolute')
	})

	// `useDefaults` inside each `OrigamBtn` handles the visual-token fallback —
	// no manual merge needed here. Items are spread as-is; `provideDefaults`
	// above supplies the group-level defaults.
	const items = computed(() => {
		return props.items as Array<IBreadcrumbItemProps>
	})

	useGroup(props, ORIGAM_BTN_TOGGLE_KEY)

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes slide-in transform, layout, color, rounding
	 * and spacing classes/styles onto the root element.
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const bottomNavStyles = computed(() => {
		return [
			// All dimension props (width / minWidth / maxWidth / minHeight /
			// maxHeight / height). The custom `height` below overrides the
			// plain height with the density-aware value.
			dimensionStyles.value,
			{
				height: props.height ? convertToUnit(height.value) : undefined
			},
			roundedStyles.value,
			colorStyles.value,
			borderStyles.value,
			layoutItemStyles.value,
			ssrBootStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const bottomNavClasses = computed(() => {
		return [
			'origam-bottom-nav',
			`origam-bottom-nav--${props.mode}`,
			`origam-bottom-nav--position-${props.position}`,
			{
				'origam-bottom-nav--grow': props.grow
			},
			activeClasses.value,
			hoverClasses.value,
			borderClasses.value,
			colorClasses.value,
			densityClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(bottomNavStyles)

	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface: filterProps, style utilities.
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
	.origam-bottom-nav {
		$this: &;

		display: flex;
		overflow: hidden;

		box-sizing: border-box;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;

		transition: var(--origam-bottom-bar---transition);

		max-width: var(--origam-bottom-bar---max-width);
		min-height: calc(var(--origam-bottom-bar---height) - var(--origam-bottom-bar---density));

		background-color: var(--origam-bottom-bar---background);
		box-shadow: var(--origam-bottom-bar---box-shadow);
		color: var(--origam-bottom-bar---color);

		border-color: var(--origam-bottom-bar---border-color);
		border-style: var(--origam-bottom-bar---border-style);
		border-top-width: var(--origam-bottom-bar---border-top-width, var(--origam-bottom-bar---border-width, 0));
		border-right-width: var(--origam-bottom-bar---border-right-width, var(--origam-bottom-bar---border-width, 0));
		border-bottom-width: var(--origam-bottom-bar---border-bottom-width, var(--origam-bottom-bar---border-width, 0));
		border-left-width: var(--origam-bottom-bar---border-left-width, var(--origam-bottom-bar---border-width, 0));
		border-radius: var(--origam-bottom-bar---border-radius);

		padding-block-start: calc(var(--origam-bottom-bar---padding-block-start) - var(--origam-bottom-bar---density));
		padding-block-end: calc(var(--origam-bottom-bar---padding-block-end) - var(--origam-bottom-bar---density));
		padding-inline-start: calc(var(--origam-bottom-bar---padding-inline-start) - var(--origam-bottom-bar---density));
		padding-inline-end: calc(var(--origam-bottom-bar---padding-inline-end) - var(--origam-bottom-bar---density));
		margin-block-start: var(--origam-bottom-bar---margin-block-start);
		margin-block-end: var(--origam-bottom-bar---margin-block-end);
		margin-inline-start: var(--origam-bottom-bar---margin-inline-start);
		margin-inline-end: var(--origam-bottom-bar---margin-inline-end);

		&__content {
			flex: none;
			display: flex;
			justify-content: var(--origam-bottom-bar__content---justify-content);
			align-items: var(--origam-bottom-bar__content---align-items);
			flex-wrap: var(--origam-bottom-bar__content---flex-wrap);
			width: 100%;
			transform: var(--origam-bottom-bar__content---transform);

			> :deep(.origam-btn) {
				--origam-btn---font-size: 0.75rem;
				--origam-btn---text-transform: none;

				--origam-btn---height: 100%;
				--origam-btn---width: auto;
				--origam-btn---max-width: 168px;
				--origam-btn---min-width: 80px;

				--origam-btn---border-radius: 0;

				.origam-btn__content,
				.origam-btn__icon {
					transition: inherit;
				}

				.origam-btn__icon {
					font-size: 1.5rem;
				}
			}
		}

		&--elevated {
			--origam-bottom-bar---box-shadow: var(--origam-bottom-bar--elevated---box-shadow);
		}

		&--position-start {
			left: 0;
			right: auto;
		}

		&--position-center {
			left: 0;
			right: 0;
			margin-inline: auto;
		}

		&--position-end {
			left: auto;
			right: 0;
		}

		&--border {
			--origam-bottom-bar---border-width: thin;
			--origam-bottom-bar---border-top-width: thin;
			--origam-bottom-bar---border-right-width: thin;
			--origam-bottom-bar---border-bottom-width: thin;
			--origam-bottom-bar---border-left-width: thin;
		}

		&--rounded {
			--origam-bottom-bar---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			--origam-bottom-bar---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-bottom-bar---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-bottom-bar---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-bottom-bar---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-bottom-bar---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-bottom-bar---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--density-comfortable {
			--origam-bottom-bar---density: -8px;
		}

		&--density-default {
			--origam-bottom-bar---density: 0px;
		}

		&--density-compact {
			--origam-bottom-bar---density: 8px;
		}

		&--active {
			--origam-bottom-bar---box-shadow: var(--origam-bottom-bar--active---box-shadow);
		}

		&--grow {
			#{$this}__content {
				> :deep(.origam-btn) {
					flex-grow: 1;
				}
			}
		}

		&--horizontal {
			#{$this}__content {
				> :deep(.origam-btn) {
					.origam-btn__loader {
						display: flex;
					}
				}
			}
		}

		&--vertical,
		&--shift {
			#{$this}__content {
				> :deep(.origam-btn) {
					.origam-btn__loader {
						grid-template-areas: "prepend" "content" "append";
						grid-template-columns: auto;
						grid-template-rows: max-content max-content max-content;
						justify-items: center;
						align-content: center;
					}

					.origam-btn__prepend {
						--origam-btn__prepend---margin-inline-end: 0;
					}

					.origam-btn__append {
						--origam-btn__prepend---margin-inline-start: 0;
					}

					.origam-btn__content {
						--origam-btn__prepend---margin-inline-start: 0;
						--origam-btn__prepend---margin-inline-end: 0;
					}
				}
			}
		}

		&--shift {
			#{$this}__content {
				> :deep(.origam-btn) {
					&:not(#{$this}__btn--selected) {
						.origam-btn__content {
							transform: translateY(0.5rem);
							transition: inherit;
							opacity: 0;
						}
					}
				}
			}
		}
	}
</style>
