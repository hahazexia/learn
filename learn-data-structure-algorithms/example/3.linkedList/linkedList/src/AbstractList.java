public abstract class AbstractList<E> implements List<E> {
    
    protected int size;

    protected void outOfBound(int index) {
        throw new IndexOutOfBoundsException("index" + index + ", size: " + size);
    }

    protected void rangeCheck(int index) {
        if (index < 0 || index >= size) {
            outOfBound(index);
        }
    }

    protected void rangeCheckForAdd(int index) {
        if (index < 0 || index > size) {
            outOfBound(index);
        }
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
    public boolean contains(E element) {
        return indexOf(element) != ELEMENT_NOT_FOUND;
    }

    /**
     * 添加元素到尾部
     * @param element
     */
    public void add(E element) {
        add(size, element);
    }
}
