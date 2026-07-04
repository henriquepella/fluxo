export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['api', 'web', 'infra', 'ci', 'docs', 'deps', 'release', 'auth', 'transactions', 'dashboard'],
    ],
  },
};
