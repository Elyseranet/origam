<template>
	<Story
			group="components"
			title="Grids/OrigamRow"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IRowProps>>({ color: undefined, density: undefined })"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row
							:color="state.color"
							:density="state.density"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:align="state.align"
							:align-sm="state.alignSm"
							:align-md="state.alignMd"
							:align-lg="state.alignLg"
							:align-xl="state.alignXl"
							:align-xxl="state.alignXxl"
							:justify="state.justify"
							:justify-sm="state.justifySm"
							:justify-md="state.justifyMd"
							:justify-lg="state.justifyLg"
							:justify-xl="state.justifyXl"
							:justify-xxl="state.justifyXxl"
							:direction="state.direction"
					>
						<origam-col cols="4">
							<div class="demo-cell">A</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">B</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">C</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color" title="Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Align">
					<HstSelect v-model="state.align"    title="Align"    :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignSm"  title="Align Sm" :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignMd"  title="Align Md" :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignLg"  title="Align Lg" :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignXl"  title="Align Xl" :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignXxl" title="Align Xxl" :options="ALIGN_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Justify">
					<HstSelect v-model="state.justify"    title="Justify"    :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.justifySm"  title="Justify Sm" :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.justifyMd"  title="Justify Md" :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.justifyLg"  title="Justify Lg" :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.justifyXl"  title="Justify Xl" :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.justifyXxl" title="Justify Xxl" :options="JUSTIFY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Direction">
					<HstSelect v-model="state.direction" title="Direction" :options="FLEX_DIRECTION_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IRowProps>>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row
							:tag="state.tag"
							:gutters="state.gutters"
							:padding="state.padding"
							:padding-top="state.paddingTop"
							:padding-bottom="state.paddingBottom"
							:padding-left="state.paddingLeft"
							:padding-right="state.paddingRight"
							:padding-block="state.paddingBlock"
							:padding-inline="state.paddingInline"
							:margin="state.margin"
							:margin-top="state.marginTop"
							:margin-bottom="state.marginBottom"
							:margin-left="state.marginLeft"
							:margin-right="state.marginRight"
							:margin-block="state.marginBlock"
							:margin-inline="state.marginInline"
					>
						<origam-col cols="4">
							<div class="demo-cell">A</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">B</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">C</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Gutters">
					<HstText v-model="state.gutters" title="Gutters"/>
				</StoryGroup>
				<StoryGroup title="Padding">
					<HstText v-model="state.padding"       title="Padding"/>
					<HstText v-model="state.paddingTop"    title="Padding Top"/>
					<HstText v-model="state.paddingBottom" title="Padding Bottom"/>
					<HstText v-model="state.paddingLeft"   title="Padding Left"/>
					<HstText v-model="state.paddingRight"  title="Padding Right"/>
					<HstText v-model="state.paddingBlock"  title="Padding Block"/>
					<HstText v-model="state.paddingInline" title="Padding Inline"/>
				</StoryGroup>
				<StoryGroup title="Margin">
					<HstText v-model="state.margin"       title="Margin"/>
					<HstText v-model="state.marginTop"    title="Margin Top"/>
					<HstText v-model="state.marginBottom" title="Margin Bottom"/>
					<HstText v-model="state.marginLeft"   title="Margin Left"/>
					<HstText v-model="state.marginRight"  title="Margin Right"/>
					<HstText v-model="state.marginBlock"  title="Margin Block"/>
					<HstText v-model="state.marginInline" title="Margin Inline"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-container>
				<origam-row>
					<origam-col cols="4">
						<div class="demo-cell"><strong>Custom</strong> slot A</div>
					</origam-col>
					<origam-col cols="4">
						<div class="demo-cell"><strong>Custom</strong> slot B</div>
					</origam-col>
					<origam-col cols="4">
						<div class="demo-cell"><strong>Custom</strong> slot C</div>
					</origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — density">
			<origam-container>
				<origam-row density="compact">
					<origam-col cols="4"><div class="demo-cell">compact A</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">compact B</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">compact C</div></origam-col>
				</origam-row>
				<origam-row density="default" style="margin-top: 8px;">
					<origam-col cols="4"><div class="demo-cell">default A</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">default B</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">default C</div></origam-col>
				</origam-row>
				<origam-row density="comfortable" style="margin-top: 8px;">
					<origam-col cols="4"><div class="demo-cell">comfortable A</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">comfortable B</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">comfortable C</div></origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — align">
			<origam-container>
				<origam-row align="center" style="min-height: 100px; background: var(--origam-color__surface---overlay, #ececec);">
					<origam-col cols="4"><div class="demo-cell">A</div></origam-col>
					<origam-col cols="4"><div class="demo-cell" style="padding: 32px 12px;">B (taller)</div></origam-col>
					<origam-col cols="4"><div class="demo-cell">C</div></origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — justify">
			<origam-container>
				<origam-row justify="space-between">
					<origam-col cols="3"><div class="demo-cell">A</div></origam-col>
					<origam-col cols="3"><div class="demo-cell">B</div></origam-col>
					<origam-col cols="3"><div class="demo-cell">C</div></origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IRowProps>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row v-bind="state">
						<origam-col cols="4">
							<div class="demo-cell">A</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">B</div>
						</origam-col>
						<origam-col cols="4">
							<div class="demo-cell">C</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.align"     title="Align"     :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.justify"   title="Justify"   :options="JUSTIFY_OPTIONS"/>
					<HstSelect v-model="state.direction" title="Direction" :options="FLEX_DIRECTION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstSelect v-model="state.tag"     title="Tag"     :options="TAG_OPTIONS"/>
					<HstText   v-model="state.gutters" title="Gutters"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamCol, OrigamContainer, OrigamRow } from '@origam/components'
	import { FLEX_DIRECTION } from '@origam/enums'
	import type { IOptions, IRowProps } from '@origam/interfaces'
	import type { TFlexDirection } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ALIGN_OPTIONS,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		JUSTIFY_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const FLEX_DIRECTION_OPTIONS: Array<IOptions<TFlexDirection | undefined>> = [
		{ label: '(none)', value: undefined },
		{ label: 'row', value: FLEX_DIRECTION.ROW },
		{ label: 'row-reverse', value: FLEX_DIRECTION.ROW_REVERSE },
		{ label: 'column', value: FLEX_DIRECTION.COLUMN },
		{ label: 'column-reverse', value: FLEX_DIRECTION.COLUMN_REVERSE }
	]
</script>

<style scoped>
	.demo-cell {
		padding: 12px;
		background: var(--origam-color__surface---default, #fff);
		border: 1px solid var(--origam-color__border---default, #e5e5e5);
		border-radius: 4px;
		text-align: center;
	}
</style>

<docs lang="md" src="@docs/components/Grids/OrigamRow.md"/>
