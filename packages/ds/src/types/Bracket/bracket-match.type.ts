import { BRACKET_MATCH_STATUS } from '../../enums'
import { OrigamBracketMatch } from '../../components'

export type TBracketMatchStatus = `${BRACKET_MATCH_STATUS}`

export type TOrigamBracketMatch = InstanceType<typeof OrigamBracketMatch>
