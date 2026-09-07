<template>
	<origam-transition
			:disabled="!isBooted"
			:transition="transition"
	>
		<component
				:is="tag"
				:id="id"
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
	import OrigamSlideY from '../Transition/OrigamSlideY.vue'
	import OrigamTransition from '../Transition/OrigamTransition.vue'

	import { useUnsupportedProp } from '../../composables/Commons/unsupportedProp.composable'
	import { useBorder } from '../../composables/Commons/border.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { usePadding } from '../../composables/Commons/padding.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useSsrBoot } from '../../composables/Commons/ssrBoot.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTextColor } from '../../composables/Commons/textColor.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { DENSITY } from '../../enums/Commons/density.enum'

	import type { IMessagesEmits, IMessagesProps, IMessagesSlots } from '../../interfaces/Messages/messages.interface'
	import type { TTransitionProps } from '../../types/Transition/transition.type'

	import { toKebabCase, wrapInArray } from '../../utils/Commons/commons.util'

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
	defineEmits<IMessagesEmits>()

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

	/*********************************************************
	 * Props declarees sans effet (#550, critere C1)
	 *
	 * @description
	 * ⛔ Exposees dans la story, parfois documentees, et pourtant lues
	 * nulle part. Elles ne sont ni retirees — ca casserait la story et le
	 * type d'un consommateur pour une prop qui ne faisait deja rien — ni
	 * cablees a un comportement invente. Elles avertissent une fois, en
	 * dev, avec la raison exacte. Meme traitement que la famille Chart.
	 ********************************************************/
	useUnsupportedProp(
		'OrigamMessages',
		'active',
		'visibility is driven by `messages` being non-empty, never by this prop.',
		() => props.active !== undefined
	)
	const {typographyStyles: childTypographyStyles} = useTypography(props, 'messages__message')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {roundedClasses, roundedStyles} = useRounded(props)
	const {borderClasses, borderStyles} = useBorder(props)
	const {paddingClasses, paddingStyles} = usePadding(props)
	const {marginClasses, marginStyles} = useMargin(props)
	const {densityClasses} = useDensity(props)
	/*********************************************************
	 * elevation
	 *
	 * @description
	 * #550 (critere C1) — `elevation` etait DECLAREE (via `IElevationProps`,
	 * exposee par la story) et lue nulle part : `<origam-messages
	 * elevation="lg">` ne posait aucune ombre. Les deux canaux sont branches
	 * en parallele (strategie A) : `elevationClasses`
	 * (`origam-messages--elevated` + l'utilitaire `.origam--shadow-{echelon}`
	 * quand l'echelon en a un) et `elevationStyles` (la declaration
	 * `box-shadow: var(--origam-shadow---{echelon})`, ou la valeur libre
	 * telle quelle). C'est la declaration inline qui peint : le SCSS scope de
	 * `.origam-messages` n'ecrit aucun `box-shadow`, et l'utilitaire
	 * (0,1,0) perdrait de toute facon contre une regle scopee — meme
	 * cablage que sur `OrigamCard`.
	 ********************************************************/
	const {elevationClasses, elevationStyles} = useElevation(props)

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
			elevationStyles.value,
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
			elevationClasses.value,
			paddingClasses.value,
			marginClasses.value,
			props.class
		]
	})
	/*********************************************************
	 * useStyle
	 *
	 * @description
	 * #375 — the template used to write `:id="props.id"` explicitly to
	 * dodge the homonym shadowing `id` (the local below, from `useStyle`)
	 * would otherwise have caused. Seeding `useStyle` with
	 * `() => props.id` makes the local `id` genuinely resolve to the
	 * consumer's id (falling back to the generated one), so the bare
	 * `:id="id"` binding is both rule-compliant and correct — see also
	 * #372.
	 ********************************************************/
	const {id, css, load, isLoaded, unload} = useStyle(messagesStyles, () => props.id)


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
		padding: var(--origam-messages---padding, var(--origam-messages---density, 0));
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
