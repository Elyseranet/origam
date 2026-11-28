/** Identifiant d'ancre d'un groupe : `<prefixe>-<libelle en minuscules, non alphanumerique -> tiret>`. */
export function catalogGroupId (prefix: string, label: string): string {
    return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}
