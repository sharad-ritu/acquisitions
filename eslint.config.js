import antfu from '@antfu/eslint-config';

export default antfu({
  type: 'app',
  typescript: false,
  react: false,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: 'single',
  },
}, {
  rules: {
    'no-console': ['warn'],
    'antfu/no-top-level-await': ['off'],
    'node/prefer-global/process': ['off'],
    'test/prefer-lowercase-title': 'off',
  },
});
