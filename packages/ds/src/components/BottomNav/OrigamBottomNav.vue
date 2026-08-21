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
	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'
	import OrigamTranslateBottom from '../Transition/OrigamTranslateBottom.vue'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { useActive } from '../../composables/Commons/active.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useGroup } from '../../composables/Commons/group.composable'
	import { useHover } from '../../composables/Commons/hover.composable'
	import { useLayoutItem } from '../../composables/Commons/layoutItem.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import { ORIGAM_BTN_TOGGLE_KEY } from '../../consts/Btn/btn-toggle.const'
	import { MODE } from '../../enums/Commons/mode.enum'

	import type { IBottomNavProps } from '../../interfaces/BottomNav/bottom-nav.interface'
	import type { IBreadcrumbItemProps } from '../../interfaces/Breadcrumb/breadcrumb-item.interface'

	import type { IBottomNavEmits, IBottomNavSlots } from '../../interfaces/BottomNav/bottom-nav.interface'
	import type { TOrigamBtn } from '../../types/Btn/btn.type'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { convertToUnit, int, omitUndefined } from '../../utils/Commons/commons.util'

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
	// props still win. The ADR-005 resolver picks this up automatically.
	// Forward ONLY what the consumer actually passed — see #263 and the same
	// guard on `OrigamBtnGroup` / `OrigamAvatarGroup`. A prop the consumer
	// never set must NOT be forwarded: `mergeDeep` (used by
	// `provideDefaults` to combine this map with an
	// ancestor/theme `'origam-btn'` entry) copies it unconditionally and
	// silently overwrites the theme default.
	//
	// A plain `omitUndefined` is NOT enough here: `color` / `bgColor` are
	// `TColor` (which includes `false`) and `hover` / `active` are
	// `boolean | IHoverState / IActiveState`, so Vue's boolean-prop coercion
	// resolves every one of them to the concrete value `false` when unset —
	// there is no `undefined` left to filter. `density` was the reverse case:
	// it leaked a bare `undefined`, which `mergeDeep` copies just the same and
	// which therefore ERASED any themed button density. Measured before the
	// fix: under a theme setting `'origam-btn': { color: 'success', density:
	// 'comfortable' }`, a standalone button rendered
	// `origam--color-success origam-btn--density-comfortable` while the very
	// same button inside `<origam-bottom-nav>` rendered neither.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-btn': omitUndefined({
			density: wasPropPassed('density') ? props.density : undefined,
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			// New API: forward `hover` / `active` (boolean | object)
			// to each child OrigamBtn; the legacy split `hoverColor` /
			// `hoverBgColor` / `activeColor` / `activeBgColor` props no
			// longer exist on the parent or the children.
			hover: wasPropPassed('hover') ? props.hover : undefined,
			active: wasPropPassed('active') ? props.active : undefined
		})
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

	/*********************************************************
	 * height
	 *
	 * @description
	 * #384 — `Number(props.height)` returned NaN for any CSS length
	 * string (`Number('96px')` === NaN): the invalid `height: NaN`
	 * declaration was silently dropped, masking that the density-aware
	 * subtraction never applied. `int()` (parseInt-based, already used
	 * elsewhere in this catalogue for the same "read the leading number
	 * off a possibly-unit-suffixed prop" need) reads the numeric prefix
	 * regardless of a trailing unit.
	 ********************************************************/
	const height = computed(() => {
		if (props.height) {
			return int(props.height) - (props.density === 'compact' ? 8 : 0)
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

	// The ADR-005 resolver handles each `OrigamBtn`'s visual-token fallback —
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
	/*********************************************************
	 * bottomNavStyles
	 *
	 * @description
	 * #383 — layoutItemStyles MUST come before dimensionStyles here.
	 * useStyle() flattens every source into ONE #id{...} rule, so source
	 * order (not specificity) decides which width declaration wins when
	 * both are present. useLayoutItem unconditionally writes
	 * width: calc(100% - left - right) while docked in an OrigamLayout —
	 * placing it FIRST lets a consumer-supplied width (from
	 * dimensionStyles) override it, instead of the layout's calc()
	 * silently winning every time (the previous order, which broke the
	 * documented default usage OrigamLayout > OrigamBottomNav and made
	 * position decorative alongside it).
	 ********************************************************/
	const bottomNavStyles = computed(() => {
		return [
			layoutItemStyles.value,
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

	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #381 — the `id` returned by useStyle is a GENERATED identifier,
	 * only meant for the scoped stylesheet selector. Without
	 * `() => props.id` here, it shadowed the `id` PROP of the same
	 * name: the template's `:id="id"` on the root rendered the
	 * generated id, never the consumer's.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(bottomNavStyles, () => props.id)

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
