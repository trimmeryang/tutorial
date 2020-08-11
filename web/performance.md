# 指标
* FP (First Paint) 首次绘制
* FCP (First Contentful Paint) 首次内容绘制
* LCP (Largest Contentful Paint) 最大内容渲染
* DCL (DomContentloaded)
* FMP(First Meaningful Paint) 首次有效绘制
* L (onLoad)
* TTI (Time to Interactive) 可交互时间
* TBT (Total Blocking Time) 页面阻塞总时长
* FID (First Input Delay) 首次输入延迟
* CLS (Cumulative Layout Shift) 累积布局偏移
* SI (Speed Index)

# image
1. 使用srcset.
2. https://ausi.github.io/respimagelint/

# User monitoring
Domcontentload 
1. User timing api
这样就能在devtools里看见具体的效果了
```
async function init() {
  performance.mark('1');
  await sleep(); 
  performance.mark('2');
  await sleep(); 
  performance.mark('3');
  await sleep(); 
  performance.mark('4');
}

init().then(() => {
  //记录1到4的花费时间
  performance.measure('start', '1', '4');
  performance.measure('start', '2', '3');
})

```
2. lighthouse
3. webpagetest

# js performance metrics-指标
1. 把user timing api发到nodejs
boomerang 用于衡量真实用户的页面加载体验,通常称为真实用户监控(RUM). Boomerang测量页面加载体验的许多方面,包括主页面的所有可用网络时序(DNS,TCP,请求,响应)和其他重要的环境特征,例如用户代理信息等.
https://github.com/akamai/boomerang
https://github.com/springernature/boomcatch


# paint costs
# browser frame
frame per second - fps
# node
```
node --inspect-brk index.js
```
# js costs
