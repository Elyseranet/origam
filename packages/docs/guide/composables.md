# Liste des Composables

Voici la liste complète des composables disponibles dans le projet Origam.

## Composables Communs (Commons)

Les composables communs fournissent des fonctionnalités réutilisables pour tous les composants.

> Ce tableau est une **liste partielle**, écrite à la main. La référence
> exhaustive des symboles exportés, elle, est générée depuis les sources :
> [Composables — Commons](../composables/Commons.md).
>
> Les pages détaillées suivantes couvrent l'axe **thème / couleur / style**
> (lot 1 de l'issue #599) :
> [useTheme](../composables/useTheme.md) ·
> [useColor](../composables/useColor.md) ·
> [useColorEffect](../composables/useColorEffect.md) ·
> [useStateEffect](../composables/useStateEffect.md) ·
> [useStyle](../composables/useStyle.md) ·
> [useTypography](../composables/useTypography.md) ·
> [useStatus](../composables/useStatus.md) ·
> [useVariant](../composables/useVariant.md) ·
> [useScopeId](../composables/useScopeId.md) ·
> [useUnsupportedProp](../composables/useUnsupportedProp.md) ·
> [useDefaults](../composables/useDefaults.md) ·
> [installThemePropsResolver](../composables/installThemePropsResolver.md).
>
> Et l'axe **dimension / espacement / forme** (lot 2 de l'issue #600) :
> [useDimension](../composables/useDimension.md) ·
> [useMargin](../composables/useMargin.md) ·
> [usePadding](../composables/usePadding.md) ·
> [useBorder](../composables/useBorder.md) ·
> [useRounded](../composables/useRounded.md) ·
> [useElevation](../composables/useElevation.md) ·
> [useSize](../composables/useSize.md) ·
> [useDensity](../composables/useDensity.md) ·
> [useLocation](../composables/useLocation.md) ·
> [usePosition](../composables/usePosition.md) ·
> [convertToUnit](../composables/convertToUnit.md).
>
> Et l'axe **état / interaction / cycle de vie** (lot 3 de l'issue #601) :
> [useVModel](../composables/useVModel.md) ·
> [useStateFlag / useFocus](../composables/useStateFlag.md) ·
> [useLazy](../composables/useLazy.md) ·
> [useValidation / useMessage](../composables/useValidation.md) ·
> [useLink](../composables/useLink.md) ·
> [useAdjacent / useAdjacentInner / useAccessibleCommand](../composables/useAdjacent.md) ·
> [useCssSupport / useCssSupportClient](../composables/useCssSupport.md) ·
> [useToggleScope](../composables/useToggleScope.md) ·
> [useEventListener](../composables/useEventListener.md) ·
> [useActivator / useDelay](../composables/useActivator.md) ·
> [useHotkey](../composables/useHotkey.md) ·
> [useTouch / useVelocity](../composables/useTouch.md) ·
> [useIntersectionObserver / useResizeObserver](../composables/useIntersectionObserver.md) ·
> [useSsrBoot / useHydration](../composables/useSsrBoot.md) ·
> [useRefs](../composables/useRefs.md) ·
> [useThrottleFn](../composables/useThrottleFn.md) ·
> [useLocationStrategies](../composables/useLocationStrategies.md).

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
| **useMessage**        | Résout le message affiché sous un champ (erreurs / hint / messages) — un seul consommateur : `OrigamForm` |
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