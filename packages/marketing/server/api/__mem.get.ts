// TEMPORARY instrument for #248 — reports the Nitro dev WORKER's own heap.
import v8 from 'node:v8'
import vm from 'node:vm'
import { threadId, isMainThread } from 'node:worker_threads'

let gcFn: (() => void) | undefined
function forceGc () {
    if (!gcFn) {
        v8.setFlagsFromString('--expose_gc')
        gcFn = vm.runInNewContext('gc') as () => void
        v8.setFlagsFromString('--no-expose_gc')
    }
    // Two passes: the first frees, the second collects what the first unlinked.
    gcFn(); gcFn()
}

export default defineEventHandler((event) => {
    const q = getQuery(event)
    if (q.gc) forceGc()
    const hs = v8.getHeapStatistics()
    const mu = process.memoryUsage()
    let snapshot: string | undefined
    if (q.snapshot) snapshot = v8.writeHeapSnapshot(String(q.snapshot))
    return {
        threadId,
        isMainThread,
        pid: process.pid,
        heapUsedMB: +(mu.heapUsed / 1048576).toFixed(1),
        heapTotalMB: +(mu.heapTotal / 1048576).toFixed(1),
        rssMB: +(mu.rss / 1048576).toFixed(1),
        externalMB: +(mu.external / 1048576).toFixed(1),
        arrayBuffersMB: +(mu.arrayBuffers / 1048576).toFixed(1),
        heapSizeLimitMB: +(hs.heap_size_limit / 1048576).toFixed(1),
        nativeContexts: hs.number_of_native_contexts,
        detachedContexts: hs.number_of_detached_contexts,
        nodeOptions: process.env.NODE_OPTIONS ?? null,
        snapshot
    }
})
