/*
 * "off" or 0 - 关闭规则
 * "warn" or 1 - 将规则视为一个警告（不会影响退出码）
 * "error" or 2 - 将规则视为一个错误 (退出码为1)
 */

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    amd: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'], // 添加 prettier 插件
  overrides: [],
  parserOptions: {
    ecmaVersion: 2015,
  },
  rules: {
    'no-console': 1,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-restricted-syntax': 1,
    'no-prototype-builtins': 1,
    'no-caller': 1,
    'no-useless-concat': 0,
    'object-shorthand': 0,
    'global-require': 0,
    //indent: [2, 4, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
    'spaced-comment': [2, 'always', { exceptions: ['/-'], markers: ['/'] }],
  },
};
