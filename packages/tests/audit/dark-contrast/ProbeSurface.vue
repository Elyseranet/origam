<template>
	<div class="probe-surface">
		<origam-title :level="3" :text="lorem"/>

		<origam-alert :text="lorem" :title="lorem"/>

		<origam-badge :content="badgeContent">
			<origam-btn :text="lorem"/>
		</origam-badge>

		<origam-bottom-nav :items="navItems"/>

		<origam-breadcrumb :items="crumbItems"/>

		<origam-card :title="lorem" :text="lorem"/>

		<origam-chip :text="lorem"/>

		<origam-code :code="lorem"/>

		<origam-data-list :items="dataItems"/>

		<origam-expansion-panels :items="panelItems"/>

		<origam-field :label="lorem">
			<origam-input :model-value="lorem"/>
		</origam-field>

		<origam-kbd :text="kbdKey"/>

		<origam-label :text="lorem"/>

		<origam-list :items="listItems"/>

		<origam-list>
			<origam-list-subheader :title="lorem"/>
			<origam-list-group :title="lorem"/>
		</origam-list>

		<origam-snackbar-item :title="lorem" :message="lorem"/>

		<origam-stepper :items="stepItems"/>

		<origam-system-bar>{{ lorem }}</origam-system-bar>

		<origam-tabs :model-value="0">
			<origam-tab
					v-for="value in tabValues"
					:key="value"
					:value="value"
					:text="lorem"
			/>
		</origam-tabs>

		<origam-toolbar :title="lorem"/>

		<origam-tooltip
				:attach="true"
				:model-value="true"
				:text="lorem"
		>
			<template #activator="{ props: activatorProps }">
				<origam-btn
						v-bind="activatorProps"
						:text="lorem"
				/>
			</template>
		</origam-tooltip>
	</div>
</template>

<script
		lang="ts"
		setup
>
	import {
		PROBE_BADGE_CONTENT,
		PROBE_CRUMB_ITEMS,
		PROBE_DATA_ITEMS,
		PROBE_KBD_KEY,
		PROBE_LIST_ITEMS,
		PROBE_LOREM,
		PROBE_NAV_ITEMS,
		PROBE_PANEL_ITEMS,
		PROBE_STEP_ITEMS,
		PROBE_TAB_VALUES
	} from './probe-fixtures.const'

	const lorem = PROBE_LOREM
	const kbdKey = PROBE_KBD_KEY
	const badgeContent = PROBE_BADGE_CONTENT
	const navItems = PROBE_NAV_ITEMS
	const crumbItems = PROBE_CRUMB_ITEMS
	const dataItems = PROBE_DATA_ITEMS
	const listItems = PROBE_LIST_ITEMS
	const panelItems = PROBE_PANEL_ITEMS
	const stepItems = PROBE_STEP_ITEMS
	const tabValues = PROBE_TAB_VALUES
</script>

<style scoped>
	.probe-surface {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background-color: var(--origam-color__surface---default);
		color: var(--origam-color__text---primary);
	}
</style>
