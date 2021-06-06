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
 * https://leetcode-cn.com/problems/middle-of-the-linked-list/
 * @param {ListNode} head
 * @return {ListNode}
 */
 var middleNode = function(head) {
    if (!head.next) return head;
    const temp = [];
    while(head) {
        temp.push(head);
        head = head.next;
    }
    return temp[Math.floor(temp.length / 2)]
};

var middleNode1 = function(head) {
    let i = 0;
    let j = 0;
    let h = head;
    while(head) {
        i++;
        head = head.next;
    }
    i = Math.trunc(i / 2)
    while(j < i) {
        h = h.next;
        j++;
    }
    return h;
}

var middleNode2 = function(head) {
    slow = fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
};
