<template>
	<origam-overlay
			ref="origamOverlayRef"
			v-model="isActive"
			:activator-props="activatorProps"
			:class="dialogClasses"
			:style="dialogStyles"
			v-bind="{...overlayProps, ...scopeId}"
	>
			<template #activator="{props}">
			<slot
					name="activator"
					v-bind="{props}"
			/>
		</template>

		<template #default="{isActive}">
			<slot
					name="default"
					v-bind="{isActive}"
			>
				<origam-card
						ref="origamCardRef"
						:aria-labelledby="dialogTitleId"
						aria-modal="true"
						role="dialog"
						v-bind="cardProps"
				>
					<template
							v-if="slots.loader"
							#loader
					>
						<slot name="loader"/>
					</template>

					<template
							v-if="slots.header"
							#header
					>
						<slot name="header"/>
					</template>

					<template #header-append>
						<slot name="header-append">
							<origam-btn
									:icon="MDI_ICONS.CLOSE"
									:rounded="0"
									aria-label="Close dialog"
									bg-color="transparent"
									@click="handleClose"
							/>
						</slot>
					</template>

					<template
							v-if="hasPrepend"
							#header-prepend
					>
						<slot name="header-prepend">
							<origam-icon
									v-if="hasIcon"
									key="prepend-icon"
									:icon="icon"
									:size="28"
							/>
						</slot>
					</template>

					<template
							v-if="slots['header-title']"
							#header-title
					>
						<slot
								name="header-title"
								v-bind="{titleId: dialogTitleId}"
						/>
					</template>

					<template
							v-if="slots['header-subtitle']"
							#header-subtitle
					>
						<slot name="header-subtitle"/>
					</template>

					<template
							v-if="slots['header-content']"
							#header-content
					>
						<slot name="header-content"/>
					</template>

					<template
							v-if="slots.asset"
							#asset
					>
						<slot name="asset"/>
					</template>

					<template
							v-if="slots.text"
							#text
					>
						<slot name="text"/>
					</template>

					<template #default>
						<slot name="content"/>
						<div
								ref="endText"
								v-intersect="handleIntersect"
						></div>
					</template>

					<template
							v-if="slots.footer"
							#footer
					>
						<slot name="footer"/>
					</template>
				</origam-card>
			</slot>
		</template>
	</origam-overlay>
</template>

<script
		lang="ts"
		setup
