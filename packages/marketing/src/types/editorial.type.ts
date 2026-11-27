/** Une section de page éditoriale (#1587) : ses données, son rang en eyebrow et ses classes de fond. */
export type TEditorialSectionView<T> = T & {
    label: string
    classes: string[]
}
