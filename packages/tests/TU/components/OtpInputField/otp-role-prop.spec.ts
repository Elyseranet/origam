import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// ⛔ PROP MORTE — `role` (classeur, ligne OrigamOtpInputField, critère C1).
//
// `role` était déclarée sur `IOtpInputFieldProps` et le template codait
// `role="group"` EN DUR. La passer n'avait donc aucun effet : une prop
// publique que le composant ignore silencieusement.
//
// Le défaut jumeau, `persistentPlaceholder`, a été RETIRÉ plutôt que câblé :
// zéro occurrence dans le `.vue`, et `origam-field` ne la déclare pas non plus
// — elle ne pouvait donc même pas partir par le forwarding de `filterProps`.
// Rien ne pouvait la consommer, nulle part.
// ---------------------------------------------------------------------------
const mountOtp = (props: Record<string, unknown> = {}) => mount(OrigamOtpInputField, {
    props: props as never,
    global: { plugins: [createOrigam()] }
})

describe('OrigamOtpInputField — prop role (C1)', () => {
    it('rend role="group" par défaut — la valeur qui était figée', () => {
        const wrapper = mountOtp()

        expect(wrapper.element.getAttribute('role')).toBe('group')
    })

    it('une valeur fournie par le consommateur remplace le défaut', () => {
        const wrapper = mountOtp({ role: 'application' })

        expect(wrapper.element.getAttribute('role')).toBe('application')
    })

    it('label reste relayée en aria-label sur la racine', () => {
        const wrapper = mountOtp({ label: 'OTP code' })

        expect(wrapper.element.getAttribute('aria-label')).toBe('OTP code')
    })
})
