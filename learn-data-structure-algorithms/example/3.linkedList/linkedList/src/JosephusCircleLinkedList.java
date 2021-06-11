import java.util.Currency;

public class JosephusCircleLinkedList<E> extends AbstractList<E> {
    private Node<E> first;
    private Node<E> last;
    private Node<E> current;

    private static class Node<E> {
        E element;
        Node<E> next;
        Node<E> prev;

        public Node(Node<E> prev, E element, Node<E> next) {
            this.prev = prev;
            this.element = element;
            this.next = next;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();

            if (prev != null) {
                sb.append(prev.element);
            } else {
                sb.append("null");
            }

            sb.append("_").append(element).append("_");

            if (next != null) {
                sb.append(next.element);
            } else {
                sb.append("null");
            }

            return sb.toString();
        }
    }

    static void josephus() {
        JosephusCircleLinkedList<Integer> list = new JosephusCircleLinkedList<>();

        for (int i = 1; i <= 8; i++) {
            list.add(i);
        }

        list.reset();

        while(!list.isEmpty()) {
            list.next();
            list.next();
            System.out.println(list.remove());
        }
    }

    public void reset() {
        current = first;
    }

    public E next() {
        if (current == null) return null;
        Node<E> n = current;
        current = current.next;
        return n.element;
    }

    public E remove() {
        if (current == null) return null;
        Node<E> next = current.next;
        E e = remove(current);
        if (size == 0) {
            current = null;
        } else {
            current = next;
        }
        return e;
    }

    @Override
    public void clear() {
        first = null;
        last = null;
        size = 0;
    }

    @Override
    public E get(int index) {
        rangeCheck(index);
        return node(index).element;
    }

    @Override
    public E set(int index, E element) {
        Node<E> node = node(index);
        E old = node.element;
        node.element = element;
        return old;
    }

    @Override
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        if (index == size) {
            // Node<E> oldLast = last;
            // last = new Node<E>(oldLast, element, null);
            // if (oldLast == null) {
            //     first = last;
            // } else {
            //     oldLast.next = last;
            // }
            Node<E> oldLast = last;
            last = new Node<E>(oldLast, element, first);
            if (oldLast == null) {
                first = last;
                first.prev = first;
                first.next = first;
            } else {
                oldLast.next = last;
                first.prev = last;
            }
        } else {
            // Node<E> next = node(index);
            // Node<E> prev = next.prev;
            // Node<E> t = new Node<>(prev, element, next);
            // next.prev = t;

            // if (prev == null) {
            //     first = t;
            // } else {
            //     prev.next = t;
            // }

            Node<E> next = node(index);
            Node<E> prev = next.prev;
            Node<E> t = new Node<>(prev, element, next);
            next.prev = t;
            prev.next = t;
            if (next == first) { // index == 0
                first = t;
            }
        }
        size++;
    }

    @Override
    public E remove(int index) {
        rangeCheck(index);
        Node<E> node = first;
        if (size == 1) {
            first = last = null;
        } else {
            node = node(index);
            Node<E> prev = node.prev;
            Node<E> next = node.next;
            prev.next = next;
            next.prev = prev;

            if (node == first) {
                first = next;
            }
            
            if (node == last) {
                last = prev;
            }
        }

        size--;
        return node.element;
    }

    private E remove(Node<E> node) {
        if (size == 1) {
            first = last = null;
        } else {
            Node<E> prev = node.prev;
            Node<E> next = node.next;
            prev.next = next;
            next.prev = prev;

            if (node == first) {
                first = next;
            }
            
            if (node == last) {
                last = prev;
            }
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
        Node<E> target;

        if (index < (size >> 1)) {
            target = first;
            for (int i = 0; i < index; i++) {
                target = target.next;
            }
        } else {
            target = last;
            for (int i = size- 1; i > index; i--) {
                target = target.prev;
            }
        }
        return target; 
    }

    @Override
    public String toString() {
        StringBuilder string = new StringBuilder();
        string.append("size=").append(size).append(", [");
        Node<E> node = first;
        for (int i = 0; i < size; i++) {
            if (i != 0) {
                string.append(", ");
            }

            string.append(node);

            node = node.next;
        }
        string.append("]");
        return string.toString();
    }
}