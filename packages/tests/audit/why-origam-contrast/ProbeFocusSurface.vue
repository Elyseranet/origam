<template>
	<origam-app>
		<div class="probe-focus">
			<!--
				One BACKDROP block per semantic surface a focusable component can
				actually sit on. The ring is painted OUTSIDE the component's
				border box (`outline-offset` is POSITIVE on Btn and on
				SelectionControl — measured, see the audit header), so the colour
				immediately adjacent to the ring on BOTH sides is the background
				of whatever CONTAINS the component — never "the page" when the
				component lives in a card, a menu, a toolbar or an alert.

				The backdrops are painted from the SEMANTIC tokens themselves,
				which is what a real consumer surface resolves to:
				  • page          — the <origam-app> / <body> surface, no override
				  • raised        — `surface.raised`   (what OrigamCard paints)
				  • overlay       — `surface.overlay`  (what Menu / Dialog paint)
				  • sunken        — `surface.sunken`
				  • primary-aplat — `action.primary.bg` (a primary toolbar / banner)
				  • danger-subtle — `feedback.danger.bgSubtle` (an Alert body)
			-->
			<div
					v-for="backdrop in backdrops"
					:key="backdrop.name"
					:data-probe-backdrop="backdrop.name"
					:style="backdrop.style"
					class="probe-focus__backdrop"
			>
				<div :data-probe-focus="`${backdrop.name}/btn-flat-primary`">
					<origam-btn
							color="primary"
							variant="flat"
							:text="lorem"
					/>
				</div>

				<div :data-probe-focus="`${backdrop.name}/btn-outlined`">
					<origam-btn
							color="primary"
							variant="outlined"
							:text="lorem"
					/>
				</div>

				<div :data-probe-focus="`${backdrop.name}/switch`">
					<origam-switch
							:label="lorem"
							:model-value="false"
					/>
				</div>

				<!--
					⛔ `inline` is a BOOLEAN prop on `IFieldProps` — NOT a `variant`
					value. A first pass of this probe wrote `variant="inline"`, which
					paints nothing, and the audit duly reported NO-RING for every
					identity: a well-formed lie about a mechanism that does work.
					`inline` is the Field shape that actually CONSUMES
					`--origam-color__border---focus`, as a `box-shadow` underline
					(`OrigamField.vue`, `&--inline &--focused`).

					The DEFAULT shape's outline ring is
					`--origam-field---focus-ring-width: 0px` /
					`…-color: rgba(0,0,0,0)` (light.css) — OFF unless a theme turns it
					on (only `ecom`, `editorial`, `material` do), so `field-default`
					below legitimately reports NO-RING on the other five.
				-->
				<div :data-probe-focus="`${backdrop.name}/field-inline`">
					<origam-text-field
							inline
							:label="lorem"
					/>
				</div>
			</div>

			<!--
				Two mechanisms that are NOT an `outline`, kept on the two most
				common backdrops only — they answer a different question and must
				not be averaged into the outline rows.
			-->
			<div
					data-probe-backdrop="page"
					class="probe-focus__backdrop"
			>
				<div data-probe-focus="page/checkbox">
					<origam-checkbox
							:label="lorem"
							:model-value="false"
					/>
				</div>

				<div data-probe-focus="page/field-default">
					<origam-text-field :label="lorem"/>
				</div>
			</div>

			<div
					data-probe-backdrop="raised"
					class="probe-focus__backdrop"
					:style="raisedStyle"
			>
				<div data-probe-focus="raised/checkbox">
					<origam-checkbox
							:label="lorem"
							:model-value="false"
					/>
				</div>

				<div data-probe-focus="raised/field-default">
					<origam-text-field :label="lorem"/>
				</div>
			</div>
		</div>
	</origam-app>
</template>

<script
		lang="ts"
		setup
>
	import { PROBE_FOCUS_BACKDROPS, PROBE_LOREM } from './probe-fixtures.const'

	const lorem = PROBE_LOREM
	const backdrops = PROBE_FOCUS_BACKDROPS
	const raisedStyle = { backgroundColor: 'var(--origam-color__surface---raised)' }
</script>

<style scoped>
	.probe-focus {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 24px;
		padding: 32px;
	}

	.probe-focus__backdrop {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 24px;
		padding: 24px;
	}

	/*
	 * The ring paints OUTSIDE the component with a positive `outline-offset`,
	 * so a slot with no padding clips it out of the screenshot the audit takes
	 * per slot — the capture would show a component with no visible ring on
	 * correct code. The padding is inert for the colour measurement (the slot
	 * itself paints nothing) and only widens what the camera sees.
	 */
	.probe-focus__backdrop > [data-probe-focus] {
		padding: 10px;
	}
</style>
