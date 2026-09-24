<template>
	<origam-app>
		<div class="probe-surface">
			<div data-probe-part="card">
				<origam-card
						:title="lorem"
						:text="lorem"
				/>
			</div>

			<div data-probe-part="btn-primary">
				<origam-btn
						color="primary"
						variant="flat"
						:text="lorem"
				/>
			</div>

			<div data-probe-part="btn-outlined">
				<origam-btn
						color="primary"
						variant="outlined"
						:text="lorem"
				/>
			</div>

			<div data-probe-part="chip">
				<origam-chip :text="lorem"/>
			</div>

			<div data-probe-part="avatar">
				<origam-avatar
						color="primary"
						:text="initials"
				/>
			</div>

			<div data-probe-part="switch-off">
				<origam-switch
						:label="lorem"
						:model-value="false"
				/>
			</div>

			<div data-probe-part="switch-on">
				<origam-switch
						color="primary"
						:label="lorem"
						:model-value="true"
				/>
			</div>

			<!--
				#919 point 5 — la QA a explicitement dit NE PAS avoir mesuré
				disabled / error / indeterminate / l'anneau de focus. Ces trois
				probes couvrent les trois premiers (le focus est mesuré à part,
				via focus-ring.audit.mjs — un focus-visible réel ne se déclenche
				qu'au clavier, pas par un attribut statique sur ce probe).
			-->
			<div data-probe-part="switch-disabled">
				<origam-switch
						disabled
						:label="lorem"
						:model-value="false"
				/>
			</div>

			<div data-probe-part="switch-error">
				<origam-switch
						:error="true"
						:label="lorem"
						:model-value="false"
				/>
			</div>

			<div data-probe-part="switch-indeterminate">
				<origam-switch
						:indeterminate="true"
						:label="lorem"
						:model-value="false"
				/>
			</div>
		</div>
	</origam-app>
</template>

<script
		lang="ts"
		setup
>
	import { PROBE_INITIALS, PROBE_LOREM } from './probe-fixtures.const'

	const lorem = PROBE_LOREM
	const initials = PROBE_INITIALS
</script>

<style scoped>
	.probe-surface {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		padding: 32px;
	}
</style>
