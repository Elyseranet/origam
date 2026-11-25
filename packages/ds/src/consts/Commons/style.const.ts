/*********************************************************
 * CSS_LITERAL_REGEX / CSS_UNSAFE_VALUE_REGEX / CSS_PROPERTY_NAME_REGEX (#1113)
 *
 * @description
 * `useStyle()` serialises style values into the TEXT of a stylesheet, so a
 * value is only safe when it cannot leave its declaration.
 *
 * @description
 * `CSS_LITERAL_REGEX` matches the two places where `;`, `{`, `}` are plain
 * content to the CSS tokenizer: a balanced quoted string and an unquoted
 * `url(…)` body (`url(data:image/png;base64,…)`). They are masked before the
 * unsafe test, so a `font-family: "A;B"` or a data URL keeps passing.
 *
 * @description
 * `CSS_UNSAFE_VALUE_REGEX`, run on the MASKED value: a declaration or block
 * boundary (`;` `{` `}`), markup (`<` `>`), an at-rule (`@`), an escape (`\`,
 * which can spell `}` as `\7d`), a line break, a comment, a quote left
 * unbalanced by the mask, or IE's `expression(`.
 *
 * @description
 * `CSS_PROPERTY_NAME_REGEX`: a custom property (`--origam-btn---bg`) or a
 * plain / vendor-prefixed property name, nothing else.
 ********************************************************/
export const CSS_LITERAL_REGEX = /"(?:[^"\\\n\r\f]|\\.)*"|'(?:[^'\\\n\r\f]|\\.)*'|url\(\s*[^\s"'()\\]*\s*\)/gi

export const CSS_UNSAFE_VALUE_REGEX = /[;{}<>@\\\n\r\f"']|\/\*|\*\/|expression\s*\(/i

export const CSS_PROPERTY_NAME_REGEX = /^(?:--[\w-]+|-?[a-z][a-z0-9-]*)$/i
