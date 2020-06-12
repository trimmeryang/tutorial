- [概念](#概念)
- [babel-polyfill](#babel-polyfill)
  * [babel-polyfill怎么按需引入](#babel-polyfill怎么按需引入)
  * [babel-polyfill的问题](#babel-polyfill的问题)
  * [proxy不能被polyfill](#proxy不能被polyfill)
- [babel-runtime](#babel-runtime)

# 概念
https://www.babeljs.cn/docs/presets
* 用来把ES6+代码编译到ES5
* babel 不处理模块化
* 预设（Presets）,一些预设的集合: eg: `@babel/preset-env`
* 运行
```js
npx babel src/index.js
```

# babel-polyfill
* polyfill是补丁
* [core-js](!https://github.com/zloirock/core-js) 和 [regenerator](!https://github.com/facebook/regenerator/blob/master/packages/regenerator-runtime/runtime.js) 
  corejs是标准的库集成了es6等的polyfill的库，不支持generator的语法
  regenerator是用来支持generator的语法
* babel-polyfill是core-js和regenerator的集合
* Babel7.4之后弃用babel-polyfill
* 推荐使用core-js和regenerator
```js 
    //在相关的js文件中
    import '@babel/polyfill'
```

## babel-polyfill怎么按需引入
```js
//不需要在文件中引入 import '@babel/polyfill'了
"presets": [
    [
        "@babel/preset-env",
        {
            "useBuiltIns": "usage", //按需引入
            "corejs": 3   //corejs版本号, 这里可以不安装@babel/polyfill
        }
    ]
],
```
## babel-polyfill的问题
* 污染全局环境
```js
//babel-polyfill会重写promise
window.Promise = function() {}
```
* 做独立的web，没问题
* 做第三方库有问题。不能保证使用方，有没有改写过promise/windows
* 如果避免，可以使用babel-runtime

## proxy不能被polyfill
proxy的功能不能用Object.defineProperty模拟

# babel-runtime
* 第三方lib要用babel-runtime
* runtime不会改写Promise，会新定义变量，eg:_promise1
```js
"plugins": [
    [
        "@babel/plugin-transform-runtime",
        {
            "absoluteRuntime": false,
            "corejs": 3,
            "helpers": true,
            "regenerator": true,
            "useESModules": false
        }
    ]
]
```

