<template>
	<component
			:is="props.tag"
			:id="id"
			:class="avatarClasses"
			@click="handleClick"
			@mouseenter="handleMouseenter"
			@mouseleave="handleMouseleave"
	>
		<div class="origam-avatar__wrapper">
			<slot name="default">
				<template v-if="hasImage">
					<div class="origam-avatar__image">
						<slot name="avatar">
							<origam-img
									key="image"
									cover
									eager
									v-bind="imageProps"
							/>
						</slot>
					</div>
				</template>

				<template v-else-if="hasIcon">
					<div class="origam-avatar__icon">
						<slot name="icon">
							<origam-icon
									key="icon"
									:icon="icon"
							/>
						</slot>
					</div>
				</template>

				<template v-else-if="hasText">
					<div class="origam-avatar__text">
						<slot name="text">
							<span>{{ text }}</span>
						</slot>
					</div>
				</template>
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import OrigamIcon from '../Icon/OrigamIcon.vue'
	import OrigamImg from '../Img/OrigamImg.vue'

	import { useActive } from '../../composables/Commons/active.composable'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useHover } from '../../composables/Commons/hover.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import type { IAvatarProps } from '../../interfaces/Avatar/avatar.interface'
	import type { ISrcObject } from '../../interfaces/Img/img.interface'

	import type { IAvatarEmits, IAvatarSlots } from '../../interfaces/Avatar/avatar.interface'
	import { isEmpty } from '../../utils/Commons/commons.util'

	import type { ComputedRef, StyleValue } from 'vue'
	import { computed, useSlots } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props resolution with defaults inheritance from parent
	 * groups (e.g. OrigamAvatarGroup via provideDefaults).
	 ********************************************************/
	const props = withDefaults(defineProps<IAvatarProps>(), {tag: 'div', size: 'default'})

	defineEmits<IAvatarEmits>()

	defineSlots<IAvatarSlots>()

	const {filterProps} = useProps<IAvatarProps>(props)

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover, active state and color resolution for the avatar.
	 ********************************************************/
	const {hoverClasses, isHover, hoverState, onMouseleave: handleMouseleave, onMouseenter: handleMouseenter} = useHover(props)
	const {activeClasses, isActive, activeState, onActive: handleClick} = useActive(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, elevationClasses, elevationStyles, paddingClasses, paddingStyles, marginClasses, marginStyles } = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState)

	/*********************************************************
	 * Composables
	 ********************************************************/
	/*********************************************************
	 * Typography
	 ********************************************************/
	const {typographyStyles} = useTypography(props, 'avatar')

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Slot presence flags and image props builder.
	 ********************************************************/
	const slots = useSlots()

	const hasImage = computed(() => {
		return !isEmpty(props.image) || slots.image
	})
	const hasIcon = computed(() => {
		return !isEmpty(props.icon) || slots.icon
	})
	const hasText = computed(() => {
		return !isEmpty(props.text) || slots.text
	})

	const imageProps = computed(() => {
		const imgSrc: ISrcObject = {
			alt: typeof props.image === 'object' && props.image && 'alt' in props.image ? (props.image as ISrcObject).alt ?? '' : '',
			aspectRatio: 1
		}

		if (typeof props.image === 'string') {
			imgSrc.src = props.image
		} else {
			Object.assign(imgSrc, props.image)
		}

		return imgSrc
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all spacing, color, size, elevation and
	 * variant classes/styles onto the root element.
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {sizeClasses, sizeStyles} = useSize(props)

	const avatarStyles = computed(() => {
		return [
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			sizeStyles.value,
			colorStyles.value,
			elevationStyles.value,
			typographyStyles.value,
			props.style
		] as StyleValue
	})
	const avatarClasses = computed(() => {
		return [
			'origam-avatar',
			colorClasses.value,
			densityClasses.value,
			roundedClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			sizeClasses.value,
			elevationClasses.value,
			hoverClasses.value,
			activeClasses.value,
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
	const {id, css, load, isLoaded, unload} = useStyle(avatarStyles, () => props.id)

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
	.origam-avatar {
		$this: &;

		// Declared on the ROOT, not only on `__wrapper`. Without it the root
		// inherits the browser default — `inline` for `tag="span"` — and an
		// inline box ignores `width`/`height`, so `size` silently did nothing:
		// the avatar collapsed to its text. It only appeared to work when the
		// parent was a flex container, which blockifies its children (measured:
		// same component, 32x32 under `inline-flex`, 30x30 under `position:
		// relative`, for a requested size of 72).
		//
		// `inline-flex` and not `block`: `tag="span"` exists so an avatar can sit
		// in phrasing content — inside a `<button>`, whose content model rejects
		// block-level elements.
		display: var(--origam-avatar---display, inline-flex);
		vertical-align: var(--origam-avatar---vertical-align, middle);

		line-height: var(--origam-avatar---line-height);
		text-align: var(--origam-avatar---text-align);
		font-size: var(--origam-avatar---font-size);
		font-weight: var(--origam-avatar---font-weight);
		letter-spacing: var(--origam-avatar---letter-spacing);
		text-transform: var(--origam-avatar---text-transform);

		height: calc(var(--origam-avatar---height) - var(--origam-avatar---density));
		width: calc(var(--origam-avatar---width) - var(--origam-avatar---density));

		overflow: var(--origam-avatar---overflow);
		position: var(--origam-avatar---position);

		transition: var(--origam-avatar---transition);

		border-color: var(--origam-avatar---border-color);
		border-style: var(--origam-avatar---border-style);
		border-width: var(--origam-avatar---border-width);
		border-radius: var(--origam-avatar---border-radius);

		background-color: var(--origam-avatar---background-color);
		box-shadow: var(--origam-avatar---box-shadow);
		color: var(--origam-avatar---color);

		padding-block-start: var(--origam-avatar---padding-block-start);
		padding-block-end: var(--origam-avatar---padding-block-end);
		padding-inline-start: var(--origam-avatar---padding-inline-start);
		padding-inline-end: var(--origam-avatar---padding-inline-end);
		margin-block-start: var(--origam-avatar---margin-block-start);
		margin-block-end: var(--origam-avatar---margin-block-end);
		margin-inline-start: var(--origam-avatar---margin-inline-start);
		margin-inline-end: var(--origam-avatar---margin-inline-end);

		&__wrapper {
			flex: var(--origam-avatar__wrapper---flex);
			align-items: var(--origam-avatar__wrapper---align-items);
			display: var(--origam-avatar__wrapper---display);
			justify-content: var(--origam-avatar__wrapper---justify-content);
			vertical-align: var(--origam-avatar__wrapper---vertical-align);
			width: var(--origam-avatar__wrapper---width);
			height: var(--origam-avatar__wrapper---height);
			padding-block-start: var(--origam-avatar__wrapper---padding-block-start);
			padding-block-end: var(--origam-avatar__wrapper---padding-block-end);
			padding-inline-start: var(--origam-avatar__wrapper---padding-inline-start);
			padding-inline-end: var(--origam-avatar__wrapper---padding-inline-end);
			margin-block-start: var(--origam-avatar__wrapper---margin-block-start);
			margin-block-end: var(--origam-avatar__wrapper---margin-block-end);
			margin-inline-start: var(--origam-avatar__wrapper---margin-inline-start);
			margin-inline-end: var(--origam-avatar__wrapper---margin-inline-end);
		}

		&__image {
			width: var(--origam-avatar__image---width);
			height: var(--origam-avatar__image---height);
			// OrigamImg paints its <img> with `z-index: -1` (so the
			// optional gradient overlay can sit on top of the picture).
			// Without a contained stacking context here, the negative
			// z-index would push the image BEHIND the Avatar's own
			// background — the user sees only the bg color, not the
			// photo.
			position: relative;
			overflow: hidden;
			border-radius: inherit;

			&:deep(.origam-img) {
				--origam-img---height: 100%;
				--origam-img---width: 100%;
				--origam-img__picture---z-index: auto;
				--origam-img__content---z-index: auto;
			}
		}

		&--elevated {
			--origam-avatar---box-shadow: var(--origam-avatar---box-shadow-elevated, var(--origam-shadow---md));
		}

		&--border {
			--origam-avatar---border-width: thin;
		}

		&--rounded {
			--origam-avatar---border-radius: var(--origam-avatar---border-radius-rounded, var(--origam-radius---sm, 4px));
		}

		&--rounded-x-small {
			--origam-avatar---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-avatar---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-avatar---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-avatar---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-avatar---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-avatar---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-shaped {
			border-start-start-radius: var(--origam-avatar---border-radius-rounded, 16px);
			border-start-end-radius: 0;
			border-end-start-radius: 0;
			border-end-end-radius: var(--origam-avatar---border-radius-rounded, 16px);
		}

		&--rounded-shaped-invert {
			border-start-start-radius: 0;
			border-start-end-radius: var(--origam-avatar---border-radius-rounded, 16px);
			border-end-start-radius: var(--origam-avatar---border-radius-rounded, 16px);
			border-end-end-radius: 0;
		}

		&--density-compact {
			--origam-avatar---density: 8px;
		}

		&--density-default {
			--origam-avatar---density: 0px;
		}

		&--density-comfortable {
			--origam-avatar---density: -8px;
		}

		&--size-x-small {
			--origam-avatar---height: 24px;
			--origam-avatar---width: 24px;
			--origam-avatar---font-size: 1rem;
		}

		&--size-small {
			--origam-avatar---height: 32px;
			--origam-avatar---width: 32px;
			--origam-avatar---font-size: 1.25rem;
		}

		&--size-default {
			--origam-avatar---height: 40px;
			--origam-avatar---width: 40px;
			--origam-avatar---font-size: 1.5rem;
		}

		&--size-large {
			--origam-avatar---height: 48px;
			--origam-avatar---width: 48px;
			--origam-avatar---font-size: 1.75rem;
		}

		&--size-x-large {
			--origam-avatar---height: 56px;
			--origam-avatar---width: 56px;
			--origam-avatar---font-size: 2rem;
		}

		&--warning {
			--origam-avatar---background-color: var(--origam-avatar--warning---background-color, var(--origam-color__feedback--warning---bg));
			--origam-avatar---color: var(--origam-avatar--warning---color, var(--origam-color__feedback--warning---fg));
		}

		&--success {
			--origam-avatar---background-color: var(--origam-avatar--success---background-color, var(--origam-color__feedback--success---bg));
			--origam-avatar---color: var(--origam-avatar--success---color, var(--origam-color__feedback--success---fg));
		}

		&--info {
			--origam-avatar---background-color: var(--origam-avatar--info---background-color, var(--origam-color__feedback--info---bg));
			--origam-avatar---color: var(--origam-avatar--info---color, var(--origam-color__feedback--info---fg));
		}

		&--error {
			--origam-avatar---background-color: var(--origam-avatar--danger---background-color, var(--origam-color__feedback--danger---bg));
			--origam-avatar---color: var(--origam-avatar--danger---color, var(--origam-color__feedback--danger---fg));
		}
	}
</style>

