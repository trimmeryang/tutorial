- [配置](#--)
  * [拆分配置和merge](#-----merge)
  * [启动本地服务](#------)
  * [处理es6](#--es6)
  * [处理样式](#----)
  * [处理图片](#----)
  * [多入口配置](#-----)
  * [抽离css](#--css)
  * [抽离公共代码](#------)
  * [懒加载](#---)
  * [处理JSX](#--jsx)
  
# 概念
# module/chunk/bundle
* module -- 各源码文件， webpack中一切都是模块
* chuck -- 多模块的合成，entry import() splitChunk
* bundle -- 

# 配置

## 拆分配置和merge
使用require('webpack-merge') 来拆分成“webpack.common.js”， “webpack.dev.js”， “webpack.prod.js”
## 启动本地服务
使用webpack-dev-server
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
使用babel-loader
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
依赖包： mini-css-extract-plugin，terser-webpack-plugin，optimize-css-assets-webpack-plugin
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
安装 @babel/preset-react, 在.babelrc
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


