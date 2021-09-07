# 模块化

## commonjs

commonjs 的核心思想是通过 rquire 方法来同步加载依赖的其他模块，通过 module.exports 暴露接口。

```js
//导出
module.exports = moduleA.someFunc;


//导入
const moduleA = require('./moduleA')
```

### require

在 nodejs 代码中碰到 require(x) 函数调用，按照下面的顺序处理：

1. 如果 x 的是内置模块，直接返回该模块。

```js
require('http')
```

2. 如果 x 是 `./` 或 `../` 或 `/` 开头，
    1. 把 x 当作一个文件来查找。如果 x 本身就带文件后缀名，就查找对应文件，如果没有后缀名，则按照如下文件格式进行匹配：
        1. x
        2. x.js
        3. x.json
        4. x.node
    2. 如果当作文件没有找到，就把 x 当作一个目录，去查找这个目录下的 index 文件
        1. x/index.js
        2. x/index.json
        3. x/index.node
    3. 如果仍然没找到，抛出错误：not found

3. 如果 x 就是直接一个字符串值，并且不是内置模块
    1. 在当前目录下的 node_modules 寻找该模块
    2. 如果找不到就到上一层目录中的 node_modules 寻找该模块
    3. 如果一直找到了根目录都没有找到，抛出错误：not found


第三种情况中往上一层目录找 node_modules 中查找模块的路径在 module.paths 这个数组中

关于 require 加载模块需要注意的：

* 模块第一次被 require 时，模块中代码会被执行一次，然后将结果缓存起来
* 之后再次加载，就会读取缓存，不会再次执行模块中代码了。（每一个模块对象都有一个 loaded 属性，是否已经被加载过了）

### module.exports 和 exports 的关系

默认情况下，module.exports 和 exports 指向同一个对象，也就是说，nodejs 模块内部是这样实现的：

```js
function Module(id = '', parent) {
  this.id = id;
  this.path = path.dirname(id);
  this.exports = {};
  moduleParentCache.set(this, parent);
  updateChildren(parent, this, false);
  this.filename = null;
  this.loaded = false;
  this.children = [];
}
Module.prototype._compile = function () {
    const exports = this.exports;
}
// module 就是当前模块，是 Module 类的一个实例，就是这里的 this。
```

真正负责导出的是 module.exports，所以如果给 module.exports 重新赋值，则 exports 引用的对象就不再是将被导出的模块了，会失效。

### require 原理

require 的源码显示其实是调用了 Module._load() 方法

```js
Module.prototype.require = function(id) {
  validateString(id, 'id');
  if (id === '') {
    throw new ERR_INVALID_ARG_VALUE('id', id,
                                    'must be a non-empty string');
  }
  requireDepth++;
  try {
    return Module._load(id, this, /* isMain */ false);
  } finally {
    requireDepth--;
  }
};
```

下面是 Module._load() 源码