>
	import { computed, mergeProps, nextTick, ref, StyleValue, useSlots, watch } from 'vue'
	import { getUid } from '../../utils'
	import { OrigamBtn, OrigamCard, OrigamIcon, OrigamOverlay, OrigamTranslateScale } from '../../components'
	import {
	useProps,
	useScopeId,
	useSize,
	useStatus,
	useStyle,
	useVModel
} from '../../composables'
	import { IN_BROWSER } from '../../consts'
	import { vIntersect } from '../../directives'
	import { MDI_ICONS } from '../../enums'
	import type { IDialogProps} from '../../interfaces'

	import type { IDialogEmits } from '../../interfaces/Dialog/dialog.interface'
	import type { TOrigamCard, TOrigamOverlay, TTransitionProps } from '../../types'
	import { focusableChildren, forwardRefs } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, and top-level composable bootstrapping.
	 * openOnClick and scrim default to `true` here because Vue 3's
	 * Boolean prop coercion would otherwise resolve them to `false`,
	 * breaking the activator click chain (openOnClick) and hiding the
	 * scrim entirely (scrim) — see the comments on each below.
	 ********************************************************/
	const props = withDefaults(defineProps<IDialogProps>(), {
		retainFocus: true,
		origin: 'center center',
		scrollStrategy: 'block',
		transition: () => ({component: OrigamTranslateScale}) as unknown as TTransitionProps,
		zIndex: 2400,
		// Vue 3's Boolean prop coercion turns `undefined` into `false`,
		// so without an explicit default here Dialog's resolved
		// `props.openOnClick` is `false` even though OrigamOverlay's
		// withDefaults declares `true`. The chain `Dialog → Overlay →
		// useActivator.activatorEvents` then drops `onClick` from the
		// activator merge, the consumer's button receives no click
		// handler, and the dialog never opens. Anchoring the default
		// here lines up the resolved prop with the parent's intent.
		openOnClick: true,
		// Same coercion class as `openOnClick` above: `scrim?: boolean |
		// string` (IOverlayScrimProps) includes a boolean in its type,
		// so an unset `scrim` on Dialog resolves to the concrete value
		// `false` — never `undefined`. Dialog explicitly forwards its
		// OWN resolved `props.scrim` into `overlayProps` (filterProps),
		// so that `false` WINS over OrigamOverlay's own `withDefaults({
		// scrim: true })` default and the backdrop never renders,
		// regardless of theme/consumer intent. Anchoring the default
		// here lines up the resolved prop with OrigamOverlay's (see #279).
		scrim: true
	})

	const emits = defineEmits<IDialogEmits>()

	const {filterProps} = useProps<IDialogProps>(props)

	/*********************************************************
	 * Value
	 ********************************************************/

	const isActive = useVModel(props, 'modelValue')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {scopeId} = useScopeId()
	const slots = useSlots()
	const uid = getUid()
	const dialogTitleId = computed(() => `origam-dialog-title-${uid}`)

	const origamOverlayRef = ref<TOrigamOverlay>()
	const origamCardRef = ref<TOrigamCard>()

	/*********************************************************
	 * Focus trap
	 *
	 * @description
	 * Retain keyboard focus inside the dialog while it is open.
	 * Cycles focus between first and last focusable element when
	 * the user tabs past either boundary.
	 ********************************************************/

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleFocusin = (e: FocusEvent) => {
		const before = e.relatedTarget as HTMLElement | null
		const after = e.target as HTMLElement | null

		if (
				before !== after &&
				origamOverlayRef.value?.contentEl &&
				// We're the topmost dialog
				origamOverlayRef.value?.globalTop &&
				// It isn't the document or the dialog body
				![document, origamOverlayRef.value.contentEl].includes(after!) &&
				// It isn't inside the dialog body
				!origamOverlayRef.value.contentEl.contains(after)
		) {
			const focusable = focusableChildren(origamOverlayRef.value.contentEl)

			if (!focusable.length) return

			const firstElement = focusable[0]
			const lastElement = focusable[focusable.length - 1]

			if (before === firstElement) {
				lastElement.focus()
			} else {
				firstElement.focus()
			}
		}
	}

	if (IN_BROWSER) {
		watch(() => isActive.value && props.retainFocus, (val) => {
			if (val) {
				document.addEventListener('focusin', handleFocusin)
			} else {
				document.removeEventListener('focusin', handleFocusin)
			}
		}, {immediate: true})
	}

	watch(isActive, async (val) => {
		await nextTick()
		if (val) {
			origamOverlayRef.value!.contentEl?.focus({preventScroll: true})
		} else {
			origamOverlayRef.value!.activatorEl?.focus({preventScroll: true})
		}
	})

	/*********************************************************
	 * Icon & Status
	 *
	 * @description
	 * Resolves the status icon shown in the header-prepend area.
	 ********************************************************/

	/*********************************************************
	 * Icon
	 ********************************************************/

	const {icon, statusClasses} = useStatus(props)
	const {sizeClasses} = useSize(props, 'origam-dialog')

	const hasPrepend = computed(() => {
		return !!(slots['header-prepend'] || icon.value)
	})
	const hasIcon = computed(() => {
		return !!(props.icon || props.status)
	})

	/*********************************************************
	 * Activator & Overlay
	 *
	 * @description
	 * Merges ARIA props onto the activator element and forwards
	 * filtered props to the inner overlay and card instances.
	 ********************************************************/
	const activatorProps = computed(() => {
		return mergeProps({
			'aria-haspopup': 'dialog',
			'aria-expanded': String(isActive.value)
		}, props.activatorProps)
	})

	/*********************************************************
	 * Forwarded props
	 ********************************************************/

	const overlayProps = computed(() => {
		return origamOverlayRef.value?.filterProps(props, ['activatorProps', 'class', 'style', 'modelValue'])
	})
	const cardProps = computed(() => {
		return origamCardRef.value?.filterProps(props)
	})

	/*********************************************************
	 * Events
	 *
	 * @description
	 * Handles close and scroll-to-bottom (isRead) interactions.
	 ********************************************************/
	const handleClose = () => {
		isActive.value = false
	}
	const handleIntersect = (_isIntersecting: boolean, entries: Array<IntersectionObserverEntry>) => {
		if (entries[entries.length - 1].isIntersecting) {
			emits('isRead', true)
		}
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * dialogClasses and dialogStyles computed properties for the root element.
	 ********************************************************/
	const dialogStyles = computed(() => {
		return [
			props.style
		] as StyleValue
	})
	const dialogClasses = computed(() => {
		return [
			'origam-dialog',
			{
				'origam-dialog--fullscreen': props.fullscreen,
				'origam-dialog--scrollable': props.scrollable
			},
			sizeClasses.value,
			statusClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(dialogStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps and the overlay ref to parent components.
	 ********************************************************/
	defineExpose(forwardRefs({filterProps,
		css,
		id,
		load,
		unload,
		isLoaded
	}, origamOverlayRef))
</script>

<style
		lang="scss"
		scoped
>
	.origam-dialog {
		$this: &;

		align-items: center;
		justify-content: center;
		margin: auto;

		&--size-x-small  { --origam-dialog---width: var(--origam-dialog---width-xs, 320px); }
		&--size-small    { --origam-dialog---width: var(--origam-dialog---width-sm, 400px); }
		&--size-default  { --origam-dialog---width: var(--origam-dialog---width-md, 720px); }
		&--size-large    { --origam-dialog---width: var(--origam-dialog---width-lg, 960px); }
		&--size-x-large  { --origam-dialog---width: var(--origam-dialog---width-xl, 1080px); }

		> :deep(.origam-overlay__content) {
			max-height: var(--origam-dialog---max-height, calc(100vh - 48px));
			width: min(var(--origam-dialog---width, auto), calc(100vw - 48px));
			max-width: var(--origam-dialog---max-width, calc(100vw - 48px));
			margin: 24px;
			border-radius: var(--origam-dialog---border-radius, 12px);
			box-shadow: var(--origam-dialog---box-shadow);

			&,
			> form {
				> .origam-card {
					display: flex;
					flex: 1 1 100%;
					flex-direction: column;
					max-height: 100%;
					max-width: 100%;
					overflow: hidden;

					.origam-card__content {
						display: flex;
						flex: 1 1 100%;
						flex-direction: column;
						max-height: 100%;
						max-width: 100%;
						overflow: auto;
					}
				}
			}
		}

		&--fullscreen {
			--origam-dialog---width: 100vw;
			--origam-dialog---max-width: 100vw;
			--origam-dialog---max-height: 100vh;
			--origam-dialog---border-radius: 0;

			> :deep(.origam-overlay__content) {
				border-radius: var(--origam-dialog---border-radius, 0px);
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100%;
				max-width: var(--origam-dialog---max-width, 100%);
				max-height: var(--origam-dialog---max-height, 100%);
				overflow-y: auto;
				top: 0;
				left: 0;

				&,
				> form {
					> .origam-card,
					> .origam-sheet {
						min-height: 100%;
						min-width: 100%;
						border-radius: var(--origam-dialog__fullscreen---border-radius, 0px);
					}
				}
			}
		}
	}
</style>
