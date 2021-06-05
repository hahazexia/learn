import java.util.List;

import javax.management.ListenerNotFoundException;

/**
 * https://leetcode-cn.com/problems/reverse-linked-list/
 */
public class _206_reverse_linked_list {
    public class ListNode {
        int val;
        ListNode next;
        ListNode() {}
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }

    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = null;
        while (head != null) {
            ListNode temp = head.next;
            head.next = newHead;
            newHead = head;
            head = temp;
        }
        return newHead;
    }

    public ListNode reverseList2(ListNode head) {
        if (head == null || head.next == null)  return head;

        ListNode newHead = reverseList2(head.next);
        head.next.next = head;
        head.next = null;

        return newHead;
    }
}



