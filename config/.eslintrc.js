
module.exports = {
    //继承Eslint规则
    extends: [
        "eslint:recommended"
    ],
    env: {
        node: true, //启用node中全局变量    
        browser: true, //启用浏苋器中全局变量
        commonjs: true,
        es2021: true
    },
    "globals": {
        "-": true,//可以读取，可以修改
        "$": false //可以读取，不能修改
    },
    parserOptions: {
        ecmaVersion: 5, // es5
        sourceType: "module", //es module3，
    },
    rules: {
        "no-var": 2, //不能使用var定义变量,
    }
}

