<template>
	<component
			:is="props.tag"
			:id="id"
			v-contrast
			:class="alertClasses"
			:role="status === 'warning' || status === 'error' ? 'alert' : 'status'"
			:aria-live="status === 'warning' || status === 'error' ? 'assertive' : 'polite'"
			@mouseenter="handleMouseenter"
			@mouseleave="handleMouseleave"
	>
    <span
		    key="underlay"
		    class="origam-alert__underlay"
    />

		<slot name="wrapper">
			<template v-if="hasPrepend">
				<div
						key="prepend"
						class="origam-alert__prepend"
						@click="handleClickPrepend"
				>
					<slot name="prepend">
						<origam-avatar
								v-if="prependAvatar"
								key="prepend-avatar"
								:density="density"
								:image="prependAvatar"
								:size="size"
						/>
						<origam-icon
								v-if="prependIcon"
								key="prepend-icon"
								:density="density"
								:icon="prependIcon"
								:size="size"
						/>
					</slot>
				</div>
			</template>

			<div class="origam-alert__content">
				<div
						v-if="hasHeader"
						class="origam-alert__header"
				>
					<template v-if="hasIcon">
						<origam-icon
								key="content-icon"
								:icon="icon"
								:size="size"
						/>
					</template>
					<template v-if="hasTitle">
						<span class="origam-alert__title" :style="typographyStyles">
							<slot name="title">{{ title }}</slot>
						</span>
					</template>
				</div>

				<div class="origam-alert__body">
					<slot name="text">{{ text }}</slot>
				</div>

				<slot name="default"/>
			</div>

			<template v-if="hasAppend">
				<div
						key="append"
						class="origam-alert__append"
						@click="handleClickAppend"
				>
					<slot name="append">
						<origam-avatar
								v-if="appendAvatar"
								key="append-avatar"
								:density="density"
								:image="appendAvatar"
								:size="size"
						/>
						<origam-icon
								v-if="appendIcon"
								key="append-icon"
								:density="density"
								:icon="appendIcon"
								:size="size"
						/>
					</slot>
				</div>
			</template>
		</slot>

		<div
				v-if="hasClose"
				key="close"
				class="origam-alert__close"
		>
			<slot name="close">
				<origam-btn
						key="close-btn"
						:aria-label="t(closeLabel)"
						:icon="closeIcon"
						data-cy="close"
						size="x-small"
						@click="handleClose"
				/>
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import type { ComputedRef, StyleValue } from 'vue'
	import { computed, useSlots } from 'vue'
	import { OrigamAvatar, OrigamBtn, OrigamIcon } from '../../components'

	import { vContrast } from '../../directives'

	import {
		useActive,
		useAdjacent,
		useDefaults,
		useDensity,
		useDimension,
		useHover,
		useLocale,
		useLocation,
		usePosition,
		useProps,
		useStateEffect,
		useStatus,
		useStyle,
		useTypography
	} from '../../composables'

	import { DENSITY, MDI_ICONS } from '../../enums'

	import type { IAlertProps} from '../../interfaces'

	import type { IAlertEmits } from '../../interfaces/Alert/alert.interface'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits and utilities for the Alert component.
	 ********************************************************/
	const _props = withDefaults(defineProps<IAlertProps>(), {
		tag: 'div',
		density: DENSITY.DEFAULT,
		closeIcon: MDI_ICONS.CLOSE,
		closeLabel: 'origam.close',
		modelValue: true,
		hover: true
	})

	// `useDefaults` resolves each prop against the closest
	// `<OrigamDefaultsProvider>` / theme `components['origam-alert']` config —
	// see the pattern established in `OrigamBtn.vue`. Without this, the theme's
	// `components: { 'origam-alert': { … } }` block was a silent no-op.
	//
	// NOTE: `<script setup>` auto-exposes every `defineProps()` key to the
	// template as a bare binding pointing at the raw, UNRESOLVED `$props` —
	// independent of this `props` variable. The root `<component :is="…">`
	// below therefore reads `props.tag` explicitly (see OrigamTable.vue for
	// the full writeup of this footgun); every other value here goes through
	// a computed/composable that receives `props` directly, which resolves
	// correctly.
	const props = useDefaults(_props)

	const emits = defineEmits<IAlertEmits>()

	const {filterProps} = useProps<IAlertProps>(props)
	const {t} = useLocale()

	/*********************************************************
	 * Typography
	 *
	 * @description
	 * BEM-child surface: typographyStyles are bound on the
	 * __title element (not the root). varPrefix='alert__title'
	 * targets the four CSS vars the SCSS reads on that span:
	 *   font-size / font-weight / letter-spacing / line-height.
	 * fontFamily is not in the __title SCSS — no effect.
	 ********************************************************/
	const {typographyStyles} = useTypography(props, 'alert__title')

	const slots = useSlots()

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover, active state and color resolution for the alert.
	 ********************************************************/
	const {activeClasses, isActive, activeState, onActive} = useActive(props, 'modelValue')
	const {isHover, hoverState, onMouseenter: handleMouseenter, onMouseleave: handleMouseleave, hoverClasses} = useHover(props)
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	// `colorClasses` ships `.origam--bg-{intent}` / `.origam--color-{intent}`
	// for the resting state only — `useStateEffect` returns `[]` for hover/
	// active so the inline `colorStyles` keeps owning those slots.

	/*********************************************************
	 * Color
	 ********************************************************/

	const { colorClasses, colorStyles, borderClasses, borderStyles, roundedClasses, roundedStyles, elevationClasses, elevationStyles, paddingClasses, paddingStyles, marginClasses, marginStyles } = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState)

	/*********************************************************
	 * Adjacent (prepend / append)
	 *
	 * @description
	 * Resolves prepend/append icons and click handlers.
	 ********************************************************/

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {icon, prependIcon, appendIcon, statusClasses} = useStatus(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {
		onClickPrepend: handleClickPrepend,
		onClickAppend: handleClickAppend,
		hasAppend,
		hasPrepend
	} = useAdjacent(props, prependIcon, appendIcon)

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Computed flags that control conditional rendering of
	 * icon, title, header and close button sections.
	 ********************************************************/

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClose = (e: MouseEvent) => {
		onActive()

		emits('click:close', e)
	}
	const size = 28

	const hasIcon = computed(() => {
		// Pre-fix: `!!(props.icon || props.status)` returned true as soon
		// as a `status` was set, even when the resolved `icon` was empty
		// (`useStatus` only assigns `statusIcon` to `icon` when
		// `statusIconPosition === 'replace'`). The header then rendered
		// `<origam-icon :icon="undefined">` — an empty `<i.origam-icon>`
		// placeholder squeezed in next to the title. Pin the gate to the
		// actual resolved icon used by the template.
		return !!icon.value
	})
	const hasTitle = computed(() => {
		return !!(slots.title || props.title)
	})
	const hasHeader = computed(() => {
		return hasTitle.value || hasIcon.value
	})
	const hasClose = computed(() => {
		return slots.close || props.closable
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes all layout, spacing, color, elevation and
	 * variant classes/styles onto the root element.
	 ********************************************************/
	const {densityClasses} = useDensity(props)
	const {dimensionStyles} = useDimension(props)
	const {locationStyles} = useLocation(props)
	const {positionClasses, positionStyles} = usePosition(props)
	const alertStyles = computed(() => {
		return [
			dimensionStyles.value,
			colorStyles.value,
			locationStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			roundedStyles.value,
			positionStyles.value,
			elevationStyles.value,
			props.style
		] as StyleValue
	})
	const alertClasses = computed(() => {
		return [
			'origam-alert',
			hoverClasses.value,
			activeClasses.value,
			statusClasses.value,
			colorClasses.value,
			densityClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			elevationClasses.value,
			positionClasses.value,
			roundedClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(alertStyles)

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
	.origam-alert {
		$this: &;

		display: grid;
		flex: 1 1;
		grid-template-areas: "prepend content append close" ". content . .";
		grid-template-columns: max-content auto max-content max-content;
		overflow: hidden;
		position: var(--origam-alert---position);

		padding-block-start: calc(var(--origam-alert---padding-block-start) - var(--origam-alert---density));
		padding-block-end: calc(var(--origam-alert---padding-block-end) - var(--origam-alert---density));
		padding-inline-start: calc(var(--origam-alert---padding-inline-start) - var(--origam-alert---density));
		padding-inline-end: calc(var(--origam-alert---padding-inline-end) - var(--origam-alert---density));
		margin-block-start: var(--origam-alert---margin-block-start);
		margin-block-end: var(--origam-alert---margin-block-end);
		margin-inline-start: var(--origam-alert---margin-inline-start);
		margin-inline-end: var(--origam-alert---margin-inline-end);

		border-top-width: var(--origam-alert---border-top-width, var(--origam-alert---border-width, 0));
		border-right-width: var(--origam-alert---border-right-width, var(--origam-alert---border-width, 0));
		border-bottom-width: var(--origam-alert---border-bottom-width, var(--origam-alert---border-width, 0));
		border-left-width: var(--origam-alert---border-left-width, var(--origam-alert---border-width, 0));
		border-style: var(--origam-alert---border-style);
		border-color: var(--origam-alert---border-color);
		border-radius: var(--origam-alert---border-radius);

		background-color: var(--origam-alert---background-color);
		color: var(--origam-alert---color);

		@supports (backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px)) {
			backdrop-filter: var(--origam-alert---backdrop-filter, none);
			-webkit-backdrop-filter: var(--origam-alert---backdrop-filter, none);
		}

		&--elevated {
			box-shadow: var(--origam-alert---box-shadow-elevated, var(--origam-shadow---md));
		}

		&--border {
			&#{$this}--border-left {
				--origam-alert---border-left-width: calc(24px - var(--origam-alert---density));

				#{$this}__underlay {
					--origam-alert__underlay---border-top-left-radius: 0;
					--origam-alert__underlay---border-bottom-left-radius: 0;
				}
			}

			&#{$this}--border-right {
				--origam-alert---border-right-width: calc(24px - var(--origam-alert---density));

				#{$this}__underlay {
					--origam-alert__underlay---border-top-right-radius: 0;
					--origam-alert__underlay---border-bottom-right-radius: 0;
				}
			}

			&#{$this}--border-top {
				--origam-alert---border-top-width: calc(24px - var(--origam-alert---density));

				#{$this}__underlay {
					--origam-alert__underlay---border-top-left-radius: 0;
					--origam-alert__underlay---border-top-right-radius: 0;
				}
			}

			&#{$this}--border-bottom {
				--origam-alert---border-bottom-width: calc(24px - var(--origam-alert---density));

				#{$this}__underlay {
					--origam-alert__underlay---border-bottom-left-radius: 0;
					--origam-alert__underlay---border-bottom-right-radius: 0;
				}
			}
		}

		&--rounded {
			--origam-alert---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--rounded-x-small {
			--origam-alert---border-radius: var(--origam-radius---xs, 2px);
		}

		&--rounded-small {
			--origam-alert---border-radius: var(--origam-radius---sm, 4px);
		}

		&--rounded-default {
			--origam-alert---border-radius: var(--origam-radius---md, 8px);
		}

		&--rounded-medium {
			--origam-alert---border-radius: var(--origam-radius---lg, 12px);
		}

		&--rounded-large {
			--origam-alert---border-radius: var(--origam-radius---xl, 16px);
		}

		&--rounded-x-large {
			--origam-alert---border-radius: var(--origam-radius---2xl, 24px);
		}

		&--density-comfortable {
			--origam-alert---density: -8px;
		}

		&--density-default {
			--origam-alert---density: 0px;
		}

		&--density-compact {
			--origam-alert---density: 8px;
		}

		&--warning {
			--origam-alert---background-color: var(--origam-alert--warning---bg, var(--origam-color__feedback--warning---bg, rgb(251, 140, 0)));
			--origam-alert---color: var(--origam-alert--warning---fg, var(--origam-color__feedback--warning---fg, #ffffff));
		}

		&--success {
			--origam-alert---background-color: var(--origam-alert--success---bg, var(--origam-color__feedback--success---bg, rgb(76, 175, 80)));
			--origam-alert---color: var(--origam-alert--success---fg, var(--origam-color__feedback--success---fg, #ffffff));
		}

		&--info {
			--origam-alert---background-color: var(--origam-alert--info---bg, var(--origam-color__feedback--info---bg, rgb(33, 150, 243)));
			--origam-alert---color: var(--origam-alert--info---fg, var(--origam-color__feedback--info---fg, #ffffff));
		}

		&--error {
			--origam-alert---background-color: var(--origam-alert--danger---bg, var(--origam-color__feedback--danger---bg, rgb(207, 102, 121)));
			--origam-alert---color: var(--origam-alert--danger---fg, var(--origam-color__feedback--danger---fg, #ffffff));
		}

		&--absolute {
			--origam-alert---position: absolute;
		}

		&--fixed {
			--origam-alert---position: fixed;
		}

		&--sticky {
			--origam-alert---position: sticky;
		}

		&--relative {
			--origam-alert---position: relative;
		}

		&__close {
			align-self: flex-start;
			flex: 0 1 auto;
			grid-area: close;
			padding-block-start: var(--origam-alert__close---padding-block-start);
			padding-block-end: var(--origam-alert__close---padding-block-end);
			padding-inline-start: var(--origam-alert__close---padding-inline-start);
			padding-inline-end: var(--origam-alert__close---padding-inline-end);
			margin-block-start: var(--origam-alert__close---margin-block-start);
			margin-block-end: var(--origam-alert__close---margin-block-end);
			margin-inline-start: calc(var(--origam-alert__close---margin-inline-start) - var(--origam-alert---density));
			margin-inline-end: var(--origam-alert__close---margin-inline-end);
		}

		&__content {
			align-self: center;
			grid-area: content;
			overflow: hidden;
		}

		&__append {
			align-self: flex-start;
			display: flex;
			grid-area: append;
			align-items: var(--origam-alert__append---align-items);
			padding-block-start: var(--origam-alert__append---padding-block-start);
			padding-block-end: var(--origam-alert__append---padding-block-end);
			padding-inline-start: var(--origam-alert__append---padding-inline-start);
			padding-inline-end: var(--origam-alert__append---padding-inline-end);
			margin-block-start: var(--origam-alert__append---margin-block-start);
			margin-block-end: var(--origam-alert__append---margin-block-end);
			margin-inline-start: calc(var(--origam-alert__append---margin-inline-start) - var(--origam-alert---density));
			margin-inline-end: var(--origam-alert__append---margin-inline-end);
		}

		&__prepend {
			align-self: flex-start;
			display: flex;
			grid-area: prepend;
			align-items: var(--origam-alert__prepend---align-items);
			padding-block-start: var(--origam-alert__prepend---padding-block-start);
			padding-block-end: var(--origam-alert__prepend---padding-block-end);
			padding-inline-start: var(--origam-alert__prepend---padding-inline-start);
			padding-inline-end: var(--origam-alert__prepend---padding-inline-end);
			margin-block-start: var(--origam-alert__prepend---margin-block-start);
			margin-block-end: var(--origam-alert__prepend---margin-block-end);
			margin-inline-start: var(--origam-alert__prepend---margin-inline-start);
			margin-inline-end: calc(var(--origam-alert__prepend---margin-inline-end) - var(--origam-alert---density));
		}

		&__underlay {
			grid-area: none;
			position: absolute;
			border-radius: var(--origam-alert__underlay---border-radius)
		}

		&__title {
			align-self: center;
			display: flex;
			align-items: var(--origam-alert__title---align-items);
			font-size: var(--origam-alert__title---font-size);
			font-weight: var(--origam-alert__title---font-weight);
			hyphens: var(--origam-alert__title---hyphens);
			letter-spacing: var(--origam-alert__title---letter-spacing);
			line-height: var(--origam-alert__title---line-height);
			overflow-wrap: var(--origam-alert__title---overflow-wrap);
			text-transform: var(--origam-alert__title---text-transform);
			word-break: var(--origam-alert__title---word-break);
			word-wrap: var(--origam-alert__title---word-wrap);
		}
	}

</style>
