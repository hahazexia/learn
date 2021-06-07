
/**
 * 增加一个虚拟头节点
 */
public class LinkedList2<E> extends AbstractList<E> {
    private Node<E> first;

    public LinkedList2() {
        first = new Node<>(null, null);
    }

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
        System.out.println(index);
        rangeCheckForAdd(index);

        Node<E> prev = index == 0 ? first : node(index - 1);
        prev.next = new Node<E>(element, prev.next);
        size++;
    }

    @Override
    public E remove(int index) {
        rangeCheck(index);

        Node<E> prev = index == 0 ? first : node(index - 1);
        Node<E> node = prev.next;
        prev.next = node.next; 
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
        Node<E> target = first.next;
        while (t < index) {
            t++;
            target = target.next;
        }
        return target; 
    }

    @Override
    public String toString() {
        StringBuilder string = new StringBuilder();

        Node<E> node = first.next;
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