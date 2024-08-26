/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'prettier',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vuejs-accessibility/recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  plugins: ['vue', 'prettier', 'vuejs-accessibility'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vuejs-accessibility/label-has-for': 'off'
  }
}
