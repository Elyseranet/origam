<template>
	<Story
			group="components"
			title="Grids/OrigamCol"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IColProps>>({
					cols: '6',
					color: undefined,
					bgColor: undefined,
					border: false,
					borderColor: undefined,
					borderStyle: undefined,
					padding: undefined,
					margin: undefined,
					align: undefined,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row>
						<origam-col
								:cols="state.cols"
								:color="state.color"
								:bg-color="state.bgColor"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:padding="state.padding"
								:margin="state.margin"
								:align="state.align"
								:tag="state.tag"
						>
							<div class="demo-cell">col A</div>
						</origam-col>
						<origam-col
								:cols="state.cols"
								:color="state.color"
								:bg-color="state.bgColor"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:padding="state.padding"
								:margin="state.margin"
								:align="state.align"
								:tag="state.tag"
						>
							<div class="demo-cell">col B</div>
						</origam-col>
						<origam-col
								:cols="state.cols"
								:color="state.color"
								:bg-color="state.bgColor"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:padding="state.padding"
								:margin="state.margin"
								:align="state.align"
								:tag="state.tag"
						>
							<div class="demo-cell">col C</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Grid">
					<HstSelect v-model="state.cols" title="Cols" :options="COLS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Align">
					<HstSelect v-model="state.align" title="Align (self)" :options="ALIGN_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<{
					cols?: TCols
					sm?: TCols
					md?: TCols
					lg?: TCols
					xl?: TCols
					xxl?: TCols
					offset?: TCols
					offsetSm?: TCols
					offsetMd?: TCols
					offsetLg?: TCols
					offsetXl?: TCols
					offsetXxl?: TCols
					order?: number
					orderSm?: number
					orderMd?: number
					orderLg?: number
					orderXl?: number
					orderXxl?: number
					alignSm?: TAlign
					alignMd?: TAlign
					alignLg?: TAlign
					alignXl?: TAlign
					alignXxl?: TAlign
				}>({ cols: '4', sm: '6', md: '4', lg: '3' })"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row>
						<origam-col
								:cols="state.cols"
								:sm="state.sm"
								:md="state.md"
								:lg="state.lg"
								:xl="state.xl"
								:xxl="state.xxl"
								:offset="state.offset"
								:offset-sm="state.offsetSm"
								:offset-md="state.offsetMd"
								:offset-lg="state.offsetLg"
								:offset-xl="state.offsetXl"
								:offset-xxl="state.offsetXxl"
								:order="state.order"
								:order-sm="state.orderSm"
								:order-md="state.orderMd"
								:order-lg="state.orderLg"
								:order-xl="state.orderXl"
								:order-xxl="state.orderXxl"
								:align-sm="state.alignSm"
								:align-md="state.alignMd"
								:align-lg="state.alignLg"
								:align-xl="state.alignXl"
								:align-xxl="state.alignXxl"
						>
							<div class="demo-cell">col A</div>
						</origam-col>
						<origam-col
								:cols="state.cols"
								:sm="state.sm"
								:md="state.md"
								:lg="state.lg"
								:xl="state.xl"
								:xxl="state.xxl"
								:offset="state.offset"
								:offset-sm="state.offsetSm"
								:offset-md="state.offsetMd"
								:offset-lg="state.offsetLg"
								:offset-xl="state.offsetXl"
								:offset-xxl="state.offsetXxl"
								:order="state.order"
								:order-sm="state.orderSm"
								:order-md="state.orderMd"
								:order-lg="state.orderLg"
								:order-xl="state.orderXl"
								:order-xxl="state.orderXxl"
								:align-sm="state.alignSm"
								:align-md="state.alignMd"
								:align-lg="state.alignLg"
								:align-xl="state.alignXl"
								:align-xxl="state.alignXxl"
						>
							<div class="demo-cell">col B</div>
						</origam-col>
						<origam-col
								:cols="state.cols"
								:sm="state.sm"
								:md="state.md"
								:lg="state.lg"
								:xl="state.xl"
								:xxl="state.xxl"
								:offset="state.offset"
								:offset-sm="state.offsetSm"
								:offset-md="state.offsetMd"
								:offset-lg="state.offsetLg"
								:offset-xl="state.offsetXl"
								:offset-xxl="state.offsetXxl"
								:order="state.order"
								:order-sm="state.orderSm"
								:order-md="state.orderMd"
								:order-lg="state.orderLg"
								:order-xl="state.orderXl"
								:order-xxl="state.orderXxl"
								:align-sm="state.alignSm"
								:align-md="state.alignMd"
								:align-lg="state.alignLg"
								:align-xl="state.alignXl"
								:align-xxl="state.alignXxl"
						>
							<div class="demo-cell">col C</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Breakpoints">
					<HstSelect v-model="state.cols" title="Cols (default)" :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.sm"   title="sm (≥600px)"   :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.md"   title="md (≥960px)"   :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.lg"   title="lg (≥1280px)"  :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.xl"   title="xl (≥1920px)"  :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.xxl"  title="xxl (≥2560px)" :options="COLS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Offset">
					<HstSelect v-model="state.offset"    title="Offset (default)"  :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offsetSm"  title="Offset sm"         :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offsetMd"  title="Offset md"         :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offsetLg"  title="Offset lg"         :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offsetXl"  title="Offset xl"         :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offsetXxl" title="Offset xxl"        :options="COLS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Order">
					<HstNumber v-model="state.order"    title="Order (default)" :min="0" :max="12" :step="1"/>
					<HstNumber v-model="state.orderSm"  title="Order sm"        :min="0" :max="12" :step="1"/>
					<HstNumber v-model="state.orderMd"  title="Order md"        :min="0" :max="12" :step="1"/>
					<HstNumber v-model="state.orderLg"  title="Order lg"        :min="0" :max="12" :step="1"/>
					<HstNumber v-model="state.orderXl"  title="Order xl"        :min="0" :max="12" :step="1"/>
					<HstNumber v-model="state.orderXxl" title="Order xxl"       :min="0" :max="12" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Align (responsive)">
					<HstSelect v-model="state.alignSm"  title="Align sm"  :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignMd"  title="Align md"  :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignLg"  title="Align lg"  :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignXl"  title="Align xl"  :options="ALIGN_OPTIONS"/>
					<HstSelect v-model="state.alignXxl" title="Align xxl" :options="ALIGN_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-container>
				<origam-row>
					<origam-col cols="6">
						<div class="demo-cell">
							<strong>Custom default slot</strong>
							<p>Anything goes here.</p>
						</div>
					</origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — cols">
			<origam-container>
				<origam-row>
					<origam-col cols="6">
						<div class="demo-cell">col A (6/12)</div>
					</origam-col>
					<origam-col cols="6">
						<div class="demo-cell">col B (6/12)</div>
					</origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — align (align-self)">
			<origam-container>
				<origam-row style="min-height: 100px; background: var(--origam-color__surface---overlay, #ececec);">
					<origam-col cols="4" align="start">
						<div class="demo-cell">start</div>
					</origam-col>
					<origam-col cols="4" align="center">
						<div class="demo-cell">center</div>
					</origam-col>
					<origam-col cols="4" align="end">
						<div class="demo-cell">end</div>
					</origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant title="Prop — offset">
			<origam-container>
				<origam-row>
					<origam-col cols="4" offset="2">
						<div class="demo-cell">offset 2</div>
					</origam-col>
				</origam-row>
			</origam-container>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IColProps>>({
					cols: '6',
					sm: undefined,
					md: undefined,
					lg: undefined,
					xl: undefined,
					xxl: undefined,
					offset: undefined,
					order: undefined,
					color: undefined,
					bgColor: undefined,
					align: undefined,
					tag: 'div'
				})"
		>
			<template #default="{ state }">
				<origam-container>
					<origam-row>
						<origam-col v-bind="state">
							<div class="demo-cell">card</div>
						</origam-col>
						<origam-col v-bind="state">
							<div class="demo-cell">card</div>
						</origam-col>
						<origam-col v-bind="state">
							<div class="demo-cell">card</div>
						</origam-col>
						<origam-col v-bind="state">
							<div class="demo-cell">card</div>
						</origam-col>
					</origam-row>
				</origam-container>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Grid">
					<HstSelect v-model="state.cols"   title="Cols (default)"  :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.sm"     title="sm (≥600px)"     :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.md"     title="md (≥960px)"     :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.lg"     title="lg (≥1280px)"    :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.xl"     title="xl (≥1920px)"    :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.xxl"    title="xxl (≥2560px)"   :options="COLS_OPTIONS"/>
					<HstSelect v-model="state.offset" title="Offset"          :options="COLS_OPTIONS"/>
					<HstNumber v-model="state.order"  title="Order" :min="0" :max="12" :step="1"/>
					<HstSelect v-model="state.align"  title="Align (self)"    :options="ALIGN_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
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
	import { OrigamCol, OrigamContainer, OrigamRow } from '@origam/components'
	import type { IColProps } from '@origam/interfaces'
	import type { TAlign, TCols } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ALIGN_OPTIONS,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		COLS_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'
</script>

<style scoped>
	.demo-cell {
		padding: 12px;
		background: var(--origam-color__surface---default, #fff);
		border: 1px solid var(--origam-color__border---default, #e5e5e5);
		border-radius: 4px;
		text-align: center;
		color: var(--origam-color__text---onColor, #000);
	}
</style>

<docs lang="md" src="@docs/components/Grids/OrigamCol.md"/>
