<template>
	<template v-if="!loading">
		<slot/>
	</template>

	<div
			v-else
			:id="id"
			:class="skeletonClasses"
			:style="skeletonStyles"
			v-bind="{ ...a11yAttrs, ...$attrs }"
	/>
</template><script
		lang="ts"
		setup
>
	import { useBothColor } from '../../composables/Commons/bothColor.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { ORIGAM_SKELETON_GROUP_KEY } from '../../consts/Skeleton/skeleton.const'
	import { SKELETON_ANIMATION } from '../../enums/Skeleton/skeleton.enum'
	import type { ICommonsComponentSlots } from '../../interfaces/Commons/commons.interface'
	import type { ISkeletonEmits, ISkeletonProps } from '../../interfaces/Skeleton/skeleton.interface'
	import { getSkeletonHostClasses } from '../../utils/Skeleton/skeleton.util'
	import { computed, inject, toRef } from 'vue'
	import type { StyleValue } from 'vue'

	/*********************************************************
	 * inheritAttrs — #916 / #853
	 *
	 * @description
	 * The root `v-if` chain is MIXED: `v-if="!loading"` renders `<slot/>`
	 * (a FRAGMENT vnode — `renderSlot()` always returns one), while the
	 * `v-else` branch renders a single `<div>`. Vue cannot
	 * merge fallthrough attributes onto the fragment branch, so it logs
	 * "Extraneous non-props attributes" — and that warning's trace serialises
	 * every ancestor's props, including Vue Router's `RouteProvider` vnode,
	 * ~4.4 MB per occurrence (#853).
	 *
	 * ⛔ THE MIXED SHAPE IS WHY THE FLAG ALONE WOULD BE A REGRESSION, and it
	 * is measured, not assumed. On `develop` before this change, mounting with
	 * `class` / `data-cy` / `aria-label`:
	 *
	 *     loading=true  (element branch)  -> all three LAND
	 *     loading=false (fragment branch) -> all three land NOWHERE
	 *
	 * So `inheritAttrs: false` on its own would silently strip a consumer's
	 * attributes from the skeleton itself — #492's defect. They are therefore
	 * re-bound by hand with `v-bind="{ ...a11yAttrs, ...$attrs }"` on the
	 * element branch. The fragment branch keeps forwarding
	 * nothing, which is what it already did: the `default` slot's own content
	 * is the consumer's markup and carries the consumer's attributes already.
	 *
	 * `$attrs` is spread AFTER `a11yAttrs` so a consumer's `aria-label` wins
	 * over the component's default, while `class` and `style` are
	 * concatenated by `mergeProps` rather than replaced.
	 ********************************************************/
	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ISkeletonProps>(), {
		variant: 'rectangular',
		loading: true,
		label: 'origam.loading'
	})

	const {filterProps} = useProps<ISkeletonProps>(props)

	defineEmits<ISkeletonEmits>()

	defineSlots<ICommonsComponentSlots>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {t} = useLocale()
	const {roundedClasses, roundedStyles} = useRounded(props)
	const {sizeClasses, sizeStyles} = useSize(props)
	const {dimensionStyles} = useDimension(props)

	/*********************************************************
	 * Color
	 *
	 * @description
	 * `color` tints the placeholder: the fill is `currentColor` mixed with
	 * transparent, so it follows the text colour. `bgColor` paints BEHIND
	 * that translucent fill.
	 ********************************************************/

	const {colorClasses, colorStyles} = useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))

	/*********************************************************
	 * Group
	 *
	 * @description
	 * Inside an `<OrigamSkeletonGroup>` a block follows the group's
	 * animation and leaves the accessibility tree: the group makes the ONE
	 * announcement of the zone. Outside any group a block is its own zone
	 * and announces itself — a lone placeholder must not be silent.
	 ********************************************************/

	const group = inject(ORIGAM_SKELETON_GROUP_KEY, null)

	const isGrouped = computed(() => group !== null)

	const animation = computed(() => props.animation ?? group?.animation.value ?? SKELETON_ANIMATION.PULSE)

	const skeletonAriaLabel = computed(() => t(props.label))

	const a11yAttrs = computed(() => {
		if (isGrouped.value) return {'aria-hidden': true as const}

		return {
			'role': 'status',
			'aria-busy': true as const,
			'aria-label': skeletonAriaLabel.value
		}
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * The motion itself lives in the shared host mechanism
	 * (`.origam--skeleton*` in `origam-utilities.css`) — the very same rules
	 * a component uses to paint its own element as a placeholder. This file
	 * only chooses WHICH animation class applies and owns the geometry of
	 * each shape.
	 ********************************************************/

	const animationClasses = computed(() => getSkeletonHostClasses(animation.value))

	const skeletonClasses = computed(() => [
		'origam-skeleton',
		`origam-skeleton--${props.variant}`,
		animationClasses.value,
		colorClasses.value,
		roundedClasses.value,
		sizeClasses.value,
		props.class
	])

	const skeletonStyles = computed<StyleValue>(() => [
		dimensionStyles.value,
		colorStyles.value,
		roundedStyles.value,
		sizeStyles.value,
		props.style
	] as StyleValue)

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-skeleton {
		display: block;
		border-radius: var(--origam-skeleton---border-radius);

		&--text {
			width: 100%;
			height: var(--origam-skeleton---text-height);
			margin-block: var(--origam-skeleton---text-margin-block);
			border-radius: var(--origam-skeleton---border-radius-pill);
		}

		&--rectangular {
			width: 100%;
			height: 100%;
		}

		&--circular {
			flex-shrink: 0;
			width: var(--origam-skeleton---circular-size);
			aspect-ratio: 1;
			border-radius: var(--origam-skeleton---border-radius-circular);
		}

		&--pill {
			flex-shrink: 0;
			width: var(--origam-skeleton---pill-width);
			height: var(--origam-skeleton---pill-height);
			border-radius: var(--origam-skeleton---border-radius-pill);
		}
	}
</style>
