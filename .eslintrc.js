const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    es2021: true,
    jest: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'prettier/standard',
    'prettier/@typescript-eslint'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['prettier', 'eslint-plugin-import-helpers', '@typescript-eslint'],
  rules: {
    'import-helpers/order-imports': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          ignoreCase: true
        },
        groups: [
          'module',
          '/^@src/',
          '/^@test/',
          ['parent', 'sibling', 'index']
        ],
        newlinesBetween: 'always'
      }
    ],
    'no-console': isProd ? 'error' : 'off',
    'no-debugger': isProd ? 'error' : 'off',
    'no-useless-constructor': 'off',
    'prettier/prettier': 'warn'
  }
}
