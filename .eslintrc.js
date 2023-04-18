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
  globals: {
    L: true,
  },
  rules: {
    'no-var': 0,
    'no-console': 1, // 文件中有console.log发出警告
    'no-param-reassign': 0, // 禁用参数的修改或重新分配引起的意外行为
    'no-underscore-dangle': 0, // 禁用不允许在标识符中使用悬空下划线
    'no-restricted-syntax': 1, // 警告使用特定的语法如：禁止 try-catch 或 class 的使用
    'no-prototype-builtins': 0, // 禁止直接使用 Object.prototypes 的内置属性
    'no-caller': 1, // arguments.caller 和 arguments.callee 的使用使一些代码优化变得不可能。在 JavaScript 的新版本中它们已被弃用
    'no-useless-concat': 0, // 禁止不必要的文字或模板文字串联
    'object-shorthand': 0, //禁止要求对象字面量简写语法。命令行中的 --fix 选项可以自动修复一些该规则报告的问题
    'global-require': 0, //此规则要求所有调用require()都位于模块的顶层，类似于 ES6 import和export语句，这也只能在顶层发生。
    //indent: [2, 4, { SwitchCase: 1, VariableDeclarator: 1, outerIIFEBody: 1 }],
    'spaced-comment': [2, 'always', { exceptions: ['/-'], markers: ['/'] }],
    requireAnonymousFunctions: 0,
  },
};
