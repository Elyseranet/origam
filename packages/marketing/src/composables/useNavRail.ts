/**
 * useNavRail — l'état du rail de navigation du catalogue (#1032).
 *
 * Un seul endroit décide : quelle famille on lit, ce que le panneau affiche,
 * quand le catalogue d'une famille part sur le réseau, et quelle forme le
 * panneau prend. Les composants ne font que rendre.
 *
 * ── Chargement : paresseux par famille (arbitrage du propriétaire) ─────────
 *
 * Mesuré le 2026-10-02 sur cette base, un appel par famille :
 *   component 163 Ko · composable 62 · directive 2 · interface 322 ·
 *   type 105 · enum 35 · const 134 · util 163  →  986 Ko pour tout charger.
 *
 * On ne charge donc QUE la famille dont le panneau s'ouvre, et une seule fois
 * par session (`CATALOG_CACHE`). Les pastilles du rail et la forme du panneau
 * viennent de `/api/reference/counts` — 644 octets mesurés pour les 8
 * familles, donc 1 530 fois moins que le catalogue complet.
 *
 * ⛔ Pas de `?locale=` sur les deux appels. Le rail n'affiche que `name`
 * (un identifiant de code : `OrigamBtn`, `IBtnProps`) et `category` (une
 * valeur brute, non traduisible — cf. le commentaire de
 * `server/api/reference/categories/[kind].get.ts`). Les `descriptionFallback`,
 * eux, sont localisés — mais le rail ne les lit pas. Transmettre la locale
 * diviserait le cache par le nombre de langues sans changer une valeur.
 *
 * ── Clavier : UN seul arrêt de tabulation par panneau ─────────────────────
 *
 * Le champ de filtre est le seul élément tabulable du corps du panneau ; les
 * entrées sont des ancres réelles qu'`OrigamListItem` sort du parcours de
 * tabulation (`tabindex="-2"` dès qu'il est dans une liste —
 * `OrigamListItem.vue:356-358`). On les atteint aux flèches, par focus réel.
 * Sans ça, ouvrir le panneau des interfaces ajouterait 972 arrêts de
 * tabulation à la page.
 */

import { computed, ref, shallowRef, watch } from 'vue'
import { useDisplay } from 'origam/composables'

import type {
    INavRailEntry,
    INavRailFamily,
    INavRailGroup
} from '~/interfaces/nav-rail.interface'
import type { TReferenceKind } from '~/types/api-reference.type'
import type {
    TNavRailPanel,
    TNavRailPanelShape,
    TNavRailStatus,
    TNavRailTier
} from '~/types/nav-rail.type'

import {
    NAV_RAIL_FAMILIES,
    NAV_RAIL_GROUP_MAX_CATEGORIES,
    NAV_RAIL_GROUP_MAX_ENTRIES,
    NAV_RAIL_RESULT_CAP
} from '~/consts/nav-rail.const'

interface ICatalogCount {
    total: number
    navigable: number
    categories: number
}

/**
 * Catalogues déjà rapatriés, par famille. Portée MODULE, donc partagée par
 * toutes les instances et conservée d'une navigation à l'autre : réouvrir le
 * panneau des interfaces ne repaie pas les 322 Ko.
 */
const CATALOG_CACHE = new Map<TReferenceKind, INavRailEntry[]>()

/** Familles dont l'appel a échoué, pour afficher l'état d'erreur sans boucler. */
const CATALOG_FAILED = new Set<TReferenceKind>()

