<template>
	<Story
			group="components"
			title="Blockquote/OrigamBlockquote"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<IBlockquoteProps>>({
					variant: 'default',
					color: undefined,
					accentColor: 'primary',
					align: 'left',
					lang: 'auto'
				})"
		>
			<template #default="{ state }">
				<origam-blockquote
						:variant="state.variant"
						:color="state.color"
						:accent-color="state.accentColor"
						:rounded="state.rounded"
						:elevation="state.elevation"
						:border="state.border"
						:border-color="state.borderColor"
						:border-style="state.borderStyle"
						:padding="state.padding"
						:margin="state.margin"
						:align="state.align"
						:lang="state.lang"
						:font-family="state.fontFamily"
						:font-size="state.fontSize"
						:font-weight="state.fontWeight"
						:line-height="state.lineHeight"
						author="Linus Torvalds"
						source="LKML, 2003"
						cite="https://lkml.org/lkml/2003/8/26/142"
				>
					Talk is cheap. Show me the code.
				</origam-blockquote>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Variant">
					<HstSelect v-model="state.variant" title="Variant" :options="BLOCKQUOTE_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.align"   title="Align"   :options="BLOCKQUOTE_ALIGN_OPTIONS"/>
					<HstSelect v-model="state.lang"    title="Lang"    :options="BLOCKQUOTE_LANG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"       title="Color (text)" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.accentColor" title="Accent Color" :options="INTENT_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
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
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<IBlockquoteProps>>({
					tag: 'blockquote',
					author: 'Linus Torvalds',
					source: 'LKML, 2003',
					cite: 'https://lkml.org/lkml/2003/8/26/142'
				})"
		>
			<template #default="{ state }">
				<origam-blockquote
						:tag="state.tag"
						:author="state.author"
						:source="state.source"
						:cite="state.cite"
						variant="default"
						color="primary"
				>
					Talk is cheap. Show me the code.
				</origam-blockquote>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Attribution">
					<HstText v-model="state.author" title="Author"/>
					<HstText v-model="state.source" title="Source"/>
					<HstText v-model="state.cite"   title="Cite (URL)"/>
				</StoryGroup>
				<StoryGroup title="Tag">
					<HstSelect v-model="state.tag" title="Tag" :options="TAG_OPTIONS"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Slots - Default">
			<origam-blockquote variant="default" author="Linus Torvalds" source="LKML, 2003">
				<em>Talk is cheap.</em> Show me the <strong>code</strong>.
			</origam-blockquote>
		</Variant>

		<Variant title="Slots - Author">
			<origam-blockquote
					variant="elegant"
					source="Stanford Commencement, 2005"
					cite="https://news.stanford.edu/2005/06/14/jobs-061505/"
			>
				Stay hungry. Stay foolish.

				<template #author>
					<a
							class="story-link"
							href="https://en.wikipedia.org/wiki/Steve_Jobs"
					>Steve Jobs</a>
				</template>
			</origam-blockquote>
		</Variant>

		<Variant title="Slots - Source">
			<origam-blockquote
					variant="default"
					author="René Descartes"
					color="success"
			>
				Je pense, donc je suis.

				<template #source>
					<a
							class="story-link"
							href="https://fr.wikipedia.org/wiki/Discours_de_la_m%C3%A9thode"
					>Discours de la méthode, 1637</a>
				</template>
			</origam-blockquote>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<IBlockquoteProps>({
					variant: 'default',
					color: undefined,
					accentColor: 'primary',
					align: 'left',
					lang: 'auto',
					author: 'Linus Torvalds',
					source: 'LKML, 2003',
					cite: 'https://lkml.org/lkml/2003/8/26/142',
					tag: 'blockquote'
				})"
		>
			<template #default="{ state }">
				<origam-blockquote v-bind="state">
					Talk is cheap. Show me the code.
				</origam-blockquote>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Content">
					<HstText v-model="state.author" title="Author"/>
					<HstText v-model="state.source" title="Source"/>
					<HstText v-model="state.cite"   title="Cite (URL)"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.variant"     title="Variant"      :options="BLOCKQUOTE_VARIANT_OPTIONS"/>
					<HstSelect v-model="state.color"       title="Color (text)" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.accentColor" title="Accent Color" :options="INTENT_OPTIONS"/>
					<HstSelect v-model="state.rounded"     title="Rounded"      :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation"   title="Elevation"    :options="ELEVATION_OPTIONS"/>
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.align"       title="Align"        :options="BLOCKQUOTE_ALIGN_OPTIONS"/>
					<HstSelect v-model="state.lang"        title="Lang"         :options="BLOCKQUOTE_LANG_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Typography">
					<HstSelect v-model="state.fontFamily" title="Font Family" :options="FONT_FAMILY_OPTIONS"/>
					<HstSelect v-model="state.fontSize"   title="Font Size"   :options="FONT_SIZE_OPTIONS"/>
					<HstSelect v-model="state.fontWeight" title="Font Weight" :options="FONT_WEIGHT_OPTIONS"/>
					<HstSelect v-model="state.lineHeight" title="Line Height" :options="LINE_HEIGHT_OPTIONS"/>
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
	import { OrigamBlockquote } from '@origam/components'

	import { BLOCKQUOTE_ALIGNS, BLOCKQUOTE_LANGS, BLOCKQUOTE_VARIANTS } from '@origam/consts'

	import type { IBlockquoteProps, IOptions } from '@origam/interfaces'

	import type { TBlockquoteAlign, TBlockquoteLang, TBlockquoteVariant } from '@origam/types'

	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		ELEVATION_OPTIONS,
		FONT_FAMILY_OPTIONS,
		FONT_SIZE_OPTIONS,
		FONT_WEIGHT_OPTIONS,
		INTENT_OPTIONS,
		LINE_HEIGHT_OPTIONS,
		ROUNDED_OPTIONS,
		TAG_OPTIONS
	} from '@stories/const'

	const BLOCKQUOTE_VARIANT_OPTIONS: Array<IOptions<TBlockquoteVariant>> = BLOCKQUOTE_VARIANTS.map(v => ({ label: v, value: v }))
	const BLOCKQUOTE_LANG_OPTIONS: Array<IOptions<TBlockquoteLang>> = BLOCKQUOTE_LANGS.map(v => ({ label: v, value: v }))
	const BLOCKQUOTE_ALIGN_OPTIONS: Array<IOptions<TBlockquoteAlign>> = BLOCKQUOTE_ALIGNS.map(v => ({ label: v, value: v }))
</script>

<style scoped>
	.story-link {
		color: var(--origam-color__action--primary---bg, #7c3aed);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}
</style>

<docs lang="md" src="@docs/components/Blockquote/OrigamBlockquote.md"/>
