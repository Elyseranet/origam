// TU — validation.util.ts (collectRuleErrors)
//
// La boucle d'evaluation de regles, partagee par `useValidation.validate()`
// et `useInlineEdit.runRules()` (C2 — doublon runRules).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { collectRuleErrors } from '@origam/utils/Commons/validation.util'

describe('collectRuleErrors — cas nominaux', () => {
    it('aucune regle (undefined) → tableau vide', async () => {
        expect(await collectRuleErrors(undefined, 'abc')).toEqual([])
    })

    it('aucune regle (tableau vide) → tableau vide', async () => {
        expect(await collectRuleErrors([], 'abc')).toEqual([])
    })

    it('une regle qui passe → tableau vide', async () => {
        expect(await collectRuleErrors([() => true], 'abc')).toEqual([])
    })

    it('une regle qui echoue → son message', async () => {
        expect(await collectRuleErrors([() => 'trop court'], 'ab')).toEqual(['trop court'])
    })

    it('la regle recoit bien la valeur', async () => {
        const rule = vi.fn(() => true)
        await collectRuleErrors([rule], 'la-valeur')
        expect(rule).toHaveBeenCalledWith('la-valeur')
    })

    it('regle asynchrone : la Promise est attendue', async () => {
        const rule = async () => {
            await new Promise((resolve) => setTimeout(resolve, 5))

            return 'async KO'
        }

        expect(await collectRuleErrors([rule], 'x')).toEqual(['async KO'])
    })
})

describe('collectRuleErrors — l\'ORDRE compte : la premiere erreur sort', () => {
    it('deux regles, la DEUXIEME echoue → seule la deuxieme erreur, pas la premiere', async () => {
        const errors = await collectRuleErrors([() => true, () => 'erreur 2'], 'x')
        expect(errors).toEqual(['erreur 2'])
    })

    it('deux regles echouent, maxErrors=1 → la PREMIERE gagne', async () => {
        const errors = await collectRuleErrors([() => 'erreur 1', () => 'erreur 2'], 'x', 1)
        expect(errors).toEqual(['erreur 1'])
    })

    it('maxErrors=1 : la regle suivant la premiere erreur n\'est PAS appelee', async () => {
        const second = vi.fn(() => 'erreur 2')
        await collectRuleErrors([() => 'erreur 1', second], 'x', 1)
        expect(second).not.toHaveBeenCalled()
    })

    it('trois regles, la 2e et la 3e echouent, maxErrors=2 → les deux, dans l\'ordre', async () => {
        const errors = await collectRuleErrors([() => true, () => 'e2', () => 'e3'], 'x', 2)
        expect(errors).toEqual(['e2', 'e3'])
    })

    it('maxErrors=0 → aucune regle evaluee', async () => {
        const rule = vi.fn(() => 'jamais')
        expect(await collectRuleErrors([rule], 'x', 0)).toEqual([])
        expect(rule).not.toHaveBeenCalled()
    })

    it('les regles sont evaluees SEQUENTIELLEMENT, pas en parallele', async () => {
        const order: Array<string> = []
        const slow = async () => {
            order.push('slow:start')
            await new Promise((resolve) => setTimeout(resolve, 10))
            order.push('slow:end')

            return true as const
        }
        const fast = () => {
            order.push('fast')

            return true as const
        }

        await collectRuleErrors([slow, fast], 'x', 5)
        expect(order).toEqual(['slow:start', 'slow:end', 'fast'])
    })
})

describe('collectRuleErrors — verdicts non-chaine', () => {
    it('regle qui retourne une CHAINE VIDE → echec avec message vide (pas un succes)', async () => {
        expect(await collectRuleErrors([() => ''], 'x')).toEqual([''])
    })

    it('regle qui retourne false → echec, message vide', async () => {
        expect(await collectRuleErrors([() => false], 'x')).toEqual([''])
    })

    it('regle qui retourne true → succes', async () => {
        expect(await collectRuleErrors([() => true], 'x')).toEqual([])
    })

    it('une valeur non-fonction est coercee en `() => valeur`', async () => {
        expect(await collectRuleErrors(['erreur serveur'], 'x')).toEqual(['erreur serveur'])
        expect(await collectRuleErrors([true], 'x')).toEqual([])
        expect(await collectRuleErrors([false], 'x')).toEqual([''])
    })
})

describe('collectRuleErrors — verdict invalide', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        warn.mockRestore()
    })

    it('verdict numerique → signale et ignore, la boucle continue', async () => {
        const errors = await collectRuleErrors([() => 42 as never, () => 'apres'], 'x')
        expect(errors).toEqual(['apres'])
        expect(warn).toHaveBeenCalledWith('42 is not a valid value. Rule functions must return boolean true or a string.')
    })

    it('verdict undefined → signale et ignore', async () => {
        expect(await collectRuleErrors([() => undefined as never], 'x')).toEqual([])
        expect(warn).toHaveBeenCalledTimes(1)
    })

    it('un verdict invalide ne consomme pas le quota maxErrors', async () => {
        const errors = await collectRuleErrors([() => null as never, () => 'e1'], 'x', 1)
        expect(errors).toEqual(['e1'])
    })

    it('une regle qui PASSE ne declenche aucun avertissement', async () => {
        await collectRuleErrors([() => true, () => true], 'x', 5)
        expect(warn).not.toHaveBeenCalled()
    })

    it('une regle qui ECHOUE (chaine ou false) ne declenche aucun avertissement', async () => {
        await collectRuleErrors([() => 'ko', () => false], 'x', 5)
        expect(warn).not.toHaveBeenCalled()
    })
})
