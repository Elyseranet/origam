/**
 * Paths appended to `runtimeConfig.public.githubRepo` to build the contact
 * channels the /contact page offers.
 *
 * WHY THESE TWO AND NOTHING ELSE
 *   The repository publishes no email address — a survey of the whole tree
 *   found none — so GitHub is the only channel that actually exists. The
 *   suffixes live here rather than inline in the page because a `.vue` file
 *   never declares a `const` (cf. `vue-conventions`), and because
 *   `nav.const.ts` already builds the same `/discussions` URL for the footer:
 *   naming it once keeps the two from drifting apart.
 */
export const CONTACT_GITHUB_ISSUES_PATH = '/issues'

export const CONTACT_GITHUB_DISCUSSIONS_PATH = '/discussions'

/** Internal route of the donation page, linked as a third channel. */
export const CONTACT_SUPPORT_ROUTE = '/support'
