<template>
	<Story
			group="components"
			title="Avatar/OrigamAvatar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IAvatarProps>>({ bgColor: 'primary', color: 'white' })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center;">
					<origam-avatar v-bind="sharedAvatarProps(state)" text="AP"/>
					<origam-avatar v-bind="sharedAvatarProps(state)" :image="DEMO_AVATAR_IMAGE"/>
					<origam-avatar v-bind="sharedAvatarProps(state)" :icon="accountIcon"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IActiveProps & IBgColorProps>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-avatar :bg-color="state.bgColor" :hover="resolveHoverState(state.hover)" :active="resolveActiveState(state.active)" text="AP"/>
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
				:init-state="() => useStoryInitState<Partial<IAvatarProps>>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-avatar :tag="state.tag" text="AP" bg-color="primary"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:active">
			<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
				<origam-avatar
						tag="button"
						text="AP"
						bg-color="primary"
						@update:active="logEvent('update:active', $event)"
				/>
				<p style="font: 0.8rem/1.4 system-ui; color: var(--origam-color__text---secondary);">Click — watch the Events panel.</p>
			</div>
		</Variant>

		<Variant title="Events - update:hover">
			<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
				<origam-avatar
						tag="button"
						text="AP"
						bg-color="primary"
						@update:hover="logEvent('update:hover', $event)"
				/>
				<p style="font: 0.8rem/1.4 system-ui; color: var(--origam-color__text---secondary);">Hover — watch the Events panel.</p>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<origam-avatar bg-color="primary">
				<span>Custom slot content</span>
			</origam-avatar>
		</Variant>

		<Variant title="Slots - Avatar">
			<origam-avatar text="AP" bg-color="primary">
				<template #avatar>
					<span>Custom avatar slot</span>
				</template>
			</origam-avatar>
		</Variant>

		<Variant title="Slots - Icon">
			<origam-avatar :icon="accountIcon" bg-color="primary">
				<template #icon>
					<origam-icon :icon="heartIcon"/>
				</template>
			</origam-avatar>
		</Variant>

		<Variant title="Slots - Text">
			<origam-avatar text="AP">
				<template #text>
					<span style="font-style: italic;">Custom</span>
				</template>
			</origam-avatar>
		</Variant>

		<Variant
				title="Prop — content (text · image · icon)"
				:init-state="() => useStoryInitState<{ text: string, image: string }>({ text: 'AP', image: 'https://i.pravatar.cc/120?img=12' })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center;">
					<origam-avatar :text="state.text" bg-color="primary"/>
					<origam-avatar :image="state.image"/>
					<origam-avatar :icon="accountIcon" bg-color="primary"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.text"  title="Text"/>
					<HstText v-model="state.image" title="Image (URL)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — size">
			<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
				<origam-avatar text="XS" size="x-small" bg-color="primary"/>
				<origam-avatar text="S"  size="small"   bg-color="primary"/>
				<origam-avatar text="D"  size="default" bg-color="primary"/>
				<origam-avatar text="L"  size="large"   bg-color="primary" data-cy="avatar-size-large"/>
				<origam-avatar text="XL" size="x-large" bg-color="primary"/>
			</div>
		</Variant>

		<Variant
				title="Prop — density"
				:init-state="() => useStoryInitState<Partial<IAvatarProps>>({ density: undefined })"
		>
			<template #default="{ state }">
				<div style="display: flex; gap: 16px; align-items: center;">
					<origam-avatar :density="state.density" text="AP" bg-color="primary"/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — rounded">
			<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
				<origam-avatar text="0"  rounded="0"      bg-color="primary"/>
				<origam-avatar text="SM" rounded="sm"     bg-color="primary"/>
				<origam-avatar text="LG" rounded="lg"     bg-color="primary"/>
				<origam-avatar text="F"  rounded="circle" bg-color="primary"/>
			</div>
		</Variant>

		<Variant title="Prop — elevation">
			<div style="display: flex; gap: 24px; align-items: center; padding: 16px; flex-wrap: wrap;">
				<origam-avatar text="SM" elevation="sm" bg-color="primary"/>
				<origam-avatar text="MD" elevation="md" bg-color="primary"/>
				<origam-avatar text="LG" elevation="lg" bg-color="primary"/>
			</div>
		</Variant>

		<Variant title="Prop — border">
			<div style="display: flex; gap: 16px; align-items: center;">
				<origam-avatar text="B" border="sm" bg-color="primary"/>
				<origam-avatar text="B" border="md" bg-color="primary"/>
			</div>
		</Variant>

		<Variant
				title="Prop — tag"
				:init-state="() => useStoryInitState<Partial<IAvatarProps>>({ tag: 'div' })"
		>
			<template #default="{ state }">
				<origam-avatar :tag="state.tag" text="AP" bg-color="primary"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

				<Variant
				title="Default"
				:init-state="() => useStoryInitState<IAvatarProps>({ text: 'AP', bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-avatar
						v-bind="state"
						@update:active="logEvent('update:active', $event)"
						@update:hover="logEvent('update:hover', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.text"  title="Text"/>
					<HstText   v-model="state.image" title="Image (URL)"/>
					<HstSelect v-model="state.icon"  title="Icon" :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"      :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"    :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"    :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing" :options="LETTER_SPACING_OPTIONS"/>
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
	import { logEvent } from 'histoire/client'

	import { OrigamAvatar, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type {
		IActiveProps,
		IAvatarProps,
		IBgColorProps,
		IHoverProps
	} from '@origam/interfaces'

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
		resolveHoverState,
		ICON_OPTIONS,
		LETTER_SPACING_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const accountIcon = MDI_ICONS.ACCOUNT
	const heartIcon = MDI_ICONS.HEART

	const DEMO_AVATAR_IMAGE = 'https://i.pravatar.cc/150?img=12'

	// The Design variant renders three avatars (text / image / icon) that share
	// every design prop — only the content differs. This returns the shared
	// design slice so the bindings aren't repeated three times.
	const sharedAvatarProps = (s: Record<string, unknown>): Record<string, unknown> => ({
		color: s.color,
		bgColor: s.bgColor,
		size: s.size,
		density: s.density,
		rounded: s.rounded,
		elevation: s.elevation,
		border: s.border,
		borderColor: s.borderColor,
		borderStyle: s.borderStyle,
		padding: s.padding,
		margin: s.margin,
		fontSize: s.fontSize,
		fontWeight: s.fontWeight,
		lineHeight: s.lineHeight,
		letterSpacing: s.letterSpacing
	})
</script>

<docs lang="md" src="@docs/components/Avatar/OrigamAvatar.md"/>
