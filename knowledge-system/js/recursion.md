# 递归

程序自己调用自己就是递归。递归是为了将一个问题分解成更简单的子问题然后解决。

## 求阶乘

一个正整数的阶乘（factorial）是所有小于及等于该数的正整数的积，并且 0 的阶乘为 1。

`n! = n * (n - 1) * (n - 1 - 1) * ...... * 1`

```js
function factorial (n) {
    if (n === 0) return 1;

    return n * factorial(n - 1)
}
```

## 斐波那契数列

斐波那契数列是这样的定义：F(0) = 0，F(1) = 1, F(n) = F(n - 1) + F(n - 2)

例如：0、1、1、2、3、5、8

```js
function fibonacci (n) {
    if (n === 1) return 0;
    if (n === 2) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2)
}
```

利用缓存优化一下

```js
const cache = {};

function fibonacci (n) {
    if (n === 1) return 0;
    if (n === 2) return 1;
    if (cache[n]) return cache[n];
    return cache[n] = fibonacci(n - 1) + fibonacci(n - 2)
}
```

## 汉诺塔

在经典汉诺塔问题中，有 3 根柱子及 N 个不同大小的穿孔圆盘，盘子可以滑入任意一根柱子。一开始，所有盘子自上而下按升序依次套在第一根柱子上(即每一个盘子只能放在更大的盘子上面)。移动圆盘时受到以下限制:
1. 每次只能移动一个盘子;
2. 盘子只能从柱子顶端滑出移到下一根柱子;
3. 盘子只能叠在比它大的盘子上。

请编写程序，用栈将所有盘子从第一根柱子移到最后一根柱子。

你需要原地修改栈。

示例1:

```js
输入：A = [2, 1, 0], B = [], C = []
输出：C = [2, 1, 0]
```

示例2:

```js
输入：A = [1, 0], B = [], C = []
输出：C = [1, 0]
```

思路：
* n = 1 时，直接把盘子从 A 移到 C；
* n > 1 时，
    + 先把上面 n - 1 个盘子从 A 移到 B（子问题，递归）；
    + 再将最大的盘子从 A 移到 C；
    + 再将 B 上 n - 1 个盘子从 B 移到 C（子问题，递归）。



```js
/**
 * @param {number[]} A
 * @param {number[]} B
 * @param {number[]} C
 * @return {void} Do not return anything, modify C in-place instead.
 */
function hanota (A, B, C) {
    let n = A.length
    function move (m, a, b, c) {
        if (m === 1) {
            c.push(a.pop())
        } else {
            move(m - 1, a, c, b)
            c.push(a.pop())
            move(m - 1, b, a, c)
        }
    }
    move(n, A, B, C)
}
```

## 给５升和６升的水杯如何倒出３升的水

1. 6 给 5 倒满，6 里只剩 1 升
2. 5 倒空，6 的 1 升水倒入 5，然后 6 接满，倒满 5，这时候 6 里有 2 升水
3. 5 倒空，6 的 2 升水倒入 5，然后 6 接满，倒满 5，这时候 6 里有 3 升水