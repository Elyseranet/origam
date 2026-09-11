import OrigamProgress from '../../components/Progress/OrigamProgress.vue'

import { PROGRESS_TYPE } from '../../enums/Progress/progress.enum'

export type TProgressType = `${PROGRESS_TYPE}`

export type TOrigamProgress = InstanceType<typeof OrigamProgress>
