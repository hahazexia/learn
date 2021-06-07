
public class SingleLinkedList<E> extends AbstractList<E> {
    private Node<E> first;


    private static class Node<E> {
        E element;
        Node<E> next; 

        public Node(E element, Node<E> next) {
            this.element = element;
            this.next = next;
        }
    }

    @Override
    public void clear() {
        first = null;
        size = 0;
    }

    @Override
    public E get(int index) {
        /**
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        rangeCheck(index);
        return node(index).element;
    }

    @Override
    public E set(int index, E element) {
        /**
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        Node<E> node = node(index);
        E old = node.element;
        node.element = element;
        return old;
    }

    @Override
    public void add(int index, E element) {
        /**
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        rangeCheckForAdd(index);
        if (index == 0) {
            first = new Node<E>(element, first);
        } else {
            Node<E> prev = node(index - 1);
            prev.next = new Node<E>(element, prev.next);
        }
        size++;
        System.out.println(size);
    }

    @Override
    public E remove(int index) {
        /**
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        rangeCheck(index);
        Node<E> node = first;
        if (index == 0) {
            first = first.next;
        } else {
            Node<E> prev = node(index - 1);
            node = prev.next;
            prev.next = node.next; 
        }
        size--;
        return node.element;
    }

    @Override
    public int indexOf(E element) {
        Node<E> node = first;
        if (element == null) {
            for (int i = 0; i < size; i++) {
                if (node.element == null) return i;
                node = node.next;
            }
        } else {
            for (int i = 0; i < size; i++) {
                if (element.equals(node.element)) return i;
                node = node.next;
            }
        }
        return ELEMENT_NOT_FOUND;
    }

    /**
     * 获取 index 对应节点对象
     * @param index
     * @return Node 节点
     */
    private Node<E> node(int index) {
        rangeCheck(index);

        int t = 0;
        Node<E> target = first;
        while (t < index) {
            t++;
            target = target.next;
        }
        return target; 
    }

    @Override
    public String toString() {
        StringBuilder string = new StringBuilder();

        Node<E> node = first;
        string.append("size = ").append(size).append(", [");
        for (int i = 0; i < size; i++) {
            if (i != 0) {
                string.append(", ");
            }
            string.append(node.element);
            node = node.next;
        }
        string.append("]");

        return string.toString();
    }
}