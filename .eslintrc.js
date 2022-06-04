module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
  },

  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],

  plugins: ['@typescript-eslint', 'import', 'unused-imports'],

  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },

  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
  },
}
