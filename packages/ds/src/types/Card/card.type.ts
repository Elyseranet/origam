import { OrigamCard } from '../../components'

import { CARD_TYPE } from '../../enums'

export type TCardType = `${CARD_TYPE}`

export type TOrigamCard = InstanceType<typeof OrigamCard>
