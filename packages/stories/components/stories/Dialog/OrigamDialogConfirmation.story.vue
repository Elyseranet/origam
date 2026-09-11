<template>
	<Story
			group="components"
			title="Dialog/OrigamDialogConfirmation"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IDialogConfirmationProps>>({
					color: 'primary',
					bgColor: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					flat: false,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					status: undefined,
					statusIconPosition: undefined,
					width: undefined,
					height: undefined,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-btn text="Open design dialog" @click="designOpen = true"/>
					<origam-dialog-confirmation
							v-model="designOpen"
							title="Design dialog"
							text="Inspect visual design tokens below."
							:color="state.color"
							:bg-color="state.bgColor"
							:size="state.size"
							:density="state.density"
							:rounded="state.rounded"
							:elevation="state.elevation"
							:flat="state.flat"
							:border="state.border"
							:border-color="state.borderColor"
							:border-style="state.borderStyle"
							:status="state.status"
							:status-icon-position="state.statusIconPosition"
							:width="state.width"
							:height="state.height"
					/>
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
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IDialogConfirmationProps>>({
					cancellable: true,
					fullscreen: false,
					disabled: false,
					loading: false,
					persistent: false,
					scrollable: false,
					retainFocus: true,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-btn text="Open functional dialog" @click="functionalOpen = true"/>
					<origam-dialog-confirmation
							v-model="functionalOpen"
							title="Functional dialog"
							text="Adjust controls to test behaviour."
							:cancellable="state.cancellable"
							:fullscreen="state.fullscreen"
							:disabled="state.disabled"
							:loading="state.loading"
							:persistent="state.persistent"
							:scrollable="state.scrollable"
							:retain-focus="state.retainFocus"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Confirmation">
					<HstCheckbox v-model="state.cancellable" title="Cancellable"/>
				</StoryGroup>
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.loading"  title="Loading"/>
				</StoryGroup>
				<StoryGroup title="Dialog Behaviour">
					<HstCheckbox v-model="state.fullscreen"   title="Fullscreen"/>
					<HstCheckbox v-model="state.persistent"   title="Persistent"/>
					<HstCheckbox v-model="state.scrollable"   title="Scrollable"/>
					<HstCheckbox v-model="state.retainFocus"  title="Retain Focus"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - validate">
			<div style="padding: 24px;">
				<origam-btn text="Open" @click="emitValidateOpen = true"/>
				<origam-dialog-confirmation
						v-model="emitValidateOpen"
						title="Watch validate"
						text="Click Validate and observe the Histoire event log."
						@validate="logEvent('validate', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - cancel">
			<div style="padding: 24px;">
				<origam-btn text="Open" @click="emitCancelOpen = true"/>
				<origam-dialog-confirmation
						v-model="emitCancelOpen"
						title="Watch cancel"
						text="Click Cancel and observe the Histoire event log."
						@cancel="logEvent('cancel', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Slots - Default">
			<div style="padding: 24px;">
				<origam-btn text="Open default slot" @click="slotDefaultOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotDefaultOpen"
						title="Move to archive?"
				>
					<template #default>
						<p>The following items will be archived:</p>
						<ul>
							<li>spec.pdf</li>
							<li>image.png</li>
							<li>notes.md</li>
						</ul>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Activator">
			<div style="padding: 24px;">
				<origam-dialog-confirmation
						v-model="slotActivatorOpen"
						title="Confirm action?"
						text="This will apply the change immediately."
				>
					<template #activator="{ props: a }">
						<origam-btn v-bind="a" text="Open via activator slot" color="primary"/>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Asset">
			<div style="padding: 24px;">
				<origam-btn text="Open asset slot" @click="slotAssetOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotAssetOpen"
						title="Upload complete"
				>
					<template #asset>
						<div style="display: flex; justify-content: center; padding: 16px;">
							<origam-icon :icon="MDI_ICONS.CHECK_CIRCLE" style="font-size: 48px;"/>
						</div>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Content">
			<div style="padding: 24px;">
				<origam-btn text="Open content slot" @click="slotContentOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotContentOpen"
						title="Custom content"
				>
					<template #content>
						<span>Custom slot content replaces body area.</span>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Footer">
			<div style="padding: 24px;">
				<origam-btn text="Open footer slot" @click="slotFooterOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotFooterOpen"
						title="Custom footer"
						text="Footer is fully overridden below."
				>
					<template #footer>
						<div style="padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
							<origam-btn text="Dismiss" @click="slotFooterOpen = false"/>
						</div>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header">
			<div style="padding: 24px;">
				<origam-btn text="Open header slot" @click="slotHeaderOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderOpen"
				>
					<template #header>
						<div style="padding: 16px; font-weight: 700; font-size: 1.125rem;">Custom header slot</div>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header Append">
			<div style="padding: 24px;">
				<origam-btn text="Open header-append slot" @click="slotHeaderAppendOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderAppendOpen"
						title="Header with append"
				>
					<template #header-append>
						<origam-icon :icon="MDI_ICONS.HEART"/>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header Prepend">
			<div style="padding: 24px;">
				<origam-btn text="Open header-prepend slot" @click="slotHeaderPrependOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderPrependOpen"
						title="Header with prepend"
				>
					<template #header-prepend>
						<origam-icon :icon="MDI_ICONS.HEART"/>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header Title">
			<div style="padding: 24px;">
				<origam-btn text="Open header-title slot" @click="slotHeaderTitleOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderTitleOpen"
				>
					<template #header-title>
						<strong>Custom title</strong>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header Subtitle">
			<div style="padding: 24px;">
				<origam-btn text="Open header-subtitle slot" @click="slotHeaderSubtitleOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderSubtitleOpen"
						title="With subtitle slot"
				>
					<template #header-subtitle>
						<em>Custom subtitle text</em>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Header Content">
			<div style="padding: 24px;">
				<origam-btn text="Open header-content slot" @click="slotHeaderContentOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotHeaderContentOpen"
				>
					<template #header-content>
						<span>Custom header-content slot</span>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Text">
			<div style="padding: 24px;">
				<origam-btn text="Open text slot" @click="slotTextOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotTextOpen"
						title="Custom text slot"
				>
					<template #text>
						<span>Custom slot text content.</span>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant title="Slots - Loader">
			<div style="padding: 24px;">
				<origam-btn text="Open loader slot" @click="slotLoaderOpen = true"/>
				<origam-dialog-confirmation
						v-model="slotLoaderOpen"
						loading
						title="Loading dialog"
				>
					<template #loader>
						<span>Loading…</span>
					</template>
				</origam-dialog-confirmation>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IDialogConfirmationProps>>({
					title: 'Delete item?',
					text: 'This will remove the row permanently.',
					cancellable: true,
					color: 'primary',
					bgColor: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					flat: false,
					fullscreen: false,
					disabled: false,
					loading: false,
					persistent: false,
					scrollable: false,
				})"
		>
			<template #default="{ state }">
				<div style="padding: 24px;">
					<origam-btn text="Open playground dialog" @click="playgroundOpen = true"/>
					<origam-dialog-confirmation
							v-model="playgroundOpen"
							v-bind="state"
							@validate="logEvent('validate', $event)"
							@cancel="logEvent('cancel', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.title" title="Title"/>
					<HstText v-model="state.text"  title="Text"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect   v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect   v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect   v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect   v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect   v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstCheckbox v-model="state.flat"      title="Flat"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.cancellable" title="Cancellable"/>
					<HstCheckbox v-model="state.fullscreen"  title="Fullscreen"/>
					<HstCheckbox v-model="state.disabled"    title="Disabled"/>
					<HstCheckbox v-model="state.loading"     title="Loading"/>
					<HstCheckbox v-model="state.persistent"  title="Persistent"/>
					<HstCheckbox v-model="state.scrollable"  title="Scrollable"/>
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

	import { OrigamBtn, OrigamDialogConfirmation, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IDialogConfirmationProps } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		SIZE_OPTIONS,
		STATUS_OPTIONS,
		STATUS_POSITION_OPTIONS,
	} from '@stories/const'

	const designOpen           = ref(false)
	const functionalOpen       = ref(false)
	const emitValidateOpen     = ref(false)
	const emitCancelOpen       = ref(false)
	const slotDefaultOpen      = ref(false)
	const slotActivatorOpen    = ref(false)
	const slotAssetOpen        = ref(false)
	const slotContentOpen      = ref(false)
	const slotFooterOpen       = ref(false)
	const slotHeaderOpen       = ref(false)
	const slotHeaderAppendOpen = ref(false)
	const slotHeaderPrependOpen = ref(false)
	const slotHeaderTitleOpen  = ref(false)
	const slotHeaderSubtitleOpen = ref(false)
	const slotHeaderContentOpen = ref(false)
	const slotTextOpen         = ref(false)
	const slotLoaderOpen       = ref(false)
	const playgroundOpen       = ref(false)
</script>

<docs lang="md" src="@docs/components/Dialog/OrigamDialogConfirmation.md"/>
