<template>
	<Story
			group="components"
			title="Code/OrigamCode"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICodeProps>>({
					lang: CODE_LANG.TS,
					color: undefined,
					bgColor: undefined,
					rounded: undefined,
					elevation: undefined,
					border: undefined,
					borderColor: undefined,
					borderStyle: undefined,
					width: undefined,
					height: undefined,
					maxHeight: undefined,
					fontFamily: undefined,
					fontSize: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-code
						:lang="state.lang"
						:padding="state.padding"
						:margin="state.margin"
						:color="state.color"
						:bg-color="state.bgColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:width="state.width"
						:height="state.height"
						:max-height="state.maxHeight"
						:font-family="state.fontFamily"
						:font-size="state.fontSize"
						:line-height="state.lineHeight"
						:code="shortSnippet"
						line-numbers
						filename="design.ts"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Language">
					<HstSelect v-model="state.lang" title="Lang" :options="CODE_LANG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
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
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"     title="Width"/>
					<HstText v-model="state.height"    title="Height"/>
					<HstText v-model="state.maxHeight" title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICodeProps>>({
					lang: CODE_LANG.TS,
					lineNumbers: true,
					highlightLines: '',
					copyable: true,
					wrap: false,
					format: false,
					filename: 'App.ts',
					tag: 'figure',
					maxHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-code
						:lang="state.lang"
						:line-numbers="state.lineNumbers"
						:highlight-lines="state.highlightLines || undefined"
						:copyable="state.copyable"
						:wrap="state.wrap"
						:format="state.format"
						:filename="state.filename"
						:tag="state.tag"
						:max-height="state.maxHeight"
						:code="tenLineSnippet"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.lineNumbers" title="Line Numbers"/>
					<HstCheckbox v-model="state.copyable"    title="Copyable"/>
					<HstCheckbox v-model="state.wrap"        title="Wrap"/>
					<HstCheckbox v-model="state.format"      title="Format (v3 stub)"/>
				</StoryGroup>
				<StoryGroup title="Content">
					<HstSelect v-model="state.lang"     title="Lang"     :options="CODE_LANG_OPTIONS"/>
					<HstText   v-model="state.filename" title="Filename"/>
					<HstText   v-model="state.highlightLines" title="Highlight Lines (e.g. '2,5-7')"/>
				</StoryGroup>
				<StoryGroup title="Layout">
					<HstText v-model="state.maxHeight" title="Max Height (px, blank = none)"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Functional - No filename (lang badge header)">
			<origam-code
					:lang="CODE_LANG.BASH"
					copyable
					:code="installSnippet"
			/>
		</Variant>

		<Variant
				title="Functional - Compact (install pill)"
				:init-state="() => useStoryInitState<Partial<ICodeProps>>({
					lang: CODE_LANG.BASH,
					prompt: '$',
					copyable: true
				})"
		>
			<template #default="{ state }">
				<origam-code
						compact
						:lang="state.lang"
						:prompt="state.prompt"
						:copyable="state.copyable"
						:code="installSnippet"
						@copy="logEvent('copy', $event)"
				/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Compact">
					<HstSelect   v-model="state.lang"     title="Lang"     :options="CODE_LANG_OPTIONS"/>
					<HstText     v-model="state.prompt"   title="Prompt (decorative, not copied)"/>
					<HstCheckbox v-model="state.copyable" title="Copyable"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - copy">
			<origam-code
					:lang="CODE_LANG.TS"
					:code="shortSnippet"
					copyable
					filename="copy-event.ts"
					@copy="logEvent('copy', $event)"
			/>
		</Variant>

		<Variant title="Slots - Default">
			<origam-code :lang="CODE_LANG.TS">{{ shortSnippet }}</origam-code>
		</Variant>

		<Variant title="Slots - Header">
			<origam-code :lang="slotHeaderState.lang" :code="vueSnippet" copyable filename="App.vue">
				<template #header="{ filename, copy, copied }">
					<span style="font-weight: 600;">{{ filename }}</span>
					<div style="display: inline-flex; gap: 0.5rem; align-items: center;">
						<select v-model="slotHeaderState.lang" style="font-size: 0.75rem;">
							<option v-for="opt in CODE_LANG_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
						</select>
						<button type="button" style="font-size: 0.75rem; cursor: pointer;" @click="copy">
							{{ copied ? 'Done!' : 'Copy snippet' }}
						</button>
					</div>
				</template>
			</origam-code>
		</Variant>

		<Variant title="Slots - Footer">
			<origam-code :lang="CODE_LANG.TS" :code="shortSnippet" filename="footer-slot.ts">
				<template #footer>
					<p style="font-size: 0.75rem; margin: 0.5rem 0 0; color: var(--origam-color-surface-variant, #666);">
						Source: <cite>origam design system</cite>
					</p>
				</template>
			</origam-code>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICodeProps>({
					lang: CODE_LANG.TS,
					lineNumbers: true,
					highlightLines: '2',
					copyable: true,
					maxHeight: undefined,
					wrap: false,
					format: false,
					compact: false,
					prompt: undefined,
					filename: 'App.ts',
					fontFamily: undefined,
					fontSize: undefined,
					lineHeight: undefined
				})"
		>
			<template #default="{ state }">
				<origam-code v-bind="state" :code="playgroundSnippet" @copy="logEvent('copy', $event)"/>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstSelect v-model="state.lang"           title="Lang"             :options="CODE_LANG_OPTIONS"/>
					<HstText   v-model="state.filename"       title="Filename"/>
					<HstText   v-model="state.highlightLines" title="Highlight Lines"/>
					<HstText   v-model="state.maxHeight"      title="Max Height"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.color"     title="Color"     :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor"   title="Bg Color"  :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"    title="Border"    :options="BORDER_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.lineNumbers" title="Line Numbers"/>
					<HstCheckbox v-model="state.copyable"    title="Copyable"/>
					<HstCheckbox v-model="state.wrap"        title="Wrap"/>
					<HstCheckbox v-model="state.format"      title="Format (v3 stub)"/>
					<HstCheckbox v-model="state.compact"     title="Compact (pill)"/>
					<HstText     v-model="state.prompt"      title="Prompt (decorative)"/>
				</StoryGroup>
			</template>
		</Variant>
	</Story>
</template>

<script
		lang="ts"
		setup
>
	import { reactive } from 'vue'

	import { logEvent } from 'histoire/client'

	import { OrigamCode } from '@origam/components'
	import { CODE_LANG } from '@origam/enums'
	import type { ICodeProps, IOptions } from '@origam/interfaces'
	import type { TCodeLang } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_FAMILY_OPTIONS,
		FONT_SIZE_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const CODE_LANG_OPTIONS: Array<IOptions<TCodeLang>> = [
		{ label: 'plaintext', value: CODE_LANG.PLAINTEXT },
		{ label: 'vue', value: CODE_LANG.VUE },
		{ label: 'ts', value: CODE_LANG.TS },
		{ label: 'js', value: CODE_LANG.JS },
		{ label: 'tsx', value: CODE_LANG.TSX },
		{ label: 'jsx', value: CODE_LANG.JSX },
		{ label: 'scss', value: CODE_LANG.SCSS },
		{ label: 'css', value: CODE_LANG.CSS },
		{ label: 'json', value: CODE_LANG.JSON },
		{ label: 'bash', value: CODE_LANG.BASH },
		{ label: 'html', value: CODE_LANG.HTML },
		{ label: 'xml', value: CODE_LANG.XML },
		{ label: 'yaml', value: CODE_LANG.YAML },
		{ label: 'md', value: CODE_LANG.MD }
	]

	const playgroundSnippet = `const greet = (name: string): string => {
  return \`Hello, \${name}!\`
}

console.log(greet('origam'))`

	const installSnippet = 'npm install origam'

	const shortSnippet = `import { ref, computed } from 'vue'

// derived state
const count = ref(0)
const double = computed(() => count.value * 2)`

	const tenLineSnippet = `import { defineStore } from 'pinia'

export const useCounter = defineStore('counter', {
  state: () => ({ value: 0 }),
  getters: {
    double: (state) => state.value * 2
  },
  actions: {
    increment () { this.value++ },
    reset () { this.value = 0 }
  }
})`

	const vueSnippet = `<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ user: { name: string, email: string } }>()
<\/script>`

	const slotHeaderState = reactive({ lang: CODE_LANG.VUE as TCodeLang })
</script>

<docs lang="md" src="@docs/components/Code/OrigamCode.md"/>
