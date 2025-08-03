module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Disable IE8-specific warnings (not relevant for React Native)
    'no-catch-shadow': 'off',

    // Disable shadow warnings for error variables in catch blocks
    '@typescript-eslint/no-shadow': [
      'error',
      {
        allow: ['error'],
      },
    ],
  },
};