```js
// Check the cache for the requested file.
// 1. If a module already exists in the cache: return its exports object.
// 2. If the module is native: call
//    `NativeModule.prototype.compileForPublicLoader()` and return the exports.
// 3. Otherwise, create a new module for the file and save it to the cache.
//    Then have it load  the file contents before returning its exports
//    object.
// 1. 如果模块已经缓存过了，返回模块的 exports 属性
// 2. 如果是原生模块，调用 NativeModule.prototype.compileForPublicLoader() 然后返回它的 exports 属性
// 3. 否则，为请求的文件创建一个新的模块对象保存在缓存里。文件内容加载后再将它的 exports 属性返回
Module._load = function(request, parent, isMain) {
  let relResolveCacheIdentifier;
  if (parent) {
    debug('Module._load REQUEST %s parent: %s', request, parent.id);
    // Fast path for (lazy loaded) modules in the same directory. The indirect
    // caching is required to allow cache invalidation without changing the old
    // cache key names.
    relResolveCacheIdentifier = `${parent.path}\x00${request}`;
    const filename = relativeResolveCache[relResolveCacheIdentifier];
    if (filename !== undefined) {
      const cachedModule = Module._cache[filename];
      if (cachedModule !== undefined) {
        updateChildren(parent, cachedModule, true);
        if (!cachedModule.loaded)
          return getExportsForCircularRequire(cachedModule);
        return cachedModule.exports;
      }
      delete relativeResolveCache[relResolveCacheIdentifier];
    }
  }

  // 计算模块的绝对路径
  const filename = Module._resolveFilename(request, parent, isMain);
  if (StringPrototypeStartsWith(filename, 'node:')) {
    // Slice 'node:' prefix
    const id = StringPrototypeSlice(filename, 5);

    const module = loadNativeModule(id, request);
    if (!module?.canBeRequiredByUsers) {
      throw new ERR_UNKNOWN_BUILTIN_MODULE(filename);
    }

    return module.exports;
  }

  // 如果有缓存，取出缓存
  const cachedModule = Module._cache[filename];
  if (cachedModule !== undefined) {
    updateChildren(parent, cachedModule, true);
    if (!cachedModule.loaded) {
      const parseCachedModule = cjsParseCache.get(cachedModule);
      if (!parseCachedModule || parseCachedModule.loaded)
        return getExportsForCircularRequire(cachedModule);
      parseCachedModule.loaded = true;
    } else {
      return cachedModule.exports;
    }
  }

  // 如果为内置模块，就获取后返回
  const mod = loadNativeModule(filename, request);
  if (mod?.canBeRequiredByUsers) return mod.exports;

  // 生成模块实例
  // Don't call updateChildren(), Module constructor already does.
  const module = cachedModule || new Module(filename, parent);

  if (isMain) {
    process.mainModule = module;
    module.id = '.';
  }

  // 存入缓存
  Module._cache[filename] = module;
  if (parent !== undefined) {
    relativeResolveCache[relResolveCacheIdentifier] = filename;
  }

  let threw = true;
  // 加载模块
  try {
    module.load(filename);
    threw = false;
  } finally {
    if (threw) {
      delete Module._cache[filename];
      if (parent !== undefined) {
        delete relativeResolveCache[relResolveCacheIdentifier];
        const children = parent?.children;
        if (ArrayIsArray(children)) {
          const index = ArrayPrototypeIndexOf(children, module);
          if (index !== -1) {
            ArrayPrototypeSplice(children, index, 1);
          }
        }
      }
    } else if (module.exports &&
               !isProxy(module.exports) &&
               ObjectGetPrototypeOf(module.exports) ===
                 CircularRequirePrototypeWarningProxy) {
      ObjectSetPrototypeOf(module.exports, ObjectPrototype);
    }
  }

  // 返回加载后的模块的 exports 属性
  return module.exports;
};
```

就如同源码的注释，require 的流程如下：

1. 如果模块已经缓存过了，返回模块的 exports 属性
2. 如果是原生模块，调用 NativeModule.prototype.compileForPublicLoader() 然后返回它的 exports 属性
3. 否则，为请求的文件创建一个新的模块对象保存在缓存里。文件内容加载后再将它的 exports 属性返回


Module._resolveFilename 解析模块文件的绝对路径

