<template>
	<div
			:id="id"
			:class="groupClasses"
			:style="groupStyles"
			role="status"
			aria-busy="true"
			:aria-label="groupAriaLabel"
			v-bind="{ ...$attrs }"
	>
		<slot name="default"/>
	</div>
</template><script
		lang="ts"
		setup
>
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { ORIGAM_SKELETON_GROUP_KEY } from '../../consts/Skeleton/skeleton.const'
	import { SKELETON_ANIMATION } from '../../enums/Skeleton/skeleton.enum'
	import type { ICommonsComponentSlots } from '../../interfaces/Commons/commons.interface'
	import type { ISkeletonGroupEmits, ISkeletonGroupProps } from '../../interfaces/Skeleton/skeleton-group.interface'
	import { computed, provide } from 'vue'
	import type { StyleValue } from 'vue'

	defineOptions({ inheritAttrs: false })

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ISkeletonGroupProps>(), {
		animation: 'pulse',
		label: 'origam.loading'
	})

	const {filterProps} = useProps<ISkeletonGroupProps>(props)

	defineEmits<ISkeletonGroupEmits>()

	defineSlots<ICommonsComponentSlots>()

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {t} = useLocale()

	/*********************************************************
	 * Announcement
	 *
	 * @description
	 * ONE live region for the whole zone. The blocks inside are
	 * `aria-hidden`, so a screen reader hears the loading once instead of
	 * once per placeholder.
	 ********************************************************/

	const groupAriaLabel = computed(() => t(props.label))

	/*********************************************************
	 * Animation
	 *
	 * @description
	 * The group is ONE animation clock. In `pulse` the CONTAINER carries
	 * the animation and its blocks do not, so blocks that mount at
	 * different moments still breathe in phase. The choice is provided to
	 * the blocks, which inherit it unless they set their own.
	 ********************************************************/

	const animation = computed(() => props.animation ?? SKELETON_ANIMATION.PULSE)

	provide(ORIGAM_SKELETON_GROUP_KEY, {animation})

	/*********************************************************
	 * Class
	 ********************************************************/

	const groupClasses = computed(() => [
		'origam-skeleton-group',
		{'origam--skeleton-group-pulse': animation.value === SKELETON_ANIMATION.PULSE},
		props.class
	])

	const groupStyles = computed<StyleValue>(() => [props.style] as StyleValue)

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
	.origam-skeleton-group {
		display: grid;
		gap: var(--origam-skeleton---gap);
	}
</style>
