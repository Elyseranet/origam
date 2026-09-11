<template>
	<Story
			group="components"
			title="Calendar/OrigamCalendar"
	>

		<Variant
				title="Design"
				:init-state="() => useStoryInitState<Partial<ICalendarComponentProps> & { dsLocale?: string }>({
					view: 'month',
					currentDate: FIXTURE_REFERENCE_DATE,
					firstDayOfWeek: 1,
					timeFormat: '24h',
					locale: 'en-US',
					weekendHighlight: true,
					showWeekNumbers: false,
					dayStartHour: 0,
					dayEndHour: 24,
					slotDuration: 30,
					dsLocale: 'en'
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<locale-wrapper :locale="state.dsLocale">
						<origam-calendar
								:view="state.view"
								:current-date="state.currentDate"
								:first-day-of-week="Number(state.firstDayOfWeek)"
								:time-format="state.timeFormat"
								:locale="state.locale"
								:weekend-highlight="state.weekendHighlight"
								:show-week-numbers="state.showWeekNumbers"
								:day-start-hour="Number(state.dayStartHour)"
								:day-end-hour="Number(state.dayEndHour)"
								:slot-duration="Number(state.slotDuration)"
								:color="state.color"
								:bg-color="state.bgColor"
								:density="state.density"
								:rounded="state.rounded"
								:elevation="state.elevation"
								:border="state.border"
								:border-color="state.borderColor"
								:border-style="state.borderStyle"
								:width="state.width"
								:height="state.height"
								:padding="state.padding"
								:margin="state.margin"
								:events="FIXTURE_EVENTS"
								:category-colors="CATEGORY_COLORS"
						/>
					</locale-wrapper>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="View">
					<HstSelect v-model="state.view" title="View" :options="VIEW_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Color">
					<HstSelect v-model="state.color"   title="Color"    :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.bgColor" title="Bg Color" :options="COLOR_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Sizing">
					<HstSelect v-model="state.density" title="Density" :options="DENSITY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Shape">
					<HstSelect v-model="state.rounded"   title="Rounded"   :options="ROUNDED_OPTIONS"/>
					<HstSelect v-model="state.elevation" title="Elevation" :options="ELEVATION_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Border">
					<HstSelect v-model="state.border"      title="Border"       :options="BORDER_OPTIONS"/>
					<HstSelect v-model="state.borderColor" title="Border Color" :options="COLOR_OPTIONS"/>
					<HstSelect v-model="state.borderStyle" title="Border Style" :options="BORDER_STYLE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Dimension">
					<HstText v-model="state.width"  title="Width"/>
					<HstText v-model="state.height" title="Height"/>
				</StoryGroup>
				<StoryGroup title="Spacing">
					<HstText v-model="state.padding" title="Padding"/>
					<HstText v-model="state.margin"  title="Margin"/>
				</StoryGroup>
				<StoryGroup title="Localisation">
					<HstSelect v-model="state.firstDayOfWeek" title="First Day Of Week" :options="FIRST_DAY_OPTIONS"/>
					<HstSelect v-model="state.timeFormat"     title="Time Format"       :options="TIME_FORMAT_OPTIONS"/>
					<HstSelect v-model="state.locale"         title="Locale (date format)" :options="LOCALE_OPTIONS"/>
					<HstSelect v-model="state.dsLocale"       title="Language (en/fr)"     :options="DS_LOCALE_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.weekendHighlight" title="Weekend Highlight"/>
					<HstCheckbox v-model="state.showWeekNumbers"  title="Show Week Numbers"/>
				</StoryGroup>
				<StoryGroup title="Timeline">
					<HstSelect v-model="state.slotDuration" title="Slot Duration (min)" :options="SLOT_DURATION_OPTIONS"/>
					<HstNumber v-model="state.dayStartHour" title="Day Start Hour" :min="0"  :max="23" :step="1"/>
					<HstNumber v-model="state.dayEndHour"   title="Day End Hour"   :min="1"  :max="24" :step="1"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant
				title="Functional"
				:init-state="() => useStoryInitState<Partial<ICalendarComponentProps>>({
					view: 'month',
					currentDate: FIXTURE_REFERENCE_DATE,
					selectable: true,
					eventColorKey: 'category',
					weekendHighlight: true,
					showWeekNumbers: false
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-calendar
							:view="state.view"
							:current-date="state.currentDate"
							:selectable="state.selectable"
							:event-color-key="state.eventColorKey"
							:weekend-highlight="state.weekendHighlight"
							:show-week-numbers="state.showWeekNumbers"
							:events="FIXTURE_EVENTS"
							:category-colors="CATEGORY_COLORS"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="Interaction">
					<HstCheckbox v-model="state.selectable" title="Selectable"/>
				</StoryGroup>
				<StoryGroup title="Events">
					<HstSelect v-model="state.eventColorKey" title="Event Color Key" :options="EVENT_COLOR_KEY_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Display">
					<HstCheckbox v-model="state.weekendHighlight" title="Weekend Highlight"/>
					<HstCheckbox v-model="state.showWeekNumbers"  title="Show Week Numbers"/>
				</StoryGroup>
				<StoryGroup title="Bounds">
					<HstText v-model="state.minDate" title="Min Date (ISO / YYYY-MM-DD)"/>
					<HstText v-model="state.maxDate" title="Max Date (ISO / YYYY-MM-DD)"/>
				</StoryGroup>
			</template>
		</Variant>

		<Variant title="Events - event-click">
			<div class="story-shell" data-cy="cal-emit-event-click">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						:category-colors="CATEGORY_COLORS"
						data-cy="cal-emit-event-click-cal"
						@event-click="logEvent('event-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - date-click">
			<div class="story-shell" data-cy="cal-emit-date-click">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						data-cy="cal-emit-date-click-cal"
						@date-click="logEvent('date-click', $event)"
				/>
			</div>
		</Variant>

		<Variant title="Events - range-select">
			<div class="story-shell" data-cy="cal-emit-range-select">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="[]"
						data-cy="cal-emit-range-select-cal"
						@range-select="(start, end) => logEvent('range-select', { start, end })"
				/>
			</div>
		</Variant>

		<Variant title="Events - create-event-request">
			<div class="story-shell" data-cy="cal-emit-create-event-request">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="[]"
						data-cy="cal-emit-create-event-request-cal"
						@create-event-request="(start, end) => logEvent('create-event-request', { start, end })"
				/>
			</div>
		</Variant>

		<Variant
				title="Events - navigate"
				:init-state="() => useStoryInitState({ view: 'month', currentDate: FIXTURE_REFERENCE_DATE.toISOString(), navCount: 0 })"
		>
			<template #default="{ state }">
				<div class="story-shell" data-cy="cal-emit-navigate">
					<origam-calendar
							v-model:view="state.view"
							v-model:current-date="state.currentDate"
							:events="[]"
							data-cy="cal-emit-navigate-cal"
							@navigate="(dir) => { state.navCount++; logEvent('navigate', dir) }"
					/>
					<dl class="story-counters">
						<div><dt>@navigate fires</dt><dd data-cy="cal-emit-nav-count">{{ state.navCount }}</dd></div>
					</dl>
				</div>
			</template>
		</Variant>

		<Variant
				title="Events - view-change"
				:init-state="() => useStoryInitState({ view: 'month', currentDate: FIXTURE_REFERENCE_DATE.toISOString(), viewChangeCount: 0 })"
		>
			<template #default="{ state }">
				<div class="story-shell" data-cy="cal-emit-view-change">
					<origam-calendar
							v-model:view="state.view"
							v-model:current-date="state.currentDate"
							:events="[]"
							data-cy="cal-emit-view-change-cal"
							@view-change="(v) => { state.viewChangeCount++; logEvent('view-change', v) }"
					/>
					<dl class="story-counters">
						<div><dt>@view-change fires</dt><dd data-cy="cal-emit-view-change-count">{{ state.viewChangeCount }}</dd></div>
					</dl>
				</div>
			</template>
		</Variant>

		<Variant title="Slots - Header">
			<div class="story-shell" data-cy="cal-slot-header">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						data-cy="cal-slot-header-cal"
				>
					<template #header="{ view, title, canPrev, canNext, navigate, setView }">
						<div class="custom-header">
							<button type="button" :disabled="!canPrev" class="custom-header__btn" @click="navigate('prev')">&larr;</button>
							<strong class="custom-header__title">{{ title }}</strong>
							<button type="button" :disabled="!canNext" class="custom-header__btn" @click="navigate('next')">&rarr;</button>
							<span class="custom-header__view">view: {{ view }}</span>
							<button type="button" class="custom-header__btn" @click="setView('agenda')">Agenda</button>
						</div>
					</template>
				</origam-calendar>
			</div>
		</Variant>

		<Variant title="Slots - Event">
			<div class="story-shell" data-cy="cal-slot-event">
				<origam-calendar
						view="agenda"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						data-cy="cal-slot-event-cal"
				>
					<template #event="{ event, isPast: pastFlag }">
						<span class="custom-event" :class="{ 'custom-event--past': pastFlag }">
							<span class="custom-event__dot"/>
							<strong>{{ event.title }}</strong>
							<em>{{ event.category }}</em>
						</span>
					</template>
				</origam-calendar>
			</div>
		</Variant>

		<Variant title="Slots - Day">
			<div class="story-shell" data-cy="cal-slot-day">
				<origam-calendar
						view="month"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						data-cy="cal-slot-day-cal"
				>
					<template #day="{ date, events, isToday: todayFlag }">
						<div class="custom-day">
							<span :class="{ 'custom-day__today': todayFlag }">{{ date.getDate() }}</span>
							<span v-if="events.length > 0" class="custom-day__count" data-cy="custom-day-count">{{ events.length }}</span>
						</div>
					</template>
				</origam-calendar>
			</div>
		</Variant>

		<Variant title="Slots - DayHeader">
			<div class="story-shell" data-cy="cal-slot-day-header">
				<origam-calendar
						view="week"
						:current-date="FIXTURE_REFERENCE_DATE"
						:events="FIXTURE_EVENTS"
						data-cy="cal-slot-day-header-cal"
				>
					<template #dayHeader="{ date }">
						<div class="custom-day-header">
							<strong>{{ date.toLocaleDateString('en-US', { weekday: 'short' }) }}</strong>
							<span>{{ date.getDate() }}</span>
						</div>
					</template>
				</origam-calendar>
			</div>
		</Variant>

		<Variant title="Slots - Empty">
			<div class="story-shell" data-cy="cal-slot-empty">
				<origam-calendar
						view="agenda"
						:current-date="EMPTY_REFERENCE_DATE"
						:events="[]"
						data-cy="cal-slot-empty-cal"
				>
					<template #empty>
						<button type="button" class="custom-empty-cta" data-cy="custom-empty-cta">
							+ Create your first event
						</button>
					</template>
				</origam-calendar>
			</div>
		</Variant>

		<Variant
				title="Default"
				:init-state="() => useStoryInitState<ICalendarComponentProps>({
					view: 'month',
					currentDate: FIXTURE_REFERENCE_DATE,
					firstDayOfWeek: 1,
					timeFormat: '24h',
					locale: 'en-US',
					selectable: true,
					eventColorKey: 'category',
					weekendHighlight: true,
					showWeekNumbers: false,
					dayStartHour: 0,
					dayEndHour: 24,
					slotDuration: 30
				})"
		>
			<template #default="{ state }">
				<div class="story-shell">
					<origam-calendar
							v-bind="state"
							:events="FIXTURE_EVENTS"
							:category-colors="CATEGORY_COLORS"
							:first-day-of-week="Number(state.firstDayOfWeek)"
							:day-start-hour="Number(state.dayStartHour)"
							:day-end-hour="Number(state.dayEndHour)"
							:slot-duration="Number(state.slotDuration)"
							@event-click="logEvent('event-click', $event)"
							@date-click="logEvent('date-click', $event)"
					/>
				</div>
			</template>
			<template #controls="{ state }">
				<StoryGroup title="View">
					<HstSelect v-model="state.view" title="View" :options="VIEW_OPTIONS"/>
				</StoryGroup>
				<StoryGroup title="Design">
					<HstSelect v-model="state.firstDayOfWeek" title="First Day Of Week"   :options="FIRST_DAY_OPTIONS"/>
					<HstSelect v-model="state.timeFormat"     title="Time Format"         :options="TIME_FORMAT_OPTIONS"/>
					<HstSelect v-model="state.locale"         title="Locale" :options="LOCALE_OPTIONS"/>
					<HstSelect v-model="state.slotDuration"   title="Slot Duration (min)" :options="SLOT_DURATION_OPTIONS"/>
					<HstNumber v-model="state.dayStartHour"   title="Day Start Hour" :min="0"  :max="23" :step="1"/>
					<HstNumber v-model="state.dayEndHour"     title="Day End Hour"   :min="1"  :max="24" :step="1"/>
				</StoryGroup>
				<StoryGroup title="Functional">
					<HstCheckbox v-model="state.selectable"       title="Selectable"/>
					<HstCheckbox v-model="state.weekendHighlight" title="Weekend Highlight"/>
					<HstCheckbox v-model="state.showWeekNumbers"  title="Show Week Numbers"/>
					<HstSelect   v-model="state.eventColorKey"    title="Event Color Key" :options="EVENT_COLOR_KEY_OPTIONS"/>
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

	import { OrigamCalendar } from '@origam/components'
	import type { ICalendarComponentProps } from '@origam/interfaces'

	import LocaleWrapper from '@stories/components/_shared/LocaleWrapper.vue'
	import StoryGroup from '@stories/components/_shared/StoryGroup.vue'
	import { useStoryInitState } from '@stories/composables'
	import {
		BORDER_OPTIONS,
		BORDER_STYLE_OPTIONS,
		COLOR_OPTIONS,
		DENSITY_OPTIONS,
		ELEVATION_OPTIONS,
		LOCALE_OPTIONS,
		ROUNDED_OPTIONS
	} from '@stories/const'

	const DS_LOCALE_OPTIONS = [
		{ label: 'English (en)', value: 'en' },
		{ label: 'Français (fr)', value: 'fr' }
	]

	const VIEW_OPTIONS = [
		{ value: 'month',  label: 'month' },
		{ value: 'week',   label: 'week' },
		{ value: 'day',    label: 'day' },
		{ value: 'agenda', label: 'agenda' }
	]


	const FIRST_DAY_OPTIONS = [
		{ value: 0, label: 'Sunday (0)' },
		{ value: 1, label: 'Monday (1)' },
		{ value: 6, label: 'Saturday (6)' }
	]

	const TIME_FORMAT_OPTIONS = [
		{ value: '24h', label: '24h' },
		{ value: '12h', label: '12h' }
	]

	const SLOT_DURATION_OPTIONS = [
		{ value: 15, label: '15 min (fine)' },
		{ value: 30, label: '30 min (default)' },
		{ value: 60, label: '60 min (compact)' }
	]

	const EVENT_COLOR_KEY_OPTIONS = [
		{ value: 'category', label: 'category (default)' },
		{ value: 'color',    label: 'color (direct override)' }
	]

	const CATEGORY_COLORS: Record<string, string> = {
		meeting:  'primary',
		focus:    'success',
		personal: 'warning',
		offsite:  'danger',
		travel:   'info'
	}

	const FIXTURE_REFERENCE_DATE = new Date(2026, 4, 14)
	const EMPTY_REFERENCE_DATE   = new Date(2030, 0, 15)

	const FIXTURE_EVENTS = [
		{ id: 1,    title: 'Sprint planning',    start: new Date(2026, 4, 4,  10, 0),  end: new Date(2026, 4, 4,  11, 30), category: 'meeting' },
		{ id: 2,    title: 'Design review',      start: new Date(2026, 4, 6,  14, 0),  end: new Date(2026, 4, 6,  15, 0),  category: 'meeting' },
		{ id: 3,    title: 'Focus block',        start: new Date(2026, 4, 7,  9,  0),  end: new Date(2026, 4, 7,  12, 0),  category: 'focus' },
		{ id: 4,    title: 'Lunch with Cécile',  start: new Date(2026, 4, 8,  12, 30), end: new Date(2026, 4, 8,  13, 30), category: 'personal' },
		{ id: 5,    title: 'All-hands',          start: new Date(2026, 4, 11, 16, 0),  end: new Date(2026, 4, 11, 17, 0),  category: 'meeting' },
		{ id: 6,    title: 'Token sync',         start: new Date(2026, 4, 13, 10, 0),  end: new Date(2026, 4, 13, 10, 30), category: 'meeting' },
		{ id: 7,    title: 'Doctor appointment', start: new Date(2026, 4, 14, 8,  30),  end: new Date(2026, 4, 14, 9,  30), category: 'personal' },
		{ id: 8,    title: 'Pair programming',   start: new Date(2026, 4, 14, 14, 0),  end: new Date(2026, 4, 14, 16, 0),  category: 'focus' },
		{ id: 9,    title: 'Off-site Paris',     start: new Date(2026, 4, 15, 9,  0),  end: new Date(2026, 4, 15, 18, 0),  category: 'offsite' },
		{ id: 10,   title: 'Off-site Paris',     start: new Date(2026, 4, 16, 9,  0),  end: new Date(2026, 4, 16, 18, 0),  category: 'offsite' },
		{ id: 11,   title: 'Train to Lyon',      start: new Date(2026, 4, 18, 7,  30),  end: new Date(2026, 4, 18, 10, 0),  category: 'travel' },
		{ id: 12,   title: 'Demo day',           start: new Date(2026, 4, 20, 15, 0),  end: new Date(2026, 4, 20, 17, 0),  category: 'meeting' },
		{ id: 13,   title: 'Retrospective',      start: new Date(2026, 4, 22, 11, 0),  end: new Date(2026, 4, 22, 12, 0),  category: 'meeting' },
		{ id: 14,   title: 'Tokens hack',        start: new Date(2026, 4, 25, 9,  0),  end: new Date(2026, 4, 25, 17, 0),  category: 'focus' },
		{ id: 15,   title: 'Birthday',           start: new Date(2026, 4, 28, 19, 0),  category: 'personal', allDay: true }
	]
