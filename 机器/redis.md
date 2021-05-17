# 常识
硬盘：
带宽，吞吐: 百兆 G  pci-e nvme
寻址时间: ms
内存:　ｎｓ
#　Redis
https://zhuanlan.zhihu.com/p/95795944

面试题目:
https://www.jianshu.com/p/c7c352cb14fe

* 采用单进程 单线程，不需要锁
* 单个实例不要存太大文件， 4-5g一个实例
* 单核的，不能发挥CPU多核的优势
* 不要承担所有的热数据
* 10w+ 的QPS
* 内存配置75%的系统内存 
```
maxmemory 100mb
```
# db排名
https://db-engines.com/en/ranking

# 单线程: 串行化
# 连接池: 就是一个list

# 内核模型
https://www.cnblogs.com/aspirant/p/9166944.html

1. nio（non_blocking_io）
2. 多路复用- 使用内核方法
## select  -- 具有O(n)的无差别轮询复杂度
 单个进程可监视的fd数量被限制，即能监听端口的大小有限。 一般来说这个数目和系统内存关系很大，具体数目可以cat /proc/sys/fs/file-max察看。32位机默认是1024个。64位机默认是2048.
```
//传入所有的客户端数，让内核去处理。
select（1024）
```
## poll  -- 时间复杂度O(n)
但是它没有最大连接数的限制，原因是它是基于链表来存储的
## EPOLL -- 时间复杂度O(1)
1. 没有最大并发连接的限制，能打开的FD的上限远大于1024（1G的内存上能监听约10万个端口）；
2. 效率提升，不是轮询的方式，不会随着FD数目的增加效率下降。只有活跃可用的FD才会调用callback函数；
即Epoll最大的优点就在于它只管你“活跃”的连接，而跟连接总数无关，因此在实际的网络环境中，Epoll的效率就会远远高于select和poll。
```
epoll_create
// 注册要监听的事件类型
epoll_ctl  
epoll_wait
```

