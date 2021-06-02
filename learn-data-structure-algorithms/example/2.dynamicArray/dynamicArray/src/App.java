public class App {
    public static void main(String[] args) throws Exception {
        ArrayList list = new ArrayList();

        list.add(11);
        list.add(22);
        list.add(33);
        list.add(44);
        list.add(55);
        list.add(66);

        System.out.println(list.toString());
        list.remove(2);

        System.out.println(list.toString());

    }
}
