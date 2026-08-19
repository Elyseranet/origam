import OrigamCard from '../../components/Card/OrigamCard.vue'

import { CARD_TYPE } from '../../enums/Card/card.enum'

export type TCardType = `${CARD_TYPE}`

export type TOrigamCard = InstanceType<typeof OrigamCard>
