/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

function ListNode(val) {
    this.val = val;
    this.next = null;
}

/**
 * https://leetcode-cn.com/problems/linked-list-cycle/
 * @param {ListNode} head
 * @return {boolean}
 */
// 仿照 java 解法
 var hasCycle = function(head) {
    if (head === null || head.next === null) return false;
    var slow = head;
    var fast = head.next;

    while(fast && fast.next) {
        slow = slow.next;
        fast = fast.next ? fast.next.next : null;
        if (slow === fast) return true;
    }

    return false;
};

// JSON.stringify() 法
// 有环一定会报错
// MDN解释：对包含循环引用的对象（对象之间相互引用，形成无限循环）执行JSON.stringify()，会抛出错误。
var hasCycle1 = function (head) {
    try {
        JSON.stringify(head)
    } catch{
        return true
    }
    return false
};

// 给遍历过的节点打记号，如果遍历过程中遇到有记号的说明已环
// 但是这个解法改变链表节点了，给节点添加了新的属性了
const hasCycle2 = function(head) {
    while (head) {
        if (head.tag) {
        return true;
        }
        head.tag = true;
        head = head.next;
    }
    return false;
};

// 题目说了范围不超过100000，没超过size能发现空节点就是没有环， 超过了就是有环
const hasCycle = function(head) {
    let i = 0, size = 100000
    let node = head
    while (++i <= size) {
      if(!node) return false
      node = node.next
    }
    return true;
};