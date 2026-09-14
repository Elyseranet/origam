/**
 * Loader kind — decides which renderer is mounted by the consumer
 * component when a loading state is active.
 *
 * Deliberately distinct from `PROGRESS_TYPE` (`circular` / `linear`):
 * the loader vocabulary says `line` (not `linear`) and adds `skeleton`,
 * which has no progress counterpart. Merging the two would silently
 * widen every `loading` prop to a value its renderer cannot mount.
 */
export enum LOADER_KIND {
    LINE = 'line',
    CIRCULAR = 'circular',
    SKELETON = 'skeleton'
}
