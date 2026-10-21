<template>
	<component
			:is="tag"
			:id="id"
			:class="groupClasses"
			:style="groupStyles"
	>
		<origam-tabs
				v-model="model"
				class="origam-code-group__tabs"
				variant="underline"
				:aria-label="tabsLabel"
				data-cy="origam-code-group-tabs"
		>
			<origam-tab
					v-for="item in getItems()"
					:key="item.value"
					:value="item.value"
					:text="item.label"
			/>
		</origam-tabs>

		<slot
				v-if="copyable"
				name="copy"
				:copy="handleCopy"
				:copied="copied"
		>
			<origam-btn
					variant="text"
					class="origam-code__copy origam-code-group__copy"
					:text="copyButtonLabel"
					:aria-label="copyAriaLabel"
					:style="copyBtnStyle"
					aria-live="polite"
					data-cy="origam-code-group-copy"
					@click="handleCopy"
			/>
		</slot>

		<origam-tab-panels
				v-model="model"
				class="origam-code-group__panels"
				:transition="false"
		>
			<origam-tab-panel
					v-for="item in getItems()"
					:key="item.value"
					:value="item.value"
			>
				<component :is="item.vnode"/>
			</origam-tab-panel>
		</origam-tab-panels>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, useSlots } from 'vue'

	import OrigamBtn from '../Btn/OrigamBtn.vue'
	import OrigamCode from '../Code/OrigamCode.vue'
	import OrigamTab from '../Tabs/OrigamTab.vue'
	import OrigamTabPanel from '../Tabs/OrigamTabPanel.vue'
	import OrigamTabPanels from '../Tabs/OrigamTabPanels.vue'
	import OrigamTabs from '../Tabs/OrigamTabs.vue'

	import { useBorder } from '../../composables/Commons/border.composable'
	import { useClipboard } from '../../composables/Clipboard/clipboard.composable'
	import { useDimension } from '../../composables/Commons/dimension.composable'
	import { useElevation } from '../../composables/Commons/elevation.composable'
	import { useLocale } from '../../composables/Commons/locale.composable'
	import { useMargin } from '../../composables/Commons/margin.composable'
	import { useRounded } from '../../composables/Commons/rounded.composable'
	import { useVModel } from '../../composables/Commons/vModel.composable'

	import { CODE_DEFAULTS } from '../../consts/Code/code.const'
	
	import type {
		ICodeGroupEmits,
		ICodeGroupProps,
		ICodeGroupSlots
	} from '../../interfaces/CodeGroup/code-group.interface'

	import { findCodeGroupItem, resolveCodeGroupItems } from '../../utils/CodeGroup/code-group.util'

	/*********************************************************
	 * Global
	 *
	 * @description
	 * `<OrigamCodeGroup>` is `<OrigamTabs>` + `<OrigamCode>` drawn as one
	 * surface. It reuses the tabs and the code block as they are: the group
	 * owns the border / radius / elevation, the tab strip and the one copy
	 * button, and tells each hosted `<OrigamCode>` to flatten itself and hide
	 * its header (`CODE_GROUP_EMBED_PROPS`).
	 ********************************************************/
	const props = withDefaults(defineProps<ICodeGroupProps>(), {
		tag: 'figure',
		items: () => [],
		modelValue: undefined,
		label: undefined,
		copyable: true,
		lineNumbers: false,
		wrap: false
	})

	const emit = defineEmits<ICodeGroupEmits>()

	defineSlots<ICodeGroupSlots>()

	const slots = useSlots()

	const { t } = useLocale()

	/*********************************************************
	 * Items
	 *
	 * @description
	 * ⛔ Not a `computed`: in the slot form the tabs come from the vnodes the
	 * parent hands to the default slot, and a `computed` would keep serving the
	 * vnodes of the previous render when the parent re-renders (the slot
	 * function is not a reactive source). A plain function is re-run by every
	 * render and by every copy.
	 ********************************************************/
	function getItems () {
		return resolveCodeGroupItems(props.items, slots.default?.(), {
			label: props.label,
			lineNumbers: props.lineNumbers,
			wrap: props.wrap,
			codeComponent: OrigamCode,
			t
		})
	}

	/*********************************************************
	 * Active tab (v-model)
	 ********************************************************/
	const model = useVModel(props, 'modelValue', () => getItems()[0]?.value)

	/*********************************************************
	 * Hosted code blocks
	 *
	 * @description
	 * Each scroller gets a name of its own — the tab label and the position —
	 * so N blocks of the same language in N panels do not share one name (axe
	 * `landmark-unique`). With several groups on one page the tab labels repeat
	 * (npm / pnpm / yarn each time): the group's `label` is then part of the
	 * name, which is what tells the groups apart.
	 ********************************************************/
	const tabsLabel = computed(() => props.label ?? t('origam.code_group.tabs_aria_label'))

	/*********************************************************
	 * Copy — one button for the active tab
	 ********************************************************/
	const { copy, copied } = useClipboard({ feedbackDuration: CODE_DEFAULTS.copyFeedbackDurationMs })

	async function handleCopy () {
		const code = findCodeGroupItem(getItems(), model.value)?.code ?? ''
		if (await copy(code)) emit('copy', code)
	}

	const copyButtonLabel = computed(() => copied.value ? t('origam.code.copied') : t('origam.code.copy'))
	const copyAriaLabel = computed(() => copied.value ? t('origam.code.copied_aria_label') : t('origam.code.copy_aria_label'))

	const copyBtnStyle = {
		padding: 'var(--origam-code__copy---padding-block) var(--origam-code__copy---padding-inline)'
	}

	/*********************************************************
	 * Class & Style
	 ********************************************************/
	const { borderClasses, borderStyles } = useBorder(props)
	const { roundedClasses, roundedStyles } = useRounded(props)
	const { elevationClasses } = useElevation(props)
	const { marginClasses, marginStyles } = useMargin(props)
	const { dimensionStyles } = useDimension(props)

	const groupClasses = computed(() => [
		'origam-code-group',
		{ 'origam-code-group--copyable': props.copyable },
		borderClasses.value,
		roundedClasses.value,
		elevationClasses.value,
		marginClasses.value,
		props.class
	])

	const groupStyles = computed(() => [
		borderStyles.value,
		roundedStyles.value,
		marginStyles.value,
		dimensionStyles.value,
		props.style
	])

	/*********************************************************
	 * Expose
	 ********************************************************/
	defineExpose({ copied, model })
</script>

<style lang="scss">
	.origam-code-group {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas:
			"tabs copy"
			"panels panels";
		align-items: center;
		margin: 0;
		overflow: hidden;
		background-color: var(--origam-code__header---background-color);
		color: var(--origam-code---color);
		border: var(--origam-code---border-width) solid var(--origam-code---border-color);
		border-radius: var(--origam-code---border-radius);
	}

	.origam-code-group__tabs {
		grid-area: tabs;
		min-inline-size: 0;
		overflow-x: auto;
	}

	.origam-code-group__copy {
		grid-area: copy;
		margin-inline-end: var(--origam-code__header---padding-inline);
	}

	.origam-code-group__panels {
		grid-area: panels;
		min-inline-size: 0;
		background-color: var(--origam-code---background-color);
		border-top: var(--origam-code---border-width) solid var(--origam-code---border-color);
	}
</style>
