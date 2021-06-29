/**
 * https://leetcode-cn.com/problems/merge-two-sorted-lists/
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
 var mergeTwoLists = function(l1, l2) {
    if (!l1 || !l2) return l1 ? l1 : l2;
    
    let res, c1, c2;

    if (l1.val < l2.val) {
        res = l1;
        c1 = l1.next;
        c2 = l2;
    } else {
        res = l2;
        c1 = l1;
        c2 = l2.next;
    }
    let c = res;

    while(c1 || c2) {
        if (!c1) {
            c.next = c2;
            c2 = null;
            continue;
        }
        if (!c2) {
            c.next = c1;
            c1 = null;
            continue;
        }
        if (c1.val < c2.val) {
            c.next = c1;
            c = c1;
            c1 = c1.next;
        } else {
            c.next = c2;
            c = c2;
            c2 = c2.next;
        }
    }

    return res;
};



var mergeTwoLists = function(l1, l2) {
    let preHead = new ListNode(0, null);
    let cur = preHead;

    while(l1 && l2) {
        if (l1.val < l2.val) {
            cur.next = l1;
            l1 = l1.next;
        } else {
            cur.next = l2;
            l2 = l2.next;
        }
        cur = cur.next;
    }

    cur.next = l1 ? l1 : l2;
    return preHead.next;
};