import { TEXT_FIELD_TYPE } from "../../enums"

import type { TTextFieldType } from "../../types"

export const ACTIVE_TEXT_FIELD_TYPE: Partial<Array<TTextFieldType>> = [
    TEXT_FIELD_TYPE.COLOR,
    TEXT_FIELD_TYPE.FILE,
    TEXT_FIELD_TYPE.TIME,
    TEXT_FIELD_TYPE.DATE,
    TEXT_FIELD_TYPE.DATETIME,
    TEXT_FIELD_TYPE.WEEK,
    TEXT_FIELD_TYPE.MONTH
]

export const INPUT_TEXT_FIELD_TYPE: Partial<Array<TTextFieldType>> = [
    TEXT_FIELD_TYPE.TEXT,
    TEXT_FIELD_TYPE.SEARCH,
    TEXT_FIELD_TYPE.PASSWORD,
    TEXT_FIELD_TYPE.TEL,
    TEXT_FIELD_TYPE.URL
]
