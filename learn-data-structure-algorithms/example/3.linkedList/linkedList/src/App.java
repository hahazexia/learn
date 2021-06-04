public class App {
    public static void main(String[] args) throws Exception {
        List<Integer> list = new LinkedList<>();

        list.add(10);
        list.add(20);
        
        list.add(30);
        list.add(1, 40);
        
        list.remove(2);
        System.out.println(list);
    }
}
