module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-param-reassign": false,
    "no-restricted-syntax": false,
    "no-await-in-loop": false
  },
};
