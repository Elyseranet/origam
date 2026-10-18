<template>
	<Story
			group="components"
			title="CodeGroup/OrigamCodeGroup"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICodeGroupProps>>({
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					margin: undefined,
					width: undefined,
					maxWidth: undefined
				})"
		>
			<template #default="{ state }">
				<origam-code-group
						:items="installItems"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:margin="state.margin"
						:width="state.width"
						:max-width="state.maxWidth"
						data-cy="code-group-design"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstText   v-model="state.borderColor" title="Border Color"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.margin" title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"    title="Width"/>
					<HstText v-model="state.maxWidth" title="Max Width"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICodeGroupProps>>({
					modelValue: 'pnpm',
					label: 'Package manager',
					copyable: true,
					lineNumbers: false,
					wrap: false,
					tag: 'figure'
				})"
		>
			<template #default="{ state }">
				<origam-code-group
						v-model="state.modelValue"
						:items="installItems"
						:label="state.label"
						:copyable="state.copyable"
						:line-numbers="state.lineNumbers"
						:wrap="state.wrap"
						:tag="state.tag"
						data-cy="code-group-functional"
						@copy="logEvent('copy', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Tabs">
					<HstSelect v-model="state.modelValue" title="Active tab (v-model)" :options="ACTIVE_TAB_OPTIONS"/>
					<HstText   v-model="state.label"      title="Tab list label"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.copyable"    title="Copyable"/>
					<HstCheckbox v-model="state.lineNumbers" title="Line Numbers"/>
					<HstCheckbox v-model="state.wrap"        title="Wrap"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Functional - Slot form (origam-code children)">
			<origam-code-group data-cy="code-group-slot-form">
				<origam-code label="npm" lang="bash" code="npm install origam"/>
				<origam-code label="pnpm" lang="bash" code="pnpm add origam"/>
				<origam-code filename="yarn" lang="bash" code="yarn add origam"/>
			</origam-code-group>
		</Variant>

		<Variant title="Functional - Several groups (labels keep the names distinct)">
			<origam-code-group label="Install origam" :items="installItems" data-cy="code-group-several-1"/>
			<origam-code-group label="Install shiki" :items="shikiItems" data-cy="code-group-several-2"/>
		</Variant>

		<Variant title="Events - copy">
			<origam-code-group
					:items="installItems"
					@copy="logEvent('copy', $event)"
			/>
		</Variant>

		<Variant title="Events - update:modelValue">
			<origam-code-group
					:items="installItems"
					@update:model-value="logEvent('update:modelValue', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-code-group>
				<origam-code label="Install" lang="bash" code="npm install origam"/>
				<origam-code label="Usage" lang="ts" code="import { createOrigam } from 'origam'"/>
			</origam-code-group>
		</Variant>

		<Variant title="Slots - Copy">
			<origam-code-group :items="installItems">
				<template #copy="{ copy, copied }">
					<origam-btn
							variant="tonal"
							size="small"
							:text="copied ? 'Done' : 'Grab it'"
							data-cy="code-group-custom-copy"
							@click="copy"
					/>
				</template>
			</origam-code-group>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<Partial<ICodeGroupProps>>({
					items: installItems,
					modelValue: 'npm',
					label: 'Package manager',
					copyable: true,
					lineNumbers: false,
					wrap: false,
					rounded: undefined,
					elevation: undefined,
					border: undefined
				})"
		>
			<template #default="{ state }">
				<origam-code-group
						v-bind="state"
						@copy="logEvent('copy', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.label" title="Tab list label"/>
					<HstSelect v-model="state.modelValue" title="Active tab (v-model)" :options="ACTIVE_TAB_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.copyable"    title="Copyable"/>
					<HstCheckbox v-model="state.lineNumbers" title="Line Numbers"/>
					<HstCheckbox v-model="state.wrap"        title="Wrap"/>
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

	import { OrigamBtn, OrigamCode, OrigamCodeGroup } from '@origam/components'
	import { CODE_LANG } from '@origam/enums'
	import type { ICodeGroupItem, ICodeGroupProps, IOptions } from '@origam/interfaces'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		ELEVATION_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const installItems: ICodeGroupItem[] = [
		{ label: 'npm', lang: CODE_LANG.BASH, code: 'npm install origam' },
		{ label: 'pnpm', lang: CODE_LANG.BASH, code: 'pnpm add origam' },
		{ label: 'yarn', lang: CODE_LANG.BASH, code: 'yarn add origam' }
	]

	const shikiItems: ICodeGroupItem[] = [
		{ label: 'npm', lang: CODE_LANG.BASH, code: 'npm install shiki' },
		{ label: 'pnpm', lang: CODE_LANG.BASH, code: 'pnpm add shiki' },
		{ label: 'yarn', lang: CODE_LANG.BASH, code: 'yarn add shiki' }
	]

	const ACTIVE_TAB_OPTIONS: Array<IOptions<string>> = installItems.map((item) => ({ label: item.label, value: item.label }))
</script>

<docs lang="md" src="@docs/components/CodeGroup/OrigamCodeGroup.md"/>
