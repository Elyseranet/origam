<template>
	<Story
			group="components"
			title="List/OrigamListItem"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IListItemProps>>({
					title: 'List item',
					subtitle: 'Subtitle text',
					color: undefined,
					bgColor: undefined,
					density: undefined,
					size: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					lines: undefined,
					width: undefined,
					height: undefined,
					fontSize: undefined,
					fontWeight: undefined,
					lineHeight: undefined,
					letterSpacing: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-item
							:title="state.title"
							:padding="state.padding"
							:margin="state.margin"
							:subtitle="state.subtitle"
							:color="state.color"
							:bg-color="state.bgColor"
							:density="state.density"
							:size="state.size"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:prepend-icon="state.prependIcon || undefined"
							:append-icon="state.appendIcon || undefined"
							:lines="state.lines"
							:width="state.width"
							:height="state.height"
							:font-size="state.fontSize"
							:font-weight="state.fontWeight"
							:line-height="state.lineHeight"
							:letter-spacing="state.letterSpacing"
					/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.lines"   title="Lines"   :options="LINES_OPTIONS"/>
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
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontSize"      title="Font Size"       :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight"    title="Font Weight"     :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight"    title="Line Height"     :options="LINE_HEIGHT_OPTIONS"/>
					<HstSelect v-model="state.letterSpacing" title="Letter Spacing"  :options="LETTER_SPACING_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="State"
				:init-state="() => useStoryInitState<IHoverProps & IBgColorProps & { active?: boolean | object }>({ bgColor: 'primary' })"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-item
							:bg-color="state.bgColor"
							:hover="resolveHoverState(state.hover)"
							:active="resolveActiveState(state.active)"
							title="Stateful item"
							subtitle="Hover or activate"
					/>
				</origam-list>
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
				:init-state="() => useStoryInitState<Partial<IListItemProps>>({
					title: 'List item',
					disabled: false,
					nav: false,
					slim: false,
					link: false,
					tag: undefined,
					href: undefined,
					value: undefined,
					activeClass: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-item
							:title="state.title"
							:disabled="state.disabled"
							:nav="state.nav"
							:slim="state.slim"
							:link="state.link"
							:tag="state.tag"
							:href="state.href"
							:value="state.value"
							:active-class="state.activeClass"
							:prepend-icon="prependIcon"
					/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.nav"      title="Nav"/>
					<HstCheckbox v-model="state.slim"     title="Slim"/>
					<HstCheckbox v-model="state.link"     title="Link (clickable)"/>
				</StoryGroup>
				<StoryGroup title="Link">
					<HstSelect v-model="state.tag"  title="Tag"  :options="TAG_OPTIONS"/>
					<HstText   v-model="state.href" title="Href (tag=a)"/>
				</StoryGroup>
				<StoryGroup title="Data">
					<HstText v-model="state.value"       title="Value"/>
					<HstText v-model="state.activeClass" title="Active Class"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - click">
			<origam-list>
				<origam-list-item
						link
						title="Click me"
						:prepend-icon="MDI_ICONS.CURSOR_DEFAULT_CLICK"
						@click="logEvent('click', $event)"
				/>
			</origam-list>
		</Variant>

		<Variant title="Events - click:prepend">
			<origam-list>
				<origam-list-item
						title="Click the prepend icon"
						:prepend-icon="MDI_ICONS.HEART"
						@click:prepend="logEvent('click:prepend', $event)"
				/>
			</origam-list>
		</Variant>

		<Variant title="Events - click:append">
			<origam-list>
				<origam-list-item
						title="Click the append icon"
						:append-icon="MDI_ICONS.CHEVRON_RIGHT"
						@click:append="logEvent('click:append', $event)"
				/>
			</origam-list>
		</Variant>

		<Variant title="Slots - Default">
			<origam-list>
				<origam-list-item>
					<em>Custom default slot content</em>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant title="Slots - Title">
			<origam-list>
				<origam-list-item>
					<template #title="{ title }">
						<strong>{{ title ?? 'Custom Title' }}</strong>
					</template>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant title="Slots - Subtitle">
			<origam-list>
				<origam-list-item title="Main title">
					<template #subtitle>
						<em>Custom subtitle slot</em>
					</template>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-list>
				<origam-list-item title="Item with custom prepend">
					<template #prepend>
						<origam-icon :icon="MDI_ICONS.HEART"/>
					</template>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant title="Slots - Append">
			<origam-list>
				<origam-list-item title="Item with custom append">
					<template #append>
						<origam-icon :icon="MDI_ICONS.CHEVRON_RIGHT"/>
					</template>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant title="Slots - Wrapper">
			<origam-list>
				<origam-list-item>
					<template #wrapper>
						<span style="display: flex; align-items: center; gap: 12px; padding: 8px 16px;">
							<origam-icon :icon="MDI_ICONS.STAR"/>
							<span>Full wrapper override</span>
						</span>
					</template>
				</origam-list-item>
			</origam-list>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IListItemProps>({
					title: 'List item',
					subtitle: 'Subtitle text',
				})"
		>
			<template #default="{ state }">
				<origam-list>
					<origam-list-item v-bind="state" @click="logEvent('click', $event)"/>
				</origam-list>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText   v-model="state.title"       title="Title"/>
					<HstText   v-model="state.subtitle"    title="Subtitle"/>
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.lines"       title="Lines"        :options="LINES_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.active"   title="Active"/>
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.nav"      title="Nav"/>
					<HstCheckbox v-model="state.slim"     title="Slim"/>
					<HstCheckbox v-model="state.link"     title="Link (clickable)"/>
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

	import { OrigamIcon, OrigamList, OrigamListItem } from '@origam/components'
	import { LINES, MDI_ICONS } from '@origam/enums'
	import type {
		IBgColorProps,
		IHoverProps,
		IListItemProps,
		IOptions,
	} from '@origam/interfaces'
	import type { TLines } from '@origam/types'

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
		TAG_OPTIONS,
	} from '@stories/const'

	const prependIcon = MDI_ICONS.ACCOUNT

	const LINES_OPTIONS: Array<IOptions<TLines | undefined>> = [
		{ label: '(none)',  value: undefined    },
		{ label: 'One',     value: LINES.ONE    },
		{ label: 'Two',     value: LINES.TWO    },
		{ label: 'Three',   value: LINES.THREE  },
	]
</script>
