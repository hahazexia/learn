/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */

function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

/**
 * https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list/
 * @param {ListNode} head
 * @return {ListNode}
 */
 var deleteDuplicates = function(head) {
    if (!head || !head.next) return head;

    let newHead = new ListNode(0)
    newHead.next = head;
    while(head.next) {
        if (head.val === head.next.val) {
            head.next = head.next.next;
        } else {
            head = head.next;
        }
    }
    return newHead.next;
};


var deleteDuplicates2 = function(head) {
    if (!head || !head.next) return head;

    let newHead = deleteDuplicates2(head.next);
    if (!newHead) {
        head.next = null;
        return head;
    }
    if (head.val === newHead.val) {
        return newHead;
    } else {
        head.next = newHead;
        return head;
    }
};


// 遍历
var deleteDuplicates3 = function(head) {
    if (!head) return head;

    let current = head;
    while(current.next) {
        if (current.val === current.next.val) {
            current.next = current.next.next;
        } else {
            current = current.next;
        }
    }
    return head;
};
