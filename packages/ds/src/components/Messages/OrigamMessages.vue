<template>
	<origam-transition
			:disabled="!isBooted"
			:transition="transition"
	>
		<component
				:is="props.tag"
				:id="props.id"
				:class="messagesClasses"
				:style="[messagesStyles, rootTypographyStyles]"
				aria-live="polite"
				role="status"
		>
			<template
					v-for="(message, index) in messages"
					:key="`${index}-${messages}`"
			>
				<div
						:id="`${index}-${toKebabCase(message)}`"
						:style="childTypographyStyles"
						class="origam-messages__message"
				>
					<slot
							name="default"
							v-bind="{message}"
					>
						<span>{{ message }}</span>
					</slot>
				</div>
			</template>
		</component>
	</origam-transition>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue, toRef } from 'vue'
	import { OrigamSlideY, OrigamTransition } from '../../components'

	import {
		useBorder,
		useDensity,
		useMargin,
		usePadding,
		useProps,
		useRounded,
		useSsrBoot,
		useStyle,
		useTextColor,
		useTypography
} from '../../composables'

	import { DENSITY } from '../../enums'

	import type { IMessagesProps, IMessagesSlots } from '../../interfaces'
	import type { TTransitionProps } from "../../types"

	import { toKebabCase, wrapInArray } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, slots and filterProps for the Messages component.
	 ********************************************************/
	const props = withDefaults(defineProps<IMessagesProps>(), {
		tag: 'div',
		density: DENSITY.DEFAULT,
		transition: () => ({component: OrigamSlideY}) as unknown as TTransitionProps
	})
	defineSlots<IMessagesSlots>()

	const {filterProps} = useProps<IMessagesProps>(props)

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Normalises the `messages` prop into a flat array.
	 ********************************************************/
	const messages = computed(() => {
		return wrapInArray(props.messages)
	})

	/*********************************************************
	 * Decorators & boot guard
	 *
	 * @description
	 * Color, rounded, border, padding, margin composables.
	 * isBooted gates the transition so messages don't animate on SSR.
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const {textColorClasses, textColorStyles} = useTextColor(toRef(props, 'color'))

	// fontSize is read by the root .origam-messages rule; lineHeight is read by
	// the .origam-messages__message child rule — each call targets its surface.
	const {typographyStyles: rootTypographyStyles} = useTypography(props, 'messages')
	const {typographyStyles: childTypographyStyles} = useTypography(props, 'messages__message')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {densityClasses} = useDensity(props)

	const {isBooted} = useSsrBoot()

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * messagesStyles and messagesClasses compose BEM root class/style.
	 ********************************************************/
	const messagesStyles = computed(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			textColorStyles.value,
			props.style
		] as StyleValue
	})
	const messagesClasses = computed(() => {
		return [
			'origam-messages',
			textColorClasses.value,
			densityClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(messagesStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Exposes filterProps to parent ref consumers.
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

<style lang="scss" scoped>
	.origam-messages {
		color: var(--origam-messages---color, currentColor);
		padding: var(--origam-messages---density, 0);
		flex: var(--origam-messages---flex, 1 1 auto);
		font-size: var(--origam-messages---font-size, 12px);
		min-height: var(--origam-messages---min-height, 14px);
		min-width: var(--origam-messages---min-width, 1px);
		opacity: var(--origam-messages---opacity, 0.87);
		position: var(--origam-messages---position, relative);

		&__message {
			line-height: var(--origam-messages__message---line-height, 12px);
			word-break: var(--origam-messages__message---word-break, break-word);
			overflow-wrap: var(--origam-messages__message---overflow-wrap, break-word);
			word-wrap: break-word;
			-webkit-hyphens: auto;
			hyphens: auto;
			transition-duration: var(--origam-messages__message---transition-duration, .15s);
		}
	}
</style>
