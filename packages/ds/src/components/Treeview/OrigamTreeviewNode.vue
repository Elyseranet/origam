<template>
	<div
			:class="nodeWrapperClasses"
			role="none"
	>
		<div
				:class="rowClasses"
				:style="rowStyles"
				role="treeitem"
				:aria-expanded="hasChildren ? isNodeExpanded : undefined"
				:aria-selected="isSelectable ? isNodeSelected : undefined"
				:aria-disabled="node.disabled || undefined"
				:aria-label="node.label"
				:tabindex="node.disabled ? -1 : 0"
				:data-cy="`treeview-row-${node.id}`"
				@click="handleRowClick"
				@keydown="handleKeydown"
		>
			<template v-if="depth > 0 && treeview?.showLines.value">
				<span
						v-for="level in depth"
						:key="level"
						class="origam-treeview-node__guide"
						aria-hidden="true"
				/>
			</template>

			<span
					:class="chevronClasses"
					aria-hidden="true"
					@click.stop="handleChevronClick"
			>
				<template v-if="hasChildren">
					&#8250;
				</template>
			</span>

			<span
					v-if="node.icon || hasChildren"
					class="origam-treeview-node__icon"
					aria-hidden="true"
			>
				<template v-if="node.icon">{{ node.icon }}</template>
				<template v-else-if="hasChildren">
					{{ isNodeExpanded ? '📂' : '📁' }}
				</template>
				<template v-else>📄</template>
			</span>

			<span class="origam-treeview-node__label">{{ node.label }}</span>

			<span
					v-if="node.size"
					class="origam-treeview-node__size"
			>{{ node.size }}</span>
		</div>

		<slot
				name="node"
				:node="node"
				:depth="depth"
				:is-expanded="isNodeExpanded"
				:is-selected="isNodeSelected"
		/>

		<div
				v-if="isNodeExpanded && hasChildren"
				class="origam-treeview-node__children"
				role="group"
				:aria-label="`${node.label} contents`"
		>
			<origam-treeview-node
					v-for="child in node.children"
					:key="child.id"
					:node="child"
					:depth="(depth ?? 0) + 1"
					:data-cy="`treeview-node-${child.id}`"
			>
				<template
						v-if="hasNodeSlot"
						#node="slotProps"
				>
					<slot
							name="node"
							v-bind="slotProps"
					/>
				</template>
			</origam-treeview-node>
		</div>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import { computed, inject, useSlots } from 'vue'
	import type { StyleValue } from 'vue'

	import { ORIGAM_TREEVIEW_KEY } from '../../consts'
	import {
	useProps,
	useStyle
} from '../../composables'

	import type { ITreeviewNode, ITreeviewNodeProps } from '../../interfaces'

	defineOptions({ name: 'OrigamTreeviewNode' })

	defineSlots<{
		node(props: { node: ITreeviewNode; depth: number; isExpanded: boolean; isSelected: boolean }): unknown
	}>()

	/*********************************************************
	 * Global
	 ********************************************************/

	const props = withDefaults(defineProps<ITreeviewNodeProps>(), {
		depth: 0
	})

	const { filterProps } = useProps<ITreeviewNodeProps>(props)

	const slots = useSlots()
	const hasNodeSlot = computed(() => !!slots.node)

	// Inject treeview context — always provided by OrigamTreeview wrapper
	const treeview = inject(ORIGAM_TREEVIEW_KEY)

	const hasChildren = computed(() => {
		if (props.node.expandable !== undefined) return props.node.expandable
		return !!(props.node.children && props.node.children.length > 0)
	})

	const isLeaf = computed(() => !hasChildren.value)

	const isSelectable = computed(() => {
		if (props.node.disabled) return false
		const mode = treeview?.selectMode.value ?? 'none'
		if (mode === 'none') return false
		const selectableNodes = treeview?.selectableNodes.value ?? 'leaf'
		if (selectableNodes === 'leaf') return isLeaf.value
		return true
	})

	const isNodeExpanded = computed(() => treeview?.isExpanded(props.node.id) ?? false)
	const isNodeSelected = computed(() => treeview?.isSelected(props.node.id) ?? false)

	/*********************************************************
	 * Event handlers
	 ********************************************************/

	const handleChevronClick = () => {
		if (!hasChildren.value || props.node.disabled) return
		treeview?.toggleExpanded(props.node.id)
	}

	const handleRowClick = () => {
		if (props.node.disabled) return

		// expandOnClick: row click toggles expansion
		if (treeview?.expandOnClick.value === true && hasChildren.value) {
			treeview.toggleExpanded(props.node.id)
		}

		// Selection
		if (isSelectable.value) {
			treeview?.toggleSelected(props.node.id)
		}
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (props.node.disabled) return

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
			if (isSelectable.value) {
				treeview?.toggleSelected(props.node.id)
			} else if (hasChildren.value) {
				treeview?.toggleExpanded(props.node.id)
			}
		} else if (e.key === 'ArrowRight') {
			e.preventDefault()
			if (hasChildren.value && !isNodeExpanded.value) {
				treeview?.toggleExpanded(props.node.id)
			} else if (hasChildren.value && isNodeExpanded.value) {
				// Move focus to first child
				const row = (e.currentTarget as HTMLElement)
					.closest('.origam-treeview-node')
					?.querySelector<HTMLElement>('.origam-treeview-node__children [role="treeitem"]')
				row?.focus()
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault()
			if (hasChildren.value && isNodeExpanded.value) {
				treeview?.toggleExpanded(props.node.id)
			} else {
				// Move focus to parent treeitem
				const parentChildren = (e.currentTarget as HTMLElement)
					.closest('.origam-treeview-node__children')
				if (parentChildren) {
					const parentNode = parentChildren.closest('.origam-treeview-node')
					const parentRow = parentNode?.querySelector<HTMLElement>(':scope > [role="treeitem"]')
					parentRow?.focus()
				}
			}
		}
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const nodeWrapperClasses = computed(() => [
		'origam-treeview-node',
		{
			'origam-treeview-node--expanded': isNodeExpanded.value,
			'origam-treeview-node--selected': isNodeSelected.value,
			'origam-treeview-node--disabled': props.node.disabled
		},
		props.class
	])

	const rowClasses = computed(() => [
		'origam-treeview-node__row',
		{
			'origam-treeview-node__row--selected': isNodeSelected.value,
			'origam-treeview-node__row--disabled': props.node.disabled,
			'origam-treeview-node__row--selectable': isSelectable.value
		}
	])

	const chevronClasses = computed(() => [
		'origam-treeview-node__chevron',
		{
			'origam-treeview-node__chevron--expanded': isNodeExpanded.value,
			'origam-treeview-node__chevron--hidden': !hasChildren.value
		}
	])

	const rowStyles = computed(() => {
		const d = props.depth ?? 0
		return [
			{
				paddingInlineStart: `calc(var(--origam-treeview---indent-size, 16px) * ${d} + var(--origam-treeview---row-padding-inline, 8px))`
			}
		] as StyleValue
	})
	const {id, css, load, isLoaded, unload} = useStyle(rowStyles)


	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({
		filterProps,
		isNodeExpanded,
		isNodeSelected,
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
	.origam-treeview-node {
		display: flex;
		flex-direction: column;

		&__row {
			display: flex;
			align-items: center;
			gap: 6px;
			min-height: var(--origam-treeview---row-height, 32px);
			padding-inline-end: var(--origam-treeview---row-padding-inline, 8px);
			border-radius: var(--origam-radius---sm, 4px);
			cursor: pointer;
			outline: none;
			transition: background-color 150ms ease;
			user-select: none;
			box-sizing: border-box;
			width: 100%;

			&:hover:not(.origam-treeview-node__row--disabled) {
				background-color: var(--origam-treeview---row-bg-hover, var(--origam-color__surface---overlay));
			}

			&:focus-visible {
				outline: 2px solid var(--origam-color__border---focus);
				outline-offset: -2px;
			}

			&--selected {
				background-color: var(--origam-treeview---row-bg-selected, var(--origam-color__action--primary---bgSubtle));
				color: var(--origam-treeview---row-color-selected, var(--origam-color__action--primary---fgSubtle));

				.origam-treeview-node__label {
					color: var(--origam-treeview---row-color-selected, var(--origam-color__action--primary---fgSubtle));
				}
			}

			&--disabled {
				color: var(--origam-treeview---row-color-disabled, var(--origam-color__text---disabled));
				cursor: not-allowed;
				pointer-events: none;

				.origam-treeview-node__label {
					color: var(--origam-treeview---row-color-disabled, var(--origam-color__text---disabled));
				}
			}
		}

		&__guide {
			display: inline-block;
			flex-shrink: 0;
			align-self: stretch;
			background-color: var(--origam-treeview---guide-color, var(--origam-color__border---subtle));
			width: var(--origam-treeview---guide-thickness, 1px);
			margin-inline-end: calc(var(--origam-treeview---indent-size, 16px) - var(--origam-treeview---guide-thickness, 1px));
		}

		&__chevron {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: var(--origam-treeview---chevron-size, 16px);
			height: var(--origam-treeview---chevron-size, 16px);
			color: var(--origam-treeview---chevron-color, var(--origam-color__text---secondary));
			font-size: 14px;
			line-height: 1;
			transform: rotate(0deg);
			transition: transform 200ms ease;

			&--expanded {
				transform: rotate(90deg);
			}

			&--hidden {
				visibility: hidden;
			}
		}

		&__icon {
			display: inline-flex;
			align-items: center;
			flex-shrink: 0;
			font-size: var(--origam-treeview---icon-size, 16px);
			color: var(--origam-treeview---icon-color, var(--origam-color__text---primary));
		}

		&__label {
			flex: 1;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			font-size: var(--origam-treeview---label-font-size, 0.75rem);
			color: var(--origam-treeview---label-color, var(--origam-color__text---primary));
		}

		&__size {
			flex-shrink: 0;
			font-size: var(--origam-treeview---size-font-size, 0.625rem);
			color: var(--origam-treeview---size-color, var(--origam-color__text---secondary));
		}

		&__children {
			display: flex;
			flex-direction: column;
		}
	}
</style>
