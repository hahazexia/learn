# diff

## 为什么需要虚拟 dom 和 diff 算法

其实 vue 1.0 的时候是没有虚拟 dom 和 diff 算法的，到 vue 2.0 的时候才有。vue 1.0 的时候追求细粒度的数据变化监听，每一个数据都有一个 watcher，可以精确地更新，所以不需要虚拟 dom 和 diff 算法。

但是当项目规模变大后，数据越来越多，每一个数据一个 watcher 非常耗费内存，造成大量开销。所以 vue 2.0 的时候设置成一个组件一个渲染 watcher。这时候一个组件中可能用到了多个数据，当数据变化怎么才能知道需要精确地更新哪个节点呢？（由于 vue 2.0 中 watcher 的粒度比较大，当数据更新时不知道具体更新哪一个地方，所以引入了虚拟 dom 和 diff 算法）。

当数据变化后，可以计算出新的虚拟 dom ，然后和老的虚拟 dom 通过 diff 算法比较，计算出最小的 dom 更新。配合异步更新策略减少刷新频率，提高性能。

## 从源码看 diff 流程

1. `src\core\instance\lifecycle.js` Vue.prototype._update 中有这样一句：

    ```js
    if (!prevVnode) {
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */) // 首次渲染
    } else {
      vm.$el = vm.__patch__(prevVnode, vnode) // 更新
    }
    ```

2. `src\core\vdom\patch.js` patch 方法，来看首次渲染初始化过程

    ```js
    function patch (oldVnode, vnode, hydrating, removeOnly) {
        // 首次渲染时 oldVnode 是 el 参数 dom 节点，vnode 是组件虚拟 dom

        if (isRealElement) { // 如果 oldVnode 是真实节点，说明是首次渲染
          // 标准化处理：将真实 dom 转换成一个 vnode
          oldVnode = emptyNodeAt(oldVnode)
        }

        
        const oldElm = oldVnode.elm // vnode 对应的真实 dom
        const parentElm = nodeOps.parentNode(oldElm) // 真实 dom 的父元素 初始化时就是 body 元素

        createElm(
          vnode,
          insertedVnodeQueue,
          oldElm._leaveCb ? null : parentElm, // 父节点
          nodeOps.nextSibling(oldElm) // 宿主元素的邻居节点
        )
        // createElm 创建新的 dom 节点，会递归循环创建所有子节点

        
        if (isDef(parentElm)) { // 将旧的节点删除
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
    }
    ```

    总结来说就是首次渲染的时候判断第一个参数 oldVnode 如果是 dom 节点，就直接将第二个参数组件 vnode 转换成 真实 dom ，然后追加到父节点 body 中，然后将 oldVnode 删除。

3. `src\core\vdom\patch.js` patch 方法，来看更新流程（diff 算法）

    ```js
    function patch (oldVnode, vnode, hydrating, removeOnly) {

        if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // 如果 oldVnode 不是真实 dom 元素 并且 oldVnode 和 vnode 是相同节点，执行 patchVnode
        // diff 算法
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      }
    }
    ```

    sameVnode 判断两个 vnode 是否是相同节点，有很多个条件，但大体满足两个条件一般就是相同节点：1. key 相同 2. tag 相同。还有其他条件例如：如果是 input 元素那么类型必须一样


    * diff 算法：同层比较 深度优先。同层比较可以降低时间复杂度
        * 比较两个VNode，包括三种类型操作：属性更新、文本更新、子节点更新
        * 具体规则如下：
            1. 新老节点均有 children 子节点，则对子节点进行 diff 操作，调用 updateChildren
            2. 如果新节点有子节点而老节点没有子节点，先清空老节点的文本内容，然后为其新增子节点。
            3. 当新节点没有子节点而老节点有子节点的时候，则移除该节点的所有子节点。
            4. 当新老节点都无子节点的时候，只是文本的替换。



    ```js
        function patchVnode (
            oldVnode,
            vnode,
            insertedVnodeQueue,
            ownerArray,
            index,
            removeOnly
        ) {

            // 获取双方子节点
            const oldCh = oldVnode.children
            const ch = vnode.children

            // 属性更新
            if (isDef(data) && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
                if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
            }

            // 判断双方子元素的情况，走不同分支
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) { // 双方都有子元素，重排
                    if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
                } else if (isDef(ch)) { // 新的有子元素，老的没有子元素，批量创建
                    if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
                } else if (isDef(oldCh)) {// 新的没有子元素，老的有子元素，批量删除
                    removeVnodes(oldCh, 0, oldCh.length - 1)
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '')
                }
                } else if (oldVnode.text !== vnode.text) { // 新老都是文本，文本不一样，那么就文本更新
                nodeOps.setTextContent(elm, vnode.text)
            }
        }
    ```

