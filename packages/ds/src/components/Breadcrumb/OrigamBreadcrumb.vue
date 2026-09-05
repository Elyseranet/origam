<template>
	<component
			:is="tag"
			:id="id"
			v-contrast
			:aria-label="t('origam.breadcrumb.aria_label')"
			:class="breadcrumbClasses"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<slot name="default">
				<template v-if="hasItems">
					<ol class="origam-breadcrumb__items">
						<template
								v-for="(item, index) in normalizedItems"
								:key="index"
						>
							<li class="origam-breadcrumb__item">
								<slot
										:name="`item.${index}`"
										v-bind="{item, index}"
								>
									<slot
											name="item"
											v-bind="{ item, index }"
									>
										<origam-breadcrumb-item v-bind="item">
											<slot name="item.title"/>
										</origam-breadcrumb-item>
									</slot>
								</slot>

								<template v-if="!isLastItem(index)">
									<slot
											:name="`divider.${index}`"
											v-bind="{divider}"
									>
										<slot
												name="divider"
												v-bind="{divider}"
										>
											<origam-breadcrumb-divider :divider="divider"/>
										</slot>
									</slot>
								</template>
							</li>
						</template>
					</ol>
				</template>
			</slot>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import OrigamBreadcrumbDivider from './OrigamBreadcrumbDivider.vue'
	import OrigamBreadcrumbItem from './OrigamBreadcrumbItem.vue'
	import OrigamDefaultsProvider from '../DefaultsProvider/OrigamDefaultsProvider.vue'

	import { useDensity } from '../../composables/Commons/density.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import vContrast from '../../directives/Contrast/contrast.directive'

	import { omitUndefined } from '../../utils/Commons/commons.util'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IBreadcrumbItemProps } from '../../interfaces/Breadcrumb/breadcrumb-item.interface'
	import type { IBreadcrumbEmits, IBreadcrumbProps, IBreadcrumbSlots } from '../../interfaces/Breadcrumb/breadcrumb.interface'

	import type { TBreadcrumbItem } from '../../types/Breadcrumb/breadcrumb.type'

	import { computed, StyleValue, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props and slot defaults propagation to child items via
	 * OrigamDefaultsProvider.
	 ********************************************************/
	const props = withDefaults(defineProps<IBreadcrumbProps>(), {
		divider: '/',
		items: () => [] as Array<TBreadcrumbItem>,
		tag: 'nav',
		density: DENSITY.DEFAULT
	})

	const {filterProps} = useProps<IBreadcrumbProps>(props)

	defineEmits<IBreadcrumbEmits>()

	defineSlots<IBreadcrumbSlots>()
	const {t} = useLocale()

	// Push visual-token props down to every descendant `<origam-breadcrumb-item>`
	// as DEFAULTS — items that pass their own props still win.
	//
	// `bgColor` is propagated alongside `color` so each item's
	// `useStateEffect` sees the BOTH axes — without it, the
	// `color===bgColor` auto-contrast branch never triggers on the
	// items, so a `<OrigamBreadcrumb color="primary" bgColor="primary">`
	// renders items with `primary-fgSubtle` (violet) ON a `primary-bg`
	// surface — unreadable. Same goes for hover/active overrides.
	// Forward ONLY what the consumer actually passed — see #263. `disabled` is
	// boolean, `hover` / `active` are `boolean | IHoverState / IActiveState`,
	// and `color` / `bgColor` are `TColor` (which includes `false`), so Vue
	// coerces every one of them to a concrete `false` when unset —
	// `omitUndefined` alone cannot see it.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-breadcrumb-item': omitUndefined({
			density: wasPropPassed('density') ? props.density : undefined,
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			hover: wasPropPassed('hover') ? props.hover : undefined,
			active: wasPropPassed('active') ? props.active : undefined,
			hoverClass: wasPropPassed('hoverClass') ? props.hoverClass : undefined,
			activeClass: wasPropPassed('activeClass') ? props.activeClass : undefined,
			disabled: wasPropPassed('disabled') ? props.disabled : undefined
		})
	}))

	/*********************************************************
	 * Items
	 *
	 * @description
	 * Normalises string/object items, marks the last item as
	 * disabled and active, and exposes slot presence flag.
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, elevationClasses, elevationStyles, paddingClasses, paddingStyles, marginClasses, marginStyles } = useStateEffect(props, undefined, undefined, undefined, undefined, computed(() => !!props.disabled))

	// The ADR-005 resolver handles each `OrigamBreadcrumbItem`'s
	// density/color fallback — no manual merge needed here.
	// `disabled` and `isActive` are structural (not visual tokens), so
	// they remain explicitly set on the item object.
	const normalizedItems = computed<Array<IBreadcrumbItemProps>>(() => {
		return props.items.map((item, index) => {
			return typeof item === 'string' ? {title: item, disabled: isLastItem(index), active: isLastItem(index)} : {
				...item,
				disabled: isLastItem(index) || item.disabled,
				active: isLastItem(index)
			}
		}) as Array<IBreadcrumbItemProps>
	})
	const isLastItem = (index: number) => {
		return index === props.items.length - 1
	}

	const slots = useSlots()
	const hasItems = computed(() => {
		return slots.default || normalizedItems.value
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all spacing, color, elevation and variant
	 * classes/styles onto the root element.
	 ********************************************************/

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {densityClasses} = useDensity(props)
	const breadcrumbStyles = computed(() => {
		return [
			elevationStyles.value,
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			props.style
		] as StyleValue
	})
	const breadcrumbClasses = computed(() => {
		return [
			'origam-breadcrumb',
			colorClasses.value,
			elevationClasses.value,
			densityClasses.value,
			roundedClasses.value,
			borderClasses.value,
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
	const {id, css, load, isLoaded, unload} = useStyle(breadcrumbStyles, () => props.id)

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
	.origam-breadcrumb {
		--origam-breadcrumb---border-top-width: 0px;
		--origam-breadcrumb---border-left-width: 0px;
		--origam-breadcrumb---border-bottom-width: 0px;
		--origam-breadcrumb---border-right-width: 0px;
		--origam-breadcrumb---border-width: var(--origam-breadcrumb---border-top-width) var(--origam-breadcrumb---border-left-width) var(--origam-breadcrumb---border-bottom-width) var(--origam-breadcrumb---border-right-width);
		--origam-breadcrumb---border-color: currentColor;
		--origam-breadcrumb---border-style: solid;
		--origam-breadcrumb---border-radius: var(--origam-breadcrumb---border-radius-token, 0px);
		--origam-breadcrumb---density: 0px;
		--origam-breadcrumb---box-shadow: var(--origam-shadow---none, none);
		--origam-breadcrumb---color: var(--origam-breadcrumb---color-token, var(--origam-color__text---primary));
		--origam-breadcrumb---background: var(--origam-breadcrumb---background-token, transparent);
		--origam-breadcrumb---margin-inline-start: 0px;
		--origam-breadcrumb---margin-inline-end: 0px;
		--origam-breadcrumb---margin-block-start: 0px;
		--origam-breadcrumb---margin-block-end: 0px;
		--origam-breadcrumb---padding-block-start: var(--origam-breadcrumb---padding-block, 8px);
		--origam-breadcrumb---padding-block-end: var(--origam-breadcrumb---padding-block, 8px);
		--origam-breadcrumb---padding-inline-start: var(--origam-breadcrumb---padding-inline, 8px);
		--origam-breadcrumb---padding-inline-end: var(--origam-breadcrumb---padding-inline, 8px);
		--origam-breadcrumb---transition-duration: 0.2s, 0.1s;
		--origam-breadcrumb---transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		--origam-breadcrumb---transition-property: transform, color;
		--origam-breadcrumb---transition: var(--origam-breadcrumb---transition-property) var(--origam-breadcrumb---transition-duration) var(--origam-breadcrumb---transition-timing-function);

		transition: var(--origam-breadcrumb---transition);

		background: var(--origam-breadcrumb---background);
		box-shadow: var(--origam-breadcrumb---box-shadow);
		color: var(--origam-breadcrumb---color);

		border-color: var(--origam-breadcrumb---border-color);
		border-style: var(--origam-breadcrumb---border-style);
		border-width: var(--origam-breadcrumb---border-width);
		border-radius: var(--origam-breadcrumb---border-radius);

		padding-block-start: calc(var(--origam-breadcrumb---padding-block-start) - var(--origam-breadcrumb---density));
		padding-block-end: calc(var(--origam-breadcrumb---padding-block-end) - var(--origam-breadcrumb---density));
		padding-inline-start: calc(var(--origam-breadcrumb---padding-inline-start) - var(--origam-breadcrumb---density));
		padding-inline-end: calc(var(--origam-breadcrumb---padding-inline-end) - var(--origam-breadcrumb---density));

		margin-block-start: var(--origam-breadcrumb---margin-block-start);
		margin-block-end: var(--origam-breadcrumb---margin-block-end);
		margin-inline-start: var(--origam-breadcrumb---margin-inline-start);
		margin-inline-end: var(--origam-breadcrumb---margin-inline-end);

		&__items {
			display: flex;
			align-items: center;
			line-height: 1.6;
			list-style: none;
			margin-block: 0;
			padding-inline-start: 0;
		}

		&__item {
			display: flex;
			align-items: center;
		}

		&--elevated {
			--origam-breadcrumb---box-shadow: var(--origam-breadcrumb---box-shadow-elevated, var(--origam-shadow---md, 0px 6px 24px 0px rgba(0,0,0,0.05), 0px 0px 0px 1px rgba(0,0,0,0.08)));
		}

		&--border {
			--origam-breadcrumb---border-width: thin;
		}

		&--rounded {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			border-radius: var(--origam-radius---2xl, 24px);
		}

		&--density-comfortable {
			--origam-breadcrumb---density: -8px;
		}

		&--density-default {
			--origam-breadcrumb---density: 0px;
		}

		&--density-compact {
			--origam-breadcrumb---density: 8px;
		}
	}
</style>
