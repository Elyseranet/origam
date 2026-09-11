import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
	{
		ignores: [
			'*.d.ts',
			'**/coverage',
			'**/dist',
			'**/.history',
			'**/node_modules',
			'**/stories',
			// `.claude/worktrees/<agent>/` are stale git worktree copies
			// from earlier agent runs (`isolation: "worktree"`). They
			// contain duplicates of files we already lint at the repo
			// root — including the figma-plugin TSX/JSX which needs its
			// own parser config (cf. figma-plugin/** ignore below).
			// Linting them produces ~200 parse errors that block every
			// commit while having no semantic value (after merge the
			// worktree dir is just leftover scaffolding).
			'.claude/worktrees/**',
			// `.nuxt/` is Nuxt's build-time scratch dir. It contains
			// generated `.d.ts` files (components, runtime-config,
			// nitro-config, etc.) with broad utility types (`{}` empty
			// object, triple-slash references, …) that don't pass our
			// strict lint config. They are regenerated on every Nuxt
			// build and never authored — exclude them. The leading `.`
			// makes the global `*.d.ts` pattern miss them on some
			// glob implementations, hence the explicit listing.
			'**/.nuxt/**',
			'.output/**',
			'**/.output/**',
			// VitePress generates JS cache files under docs/.vitepress/cache/deps
			// that re-emit deprecated rule names (`es5/no-es6-methods`,
			// `@typescript-eslint/no-explicit-any` as ESLint v8 rule strings).
			// They are pre-built deps — never linted source. Ignore the whole
			// cache tree.
			'docs/.vitepress/cache/**',
			'docs/.vitepress/dist/**',
			// The Figma plugin ships its own TSX/JSX UI that requires a
			// separate parser config (it's NOT part of the published origam
			// library and has its own lifecycle). Excluded from the lib
			// lint to keep `package origam` cleanly typed.
			'figma-plugin/**',
			'packages/figma-plugin/**',
		],
	},
	{
		extends: [
			eslint.configs.recommended,
			...typescriptEslint.configs.recommended,
			...eslintPluginVue.configs['flat/recommended'],
		],
		files: ['**/*.{ts,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.browser,
			parserOptions: {
				parser: typescriptEslint.parser,
			},
		},
		rules: {
			// `no-useless-assignment` was promoted into @eslint/js@10's
			// `recommended` set. The codebase (written against the previous
			// recommended set) has ~19 intentional-or-benign init-then-reassign
			// patterns; this rule was never part of the project's lint standard.
			// Keep it off — enabling it is a separate cleanup, not a CI gate.
			"no-useless-assignment": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/ban-ts-comment": "warn",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-empty-object-type": ["error", {
				"allowInterfaces": "with-single-extends"
			}],
			"vue/valid-v-slot": "off",
			// Slot scopes in origam intentionally re-expose internal names
			// already declared in the parent `<script setup>` (id from
			// `useId()` shadowed by the resolved id surfaced by origam-input,
			// model from the parent v-model shadowed by the slot's
			// transformed model, etc). Renaming would break the slot API
			// readability, so the canonical names are whitelisted.
			"vue/no-template-shadow": ["warn", { "allow": ["props", "id", "model", "ref", "max", "isActive", "isSelected"] }],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					"args": "all",
					"argsIgnorePattern": "^_",
					"caughtErrors": "all",
					"caughtErrorsIgnorePattern": "^_",
					"destructuredArrayIgnorePattern": "^_",
					"varsIgnorePattern": "^_",
					"ignoreRestSiblings": true
				}
			]
		},
	},
	{
		files: ['**/*.spec.ts', '**/*.spec.js', '**/*.cy.ts', '**/*.test.ts'],
		rules: {
			// Specs frequently declare harness vars used only for their mount
			// side-effect (destructured `{ wrapper }`, an assigned-but-asserted
			// state flag) — chasing these in throwaway scaffolding adds churn and
			// risks breaking green tests. Off for spec files; product-code unused
			// vars are still caught by the base config.
			"@typescript-eslint/no-unused-vars": "off",
			// Composable/SSR specs define throwaway harness components inline
			// (multiple `defineComponent({...})` per file) to exercise a hook
			// under different setups. The one-component-per-file rule targets
			// authored SFCs, not test scaffolding — off for spec files.
			"vue/one-component-per-file": "off",
			// Inline harness components often declare props as a bare string
			// array (`props: ['color']`) just to forward a value into a hook —
			// runtime prop typing adds noise with no value in throwaway test
			// scaffolding. Off for spec files.
			"vue/require-prop-types": "off",
			// Harness components are named for the role they play in a single
			// test (`Root`, `Leaf`, `Host`) — multi-word names add no value in
			// throwaway scaffolding. Off for spec files.
			"vue/multi-word-component-names": "off",
			// Specs occasionally re-`require()` a module mid-test to reset its
			// internal singleton state between cases — a legitimate test-only
			// pattern. Off for spec files.
			"@typescript-eslint/no-require-imports": "off",
			// Inline stub components (mounting a child of the unit-under-test)
			// declare props without defaults / in test-convenient casing / order
			// — authored-SFC hygiene rules don't apply to throwaway test stubs.
			"vue/require-default-prop": "off",
			"vue/prop-name-casing": "off",
			"vue/order-in-components": "off"
		}
	},
	{
		// Nuxt page components use file-based routing: the file name IS
		// the route (`pages/index.vue` → `/`, `pages/about.vue` →
		// `/about`). Nuxt forbids multi-word file names for routes — so
		// the Vue rule that requires multi-word *component* names
		// doesn't apply here. Demote to off for the marketing pages.
		files: ['packages/marketing/src/pages/**/*.vue', 'packages/marketing/src/layouts/**/*.vue'],
		rules: {
			"vue/multi-word-component-names": "off"
		}
	},
	{
		// The component detail page renders anatomy markup via v-html. Every
		// binding is safe: the SVG diagram is author-controlled static data
		// from consts/components/*.const.ts, and the legend / figcaption HTML
		// is run through `sanitizeAnatomyHtml()` before injection. Scoped to
		// the components/ pages dir so the XSS guard stays on everywhere else.
		// (Glob targets the dir, not `[slug].vue` literally — the brackets are
		// a minimatch character class.)
		files: ['packages/marketing/src/pages/components/*.vue'],
		rules: {
			"vue/no-v-html": "off"
		}
	},
	{
		files: ['src/**/*.{ts,vue}'],
		rules: {
			"no-restricted-imports": ["error", {
				patterns: [
					{
						group: ["@origam", "@origam/*"],
						message: "Do NOT use the @origam alias inside src/. mkdist keeps imports verbatim — once published, '@origam/*' cannot be resolved by consumers and the lib breaks at runtime. Use a relative path ('../../components', '../utils', ...) instead. The alias is allowed in stories/ and docs/ only."
					},
					{
						group: ["@stories", "@stories/*", "@docs", "@docs/*", "@cypress", "@cypress/*"],
						message: "Aliases pointing to non-src directories must never be reached from src/. They only exist for dev tooling (Histoire, VitePress, Cypress) and would leak external paths into the published bundle."
					}
				]
			}]
		}
	},
	eslintConfigPrettier
);
