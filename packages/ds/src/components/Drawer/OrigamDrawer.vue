<template>
	<teleport
			:disabled="isLayoutOrphan"
			:to="teleportDrawer"
			defer
	>
		<origam-transition :transition="transition">
			<component
					:is="tag"
					v-if="isActive"
					:ref="rootEl"
					:aria-label="props.name || 'Navigation'"
					:class="drawerClasses"
					:style="drawerStyles"
					v-bind="{...scopeId, ...$attrs}"
					@mouseenter="handleMouseEnter"
					@mouseleave="handleMouseLeave"
			>
				<div class="origam-drawer__wrapper">
					<slot name="wrapper">
						<div
								v-if="hasPrepend"
								class="origam-drawer__prepend"
						>
							<slot name="prepend"/>
						</div>

						<div
								v-if="hasContent"
								class="origam-drawer__content"
						>
							<slot name="default"/>
						</div>

						<div
								v-if="hasAppend"
								class="origam-drawer__append"
						>
							<slot name="append"/>
						</div>
					</slot>
				</div>
			</component>
		</origam-transition>
		<origam-overlay-scrim
				v-if="isActive"
				:active="isTemporary && (isDragging || isActive && !!scrim)"
				:scrim="scrim"
				:style="scrimStyles"
				v-bind="scopeId"
				@click="handleClickScrim"
		/>
	</teleport>
</template>

<script
		lang="ts"
		setup
