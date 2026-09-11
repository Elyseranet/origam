import { BRACKET_MATCH_STATUS } from '../../enums/Bracket/bracket-match.enum'
import OrigamBracketMatch from '../../components/Bracket/OrigamBracketMatch.vue'

export type TBracketMatchStatus = `${BRACKET_MATCH_STATUS}`

export type TOrigamBracketMatch = InstanceType<typeof OrigamBracketMatch>
