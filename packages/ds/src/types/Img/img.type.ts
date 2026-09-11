import { OrigamImg } from '../../components'

import { CROSS_ORIGIN, IMG_STATE, REFERRER_POLICY } from '../../enums'

export type TCrossOrigin = `${CROSS_ORIGIN}` | ''

export type TReferrerPolicy = `${REFERRER_POLICY}`

export type TImgState = `${IMG_STATE}`

export type TOrigamImg = InstanceType<typeof OrigamImg>
