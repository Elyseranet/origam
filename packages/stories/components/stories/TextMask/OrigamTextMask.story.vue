<template>
	<Story
			group="components"
			title="TextMask/OrigamTextMask"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ITextMaskProps>>({
					text: 'ORIGAM',
					background: 'primary',
					fontWeight: 'black',
					lineHeight: 'tight',
					align: 'left'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 32px; background: var(--origam-color__surface---default);">
					<origam-text-mask
							:text="state.text"
							:background="state.background"
							:font-family="state.fontFamily"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
							:line-height="state.lineHeight"
							:letter-spacing="state.letterSpacing"
							:text-transform="state.textTransform"
							:align="state.align"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Background">
					<HstText v-model="state.background" title="Background (string | preset | css gradient)"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily"    title="Font Family"    :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.textTransform" title="Text Transform" :options="TEXT_TRANSFORM_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Align">
					<HstSelect v-model="state.align" title="Align" :options="ALIGN_TEXT_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ITextMaskProps>>({
					text: 'ANIMATED',
					background: 'primary',
					animated: false,
					animationType: 'pan',
					animationDuration: '3s',
					tag: 'span',
					fontWeight: 'black'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 32px; background: var(--origam-color__surface---default);">
					<origam-text-mask
							:text="state.text"
							:background="state.background"
							:animated="state.animated"
							:animation-type="state.animationType"
							:animation-duration="state.animationDuration"
							:tag="state.tag"
							:font-weight="state.fontWeight"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Animation">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstSelect   v-model="state.animationType"     title="Animation Type"     :options="ANIMATION_TYPE_OPTIONS"/>
					<HstText     v-model="state.animationDuration" title="Animation Duration"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 32px; text-align: center; background: var(--origam-color__surface---default);">
				<origam-text-mask
						:background="{ from: 'primary', via: 'warning', to: 'danger', direction: 135 }"
						animated
						tag="div"
				>
					<h1 style="font-size: 6rem; font-weight: 900; margin: 0; line-height: 1;">DESIGN</h1>
					<span style="font-size: 2rem; font-weight: 600; display: block; margin-top: 8px;">— system —</span>
				</origam-text-mask>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ITextMaskProps>({
					text: 'ORIGAM',
					background: 'primary',
					animated: true,
					animationType: 'pan',
					animationDuration: '3s',
					fontWeight: 'black',
					lineHeight: 'tight',
					align: 'left',
					tag: 'span'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 32px; background: var(--origam-color__surface---default);">
					<origam-text-mask v-bind="state"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text" title="Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstText   v-model="state.background"    title="Background"/>
					<HstSelect v-model="state.fontFamily"    title="Font Family"    :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
					<HstSelect v-model="state.textTransform" title="Text Transform" :options="TEXT_TRANSFORM_OPTIONS"/>
					<HstSelect v-model="state.align"         title="Align"          :options="ALIGN_TEXT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.animated"          title="Animated"/>
					<HstSelect   v-model="state.animationType"     title="Animation Type"     :options="ANIMATION_TYPE_OPTIONS"/>
					<HstText     v-model="state.animationDuration" title="Animation Duration"/>
					<HstSelect   v-model="state.tag"               title="Tag"                :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { OrigamTextMask } from '@origam/components'
	import type { ITextMaskProps } from '@origam/interfaces'
	import type { TBlockquoteAlign, TTextMaskAnimation } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		FONT_FAMILY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		LETTER_SPACING_OPTIONS,
		TEXT_TRANSFORM_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const ALIGN_TEXT_OPTIONS: Array<{ label: string; value: TBlockquoteAlign }> = [
		{ label: 'Left',   value: 'left' },
		{ label: 'Center', value: 'center' },
		{ label: 'Right',  value: 'right' }
	]

	const ANIMATION_TYPE_OPTIONS: Array<{ label: string; value: TTextMaskAnimation }> = [
		{ label: 'Pan',    value: 'pan' },
		{ label: 'Rotate', value: 'rotate' },
		{ label: 'Pulse',  value: 'pulse' },
		{ label: 'Zoom',   value: 'zoom' }
	]
</script>

<docs lang="md" src="@docs/components/TextMask/OrigamTextMask.md"/>
