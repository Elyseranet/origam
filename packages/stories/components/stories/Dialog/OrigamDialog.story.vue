<template>
	<Story
			group="components"
			title="Dialog/OrigamDialog"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDialogProps>>({
					title: 'Dialog',
					bgColor: 'surface',
					size: 'default'
				})"
		>
			<template #default="{ state }">
				<div style="padding: 16px;">
					<origam-dialog v-model="designOpen" v-bind="state">
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Open (Design)"/>
						</template>
						<template #content>
							<p style="padding: 0 16px;">Design variant preview.</p>
						</template>
						<template #footer>
							<div style="padding: 8px 16px; text-align: right;">
								<origam-btn text="Close" @click="designOpen = false"/>
							</div>
						</template>
					</origam-dialog>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.size"    title="Size"    :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"   :options="COLOR_OPTIONS"/>
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
				<StoryGroup title="Status">
					<HstSelect v-model="state.status"             title="Status"          :options="STATUS_OPTIONS"/>
					<HstSelect v-model="state.statusIconPosition" title="Status Position" :options="STATUS_POSITION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Icons">
					<HstSelect v-model="state.prependIcon" title="Prepend Icon" :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.appendIcon"  title="Append Icon"  :options="ICON_OPTIONS"/>
					<HstSelect v-model="state.icon"        title="Icon"         :options="ICON_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
					<HstText v-model="state.text"     title="Text"/>
					<HstText v-model="state.image"    title="Image URL"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDialogProps>>({
					title: 'Functional dialog',
					fullscreen: false,
					scrollable: false,
					retainFocus: true,
					persistent: false,
					disabled: false
				})"
		>
			<template #default="{ state }">
				<div style="padding: 16px;">
					<origam-dialog
							v-model="functionalOpen"
							:title="state.title"
							:fullscreen="state.fullscreen"
							:scrollable="state.scrollable"
							:retain-focus="state.retainFocus"
							:persistent="state.persistent"
							:disabled="state.disabled"
					>
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Open (Functional)"/>
						</template>
						<template #content>
							<div style="padding: 0 16px;">
								<p v-for="n in 8" :key="n">Line {{ n }} of content.</p>
							</div>
						</template>
						<template #footer>
							<div style="padding: 8px 16px; text-align: right;">
								<origam-btn text="Close" @click="functionalOpen = false"/>
							</div>
						</template>
					</origam-dialog>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Behaviour">
					<HstCheckbox v-model="state.fullscreen"  title="Fullscreen"/>
					<HstCheckbox v-model="state.scrollable"  title="Scrollable"/>
					<HstCheckbox v-model="state.retainFocus" title="Retain Focus"/>
					<HstCheckbox v-model="state.persistent"  title="Persistent"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - update:modelValue">
			<div style="padding: 16px;">
				<origam-dialog
						v-model="emitModelOpen"
						title="update:modelValue"
						@update:model-value="logEvent('update:modelValue', $event)"
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Toggle (watch Events tab)"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Open/close to fire update:modelValue.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Events - isRead">
			<div style="padding: 16px;">
				<origam-dialog
						v-model="emitIsReadOpen"
						title="isRead"
						@is-read="logEvent('isRead', $event)"
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open (watch Events tab)"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Scroll to the bottom to fire isRead.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Events - click:outside">
			<div style="padding: 16px;">
				<origam-dialog
						v-model="emitOutsideOpen"
						title="click:outside"
						@click:outside="logEvent('click:outside', $event)"
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open then click outside"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Click outside this dialog.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Activator">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotActivatorOpen" title="Activator slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open (custom activator)"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Custom activator slot demo.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Asset">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotAssetOpen" title="Asset slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #asset>
						<origam-icon :icon="MDI_ICONS.STAR" :size="48"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Custom asset slot demo.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Content">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotContentOpen" title="Content slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #content>
						<span style="padding: 0 16px; display: block;">Custom content slot.</span>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotDefaultOpen" title="Default slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<span>Custom default slot content.</span>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Footer">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotFooterOpen" title="Footer slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
					<template #footer>
						<div style="padding: 8px 16px; display: flex; gap: 8px; justify-content: flex-end;">
							<origam-btn text="Cancel" @click="slotFooterOpen = false"/>
							<origam-btn bg-color="primary" color="white" text="Confirm" @click="slotFooterOpen = false"/>
						</div>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderOpen">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header>
						<div style="padding: 12px 16px; font-weight: 600;">Custom header slot</div>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header Append">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderAppendOpen" title="Header append slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header-append>
						<origam-icon :icon="MDI_ICONS.HEART" :size="20"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header Content">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderContentOpen">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header-content>
						<span style="font-style: italic;">Custom header-content slot</span>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header Prepend">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderPrependOpen" title="With prepend icon">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header-prepend>
						<origam-icon :icon="MDI_ICONS.INFORMATION" :size="28"/>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Custom header-prepend slot.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header Subtitle">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderSubtitleOpen" title="With subtitle">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header-subtitle>
						<span>Custom subtitle slot</span>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Header Title">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotHeaderTitleOpen">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #header-title>
						<strong>Custom title slot</strong>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Loader">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotLoaderOpen" title="Loader slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #loader>
						<span>Loading…</span>
					</template>
					<template #content>
						<p style="padding: 0 16px;">Content here.</p>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant title="Slots - Text">
			<div style="padding: 16px;">
				<origam-dialog v-model="slotTextOpen" title="Text slot">
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open"/>
					</template>
					<template #text>
						<span>Custom text slot content.</span>
					</template>
				</origam-dialog>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IDialogProps>({
					title: 'Dialog',
					fullscreen: false,
					scrollable: false,
					retainFocus: true
				})"
		>
			<template #default="{ state }">
				<div style="padding: 16px;">
					<origam-dialog
							v-model="playgroundOpen"
							v-bind="state"
							@update:model-value="logEvent('update:modelValue', $event)"
					>
						<template #activator="{ props: a }">
							<origam-btn v-bind="a" text="Open playground"/>
						</template>
						<template #content>
							<p style="padding: 0 16px;">Playground content.</p>
						</template>
						<template #footer>
							<div style="padding: 8px 16px; text-align: right;">
								<origam-btn text="Close" @click="playgroundOpen = false"/>
							</div>
						</template>
					</origam-dialog>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title"    title="Title"/>
					<HstText v-model="state.subtitle" title="Subtitle"/>
					<HstText v-model="state.text"     title="Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect   v-model="state.status"    title="Status"    :options="STATUS_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.fullscreen"  title="Fullscreen"/>
					<HstCheckbox v-model="state.scrollable"  title="Scrollable"/>
					<HstCheckbox v-model="state.retainFocus" title="Retain Focus"/>
					<HstCheckbox v-model="state.persistent"  title="Persistent"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { ref } from 'vue'
	import { logEvent } from 'histoire/client'

	import { OrigamBtn, OrigamDialog, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDialogProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ICON_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		STATUS_OPTIONS,
		STATUS_POSITION_OPTIONS
	} from '@stories/const'

	const designOpen         = ref(false)
	const functionalOpen     = ref(false)
	const emitModelOpen      = ref(false)
	const emitIsReadOpen     = ref(false)
	const emitOutsideOpen    = ref(false)
	const slotActivatorOpen  = ref(false)
	const slotAssetOpen      = ref(false)
	const slotContentOpen    = ref(false)
	const slotDefaultOpen    = ref(false)
	const slotFooterOpen     = ref(false)
	const slotHeaderOpen     = ref(false)
	const slotHeaderAppendOpen   = ref(false)
	const slotHeaderContentOpen  = ref(false)
	const slotHeaderPrependOpen  = ref(false)
	const slotHeaderSubtitleOpen = ref(false)
	const slotHeaderTitleOpen    = ref(false)
	const slotLoaderOpen     = ref(false)
	const slotTextOpen       = ref(false)
	const playgroundOpen     = ref(false)
</script>

<docs lang="md" src="@docs/components/Dialog/OrigamDialog.md"/>
