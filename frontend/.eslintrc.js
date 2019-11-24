module.exports = {
  extends: [
    'plugin:vue/base'
  ],
  rules: {
      'no-console': 'off',
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 8,
    sourceType: "module"
  }
};
