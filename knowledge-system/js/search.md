# 查找算法

## 顺序查找

```js
sequentialSearch(arr, item) {
    for (let i = 0; i < arr.length; i++) {
      if (item === arr[i]) {
        return i;
      }
    }
    return -1;
}
```

## 二分查找

1. 先将数据排序
2. 获取中间值，如果中间值就是要找的直接返回。如果目标比中间值小就在中间值左边查找，否则右边
3. 递归第二步

```js
binarySearch(arr, item) {
    quickSort(arr);

    let min = 0,
        max = arr.length - 1,
        mid,
        el;

    while(min <= max) {
        mid = Math.floor((min + max) / 2)
        el = arr[mid]
        if (el < item) {
            min = mid + 1
        } else if (el > item) {
            max = mid -1
        } else {
            return mid
        }
    }
    return -1
}
```