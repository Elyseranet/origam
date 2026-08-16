/**
 * Layout mode of `<OrigamDataList>`.
 *
 * - `AVATAR` (default, back-compat) — the historical `<dl>` layout where
 *   each item stacks a `<dt>` (title) above one or more `<dd>` rows
 *   (text). The naming reflects the most common usage: a `prependAvatar`
 *   per title, with a stack of labels below.
 *
 * - `KV` — the PDF-aligned key/value table where each row renders a key
 *   on the left (muted) and a value on the right.
 */
export enum DATA_LIST_MODE {
    AVATAR = 'avatar',
    KV = 'kv'
}