</script>

<style scoped>
	.story-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 1200px;
	}

	.story-counters {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font: 0.75rem/1.2 ui-monospace, monospace;
	}

	.story-counters > div {
		display: flex;
		gap: 8px;
		align-items: baseline;
	}

	.story-counters dt {
		font-weight: 600;
		color: var(--origam-color__action--primary---bg, #3b82f6);
		min-width: 180px;
	}

	.story-counters dd {
		margin: 0;
		color: var(--origam-color__text---secondary, #555);
	}

	.custom-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background-color: var(--origam-color__action--primary---bg, #3b82f6);
		color: var(--origam-color__action--primary---fg, #ffffff);
	}

	.custom-header__title {
		flex: 1 1 auto;
		text-align: center;
	}

	.custom-header__btn {
		all: unset;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		background-color: rgba(255, 255, 255, 0.2);
	}

	.custom-header__btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.custom-header__view {
		font-size: 0.75rem;
		opacity: 0.75;
	}

	.custom-event {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font: 0.875rem/1.2 system-ui, sans-serif;
	}

	.custom-event--past {
		opacity: 0.55;
	}

	.custom-event__dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background-color: currentColor;
	}

	.custom-day {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
	}

	.custom-day__today {
		font-weight: 700;
		text-decoration: underline;
	}

	.custom-day__count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		padding: 0 6px;
		border-radius: 11px;
		background-color: var(--origam-color__action--primary---bg, #3b82f6);
		color: var(--origam-color__action--primary---fg, #ffffff);
		font-size: 0.6875rem;
		font-weight: 600;
	}

	.custom-day-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 4px;
		font: 0.75rem/1.2 system-ui, sans-serif;
		color: var(--origam-color__action--primary---bg, #3b82f6);
	}

	.custom-empty-cta {
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 8px;
		background-color: var(--origam-color__action--primary---bg, #3b82f6);
		color: var(--origam-color__action--primary---fg, #ffffff);
		font: 600 0.875rem/1 system-ui, sans-serif;
		cursor: pointer;
	}
</style>

<docs
		lang="md"
		src="@docs/components/Calendar/OrigamCalendar.md"
/>
