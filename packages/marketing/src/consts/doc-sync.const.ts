/**
 * doc-sync.const.ts — static policy of the documentation sync (scripts/generate-api-docs.mjs, scripts/dump-db-fixture.mjs).
 */

export const ROLLBACK = '__ROLLBACK_CHECK__'

/*
 * ─── What each family's re-sync is allowed to claim ──────────────────────────
 *
 * A re-sync writes [SRC] columns. But "[SRC]" was calibrated on the four
 * families that were auto-derivable from day one; it does not hold column for
 * column on the four added here, and applying it blindly DESTROYS curated
 * content. Three cases, all measured against the catalogue:
 *
 *   • `doc_entry.signature` is [SRC], and for a DIRECTIVE it holds hand-written
 *     usage forms (`v-ripple.center`, `v-hover.callback="fn"`) that no
 *     declaration contains. A derived signature would overwrite all six.
 *   • `doc_entry.definition` is [SRC], and for a TYPE it is often the source
 *     line PLUS a hand-added expansion of the enum it interpolates
 *     (`TAudioLoopMode` carries the whole `AUDIO_LOOP_MODE` body). Re-deriving
 *     it strips that.
 *   • `doc_entry.parent_slug` is [SRC], and for a COMPONENT it is an editorial
 *     family grouping: it disagrees with the directory on 3 of the 188 live
 *     curated components (see `parentSlugOf` in extract-vue.mjs).
 *
 * So each family declares the columns and collections it can honestly derive.
 * Anything omitted is left exactly as the catalogue has it.
 *
 * `orphanEntries` is only set for families whose extractor enumerates the WHOLE
 * family from the filesystem, so "not seen" really does mean "deleted".
 */
export const RESYNC_POLICY = {
    // ── the four historical families: behaviour unchanged (defaults) ─────────
    enums: {},
    interfaces: {},
    consts: {},
    utils: {},

    // ── the four added here ──────────────────────────────────────────────────
    components: {
        entryCols: ['name', 'tag', 'source_file'],
        collections: ['props', 'emits', 'slots'],
        relations: false,
        orphanEntries: true,
    },
    /*
     * ⛔ `returns` is deliberately NOT claimed here, on measurement.
     *
     * A composable's curated `returns[]` lists what a consumer destructures.
     * The checker's properties-of-the-return-type is a DIFFERENT question, and
     * on the composables that hand back a foreign object the two diverge hard:
     * `useRouter` came out at 20 created / 10 orphaned (the members of vue-router's
     * `Router`, not the composable's own surface), `useDate` at 43 created,
     * `useInstalledThemes` at 35. Measured on the family: claiming `returns`
     * gives 804 created / 83 orphaned; leaving it alone gives 221 / 35.
     *
     * Claiming a column means being right about it. `params` is read from the
     * declaration and matches the curated rows; `returns` needs a model of what
     * the composable EXPOSES, which this extractor does not have. Left curated.
     *
     * The 35 parameter rows that still orphan are real disagreements between
     * the declaration and the hand-written doc, not extraction failures:
     * `useRouter`, `useHeaders` and `usePagination` take NO parameter at all
     * yet carry 4 curated rows each; `useGoTo` documents `options.duration`,
     * `options.easing`, … as separate rows under a single `_options` parameter.
     * They are soft-flagged, never deleted.
     */
    composables: {
        entryCols: ['name', 'source_file'],
        collections: ['params'],
        relations: false,
        orphanEntries: false,
    },
    directives: {
        entryCols: ['name', 'source_file'],
        collections: [],
        relations: false,
        orphanEntries: true,
    },
    types: {
        entryCols: ['name', 'source_file'],
        collections: ['values'],
        relations: false,
        orphanEntries: true,
    },
}

/**
 * The legacy file writer only ever knew the four original families — it has a
 * `mergers` entry and a `serialize` shape for each of them and for nothing
 * else. It is frozen on that set: the four families added to `DOMAINS` for the
 * DB re-sync are deliberately out of its reach, not silently half-supported.
 */
export const FILE_DOMAINS = ['enums', 'interfaces', 'consts', 'utils']

/**
 * Départage déterministe des lignes filles à `position` ÉGALE.
 *
 * ⛔ MESURÉ (#728) : `ORDER BY entry_id, position` seul ne suffit pas — plusieurs
 * lignes partagent la même `position` (les 4 relations d'un composant sont
 * toutes en `position = 0`, et `doc_prop` de `btn` a 3 paires de positions
 * dupliquées). Postgres est alors libre de les rendre dans n'importe quel ordre,
 * donc DEUX dumps de la MÊME base produisent des fichiers différents.
 *
 * Coût constaté : un re-dump sans le moindre changement de contenu produisait un
 * diff de 55 927 lignes, dont **zéro** changement réel (193 entrées comparées,
 * 0 différence après tri des tableaux). Une clé naturelle stable par table rend
 * le dump idempotent, donc le diff relisible.
 */
export const CHILD_TIEBREAK = Object.freeze({
    doc_prop:                'name',
    doc_value:               'value',
    doc_param:               'name',
    doc_return:              'name',
    doc_emit:                'event',
    doc_slot:                'slot',
    doc_example:             'title_fallback, title_key, lang',
    doc_directive_arg:       'name',
    doc_directive_modifier:  'name',
    doc_relation:            'rel_type, to_kind, to_slug',
})
