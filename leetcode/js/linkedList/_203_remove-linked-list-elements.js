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
 * 
 * https://leetcode-cn.com/problems/remove-linked-list-elements/
 * @param {ListNode} head
 * @param {number} val
 * @return {ListNode}
 */
 var removeElements = function(head, val) {
    if (!head) return head;

    let newHead = null;
    let prev = null;
    while(head) {
        if (head.val === val) {
            if (head.next) {
                Object.assign(head, head.next);
            } else {
                if (prev) prev.next = null;
                head = null;
            }
        } else {
            if (!newHead) newHead = head;
            prev = head;
            head = head.next;
        }
    }

    return newHead;
};

// 迭代
var removeElements1 = function(head, val) {
    const dummyHead = new ListNode(0);
    dummyHead.next = head;
    let temp = dummyHead;
    while (temp.next !== null) {
        if (temp.next.val == val) {
            temp.next = temp.next.next;
        } else {
            temp = temp.next;
        }
    }
    return dummyHead.next;
};

// 递归
var removeElements2 = function(head, val) {
    if (head === null) {
        return head;
    }
    head.next = removeElements2(head.next, val);
    return head.val === val ? head.next : head;
};