```js
Module._resolveFilename = function(request, parent, isMain, options) {
  if (StringPrototypeStartsWith(request, 'node:') ||
      NativeModule.canBeRequiredByUsers(request)) {
    return request;
  }

  let paths;

  if (typeof options === 'object' && options !== null) {
    if (ArrayIsArray(options.paths)) {
      const isRelative = StringPrototypeStartsWith(request, './') ||
          StringPrototypeStartsWith(request, '../') ||
          ((isWindows && StringPrototypeStartsWith(request, '.\\')) ||
          StringPrototypeStartsWith(request, '..\\'));

      if (isRelative) {
        paths = options.paths;
      } else {
        const fakeParent = new Module('', null);

        paths = [];

        for (let i = 0; i < options.paths.length; i++) {
          const path = options.paths[i];
          fakeParent.paths = Module._nodeModulePaths(path);
          const lookupPaths = Module._resolveLookupPaths(request, fakeParent);

          for (let j = 0; j < lookupPaths.length; j++) {
            if (!ArrayPrototypeIncludes(paths, lookupPaths[j]))
              ArrayPrototypePush(paths, lookupPaths[j]);
          }
        }
      }
    } else if (options.paths === undefined) {
      paths = Module._resolveLookupPaths(request, parent);
    } else {
      throw new ERR_INVALID_ARG_VALUE('options.paths', options.paths);
    }
  } else {
    // 列出可能的所有路径
    paths = Module._resolveLookupPaths(request, parent);
  }

  if (parent?.filename) {
    if (request[0] === '#') {
      const pkg = readPackageScope(parent.filename) || {};
      if (pkg.data?.imports != null) {
        try {
          return finalizeEsmResolution(
            packageImportsResolve(request, pathToFileURL(parent.filename),
                                  cjsConditions), request, parent.filename,
            pkg.path);
        } catch (e) {
          if (e.code === 'ERR_MODULE_NOT_FOUND')
            throw createEsmNotFoundErr(request);
          throw e;
        }
      }
    }
  }

  // Try module self resolution first
  const parentPath = trySelfParentPath(parent);
  const selfResolved = trySelf(parentPath, request);
  if (selfResolved) {
    const cacheKey = request + '\x00' +
         (paths.length === 1 ? paths[0] : ArrayPrototypeJoin(paths, '\x00'));
    Module._pathCache[cacheKey] = selfResolved;
    return selfResolved;
  }

  // Look up the filename first, since that's the cache key.
  // 查找真正的路径，如果找到就返回
  const filename = Module._findPath(request, paths, isMain, false);
  if (filename) return filename;
  const requireStack = [];
  for (let cursor = parent;
    cursor;
    cursor = moduleParentCache.get(cursor)) {
    ArrayPrototypePush(requireStack, cursor.filename || cursor.id);
  }
  let message = `Cannot find module '${request}'`;
  if (requireStack.length > 0) {
    message = message + '\nRequire stack:\n- ' +
              ArrayPrototypeJoin(requireStack, '\n- ');
  }
  // eslint-disable-next-line no-restricted-syntax
  const err = new Error(message);
  err.code = 'MODULE_NOT_FOUND';
  err.requireStack = requireStack;
  throw err;
};
```

Module._findPath 从可能的路径组成的数组中查到到真正的路径

```js
Module._findPath = function(request, paths, isMain) {
  const absoluteRequest = path.isAbsolute(request);
  if (absoluteRequest) {
    paths = [''];
  } else if (!paths || paths.length === 0) {
    return false;
  }

  // 如果当前路径已在缓存中，直接返回缓存
  const cacheKey = request + '\x00' + ArrayPrototypeJoin(paths, '\x00');
  const entry = Module._pathCache[cacheKey];
  if (entry)
    return entry;

  let exts;
  let trailingSlash = request.length > 0 &&
    StringPrototypeCharCodeAt(request, request.length - 1) ===
    CHAR_FORWARD_SLASH;
  if (!trailingSlash) {
    trailingSlash = RegExpPrototypeTest(trailingSlashRegex, request);
  }

  // For each path
  for (let i = 0; i < paths.length; i++) {
    // Don't search further if path doesn't exist
    const curPath = paths[i];
    if (curPath && stat(curPath) < 1) continue;

    if (!absoluteRequest) {
      const exportsResolved = resolveExports(curPath, request);
      if (exportsResolved)
        return exportsResolved;
    }

    const basePath = path.resolve(curPath, request);
    let filename;

    const rc = stat(basePath);
    if (!trailingSlash) { // 路径结尾不是 / 即不是目录
      if (rc === 0) {  // File.  stat 状态返回 0，则为文件
        if (!isMain) {
          if (preserveSymlinks) {
            filename = path.resolve(basePath);
          } else {
            filename = toRealPath(basePath);
          }
        } else if (preserveSymlinksMain) {
          // For the main module, we use the preserveSymlinksMain flag instead
          // mainly for backward compatibility, as the preserveSymlinks flag
          // historically has not applied to the main module.  Most likely this
          // was intended to keep .bin/ binaries working, as following those
          // symlinks is usually required for the imports in the corresponding
          // files to resolve; that said, in some use cases following symlinks
          // causes bigger problems which is why the preserveSymlinksMain option
          // is needed.
          filename = path.resolve(basePath);
        } else {
          filename = toRealPath(basePath);
        }
      }

      if (!filename) { // 如果找不到
        // Try it with each of the extensions
        //获取后缀名：.js, .json, .node，尝试不同后缀名
        if (exts === undefined)
          exts = ObjectKeys(Module._extensions);
        filename = tryExtensions(basePath, exts, isMain);
      }
    }

    if (!filename && rc === 1) {  // Directory.
      // try it with each of the extensions at "index"
           /** 
       *  stat 状态返回 1 且文件名不存在，则认为是文件夹
       * 如果文件后缀不存在，则尝试加载该目录下的 package.json 中 main 入口指定的文件
       * 如果不存在，然后尝试 index[.js, .node, .json] 文件
     */
      if (exts === undefined)
        exts = ObjectKeys(Module._extensions);
      filename = tryPackage(basePath, exts, isMain, request);
    }

    if (filename) {
      // 找到文件绝对路径缓存起来
      Module._pathCache[cacheKey] = filename;
      return filename;
    }
  }

  return false;
};
```

