<template>
	<component
			:is="tag"
			:class="badgeClasses"
			:style="badgeStyles"
			v-bind="restAttrs"
			@mouseenter="handleMouseenter"
			@mouseleave="handleMouseleave"
	>
		<div class="origam-badge__wrapper">
			<slot name="default"/>

			<origam-transition :transition="transition">
        <span
		        v-show="modelValue"
		        :id="id"
		        v-contrast
		        :aria-label="t(label, content)"
		        :class="badgeContentClasses"
		        :style="typographyStyles"
		        aria-atomic="true"
		        aria-live="polite"
		        role="status"
		        v-bind="badgeAttrs"
        >
          <template v-if="!dot">
            <slot name="badge">
              <template v-if="hasPrependIcon">
                <slot name="prepend">
                  <origam-icon
                          key="prepend-icon"
                          class="origam-badge__prepend"
                          :icon="prependIcon"
                  />
                </slot>
              </template>

              <template v-if="hasIcon">
                <origam-icon
                        key="content-icon"
                        :icon="icon"
                />
              </template>
              <template v-else-if="content !== undefined && content !== null && content !== ''">
                <span class="origam-badge__content">{{ content }}</span>
              </template>

              <template v-if="hasAppendIcon">
                <slot name="append">
                  <origam-icon
                          key="append-icon"
                          class="origam-badge__append"
                          :icon="appendIcon"
                  />
                </slot>
              </template>
            </slot>
          </template>
        </span>
			</origam-transition>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamFade, OrigamIcon, OrigamTransition } from '../../components'

	import {
		useActive,
		useHover,
		useLocale,
		useLocation,
		useProps,
		useStateEffect,
		useStatus,
		useStyle,
		useTypography
	} from '../../composables'

	import type { IBadgeProps } from '../../interfaces'
	import type { TTransitionProps } from "../../types"

	import { vContrast } from '../../directives'

	import { omit, pick } from '../../utils'

	import { computed, ComputedRef, StyleValue, useAttrs } from 'vue'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, locale and attributes splitting for the Badge.
	 ********************************************************/
	const props = withDefaults(defineProps<IBadgeProps>(), {
		tag: 'div',
		location: 'top right',
		label: 'origam.badge',
		// Default transition: fade — the canonical default for any
		// `modelValue: boolean` show/hide component. Passed as a
		// component descriptor (not a bare name string) so the matching
		// `<style>` block of `OrigamFade` is guaranteed to be injected
		// globally without depending on another OrigamFade instance
		// being already mounted in the page.
		transition: () => ({component: OrigamFade}) as unknown as TTransitionProps
	})

	const {filterProps} = useProps<IBadgeProps>(props)
	const {t} = useLocale()

	const attrs = useAttrs()

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover, active state, color and location resolution.
	 ********************************************************/
	const {hoverClasses, isHover, hoverState, onMouseleave: handleMouseleave, onMouseenter: handleMouseenter} = useHover(props)
	const {activeClasses, isActive, activeState} = useActive(props, 'modelValue')
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	// The badge pill (`__badge` span) is the visual surface; classes go
	// there, not on the wrapper root.

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, elevationClasses, elevationStyles } = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState)

	/*********************************************************
	 * Composables
	 ********************************************************/
	/*********************************************************
	 * Icon
	 ********************************************************/

	const {typographyStyles} = useTypography(props, 'badge__badge')

	const {icon, prependIcon, appendIcon, statusClasses} = useStatus(props)
	const {locationStyles} = useLocation(props, true, side => {
		const base = props.floating
				? (props.dot ? 2 : 4)
				: (props.dot ? 8 : 12)

		return base + (
				['top', 'bottom'].includes(side) ? +(props.offsetY ?? 0)
						: ['left', 'right'].includes(side) ? +(props.offsetX ?? 0)
								: 0
		)
	})

	/*********************************************************
	 * Content
	 *
	 * @description
	 * Badge content capped at `max` and icon flag.
	 ********************************************************/
	const hasIcon = computed(() => {
		return !!icon.value
	})
	const hasPrependIcon = computed(() => {
		return !!prependIcon.value
	})
	const hasAppendIcon = computed(() => {
		return !!appendIcon.value
	})

	const content = computed(() => {
		const value = Number(props.content)

		if (!props.max || isNaN(value)) {
			return props.content
		} else if (value <= +props.max) {
			return value
		}

		return `${props.max}+`
	})

	const badgeAttrs = computed<Record<string, unknown>>(() => {
		return pick(attrs as Record<string, any>, [
			'aria-atomic',
			'aria-label',
			'aria-live',
			'role',
			'title'
		])
	})
	const restAttrs = computed(() => {
		return omit(attrs as Record<string, any>, [
			'aria-atomic',
			'aria-label',
			'aria-live',
			'role',
			'title'
		])
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all classes/styles for the root wrapper and
	 * applies location/color styles to the badge pill via
	 * useStyle.
	 ********************************************************/
	const badgeStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const badgeClasses = computed(() => {
		return [
			'origam-badge',
			{
				'origam-badge--dot': props.dot,
				'origam-badge--floating': props.floating,
				'origam-badge--inline': props.inline
			},
			activeClasses.value,
			hoverClasses.value,
			statusClasses.value,
			props.class
		]
	})

	const badgeContentStyles = computed(() => {
		return [
			elevationStyles.value,
			colorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			props.inline ? {} : locationStyles.value
		] as StyleValue
	})
	const badgeContentClasses = computed(() => {
		return [
			'origam-badge__badge',
			colorClasses.value,
			roundedClasses.value,
			borderClasses.value,
			elevationClasses.value
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(badgeContentStyles)


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
	.origam-badge {
		$this: &;

		display: inline-flex;
		line-height: 1;

		&__badge {
			align-items: center;
			justify-content: center;
			display: inline-flex;
			gap: var(--origam-badge__badge---gap, 2px);

			position: var(--origam-badge__badge---position);
			pointer-events: var(--origam-badge__badge---pointer-events);
			transition: var(--origam-badge__badge---transition);

			border-width: var(--origam-badge__badge---border-width);
			border-style: var(--origam-badge__badge---border-style);
			border-color: var(--origam-badge__badge---border-color);
			border-radius: var(--origam-badge__badge---border-radius);

			font-size: var(--origam-badge__badge---font-size);
			font-weight: var(--origam-badge__badge---font-weight);
			text-align: var(--origam-badge__badge---text-align);
			text-indent: var(--origam-badge__badge---text-indent);
			white-space: var(--origam-badge__badge---white-space);

			height: var(--origam-badge__badge---height);
			width: var(--origam-badge__badge---width, auto);
			min-width: var(--origam-badge__badge---min-width);

			padding-block-start: var(--origam-badge__badge---padding-block-start);
			padding-block-end: var(--origam-badge__badge---padding-block-end);
			padding-inline-start: var(--origam-badge__badge---padding-inline-start);
			padding-inline-end: var(--origam-badge__badge---padding-inline-end);
			margin-block-start: var(--origam-badge__badge---margin-block-start);
			margin-block-end: var(--origam-badge__badge---margin-block-end);
			margin-inline-start: var(--origam-badge__badge---margin-inline-start);
			margin-inline-end: var(--origam-badge__badge---margin-inline-end);

			background-color: var(--origam-badge__badge---background-color);
			color: var(--origam-badge__badge---color);
			box-shadow: var(--origam-badge__badge---box-shadow);

			:deep(.origam-icon) {
				color: inherit;
				font-size: 0.75rem;
			}

			:deep(img),
			:deep(.origam-img) {
				height: 100%;
				width: 100%;
			}

			&#{$this}--border {
				--origam-badge__badge---border-width: 2px;
			}

			&#{$this}--elevated {
				--origam-badge__badge---box-shadow: var(--origam-badge__badge---box-shadow-elevated, var(--origam-shadow---md));
			}

			&#{$this}--rounded {
				--origam-badge__badge---border-radius: var(--origam-radius---md, 8px);
			}

			&#{$this}--rounded-x-small {
				--origam-badge__badge---border-radius: var(--origam-radius---xs, 2px);
			}

			&#{$this}--rounded-small {
				--origam-badge__badge---border-radius: var(--origam-radius---sm, 4px);
			}

			&#{$this}--rounded-default {
				--origam-badge__badge---border-radius: var(--origam-radius---md, 8px);
			}

			&#{$this}--rounded-medium {
				--origam-badge__badge---border-radius: var(--origam-radius---lg, 12px);
			}

			&#{$this}--rounded-large {
				--origam-badge__badge---border-radius: var(--origam-radius---xl, 16px);
			}

			&#{$this}--rounded-x-large {
				--origam-badge__badge---border-radius: var(--origam-radius---2xl, 24px);
			}

			&#{$this}--rounded-shaped {
				border-start-start-radius: var(--origam-radius---xl, 16px);
				border-start-end-radius: 0;
				border-end-start-radius: 0;
				border-end-end-radius: var(--origam-radius---xl, 16px);
			}

			&#{$this}--rounded-shaped-invert {
				border-start-start-radius: 0;
				border-start-end-radius: var(--origam-radius---xl, 16px);
				border-end-start-radius: var(--origam-radius---xl, 16px);
				border-end-end-radius: 0;
			}
		}

		&__wrapper {
			position: relative;

			display: var(--origam-badge__wrapper---display);
			align-items: var(--origam-badge__wrapper---align-items);
			justify-content: var(--origam-badge__wrapper---justify-content);

			padding-block-start: var(--origam-badge__wrapper---padding-block-start);
			padding-block-end: var(--origam-badge__wrapper---padding-block-end);
			padding-inline-start: var(--origam-badge__wrapper---padding-inline-start);
			padding-inline-end: var(--origam-badge__wrapper---padding-inline-end);
			margin-block-start: var(--origam-badge__wrapper---margin-block-start);
			margin-block-end: var(--origam-badge__wrapper---margin-block-end);
			margin-inline-start: var(--origam-badge__wrapper---margin-inline-start);
			margin-inline-end: var(--origam-badge__wrapper---margin-inline-end);
		}

		&--dot {
			#{$this}__badge {
				--origam-badge__badge---border-width: 1.5px;
				--origam-badge__badge---height: 9px;
				--origam-badge__badge---width: 9px;
				--origam-badge__badge---min-width: 0;
				--origam-badge__badge---padding-block-start: 0;
				--origam-badge__badge---padding-block-end: 0;
				--origam-badge__badge---padding-inline-start: 0;
				--origam-badge__badge---padding-inline-end: 0;
				--origam-badge__badge---text-indent: -9999px;
			}
		}

		&--inline {
			#{$this}__badge {
				--origam-badge__badge---position: relative;
				vertical-align: middle;
			}

			#{$this}__wrapper {
				--origam-badge__wrapper---display: inline-flex;
				--origam-badge__wrapper---align-items: center;
				--origam-badge__wrapper---justify-content: center;
				--origam-badge__wrapper---margin-inline: 4px;
			}
		}

		&--warning {
			--origam-badge__badge---background-color: var(--origam-badge--warning---background-color, var(--origam-color__feedback--warning---bg));
			--origam-badge__badge---color: var(--origam-badge--warning---color, var(--origam-color__feedback--warning---fg));
		}

		&--success {
			--origam-badge__badge---background-color: var(--origam-badge--success---background-color, var(--origam-color__feedback--success---bg));
			--origam-badge__badge---color: var(--origam-badge--success---color, var(--origam-color__feedback--success---fg));
		}

		&--info {
			--origam-badge__badge---background-color: var(--origam-badge--info---background-color, var(--origam-color__feedback--info---bg));
			--origam-badge__badge---color: var(--origam-badge--info---color, var(--origam-color__feedback--info---fg));
		}

		&--error {
			--origam-badge__badge---background-color: var(--origam-badge--danger---background-color, var(--origam-color__feedback--danger---bg));
			--origam-badge__badge---color: var(--origam-badge--danger---color, var(--origam-color__feedback--danger---fg));
		}
	}
</style>

