# HMR 原理

hot module replacement 模块热替换的原理。

## 概念

* Webpack-complier ：webpack 的编译器，将 JavaScript 编译成 bundle
* Bunble Server：提供文件在浏览器的访问，也就是我们平时能够正常通过 localhost 访问我们本地网站的原因
* HMR Server：将热更新的文件输出给 HMR Runtime
* HMR Runtime：开启了热更新的话，在打包阶段会被注入到浏览器中的 bundle.js，这样 bundle.js 就可以跟服务器建立连接，通常是使用 websocket ，当收到服务器的更新指令的时候，就去更新文件的变化
* bundle.js：构建输出的文件

## 流程

1. 最初启动的时候，文件经过 Webpack-complier 编译好后传输给 Bundle Server，Bundle Server 可以让浏览器访问到我们打包出来的文件
2. 当代码被修改后，文件经过 Webpack-complier 编译好后传输给 HMR Server，HMR Server 知道哪个模块发生了改变，就通知 HMR Runtime 有哪些变化。HMR Runtime 就会更新我们的代码，这样我们浏览器就会更新并且不需要刷新

## 源码阅读

HMR 的关键之处就在于启动 Bundle Server 的时候已经往我们的 bundle.js 中注入了 HMR Runtime，HMR Runtime 用来启动 Websocket，接受 HMR Server 发来的变更。

也就是以下几个关键点：

* Webpack 如何启动了 HMR Server
* HMR Server 如何跟 HMR Runtime 进行通信的
* HMR Runtime 接受到变更之后，如何生效的

### 启动 HMR Server

这个工作主要在 webpack-dev-server 中完成。

* webpack-dev-server 源代码中的 lib/Server.js setupApp 方法，Bundle Server 其实是一个 express 服务器：

```js
  setupApp() {
    // Init express server
    // eslint-disable-next-line new-cap
    
    // 初始化 express 服务
    // 使用 express 框架启动本地 server，让浏览器可以请求本地的静态资源。
    this.app = new express();
  }
```

* 启动服务结束之后就通过 createSocketServer 创建 websocket 服务

```js
listen(port, hostname, fn) {
    //...

    return resolveFreePortOrIPC()
      .then(() => {
        this.initialize();

        const listenOptions = this.options.ipc
          ? { path: this.options.ipc }
          : {
              host: this.options.host,
              port: this.options.port,
            };

        return this.server.listen(listenOptions, (error) => {
          if (this.options.ipc) {
            // chmod 666 (rw rw rw)
            const READ_WRITE = 438;

            fs.chmodSync(this.options.ipc, READ_WRITE);
          }

          if (this.options.webSocketServer) {
            try {
            // 启动 websocket 服务
              this.createWebSocketServer();
            } catch (webSocketServerError) {
              fn.call(this.server, webSocketServerError);

              return;
            }
          }

          if (this.options.bonjour) {
            this.runBonjour();
          }

          this.logStatus();

          if (fn) {
            fn.call(this.server, error);
          }

          if (typeof this.options.onListening === "function") {
            this.options.onListening(this);
          }
        });
      })
      .catch((error) => {
        if (fn) {
          fn.call(this.server, error);
        }
      });
}

createWebSocketServer() {
    this.webSocketServer = new (this.getWebSocketServerImplementation())(this);
    this.webSocketServer.implementation.on("connection", (client, request) => {

    }
}

```

### HMR Server 和 HMR Runtime 的通信

关键点是通信的时机，什么时候去通知客户端文件更新了。通过 webpack 创建的 compiler 实例（监听本地文件的变化、文件改变自动编译、编译输出），可以往 compiler.hooks.done 钩子（代表 webpack 编译完之后触发）注册事件， 当监听到一次 webpack 编译结束，就会调用 sendStats 方法。

查看 lib/Server.js 中的 setupHooks 方法

```js
setupHooks() {
    const addHooks = (compiler) => {
      compiler.hooks.invalid.tap("webpack-dev-server", () => {
        if (this.webSocketServer) {
          this.sendMessage(this.webSocketServer.clients, "invalid");
        }
      });
      // done 钩子意味着编译结束
      compiler.hooks.done.tap("webpack-dev-server", (stats) => {
        if (this.webSocketServer) {
        // 当监听到一次 webpack 编译结束，就会调用 sendStats 方法
          this.sendStats(this.webSocketServer.clients, this.getStats(stats));
        }

        this.stats = stats;
      });
    };

    if (this.compiler.compilers) {
      this.compiler.compilers.forEach(addHooks);
    } else {
      addHooks(this.compiler);
    }
}
```

当监听到一次 webpack 编译结束，就会调用 sendStats 方法，里面会向客户端发送 hash 和 ok 事件

