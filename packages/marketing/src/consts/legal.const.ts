import type { ILegalConfig } from '../interfaces/legal.interface'

export const LEGAL_PUBLISHER_FIELDS: ReadonlyArray<keyof ILegalConfig> = [
    'name', 'status', 'form', 'capital', 'siren', 'rcs', 'vat', 'address', 'phone', 'email', 'publicationDirector'
]

export const LEGAL_HOST_FIELDS: ReadonlyArray<keyof ILegalConfig> = [
    'hostName', 'hostAddress', 'hostPhone', 'hostCountry'
]

export const LEGAL_DEFAULTS: ILegalConfig = {
    status: '', name: '', form: '', capital: '', siren: '', rcs: '', vat: '', address: '',
    phone: '', email: '', publicationDirector: '', hostName: '', hostAddress: '', hostPhone: '', hostCountry: ''
}
