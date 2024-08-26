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
  settings: {
    // npm install --save-dev eslint-import-resolver-alias
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.js', '.vue', '.json']
      }
    }
  },
  rules: {
    'vuejs-accessibility/label-has-for': 'off',
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'always'
      }
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/.eslintrc.{js,cjs}', '**/.eslintrc.js', 'vite.config.js']
      }
    ]
  }
}
