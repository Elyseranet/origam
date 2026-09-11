<template>
	<template v-if="renderless">
		<div
				ref="markerRef"
				:style="{ 'padding-top': convertToUnit(paddingTop) }"
				class="origam-virtual-scroll__spacer"
		/>

		<template
				v-for="(item, index) in computedItems"
				:key="index"
		>
			<origam-virtual-scroll-item
					:renderless="renderless"
					class="origam-virtual-scroll__item"
					@update:height="handleItemResize(index, $event)"
			>
				<template #renderless="{itemRef}">
					<slot
							:name="`item.renderless.${item.index}`"
							v-bind="{ item: item.raw, itemRef }"
					>
						<slot
								name="item.renderless"
								v-bind="{ item: item.raw, index: item.index, itemRef }"
						/>
					</slot>
				</template>
			</origam-virtual-scroll-item>
		</template>

		<div
				class="origam-virtual-scroll__spacer"
				style="{ 'padding-bottom': convertToUnit(paddingBottom) }"
		/>
	</template>
	<template v-else>
		<div
				ref="containerRef"
				:class="virtualScrollClasses"
				:style="virtualScrollStyles"
				@scrollend="handleScrollend"
				@scroll-passive="handleScroll"
		>
			<div
					ref="markerRef"
					:style="{
              'padding-top': convertToUnit(paddingTop),
              'padding-bottom': convertToUnit(paddingBottom),
            }"
					class="origam-virtual-scroll__container"
			>
				<template
						v-for="(item, index) in computedItems"
						:key="index"
				>
					<origam-virtual-scroll-item
							:renderless="renderless"
							class="origam-virtual-scroll__item"
							@update:height="handleItemResize(index, $event)"
					>
						<template #default>
							<slot
									:name="`item.${item.index}`"
									v-bind="{ item: item.raw }"
							>
								<slot
										name="item"
										v-bind="{ item: item.raw, index: item.index }"
								/>
							</slot>
						</template>
					</origam-virtual-scroll-item>
				</template>
			</div>
		</div>
	</template>
</template>

<script
		lang="ts"
		setup
>
	import { computed, onMounted, onScopeDispose, Ref, StyleValue, toRef } from 'vue'
	import { OrigamVirtualScrollItem } from '../../components'

	import {
	useDimension,
	useProps,
	useStyle,
	useToggleScope,
	useVirtual
} from '../../composables'

	import type { IVirtualScrollProps } from '../../interfaces'

	import { convertToUnit, getCurrentInstance, getScrollParent } from '../../utils'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * Props with defaults and filterProps utility.
	 ********************************************************/
	const props = withDefaults(defineProps<IVirtualScrollProps>(), {})

	const {filterProps} = useProps<IVirtualScrollProps>(props)

	/*********************************************************
	 * Virtual scroll engine
	 *
	 * @description
	 * Core useVirtual composable that manages the visible item
	 * window, padding spacers, and item resize callbacks.
	 * In renderless mode, scroll listeners attach to the
	 * nearest scrollable ancestor instead of an inner div.
	 ********************************************************/
	const vm = getCurrentInstance('OrigamVirtualScroll')

	/*********************************************************
	 * Composables
	 ********************************************************/

	const {dimensionStyles} = useDimension(props)
	const {
		containerRef,
		markerRef,
		handleScroll,
		handleScrollend,
		handleItemResize,
		scrollToIndex,
		paddingTop,
		paddingBottom,
		computedItems
	} = useVirtual(props, toRef(props, 'items') as Ref<readonly any[]>)

	useToggleScope(() => props.renderless, () => {
		function handleListeners (add = false) {
			const method = add ? 'addEventListener' : 'removeEventListener'

			if (containerRef.value === document.documentElement) {
				document[method]('scroll', handleScroll, {passive: true})
				document[method]('scrollend', handleScrollend)
			} else {
				containerRef.value?.[method]('scroll', handleScroll, {passive: true})
				containerRef.value?.[method]('scrollend', handleScrollend)
			}
		}

		onMounted(() => {
			containerRef.value = getScrollParent(vm.vnode.el as HTMLElement, true)
			handleListeners(true)
		})

		onScopeDispose(handleListeners)
	})

	/*********************************************************
	 * Class & Style
	 *
	 * @description
	 * Root element classes and styles (non-renderless mode).
	 ********************************************************/
	const virtualScrollStyles = computed(() => {
		return [
			dimensionStyles.value,
			props.style
		] as StyleValue
	})
	const virtualScrollClasses = computed(() => {
		return [
			'origam-virtual-scroll',
			props.class
		]
	})
	const {id, css, load, isLoaded, unload} = useStyle(virtualScrollStyles)


	/*********************************************************
	 * Expose
	 *
	 * @description
	 * Public API surface exposed to parent refs.
	 ********************************************************/
	defineExpose({
		scrollToIndex,
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
	.origam-virtual-scroll {
		overflow-y: auto;
		scroll-padding: var(--origam-virtual-scroll---scroll-padding, 0px);

		&__container {
			position: relative;
		}

		&__item {
			transition-duration: var(--origam-virtual-scroll---transition-duration, 100ms);
			transition-timing-function: var(--origam-virtual-scroll---transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
		}

		&__spacer {
			display: block;
		}
	}
</style>
