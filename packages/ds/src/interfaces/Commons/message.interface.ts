/*********************************************************
 * IMessageProps
 *
 * @description
 * The prop bag `useMessage` reads from — the `messages` / `errorMessages`
 * / `hint` triad shared by `OrigamForm` (and any future consumer that
 * wants the same "what should I display under the field" resolution).
 ********************************************************/
export interface IMessageProps {
    messages?: Array<string> | string
    errorMessages?: Array<string> | string
    hint?: string
}
