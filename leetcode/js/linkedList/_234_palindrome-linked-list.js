/**
 * https://leetcode-cn.com/problems/palindrome-linked-list/
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function(head) {
    let a = '';
    let b = '';

    while (head) {
        a = `${a}${head.val}`;
        b = `${head.val}${b}`;
        head = head.next;
    }

    return a === b
};


var isPalindrome = function(head) {
    let arr = [];

    while(head) {
        arr.push(head.val);
        head = head.next;
    }

    for (let i = 0, j = arr.length - 1; i < j; i++, j--) {
        if (arr[i] !== arr[j]) return false
    }

    return true;
};

var reverseLinkList = function(head) {
    let prev = null;
    let cur = head;

    while(cur) {
        let temp = cur.next;
        cur.next = prev;
        prev = cur;
        cur = temp;
    }

    return prev;
}

var findHalf = function(head) {
    let fast = head;
    let slow = head;

    while(fast.next !== null && fast.next.next !== null) {
        fast = fast.next.next;
        slow = slow.next;
    }

    return slow;
}

var isPalindrome = function(head) {

    let half = findHalf(head);
    let second = reverseLinkList(half);

    let a = head;
    let b = second;
    while(a) {
        if (a.val !== b.val) return false;
        a = a.next;
        b = b.next;
    }

    half.next = reverseLinkList(second);
    return true;
};