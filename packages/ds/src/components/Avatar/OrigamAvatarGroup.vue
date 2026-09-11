<template>
	<component
			:is="tag"
			v-click-outside="clickOutsideArgs"
			:class="avatarGroupClasses"
			:style="avatarGroupStyles"
			role="group"
			@click="handleClick"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
	>
		<origam-defaults-provider :defaults="slotDefaults">
			<template
					v-for="(item, index) in displayItems"
					:key="index"
			>
				<slot
						name="avatar"
						v-bind="{item, index}"
				>
					<origam-avatar
							:id="`avatar-${index}`"
							class="origam-avatar-group__item"
							v-bind="avatarProps(item)"
					/>
				</slot>
			</template>

			<template v-if="restItems.length">
				<slot
						name="rest"
						v-bind="{rest: restItems, length: restItems.length}"
				>
					<origam-avatar
							class="origam-avatar-group__rest"
							v-bind="avatarProps()"
					>
						<template #default>
							<slot name="default">
								+{{ restItems.length }}
							</slot>
						</template>
					</origam-avatar>
				</slot>
			</template>
		</origam-defaults-provider>
	</component>
</template>

<script
		lang="ts"
		setup
>

	import { OrigamAvatar, OrigamDefaultsProvider } from "../../components"
	import { useActive, useDensity, useHover, usePassedProps, useProps, useRtl, useStateEffect, useStyle } from "../../composables"
	import { vClickOutside } from "../../directives"
	import { DIRECTION } from "../../enums"
	import type { IAvatarGroupProps, IAvatarProps} from "../../interfaces"

	import type { IAvatarGroupEmits } from '../../interfaces/Avatar/avatar-group.interface'
	import { omitUndefined } from "../../utils"

	import type { ComputedRef, StyleValue, VNodeProps } from 'vue'
	import { computed, mergeProps, ref } from "vue"

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and slot defaults propagation to
	 * child avatars via OrigamDefaultsProvider.
	 ********************************************************/
	const props = withDefaults(defineProps<IAvatarGroupProps>(), {
		items: () => [],
		max: 5,
		tag: 'div',
		direction: DIRECTION.HORIZONTAL
	})

	// Push visual-token props down to every descendant `<origam-avatar>` as
	// DEFAULTS — children that pass their own props still win.
	//
	// A prop the CONSUMER never passed to `<origam-avatar-group>` must NOT be
	// forwarded — else `mergeDeep` (used by `provideDefaults`/`useDefaults`
	// to combine this map with an ancestor/theme `'origam-avatar'` defaults
	// entry) copies it unconditionally and silently overwrites the theme
	// default (e.g. `origam-avatar { border: true }`) — see #263.
	//
	// A plain `omitUndefined` is NOT enough: `border`/`rounded` are typed
	// `boolean | …`, so Vue resolves an UNSET prop to the concrete value
	// `false` (its boolean-prop coercion), never to `undefined` — there is
	// no `undefined` left to filter. `usePassedProps` reads `vnode.props`
	// directly, so it tells the truth regardless of Vue's coercion.
	const wasPropPassed = usePassedProps(props)
	const slotDefaults = computed(() => ({
		'origam-avatar': omitUndefined({
			density: wasPropPassed('density') ? props.density : undefined,
			size: wasPropPassed('size') ? props.size : undefined,
			color: wasPropPassed('color') ? props.color : undefined,
			bgColor: wasPropPassed('bgColor') ? props.bgColor : undefined,
			rounded: wasPropPassed('rounded') ? props.rounded : undefined,
			elevation: wasPropPassed('elevation') ? props.elevation : undefined,
			border: wasPropPassed('border') ? props.border : undefined,
			borderColor: wasPropPassed('borderColor') ? props.borderColor : undefined,
			borderStyle: wasPropPassed('borderStyle') ? props.borderStyle : undefined
		})
	}))

	defineEmits<IAvatarGroupEmits>()

	const {filterProps} = useProps<IAvatarGroupProps>(props)

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {isRtl} = useRtl()

	/*********************************************************
	 * Group items
	 *
	 * @description
	 * Computes which items to display and which overflow
	 * into the rest (+N) chip based on the `max` prop.
	 *
	 * `isExpanded` is the orthogonal toggle driven by
	 * `expandOnHover` / `expandOnClick` — when true the visible
	 * list shows EVERY item (effectiveMax = items.length). The
	 * earlier implementation used a `ref(props.max)` which froze
	 * the value at mount and never re-tracked the prop — user
	 * report: "la prop max ne fonctionne pas".
	 ********************************************************/
	const isExpanded = ref(false)
	const effectiveMax = computed(() => {
		return isExpanded.value ? props.items.length : props.max
	})

	const restItems = computed(() => {
		if (props.items.length > effectiveMax.value) {
			return props.items.slice(effectiveMax.value - 1, props.items.length)
		}

		return []
	})
	const displayItems = computed(() => {
		if (props.items.length > effectiveMax.value) {
			return props.items.slice(0, effectiveMax.value - 1)
		}

		if (props.items.length === effectiveMax.value) {
			return props.items.slice(0, effectiveMax.value)
		}

		return props.items
	})

	/*********************************************************
	 * Effect
	 *
	 * @description
	 * Hover / active state with optional expand-on-hover and
	 * expand-on-click behaviour.
	 ********************************************************/
	const {hoverClasses, hoverState, isHover, onMouseleave, onMouseenter} = useHover(props)
	const {activeClasses, activeState, isActive, onActive} = useActive(props)

	// Avatars inherit the group's density / size / color / bgColor through the
	// `<origam-defaults-provider :defaults="slotDefaults">` wrapper, so we must
	// NOT re-derive them here by reading the children's own refs: doing so read
	// `origamAvatarRef` during the parent render to build the children's props,
	// which (because `filterProps` returns a fresh object every call) retriggered
	// the render endlessly — "Maximum recursive updates in OrigamDefaultsProvider".
	// Forward the group's hover / active STATE — not just a boolean — to every
	// child avatar, so the group's interaction (or a forced hover / active
	// prop) actually changes each avatar's surface. A configured state object
	// (e.g. `{ bgColor: 'success' }`) is forwarded with `enabled` synced to the
	// group's live hover / active, so it switches the avatars on group hover /
	// click and reverts on leave; a bare boolean is forwarded as-is.
	const forwardState = (state: unknown, isOn: boolean) => {
		return state && typeof state === 'object'
			? {...(state as Record<string, unknown>), enabled: isOn}
			: isOn
	}
	const avatarProps = (item: IAvatarProps = {}) => {
		return mergeProps(item as VNodeProps, {
			hover: forwardState(props.hover, isHover.value),
			active: forwardState(props.active, isActive.value)
		} as VNodeProps)
	}

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleMouseEnter = () => {
		if (props.expandOnHover) {
			isExpanded.value = true
		}

		onMouseenter()
	}
	const handleMouseLeave = () => {
		if (props.expandOnHover) {
			isExpanded.value = false
		}

		onMouseleave()
	}

	const handleClick = () => {
		if (props.expandOnClick) {
			isExpanded.value = !isActive.value
		}

		onActive()
	}

	// Click-to-expand groups collapse when the pointer lands outside the group.
	// `closeConditional` gates the handler so it only fires while expand-on-click
	// is active AND the group is currently open.
	const handleClickOutside = () => {
		isExpanded.value = false

		if (isActive.value) {
			onActive()
		}
	}
	const clickOutsideArgs = {
		handler: handleClickOutside,
		closeConditional: () => Boolean(props.expandOnClick) && isActive.value
	}

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Composes direction, RTL, hover/active, density and
	 * spacing classes/styles onto the root element.
	 ********************************************************/
	const {
		marginClasses, marginStyles,
		paddingClasses, paddingStyles,
	} = useStateEffect(props, isHover, isActive as unknown as ComputedRef<boolean>, hoverState, activeState)
	const {densityClasses} = useDensity(props)

	const avatarGroupStyles = computed(() => {
		return [
			marginStyles.value,
			paddingStyles.value,
			props.style
		] as StyleValue
	})
	const avatarGroupClasses = computed(() => {
		return [
			'origam-avatar-group',
			`origam-avatar-group--${props.direction}`,
			{
				'origam-avatar-group--expand-on-hover': props.expandOnHover,
				'origam-avatar-group--expand-on-click': props.expandOnClick,
				'origam-avatar-group--rtl': isRtl
			},
			hoverClasses.value,
			activeClasses.value,
			marginClasses.value,
			paddingClasses.value,
			densityClasses.value,
			props.class
		]
	})

	const {id, css, load, isLoaded, unload} = useStyle(avatarGroupStyles)

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
	.origam-avatar-group {
		$this: &;

		position: var(--origam-avatar-group---position);

		flex-wrap: nowrap;
		display: inline-flex;
		flex-direction: var(--origam-avatar-group---flex-direction);

		padding-block-start: var(--origam-avatar-group---padding-block-start);
		padding-block-end: var(--origam-avatar-group---padding-block-end);
		padding-inline-start: var(--origam-avatar-group---padding-inline-start);
		padding-inline-end: var(--origam-avatar-group---padding-inline-end);
		margin-block-start: var(--origam-avatar-group---margin-block-start);
		margin-block-end: var(--origam-avatar-group---margin-block-end);
		margin-inline-start: var(--origam-avatar-group---margin-inline-start);
		margin-inline-end: var(--origam-avatar-group---margin-inline-end);

		&__item {
			margin-block-start: var(--origam-avatar-group__item---margin-block-start);
			margin-block-end: var(--origam-avatar-group__item---margin-block-end);
			margin-inline-start: var(--origam-avatar-group__item---margin-inline-start);
			margin-inline-end: var(--origam-avatar-group__item---margin-inline-end);
		}

		// Separation ring — a STRUCTURAL concern of the group (overlapping
		// avatars need a visible seam to stay legible), orthogonal to each
		// avatar's own themed `box-shadow` (elevation / cartoon hard-shadow
		// signature / …). `outline` is used on purpose instead of layering
		// a second `box-shadow`: it is a distinct CSS property, so it can
		// never collide with, or need to be comma-combined with, the
		// avatar's own `--origam-avatar---box-shadow` — the two coexist
		// without any specificity/ordering trick. Applies to every stacked
		// avatar (`__item`) AND the "+N" overflow chip (`__rest`), since
		// both participate in the same overlapping stack — see #263.
		&__item,
		&__rest {
			outline-color: var(--origam-avatar-group__item---outline-color);
			outline-style: var(--origam-avatar-group__item---outline-style);
			outline-width: var(--origam-avatar-group__item---outline-width);
		}

		&--expand-on-hover,
		&--expand-on-click {
			#{$this}__item:not(:first-child),
			#{$this}__rest:not(:first-child) {
				transition-property: var(--origam-avatar-group__avatar---transition-property, margin);
				transition-duration: var(--origam-avatar-group__avatar---transition-duration, 200ms);
				transition-timing-function: var(--origam-avatar-group__avatar---transition-timing-function, cubic-bezier(0.4, 0, 0.2, 1));
			}
		}

		&--expand-on-click {
			cursor: pointer;
		}

		&--elevated {
			box-shadow: var(--origam-avatar-group---box-shadow-elevated, var(--origam-shadow---md));
		}

		&--density-compact {
			--origam-avatar-group---density: -6px;
		}

		&--density-default {
			--origam-avatar-group---density: 0px;
		}

		&--density-comfortable {
			--origam-avatar-group---density: 10px;
		}

		&--horizontal {
			flex-direction: row;

			#{$this}__item:not(:first-child),
			#{$this}__rest:not(:first-child) {
				margin-inline-start: calc(-18px + var(--origam-avatar-group---density, 0px));
			}

			&#{$this}--expand-on-hover:hover #{$this}__item:not(:first-child),
			&#{$this}--expand-on-hover:hover #{$this}__rest:not(:first-child),
			&#{$this}--expand-on-click#{$this}--active #{$this}__item:not(:first-child),
			&#{$this}--expand-on-click#{$this}--active #{$this}__rest:not(:first-child) {
				margin-inline-start: 0;
			}
		}

		&--vertical {
			flex-direction: column;

			#{$this}__item:not(:first-child),
			#{$this}__rest:not(:first-child) {
				margin-block-start: calc(-18px + var(--origam-avatar-group---density, 0px));
			}

			&#{$this}--expand-on-hover:hover #{$this}__item:not(:first-child),
			&#{$this}--expand-on-hover:hover #{$this}__rest:not(:first-child),
			&#{$this}--expand-on-click#{$this}--active #{$this}__item:not(:first-child),
			&#{$this}--expand-on-click#{$this}--active #{$this}__rest:not(:first-child) {
				margin-block-start: 0;
			}
		}

	}
</style>

