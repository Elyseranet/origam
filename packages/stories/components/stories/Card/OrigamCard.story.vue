<template>
	<Story
			group="components"
			title="Card/OrigamCard"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICardProps>>({
					title: 'Card title',
					subtitle: 'Subtitle',
					text: 'Body text.',
					bgColor: 'primary'
				})"
		>
			<template #default="{ state }">
				<origam-card
						:color="state.color"
						:padding="state.padding"
						:margin="state.margin"
						:bg-color="state.bgColor"
						:elevation="state.elevation"
						:flat="state.flat"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:border-top="state.borderTop"
						:border-right="state.borderRight"
						:border-bottom="state.borderBottom"
						:border-left="state.borderLeft"
						:border-top-color="state.borderTopColor"
						:border-right-color="state.borderRightColor"
						:border-bottom-color="state.borderBottomColor"
						:border-left-color="state.borderLeftColor"
						:rounded="state.rounded"
						:density="state.density"
						:image="state.image"
						:type="state.type"
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-avatar="state.prependAvatar || undefined"
						:append-avatar="state.appendAvatar || undefined"
						:title="state.title"
						:subtitle="state.subtitle"
						:text="state.text"
						:width="state.width"
						:height="state.height"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
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
				<StoryGroup title="Border — per side (issue #215)">
					<HstSelect v-model="state.borderTop"         title="Border Top"          :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderRight"       title="Border Right"        :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderBottom"      title="Border Bottom"       :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderLeft"        title="Border Left"         :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderTopColor"    title="Border Top Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.borderRightColor"  title="Border Right Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.borderBottomColor" title="Border Bottom Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.borderLeftColor"   title="Border Left Color"   :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Type">
					<HstSelect v-model="state.type" title="Type" :options="CARD_TYPE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
					<HstText   v-model="state.prependAvatar" title="Prepend Avatar (URL)"/>
					<HstText   v-model="state.appendAvatar"  title="Append Avatar (URL)"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
					<HstText v-model="state.text"     title="Text"/>
					<HstText v-model="state.image"    title="Image (URL)"/>
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
				<origam-card
						:bg-color="state.bgColor"
						:hover="resolveHoverState(state.hover)"
						:active="resolveActiveState(state.active)"
						title="Card"
						text="Interact with this card."
				/>
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
				:init-state="() => useStoryInitState<Partial<ICardProps> & ILoadingState>({
					title: 'Card',
					text: 'Body text.',
					enabled: false,
					kind: 'bool',
					progress: 42,
					circularSize: 24
				})"
		>
			<template #default="{ state }">
				<origam-card
						:title="state.title"
						:text="state.text"
						:disabled="state.disabled"
						:loading="resolveLoading(state)"
						:link="state.link"
						:href="state.href"
						:to="state.to"
						:replace="state.replace"
						:exact="state.exact"
						:tag="state.tag"
						:ripple="state.ripple"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.ripple"   title="Ripple"/>
				</StoryGroup>
				<StoryGroup title="Loading">
					<HstCheckbox v-model="state.enabled"      title="Loading"/>
					<HstSelect   v-model="state.kind"         title="Loading Kind" :options="LOADING_KIND_OPTIONS"/>
					<HstNumber   v-model="state.progress"     title="Progress (number)"  :min="0"  :max="100" :step="1"/>
					<HstNumber   v-model="state.circularSize" title="Size (circular)"    :min="12" :max="64"  :step="2"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstCheckbox v-model="state.link"    title="Link"/>
					<HstSelect   v-model="state.tag"     title="Tag"              :options="TAG_OPTIONS"/>
					<HstText     v-model="state.href"    title="Href (tag=a)"/>
					<HstText     v-model="state.to"      title="To (router-link)"/>
					<HstCheckbox v-model="state.replace" title="Replace"/>
					<HstCheckbox v-model="state.exact"   title="Exact"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-card
					title="Prepend click"
					:prepend-icon="prependIcon"
					@click:prepend="logEvent('click:prepend', $event)"
			/>
		</Variant>

		<Variant title="Events - click:append">
			<origam-card
					title="Append click"
					:append-icon="appendIcon"
					@click:append="logEvent('click:append', $event)"
			/>
		</Variant>

		<Variant title="Events - update:active">
			<origam-card
					title="Active state"
					text="Click and hold to trigger active."
					@update:active="logEvent('update:active', $event)"
			/>
		</Variant>

		<Variant title="Events - update:hover">
			<origam-card
					title="Hover state"
					text="Hover over this card."
					@update:hover="logEvent('update:hover', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-card>
				<p>Custom slot content — any markup goes here.</p>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header">
			<origam-card>
				<template #header>
					<strong>Custom header slot</strong>
				</template>
				<p>Body content.</p>
			</origam-card>
		</Variant>

		<Variant title="Slots - Footer">
			<origam-card title="Footer card" text="Card with footer.">
				<template #footer>
					<origam-btn text="Cancel"/>
					<origam-btn bg-color="primary" text="Confirm"/>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-card loading title="Custom loader">
				<template #loader>
					<span>Loading...</span>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Asset">
			<origam-card title="Asset slot">
				<template #asset>
					<figure style="margin: 0; height: 120px; display: flex; align-items: center; justify-content: center; background: var(--origam-color__surface---raised);">
						<figcaption>Custom asset placeholder</figcaption>
					</figure>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-card>
				<template #wrapper>
					<div style="padding: 24px; border: 2px dashed var(--origam-color__border---subtle);">
						<span>Custom wrapper content</span>
					</div>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header.prepend">
			<origam-card title="Header prepend slot">
				<template #header.prepend>
					<origam-icon :icon="prependIcon"/>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header.append">
			<origam-card title="Header append slot">
				<template #header.append>
					<origam-icon :icon="appendIcon"/>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header.title">
			<origam-card>
				<template #header.title>
					<strong>Custom title</strong>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header.subtitle">
			<origam-card title="With subtitle slot">
				<template #header.subtitle>
					<em>Custom subtitle text</em>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Header.content">
			<origam-card>
				<template #header.content>
					<span>Custom header content</span>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Slots - Text">
			<origam-card title="Text slot">
				<template #text>
					<span>Custom text slot content</span>
				</template>
			</origam-card>
		</Variant>

		<Variant title="Prop — elevation custom">
			<origam-card
					elevation="0 4px 12px rgba(0,0,0,.24)"
					title="Custom elevation"
					text="elevation accepts a free-form box-shadow value (var(...), calc(...), multiple comma-separated layers, inset, …) — emitted verbatim instead of being bucketised onto the origam shadow ladder."
					style="width: 280px;"
			/>
		</Variant>

		<Variant title="Prop — border per-side">
			<origam-card
					:border-top="4"
					:border-right="2"
					:border-bottom="4"
					:border-left="2"
					border-top-color="danger"
					border-right-color="primary"
					border-bottom-color="success"
					border-left-color="info"
					title="Per-side border"
					text="Each side reads its own width (borderTop/Right/Bottom/Left) and color (borderTopColor/…) — issue #215. Specific per-side props win over the global border/borderColor shorthand for the physical side they target."
					style="width: 280px;"
			/>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICardProps>({
					title: 'Card title',
					subtitle: 'Subtitle',
					text: 'Body text.',
					bgColor: 'primary'
				})"
		>
			<template #default="{ state }">
				<origam-card
						v-bind="state"
						@click:prepend="logEvent('click:prepend', $event)"
						@click:append="logEvent('click:append', $event)"
						@update:active="logEvent('update:active', $event)"
						@update:hover="logEvent('update:hover', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"         title="Title"/>
					<HstText   v-model="state.subtitle"      title="Subtitle"/>
					<HstText   v-model="state.text"          title="Text"/>
					<HstText   v-model="state.image"         title="Image (URL)"/>
					<HstSelect v-model="state.prependIcon"   title="Prepend Icon"   :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"    title="Append Icon"    :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
					<HstCheckbox v-model="state.link"     title="Link"/>
					<HstText     v-model="state.href"     title="Href"/>
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

	import { OrigamBtn, OrigamCard, OrigamIcon } from '@origam/components'
	import { CARD_TYPE, MDI_ICONS } from '@origam/enums'
	import type { IBgColorProps, ICardProps, IHoverProps, IOptions } from '@origam/interfaces'
	import type { TCardType, TLoadingValue } from '@origam/types'

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
		HOVER_OPTIONS,
		resolveHoverState,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	interface ILoadingState {
		enabled: boolean
		kind: 'bool' | 'number' | 'line' | 'circular' | 'skeleton'
		progress: number
		circularSize: number
	}

	const prependIcon = MDI_ICONS.ACCOUNT
	const appendIcon = MDI_ICONS.DOTS_VERTICAL

	const CARD_TYPE_OPTIONS: Array<IOptions<TCardType | undefined>> = [
		{ label: '(none)', value: undefined },
		{ label: 'Grid', value: CARD_TYPE.GRID },
		{ label: 'List', value: CARD_TYPE.LIST },
	]

	const LOADING_KIND_OPTIONS = [
		{ label: 'true (default)', value: 'bool' },
		{ label: 'number', value: 'number' },
		{ label: '{ type: line }', value: 'line' },
		{ label: '{ type: circular }', value: 'circular' },
		{ label: '{ type: skeleton }', value: 'skeleton' }
	]

	const resolveLoading = (state: ILoadingState): TLoadingValue => {
		if (!state.enabled) return false
		if (state.kind === 'bool') return true
		if (state.kind === 'number') return state.progress
		if (state.kind === 'line') return { type: 'line' }
		if (state.kind === 'circular') return { type: 'circular', size: state.circularSize }
		if (state.kind === 'skeleton') return { type: 'skeleton' }
		return false
	}
</script>

<docs lang="md" src="@docs/components/Card/OrigamCard.md"/>