### LT模式
LT(level triggered)是缺省的工作方式，并且同时支持block和no-block socket。在这种做法中，内核告诉你一个文件描述符是否就绪了，然后你可以对这个就绪的fd进行IO操作。如果你不作任何操作，内核还是会继续通知你的。
### ET模式
1. ET(edge-triggered)是高速工作方式，只支持no-block socket。在这种模式下，当描述符从未就绪变为就绪时，内核通过epoll告诉你。然后它会假设你知道文件描述符已经就绪，并且不会再为那个文件描述符发送更多的就绪通知，直到你做了某些操作导致那个文件描述符不再为就绪状态了(比如，你在发送，接收或者接收请求，或者发送接收的数据少于一定量时导致了一个EWOULDBLOCK 错误）。但是请注意，如果一直不对这个fd作IO操作(从而导致它再次变成未就绪)，内核不会发送更多的通知(only once)。

2. ET模式在很大程度上减少了epoll事件被重复触发的次数，因此效率要比LT模式高。epoll工作在ET模式的时候，必须使用非阻塞套接口，以避免由于一个文件句柄的阻塞读/阻塞写操作把处理多个文件描述符的任务饿死。

## 对比
1. 表面上看epoll的性能最好，但是在连接数少并且连接都十分活跃的情况下，select和poll的性能可能比epoll好，毕竟epoll的通知机制需要很多函数回调。
2. select低效是因为每次它都需要轮询。但低效也是相对的，视情况而定，也可通过良好的设计改善。

# io threads
https://www.cnblogs.com/architectforest/p/12837571.html

redis 6新增了io多线程。 
1. 计算还是在主的worker 线程上（永远是单线程）
2. read、write放到其他线程。
```
# So for instance if you have a four cores boxes, try to use 2 or 3 I/O
# threads, if you have a 8 cores, try to use 6 threads. In order to
# enable I/O threads use the following configuration directive:
#
# io-threads 4
#
# Setting io-threads to 1 will just use the main thread as usually.
# When I/O threads are enabled, we only use threads for writes, that is
# to thread the write(2) syscall and transfer the client buffers to the
# socket. However it is also possible to enable threading of reads and
# protocol parsing using the following configuration directive, by setting
# it to yes:
#
# io-threads-do-reads no
```
# 数据类型
## string
1. 字符串操作类  --> session共享, 对象，小文件 -->　二进制安全，字节数值
2. 数值操作类 （int），比如数值加1
 --> 秒杀的库存（限流，削峰）， 计数（INCR k1）
3. bitmap二进制类 --> web,离线分析
 * 统计: 任意时间窗口内，用户的登录次数 
 ```
 //哪一天登录了， 就设置为1
setbit trimmer 2 1
//2021年登录了
setbit trimmer:2021 2 1
setbit trimmer 364  1
//统计登录次数
BITCOUNT trimmer 0 -1
```
* 算活跃用户: 双11， 送礼的话，要备货

```
//表示2020年5月21 10号用户登录了。
setbit 20200521 10 1
setbit 20200521 11 1
setbit 20200522 11 1

//计算通过位或 来收纳
bitop or res 20200521 20200521
//统计
bitcount res 0 -1
```
* OA，linux等设置权限
* 布隆过滤器 -- redis 模块化， 有布隆过滤器

## list
能模拟： 1同向为栈，2异向为队列，3数组
ltrim数据
### 解决
1. 数据共享，迁出
2. 无状态

## hash
类似于hashmap
### 解决
聚合场景 - 商品详情页， 用redis做缓存聚合数据，如product，order

## set
hashtable == 会去重，无序。 是个集合 -- 多成本，不推荐使用。

### 解决
1.  随机事件
抽奖 -- srandmember k1 3
spop k1 一次弹出一个
2. 集合操作(效率低，需要只用一个redis)
SUNION(并集) SINTER(交集) SDIFF（差集）
简单的推荐系统
共同好友:交集
推荐好友：差集

## sorted set--zset
内部是个hash 加 skiplist
有分值（score）， rank， 有正序(zrank k1 0 1)，倒序(从大到小zrevrange k1 0 1)

他是一个ziplist，当操作64字节是skiplist

## 场景
1. 排行榜
2. 有序事件
3. 评论-分页

## skiplist
使用了 跳跃表 最多造64层

# 持久化
性能下降
## 快照-rdb
恢复的速度快，丢失的多
## 日志-aof
完整性比较，问题：
1. 速度慢 
2. 冗余量比较大，比如当用户对一个数据重复操作的时候，日志会一直追加 （可以重写来解决 bgrewriteaof）

### 级别
1. 每个操作都写到日志--完整，会降级，等于mysql了。
2. 每秒钟写入（默认的）-- 一个buffer丢失小于一个buffer
3. os缓冲， 满了刷


### 使用

1. rdb 默认开启
2. aof 默认关闭 （4.3以前只能2选一）
3. 混合使用（4.3 之后）-- hdfs是一样的。
先RDB（比如8点的），然后把8点之后的数据用日志追加
```
appendonly yes
//3个级别
appendfssync no //always/everysec
aof-use-rdb-preamble yes
```

# 分布式集群
可用性
## 单点故障
主从主备，一变多，集群，需要数据同步
### 主从复制
单点故障
1. 强一致性: 客户端需要等待主从2机器都写好数据。 这个会破坏 可用性（在分布式中 CAP）
2. 弱一致性: C -> master, master直接返回数据，然后异步写到cluster（可能失败）。redis默认使用。
3. 最终一致性（POXOS）：c-> master, master直接返回数据, 然后使用 可靠集群，保证最终一致性。 现在redis没有？
## 压力大
1. 分片集群---客服端实现。
2. 代理集群，不需要同步。需要考虑代理层瓶颈，系统可靠度等
3. redis集群

## AKF拆分原则
根据业务划分数据到不同的redis实例
x轴: 多台备机 - 冗余
y轴: 业务划分分治 -> 高可用
z轴： 分片： eg : hash%4

# 缓存
## 缓存淘汰
1. INFO: Fist in first out
2. LRU: Least Recently Used
3. LFU：Least Frequently Used

noeviction
allkeys-lru/lfu
volatile-lru/lfu
allkeys-random
volatile-random
volatile-ttl

## 缓存穿透
查询不存在的对象，缓存和存储都不会命中
### 解决方案
1. 设置空对象
2. 布隆过滤器-bitmap
* 就是在redis和mysql 中加一个hash 算法。
原理:
https://www.jianshu.com/p/2104d11ee0a2
使用：
https://www.cnblogs.com/heihaozi/p/12174478.html

#### 布隆过滤器错误
就是布隆过滤器告诉数据存在，实际不存在(hash碰撞)，但是如果告诉数据不存在就一定不存在。 
解决：1. 增加数组长度 2. 增加hash函数（3-5个函数）

## 缓存击穿
缓存中的单个热点数据过期了，这时就会都去读取数据库的数据。中小业务不需要解决。
### 解决
分布式锁-zookeeper
zookeeper 分布式的一致性服务框架 最终一致性
```
1. 分布式锁
2. 服务发现
3. 大数据框架选举
4. 注册中心
```

## 缓存雪崩
缓存雪崩是指缓存中数据大批量到过期时间，而查询数据量巨大，引起数据库压力过大甚至down机。

### 解决方案
1. 过期时间设置为不一致
2. 使用redis集群。

#### 怎么做切片
当我们需要新增节点时，普通的hash算法，会造成所有的节点数据倾斜。
https://zhuanlan.zhihu.com/p/34985026
1. 一致性hash算法，使用hash环，来解决。
数据和服务器分别算hash放置于环上。

2. 一致性hash算法也会有数据倾斜，搞虚拟节点。


# 哨兵
```
sentinel monitor mymaster 127.0.0.1 6379 2
```
1. 监控
每10s 先master后salve发送info，后cmd链接
2. 通知
每2s 发送 setninel:hello 到主节点
每1s 向其他哨兵发ping命令
3. 故障转移阶段
* 主观下线-flags:SRI-S-DOWN： 一台setninel认为master挂了
* 客观下线-flags:SRI--DOWN： 超过半数setninel认为master挂了

