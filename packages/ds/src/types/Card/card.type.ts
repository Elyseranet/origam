import OrigamCard from '../../components/Card/OrigamCard.vue'

import { CARD_CONTENT_DISPLAY, CARD_TYPE } from '../../enums/Card/card.enum'

export type TCardType = `${CARD_TYPE}`

export type TCardContentDisplay = `${CARD_CONTENT_DISPLAY}`

export type TOrigamCard = InstanceType<typeof OrigamCard>
