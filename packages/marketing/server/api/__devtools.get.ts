// TEMPORARY instrument for #248 — inspects the global devtools plugin queue.
export default defineEventHandler(() => {
    const list = (globalThis as never as { __VUE_DEVTOOLS_PLUGINS__?: unknown[] }).__VUE_DEVTOOLS_PLUGINS__
    if (!Array.isArray(list)) return { present: false }
    const byId: Record<string, number> = {}
    for (const e of list) {
        const id = (e as { pluginDescriptor?: { id?: string } })?.pluginDescriptor?.id ?? '(no id)'
        byId[id] = (byId[id] ?? 0) + 1
    }
    return { present: true, length: list.length, byId }
})
