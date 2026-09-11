import { OrigamFileField } from "../../components"

export type TFileSize = boolean | 1000 | 1024

export type TFile = Array<File> | File | null

/**
 * How a multi-file selection is rendered.
 *   - `'list'`    (default) — vertical card stack under the field.
 *   - `'chips'`   — each file as a closable `<OrigamChip>` inline.
 *   - `'counter'` — single "N files" line + an `<OrigamCounter>`.
 */
export type TFileFieldDisplay = 'list' | 'chips' | 'counter'

export type TOrigamFileField = InstanceType<typeof OrigamFileField>