```js
  // Send stats to a socket or multiple sockets
  sendStats(clients, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);

    if (shouldEmit) {
      this.sendMessage(clients, "still-ok");

      return;
    }

    // hash 事件
    this.sendMessage(clients, "hash", stats.hash);

    if (stats.errors.length > 0 || stats.warnings.length > 0) {
      if (stats.warnings.length > 0) {
        this.sendMessage(clients, "warnings", stats.warnings);
      }

      if (stats.errors.length > 0) {
        this.sendMessage(clients, "errors", stats.errors);
      }
    } else {
      // ok 事件
      this.sendMessage(clients, "ok");
    }
  }
```

* 在 client-src/index.js 中，会去更新 hash，并且在 ok 的时候去进行检查更新 reloadApp

```js
const onSocketMessage = {
  // 更新 current Hash
  hash(hash) {
    status.currentHash = hash;
  },
  ok() {
    sendMessage("Ok");

    if (options.overlay) {
      hide();
    }

    if (options.initial) {
      return (options.initial = false);
    }
    // 进行更新检查等操作
    reloadApp(options, status);
  },
}
```

* 接下来我们看看 client-src/utils/reloadApp.js 中的 reloadApp。这里又利用 node.js 的 EventEmitter，发出 webpackHotUpdate 消息。这里又将更新的事情重新还给了 webpack（为了更好的维护代码，以及职责划分的更明确。）

```js
function reloadApp() {
    
  if (hot && allowToHot) {
    log.info("App hot update...");

    //  hotEmitter 是 EventEmitter 的实例
    // 利用 node.js 的 EventEmitter，发出 webpackHotUpdate 消息
    // websocket 仅仅用于客户端（浏览器）和服务端进行通信。而真正做事情的活还是交还给了 webpack
    hotEmitter.emit("webpackHotUpdate", currentHash);

    if (typeof self !== "undefined" && self.window) {
      // broadcast update to window
      self.postMessage(`webpackHotUpdate${currentHash}`, "*");
    }
  }
}
```

* 在 webpack 的 hot/dev-server.js 中，监听 webpackHotUpdate 事件，并执行 check 方法。并在 check 方法中调用 module.hot.check 方法进行热更新。

```js
  //  moudle.hot.check 开始热更新
  // 之后的源码都是 HotModuleReplacementPlugin 塞入到 bundle.js 中的
	var check = function check() {
		module.hot
			.check(true)
			.then(function (updatedModules) {
				if (!updatedModules) {
					log("warning", "[HMR] Cannot find update. Need to do a full reload!");
					log(
						"warning",
						"[HMR] (Probably because of restarting the webpack-dev-server)"
					);
					window.location.reload();
					return;
				}

				if (!upToDate()) {
					check();
				}

				require("./log-apply-result")(updatedModules, updatedModules);

				if (upToDate()) {
					log("info", "[HMR] App is up to date.");
				}
			})
			.catch(function (err) {
				var status = module.hot.status();
				if (["abort", "fail"].indexOf(status) >= 0) {
					log(
						"warning",
						"[HMR] Cannot apply update. Need to do a full reload!"
					);
					log("warning", "[HMR] " + log.formatError(err));
					window.location.reload();
				} else {
					log("warning", "[HMR] Update failed: " + log.formatError(err));
				}
			});
	};
	var hotEmitter = require("./emitter");
    
    // 监听 webpackHotUpdate 事件
	hotEmitter.on("webpackHotUpdate", function (currentHash) {
		lastHash = currentHash;
		if (!upToDate() && module.hot.status() === "idle") {
			log("info", "[HMR] Checking for updates on the server...");
			check();
		}
	});
```

至于 module.hot.check ，实际上通过 HotModuleReplacementPlugin 已经注入到我们 chunk 中了（也就是我们上面所说的 HMR Runtime）

### HMR Runtime 更新 bundle.js

查看打包后的文件，开启热更新之后生成的代码会比不开启多出很多东西（为了更加直观看到，可以将其输出到本地），这些就是帮助 webpack 在浏览器端去更新 bundle.js 的 HMR Runtime 代码。

打包后的代码中新增了一个 createModuleHotObject。

```js
module.hot = createModuleHotObject(options.id, module);
```

createModuleHotObject 返回了一个对象，上面挂了各种方法，需要注意 check 方法

```js
function createModuleHotObject(moduleId, me) {
    var hot = {
        check: hotCheck,
    }
    return hot;
}
```

hotCheck 中调用了 `__webpack_require__.hmrM`

