import hotEmitter from "webpack/hot/emitter.js";
import { log } from "./log.js";

function reloadApp({ hot, liveReload }, { isUnloading, currentHash }) {
  if (isUnloading) {
    return;
  }

  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);

    log.info("App updated. Reloading...");

    rootWindow.location.reload();
  }

  const search = self.location.search.toLowerCase();
  const allowToHot = search.indexOf("webpack-dev-server-hot=false") === -1;
  const allowToLiveReload =
    search.indexOf("webpack-dev-server-live-reload=false") === -1;

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
  // allow refreshing the page only if liveReload isn't disabled
  else if (liveReload && allowToLiveReload) {
    let rootWindow = self;

    // use parent window for reload (in case we're in an iframe with no valid src)
    const intervalId = self.setInterval(() => {
      if (rootWindow.location.protocol !== "about:") {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;

        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }
}

export default reloadApp;