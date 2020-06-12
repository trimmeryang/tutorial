- [概念](#概念)
  * [module和chunk和bundle](#module和chunk和bundle)
  * [loader和plugin](#loader和plugin)
  * [常见的loader和plugin](#常见的loader和plugin)
  * [babel和webpack的区别](#babel和webpack的区别)
- [配置](#配置)
  * [拆分配置和merge](#拆分配置和merge)
  * [启动本地服务](#启动本地服务)
  * [处理es6](#处理es6)
  * [处理样式](#处理样式)
  * [处理图片](#处理图片)
  * [多入口配置](#多入口配置)
  * [抽离css](#抽离css)
  * [抽离公共代码](#抽离公共代码)
  * [懒加载](#懒加载)
  * [处理JSX](#处理JSX)
  * [vue支持](#vue支持)
- [优化构建速度](#优化构建速度)
  * [优化babel-loader](#优化babel-loader)
  * [ignorePlugin](#ignoreplugin)
  * [noParse](#noparse)
  * [happyPack 多进程打包](#happypack-多进程打包)
  * [ParallelUglifyPlugin 多进程压缩js](#paralleluglifyplugin-多进程压缩js)
  * [自动刷新](#自动刷新)
  * [热更新](#热更新)
  * [DllPlugin 动态链接库插件](#dllplugin-动态链接库插件)
- [优化代产出代码](#优化代产出代码)
  * [小图片base64编码](#小图片base64编码)
  * [bundle加hash](#bundle加hash)
  * [使用CDN加速](#使用CDN加速)
  * [提取公共代码](#提取公共代码)
  * [懒加载](#懒加载)
  * [IngorePlugin](#IngorePlugin)
  * [使用production](#使用production)
    + [ES6 Module 和 Commonjs 的区别](#es6-module-和-commonjs-的区别)
  * [scope hosting](#scope-hosting)
  
# 概念
## module和chunk和bundle
* module -- 各源码文件， webpack中一切都是模块
* chuck -- 多模块的合成，entry import() splitChunk
* bundle -- 最终输出文件
## loader和plugin
* loader模块转换器： less->css
* plugin用来扩展插件，HtmlWebpackPlugin

## 常见的loader和plugin
https://www.webpackjs.com/loaders/
https://www.webpackjs.com/plugins/

## babel和webpack的区别
* babel - js 新语法编译工具，不关心模块化
* webpack - 打包构建工具， 是多个loader和plugin的集合

# 配置
## 拆分配置和merge
使用`require('webpack-merge')` 来拆分成`webpack.common.js`， `webpack.dev.js`， `webpack.prod.js`
## 启动本地服务
使用`webpack-dev-server`
```js
devServer: {
    port: 8080,
    progress: true,  // 显示打包的进度条
    contentBase: distPath,  // 根目录
    open: true,  // 自动打开浏览器
    compress: true,  // 启动 gzip 压缩

    // 设置代理
    proxy: {
        // 将本地 /api/xxx 代理到 localhost:3000/api/xxx
        '/api': 'http://localhost:3000',

        // 将本地 /api2/xxx 代理到 localhost:3000/xxx
        '/api2': {
            target: 'http://localhost:3000',
            pathRewrite: {
                '/api2': ''
            }
        }
    }
}
```
## 处理es6
使用`babel-loader`
```js
 module: {
    rules: [
        {
            test: /\.js$/,
            loader: ['babel-loader'],
            include: srcPath,
            exclude: /node_modules/
        },
},
```

## 处理样式
```js
 module: {
    rules: [
        // {
        //     test: /\.css$/,
        //     // loader 的执行顺序是：从后往前（知识点）
        //     loader: ['style-loader', 'css-loader']
        // },
        {
            test: /\.css$/,
            // loader 的执行顺序是：从后往前
            loader: ['style-loader', 'css-loader', 'postcss-loader'] // 加了 postcss， 增加浏览器兼容性
            },
            {
                test: /\.less$/,
                // 增加 'less-loader' ，注意顺序
                loader: ['style-loader', 'css-loader', 'less-loader']
            }
    ]
},
```
## 处理图片

```js
module: {
    rules: [
        // 图片 - 考虑 base64 编码的情况
        {
            test: /\.(png|jpg|jpeg|gif)$/,
            use: {
                loader: 'url-loader',
                options: {
                    // 小于 5kb 的图片用 base64 格式产出
                    // 否则，依然延用 file-loader 的形式，产出 url 格式
                    limit: 5 * 1024,

                    // 打包到 img 目录下
                    outputPath: '/img1/',

                    // 设置图片的 cdn 地址（也可以统一在外面的 output 中设置，那将作用于所有静态资源）
                    // publicPath: 'http://cdn.abc.com'
                }
            }
        },
    ]
},
```

## 多入口配置
```js
entry: {
    index: path.join(srcPath, 'index.js'),
    other: path.join(srcPath, 'other.js')
},
```

```js
output: {
    // filename: 'bundle.[contentHash:8].js',  // 打包代码时，加上 hash 戳
    filename: '[name].[contentHash:8].js', // name 即多入口时 entry 的 key
    path: distPath,
    // publicPath: 'http://cdn.abc.com'  // 修改所有静态文件 url 的前缀（如 cdn 域名），这里暂时用不到
},
```

```js
plugins: [
    // 多入口 - 生成 index.html
    new HtmlWebpackPlugin({
        template: path.join(srcPath, 'index.html'),
        filename: 'index.html',
        // chunks 表示该页面要引用哪些 chunk （即上面的 index 和 other），默认全部引用
        chunks: ['index']  // 只引用 index.js
    }),
    // 多入口 - 生成 other.html
    new HtmlWebpackPlugin({
        template: path.join(srcPath, 'other.html'),
        filename: 'other.html',
        chunks: ['other']  // 只引用 other.js
    })
]
```

## 抽离css
依赖包： `mini-css-extract-plugin`，`terser-webpack-plugin`，`optimize-css-assets-webpack-plugin`
```js
module: {
    rules: [
        // 抽离 css
        {
            test: /\.css$/,
            loader: [
                MiniCssExtractPlugin.loader,  // 注意，这里不再用 style-loader
                'css-loader',
                'postcss-loader'
            ]
        },
        // 抽离 less --> css
        {
            test: /\.less$/,
            loader: [
                MiniCssExtractPlugin.loader,  // 注意，这里不再用 style-loader
                'css-loader',
                'less-loader',
                'postcss-loader'
            ]
        }
    ]
},
plugins: [
    // 抽离 css 文件
    new MiniCssExtractPlugin({
        filename: 'css/main.[contentHash:8].css'
    })
],
optimization: {
    // 压缩 css
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
}
```

## 抽离公共代码
```js
optimization: {
    // 分割代码块
    splitChunks: {
        chunks: 'all',
        /**
         * initial 入口 chunk，对于异步导入的文件不处理
            async 异步 chunk，只对异步导入的文件处理
            all 全部 chunk
         */

        // 缓存分组
        cacheGroups: {
            // 第三方模块
            vendor: {
                name: 'vendor', // chunk 名称
                priority: 1, // 权限更高，优先抽离，重要！！！
                test: /node_modules/,
                minSize: 3000,  // 大小限制
                minChunks: 1  // 最少复用过几次, 引用了1次就分开打包
            },

            // 公共的模块
            common: {
                name: 'common', // chunk 名称
                priority: 0, // 优先级
                minSize: 0,  // 公共模块的大小限制
                minChunks: 2  // 公共模块最少复用过几次，引用了2次就分开打包
            }
        }
    }
}
```

```js
plugins: [
    // 多入口 - 生成 index.html
    new HtmlWebpackPlugin({
        template: path.join(srcPath, 'index.html'),
        filename: 'index.html',
        // chunks 表示该页面要引用哪些 chunk （即上面的 index 和 other），默认全部引用
        chunks: ['index', 'vendor', 'common']  // 要考虑代码分割
    }),
    // 多入口 - 生成 other.html
    new HtmlWebpackPlugin({
        template: path.join(srcPath, 'other.html'),
        filename: 'other.html',
        chunks: ['other', 'common']  // 考虑代码分割
    })
]
```
## 懒加载
直接写在代码中就可以了
```js
setTimeout(() => {
  import('./dynamic-data').then(res => {
    console.log(res.default.message)
  })
}, 1500)
```

## 处理JSX
安装 `@babel/preset-react`, 在`.babelrc`
```js
{
    "presets": ["@babel/preset-react"],
    "plugins": []
}
```

## vue支持
```js
module: {
        rules: [
            {
                test: /\.vue$/,
                loader: ['vue-loader'],
                include: srcPath
            },
        ]
}
```

# 优化构建速度
## 优化babel-loader
```js
{
    test: /\.js$/,
    loader: ['babel-loader?cacheDIrectory'], //开启缓存， 只用在dev
    include: path.resolve(__dirname, 'src'), //明确范围
    //排除范围， include 和 exclude 2选1
    //exclude: path.resolve(__dirname, 'node_modules'),
},
```

## ignorePlugin
```js
new webpack.IgnorePlugin(/\.\/locale/, /moment/),
```
## noParse
针对没有 AMD/CommonJS 的源代码，并且引入dist文件的话，那么可以使用noParse选项。
我们对类似jq这类依赖库，一般会认为不会引用其他的包，对于这类不引用其他的包的库，我们在打包的时候就没有必要去解析，这样能够增加打包速率。
```js
module: {
  noParse: /jquery|lodash/,
}
```
## happyPack 多进程打包
* JS 是单线程， 开启多进程打包
* 提高构建速度， 特别是多核CPU
* 使用： 安装`happypack`
```js
module: {
  rules: [
    {
        //需要替换babel-loader
        test: /\.js$/,
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        use: ['happypack/loader?id=babel'],
        include: srcPath,
        // exclude: /node_modules/
    },
  ]
},

plugins: [
  new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory']
  }),
]
```

## ParallelUglifyPlugin 多进程压缩js
* `webpack` 内置`Uglify` 工具压缩JS
* JS 是单线程， 开启多进程压缩更加快
* 和`happyPack`一样
* 使用： 安装`webpack-parallel-uglify-plugin`
```js
// 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
    new ParallelUglifyPlugin({
        // 传递给 UglifyJS 的参数
        // （还是使用 UglifyJS 压缩，只不过帮助开启了多进程）
        uglifyJS: {
            output: {
                beautify: false, // 最紧凑的输出
                comments: false, // 删除所有的注释
            },
            compress: {
                // 删除所有的 `console` 语句，可以兼容ie浏览器
                drop_console: true,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true,
            }
        }
    })
```
* 项目大， 打包较慢，开启多进程会提高速度
* 项目小， 打包快，开启多进程会降低速度（进程开销）
* 按需使用
## 自动刷新
* 一般用不上， 有`webpack-dev-server` 会自动开启动自动刷新
```js
 watch: true, // 开启监听，默认为 false
    watchOptions: {
    ignored: /node_modules/, // 忽略哪些
    // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
    // 默认为 300ms
    aggregateTimeout: 300,
    // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
    // 默认每隔1000毫秒询问一次
    poll: 1000
}
```

## 热更新
* 自动刷新: 整个网页全部刷新，速递较慢
* 自动刷新: 整个网页全部刷新，状态会丢失
* 热更新: 新代码生效，网页不刷新，状态不丢失
* 使用`webpack/lib/HotModuleReplacementPlugin`

```js
entry: {
    index: [
        'webpack-dev-server/client?http://localhost:8080/', //需要这2行
        'webpack/hot/dev-server',
        path.join(srcPath, 'index.js')
    ],
},
plugins: [
    new HotModuleReplacementPlugin()
],
devServer: {
    hot: true,
}
```

* 在需要热更新的代码中加logic
```js
// 增加，开启热更新之后的代码逻辑
if (module.hot) {
    //math 为监听范围之内
    module.hot.accept(['./math'], () => {
        const sumRes = sum(10, 30)
        console.log('sumRes in hot', sumRes)
    })
}
```

## DllPlugin 动态链接库插件
* 前端框架如 VUE react，体积大，构建慢
* 较稳定，不产生及
* 同一个版本只构建一次就可以，不用每次都重新构建
* `webpack` 已经内置了`DllPlugin`支持
* `DllPlugin`： 打包出dll文件
* `DllReferencePlug`： 使用dll文件

```js
//webpack.dll.js 文件
const path = require('path')
const DllPlugin = require('webpack/lib/DllPlugin')
const { srcPath, distPath } = require('./paths')

module.exports = {
  mode: 'development',
  // JS 执行入口文件
  entry: {
    // 把 React 相关模块的放到一个单独的动态链接库
    react: ['react', 'react-dom']
  },
  output: {
    // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称，
    // 也就是 entry 中配置的 react 和 polyfill
    filename: '[name].dll.js',
    // 输出的文件都放到 dist 目录下
    path: distPath,
    // 存放动态链接库的全局变量名称，例如对应 react 来说就是 _dll_react
    // 之所以在前面加上 _dll_ 是为了防止全局变量冲突
    library: '_dll_[name]',
  },
  plugins: [
    // 接入 DllPlugin
    new DllPlugin({
      // 动态链接库的全局变量名称，需要和 output.library 中保持一致
      // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
      // 例如 react.manifest.json 中就有 "name": "_dll_react"
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(distPath, '[name].manifest.json'),
    }),
  ],
}
```
```js
//index.html 文件引用
<script src="./react.dll.js"></script>
```

```js
// 在webpack.dev.js 文件中去使用dll 文件
// 第一，引入 DllReferencePlugin
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');

module.exports = smart(webpackCommonConf, {
  module: {
      rules: [
          {
              test: /\.js$/,
              loader: ['babel-loader'],
              include: srcPath,
              exclude: /node_modules/ // 第二，不要再转换 node_modules 的代码
          },
      ]
  },
  plugins: [
      // 第三，告诉 Webpack 使用了哪些动态链接库
      new DllReferencePlugin({
            // 描述 react 动态链接库的文件内容
            manifest: require(path.join(distPath, 'react.manifest.json')),
      }),
  ],
})
```

# 优化代产出代码
* 体积更小
* 合理分包，不重复加载
* 输出更快，内存使用更小

## 小图片base64编码
## bundle加hash
## 使用CDN加速
加包的文件加CDN前缀
```js
publicPath: 'http://cdn.abc.com' 
```
## 提取公共代码
## 懒加载
## IngorePlugin
## 使用production
* `mode: 'production'` 会自动压缩代码
* Vue/React等自动删除调试调试代码
* 启动Tree-Shaking （删除没有调用的代码）ES6 Module 才能让 tree-shaking 生效, commonjs 就不行
### ES6 Module 和 Commonjs 的区别
* ES6 Module静态引入，编译时引入
* Commonjs动态引入，执行时引入
* 只有ES6 Module才能静态分析，实现Tree-Shaking
```js
let a = require('./config/a.js')
if(isDev) {
  //可以动态引入，执行时引入
  a = require('./config/a_dev.js')
}
```

```js
import a from '../config/a.js'
if(isDev) {
  //编译时报错， 只能静态引入
  import a from '../config/a_dev.js'
}
```

## scope hosting
* 代码提交更小
* 创建函数作用域更小
* 代码可读性更好

```js
// hello.js
export default "hello"

// main.js
//import str from "./hello"
console.log(str)
```

```js
//默认打包结果, 会生成二个函数
[
  (function() {
    
  }),
  (function() {
    
  })
]
```

```js
//开启scope hosting
[
  (function() {
    var hello = ''
    console.log(hello)
  })
]
```

* 使用：
```js
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin')

module.exports = {
    resolve: {
        //针对Npm中的第三方模块优先采用jsnext:main中的指向的ES6 模块化语法的文件
        mainFields: ['jsnext:main', 'browser', 'main']
    },
    plugins: [
    //开启scope hosting
     new ModuleConcatenationPlugin()
    ]
}
```
