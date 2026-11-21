// TU — hotkey.util.ts : caracterisation de splitKeyCombination / splitKeySequence
// (lot #1398, refactor S3776). Valeurs epinglees telles que mesurees AVANT le refactor.
import { describe, expect, it, vi } from 'vitest'
import { splitKeyCombination, splitKeySequence } from '@origam/utils/Commons/hotkey.util'

const COMBOS: Array<[string, string[]]> = [["", []], ["a", ["a"]], ["ctrl+k", ["ctrl", "k"]], ["ctrl+shift+k", ["ctrl", "shift", "k"]], ["shift+-", ["shift", "-"]], ["ctrl+-", ["ctrl", "-"]], ["-", ["-"]], ["--", []], ["---", ["-", "-"]], ["+", []], ["_", []], ["++", []], ["__", []], ["+a", []], ["_a", []], ["a+", []], ["a_", []], ["a++", []], ["a__", []], ["++a", []], ["ctrl++", []], ["ctrl+_", []], ["ctrl__k", []], ["ctrl_k", ["ctrl", "k"]], ["ctrl+a-b", []], ["a-b", []], ["CTRL+K", ["ctrl", "k"]], ["esc", ["escape"]], ["escape", ["escape"]], ["Ctrl+Enter", ["ctrl", "enter"]], ["cmd+k", ["cmd", "k"]], ["meta+shift+p", ["meta", "shift", "p"]], ["a+b+c", ["a", "b", "c"]], ["+-", []], ["ctrl+--", ["ctrl", "-"]], ["x++", []], ["ctrl+shift++", []], ["shift+_", []], ["a_b", ["a", "b"]], ["foo-bar", []], ["-a", []], ["a-", []]]

const SEQS: Array<[string, string[]]> = [["", []], ["a", ["a"]], ["a-b", ["a", "b"]], ["ctrl+k-p", ["ctrl+k", "p"]], ["-", []], ["--", []], ["---", ["-", "-"]], ["--+", []], ["-a", []], ["a-", []], ["shift+-", ["shift+-"]], ["a-shift+-", ["a", "shift+-"]], ["shift+--a", ["shift+-", "a"]], ["a-b-c", ["a", "b", "c"]], ["ctrl+k-ctrl+p", ["ctrl+k", "ctrl+p"]], ["a--b", ["a", "-", "b"]], ["a---b", ["a", "-", "b"]], ["a----b", ["a", "-", "-", "b"]], ["ctrl+-", ["ctrl+-"]], ["ctrl+--a", ["ctrl+-", "a"]], ["a-+-", []], ["a_-b", []], ["a+-", ["a+-"]], ["a+--", []], ["+-", []], ["g-g", ["g", "g"]], ["ctrl+k-", []], ["-ctrl+k", []], ["a++-b", []], ["a+++-b", []], ["shift_-a", []], ["---a", []], ["a---", []], ["a-b-", []], ["-a-b", []]]

describe('splitKeyCombination (caracterisation)', () => {
    it.each(COMBOS)('%j', (input, expected) => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(splitKeyCombination(input)).toEqual(expected)
        expect(splitKeyCombination(input, true)).toEqual(expected)
    })
})

describe('splitKeySequence (caracterisation)', () => {
    it.each(SEQS)('%j', (input, expected) => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(splitKeySequence(input)).toEqual(expected)
    })
})
