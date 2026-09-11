# Liste des Composables

Voici la liste complète des composables disponibles dans le projet Origam.

## Composables Communs (Commons)

Les composables communs fournissent des fonctionnalités réutilisables pour tous les composants.

| Composable            | Description                                                 |
|:----------------------|:------------------------------------------------------------|
| **useBothColor**      | Gère la couleur du texte et l'arrière-plan                  |
| **useColor**          | Génère classes et styles de couleur (voir aussi `useBackgroundColor`, `useTextColor`, `useBothColor`) |
| **useStateFlag**      | Gère un état `active` ou `hover` (fusion de `useActive` et `useHover`) |
| **useDensity**        | Gère les classes de densité (compact, comfortable, default) |
| **useDimension**      | Gère les dimensions (width, height)                         |
| **useElevation**      | Gère l'élévation (box-shadow)                               |
| **useGroup**          | Gère les groupes de composants                              |
| **useLayout**         | Gère la mise en page (flex, grid)                           |
| **useLink**           | Gère les liens (href, to)                                   |
| **useLocale**         | Gère la localisation (i18n)                                 |
| **useMessage**        | Gère les messages (snackbars, notifications)                |
| **useProps**          | Filtre et extrait les props du composant                    |
| **usePadding**        | Gère l'espacement interne, raccourci + par côté             |
| **useMargin**         | Gère l'espacement externe, raccourci + par côté             |
| **useBorder**         | Gère les bordures, raccourci + par côté + couleur par côté  |
| **useRounded**        | Gère les coins arrondis (border-radius), raccourci + par coin |
| **useSelectLink**     | Gère les liens dans les sélections                          |
| **useSize**           | Gère la taille des composants                               |
| **useStatus**         | Gère le statut (success, error, warning, info)              |
| **useToggleScope**    | Gère les portées de basculement                             |
| **useValidation**     | Gère la validation des champs                               |
| **useVariant**        | Gère les variantes de composants                            |
| **useVModel**         | Gère le v-model                                             |
| **useResizeObserver** | Observe les changements de dimension                        |
| **useSsrBoot**        | Gère l'amorçage côté serveur (bascule SSR → client)         |
| **useAdjacent**       | Gère l'adjacence des éléments                               |
| **useTheme**          | Gère les themes                                             |
| **useLoader**         | Résout la prop `loading` en descripteur d'état de chargement |

## Composables Formulaire (Form)

| Composable | Description |
| :--- | :--- |
| **useForm** | Gère la validation et la soumission des formulaires |

## Composables Icône (Icon)

| Composable | Description |
| :--- | :--- |
| **useIconAccessibility** | Contrat `aria-hidden` / `role` partagé par les feuilles d'icône |

## Composables Liste (List)

| Composable | Description |
| :--- | :--- |
| **useList** | Gère les listes et leurs éléments |

## Composables Responsive

| Composable | Description |
| :--- | :--- |
| **useAspectRatio** | Gère le ratio d'aspect des conteneurs |

---