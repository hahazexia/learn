public class App {
    public static void main(String[] args) throws Exception {
        List<Integer> list = new LinkedList<>();

        list.add(10);
        System.out.println(list);
        list.add(20);
        System.out.println(list);
        list.add(30);
        
        list.remove(2);
        System.out.println(list);
    }
}