>
	import {
		computed,
		ComputedRef,
		isRef,
		nextTick,
		onBeforeMount,
		Ref,
		ref,
		shallowRef,
		StyleValue,
		toRef,
		useSlots,
		watch
	} from 'vue'
	import { OrigamOverlayScrim, OrigamTransition } from '../../components'

	import {
		useActive,
		useBackgroundColor,
		useDensity,
		useHover,
		useLayoutItem,
		useProps,
		useRouter,
		useScopeId,
		useSsrBoot,
		useStateEffect,
		useSticky,
		useStyle,
		useToggleScope,
		useTouch,
		useVModel
} from '../../composables'

	import { INLINE } from '../../enums'

	import type { IDrawerProps} from '../../interfaces'

	import type { IDrawerEmits } from '../../interfaces/Drawer/drawer.interface'

	import { int } from "../../utils"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props, emits, and composable bootstrapping.
	 ********************************************************/
	const props = withDefaults(defineProps<IDrawerProps>(), {
		tag: 'nav',
		permanent: null,
		rail: null,
		railWidth: 56,
		scrim: true,
		width: 256,
		location: INLINE.LEFT,
		modelValue: true,
		// `null` (NOT undefined / false) so Vue's boolean prop coercion
		// doesn't silently force the heuristic off. See IDrawerProps doc.
		push: null,
		clipped: null,
		// Default enter / leave animation: the drawer slides its FULL
		// width in / out of view. The matching `origam-transition--drawer-*`
		// keyframes live in OrigamDrawer.vue's global <style> block at
		// the bottom of the file — `translateX(-100%)` for left,
		// `translateX(100%)` for right, `translateY(±100%)` for top /
		// bottom. We pass the name as a string so Vue's <Transition>
		// auto-applies the matching classes; the keyframes are
		// guaranteed to be loaded because they ship with this very
		// component.
		//
		// Consumer overrides:
		//   :transition="false"                  → no animation
		//   :transition="'origam-transition--…'" → another named transition
		//   :transition="{ component: OrigamFade }" → custom component
		transition: 'origam-transition--drawer'
	})

	const emits = defineEmits<IDrawerEmits>()

	const {filterProps} = useProps<IDrawerProps>(props)

	// Phase 3 (Vague C) — class-first companion alongside inline styles.
	// `backgroundColorClasses` ships `.origam--bg-{intent}` for tokenised
	// intents on the drawer root; `backgroundColorStyles` keeps the
	// legacy raw-color fallback in parallel.

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {backgroundColorClasses, backgroundColorStyles} = useBackgroundColor(toRef(props, 'bgColor'))
	const {densityClasses} = useDensity(props)

	const {isHover, hoverState} = useHover(props)
	const {activeState} = useActive(props)

	/*********************************************************
	 * Value
	 *
	 * @description
	 * Active state, width derivation, and location/sticky flags.
	 * Declared BEFORE `useStateEffect` so it can be passed in.
	 ********************************************************/
	const isActive = useVModel(props, 'modelValue', false, v => !!v)

	const {
		borderClasses, borderStyles,
		roundedClasses, roundedStyles,
		elevationClasses,
		paddingClasses, paddingStyles,
		marginClasses, marginStyles,
	} = useStateEffect(props, isHover, isActive, hoverState, activeState)
	const slots = useSlots()
	const router = useRouter()
	const {ssrBootStyles} = useSsrBoot()
	const {scopeId} = useScopeId()
	const rootEl = ref<HTMLElement>()
	const isHovering = shallowRef(false)

	const width = computed(() => {
		return (props.rail && props.expandOnHover && isHovering.value)
				? Number(props.width)
				: Number(props.rail ? props.railWidth : props.width)
	})
	const location = computed(() => {
		return props.location as 'left' | 'right' | 'bottom'
	})
	const isTemporary = computed(() => !props.permanent && (props.temporary))
	const isSticky = computed(() => {
		return props.sticky && !isTemporary.value && location.value !== 'bottom'
	})

	useToggleScope(() => props.expandOnHover && props.rail != null, () => {
		watch(isHovering, val => emits('update:rail', !val))
	})
	useToggleScope(() => !props.disableResizeWatcher, () => {
		watch(isTemporary, val => !props.permanent && (nextTick(() => isActive.value = !val)))
	})
	useToggleScope(() => !props.disableRouteWatcher && !!router, () => {
		watch(router!.currentRoute, () => isTemporary.value && (isActive.value = false))
	})

	watch(() => props.permanent, val => {
		if (val) isActive.value = true
	})

	onBeforeMount(() => {
		if (props.modelValue != null || isTemporary.value) return

		isActive.value = props.permanent as boolean
	})

	/*********************************************************
	 * Drag
	 *
	 * @description
	 * Touch-drag to open/close the drawer.
	 ********************************************************/
	const {isDragging, dragProgress, dragStyles} = useTouch({
		isActive: isActive as Ref<boolean>,
		isTemporary,
		width,
		touchless: toRef(props, 'touchless'),
		position: location
	})

	/*********************************************************
	 * Layout
	 *
	 * @description
	 * Registers the drawer as a layout item. When no OrigamLayout
	 * ancestor exists, `layoutId` is 'origam-layout-orphan' and the
	 * teleport is disabled so the drawer renders inline.
	 ********************************************************/
	const layoutSize = computed(() => {
		// Push gate: if the drawer isn't supposed to push the layout,
		// reserve 0 space so adjacent toolbar / main / footer stay full
		// width regardless of whether the drawer is currently visible.
		if (!isPushing.value) return 0

		const size = isTemporary.value ? 0
				: props.rail && props.expandOnHover ? Number(props.railWidth)
						: width.value

		return isDragging.value ? size * dragProgress.value : size
	})

	// ── Push / clipped resolution ─────────────────────────────────
	//
	// `push`: does the drawer reserve space in the layout grid (push
	//          adjacent toolbar / main / footer) or overlay them?
	//   • explicit prop wins
	//   • else: permanent drawers push, temporary drawers overlay
	//
	// `clipped`: does the drawer slot BELOW the AppBar (and any other
	//            top-anchored layout item) or extend full-height
	//            (covering the AppBar from the left)?
	//   • explicit prop wins
	//   • else: HTML declaration order decides
	//     (AppBar before Drawer → clipped; Drawer before AppBar → full-height)
	//
	// Effective order:
	//   • clipped=true  → bump order to 1 so drawer comes AFTER any
	//                     AppBar registered at order 0
	//   • clipped=false → keep order 0 so drawer comes BEFORE the AppBar
	//   • default (undefined) → 0 + natural HTML order via
	//     `registered.value` insertion (top items at index < drawer index
	//     will register first)
	const isPushing = computed<boolean>(() => {
		// `null` means "not set by consumer" — fall back to heuristic
		// (permanent drawers push, temporary drawers overlay).
		// `true` / `false` is the explicit consumer choice.
		if (props.push === null || props.push === undefined) {
			return !!props.permanent && !props.temporary
		}
		return !!props.push
	})
	const layoutOrder = computed(() => {
		const explicit = int(props.order as string)
		if (Number.isFinite(explicit)) return explicit
		if (props.clipped === true)  return 1
		if (props.clipped === false) return 0
		return 0 // HTML order decides via registered.value insertion
	})

	const {layoutItemStyles, layoutItemScrimStyles, layoutId} = useLayoutItem({
		id: props.name,
		order: layoutOrder,
		position: location,
		layoutSize,
		elementSize: width,
		// `active` controls the VISUAL transform of the drawer (open
		// vs off-screen via translateX(0%) / translateX(-110%)).
		// It must follow `isActive` regardless of push mode — otherwise
		// the inline transform would stick the drawer off-screen even
		// when the consumer is trying to display it. The PUSH gate
		// lives in `layoutSize` above (returns 0 → no layer reservation).
		active: computed(() => isActive.value || isDragging.value) as ComputedRef<boolean>,
		disableTransitions: computed(() => isDragging.value),
		absolute: computed(() =>
				props.absolute || (isSticky.value && typeof isStuck.value !== 'string')
		)
	})

	// `useLayoutItem` falls back to `layoutId: 'origam-layout-orphan'`
	// when no `<OrigamLayout>` ancestor is in the tree (stories, modal
	// previews, tests). The corresponding `#origam-layout-orphan
	// .origam-layout__wrapper` selector doesn't exist in the DOM, so
	// `<teleport :to="…">` silently no-ops and the drawer never mounts.
	// Detect the orphan case and disable the teleport — Vue's
	// `disabled` flag falls back to inline rendering at the declared
	// position, which is what the consumer expects in standalone use.
	const resolvedLayoutId = computed<string>(() => isRef(layoutId) ? layoutId.value : layoutId)
	const isLayoutOrphan = computed(() => resolvedLayoutId.value === 'origam-layout-orphan')
	const teleportDrawer = computed(() => {
		if (isLayoutOrphan.value) return undefined
		return `#${resolvedLayoutId.value} .origam-layout__wrapper`
	})

	const {isStuck, stickyStyles} = useSticky({rootEl, isSticky, layoutItemStyles})

	/*********************************************************
	 * Scrim
	 *
	 * @description
	 * Scrim opacity follows drag progress when dragging.
	 ********************************************************/
	const scrimStyles = computed(() => ({
		...isDragging.value ? {
			opacity: dragProgress.value * 0.2,
			transition: 'none'
		} : undefined,
		...layoutItemScrimStyles.value
	}))

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleClickScrim = () => {
		isActive.value = false
	}

	/*********************************************************
	 * Hover
	 *
	 * @description
	 * Expand-on-hover rail mode toggle.
	 ********************************************************/
	const handleMouseEnter = () => {
		isHovering.value = true
	}
	const handleMouseLeave = () => {
		isHovering.value = false
	}

	/*********************************************************
	 * Slots
	 *
	 * @description
	 * Detects presence of prepend, default (content), and append slots.
	 ********************************************************/
	const hasPrepend = computed(() => {
		return slots.prepend
	})
	const hasContent = computed(() => {
		return slots.default
	})
	const hasAppend = computed(() => {
		return slots.append
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * drawerClasses and drawerStyles computed properties.
	 ********************************************************/
	const drawerStyles = computed(() => {
		return [
			backgroundColorStyles.value,
			roundedStyles.value,
			borderStyles.value,
			paddingStyles.value,
			marginStyles.value,
			layoutItemStyles.value,
			dragStyles.value,
			ssrBootStyles.value,
			stickyStyles.value,
			props.style
		] as StyleValue
	})
	const drawerClasses = computed(() => {
		return [
			'origam-drawer',
			`origam-drawer--${location.value}`,
			{
				'origam-drawer--expand-on-hover': props.expandOnHover,
				'origam-drawer--floating': props.floating,
				'origam-drawer--is-hovering': isHovering.value,
				'origam-drawer--rail': props.rail,
				'origam-drawer--temporary': isTemporary.value,
				'origam-drawer--active': isActive.value,
				'origam-drawer--sticky': isSticky.value
			},
			backgroundColorClasses.value,
			borderClasses.value,
			paddingClasses.value,
			marginClasses.value,
			densityClasses.value,
			elevationClasses.value,
			roundedClasses.value,
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(drawerStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Forwards filterProps to parent components.
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
	.origam-drawer {
		-webkit-overflow-scrolling: touch;

		display: var(--origam-drawer---display);
		flex-direction: var(--origam-drawer---flex-direction);

		height: var(--origam-drawer---height);
		max-width: var(--origam-drawer---max-width);
		width: var(--origam-drawer---width);

		pointer-events: var(--origam-drawer---pointer-events);

		transform: var(--origam-layout---transform);
		transition-duration: var(--origam-drawer---transition-duration);
		transition-property: var(--origam-drawer---transition-property);
		transition-timing-function: var(--origam-drawer---transition-timing-function);

		position: var(--origam-layout---position, var(--origam-drawer---position));
		z-index: var(--origam-layout---zIndex, 1000);

		border-color: var(--origam-drawer---border-color);
		border-style: var(--origam-drawer---border-style);
		border-top-width: var(--origam-drawer---border-top-width, 0);
		border-right-width: var(--origam-drawer---border-right-width, 0);
		border-bottom-width: var(--origam-drawer---border-bottom-width, 0);
		border-left-width: var(--origam-drawer---border-left-width, 0);
		border-start-start-radius: var(--origam-drawer---border-start-start-radius, 0);
		border-start-end-radius: var(--origam-drawer---border-start-end-radius, 0);
		border-end-end-radius: var(--origam-drawer---border-end-end-radius, 0);
		border-end-start-radius: var(--origam-drawer---border-end-start-radius, 0);

		background-color: var(--origam-drawer---background);
		box-shadow: var(--origam-drawer---box-shadow);
		color: var(--origam-drawer---color);

		&--border {
			--origam-drawer---border-top-width: thin;
			--origam-drawer---border-right-width: thin;
			--origam-drawer---border-bottom-width: thin;
			--origam-drawer---border-left-width: thin;
		}

		&--top {
			top: 0;
			--origam-drawer---border-bottom-width: thin;
		}

		&--bottom {
			left: 0;
			--origam-drawer---border-top-width: thin;
		}

		&--left {
			top: 0;
			left: 0;
			right: auto;
			--origam-drawer---border-right-width: thin;
		}

		&--right {
			top: 0;
			left: auto;
			right: 0;
			--origam-drawer---border-left-width: thin;
		}

		&--floating {
			border: none;
		}

		&--temporary {
			--origam-drawer---box-shadow: var(--origam-shadow---lg);
		}

		&--sticky {
			--origam-drawer---height: auto;
			--origam-drawer---transition-property: box-shadow, transform, visibility, width, height, left, right;
		}

		&:deep(.origam-list) {
			overflow: hidden;
		}

		&__content {
			flex: 0 1 auto;
			height: 100%;
			max-width: 100%;
			overflow-x: hidden;
			overflow-y: auto;
		}

		&__img {
			height: 100%;
			left: 0;
			position: absolute;
			top: 0;
			width: 100%;
			z-index: -1;

			img {
				height: inherit;
				object-fit: cover;
				width: inherit;
			}
		}

		&__scrim {
			position: var(--origam-drawer__scrim---position, absolute);
			top: var(--origam-drawer__scrim---position-top, 0);
			left: var(--origam-drawer__scrim---position-left, 0);
			width: var(--origam-drawer__scrim---width, 100%);
			height: var(--origam-drawer__scrim---height, 100%);
			background: var(--origam-drawer__scrim---background, var(--origam-color__overlay---scrim));
			opacity: var(--origam-drawer__scrim---opacity, 0.2);
			transition-property: var(--origam-drawer__scrim---transition-property, opacity);
			transition-duration: var(--origam-drawer__scrim---transition-duration, var(--origam-motion__duration---medium));
			transition-timing-function: var(--origam-drawer__scrim---transition-timing-function, var(--origam-motion__easing---standard));
			z-index: var(--origam-drawer__scrim---z-index, var(--origam-z-index-raised));
		}

		&__prepend,
		&__append {
			flex: none;
			overflow: hidden;
		}
	}
</style>

<!--
	Drawer-specific enter / leave keyframes. GLOBAL (no `scoped`) so
	the Vue transition classes injected by OrigamTransition match.
	Unlike the generic OrigamSlideX (15 px shift + fade), the drawer
	slides the FULL panel width via `translateX(-100 %)` / `100 %`
	so the open / close motion reads as a true slide rather than a
	subtle fade with a hint of movement.

	The four `--{location}-*` selectors handle each docking edge
	(left, right, top, bottom) so the panel always slides AWAY from
	the consumer area regardless of where it docks.
-->
<style lang="scss">
	// `!important` is mandatory: useLayoutItem emits an inline
	// `transform: translateX(0%)` on the drawer root (it manages the
	// open / close translation itself via active.value). Inline styles
	// beat CSS rules unless the rule is `!important`. Without it, the
	// keyframe transforms below are stomped → drawer never animates
	// visibly.

	@media (prefers-reduced-motion: reduce) {
		.origam-transition--drawer-enter-active,
		.origam-transition--drawer-leave-active {
			transition-duration: 0.01ms !important;
		}
	}

	.origam-transition--drawer {
		&-enter-active,
		&-leave-active {
			transition-property: transform !important;
			transition-duration: 0.25s !important;
			transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
		}

		// Default (left) — slide out to the left.
		&-enter-from,
		&-leave-to {
			transform: translateX(-100%) !important;
		}
	}

	// Right drawer slides out to the right.
	.origam-drawer--right.origam-transition--drawer-enter-from,
	.origam-drawer--right.origam-transition--drawer-leave-to {
		transform: translateX(100%) !important;
	}

	// Top drawer slides up out of view.
	.origam-drawer--top.origam-transition--drawer-enter-from,
	.origam-drawer--top.origam-transition--drawer-leave-to {
		transform: translateY(-100%) !important;
	}

	// Bottom drawer slides down out of view.
	.origam-drawer--bottom.origam-transition--drawer-enter-from,
	.origam-drawer--bottom.origam-transition--drawer-leave-to {
		transform: translateY(100%) !important;
	}

	// ── Generic-transition overrides scoped to the drawer ────────────
	//
	// OrigamSlideX / OrigamSlideY / OrigamFade are generic transitions
	// used across the design system. Their keyframe transforms have NO
	// `!important`, so when applied to the drawer they get stomped by
	// useLayoutItem's inline `transform: translateX(0%)` — the result
	// is that the consumer sees only the opacity portion of the
	// keyframe (a fade) instead of the intended slide. Override
	// per-transition on the `.origam-drawer` selector so the transforms
	// win without affecting the same transition used on other
	// components.

	// slide-x: full panel width, location-aware.
	.origam-drawer.origam-transition--slide-x-enter-from,
	.origam-drawer.origam-transition--slide-x-leave-to {
		transform: translateX(-100%) !important;
		opacity: 0 !important;
	}
	.origam-drawer--right.origam-transition--slide-x-enter-from,
	.origam-drawer--right.origam-transition--slide-x-leave-to {
		transform: translateX(100%) !important;
	}

	// slide-y: full panel height, location-aware.
	.origam-drawer.origam-transition--slide-y-enter-from,
	.origam-drawer.origam-transition--slide-y-leave-to {
		transform: translateY(-100%) !important;
		opacity: 0 !important;
	}
	.origam-drawer--bottom.origam-transition--slide-y-enter-from,
	.origam-drawer--bottom.origam-transition--slide-y-leave-to {
		transform: translateY(100%) !important;
	}

	// fade: opacity-only, no transform. The drawer's inline transform
	// stays at `translateX(0%)` throughout — only the alpha animates.
	.origam-drawer.origam-transition--fade-enter-from,
	.origam-drawer.origam-transition--fade-leave-to {
		opacity: 0 !important;
	}
</style>


