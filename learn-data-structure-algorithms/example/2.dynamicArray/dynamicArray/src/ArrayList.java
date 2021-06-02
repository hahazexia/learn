public class ArrayList {

    // 元素数量
    private int size;
    // 所有元素
    private int[] elements;

    private static final int DEFAULT_CAPACITY = 2;
    private static final int ELEMENT_NOT_FOUND = -1;

    public ArrayList(int capacity) {
        capacity = (capacity < DEFAULT_CAPACITY) ? DEFAULT_CAPACITY : capacity;
        elements = new int[capacity];
    }

    public ArrayList() {
        this(DEFAULT_CAPACITY);
    }
    
    private void outOfBound(int index) {
        throw new IndexOutOfBoundsException("index" + index + ", size: " + size);
    }

    private void rangeCheck(int index) {
        if (index < 0 || index >= size) {
            outOfBound(index);
        }
    }

    private void rangeCheckForAdd(int index) {
        if (index < 0 || index > size) {
            outOfBound(index);
        }
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

        int[] newElements = new int[newCapacity];
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
        size = 0;
    }

    /**
     * 获取元素数量
     * @return 长度
     */
    public int size() {
        return size;
    }

    /**
     * 是否为空
     * @return 长度为空返回 true，否则 false
     */
    public boolean isEmpty() {
        return size == 0;
    }

    /**
     * 是否包含某个元素
     * @param element
     * @return 找到返回 true，否则 false
     */
    public boolean contains(int element) {
        return indexOf(element) != ELEMENT_NOT_FOUND;
    }

    /**
     * 添加元素到尾部
     * @param element
     */
    public void add(int element) {
        add(size, element);
    }

    /**
     * 获取index位置的元素
     * @param index
     * @return index位置的元素
     */
    public int get(int index) {
        rangeCheck(index);
        return elements[index];
    }

    /**
     * 设置index位置的元素
     * @param index
     * @param element
     * @return index 位置原来的元素
     */
    public int set(int index, int element) {
        rangeCheck(index);
        int old = elements[index];
        elements[index] = element;
        return old;
    }

    /**
     * 在index位置插入元素
     * @param index
     * @param element
     */
    public void add(int index, int element) {
        rangeCheckForAdd(index);
        entureCapacity(size + 1);
        for(int i = size - 1; i >= index; i--) {
            elements[i + 1] = elements[i];
        }
        elements[index] = element;
        size++;
    }

    /**
     * 删除index位置元素
     * @param index
     * @return 被删除元素的值
     */
    public int remove(int index) {
        rangeCheck(index);
        int del = elements[index];

        for (int i = index + 1; i < size - 1; i++) {
            elements[i - 1] = elements[i];
        }
        size--;

        return del;
    }

    /**
     * 查看元素的索引
     * @param element
     * @return 元素的索引，找不到返回 -1
     */
    public int indexOf(int element) {
        for (int i = 0; i < size; i++) {
            if (elements[i] == element) return i;
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
