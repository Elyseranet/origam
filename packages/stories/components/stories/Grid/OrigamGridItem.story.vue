<template>
	<Story
			group="components"
			title="Grid/OrigamGridItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IGridItemProps>>({
					column: '2 / span 2',
					row: undefined,
					area: undefined,
					alignSelf: undefined,
					justifySelf: undefined
				})"
		>
			<template #default="{ state }">
				<origam-grid
						:columns="4"
						:rows="2"
						gap="sm"
						class="grid-host"
						align-items="stretch"
						justify-items="stretch"
				>
					<origam-grid-item
							:column="state.area ? undefined : state.column"
							:row="state.area ? undefined : state.row"
							:area="state.area"
							:align-self="state.alignSelf"
							:justify-self="state.justifySelf"
							class="cell cell--target"
							data-cy="grid-item-design-target"
					>
						target
					</origam-grid-item>
					<origam-grid-item class="cell">2</origam-grid-item>
					<origam-grid-item class="cell">3</origam-grid-item>
					<origam-grid-item class="cell">4</origam-grid-item>
				</origam-grid>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Placement">
					<HstText   v-model="state.column" title="Column (string form)"/>
					<HstText   v-model="state.row"    title="Row (string form)"/>
					<HstText   v-model="state.area"   title="Area (overrides column/row)"/>
				</StoryGroup>
				<StoryGroup title="Self-alignment">
					<HstSelect v-model="state.alignSelf"   title="Align Self"   :options="GRID_PLACE_SELF_OPTIONS"/>
					<HstSelect v-model="state.justifySelf" title="Justify Self" :options="GRID_PLACE_SELF_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IGridItemProps>>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-grid :columns="2" gap="sm" class="grid-host">
					<origam-grid-item
							:tag="state.tag"
							class="cell"
							data-cy="grid-item-functional-target"
					>
						rendered as &lt;{{ state.tag }}&gt;
					</origam-grid-item>
					<origam-grid-item class="cell">sibling</origam-grid-item>
				</origam-grid>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-grid :columns="2" gap="sm" class="grid-host">
				<origam-grid-item class="cell">
					<strong>Custom slot content</strong> — any markup, not just text.
				</origam-grid-item>
				<origam-grid-item class="cell">sibling</origam-grid-item>
			</origam-grid>
		</Variant>

		<Variant title="Prop — alignSelf / justifySelf">
			<origam-grid :columns="4" :rows="1" gap="sm" class="grid-host" style="min-height: 100px;">
				<origam-grid-item align-self="start"   class="cell cell--self" data-cy="grid-item-align-start">start</origam-grid-item>
				<origam-grid-item align-self="center"  class="cell cell--self" data-cy="grid-item-align-center">center</origam-grid-item>
				<origam-grid-item align-self="end"     class="cell cell--self" data-cy="grid-item-align-end">end</origam-grid-item>
				<origam-grid-item align-self="stretch" class="cell cell--self" data-cy="grid-item-align-stretch">stretch</origam-grid-item>
			</origam-grid>
		</Variant>

		<Variant title="Prop — tag">
			<origam-grid :columns="3" gap="sm" class="grid-host">
				<origam-grid-item tag="div"     class="cell" data-cy="grid-item-tag-div">div</origam-grid-item>
				<origam-grid-item tag="section" class="cell" data-cy="grid-item-tag-section">section</origam-grid-item>
				<origam-grid-item tag="article" class="cell" data-cy="grid-item-tag-article">article</origam-grid-item>
			</origam-grid>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IGridItemProps>({
					tag: 'div',
					column: '1 / span 2',
					row: undefined,
					area: undefined,
					alignSelf: undefined,
					justifySelf: undefined
				})"
		>
			<template #default="{ state }">
				<origam-grid :columns="4" :rows="2" gap="sm" class="grid-host">
					<origam-grid-item
							:tag="state.tag"
							:column="state.area ? undefined : state.column"
							:row="state.area ? undefined : state.row"
							:area="state.area"
							:align-self="state.alignSelf"
							:justify-self="state.justifySelf"
							class="cell cell--target"
					>
						target
					</origam-grid-item>
					<origam-grid-item class="cell">2</origam-grid-item>
					<origam-grid-item class="cell">3</origam-grid-item>
					<origam-grid-item class="cell">4</origam-grid-item>
				</origam-grid>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Placement">
					<HstText v-model="state.column" title="Column (string form)"/>
					<HstText v-model="state.row"    title="Row (string form)"/>
					<HstText v-model="state.area"   title="Area"/>
				</StoryGroup>
				<StoryGroup title="Self-alignment">
					<HstSelect v-model="state.alignSelf"   title="Align Self"   :options="GRID_PLACE_SELF_OPTIONS"/>
					<HstSelect v-model="state.justifySelf" title="Justify Self" :options="GRID_PLACE_SELF_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamGrid, OrigamGridItem } from '@origam/components'

	import { GRID_PLACE_SELF } from '@origam/consts'

	import type { IGridItemProps, IOptions } from '@origam/interfaces'

	import type { TGridPlaceSelf } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import { TAG_OPTIONS } from '@stories/const'

	const GRID_PLACE_SELF_OPTIONS: Array<IOptions<TGridPlaceSelf | undefined>> = [
		{ label: '(none)', value: undefined },
		...GRID_PLACE_SELF.map(v => ({ label: v, value: v as TGridPlaceSelf }))
	]
</script>

<style scoped>
.grid-host {
	padding: 8px;
	border: 1px dashed var(--origam-color__border---subtle, rgba(0, 0, 0, 0.16));
	min-height: 140px;
}

.cell {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	border: 1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.16));
	border-radius: var(--origam-radius---sm, 4px);
	background: var(--origam-color__surface---default, #fff);
	color: var(--origam-color__text---primary, #111);
	font: 0.8125rem/1.4 system-ui, sans-serif;
}

.cell--target {
	border-color: var(--origam-color__action--primary---bg, #1976d2);
	border-width: 2px;
	font-weight: 600;
}
</style>

<docs lang="md" src="@docs/components/Grid/OrigamGridItem.md"/>
