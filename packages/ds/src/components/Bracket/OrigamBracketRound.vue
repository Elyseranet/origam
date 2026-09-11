<template>
	<component
			:is="tag"
			:id="resolvedId"
			:aria-labelledby="showRoundTitle ? titleId : undefined"
			:class="roundClasses"
			:style="roundStyles"
			role="group"
	>
		<h3
				v-if="showRoundTitle"
				:id="titleId"
				:style="typographyStyles"
				class="origam-bracket-round__title"
		>
			<slot
					name="round-title"
					:round="round"
					:index="index"
			>
				{{ round.title }}
			</slot>
		</h3>

		<div class="origam-bracket-round__matches">
			<slot
					v-for="(match, matchIndex) in round.matches"
					name="match"
					:match="match"
					:round="round"
					:is-final="isFinalRound && matchIndex === 0 && round.matches.length === 1"
			>
				<origam-bracket-match
						:key="match.id"
						:color="matchColor"
						:data-cy="`origam-bracket-match-${match.id}`"
						:data-match-id="match.id"
						:interactive="interactive"
						:is-final="isFinalRound && matchIndex === 0 && round.matches.length === 1"
						:match="match"
						:show-scores="showScores"
						:show-seed="showSeed"
						class="origam-bracket-round__match"
						@click="onMatchClick"
						@competitor-click="onCompetitorClick"
						@winner-click="onWinnerClick"
				>
					<template
							v-if="$slots.competitor"
							#competitor="scope"
					>
						<slot
								name="competitor"
								v-bind="scope"
						/>
					</template>
				</origam-bracket-match>
			</slot>
		</div>
	</component>
</template>

<script
		lang="ts"
		setup
>
	import { computed, StyleValue } from 'vue'

	import OrigamBracketMatch from './OrigamBracketMatch.vue'

	import { usePassedProps } from '../../composables/Commons/passedProps.composable'
	import { useProps } from '../../composables/Commons/props.composable'
	import { useTypography } from '../../composables/Commons/typography.composable'

	import { DIRECTION } from '../../enums/Commons/direction.enum'

	import type { IBracketCompetitor } from '../../interfaces/Bracket/bracket-competitor.interface'
	import type { IBracketMatch } from '../../interfaces/Bracket/bracket-match.interface'
	import type { IBracketRoundEmits, IBracketRoundProps, IBracketRoundSlots } from '../../interfaces/Bracket/bracket-round-component.interface'

	const props = withDefaults(defineProps<IBracketRoundProps>(), {
		tag: 'div',
		direction: DIRECTION.HORIZONTAL,
		showRoundTitle: true,
		showScores: true,
		showSeed: false,
		interactive: true,
		color: 'primary'
	})

	const emit = defineEmits<IBracketRoundEmits>()

	defineSlots<IBracketRoundSlots>()

	const {filterProps} = useProps<IBracketRoundProps>(props)

	const {typographyStyles} = useTypography(props, 'bracket-round-title')

	const resolvedId = computed(() => props.id ?? `origam-bracket-round-${props.round.id}`)
	const titleId = computed(() => `${resolvedId.value}-title`)

	/*********************************************************
	 * matchColor (#428)
	 *
	 * @description
	 * Same mechanism as `OrigamBracket.vue`'s `roundColor`, one level
	 * down: `props.color` here ALSO carries a hard `withDefaults`
	 * default (`'primary'`), so binding it straight onto every
	 * `<origam-bracket-match>` below always forwarded a concrete value —
	 * whether THIS Round's own consumer (which may be `OrigamBracket`
	 * itself, forwarding only when ITS consumer set `color` explicitly —
	 * see `roundColor`) actually passed one or not. Only an explicitly
	 * passed value cascades to Match; otherwise Match's own theme/default
	 * applies.
	 ********************************************************/
	const wasPropPassed = usePassedProps(props)
	const matchColor = computed(() => (wasPropPassed('color') ? props.color : undefined))

	const isFinalRound = computed<boolean>(() => props.index === props.totalRounds - 1)

	const onMatchClick = (match: IBracketMatch, event: MouseEvent) => {
		emit('match-click', match, event)
	}

	const onCompetitorClick = (competitor: IBracketCompetitor, match: IBracketMatch, side: 'A' | 'B', event: MouseEvent | KeyboardEvent) => {
		emit('competitor-click', competitor, match, side, event)
	}

	const onWinnerClick = (competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent) => {
		emit('winner-click', competitor, match, event)
	}

	const roundStyles = computed<StyleValue>(() => {
		return [props.style] as StyleValue
	})

	const roundClasses = computed(() => {
		return [
			'origam-bracket-round',
			`origam-bracket-round--direction-${props.direction}`,
			{
				'origam-bracket-round--final': isFinalRound.value,
				[`origam-bracket-round--side-${props.round.side}`]: !!props.round.side
			},
			props.class
		]
	})

	defineExpose({
		filterProps
	})
</script>

<style
		lang="scss"
		scoped
>
	.origam-bracket-round {
		display: flex;
		flex-direction: column;

		&__title {
			margin: 0 0 var(--origam-bracket-round-title---margin-block-end, 12px);
			color: var(--origam-bracket-round-title---color, var(--origam-color__text---secondary, rgba(0, 0, 0, 0.66)));
			font-size: var(--origam-bracket-round-title---font-size, 0.875rem);
			font-weight: var(--origam-bracket-round-title---font-weight, 600);
			letter-spacing: var(--origam-bracket-round-title---letter-spacing, 0.04em);
			text-transform: var(--origam-bracket-round-title---text-transform, uppercase);
			text-align: center;
		}

		&__matches {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			flex: 1 1 auto;
			gap: var(--origam-bracket-round---match-gap, 24px);
		}

		&__match {
			flex: 0 0 auto;
		}

		&--direction-vertical {
			flex-direction: column;

			.origam-bracket-round__matches {
				flex: 0 0 auto;
				flex-direction: row;
				justify-content: space-around;
				align-items: flex-start;
			}
		}
	}
</style>

<style>
	:root {
		--origam-bracket-round-title---margin-block-end: 12px;
		--origam-bracket-round-title---font-size: 0.875rem;
		--origam-bracket-round-title---font-weight: 600;
		--origam-bracket-round-title---letter-spacing: 0.04em;
		--origam-bracket-round-title---text-transform: uppercase;
	}
</style>
