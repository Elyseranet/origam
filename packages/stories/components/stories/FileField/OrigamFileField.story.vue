<template>
	<Story
			group="components"
			title="FileField/OrigamFileField"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IFileFieldProps>>({
					label: 'Upload',
					variant: undefined,
					color: undefined,
					bgColor: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					flat: false,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					prependIcon: undefined,
					appendIcon: undefined,
					prependInnerIcon: undefined,
					appendInnerIcon: undefined,
					clearable: false,
					display: 'list',
					dropzoneTitle: undefined,
					dropzoneSubtitle: undefined,
					width: undefined,
					height: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-file-field
						v-model="designFiles"
						:label="state.label"
						:padding="state.padding"
						:margin="state.margin"
						:variant="state.variant"
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
						:prepend-icon="state.prependIcon || undefined"
						:append-icon="state.appendIcon || undefined"
						:prepend-inner-icon="state.prependInnerIcon || undefined"
						:append-inner-icon="state.appendInnerIcon || undefined"
						:clearable="state.clearable"
						:display="state.display"
						:dropzone-title="state.dropzoneTitle"
						:dropzone-subtitle="state.dropzoneSubtitle"
						:width="state.width"
						:height="state.height"
						style="max-width: 400px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="VARIANT_INPUT_OPTIONS"/>
				</StoryGroup>
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
				<StoryGroup title="Icons">
					<HstSelect   v-model="state.prependIcon"      title="Prepend Icon"       :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.appendIcon"       title="Append Icon"        :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.prependInnerIcon" title="Prepend Inner Icon" :options="ICON_OPTIONS"/>
					<HstSelect   v-model="state.appendInnerIcon"  title="Append Inner Icon"  :options="ICON_OPTIONS"/>
					<HstCheckbox v-model="state.clearable"        title="Clearable"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstSelect v-model="state.display" title="Display" :options="FILE_FIELD_DISPLAY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Labels">
					<HstText v-model="state.label"            title="Label"/>
					<HstText v-model="state.dropzoneTitle"    title="Dropzone Title"/>
					<HstText v-model="state.dropzoneSubtitle" title="Dropzone Subtitle"/>
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
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IFileFieldProps>>({
					disabled: false,
					readonly: false,
					multiple: false,
					dropzone: false,
					counter: false,
					chips: false,
					showSize: false,
					downloadable: false,
					error: undefined,
					hint: undefined,
					hideDetails: false,
					placeholder: undefined,
					persistentPlaceholder: false,
					persistentCounter: false,
					persistentHint: false,
					persistentClear: false,
					required: false,
					maxFileSize: undefined,
					maxFileSizeErrorString: undefined,
					prefix: undefined,
					suffix: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-file-field
						v-model="functionalFiles"
						label="Upload"
						:disabled="state.disabled"
						:readonly="state.readonly"
						:multiple="state.multiple"
						:dropzone="state.dropzone"
						:counter="state.counter"
						:chips="state.chips"
						:show-size="state.showSize"
						:downloadable="state.downloadable"
						:error="state.error"
						:hint="state.hint"
						:hide-details="state.hideDetails"
						:placeholder="state.placeholder"
						:persistent-placeholder="state.persistentPlaceholder"
						:persistent-counter="state.persistentCounter"
						:persistent-hint="state.persistentHint"
						:persistent-clear="state.persistentClear"
						:required="state.required"
						:max-file-size="state.maxFileSize"
						:max-file-size-error-string="state.maxFileSizeErrorString"
						:prefix="state.prefix"
						:suffix="state.suffix"
						style="max-width: 400px"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="States">
					<HstCheckbox v-model="state.disabled" title="Disabled"/>
					<HstCheckbox v-model="state.readonly" title="Readonly"/>
					<HstCheckbox v-model="state.required" title="Required"/>
				</StoryGroup>
				<StoryGroup title="Files">
					<HstCheckbox v-model="state.multiple"     title="Multiple"/>
					<HstCheckbox v-model="state.chips"        title="Chips"/>
					<HstCheckbox v-model="state.showSize"     title="Show Size"/>
					<HstCheckbox v-model="state.downloadable" title="Downloadable"/>
					<HstCheckbox v-model="state.dropzone"     title="Dropzone"/>
				</StoryGroup>
				<StoryGroup title="Counter">
					<HstCheckbox v-model="state.counter"           title="Counter"/>
					<HstCheckbox v-model="state.persistentCounter" title="Persistent Counter"/>
				</StoryGroup>
				<StoryGroup title="Validation">
					<HstText   v-model="state.error"                title="Error (string)"/>
					<HstText   v-model="state.hint"                 title="Hint"/>
					<HstSelect v-model="state.hideDetails"          title="Hide Details" :options="HIDE_DETAILS_OPTIONS"/>
					<HstNumber v-model="state.maxFileSize"          title="Max File Size (bytes)"/>
					<HstText   v-model="state.maxFileSizeErrorString" title="Max File Size Error"/>
				</StoryGroup>
				<StoryGroup title="Field">
					<HstText     v-model="state.placeholder"           title="Placeholder"/>
					<HstCheckbox v-model="state.persistentPlaceholder" title="Persistent Placeholder"/>
					<HstCheckbox v-model="state.persistentHint"        title="Persistent Hint"/>
					<HstCheckbox v-model="state.persistentClear"       title="Persistent Clear"/>
					<HstText     v-model="state.prefix"                title="Prefix"/>
					<HstText     v-model="state.suffix"                title="Suffix"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Prop — single + paperclip">
			<origam-file-field
					v-model="singleFile"
					label="Document"
					display="list"
					data-cy="file-field-single-paperclip"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — empty state">
			<origam-file-field
					v-model="emptyStateFile"
					label="Document"
					placeholder="No file selected"
					data-cy="file-field-empty"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — multiple (chips)">
			<origam-file-field
					v-model="chipsFiles"
					label="Documents"
					multiple
					display="chips"
					data-cy="file-field-chips"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — multiple (counter)">
			<origam-file-field
					v-model="counterFiles"
					label="Documents"
					multiple
					display="counter"
					data-cy="file-field-counter"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — dropzone (empty)">
			<origam-file-field
					v-model="dropzoneEmptyFiles"
					label="Upload"
					dropzone
					data-cy="file-field-dropzone-empty"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — dropzone (single file)">
			<origam-file-field
					v-model="dropzoneSingleFile"
					label="Upload"
					dropzone
					data-cy="file-field-dropzone-single"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — dropzone (multiple files)">
			<origam-file-field
					v-model="dropzoneMultipleFiles"
					label="Upload"
					multiple
					dropzone
					data-cy="file-field-dropzone-multiple"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — dropzone (error)">
			<origam-file-field
					v-model="dropzoneErrorFiles"
					label="Upload"
					dropzone
					error="File is too large — max 2 MB allowed"
					data-cy="file-field-dropzone-error"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — disabled & readonly">
			<origam-file-field
					v-model="disabledFile"
					label="Upload"
					dropzone
					disabled
					data-cy="file-field-disabled"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Prop — showSize">
			<origam-file-field
					v-model="showSizeFiles"
					label="Upload"
					multiple
					show-size
					data-cy="file-field-show-size"
					style="max-width: 400px"
			/>
		</Variant>

		<Variant title="Events - click:control">
			<origam-file-field
					v-model="emitFiles"
					label="Upload"
					style="max-width: 400px"
					@click:control="logEvent('click:control', $event)"
			/>
		</Variant>

		<Variant title="Events - mousedown:control">
			<origam-file-field
					v-model="emitFiles"
					label="Upload"
					style="max-width: 400px"
					@mousedown:control="logEvent('mousedown:control', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-file-field
					v-model="emitFiles"
					label="Upload"
					style="max-width: 400px"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Events - click:remove">
			<origam-file-field
					v-model="emitMultiFiles"
					label="Upload"
					multiple
					display="chips"
					style="max-width: 400px"
					@click:remove="logEvent('click:remove', $event)"
			/>
		</Variant>

		<Variant title="Events - click:download">
			<origam-file-field
					v-model="emitMultiFiles"
					label="Upload"
					multiple
					downloadable
					style="max-width: 400px"
					@click:download="logEvent('click:download', $event)"
			/>
		</Variant>

		<Variant title="Events - drop">
			<origam-file-field
					v-model="emitFiles"
					label="Drop zone"
					dropzone
					style="max-width: 400px"
					@drop="logEvent('drop', $event)"
			/>
		</Variant>

		<Variant title="Events - error:max-size">
			<origam-file-field
					v-model="emitFiles"
					label="Upload (max 1 KB)"
					:max-file-size="1024"
					style="max-width: 400px"
					@error:max-size="logEvent('error:max-size', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<span>Custom default slot content</span>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Field">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #field>
					<span>Custom field slot content</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Dropzone">
			<origam-file-field
					v-model="slotFiles"
					label="Custom dropzone"
					dropzone
					style="max-width: 400px"
			>
				<template #dropzone>
					<span>Drop files here</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Dropzone (scoped)">
			<origam-file-field
					v-model="slotFiles"
					label="Custom dropzone"
					dropzone
					style="max-width: 400px"
			>
				<template #dropzone="{ isDragging, browse }">
					<div style="text-align: center; padding: 24px;">
						<p>{{ isDragging ? 'Release to upload!' : 'Custom dropzone — click to browse' }}</p>
						<origam-btn size="small" text="Browse" @click="browse"/>
					</div>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Item">
			<origam-file-field
					v-model="slotMultiFiles"
					label="Upload"
					multiple
					style="max-width: 400px"
			>
				<template #item="{ file, index, remove }">
					<div style="display: flex; align-items: center; gap: 8px; padding: 4px 0;">
						<span>{{ file.name }}</span>
						<origam-btn size="small" text="Remove" @click="remove"/>
					</div>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Chip">
			<origam-file-field
					v-model="slotMultiFiles"
					label="Upload"
					multiple
					display="chips"
					style="max-width: 400px"
			>
				<template #chip>
					<origam-chip text="Custom chip"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Selection">
			<origam-file-field
					v-model="slotMultiFiles"
					label="Upload"
					multiple
					style="max-width: 400px"
			>
				<template #selection>
					<origam-chip text="Custom selection"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Prepend">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #prepend>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Append">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #append>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - PrependInner">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #prependInner>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - AppendInner">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #appendInner>
					<origam-icon :icon="MDI_ICONS.HEART"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Clear">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					clearable
					style="max-width: 400px"
			>
				<template #clear>
					<origam-icon :icon="MDI_ICONS.CLOSE"/>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Label">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #label>
					<strong>Custom label</strong>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - FloatingLabel">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #floatingLabel>
					<strong>Floating label</strong>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Prefix">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #prefix>
					<span>PRE</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Suffix">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #suffix>
					<span>SUF</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Loader">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #loader>
					<span>Loading…</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Counter">
			<origam-file-field
					v-model="slotMultiFiles"
					label="Upload"
					multiple
					counter
					style="max-width: 400px"
			>
				<template #counter>
					<span>Custom counter slot</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Details">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #details>
					<span>Custom details slot</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Message">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #message>
					<span>Custom message slot</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant title="Slots - Messages">
			<origam-file-field
					v-model="slotFiles"
					label="Upload"
					style="max-width: 400px"
			>
				<template #messages>
					<span>Custom messages slot</span>
				</template>
			</origam-file-field>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<IFileFieldProps>>({
					label: 'Upload',
					variant: undefined,
					color: undefined,
					bgColor: undefined,
					size: undefined,
					density: undefined,
					rounded: undefined,
					elevation: undefined,
					display: 'list',
					multiple: false,
					dropzone: false,
					disabled: false,
					readonly: false,
					showSize: false,
					counter: false,
					chips: false,
					downloadable: false,
					error: undefined,
					placeholder: undefined,
				})"
		>
			<template #default="{ state }">
				<origam-file-field
						v-model="playgroundFiles"
						v-bind="state"
						style="max-width: 400px"
						@update:model-value="logEvent('update:modelValue', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label"       title="Label"/>
					<HstText v-model="state.placeholder" title="Placeholder"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"   title="Variant"   :options="VARIANT_INPUT_OPTIONS"/>
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.size"      title="Size"      :options="SIZE_OPTIONS"/>
					<HstSelect v-model="state.density"   title="Density"   :options="DENSITY_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.display"   title="Display"   :options="FILE_FIELD_DISPLAY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.multiple"     title="Multiple"/>
					<HstCheckbox v-model="state.dropzone"     title="Dropzone"/>
					<HstCheckbox v-model="state.disabled"     title="Disabled"/>
					<HstCheckbox v-model="state.readonly"     title="Readonly"/>
					<HstCheckbox v-model="state.showSize"     title="Show Size"/>
					<HstCheckbox v-model="state.counter"      title="Counter"/>
					<HstCheckbox v-model="state.chips"        title="Chips"/>
					<HstCheckbox v-model="state.downloadable" title="Downloadable"/>
					<HstText     v-model="state.error"        title="Error (string)"/>
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
	import { ref } from 'vue'

	import { OrigamBtn, OrigamChip, OrigamFileField, OrigamIcon } from '@origam/components'
	import { MDI_ICONS } from '@origam/enums'
	import type { IFileFieldProps } from '@origam/interfaces'
	import type { TFileFieldDisplay } from '@origam/types'

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
		VARIANT_INPUT_OPTIONS
	} from '@stories/const'

	const FILE_FIELD_DISPLAY_OPTIONS: Array<{ label: string; value: TFileFieldDisplay | undefined }> = [
		{ label: '(none)', value: undefined },
		{ label: 'List', value: 'list' },
		{ label: 'Chips', value: 'chips' },
		{ label: 'Counter', value: 'counter' },
	]

	const HIDE_DETAILS_OPTIONS: Array<{ label: string; value: boolean | string | undefined }> = [
		{ label: '(none)', value: undefined },
		{ label: 'false', value: false },
		{ label: 'true', value: true },
		{ label: 'auto', value: 'auto' },
	]

	// Fake a large file without allocating real bytes — mirrors the
	// mockFile helper in OrigamFileFieldListItem.story.vue /
	// OrigamFileFieldDragNDropItem.story.vue.
	const mockFile = (name: string, type: string, size: number): File => {
		const blob = new Blob([new Uint8Array(Math.min(size, 64))], { type })
		const file = new File([blob], name, { type })
		Object.defineProperty(file, 'size', { value: size })
		return file
	}

	const singleFile = ref(null)
	const designFiles = ref(null)
	const functionalFiles = ref(null)
	const emitFiles = ref(null)
	const emitMultiFiles = ref([])
	const slotFiles = ref(null)
	const slotMultiFiles = ref([])
	const playgroundFiles = ref(null)

	const emptyStateFile = ref(null)
	const chipsFiles = ref([])
	const counterFiles = ref([])
	const dropzoneEmptyFiles = ref(null)
	const dropzoneSingleFile = ref([mockFile('contract.pdf', 'application/pdf', 128_000)])
	const dropzoneMultipleFiles = ref([
		mockFile('one.txt', 'text/plain', 1_024),
		mockFile('two.txt', 'text/plain', 2_048),
		mockFile('three.txt', 'text/plain', 4_096),
	])
	const dropzoneErrorFiles = ref(null)
	const disabledFile = ref(null)
	const showSizeFiles = ref([])
</script>

<docs lang="md" src="@docs/components/FileField/OrigamFileField.md"/>
