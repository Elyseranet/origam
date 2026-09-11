import { AUDIO_VARIANT } from '../../enums'

/**
 * String-typed equivalent of {@link AUDIO_VARIANT}. Lets callers pass
 * literal `'normal' | 'minimal'` strings on the SFC prop API while the
 * runtime still recognises the enum members.
 */
export type TAudioVariant = `${AUDIO_VARIANT}`
