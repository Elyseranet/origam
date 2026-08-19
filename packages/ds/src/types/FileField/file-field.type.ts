import OrigamFileField from '../../components/FileField/OrigamFileField.vue'
import { FILE_FIELD_DISPLAY } from '../../enums/FileField/file-field.enum'

export type TFileSize = boolean | 1000 | 1024

export type TFile = Array<File> | File | null

/**
 * How a multi-file selection is rendered.
 *   - `'list'`    (default) — vertical card stack under the field.
 *   - `'chips'`   — each file as a closable `<OrigamChip>` inline.
 *   - `'counter'` — single "N files" line + an `<OrigamCounter>`.
 */
export type TFileFieldDisplay = `${FILE_FIELD_DISPLAY}`

export type TOrigamFileField = InstanceType<typeof OrigamFileField>
