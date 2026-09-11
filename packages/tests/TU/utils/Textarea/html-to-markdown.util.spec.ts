import { describe, expect, it } from 'vitest'

import { htmlToMarkdown } from '@origam/utils/Textarea/html-to-markdown.util'

describe('htmlToMarkdown', () => {
    it('returns empty string for empty input', () => {
        expect(htmlToMarkdown('')).toBe('')
        // @ts-expect-error — runtime probe.
        expect(htmlToMarkdown(null)).toBe('')
        // @ts-expect-error — runtime probe.
        expect(htmlToMarkdown(undefined)).toBe('')
    })

    it('converts strong to **', () => {
        expect(htmlToMarkdown('<strong>hi</strong>')).toBe('**hi**')
        expect(htmlToMarkdown('<b>hi</b>')).toBe('**hi**')
    })

    it('converts em to *', () => {
        expect(htmlToMarkdown('<em>hi</em>')).toBe('*hi*')
        expect(htmlToMarkdown('<i>hi</i>')).toBe('*hi*')
    })

    it('keeps underline as raw <u> tags (no canonical Markdown)', () => {
        expect(htmlToMarkdown('<u>hi</u>')).toBe('<u>hi</u>')
    })

    it('converts inline code with backticks', () => {
        expect(htmlToMarkdown('<code>x()</code>')).toBe('`x()`')
    })

    it('converts links to [text](href)', () => {
        expect(htmlToMarkdown('<a href="https://example.com">ex</a>'))
                .toBe('[ex](https://example.com)')
    })

    it('keeps anchor text alone when href is missing', () => {
        expect(htmlToMarkdown('<a>ex</a>')).toBe('ex')
    })

    it('converts h1 / h2 / h3', () => {
        expect(htmlToMarkdown('<h1>Big</h1>')).toBe('# Big')
        expect(htmlToMarkdown('<h2>Mid</h2>')).toBe('## Mid')
        expect(htmlToMarkdown('<h3>Lo</h3>')).toBe('### Lo')
    })

    it('converts ul to bullet list', () => {
        const md = htmlToMarkdown('<ul><li>one</li><li>two</li></ul>')
        expect(md).toBe('- one\n- two')
    })

    it('converts ol to numbered list', () => {
        const md = htmlToMarkdown('<ol><li>one</li><li>two</li></ol>')
        expect(md).toBe('1. one\n2. two')
    })

    it('separates <p> blocks with a blank line', () => {
        const md = htmlToMarkdown('<p>one</p><p>two</p>')
        expect(md).toBe('one\n\ntwo')
    })

    it('translates <br> to newline', () => {
        expect(htmlToMarkdown('<p>one<br>two</p>')).toBe('one\ntwo')
    })

    it('handles mixed inline formatting', () => {
        expect(htmlToMarkdown('<p>this is <strong>bold</strong> and <em>italic</em></p>'))
                .toBe('this is **bold** and *italic*')
    })

    it('handles a paragraph with a link inside', () => {
        expect(htmlToMarkdown('<p>see <a href="/x">here</a></p>'))
                .toBe('see [here](/x)')
    })

    it('unwraps unknown tags', () => {
        expect(htmlToMarkdown('<p>he<span>ll</span>o</p>')).toBe('hello')
    })

    it('collapses 3+ blank lines into a single double-newline', () => {
        expect(htmlToMarkdown('<p>a</p><p></p><p>b</p>')).toBe('a\n\nb')
    })
})
