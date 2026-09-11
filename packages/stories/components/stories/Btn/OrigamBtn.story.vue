<template>
	<Story
			group="components"
			title="Btn/OrigamBtn"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBtnProps>>({ color: 'white', bgColor: 'primary', text: 'Button' })"
		>
			<template #default="{ state }">
				<origam-btn
						:variant="state.variant"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:size="state.size"
						:density="state.density"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						:letter-spacing="state.letterSpacing"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:status="state.status"
						:status-icon-position="state.statusIconPosition"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:width="state.width"
						:height="state.height"
						:text="state.text"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Status">
					<HstSelect v-model="state.status"             title="Status"          :options="STATUS_OPTIONS"/>
					<HstSelect v-model="state.statusIconPosition" title="Status Position" :options="STATUS_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IBgColorProps & { active?: boolean | object }>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-btn :bg-color="state.bgColor" :hover="resolveHoverState(state.hover)" :active="resolveActiveState(state.active)" text="Button"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Surface">
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Interaction">
					<HstSelect v-model="state.hover"  title="Hover"  :options="HOVER_OPTIONS"/>
					<HstSelect v-model="state.active" title="Active" :options="ACTIVE_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IBtnProps> & ILoadingState>({ color: 'primary', enabled: false, kind: 'bool', progress: 42, circularSize: 24 })"
		>
			<template #default="{ state }">
				<origam-btn
						:color="state.color"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:loading="resolveLoading(state)"
						:block="state.block"
						:slim="state.slim"
						:stacked="state.stacked"
						:icon="state.icon"
						:prepend-icon="state.stacked ? prependIcon : undefined"
						:tag="state.tag"
						:href="state.href"
						:to="state.to"
						text="Button"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstCheckbox v-model="state.block"   title="Block"/>
					<HstCheckbox v-model="state.slim"    title="Slim"/>
					<HstCheckbox v-model="state.stacked" title="Stacked"/>
					<HstCheckbox v-model="state.icon"    title="Icon (icon-only)"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect v-model="state.tag"  title="Tag"  :options="TAG_OPTIONS"/>
					<HstText   v-model="state.href" title="Href (tag=a)"/>
					<HstText   v-model="state.to"   title="To (router-link)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — color & bgColor">
			<div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
				<origam-btn text="Default"/>
				<origam-btn text="Color primary"   color="primary"/>
				<origam-btn text="BgColor primary" bg-color="primary" data-cy="btn-color-primary"/>
				<origam-btn text="BgColor success" bg-color="success"/>
				<origam-btn text="BgColor danger"  bg-color="danger"/>
			</div>
		</Variant>

		<Variant title="Prop — loading (interactive)">
			<div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
				<origam-btn :loading="{ type: 'line' }"     text="Line"             data-cy="btn-loading-line"/>
				<origam-btn :loading="{ type: 'line' }"     text="Line primary"     color="primary" data-cy="btn-loading-line-primary"/>
				<origam-btn :loading="{ type: 'circular' }" text="Circular"         bg-color="info" data-cy="btn-loading-circular-override"/>
				<origam-btn :loading="{ type: 'circular' }" text="Circular success" bg-color="success" data-cy="btn-loading-circular-success"/>
				<origam-btn :loading="{ type: 'skeleton' }" text="Skeleton"         data-cy="btn-loading-skeleton"/>
			</div>
		</Variant>

		<Variant title="Events - click">
			<origam-btn color="primary" text="Click me" @click="logEvent('click', $event)"/>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-btn
					color="primary"
					:prepend-icon="prependIcon"
					text="Click the icon"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-btn
					color="primary"
					:append-icon="appendIcon"
					text="Click the chevron"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - group:selected">
			<origam-btn color="primary" text="Group item" @group:selected="logEvent('group:selected', $event)"/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-btn>
				<strong>Custom</strong> content
			</origam-btn>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-btn text="Button">
				<template #prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
			</origam-btn>
		</Variant>

		<Variant title="Slots - Append">
			<origam-btn text="Button">
				<template #append>
					<origam-icon :icon="appendIcon"/>
				</template>
			</origam-btn>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-btn loading text="Button">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-btn>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-btn>
				<template #wrapper>
					<span style="display: flex; gap: 8px; align-items: center;">
						<span>Wrapper</span>
						<strong>content</strong>
					</span>
				</template>
			</origam-btn>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBtnProps>({ color: 'primary', text: 'Button' })"
		>
			<template #default="{ state }">
				<origam-btn v-bind="state" @click="logEvent('click', $event)"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.text"        title="Text"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.block"    title="Block"/>
					<HstCheckbox v-model="state.slim"     title="Slim"/>
					<HstCheckbox v-model="state.stacked"  title="Stacked"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IBgColorProps,
		IBtnProps,
		IHoverProps
	} from '@origam/interfaces'
	import type { TLoadingValue } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		ACTIVE_OPTIONS,
		resolveActiveState,
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		HOVER_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		STATUS_OPTIONS,
		STATUS_POSITION_OPTIONS,
		TAG_OPTIONS,
		VARIANT_OPTIONS
	} from '@stories/const'

	interface ILoadingState {
		enabled: boolean
		kind: 'bool' | 'number' | 'line' | 'circular' | 'skeleton'
		progress: number
		circularSize: number
	}

	const prependIcon = MDI_ICONS.HEART
	const appendIcon = MDI_ICONS.ARROW_RIGHT

	const LOADING_KIND_OPTIONS = [
		{ label: 'true (default)', value: 'bool' },
		{ label: 'number', value: 'number' },
		{ label: '{ type: line }', value: 'line' },
		{ label: '{ type: circular }', value: 'circular' },
		{ label: '{ type: skeleton }', value: 'skeleton' }
	]

	const resolveLoading = (state: ILoadingState): TLoadingValue => {
		if (!state.enabled) return false
		if (state.kind === 'number') return state.progress
		if (state.kind === 'line') return { type: 'line' }
		if (state.kind === 'circular') return { type: 'circular', size: state.circularSize }
		if (state.kind === 'skeleton') return { type: 'skeleton' }

		return true
	}
</script>

<docs
		lang="md"
		src="@docs/components/Btn/OrigamBtn.md"
/>