```js
function hotCheck(applyOnUpdate) {
    if (currentStatus !== "idle") {
        throw new Error("check() is only allowed in idle status");
    }
    return setStatus("check")
        .then(__webpack_require__.hmrM)
        .then(function (update) {
            if (!update) {
                return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
                    function () {
                        return null;
                    }
                );
            }

            return setStatus("prepare").then(function () {
                var updatedModules = [];
                blockingPromises = [];
                currentUpdateApplyHandlers = [];

                return Promise.all(
                    Object.keys(__webpack_require__.hmrC).reduce(function (
                        promises,
                        key
                    ) {
                        __webpack_require__.hmrC[key](
                            update.c,
                            update.r,
                            update.m,
                            promises,
                            currentUpdateApplyHandlers,
                            updatedModules
                        );
                        return promises;
                    },
                    [])
                ).then(function () {
                    return waitForBlockingPromises(function () {
                        if (applyOnUpdate) {
                            return internalApply(applyOnUpdate);
                        } else {
                            return setStatus("ready").then(function () {
                                return updatedModules;
                            });
                        }
                    });
                });
            });
        });
}
```

来看 `__webpack_require__.hmrM`, 其中 `__webpack_require__.p` 指的是本地服务的域名，类似 `http://0.0.0.0:9528` ， 另外 `__webpack_require__.hmrF` 去获取 `.hot-update.json` 文件的地址


```js
__webpack_require__.hmrM = () => {
	if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
	return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
		if(response.status === 404) return; // no update available
		if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
		return response.json();
	});
};

(() => {
	__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
})();
```

### 加载要更新的模块

下面来看如何加载我们要更新的模块的，可以看到打包出来的代码中有 loadUpdateChunk

```js
function loadUpdateChunk(chunkId) {
	return new Promise((resolve, reject) => {
		waitingUpdateResolves[chunkId] = resolve;
		// start update chunk loading
		var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
		// create error before stack unwound to get useful stacktrace later
		var error = new Error();
		var loadingEnded = (event) => {
			if(waitingUpdateResolves[chunkId]) {
				waitingUpdateResolves[chunkId] = undefined
				var errorType = event && (event.type === 'load' ? 'missing' : event.type);
				var realSrc = event && event.target && event.target.src;
				error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
				error.name = 'ChunkLoadError';
				error.type = errorType;
				error.request = realSrc;
				reject(error);
			}
		};
		__webpack_require__.l(url, loadingEnded);
	});
}
```

再看 `__webpack_require__.l`，主要通过类似 JSONP 的方式进行，因为JSONP获取的代码可以直接执行。

```js
__webpack_require__.l = (url, done, key, chunkId) => {
	if(inProgress[url]) { inProgress[url].push(done); return; }
	var script, needAttach;
	if(key !== undefined) {
		var scripts = document.getElementsByTagName("script");
		for(var i = 0; i < scripts.length; i++) {
			var s = scripts[i];
			if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
		}
	}
	if(!script) {
		needAttach = true;
		script = document.createElement('script');

		script.charset = 'utf-8';
		script.timeout = 120;
		if (__webpack_require__.nc) {
			script.setAttribute("nonce", __webpack_require__.nc);
		}
		script.setAttribute("data-webpack", dataWebpackPrefix + key);
		script.src = url;
	}
	inProgress[url] = [done];
	var onScriptComplete = (prev, event) => {
		// avoid mem leaks in IE.
		script.onerror = script.onload = null;
		clearTimeout(timeout);
		var doneFns = inProgress[url];
		delete inProgress[url];
		script.parentNode && script.parentNode.removeChild(script);
		doneFns && doneFns.forEach((fn) => (fn(event)));
		if(prev) return prev(event);
	}
	;
	var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
	script.onerror = onScriptComplete.bind(null, script.onerror);
	script.onload = onScriptComplete.bind(null, script.onload);
	needAttach && document.head.appendChild(script);
};
```

webpackHotUpdatetest_hmr 函数用于更新模块

```js
// webpackHotUpdate + 项目名
self["webpackHotUpdatetest_hmr"] = (chunkId, moreModules, runtime) => {
	for(var moduleId in moreModules) {
		if(__webpack_require__.o(moreModules, moduleId)) {
			currentUpdate[moduleId] = moreModules[moduleId];
			if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
		}
	}
	if(runtime) currentUpdateRuntime.push(runtime);
	if(waitingUpdateResolves[chunkId]) {
		waitingUpdateResolves[chunkId]();
		waitingUpdateResolves[chunkId] = undefined;
	}
};
```


## 总结

* HMR Runtime 通过 HotModuleReplacementPlugin 已经注入到我们 chunk  中了
* 除了开启一个 Bundle Server，还开启了 HMR Server，主要用来和 HMR Runtime 中通信
* 在编译结束的时候，通过 compiler.hooks.done，监听并通知客户端
* 客户端接收到之后，就会调用  module.hot.check 等，发起 http 请求去服务器端获取新的模块资源解析并局部刷新页面
