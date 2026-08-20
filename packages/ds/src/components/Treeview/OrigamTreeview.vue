<template>
	<div
			:id="id"
			:class="treeviewClasses"
			:style="treeviewStyles"
			role="tree"
			:aria-label="ariaLabel || 'File tree'"
			:aria-multiselectable="selectMode === TREEVIEW_SELECT_MODE.MULTIPLE || undefined"
			@keydown="handleKeydown"
	>
		<origam-treeview-node
				v-for="node in items"
				:key="node.id"
				:node="node"
				:depth="0"
				:data-cy="`treeview-node-${node.id}`"
		/>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, provide, ref, watch } from 'vue'
	import type { StyleValue } from 'vue'

	import OrigamTreeviewNode from './OrigamTreeviewNode.vue'
	import { ORIGAM_TREEVIEW_KEY } from '../../consts/Treeview/treeview.const'
	import { DENSITY } from '../../enums/Commons/density.enum'
	import { SIZES } from '../../enums/Commons/size.enum'
	import { TREEVIEW_SELECT_MODE, TREEVIEW_SELECTABLE_NODES } from '../../enums/Treeview/treeview.enum'
	import { useDensity } from '../../composables/Commons/density.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useSize } from '../../composables/Commons/size.composable'
	import { useStateEffect } from '../../composables/Commons/stateEffect.composable'
	import { useStyle } from '../../composables/Commons/style.composable'

	import type { ITreeviewEmits, ITreeviewProps } from '../../interfaces/Treeview/treeview.interface'

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ITreeviewProps>(), {
		selectMode: 'none',
		selectableNodes: 'leaf',
		showLines: true,
		expandOnClick: false,
		density: DENSITY.DEFAULT,
		size: SIZES.DEFAULT,
		ariaLabel: undefined
	})

	const emit = defineEmits<ITreeviewEmits>()

	const { filterProps } = useProps<ITreeviewProps>(props)

	// Expanded set — source of truth
	const expandedSet = ref<Set<string>>(new Set(props.expandedValue ?? []))

	watch(
		() => props.expandedValue,
		(val) => {
			if (val) {
				expandedSet.value = new Set(val)
			}
		}
	)

	// Selected set — source of truth
	const toSelectedSet = (v: string[] | string | undefined): Set<string> => {
		if (!v) return new Set()
		if (Array.isArray(v)) return new Set(v)
		return new Set([v])
	}

	const selectedSet = ref<Set<string>>(toSelectedSet(props.modelValue))

	watch(
		() => props.modelValue,
		(val) => {
			selectedSet.value = toSelectedSet(val)
		}
	)

	const toggleExpanded = (id: string) => {
		const next = new Set(expandedSet.value)
		const nowExpanded = !next.has(id)
		if (nowExpanded) {
			next.add(id)
		} else {
			next.delete(id)
		}
		expandedSet.value = next
		emit('update:expandedValue', Array.from(next))
		emit('toggle', id, nowExpanded)
	}

	const toggleSelected = (id: string) => {
		const mode = props.selectMode
		if (mode === TREEVIEW_SELECT_MODE.NONE) return

		const next = new Set(selectedSet.value)

		if (mode === TREEVIEW_SELECT_MODE.SINGLE) {
			if (next.has(id)) {
				next.clear()
			} else {
				next.clear()
				next.add(id)
			}
			selectedSet.value = next
			emit('update:modelValue', next.size === 1 ? Array.from(next)[0] : '')
		} else {
			// multiple
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			selectedSet.value = next
			emit('update:modelValue', Array.from(next))
		}

		emit('select', id)
	}

	const isExpanded = (id: string) => expandedSet.value.has(id)
	const isSelected = (id: string) => selectedSet.value.has(id)

	// Provide context to all descendant nodes
	provide(ORIGAM_TREEVIEW_KEY, {
		toggleExpanded,
		toggleSelected,
		isExpanded,
		isSelected,
		selectMode: computed(() => props.selectMode ?? TREEVIEW_SELECT_MODE.NONE),
		selectableNodes: computed(() => props.selectableNodes ?? TREEVIEW_SELECTABLE_NODES.LEAF),
		showLines: computed(() => props.showLines !== false),
		expandOnClick: computed(() => props.expandOnClick === true),
		color: computed(() => {
			const c = props.color
			return typeof c === 'string' ? c : undefined
		})
	})

	// Keyboard navigation: collect all currently visible rows and move focus

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleKeydown = (e: KeyboardEvent) => {
		const tree = e.currentTarget as HTMLElement
		const rows = Array.from(
			tree.querySelectorAll<HTMLElement>('[role="treeitem"]:not([aria-disabled="true"])')
		)
		const focused = document.activeElement
		const idx = rows.findIndex((r) => r === focused || r.contains(focused as Node))

		if (e.key === 'ArrowDown') {
			e.preventDefault()
			rows[Math.min(idx + 1, rows.length - 1)]?.focus()
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			rows[Math.max(idx - 1, 0)]?.focus()
		}
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	// Phase 3 (Vague D) — class-first companion alongside inline styles.
	/*********************************************************
	 * Composables
	 ********************************************************/

	const { colorClasses, colorStyles } = useStateEffect(props)
	const { densityClasses } = useDensity(props)
	const { sizeClasses } = useSize(props)

	const treeviewStyles = computed(() => {
		return [colorStyles.value, props.style] as StyleValue
	})

	const treeviewClasses = computed(() => [
		'origam-treeview',
		colorClasses.value,
		densityClasses.value,
		sizeClasses.value,
		props.class
	])
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
	const {id, css, load, isLoaded, unload} = useStyle(treeviewStyles, () => props.id)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		isExpanded,
		isSelected,
		toggleExpanded,
		toggleSelected,
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
	.origam-treeview {
		background-color: var(--origam-treeview---background-color, var(--origam-color__surface---default));
		color: var(--origam-treeview---color, var(--origam-color__text---primary));
		padding-block: var(--origam-treeview---padding-block, 4px);
		padding-inline: var(--origam-treeview---padding-inline, 8px);
		outline: none;
		width: 100%;
		box-sizing: border-box;

		&:focus-within {
			outline: none;
		}

		&--size-x-small {
			--origam-treeview---label-font-size: var(--origam-font__size---xs, 0.625rem);
		}

		&--size-small {
			--origam-treeview---label-font-size: var(--origam-font__size---sm, 0.75rem);
		}

		&--size-large {
			--origam-treeview---row-height: 40px;
		}

		&--size-x-large {
			--origam-treeview---row-height: 48px;
		}

		&--density-compact {
			--origam-treeview---row-height: 24px;
			--origam-treeview---padding-block: 2px;
		}

		&--density-comfortable {
			--origam-treeview---row-height: 40px;
			--origam-treeview---padding-block: 6px;
		}
	}
</style>
