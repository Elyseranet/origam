import OrigamOtpInputField from '../../components/OtpInputField/OrigamOtpInputField.vue'

import { OTP_INPUT_FIELD_TYPE } from '../../enums/OtpInputField/otp-input-field.enum'

export type TOtpInputFieldType = `${OTP_INPUT_FIELD_TYPE}`

export type TOrigamOtpInputField = InstanceType<typeof OrigamOtpInputField>
