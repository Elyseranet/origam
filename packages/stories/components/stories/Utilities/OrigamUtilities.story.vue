<template>
	<Story
			group="stylesAndDesignTokens"
			title="Utilities/Global classes"
			:layout="{ type: 'single', iframe: true }"
	>

		<Variant title="Default">
			<template #default>
				<div style="display: flex; flex-direction: column; gap: 24px; padding: 16px;">
					<div>
						<h4 style="margin: 0 0 8px;">Foreground color (.origam--color-*)</h4>
						<div :style="rowStyle">
							<div v-for="intent in intents" :key="`pg-fg-${intent}`" :class="`origam--color-${intent}`" :style="swatchStyle">.origam--color-{{ intent }}</div>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 8px;">Background color (.origam--bg-*)</h4>
						<div :style="rowStyle">
							<div v-for="intent in intents" :key="`pg-bg-${intent}`" :class="`origam--bg-${intent}`" :style="bgSwatchStyle">.origam--bg-{{ intent }}</div>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 8px;">Elevation (.origam--shadow-*)</h4>
						<div :style="rowStyle">
							<div v-for="rung in shadows" :key="`pg-sh-${rung}`" :class="`origam--shadow-${rung}`" :style="swatchStyle">.origam--shadow-{{ rung }}</div>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 8px;">Border radius (.origam--rounded-*)</h4>
						<div :style="rowStyle">
							<div v-for="rung in roundeds" :key="`pg-r-${rung}`" :class="`origam--rounded-${rung}`" :style="swatchStyle">.origam--rounded-{{ rung }}</div>
						</div>
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Foreground color (.origam--color-*)">
			<template #default>
				<div :style="rowStyle">
					<div
							v-for="intent in intents"
							:key="`fg-${intent}`"
							:class="`origam--color-${intent}`"
							:style="swatchStyle"
							:data-cy="`util-color-${intent}`"
					>
						.origam--color-{{ intent }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Background color (.origam--bg-*)">
			<template #default>
				<div :style="rowStyle">
					<div
							v-for="intent in intents"
							:key="`bg-${intent}`"
							:class="`origam--bg-${intent}`"
							:style="bgSwatchStyle"
							:data-cy="`util-bg-${intent}`"
					>
						.origam--bg-{{ intent }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Elevation (.origam--shadow-*)">
			<template #default>
				<div :style="rowStyle">
					<div
							v-for="level in shadows"
							:key="`shadow-${level}`"
							:class="`origam--shadow-${level}`"
							:style="cardStyle"
							:data-cy="`util-shadow-${level}`"
					>
						.origam--shadow-{{ level }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Border radius (.origam--rounded-*)">
			<template #default>
				<div :style="rowStyle">
					<div
							v-for="r in roundeds"
							:key="`rounded-${r}`"
							:class="`origam--rounded-${r}`"
							:style="roundedSwatchStyle"
							:data-cy="`util-rounded-${r}`"
					>
						{{ r }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Border width (.origam--border-*)">
			<template #default>
				<div :style="rowStyle">
					<div
							v-for="b in borders"
							:key="`border-${b}`"
							:class="`origam--border-${b}`"
							:style="borderSwatchStyle"
							:data-cy="`util-border-${b}`"
					>
						.origam--border-{{ b }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Padding (.origam--p-*)">
			<template #default>
				<div :style="stackStyle">
					<div
							v-for="n in spaces"
							:key="`p-${n}`"
							:class="`origam--p-${n}`"
							:style="paddingFrameStyle"
							:data-cy="`util-p-${n}`"
					>
						<span :style="innerBlockStyle">.origam--p-{{ n }}</span>
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Margin (.origam--m-*)">
			<template #default>
				<div :style="marginFrameWrapStyle">
					<div
							v-for="n in spaces"
							:key="`m-${n}`"
							:class="`origam--m-${n}`"
							:style="marginFrameStyle"
							:data-cy="`util-m-${n}`"
					>
						.origam--m-{{ n }}
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Gap (.origam--gap-*)">
			<template #default>
				<div :style="stackStyle">
					<div
							v-for="n in spaces"
							:key="`gap-${n}`"
							:class="`origam--gap-${n}`"
							style="display: flex;"
							:data-cy="`util-gap-${n}`"
					>
						<span :style="gapBoxStyle">A</span>
						<span :style="gapBoxStyle">B</span>
						<span :style="gapBoxStyle">C</span>
						<span :style="gapLabelStyle">.origam--gap-{{ n }}</span>
					</div>
				</div>
			</template>
		</Variant>

		<Variant title="Font size (.origam--text-*)">
			<template #default>
				<div :style="stackStyle">
					<div
							v-for="size in textSizes"
							:key="`text-${size}`"
							:class="`origam--text-${size}`"
							:data-cy="`util-text-${size}`"
					>
						.origam--text-{{ size }} — The quick brown fox.
					</div>
				</div>
			</template>
		</Variant>
	</Story>
</template>

<script lang="ts" setup>
// SCREAMING_SNAKE constants for the matrix the story renders. These mirror
// the manifest declared in `scripts/build-tokens.mjs > UTILITY_GROUPS`.
// If a class is added/removed from the generator, update this list (and the
// matching Playwright spec under `tests/e2e/utilities.spec.ts` once Phase 4
// ships) so the visual scaffold stays accurate.

const intents = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const
const shadows = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const
const roundeds = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const
const borders = ['none', 'thin', 'thick'] as const
const spaces = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12'] as const
const textSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

// Layout primitives — kept inline (and intentionally NOT going through the
// utility classes themselves) to avoid hiding regressions: the swatch
// scaffolding must work even if a utility CSS rule is broken.
const rowStyle = 'display: flex; flex-wrap: wrap; gap: 12px; padding: 16px;'
const stackStyle = 'display: flex; flex-direction: column; gap: 12px; padding: 16px;'

const swatchStyle = 'min-width: 160px; padding: 12px 16px; background: #fafafa; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 13px;'
// No hardcoded `color` / `text-shadow`: `.origam--bg-*` now carries its own
// paired on-intent foreground, so the swatch demonstrates the real pairing a
// consumer gets. Hardcoding white here painted white-on-#f5f5f5 for
// `secondary` and white-on-white for `neutral` (#818).
const bgSwatchStyle = 'min-width: 160px; padding: 16px; border-radius: 4px; font-family: monospace; font-size: 13px;'
const cardStyle = 'min-width: 140px; padding: 20px; background: #fff; border-radius: 8px; font-family: monospace; font-size: 13px; text-align: center;'
const roundedSwatchStyle = 'min-width: 100px; min-height: 100px; display: flex; align-items: center; justify-content: center; background: #c4b5fd; color: #4c1d95; font-family: monospace; font-size: 13px; font-weight: 600;'
const borderSwatchStyle = 'min-width: 140px; padding: 12px 16px; background: #fff; border-color: #7c3aed; font-family: monospace; font-size: 13px;'
const paddingFrameStyle = 'background: #ede9fe; border: 1px dashed #7c3aed; font-family: monospace; font-size: 13px; max-width: 480px;'
const innerBlockStyle = 'display: block; background: #fff; padding: 4px 6px; border-radius: 2px;'

const marginFrameWrapStyle = 'background: #f5f5f5; padding: 16px; max-width: 600px;'
const marginFrameStyle = 'background: #ede9fe; border: 1px dashed #7c3aed; padding: 8px; font-family: monospace; font-size: 13px;'

const gapBoxStyle = 'background: #c4b5fd; color: #4c1d95; padding: 4px 10px; border-radius: 2px; font-family: monospace; font-size: 13px;'
const gapLabelStyle = 'align-self: center; padding-left: 12px; font-family: monospace; font-size: 12px; color: #555;'
</script>
