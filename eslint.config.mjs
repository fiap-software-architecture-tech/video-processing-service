import js from '@eslint/js';
import * as pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
    },
    {
        plugins: {
            import: pluginImport,
            prettier: pluginPrettier,
        },
        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            'semi-style': ['error'],
            'no-octal-escape': 'error',
            quotes: ['error', 'single', {
                allowTemplateLiterals: true,
            }],
            'object-shorthand': 'off',
            'func-style': ['error', 'declaration', {
                allowArrowFunctions: true,
            }],
            'no-var': 'off',
            'no-undef': 'off',
            'prefer-const': 'off',
            'no-useless-escape': 'off',
            'max-classes-per-file': 'off',
            '@typescript-eslint/unbound-method': 'off',
            'eslint-disable prefer-rest-params': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                vars: 'all',
                args: 'after-used',
                ignoreRestSiblings: false,
                argsIgnorePattern: '^_',
            }],
            'import/prefer-default-export': 'off',
            'no-restricted-imports': ['error', {
                patterns: ['./*', '../*'],
            }],
            'import/order': ['error', {
                pathGroups: [{
                    pattern: '#/**',
                    group: 'internal',
                }, {
                    pattern: '!/**',
                    group: 'parent',
                }],
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            }],
            'prettier/prettier': 'error',
        },
    },
    {
        ignores: ['vitest.config.ts', 'node_modules', 'eslint.config.mjs', 'dist', 'docs', 'tsup.config.ts',],
    },
];