4. updateChildren

    因为通常代码中给节点做改变的时候是头部加一个，或者尾部加一个，或者中间加一个，很少去做乱序的操作，所以对新旧两组节点，将它们各自的首尾设置为 4 个游标，方便比较。

    ```js
        function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            // 四个游标以及对应四个节点
            let oldStartIdx = 0
            let newStartIdx = 0
            let oldEndIdx = oldCh.length - 1
            let oldStartVnode = oldCh[0]
            let oldEndVnode = oldCh[oldEndIdx]
            let newEndIdx = newCh.length - 1
            let newStartVnode = newCh[0]
            let newEndVnode = newCh[newEndIdx]
            // 用于最后查找的变量
            let oldKeyToIdx, idxInOld, vnodeToMove, refElm

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            const canMove = !removeOnly

            if (process.env.NODE_ENV !== 'production') {
            checkDuplicateKeys(newCh)
            }

            // 开始循环，首尾游标不能重合
            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            // 移动操作可能造成游标和节点不对应，需要额外调整
            if (isUndef(oldStartVnode)) {
                oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
            } else if (isUndef(oldEndVnode)) {
                oldEndVnode = oldCh[--oldEndIdx]
            } 
            // 后面的四个就是四种假设
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                // 两个开头相同，递归 patchVnode ，然后索引向后移动一位
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                oldStartVnode = oldCh[++oldStartIdx]
                newStartVnode = newCh[++newStartIdx]
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                // 两个结尾相同，递归 patchVnode ，然后索引向前移动一位
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
                oldEndVnode = oldCh[--oldEndIdx]
                newEndVnode = newCh[--newEndIdx]
            } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                // 老的开始和新的结束一样，递归 patchVnode，然后将老的开始移动到结尾
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
                canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
                oldStartVnode = oldCh[++oldStartIdx]
                newEndVnode = newCh[--newEndIdx]
            } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                // 老的结束和新的开始一样，递归 patchVnode，然后将老的结束移动到开头
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
                oldEndVnode = oldCh[--oldEndIdx]
                newStartVnode = newCh[++newStartIdx]
            } else {
                // 首尾没有相同，老老实实遍历查找
                if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                // 老数组索引
                idxInOld = isDef(newStartVnode.key)
                ? oldKeyToIdx[newStartVnode.key]
                : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
                if (isUndef(idxInOld)) { // New element
                // 不存在就创建
                createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
                } else {
                vnodeToMove = oldCh[idxInOld]
                // 相同节点更新
                if (sameVnode(vnodeToMove, newStartVnode)) {
                    patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
                    oldCh[idxInOld] = undefined
                    canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
                } else {
                    // 不同节点替换
                    // same key but different element. treat as new element
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
                }
                }
                newStartVnode = newCh[++newStartIdx]
            }
            }
            // 循环结束之后清理工作
            if (oldStartIdx > oldEndIdx) {
            // 老数组先结束
            // 新数组还有剩余，批量创建
            refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
            addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
            } else if (newStartIdx > newEndIdx) {
            // 新数组先结束
            // 老数组还有剩余，批量删除
            removeVnodes(oldCh, oldStartIdx, oldEndIdx)
            }
        }
    ```

    * 子节点更新的时候，先判断 4 种情况：
        * 两个开头相同，递归 patchVnode ，然后索引向后移动一位
        * 两个结尾相同，递归 patchVnode ，然后索引向前移动一位
        * 老的开始和新的结束一样，递归 patchVnode，然后将老的开始移动到结尾
        * 老的结束和新的开始一样，递归 patchVnode，然后将老的结束移动到开头
    * 如果上面 4 种情况都不符合，就使用 新节点的 key 去旧节点中找到对应的 key 相同的节点。如果没找到旧就创建新的，如果找到了，相同节点更新，不同节点就替换（key 相同但是节点不同，就和新建一样）
    * 最后循环结束，如果 新数组还有剩余，批量创建，老数组还有剩余，批量删除


## key 的作用