### 加载模块

```js
Module.prototype.load = function(filename) {
  debug('load %j for module %j', filename, this.id);

  // 保证模块没有加载过
  assert(!this.loaded);
  this.filename = filename;
  this.paths = Module._nodeModulePaths(path.dirname(filename));

  const extension = findLongestRegisteredExtension(filename);
  // allow .mjs to be overridden
  if (StringPrototypeEndsWith(filename, '.mjs') && !Module._extensions['.mjs'])
    throw new ERR_REQUIRE_ESM(filename, true);

  // 执行特定文件后缀名解析函数 如 js / json / node
  Module._extensions[extension](this, filename);
  this.loaded = true;

  const ESMLoader = asyncESM.ESMLoader;
  // Create module entry at load time to snapshot exports correctly
  const exports = this.exports;
  // Preemptively cache
  if ((module?.module === undefined ||
       module.module.getStatus() < kEvaluated) &&
      !ESMLoader.cjsCache.has(this))
    ESMLoader.cjsCache.set(this, exports);
};
```

下面是针对不同的文件后缀，加载 .js, .json, .node

```js
Module._extensions['.js'] = function(module, filename) {
  // If already analyzed the source, then it will be cached.
  const cached = cjsParseCache.get(module);
  let content;
  if (cached?.source) {
    content = cached.source;
    cached.source = undefined;
  } else {
    // 读取文件内容
    content = fs.readFileSync(filename, 'utf8');
  }
  if (StringPrototypeEndsWith(filename, '.js')) {
    const pkg = readPackageScope(filename);
    // Function require shouldn't be used in ES modules.
    if (pkg?.data?.type === 'module') {
      const parent = moduleParentCache.get(module);
      const parentPath = parent?.filename;
      const packageJsonPath = path.resolve(pkg.path, 'package.json');
      const usesEsm = hasEsmSyntax(content);
      const err = new ERR_REQUIRE_ESM(filename, usesEsm, parentPath,
                                      packageJsonPath);
      // Attempt to reconstruct the parent require frame.
      if (Module._cache[parentPath]) {
        let parentSource;
        try {
          parentSource = fs.readFileSync(parentPath, 'utf8');
        } catch {}
        if (parentSource) {
          const errLine = StringPrototypeSplit(
            StringPrototypeSlice(err.stack, StringPrototypeIndexOf(
              err.stack, '    at ')), '\n', 1)[0];
          const { 1: line, 2: col } =
              RegExpPrototypeExec(/(\d+):(\d+)\)/, errLine) || [];
          if (line && col) {
            const srcLine = StringPrototypeSplit(parentSource, '\n')[line - 1];
            const frame = `${parentPath}:${line}\n${srcLine}\n${
              StringPrototypeRepeat(' ', col - 1)}^\n`;
            setArrowMessage(err, frame);
          }
        }
      }
      throw err;
    }
  }
  // 编译执行代码
  module._compile(content, filename);
};


// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
    // 直接按照 utf-8 格式加载文件
  const content = fs.readFileSync(filename, 'utf8');

  if (policy?.manifest) {
    const moduleURL = pathToFileURL(filename);
    policy.manifest.assertIntegrity(moduleURL, content);
  }

  try {
    // 以 JSON 对象格式导出文件内容
    module.exports = JSONParse(stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};


// Native extension for .node
Module._extensions['.node'] = function(module, filename) {
  if (policy?.manifest) {
    const content = fs.readFileSync(filename);
    const moduleURL = pathToFileURL(filename);
    policy.manifest.assertIntegrity(moduleURL, content);
  }
  // Be aware this doesn't use `content`
  // 通过 process.dlopen 函数读取，而 process.dlopen 函数实际上调用了 C++ 代码中的 DLOpen 函数，而 DLOpen 中又调用了 uv_dlopen, 后者加载 .node 文件，类似 OS 加载系统类库文件
  return process.dlopen(module, path.toNamespacedPath(filename));
};
```

