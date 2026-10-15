/*********************************************************
 * formatEmitPayload
 *
 * @description
 * One emit's arguments as a log line. Emit payloads are NOT scene values:
 * a native `Event`, a DOM node or a cyclic object routinely comes through
 * (`click:close` hands its `MouseEvent`), so this never throws — an `Event`
 * prints as its type, anything JSON refuses prints via `String()`.
 ********************************************************/
export function formatEmitPayload (args: unknown[]): string {
    return args.map(arg => {
        if (typeof Event !== 'undefined' && arg instanceof Event) return `[${arg.constructor.name} ${arg.type}]`
        if (typeof Node !== 'undefined' && arg instanceof Node) return `[${arg.nodeName}]`
        if (arg === undefined) return 'undefined'

        try {
            return JSON.stringify(arg) ?? String(arg)
        } catch {
            return String(arg)
        }
    }).join(', ')
}

/*********************************************************
 * formatLogTime
 *
 * @description
 * `HH:MM:SS.mmm` in UTC — a stable, locale-free stamp: the log is for
 * ordering emits that land within the same second, not for reading a date.
 ********************************************************/
export function formatLogTime (at: number): string {
    return new Date(at).toISOString().slice(11, 23)
}
