/**
 * https://leetcode-cn.com/problems/intersection-of-two-linked-lists/
 * 
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
var getIntersectionNode = function(headA, headB) {
    let a = headA;
    let b = headB;

    while(a && b) {
        if (a === b) return a;
        a = a.next;
        b = b.next;
        if (!a && !b) return null;
        if (!a) a = headB;
        if (!b) b = headA;
    }
    return null;
};



var getIntersectionNode = function(headA, headB) {
    let node = new Set();

    while(headA) {
        node.add(headA);
        headA = headA.next;
    }
    while(headB) {
        if (node.has(headB)) return headB;
        node.add(headB);
        headB = headB.next;
    }
    return null;
};