public class App {
    public static void main(String[] args) throws Exception {

        // java.util.ArrayList

        ArrayList<Integer> list = new ArrayList<>();

        list.add(11);
        list.add(22);
        list.add(33);
        list.add(null);
        list.add(44);
        list.add(null);
        list.add(66);
        list.add(66);

        System.out.println(list.indexOf(null));

        System.out.println(list.toString());

        
        ArrayList<Person> list2 = new ArrayList<>();

        list2.add(new Person(18, "Jerry"));
        list2.add(new Person(55, "Tom"));
        list2.clear();

        System.gc();

        System.out.println(list2.toString());
    }
}
