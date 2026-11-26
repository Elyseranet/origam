/** One figure of the home « proof » section: a BUILD_STATS value, its label and its written definition. */
export interface IHomeProofItem {
    key: string
    value: string
    labelKey: string
    labelFallback: string
    definitionKey: string
    definitionFallback: string
}
