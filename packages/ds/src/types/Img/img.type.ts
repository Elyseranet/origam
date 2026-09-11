import OrigamImg from '../../components/Img/OrigamImg.vue'

import { CROSS_ORIGIN, IMG_STATE, REFERRER_POLICY } from '../../enums/Img/img.enum'

export type TCrossOrigin = `${CROSS_ORIGIN}` | ''

export type TReferrerPolicy = `${REFERRER_POLICY}`

export type TImgState = `${IMG_STATE}`

export type TOrigamImg = InstanceType<typeof OrigamImg>
