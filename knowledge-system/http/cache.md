# 缓存

## 按缓存位置分类

我们可以在 Chrome 的开发者工具中，Network -> Size 一列看到一个请求最终的处理方式：如果是资源大小 (多少 K， 多少 M 等) 就表示是网络请求，否则会列出 from memory cache, from disk cache 和 from ServiceWorker。它们的优先级是：(由上到下寻找，找到即返回；找不到则继续)

1. Service Worker
2. Memory Cache
3. Disk Cache
4. 网络请求

###  memory cache

memory cache 是内存中的缓存，(与之相对 disk cache 就是硬盘上的缓存)。按照操作系统的常理：先读内存，再读硬盘。