export function useNavRail () {
    const route = useRoute()
    const { xs, sm, width, height } = useDisplay()

    /* ─── Palier d'affichage ───────────────────────────────────────────────
     * ⛔ `useDisplay().mobile` serait faux ici : son `mobileBreakpoint` par
     * défaut est `'lg'` (1280 px), donc vrai jusqu'à 1279 px. On lit les
     * seuils nommés, qui valent exactement 600 et 960.
     */
    const tier = computed<TNavRailTier>(() => {
        if (xs.value) return 'sheet'
        if (sm.value) return 'drawer'

        return 'rail'
    })

    /* ─── Dénombrements : un appel, 644 octets, partagé par toutes les pages ── */
    const { data: counts, error: countsError } = useFetch<Record<string, ICatalogCount>>(
        '/api/reference/counts',
        { key: 'nav-rail:counts', default: () => ({}) }
    )

    const hasCounts = computed(() => !countsError.value && Object.keys(counts.value ?? {}).length > 0)

    /**
     * Nombre de cibles d'une famille. `navigable`, pas `total` : les 124
     * composants membres d'une famille n'ont pas de page à eux, donc la
     * pastille des composants dit 94 et non 218.
     *
     * Rend `null` — jamais 0 — quand le dénombrement n'est pas arrivé : le
     * rail affiche alors ses cibles SANS pastille. Un « 0 » affirmerait que
     * la famille est vide, ce qui serait un mensonge pendant le chargement
     * comme en cas de panne.
     */
    const countFor = (kind: TReferenceKind): number | null => {
        const row = counts.value?.[kind]

        return row ? row.navigable : null
    }

    const categoriesFor = (kind: TReferenceKind): number | null => {
        const row = counts.value?.[kind]

        return row ? row.categories : null
    }

    /* ─── Où suis-je ───────────────────────────────────────────────────────
     * `route.path` porte TOUJOURS le préfixe de locale (`/fr/components/btn`)
     * alors que `family.route` est un chemin brut (`/components`). Comparer
     * les deux tels quels rendrait la détection morte hors locale par défaut
     * — le défaut exact corrigé par #809 sur la surbrillance de l'app bar.
     * On compare donc sur les SEGMENTS, ce qui est insensible au préfixe.
     */
    const pathSegments = computed(() => route.path.split('/').filter(Boolean))

    const currentFamily = computed<INavRailFamily | null>(() => {
        const segments = pathSegments.value

        for (const family of NAV_RAIL_FAMILIES) {
            const head = family.route.replace(/^\//, '')

            if (segments.includes(head)) return family
        }

        return null
    })

    /** Slug de l'entrée lue, quand on est sur une page de détail. */
    const currentSlug = computed<string | null>(() => {
        const family = currentFamily.value

        if (!family) return null

        const segments = pathSegments.value
        const head = family.route.replace(/^\//, '')
        const at = segments.indexOf(head)

        return at >= 0 && segments.length > at + 1 ? segments[at + 1] : null
    })

    /* ─── État d'ouverture ─────────────────────────────────────────────── */
    const panel = ref<TNavRailPanel>(null)
    const openKind = ref<TReferenceKind | null>(null)
    const query = ref('')
    /** Index de l'entrée sous le curseur clavier ; -1 = aucune. */
    const cursor = ref(-1)
    const entries = shallowRef<INavRailEntry[]>([])
    const status = ref<TNavRailStatus>('idle')

    const isOpen = computed(() => panel.value !== null)

    /** La famille dont le panneau est ouvert (≠ la famille de la page lue). */
    const openFamily = computed<INavRailFamily | null>(
        () => NAV_RAIL_FAMILIES.find(f => f.kind === openKind.value) ?? null
    )

    async function loadCatalog (kind: TReferenceKind) {
        const cached = CATALOG_CACHE.get(kind)

        if (cached) {
            entries.value = cached
            status.value = 'ready'

            return
        }

        status.value = 'loading'
        entries.value = []

        try {
            const raw = await $fetch<INavRailEntry[]>(`/api/reference/${kind}`)

            // Projection réduite : le rail n'affiche ni description ni icône,
            // donc il ne garde pas 322 Ko de texte en mémoire pour rien.
            const slim: INavRailEntry[] = (raw ?? [])
                .filter(e => !e.parentSlug)
                .map(e => ({ slug: e.slug, name: e.name, category: e.category ?? '' }))

            CATALOG_CACHE.set(kind, slim)
            CATALOG_FAILED.delete(kind)
            entries.value = slim
            status.value = 'ready'
        } catch {
            // ⛔ On n'affiche jamais « 0 entrée » sur un appel en échec : le
            // panneau bascule en état d'erreur et garde un chemin qui ne
            // dépend pas de lui — le lien vers l'index, rendu par le serveur.
            CATALOG_FAILED.add(kind)
            entries.value = []
            status.value = 'error'
        }
    }

    function openFamilyPanel (kind: TReferenceKind) {
        if (panel.value === 'family' && openKind.value === kind) {
            close()

            return
        }

        panel.value = 'family'
        openKind.value = kind
        query.value = ''
        cursor.value = -1
        void loadCatalog(kind)
    }

    function openPagesPanel () {
        if (panel.value === 'pages') {
            close()

            return
        }

        panel.value = 'pages'
        openKind.value = null
        query.value = ''
        cursor.value = -1
        status.value = 'ready'
    }

    function close () {
        panel.value = null
        openKind.value = null
        query.value = ''
        cursor.value = -1
    }

    /* ─── Forme du panneau, DÉRIVÉE de la mesure ───────────────────────────
     * Grouper n'aide que si les catégories sont peu nombreuses. 154 groupes
     * pour 972 interfaces ne serait pas une navigation, juste une autre liste
     * à balayer — et les catégories d'interfaces sont de surcroît
     * incohérentes entre elles (IBtnProps dans « Component Props », IBtnEmits
     * dans « Events & Emits », IBtnSlots dans « Btn »).
     *
     * On lit les dénombrements, qui arrivent AVANT le catalogue : la forme est
     * donc connue dès l'ouverture, sans attendre les 322 Ko.
     */
    const panelShape = computed<TNavRailPanelShape>(() => {
        const kind = openKind.value

        if (!kind) return 'flat'

        const total = countFor(kind)
        const cats = categoriesFor(kind)

        if (total === null || cats === null) return 'search'
        if (total <= NAV_RAIL_GROUP_MAX_ENTRIES && cats <= NAV_RAIL_GROUP_MAX_CATEGORIES) {
            return cats > 1 ? 'grouped' : 'flat'
        }

        return 'search'
    })

    /* ─── Filtrage ─────────────────────────────────────────────────────────
     * Sous-chaîne insensible à la casse sur le nom ET le slug : on cherche
     * aussi bien « BtnGroup » que « btn-group ». Les entrées dont le nom
     * COMMENCE par la requête remontent — taper « btn » doit proposer `Btn`
     * avant `BtnGroup`, et `Btn` avant `BottomNav`.
     */
    const normalisedQuery = computed(() => query.value.trim().toLowerCase())

    const matches = computed<INavRailEntry[]>(() => {
        const q = normalisedQuery.value

        if (!q) return entries.value

        const starts: INavRailEntry[] = []
        const contains: INavRailEntry[] = []

        for (const entry of entries.value) {
            const name = entry.name.toLowerCase()
            const slug = entry.slug.toLowerCase()

            if (name.startsWith(q) || slug.startsWith(q)) starts.push(entry)
            else if (name.includes(q) || slug.includes(q)) contains.push(entry)
        }

        return [...starts, ...contains]
    })

    /** Nombre total de correspondances, AVANT plafonnement. */
    const matchCount = computed(() => matches.value.length)

    /** Les entrées réellement rendues — plafonnées, et le plafond est annoncé. */
    const visibleEntries = computed(() => matches.value.slice(0, NAV_RAIL_RESULT_CAP))

    /**
     * ⛔ Le plafond ne s'applique QU'À la liste plate.
     *
     * Mesuré à l'écran le 2026-10-02 : le panneau groupé des composants
     * annonçait « 50 shown of 94 » alors qu'il rendait bien les 94 entrées,
     * réparties dans leurs 11 catégories — `visibleEntries` (plafonnée) n'est
     * consommée qu'en mode plat. Le message était donc faux, et un plafond
     * annoncé à tort est aussi trompeur qu'un plafond tu.
     */
    const isCapped = computed(
        () => isFlatList.value && matchCount.value > NAV_RAIL_RESULT_CAP
    )

    /** Vrai quand la requête ne rend rien alors que la famille est chargée. */
    const isEmptyResult = computed(
        () => status.value === 'ready' && normalisedQuery.value.length > 0 && matchCount.value === 0
    )

    /**
     * Groupes de catégorie, pour la forme groupée SANS requête. Dès qu'une
     * requête est tapée on rend une liste plate : filtrer à travers 11 groupes
     * puis en afficher 9 vides n'aide personne.
     */
    const groups = computed<INavRailGroup[]>(() => {
        if (panelShape.value !== 'grouped' || normalisedQuery.value) return []

        const byCategory = new Map<string, INavRailEntry[]>()

        for (const entry of entries.value) {
            const key = entry.category || ''
            const bucket = byCategory.get(key)

            if (bucket) bucket.push(entry)
            else byCategory.set(key, [entry])
        }

        // La catégorie de l'entrée lue en premier : le panneau s'ouvre déjà
        // déroulé sur le voisinage de ce qu'on est en train de lire.
        const here = entries.value.find(e => e.slug === currentSlug.value)?.category ?? ''

        return [...byCategory.entries()]
            .map(([category, list]) => ({ category, entries: list }))
            .sort((a, b) => {
                if (a.category === here) return -1
                if (b.category === here) return 1

                return a.category.localeCompare(b.category)
            })
    })

    /** Vrai quand le panneau rend une liste plate d'entrées (filtrable). */
    const isFlatList = computed(() => groups.value.length === 0)

    /* ─── Curseur clavier ──────────────────────────────────────────────────
     * Il parcourt `flatNavigable`, c'est-à-dire l'ordre VISUEL réel : la
     * liste plafonnée en mode plat, ou la concaténation des groupes en mode
     * groupé. Sans ça, ↓ sauterait d'un groupe à l'autre dans un ordre que
     * l'écran ne montre pas.
     */
    const flatNavigable = computed<INavRailEntry[]>(() => {
        if (isFlatList.value) return visibleEntries.value

        return groups.value.flatMap(g => g.entries)
    })

    function moveCursor (delta: number) {
        const size = flatNavigable.value.length

        if (size === 0) {
            cursor.value = -1

            return
        }

        // Depuis le champ (-1), ↓ va au premier et ↑ au dernier.
        if (cursor.value === -1) {
            cursor.value = delta > 0 ? 0 : size - 1

            return
        }

        const next = cursor.value + delta

        // Pas de bouclage : arrivé en bas on reste en bas. Un curseur qui
        // reboucle sur 972 entrées fait perdre l'utilisateur.
        cursor.value = Math.min(size - 1, Math.max(0, next))
    }

    function setCursor (index: number) {
        cursor.value = index
    }

    const activeEntry = computed<INavRailEntry | null>(
        () => flatNavigable.value[cursor.value] ?? null
    )

    // Une requête neuve invalide la position du curseur : la liste dessous a
    // changé, garder l'index pointerait sur une autre entrée.
    watch(normalisedQuery, () => { cursor.value = -1 })

    // Changer de page ferme le panneau — on vient d'arriver là où on voulait.
    watch(() => route.fullPath, () => { close() })

    return {
        // paliers
        tier,
        width,
        height,
        // position
        currentFamily,
        currentSlug,
        // dénombrements
        counts,
        hasCounts,
        countFor,
        categoriesFor,
        // ouverture
        panel,
        openKind,
        openFamily,
        isOpen,
        openFamilyPanel,
        openPagesPanel,
        close,
        // contenu
        status,
        query,
        panelShape,
        groups,
        isFlatList,
        visibleEntries,
        matchCount,
        isCapped,
        isEmptyResult,
        // clavier
        cursor,
        activeEntry,
        flatNavigable,
        moveCursor,
        setCursor
    }
}
