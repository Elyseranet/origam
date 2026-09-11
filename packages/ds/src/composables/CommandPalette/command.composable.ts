import { computed, type ComputedRef, ref, type Ref } from 'vue'

import type { ICommand } from '../../interfaces'

import { tryOnScopeDispose } from '../../utils'

/*********************************************************
 * Singleton registry
 *
 * @description
 * `useCommand` exposes a process-wide command registry. We deliberately
 * use module-scope state (not provide/inject) because the palette
 * needs to spawn commands from anywhere — feature code, plugins,
 * background services — without coupling to a Vue tree.
 *
 * Reactivity is preserved through plain `ref()` references. Two
 * callers on the same module instance see the exact same list.
 ********************************************************/

interface ICommandRegistry {
    /** Live array of registered commands. Dedup by id is enforced at write time. */
    items: Ref<Array<ICommand>>
    /** Whether the global palette singleton is currently open. */
    isOpen: Ref<boolean>
}

const REGISTRY: ICommandRegistry = {
    items: ref<Array<ICommand>>([]),
    isOpen: ref<boolean>(false)
}

const upsert = (cmd: ICommand): void => {
    const idx = REGISTRY.items.value.findIndex(item => item.id === cmd.id)

    if (idx === -1) {
        REGISTRY.items.value.push(cmd)
    } else {
        // Replace in place so the array reference stays the same; that
        // way subscribers watching `length` only see one mutation.
        REGISTRY.items.value.splice(idx, 1, cmd)
    }
}

const removeById = (id: string): void => {
    const idx = REGISTRY.items.value.findIndex(item => item.id === id)

    if (idx !== -1) REGISTRY.items.value.splice(idx, 1)
}

/*********************************************************
 * useCommand
 ********************************************************/

export interface IUseCommandReturn {
    /**
     * Register a command. Returns an `unregister()` closure so callers
     * can drop the entry imperatively. When called from inside a Vue
     * effect scope, the entry is auto-unregistered on scope dispose
     * (component unmount, route leave, …) via `tryOnScopeDispose`.
     */
    register: (cmd: ICommand) => () => void
    /** Drop the entry with the matching `id`. No-op if unknown. */
    unregister: (id: string) => void
    /**
     * Reactive read-only view of every registered command, deduplicated
     * by id.
     */
    commands: ComputedRef<ReadonlyArray<ICommand>>
    /** Open the global palette singleton. */
    open: () => void
    /** Close the global palette singleton. */
    close: () => void
    /** Reactive open/close state of the global palette singleton. */
    isOpen: Ref<boolean>
}

export function useCommand (): IUseCommandReturn {
    const register = (cmd: ICommand): () => void => {
        upsert(cmd)

        const dispose = () => removeById(cmd.id)

        // Auto-cleanup when the caller lives inside a Vue effect scope
        // (component setup, custom scope). Silently no-ops outside one,
        // matching the behaviour of `tryOnScopeDispose`.
        tryOnScopeDispose(dispose)

        return dispose
    }

    const unregister = (id: string): void => removeById(id)

    const commands = computed<ReadonlyArray<ICommand>>(() => REGISTRY.items.value)

    const open = (): void => {
        REGISTRY.isOpen.value = true
    }

    const close = (): void => {
        REGISTRY.isOpen.value = false
    }

    return {
        register,
        unregister,
        commands,
        open,
        close,
        isOpen: REGISTRY.isOpen
    }
}

/*********************************************************
 * Test helper
 *
 * @description
 * Vitest needs to wipe the singleton between specs so the registry
 * does not leak between cases. Not part of the public surface — do
 * not import in product code.
 ********************************************************/

export function resetCommandRegistryForTesting (): void {
    REGISTRY.items.value = []
    REGISTRY.isOpen.value = false
}
