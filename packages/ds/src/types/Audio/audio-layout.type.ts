import { AUDIO_LAYOUT } from '../../enums'

/**
 * String-typed equivalent of {@link AUDIO_LAYOUT}. Lets callers pass
 * literal `'normal' | 'minimal'` strings on the SFC prop API while the
 * runtime still recognises the enum members.
 */
export type TAudioLayout = `${AUDIO_LAYOUT}`
