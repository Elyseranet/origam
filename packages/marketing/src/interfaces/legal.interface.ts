export interface ILegalConfig {
    status: string
    name: string
    form: string
    capital: string
    siren: string
    rcs: string
    vat: string
    address: string
    phone: string
    email: string
    publicationDirector: string
    hostName: string
    hostAddress: string
    hostPhone: string
    hostCountry: string
}

export interface ILegalRow {
    key: string
    label: string
    value: string
    isMissing: boolean
}