Module.prototype._compile 编译 .js 文件

```js
// Run the file contents in the correct scope or sandbox. Expose
// the correct helper variables (require, module, exports) to
// the file.
// Returns exception, if any.
Module.prototype._compile = function(content, filename) {
  let moduleURL;
  let redirects;
  if (policy?.manifest) {
    moduleURL = pathToFileURL(filename);
    redirects = policy.manifest.getDependencyMapper(moduleURL);
    policy.manifest.assertIntegrity(moduleURL, content);
  }

  maybeCacheSourceMap(filename, content, this);
  const compiledWrapper = wrapSafe(filename, content, this);

  let inspectorWrapper = null;
  if (getOptionValue('--inspect-brk') && process._eval == null) {
    if (!resolvedArgv) {
      // We enter the repl if we're not given a filename argument.
      if (process.argv[1]) {
        try {
          resolvedArgv = Module._resolveFilename(process.argv[1], null, false);
        } catch {
          // We only expect this codepath to be reached in the case of a
          // preloaded module (it will fail earlier with the main entry)
          assert(ArrayIsArray(getOptionValue('--require')));
        }
      } else {
        resolvedArgv = 'repl';
      }
    }

    // Set breakpoint on module start
    if (resolvedArgv && !hasPausedEntry && filename === resolvedArgv) {
      hasPausedEntry = true;
      inspectorWrapper = internalBinding('inspector').callAndPauseOnStart;
    }
  }
  const dirname = path.dirname(filename);
  const require = makeRequireFunction(this, redirects);
  let result;
  const exports = this.exports;
  const thisValue = exports;
  const module = this;
  if (requireDepth === 0) statCache = new SafeMap();
  if (inspectorWrapper) {
    result = inspectorWrapper(compiledWrapper, thisValue, exports,
                              require, module, filename, dirname);
  } else {
    result = ReflectApply(compiledWrapper, thisValue,
                          [exports, require, module, filename, dirname]);
  }
  hasLoadedAnyUserCJSModule = true;
  if (requireDepth === 0) statCache = null;
  return result;
};


function wrapSafe(filename, content, cjsModuleInstance) {
  if (patched) {
    const wrapper = Module.wrap(content);
    return vm.runInThisContext(wrapper, {
      filename,
      lineOffset: 0,
      displayErrors: true,
      importModuleDynamically: async (specifier) => {
        const loader = asyncESM.ESMLoader;
        return loader.import(specifier, normalizeReferrerURL(filename));
      },
    });
  }
  try {
    return vm.compileFunction(content, [
      'exports',
      'require',
      'module',
      '__filename',
      '__dirname',
    ], {
      filename,
      importModuleDynamically(specifier) {
        const loader = asyncESM.ESMLoader;
        return loader.import(specifier, normalizeReferrerURL(filename));
      },
    });
  } catch (err) {
    if (process.mainModule === cjsModuleInstance)
      enrichCJSError(err, content);
    throw err;
  }
}
```

