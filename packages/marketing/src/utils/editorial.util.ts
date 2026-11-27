import type { TEditorialSectionView } from '~/types/editorial.type'

/**
 * Rythme de fonds d'une suite de sections (#1587) : elles alternent `default` et `overlay`, et la
 * DERNIÈRE est toujours `overlay` : c'est le fond d'où part le ciel de la scène « Crépuscule ».
 * La première, collée à l'en-tête, est `flush` : son lavis se réduit à 50 px, le vide sous le texte de l'en-tête (plus haut, il le voilerait).
 * `label` est le rang à deux chiffres, l'eyebrow de la section.
 */
export function editorialSectionViews<T> (sections: readonly T[], block: string): TEditorialSectionView<T>[] {
    const last = sections.length - 1

    return sections.map((section, index) => {
        const overlay = (last - index) % 2 === 0

        return {
            ...section,
            label: String(index + 1).padStart(2, '0'),
            classes: [`${block}--${overlay ? 'overlay' : 'default'}`, ...(index === 0 ? [`${block}--flush`] : [])]
        }
    })
}
