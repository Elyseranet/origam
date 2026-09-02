/*********************************************************
 * setup-reads — exceptions justifiées
 *
 * @description
 * `setup-reads.mjs` signale toute prop lue *eagerly* dans le corps de
 * `setup()`. Le signalement est juste sur le principe : le résolveur de props
 * de thème écrit dans `beforeCreate`, APRÈS l'exécution de `setup()`, donc une
 * valeur capturée là ne verra jamais celle du thème (ADR-005).
 *
 * @description
 * Mais toutes les props ne sont pas des réglages. Certaines sont des
 * IDENTITÉS, et une identité doit précisément être stable dès le setup — la
 * différer casserait ce qu'elle sert à enregistrer. Pour celles-là, la lecture
 * eager n'est pas un défaut à corriger : c'est la seule forme correcte.
 *
 * @description
 * ⛔ Ce fichier n'est PAS une baseline. Une baseline fige un défaut connu en
 * attendant qu'on le traite ; ces entrées-ci disent qu'il n'y a rien à
 * traiter. Chacune porte sa raison, et une entrée sans raison est refusée par
 * le contrôle en fin de fichier — sans quoi ce mécanisme deviendrait
 * exactement ce que ce dépôt a déjà payé cher : un garde qui affiche PASS avec
 * des violations dessous.
 *
 * @description
 * Ajouter une entrée demande de répondre à UNE question : « un thème a-t-il
 * vocation à écrire cette prop ? ». Si oui, ce n'est pas une exception, c'est
 * un bug à corriger.
 ********************************************************/

/**
 * @type {Array<{component: string, prop: string, reason: string}>}
 */
export const SETUP_READ_EXCEPTIONS = [
    {
        component: 'AppBar',
        prop: 'name',
        reason: 'Identité, pas réglage. `useLayoutItem` s\'en sert pour provide(ORIGAM_LAYOUT_ITEM_KEY, {id}), layout.register(vm, {…, id}) et layout.unregister(id) au démontage : l\'id doit être stable dès le setup. Le différer laisserait un élément fantôme dans le layout et n\'en désenregistrerait aucun. Arbitrage utilisateur du 2026-09-02 : un thème n\'a pas vocation à nommer un élément de layout, au même titre qu\'il n\'a pas vocation à lui donner un `id`.'
    },
    {
        component: 'BottomNav',
        prop: 'name',
        reason: 'Même cause exactement qu\'AppBar — même appel à useLayoutItem, même contrainte de stabilité de l\'id. Voir la justification ci-dessus.'
    },
    {
        component: 'Drawer',
        prop: 'name',
        reason: 'Troisième des quatre consommateurs de useLayoutItem, même motif `id: props.name`, même contrainte. Vérifié par lecture du fichier, pas déduit de la ressemblance des noms.'
    },
    {
        component: 'SystemBar',
        prop: 'name',
        reason: 'Quatrième et dernier consommateur de useLayoutItem, même motif `id: props.name`, même contrainte. Vérifié par lecture du fichier.'
    }
]

/**
 * Vrai si cette lecture eager est une exception justifiée.
 *
 * @param {string} component  Nom PascalCase sans le préfixe `Origam`.
 * @param {string} prop       Nom de la prop lue.
 * @returns {boolean}
 */
export function isJustifiedSetupRead (component, prop) {
    return SETUP_READ_EXCEPTIONS.some(e => e.component === component && e.prop === prop)
}

/*
 * Contrôle d'intégrité : une exception sans raison écrite n'en est pas une.
 * Il s'exécute à l'import, donc l'outil refuse de démarrer plutôt que de
 * laisser passer une entrée vide.
 */
for (const e of SETUP_READ_EXCEPTIONS) {
    if (!e.component || !e.prop || !e.reason || e.reason.trim().length < 40) {
        throw new Error(
            `setup-reads.exceptions: entrée invalide (${e.component}.${e.prop}) — ` +
            'chaque exception doit porter une raison écrite d\'au moins 40 caractères.'
        )
    }
}
