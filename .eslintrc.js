module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'node'],
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: false
    },
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true,
    jest: true
  },
  rules: {
    'import/no-unresolved': [
      'error',
      {
        caseSensitive: true,
        commonjs: true,
        ignore: ['^[^.]']
      }
    ],
    'import/prefer-default-export': 'off',
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  },
  globals: {
    window: true,
    document: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    getCurrentPages: true,
    getApp: true
  }
};
