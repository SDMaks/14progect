module.exports = {
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },
};
