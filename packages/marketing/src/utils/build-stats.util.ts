/**
 * Date de mesure de BUILD_STATS (AAAA-MM-JJ) rendue dans la langue active.
 * Fuseau UTC : le serveur et le navigateur rendent le même jour, sans écart
 * d'hydratation quel que soit le fuseau du visiteur.
 */
export function formatMeasuredOn (isoDate: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${ isoDate }T00:00:00Z`))
}
