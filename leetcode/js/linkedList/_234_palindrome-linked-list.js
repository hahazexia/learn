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