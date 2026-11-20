/*********************************************************
 * trimBlankLines
 *
 * @description
 * Drops the leading and trailing line feeds of a code block given in a slot.
 * Index scan rather than `/\n+$/`, whose backtracking is quadratic on a text
 * holding many line feeds that are not at the end (Sonar S5852, #1388).
 ********************************************************/
export function trimBlankLines (text: string): string {
    let start = 0
    let end = text.length
    while (start < end && text[start] === '\n') start++
    while (end > start && text[end - 1] === '\n') end--

    return text.slice(start, end)
}