## ES module

es6 之后的模块化主要由 import 和 export 命令实现。export 用于从模块中导出实时绑定的函数、对象或原始值。import 则用于导入另一个模块导出的绑定。

```js
// 以下两种为错误
// 因为 export 要导出的不是变量或者具体值，导出的是接口

export 1;

const a = 1;
export a;



// 以下为正确
// export 后面跟声明和赋值语句，就是导出接口
// export 后面跟花括号，花括号不是对象的意思，而是接口列表，里面放逗号分开的变量名

const a = 1;
export { a };

export const a = 1, b = 2;

export const a = 1;
export const b = 2;

const a = 1;
export { a as outA };

const a = 1;
const b = 2;
export { a as outA, b as outB };


// export default 后面是一个值，和 export 不一样， export 后面是一个接口
// export default 后面的花括号就是对象的意思了，不是接口列表

const a = 1;
export default a;

const a = 1;
export default { a };

export default function() {};
export default class(){};

const a = 1;
export defalut a;
// 等价于
export { a as default }



// import 导入的时候，如果对应的是 export 导出的接口，则 import 的时候也要导入接口，放在花括号里
// 如果对应的是 export default 导出的值，则不用放在花括号里

// 某个模块的导出 moudule.js
export const a = 1;

import { a } from './module'

import { a as myA } from './module'

// 若是只想要运行被加载的模块可以这样写，但是即使加载 2 次也只是运行一次
import './module'

// 整体加载
import * as module from './module'

// default 接口和具名接口
import module, { a } from './module'
```

## CommonJS的加载过程

* CommonJS 模块加载 js 文件的过程是运行时加载的，并且是同步的：运行时加载意味着是 js 引擎在执行 js 代码的过程中加载模块；同步的就意味着一个文件没有加载结束之前，后面的代码都不会执行；

* CommonJS 通过 module.exports 导出的是一个对象：导出的是一个对象意味着可以将这个对象的引用在其他模块中赋值给其他变量；但是最终他们指向的都是同一个对象，那么一个变量修改了对象的属性，所有的地方都会被修改；

## ES Module加载过程

* ES Module 加载 js 文件的过程是编译（解析）时加载的，并且是异步的：编译时（解析）时加载，意味着 import 不能和运行时相关的内容放在一起使用：比如 from 后面的路径不能动态获取；比如不能将 import 放到 if 等语句的代码块中；所以我们有时候也称 ES Module 是静态解析的，而不是动态或者运行时解析的；

* 异步的意味着：js 引擎在遇到 import 时会去获取这个 js 文件，但是这个获取的过程是异步的，并不会阻塞主线程继续执行；也就是说设置了type=module 的代码，相当于在 script 标签上也加上了 defer 属性；如果我们后面有普通的 script 标签以及对应的代码，那么 ES Module 对应的 js 文件和代码不会阻塞它们的执行；

* ES Module 通过 export 导出的是变量本身的引用：export 在导出一个变量时，js 引擎会解析这个语法，并且创建模块环境记录（module environment
record）；模块环境记录会和变量进行绑定（binding），并且这个绑定是实时的；而在导入的地方，我们是可以实时的获取到绑定的最新值的；
* 所以，如果在导出的模块中修改了变化，那么导入的地方可以实时获取最新的变量；
* 注意：在导入的地方不可以修改变量，因为它只是被绑定到了这个变量上（其实是一个常量）
* 思考：如果 bar.js 中导出的是一个对象，那么 main.js 中是否可以修改对象中的属性呢？答案是可以的，因为他们指向同一块内存空间；

## ES6 模块和 commonjs 的区别

* CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。ES6 的模块在 JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。
* CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。因为 CommonJS 加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。
* CommonJS 模块的 require() 是同步加载模块，ES6 模块的 import 命令是异步加载，有一个独立的模块依赖的解析阶段。