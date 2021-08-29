# 排序算法

## 冒泡排序

1. 比较相邻的元素。如果第一个比第二个大，就交换它们两个；
2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对，这样在最后的元素应该会是最大的数；
3. 针对所有的元素重复以上的步骤，除了最后一个；
4. 重复步骤 1~3，直到排序完成。

```js
function bubbleSort(arr) {
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]];
            }
        }
    }
    return arr;
}
var arr = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(bubbleSort(arr));
// [2, 3, 4, 5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50]
```

设置一标志性变量 pos，用于记录每趟排序中最后一次进行交换的位置。由于 pos 位置之后的记录均已交换到位，故在进行下一趟排序时只要扫描到 pos 位置即可。

```js
function bubbleSort2(arr) {
    var i = arr.length - 1;
    while ( i > 0) {
        var pos = 0;
        for (var j = 0; j < i; j++) {
            if (arr[j] > arr[j + 1]) {
                pos = j;
                [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]];
            }
        }
        i = pos;
     }
     return arr;
}
var arr = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(bubbleSort2(arr));
// [2, 3, 4, 5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50]

```

传统冒泡排序中每一趟排序操作只能找到一个最大值或最小值，我们考虑利用在每趟排序中进行正向和反向两遍冒泡的方法一次可以得到两个最终值(最大者和最小者)，从而使排序趟数几乎减少了一半。

```js
function bubbleSort3(arr3) {
    var low = 0;
    var high = arr.length - 1;
    var tmp, j;

    while (low < high) {
        for (j = low; j < high; ++j) {
            if (arr[j]> arr[j + 1]) {
                [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]];
            }
        }
        --high;
        for (j = high; j > low; --j) {
            if (arr[j] < arr[j - 1]) {
                [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
            }
        }
        ++low;
    }

    return arr3;
}
var arr = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48];
console.log(bubbleSort3(arr));
// [2, 3, 4, 5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50]

```


* 最佳情况：T(n) = O(n)
* 最差情况：T(n) = O(n2)
* 平均情况：T(n) = O(n2)

## 快速排序

1. 先找到一个基准点（一般指数组的中部），然后数组被该基准点分为两部分，依次与该基准点数据比较，如果比它小，放左边；反之，放右边
2. 左右分别用一个空数组去存储比较后的数据
3. 最后递归执行上述操作，直到数组长度 <= 1


```js
function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    const middleIndex = Math.floor(arr.length / 2);
    const temp = arr.splice(middleIndex, 1);
    const middle = temp[0];
    const left = [];
    const right = [];

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < middle) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return quickSort(left).concat(middle, quickSort(right));
};

const array2 = [5, 4, 3, 2, 1];
console.log(quickSort(array2));
```

* 最佳情况：T(n) = O(n log n)
* 最差情况：T(n) = O(n2)
* 平均情况：T(n) = O(n log n)

## 归并排序

先把数组从中间分成前后两部分，然后对前后两部分分别排序，再将排好序的两部分合并在一起，这样整个数组就都有序了。

```js
function mergeSort (arr) {
    const len = arr.length;

    if (len < 2) {
        return arr;
    }

    const middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);

    return merge(mergeSort(left), mergeSort(right));
}

function merge (left, right) {
    const result = [];

    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length) {
        result.push(left.shift());
    }

    while (right.length) {
        result.push(right.shift());
    }

    return result;
}

const array2 = [5, 4, 3, 2, 1];
console.log(mergeSort(array2));
```

* 最佳情况：T(n) = O(n log n)
* 最差情况：T(n) = O(n log n)
* 平均情况：T(n) = O(n log n)