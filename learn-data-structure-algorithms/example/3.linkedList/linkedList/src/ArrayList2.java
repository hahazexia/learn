/**
 * 动态数组缩容操作
 */
public class ArrayList2<E> extends AbstractList<E> {

    // 所有元素
    private E[] elements;

    private static final int DEFAULT_CAPACITY = 2;

    public ArrayList2(int capacity) {
        capacity = (capacity < DEFAULT_CAPACITY) ? DEFAULT_CAPACITY : capacity;
        elements = (E[]) new Object[capacity];
    }

    public ArrayList2() {
        this(DEFAULT_CAPACITY);
    }
    


    /**
     * 保证有 capacity 的容量
     * @param capacity
     */
    private void entureCapacity(int capacity) {
        int oldCapacity = elements.length;
        if (oldCapacity >= capacity) return;

        // 新容量是旧容量的 1.5 倍
        int newCapacity = oldCapacity + (oldCapacity >> 1);

        E[] newElements = (E[]) new Object[newCapacity];
        for (int i = 0; i < size; i++) {
            newElements[i] = elements[i];
        }
        elements = newElements;
        System.out.println("扩容前：" + oldCapacity + ", 扩容后：" + newCapacity);
    }

    /**
     * 删除所有元素
     */
    public void clear() {
        for (int i = 0; i < elements.length; i++) {
            elements[i] = null;
        }
        size = 0;
        
        if (elements != null && elements.length > DEFAULT_CAPACITY) {
            elements = (E[]) new Object[DEFAULT_CAPACITY];
        }
    }

    /**
     * 获取index位置的元素
     * @param index
     * @return index位置的元素
     */
    public E get(int index) { // O(1)
        rangeCheck(index);
        return elements[index];
    }

    /**
     * 设置index位置的元素
     * @param index
     * @param element
     * @return index 位置原来的元素
     */
    public E set(int index, E element) { // O(1)
        rangeCheck(index);
        E old = elements[index];
        elements[index] = element;
        return old;
    }

    /**
     * 在index位置插入元素
     * @param index
     * @param element
     */
    public void add(int index, E element) {
        // size 是数据规模
        /** 不考虑扩容的情况下
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        /**
         * 考虑扩容
         * 最好 O(1)
         * 最坏 O(n)
         * 平均 O(1)
         * 均摊 O(1)
         */
        rangeCheckForAdd(index);
        entureCapacity(size + 1);
        for(int i = size; i > index; i--) {
            elements[i] = elements[i - 1];
        }
        elements[index] = element;
        size++;
    }

    /**
     * 删除index位置元素
     * @param index
     * @return 被删除元素的值
     */
    public E remove(int index) {
        /**
         * 最好：O(1)
         * 最坏：O(n)
         * 平均：(1 + 2 + 3+ ...+ n)/ n => (1+n)/2 => O(n)
         */
        rangeCheck(index);
        E del = elements[index];

        for (int i = index + 1; i < size; i++) {
            elements[i - 1] = elements[i];
        }
        elements[--size] = null;

        trim();
        return del;
    }

    public void remove(E element) {
        remove(indexOf(element));
    }

    // 删除一个元素后判断是否需要缩容
    private void trim() {
        int capacity = elements.length;
        int newCapacity = capacity >> 1;

        if (size > newCapacity || capacity <= DEFAULT_CAPACITY) return;

        E[] newElements = (E[]) new Object[newCapacity];
        for (int i = 0; i < size; i++) {
            newElements[i] = elements[i];
        }
        System.out.println(newCapacity);
        elements = newElements;
    }

    /**
     * 查看元素的索引
     * @param element
     * @return 元素的索引，找不到返回 -1
     */
    public int indexOf(E element) {
        if (element == null) {
            for (int i = 0; i < size; i++) {
                if (elements[i] == null) return i;
            }
        } else {
            for (int i = 0; i < size; i++) {
                if (element.equals(elements[i])) return i;
            }
        }
        return ELEMENT_NOT_FOUND;
    }

    @Override
    public String toString() {
        StringBuilder string = new StringBuilder();

        string.append("size = ").append(size).append(", [");
        for (int i = 0; i < size; i++) {
            if (i != 0) {
                string.append(", ");
            }
            string.append(elements[i]);
        }
        string.append("]");

        return string.toString();
    }
}
