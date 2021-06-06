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
 * https://leetcode-cn.com/problems/reverse-linked-list/
 * @param {ListNode} head
 * @return {ListNode}
 */
 var reverseList = function(head) {
    if (!head || !head.next) return head;
    let newHead = null;
    
    while(head) {
        let temp = head.next;
        head.next = newHead;
        newHead = head;
        head = temp;
    }

    return newHead;
};


var reverseList1 = function(head) {
    if (!head || !head.next) return head;

    let temp = reverseList1(head.next);
    head.next.next = head;
    head.next = null;
    
    return temp;
};

