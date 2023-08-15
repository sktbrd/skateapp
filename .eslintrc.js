module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'func-names': 'off',
    'no-console': 'off',
    'no-plusplus': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-shadow': 'off',
    'react/jsx-no-bind': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-ignore': 'allow-with-description',
      },
    ],
    'prettier/prettier': 'error', // Enable Prettier as an ESLint rule
  },
};
