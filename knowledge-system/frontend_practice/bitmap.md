# bitmap 解决海量数据问题

* 海量数据如何去重，比如有上亿元素的情况。
  * 常规办法，先排序，然后去重。排序就需要遍历整个数据，后续的去重有需要遍历，时间复杂度太高，不可取
  * 常规办法，用 hashmap 结构去重，js 中是 Object 对象，但是将上亿数据存放在内存里，空间复杂度太高，不可取

* 这时候就需要利用二进制数值的特性来解决这类问题了。整数在 js 中二进制位有 32 位，从二进制位第一个位置开始，如果一位存一个数字（即此二进制位为 1，说明此处有值，为 0 说明此处没有值），则一个整数可以存 32 个数。因此一亿个数字只需要 1 * 10^8 / 32 个数字记录即可，1 个 32 位二进制数字占 4 字节，这样计算下来占用空间只有 11 MB，如果数据的范围在二亿，也只是将空间乘以 2，最多也只占用 22 MB，并且遍历的过程中间就自动去重了，因为一个二进制位只代表存在一个数。

```js
const BitMap = function () {
  this.data = [];
};

// 计算出新添加数据在数组的第几个元素中
BitMap.prototype.getIdx = num => parseInt(num / 32);
// 计算出新添加数据在一个元素中第几个二进制位上
BitMap.prototype.getPos = num => num % 32;

BitMap.prototype.add = function (num) {
  const index = this.getIdx(num);
  const pos = this.getPos(num);

  // 如果数组 index 位置的元素还没有值，初始化为 0
  if (this.data[index] === undefined) this.data[index] = 0;
  // Math.pow(2, pos) 计算出二进制表示，也就是说当前 num 所在的二进制位的位置 pos 会变成 1，然后和数组 index 位置的元素进行 按位或 运算，即对应二进制位有一个为 1，则结果为 1，否则为 0.这样就在数组第 index 个元素上的 pos 二进制位上标记了此数值存在
  this.data[index] |= Math.pow(2, pos);
};

BitMap.prototype.exist = function (num) {
  const index = this.getIdx(num);
  const pos = this.getPos(num);
  // 如果数组 index 位置元素存在，并且和指定数字的二进制标记进行 按位与 运算，即对应二进制位都为 1，结果才为 1，否则为 0。如果没有找到，则结果是 0，为假
  return !!(this.data[index] && (this.data[index] & Math.pow(2, pos)));
};

const n = new BitMap();
n.add(2);
```