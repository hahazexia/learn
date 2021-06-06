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
 * https://leetcode-cn.com/problems/delete-node-in-a-linked-list/
 * @param {ListNode} node
 * @return {void} Do not return anything, modify node in-place instead.
 */
 var deleteNode = function(node) {
    node.val = node.next.val;
    node.next = node.next.next;
};

var deleteNode1 = function(node) {
    node.val = node.next.val, node.next = node.next.next
};

var deleteNode2 = function (node) {
    Object.assign(node, node.next)
};